# RNC · Revisão de código antes da bancada — v0.1 (13/11/2026)

Escopo revisado: `nodered/gerador/` (regras, gravação, gerador do fluxo), `dashboard/modulos-fonte/rnc_defeito_v0.2.js`, `robo_fase_rnc_v0.3.js`, telas `rnc_registro_v0.1.html` e `rnc_reparo_v0.2.html`, script `tests/rnc_teste_bancada_v0.1.js`. **Não foi revisado** o resto do medidor (1,3 MB, base v1.10.201 da sessão BT2): só o módulo RNC colado nele.
Método: revisão automática (10 achados) + **conferência de cada achado no código** antes de agir. Versões novas, nada sobrescrito.

## Resultado: 9 confirmados e corrigidos · 1 rejeitado
| # | Achado | Veredito | Correção (versão) | Prova |
|---|---|---|---|---|
| 1 | Fase do robô: se a janela "Registrar defeito" não abre/fecha, ela podia ficar aberta e travar o resto | **Confirmado** (gravidade baixa, só no robô) | Fecha a janela em qualquer saída (`robo_fase_rnc_v0.4.js`) | robô na 204 sem falha na fase RNC |
| 2 | Script de bancada: `const fim` sombreava a função `fim()`; com servidor fora do ar mostrava "ERRO INESPERADO" e perdia o resumo | **Confirmado** (reproduzido) | `rnc_teste_bancada_v0.2.js` | servidor fora do ar mostra "0 OK / 1 FALHOU" |
| 3 | Medidor: com servidor fora do ar ou rota ausente, o aviso consultava `/api/rnc/serie` a cada 2 s sem parar (em todos os medidores) | **Confirmado** — **o mais relevante para a produção**, porque o fluxo RNC ainda não estará importado em nenhum PC no começo | Tentativa fica marcada; só a renovação de 30 s tenta de novo (`rnc_defeito_v0.3.js`, medidor 204) | 5 consultas em 9 s (v1.10.203) → **1** (v1.10.204) |
| 4 | Robô: o teste do aviso competia com o vigia do botão (instável) | **Confirmado** (risco de teste instável) | `RNC_DEFEITO.pausa()` usada pelo robô (`robo_fase_rnc_v0.4.js`) | robô na 204: 186 OK |
| 5 | Robô: etapa de referência lida antes da espera da falha simulada | **Confirmado** (improvável na prática: a etapa aguarda o salvamento) | Lida depois da espera | idem |
| 6 | Reparo: após erro de servidor (≠ 409) a tela era refeita e a mensagem "NÃO foi salvo" sumia — o técnico podia achar que gravou | **Confirmado** (**relevante**) | Atualiza primeiro e mostra o erro depois (`rnc_reparo_v0.3.html`) | erro 500 simulado: mensagem continua visível com o diálogo aberto |
| 7 | Reparo: corte fixo de 1000 RNCs; a situação "série BLOQUEADA" era recalculada de uma lista truncada | **Confirmado** (volume baixo no piloto; erro silencioso no futuro) | Pendentes vêm **completas**; liberadas, só as 50 mais recentes (`rnc_reparo_v0.3.html`) | pendente antiga + liberada recente: aviso "segue BLOQUEADO" correto |
| 8 | Script de bancada: T13b dizia checar "sem buraco" mas só checava unicidade | **Confirmado** | Confere 1..N em sequência (`rnc_teste_bancada_v0.2.js`) | 18 de 18 OK no Node-RED real |
| 9 | Chave de idempotência reaproveitada para **outro** defeito depois de uma resposta perdida: o servidor devolvia a RNC antiga e a tela mostrava "Salvo" sem gravar | **Confirmado** (**relevante**: registro perdido sem aviso) | Chave ligada ao conteúdo (série, modelo, banco, tipo, descrição): mudou, chave nova (`rnc_registro_v0.2.html`, `rnc_defeito_v0.3.js`) | reenvio igual → mesma chave; outro defeito → chave nova (Registro e botão do medidor) |
| 10 | "Esc fecha a janela" seria redundante com o Esc nativo do `<dialog>` | **Rejeitado** | — | No medidor as janelas são flutuantes (`show()` interceptado) e o Esc **não** fechava antes; o teste com o handler fechou. Mantido |

## Regras e gravação (core/io/fluxo)
A revisão **não apontou erro** em `rnc_core_v1.1.js`, `rnc_io_v1.1.js` nem no fluxo gerado: os 22 testes automáticos continuam passando (22 OK · 0 falha).

## Versões que mudaram
| Peça | Antes | Depois |
|---|---|---|
| Medidor | v1.10.203 | **v1.10.204** (`gerar_medidor_v1.10.204_v0.1.py`; módulo v0.3 e fragmento do robô v0.4) |
| Tela de Registro | v0.1 | **v0.2** |
| Tela de Reparo | v0.2 | **v0.3** |
| Script de bancada | v0.1 | **v0.2** |
| Roteiro / LEIA-ME de bancada | v0.1 | **v0.2** |
| Pacote de bancada | v0.2 | **v0.3** (`gerar_pacote_rnc_bancada_v0.3.py`) |

## Evidências desta rodada (simulado)
- Robô Dev/Operador oculto na v1.10.204 (Demo, pasta de dados de teste): **186 OK · 8 FALHA · 1 AVISO**, 0 erro de JavaScript; fase "RNC · Registrar defeito" sem falha. As 8 FALHAS são as mesmas do Setup já registradas (**SETUP-ROBO-01**), não relacionadas ao RNC.
- Script de bancada v0.2 contra Node-RED 4 real: **18 de 18**.
- Testes isolados com navegador (consultas do aviso, chave de idempotência no Registro e no botão, mensagem de erro e lista do Reparo).

## Limites (honestos)
- Revisão de **código** e testes **simulados**: não provam DSE real, PC BT2, rede nem operadores (continua valendo o roteiro de bancada).
- O módulo do medidor foi revisado por inteiro, mas o **restante do medidor** não.
- A revisão automática pode ter deixado de ver problemas; ela é um filtro a mais, não uma garantia.
