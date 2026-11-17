# Processo: Project (claude.ai) ⇄ GitHub ⇄ Sessão de código (Claude Web/Mobile) — v0.2 (01/11/2026)

> **Para quem não é da área técnica:** este documento explica, em português simples, onde cada versão dos
> arquivos do projeto mora, por que às vezes elas desencontram, e qual é o caminho combinado para
> manter tudo igual nos dois lugares. Os trechos marcados como "Técnico" detalham o mecanismo por trás,
> para quem for mexer nisso depois.

## 0. Recomendação: criar o repositório GitHub já no início de um projeto novo

**Resumo da recomendação:** ao começar um projeto novo (um novo Project no claude.ai com desenvolvimento
de código), crie o repositório GitHub correspondente **no mesmo dia**, antes de o projeto crescer — não
espere acumular dezenas de documentos para só depois gerar um ZIP e organizar tudo de uma vez.

**Por quê (leigo):** foi exatamente o atraso em criar o repositório que causou a divergência registrada na
seção 2 deste documento — quando o ZIP foi gerado, o projeto já tinha mais de 100 documentos, e nesse
processo manual único um arquivo ficou de fora e outro entrou desatualizado. Criar o repositório desde o
primeiro documento evita esse tipo de "corte" arriscado.

**Por quê (técnico):** sem repositório Git desde o início, todo o histórico de decisões fica só no
Project, que não versiona nada (cada escrita sobrescreve a anterior, seção 1). Se algo for perdido ou
sobrescrito por engano no meio do caminho, não há como recuperar. Com o Git criado desde o início, cada
commit já registra a evolução passo a passo, e a divergência fica sempre pequena (um ou dois arquivos por
vez) e fácil de notar — em vez de uma reconciliação grande e trabalhosa como a desta semana.

**Checklist sugerido para o início de um projeto novo:**
1. Criar o Project no claude.ai com as instruções do projeto.
2. No mesmo dia (ou na mesma sessão), criar o repositório GitHub vazio na organização correta.
3. Fazer a autorização do GitHub App uma vez (seção 4 deste documento), já deixando push liberado desde
   o início.
4. A partir do primeiro documento gerado, já seguir o fluxo da seção 3 (Project como fonte da verdade,
   sessão de código levando cada mudança relevante para o repositório em commits pequenos e frequentes).

## 1. As três "casas" onde o projeto existe hoje

| Lugar | O que é | Quem acessa | Tem histórico de versões? |
|---|---|---|---|
| **Project "NOde-red" (claude.ai)** | Uma pasta de documentos dentro da conta Claude, organizada em `claude/...` | Qualquer conversa (chat normal ou sessão de código) ligada a este Project | Não — cada arquivo é a versão mais recente; a anterior é sobrescrita |
| **Repositório GitHub `digiaibrain-ia/bt-gerador`** | Um repositório Git de verdade, público (leitura), com pastas `docs/`, `dashboard/`, `nodered/`, `plc/`, `catalogo/` | Navegador (github.com), app do GitHub no celular, ou qualquer sessão de código do Claude | Sim — todo commit fica guardado para sempre, é possível voltar no tempo |
| **Sessão de código do Claude (Claude Code, via app Web ou Mobile)** | Um "computador temporário" na nuvem, com acesso a arquivo, terminal e ao repositório GitHub | Você, pelo app do Claude (funciona igual no PC e no celular — não é uma ferramenta só de desktop) | Não guarda nada sozinha — só manipula o que está no Project e no GitHub |

**Por que (técnico):** o Project é um armazenamento simples de documentos, sem Git por trás — cada `project_write`
substitui o conteúdo do arquivo inteiro, sem diff nem log. O GitHub é um repositório Git normal, com
commits, branches e histórico completo. A sessão de código é o único lugar que enxerga os dois ao mesmo
tempo e consegue comparar/mover conteúdo entre eles.

## 2. Por que os dois lugares desencontraram (o que aconteceu em 31/10–01/11)

1. Você pediu, na conversa "HTML ensaio real", para organizar as pastas do projeto e gerar um **ZIP** com
   o conteúdo do Project.
2. Esse ZIP foi usado para montar a estrutura inicial do repositório GitHub (`dashboard/`, `docs/`,
   `nodered/`, `plc/`, `catalogo/`).
3. Na geração do ZIP, **um arquivo ficou de fora** (`QUATRO_BANCOS_VISUAL_E_MAPA_MOBILE_v1.10.125.md`) e
   **uma versão antiga de outro arquivo foi incluída** (o padrão de ocorrências na v1.0, quando o Project
   já tinha a v1.1 mais nova). Ao mesmo tempo, **um arquivo tinha sido corrigido diretamente no repositório
   GitHub** (`MANUAL_GUIADO_v0.5.md`) sem essa correção voltar para o Project.
4. Resultado: depois desse momento, repo e Project passaram a ter versões diferentes do mesmo assunto,
   sem nenhum aviso automático disso — cada lado "achava" que estava certo.

**Por que isso é fácil de acontecer (técnico):** gerar um ZIP e depois subir manualmente no GitHub é uma
cópia **única**, sem vínculo nenhum entre as duas fontes depois disso. Qualquer edição feita só de um lado
(só no Project, ou só no repo) cria divergência silenciosa — não existe sincronização automática entre
eles. É exatamente o problema que a recomendação da seção 0 e o processo da seção 3 resolvem.

## 3. O processo combinado daqui para frente

### 3.1 Regra de ouro
**O Project é a fonte da verdade por padrão.** Qualquer coisa nova nasce lá (ou é escrita lá assim que
pronta). O GitHub é o espelho com histórico — toda vez que algo no Project muda de forma relevante, uma
sessão de código leva essa mudança para o repositório, com commit explicando o que e por quê.

**Exceção:** quando uma correção é feita **direto no código** durante uma sessão de desenvolvimento (ex.:
ajustando um módulo JS no `dashboard/modulos-fonte/`), o repositório pode ficar momentaneamente à frente
do Project — nesse caso, a mesma sessão deve levar a versão nova de volta para o Project antes de
encerrar, para não repetir o problema da seção 2.

### 3.2 Passo a passo — abrir uma sessão de código (Web ou Mobile)
1. Abra o app do Claude (funciona igual no computador e no celular — a sessão roda na nuvem, não no
   aparelho).
2. Inicie ou continue uma sessão de código ligada a este Project.
3. **Você não precisa digitar nenhum comando de conexão.** A sessão pede acesso de leitura ao repositório
   automaticamente, sem perguntar nada (o repositório é público). Se for necessário gravar algo no GitHub
   (commit/push), a sessão pede o acesso de escrita também de forma automática — isso só funciona porque a
   autorização de organização (seção 4) já foi feita uma vez.

### 3.3 Passo a passo — levar uma mudança do Project para o GitHub
1. Peça para eu ler o arquivo do Project (`project_read`) e o arquivo correspondente no repositório.
2. Eu comparo os dois e aponto diferenças — nunca decido sozinho qual versão é a correta quando há
   dúvida; pergunto a você (como fiz com o padrão de ocorrências e o Manual guiado).
3. Com sua confirmação, eu escrevo o arquivo no repositório (`git add`), crio um commit com uma mensagem
   explicando o que mudou e por quê, e dou `git push`.

### 3.4 Passo a passo — levar uma mudança do GitHub (ou de código) para o Project
1. Eu leio o arquivo atual do repositório.
2. Escrevo (ou atualizo) o documento correspondente no Project com `project_write`, mantendo o mesmo
   conteúdo.
3. Isso garante que quem acessa só o Project (ex.: pelo chat normal, sem sessão de código) sempre vê a
   versão mais atual.

### 3.5 A conversa de chat "HTML ensaio real" (sem sessão de código)
Essa conversa **não tem acesso a arquivos nem ao Git** — é um chat comum, só com os documentos do Project
disponíveis. Ela continua útil para discussões rápidas e pedidos pontuais pelo celular, mas:
- Qualquer arquivo gerado lá (ex.: um HTML novo como artifact) precisa ser baixado e trazido manualmente
  para uma sessão de código antes de virar "oficial" no Project/GitHub.
- Não existe hoje nenhuma ponte automática entre essa conversa e o repositório.

## 4. A autorização do GitHub (feita em 01/11/2026 — só precisa ser feita uma vez por organização)

Existem **duas integrações diferentes** com o GitHub, fáceis de confundir:

| Integração | Para quê serve | Onde se configura | Status |
|---|---|---|---|
| **Conector GitHub (claude.ai → Configurações → Conectores)** | Buscar/ler informações do GitHub **dentro de conversas de chat normal** | Configurações da conta Claude | Já estava conectado, mas é outra coisa |
| **GitHub App "Claude"** | Dar à sessão de código permissão de **leitura e escrita (commit/push)** em repositórios específicos de uma organização | Direto no site do GitHub (`github.com/apps/claude/installations/select_target`), selecionando a organização `digiaibrain-ia` | ✅ Instalado em 01/11/2026 — é esta que faltava |

**Por que a leitura funcionava e a escrita não (técnico):** repositórios **públicos** no GitHub podem ser
clonados (somente leitura) por qualquer sessão, sem nenhuma autorização — é um acesso anônimo padrão do
Git. Já o **push** (gravar) exige credenciais de verdade, que só existem se o GitHub App "Claude" estiver
instalado na organização dona do repositório. Antes de 01/11 esse app não estava instalado em
`digiaibrain-ia`, por isso toda tentativa de `git push` era recusada mesmo com o clone de leitura
funcionando perfeitamente.

**O que fazer se voltar a dar erro de push no futuro:** é sinal de que a instalação do GitHub App foi
removida ou expirou na organização — repita o passo da seção 4, acessando o link acima e reautorizando.

**Para um projeto novo:** essa autorização, uma vez feita para a organização `digiaibrain-ia`, já vale
para qualquer repositório novo criado dentro dela — não precisa repetir por projeto, só confirmar que o
repositório está marcado como acessível ao app (a tela de instalação permite escolher "todos os
repositórios" ou selecionar manualmente cada um).

## 5. Resumo visual do fluxo

```
   Project "NOde-red" (claude.ai)         Repositório GitHub digiaibrain-ia/bt-gerador
   ────────────────────────────           ───────────────────────────────────────────
   documentos sem histórico        <──┐        commits com histórico completo
                                       │ sessão de código
                                       │ (Claude Code, Web/Mobile)
                                       └──>  git add / commit / push
                                             (ou project_write no sentido contrário)

   Conversa de chat normal "HTML ensaio real" (sem Git/arquivo)
   ────────────────────────────────────────────────────────────
   só enxerga o Project; qualquer saída precisa ser trazida manualmente
```

## 6. Pendências conhecidas deste processo

- Não há verificação automática periódica de divergência entre Project e GitHub — hoje a checagem é feita
  manualmente quando percebemos algo estranho (como aconteceu nesta reconciliação). Uma melhoria futura
  possível seria uma rotina de comparação, se fizer sentido para o projeto.
- O README do repositório descreve uma estrutura de pastas (`nodered/flows/bt1`, `bt2`; `plc/bt1`, `bt2`,
  `btg`; pasta `tests/`) que **ainda não existe** fisicamente no repositório — é a reorganização BT1/BT2
  planejada para a "virada de chave" de numeração (ver `docs/PLANO_NUMERACAO_BLOCOS_PLC.md` e as notas de
  29/10 sobre a CPU 1515 única). Até lá, README e estrutura real ficam temporariamente desalinhados.
