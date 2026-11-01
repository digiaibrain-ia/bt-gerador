# ATUALIZACAO v2 (20/10/2026) - decisoes do usuario e numeracao nova (prevalecem sobre o texto abaixo)

- **Numeracao nova** (`claude/PLANO_NUMERACAO_BLOCOS_PLC.md` v2): DB55 -> dois DBs, um por banco (banco nao
  pertence a um BT so, pode servir BT1 ou BT2). **DB150 = db150_BC56_Chaves** (BC56, 56 kW). **DB158 =
  db158_BC400_Chaves** (BC400, 400 kW). Mesmo layout interno (cb/sb/setup), so sem sufixo 56/400 nos nomes
  dos campos (cada banco tem seu proprio DB). **FB200 -> FB100** (`fb100_setupChaves`), generico, chamado
  2x: **DB154** (instancia BC56), **DB162** (instancia BC400). Codigo em `claude/plc_bancos_cargas/`
  (substitui `claude/plc_db55_fb200/` - arquivos antigos mantidos so para historico, NAO usar mais).
- **Nenhuma migracao feita no PLC real ainda** - congelado ate apos a janela de teste de quinta/sexta
  (decisao do usuario, 20/10/2026). O codigo novo (DB150/DB158/FB100/DB154/DB162) existe so em arquivo.
- **R teorico**: aplicada a formula de carga resistiva pura por teoria (P=V^2/R -> R teorico = V2medido /
  (kWNominal x 1000)), a pedido do usuario ("aplique a teoria, se tiver errado depois corrigimos") - ainda
  SEM validacao pratica.
- **"Habilitada"**: decidido bit logico simples (sem par CB/SB), por recomendacao do assistente - usuario
  sem preferencia/objecao. Revisar se existir trava fisica real no futuro.
- **Reset da Base no STOP do gerador**: mantido como estava (zera na borda de descida de GeradorOperando) -
  usuario sem objecao, segue como premissa assumida (nao formalmente confirmada).
- **Contrato HTTP do card**: proposto em `claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md` (rotas GET/POST
  `/chaves/{56|400}/...`) - nada implementado no Node-RED ainda.

# Especificação do card "Chaves do Banco de Carga" — DB55, FB200 (fb200_setupChaves), DB200 e DB201

**STATUS: código SCL corrigido e entregue (19/10/2026)** — ver `claude/plc_db55_fb200/` (3 arquivos prontos para importar como fonte externa no TIA Portal): `db55_BancoTeste2_Chaves.db`, `fb200_setupChaves.scl`, `exemplo_chamada_fb200.scl`. Este documento descreve a especificação; o código é a fonte de verdade final.

**Histórico da correção**: a 1ª versão usava `S7_Optimized_Access := TRUE` e um PLC data type (`udtChave`, array-of-struct). O operador enviou 2 exemplos reais validados (`db52_BancoTeste2_DSE.db`, `db53_BancoTeste2_SNAP_MANUAL.db`) mostrando que os DBs lidos/escritos pelo Node-RED (`node-red-contrib-s7`) são **sempre `S7_Optimized_Access := FALSE`** (offset fixo, não pode reordenar), e um 3º exemplo (`db20_exemploStruct.db`) mostrando o padrão de agrupamento preferido: **Structs nomeados `cb` (comandos) e `sb` (status) no topo do DB**, com arrays dentro. O DB55 foi refeito nesse padrão (struct-of-arrays), abandonando o UDT.

**Importante para quem for codar**: tudo marcado como "CONFIRMADO" vem do código real/testado do HTML, dos exemplos reais de DB enviados pelo operador, ou foi dito explicitamente por ele. Tudo marcado como "PROPOSTO"/"ASSUMIDO"/"PENDENTE" ainda precisa de validação.

## 1. Objetivo do card

1. **Habilitar/desabilitar chaves** — trava lógica de chave com defeito/manutenção.
2. **Setup das cargas** — calibrar, chave a chave, o kW real e a resistência equivalente.

## 2. Modelo físico dos bancos (CONFIRMADO — fonte: array `BANCOS`/`CH` do HTML, linha ~1618)

- **Banco de 56 kW**: 13 chaves — `5,5,5,5,5,4,4,4,4,4,4,4,3` kW → soma 56 kW.
- **Banco de 400 kW**: 13 chaves — `50,50,50,50,50,50,50,10,10,10,10,5,5` kW → soma 400 kW.
- Total: 26 chaves, 456 kW nominal fixo.

## 3. Habilitar/desabilitar chave (CONFIRMADO) e 4. Setup/calibração (CONFIRMADO, fluxo testado v1.9.37)

Sem mudanças de comportamento em relação à versão anterior deste documento — ver seção "Funcionamento" resumida abaixo; os detalhes completos (pré-condições, fórmulas, fluxo de clique) estão em `medidor_gerador_v1.9.37.html`, IIFE `v1.9.36: POPUP DAS CHAVES`.

- Pré-condições do Setup: ensaio não em andamento, gerador em START/operando.
- `BASE` (kW sem carga): média móvel contínua enquanto gerador operando e nenhuma chave ligada.
- Clique numa chave liga só ela e bloqueia a escolha de outra; reclique desliga; "Salvar esta chave" grava.
- `kW_real = kW_com_a_chave − BASE`; `R medido (Ω) = V_médio² / (kW_real×1000)` (confirmado); `R teórico (Ω) = V_médio² / (kW_nominal×1000)` (ASSUMIDO v1.9.37, não confirmado tecnicamente).

## 5. CB/SB por chave (CONFIRMADO)

- **CB (Control Bit)**: comando que aciona o contator/relé da chave.
- **SB (Status Bit)**: realimentação (contato auxiliar) confirmando acionamento real.
- Agrupados como **Structs `cb` e `sb` no topo do DB55** (padrão do exemplo `db20_exemploStruct.db` enviado pelo operador), não como campos dentro de uma struct por chave.

## 6. Estrutura do DB55 — `db55_BancoTeste2_Chaves` (código em `claude/plc_db55_fb200/db55_BancoTeste2_Chaves.db`)

```scl
DATA_BLOCK "db55_BancoTeste2_Chaves"
{ S7_Optimized_Access := 'FALSE' }   // CONFIRMADO: node-red-contrib-s7 precisa de offset fixo
VAR
   cb : Struct
      ligar56  : Array[1..16] of Bool;   // comando por chave, Banco 56 kW
      ligar400 : Array[1..16] of Bool;   // comando por chave, Banco 400 kW
   END_STRUCT;

   sb : Struct
      ligada56  : Array[1..16] of Bool;  // status por chave, Banco 56 kW — escrito pelo mapeamento de I/O (não pelo FB200)
      ligada400 : Array[1..16] of Bool;
   END_STRUCT;

   setup : Struct
      habilitada56, setupOk56           : Array[1..16] of Bool;
      kwReal56, rMedidoOhm56, rTeoricoOhm56, nominal56 : Array[1..16] of Real;
      setupData56                        : Array[1..16] of DTL;
      chaveSel56                         : UInt;
      salvar56                           : Bool;
      // ... idem sufixo 400 para o Banco de 400 kW ...
      usarKwReal                         : Bool;
   END_STRUCT;
END_VAR
```

`setup.nominal56[]`/`setup.nominal400[]` já vêm pré-carregados no `BEGIN` do DB com os valores confirmados da seção 2 (índices 14-16 reservados, ficam 0.0).

**Escritores de cada grupo** (documentado no cabeçalho do `.db`):
- `cb.*` → escrito pelo FB200.
- `sb.*` → escrito pelo mapeamento de entradas digitais do PLC (fora do FB200) — FB200 só lê.
- `setup.habilitada*`, `setup.chaveSel*`, `setup.salvar*` → escrito pelo Node-RED/HTML.
- `setup.nominal*` → constante de projeto.
- `setup.setupOk*`, `kwReal*`, `rMedidoOhm*`, `rTeoricoOhm*`, `setupData*` → escrito pelo FB200.

## 7. FB200 — `fb200_setupChaves` (código em `claude/plc_db55_fb200/fb200_setupChaves.scl`)

FB único/genérico (até 16 chaves), chamado 2x: **DB200** (Banco 56 kW), **DB201** (Banco 400 kW). Os arrays `cb`/`sb`/`setup` são recebidos por `VAR_IN_OUT` (8 arrays: `CbLigar`, `SbLigada`, `Habilitada`, `SetupOk`, `KwReal`, `RmedidoOhm`, `RteoricoOhm`, `SetupData`) — ligados direto aos arrays de DB55 na chamada, sem cópia. DB200/DB201 guardam só a memória de trabalho interna (acumulador da base, memórias de borda). `S7_Optimized_Access := TRUE` nesse FB (suas instâncias não são acessadas pelo Node-RED, só internamente pelo PLC).

Lógica: igual à versão anterior deste documento (média móvel do `BaseKW`, troca de `ChaveSelecionada` aciona `CbLigar`, trava de segurança por `EnsaioAtivo`/`GeradorOperando`, borda de subida de `ComandoSalvar` grava o resultado).

## 8. Mapeamento confirmado com DB52 (`claude/plc_db55_fb200/exemplo_chamada_fb200.scl`)

- `GeradorOperando` = `db52_BancoTeste2_DSE.ledManual` (**CONFIRMADO pelo operador**: `ledManual=TRUE` significa gerador em START/operando).
- `kWMedido` = `db52_BancoTeste2_DSE.potenciaKw` (corrigido — não é `.kw`).
- `VaMedido/VbMedido/VcMedido` = `tensaoL1L2/L2L3/L3L1` (já estava correto).
- `EnsaioAtivo` = **fixo `FALSE`** por enquanto — **confirmado pelo operador que essa tag só vai existir quando o card/DB "Dados do ensaio" for criado**. Trocar assim que existir.

## 9. Pontos em aberto

1. **Fórmula do R teórico** (`V²medido / (kW_nominal×1000)`) — ainda não confirmada tecnicamente.
2. **"Habilitada"** também devia virar par CB/SB de campo, ou continua bit simples de permissão (lógico, sem contrapartida física)? Mantido como bit simples por ora.
3. **Reset do `BaseOK`/`BaseKW` na borda de descida de `GeradorOperando`** — implementado no FB200 por analogia ao botão Demo do HTML; avisar se não for o esperado.
4. **`EnsaioAtivo` real** — virá do futuro DB "Dados do ensaio" (DB56/57 conforme `REGRA_NUMERACAO_DB_BT2.md`); atualizar `exemplo_chamada_fb200.scl` quando esse DB existir.
5. **Contrato HTTP do card Chaves** (rotas Node-RED que escrevem `setup.chaveSel*`, `setup.salvar*`, `setup.habilitada*` e leem `cb/sb/setup` de volta) — ainda a desenhar, ver `claude/ARQUITETURA_FONTE_DADOS_LOCALSTORAGE_PLC.md`.
