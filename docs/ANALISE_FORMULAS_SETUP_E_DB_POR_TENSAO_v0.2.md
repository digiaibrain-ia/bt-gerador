# Setup das chaves por chaveamento — implementação (v0.2 · 25/10/2026)

Resumo: o Setup de cada chave passa a ser guardado **por chaveamento do banco (220/380/440 V)**, que o operador informa no HTML (HTML → Node-RED → DB152/DB160 → FB100 v0.3). O R teórico foi removido (tensão de referência V_ref desconhecida, a descobrir na prática). Nada foi testado no PLC real nem compilado no TIA.

## (a) Confirmado (disse o usuário)
- Cada banco tem **13 chaves** identificadas em kW; chaveamento 220/380/440 V; **a resistência é a mesma nas 3 tensões** (logo kW real muda com a tensão).
- Chaveamento informado **pelo HTML/Node-RED**.
- **V_ref (tensão em que a identificação 3/4/5 kW… foi dada) é desconhecida — "vamos descobrir na prática quando usar o SETUP".**
- Com Setup aberto, bloquear a tela principal; diálogo maior; o visual do diálogo será refeito depois, a pedido dele.
- Do projeto (arquivos lidos): DB150/DB158 não otimizados com `cbBanco.ligar` X460.0, `seletoraAuto` X462.0, `comEt200Ok` X462.1; DB152/DB160 livres como "reserva +2" (`PLANO_NUMERACAO_BLOCOS_PLC.md`).

## (b) Assumido / inferido (conferir)
- Offsets do DB152/DB160 v0.2 (tabela no cabeçalho do `.db`) e o número dos DB (152/160).
- `selV.tensaoSel` no fim do DB (DBW1356), 0 = não informado, 1/2/3 = 220/380/440.
- Com chaveamento não informado, o espelho no DB150/DB158 fica **sem Setup** (SetupOk = FALSE, kW real 0) — nunca usa kW de outra tensão. `RteoricoOhm` fica 0.0 = "não calculado".
- "Limpar kW reais" apaga só o chaveamento ativo.
- R medido = V_ff² ÷ (kW real × 1000) = ohm equivalente em estrela por fase (fórmula do HTML/FB100 v0.2, mantida).
- V ref. estimada = V medida × √(kW placa ÷ kW real): só vale se a resistência estiver correta e a placa for resistiva pura.
- Retentividade do DB152/DB160 (a verificar no TIA); o DB150/DB158 está NON_RETAIN (não alterado).

## (c) A desenvolver / pendente
- Compilar no TIA: DB152/DB160 v0.2, FB100 v0.3 (6 novos VAR_IN_OUT 2D) e a chamada `exemplo_chamada_fb100_v0.3.scl`; registrar DB152/DB160 na aba "Blocos_novos".
- Node-RED: ler `setupData`/`baseKw` por tensão; teste real do 2º endpoint S7.
- Descobrir V_ref na prática: com Setup nas 3 tensões, ver se "V ref. est." fica igual entre chaves/tensões e a "Variação de R" perto de 0 %; só então definir se R teórico volta.
- Ligar o chaveamento ao campo "Tensão" de Dados do ensaio (proposta, não feita); visual completo do Setup (pedido futuro); `stLimpa` (limpar UMA chave) continua só local (já era assim).

## Ordem de implantação
1) DB152/DB160 v0.2 e FB100 v0.3 no PLC (DB novo; DB150/158 não mudam; se a v0.1 já foi baixada, a v0.2 reinicializa o DB — ainda vazio). 2) Flow v2.5 (apagar a aba v2.4 antes do Deploy). 3) HTML v1.9.78.
## Como testar
- Demo local: Setup → escolher 380 V → ligar gerador (Demo) → chave → Salvar → mudar para 220 V (tabela muda) → "Limpar kW reais" só limpa o ativo. (Feito em Playwright.)
- PLC: POST /tensao e conferir `TensaoSel` no DB152 online; selecionar, salvar e ver o espelho no DB150; repetir em outra tensão; reiniciar a CPU e conferir a retentividade.

## Glossário
- **Chaveamento**: posição física do banco (220/380/440 V). **V_ref**: tensão em que o kW de identificação vale. **Espelho**: cópia do chaveamento ativo nos arrays 1D do DB150/DB158. **kW real**: kW com a chave − kW sem carga. **Estrela por fase**: R = V_ff²/P.
