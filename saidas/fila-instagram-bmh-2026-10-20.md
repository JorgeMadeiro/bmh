# BMH · fila do Instagram: script e pedido de rotas (20/10/2026)

Pedido da Central (VPS), a partir do relatório `Central_Claude/relatorios/bmh-meta-2026-10-20.md`. Feito pelo Gerente BMH, na
VPS. Nada foi publicado, nenhuma mídia subiu, o fluxo continua desligado e nenhuma linha entrou na tabela.

## O que ficou pronto

**`scripts/publicar-instagram.js`**, o equivalente ao da Pessoal, para rodar na VPS sem `.env` (tudo pelo cofre):

| Comando | O que faz | Depende de |
|---|---|---|
| `previa <pasta>` | legenda exatamente como sairia, tipo, tamanho de cada mídia e as travas | nada (não fala com ninguém) |
| `fila` | lista a `BMH_fila_publicacao` | rota `n8n-tabelas` (já existe) |
| `agendar <pasta> --quando "AAAA-MM-DD HH:MM" --publica [--teste]` | sobe as mídias pela `wp-bmh` e põe a linha na fila como `agendado` | rota nova `n8n-fila-bmh` |
| `agendar ... --simular` | igual, mas com status `teste`: o fluxo cria a mídia no Instagram e não publica | rota nova `n8n-fila-bmh` |
| `cancelar <id>` | `agendado` vira `cancelado` e relê a fila para conferir | rota nova `n8n-fila-bmh-status` e o fluxo de muda status |

Método da Pessoal mantido: pasta da peça com `instagram/slide-*.png` (ou uma imagem, ou um vídeo) e `legenda.md`, e a legenda é só o
bloco entre o 1º e o 2º `---`. Pasta da peça na BMH: `marketing/conteudo/bmh-<tipo>-<tema>-<data>/`.

O que muda em relação à Pessoal:

- **`--publica` é obrigatório para agendar.** Só se usa depois de o Jorge dizer "publica" para aquela peça. Sem ele, o script recusa
  e sugere `--simular`.
- **Travas antes de qualquer envio.** Trava dura impede agendar: hashtag, "arraste", contador de página, travessão, tom de spa ou
  estética (relaxe, rejuvenescimento, detox, bem-estar, antes e depois), legenda vazia ou acima de 2.200 caracteres, mais de 10
  imagens, arquivo acima de 15 MB. **Trava do CFM só avisa** (garantia, cura, "100%", "sem risco", "melhor", depoimento, urgência,
  promessa de resultado, preço) e o Jorge decide. Foto com paciente o script não enxerga: fica o lembrete na tela.
- **Confere a rota de inserir antes de subir mídia.** A biblioteca do site é pública; sem a rota, nada sobe e não fica arte solta.
- **Upload em multipart**, porque o cofre só repassa `content-type` e não `content-disposition`.
- **Sem o comando `agora`**: agendar para daqui a alguns minutos dá no mesmo, e não precisa de mais uma rota.

**`scripts/n8n/bmh-instagram-fila-muda-status.json`**: cópia do "JORGE · Instagram · fila · muda status" (`yc3wmeMe8AjTkDOG`)
para a `BMH_fila_publicacao`, com o nome "BMH · Instagram · fila · muda status (homologação)", webhook novo
(`bmh-fila-status-6f470f8c43`, autenticado por cabeçalho), sem credencial (a criar) e desligado. Só troca `agendado` por
`cancelado` ou o contrário; o resto fica como está.

## Como foi conferido

- `previa` numa peça de teste limpa (2 PNG, legenda com cabeçalho e alt-text depois do 2º `---`): legenda certa, alt-text fora,
  "travas: nenhuma", saída 0.
- `previa` numa peça suja de propósito: pegou hashtag, "arraste", "1/7", travessão e "relaxe" (travas) e garantia, "melhor" e
  promessa de resultado (avisos do CFM), saída 2. Um `legenda.md` que começa já com `---` dá legenda vazia (como na Pessoal) e
  cai na trava.
- `fila` pela `n8n-tabelas`: "fila vazia" (a tabela tem 0 linhas).
- `agendar` sem `--publica`, no passado, com a peça suja e com a peça limpa sem a rota: todos recusaram. No último, a lista de
  rotas do cofre (`/saude`) foi lida antes e não tem `n8n-fila-bmh`, então nada subiu.
- `cancelar`: recusou por falta da rota.
- As peças de teste ficaram no scratchpad da sessão, fora do repositório.
- **Não testado** (de propósito, pela ordem de não subir mídia): o upload pelo cofre e a inserção da linha.

## Pedido de rotas (para a Central levar ao Jorge)

### 1. `n8n-fila-bmh`: inserir linha na fila da BMH

```json
"n8n-fila-bmh": {
  "_o_que": "Fila do Instagram da BMH: só inserir linha na BMH_fila_publicacao (RaABWuNztVAap9AV). Quem publica é o fluxo r6Rib8PXJ0zlSo4z, ligado só com o ok do Jorge, e o script só agenda com o 'publica' dele. Usado por BMH_Claude_VSL/scripts/publicar-instagram.js agendar",
  "base": "http://n8n_n8n_editor:5678",
  "segredo": "central_n8n_api_key",
  "cabecalho": "X-N8N-API-KEY",
  "formato": "{}",
  "metodos": ["POST"],
  "max_corpo_mb": 1,
  "caminhos": ["^/api/v1/data-tables/RaABWuNztVAap9AV/rows$"]
}
```

O `$` no fim fecha `rows/update`, `rows/upsert` e `rows/delete`. Não precisa de segredo novo (é o mesmo da `n8n-pendencias`).

**Recomendado (mexe no `server.js`, por isso fica como sugestão):** uma guarda de corpo nessa rota, como a `guarda_n8n`: uma linha
por pedido, `status` só `agendado` ou `teste`, `tipo` só `imagem`, `carrossel` ou `reel`, e todo endereço em `midias` começando
por `https://hiperbaricabrasilia.com.br/wp-content/uploads/`. Motivo: o cofre não sabe quem chama, e qualquer sessão da VPS que
alcance a rota poderia pôr na fila um post com mídia de fora.

### 2. `n8n-fila-bmh-status`: cancelar ou reativar

```json
"n8n-fila-bmh-status": {
  "_o_que": "Fila do Instagram da BMH: cancelar ou reativar um item pelo fluxo 'BMH · Instagram · fila · muda status', que só troca agendado por cancelado e o contrário. Usado por publicar-instagram.js cancelar",
  "base": "http://n8n_n8n_webhook:5678",
  "segredo": "bmh_fila_chave",
  "cabecalho": "X-Chave-Fila",
  "formato": "{}",
  "metodos": ["POST"],
  "caminhos": ["^/webhook/bmh-fila-status-6f470f8c43$"]
}
```

Passos para essa rota funcionar (fora do alcance do Gerente BMH):

1. Criar no n8n a credencial de cabeçalho "BMH · chave da fila (cofre)", nome `X-Chave-Fila`, valor aleatório novo (não reaproveitar
   a chave da Pessoal). Criar credencial não passa pela `n8n-escrita`: é pelo editor ou pelo Mac.
2. Pôr o mesmo valor no docker secret `bmh_fila_chave` do cofre.
3. Criar o fluxo a partir de `scripts/n8n/bmh-instagram-fila-muda-status.json` (pela `n8n-escrita`, que aceita o nome com
   "(homologação)" e desligado), ligar a credencial no nó "Pedido da VPS", pôr a tag BMH e ligar. Tirar "(homologação)" do nome
   o cofre não deixa; se o Jorge quiser o nome final, é pelo editor ou pelo Mac.

## Próximos passos, na ordem

1. Jorge aprova as duas rotas; Central cria (e decide sobre a guarda de corpo).
2. Simulação de ponta a ponta com uma peça de verdade da BMH, já com "ok" do Jorge para **subir a mídia** (fica pública no site):
   `agendar <pasta> --quando "<daqui a 10 min>" --simular`. Depois, com a fila só com itens `teste`, o fluxo
   `r6Rib8PXJ0zlSo4z` precisa rodar uma vez pelo "Rodar agora" com `?simular=1` (o fluxo está desligado e não é de homologação,
   então isso é pelo editor ou pelo Mac) e o status tem de virar `simulado`.
3. Ligar o fluxo só com o ok do Jorge. A nota do próprio fluxo recomenda ligar depois de 4 semanas de constância à mão.
4. Atualizar a `aprovar-post` (seção BMH ainda diz que não existe script) e a linha "Instagram (a estruturar)" do `CLAUDE.md` da
   BMH: proposta para a Central, não feito aqui.

## Problemas

- não feito: upload pela `wp-bmh` e inserção da linha nunca rodaram (ordem de não subir mídia); o primeiro uso de verdade é o teste.
- não feito: as rotas `n8n-fila-bmh` e `n8n-fila-bmh-status`, a credencial e o fluxo de muda status (dependem do Jorge e da Central).
- risco: reel pela VPS quase nunca vai dar: vídeo não entra no git (não chega à VPS) e o cofre limita a 15 MB por arquivo. Reel
  continua pelo Mac.
- risco: sem a guarda de corpo, a rota de inserir aceita qualquer linha de qualquer sessão da VPS.
- risco: as travas são por palavra; podem deixar passar tom de spa escrito de outro jeito ou marcar à toa (ex.: "bem-estar" num
  contexto clínico). A revisão humana da peça continua.
- desconhecido: se o WordPress da BMH aceita o upload em multipart pelo cofre (deveria: é o formato padrão da API de mídia).
