# Roteiro unico de atualizacao: PLC + Node-RED + HTML (pelo notebook) - v0.1

Para o Reginaldo, com o notebook como ponte: **baixar -> levar ao PC BT2 (Node-RED e HTML) -> carregar os blocos no PLC pelo TIA**.
Nada deste material foi compilado ou testado em PLC/Node-RED reais. **Carga de potencia desacoplada, gerador desligado e bancos desligados** durante toda a atualizacao.

## A. Como baixar o material
**Opcao 1 (a mais simples): o pacote pronto, que recebeu aqui no chat** (`entrega_atualizacao_bt2_v0.3.zip`). Tem tudo: JSON, HTML, blocos do PLC, documentos, `MANIFESTO.sha256`.
**Opcao 2: direto do GitHub, no notebook** (precisa estar logado na conta com acesso ao repositorio):
1. Abra `https://github.com/digiaibrain-ia/bt-gerador`.
2. Clique no seletor de branch (onde esta escrito `main`) e escolha **`ccr-4f9e06b7-bw4qef`**.
3. Botao verde **Code > Download ZIP**. (Link direto: `https://github.com/digiaibrain-ia/bt-gerador/archive/refs/heads/ccr-4f9e06b7-bw4qef.zip`).
4. Descompacte. As pastas que interessam: `nodered/flows/bt2/` (JSON), `dashboard/ferramentas/` (HTML), `plc/bt2/` (blocos), `docs/bt2/migracao/` (roteiros).
(Alternativa com Git instalado: `git clone --branch ccr-4f9e06b7-bw4qef https://github.com/digiaibrain-ia/bt-gerador.git`.)
**Conferir integridade (Windows, PowerShell, dentro da pasta do pacote):**
`Get-Content MANIFESTO.sha256 | ForEach-Object { $h,$f = $_ -split '\s+',2; if ((Get-FileHash $f -Algorithm SHA256).Hash.ToLower() -ne $h) { "DIFERENTE: $f" } }` — nao deve imprimir nada.

## B. Antes de mexer em qualquer coisa (obrigatorio)
1. **TIA:** salvar uma copia do projeto do 1515 e anotar/exportar os valores salvos de DB150, DB152, DB158, DB160 (Setup por chave e por tensao) e DB53. Descobrir **como o PLC esta hoje**: os DBs de chaves estao como `DB150/158` (antigos) ou ja como `DB3000/3100`? (Se ja estiverem em DB3000/3002/3100/3102/2000/2100, pule a Etapa 1.)
2. **PC BT2:** Node-RED > Menu > Exportar > todos os fluxos (guardar o JSON); copiar `settings.js`, `flows_cred.json` e a pasta `public\html`.
3. **Variaveis do PM2 (os JSON novos NAO tem mais IP fixo):** `PLC_IP` e `DSE_URL`, e reiniciar o Node-RED. Valores que estavam fixos nos fluxos antigos: `PLC_IP=[IP_1515]` e `DSE_URL=http://[IP_PC_BT2]:1880/api/gerador` (**confirme com a TI se continuam esses**). Exemplo em `04_config/pc-bt2.env.example`. Sem isso os fluxos novos nao conectam.
4. Conferir que **nao existe** a aba "Simulador DSE (Demo)" no editor.

## C. Sequencia (PLC e Node-RED mudam juntos: um DB novo no PLC pede o fluxo novo na hora)
**Etapa 1 - BC56, BC400, DSE e snap (renumerar o que ja funciona)**
1. TIA: renumerar `DB150/152/154/155 -> DB3000/3002/3004/3005` (BC56), `DB158/160/162/163 -> DB3100/3102/3104/3105` (BC400), `DB52 -> DB2000`, `DB53 -> DB2100` (Propriedades > Numero preserva os valores; mapa em `plc/01_etapa1_renumerar/MAPA_RENUMERACAO_BT2_v0.1.csv`; se o TIA recusar, importar os `.db` da pasta). Compilar e carregar **com gerador e bancos desligados**.
2. PC BT2, no editor do Node-RED, **uma aba por vez** (apagar a antiga de mesmo nome, importar, Deploy, conferir o `GET`): `chaves-56-api-v3.4`, `chaves-400-api-v3.4`, `cliente-156-dse-plc-carga-v3`, `cliente-31-seletor-plc-db2000-v4`, `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `servidor-deepsea-api-gerador-v3_7`.
3. HTML: copiar `medidor_gerador_v1.10.167.html` e `catalogo_ferramentas_v0.7.js` para `public\html` (nao apague as versoes antigas) e abrir por `http://<servidor>:1880/html/medidor_gerador_v1.10.167.html`.
4. Conferir: BC56 e BC400 com leitura ok, DSE ok, Registro ok, janela "Cards x flow" toda OK. **So siga se estiver igual a antes.** Senao: voltar os DBs aos numeros antigos e importar o JSON exportado no passo B.2.
**Etapa 2 - BC550** (`plc/02_etapa2_BC550/`): ET200 (DB41 `ComBC550`, `fb_bancoEt200_16`, `fc_bancosNovosEt200`, tags do CSV) e no 1515 `db3300`, `db3302`, instancias `db3304i`/`db3305i`; **depois** importar `chaves-550-api-v1.5`. Teste com o banco **desligado**, uma chave de cada vez.
**Etapa 3 - BC595** (`plc/03_etapa3_BC595/`): importar **antes** `fb102_setupChaves32` e `fb103_ComEt200_32`; `db3200`, `db3202`; remoto `db40_ComBC595_32`; no ET200 `fb_bancoEt200_32`; **depois** `chaves-595-api-v1.5`.
**Chamadas (1515):** `plc/04_chamadas/fc_chamadasBancos_BT2_v0.2.scl` (um FC com as chamadas dos 4 bancos, chamado uma vez no OB1); os `chamadas_BC*` ficam como referencia.
**Opcional, decisao sua:** `plc/05_opcional_decisao_sua/fb100_setupChaves_v0.4.scl` (troca o FB100 v0.3 ja carregado; traz correcoes de seguranca: limita NumChaves, desabilitar zera CbLigar, Setup sem kW nao confirma). Nao esta testado em PLC.
Lembrete: o Node-RED abre ~11 conexoes S7 com o 1515; se aparecer "PLC sem leitura" nos 4 bancos juntos, suba o `cycletime` dos endpoints de chaves de 200 para 500 ms.

## D. Depois de cada etapa
Me mandar: erros do TIA (texto), o que o chip de comunicacao mostra e a janela "Cards x flow".

## E. Fechamento: checklist de bancada
Com as 3 etapas ok: `05_documentos/CHECKLIST_BANCADA_v0.1.md` (Engenharia + TI, carga desacoplada).

## F. O que NAO e desta atualizacao
SQL Server (futuro), `rid`/Idempotency-Key (adiado), correcoes de P3-E1/P3-E2 (abertos ate os numeros da bancada).
