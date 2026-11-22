# Roteiro de hoje na fábrica — 29/10/2026 (v0.3 · atualizado 17:50)
Objetivo do dia: **trazer a evidência que falta** (PLC, flow do DSE, tensão do teste de sexta) e **preparar o teste a quente de 30/10**. Nada aqui altera o PLC ou o Node-RED: é coleta e conferência.
Legenda: ☐ fazer · (por quê) · **[dec]** = decisão/resposta que destrava algo.

## 1. Coletar (arquivos e fotos) — FEITO às 17:45
☑ **Foto do PLC (Program blocks + External source files)**: recebida. Ver `ANALISE_COLETA_2026-10-29.md`. Pendente: confirmar a versão **compilada** do FB101 (as fontes externas mostram `fb101_ComEt200_v0.6.scl` e `..._chamadas_v0.6.scl`).
☑ **CPU**: `6ES7 515-2FN03-0AB0` = **CPU 1515F-2 PN** (F-CPU, fail-safe), firmware V3.1. Resolvido.
☑ **Flow do DSE**: recebido (**v3.4**, aba "Deep Sea → REST /api/gerador"). Ainda falta só o nó de conexão "DSE (TCP)" (IP/porta/timeout), que o arquivo não traz.
☐ **Resultado do teste a quente de 22–23/10**, se houver anotação ou print.

## 2. Conferir o ambiente (5 min)
☐ Copiar para `public`: `medidor_gerador_v1.10.112.html`, `grafico_ensaio_v0.7.html`, `api_cards_visor_v0.1.html`, `mapa_fbs_v0.8.html`, `index.html`, `catalogo_ferramentas_v0.1.js`, `menu_dev_v0.1.js`. (1.10.112: sem o “a cada 1 s” no cabeçalho, API dos cards, visão simples)
☐ Abrir `http://IP:1880/index.html` e conferir os ✓. (o ✗ mostra o que falta copiar)
☐ No medidor, `?dev=1` e abrir o ☰.

## 2b. NOVO — Validar o que saiu hoje (ordem de importância)
☐ **Visão simples (⚙ Modo › Visão do operador › Simples)**: rodar 1 ensaio completo no **Demo** e, se possível, 1 com **PLC**. Conferir: INICIAR → etapas avançam e gravam sozinhas → finaliza sozinho; ZERAR zera só o degrau; PARAR ENSAIO zera tudo. (nunca foi testado de ponta a ponta)
☐ Anotar **quem sobe a carga** nessa visão (o operador não tem as chaves na tela) e se isso funciona na prática.
☐ Se uma etapa falhar ao gravar no PLC: confirmar que o ensaio **não** finaliza sozinho e que o reenvio pela tabela funciona.
☐ **Gráfico v0.7**: abrir pelo 📈 Analisar durante o ensaio; passar o mouse nos cartões de “Condições de aprovação” e ver o destaque; conferir kW/correntes ao vivo.
☐ **Notebook do observador (API direto)**: no gráfico, Fonte = “API direto”, endereço do Node-RED, informar tensão e frequência nominais, ▶ Iniciar. Se não ler, anotar a mensagem do cabeçalho (pode ser bloqueio CORS ao abrir como arquivo; testar abrindo por `http://IP:1880/...`).
☐ Conferir no **visor da API** (`api_cards_visor_v0.1.html`, mesmo navegador do medidor) se os cards batem com a tela.
☐ Confirmar que o cabeçalho sem “a cada 1 s” está ok para a apresentação.

## 2c. NOVO — Retorno da reunião de automação
☐ **[dec] Stand-by: piso de 107 % ou ponto de 110 %?** e de onde vem o critério (norma/procedimento). Hoje: 300 s a 100 % e ≥ 107 % são padrão **assumido**.
☐ Registrar quem decide os critérios de aprovação e se o resultado do medidor é o oficial.
☐ Quer rotas HTTP no Node-RED para os cards? (só com nomes aprovados por você/engenharia)

## 3. Preparar o teste de sexta (30/10)
☐ **[dec] Tensão do teste: 220 V ou 380 V?** (define o chaveamento do Setup; BC400 não atende 440 V)
☐ Anotar: **modelo/kVA do gerador**, tensão ligada, quais bancos entram (BC56, BC400 ou os dois).
☐ **Tensão de referência do ensaio de kW** — qual é e quem define (hoje desconhecida; o FB100 deixa o R teórico "não calculado" por isso).
☐ Durante o Setup, anotar por chave: kW medido no DSE × kW esperado. (valida `kwEf`/Setup)
☐ Marcar se o **PLC e o ET200 estão com a seletora em Auto** antes de comandar. (sem Auto o FB101 recusa)

## 4. Perguntas de implementação ao operador
☐ O tempo entre degraus pode ser mais curto (quase degrau seco)? Qual intervalo ele usa na prática? (parâmetro do escalonador, hoje assumido 1 s)
☐ Há modelo que oscila com degrau de 30 %? Quais? (primeira carga do perfil por modelo)
☐ Como ele reconhece que a etapa "estabilizou"? (confere o critério do HTML)

## 5. Observar durante qualquer teste hoje
☐ **Oscilação visual das chaves**: se repetir, anotar hora e se o cabeçalho mostrou "sem leitura do PLC"; baixar o log pelo Gerenciador. (confirma ou descarta a hipótese do poll perdido)
☐ **Base do `percCarga` do DSE**: anotar o % de carga mostrado e o kW medido; comparar com o kW a 100 % do modelo. (descobre se o DSE usa 100 % = kW/1,1 ou a placa)
☐ Se o gerador parar no meio, ver se o cronômetro continua contando. (evento de 17/10)

## 6. Não fazer hoje
Nenhuma mudança no PLC nem no flow de chaves. O medidor 1.10.112 só vai para produção depois do ensaio Demo da seção 2b. Qualquer ajuste sai como versão nova depois do teste de sexta.

## Depois
Segunda 02/11: reorganização conjunta (numeração, 1515 única, 1200). Itens que ficam esperando: numeração/DB do perfil e do bit de início, limite de capacidade no PLC.
