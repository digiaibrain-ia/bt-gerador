# Pacote BT2 — medidor 1.10.154 (publicação em public/html)

FECHAMENTO da etapa 1.10.x em 03/11/2026. Backup do código desta versão: branch `backup/medidor-1.10.154`. Backup da etapa de 2 bancos (BC56 + BC400): branch `backup/etapa-bc56-bc400`.

Este pacote é a cópia de entrega. O operador não acessa o GitHub: quem publica é a equipe, copiando esta pasta para o Node-RED do PC do banco.

## Conteúdo da pasta `html/`

| Arquivo | Função |
|---|---|
| `index.html` | página de entrada: lista as ferramentas e confere se cada arquivo está na pasta |
| `medidor_gerador_v1.10.154.html` | medidor do gerador (tela principal do ensaio) |
| `catalogo_ferramentas_v0.7.js` | lista das ferramentas que o index e o menu usam (já aponta para o medidor 1.10.154 e a maquete v0.3) |
| `menu_dev_v0.2.js` | menu ☰ de desenvolvimento (só aparece com o modo de testes) |
| `catalogo_modelos_v0.1.csv` | catálogo de modelos de gerador (o medidor atualiza o seletor sozinho) |
| `grafico_ensaio_v0.10.html` | gráfico do ensaio (2º monitor) |
| `mapa_fbs_v0.14.html` | mapa dos FBs |
| `gerenciador_logs_v1.6.html` | gerenciador de logs |
| `api_cards_visor_v0.3.html` | visor da API dos cards |
| `amostras_simulador_v0.6.html` | simulador de amostras |
| `maquete_layout_v0.3.html` | maquete de layout (desenvolvimento) |

## Passo a passo (no PC do banco)

1. Feche as janelas do medidor e do gráfico.
2. Copie o conteúdo de `html/` para `C:\Users\b02raf\.node-red\public\html\`.
   - Se já houver arquivos com o mesmo nome, substitua apenas os que estão nesta lista.
   - **Não apague as versões antigas.** Guarde-as numa subpasta `arquivo\` (ex.: `public\html\arquivo\medidor_gerador_v1.10.126.html`).
3. Abra `http://172.17.210.156:1880/html/index.html` e confira: todas as ferramentas devem mostrar ✓.
4. Abra o medidor: `http://172.17.210.156:1880/html/medidor_gerador_v1.10.154.html`.
5. Confira que o botão **Demo** pede a senha e abre o diálogo.

## Fluxos do Node-RED (passo separado)

Os fluxos **não** são carregados de `public\html`. Eles são importados pelo editor do Node-RED: menu ☰ → Importar → colar o JSON → Deploy.
Os fluxos que o BT2 usa (conferir a versão de cada um antes de importar):

| Fluxo | Arquivo no repositório |
|---|---|
| Chaves BC56 (DB150) | `nodered/flows/bt2/chaves-56-api-v2.6.json` |
| Chaves BC400 (DB158) | `nodered/flows/bt2/chaves-400-api-v2.6.json` |
| DSE / PLC da carga | `nodered/flows/bt2/cliente-156-dse-plc-carga-v1.json` |
| Seletor PLC (DB52) | `nodered/flows/bt2/cliente-31-seletor-plc-db52-v2.json` |
| Registro do ensaio (DB53) | `nodered/flows/bt2/registro-ensaio-db53-api-v1.4.json` |
| Servidor DSE (API do gerador) | `nodered/flows/bt2/servidor-deepsea-api-gerador-v3_6.json` |
| Simulador DSE (demo) | `nodered/flows/bt2/simulador-dse-demo-v3.json` |
| Logs de desenvolvimento | `nodered/flows/bt2/dev-logs-api-v1.0.json` |

Antes de importar, confirmar com o responsável que essas são as versões em uso no PC do banco.

## Fluxos conferidos no PC (03/11/2026)

Chaves BC56 e BC400 **v2.6** e Servidor DSE **v3_6** já importados e testados em Demo + PLC. Registro do ensaio v1.4: no teste de 02/11 o 🧪 Cards x flow ainda mostrava "flow antigo" — importar o `registro-ensaio-db53-api-v1.4.json` e apagar a aba antiga do registro.
