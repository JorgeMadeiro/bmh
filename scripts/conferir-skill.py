#!/usr/bin/env python3
"""Conferência estática de uma skill externa antes de trazer para o MazyOS.

Só LÊ os arquivos. Nunca executa nada da skill. Marca padrões por categoria e
deixa o julgamento (descreve um ataque × executa um ataque) para quem lê o laudo.

Uso:
  python3 scripts/conferir-skill.py <pasta-da-skill> [--json]
  python3 scripts/conferir-skill.py <pasta1> <pasta2> ...   (várias de uma vez)

Adaptado da ideia de skill-scanner e audit-skills (catálogo Kursku), reescrito.
"""
import json
import os
import re
import sys

EXT_TEXTO = {".md", ".txt", ".py", ".js", ".ts", ".sh", ".bash", ".zsh", ".json",
             ".yaml", ".yml", ".toml", ".ps1", ".bat", ".cmd", ".cjs", ".mjs", ""}

# Categoria -> lista de (rótulo, regex). Case-insensitive.
PADROES = {
    "execucao-remota": [
        ("curl|wget encanado em shell", r"\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z|da)?sh\b"),
        ("iwr/irm encanado em iex (PowerShell)", r"\b(iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\n|]*\|\s*iex\b"),
        ("eval/exec com entrada dinâmica", r"\b(eval|exec)\s*\("),
        ("subprocess com shell=True", r"shell\s*=\s*True"),
    ],
    "segredo-e-credencial": [
        ("lê .env / .ssh / chave privada", r"(\.env\b|\.ssh/|id_rsa|id_ed25519|\.pem\b|\.netrc)"),
        ("cookies/keychain/credenciais do sistema", r"(cookies\.sqlite|[Kk]eychain|Credential Manager|\.aws/credentials|\.docker/config\.json)"),
        ("chave/token com valor colado", r"\b(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})"),
    ],
    "envenenar-configuracao": [
        ("manda mexer em CLAUDE.md / MEMORY.md / settings / hooks", r"(CLAUDE\.md|MEMORY\.md|settings(\.local)?\.json|\.mcp\.json|hooks?\.json|~/\.claude\b|\.claude/settings)"),
        ("auto-aprovação / allowlist", r"(allowed-tools\s*:\s*\*|auto-?approve|dangerously|bypassPermissions|allowlist)"),
    ],
    "ofuscacao": [
        ("base64 / atob / fromCharCode", r"\b(base64|atob|btoa|fromCharCode|b64decode)\b"),
        ("blob hex ou base64 longo", r"(?:[A-Za-z0-9+/]{80,}={0,2}|(?:\\x[0-9a-fA-F]{2}){12,})"),
    ],
    "persistencia": [
        ("cron / launchctl / systemd / schtasks / Run keys", r"\b(crontab|launchctl|systemctl\s+enable|schtasks|reg\s+add|HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run)\b"),
        ("edita shell rc / git hooks", r"(\.bashrc|\.zshrc|\.profile|\.git/hooks|pre-commit\b)"),
    ],
    "privilegio-e-destruicao": [
        ("sudo / chmod 777 / chown / chattr", r"\b(sudo\b|chmod\s+[0-7]*777|chown\b|chattr\s+\+i|icacls|Set-ExecutionPolicy)"),
        ("apaga em massa", r"\brm\s+-rf\s+(/|~|\$HOME|\.\.)"),
        ("mata processo/serviço", r"\b(kill\s+-9|pkill|taskkill\s+/f|Stop-Service|systemctl\s+(stop|disable))\b"),
    ],
    "rede-e-exfiltracao": [
        ("nc / socat / scp / ftp", r"\b(nc\s+-|ncat\b|socat\b|scp\s|sftp\b|\bftp\s)"),
        ("envia dado para fora (POST/upload)", r"(requests\.post|fetch\([^)]*method\s*:\s*['\"]POST|curl\s+-[A-Za-z]*X\s*POST|--data[-@ ]|-F\s+['\"]?\w+=@)"),
    ],
    "injecao-de-prompt": [
        ("'ignore as instruções anteriores'", r"(ignore|disregard|forget)\s+(all\s+|any\s+)?(previous|prior|above|earlier|your)\s+(instructions|rules|guidelines|prompt)"),
        ("troca de papel / jailbreak", r"(you are now|from now on you|act as if you have no|pretend (you|that)|developer mode|DAN\b)"),
        ("esconder do usuário", r"(do not (tell|inform|show|reveal)[^\n]{0,40}(user|human)|secretly|without (the )?user'?s? (knowledge|noticing)|hide this)"),
        ("instrução escondida em comentário/HTML", r"<!--[^>]*(instruction|ignore|system|assistant|must)[^>]*-->"),
    ],
}

URL_RE = re.compile(r"https?://([A-Za-z0-9.-]+)[^\s)\]'\"<>]*")
DOMINIOS_CONHECIDOS = {
    "github.com", "raw.githubusercontent.com", "pypi.org", "npmjs.com", "www.npmjs.com",
    "docs.python.org", "developer.mozilla.org", "schema.org", "pubmed.ncbi.nlm.nih.gov",
    "doi.org", "www.ncbi.nlm.nih.gov", "platform.openai.com", "cloud.google.com",
    "developers.facebook.com", "core.telegram.org", "docs.n8n.io", "developers.google.com",
    "search.google.com", "anthropic.com", "docs.anthropic.com", "www.anthropic.com",
    "owasp.org", "cheatsheetseries.owasp.org", "nvd.nist.gov", "cwe.mitre.org",
}


def eh_texto(caminho):
    _, ext = os.path.splitext(caminho)
    return ext.lower() in EXT_TEXTO


def ler(caminho):
    try:
        with open(caminho, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception:
        return ""


def conferir(pasta):
    pasta = os.path.abspath(pasta)
    laudo = {"pasta": pasta, "estrutura": {}, "achados": [], "dominios": {}, "frontmatter": {}}
    if not os.path.isdir(pasta):
        laudo["erro"] = "pasta não existe"
        return laudo

    arquivos = []
    for raiz, _, nomes in os.walk(pasta):
        for n in nomes:
            arquivos.append(os.path.join(raiz, n))
    laudo["estrutura"] = {
        "arquivos": len(arquivos),
        "tem_SKILL.md": os.path.exists(os.path.join(pasta, "SKILL.md")),
        "scripts": sorted(os.path.relpath(a, pasta) for a in arquivos
                          if os.path.splitext(a)[1].lower() in {".py", ".sh", ".bash", ".js", ".ts", ".ps1", ".bat", ".cmd", ".cjs", ".mjs"}),
        "binarios": sorted(os.path.relpath(a, pasta) for a in arquivos if not eh_texto(a)),
    }

    # frontmatter do SKILL.md
    sk = os.path.join(pasta, "SKILL.md")
    if os.path.exists(sk):
        txt = ler(sk)
        m = re.match(r"^---\s*\n(.*?)\n---", txt, re.S)
        if m:
            fm = m.group(1)
            for campo in ("name", "description", "allowed-tools", "model"):
                mm = re.search(rf"^{campo}\s*:\s*(.+)$", fm, re.M)
                if mm:
                    laudo["frontmatter"][campo] = mm.group(1).strip()[:200]
            laudo["frontmatter"]["name_bate_com_pasta"] = (
                laudo["frontmatter"].get("name", "").strip('"\' ') == os.path.basename(pasta))

    for a in arquivos:
        if not eh_texto(a):
            continue
        rel = os.path.relpath(a, pasta)
        txt = ler(a)
        for i, linha in enumerate(txt.splitlines(), 1):
            for cat, lista in PADROES.items():
                for rotulo, rx in lista:
                    if re.search(rx, linha, re.I):
                        laudo["achados"].append({
                            "categoria": cat, "padrao": rotulo,
                            "onde": f"{rel}:{i}", "trecho": linha.strip()[:160]})
            for m in URL_RE.finditer(linha):
                d = m.group(1).lower()
                laudo["dominios"].setdefault(d, 0)
                laudo["dominios"][d] += 1

    laudo["dominios_desconhecidos"] = sorted(d for d in laudo["dominios"] if d not in DOMINIOS_CONHECIDOS)
    return laudo


def imprimir(laudo):
    print(f"\n==== {laudo['pasta']}")
    if "erro" in laudo:
        print("  ERRO:", laudo["erro"]); return
    e = laudo["estrutura"]
    print(f"  arquivos: {e['arquivos']} | SKILL.md: {'sim' if e['tem_SKILL.md'] else 'NÃO'} | "
          f"scripts: {len(e['scripts'])} | binários: {len(e['binarios'])}")
    if e["scripts"]:
        print("  scripts (LER CADA UM INTEIRO):", ", ".join(e["scripts"]))
    if e["binarios"]:
        print("  binários (desconfiar):", ", ".join(e["binarios"]))
    fm = laudo["frontmatter"]
    if fm:
        print(f"  frontmatter: name={fm.get('name','?')} | bate com a pasta: {fm.get('name_bate_com_pasta')} | "
              f"allowed-tools={fm.get('allowed-tools','(não declara)')} | model={fm.get('model','(não força)')}")
    por_cat = {}
    for a in laudo["achados"]:
        por_cat.setdefault(a["categoria"], []).append(a)
    if not por_cat:
        print("  achados mecânicos: nenhum")
    for cat, lst in por_cat.items():
        print(f"  [{cat}] {len(lst)} ocorrência(s)")
        for a in lst[:6]:
            print(f"     - {a['padrao']}  @ {a['onde']}\n       {a['trecho']}")
        if len(lst) > 6:
            print(f"     … e mais {len(lst)-6}")
    if laudo["dominios_desconhecidos"]:
        print("  domínios fora da lista conhecida:", ", ".join(laudo["dominios_desconhecidos"]))
    print("  >>> Julgamento humano/IA ainda é obrigatório: cada achado é 'descreve' ou 'executa'?")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    como_json = "--json" in sys.argv
    if not args:
        print(__doc__); sys.exit(1)
    laudos = [conferir(p) for p in args]
    if como_json:
        print(json.dumps(laudos, ensure_ascii=False, indent=1))
    else:
        for l in laudos:
            imprimir(l)
