#!/usr/bin/env python3
"""Procura chave/token/senha fora do lugar (fora do .env) no workspace da BMH.

Só lê. Nunca imprime o valor inteiro: mostra arquivo:linha, o tipo e o valor mascarado.

Uso:
  python3 scripts/procurar-segredos.py            # varre a pasta atual, pula o .env
  python3 scripts/procurar-segredos.py --tudo     # inclui o .env (só para contar, mascarado)
  python3 scripts/procurar-segredos.py <pasta>    # outra pasta

Sai com código 1 se achar algo fora do .env (serve para automatizar a conferência).
Adaptado da ideia do cred-omega (catálogo Kursku), reescrito.
"""
import os
import re
import sys

PULAR_PASTAS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".next", "dist", "build"}
EXT_PULAR = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf", ".zip", ".gz", ".tar",
             ".mp4", ".mov", ".mp3", ".woff", ".woff2", ".ttf", ".ico", ".xlsx", ".docx", ".pptx"}
TAMANHO_MAX = 2 * 1024 * 1024

# (tipo, regex, gravidade)
PADROES = [
    ("chave OpenAI", r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}", "alta"),
    ("chave Google (API key)", r"\bAIza[0-9A-Za-z_-]{35}\b", "alta"),
    ("token Meta (EAA…)", r"\bEAA[A-Za-z0-9]{30,}\b", "alta"),
    ("token de bot do Telegram", r"\b\d{8,10}:[A-Za-z0-9_-]{35}\b", "alta"),
    ("JWT / token longo", r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", "alta"),
    ("chave AWS", r"\bAKIA[0-9A-Z]{16}\b", "alta"),
    ("token GitHub", r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}", "alta"),
    ("chave Stripe", r"\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b", "alta"),
    ("token Slack", r"\bxox[bpras]-[A-Za-z0-9-]{10,}\b", "média"),
    ("chave privada (bloco PEM)", "-----BEGIN " + r"(?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----", "alta"),
    ("conta de serviço do Google (JSON)", r'"type"\s*:\s*"service_account"|"private_key_id"\s*:', "alta"),
    ("senha dentro de URL", r"[a-z][a-z0-9+.-]*://[^/\s:@]+:[^@\s/]{4,}@", "alta"),
    ("possível segredo em atribuição", r"(?i)\b(?:api[_-]?key|apikey|secret|token|senha|password|passwd|bearer)\b\s*[=:]\s*['\"]?[A-Za-z0-9_\-./+]{16,}", "média"),
]
COMPILADOS = [(t, re.compile(rx), g) for t, rx, g in PADROES]

# Linhas que são claramente exemplo/placeholder, não segredo real
PLACEHOLDER = re.compile(r"(?i)(SEU_|SUA_|xxxx|\.\.\.|exemplo|example|placeholder|<[^>]+>|\$\{?[A-Z_]{3,}\}?|process\.env|os\.environ|\$env|getenv)")


def mascarar(valor):
    v = valor.strip("'\" ")
    if len(v) <= 8:
        return "****"
    return f"{v[:4]}…{v[-2:]} ({len(v)} caracteres)"


def eh_texto(caminho):
    ext = os.path.splitext(caminho)[1].lower()
    if ext in EXT_PULAR:
        return False
    try:
        if os.path.getsize(caminho) > TAMANHO_MAX:
            return False
        with open(caminho, "rb") as f:
            chunk = f.read(4096)
        return b"\x00" not in chunk
    except Exception:
        return False


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    incluir_env = "--tudo" in sys.argv
    raiz = os.path.abspath(args[0] if args else ".")
    proprio = os.path.abspath(__file__)

    achados = []       # fora do .env
    no_env = 0         # contagem dentro do .env (se --tudo)
    alertas = []       # cópias de .env, JSON de conta de serviço

    for pasta, subpastas, arquivos in os.walk(raiz):
        subpastas[:] = [d for d in subpastas if d not in PULAR_PASTAS]
        for nome in arquivos:
            caminho = os.path.join(pasta, nome)
            rel = os.path.relpath(caminho, raiz)
            if caminho == proprio:
                continue
            # cópias e variações do .env são alerta por si só
            if nome.startswith(".env") and nome != ".env":
                alertas.append(f"cópia/variação do .env: {rel}  (apagar ou tirar da pasta)")
            if nome == ".env" and not incluir_env:
                continue
            if not eh_texto(caminho):
                continue
            try:
                with open(caminho, "r", encoding="utf-8", errors="replace") as f:
                    for n, linha in enumerate(f, 1):
                        for tipo, rx, grav in COMPILADOS:
                            m = rx.search(linha)
                            if not m:
                                continue
                            if grav == "média" and PLACEHOLDER.search(linha):
                                continue  # exemplo, não segredo
                            if nome == ".env":
                                no_env += 1
                                continue
                            achados.append((grav, rel, n, tipo, mascarar(m.group(0))))
                            if tipo.startswith("conta de serviço"):
                                alertas.append(f"JSON de conta de serviço do Google solto na pasta: {rel}  (mover para fora da pasta sincronizada)")
                            break
            except Exception:
                continue

    print(f"Varredura: {raiz}")
    print(f"Pastas puladas: {', '.join(sorted(PULAR_PASTAS))} | .env {'incluído (só contagem)' if incluir_env else 'pulado (é o lugar certo dele)'}")
    print()
    if alertas:
        print("ALERTAS DE ARQUIVO")
        for a in sorted(set(alertas)):
            print("  !", a)
        print()
    if achados:
        achados.sort(key=lambda x: (x[0] != "alta", x[1], x[2]))
        print(f"SEGREDO FORA DO LUGAR: {len(achados)} achado(s)  (alta = formato de chave real; média = parece, conferir)")
        for grav, rel, n, tipo, masc in achados:
            print(f"  [{grav:5s}] {rel}:{n}  {tipo}  →  {masc}")
    else:
        print("Nenhum segredo fora do .env. ")
    if incluir_env:
        print(f"\nDentro do .env: {no_env} linha(s) com formato de segredo (esperado; é o lugar dele).")
    print("\nLembrete: isto só lê. Achou algo? Não cole o valor no chat: trocar a chave e apagar o arquivo (roteiro em .claude/skills/seguranca-credenciais/incidentes.md).")
    sys.exit(1 if achados or alertas else 0)


if __name__ == "__main__":
    main()
