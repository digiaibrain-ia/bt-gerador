> **SUBSTITUÍDO em 22/10/2026** por `claude/CONTRATO_HTTP_HTML_NODERED_REGISTRO_ENSAIO.md` (flow `registro-ensaio-db53-api-v1.4.json`, rotas `/api/ensaio/*`, HTML v1.9.64). Este arquivo fica só como histórico do contrato original (rotas `/ensaio/*`, flow `selecao-ensaio-v1.3`, HTML v1.9.0). **Não use estas rotas** com o HTML v1.9.64.

# Contrato HTTP HTML ↔ Node-RED de seleção (como o HTML v1.9.0 implementa)

Autor: Reginaldo Lobo · 15/10/2026 · HTML: medidor_gerador_v1.9.0.html · mesma origem do HTML (sem CORS).

## Rotas
- GET  /ensaio/modo → {modo, bt, ts}. A tela só mostra como "efetivo" o que vier daqui. Normaliza "manual"/"auto" (aceita "automático"); qualquer outro valor (ex.: "simulado") é mostrado como veio.
- POST /ensaio/modo {modo:'manual'|'auto'} → {ok, modo}. Depois do POST o HTML faz GET /ensaio/modo; se o modo devolvido ≠ pedido, mostra erro.
- POST /ensaio/snap/preenchimento {campos:{serie, versao, data, fase, frequenciaHz, tensaoV, tempAmbienteC, potenciaKw, equipamentos:{motor|alternador|controlador|retificador|rat|bateria:{fabricante,modelo,serie}}}} → {ok}. Campo vazio = "" (o HTML guarda "-" para vazio, mas envia "").
- POST /ensaio/snap/etapa {etapa:<alvo %>, indice:<1..N>, valores:{cargaReal, potencia, tempMotor, Va, Vb, Vc, Ia, Ib, Ic, rpm, bateria, tEstab, cronometro}, confirmado:true} → {ok}. tEstab e cronometro em SEGUNDOS; grandeza sem leitura = null.
- GET  /ensaio/snap → {modo, preenchimento, etapas:[{etapa, indice, salva, valores}], lidoEm}. `salva` precisa ser true (estrito). `indice` é OBRIGATÓRIO na prática: a etapa 0 % aparece duas vezes (índices 1 e 6) e só `indice` desfaz a ambiguidade. Sem `indice` o HTML atribui por ordem e avisa.
- POST /ensaio/snap/limpar {confirmado:true} → {ok}.

## Regras do HTML
- POST só vale com HTTP 2xx e ok:true. Mesmo assim, "✓ salva" só aparece se o GET /ensaio/snap seguinte trouxer a etapa com salva:true E valores conferindo com o enviado (tolerância 0,5 % ou 0,05).
- Antes de cada gravação o HTML consulta GET /ensaio/modo; sem confirmação do modo, não grava.
- Timeouts: GET 4 s, POST 10 s. Gravações são serializadas (uma de cada vez); o poll (5 s) é descartado se uma gravação ocorreu no meio.
- confirmado:true = clique do operador (Salvar/Resalvar/Reenviar/FINALIZAR) ou salvamento automático que o próprio operador escolheu ("Salvar etapa: automático").
- Troca de modo bloqueada entre o START e a gravação do relatório.
- Novo ensaio (ZERAR, ou START com sobra no PLC): confirma com o operador e chama /ensaio/snap/limpar; se falhar, o operador decide se continua só na tela.
- DEMO usa o simulador local por padrão (nunca grava no PLC); botão "⚙ Servidor" troca a fonte e injeta falhas.
- Pendente no PLC/Node-RED: nº do DB seletor, unidade/formato exato dos campos de tempo, nome real do modo "simulado".
