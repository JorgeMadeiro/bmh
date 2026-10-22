#!/usr/bin/env python3
"""Cartões com QR por cirurgião parceiro (22/10/2026, motor do Kommo da BMH).

Cada QR abre hiperbaricabrasilia.com.br/indicacao/?dr=<nome>, que leva ao WhatsApp da recepção com a frase
"Vim pela indicação do Dr(a). <nome>": o lead entra no Kommo com a origem "cirurgião" e o nome preenchido. O nome vai
só no endereço do QR, nenhuma lista fica pública no site. Saída em marketing/qr-cirurgioes/: um SVG por cartão
(85 x 55 mm, cartão de visita) e uma folha A4 (folha.html, imprimir em 100%) com até 10 cartões.

Uso:  python3 scripts/qr-cirurgiao.py "Ana Souza" "Carlos Lima"
      python3 scripts/qr-cirurgiao.py --lista nomes.txt        (um nome por linha)
Nomes de cirurgião só com o ok de cada um (regra da BMH: nunca citar parceiro sem autorização).
"""
import base64, html, pathlib, re, sys, urllib.parse
import segno

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / 'marketing' / 'qr-cirurgioes'
BASE = 'https://hiperbaricabrasilia.com.br/indicacao/'
LOGO = base64.b64encode((RAIZ / 'site' / 'imagens' / 'bmh-logo.png').read_bytes()).decode()

def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-') or 'cirurgiao'

def cartao(nome):
    url = BASE + '?' + urllib.parse.urlencode({'dr': nome})
    qr = segno.make(url, error='m')
    # o QR como caminhos SVG, encaixado num quadrado de 40 mm
    m = qr.symbol_size(scale=1, border=0)[0]
    caminho = ''.join(f'M{x},{y}h1v1h-1z' for y, linha in enumerate(qr.matrix) for x, v in enumerate(linha) if v)
    e = html.escape
    return url, f'''<svg xmlns="http://www.w3.org/2000/svg" width="85mm" height="55mm" viewBox="0 0 850 550" font-family="Libre Franklin, Helvetica, Arial, sans-serif">
<rect width="850" height="550" rx="24" fill="#ffffff" stroke="#DCE5EE" stroke-width="3"/>
<g transform="translate(48,112) scale({380 / m})"><path d="{caminho}" fill="#00143F"/></g>
<image href="data:image/png;base64,{LOGO}" x="490" y="40" width="200" height="106"/>
<text x="490" y="200" font-size="30" font-weight="700" fill="#002375">Oxigenoterapia</text>
<text x="490" y="236" font-size="30" font-weight="700" fill="#002375">hiperbárica</text>
<text x="490" y="290" font-size="22" fill="#2B3850">Aponte a câmera do celular</text>
<text x="490" y="318" font-size="22" fill="#2B3850">e fale com a recepção</text>
<text x="490" y="346" font-size="22" fill="#2B3850">pelo WhatsApp.</text>
<text x="490" y="410" font-size="19" fill="#4A5568">Asa Sul e Taguatinga</text>
<text x="490" y="436" font-size="19" fill="#4A5568">Todos os dias, das 7h às 19h</text>
<text x="40" y="60" font-size="24" font-weight="700" fill="#34A9CF">Indicação do Dr(a). {e(nome)}</text>
<text x="490" y="500" font-size="18" fill="#4A5568">hiperbaricabrasilia.com.br</text>
</svg>'''

def main():
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(1)
    nomes = [l.strip() for l in pathlib.Path(a[1]).read_text(encoding='utf-8').splitlines() if l.strip()] if a[0] == '--lista' else a
    SAIDA.mkdir(parents=True, exist_ok=True); cartoes = []
    for nome in nomes:
        url, svg = cartao(nome)
        (SAIDA / f'{slug(nome)}.svg').write_text(svg, encoding='utf-8'); cartoes.append(svg)
        print(f'{nome}: {url}')
    folha = '<!doctype html><meta charset="utf-8"><title>Cartões com QR · BMH</title><style>@page{size:A4;margin:10mm}body{margin:0;display:grid;grid-template-columns:repeat(2,85mm);gap:6mm;justify-content:center}svg{break-inside:avoid}</style>' + ''.join(cartoes[:10])
    (SAIDA / 'folha.html').write_text(folha, encoding='utf-8')
    print(f'{len(nomes)} cartão(ões) em {SAIDA.relative_to(RAIZ)}/ (folha.html para imprimir)')

if __name__ == '__main__':
    main()
