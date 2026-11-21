# Roteiro de implantação (v0.2: fluxos com a correção da corrida de capacidade) · pacote v1.30 (medidor 1.10.231) · feito por mim, passo a passo · 19/11/2026

Eu faço tudo no PC BT2. Nada deste pacote foi importado no PC, no PLC ou no DSE: os testes rodaram em Node-RED 5.0.9 com PLC simulado. Regras que não negocio:
- **Carga de potência sempre desacoplada** durante a implantação e os primeiros testes.
- **Uma aba por vez.** Importou, fez Deploy, conferiu o ponto de verificação, só então a próxima.
- **Modo `registrar` (padrão).** Não mudo para `recusar` neste roteiro.
- O simulador (`02_somente_bancada`) nunca vai para o PC de produção.

## 0. Antes de começar
1. Backup: exportar do Node-RED todas as abas (BC56, BC400, BC550, BC595, DSE) e guardar o `bancos_capacidade.json` atual, o medidor atual em `public\html` e o `settings.js`.
2. Anotar as variáveis de ambiente de cada aba (`BT2_ORIGENS_OK`, `WD_HTML_S`, `CONF_JANELA_MS`, `QUARENTENA_MS`, `BT2_CAPACIDADE_JSON`): ao importar uma aba nova elas voltam ao padrão e eu reaplico.
3. Retorno de tudo: reimportar as abas guardadas do backup (cada passo abaixo diz o que voltar).

## 1. Arquivo de capacidade
Copio `04_config/bancos_capacidade.json` (v0.2) por cima do anterior, mesmo caminho.
**Conferir:** `"modo": "registrar"`, `gerador.kw100: null`, `degrau.max_kw: null`, `pctLim: 110`.
**Retorno:** voltar o arquivo do backup.

## 2. Abas de chaves, uma por vez
Ordem: **BC56 → BC400 → BC550 → BC595.** Em cada uma: apagar a aba antiga do mesmo banco, importar a nova de `01_fluxos_importar`, reaplicar as variáveis de ambiente da aba, Deploy.
Fluxos: `chaves-56-api-v3.10`, `chaves-400-api-v3.9`, `chaves-550-api-v1.10`, `chaves-595-api-v1.10` (trazem a **reserva de capacidade**, que corrige a corrida de dois comandos simultâneos; em modo `registrar` ela não faz nada).
**Conferir depois de cada Deploy:**
- log do Node-RED: `capacidade: config carregada v0.2 (modo registrar, ...)`;
- `GET /api/chaves/<banco>` responde igual ao de antes;
- ligar e desligar uma chave: o PLC obedece normalmente.
**Retorno:** apagar a aba nova e reimportar a do backup (as versões anteriores, v3.9 / v3.8 / v1.9 / v1.9, também ficam no repositório).

## 3. Aba nova de capacidade
Importo `gerador-capacidade-api-v1.0` (aba nova, sem nó S7).
**Conferir:** `GET /api/gerador/capacidade` → `modo: registrar`; `efetivo.kw100: null` até o medidor avisar.
**Retorno:** apagar a aba.

## 4. DSE
Troco a aba do DSE por `servidor-deepsea-api-gerador-v3_8` (só muda o log: 1 aviso por bloco a cada 5 min).
**Conferir:** a leitura do DSE continua chegando; o log fica mais limpo.
**Retorno:** reimportar a `v3_7` do backup.

## 5. Medidor
Copio `03_front_operacao/medidor_gerador_v1.10.231.html` e `catalogo_ferramentas.js` para `public\html`. Abro o medidor em modo real e escolho o modelo do gerador.
**Conferir:** em até 1 min, `GET /api/gerador/capacidade` mostra `kw100Medidor` e `efetivo.origem: "medidor"`.
**Retorno:** colocar o medidor 1.10.229 do backup de volta.

## 6. Prova na bancada (carga desacoplada)
1. Ligar e desligar chaves em cada banco: tudo como antes.
2. `GET /api/logs/<banco>` não mostra `LIMITE` nem `CAPACIDADE` em operação normal.
3. Alarmes: os de **comunicação** (COM-001/002/003/005, DSE-001/002, CHV-005/006) aparecem até 10 s depois e saem até 5 s depois; os de **segurança** (CHV-007/008, CHV-001, CHV-004, CHV-009, ENS-, SIS-) são imediatos.
4. Anotar tempos reais de leitura, compilação no TIA e qualquer diferença.

## 7. Opcional: 500 virar 400 para JSON inválido
Copio `04_config/bt2_json_invalido_400_v0.1.js` para a pasta do `settings.js`, acrescento `httpNodeMiddleware: require('./bt2_json_invalido_400_v0.1.js'),` e reinicio o Node-RED.
**Teste:** POST com corpo `{abc` em `/api/chaves/56/habilitar` deve dar **400** `{"ok":false,"erro":"corpo JSON invalido"}`; corpo válido segue igual.
**Retorno:** tirar a linha e reiniciar.

## 8. Depois
Deixo **uma semana em `registrar`**, olhando o log `LIMITE`/`CAPACIDADE`. Só depois da bancada, e se eu decidir, mudo `"modo": "recusar"` (reinicio o Node-RED e confiro `config carregada v0.2 (modo recusar...)`). Com `recusar`: **teste de corrida na bancada** (carga desacoplada, limite curto): mande dois comandos de ligar quase juntos que, somados, passem do limite; um deve ser aceito e o outro deve voltar **409**, nos dois bancos (um em cada). Passar do limite de **110 % do kW a 100 % do gerador** dá **409** sem chegar ao PLC; desligar nunca é recusado; sem kW a 100 % conhecido nada é recusado. Retorno: voltar a `"registrar"` e reiniciar.

## O que este roteiro NÃO prova
PLC/ET200 reais, compilação no TIA, tempos reais e os valores assumidos (110 %, perfil de combustível contra o datasheet do MWM, debounce 10 s/5 s). Isso é bancada.
