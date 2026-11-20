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
- **A1 — K2/K3:** o texto diz "220V (K2 e K3) e 380V (K3)". Com 4 disjuntores no total (2 por banco) o mais provável é **220 V = K2 e 380 V = K3**. Confirmar. E a **440 V**, que o projeto já trata (220/380/440 V): qual disjuntor/arranjo seleciona 440 V?
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
7. **Integração com o setup por tensão:** a tensão de chaveamento usada pelo setup deve passar a refletir a **tensão efetivamente confirmada pelos disjuntores**, não só a informada pelo HTML.

## 5. Impacto no projeto (a decidir)
- HTML/Node-RED: estado de cada disjuntor e botões de seleção de tensão no card do banco (hoje a sinalização de chaveamento vem dos dados: `SINALIZACAO_CHAVEAMENTO_PELOS_DADOS_v1.10.123.md`).
- Hardware: 20 entradas digitais + 16 saídas (1 delas por disjuntor em 220 VCA) a mais nos módulos de I/O.

## 6. Perguntas em aberto
- **P1:** quais sinais estavam em vermelho no texto original? (Sugestão mínima: as 5 entradas, Carrega Mola, Fechamento, Abertura e Reset: ou seja, todos os 9 listados, já que Pronto e Trip são exigidos pela lógica acima.)
- **P2:** confirmar K2 = 220 V, K3 = 380 V (A1) e como se obtém 440 V.
- **P3:** existe contato livre de mola carregada ou é preciso relé de interface (A2)?
- **P4:** tem UVT/SHT2? Qual a tensão de CC, SHT1 e R1–R2 (A5–A7)?
- **P5:** os sinais entram em qual ET200/CLP e quem fornece a alimentação 220 VCA do motor?

---
**Fontes**: texto do projetista (20/11/2026); `Diagrama_ABWC.pdf`; `Descrição_Diagrama_ABWC.pdf`.
