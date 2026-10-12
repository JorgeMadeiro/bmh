#!/usr/bin/env python3
"""Procura nos e-mails de honorários já enviados os dados de pagamento dos médicos que faltam na aba Pagamento.
09/10/2026: pedido do Jorge ("consegue checar nos outros emails?"). Pede ao Google permissão SÓ DE LEITURA, uma vez; a
autorização fica só na memória enquanto o script roda (não vai para o .env nem para o n8n). Busca e-mails com assunto
"Honorários" e mostra, para cada médico pedido, o bloco "Dados para pgto" de cada e-mail, do mais recente ao mais antigo.
Uso:
  python3 scripts/gmail-buscar-honorarios.py "Gustavo Henrique" "Francis" "Julia" "Gustavo Ferreira Cury" "Guilherme"
"""
import base64
import http.server
import importlib.util
import pathlib
import re
import secrets
import subprocess
import sys
import urllib.parse

RAIZ = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('gmail_autorizar', RAIZ / 'gmail-autorizar.py')
G = importlib.util.module_from_spec(spec)
spec.loader.exec_module(G)
ESCOPO = 'https://www.googleapis.com/auth/gmail.readonly'


def token_leitura(env):
    cli = G.cliente(env)
    redirect = f'http://127.0.0.1:{G.PORTA}/'
    estado = secrets.token_urlsafe(16)
    url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
        'client_id': cli['client_id'], 'redirect_uri': redirect, 'response_type': 'code', 'scope': ESCOPO,
        'state': estado, 'login_hint': 'jorgemadeiro@hiperbaricabrasilia.com.br'})
    recebido = {}

    class Resposta(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            recebido.update({k: v[0] for k, v in q.items()})
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write('<p style="font:18px sans-serif;margin:40px">Pronto. Pode fechar esta aba.</p>'.encode())

        def log_message(self, *a):
            pass

    servidor = http.server.HTTPServer(('127.0.0.1', G.PORTA), Resposta)
    servidor.timeout = 600
    print('Abrindo o navegador. Entre com jorgemadeiro@hiperbaricabrasilia.com.br e permita a leitura (só desta vez).')
    subprocess.run(['open', url], check=False)
    servidor.handle_request()
    if recebido.get('state') != estado or 'code' not in recebido:
        sys.exit(f'Autorização não concluída: {recebido.get("error", "sem resposta")}')
    status, tok = G.pedir('https://oauth2.googleapis.com/token', {
        'code': recebido['code'], 'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
        'redirect_uri': redirect, 'grant_type': 'authorization_code'})
    if status != 200:
        sys.exit(f'O Google não devolveu a autorização (HTTP {status}): {tok.get("error_description") or tok.get("error")}')
    return tok['access_token']


def texto(payload):
    if payload.get('mimeType') == 'text/plain' and payload.get('body', {}).get('data'):
        return base64.urlsafe_b64decode(payload['body']['data'] + '==').decode('utf-8', 'replace')
    for p in payload.get('parts', []) or []:
        t = texto(p)
        if t:
            return t
    return ''


def sem_acento(s):
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


if __name__ == '__main__':
    nomes = sys.argv[1:]
    if not nomes:
        sys.exit('Diga os nomes a procurar.')
    env = G.ler_env()
    H = {'Authorization': 'Bearer ' + token_leitura(env)}
    base = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'
    st, r = G.pedir(base + '?' + urllib.parse.urlencode({'q': 'subject:honorarios', 'maxResults': 100}), cabecalhos=H)
    if st != 200:
        sys.exit(f'O Gmail recusou (HTTP {st}): {r.get("error", {}).get("message")}')
    ids = [m['id'] for m in r.get('messages', [])]
    print(f'{len(ids)} e-mail(s) com "honorários" no assunto.')
    achados = {n: [] for n in nomes}
    for i in ids:
        st, m = G.pedir(base + '/' + i + '?format=full', cabecalhos=H)
        if st != 200:
            continue
        cab = {h['name'].lower(): h['value'] for h in m['payload'].get('headers', [])}
        linhas = texto(m['payload']).replace('\r', '').split('\n')
        for n in nomes:
            for k, l in enumerate(linhas):
                if sem_acento(n) in sem_acento(l):
                    bloco = [x.strip() for x in linhas[k:k + 8] if x.strip()]
                    achados[n].append((cab.get('date', ''), cab.get('subject', ''), ' / '.join(bloco[:7])))
    for n, lista in achados.items():
        print('\n== ' + n)
        for d, s, b in lista or [('', '', 'não encontrado')]:
            print(f'  {d[:16]} | {s} | {b}')
