# Tutoriais, FAQ, hardware e onde buscar ajuda

Fontes: `docs/tutorials/*.md`, `docs/faq/*.md`, `docs/developing/index.md`, `docs/index.html`

## Tutorial 1 — Primeiro fluxo (inject → function → debug)
1. Abra o editor: `http://localhost:1880` (ou `http://<ip>:1880` de outra máquina).
2. Arraste um **Inject** (dispara por botão ou intervalo); selecione-o para ver propriedades e ajuda na barra Info.
3. Arraste um **Debug** (mostra `payload` por padrão; pode mostrar o objeto inteiro).
4. Ligue a saída do Inject à entrada do Debug.
5. **Deploy** — até aqui os nós só existem no editor.
6. Com a aba Debug aberta, clique no botão do Inject: aparecem números (ms desde 1970).
7. Apague o fio (selecione + Delete), coloque um **Function** entre os dois com:
   ```javascript
   var date = new Date(msg.payload);
   msg.payload = date.toString();
   return msg;
   ```
   Done → Deploy → Inject: agora aparece data legível.

## Tutorial 2 — Dados externos (inject → http request → csv → switch → change → debug)
1. **Inject** com repeat "every 5 minutes".
2. **HTTP Request** com URL `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.csv` (terremotos significativos do mês, USGS).
3. **CSV** com "First row contains column names".
4. **Debug** na saída do CSV.
5. Fios: Inject → HTTP Request → CSV → Debug.
6. **Switch** em `msg.payload.mag`, regra `>=`, tipo **number**, valor `7`; segundo fio CSV → Switch.
7. **Change**: set `msg.payload` = string `PANIC!`; depois outro **Debug**.
8. Deploy, clique no Inject: cada linha vira objeto (`{"time":..., "mag":6.6, "place":..., ...}`); magnitudes ≥ 7 geram `"PANIC!"`. Baixe o limite para testar (e faça deploy de novo).
(Os JSON dos dois fluxos estão nas páginas para importar.)

Outros: canal do YouTube (vídeos curtos, < 1 h no total; ainda não atualizados para a v5) e Node-RED Academy (cursos progressivos).

## FAQ
- **Nome e história / Flow-Based Programming**: nodered.org/about.
- **Versões do Node.js**: ver `10-instalacao.md` (5.x → Node 22+, recomendado 24).
- **Iniciar no boot** e **personalizar o systemd do Pi**: `10-instalacao.md`.

### Raspberry Pi GPIO
- `node-red-node-pi-gpio`: vem com o script oficial; simples. Raspberry Pi OS já está configurado; outras distros (Ubuntu) precisam de passos extras (README do nó).
- `node-red-node-pi-gpiod`: usa o daemon PiGPIOd; mais recursos (PWM, servo); obrigatório no Docker.
- `node-red-contrib-gpio`: vários tipos de placa via Johnny-Five.

### Arduino (via USB serial)
- Não use a IDE do Arduino e os nós ao mesmo tempo (conflitam) — pare o Node-RED para reprogramar.
- **Arduino Cloud**: `@arduino/node-red-contrib-arduino-iot-cloud`.
- **Serial**: nós Serial In/Out com o mesmo baud rate dos dois lados.
- **Firmata**: carregue o sketch *StandardFirmata* (Files → Examples → Firmata); `cd ~/.node-red && npm install node-red-node-arduino`; reinicie. Saída: digital (0/1), analógica (0–255), servo (0–180). Entrada analógica pode vir a 40 leituras/s — reduza na config da serial.
- **Johnny-Five** (inclui I2C): via `node-red-contrib-gpio`, ou `functionGlobalContext: { jfive: require("johnny-five"), j5board: require("johnny-five").Board({repl:false}) }` + `npm install johnny-five` (acesse cada pino uma vez; crie o objeto do LED uma vez e guarde em contexto).

## Desenvolvimento do núcleo
Documentação interna ainda não existe; há guia de contribuição (nodered.org/about/contribute), notas de design na wiki (github.com/node-red/node-red/wiki), fórum e Slack. Rodar do código-fonte: `10-instalacao.md`.

## Onde buscar ajuda
- Fórum: discourse.nodered.org · Slack: nodered.org/slack · Blog: nodered.org/blog · Mastodon: @nodered@social.nodered.org
- Flow Library (nós e fluxos da comunidade): flows.nodered.org
- Documentação: nodered.org/docs · Cookbook: cookbook.nodered.org
