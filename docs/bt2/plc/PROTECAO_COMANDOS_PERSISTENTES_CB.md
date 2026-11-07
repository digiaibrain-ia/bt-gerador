# Proteção contra comando de chave "que sobra" (cbLigar persistente) — BT2 — v0.1 (22/10/2026)

**Arquivos desta entrega:** `nodered/chaves-56-api-v2.3.json`, `nodered/chaves-400-api-v2.3.json`, `medidor_gerador_v1.9.65.html`.
**Não testado no PLC real.** Tudo que está marcado "testado" foi testado no emulador de Node-RED (`nrsim.js`) e no Chromium (Playwright), nunca contra S7 real.

> **Resumo.** O comando `cbLigar` ficava TRUE no DB150/DB158 depois de fechar o navegador e voltava a aparecer ao abrir a tela em outro computador. A solução tem camadas: (1) o flow v2.3 do Node-RED zera os `cbLigar` quando nenhuma tela consulta o PLC por 30 s; (2) o HTML 1.9.65 evita que o Chrome atrase o relógio de consulta com a aba escondida e avisa quando o Demo está ligado com as chaves no PLC real; (3) um FB no PLC (`fb102_WatchdogComandos`, **a desenvolver**) zera quando o Node-RED ou a rede caem. Não existe botão de zerar.

## 1. Confirmado / assumido / a desenvolver

**Confirmado (arquivos e relatos do usuário)**
- `cb.ligar[1..16]` está em `DB150,X0.0…X1.7` (BC56) e `DB158` (BC400, mesmo layout); `sb.ligada` em `X2.0…X3.7` (`REGISTRO_FLOW_CHAVES_BC56_DB150.md`, `PASSO_A_PASSO_PUT_GET_1515_ET200_v3.md`).
- O Node-RED escreve `CbLigar` direto em `POST /api/chaves/{56|400}/ligar` (flows `chaves-56-api-v2.2.json` / `chaves-400-api-v2.2.json`).
- O FB100 (`fb100_setupChaves_v0.2.scl`) tem `CbLigar : Array[1..16] of Bool` em `VAR_IN_OUT`, ligado a `<db do banco>.cb.ligar`; zera só quando `EnsaioAtivo` (fixo FALSE hoje).
- Relato do usuário (22/10): chaves ligadas no Demo no notebook, navegador fechado, no PC do BT2 as chaves apareciam apagadas **mas os `cb` estavam TRUE no DB**.

**Assumido/inferido por mim**
- A tela do BT2 apareceu apagada porque, com o `localStorage` vazio, ela abre com fonte "simulador" e nem lê o PLC. O `localStorage` guarda só configuração, não estado das chaves (conferido no código do HTML 1.9.64).
- Nada no sistema zerava o `cbLigar` ao fechar a tela.

**A desenvolver**
- `fb102_WatchdogComandos` + instâncias, flow "Modo (API)" com pulso do Node-RED no DB58, sinal de validade do DB52, camada do ET200 (Q5 do passo a passo).

## 2. Camadas

| # | Camada | O que faz | Tempo | Estado |
|---|---|---|---|---|
| 1 | Vigia no Node-RED v2.3 | Se nenhum GET/POST do HTML chegou ao flow do banco por `WD_HTML_S` s (padrão 30) **e** há `CbLigar` TRUE **e** há leitura recente do PLC, escreve FALSE nos 16 `CbLigar` pela fila das escritas, lê de volta e confere | 30 s | pronto (emulador) |
| 2 | HTML 1.9.65 | Relógio do poll em Web Worker (não sofre o "intensive throttling" do Chrome com aba escondida > 5 min); reserva por `setInterval`; aviso `CHV-003`; aviso `CHV-004` ao reabrir | n/a | pronto (emulador; Worker **não** verificado em Chrome real com aba escondida por >5 min) |
| 3 | `fb102_WatchdogComandos` no PLC | Zera `cb.ligar` se o pulso do Node-RED parar; zera na partida da CPU | ~10 s | **a desenvolver** |
| 4 | ET200 (`fb101`) | Derruba saídas se o contador de vida do 1515 parar (já descrito no passo a passo v3) | a definir | a desenvolver (Q5) |

### 2.1 Por que não zerar "ao fechar a página"
`pagehide`/`beforeunload`/`sendBeacon` não são garantidos (queda de energia, travamento, suspensão do PC, rede caída, processo morto). O vigia no servidor cobre todos esses casos com a mesma regra: "ninguém consultou". Para o operador o efeito é o mesmo: fechou o navegador → as chaves apagam em até ~30 s.

### 2.2 Regras exatas do vigia (código no JSON, nó `vigia: HTML sumiu -> ZERAR cbLigar`)
- Roda a cada 1 s (`inject`, 1ª execução 5 s após o Deploy).
- "HTML vivo" = qualquer `GET /api/chaves/{b}` ou qualquer POST que entre na fila. Os GET do Worker (1/s) mantêm vivo; **um segundo computador com a tela aberta também mantém vivo**.
- Contagem após Deploy/reinício do Node-RED: parte do instante do 1º ciclo do vigia (não zera instantaneamente ao reiniciar).
- Só age com leitura do PLC de menos de 2,5 s (sem PLC não há como escrever; ao voltar, zera em até ~5 s).
- Só age se a fila de escrita estiver livre; se falhar, tenta de novo a cada 5 s.
- Não mexe em `Habilitada`, Setup, `kWReal`, `Salvar`, `ChaveSel`.
- Registra no log do banco (`rota: ZERAR`), e o `GET` passa a devolver `wdZerou: {ts, qtd}` (campo novo, só informativo).
- Ajuste do tempo **sem editar JSON**: Node-RED → aba "Chaves BC… (API) v2.3" → Propriedades → variável de ambiente `WD_HTML_S`.

### 2.3 Resultados do teste no emulador (`t10.js`, `t11.js`, `t12.js`; limite de teste 3 s)
- GET a cada 0,5 s por 8 s: nada zerado. Sem GET: zerou em ~3,7 s os dois bancos, `wdZerou.qtd=5`, 1 linha `ZERAR ok` no log, nenhum erro nos nós, não repete.
- PLC offline por 6 s: nada escrito; ao voltar, zerou. `POST /ligar` normal continua 200 depois do corte.
- Navegador: Worker batendo 1/s sem duplicar; aba "escondida" por 8 s não cortou; fechar a página com 3 chaves → PLC zerado em 3,3 s; tela reaberta sem laranja e com `CHV-004`; sem Worker, o `setInterval` de reserva mantém o poll (6 GET em 5,2 s).
- Regressão t7/t8 (HTML 1.9.65 com flows v2.3): ok.

### 2.4 Limites conhecidos (honestos)
- Em um computador **com a tela aberta mas parada** (aba aberta, rede boa) o vigia não corta: ele mede "alguém consulta", não "alguém está olhando".
- Se o Node-RED cair com `CbLigar` TRUE, **nada zera até o FB102 existir**.
- Se o 1515 estiver em STOP, nada zera (nem lê).
- Corte de carga: o vigia derruba a carga do gerador de uma vez. Se isso for inaceitável no ensaio real, aumentar `WD_HTML_S` ou trocar por alarme (decisão do usuário).

## 3. O que resetar e o que não resetar

| DB | Zerar na perda de comunicação? | Motivo |
|---|---|---|
| DB150 / DB158 `cb.ligar` | **Sim** (camadas 1 e 3) | Comando persistente que energiza carga |
| DB150 / DB158 `setup.*`, `habilitada`, `kWReal` | Não | Calibração/permissão salvas; apagar destrói dados |
| DB53 (registro do ensaio) | Não (usuário concordou: sem risco) | É o registro; zerar perde o ensaio |
| DB52 (grandezas do DSE) | **Não zerar** | Zero parece leitura válida. Proposta: sinal de validade/idade. **Preciso do layout do DB52** (não tenho; não inventei endereço) |

## 4. `fb102_WatchdogComandos` — proposta (NÃO compilado)

**Pré-requisito:** o pulso do Node-RED no DB58 (`cb.hbNodeRed`, `DBX2.0`, `ESPECIFICACAO_DB58_MODO_HEARTBEAT.md`) só existirá quando o flow "Modo (API)" for criado (aguarda D3). **Enquanto isso, chamar o FB com `Habilita := FALSE`** — com `TRUE` e sem pulso, ele zera `cb.ligar` permanentemente.

Numeração (fórmula do plano: FB lógico `100+f`, instância `base+4+f`): FB102; instâncias DB156 (BC56) e DB164 (BC400). **Propostos, não aprovados.**

```scl
FUNCTION_BLOCK "fb102_WatchdogComandos"
TITLE = fb102_WatchdogComandos (FB102)
{ S7_Optimized_Access := 'TRUE' }
AUTHOR : 'Reginaldo Lobo'
VERSION : 0.1
////====================================
//// fb102_WatchdogComandos (FB102)
//// O QUE FAZ : zera o comando cb.ligar[1..16] de UM banco de carga quando o pulso do Node-RED PARA
////             (Node-RED fora do ar, PC desligado, rede PC<->PLC caida). Chamado 1x por banco.
//// POR QUE   : o comando cbLigar e escrito pelo Node-RED e fica TRUE no DB ate alguem zerar. Se o Node-RED
////             some, nada mais o derruba (ver claude/PROTECAO_COMANDOS_PERSISTENTES_CB.md).
//// NAO FAZ   : nao religa nada quando o pulso volta (a tela/operador precisa comandar de novo);
////             nao mexe em sb.*, setup.*, habilitada.
//// ORDEM NO OB : fb100_setupChaves -> fb102_WatchdogComandos -> fb101_ComEt200 (nada pode escrever
////             cb.ligar entre o FB102 e o FB101).
//// INSTANCIAS (propostas): DB156 = BC56 (db150_BC56_Chaves) ; DB164 = BC400 (db158_BC400_Chaves)
//// ATENCAO   : NAO compilado. Conferir no TIA: tipo TON_TIME como multi-instancia, passagem do array em VAR_IN_OUT.
////=====================================

   VAR_INPUT
      Habilita      : Bool := FALSE;   // FALSE ate existir o pulso (flow "Modo (API)"). TRUE sem pulso zera cb.ligar para sempre
      HbNodeRed     : Bool;            // db058_BancoTeste2_Modo.cb.hbNodeRed (Node-RED inverte a cada 1 s)
      TempoSem      : Time := T#10S;   // pulso parado por mais que isto = comunicacao perdida
      ZeraNaPartida : Bool := TRUE;    // zera cb.ligar no primeiro ciclo apos a CPU ir para RUN
   END_VAR

   VAR_OUTPUT
      ComPerdida    : Bool;            // TRUE enquanto o pulso estiver parado (usar para ocorrencia COM-00x)
      ZerouComando  : Bool;            // TRUE no ciclo em que este FB derrubou algum cb.ligar que estava TRUE
   END_VAR

   VAR_IN_OUT
      CbLigar       : Array[1..16] of Bool;   // <db do banco>.cb.ligar (mesmo array do VAR_IN_OUT do fb100)
   END_VAR

   VAR
      tSemPulso     : TON_TIME;        // conta enquanto o pulso NAO muda
      hbAnt         : Bool;            // pulso do ciclo anterior
      primeiroCiclo : Bool := TRUE;
   END_VAR

   VAR_TEMP
      k             : Int;
      tinhaTrue     : Bool;
   END_VAR

BEGIN
   #ZerouComando := FALSE;
   #tinhaTrue := FALSE;

   // 1) pulso parado = nenhuma mudanca desde o ciclo anterior (qualquer mudanca zera o temporizador)
   IF #primeiroCiclo THEN
      #hbAnt := #HbNodeRed;           // evita falso "mudou" no primeiro ciclo
   END_IF;
   #tSemPulso(IN := #Habilita AND (#HbNodeRed = #hbAnt), PT := #TempoSem);
   #hbAnt := #HbNodeRed;
   #ComPerdida := #tSemPulso.Q;

   // 2) condicao de zerar: comunicacao perdida OU partida da CPU
   IF #ComPerdida OR (#primeiroCiclo AND #ZeraNaPartida) THEN
      FOR #k := 1 TO 16 DO
         IF #CbLigar[#k] THEN
            #tinhaTrue := TRUE;
         END_IF;
         #CbLigar[#k] := FALSE;
      END_FOR;
      #ZerouComando := #tinhaTrue;
   END_IF;

   #primeiroCiclo := FALSE;
END_FUNCTION_BLOCK
```

Chamada de referência (nomes dos DBs a confirmar no TIA):
```scl
// OB (ordem): fb100_setupChaves(...) ; depois:
"fb102_WatchdogComandos_BC56"(Habilita := FALSE,   // trocar para TRUE só quando o pulso do Node-RED existir
                              HbNodeRed := "db058_BancoTeste2_Modo".cb.hbNodeRed,
                              CbLigar   := "db150_BC56_Chaves".cb.ligar);
"fb102_WatchdogComandos_BC400"(Habilita := FALSE,
                               HbNodeRed := "db058_BancoTeste2_Modo".cb.hbNodeRed,
                               CbLigar   := "db158_BC400_Chaves".cb.ligar);
// depois: fb101_ComEt200 (PUT/GET)
```

**Riscos / pontos a verificar ao compilar**
1. O DB58 ainda não existe; o endereço compilado de `cb.hbNodeRed` deve ser conferido (struct em byte par).
2. `TON_TIME` como multi-instância em FB otimizado: normal no TIA V19 (1515) e S7-1200 (1214FC); confirmar ao compilar.
3. Na CPU 1214FC (destino final) a passagem do array por `VAR_IN_OUT` exige que o array do DB seja o mesmo tipo `Array[1..16] of Bool` (é o que o FB100 já usa).
4. Retentividade de `primeiroCiclo`: se a instância for retentiva, o "zera na partida" pode não disparar em partida a quente. Deixar a instância não retentiva e **testar** (CPU STOP→RUN com `cb.ligar` TRUE).
5. O Node-RED escreve por comunicação assíncrona: com a comunicação saudável (pulso ok), uma escrita pode cair entre o FB102 e o FB101; não há conflito porque o FB102 só age quando o pulso parou.

## 5. Conexão S7 do TIA (resposta ao "como preenche a conexão")

**Confirmado no print de 22/10:** conexão `S7_Connection_1` da CPU 1515F-2 PN, parceiro "Não especificado", campos da sub-rede em rosa. **Inferência:** o rosa indica interface local sem sub-rede.

| Campo | Valor | Origem |
|---|---|---|
| Interface local | a que tem **172.17.209.135** e está ligada à rede PN/IE (não a de fábrica 192.168.0.1 sem sub-rede) | usuário (IP do 1515) + inferência |
| Parceiro | Não especificado | print |
| IP do parceiro | 172.17.209.158 | usuário (ET200) |
| Conexão ativa | ☑ "Estabelecer conexão ativa" (1515 = cliente) | arquitetura do passo a passo v3 |
| TSAP do parceiro | rack/slot do "Gerador_BC015": **ler no hardware dele**; referência a confirmar: S7-300 rack 0 slot 2 → `03.02` | **a confirmar** |
| TSAP local | o que o TIA propõe | — |
| ID local (hex) | anotar após OK; vai em `ID_Conexao` do `fb101` | passo a passo v3 §5.1 |
| Verificação | Diagnóstico de conexão online = **Estabelecida** | passo a passo v3 §5.1 |

No ET200 (servidor): permissão de PUT/GET (a confirmar para o firmware da IM 151-8) e DB do ET200 sem otimização. O 1515 vai usar **uma só conexão** para BC56 e BC400 (mesmo ET200).

## 6. Plano de teste no PLC real (amanhã; nesta ordem; com o `fb101`/PUT ainda **desligado**)

1. Importar os 2 flows v2.3 (apagar antes as abas v2.2) e abrir o HTML 1.9.65. Chip do PLC = "OK" (se disser "SEM vigia", ainda é o flow antigo).
2. Ligar 2 chaves de cada banco pela tela. Ver `cb.ligar` TRUE no TIA. **Fechar o navegador**; cronometrar: em ~30 s os `cb.ligar` do DB150 e DB158 vão a FALSE. No log do banco aparece `ZERAR`.
3. Reabrir a tela (outro computador, se possível): nenhuma chave laranja; triângulo `CHV-004` no card Banco de Carga.
4. Deixar a aba **escondida/minimizada por mais de 6 min** com chaves ligadas: **não pode** cortar. (Se cortar, o Worker não resolveu no seu Chrome: avisar.)
5. Reiniciar o Node-RED com `cb` TRUE e sem tela aberta: ~35 s depois zera.
6. Tirar o cabo do PLC por ~40 s com `cb` TRUE: nada acontece (sem leitura); ao voltar, zera em poucos segundos.
7. Demo + PLC (botão Demo › ① + "Usar o PLC real"): aparece `CHV-003` (v1.9.66; em Demo local não aparece e nada vai ao PLC).

## 7. Decisões pendentes
- **D1** limite do vigia (30 s) ok?
- **D2** aprovar FB102, DB156, DB164 (registrados como "proposto" em `Blocos_novos` v4).
- **D3** criar o flow "Modo (API)" com o pulso do Node-RED no DB58 (muda o combinado "PLC só sinaliza" do `ESPECIFICACAO_DB58_MODO_HEARTBEAT.md` v0.2).
- **D4** layout do DB52 para o sinal de validade.
- **D5** corte de carga do vigia durante ensaio real: manter, ou só alarme?

## Glossário
- **Vigia (watchdog):** rotina que age quando algo deixa de dar sinal de vida.
- **cbLigar / `cb.ligar`:** comando da chave (DB150 BC56, DB158 BC400); laranja na tela.
- **ZERAR:** job interno do flow v2.3 que escreve FALSE nos 16 `CbLigar`, lê e confere.
- **WD_HTML_S:** variável de ambiente (segundos) com o tempo do vigia.
- **Web Worker:** processo em segundo plano do navegador; sustenta o relógio do poll com a aba escondida.
- **Intensive throttling:** limite do Chrome que reduz timers de aba escondida há mais de ~5 min.
- **Batimento (heartbeat):** pulso que inverte periodicamente para provar vida.
- **TSAP:** endereço de serviço da conexão S7 (rack/slot).
- **ID local:** número da conexão S7 no TIA usado em PUT/GET.
