#!/usr/bin/env python3
"""Busca no PubMed pela API oficial (E-utilities do NCBI), sem chave, e lista o que achou.

Uso:
  python3 scripts/pubmed.py "obesity[mh] AND systematic review[pt] AND 2020:2026[dp]"
  python3 scripts/pubmed.py "resistance training[mh] AND older adults" --n 15
  python3 scripts/pubmed.py --pmid 12345678            # detalhes de um artigo

Sintaxe útil: [mh] termo MeSH · [tiab] título/resumo · [pt] tipo (systematic review,
meta-analysis, randomized controlled trial, guideline) · [dp] data · [au] autor.
Limite do NCBI sem chave: 3 chamadas por segundo. O script espera entre elas.
Adaptado da ideia de pubmed-database e citation-management (catálogo Kursku), reescrito.
"""
import json
import sys
import time
import urllib.parse
import urllib.request

BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
UA = "BMHClaude/1.0 (uso interno; busca de evidencia clinica)"


def _baixar(url):
    """GET só-leitura. Tenta o Python (com certifi); se o SSL falhar (proxy/antivírus
    com certificado próprio, comum no Mac), usa o curl do sistema, que confia na keychain."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        ctx = None
        try:
            import certifi, ssl
            ctx = ssl.create_default_context(cafile=certifi.where())
        except Exception:
            pass
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            return r.read().decode("utf-8")
    except Exception as e:
        if "SSL" not in str(e) and "CERTIFICATE" not in str(e).upper():
            raise
        import subprocess
        out = subprocess.run(["curl", "-s", "--max-time", "30", "-A", UA, url],
                             capture_output=True, text=True)
        if out.returncode != 0 or not out.stdout:
            raise RuntimeError("não consegui falar com o NCBI nem pelo curl") from e
        return out.stdout


def chamar(endpoint, params):
    url = BASE + endpoint + "?" + urllib.parse.urlencode(params)
    return json.loads(_baixar(url))


def resumo(ids):
    if not ids:
        return {}
    time.sleep(0.4)
    d = chamar("esummary.fcgi", {"db": "pubmed", "id": ",".join(ids), "retmode": "json"})
    return d.get("result", {})


def doi_de(item):
    for a in item.get("articleids", []):
        if a.get("idtype") == "doi":
            return a.get("value")
    return ""


def imprimir(item):
    pmid = item.get("uid", "?")
    ano = (item.get("pubdate") or "")[:4]
    tipos = ", ".join(t for t in item.get("pubtype", []) if t not in ("Journal Article",)) or "artigo"
    autores = item.get("authors", [])
    primeiro = autores[0]["name"] if autores else "?"
    mais = " et al." if len(autores) > 1 else ""
    doi = doi_de(item)
    print(f"PMID {pmid} | {ano} | {tipos}")
    print(f"   {item.get('title','').strip()}")
    print(f"   {primeiro}{mais} · {item.get('source','')}")
    print(f"   https://pubmed.ncbi.nlm.nih.gov/{pmid}/" + (f"  ·  https://doi.org/{doi}" if doi else ""))


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(1)
    n = 10
    if "--n" in args:
        i = args.index("--n"); n = int(args[i + 1]); del args[i:i + 2]
    if "--pmid" in args:
        i = args.index("--pmid"); pmid = args[i + 1]
        r = resumo([pmid]); item = r.get(pmid)
        if not item or "error" in item:
            print("PMID não encontrado."); sys.exit(2)
        imprimir(item); return
    termo = " ".join(args)
    d = chamar("esearch.fcgi", {"db": "pubmed", "term": termo, "retmax": n, "sort": "relevance", "retmode": "json"})
    es = d.get("esearchresult", {})
    total = es.get("count", "0"); ids = es.get("idlist", [])
    print(f"Busca: {termo}\nResultados no PubMed: {total} (mostrando {len(ids)}, por relevância)\n")
    if es.get("querytranslation"):
        print(f"Como o PubMed entendeu: {es['querytranslation']}\n")
    r = resumo(ids)
    for pmid in ids:
        item = r.get(pmid)
        if item:
            imprimir(item); print()
    print("Lembrete: listar não é conferir. Abrir o artigo e checar se o resumo sustenta a frase exata que vai ser escrita.")


if __name__ == "__main__":
    main()
