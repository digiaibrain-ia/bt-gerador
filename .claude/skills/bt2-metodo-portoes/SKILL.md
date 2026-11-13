---
name: bt2-metodo-portoes
description: Metodo de trabalho do projeto BT2 (banco de cargas / gerador - Node-RED, PLC Siemens S7, medidor HTML e SQL Server) em portoes com plano, OK, versoes novas, testes de integracao, relatorio honesto e pacote de entrega. Use SEMPRE que o pedido envolver alterar, testar, revisar ou implantar fluxos Node-RED, blocos SCL/DB do PLC, o medidor_gerador HTML, o PC BT2, a bancada, o banco SQL Server do projeto ou montar pacote para a TI, mesmo que o usuario nao diga "portao" nem "metodo".
---

# Metodo BT2: portoes, versoes novas, testes e entrega honesta

Este metodo nasceu das Fases 1 a 3 (testes de integracao, seguranca, corridas/idempotencia) e existe porque o sistema comanda um banco de cargas real: um erro de logica pode energizar carga. A ideia central e **nunca confiar so no que parece certo; provar, registrar o limite da prova e deixar voltar atras**.

## Regras de ouro (e por que existem)
1. **Plano e OK explicito antes de mudar arquivo de producao** (fluxo, front, bloco de PLC). Mudanca em arquivo novo (versao nova, teste, documento) pode seguir sem pedir de novo. Motivo: o usuario precisa poder reverter e a TI precisa saber o que entra.
2. **Nunca tocar PC de producao, PLC ou DSE** a partir deste ambiente. O PC BT2 nao alcanca o GitHub: tudo vai por **pacote .zip** que o usuario leva do notebook.
3. **Versao nova, nunca sobrescrever** (`chaves-56-api-v3.4.json`, nao editar a v3.3). Gerar a versao nova por **script gerador** em `nodered/gerador/` que aborta se o trecho original mudou e se o destino ja existe. Motivo: rollback e auditoria.
4. **Nao enfraquecer teste.** Defeito confirmado entra como teste `todo` com ID e gravidade, escrevendo o comportamento ESPERADO; so se troca a premissa de um teste com aprovacao do contrato (invariante > codigo de status).
5. **Fora de escopo vai para o `BACKLOG_FORA_DE_ESCOPO.md`**, nao e corrigido no meio de outra tarefa.
6. **Sem segredo nem IP real no Git.** Enderecos vem de variavel do processo (PM2: `PLC_IP`, `DSE_URL`) ou da aba do fluxo; exemplo so com marcadores em `config/`.
7. **Relatorio honesto:** dizer o que foi provado, com numeros, e o que NAO da para provar daqui (PLC simulado, driver S7, TIA). Corrigir estimativa propria quando a medicao desmentir.
8. Commit e push na branch designada; mensagem sem identificar o modelo.

## Ciclo de um portao
1. **Plano curto**: causa raiz, proposta, riscos, impacto no front e no PLC, criterio de aceitacao (teste).
2. **OK do usuario** (ou da instancia que ele indicar) para o que mexe em producao.
3. **Implementar em versoes novas** (gerador + testes).
4. **Provar**: suite completa; **verificacao por mutacao** (o mesmo teste deve FALHAR na versao anterior e passar na nova).
5. **Relatorio**: o que foi feito, evidencias (tabela), limites, o que depende da bancada/TI.
6. Commit/push; so entao o proximo portao.
Referencia detalhada dos testes e comandos: `references/testes_e_entrega.md`.

## Testes (resumo)
`tests/integracao/` roda os fluxos REAIS lidos do disco num Node-RED local com PLC simulado em memoria (latencia, jitter, queda, trace). Comando: `npm --prefix tests/integracao test` (leva ~9 min; rode em segundo plano; cada arquivo precisa terminar em <120 s). Estresse: `BT2_ESTRESSE_S=600`.

## Entrega para a TI/bancada
Pacote .zip + `MANIFESTO.sha256` + roteiro unico + checklist de bancada com criterio go/no-go e rollback. Bancada: PC BT2 fisico com **carga de potencia desacoplada**, execucao conjunta Engenharia + TI. Detalhes em `references/testes_e_entrega.md`.

## SQL Server (futuro; o usuario administra o banco)
Principios acordados: o SQL fica **fora do caminho de comando** (o PLC e a fonte da verdade do controle; gravar no SQL e assincrono, com buffer e nova tentativa, e a queda do SQL nunca atrasa nem recusa comando); esquema versionado em arquivos `.sql` no repositorio (sem credenciais); credenciais so em variavel do PM2; gravacao idempotente (chave natural, ex. sessao+n, id do ensaio); acesso pelo Node-RED (rotas/fluxos). Usos priorizados: (1) log de comunicacao e eventos (alimenta a analise da bancada), (2) registro do ensaio, (3) auditoria dos comandos de seguranca, (4) inventario de implantacao, (5) curvas do ensaio. Antes de desenhar: perguntar tipo/versao do SQL, se o PC BT2 o alcanca, nos Node-RED instalados, backup e retencao. Tratar como uma fase nova com portoes, sem mexer nos pacotes ja congelados.

## Comunicacao
Portugues claro, tabelas curtas, sem jargao desnecessario. O usuario (Reginaldo) e tecnico em PLC; explicar passos de Node-RED/Git/Windows com o caminho exato. Estado atual do projeto e pendencias: `references/estado_projeto.md` (releia e confirme com o usuario, o estado muda).

## Regras acrescentadas em 09–10/11/2026 (método consolidado com o Reginaldo)
Nasceram de correções dele durante o trabalho dos blocos do PLC de cargas 1200. Valem junto com as regras de ouro acima.
9. **Responder só o que foi perguntado.** Não ampliar escopo nem trabalhar "achismo" ("o negócio é pra ser fácil e fica complicando"; "você está gastando muito token com coisa que eu não estou pedindo"). Se o pedido for ambíguo, dizer a leitura em uma linha e agir; perguntar só o que muda o resultado, sempre com uma recomendação.
10. **Proposta → decisão → execução.** Trazer a melhor opção, esperar a decisão, só então executar (exceto o que ele já autorizou: "pode seguir", "pode fazer"). Autorizado ≠ vale para o próximo assunto.
11. **Espelhar o que já existe e funciona antes de inventar.** Ler os blocos reais do repositório (ex.: os do ET200) e portar com a menor mudança ("o 1200 é o mesmo, com o código acertado"). Arquitetura própria só se ele pedir.
12. **Escopo = o que existe hoje.** Hoje só há BC56 e BC400; os testes com gerador ligado são só neles. Não gerar blocos para bancos inexistentes, nem sinais "do futuro" (competência, chaveamento, ventilador) sem pedido.
13. **Entregar só o que ele vai usar:** sem versões anteriores, sem arquivos de texto extras, zip só quando pedido; um guia único e atual quando pedido (nunca vários roteiros em paralelo).
14. **Bloco de PLC:** DB entra por DB_ANY (só o número) e o bloco trata por offset (PEEK/POKE); PUT/GET continua com ponteiro absoluto; escritor único por campo (PEDIDO só pelo PUT do 1515, RESPOSTA só pelo bloco do banco). Todo bloco gerado por script e conferido por script de offsets. Compilação no TIA e PEEK/POKE na CPU: sempre dito como NÃO provado.
15. **Documentos:** versão nova, nunca sobrescrever; superado vai para `docs/arquivo/` (git mv, reversível) e entra no `docs/INDICE_DOCUMENTOS.md`. CSV que abre no Excel leva BOM UTF-8. IP real nunca em documento novo (marcadores [IP_1515], [IP_ET200], [IP_PC_BT2]).
16. **Sessões do Project:** o extrato usa `docs/criatividade/PROMPT_EXTRATO_v1.0.md`; cada linha do rastreio leva nível de evidência A/B/C; extrato é relato do assistente, não prova. Teoria de "previsibilidade criativa" só depois de padrão provado.
17. **Teste do método:** `python3 scripts/metodo/verifica_metodo_v0.1.py [AAAA-MM-DD]` confere no Git, sem opinião: arquivo com versão no nome não alterado (R1), sem IP em arquivo novo (R2), gerador para todo medidor/fluxo novo (R3), nenhum .zip commitado (R4). Exceções ficam escritas no próprio script, com motivo. Verificado por mutação (3 violações injetadas foram pegas).
18. **Revisão de interface = tela do notebook (1536×694) + hover/foco sem quebra de layout + pós-ensaio (nada fica travado).** O relatório diz **na primeira linha** o que o teste NÃO cobre ("validado" = o que o teste verifica). Robô Dev/Operador oculto: modo "Inspeção visual (rápida)". Testes: `fase4/o_hover_estavel`, `n_balao_ibub`, `p_ciclo_demo_gravar`, `q_robo_inspecao_visual`. Lições LL-046 a LL-049.
19. **Entrega de blocos de PLC = fecho de dependências conferido.** Antes de entregar: `python3 plc/bt2/gerador/verifica_pacote_scl_v0.1.py <pasta>` (todo bloco usado está definido; DBs de instância incluídos); a entrega informa a **ordem de importação** e a lista do que é **externo** (tags/DBs de outro projeto). Compilação no TIA continua "não provada". Lição LL-051.
20. **Toda entrega leva um texto CURTO, direto e simples de como usar** (`COMO_USAR.txt` dentro do zip, no máximo ~15 linhas: ordem de importação, o que criar/trocar, o que conferir, o que mandar de volta se der erro). Pedido do Reginaldo em 11/11/2026; vale para zip de blocos, pacote de implantação e medidor. Sem outros textos soltos nem versões antigas dentro do zip. Nomes de bloco seguem a convenção do projeto (DB de instância = `db<n>i_...`). LL-051/LL-052.

21. **Fluxo Node-RED segue o padrão de fluxos** (`docs/bt2/padroes/PADRAO_FLUXOS_NODERED_v0.1.md`, decisão de 13/11/2026): **a versão do arquivo é a mesma na aba, no info da aba e na nota de cabeçalho** (`<Nome> vX.Y`); **todo nó de lógica com info**; nota (comment) com no máximo **80 caracteres** (texto longo vai no info); layout em faixas por rota + área compartilhada, com grupos e nós link no lugar de fios longos. Gerar por `nodered/gerador/organiza_fluxo_v0.1.py`; provar com `verifica_equivalencia_fluxo_v0.1.py` (mesmos nós/propriedades/ligações) e a mesma bateria de testes via `BT2_FLUXO_TROCA`; conferir com `scripts/metodo/verifica_fluxos_padrao_v0.1.py`. Entrega de fluxo: nome do arquivo com versão; `.json` pronto para importar. O campo `flow` da API (ex.: `chaves-v2.5`) é o ID do contrato, não a versão do arquivo.
