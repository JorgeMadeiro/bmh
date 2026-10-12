# MazyOS — Sistema operacional do negócio

Sua empresa roda em cima desse arquivo. Aqui ficam as regras de operação
do MazyOS — como o Claude lê o contexto, aprende com correções, mantém
tudo atualizado e cria skills novas conforme a operação evolui.

Esse arquivo é editável. Quando o `/instalar` rodar, ele complementa o
final dessa página com as regras específicas do seu negócio.

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem
e estiverem preenchidos):

1. `_memoria/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Ao
sugerir prioridades, formatos ou abordagens, considerar o foco atual
descrito em `estrategia.md`.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar
`identidade/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas
usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe skill relevante
em `~/.claude/skills/` (desde 11/10/2026 todas as skills são globais, iguais nas 4 pastas). Se encontrar, seguir as instruções da skill. Se
não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o
usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o
padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma
instrução que parece permanente (frases como "na verdade é assim", "não
faça mais isso", "prefiro assim", "sempre que...", "evita...", "da
próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** (clientes, serviços, mercado) → `_memoria/empresa.md`
- **Sobre preferências e estilo** (tom de voz, formato, o que evitar) → `_memoria/preferencias.md`
- **Sobre prioridades e foco** (projetos, metas, prazos) → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → próprio `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro.
Confirmar mostrando a linha adicionada.

Não perguntar se a correção for óbvia de contexto imediato (ex: "na
verdade o arquivo se chama X"). Só perguntar quando a informação tiver
valor duradouro.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante (cliente novo, skill
nova, mudança de foco, processo novo, ferramenta instalada, estrutura
alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize a memória?"

Se sim, identificar o que atualizar:

- **Cliente, serviço, ferramenta, equipe** → `_memoria/empresa.md`
- **Mudança de prioridade ou foco** → `_memoria/estrategia.md`
- **Tom ou estilo** → `_memoria/preferencias.md`
- **Pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Visual (cores, fontes, logo)** → `identidade/design-guide.md`

Mostrar o que vai mudar antes de salvar. Não reformatar o arquivo
inteiro, só adicionar ou editar a linha relevante.

**Quando NÃO perguntar:**
- Tarefas pontuais sem impacto no contexto (escrever um email avulso, criar um post)
- Perguntas simples ou conversas sem ação
- Mudanças já salvas pelo bloco "Aprender com correções"

**Dica:** rode `/atualizar` pra uma varredura completa quando houver dúvida.

---

## Criação de skills

Quando o usuário pedir skill nova:

1. Verificar se existe template relevante em `templates/skills/`. Se
   existir, usar como base e adaptar pro contexto
2. Perguntar se é específica desse projeto ou útil em qualquer:
   - Específica → também em `~/.claude/skills/` (decisão de 11/10/2026: todas as skills são compartilhadas entre as pastas), com o que é deste negócio numa seção "Por pasta"
   - Universal → `~/.claude/skills/nome-da-skill/SKILL.md` (global)
3. Ler `_memoria/empresa.md` e `_memoria/preferencias.md` pra calibrar
   o conteúdo da skill ao contexto do negócio
4. Se a skill precisar de arquivos de apoio (templates, exemplos),
   criar dentro da pasta da skill
5. Seguir o fluxo da skill-creator nativa do Claude Code

---

# BMH — workspace da Brasília Medicina Hiperbárica

## O que é esse workspace

Operação de conteúdo e marketing da **BMH — Brasília Medicina Hiperbárica**, onde o
Dr. Jorge Madeiro é diretor médico. Duas unidades: Asa Sul e Taguatinga.

**Este workspace é só da BMH.** Os outros dois:
- `Jorge_Claude_VsCode` — marca pessoal Dr. Jorge Madeiro
- `Nexo_Claude_VSL` — Centro Médico Nexo

Nunca reaproveitar texto de um perfil no outro. Se o pedido for claramente de outra
marca, avisar o Jorge que ele está na pasta errada antes de produzir.

**Estrutura de pastas:**
- `_memoria/` — a clínica, pacientes, foco atual
- `identidade/` — logo e (a definir) paleta da BMH
- `identidade/fotos/` — fotos da clínica por unidade (taguatinga, asa-sul, equipe, ensaio-2025); o `README.md` diz o que é cada uma e quais têm pessoa na câmara (só com autorização por escrito)
- `marketing/` — conteúdo, SEO, campanhas (saída das skills)
- `saidas/` — análises, emails, documentos pontuais
- `dados/` — arquivos a analisar (CSV, PDF, planilha)
- `scripts/` — utilitários (gerar imagem, postar, render)
- `templates/` — moldes de skills e perfis

## Contexto da operação

Marketing **do zero** — é o ponto de partida deste workspace. ~90% dos pacientes vêm de
pós-operatório de cirurgia plástica, então o cirurgião que indica é público tão
importante quanto o paciente.

## Voz do perfil

A BMH fala como **serviço clínico especializado**: mecanismo do tratamento, indicação,
segurança, evidência. Sem tom de estética milagrosa, sem promessa de resultado.

## Regra clínica

Todo conteúdo de saúde precisa de respaldo em evidência científica. **Quando houver
dúvida sobre um dado clínico, perguntar ao Jorge antes de escrever** — ele é a fonte
de verdade médica deste workspace (formação hiperbárica pela Santa Casa e pelo UHMS
PATH/EUA). Não inventar número, estudo ou percentual.

## Regras do sistema

- Conteúdo novo salvar em `marketing/conteudo/bmh-<tipo>-<tema>-<data>/`
- Todo post nasce com intenção declarada: educativo, autoridade, conversão ou prova social
- **Foto com paciente não se publica** (site, Instagram, perfil do Google), mesmo sem rosto, sem autorização por escrito: fica em `dados/fotos-com-paciente-nao-publicar/`, que não vai para o GitHub
- **Site e peças visuais nascem no celular:** desenhar e conferir primeiro em 360 a 390 px (a maior parte dos acessos é pelo celular), com título e botão do WhatsApp na primeira tela; o computador vem depois

## Travas da BMH (12/10/2026)

- **Indicação só da lista aceita (UHMS e CFM).** Nada de indicação fora dela em site, post, anúncio ou material para
  cirurgião; na dúvida, perguntar ao Jorge.
- **Sem tom de spa, estética ou bem-estar** ("relaxe", "rejuvenescimento", "detox", antes e depois): a BMH é serviço
  clínico especializado.
- **Sem preço em anúncio** (Google, Meta ou qualquer outro).
- **Foto com paciente só com autorização por escrito**, conferida antes de cada uso (canal, prazo, não revogada). O local
  do termo fica registrado sem nome em `identidade/fotos/README.md` e no README de `dados/fotos-com-paciente-nao-publicar/`
  (pasta só do Jorge, permissão 700; o Claude não abre as fotos).
- **A senha do painel da diretoria continua na mensagem mensal do grupo**, por decisão do Jorge de 12/10/2026. Não mudar
  sem pedido dele.

## Ferramentas

- [x] Geração de imagem via API OpenAI (`scripts/gerar-imagem.js`)
- [ ] Instagram (a estruturar)
- [ ] Tráfego pago: hoje pela agência Triunfo, como as outras marcas; a saída depende do teste de gestão própria em curso (Jorge, 11/10/2026). **Sem preço nos anúncios** (decisão de 11/10/2026)

## Skills globais, iguais em todas as pastas (11/10/2026)

Ficam em `~/.claude/skills/` e valem do mesmo jeito em Pessoal, Nexo, BMH e Negócios: `seo` (com `llms.txt` e checagem
de frase citável no GEO), `concorrentes-instagram` (posts e reels de concorrentes com nota contra o normal do perfil),
`teste-celular` (site no celular antes de entregar), `clarity` (mapa de calor e gravações), `frontend-design`,
`web-design-guidelines`, `accessibility-scan`, `accessibility-diff`, `reel-editado`, `editar-video` e as de vídeo e n8n.
O que é do negócio (cidade, registro, cores, regras) continua no CLAUDE.md e em `_memoria/` desta pasta. **Lição nova que valer
para todas: escrever na skill global**, não numa cópia local. As cópias antigas estão em
`~/.claude/backup-skills-locais/20261011/`.

Skills globais acrescentadas em 11/10/2026, depois da conferência de segurança: `marca` (posicionamento, nome, voz, marca pessoal,
arquitetura de marcas), `linkedin` (perfil de médico e páginas das empresas; nunca publica sozinha), `grill-me` (entrevista em rodadas
até o plano ficar claro) e `prospeccao` (lista de empresas com contato público, sem serviço pago e sem mandar dado para fora).

## n8n da BMH (atualizado em 12/10/2026)

- Alerta: `BMH · Alerta de falha` (`7u3CuyjESsHmCtMW`), **ativo** (estava desligado e nunca tinha avisado nada), grava em
  `BMH_falhas` e manda no Telegram do Jorge com máscara de dado pessoal. 27 chamadas HTTP em 11 fluxos com nova tentativa.
- Novo: `BMH · WhatsApp · apaga conversas vencidas` (`sm7uaiRPM5G5gAhO`, todo dia 4h37, registro em `BMH_limpeza_registro`).
- Novo e **desligado**: `BMH · Instagram · fila de publicação` (`r6Rib8PXJ0zlSo4z`, tabela `BMH_fila_publicacao`); falta o
  token da Meta da BMH e o id da conta do Instagram.
- Cópias de antes de cada alteração em `dados/n8n-copias/` (fora do git; trazem segredos dos nós).
- "Produção Diaria e Mensal BMH" e "BMH · Diretoria · produção do mês" mandam pela instância **Madeiro** (número pessoal):
  pela regra de 12/10, migrar para o número de automação quando ele existir.
