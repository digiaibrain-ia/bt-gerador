# Instalação, execução e atualização

Fontes: `docs/getting-started/*.md`, `docs/faq/node-versions.md`, `faq/starting-node-red-on-boot.md`, `faq/customising-systemd-on-pi.md`

## Sumário
1. Versões do Node.js · 2. Local (npm, snap) · 3. Linha de comando · 4. Raspberry Pi / Debian · 5. Windows · 6. Docker · 7. Iniciar no boot · 8. Outras plataformas · 9. A partir do código-fonte

## 1. Versões do Node.js (atualizado jun/2026)
| Node-RED | Node.js mínimo |
|---|---|
| 5.x | 22 |
| 4.x | 18 |
| 3.x | 14 |
| 2.x | 12 |
- **Recomendado: Node 24.x.** Suporte às LTS ativas e de manutenção; versões ímpares não são testadas. Nós de terceiros: sem garantia.
- `nvm` serve para uso individual, **não** para serviço de sistema (depende do profile do usuário).
- Trocou a versão do Node.js? Rode `npm rebuild` em `~/.node-red` **e** no diretório de instalação do Node-RED (`npm list -g --depth 0` mostra onde ficam os globais).

## 2. Local
- Pi/Debian/Ubuntu/Diet-Pi: use o script do Pi (seção 4). RPM (RedHat, Fedora, CentOS): script em github.com/node-red/linux-installers. Windows: seção 5.
- npm: `sudo npm install -g node-red` (sem `sudo` no Windows). Atualizar: o mesmo comando.
- Docker rápido: `docker run -it -p 1880:1880 --name mynodered nodered/node-red`.
- **Snap** (`sudo snap install node-red`): não recomendado — container sem acesso ao disco principal (só home), `gcc` (nós com binários), `git` (Projects), GPIO, comandos externos do Exec.
- Rodar: `node-red`; parar: `Ctrl-C`. Editor: http://localhost:1880. O log de partida mostra versões, erros ao carregar nós, settings, userDir, arquivo de fluxos, context store e se Projects está ativo.

## 3. Linha de comando
```
node-red [-v] [-?] [--settings settings.js] [--userDir DIR]
         [--port PORT] [--title TITLE] [--safe] [flows.json|projectName]
         [-D X=Y|@file]
```
| Opção | Efeito |
|---|---|
| `-p`, `--port PORT` | Porta TCP (padrão 1880) |
| `--safe` | Inicia **sem executar os fluxos**; edite e, ao fazer deploy, eles iniciam (útil quando um fluxo trava o runtime) |
| `-s`, `--settings FILE` | Arquivo de settings (padrão `settings.js` no userDir) |
| `--title TITLE` | Título da janela do processo |
| `-u`, `--userDir DIR` | userDir (padrão `~/.node-red`) |
| `-v` | Saída detalhada |
| `-D X=Y` ou `-D @arquivo` | Sobrescreve settings (ex.: `-D logging.console.level=trace`; arquivo com uma linha por setting) |
| `-?`, `--help` | Ajuda |
| `flows.json` / `projectName` | Arquivo de fluxos; com Projects ativo, o projeto a iniciar |
| `--no-telemetry` | Desliga telemetria |

Argumentos para o **Node.js** (ex.: memória em Pi/BeagleBone): `node-red-pi --max-old-space-size=128 --userDir ...` (não existe no Windows) ou `node --max-old-space-size=128 red.js --userDir ...`.

## 4. Raspberry Pi e Debian (script oficial)
```
bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
```
- `--help` mostra parâmetros extras. Também serve para **atualizar**. Em Debian/Ubuntu pode ser preciso antes `sudo apt install build-essential git curl`.
- O script: remove versão existente; garante Node.js ≥ 20 (se não houver, instala a 22 LTS via NodeSource); instala o Node-RED mais recente; opcionalmente nós específicos do Pi; configura serviço e comandos.
- **Node 24 não tem build 32-bit → Pi armv6 deixa de ser suportado.**
- Local com pouca memória: `node-red-pi --max-old-space-size=256`.
- Serviço: `node-red-start` (inicia e mostra log; `Ctrl-C` não para o serviço), `node-red-stop`, `node-red-restart`, `node-red-reload`, `node-red-log`. Também em Menu → Programming → Node-RED no desktop.
- Autostart: `sudo systemctl enable nodered.service` (desligar: `disable`).
- Editor: `http://<hostname>:1880` (IP: `hostname -I`); prefira navegador fora do Pi (no Pi: Chromium ou Firefox).
- **Personalizar o serviço** (`/lib/systemd/system/nodered.service`): trocar `User`, `Group`, `WorkingDirectory`; `Environment="NODE_OPTIONS=--max_old_space_size=256"`; proxy: `Environment="HTTP_PROXY=..."`. Depois: `sudo systemctl daemon-reload`, `node-red-stop`, `node-red-start`.
- Variáveis de ambiente para o serviço: arquivo `~/.node-red/environment` (ver `05-variaveis-ambiente.md`).

## 5. Windows (instruções para Windows 10)
1. Instale Node.js LTS (MSI, precisa admin); reabra o terminal; confira `node --version; npm --version` (PowerShell) ou `&&` (cmd).
2. `npm install -g node-red` (adiciona `node-red` ao PATH).
3. `node-red` — o terminal precisa ficar aberto. userDir = `%HOMEPATH%\.node-red`.
- Prefira **PowerShell**. Não use prompt elevado sem necessidade. Não atualize o npm à parte.
- Alternativas: Chocolatey (`nodejs-lts`), nvm-windows. Node com Chakra Core não é recomendado.
- **Vários usuários**: pacotes globais vão para `%APPDATA%\npm` do usuário atual. Mude o prefixo (`npm config set prefix $env:ALLUSERSPROFILE\npmglobal`) e o cache (`npm config set cache $env:ALLUSERSPROFILE\npmglobal-cache --global`), ajuste o PATH do sistema.
- Módulos com binários: `npm install --global --production windows-build-tools` (prompt de admin; `--add-python-to-path` expõe Python 2.7). Erros de `node-gyp` em dependências opcionais geralmente não são fatais.
- Rodar no boot em produção: **Agendador de Tarefas** → "At startup" → programa `C:\Users\<user>\AppData\Roaming\npm\node-red.cmd`, com o mesmo usuário da instalação; condicione à rede; reinicie em falha (ex.: a cada minuto, 3 vezes); para log, redirecione stdout/stderr (use cópia do .cmd, que é sobrescrito em updates). PM2 ajuda no desenvolvimento mas não vira serviço no Windows; alternativa: NSSM.

## 6. Docker
Arquiteturas: amd64, arm32v6, arm32v7, arm64v8, s390x. Imagem: `nodered/node-red` (renomeada no 1.0).

### Básico
```
docker run -it -p 1880:1880 -v node_red_data:/data --name mynodered nodered/node-red
```
`-it` terminal; `-p` porta; `-v` volume nomeado em `/data` (persistência); `--name` nome. Desanexar: `Ctrl-p Ctrl-q`; `docker attach mynodered`; `docker start/stop mynodered`. Em segundo plano: `-d` no lugar de `-it`. Shell: `docker exec -it mynodered /bin/bash` (ex.: `npm install node-red-dashboard` e reiniciar o container).

### Imagens
- Base **Alpine** (pequena, usa musl — pode dar problema com alguns nós, ex.: SAP, codecs). Sufixo `-minimal`: sem ferramentas de build nativas.
- Docker detecta a arquitetura (`nodered/node-red:latest`), exceto **arm32v6** (Pi Zero/1): use a tag completa (ex.: `1.2.0-10-arm32v6`).
- Imagem **Debian** oficial desde 3.1.0 (para nós nativos que não funcionam no Alpine). Também há o script `docker-custom/docker-debian.sh` no repo node-red-docker.
- Estender Alpine: `USER root` → `RUN apk add ...` → `USER node-red`. Debian: `apt-get install`.

### Dados do usuário (`/data`)
- **Bind mount**: `-v /home/pi/.node-red:/data`. O usuário do container (uid **1000**) precisa ser dono: `sudo chown -R 1000:1000 caminho` (obrigatório ao migrar de 0.20 para 1.0).
- **Volume nomeado**: `docker volume create --name node_red_data`; backup: `docker cp mynodered:/data /backup`.
- **Atualizar**: `docker pull nodered/node-red`, `docker stop`, `docker rm`, `docker run` com o mesmo volume.

### Compose
```yaml
version: "3.7"
services:
  node-red:
    image: nodered/node-red:latest
    environment:
      - TZ=Europe/Amsterdam
    ports:
      - "1880:1880"
    networks:
      - node-red-net
    volumes:
      - node-red-data:/data
volumes:
  node-red-data:
networks:
  node-red-net:
```

### Imagem com seus arquivos (projeto no git)
Pasta com `Dockerfile`, `package.json` (nós extras; precisa de `scripts.start`, ex.: `"node $NODE_OPTIONS node_modules/node-red/red.js $FLOWS"`), `flows.json`, `flows_cred.json`, `settings.js`:
```dockerfile
FROM nodered/node-red
WORKDIR /data
COPY package.json /data
RUN npm install --no-update-notifier --no-fund --only=production
WORKDIR /usr/src/node-red
COPY settings.js /data/settings.js
COPY flows_cred.json /data/flows_cred.json
COPY flows.json /data/flows.json
```
- **Não funciona se depois montar `/data` como volume externo** (copie os arquivos para o volume nesse caso).
- `COPY package.json` + `npm install` cedo = cache de build mais rápido.
- Segredo: `credentialSecret: process.env.NODE_RED_CREDENTIAL_SECRET` no settings e `docker run -e "NODE_RED_CREDENTIAL_SECRET=..."`.
- Build: `docker build -t imagem:tag .`; dev: `docker run --rm -e ... -p 1880:1880 -v \`pwd\`:/data --name nome imagem`.

### Variáveis de ambiente do container
- `FLOWS` (padrão `flows.json`; `-e FLOWS=""` usa o `flowFile` do settings)
- `NODE_RED_ENABLE_SAFE_MODE=true` (inicia sem rodar fluxos), `NODE_RED_ENABLE_PROJECTS=true`
- `NODE_OPTIONS="--max_old_space_size=128"` (argumentos do Node.js)
- `TZ=America/Sao_Paulo` (fuso)

### Rede entre containers
`docker network create iot`; rode broker e Node-RED com `--network iot`; o Node-RED acessa o broker pelo **nome do container** (ex.: host `mybroker`, porta 1883), sem expor a porta no host.

### Hardware e permissões
- Serial: `--group-add dialout` e/ou `--device=/dev/ttyACM0`.
- Permission denied: rode com outro usuário/grupo (ex.: `-u node-red:dialout`); wiki "Permissions and Persistence" do node-red-docker.
- **GPIO nativo do Pi foi removido no 1.0** → `node-red-node-pi-gpiod` + daemon PiGPIOd no host (host geralmente `172.17.0.1:8888`; confira com `docker exec -it mynodered ip route show default | awk '/default/ {print $3}'`).
- Vários containers: `docker run -d -p 1880 nodered/node-red` (porta aleatória; veja com `docker ps`).

## 7. Iniciar no boot
- Pi/Debian/Ubuntu: script oficial (systemd). RPM: script RPM (systemd).
- **PM2** (Linux/macOS):
  ```
  sudo npm install -g pm2
  which node-red                                   # /usr/bin/node-red ou /usr/local/bin/node-red
  pm2 start /usr/bin/node-red -- -v                # "--" antes dos argumentos do Node-RED
  pm2 start /usr/bin/node-red --node-args="--max-old-space-size=128" -- -v   # pouca memória
  pm2 info node-red ; pm2 logs node-red
  pm2 save ; pm2 startup                           # ou: pm2 startup systemd
  ```
  Como root, use `--userDir`. Instalação local: `node_modules/node-red/bin/node-red`. (Nota antiga da doc: issue do PM2 exigia editar `PM2_HOME` em `/etc/init.d/pm2-init.sh`.)
- **Windows**: NSSM ou Agendador de Tarefas.
- Scripts da comunidade: systemd (o do instalador oficial), init.d, launchd (macOS), NSSM, rc.d (FreeBSD).

## 8. Outras plataformas
- **Android** (Termux, via GitHub/F-Droid — a da Play Store não é mantida): `apt update; apt upgrade; apt install coreutils nano nodejs; npm i -g node-red; node-red`. Autostart com Termux:Boot (script `#!/data/data/com.termux/files/usr/bin/sh`, `termux-wake-lock`, `node /data/data/com.termux/files/usr/bin/node-red`). Hardware via Termux:API + `apt install termux-api` + nó Exec. Tecla volume-down = Ctrl.
- **BeagleBone**: imagens de 4 GB já trazem Node-RED como serviço, **rodando como root** (`/root/.node-red`). Log `sudo journalctl -f -u node-red -o cat`; `sudo service node-red stop|start`; `systemctl enable|disable node-red.service`. Atualizar: `sudo apt update && sudo apt upgrade nodejs bb-node-red-installer` — **não** use o script do Pi. Porta também definida em `/lib/systemd/system/node-red.socket`. Nós de I/O: `beaglebone-io johnny-five node-red-contrib-gpio`.
- **AWS**: Elastic Beanstalk com fluxos no S3 (`node-red-contrib-storage-s3` como `storageModule`; acesso admin pela porta 8081 liberada no security group); EB com alta disponibilidade (repo guysqr/node-red-ha-on-aws, EFS, CloudFormation, HTTPS e Auth0); ou EC2 Ubuntu (libere a porta 1880; instale Node.js e `npm install -g node-red`; PM2 para boot). Os exemplos da página usam versões antigas (Node 10/12, Node-RED 1.1) — atualize.
- **Azure**: VM Ubuntu (Node.js é single-thread: um núcleo basta), regra de entrada TCP 1880, mesma instalação e PM2.
- **FlowFuse**: plataforma multi-tenant (colaboração, deploy remoto, suporte profissional); cloud com trial, ou local/Docker/Kubernetes.
- **IBM Cloud**: Starter Kit descontinuado em fev/2023.

## 9. A partir do código-fonte
Requer Node.js suportado, git e `sudo npm install -g grunt-cli`.
```
git clone https://github.com/node-red/node-red.git
cd node-red
git checkout dev        # opcional; "main" = estável + correções, "dev" = desenvolvimento
npm ci
grunt build
npm start               # argumentos: npm start -- <args>
grunt dev               # rebuild/restart automático ao editar; aceita --flowFile=arquivo.json
```
