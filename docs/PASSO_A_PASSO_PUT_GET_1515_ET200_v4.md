# Troca de sinais entre CLPs — 1515 ⇄ ET200 (PUT/GET) — v4 (24/10/2026)

**v4 (24/10/2026) — só renumeração dos DBs do ET200:** DB10→**DB38** (`ComBC56`) e DB11→**DB39** (`ComBC400`), conforme você já trocou no ET200. Conteúdo, offsets e lógica da v3 **não mudaram**.
> **(b) Pendente de confirmação:** em 24/10 o usuário relatou possível inversão canal × banco físico (`/api/chaves/56` → DB150 → DB155; `/api/chaves/400` → DB158 → DB163). Esta v4 mantém o mapeamento **por nome** (BC56→DB38, BC400→DB39). Se o cruzamento estiver no literal `P#DBxx` do FB101 (e não no FC4/fiação), o ajuste é trocar os literais na instância correspondente — **a confirmar antes de qualquer alteração em SCL**.

> **Atualização 24/10/2026 noite:** o telegrama passou a 6+6 bytes (opção A) com `ligarBanco` (DBX4.0) e `seletoraAuto` (DBX10.0); GET agora começa em DBX6.0. Layout vigente em `plc_bancos_cargas/db38_db39_ComEt200_v0.2.scl` e `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md`. As seções abaixo (4 + 4 bytes) ficam como histórico.

---
# (histórico v3, 22/10/2026)

**Substitui** a v2 e `claude/PASSO_A_PASSO_PUT_1515_ET200SP_BC56.md` (v1, com erros — ver seção 1).
**O que a v3 muda (respostas do usuário, 22/10):** (1) o ET200 é **IM 151-8 PN/DP CPU** (família ET 200**S**, CPU tipo S7-300; programa próprio "Gerador_BC015", IP 172.17.209.158); (2) o **BC400 usa o mesmo ET200**; (3) 1515 = **6ES7 515-2FN03-0AB0, firmware V3.1, TIA Portal V19**; (4) **aprovados** FB101, DB155, DB163 (e DB58 para o batimento), seguindo a regra da planilha — nomes ajustados para o padrão `fb###_NomePascalCase` (`fb101_ComEt200`, `db155_BC56_ComEt200`, `db163_BC400_ComEt200`); (5) todos os blocos novos agora são registrados na aba **`Blocos_novos`** de `PLANO_NUMERACAO_BLOCOS_PLC_v3.xlsx`.
**Escopo:** comando das contatoras (1515 → ET200) e feedback das contatoras (ET200 → 1515), BC56 e BC400.
**Não altera:** Node-RED, HTML, DB150/DB158 (endereços lidos de `nodered/chaves-56-api-v2.2.json`).

> **Resumo.** O 1515 (172.17.209.135) é o cliente: a cada ~200 ms ele envia por **PUT** o comando `cb.ligar[1..16]` + um contador de vida ao ET200 (172.17.209.158) e lê por **GET** o feedback `sb.ligada[1..16]` + o contador de vida do ET200. Se o contador de vida parar, os dois lados vão para estado seguro (ET200 derruba as saídas; 1515 zera `sb.ligada`). O código SCL abaixo **não foi compilado** (não tenho TIA aqui) — a seção 7 lista onde o TIA pode reclamar.

---

## 1. O que estava errado na v1 (e por quê não funcionaria)

| # | v1 dizia | Problema |
|---|---|---|
| 1 | `TCON_IP` + `T_SEND` | São blocos de comunicação aberta/CP, não de PUT/GET S7. A instrução certa no TIA é **PUT** (e **GET**), com ID de uma conexão **S7**. |
| 2 | Destino `P#"DB38".Ligada[1] BYTE 2` | Endereço **remoto** não aceita nome simbólico: tem que ser absoluto, `P#DB38.DBX0.0 BYTE 4`. |
| 3 | Parâmetros `BYTE :=`, `ID := P#...`, `Len :=` | Não existem em PUT. Os reais: `REQ, ID, ADDR_1, SD_1, DONE, ERROR, STATUS`. |
| 4 | PUT "a cada ciclo" | PUT dispara por **borda de REQ** e leva vários ciclos; sem controlar DONE/ERROR trava ou estoura recursos. |
| 5 | Só havia o comando (1515 → ET200) | Faltava o retorno: `sb.ligada` precisa vir do ET200 (GET). Hoje é o loopback do FC100 (bancada). |
| 6 | Sem vigilância de comunicação | Cabo solto = ET200 mantém contatora ligada com o último comando. Inaceitável em banco de carga. |
| 7 | "Rack/Slot 0/1 padrão" | Depende da família da CPU do ET200 (ver pergunta Q1). |
| 8 | "ET200SP" = "IM151-8 PN/DP CPU" | O nome IM151-8 PN/DP CPU é de ET 200**S** (CPU tipo S7-300), não ET 200SP. Muda TSAP/proteção. **Confirmar** o código do artigo. |

---

## 2. Situação do projeto (regra 4)

**(a) Confirmado nos arquivos**
- DB150: `cb.ligar[1..16]` = `DBX0.0…DBX1.7`; `sb.ligada[1..16]` = `DBX2.0…DBX3.7` (flow `chaves-56-api-v2.2.json`, endpoint "PLC da Carga" 172.17.209.135, rack 0 slot 1). BC400 = mesmo layout no DB158 (flow `chaves-400-api-v2.2.json`).
- Arrays declarados `Array[1..16] of Bool`; `SbLigada` "escrito pelo mapeamento de I/O" (`fb100_setupChaves_v0.2.scl`).
- Instância do FB100: DB154 (BC56) / DB162 (BC400); FB lógica do banco = 100 + f (`PLANO_NUMERACAO_BLOCOS_PLC_v2.xlsx`, aba Regras).
- ET200 em 172.17.209.158 (v1 do passo a passo) e **modelo = IM 151-8 PN/DP CPU**, com o programa "Gerador_BC015" (resposta do usuário, 22/10). O **BC400 usa o mesmo ET200**.
- 1515: artigo 6ES7 515-2FN03-0AB0, firmware V3.1, TIA Portal V19 (usuário, 22/10). IP 172.17.209.135 responde a ping (0–1 ms); 172.17.209.158 responde (2–6 ms, TTL 29 — o TTL baixo **sugere** (inferência minha) que o caminho até o ET200 passa por outro equipamento de rede; não afeta o PUT/GET, mas vale lembrar ao diagnosticar).
- **Aprovados em 22/10 (usuário):** `FB101`, `DB155`, `DB163` para o PUT/GET (e `DB58` para o batimento).

**(b) Assumido / proposto por mim (precisa do seu OK)**
- **f = 1** → `fb101_ComEt200`, instâncias **DB155** (BC56) e **DB163** (BC400) — fórmula `Base_banco + 4 + f` da planilha. **Aprovado pelo usuário em 22/10** (os **nomes** simbólicos continuam sugestão minha).
- Telegrama de 4 + 4 bytes (seção 3) e tempo de vida de 3 s.
- DB do ET200 = **DB38 `ComBC56`** e **DB39 `ComBC400`** (renomeados pelo usuário a partir de DB38/DB39; prints de 23/10/2026 e `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md`). O BC400 usa o mesmo ET200 (confirmado 22/10). Número de DB é local ao programa "Gerador_BC015" (diferente do "DB38 seletor comum" do plano do 1515).

**(c) A desenvolver**
- Lógica de saída/entrada no ET200 (você faz) — contrato na seção 4.
- Expor `comOk` ao Node-RED (DB151 "status do banco", ainda "a definir" no plano) → flow v2.3. **Não feito agora.**
- Generalizar `fb101` para os 2 bancos com endereço remoto parametrizado (seção 8).

---

## 3. Telegrama (idêntico nos dois lados)

| Sentido | Instrução | Local (1515) | Remoto (ET200, DB38) | Conteúdo |
|---|---|---|---|---|
| 1515 → ET200 | **PUT** | `tx` (4 bytes, instância DB155) | `DBB0…DBB3` | `DBX0.0…DBX1.7` = comando chaves 1…16 · `DBW2` = vida do 1515 |
| ET200 → 1515 | **GET** | `rx` (4 bytes, instância DB155) | `DBB4…DBB7` | `DBX4.0…DBX5.7` = feedback chaves 1…16 · `DBW6` = vida do ET200 |

Bit n−1 ↔ chave n (chave 1 = `X0.0`, chave 9 = `X1.0`), igual ao DB150. Contadores `Int`, 0…32767, voltam a 0.

---

## 4. Lado ET200 (172.17.209.158)

### 4.1 DB38 `ComBC56` (padrão, **não otimizado**)

```scl
DATA_BLOCK "ComBC56"
{ S7_Optimized_Access := 'FALSE' }    // só se a CPU tiver essa propriedade (família 1500/SP). S7-300/ET200S: DB já é padrão.
VERSION : 0.1
   STRUCT
      cmd   : Array[1..16] of Bool;   // DBX0.0..1.7  <- PUT do 1515 (comando das contatoras)
      vida1515 : Int;                 // DBW2         <- PUT do 1515 (contador de vida)
      fb    : Array[1..16] of Bool;   // DBX4.0..5.7  -> GET do 1515 (feedback: contato auxiliar de cada contatora)
      vidaET : Int;                   // DBW6         -> GET do 1515 (contador de vida do ET200)
   END_STRUCT;
BEGIN
END_DATA_BLOCK
```

### 4.2 Contrato que a sua lógica do ET200 precisa cumprir (segurança)
1. `vidaET := vidaET + 1` a cada 100 ms (OB cíclico), sempre.
2. Se `vida1515` **não mudar por 2 s** → **todas as saídas das contatoras = FALSE** e só voltam quando a vida voltar a mudar **e** `cmd[n]` for re-comandado (sugestão: exigir `cmd[n]` ir a FALSE e TRUE de novo).
3. Saída da contatora n = `cmd[n]` **E** vida ok **E** intertravamentos locais (emergência etc.).
4. `fb[n]` = contato auxiliar **real** da contatora n (entrada), nunca cópia de `cmd[n]`.

> O tempo do ET200 (2 s) é menor que o do 1515 (3 s) de propósito: o ET200 derruba antes de o 1515 declarar `sb = FALSE`. Assim "FALSE por perda de comunicação" é verdade física.

### 4.3 Permissão de PUT/GET (o ET200 é o **servidor**)
- Se a CPU for **família 1500/SP/1200**: Propriedades da CPU → *Proteção e segurança* → *Mecanismos de conexão* → ☑ **"Permitir acesso com comunicação PUT/GET de parceiro remoto"**; DB38 com otimização desligada.
- **É a sua CPU (IM151-8 PN/DP CPU, ET 200S, tipo S7-300):** o DB é padrão (não otimizado) por natureza. **Não verifiquei** se a sua versão de firmware tem o checkbox de PUT/GET: abra as propriedades da CPU no projeto "Gerador_BC015" e confira **nível de proteção / senha / permissão de acesso por PUT/GET**; se o nível bloquear acesso de parceiro remoto, o PUT/GET do 1515 retorna erro (`80xx`).
- **Não** precisa criar conexão no ET200 para um parceiro "não especificado".

---

## 5. Lado 1515 (172.17.209.135)

### 5.1 Conexão S7 (uma só para os dois bancos, se o parceiro for o mesmo ET200)
1. TIA Portal → projeto do 1515 → **Dispositivos e redes** → aba **Conexões** → tipo **Conexão S7**.
2. Clique direito na CPU 1515 → **Adicionar nova conexão** → parceiro **Não especificado** se o "Gerador_BC015" for **outro projeto**; se estiver **no mesmo projeto TIA** do 1515 (pergunta nova, seção 9), escolha a CPU do ET200 como parceiro (a conexão fica configurada nos dois lados).
3. Propriedades da conexão → Geral/Endereços: **IP do parceiro = 172.17.209.158**; **TSAP/rack-slot do parceiro: ler na configuração de hardware do ET200** (referência: CPU 1200/1500 = rack 0 slot 1 → TSAP `03.01`; CPU tipo S7-300, como a IM151-8, costuma ser rack 0 slot 2 → `03.02` — **confirme na configuração de hardware do "Gerador_BC015"**). **Não adivinhe**: se o TSAP estiver errado a conexão nunca estabelece (Q1).
4. Anote o **ID local** (hex) da conexão, ex. `W#16#100` → entra em `ID_Conexao`.
5. Compile e carregue. Em *Diagnóstico de conexão* (online) a conexão deve ficar **Estabelecida**.

### 5.2 DBs e blocos (numeração conforme a planilha)
| Item | Nº / nome | Observação |
|---|---|---|
| FB | `fb101_ComEt200` (FB101, f=1) | código abaixo |
| Instância BC56 | `db155_BC56_ComEt200` (DB155) | **não otimizada** (o FB declara `S7_Optimized_Access := 'FALSE'`) — é também a área de troca `tx/rx` |
| Instância BC400 | `db163_BC400_ComEt200` (DB163) | depois do BC56 validado |

### 5.3 `fb101_ComEt200` (v0.1 — não compilado)

```scl
FUNCTION_BLOCK "fb101_ComEt200"
TITLE = fb101_ComEt200 (FB101, f=1)
{ S7_Optimized_Access := 'FALSE' }   // instância = área de troca tx/rx do PUT/GET (precisa ser acessível por endereço absoluto)
VERSION : 0.1
////====================================
//// fb101_ComEt200 (FB101)
//// O QUE FAZ : troca de sinais 1515 <-> ET200 por S7 PUT/GET. PUT: comando CbLigar[1..16] + vida.
////             GET: feedback SbLigada[1..16] + vida do ET200. Sequencial (PUT, GET, pausa) para
////             usar um recurso de conexão por vez.
//// COMO OPERA: chamar 1x por ciclo no OB cíclico, ANTES do FB100 (para o FB100 ler SbLigada atual).
//// FALHA     : sem vida nova do ET200 por TempoVida -> ComOk=FALSE e SbLigada[] zerado.
//// ATENCAO   : endereço remoto é LITERAL (DB38 = BC56). BC400 => ver seção 8 do .md.
////=====================================
   VAR_INPUT
      Hab        : Bool;                 // TRUE = comunica. FALSE = para de enviar e zera feedback
      ID_Conexao : Word;                 // ID local da conexão S7 (seção 5.1, item 4). Ex.: W#16#100
      TempoVida  : Time := T#3S;         // sem vida nova do ET200 por este tempo = comunicação perdida
      Pausa      : Time := T#100MS;      // pausa entre ciclos PUT/GET (alivia a CPU e a rede)
   END_VAR

   VAR_OUTPUT
      ComOk      : Bool;                 // TRUE = ET200 respondendo e vida mudando
      StatusPut  : Word;                 // último STATUS do PUT (0 = ok)
      StatusGet  : Word;                 // último STATUS do GET (0 = ok)
      FalhaPut   : Bool;                 // último PUT terminou com ERROR
      FalhaGet   : Bool;                 // último GET terminou com ERROR
   END_VAR

   VAR_IN_OUT
      CbLigar    : Array[1..16] of Bool; // <db do banco>.cb.ligar  - este FB só LÊ
      SbLigada   : Array[1..16] of Bool; // <db do banco>.sb.ligada - este FB ESCREVE (substitui o loopback do FC100)
   END_VAR

   VAR
      statPut    : PUT;                  // multi-instância do PUT (ver seção 7, item 1)
      statGet    : GET;                  // multi-instância do GET
      tx         : Struct                // 1515 -> ET200  (4 bytes)  = DBB0..3 do DB38 remoto
                      cmd  : Array[1..16] of Bool;
                      vida : Int;
                   END_STRUCT;
      rx         : Struct                // ET200 -> 1515  (4 bytes)  = DBB4..7 do DB38 remoto
                      fb   : Array[1..16] of Bool;
                      vida : Int;
                   END_STRUCT;
      estado     : Int;                  // 0 inicia PUT | 1 aguarda PUT | 2 inicia GET | 3 aguarda GET | 4 pausa
      reqPut     : Bool;
      reqGet     : Bool;
      putDone    : Bool;
      putError   : Bool;
      getNdr     : Bool;
      getError   : Bool;
      vidaAnt    : Int;                  // última vida do ET200 vista
      vidaMudou  : Bool;                 // vida do ET200 mudou neste ciclo
      jaLeu      : Bool;                 // TRUE após o 1º GET bem-sucedido
      tPausa     : TON_TIME;
      tVida      : TON_TIME;
      i          : Int;
   END_VAR

BEGIN

   // ---- 1) as instruções PUT/GET são chamadas TODO ciclo (REQ comandado pela máquina de estados) ----
   #statPut(REQ    := #reqPut,
            ID     := #ID_Conexao,
            DONE   => #putDone,
            ERROR  => #putError,
            STATUS => #StatusPut,
            ADDR_1 := P#DB38.DBX0.0 BYTE 4,   // destino REMOTO (ET200): DB38, bytes 0..3  (BC56)
            SD_1   := #tx);                   // origem LOCAL: 4 bytes tx
   #statGet(REQ    := #reqGet,
            ID     := #ID_Conexao,
            NDR    => #getNdr,
            ERROR  => #getError,
            STATUS => #StatusGet,
            ADDR_1 := P#DB38.DBX4.0 BYTE 4,   // origem REMOTA (ET200): DB38, bytes 4..7  (BC56)
            RD_1   := #rx);                   // destino LOCAL: 4 bytes rx

   // ---- 2) máquina de estados: PUT -> GET -> pausa -> PUT ... ----
   #vidaMudou := FALSE;
   IF NOT #Hab THEN
      #estado := 0; #reqPut := FALSE; #reqGet := FALSE; #jaLeu := FALSE;
   ELSE
      CASE #estado OF
         0: // prepara e inicia o PUT
            FOR #i := 1 TO 16 DO
               #tx.cmd[#i] := #CbLigar[#i];
            END_FOR;
            #tx.vida := #tx.vida + 1;
            IF #tx.vida >= 32767 THEN #tx.vida := 0; END_IF;
            #reqPut := TRUE;
            #estado := 1;
         1: // aguarda o PUT terminar (REQ fica em 1 até DONE ou ERROR)
            IF #putDone OR #putError THEN
               #FalhaPut := #putError;
               #reqPut   := FALSE;
               #estado   := 2;
            END_IF;
         2: // inicia o GET
            #reqGet := TRUE;
            #estado := 3;
         3: // aguarda o GET terminar
            IF #getNdr OR #getError THEN
               #FalhaGet := #getError;
               IF #getNdr THEN
                  #jaLeu := TRUE;
                  IF #rx.vida <> #vidaAnt THEN   // o ET200 está vivo (vida mudou)
                     #vidaAnt   := #rx.vida;
                     #vidaMudou := TRUE;
                  END_IF;
               END_IF;
               #reqGet := FALSE;
               #estado := 4;
            END_IF;
         4: // pausa
            IF #tPausa.Q THEN #estado := 0; END_IF;
      ELSE
         #estado := 0;
      END_CASE;
   END_IF;

   // ---- 3) temporizadores (chamados todo ciclo) ----
   #tPausa(IN := #Hab AND (#estado = 4), PT := #Pausa);
   #tVida(IN := #Hab AND NOT #vidaMudou, PT := #TempoVida);  // zera sempre que a vida do ET200 muda

   // ---- 4) saída: feedback só vale com comunicação viva; senão zera (ET200 já derrubou as saídas) ----
   #ComOk := #Hab AND #jaLeu AND NOT #tVida.Q;
   IF #ComOk THEN
      FOR #i := 1 TO 16 DO
         #SbLigada[#i] := #rx.fb[#i];
      END_FOR;
   ELSE
      FOR #i := 1 TO 16 DO
         #SbLigada[#i] := FALSE;
      END_FOR;
   END_IF;

END_FUNCTION_BLOCK
```

### 5.4 Chamada (OB cíclico, antes do FB100)
```scl
"fb101_ComEt200_DB155"(Hab        := TRUE,
                       ID_Conexao := W#16#100,                          // <- ID real da conexão (5.1 item 4)
                       CbLigar    := "db150_BC56_Chaves".cb.ligar,
                       SbLigada   := "db150_BC56_Chaves".sb.ligada);

"fb100_setupChaves_DB154"( ... );   // chamada existente, sem mudança
```
> **Importante:** ao ligar o FB101, **desative o loopback do FC100** que hoje escreve `sb.ligada` na bancada; os dois escrevendo no mesmo bit causam "pisca-pisca".

---

## 6. Ordem de teste (nada de carga real até o passo 7)

1. **Rede:** ping 172.17.209.135 ↔ .158 a partir do PC; as duas CPUs em RUN.
2. **ET200:** DB38 criado/carregado, vida do ET200 incrementando (tabela de monitoração).
3. **1515:** conexão S7 **Estabelecida** (diagnóstico online). Se não: TSAP/IP/permissão PUT/GET (seção 7).
4. **Contatoras desenergizadas** (circuito de potência aberto/seccionado). `Hab := TRUE`.
5. Esperado no 1515 (tabela de monitoração do DB155): `StatusPut = 0`, `StatusGet = 0`, `ComOk = TRUE`, `tx.vida` incrementando ~5×/s.
6. **Comando:** clique numa chave no HTML (BC56) → `db150.cb.ligar[n]` = TRUE → `DB38.cmd[n]` = TRUE no ET200 em ≤ ~0,5 s.
7. **Feedback:** force `DB38.fb[n]` no ET200 → `db150.sb.ligada[n]` TRUE → bolinha/tile verde no HTML.
8. **Falha de rede:** desconecte o cabo do ET200 → em ≤ 2 s o ET200 derruba as saídas; em ≤ 3 s o 1515 zera `sb.ligada` e `ComOk = FALSE`. Reconecte → volta sozinho **sem** religar contatora (exige novo comando).
9. **Só então** energizar a potência e repetir o passo 6 com 1 chave de menor kW.

Critério de aceite: passos 5–8 sem intervenção manual; nenhum bit "preso" após o passo 8.

---

## 7. Onde o TIA pode reclamar (não compilei) e diagnóstico

**Pontos de compilação a verificar**
1. Tipo `PUT`/`GET` como multi-instância no `VAR`: se não aceitar, arraste a instrução de *Instruções → Comunicação → Comunicação S7* para dentro do FB e escolha **Multi-instância**; o TIA escreve o tipo correto. Se não permitir multi-instância em FB não otimizado, use **instância única** (um DB por instrução) e chame no FB-pai.
2. Tipo do parâmetro `ID`: se pedir `CONN_R_ID`/`DWord`, ajuste `ID_Conexao`.
3. Sintaxe do endereço remoto `P#DB38.DBX0.0 BYTE 4` (aceita literal; simbólico não).
4. `SD_1 := #tx` / `RD_1 := #rx`: se acusar tipo, use `P#DB155.DBX…` (absoluto, DB não otimizado) ou `Array[0..3] of Byte`.
5. Versão informada: **TIA V19, firmware V3.1 do 1515**. Eu **não** tenho o TIA aqui para compilar: se o V19 acusar tipo/sintaxe diferente nas instruções `PUT`/`GET` (parâmetros `ADDR_1` do tipo `REMOTE`, `SD_1`/`RD_1` como `VARIANT`), mande a mensagem de erro exata e eu ajusto. (Eu perguntei versão/firmware porque os tipos dos parâmetros do PUT/GET e a opção de permissão mudam entre versões — não é exigência do projeto.)

**STATUS comuns** (valores exatos conforme a ajuda do TIA da sua CPU): `0000` ok · `7000/7001/7002` job parado/iniciado/em andamento · `80xx` erro (parâmetro/endereço/recurso ocupado/parceiro inacessível). Conexão que não estabelece: IP, TSAP, permissão PUT/GET no servidor, DB otimizado no ET200, firewall/rede.

---

## 8. BC400 (depois do BC56 validado)
- **O BC400 está no mesmo ET200 (confirmado 22/10):** mesma conexão S7 (mesmo `ID_Conexao`); novo `DB39` no ET200 (mesmo layout do 4.1); nova instância `db163_BC400_ComEt200` (DB163) de `fb101`, **com os literais trocados** `DB38→DB39` e CbLigar/SbLigada = `db158_BC400_Chaves`.
- **Copiar o FB só para trocar o literal viola "nunca copiar FB" (plano de numeração).** Solução limpa: `AddrTx`/`AddrRx : Remote` como `VAR_INPUT` do `fb101`, e o chamador passa `P#DB38…`/`P#DB39…`. **Não verifiquei** se o TIA aceita parâmetro do tipo `Remote` na sua versão (Q3). Se não aceitar, a alternativa é uma 2ª cópia do FB com número próprio — **só com seu OK**, porque sai da numeração do plano.
- (Não se aplica hoje.) Se um dia o BC400 for para outro ET200: outra conexão S7 (outro IP/ID); conexões S7 são recurso limitado na 1214FC (plano: 14 no total, 8 reservadas).

---

## 9. Perguntas (o que ainda falta)
- **Q1 (parcial).** Artigo do ET200 **respondido** (IM 151-8 PN/DP CPU). Falta: o **rack/slot ou TSAP** mostrado na configuração dela e se o firmware tem a permissão de PUT/GET (4.3).
- **Q2, Q3, Q4: respondidas** (mesmo ET200; TIA V19 / FW V3.1; FB101/DB155/DB163 aprovados).
- **Q5.** O ET200 já tem lógica que derruba saídas por perda de vida (4.2)? Se não, quer que eu escreva o esqueleto SCL dessa parte? (sem resposta ainda)
- **Q6 (nova).** O programa "Gerador_BC015" está **no mesmo projeto TIA** do 1515 ou em outro projeto/STEP 7 clássico? (muda o passo 5.1 e quem cria o DB38/DB39)
- **Q7 (nova).** Confirma os nomes `fb101_ComEt200`, `db155_BC56_ComEt200`, `db163_BC400_ComEt200`?

## 10. Ao trocar o 1515 pela 1214FC
Reconfirmar: conexão S7 (ID/TSAP), permissão PUT/GET do **servidor** (continua o ET200), conexões S7 disponíveis (14 / 8 reservadas), memória de trabalho (200 kB) e o IP do endpoint "PLC da Carga" no Node-RED (hoje 172.17.209.135).
