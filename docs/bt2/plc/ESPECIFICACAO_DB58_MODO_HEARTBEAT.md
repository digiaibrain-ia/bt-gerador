# DB de batimento (heartbeat) — card Modo, BT2 — v0.2 (22/10/2026) — DB58 APROVADO

> **v0.2 (22/10/2026, respostas do usuário):** `DB58 db058_BancoTeste2_Modo` **aprovado**, seguindo a regra da planilha; perda de Node-RED/HTML **só sinaliza** (o PLC não age; "no futuro vemos"); a regra nova "cada card tem seu DB e seu flow" vale aqui: o flow se chamará **"Modo (API)"** e **só será criado depois que o DB58 existir** no PLC. Registrado na aba `Blocos_novos` de `PLANO_NUMERACAO_BLOCOS_PLC_v3.xlsx`. As bolinhas do HTML v1.9.64 continuam **sem** batimento real (PLC = "o Node-RED consegue ler"); cinza vale para "não conectado" e "perdeu a conexão" e a ocorrência fica no triângulo do card (`COM-001`…, `PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md`).

> **Resumo.** Para a bolinha "PLC" do card Modo indicar que o **programa do PLC está rodando** (e não só que o Node-RED consegue ler a CPU), proponho usar o DB do card Modo do BT2 da planilha (`db058_BancoTeste2_Modo`, offset +8). Você já oferece um **pulso**; o DB define onde ele fica e dá ao PLC a visão do Node-RED e do HTML. **Nada disto está implementado** no Node-RED/HTML — só depois do seu OK.

## 1. Situação
**Confirmado** (`PLANO_NUMERACAO_BLOCOS_PLC_v2.xlsx`): aba BT_gabarito, offset 8 = "Modo (tipo, salvamento, gráfico, Node-RED manual/auto)" → `DB58` (BT2) / `DB108` (BT1), nome `db058_BancoTeste2_Modo`, status "a desenvolver"; FB do card = `FB58`; instância = `DB68`. Regra: DB de card acessado pelo Node-RED com `S7_Optimized_Access := FALSE`.
**Hoje no HTML v1.9.63:** bolinha PLC = "o flow v2.2 conseguiu ler o DB150/DB158 nos últimos 5 s" (GET devolve 503 se a leitura S7 está velha). Não detecta CPU em RUN com programa parado.
**Assumido por mim:** o DB58 fica na mesma CPU dos bancos (o DB52 e o DB53 do BT2 já estão lá). Se o pulso do PLC deve ficar em DB **comum** (faixa 1–49, "diagnóstico"), é só trocar o número (Q1).
**A desenvolver:** lógica do PLC (você), rota e leitura no Node-RED, bolinhas no HTML.

## 2. Layout proposto — `DB58 "db058_BancoTeste2_Modo"` (não otimizado)

| Endereço | Nome | Tipo | Quem escreve | Função |
|---|---|---|---|---|
| `DBX0.0` | `sb.hbPlc` | Bool | **PLC** | **Pulso** de 1 Hz (0,5 s TRUE / 0,5 s FALSE) — o que você disponibiliza |
| `DBX0.1` | `sb.nodeRedOk` | Bool | PLC | TRUE se `cb.hbNodeRed` mudou nos últimos 5 s |
| `DBX0.2` | `sb.htmlOk` | Bool | PLC | TRUE se `cb.hbHtml` mudou nos últimos 5 s |
| `DBX2.0` | `cb.hbNodeRed` | Bool | **Node-RED** | Pulso do Node-RED (inverte a cada 1 s) |
| `DBX2.1` | `cb.hbHtml` | Bool | Node-RED (a partir do HTML) | Inverte quando o HTML avisa que está vivo |
| `DBX4.0…` | — | — | — | reserva (modo manual/auto, tipo de ensaio etc. entram aqui depois) |

```scl
DATA_BLOCK "db058_BancoTeste2_Modo"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
   STRUCT
      sb : Struct
         hbPlc      : Bool;   // DBX0.0 pulso 1 Hz gerado pelo PLC
         nodeRedOk  : Bool;   // DBX0.1 PLC enxerga o Node-RED
         htmlOk     : Bool;   // DBX0.2 PLC enxerga o HTML
      END_STRUCT;
      cb : Struct
         hbNodeRed  : Bool;   // DBX2.0 pulso do Node-RED
         hbHtml     : Bool;   // DBX2.1 pulso do HTML (via Node-RED)
      END_STRUCT;
   END_STRUCT;
BEGIN
END_DATA_BLOCK
```
> Em DB não otimizado, cada `Struct` começa em **byte par**: `sb` ocupa o byte 0 (byte 1 de enchimento) e `cb` começa no byte 2 — mesmo comportamento do DB150 (`cb.ligar` em X0.0…X1.7 e `sb.ligada` em X2.0…X3.7). **Confira os offsets na tabela de endereços do TIA ao compilar** antes de o Node-RED usar `DBX0.0`/`DBX2.0`.

## 3. Regra de leitura (proposta, para o Node-RED/HTML)
- **PLC vivo** = `sb.hbPlc` **mudou** pelo menos uma vez nos últimos **3 s** (3 períodos). Não basta `TRUE`: tem que oscilar.
- **Node-RED**: o flow inverte `cb.hbNodeRed` a cada 1 s. **HTML**: a tela chama `POST /api/modo/hb` a cada 2 s e o flow inverte `cb.hbHtml` (rota nova, padrão `/api/...`; **ainda não existe**).
- Bolinhas: PLC ← `hbPlc` oscilando; Node-RED ← resposta do flow; HTML ← `sb.htmlOk` (o PLC "vê" a tela). Cinza = sem sinal; verde = ativo. Uma mesma regra vale no PLC (`nodeRedOk`/`htmlOk`) e na tela.

## 4. Esqueleto de referência da lógica do PLC (opcional — você disse que faz)
`FB58 fb058_Modo`, instância `DB68`. Não compilado.
```scl
FUNCTION_BLOCK "fb058_Modo"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1
   VAR_INPUT
      Clk1Hz    : Bool;   // memória de ciclo 1 Hz (configurar byte de clock memory na CPU) OU seu pulso
      HbNodeRed : Bool;   // db058.cb.hbNodeRed
      HbHtml    : Bool;   // db058.cb.hbHtml
      TempoSem  : Time := T#5S;
   END_VAR
   VAR_OUTPUT
      HbPlc     : Bool;   // -> db058.sb.hbPlc
      NodeRedOk : Bool;   // -> db058.sb.nodeRedOk
      HtmlOk    : Bool;   // -> db058.sb.htmlOk
   END_VAR
   VAR
      tNr, tHt  : TON_TIME;
      nrAnt, htAnt : Bool;
   END_VAR
BEGIN
   #HbPlc := #Clk1Hz;
   // temporizador só corre enquanto o pulso NÃO muda; qualquer mudança zera
   #tNr(IN := (#HbNodeRed = #nrAnt), PT := #TempoSem);
   #tHt(IN := (#HbHtml    = #htAnt), PT := #TempoSem);
   #nrAnt := #HbNodeRed;  #htAnt := #HbHtml;
   #NodeRedOk := NOT #tNr.Q;
   #HtmlOk    := NOT #tHt.Q;
END_FUNCTION_BLOCK
```
> O PLC **não toma nenhuma ação** quando o Node-RED/HTML some — só sinaliza. Se quiser ação (ex.: desligar chaves), é decisão de segurança sua (Q2).

## 5. Decisões e perguntas
- **Q1 — respondida (22/10): SIM** — `DB58 db058_BancoTeste2_Modo` (BT2); `DB108` só quando o BT1 existir.
- **Q2 — respondida (22/10): só sinalizar.** Ação do PLC fica para o futuro.
- **Q3 — aberta.** Seu pulso é 1 Hz (0,5 s/0,5 s)? Se for mais lento, ajusto o tempo de 3 s.
- **Q4 — adiada.** Rota `POST /api/modo/hb` + `GET /api/modo` no flow **"Modo (API)"** só depois que o DB58 existir no PLC (e você confirmar os endereços compilados — nota da seção 2).
- **Novo código reservado:** `COM-004` "Programa do PLC sem batimento" (aparece no triângulo do card Modo quando `sb.hbPlc` parar de oscilar). Não implementado.
