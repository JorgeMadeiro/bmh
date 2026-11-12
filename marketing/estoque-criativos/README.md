# Estoque de criativos da BMH (rotina do dia 25)

Regra do Jorge de 12/11/2026, ajustada no mesmo dia pensando no custo (livro de decisões da Central, commit 514d0b3; frentes/trafego.md,
item 4). Vale para Nexo e BMH; aqui está o jeito da BMH.

## A regra

1. **Estoque é um mínimo:** 2 a 4 reservas por serviço anunciado. Criativo que roda bem continua rodando. Com o estoque cheio,
   não se grava nem se testa nada. No dia 25 só se repõe o que faltar.
2. **A reserva sai primeiro de post ou reel já publicado** da própria BMH sobre o tema, com nota acima do normal do perfil e dentro
   das travas, usado como a publicação existente (mantém curtidas e comentários). Gravar novo só quando não houver post do tema
   ainda não usado em anúncio. Post da BMH nunca vira anúncio de outra marca, nem o contrário.
3. **Teste só na hora de usar.** Padrão sem verba a mais: quando o criativo cansa, a reserva entra como 2º anúncio no mesmo
   conjunto, com o orçamento que ele já tem, e compara em 7 dias; o pior sai. Teste separado (3 conjuntos, R$ 20 por dia, 2 dias,
   R$ 120) só para serviço novo ou 3 candidatos ou mais, com o "pode" do Jorge.
4. **Criativo se troca pelo agendamento, não pela frequência** (ajuste do Jorge de 12/11/2026, commit 506870c, confirmando 25/10).
   Cansado = na média de 7 dias, o agendamento cai ou o custo por agendamento sobe, contra as semanas anteriores e a régua da marca.
   **Na BMH, enquanto o CRM não medir agendamento por anúncio, vale o custo por conversa.** A frequência só acende a atenção, a partir
   de 2,5 em 7 dias (o guardião avisa em 4); frequência alta com custo bom não troca.
   A revisão de segunda marca "Criativo cansado" quando o custo por conversa da semana fica 30% ou mais acima das 3 semanas
   anteriores do mesmo anúncio, com 3 conversas ou mais em cada lado, e aponta a reserva anotada na `BMH_config` (`meta_reserva`);
   sem reserva, pede reposição na hora (primeiro post publicado, depois gravação).
5. Janela de decisão de 7 dias; verba sobe no máximo 20% por dia, com o "pode".

## Serviço anunciado hoje

| Onde | Serviço | Criativo no ar | Reservas |
|---|---|---|---|
| Meta, campanha de mensagem (`scripts/meta-campanha-mensagens.py`, ainda não criada) | BMH, câmara hiperbárica (geral) | "Presença médica" (p/DRhc0iyjVk3), quando ligar | ver `saidas/estoque-criativos-AAAA-MM.md` |

O Google Ads é de pesquisa, com anúncio de texto: não entra no estoque de criativos.

## Dia 25

1. `python3 scripts/estoque-criativos.py` (VPS pelo cofre, ou Mac com `META_ADS_TOKEN`). Sai `saidas/estoque-criativos-AAAA-MM.md`:
   cada post dos últimos 12 meses com nota contra a mediana do mesmo formato, tema, travas da legenda e se já foi anúncio.
2. Contar as reservas aptas por serviço anunciado (nota 1,5 ou mais, sem trava que bloqueia). Duas ou mais: estoque cheio, nada a fazer.
   O criativo no ar só sai se estiver cansado pelo critério do item 4 (custo por conversa), nunca só pela frequência.
3. Faltou: primeiro post publicado do tema ainda não usado; não havendo, roteiro novo pelo método do Stanley, junto com a pauta do mês.
4. Mostrar ao Jorge o que entra (link, nota, avisos) antes de usar. **Paciente no vídeo ou na foto o script não vê**: o Jorge confere
   pelo link (só com autorização por escrito). Hashtag na legenda sai editando o post, com o ok dele.

Travas que bloqueiam: preço, estética, depoimento, caso de paciente, celebridade, evento ou data. Só avisam: hashtag, promessa
(aviso do CFM) e pós-operatório genérico (indicação fora da lista UHMS e CFM; o Jorge decide).
