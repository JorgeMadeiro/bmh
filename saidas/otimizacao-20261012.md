# BMH: varredura de otimização (12/10/2026)

> Feita a partir da janela da marca pessoal (a pasta da BMH não abriu), a partir do bastão
> `20261012-1030-pessoal-para-bmh-otimizacao.md`. **Só leitura:** nada foi alterado no site, no n8n, na Evolution, no
> Google Ads nem nos arquivos da pasta, fora este relatório. Nenhuma foto de `dados/` foi aberta. Sem dado de paciente.
>
> Como foi conferido: `mapa-das-pastas --pasta bmh` (302 arquivos, 2 links quebrados); API do n8n (15 fluxos da tag
> BMH, configuração, últimas execuções e 14 tabelas, só contagem e nome de coluna); API da Evolution (estado da
> instância "BMH Recepção" e webhook, sem enviar nada); leitura do CLAUDE.md, da `_memoria/`, dos README de
> `integracoes/`, do `saidas/site-novo/` e das skills novas de 11 e 12/10.

---

## (a) O que otimizar, em ordem de impacto

1. **A observação do WhatsApp da recepção não está gravando nada.** A instância "BMH Recepção" está **desconectada**
   (estado `close` na Evolution, conferido hoje) e a tabela `BMH_whatsapp_mensagens` tem **0 linhas**. O mês de
   observação que começou em 09/10 (base do futuro SDR da BMH) está perdido até reconectar. O alerta de falha não pega
   isso: sem mensagem chegando, não há execução e não há erro.
2. **Certificado digital e-CNPJ (.pfx) num Drive público** da BMH (pasta `Backup/Primeira IDV`), achado em 08/10 e sem
   registro de ação. É o risco de segurança mais alto da varredura: quem tiver o link baixa o certificado da empresa.
3. **Dois gestores no Google Ads ao mesmo tempo.** `_memoria/estrategia.md` (07/10) diz que a agência sai e o Claude
   assume; o CLAUDE.md (11/10) e a regra global dizem que a Triunfo continua até o fim do teste de gestão própria; a
   agência fez 14 alterações em 07 e 08/10, e a reorganização da conta (08/10) e o guardião rodam por aqui. Sem um dono
   claro, a medição da reorganização (até 05/11) fica contaminada.
4. **Pasta sem git e sem cópia.** A BMH não é repositório (conferido: `not a git repository`). Os 74 scripts, o código
   dos 15 fluxos e o site em `site/paginas/` só existem neste Mac. A frase "não vai para o GitHub" do CLAUDE.md hoje é
   verdade por falta de GitHub, não por regra. O `.gitignore` já tira `dados/*` e `.env`, então dá para ligar sem risco.
5. **Rede de segurança do n8n incompleta.** Todos os 14 fluxos apontam para "BMH · Alerta de falha" (bom), mas: o
   alerta **nunca disparou** (0 execuções desde 08/10, nunca testado); das 50 chamadas de rede (HTTP) só **3 têm nova
   tentativa**, contra a regra da skill `n8n-fluxos`; o fluxo antigo "Produção Diaria e Mensal BMH" não tem nota de
   cabeçalho nem nome no padrão `BMH · ...` e usa **cinco credenciais do iGut** mais a instância **Madeiro** (número do
   Jorge) para mandar aos grupos.
6. **Login do painel da diretoria escrito na mensagem mensal do grupo de WhatsApp** (`integracoes/grupos/README.md`).
   Senha circulando em grupo; trocar por link com acesso individual ou mandar só no privado.
7. **Retenção de 6 meses sem fluxo que apague.** `BMH_whatsapp_mensagens` tem a coluna `apagar_em`, mas não existe o
   fluxo de limpeza (a skill `lgpd` marca "conferir se existe"). Precisa existir antes da primeira data vencer.
8. **Memória e regras desatualizadas** (ver lista abaixo): CLAUDE.md sem as travas que o Jorge usa para a BMH,
   `preferencias.md` com texto da Nexo, `andamento.md` com topo da sessão 1, `plano-site.md` com GA4, endereços e
   letras que mudaram.
9. **Links quebrados e caminhos antigos:** `utms.md` e `geo-mensal.md` citados e nunca criados; três arquivos ainda
   apontam para `.claude/skills/...` local, que foi esvaziado em 11/10 (hoje é `~/.claude/skills/...`).
10. **Scripts duplicados:** `scripts/conferir-skill.py`, `procurar-segredos.py` e `pubmed.py` são cópias de 06/10 das
    globais (que mudaram em 11/10). Usar as globais e aposentar as locais.

### Desatualizado, item a item

| Onde | O que está velho | Correção sugerida |
|---|---|---|
| `CLAUDE.md` | Não diz "indicação só da lista aceita UHMS/CFM", "sem tom de spa", "sem preço em anúncio" fora da linha de ferramentas; não cita `integracoes/`, painel, n8n, Evolution, iGut | Bloco "Travas da BMH" e bloco "n8n e integrações" no estilo da marca pessoal |
| `CLAUDE.md` | Pasta de conteúdo `bmh-<tipo>-<tema>-<data>` (data atrás) | Decidir se segue o padrão da Pessoal (`AAAAMMDD-<tipo>-<tema>`) |
| `CLAUDE.md` | Falta a regra "registrar fato de baixo risco direto" e "só dizer pronto com prova" que a Pessoal tem | Copiar a regra, adaptada |
| `_memoria/estrategia.md` | "A agência sai e o Claude assume" (07/10) contra "Triunfo até o fim do teste" (11/10); "~R$ 37 por contato" de antes da reorganização | Atualizar com a decisão do item 3 das decisões |
| `_memoria/preferencias.md` | Tom "pendente de calibração" desde 09/09; fala de emagrecimento e medicação (é da Nexo) | Reescrever para a BMH (mecanismo, indicação, segurança, cirurgião como público) |
| `_memoria/empresa.md` | Sem Clarity, GTM, painel, guardião, Evolution, plantões | Uma linha por ferramenta |
| `saidas/site-novo/andamento.md` | "Onde estamos" e "Falta" ainda são da sessão 1 ("nada foi criado") | Reescrever o topo com o estado de 09/10 em diante |
| `saidas/site-novo/plano-site.md` | GA4 `G-97ZBVMVR1Y` (é o da agência; o da BMH é `G-10HHN3PQP0`), `/unidade-asa-sul` (real: `/hiperbarica-asa-sul/`), letras Archivo/Source | Nota no topo "plano histórico; estado atual no andamento" |
| `identidade/design-guide.md` | Fonte da verdade `home.html` (no ar é `home-v2.html`, página 1352); logo para fundo escuro vazio, apesar de existir `bmh-logo-oficial-branco.png` | Atualizar duas linhas |
| `integracoes/painel/README.md` | "Para ligar no n8n (falta o Jorge)" já feito; "chave própria da BMH" contra "mesma chave das outras empresas" | Apagar a seção velha e deixar a decisão |
| `README.md`, `marketing/README.md`, `scripts/README.md` | Texto do molde MazyOS ("15 skills", "pasta vem vazia", subpastas que não existem) | Trocar por 5 linhas reais |
| `.claude/skills/` | Pasta vazia que sobrou da migração de 11/10 | Apagar a pasta vazia |

### Credenciais e prazos

| Item | Situação | Prazo |
|---|---|---|
| Google OAuth "BMH Integrações" (Ads, Perfil, Gmail) | Publicado em 07/10, então o token não vence em 7 dias; os passo a passos ainda avisam do modo teste | Conferir no console que segue "Em produção" |
| Evolution "BMH Recepção" | **Desconectada** | Reconectar já |
| Meta (Instagram/anúncios da BMH) | Nenhum token; Jorge ia confirmar o usuário do sistema "na semana seguinte" a 07/10 | Pendente |
| Clarity API token | Clarity da BMH (`yv1gceupsa`, conta do Jorge) **já está no ar** pelo Tag Manager desde a versão 7 (09/10); falta só o token de leitura | Quando quiser ler pelo Claude |
| Perfil da Empresa (API) | Caso no Google, resposta esperada de 17 a 22/10 | 22/10 |
| Lembrete do Analytics "Grupo NEXO" | Some em 13/11/2026 | 13/11 |

### Testes e medições com data (nenhum venceu ainda)

- Reorganização do Google Ads: régua às quintas 8h20 (15/10, 22/10, 29/10) e conclusão em **05/11**; plano B
  `desfazer.js` guardado até lá.
- Campanha de concorrentes: até ~05/11, pausa se passar de R$ 60 por contato.
- Guardião de pausa em simulação: rever em **22/10**.
- Linha de base do site (07/10): comparar em ~06/11, ~06/12 e ~05/01/2027.
- Fechamento de plantões e produção do mês: **01/11, 8h** (e-mails ainda saem pelo Telegram, sem Gmail).
- Observação do WhatsApp: deveria ir até ~09/11, **parada** (item 1).

### Rotinas que podem virar POP ou automação

- **POP de recepção** (`procedimento-padrao`): atendimento no WhatsApp, convênio, preparo e chegada (roupa de algodão,
  curativo, cinta e dreno já respondidos pelo Jorge), "não temos plantão de mergulho". Depende da observação voltar.
- **POP de publicação de página** (montar, enviar, redirecionamento, mapa ao Google e ao Bing, teste de tags) e **POP
  de versão do Tag Manager** (rascunho, teste, ok, publicar).
- **Automação:** fluxo que apaga por `apagar_em`; aviso no Telegram quando a instância da Evolution desconectar (checar
  o estado a cada hora); medição mensal das IAs (planilha fixa); Gmail nos e-mails do dia 1.

---

## (b) Decisões pendentes da BMH, com recomendação

**Do bastão**

1. **Medir se as IAs citam a BMH (`geo-citacao`).** Recomendo: sim, linha de base esta semana, com 20 perguntas de
   paciente e de cirurgião (as 10 do plano mais 10 da busca do Search Console), à mão, sem ferramenta paga. O registro
   passa a ser o `geo-mensal.md` que o plano já cita.
2. **Clarity no site.** Recomendo: dar como feito (o projeto da BMH já grava pelo Tag Manager desde 09/10) e decidir
   só duas coisas: pedir à agência para **apagar** o projeto antigo `m9kxjnnvgm` (está pausado, não removido) e gerar
   o `CLARITY_API_TOKEN` quando quiser que o Claude leia os mapas. Conferir o aviso de cookies com a `lgpd`.
3. **Links quebrados (`utms.md` e `geo-mensal.md`).** Recomendo: **criar os dois** (não apagar a citação): o `utms.md`
   com a tabela de links prontos que já está no plano (linhas 260 a 275) e o `geo-mensal.md` como planilha do item 1.
4. **"BMH Recepção" na Evolution ou API oficial.** Recomendo: **manter na Evolution, só observando**, e reconectar
   agora. A oficial só faz sentido quando houver robô respondendo ou lembrete em volume, e exige "coexistência" para a
   equipe não perder o celular (`evolution-whatsapp/referencias/plano-api-oficial.md`). Somar um aviso de desconexão.
5. **Número "Madeiro" carrega os grupos da BMH.** Confirmado na API: o fluxo antigo "Produção Diaria e Mensal BMH" usa
   a credencial da instância Madeiro. Recomendo: registrar no CLAUDE.md da BMH e da Pessoal que **nenhuma automação nova
   entra nesse número** (story no status, disparo, robô), e, a médio prazo, mover o envio aos grupos para um número da
   própria BMH.
6. **LGPD da pasta `dados/fotos-com-paciente-nao-publicar`.** Ver a seção própria abaixo. Recomendo: tirar do projeto.
7. **Fila de publicação do Instagram no n8n.** Recomendo: **ainda não.** A BMH não tem token da Meta nem rotina de
   conteúdo; primeiro o token de usuário do sistema e 4 semanas de constância à mão. Depois, copiar o desenho da fila da
   marca pessoal (`JORGE · Instagram · fila de publicação`) com tag BMH.
8. **POP da recepção e plano de crise.** Recomendo: o **plano de crise primeiro** (`crise-reputacao`: intercorrência
   na câmara é nível 4, com quem fala e o que não se diz) porque não depende de nada; o **POP da recepção** depois de 2
   a 4 semanas de conversas observadas.
9. **Auditoria de segurança da tag BMH (`seguranca-credenciais`, modo orientação).** Recomendo: sim, logo depois de
   resolver os itens 10 a 12 abaixo. Laudo em `saidas/seguranca/20261012-auditoria.md`. Os pontos já vistos: certificado
   no Drive público, senha do painel no grupo, cinco credenciais do iGut, mesma chave do n8n que as outras empresas,
   fluxos com dado de paciente que não guardam nem a execução de erro.

**Novas desta varredura**

10. **Reconectar a "BMH Recepção" e recomeçar a contagem do mês de observação.** Recomendo: sim, hoje ou na próxima
    terça/quinta na clínica (precisa do celular da recepção para ler o QR). Nova data de fim: 30 dias após reconectar.
11. **Certificado e-CNPJ no Drive público.** Recomendo: tirar hoje o acesso público da pasta (ou mover o `.pfx` para
    um lugar só do Jorge e do contador) e perguntar ao contador se vale revogar e emitir outro.
12. **Senha do painel da diretoria no grupo.** Recomendo: trocar a senha e mandar só no privado a cada diretor; na
    mensagem mensal, só o link.
13. **Quem manda no Google Ads até 05/11: Triunfo ou Claude?** Recomendo: **um só**. Como a reorganização e o guardião
    já são daqui, pedir à Triunfo que não mexa na conta de pesquisa até 05/11 (mantendo o acesso, como o Jorge quis) e
    deixar a decisão de saída para depois da conclusão. Atualizar `estrategia.md` com isso.
14. **Guardião em modo real em 22/10.** Recomendo: ligar só a regra de pausa por custo por contato, com o teto de
    outubro (R$ 4.400) e o de novembro (R$ 3.600) escritos no README do painel.
15. **Git da BMH (`salvar`).** Recomendo: repositório **privado**, com `dados/` e `.env` fora (já estão no
    `.gitignore`), e conferir com `procurar-segredos.py` antes do primeiro envio.
16. **Rede do n8n.** Recomendo: testar o alerta de falha uma vez (forçar erro no "Rodar agora" de um fluxo de teste),
    pôr nova tentativa nas chamadas de rede e, nos fluxos que não guardam execução por ter dado de paciente, guardar ao
    menos o erro **sem** os dados (só etapa e mensagem).
17. **Fluxo que apaga as conversas após 6 meses.** Recomendo: criar já (diário, apaga por `apagar_em`), antes de a
    observação voltar a gravar.
18. **Gmail dos rascunhos do dia 1.** Recomendo: ativar até 31/10 (ativar a API, `scripts/gmail-autorizar.py`,
    credencial "BMH · Gmail"), senão o fechamento de 01/11 sai pelo Telegram de novo.
19. **Memória da BMH.** Recomendo: ok para reescrever `preferencias.md` (tirar o que é da Nexo), atualizar
    `estrategia.md` e acrescentar ao CLAUDE.md as travas da BMH; mostrar as linhas antes de gravar (é regra e tom).
20. **Scripts locais duplicados.** Recomendo: apagar `scripts/conferir-skill.py`, `procurar-segredos.py` e `pubmed.py`
    e usar as globais; manter `desfazer.js` até 05/11; mover `versao-4-rascunho.js` e `adaptar-pagina-nexo.py` para uma
    pasta `historico/`.
21. **Skills novas que valem a pena começar já** (fora as do bastão): `marca` (a BMH nunca teve posicionamento escrito
    para os dois públicos), `prospeccao` + `proposta-comercial` (lista e proposta para cirurgiões plásticos que indicam,
    sem comissão por encaminhamento, que a `revisar-contrato` sinaliza para advogado), `minerar-avaliacoes` e
    `responder-avaliacoes` (avaliações das duas unidades, sigilo dobrado). Recomendo: `marca` primeiro, porque orienta
    site, anúncio e Instagram.

### LGPD: `dados/fotos-com-paciente-nao-publicar/`

- **O que existe (sem abrir nenhuma foto):** 3 arquivos (fotos da sala das câmaras de Taguatinga, de 30/06 e 13/08/2026,
  descritas no `identidade/fotos/README.md` como pessoas deitadas nas câmaras). As 6 do ensaio de 2025 que estavam aqui
  foram para `identidade/fotos/ensaio-2025/` em 08/10, com a confirmação **verbal** do Jorge de que há autorização.
- **A pasta não tem README** (o pedido era conferir o README: ele não existe). Permissão: legível por qualquer usuário do
  Mac (`755`/`644`), ao contrário de `~/Consultas`, que é só do Jorge. Fora do git por falta de git.
- **Autorização por escrito:** nenhum arquivo diz onde está o termo das 6 fotos liberadas, de quando é, para quais canais
  e até quando. A pergunta da análise crítica de 08/10 ("é alguém da equipe ou paciente?") não tem resposta registrada.
- **Decisão recomendada:**
  1. **Onde fica:** fora do projeto. As 3 fotos não têm uso (o site vai usar câmara vazia): **apagar**, ou mover para
     uma pasta só do Jorge fora das 4 pastas (`chmod 700`), como as consultas.
  2. **Quem acessa:** só o Jorge; o Claude nunca abre, e o mapa já pula a pasta.
  3. **Autorização por escrito:** termo de uso de imagem assinado, com canal (site, Instagram, Perfil do Google),
     prazo e direito de revogar, guardado na clínica (não no projeto). No `identidade/fotos/README.md`, só uma linha:
     "autorização assinada em DD/MM/AAAA, arquivada em <lugar>", sem nome. Sem essa linha, as 6 fotos do ensaio com
     pessoa deitada saem do site até o termo aparecer.
  4. Registrar na `lgpd/referencias/mapa-por-pasta.md` (BMH) a linha "foto com paciente": onde mora, quem acessa e
     como apaga, que hoje está "a conferir".

---

## (c) Aplicações prontas para rodar

Todas na pasta da BMH (`cd ~/Downloads/BMH_Claude_VSL`). As que mudam algo pedem o ok do Jorge antes.

| # | O que | Como | Muda algo? |
|---|---|---|---|
| 1 | Procurar chave fora do `.env` | `python3 ~/.claude/skills/seguranca-credenciais/scripts/procurar-segredos.py` | Não (só lê) |
| 2 | Mapa da pasta de novo depois das mudanças | `python3 ~/.claude/skills/mapa-das-pastas/scripts/mapear.py --pasta bmh` | Não |
| 3 | Reconectar a "BMH Recepção" | Gerar o QR da instância no painel da Evolution (ou pela rota `instance/connect`) e ler com o celular da recepção; depois reaplicar os ajustes (não enviar, não marcar lida, ignorar grupo) com `node --env-file=.env integracoes/whatsapp/montar.js so-evolution` e conferir que `BMH_whatsapp_mensagens` começou a encher | Sim, ok do Jorge e celular na mão |
| 4 | Linha de base de citação nas IAs | Skill `geo-citacao`, passo 2 (20 perguntas, planilha `perguntas-20261012.csv`) e criar `saidas/site-novo/geo-mensal.md` | Só cria arquivo |
| 5 | Criar `saidas/site-novo/utms.md` | Copiar a tabela de UTMs do `plano-site.md` (linhas 260 a 275) com os links montados | Só cria arquivo |
| 6 | Plano de crise | Skill `crise-reputacao`, seção BMH, saída em `saidas/procedimentos/` | Só cria arquivo |
| 7 | Auditoria de segurança | Skill `seguranca-credenciais`, modo orientação, laudo em `saidas/seguranca/20261012-auditoria.md` | Só cria arquivo |
| 8 | Posicionamento | Skill `marca` (dois públicos: paciente no pós-operatório e cirurgião que indica) | Só cria arquivo |
| 9 | Git da BMH | Skill `salvar` (primeira vez cria o repositório privado) | Sim, ok do Jorge |
| 10 | Fluxo de limpeza das conversas e aviso de desconexão | Skill `n8n-fluxos` (tag BMH, nota, nova tentativa, alerta de falha) | Sim, aviso antes |
| 11 | Teste do alerta de falha | Rodar um fluxo de teste que falha de propósito e conferir a mensagem no robô "BMH alertas" | Sim, aviso antes |
| 12 | Gmail do dia 1 | `python3 scripts/gmail-autorizar.py` (depois de ativar a API no console) | Sim, Jorge autoriza |
