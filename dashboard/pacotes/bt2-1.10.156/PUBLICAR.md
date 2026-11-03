# Pacote BT2 — medidor 1.10.156 + preparação da migração (03/11/2026)

Conteúdo:
- `html/` → copiar para `C:\Users\b02raf\.node-red\public\html\` (medidor 1.10.156 e catálogo já apontando para ele). Guarde as versões antigas em `arquivo\`.
- `nodered/` → fluxos para importar no editor (Menu → Importar → Deploy). **Só importar na ordem e no momento do `IMPLANTACAO_ROTEIRO_v0.1.md`**: eles usam os DBs com número novo.
- `plc/` → blocos para o TIA do 1515 e DBs do ET200 (rascunhos, nunca compilados).
- `IMPLANTACAO_ROTEIRO_v0.1.md`, `ET200_PREVISIBILIDADE_v0.1.md`, `MAPA_RENUMERACAO_BT2_v0.1.csv`, `PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx`.

O medidor 1.10.156 funciona hoje com o PLC atual (chaves v2.6) **somente se** os fluxos antigos ainda estiverem no Node-RED e o número dos DBs for só informativo no HTML — ele não envia número de DB, só rotas. Os bancos BC59,5/BC550 continuam só no Demo até ligar a chave `?novos=1`.
