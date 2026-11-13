# RNC · Roteiro do teste de bancada — v0.1 (13/11/2026)

Valida, no **PC BT2 e no PC do reparo**, o sistema de RNC e retrabalho (`docs/modulos/RNC_RETRABALHO_v0.2.md`). É só informativo: **nada aqui comanda PLC, chave ou DSE.**
O que já foi provado em simulado não precisa ser repetido a fundo; aqui se prova o que só a bancada mostra: PC real, rede real, DSE real, relógio, disco, operadores.

## 0. Regras de segurança (ler antes)
- Só mexer no Node-RED/PC de produção com **backup feito** e **OK explícito do Reginaldo**. Importar a aba nova **não** altera as abas das chaves.
- **Carga de potência DESACOPLADA** em qualquer teste de bancada que ligue o gerador (os testes T14–T15 usam o medidor com o gerador real; os demais não precisam de gerador ligado).
- **Dados de teste nunca entram no registro real:** o teste usa uma pasta própria (`RNC_DIR` de teste) e séries de teste (`TESTE000000000001`…). No fim, troca-se para a pasta real, que começa vazia.
- Nenhuma senha, IP real ou dado de ensaio vai para o Git.

## 1. Pré-requisitos (marcar)
| # | Item | OK |
|---|---|---|
| P1 | Backup do Node-RED exportado (todas as abas) e do `flows` atual | ☐ |
| P2 | OK do Reginaldo para importar a aba nova | ☐ |
| P3 | Pacote .zip no PC BT2 com: `rnc-api-v1.1.json`, `rnc_registro_v0.1.html`, `rnc_reparo_v0.2.html`, `medidor_gerador_v1.10.202.html` (base 1.10.201; confirmar que é a versão que o PC BT2 usa hoje) | ☐ |
| P4 | PC do reparo alcança o Node-RED do PC BT2 (ping e navegador abrem `http://<IP-BT2>:1880`) — **decisão 2: confirmar** | ☐ |
| P5 | Versão do Node-RED anotada: ______ (testado em 4.x). `functionExternalModules` não desligado no `settings.js` | ☐ |
| P6 | Pasta de dados de teste criada, com permissão de escrita para o usuário do Node-RED (ex.: `C:\...\rnc-dados-teste`; **ajustar o caminho**) | ☐ |
| P7 | Variável de ambiente `RNC_DIR` = essa pasta, definida do jeito que o PM2 do PC já usa (ecosystem/variáveis) + reinício **com** as variáveis novas | ☐ |
| P9 | Pacote com `catalogo_ferramentas.js` **gerado** por `gerar_catalogo_auto_v0.3.py` (ver `RNC_RETRABALHO_v0.2.md`) e `menu_dev_v0.3.js` na mesma pasta dos `.html` | ☐ |
| P8 | Relógio dos PCs conferido (data/hora certas): BT2 ______ · reparo ______ | ☐ |

## 2. Instalação
1. Node-RED › menu › **Import** › colar `rnc-api-v1.1.json` › **nova aba** (não substituir nada) › Import.
2. **Deploy.** Conferir que a aba `RNC · Qualidade e retrabalho (API) v1.1` existe e as demais ficaram iguais.
3. Copiar os três `.html` para a pasta `public` do Node-RED (mesma origem; sem CORS).
4. Abrir no PC BT2: `http://localhost:1880/rnc_registro_v0.1.html?banco=BT2`. No PC do reparo: `http://<IP-BT2>:1880/rnc_reparo_v0.2.html`.

## 3. Testes
**Atalho automático:** o script `rnc_teste_bancada_v0.1.js` (no pacote, pasta `testes`) faz sozinho T01, T03–T13, T18 e a parte de reenvio do T21, e escreve OK/FALHOU. Roda no PC BT2 e, para provar a rede (T02), também no PC do reparo. Só roda em pasta de dados com "teste" no nome e vazia. **O que continua manual:** T14–T17, T19, T20, T21 (queda de rede), T22–T27 (medidor/DSE real, reinício, backup, uso real, expedição) e a conferência visual das telas. O T28 (menu ☰) fica adiado até o pacote da sessão BT2 gerar o catálogo com o gerador v0.3.
Para cada teste: executar, anotar **OK / FALHOU** e observação. **Falhou = registrar como `todo` com ID e gravidade (não apagar nem enfraquecer o teste).** Séries de teste: `TESTE000000000001` (A), `TESTE000000000002` (B), `TESTE000000000003` (C). Operadores de teste: nomes diferentes em cada PC.

### Bloco A — Serviço e disco
| ID | Passo | Esperado | OK |
|---|---|---|---|
| T01 | No PC BT2, PowerShell: `Invoke-RestMethod http://localhost:1880/api/rnc/saude` | `ok: True`, `eventos: 0`, `arquivo` aponta para a pasta de **teste** | ☐ |
| T02 | Do PC do reparo, navegador: `http://<IP-BT2>:1880/api/rnc/saude` | Mesma resposta (rede ok) | ☐ |
| T03 | Registro (PC BT2): série A, modelo, tipo, descrição, nome → **Registrar** | "Salvo", `RNC-AAAA-0001`; arquivo `rnc.jsonl` na pasta de teste ganhou 1 linha | ☐ |
| T04 | Registrar com foto (celular ou PC) | "Foto anexada"; arquivo em `fotos\RNC-AAAA-0001\1.*` | ☐ |
| T05 | Campos inválidos (série curta, descrição de 2 letras, sem nome) | Recusa com mensagem; nada gravado (linhas do arquivo não mudam) | ☐ |

### Bloco B — Ciclo completo entre dois PCs
| ID | Passo | Esperado | OK |
|---|---|---|---|
| T06 | PC do reparo: abrir Reparo | RNC-0001 em **Aberta (bloqueada)**, com foto no detalhe | ☐ |
| T07 | PC do reparo: **Assumir reparo** (nome do técnico) | Vai para **Em reparo**; PC BT2 vê o mesmo (botão Atualizar ou até 15 s) | ☐ |
| T08 | Registrar reparo **sem** ação | Recusado | ☐ |
| T09 | Registrar reparo com ação e peça | Vai para **Aguardando reteste**; histórico mostra quem e quando | ☐ |
| T10 | Reteste **REPROVADO** | Volta a **Em reparo**; gerador segue BLOQUEADO | ☐ |
| T11 | Novo reparo + reteste **APROVADO** | **Liberado**; aviso "Gerador LIBERADO" | ☐ |
| T12 | Duas RNCs da série B; liberar só uma | Série B segue **BLOQUEADA** (aviso no cartão e no detalhe) até liberar a outra | ☐ |
| T13 | **Edição simultânea:** abrir a mesma RNC nos 2 PCs; um assume; o outro tenta assumir | O segundo recebe "alterada por outra pessoa"; nada duplicado no arquivo | ☐ |

### Bloco C — Medidor com DSE real (carga DESACOPLADA)
| ID | Passo | Esperado | OK |
|---|---|---|---|
| T14 | Medidor v1.10.202 aberto pelo Node-RED, **Demo desligado**, DSE real lendo. Informar série C em *Dados do ensaio*. Botão **⚠ Registrar defeito** | Janela com série, modelo do DSE e banco preenchidos; "O que será anexado" mostra **grandezas reais** (tensões, corrente, rpm, temp.) e alarmes **iguais ao que o DSE mostra** | ☐ |
| T15 | Confirmar a RNC | "Salvo". No Reparo, o detalhe mostra o **Contexto do ensaio** coerente com o momento (hora, etapa, valores) e **sem** `[DEMO]` | ☐ |
| T16 | Com a série C bloqueada, **iniciar um ensaio** com essa série | Faixa "Atenção (ensaio iniciado)…" e etiqueta "RNC: BLOQUEADO (1)"; o **ensaio roda normalmente** (aviso não bloqueia) | ☐ |
| T17 | Trocar de etapa do ensaio | Faixa aparece de novo só se a situação mudou; ensaio segue normal | ☐ |
| T18 | Série sem RNC | Nenhuma faixa nem etiqueta | ☐ |
| T19 | Conferir que o medidor **não alterou nada** do PLC/chaves/DSE: comparar o comportamento das chaves e do registro do ensaio com o de antes | Idêntico | ☐ |

### Bloco D — Robustez e operação
| ID | Passo | Esperado | OK |
|---|---|---|---|
| T20 | Reiniciar o Node-RED (PM2). Depois `.../api/rnc/saude` e abrir o Reparo | Mesmo número de eventos; RNCs e fotos continuam | ☐ |
| T21 | Desligar a rede do PC do reparo, tentar registrar uma ação; religar | "NÃO foi salvo" com a janela preenchida; ao repetir, grava **uma vez** | ☐ |
| T22 | Parar o Node-RED e tentar registrar | "NÃO foi salvo" (nunca "Salvo"); nada gravado | ☐ |
| T23 | Backup diário: conferir `backup\rnc-AAAA-MM-DD.jsonl` depois das 00:05 (ou disparar o nó "backup diário" manualmente) | Arquivo existe e tem o mesmo conteúdo do `rnc.jsonl` | ☐ |
| T24 | **Cópia do backup para fora do PC** (pen drive/rede/Drive) e abrir uma linha de teste | Cópia legível | ☐ |
| T25 | Antivírus/permissão: gravar e apagar foto de 2 MB | Sem bloqueio; foto maior que 3 MB é recusada | ☐ |
| T26 | Dois operadores usam por 30 min no turno, sem ajuda | Conseguem registrar e consertar; anotar dúvidas e o tempo médio para registrar um defeito: ______ s | ☐ |
| T28 | Menu ☰ do medidor (operador, sem `?dev=1`) | Lista Medidor, Gráfico, **RNC · Registro de defeito** e **RNC · Reparo**; clicar abre a tela certa na mesma pasta | ☐ |
| T27 | **Processo da fábrica:** colocar a etiqueta BLOQUEADO no gerador de teste; a expedição simula a conferência (consulta o Reparo ou `GET /api/rnc/serie/<série>`) | A expedição consegue ver que está bloqueado **antes** de liberar | ☐ |

## 4. Critérios de aprovação do piloto
- **Obrigatórios:** T01–T13, T14–T16, T19, T20, T22, T24, T27 todos OK.
- **Aceitáveis com `todo`:** T17, T21, T23, T25, T26 (registrar ID e gravidade).
- Qualquer falha que permita mostrar "Salvo" sem ter gravado, liberar sem reteste aprovado ou alterar PLC/chave/DSE = **bloqueia o piloto**.

## 5. Virada para uso real (só depois de aprovado e com OK do Reginaldo)
1. Parar de usar as séries de teste. Definir `RNC_DIR` para a pasta **real** (vazia) e reiniciar com as variáveis novas.
2. `GET /api/rnc/saude` deve mostrar `eventos: 0` e a pasta real.
3. Guardar a pasta de teste (evidência do teste) fora do uso; não misturar.
4. Informar à produção: a etiqueta BLOQUEADO e a conferência na expedição são obrigatórias (o sistema é só informativo).
5. Decisões a fechar antes da virada: **formato real do número de série** (`RNC_SERIAL_REGEX`), **quem libera**, backup para fora do PC (quem e onde).

## 6. Volta atrás (rollback)
O fluxo é uma aba separada e só grava arquivo. Para desfazer: Node-RED › desabilitar/excluir a aba `RNC · …` › Deploy. Os `.html` novos podem ser apagados da pasta `public`. Nada nas abas das chaves, no PLC ou no DSE foi alterado, então não há o que restaurar além disso. Se algo estranho aparecer, restaurar o backup do P1.

## 7. Registro do resultado
Data: ______ · Executado por: ______ · Node-RED: ______ · Medidor: v1.10.202
Resumo: testes OK ___ / FALHOU ___ · `todo` abertos (ID — gravidade — descrição): ______
Aprovado para uso real? ☐ Sim ☐ Não · Responsável: ______
