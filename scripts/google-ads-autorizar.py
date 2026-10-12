#!/usr/bin/env python3
"""Autoriza o acesso ao Google Ads (uma vez só) e grava a autorização no .env.

Versão da BMH (07/10/2026), adaptada do script da Nexo. Abre o navegador na tela de login do Google. O Jorge
entra com a conta que administra o Google Ads da BMH (506-679-8424) e clica em permitir. A resposta chega aqui
no computador e vira GOOGLE_ADS_REFRESH_TOKEN no .env da BMH, sem aparecer na tela nem no chat. Depois o script
testa a conexão lendo o nome da conta da BMH.

Precisa no .env: GOOGLE_ADS_OAUTH_CLIENTE (caminho do JSON do cliente OAuth, fora da pasta, em
~/.config/bmh/), GOOGLE_ADS_CUSTOMER_ID (5066798424) e, só se o acesso for por conta de administrador,
GOOGLE_ADS_LOGIN_CUSTOMER_ID. Desde 2026 o Google não exige mais o token de
desenvolvedor; se um dia voltar a exigir, basta pôr GOOGLE_ADS_DEVELOPER_TOKEN no .env.

Uso:
  python3 scripts/google-ads-autorizar.py           autoriza e testa
  python3 scripts/google-ads-autorizar.py --testar  só testa, com a autorização já gravada
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
# adwords: ler e gerir o Google Ads · datamanager: mandar conversões offline (agendou, compareceu). Desde 2026 o
# Google só aceita conversão offline de integração nova pela Data Manager API (a antiga responde CUSTOMER_NOT_ALLOWLISTED).
# business.manage: Perfil da Empresa no Google (avaliações, postagens, números das duas unidades), no mesmo login.
ESCOPO = 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/datamanager https://www.googleapis.com/auth/business.manage'
PORTA = 8765


def contexto_ssl():
    """O Python do python.org não traz certificados próprios (falhou assim em 24/09/2026).
    Usa o certifi, se estiver instalado, ou a lista de certificados do próprio macOS."""
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
            out[k.strip()] = v.strip().strip('"')
    return out


def gravar_env(chave, valor):
    linhas = [l for l in ENV.read_text(encoding='utf-8').rstrip('\n').split('\n') if not l.startswith(chave + '=')]
    linhas.append(f'{chave}={valor}')
    ENV.write_text('\n'.join(linhas) + '\n', encoding='utf-8')
    ENV.chmod(0o600)


def post(url, dados, cabecalhos=None, corpo_json=False):
    corpo = json.dumps(dados).encode() if corpo_json else urllib.parse.urlencode(dados).encode()
    req = urllib.request.Request(url, data=corpo, headers=cabecalhos or {}, method='POST')
    if corpo_json:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b'{}')
        except Exception:
            return e.code, {}


def cliente(env):
    d = json.load(open(env['GOOGLE_ADS_OAUTH_CLIENTE']))
    return d.get('installed') or d.get('web')


def autorizar(env):
    cli = cliente(env)
    redirect = f'http://127.0.0.1:{PORTA}/'
    estado = secrets.token_urlsafe(16)
    url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
        'client_id': cli['client_id'], 'redirect_uri': redirect, 'response_type': 'code',
        'scope': ESCOPO, 'access_type': 'offline', 'prompt': 'consent', 'state': estado})
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
    print('Abrindo o navegador. Entre com a conta do Google Ads e clique em Permitir.')
    subprocess.run(['open', url], check=False)
    servidor.handle_request()
    if recebido.get('state') != estado or 'code' not in recebido:
        sys.exit(f'Autorização não concluída: {recebido.get("error", "sem resposta")}')
    status, tok = post('https://oauth2.googleapis.com/token', {
        'code': recebido['code'], 'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
        'redirect_uri': redirect, 'grant_type': 'authorization_code'})
    if status != 200 or 'refresh_token' not in tok:
        sys.exit(f'O Google não devolveu a autorização (HTTP {status}): {tok.get("error_description") or tok.get("error")}')
    gravar_env('GOOGLE_ADS_REFRESH_TOKEN', tok['refresh_token'])
    print('Autorização gravada no .env (GOOGLE_ADS_REFRESH_TOKEN).')


def testar(env):
    cli = cliente(env)
    status, tok = post('https://oauth2.googleapis.com/token', {
        'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
        'refresh_token': env['GOOGLE_ADS_REFRESH_TOKEN'], 'grant_type': 'refresh_token'})
    if status != 200:
        sys.exit(f'A autorização gravada não funcionou (HTTP {status}): {tok.get("error_description") or tok.get("error")}')
    cab = {'Authorization': 'Bearer ' + tok['access_token']}
    if env.get('GOOGLE_ADS_LOGIN_CUSTOMER_ID'):
        cab['login-customer-id'] = env['GOOGLE_ADS_LOGIN_CUSTOMER_ID']
    if env.get('GOOGLE_ADS_DEVELOPER_TOKEN'):
        cab['developer-token'] = env['GOOGLE_ADS_DEVELOPER_TOKEN']
    consulta = {'query': 'SELECT customer.id, customer.descriptive_name, customer.currency_code, '
                         'customer.time_zone FROM customer'}
    # A versão da API muda algumas vezes por ano; tenta da mais nova para a mais antiga.
    for v in range(30, 17, -1):
        url = f'https://googleads.googleapis.com/v{v}/customers/{env["GOOGLE_ADS_CUSTOMER_ID"]}/googleAds:search'
        status, r = post(url, consulta, cab, corpo_json=True)
        if status == 404:
            continue
        if status == 200:
            c = (r.get('results') or [{}])[0].get('customer', {})
            print(f'Conexão com o Google Ads funcionando (API v{v}).')
            print(f'  conta: {c.get("descriptiveName")} · {c.get("id")} · {c.get("currencyCode")} · {c.get("timeZone")}')
            return v
        erro = r.get('error', {})
        detalhes = json.dumps(erro.get('details', ''), ensure_ascii=False)[:600]
        sys.exit(f'O Google Ads recusou (API v{v}, HTTP {status}): {erro.get("message")}\n{detalhes}')
    sys.exit('Nenhuma versão da API respondeu.')


if __name__ == '__main__':
    env = ler_env()
    if '--testar' not in sys.argv:
        autorizar(env)
        env = ler_env()
    testar(env)
