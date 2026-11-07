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
