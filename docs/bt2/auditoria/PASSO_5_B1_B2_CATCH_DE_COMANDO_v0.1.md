# Passo 5 · B1+B2: falha ao desligar/zerar o PLC não fica silenciosa (medidor 1.10.228) · 18/11/2026

Aprovado pelo Reginaldo (18/11/2026). Mudança só na tela (aviso). Nenhum comando mudou, nada é bloqueado, PLC e Node-RED não foram tocados.

## Medição por AST (283 `catch` vazios no src, sem o dado embutido)
Outros 134 · storage 92 · DOM 30 · rede 15 (quase todos `postMessage` entre janelas) · parse 6 · comando+rede 3 · comando 3. Há também 7 `.catch(()=>{})`/`.catch(()=>null)`.
A contagem anterior ("23 em volta de rede/comando") veio de uma busca de texto e estava superestimada. Os pontos de comando de carga são 5, todos em `31_chaves_e_bancos_painel`.

## Correção ao plano
Toda chamada de comando passa por `chFetch`, que **já registra** a falha como **CHV-001** ("Comando de chave não executado", tipo Falha). Logo, a falha não era totalmente silenciosa. A lacuna real: o CHV-001 some quando **qualquer** outro POST do mesmo banco dá certo, mesmo que o desligamento que falhou continue pendente. E o texto do Setup dizia "desmarcada" mesmo sem o PLC confirmar.

## O que mudou (1.10.228)
- `chZeraPlc` (volta ao estado seguro ao trocar de modo) guarda por banco o que **não** foi confirmado e abre o **Alerta CHV-009** ("Estado seguro NÃO confirmado") com o motivo. O alerta só sai quando um desligamento do mesmo banco der certo por inteiro. Fica no histórico (Central de registros). Entrada no catálogo e roteiro (efeito, causa, solução).
- Nos dois "desmarcar automático" do Setup (gerador parado e STOP), se o PLC não confirmar, o texto passa a dizer "O PLC NÃO confirmou a desmarcação (veja CHV-001)".
- Uso do mecanismo de ocorrências em vez de `chErro`: o `chErro` é o texto do chip do Setup e é recalculado a cada leitura do PLC, então o aviso sumiria sozinho.

## Prova (B2)
`tests/integracao/fase4/t_zera_plc_falha.test.js` (5 testes): Node-RED real + PLC simulado + medidor real; a falha 503 é injetada no navegador nas rotas `selecionar` e `ligar` do BC56.
1. Controle sem falha: o desligamento é enviado e não abre CHV-009.
2. Falha 503: abre CHV-009 (tipo Alerta, BC56, texto com o que ficou pendente); CHV-001 continua existindo.
3. O aviso não some sozinho com a tela lendo o PLC.
4. Com o Node-RED respondendo de novo, repetir a volta ao estado seguro normaliza o CHV-009 (e ele fica no histórico).
5. Roteiro existe no catálogo.
Contra-prova: o mesmo teste na 1.10.227 falha (4 de 5). Rodado 3 vezes, estável.
Bateria completa na 1.10.228: unitários 132/132; integração 255 testes, 252 passam, 0 falham, 3 `todo`; e2e 24 de 25 (só `pacote_ia`); `build_modular` 4/4.

## Não coberto
O texto do Setup ("O PLC NÃO confirmou a desmarcação") exige uma chave selecionada pelo painel; não tem teste ainda. Os outros 134 `catch` vazios "outros" e a regra de CI contra `catch` vazio novo são o B3/B4.
