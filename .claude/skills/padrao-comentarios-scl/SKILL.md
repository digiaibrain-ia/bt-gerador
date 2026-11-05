---
name: "padrao-comentarios-scl"
description: "Skill especializada em padronização de comentários para blocos SCL (FB, FC, DB) em ambiente Siemens S7. Define regras obrigatórias para garantir legibilidade, manutenção em campo, consistência entre projetos e diagnóstico eficiente."
---

## PADRÃO CORPORATIVO DE COMENTÁRIOS SCL

Todos os blocos devem seguir um padrão único de comentários para garantir
consistência, facilidade de manutenção e clareza técnica.

Utilizar este padrão sempre que gerar, revisar ou corrigir código SCL.
Os comentários devem explicar o comportamento da lógica e permitir
entendimento direto sem necessidade de HMI ou documentação externa.

Para FB, FC e OB valem as seções 1 a 11. Para DATA BLOCK (DB) vale a seção 12.
Para nome dos blocos, autor e versão, em todos os tipos, vale a seção 13.
Para texto ASCII, tipos de comentário e palavras reservadas, em todos os tipos, vale a seção 14.

IMPORTANTE: as regras de comentário do FB (seções 1 a 11) são DIFERENTES das regras do DB (seção 12).
Não copiar o cabeçalho de um tipo para o outro.

### QUADRO RÁPIDO: FB/FC/OB x DB

| Item | FB / FC / OB (seções 1 a 11) | DB (seção 12) |
|---|---|---|
| Linha de abertura | `FUNCTION_BLOCK "fbNN_Nome"` (FC: `FUNCTION`, OB: `ORGANIZATION_BLOCK`) | `DATA_BLOCK "dbNN_Nome"` (instância de FB: `dbNNi_Nome`) |
| Ordem das linhas iniciais | TITLE (com versão), `{ S7_Optimized_Access }`, AUTHOR, VERSION, moldura `////====` | TITLE (com versão), `{ S7_Optimized_Access }`, AUTHOR, VERSION, NON_RETAIN, moldura `////====` |
| Onde fica a moldura `////====` | Depois do VERSION e ANTES do VAR_INPUT | Depois do NON_RETAIN e ANTES do STRUCT |
| Campos da moldura | nome, VERSAO, O QUE FAZ, INSTANCIAS, COMO OPERA, FALHA, histórico por versão, ATENCAO, Fonte | nome, VERSAO, O QUE FAZ, POR QUE DB GLOBAL SEM OTIMIZACAO, ESCRITOR UNICO, RELACAO COM OUTROS DBs, Autor/Versao/Projeto |
| Comentário depois do BEGIN | Seções de lógica (`REGION "n) Nome"` + comentário de seção) | Proibido: BEGIN fica vazio |
| Comentário de seção | Obrigatório antes de cada bloco lógico (seção 3) | Não se aplica: sem comentário de seção no STRUCT |
| Comentário de membro | Curto, ao lado do sinal na interface (seção 2) | Curto, com unidade e faixa, 1 linha por membro; reserva sem comentário |
| State machine | Cada estado documentado (seção 8) | Não se aplica |

---

### 1. CABEÇALHO E COMENTÁRIO INICIAL DO BLOCO (FB, FC, OB)

O comentário geral do bloco fica na MOLDURA do cabeçalho, entre o VERSION e o
VAR_INPUT (modelo aprovado: fb100_setupChaves_v0.2.scl). Depois do BEGIN não se repete
o resumo: entram direto as seções de lógica (seção 3).

Ordem obrigatória das linhas:

1. `FUNCTION_BLOCK "fbNN_Nome"` (nome conforme seção 13)
2. `TITLE = fbNN_Nome vX.Y (FBNN)` - sem aspas, com versão e número do bloco (seção 13)
3. `{ S7_Optimized_Access := 'TRUE' }` (ou 'FALSE' quando a instância precisar de endereço absoluto, ex.: PUT/GET)
4. `AUTHOR : 'Reginaldo Lobo'` (no ET200 o autor é `RegLobo`: seção 13)
5. `VERSION : x.y`
6. Moldura do cabeçalho com prefixo `////`
7. Interface: VAR_INPUT, VAR_OUTPUT, VAR_IN_OUT, VAR
8. `BEGIN` e as seções de lógica

Moldura (modelo para FB):

////====================================
//// fbNN_Nome (FBNN)
//// VERSAO : x.y (data) - o que mudou; a versão fica AQUI porque o nome do bloco no TIA não leva versão.
//// O QUE FAZ : função geral do bloco e a quem serve.
//// INSTANCIAS : DB de instância de cada uso (ex.: DB154 = banco 1, DB162 = banco 2).
//// COMO OPERA : onde é chamado, em que ordem, quem escreve cada parâmetro (IN_OUT).
//// FALHA : o que o bloco faz quando o sinal/comunicação falha.
//// vX.Y (data): o que mudou nesta versão.
//// ATENCAO : pontos assumidos, riscos e o que não foi testado.
//// Fonte: documento de origem do requisito.
////=====================================

Regras:
- Nunca sobrecarregar a interface
- Não usar comentários longos em VAR_INPUT/OUTPUT
- Explicação detalhada deve estar no corpo do código, nas seções
- Pontos assumidos e não testados entram em ATENCAO na moldura e em comentário "ATENCAO" junto da linha afetada
- O que o DB tem de próprio (POR QUE DB GLOBAL SEM OTIMIZACAO, ESCRITOR UNICO) NÃO entra na moldura de FB

---

### 2. INTERFACE (VAR_INPUT / VAR_OUTPUT)

Deve conter comentários curtos e objetivos.

Regras:
- Explicar apenas a função do sinal
- Não incluir lógica detalhada
- Não utilizar textos longos
- Indicar a origem quando o sinal vem de DB ou de outro bloco (ex.: db52_BancoTeste2_DSE.potenciaKw)
- Em VAR_IN_OUT, dizer quem escreve e quem só lê

Exemplo:

iStart : Bool; // Comando de partida  
oErro  : Bool; // Indicação de falha  

---

### 3. COMENTÁRIOS DE SEÇÃO (FB, FC e OB)

Não se aplica ao STRUCT de um DB: para DB vale a seção 12.

Obrigatórios em todas as partes do código.

Formato aceito 1 (modelo aprovado no fb100_setupChaves_v0.2.scl):

REGION "1) Nome da seção"
   // comentário de seção logo abaixo
   ...
END_REGION

Formato aceito 2:

// ================= NOME DA SEÇÃO =================

Regras:
- Deve existir antes de cada bloco lógico
- Mínimo de 5 linhas explicativas
- Linguagem técnica, clara e direta
- Explicar comportamento, não apenas instruções
- Não misturar os dois formatos dentro do mesmo bloco

---

### 4. CONTEÚDO DOS COMENTÁRIOS

Todo comentário deve responder:

- O que a lógica faz
- Quando executa
- Condição de avanço
- O que bloqueia a execução
- Possíveis falhas

---

### 5. POSICIONAMENTO

Regras:
- Descrição geral na moldura do cabeçalho (seção 1), não depois do BEGIN
- Comentários de seção antes da lógica
- Não fragmentar explicações
- Não deixar código sem contexto

---

### 6. PROIBIÇÕES

Não utilizar:

- Emojis
- Símbolos gráficos
- Elementos visuais decorativos
- Ícones de validação

Exemplos proibidos:

✔ ✘ ⚠ → ← ★

---

### 7. ESTRUTURA PADRÃO DE SEÇÃO

Exemplo recomendado:

// ================= VALIDAÇÃO DE POSIÇÃO =================
// Verifica se a posição correspondente ao contador atual
// está ativa conforme retorno do campo.
// Condição obrigatória para permitir avanço da sequência.
// Evita falha de sincronismo entre lógica e máquina.
// Garante operação segura e previsível.

(Em arquivo de fonte externa o texto vai em ASCII puro, sem acentos: seção 14.)

---

### 8. STATE MACHINE

Regras:
- Cada estado deve ser documentado
- Explicar claramente a função de cada estado
- Evitar comentários genéricos

Exemplo:

// Estado 0: aguardando condição de início
// Estado 1: validando posição
// Estado 2: aguardando confirmação
// Estado 3: liberação de pulso

---

### 9. DIAGNÓSTICO

Regras:
- Comentários devem permitir análise sem HMI
- Técnico deve entender comportamento apenas lendo o código
- Descrever causas de erro e bloqueio

---

### 10. CONSISTÊNCIA

Regras:
- Mesmo padrão em todos os blocos do mesmo tipo
- Não misturar estilos
- Não alternar níveis de detalhamento

---

### 11. USO DA LINGUAGEM

Regras:

- Utilizar linguagem técnica direta
- Não utilizar expressões voltadas a documentação
- Não utilizar:

"Para times não técnicos"

Esta expressão deve ser usada apenas em documentação externa
ou skills de explicação, nunca dentro do código SCL.

---

### 12. DATA BLOCK (DB) - ESTRUTURA PRÓPRIA

O DB segue a estrutura abaixo (modelo aprovado, exportado do TIA). As regras de
comentário de seção (seção 3), de cabeçalho de FB (seção 1) e de BEGIN NÃO se aplicam ao DB.

Ordem obrigatória das linhas:

1. `DATA_BLOCK "dbNN_Descricao"` (nome conforme seção 13; DB de instância de FB: `dbNNi_Descricao`)
2. `TITLE = dbNN_Descricao vX.Y (DBNN)` - sem aspas, com versão e número do DB
3. `{ S7_Optimized_Access := 'FALSE' }` (ou 'TRUE' quando o DB for otimizado)
4. `AUTHOR : 'Reginaldo Lobo'` (no ET200: `RegLobo`)
5. `VERSION : x.y`
6. `NON_RETAIN` (ou RETAIN quando aplicável)
7. Cabeçalho do bloco, DEPOIS do NON_RETAIN e ANTES do STRUCT, com prefixo `////`
8. `STRUCT`, membros, `END_STRUCT;`
9. `BEGIN` vazio e `END_DATA_BLOCK`

Cabeçalho (moldura `////====`):

////====================================
//// dbNN_Descricao (DBNN)
//// VERSAO : x.y (data) - o que mudou; a versão fica AQUI porque o nome do bloco no TIA não leva versão.
//// O QUE FAZ : função do DB.
//// POR QUE DB GLOBAL SEM OTIMIZACAO : motivo (ex.: acesso por offset via PUT/GET).
//// ESCRITOR UNICO : quem escreve; os demais apenas leem.
//// RELACAO COM OUTROS DBs : o que fica em outro DB.
//// Autor: Reginaldo Lobo  -  Versao: x.y  -  Projeto: nome
////=====================================

Regras dos membros:

- Indentação: STRUCT com 3 espaços, membros com 6 espaços.
- Uma linha por membro: `nome : Tipo;   // comentário` (3 espaços antes do `//`).
- Comentário curto, com unidade e faixa quando houver: `// Tensao L1-L2 [V], 0 a 1000`.
- Membros de reserva ficam sem comentário.
- Sem comentários de seção dentro do STRUCT e sem comentários dentro do BEGIN.
- Texto ASCII puro (sem acentos), por causa da importação de fonte externa no TIA.
- Nomes dos membros em camelCase, conforme a skill siemens-s7-engenharia.

---

### 13. NOMENCLATURA DE BLOCOS, AUTOR E VERSÃO (TODOS OS PROJETOS)

Nome do bloco: prefixo do tipo em MINUSCULAS + numero do bloco + "_" + descricao em PascalCase.

- Functions: `fc10_EscalaNivel`
- Function Blocks: `fb91_ControleMotor`
- Data Blocks: `db52_BancoTeste2_DSE` (numero igual ao do DB no TIA)
- DB de INSTÂNCIA de FB: `dbNNi_Descricao` - SEMPRE com o `i` depois do número (ex.: `db155i_BC56_ComEt200`, `db163i_BC400_ComEt200`). A descrição deve citar o banco/equipamento que a instância REALMENTE serve (conferir pelos DBs ligados na chamada).
- Organization Blocks: `ob1_Principal`
- UDT: `udt10_Gerador`

Esta regra prevalece sobre qualquer exemplo com prefixo em maiusculas (FC_, FB_, DB_) de outras skills.

Autor: em todos os projetos e blocos o autor e sempre `Reginaldo Lobo` (cabecalho, atributo AUTHOR e metadados). Nao usar caixa alta nem variacoes. EXCECAO: em blocos de programa de ET200 (ex.: "Gerador_BC015") o campo AUTHOR aceita no MAXIMO 8 caracteres: usar `RegLobo` (atributo AUTHOR e linha Autor da moldura).

Versão (regra de 27/10/2026): o sufixo `_vX.Y` do nome do arquivo de fonte externa SE PERDE quando o TIA gera o bloco na pasta Program blocks. Por isso a versão vai SEMPRE também dentro do bloco: `TITLE = nome vX.Y (numero)`, `VERSION : X.Y` e a linha `//// VERSAO : X.Y (data) - o que mudou` logo abaixo do nome na moldura. Snippets de chamada (que não são bloco) também levam VERSAO no cabeçalho.

---

### 14. ARQUIVO DE FONTE EXTERNA (.scl/.db): ASCII, TIPOS DE COMENTÁRIO E PALAVRAS RESERVADAS (TODOS OS BLOCOS)

Valem para FB, FC, OB, DB e UDT que serao importados no TIA como fonte externa.

- Texto ASCII puro em TODO o arquivo, inclusive moldura do cabeçalho e comentários de FB/FC/OB: sem acentos, sem cedilha, sem aspas tipográficas, sem setas e sem travessão longo (o fb100_setupChaves_v0.2.scl aprovado tem zero caracteres fora do ASCII). Escrever `logica`, `nao`, `ate`, `ATENCAO`.
- Comentários somente com `//` ou `(* ... *)`. Nunca `/* ... */` (não é SCL válido).
- Não usar palavras reservadas do SCL como nome de parâmetro ou membro. Exemplo confirmado neste projeto: `fb` não serve como nome de membro; usar `fbk`.
- Antes de entregar um arquivo, conferir: nenhum caractere fora do ASCII, nenhum `/* */`, moldura na posição certa para o tipo do bloco (seção 1 para FB/FC/OB, seção 12 para DB).

---

## DIRETRIZ FINAL

Comentários devem transformar o código em uma ferramenta de diagnóstico,
não apenas documentação.

O objetivo é permitir entendimento imediato por técnicos de campo,
engenheiros e programadores sem necessidade de análise externa.