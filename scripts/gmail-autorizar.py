#!/usr/bin/env python3
"""Autoriza o Gmail do Jorge a receber RASCUNHOS criados pela BMH (uma vez só) e grava a autorização no .env.
09/10/2026: e-mails mensais de honorários dos médicos e de produção das unidades nascem como rascunho; o Jorge revisa
e envia. Escopo só "gmail.compose" (criar rascunho): não lê a caixa de entrada.
Abre o navegador na tela de login do Google. O Jorge entra com jorgemadeiro@hiperbaricabrasilia.com.br (a conta da BMH, de onde os e-mails saem) e clica em permitir.
A resposta chega aqui no computador e vira GMAIL_REFRESH_TOKEN no .env, sem aparecer na tela nem no chat. Usa o mesmo
cliente OAuth do Google Ads (app "BMH Integrações", projeto bmh-integracoes), que precisa da API do Gmail ativada.
Uso:
  python3 scripts/gmail-autorizar.py           autoriza e testa
  python3 scripts/gmail-autorizar.py --testar  só testa, com a autorização já gravada
"""
import http.server
import json
import pathlib
import secrets
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ENV = RAIZ / '.env'
ESCOPO = 'https://www.googleapis.com/auth/gmail.compose'
PORTA = 8766


def contexto_ssl():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context(cafile='/etc/ssl/cert.pem')


SSL = contexto_ssl()


def ler_env():
    out = {}
    for linha in ENV.read_text(encoding='utf-8').splitlines():
        if '=' in linha and not linha.lstrip().startswith('#'):
            k, v = linha.split('=', 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def gravar_env(chave, valor):
    linhas = [l for l in ENV.read_text(encoding='utf-8').rstrip('\n').split('\n') if not l.startswith(chave + '=')]
    linhas.append(f'{chave}={valor}')
    ENV.write_text('\n'.join(linhas) + '\n', encoding='utf-8')
    ENV.chmod(0o600)


def pedir(url, dados=None, cabecalhos=None, metodo=None):
    corpo = urllib.parse.urlencode(dados).encode() if dados is not None else None
    req = urllib.request.Request(url, data=corpo, headers=cabecalhos or {}, method=metodo or ('POST' if corpo else 'GET'))
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b'{}')
        except Exception:
            return e.code, {}


def cliente(env):
    caminho = env['GOOGLE_ADS_OAUTH_CLIENTE'].replace('~', str(pathlib.Path.home()))
    d = json.load(open(caminho))
    return d.get('installed') or d.get('web')


def autorizar(env):
    cli = cliente(env)
    redirect = f'http://127.0.0.1:{PORTA}/'
    estado = secrets.token_urlsafe(16)
    url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
        'client_id': cli['client_id'], 'redirect_uri': redirect, 'response_type': 'code', 'scope': ESCOPO,
        'access_type': 'offline', 'prompt': 'consent', 'state': estado, 'login_hint': 'jorgemadeiro@hiperbaricabrasilia.com.br'})
    recebido = {}

    class Resposta(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            recebido.update({k: v[0] for k, v in q.items()})
            ok = 'code' in q and q.get('state', [''])[0] == estado
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            msg = 'Pronto. Pode fechar esta aba e voltar para o Claude.' if ok else 'Não deu certo. Volte para o Claude.'
            self.wfile.write(f'<p style="font:18px sans-serif;margin:40px">{msg}</p>'.encode())

        def log_message(self, *a):
            pass

    servidor = http.server.HTTPServer(('127.0.0.1', PORTA), Resposta)
    servidor.timeout = 600
    print('Abrindo o navegador. Entre com jorgemadeiro@hiperbaricabrasilia.com.br e clique em Permitir (só criar rascunhos).')
    subprocess.run(['open', url], check=False)
    servidor.handle_request()
    if recebido.get('state') != estado or 'code' not in recebido:
        sys.exit(f'Autorização não concluída: {recebido.get("error", "sem resposta")}')
    status, tok = pedir('https://oauth2.googleapis.com/token', {
        'code': recebido['code'], 'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
        'redirect_uri': redirect, 'grant_type': 'authorization_code'})
    if status != 200 or 'refresh_token' not in tok:
        sys.exit(f'O Google não devolveu a autorização (HTTP {status}): {tok.get("error_description") or tok.get("error")}')
    gravar_env('GMAIL_REFRESH_TOKEN', tok['refresh_token'])
    print('Autorização gravada no .env (GMAIL_REFRESH_TOKEN).')


def testar(env):
    cli = cliente(env)
    status, tok = pedir('https://oauth2.googleapis.com/token', {
        'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
        'refresh_token': env['GMAIL_REFRESH_TOKEN'], 'grant_type': 'refresh_token'})
    if status != 200:
        sys.exit(f'A autorização gravada não funcionou (HTTP {status}): {tok.get("error_description") or tok.get("error")}')
    status, r = pedir('https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=1', cabecalhos={'Authorization': 'Bearer ' + tok['access_token']})
    if status != 200:
        sys.exit(f'O Gmail recusou (HTTP {status}): {r.get("error", {}).get("message")}')
    print('Gmail autorizado para criar rascunhos (nenhum e-mail foi lido nem enviado).')


if __name__ == '__main__':
    env = ler_env()
    if '--testar' not in sys.argv:
        autorizar(env)
        env = ler_env()
    testar(env)
