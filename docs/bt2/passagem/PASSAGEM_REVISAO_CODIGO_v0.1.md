# Passagem para a nova sessão: revisão da qualidade do código HTML e Node-RED (18/11/2026)

Escrito no fim da sessão de 17 e 18/11/2026, a pedido do Reginaldo, para começar uma conversa nova com a cabeça limpa. **Leia o código de novo; não confie neste resumo como se fosse o código.** O projeto inteiro está no GitHub (`digiaibrain-ia/bt-gerador`). Regras do projeto: `CLAUDE.md` na raiz.

## 1. Por que esta sessão existe
O Reginaldo é especialista em **blocos de PLC** e consegue revisá-los. O **medidor HTML**, os **fluxos Node-RED (JSON)** e os scripts foram feitos quase todos por IA ("vibe coding"). Ele não consegue revisar esse código linha a linha e está preocupado. Pedidos desta sessão:
1. Entender o tamanho do risco, sem alarme e sem otimismo.
2. Aplicar de novo os **5 fundamentos do Mano Deyvin** (já feitos em 2 rodadas; ver seção 5).
3. Pesquisar e aplicar **outras ferramentas** (seção 6).
4. Decidir o que simplificar para o código ficar **revisável por uma pessoa**.

## 2. O que existe (fatos medidos em 18/11/2026)
| Parte | Onde | Tamanho |
|---|---|---|
| Medidor HTML (tela do operador) | `dashboard/ferramentas/medidor_gerador_v1.10.226.html` | **13.124 linhas, 1,4 MB**, 35 blocos `<script>` dentro de um único arquivo, 126 versões no histórico interno |
| Módulos-fonte do medidor | `dashboard/modulos-fonte/` | 44 arquivos JS; copiados para dentro do HTML por script |
| Geradores do medidor | `dashboard/gerador/gerar_medidor_v1.10.NNN_v0.1.py` | 57 scripts; cada versão é gerada trocando trechos de texto da versão anterior |
| Fluxos Node-RED | `nodered/flows/bt2/` | 54 arquivos JSON (versões); maiores em torno de 140 KB |
| Geradores dos fluxos | `nodered/gerador/` | scripts JS que montam os JSON |
| Blocos de PLC | `plc/bt2/entrega_1200_v0.17/`, `entrega_et200_v0.7/` | cerca de 1.070 linhas de SCL nos blocos atuais da 1200 e do ET200 |
| Testes | `tests/e2e` (27), `tests/fb` (4), `tests/integracao` (13 + fases) | Playwright, node:test, harness Node-RED 5.0.9 com PLC simulado |
| Documentos | `docs/bt2/`, `BACKLOG_FORA_DE_ESCOPO.md`, `docs/licoes/REGISTRO_LICOES_v0.1.md` | |
| Skills do projeto | `.claude/skills/` | `bt2-licoes-*`, `bt2-metodo-portoes`, `cinco-fundamentos-auditoria-codigo` |
| Histórico | git | cerca de 300 commits |

## 3. Como o medidor é produzido hoje (ponto de atenção principal)
Cada versão nova = um script Python que lê o HTML anterior e faz `troca(texto_antigo, texto_novo)` com a garantia de que o trecho antigo aparece **exatamente 1 vez**. Isso é seguro contra erro de digitação, mas:
- O arquivo final é **um bloco único de 13 mil linhas**, difícil de ler, de navegar e de revisar por qualquer pessoa.
- Os módulos em `modulos-fonte/` convivem com código que foi só colado e emendado no HTML ao longo de 126 versões.
- Existe código morto, versões antigas de funções e comentários de histórico misturados no código.
- Não há linter, nem métrica de complexidade, nem detecção de duplicação.

## 4. O que protege hoje e o que não protege
**Protege:**
- A **segurança fica no PLC** (regra do projeto): perda de vida do 1515 derruba as saídas, nada religa sozinho, retorno da contatora some e a chave cai. Foi validado na bancada do ET200.
- **Testes automáticos**: dezenas de testes abrem a tela e conferem o comportamento (Patamar, alarmes, RNC, exportar). Passam em PLC simulado.
- Guarda de escrita no Node-RED (origem + JSON, 403), idempotência no RNC, fila e confirmação das chaves.
- Método de trabalho: versão nova sempre, relatório honesto, backlog, lições aprendidas.

**Não protege:**
- Teste que passa só prova que o código faz o que a IA entendeu. Não prova que entendeu certo o que o Reginaldo precisa.
- Nada disso foi testado no **PC BT2 nem no PLC real** de ponta a ponta (a bancada do ET200 cobriu só uma parte).
- A **1200 v0.17 é rascunho**: nunca compilou no TIA.
- Os testes são do mesmo autor do código (a mesma IA): o ponto cego pode ser o mesmo.
- O PLC ainda **não limita** capacidade nem tamanho de degrau (BK-AUD-04 e BK-AUD-10): hoje só o medidor e o Node-RED limitam.
- **Sem login** (BK-AUD-05): a guarda confere origem, não identidade.

## 5. Os 5 fundamentos do Mano Deyvin
Skill: `.claude/skills/cinco-fundamentos-auditoria-codigo` (com os prompts originais em `references/` e o mapa de adaptação ao BT2). Já executados:
- Rodada 1: `docs/bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_v0.1.md` (levou ao `rnc-api-v1.2`: guarda D3, idempotência obrigatória, 409 para chave reutilizada).
- Rodada 2: `docs/bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_RODADA2_v0.1.md`.
Os 5: testes de integração, nunca confiar no cliente, race condition, idempotência, separação de responsabilidades.
**Pendentes da auditoria:** BK-AUD-04 (capacidade no PLC), BK-AUD-05 (login), BK-AUD-09 (refatoração: separar responsabilidades do medidor), BK-AUD-10 (limite de degrau no PLC).
**Sugestão para a nova sessão:** rodar uma **rodada 3** com foco no medidor inteiro e nos fluxos atuais, e dessa vez começar pela pergunta "o que um revisor humano consegue conferir?".

## 6. Ferramentas pesquisadas (pesquisa de 18/11/2026)
Origem: pesquisa na web nesta sessão. **As fontes são em boa parte de fornecedores e blogs; confira nas páginas oficiais antes de adotar.** Prioridade é opinião minha.

| Prioridade | Ferramenta | Para quê | Encaixe no BT2 | Cuidado |
|---|---|---|---|---|
| **Alta** | [gitleaks](https://github.com/gitleaks/gitleaks) (com pre-commit) | Achar segredo e IP no Git | O projeto tinha **IPs reais de produção em 2 arquivos de teste** (`tests/integracao/trava_producao.js` e `t0_trava_producao.test.js`), contra a regra do CLAUDE.md. Rodar também no CI, porque o hook local pode ser pulado (`--no-verify`) | Usar baseline para o histórico antigo; conferir o comando no README oficial |
| **Alta** | [ESLint](https://eslint.org/docs/rules/complexity) (regra `complexity`) + `eslint-plugin-sonarjs` (complexidade cognitiva) | Medir funções grandes demais, código difícil de ler | O medidor tem funções gigantes; dá um mapa do que simplificar primeiro | Num HTML de 13 mil linhas, extrair os `<script>` para arquivos antes de rodar |
| **Alta** | [jscpd](https://cdn.jsdelivr.net/npm/jscpd@4.0.9/README.md) | Detectar código duplicado | 126 versões emendadas tendem a ter blocos repetidos | Os resultados são indicadores; decidir caso a caso |
| Média | [Semgrep OSS](https://semgrep.dev/docs/languages/javascript) (`--config p/javascript`) | Regras de segurança e má prática em JS | Cobre XSS, `eval`, injeção, uso inseguro de `innerHTML` na tela | A versão aberta analisa um arquivo por vez; regras Pro só na versão paga |
| Média | [fast-check](https://github.com/giogonzo/fast-check/blob/master/README.md) (teste de propriedades e de modelo) | Gerar milhares de casos e sequências de comandos | Ótimo para os FBs puros em JS: rodízio de chaves, mãe virtual, perfil de combustível, escalonamento. Dá um segundo olhar além dos testes escritos à mão | Tem curva de aprendizado (pré-condições, encolhimento do caso) |
| Média | [Stryker (mutation testing)](https://oneuptime.com/blog/post/2026-01-25-mutation-testing-with-stryker/markdown) | Medir se os testes realmente pegam bug (muta o código e vê se algum teste falha) | Aplicável aos módulos puros (`tests/fb`, núcleo do RNC). É uma resposta direta a "teste da mesma IA" | Lento; menos útil para os e2e do Playwright. Conferir a configuração em stryker-mutator.io |
| Média | CodeQL e Dependabot (GitHub) ([guia da GitHub](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code)) | Análise estática e dependências no CI | O repositório já está no GitHub | Mesmo cuidado: tratar achados como triagem, não como veredito |
| Média | `npm audit` (e acompanhar avisos de segurança) | Vulnerabilidade em dependências | Node-RED e nós de terceiros no PC BT2 | Ver ([discussão do fórum Node-RED](https://discourse.nodered.org/t/securing-node-js-applications-from-supply-chain-and-other-common-security-issues/90871)) |
| Média | Siemens **TIA Portal Test Suite** (Styleguide Checker) ([resumo](https://www.electro-matic.com/pressroom/blog/increase-serviceability-of-programming-code-with-tia-test-suite/7283/)) | Conferir blocos SCL contra um guia de estilo | Seria o equivalente, no mundo PLC, do que o ESLint é no HTML. O Reginaldo domina esse lado | Não confirmei na pesquisa se ainda é vendido nessa forma nem a licença: ver a página atual da Siemens |
| Baixa | [PLCopen Coding Guidelines / CODESYS Static Analysis](https://content.helpme-codesys.com/en/LibDevSummary/static_analysis.html) | Regras de referência para código IEC | Útil como fonte de regras, não como ferramenta direta para SCL | Não é da Siemens |

**Para o Node-RED especificamente** (de fóruns e de [FlowFuse](https://flowfuse.com/blog/2023/04/securing-node-red-in-production/), fontes de comunidade): flows em versão no Git (já feito), revisão antes de implantar, autenticação do editor, `npm audit`, TLS se houver exposição de rede, Node-RED sem permissão de escrita sobre os próprios certificados. Não achei um guia oficial de produção; consultar a documentação oficial.

**Revisão de código gerado por IA** ([GitHub](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code), [Gomboc](https://www.gomboc.ai/blog/how-to-review-ai-generated-code-for-security), [Veracode](https://www.veracode.com/resource/ai-generated-code-security-risks)): rodar as verificações automáticas antes da revisão humana; tratar o resultado das ferramentas como triagem; dar mais atenção a fronteiras de confiança, entrada de dados, segredos e operações privilegiadas; verificar a **intenção** antes do resultado; ter um dono humano para aprovar. O número "55 % do código de IA é seguro" vem de um estudo de fornecedor; conferir no original antes de citar.

**Minha opinião (não vem da pesquisa):**
1. O maior ganho para a revisão humana é **estrutural**: separar o HTML em arquivos pequenos e geráveis (um módulo por assunto), com o arquivo único só como produto de build. Hoje o produto e o código-fonte são a mesma coisa.
2. Escrever, em português, **o que cada módulo promete** (uma frase por função crítica). O Reginaldo revisa a promessa; os testes conferem se o código cumpre.
3. Escolher **poucas regras que não podem falhar** (por exemplo: nenhum comando de chave sai sem passar pela fila; nenhum botão comanda sem checar o banco) e testar só essas com rigor (fast-check e mutação), em vez de tentar cobrir tudo.
4. Pedir uma **segunda opinião independente** (outra pessoa ou outra ferramenta de IA, como já foi feito com o Gemini), porque a mesma IA revisando o próprio código repete o ponto cego.

## 7. Plano de trabalho sugerido (a validar com o Reginaldo)
1. **Passo 0 (rápido):** gitleaks + `npm audit` + corrigir os 2 arquivos com IP real. Resolve uma violação conhecida da regra do projeto.
2. **Passo 1 (medir):** extrair os scripts do medidor, rodar ESLint (complexidade), jscpd e Semgrep. Gerar um relatório de "pontos quentes" (funções mais complexas, duplicações).
3. **Passo 2 (provar):** fast-check nos FBs puros; Stryker neles.
4. **Passo 3 (rodada 3 dos 5 fundamentos):** com foco no que um humano consegue conferir.
5. **Passo 4 (simplificar):** decidir com o Reginaldo o que refatorar primeiro (candidato: BK-AUD-09), sempre em versão nova, sem tocar na bancada.
6. Em paralelo, **o lado PLC:** compilar a 1200 v0.17 no TIA e usar o Styleguide Checker, se o Reginaldo tiver a licença.

## 8. Perguntas para o Reginaldo na abertura da sessão
- Quem, além da IA, pode revisar o HTML e o Node-RED (alguém da TI, um colega)? Se sim, o desenho do código muda: pensar para esse revisor.
- Qual é o risco que mais preocupa: **segurança física** (a contatora liga fora de hora), **dado errado** no relatório do ensaio ou **disponibilidade** (tela travada)? Cada um pede prioridades diferentes.
- A conversa pode mexer na estrutura do medidor (refatorar) ou só medir e reportar nesta fase?
- Há alguma norma ou exigência de auditoria da empresa para o software do banco de teste?

## 9. Pendências abertas (do backlog e da bancada de 17/11)
- BK-PLC-02: batimento do 1515 em STOP (aguarda OK e bancada).
- BK-PLC-03: 504 e quarentena entre HTML e PLC (6 casos em 5 chaves no log de 17/11).
- BK-AUD-04, 05, 09, 10.
- BK-PERF-01 a 03; BK-RNC-02 (espelho do RNC no SQL, depois da volta do Reginaldo).
- Valores de gás e biometano a confirmar com o datasheet.
- 45 alarmes fugazes (<10 s): decidir um tempo mínimo antes de criar a ocorrência.
- Área "Repetidas" no diálogo de alarmes (opcional; Silenciar e Reconhecer foram cancelados).
- O teste `tests/e2e/alertas_falhas.js` precisa de servidor local na porta 8790 e não rodou na sessão.

## 10. Estado entregue
Medidor **1.10.226**, pacote **v1.26** (`scripts/pacote/gerar_pacote_implantacao_v1.26.py`), 1200 v0.17 (rascunho), ET200 v0.7 (provisório, validado), pacote do Alexandre. Branch de trabalho: `ccr-bt2-pacote-v1.21` (a `main` não tem estas mudanças; o PR #2 antigo ainda está aberto e aponta para a branch `ccr-4f9e06b7-bw4qef`).
