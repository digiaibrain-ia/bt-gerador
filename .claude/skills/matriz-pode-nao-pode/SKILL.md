---
name: "matriz-pode-nao-pode"
description: "Simular no Demo todas as ações do operador por estado/modo e classificar 'pode / não pode' contra o manual real, para achar bugs e lições antes do hardware."
---

# Matriz "isso pode / isso não pode" (Demo → Real)

Objetivo: usar o DEMO (emulador) como laboratório para descobrir, ANTES do hardware, quais ações o operador consegue fazer em cada situação, comparar com o que o REAL exige (espelhar o manual real) e transformar cada diferença em correção no HTML + lição aprendida.

## Quando usar
- O usuário pede "simular todas as operações", "lessons learned antecipado", "isso pode / isso não pode", ou relata um clique/comando que não funcionou no Demo.
- Antes de levar uma versão do HTML para teste no real.

## Regras do projeto (sempre valem)
- Nunca inventar endereços, tags, rotas, DBs. Se o real não está documentado, marcar "A VALIDAR NO REAL" e perguntar.
- Nunca misturar BT1 e BT2. Foco: ensaio MANUAL do BT2. Não criar ensaio automático.
- Cada correção = NOVO arquivo versionado (nunca editar versão existente); gerador por script com asserções de contagem de trechos.
- Separar sempre: (a) confirmado/testado, (b) assumido, (c) a desenvolver. Português BR, objetivo; resumo de 2-3 linhas primeiro; glossário no FIM de toda resposta.
- Testado só no emulador ≠ validado no real: dizer isso explicitamente.

## Método
1. **Delimitar o card/popup** (use as siglas de `PADRAO_SIGLAS_CARDS.md`, ex.: bco.SU = Setup) e listar as **ações** possíveis do operador (clicar chave, STOP, Setup, potenciômetro, INICIAR, FINALIZAR, GRAVAR, trocar modo...). Ler o HTML para achar os handlers e as condições (`if(...)return`) — cada `return` silencioso é suspeito.
2. **Listar os eixos de estado**: gerador (parado/partindo/operando/parando), ensaio (sem ensaio/rodando/pausado/finalizado/gravado), modo do Demo (Demo local / Demo+PLC / Real), modo da Simulação (Manual/Auto), popups abertos (Setup com chave selecionada), falha de comunicação Modbus/PLC.
3. **Definir o esperado do REAL** para cada combinação, citando a fonte (regra do projeto, `REGRAS_ENSAIO_MANUAL_BT2.md`, checklist). Sem fonte = "a validar", não inventar.
4. **Rodar a matriz no emulador** (Playwright + runtime Node-RED simulado do projeto): para cada célula, executar a ação e medir o EFEITO (estado interno, DOM, mensagem), não só "não deu erro". Atenção: preparar pré-condições (chaves habilitadas, gerador operando) e esperar o tempo físico do simulador (ex.: gerador leva ~10 s para parar).
5. **Classificar cada célula**:
   - PODE e deveria → ok
   - NÃO PODE e não deveria poder → ok, MAS exige aviso visível do motivo (nunca ignorar em silêncio)
   - NÃO PODE mas deveria poder → BUG (típico: estado do simulador "dono" do comando, seleção fantasma, estado velho)
   - PODE mas não deveria → risco de segurança/integridade (registro duplicado/perdido, comando persistente)
6. **Corrigir** cada BUG em nova versão do HTML, com teste que reproduz ANTES e passa DEPOIS; rodar toda a regressão anterior.
7. **Registrar**: tabela da matriz em doc do projeto (`MATRIZ_PODE_NAO_PODE_<tema>_vX.Y.Z.md`), lições aprendidas aplicáveis ao real, e itens "a validar no real" no checklist de validação vigente.

## Armadilhas já vistas neste projeto
- Controle "dono" no simulador (Auto/refill/potenciômetro) apagando comando do operador.
- Estado visual desatualizado (tile "SELECIONADA" depois de desmarcar; "kW sem carga" velho).
- Detecção de estado atrasada (gerador ainda "OPERANDO" ~10 s após STOP) — o comando deve agir na hora.
- Habilitação de chaves vinda do PLC simulado deixando tudo desabilitado no teste: preparar pré-condições.
- Clique/`return` silencioso: sempre exigir mensagem.

## Formato da resposta
Resumo (2-3 linhas) → tabela da matriz (ação × estado × modo × esperado real × resultado) → bugs encontrados e correção → confirmado / assumido / a desenvolver → itens a validar no real → glossário.