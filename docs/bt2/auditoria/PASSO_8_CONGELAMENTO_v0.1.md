# Passo 8: esteira final e congelamento · medidor 1.10.231 · 19/11/2026

Base testada: branch `ccr-bt2-pacote-v1.21`, commit `52079fd` (mais a correção do e2e `pacote_ia_toque_longo`, abaixo). Ambiente: Node 22, Node-RED 5.0.9 do harness, PLC simulado, Chromium. **Nada foi testado no PC BT2 nem no PLC real.**

## Resultado da esteira
| Bateria | Resultado |
|---|---|
| Unitários, build modular, `catch` vazio, módulos entregues e propriedades (fast-check) | **270 de 270** |
| Integração (55 arquivos: fase4, fase5, segurança, concorrência, instrumentação, F1 a F11, trava de produção) | **389 passam, 0 falham, 5 `todo`** |
| e2e Playwright (25 scripts, ~600 verificações) | **25 de 25 verdes** depois da correção abaixo |

`todo` conhecidos (comportamento esperado registrado, falham de propósito; nenhum afeta o limite de capacidade): P3-E1 (fila não falha rápido com o PLC mudo), P3-E2 (limpar 42 variáveis com escrita lenta), F4-1 (POST de tensão com o PLC sem resposta), F4-2 (conferência de volta lê cache), DR-1 (texto do bloqueio do Setup).

## O que esta etapa corrigiu
- `ACHADO F2-1` (JSON malformado dava 500): fechado por middleware opcional `nodered/config/bt2_json_invalido_400_v0.1.js` (settings.js do PC); teste F2 10 de 10 e contra-prova. Implantação opcional (A3b do checklist).
- e2e `pacote_ia`: expectativa do menu corrigida (6 itens). A falha de OCR era do servidor de teste (faltava `./tesseract/` na raiz), não do medidor.
- e2e `pacote_ia_toque_longo`: tinha a mesma expectativa antiga (5 itens); corrigido para 6. Observação: esse script imprime `FALHA` mas sai com código 0, então só a leitura do log mostra; a esteira passa a ser lida pelas linhas `FALHA`, não só pelo código de saída.
- `modo_operador`: depende da pasta `referencias/` servida ao lado do HTML (ambiente de teste).

## Regras congeladas (decisões do Reginaldo e da revisão independente)
- Limite de recusa: **110 % do kW a 100 % de cada gerador**. Degrau descartado (`degrau.max_kw = null`, inerte). Modo único `registrar` por padrão; `recusar` só depois da bancada.
- Desligar nunca é recusado; sem kW a 100 % conhecido nada é recusado; fail-open no C2; DSE sem resposta derruba as chaves e exige rearme (fail-safe).
- Perfil de combustível (gás 25 %/10 s, biometano 20 %/15 s): mantido, **pendente de conferência com o datasheet do MWM**.

## Impressões digitais
| Arquivo | SHA-256 |
|---|---|
| `dashboard/ferramentas/medidor_gerador_v1.10.231.html` | `673b5b5631647ea5b920b6dcc6281545b0478e84fbc119903a01aee58a0fda4a` |
| `nodered/config/bancos_capacidade.json` (v0.2, modo registrar) | `bc41a5ea3c0a0cbfaf5c06d7bf44c1bcb3581d7bb8e1dc7cca1d3613e166e5c5` |
| `nodered/config/bt2_json_invalido_400_v0.1.js` | `a5de84e05ffd10e675693bf360b0b649f64ce55a7e31ddff3e77f66e2de92149` |
O pacote v1.28 é gerado por `scripts/pacote/gerar_pacote_implantacao_v1.28.py` (o zip não fica no Git); anotar o hash do zip entregue no momento do envio à TI.

## O que ainda não está provado
Bancada física (PLC/ET200 reais, compilação no TIA, tempos de leitura), valores assumidos com o datasheet (110 %, perfis, debounce 10 s/5 s) e a implantação no PC BT2. Ver `docs/bt2/migracao/CHECKLIST_GO_LIVE_v0.1.md`.

## Lição do processo
O ambiente de execução reiniciou várias vezes e derrubou a esteira em segundo plano; foi retomada sem refazer o que já passou. Mutação (Stryker) não roda no CI: última medição à mão em `PASSO_7_PROVAR_OS_TESTES_v0.1.md` (RNC 99,1 %, C2 92,9 %, módulos puros 69,9 % a 93,7 %).
