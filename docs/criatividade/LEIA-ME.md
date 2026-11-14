# Criatividade do projeto BT2 — pasta de trabalho (10/11/2026)

**Objetivo:** entender de onde vêm as ideias do projeto (quem pediu, de onde veio, o que foi decidido) para, depois, tentar achar padrões. Ainda NÃO existe teoria nem fórmula: só coleta e rastreio.

## Arquivos
- `PROMPT_EXTRATO_v1.0.md`: o prompt (10 regras) que se cola numa sessão do Project para gerar o extrato dela.
- `RASTREIO_IDEIAS_v0.2.xlsx`: uma linha por pedido do Reginaldo (abas Sessoes, Rastreio, Resumo), v0.1 + S07. Gerado por `gerar_rastreio_v0.2.py` (a v0.1 e seu gerador ficam como histórico) (não sobrescreve; versão nova = arquivo novo).

## Níveis de evidência (coluna "Evidência")
- **A**: mensagem original visível + prompt final (com FONTE DA IDEIA).
- **B**: mensagem original visível, mas extrato em formato antigo (sem FONTE DA IDEIA; causas sem fonte). FONTE fica "NÃO-REGISTRADA".
- **C**: veio de resumo (segunda mão); paráfrase, sem horário garantido.
O extrato é relato do assistente. Quem confere é o Reginaldo.

## Como acrescentar uma sessão
1. Colar o prompt na sessão do Project e copiar o extrato.
2. Mandar o extrato para análise (ela confere contra as regras do prompt).
3. As linhas entram no gerador (nova versão do xlsx, nunca sobrescrever a anterior).

## Pendências conhecidas
- Categoria "OUTRA-IA" não existe na lista de fontes do prompt (decisão do Reginaldo).
- S06 (Start/Stop do DSE): endereço dos LEDs (Page 14 x 190) é inferência do assistente; teste não visível. Segurança: nada em produção sem OK.
- CPU do banco de carga: **1214FC** (decidido pelo Reginaldo em 10/11/2026). Falta só o modelo do 1515 (FN03 ou FM02).
- `extratos/`: extratos guardados em texto (hoje só o S07, desta sessão). Os extratos S01 a S06 estão só no chat; colar aqui se quiser guardá-los.

## Coluna TIPO DO PEDIDO (v0.3) — classificação do assistente, a revisar pelo Reginaldo
ACRESCENTA (pede algo novo ou mais) · CORTA (reduz escopo, remove, limita, adia para o futuro) · CONSOLIDA (junta, unifica, organiza, sincroniza, sem tirar função) · CORRIGE (aponta erro, defeito ou retrabalho) · PERGUNTA (pede informação, análise ou decisão) · OUTRO (aprovação, contexto, ambíguo).
**Hipótese a testar (NÃO provada):** os pedidos do Reginaldo tendem a CORTAR/CONSOLIDAR. Primeira leitura (só evidência A, 16 pedidos dele): 6 CORTA + 2 CONSOLIDA (50%), 3 ACRESCENTA (19%), 4 PERGUNTA, 1 OUTRO. Amostra pequena. A outra metade da hipótese (o assistente tende a ACRESCENTAR) **não aparece nesta planilha**, porque ela só tem os pedidos do Reginaldo; o acréscimo do assistente está nas entregas, não nos pedidos (precisaria de uma coluna/aba nova para medir).
