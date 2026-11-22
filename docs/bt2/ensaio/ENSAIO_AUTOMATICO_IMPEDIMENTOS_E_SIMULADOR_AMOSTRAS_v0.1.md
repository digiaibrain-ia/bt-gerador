# Ensaio automático do BT2 — o que impede, e o simulador de Amostras (v0.1 · 25/10/2026)

**Resumo.** Levantei o que falta para um primeiro ensaio automático (a/b/c abaixo) e criei `amostras_simulador_v0.1.html`: um protótipo 100 % no navegador que simula o serviço do operador (bancos BC56 + BC400) sobre os 29 geradores da tabela de potências e registra grandezas, manobras das chaves e resultado por etapa. **É modelo simulado (premissas inventadas para dar ordem de grandeza), não dado do gerador real.** Nada foi escrito no PLC, no Node-RED nem no medidor.

## (a) Confirmado nos arquivos do projeto
| Fato | Fonte |
|---|---|
| Tabela de potências (29 modelos, 60 Hz): kW = 0,8 × kVA; **100 % do ensaio = kW ÷ 1,1**; 107 % e 110 % sobre esses 100 % (110 % = kW de placa = stand-by). As 29 linhas do print bateram com esse cálculo. | print do usuário (25/10/2026), conferido em `CHECK_TAB()` do HTML |
| O medidor usa `KW_NOM = 91` fixo (um único gerador de 125 kVA). | `medidor_gerador_v1.9.77.html`, bloco "BANCO DE CARGA, GERADOR E SIMULADOR" |
| Chaves: BC56 = 3,4,4,4,4,4,4,4,5,5,5,5,5 kW; BC400 = 5,5,10,10,10,10,50×7 kW (total 456 kW). | mesmo arquivo, `BANCOS` |
| Etapas 0·30·50·100·107·0 % com 2·1·1·5·2·1 min; tolerância de carga 10 pontos; estável = só "dentro da faixa" por 1,5–4,5 s (sem filtro, sem critério de oscilação, e depois de estável o cronômetro não reseta sozinho); valor salvo = média dos últimos 2 s. | mesmo arquivo, `ETAPAS`, `TOL`, `ESTAB_MIN/MAX`, `JANELA_S`, `passoUnit()` |
| A condição de stand-by é "carga aplicada ≥ 107 %" (limite mínimo), diferente da faixa ±10 pontos da estabilidade. | `avaliaEnsaio()` |
| O medidor usa o campo `percCarga` do DSE como a carga %. | `ingest()` |
| "CB AUTO das Cargas" (PLC Ensaio Automático → PLC dos Bancos) **é futuro e ainda não existe**; DB SNAP AUTO só existe no PLC Ensaio Automático; "Node-RED de seleção" e "DB seletor" são **a construir** (nº do DB a definir). Os dois Node-RED DSE já mandam as grandezas ao PLC Ensaio Automático (SB_DSE). | `ARQUITETURA_DADOS_ENSAIO_PLC.md` |
| FB100 já calcula kW real por chave (`KwReal := kWMedido − BaseKW`) e o FB101 v0.4 já protege no PLC (seletora fora de Auto ou ET200 sem comunicação → desliga banco e abre chaves). | `fb100_setupChaves_v0.2.scl`, `fb101_ComEt200_v0.4.scl` |

## O que impede o automático (resumo)
1. **Onde o FB roda e como chega o dado.** O documento de arquitetura põe o ciclo automático no *PLC Ensaio Automático*. Falta confirmar se esse PLC já existe fisicamente, e criar: DB DSE (kW, tensões, frequência, temperatura) alimentado pelo Node-RED DSE, DB SNAP AUTO, DB seletor e o **CB AUTO das Cargas** que comanda os bancos. Hoje só o caminho manual existe.
2. **Critério de "estável" do automático não existe.** O manual depende do olho do operador. O FB precisa de: filtro, tolerância, banda de oscilação, tempo de estabilidade, o que fazer ao sair da faixa, e tempo máximo (lista completa na aba "Parâmetros do FB" do HTML).
3. **Base do 100 %.** O automático precisa do kW de 100 % de **cada gerador** (kW ÷ 1,1, vindo da tabela), não de `KW_NOM = 91`. E **não sei qual potência está configurada no DSE real** como base do `percCarga` (se for a placa de 110 %, o "100 %" do DSE seria 110 % da tabela).
4. **kW das chaves.** Placa só vale na tensão do projeto (assumido 440 V; a potência varia com V²). O Setup (FB100) vale na tensão em que foi calibrado. O FB precisa escolher entre placa, Setup ou placa corrigida por V², e ter correção por realimentação.
5. **Capacidade do banco.** Com 456 kW, geradores a partir de 625 kVA não chegam a 107 % (calculado). A tabela ainda tem 110 %: com 550 kVA são 440 kW (cabe).
6. **Segurança do automático.** Abortar abrindo todas as chaves por: sem leitura do DSE, água crítica, chave sem feedback, falha de comunicação. Parte já existe (FB101 REGION 0, vigia do Node-RED); falta a do ciclo automático e a parada de emergência.
7. **Critérios sem origem confirmada:** 5 % de frequência, 5 min em 100 %, 107 % × 110 % de stand-by, "DPP" (engenharia da fábrica).
8. **Não há dado de gerador real.** Antes de fixar tempos e filtros, é preciso o CSV do medidor (Registro de aprendizado) com ensaios manuais reais. A aba "CSV real" do HTML analisa esse arquivo.

## (b) Assumido no simulador (a confirmar com dado real)
Regulação 1 %, afundamento de 3 % no degrau, governador de 2ª ordem (ωn = 1,8 rad/s, ζ = 0,6), ruído do kW 0,25 % do stand-by, leitura do DSE a cada 1 s com resolução de 0,1 kW, kW sem carga 0,4 %, contator 80 ms + feedback 120 ms, kW real das chaves ±3 % da placa, banco projetado para 440 V, Setup com erro de 0,3 %, bancos BC56 + BC400 usados juntos.

## O que o primeiro ensaio simulado mostrou (cenário "bom", só vale para o modelo assumido)
- **63 de 63 ensaios aprovados** (21 geradores viáveis × 3 formas de conhecer o kW das chaves); 8 geradores (625 a 1250 kVA) **inviáveis** com 456 kW.
- Duração 13–15 min para um ensaio de 12 min; 8 a 64 manobras conforme o gerador e a forma de conhecer o kW das chaves.
- **A tolerância de ±10 pontos é frouxa para o modelo "bom"**: a leitura entra na faixa em ≤ 1 s. O tempo que pesa é o do próprio controlador declarar estável (tEstab + janela do filtro ≈ 8–9 s por etapa).
- **O V² reduz a carga sob carga (≈ 2 %)**: no stand-by o kW do Setup ficou abaixo do previsto e a correção por realimentação foi necessária (ganho ≈ 0,984).
- **Stand-by (≥ 107 %) precisa de margem de mira** (padrão 2 pontos): sem ela alguns geradores reprovaram por décimos. Com chaves de 3–5 kW em geradores pequenos (12,5 kVA) o erro de carga chega a 6 pontos.
- **Com kW de placa em 220 V a carga fica 4× menor que a prevista** (controlador só chega lá porque aprende o ganho). Placa corrigida por V² (ou Setup na tensão do ensaio) é obrigatório.
- **O filtro pode esconder oscilação**: no cenário "oscilante" o controlador declarou estável (média móvel de 3 s atenua a oscilação de 4 s), mas a oscilação bruta ficou em 7 pontos e o ensaio reprovou em tensão e stand-by. O HTML avisa quando a oscilação bruta passa da banda.
- Cenários de falha testados: chave sem feedback (aborta e abre tudo), DSE sem dado por 20 s (pausa e retoma), medição ruidosa (aprova com filtro), gerador fraco (reprova em frequência).

## (c) A desenvolver / decidir
1. Rodar ensaios MANUAIS reais com o Registro ligado e trazer o CSV (aba "CSV real") para trocar as premissas do modelo.
2. Decidir onde o FB roda e criar o caminho de dados e comando (item 1 dos impedimentos).
3. Decidir: política ao perder a faixa na contagem (pausa/reinicia/ignora), critério de escolha das chaves (menos manobras × menos chaves), margem do stand-by, 107 % × 110 %.
4. Só depois portar a máquina de estados (INICIO → APLICA → ESTABILIZA → CONTA → SALVA → FIM/FALHA) para SCL; **não foi iniciado nenhum bloco SCL do automático.**

## Como usar o HTML
Abrir o arquivo no navegador (funciona offline). Escolher gerador, bancos, cenário e "kW das chaves" → ▶ Rodar (ou ⏭ Rodar todos). Abas: Simulação (gráficos de carga, frequência e tensão com as manobras marcadas), Geradores (viabilidade + resultado de todos), Manobras e eventos, Resultados (6 condições + números para dimensionar o FB), Parâmetros do FB (editáveis), CSV real, Sobre. Exporta CSV de amostras (mesmas 28 colunas do CSV do medidor + extras), CSV de manobras, JSON e Markdown.

## Glossário
- **Pontos %**: diferença absoluta em pontos percentuais de carga.
- **Oscilação p-p**: maior − menor valor da janela.
- **Assentar**: da última manobra até a leitura bruta entrar e ficar na faixa.
- **Declarar estável**: o controlador ter visto tEstab seguidos na faixa e dentro da banda de oscilação.
- **Ganho aprendido**: relação medido ÷ previsto que corrige o kW conhecido das chaves.
- **Stand-by (110 %)**: potência de placa do gerador; **100 %** do ensaio = placa ÷ 1,1.
