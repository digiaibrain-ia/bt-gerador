# Projects, palette via npm, CLI admin e telemetria

Fontes: `docs/user-guide/projects/index.md`, `runtime/adding-nodes.md`, `node-red-admin.md`, `docs/telemetry/index.md`

## Adicionar nós
- Catálogo: flows.nodered.org.
- **Editor**: menu → Manage Palette (Palette Manager). Aba *Nodes* = instalados, em uso, atualizações; aba *Install* = buscar e instalar.
- **npm**: no userDir (`~/.node-red`): `npm install <pacote>` e **reinicie** o Node-RED.
- `package.json` do userDir/projeto é criado na primeira partida (versão 0.0.1; edite conforme seu versionamento); o npm adiciona as dependências nele.
- **Atualizar**: Palette Manager, ou `npm outdated` e `npm install <modulo>@latest` em `~/.node-red`; reinicie em qualquer caso.

## CLI de administração
- Desde 1.1.0 está embutida: `node-red admin <comando>`. Avulsa: `npm install -g node-red-admin` (sudo no Linux/macOS; shell de Administrador no Windows) → `node-red-admin <comando>`.
- `target <url>` (padrão `http://localhost:1880`, ex.: `node-red-admin target http://node-red.example.com/admin`), depois `login` se houver autenticação. Guarda alvo e token em `~/.node-red/.cli-config.json`.
- Comandos: `target`, `login`, `list`, `info`, `enable`, `disable`, `search`, `install`, `remove`, `hash-pw` (não precisa login; gera hash para `adminAuth`/`httpNodeAuth`).

## Projects
Fluxos como aplicação redistribuível, apoiada em repositório **Git**.

### Habilitar
```javascript
editorTheme: { projects: { enabled: true } },
```
ou `NODE_RED_ENABLE_PROJECTS=true`. Requer `git` e `ssh-keygen` (verificados na partida). `editorTheme.projects.workflow.mode`: `"manual"` (commit manual, padrão) ou `"auto"` (commit automático); cada usuário pode mudar em User Settings → Git config.

### Primeiro projeto (tela de boas-vindas)
1. Configurar cliente Git (nome e e-mail dos commits; reaproveita config existente).
2. Nome e descrição.
3. Arquivos do projeto (migra os fluxos existentes; pode renomear).
4. Criptografia das credenciais — **fortemente recomendada** se for publicar (ex.: GitHub). A chave **não** fica no projeto; quem clonar precisa da chave ou reconfigura as credenciais.

Local: `~/.node-red/projects/<nome>`.

### Trabalhando
- Barra Info mostra o projeto; botão abre **Project Settings** (também em Projects → Project Settings). Abas:
  - *Project*: edita README.md.
  - *Dependencies*: `package.json` do projeto; o editor indica módulo não instalado, em uso, listado mas sem uso, e usado mas não listado. Manter isso em dia facilita compartilhar.
  - *Settings*: arquivos de fluxo, criptografia, branches e remotos.
- Aba **history** na barra lateral:
  - *Local Changes*: arquivos alterados (clique = diff; **+** = stage) e botão commit.
  - *Commit History*: commits do branch; botão Branch (checkout/criar); contador ahead/behind com push/pull para o remoto.
  - Não oferece rebase nem force push — use a linha de comando.

### Novos projetos (Projects → New)
- Abrir existente (só **um** projeto roda por vez; trocar muda os fluxos em execução; pode apagar projetos não ativos).
- Criar novo.
- Clonar repositório (http(s) ou git/ssh). Não coloque usuário/senha na URL http. SSH do GitHub: troque `git@github.com:user/proj` por `ssh://git@github.com/user/proj`. Não usa credential helper do git. Chaves: lista `~/.ssh/*.pub` com privada correspondente, ou gera novas (User Settings → Git config), salvas em `~/.node-red/projects/.sshkeys/` (por usuário se `adminAuth`).

## Telemetria (4.1.0+)
- Opt-in: nada é enviado sem consentimento. Em troca, avisa quando há versão nova.
- Coleta: id aleatório da instância, versão do Node-RED, versão do Node.js, tipo/release/arquitetura do SO. **Não** coleta dados pessoais, fluxos, segurança ou nada fora do Node-RED.
- Envio: 30 min após iniciar (ou após opt-in) e a cada 24 h, via HTTPS. Relatórios individuais guardados até 90 dias; acesso bruto só dos committers; agregados em dashboard público (telemetry.nodered.org).
- Desligar: diálogo Editor Settings; settings.js:
  ```javascript
  telemetry: { enabled: false, updateNotification: true },
  ```
  flag `--no-telemetry`; variável `NODE_RED_DISABLE_TELEMETRY`.
- `telemetry.updateNotification: false` desliga o aviso no editor (não dá pelo editor). O log do runtime sobre atualização não pode ser desligado.
