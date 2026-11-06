# Exemplo genérico: passar só o número do DB para um FB e tratar por offset dentro dele

**Status:** exemplo didático, NÃO compilado (sem TIA aqui). Não é bloco do projeto: nomes, DBs e offsets são fictícios. Confirmar os nomes exatos das instruções no TIA V19 e no firmware das CPUs (1515 V3.1 e CPU de cargas) antes de aplicar.

## 1. A ideia em uma frase

Em vez de ligar cada array do DB numa entrada do FB (`CbLigar`, `SbLigada`, ...), o FB recebe **uma única entrada `DB_ANY`** com o DB inteiro. Dentro, ele acessa os bytes por **offset** com `PEEK`/`POKE` (o equivalente SCL do `OPN DB` + endereço do STL).

## 2. Requisitos

- O DB lido/escrito precisa ser **não otimizado** (`S7_Optimized_Access := 'FALSE'`), senão o offset não é fixo. Os DBs de chaves do projeto já são assim.
- O layout do DB tem que ser **fixo e igual** nos DBs que usarem o mesmo FB (BC56 e BC400 usam o mesmo layout, então uma tabela de offsets serve para os dois).
- Offsets ficam como **constantes nomeadas** no FB, nunca números soltos no código.

## 3. Como o FB fica (exemplo fictício)

```scl
FUNCTION_BLOCK "fbXXX_ExemploDbAny"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
   VAR_INPUT
      DbBanco : DB_ANY;          // so isto muda entre chamadas: o DB do banco (arrastar o simbolo ou digitar o numero)
      TamanhoDb : UInt := 20;    // bytes validos do DB (protecao contra offset fora do DB)
   END_VAR
   VAR_OUTPUT
      Erro : Bool;               // TRUE = DB invalido
      CodErro : Word;
   END_VAR
   VAR
      dbNum : UInt;              // numero do DB, convertido de DB_ANY
      buf : Array[0..19] of Byte;   // buffer de trabalho (ex.: o que seria enviado por PUT)
      i : Int;
      b : Bool;
      w : Word;
   END_VAR
   VAR CONSTANT
      AREA_DB : Byte := 16#84;   // codigo da area "bloco de dados" para PEEK/POKE
      // ---- tabela de offsets do DB do banco (fictica) ----
      OFS_CMD   : UInt := 0;     // DBX0.0..1.7  16 bits de comando
      OFS_STS   : UInt := 2;     // DBX2.0..3.7  16 bits de status
      OFS_VALOR : UInt := 4;     // DBW4         um Word qualquer
   END_VAR

BEGIN
   REGION "0) Converte e valida o DB"
      #dbNum := DB_ANY_TO_UINT(#DbBanco);
      #Erro := (#dbNum = 0) OR (#TamanhoDb < 6);
      IF #Erro THEN
         #CodErro := W#16#8001;
         RETURN;
      END_IF;
   END_REGION

   REGION "1) LE do DB por offset para o buffer"
      // equivale a: OPN DB[#dbNum]; L DBB0 ; T buf[0] ...
      FOR #i := 0 TO 5 DO
         #buf[#i] := PEEK(area := #AREA_DB, dbNumber := #dbNum, byteOffset := #OFS_CMD + #i);
      END_FOR;
      // um bit especifico (ex.: bit 3 do byte de comando):
      #b := PEEK_BOOL(area := #AREA_DB, dbNumber := #dbNum, byteOffset := #OFS_CMD, bitOffset := 3);
      // um Word:
      #w := PEEK_WORD(area := #AREA_DB, dbNumber := #dbNum, byteOffset := #OFS_VALOR);
   END_REGION

   REGION "2) Tratamento (so no buffer, sem tocar no DB)"
      // aqui entram intertravamentos, zerar comandos por perda de comunicacao etc.
      IF NOT #b THEN
         #buf[0] := 16#00;
      END_IF;
      // ... depois, #buf pode ir para um PUT (SD_1 := #buf) como o FB101 ja faz hoje
   END_REGION

   REGION "3) ESCREVE de volta no DB por offset (ex.: feedback que veio do GET)"
      // equivale a: OPN DB[#dbNum]; L buf[2] ; T DBB2 ...
      FOR #i := 2 TO 3 DO
         POKE(area := #AREA_DB, dbNumber := #dbNum, byteOffset := #OFS_CMD + #i, value := #buf[#i]);
      END_FOR;
      POKE_BOOL(area := #AREA_DB, dbNumber := #dbNum, byteOffset := #OFS_STS, bitOffset := 0, value := TRUE);
   END_REGION
END_FUNCTION_BLOCK
```

## 4. Como a chamada fica (no FC do card)

```scl
// Antes (item por item):
//   "fbXXX"_DBi(CbLigar := "db_banco".cb.ligar, SbLigada := "db_banco".sb.ligada, ...);
// Agora (so o DB):
"fbXXX_ExemploDbAny"_DBi(DbBanco := "db_banco56",      // ou := 150 / := 158
                         TamanhoDb := 20);
// Segundo banco: outra instancia, mesmo FB, outro DB:
"fbXXX_ExemploDbAny"_DBj(DbBanco := "db_banco400", TamanhoDb := 20);
```

O ladder ou SCL de tratamento do card continua nas networks abaixo da chamada, lendo/escrevendo o mesmo DB pelos nomes simbólicos de sempre.

## 5. Pontos de atenção

1. **Nomes das instruções:** `PEEK`, `PEEK_BOOL`, `PEEK_WORD`, `POKE`, `POKE_BOOL` e `DB_ANY_TO_UINT` existem no TIA, mas a assinatura exata (nome dos parâmetros) varia por CPU e versão. Conferir na ajuda do TIA V19.
2. **Offset fora do DB:** `PEEK`/`POKE` num offset além do tamanho do DB gera erro de CPU. Por isso o `TamanhoDb` e a validação da REGION 0.
3. **Desempenho:** `PEEK`/`POKE` byte a byte é lento para DBs grandes. Para blocos grandes, usar `PEEK_BLK`/`POKE_BLK` (ou `BLKMOV` com `Variant`), se a CPU suportar.
4. **PUT/GET:** limite de cerca de 212 bytes por chamada. Um espelho maior que isso precisa de mais de uma passada, por faixa de offset.
5. **Alteração do layout do DB:** mudou o layout, mudou a tabela de offsets. Concentrar as constantes em um lugar só, no cabeçalho do FB.
6. **Escritor único:** cada campo tem um único escritor (como já é regra no projeto). O FB só faz `POKE` nos campos que são dele.
