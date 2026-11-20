# Teste dos títulos do Google: leitura de 7 dias (13 a 19/11/2026)

Pedido do Jorge em 12/11/2026 ("me avisa em relatório Telegram o resultado"). Rodado em 20/11/2026 pelo Gerente BMH, na VPS.
Só leitura: nada foi gravado, pausado ou mudado no Google Ads.

## Fonte e limites

- **Números por anúncio:** tabela `BMH_google_anuncios_dia` do n8n (rota `n8n-tabelas-numeros` do cofre), atualizada em
  20/11 às 06h10. "Contatos" são as conversões que o Google atribui ao anúncio (por isso vêm com fração); é a régua da BMH
  enquanto o CRM não mede agendamento.
- **Qual anúncio é qual versão:** deduzido, não lido. O `scripts/google-titulos.py grava ambos` deixou o anúncio antigo de cada
  grupo com a versão SEM "acelerar" e criou um 2º anúncio com a versão COM. Os anúncios que aparecem pela primeira vez em 12 e
  13/11 são os novos (COM). Não deu para conferir os títulos de cada id pela API (ver Problemas).
- **Não lido:** nota de qualidade das palavras-chave e aprovação de cada anúncio. Os dois só saem pela API do Google Ads, e na VPS
  não há `.env` nem rota do Google Ads no cofre.

## 1. Cada grupo, cada versão (13 a 19/11)

| Grupo | Versão | Anúncio | Exibições | Cliques | CTR | Gasto | Contatos | R$ por contato |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Câmara hiperbárica · Brasília | SEM | 828149013357 | 395 | 27 | 6,8% | R$ 191,05 | 6,4 | R$ 29,85 |
| Câmara hiperbárica · Brasília | COM | 831436135342 | 369 | 34 | 9,2% | R$ 269,23 | 13,1 | R$ 20,55 |
| Concorrentes | SEM | 827407293319 | 137 | 19 | 13,9% | R$ 33,49 | 3,3 | R$ 10,05 |
| Concorrentes | COM | 831436099639 | 145 | 14 | 9,7% | R$ 25,31 | 2,3 | R$ 10,85 |
| Asa Sul | SEM | 827364211836 | 17 | 5 | 29,4% | R$ 45,73 | 1,5 | R$ 30,49 |
| Asa Sul | COM | 831518124182 | 16 | 1 | 6,2% | R$ 2,75 | 0 | sem contato |

Ligações (fora dos contatos): 1 em cada versão do Câmara, 1 na versão COM do Concorrentes.

**Exibições:** o Google dividiu quase meio a meio nos três grupos (395 × 369, 137 × 145, 17 × 16). Não favoreceu nenhuma versão.

**Aprovação:** não lida (ver Problemas). Os dois anúncios de cada grupo tiveram exibição todos os dias com dado, então nenhum
estava reprovado na semana; "aprovado com restrição" só a API mostra.

**O grupo inteiro, semana de antes × semana do teste** (os dois anúncios somados):

| Grupo | 06 a 12/11 | 13 a 19/11 |
|---|---|---|
| Câmara hiperbárica · Brasília | 762 exib., CTR 6,2%, 15 contatos, R$ 28,75 por contato | 764 exib., CTR 8,0%, 19,5 contatos, R$ 23,60 por contato |
| Concorrentes | 234 exib., CTR 9,8%, 5 contatos, R$ 12,41 por contato | 282 exib., CTR 11,7%, 5,7 contatos, R$ 10,38 por contato |
| Asa Sul | 36 exib., 1 contato | 33 exib., 1,5 contato |

Os títulos novos (as duas versões têm convênios fixos na 2ª posição) melhoraram o grupo Câmara e o Concorrentes contra a semana
de antes.

**Quanto vale a diferença:** no Câmara, a versão COM teve o dobro de contatos (13,1 × 6,4) e CTR maior (9,2% × 6,8%), mas com
uma semana e poucos cliques a diferença de CTR ainda pode ser acaso (teste estatístico simples: z de 1,2, abaixo do 1,96 que daria
segurança). No Concorrentes, as duas versões empatam no custo por contato. No Asa Sul, 33 exibições na semana não dão para
concluir nada.

## 2. Nota de qualidade das palavras

| Palavra | 12/11 | 20/11 |
|---|---:|---|
| hiperbárica | 5 | não lida |
| câmara hiperbárica | 5 | não lida |
| centro hiperbárico de brasília | 3 | não lida |
| hiperbárica asa norte | 3 | não lida |

Para ler no Mac, na pasta da BMH: `python3 scripts/google-titulos.py` (só confere, não grava nada; a primeira parte mostra a nota,
o CTR esperado, o anúncio e a página das 8 palavras que mais gastam em 30 dias). As duas de nota 3 podem não estar entre as 8.

## 3. Proposta (tirar anúncio só com o "pode" do Jorge)

- **Câmara hiperbárica · Brasília:** fica a versão **COM** "acelerar", sai a SEM. É o grupo que leva 81% do gasto dos três,
  e a versão COM trouxe o dobro de contatos com custo por contato 31% menor (R$ 20,55 × R$ 29,85).
- **Concorrentes:** empate (R$ 10,05 × R$ 10,85 por contato). Fica a **SEM**, que teve CTR maior e não carrega o risco do CFM.
- **Asa Sul:** sem dado para decidir. Fica a **SEM** e a COM sai, pelo mesmo motivo do CFM.

**Aviso do CFM (é aviso, não bloqueio; o Jorge decide):** "Acelere a Cicatrização" e "Cicatrização Mais Rápida" podem ser lidos
como promessa de resultado, que a publicidade médica não permite. E pós-operatório em geral não está na lista de indicações
UHMS e CFM (retalho e enxerto comprometidos estão), que é trava da BMH. Se o Jorge não quiser o risco, a versão SEM fica também no
Câmara: ela custou R$ 29,85 por contato, praticamente o mesmo da semana de antes do teste (R$ 28,75).

Alternativa, se o Jorge preferir certeza antes de escolher: deixar os dois anúncios do Câmara mais 7 dias e ler de novo.

## Problemas

- **desconhecido:** nota de qualidade das 4 palavras, hoje. Precisa da API do Google, que só roda no Mac (pedido à Central).
- **desconhecido:** aprovação de cada anúncio (aprovado, com restrição ou reprovado). Mesmo motivo.
- **risco:** a versão de cada anúncio foi deduzida pela data em que ele apareceu, não pela leitura dos títulos. O
  `google-titulos.py` no Mac confirma (mostra os títulos de cada anúncio ligado).
- **risco:** uma semana com poucos cliques; a vantagem da versão COM no Câmara é sinal, não prova.
