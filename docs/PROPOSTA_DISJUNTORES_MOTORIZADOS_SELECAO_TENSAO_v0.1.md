# Disjuntores motorizados da seleção de tensão (BC56 e BC400) · v0.1 · 20/11/2026

**Situação: RASCUNHO de análise. Nada foi gerado em PLC/Node-RED/HTML e nada foi testado.**
Fonte: texto do projetista elétrico + PDFs `Descrição Diagrama ABWC` e `Diagrama ABWC` (disjuntor aberto ABWC, versão extraível). Os sinais "em vermelho" (os que o projetista considera necessários) **perderam a cor na cópia do texto**; ver pergunta P1.

## 1. O que o projeto prevê
- Painel de seleção de tensões com **4 disjuntores motorizados** (2 por banco, BC56 e BC400), referência K2/K3 do esquema da MWM.
- Por disjuntor: 5 sinais para o CLP (entradas) e 4 acionamentos (saídas).
- Total: **20 entradas digitais** e **16 saídas** (1 de potência 220 VCA + 3 contatos secos por disjuntor).

## 2. Sinais (conferidos contra o diagrama ABWC)
| Tipo | Sinal | Terminais | Observação da conferência |
|---|---|---|---|
| Entrada | Mola carregada | U3–U2 | Compartilha o terminal U2 com o circuito do motor (ver A2) |
| Entrada | Ligado (fechado) | 11–14 | Contato auxiliar "a" (Axc) |
| Entrada | Desligado (aberto) | 41–42 | Contato auxiliar "b" (Axc) |
| Entrada | Em trip | 81–82 | "Alarm trip 1" (existe também 181–182, trip 2) |
| Entrada | Pronto p/ ligar | 251–252 | Pelo descritivo: **disjuntor desligado + mola carregada** |
| Saída | Carrega mola (M) | U1–U2 | 220 VCA, potência: usar relé/contator de interposição |
| Saída | Bobina de fechamento (CC) | A1–A2 | Contato seco do CLP chaveando a alimentação da bobina |
| Saída | Abertura primária (SHT1) | C1–C2 | Idem |
| Saída | Reset de alarme | R11–R22 | Contato seco (pulso) |

## 3. Pontos a corrigir/confirmar no texto do projetista
- **A1 — K2/K3:** o texto diz "220V (K2 e K3) e 380V (K3)". Com 4 disjuntores no total (2 por banco) o mais provável é **220 V = K2 e 380 V = K3**. Confirmar. E a **440 V**, que o projeto já trata (`TensaoSel` 1..3, FB100 v0.3): qual disjuntor/arranjo seleciona 440 V?
- **A2 — U2 compartilhado:** no diagrama, a lâmpada "Charged" liga U3 ao barramento U1 (alimentação do motor), e o motor usa U2. Ou seja, o "sinal" de mola carregada **não é contato seco isolado**: pode haver 220 VCA entre U3 e U2. Ligar direto numa entrada do CLP pode danificar o cartão. Pedir à MWM/fabricante se existe contato livre, ou usar relé de interface.
- **A3 — terminologia:** "Ligado = disjuntor armado" está trocado. **Armado = mola carregada; Ligado = contatos principais fechados.** Padronizar no projeto (sugestão: `sb.molaCarregada`, `sb.ligado`, `sb.desligado`).
- **A4 — "Pronto":** o texto diz "mola carregada + sem trip", mas o descritivo do ABWC diz "disjuntor desligado + mola carregada" (não inclui trip). O CLP não deve assumir que Pronto cobre trip: exigir **Pronto E NÃO trip** na lógica.
- **A5 — Alimentação de controle R1–R2 (não citada):** o relé de proteção (trip relay) precisa de alimentação em R1–R2. Sem ela a proteção de sobrecarga/curto não atua. Incluir no projeto (e, se possível, monitorar a presença).
- **A6 — UVT (D1–D2) e SHT2 (C11–C12):** confirmar se o disjuntor comprado tem bobina de mínima tensão (UVT). Se tiver, ela precisa estar energizada para o disjuntor fechar.
- **A7 — Tensão das bobinas CC/SHT1/motor:** conferir na plaqueta (VCA ou VCC, valor). O texto só informa o motor (220 VCA).
- **A8 — Origem do trip (opcional):** o diagrama traz contatos 524 (L, sobrecarga), 534 (SI, curto) e 544 (G, terra) em relação ao comum 513. Útil para diagnóstico/ocorrências, mas não são necessários para operar.

## 4. Proposta de lógica no PLC (a validar)
1. **Intertravamento entre tensões do mesmo banco:** nunca dois disjuntores de tensão diferentes fechados ao mesmo tempo. Só comandar fechar se o outro estiver confirmado **Desligado (41–42)** e Pronto.
2. **Sequência de seleção:** abrir o atual → aguardar Desligado → (re)carregar mola se preciso → fechar o novo → confirmar Ligado. Cada etapa com **timeout** que gera falha (padrão `PADRAO_OCORRENCIAS_ALERTAS_FALHAS_v1.1.md`).
3. **Comandos em pulso** (CC e SHT1), com duração mínima/máxima e sem permanecer ligados (mesma filosofia de `PROTECAO_COMANDOS_PERSISTENTES_CB.md`). CC e SHT1 nunca juntos.
4. **Trip:** com trip ativo, bloquear CC, abrir/manter aberto e exigir causa tratada + pulso de Reset. **Não resetar automaticamente.**
5. **Banco só liga (`ligarBanco`) com tensão selecionada confirmada** por Ligado=1 e Desligado=0 do disjuntor correspondente (coerência 11–14 × 41–42; combinação 0/0 ou 1/1 = falha de sinalização).
6. **Perda de comunicação/seletora em Manual:** abrir o que for seguro conforme a regra do FB101 (REGION 0), sem religar sozinho.
7. **Integração com setup/DB por tensão:** `TensaoSel` do FB100 (DB3002/DB3102, setup por tensão) deve passar a refletir a **tensão efetivamente confirmada pelos disjuntores**, não só a informada pelo HTML.

## 5. Impacto no projeto (a decidir, nada alterado)
- **Numeração vigente: `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx`** (branch `ccr-bt2-pacote-v1.21`; em divergência vale o Excel). Cada banco tem faixa de 100 DBs: BC56 = base 3000, BC400 = base 3100 (BC59,5 = 3200, BC550 = 3300). Offsets já usados: +0 Chaves, +2 Setup por tensão, +4 inst. FB100, +5 inst. FB101, +6 inst. do bloco do banco no 1200, +7 telegrama PEDIDO/RESPOSTA no 1200. **Os DB150/DB158 (e DB152/DB160) citados antes são os números antigos** (hoje DB3000/DB3100 e DB3002/DB3102).
- Os sinais dos disjuntores precisariam de espaço novo no banco (no DB de chaves ou em DB próprio) e, se vierem do 1200, de bytes a mais no telegrama (hoje 10 + 14 B para até 16 chaves, layout na aba `Telegrama_1200`). **Nenhum número foi escolhido:** os offsets +1, +3 e a partir de +8 não estão ocupados no plano, mas a decisão é sua. Próximo FB livre da 1500: 105 (FB100–104 já usados); números de FB do 1200 ainda a definir no TIA (pendência 14).
- **O plano trata "tensão de chaveamento" como fora do escopo agora** (Pendências, item 11, decidido em 09/11/2026), junto com contator geral e ventilador. Este documento é, portanto, para quando esse item entrar no escopo.
- HTML/Node-RED: estado de cada disjuntor e botões de seleção de tensão no card do banco (hoje a sinalização de chaveamento vem dos dados: `SINALIZACAO_CHAVEAMENTO_PELOS_DADOS_v1.10.123.md`).
- Hardware: 20 DI + 16 saídas (1 por disjuntor para 220 VCA) a mais nos ET200.

## 6. Perguntas em aberto
- **P1:** quais sinais estavam em vermelho no texto original? (Sugestão mínima: as 5 entradas, Carrega Mola, Fechamento, Abertura e Reset: ou seja, todos os 9 listados, já que Pronto e Trip são exigidos pela lógica acima.)
- **P2:** confirmar K2 = 220 V, K3 = 380 V (A1) e como se obtém 440 V.
- **P3:** existe contato livre de mola carregada ou é preciso relé de interface (A2)?
- **P4:** tem UVT/SHT2? Qual a tensão de CC, SHT1 e R1–R2 (A5–A7)?
- **P5:** os sinais entram em qual ET200/CLP e quem fornece a alimentação 220 VCA do motor?
- **P6:** quando a tensão de chaveamento entra no escopo, em qual offset/DB e em qual PLC (1500, 1200 ou ET200) ficam os sinais dos disjuntores? (nada será gerado por enquanto).

---
**Fontes**: texto do projetista (20/11/2026); `Diagrama_ABWC.pdf`; `Descrição_Diagrama_ABWC.pdf`; `PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx` (abas Regras, Mapa_BT2, Pendencias, Telegrama_1200); `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md`; `PROTECAO_COMANDOS_PERSISTENTES_CB.md`; `fb100_setupChaves_v0.3.scl`.
