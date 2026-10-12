#!/usr/bin/env bash
# Grava chaves e senhas no .env da BMH sem mostrar na tela e sem passar pelo chat do Claude.
#
# Uso, no TERMINAL do VS Code (menu Terminal > Novo Terminal), nunca no chat:
#   bash scripts/guardar-chave.sh WP_URL WP_USUARIO WP_SENHA_APP
#
# Para cada nome, pede o valor (o que você cola não aparece), troca a linha se ela já existir
# no .env e mostra só quantos caracteres foram gravados. Os espaços DO MEIO são mantidos
# (a senha de aplicativo do WordPress tem espaços e eles fazem parte dela).
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Não achei o arquivo .env na pasta do projeto."; exit 1; }
[ "$#" -gt 0 ] || { echo "Diga o nome. Ex.: bash scripts/guardar-chave.sh WP_SENHA_APP"; exit 1; }

for nome in "$@"; do
  case "$nome" in *[!A-Z0-9_]*) echo "  nome inválido: $nome (use só LETRAS_MAIUSCULAS e _)"; continue;; esac
  printf "Cole o valor de %s e aperte Enter (não aparece na tela): " "$nome"
  IFS= read -rs valor
  echo
  # tira quebra de linha e espaço só das pontas
  valor="$(printf '%s' "$valor" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  if [ -z "$valor" ]; then echo "  vazio: pulei $nome"; continue; fi
  tmp="$(mktemp .env.XXXXXX)"
  grep -v "^${nome}=" .env > "$tmp" || true
  # aspas simples protegem os espaços da senha do WordPress
  printf "%s='%s'\n" "$nome" "$(printf '%s' "$valor" | sed "s/'/'\\\\''/g")" >> "$tmp"
  mv "$tmp" .env
  chmod 600 .env
  echo "  $nome gravado (${#valor} caracteres)."
done
echo "Pronto. Avise o Claude que gravou: ele confere a conexão sem ver a senha."
