# 📚 Glossário Técnico — Projeto Banco de Testes de Gerador Diesel

**Objetivo**: Explicar termos técnicos do projeto de forma clara e educativa.  
**Atualizado**: 24/10/2026 (v2.0: Operador secreto, DEV.OPS, canal × banco físico, ComOk/tVida, leitura de volta, gerenciador v1.2, DB38/DB39 — HTML v1.9.76)  
**Versão**: 2.1

---

## **A**

### **API (Application Programming Interface)**
Interface de programação de aplicações. É um "contrato" entre dois sistemas (HTML ↔ Node-RED, por exemplo) que define:
- **Qual URL chamar**: `/api/chaves/56/ligar`
- **O que enviar**: `{indice: 1, ligar: true}`
- **O que recebe de volta**: `{ok: true}` ou `{ok: false, erro: "..."}`

💡 **No projeto**: Usamos REST HTTP — URLs simples que o HTML chama (GET, POST) pra falar com o Node-RED.

---

### **Array (Vetor)**
Lista ordenada de elementos do mesmo tipo.

**Exemplo no projeto**:
```
CbLigar[1..16] = [FALSE, TRUE, FALSE, ...]
                  ↑      ↑      ↑
              chave 1  chave 2  chave 3
```

---

## **B**

### **Banco de dados (DB)**
Estrutura que guarda dados no PLC. No projeto usamos:
- **DB150**: Dados das chaves do BC56 (comando, feedback, setup)
- **DB158**: Dados das chaves do BC400
- **DB52**: Dados do DSE (telemetria: kW, tensão)
- **DB53**: Dados do ensaio

---

### **Borda de subida (Rising edge)**
O momento em que um sinal muda de `FALSE` para `TRUE`.

**Exemplo**:
```
ComandoSalvar: FALSE → TRUE → FALSE
                 ↑ (borda!)
```

O FB100 detecta essa borda e executa a ação "Salvar chave".

---

### **Base (kW sem carga)**
Medição de potência quando o gerador está ligado **mas sem nenhuma chave de carga ligada**.
- Usada para "limpar" o ruído da medição
- Fórmula: `kW Real = kW Medido − Base`

💡 **No projeto**: Calculada automaticamente no FB100 (média móvel 80/20).

---

## **C**

### **Callback**
Função que você passa pra outra função executar "depois" (quando algo acontecer).

**Exemplo no HTML**:
```javascript
button.onclick = () => { mostraAba('tabLogs'); }  // callback
```

Quando o usuário clica, a função dentro `{ }` é executada.

---

### **CB (bit de comando)**
Bit que o HTML/Node-RED escreve no PLC pra **ordenar** uma ação.

**No projeto**:
- `CbLigar[1..16]` = comando pra fechar a chave física (TRUE/FALSE)

---

### **CSS**
Linguagem que define a **aparência** visual (cores, tamanhos, posições).

**Exemplo no projeto**:
```css
.tile.cmd { outline: 2px solid #e08a00; }  /* laranja pro comando */
.tile.real { outline: 2px solid #2a8c52; } /* verde pro feedback */
```

---

## **D**

### **DOM (Document Object Model)**
Representação do HTML como uma árvore de elementos que o JavaScript pode manipular.

**Exemplo**:
```
<body>
  <button id="bLogs">Logs</button>  ← elemento no DOM
</body>

// JavaScript
$('bLogs').onclick = ...  // acessa o DOM, encontra o elemento
```

💡 **No projeto**: a janela de Logs (v1.9.63) fica escrita no HTML **antes** do script principal para o código de "arrastar janelas" encontrá-la; elemento que ainda não existe no DOM não recebe evento.

---

### **Delay (Atraso)**
Tempo de espera programado.

**No projeto**:
- `delay: 450ms` = esperar 450 milissegundos depois de escrever no PLC antes de ler de volta (pra deixar o comando ser executado)

---

## **E**

### **Endpoint (S7)**
Nó de configuração no Node-RED que guarda as informações do PLC:
- IP: `172.17.209.135`
- Rack/Slot: `0/1`
- Ciclo: `200ms` (quanto tempo leva pra ler/escrever todas as variáveis)

💡 Não é uma "rota HTTP" (que é `/api/...`), é a **conexão física** com o PLC.

---

### **EnsaioAtivo**
Bit no PLC que indica se um **ensaio automático está em andamento**.

**No projeto**:
- Hoje: fixo `FALSE` (manual)
- Futuro: será `TRUE` quando o ensaio automático rodar
- Efeito: zera `CbLigar[]` pra segurança

---

## **F**

### **FB (Bloco de função)**
Programa reutilizável no PLC que faz uma tarefa específica.

**No projeto**:
- `FB100` (`fb100_setupChaves`) = faz o Setup de uma chave (calcula Base, kW Real, Resistência)

---

### **Feedback (SB)**
Sinal que o PLC **lê** de uma entrada digital (chave física) pra confirmar que a ação aconteceu.

**No projeto**:
- `SbLigada[1..16]` = está a chave **realmente** fechada? (TRUE/FALSE)
- Mapeado na entrada digital do PLC

---

### **Flow (Fluxo Node-RED)**
Arquivo JSON que descreve a lógica de uma parte do sistema.

**No projeto**:
- `chaves-56-api-v2.json` = fluxo que gerencia as chaves do BC56
- Contém nós (http in, s7 out, function, etc.) conectados por "wires"

---

## **G**

### **GET (HTTP)**
Requisição HTTP que **lê** dados (não altera nada).

**No projeto**:
```
GET /api/chaves/56
→ Retorna: {habilitada: [T,F,T,...], ligada: [F,T,F,...], ...}
```

---

## **H**

### **HTTP (HyperText Transfer Protocol)**
Protocolo de comunicação entre navegador e servidor.

**No projeto**: Usado entre HTML ↔ Node-RED (GET, POST)

---

## **I**

### **I/O Mapping (Mapeamento de Entrada/Saída)**
Configuração no TIA Portal que liga:
- **Entrada digital do PLC** (física, do ET200 — modelo a confirmar) → **Variável no DB** (ex: `DB150.X2.0` = `sb.ligada[1]`)
- **Variável no DB** → **Saída digital do PLC** (para acionar o contator)

💡 **No projeto**: O `SbLigada[]` é escrito por esse mapeamento, não por código PLC.

---

## **J**

### **JavaScript (JS)**
Linguagem de programação do HTML (executa no navegador).

**No projeto**: Toda a lógica da tela, cliques, cálculos locais.

---

## **L**

### **Listener / addEventListener**
Forma de registrar uma ação que acontece quando um evento ocorre.

**Exemplo**:
```javascript
button.addEventListener('click', () => {
  console.log('Clicou!');
});
```

💡 **v1.9.63**: a janela de Logs usa `addEventListener` nos botões (Atualizar, BC56/BC400, Imprimir).

---

### **Logging (Registro de eventos)**
Ato de guardar informações de cada operação (timestamp, operação, resultado).

**No projeto**: `GET /api/logs/{56|400}` devolve o histórico das **escritas** (POST) e das leituras (GET) que **falharam**; leituras que deram certo não entram. Fica na memória do Node-RED (zera ao reiniciar/Deploy).

---

## **M**

### **Modbus TCP**
Protocolo industrial de comunicação entre dispositivos (DSE, PLC, etc.).

**No projeto**: Node-RED lê o DSE (gerador) via Modbus TCP na porta 502.

---

## **N**

### **Node-RED**
Plataforma visual pra integrar sistemas (ler do PLC, falar com HTML, processar dados).

**No projeto**: Faz a ponte entre HTML ↔ PLC.

---

## **O**

### **Offset (Posição de memória)**
Endereço exato dentro de um DB onde uma variável começa.

**Exemplo**:
```
DB150,X0.0 = byte 0, bit 0 = CbLigar[1]
DB150,X0.1 = byte 0, bit 1 = CbLigar[2]
```

💡 **No projeto**: os offsets do DB150 e do DB158 são iguais — boa prática de design.

---

## **P**

### **POST (HTTP)**
Requisição HTTP que **escreve/altera** dados.

**No projeto**:
```
POST /api/chaves/56/ligar
Payload: {indice: 1, ligar: true}
→ Escreve CbLigar[1] = TRUE no DB150
```

---

### **Promise / async-await**
Forma moderna de JS lidar com operações que levam tempo (chamadas HTTP, por exemplo).

**Exemplo**:
```javascript
async function logCarrega() {
  const res = await fetch('/api/logs');  // espera a resposta
  const data = await res.json();         // espera o parsing
  // agora usa data
}
```

💡 **No projeto (v1.9.63)**: `carrega()` da janela de Logs usa async/await para buscar `/api/logs/{banco}`.

---

## **R**

### **REST (Representational State Transfer)**
Padrão de design pra APIs HTTP simples e previsíveis.

**Regras**:
- GET pra ler
- POST pra escrever
- URLs descritivas: `/api/recurso/ação`

💡 **No projeto**: Seguimos REST (ex: `/api/chaves/56/ligar`).

---

### **Releitura (Readback)**
Ato de **ler de volta** o valor depois de escrever, pra confirmar que a escrita funcionou.

**No projeto**:
```
1. HTML → POST /api/chaves/56/ligar {indice:1, ligar:true}
2. Node-RED escreve CbLigar[1] = TRUE no PLC
3. Node-RED espera 450ms (delay)
4. Node-RED lê CbLigar[1] de volta
5. Se leitura == TRUE → responde {ok:true}
6. Se leitura == FALSE → responde {ok:false, erro: "..."}
```

---

## **S**

### **S7 (Siemens S7)**
Família de PLCs industriais da Siemens (S7-1200, S7-1500, etc.).

**No projeto**: Usamos S7-1515F (provisório) e futuro S7-1214FC.

---

### **SB (Status da chave / Status Bit)**
Bit que o PLC **lê** (feedback da realidade).

**No projeto**:
- `SbLigada[1..16]` = a chave **realmente** está fechada? (vem da entrada digital)

---

### **SetupOk**
Bit que marca: "Esta chave foi calibrada e está OK".

**No projeto**:
- Escrito pelo FB100 quando você clica "Salvar"
- No HTML, as chaves com Setup salvo aparecem em verde no popup Chaves

---

### **S7-1200, S7-1500, S7-1515, S7-1214**
Modelos de PLC Siemens com diferentes capacidades.
- **S7-1200**: Pequeno/médio
- **S7-1500**: Maior, mais modular
- **S7-1515F**: CPU 1500 de segurança (F = *fail-safe*), provisória no projeto
- **S7-1214FC**: Versão compacta (alvo final no projeto)

---

## **T**

### **TIA Portal**
Software Siemens pra programar PLCs (escrever código SCL, criar DBs, configurar I/O).

**No projeto**: Aqui programamos o FB100, os DBs, o mapeamento de entradas/saídas.

---

### **Timeout (Tempo limite)**
Tempo máximo pra esperar uma resposta. Se passar, considera falha.

**No projeto**: 8 segundos pra responder um comando (watchdog).

---

## **U**

### **URL (Uniform Resource Locator)**
Endereço de um recurso web.

**No projeto**:
- `http://localhost:1880/api/chaves/56` = URL da rota de chaves BC56

---

## **V**

### **Validação (Validator)**
Função que verifica se os dados recebidos são válidos (tipo certo, valor dentro do range, etc.).

**No projeto**: Cada rota tem um nó "valida..." que rejeita requisições erradas com HTTP 400.

---

### **Variável**
Espaço na memória que guarda um valor.

**Tipos no projeto**:
- **Bool**: TRUE/FALSE (CbLigar, SbLigada)
- **REAL**: número decimal (kW, tensão, resistência)
- **INT**: número inteiro (ChaveSel)
- **Array**: lista (CbLigar[1..16])

---

## **W**

### **Watchdog (Vigilante)**
Temporizador que dispara um aviso/ação se algo não acontecer no tempo esperado.

**No projeto**: Se o PLC não responder em 8 segundos, retorna HTTP 503 (erro de comunicação).

---

## **X**

### **X (Bit no DB)**
Notação Siemens pra bits individuais no banco de dados.

**Exemplo**:
```
DB150,X0.0 = byte 0, bit 0
DB150,X0.1 = byte 0, bit 1
DB150,X2.0 = byte 2, bit 0
```

---

## **Z**

### **Zero (Zeroing)**
Ato de limpar/resetar valores.

**No projeto**: Quando desabilita uma chave, o FB100 zera `CbLigar[]` pra segurança.

---

## **Termos adicionados em 22/10/2026 (v1.1)**

### **Aba duplicada (Node-RED)**
Duas abas (*flows*) com a **mesma rota** `http in` (ex.: duas "Chaves BC56 (API)"). O Node-RED atende pela **primeira** registrada; se for a antiga, os comandos são respondidos por ela e **não aparecem no log** da nova. Cura: apagar todas as abas antigas e fazer Deploy.

### **Atualização otimista**
A tela pinta o resultado **antes** da confirmação (chave fica laranja no clique) e desfaz sozinha se o PLC recusar. Verde só com o feedback real (`sb.ligada`).

### **Bolinhas de comunicação (card Modo)**
PLC / Node-RED / HTML. **Verde** = ativo · **amarelo** = parcial (ex.: um banco lê, o outro não) · **cinza** = não conectado. Hoje "PLC verde" = o Node-RED **conseguiu ler** o PLC por S7 (não prova que o programa do PLC roda; isso exige *heartbeat*).

### **Cache (do flow)**
Cópia da última leitura cíclica guardada no flow. O `GET /api/chaves/{banco}` responde **dessa cópia** (rápido, não pesa no PLC); se a cópia tem mais de 2,5 s devolve **503**.

### **Cliente / Servidor (S7)**
Em PUT/GET, a CPU que **inicia** a troca é o **cliente** (aqui o 1515); a CPU acessada é o **servidor** (o ET200) e é nela que se **permite o acesso PUT/GET**.

### **Conexão S7, ID da conexão, TSAP**
Canal configurado no TIA entre duas CPUs. O **ID** (hex) é passado ao PUT/GET. **TSAP** = endereço de transporte do parceiro (codifica rack/slot; ex.: CPU 1200/1500 em rack 0/slot 1 → `03.01`). TSAP errado = conexão não estabelece.

### **Contador de vida ("vida")**
Número que cada lado incrementa continuamente; o outro lado confere se **muda**. Se parar por N segundos, a comunicação é considerada perdida (ET200 derruba saídas; 1515 zera `sb.ligada`).

### **Deploy (Node-RED)**
Botão que ativa o fluxo editado. Reinicia os nós e **zera o log em memória** e as variáveis de contexto do flow.

### **DB otimizado / não otimizado**
Otimizado (`S7_Optimized_Access := TRUE`): o TIA escolhe a posição das variáveis — **sem endereço absoluto fixo**. Não otimizado: posições fixas (`DB150,X0.0`) — **obrigatório** para o Node-RED (endereço absoluto) e para PUT/GET.

### **Estado seguro (fail-safe)**
Estado para onde o sistema vai quando algo falha (comunicação, energia): aqui, **contatoras desligadas**.

### **Heartbeat (batimento) / pulso**
Sinal que oscila em intervalo fixo (ex.: 1 Hz) para provar que quem o gera está vivo. Quem lê verifica se **mudou** nos últimos N segundos; `TRUE` parado não prova nada.

### **HTTP 503**
"Serviço indisponível". No projeto: o Node-RED **está de pé**, mas **não tem leitura recente do PLC** (ou o PLC não confirmou o comando em 8 s).

### **Multi-instância**
Bloco (ex.: PUT, GET, TON) declarado **dentro** de outro FB, usando a memória da instância do FB-pai (em vez de um DB próprio).

### **Não-modal (janela)**
Janela que **não bloqueia** a tela de fundo (ex.: Chaves, Setup, Gráfico, Logs — contorno verde); pode-se clicar nas chaves com ela aberta. **Modal** bloqueia o fundo.

### **Polling**
Perguntar de tempos em tempos ("tem novidade?"). A tela lê as chaves a cada 1 s.

### **PUT / GET (S7)**
Instruções do TIA para **escrever/ler** dados de outra CPU Siemens pela rede (não confundir com GET/POST do HTTP). Disparam por **borda de REQ** e terminam com `DONE`/`NDR`/`ERROR` + `STATUS`.

### **REQ, DONE, NDR, ERROR, STATUS**
Parâmetros do PUT/GET: `REQ` inicia (borda de subida); `DONE` (PUT) / `NDR` (GET) = terminou bem; `ERROR` = falhou; `STATUS` = código (0000 = ok).

### **Struct (alinhamento)**
Grupo de variáveis dentro do DB. Em DB não otimizado, cada Struct começa em **byte par** (por isso `cb` em X0.0–X1.7 e `sb` em X2.0).

### **TON (temporizador)**
Temporizador "ligar com atraso": `Q` vira TRUE depois que `IN` ficou TRUE por `PT`. Usado para vigiar o contador de vida.

---

## **Novos na v1.2 (22/10/2026)**

### **Aba do flow (nome do flow)**
Cada "aba" do Node-RED é um flow. Regra de 22/10: **cada card tem o seu DB e o seu flow**, e o **nome da aba** diz qual card é (ex.: "Chaves BC56 (API) v2.2", "Registro do Ensaio DB53 (API)").
💡 **No projeto**: a aba antiga "Selecao do ensaio" foi substituída por "Registro do Ensaio DB53 (API)".

### **Blocos_novos (aba da planilha)**
Aba de `PLANO_NUMERACAO_BLOCOS_PLC_v3.xlsx` onde cada bloco novo (DB/FB/FC) ganha uma linha: número (calculado pelas regras), nome, função, situação (existe / aprovado - a criar / proposto / a definir / reserva) e se já foi criado no TIA. A coluna "Conflito?" avisa número repetido.

### **Carência (8 s)**
Tempo que a tela espera, depois de aberta, antes de acusar "não conectado" — dá tempo da primeira leitura chegar.

### **CORS**
Regra do navegador: uma página só pode chamar outro endereço se esse endereço permitir. Se o HTML **não** for servido pelo próprio Node-RED (ou for aberto como arquivo), o Node-RED precisa liberar CORS no `settings.js`. Sem isso o navegador bloqueia e a tela mostra "Failed to fetch".

### **ET200 / IM 151-8 PN/DP CPU**
Módulo da família ET 200**S** (periferia descentralizada) que tem uma CPU tipo S7-300 dentro. No projeto guarda o programa "Gerador_BC015" e as contatoras do BC56 e do BC400 (IP 172.17.209.158). Atua como **servidor** do PUT/GET.

### **Failed to fetch**
Mensagem genérica do navegador quando o pedido HTTP nem chega a ter resposta: Node-RED fora do ar, endereço errado, rede, **CORS** ou página aberta como arquivo (`file://`). Não diz qual — por isso a v1.9.64 mostra o endereço usado e o motivo provável.

### **file:// (página aberta como arquivo)**
Quando o HTML é aberto com duplo clique, o endereço começa com `file://` e **não** tem "mesma origem" com o Node-RED. Endereços relativos (`/api/...`) não funcionam; é preciso informar a URL completa no campo **Servidor** do botão **Demo** (v1.9.66; antes ficava em ⚙ Servidor).

### **Falha × Mensagem**
Tipos de ocorrência. **Falha** = algo que deveria funcionar e não funciona. **Mensagem** = aviso (nada quebrou), como um comando bloqueado de propósito.

### **Mensagens e falhas (janela / botão geral)**
Janela única que reúne as ocorrências de todos os cards e da aplicação. O botão da barra de cima mostra o total de ativas; o **triângulo amarelo com "!"** no cabeçalho de cada card só aparece quando aquele card tem ocorrência ativa e abre a janela já filtrada.

### **Ocorrência (código + texto)**
Cada mensagem/falha tem um **código `AAA-NNN`** (família + número: `COM-001`, `CHV-002`…) e um **texto** curto. Fica **Ativa** enquanto a causa existe e passa a **Normalizou** sozinha. Padrão completo: `claude/PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md`.

### **Origem (mesma origem)**
Combinação protocolo + endereço + porta da página. "Mesma origem do HTML" = o Node-RED que serve o HTML também responde as rotas `/api/...`, sem CORS.

### **Tooltip (balão)**
Quadradinho de texto que aparece ao passar o mouse. Na v1.9.64 o balão das bolinhas é desenhado por CSS e só troca de texto quando o conteúdo muda (antes era reescrito a cada segundo e piscava).

### **TTL (Time To Live)**
Número que cai 1 a cada equipamento de rede que o pacote atravessa; aparece no ping. O ET200 respondeu com TTL 29 (o 1515, 255): **sugere** que há equipamento de rede no meio do caminho até o ET200 — informação para diagnóstico, não é erro.

---

## **Por tópico**

### **Comunicação**
- API, REST, HTTP, HTTP 503, GET, POST, Modbus TCP, Endpoint, URL, Polling, Cache, Deploy, Aba duplicada, Aba do flow, CORS, Failed to fetch, file://, Origem, TTL

### **PLC / Hardware**
- ET200 / IM 151-8, Blocos_novos, S7, TIA Portal, DB, DB otimizado, Offset, Struct, I/O Mapping, Array, Variável, Bool, REAL, INT, X, CbLigar, SbLigada, Feedback, PUT/GET, Conexão S7, TSAP, Cliente/Servidor, Heartbeat, Contador de vida, Estado seguro, TON, Multi-instância

### **Lógica / Programação**
- FB, Borda de subida, Validação, Watchdog, Timeout, Logging, Promise, async-await, Listener, Callback, DOM, JavaScript, CSS, Releitura, SetupOk

### **Conceitos Técnicos**
- Base (kW), Delay, EnsaioAtivo, Flow, Glossário, Bolinhas de comunicação, Atualização otimista, Janela não-modal, Ocorrência (código + texto), Falha × Mensagem, Mensagens e falhas, Carência, Tooltip

---

## **Termos adicionados em 22/10/2026 noite (v1.3)**

- **Vigia (watchdog)**: rotina que age quando algo deixa de dar sinal de vida. 💡 **No projeto**: no flow v2.3, se nenhuma tela consulta o flow por `WD_HTML_S` s (padrão 30), ele zera os `CbLigar` do banco.
- **cbLigar / `cb.ligar`**: bit de comando de cada chave (DB150 BC56, DB158 BC400, `X0.0…X1.7`); é o laranja da tela. Fica TRUE no PLC até alguém zerar.
- **ZERAR**: job interno do flow v2.3 (sem HTTP) que escreve FALSE nos 16 `CbLigar`, relê e confere; aparece no log do banco.
- **WD_HTML_S**: variável de ambiente da aba do flow (Propriedades → Variáveis de ambiente) com o tempo do vigia em segundos.
- **Web Worker**: processo em segundo plano do navegador. 💡 **No projeto (v1.9.65)**: o relógio de 1 s do poll do PLC roda num Worker, para o Chrome não reduzi-lo quando a aba fica escondida.
- **Intensive throttling**: limite do Chrome que reduz timers de aba escondida há mais de ~5 min (~1 execução por minuto).
- **FB102 `fb102_WatchdogComandos`** *(proposto, não compilado)*: FB do PLC que zera `cb.ligar` quando o pulso do Node-RED (DB58) para; instâncias DB156 (BC56) e DB164 (BC400).
- **Sinal de validade (DB52)**: bit/idade que diz se a grandeza é recente; alternativa a zerar o DB52 na perda de comunicação (aguarda layout do DB52).


## **Termos adicionados em 23/10/2026 (v1.4)**

- **Modo REAL / Demo local / Demo + PLC** *(HTML v1.9.66)*: os três modos da tela. **Real** (padrão): DSE real e PLC. **Demo local**: DSE simulado, nada vai ao PLC. **Demo + PLC**: DSE simulado, mas chaves e registro do ensaio gravam de verdade no PLC. O modo é deduzido do Demo ligado/desligado + "Usar o PLC real"; nunca é lembrado entre aberturas.
- **Servidor (campo único)**: a URL do Node-RED do PLC, no botão **Demo** (pede senha). Vale para as chaves (`/api/chaves/…`) **e** para o registro do ensaio (`/api/ensaio/…`). Vazio = mesmo endereço de onde a página foi aberta.
- **Condição segura (troca de modo)**: o que a tela faz ao trocar de modo ou ao desligar o Demo sozinha — fecha janelas, desmarca o Setup, desliga as chaves (no PLC também, via `POST /ligar` com `ligar:false`) e desarma a falha de motor simulada.
- **Sonda do DSE**: com o Demo ligado, a tela consulta o endereço do DSE a cada 5 s; se vier leitura válida (`ok:true` e idade ≤ 10 s) é DSE real e o Demo se desliga (ocorrência `DSE-002`).
- **Popup "🧪 Cards x flow"** *(HTML v1.9.68, só desenvolvedor)*: lista os flows do Node-RED de que o HTML depende (chaves BC56, chaves BC400, registro do ensaio) e compara o flow esperado com o que a última resposta de cada um realmente trouxe no campo `flow`. Atrás da senha do botão Demo.
- **Sonda do PLC** *(HTML v1.9.67)*: GET de leitura (`/api/chaves/…`) que a tela faz a cada ~3 s, só em Demo local, pra confirmar que o PLC está respondendo antes de liberar "Usar o PLC real durante o Demo". Some assim que o modo deixa de ser Demo local.
- **PLC simulado**: *não existe*. Por isso tudo que grava no PLC exige o PLC ativo; o "Forçar salvar (teste)" e a opção ② do Demo foram removidos.
- **localStorage**: memória do navegador, por endereço e por computador. 💡 **No projeto**: guarda a URL do Servidor (`medidor.srvUrl`), os dados do Demo local e a calibração local das chaves; **não** guarda o modo.


## **Termos adicionados em 23/10/2026 noite (v1.9)**

### **Seletora Local/Remoto (Manual/Auto) do banco**
Chave seletora física **no banco de carga**. Para o projeto: **Auto = remoto** (o PLC pode comandar as chaves) e **Manual = local** (quem opera é a pessoa, no painel do banco). Sinais propostos do ET200 ao 1515: `cbBC56Manual/Auto` e `cbBC400Manual/Auto`. 💡 **No projeto (HTML v1.9.74)**: o chip "Seletora: sem sinal / Auto (remoto) / Manual (local)" no card Cargas mostra essa posição; hoje só existe simulada no Demo local.

### **cbLigarBC56 / cbLigarBC400**
Nomes dos sinais propostos pelo operador, do 1515 para o ET200, que "ligam o banco" (liberam o uso das chaves). Na tela é o botão **Ligar banco / Desligar banco** de cada banco. Ainda **não existem** no PLC/ET200 — ver `claude/PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md`.

### **Interbloqueio (intertravamento)**
Regra que impede uma ação enquanto uma condição não é atendida. 💡 **No projeto**: chave só liga com seletora do banco em **Auto** **e** banco **ligado**; senão o tile fica apagado (`.blk`) e o clique mostra o motivo. No HTML é só conveniência; a proteção de verdade tem que estar também no PLC/ET200.

### **Trava de compatibilidade (feature flag)**
Regra nova que só vale quando a informação que ela precisa existe. 💡 **No projeto**: o interbloqueio por banco só age quando há sinal da seletora; com PLC real sem esse sinal, as chaves seguem como antes.

### **Posição na ordem das chaves**
Chave 1 = a de **menor** carga, última = a de **maior** (ordem física informada pelo operador). A posição é o `indice` 1-based **por banco** da API e o bit n−1 de `cb.ligar[]`. 💡 **Exemplo**: BC56 chave 1 = 3 kW; BC400 chave 13 = 50 kW. Logs novos dizem "BC56 #3 de 13" em vez do índice global base 0.

### **Divisória arrastável (splitter)**
Barrinha entre dois painéis que você arrasta para aumentar um e diminuir o outro. 💡 **No gerenciador v1.1**: fica entre a tabela de eventos e o painel de detalhe (também abre/fecha, por botão, duplo clique ou Enter; setas ↑ ↓ ajustam).

### **Agrupar falhas repetidas**
Mostrar várias ocorrências **iguais** como uma linha com contador "×N". 💡 **No gerenciador v1.1**: 182 linhas de `GET /api/gerador → 404` viram uma (×592 contando as que o medidor omitiu de propósito: 1 falha de leitura a cada 10 s por rota).

### **HTTP 404 (Not Found)**
O Node-RED respondeu, mas não existe nenhum nó "http in" para aquele caminho. 💡 **No projeto**: `GET /api/gerador → 404` = nenhum flow importado atende essa rota (ou ela tem outro nome).

---

**Atualizado em**: 23/10/2026  
**Próximas adições**: Conforme novas features apareçam no projeto.

---

## **Termos adicionados em 23/10/2026 (v1.7)**

### **Chave travada no Setup (Demo)**
Regra do simulador de carga (HTML v1.9.69, só Demo): enquanto há uma chave **selecionada** no popup Setup (`bco.SU`, `dlgChSetup`), o simulador mantém ligada **somente essa chave**. O potenciômetro da Simulação e o botão **Auto** ficam desabilitados e nada (refill, Auto, fim de ensaio) apaga a chave em calibração. Existe porque, antes, esses gatilhos zeravam as chaves do simulador sem desmarcar a seleção na tela — a fórmula "kW com chave − kW sem carga = kW real" ficava congelada em 0,0 mesmo com o gerador operando. Libera ao desmarcar a chave ou fechar o Setup.

---

## **Termos adicionados em 23/10/2026 (v1.8)**

### **DEV.OBS / Gerenciador de logs**
Ferramenta só de desenvolvedor (atrás da senha do Demo): o medidor (HTML ≥ v1.9.73) registra o que acontece e o `gerenciador_logs_v1.html`, aberto em outra aba, mostra ao vivo, filtra e exporta JSON + Markdown. **Só observa** — nunca comanda chave, gerador ou PLC. Contrato: `CONTRATO_HTTP_HTML_NODERED_DEV_LOGS.md`.

### **Observabilidade**
Capacidade de ver, de fora, o que o sistema está fazendo por dentro (cliques, estados, respostas, falhas) sem precisar perguntar a quem operou. Aqui é o log estruturado + o gerenciador.

### **Evento (de log)**
Uma linha do registro: quando (`t`), quem/onde (`card`), o quê (`tipo`, `acao`), como terminou (`res`: ok/info/aviso/falha) e o estado no momento (`est`). Identificado por `sessao` + `n`.

### **Sessão (do HTML)**
Uma carga da página do medidor. Se der F5, nasce outra sessão e `n` recomeça em 1; por isso a chave do evento é `sessao` + `n`.

### **Buffer circular**
Memória de tamanho fixo que, quando enche, joga fora o item mais antigo para caber o novo. No Node-RED guarda 5000 eventos; no HTML, 4000. Os descartados são contados e aparecem na tela.

### **Deduplicação**
Descartar o que já foi recebido. O mesmo evento chega por três caminhos (Node-RED, canal local, janela-pai); a chave `sessao|n` garante uma linha só.

### **Cursor (`desde` / `seq`)**
Número da última linha que o gerenciador já leu. A próxima consulta pede só o que tem `seq` maior — sem repetir e sem pular.

### **Boot (do flow)**
Código gerado quando o flow `dev-logs-v1.0` nasce na memória do Node-RED. Se mudar, o Node-RED reiniciou e o buffer zerou; o gerenciador avisa.

### **Canal local (BroadcastChannel)**
Recurso do navegador para duas abas da mesma origem conversarem sem servidor. É como o gerenciador recebe os eventos no Demo local, onde nada sai para o Node-RED.

### **Backlog**
O que já aconteceu antes de o gerenciador abrir. O medidor entrega o backlog quando o gerenciador pede (`pede`) ou quando a senha é digitada.

### **Pop-up bloqueado**
O navegador impede abrir janela sem clique do usuário. Na abertura Automática, se acontecer, o medidor avisa na barra de mensagens e o botão 📋 continua funcionando.

### **Bundler**
Ferramenta que junta vários arquivos num pacote só. Aqui não usamos: quem junta os logs é o próprio HTML (gerenciador), que monta o arquivo final.

### **Matriz Ação × Estado (nome proposto)**
Tabela de ações do operador contra estados do sistema (gerador, ensaio, modo, popups, comunicação) com o veredicto de cada célula: permitido, bloqueado com aviso, bug (devia poder) ou risco (pode e não devia). Antes chamada "matriz pode / não pode"; nome final ainda a escolher pelo operador.

### **Taxonomia**
Classificação em categorias. Na matriz, são os veredictos de cada célula.

---

## **Termos adicionados em 24/10/2026 (v2.0)**

**Canal (da API)** — Rota `/api/chaves/56` ou `/api/chaves/400`; liga ao DB150 (instância DB155) ou DB158 (DB163). Não é, por si só, o banco físico. *Ex.:* "canal 56" ≠ garantidamente "banco de 56 kW" se houver cruzamento no ET200.

**Banco físico** — O banco de carga realmente acionado (contatoras). Depende do literal `P#DBxx` no `fb101_ComEt200` e do FC4/fiação do ET200. *Ex.:* inversão 56↔400 relatada em campo.

**DB38 `ComBC56` / DB39 `ComBC400`** — DBs de troca no ET200 (antes DB10/DB11). Ver `PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md`.

**ComOk** — Saída do `fb101`: `Hab AND jaLeu AND NOT tVida.Q`. Falso → `SbLigada[]` é zerado (estado seguro).

**tVida** — Temporizador de vida (`TempoVida = T#3S`): expira se o contador de vida do ET200 parar de mudar.

**Leitura de volta** — Após escrever no DB150/158, o Node-RED espera ~450 ms, relê e compara com o esperado; divergência → HTTP 500 ("leitura de volta nao conferiu").

**Operador secreto** — Seção do resumo do gerenciador de logs que isola ações do operador de eventos automáticos.

**DEV.OPS** — Sigla de eventos de operação do modo desenvolvedor (a registrar em `PADRAO_SIGLAS_CARDS.md`).

**Gerenciador de logs v1.2** (`gerenciador_logs_v1.2.html`) — Recebe eventos do medidor via dev-logs; `MAX_EV = 8000` (descarta os mais antigos); exporta JSON/Markdown. O 📋 do medidor ainda aponta o nome antigo `gerenciador_logs_v1.html`.

**DIF_KW** — Tolerância (3 kW) na comparação chaves − DSE.

## **Termos adicionados em 24/10/2026 noite (v2.1 — HTML v1.9.77 / flows v2.4 / FB101 v0.4)**

**cbBanco.ligar / sbBanco.seletoraAuto / sbBanco.comEt200Ok** — Membros novos no FIM do DB150/DB158 (X460.0, X462.0, X462.1). Ficam no fim para não deslocar os offsets que o Node-RED já usa.

**Seletora física (Local/Remoto)** — Chave no banco de carga. Auto = remoto (o PLC comanda); Manual = local. No PLC real a tela só **mostra** a posição; não dá para mudá-la pela tela.

**"sem comunicação ET200"** — Chip da seletora quando o FB101 está com `ComOk` falso. O PLC desliga o banco e o operador precisa religar depois.

**Opção A (telegrama 6+6)** — PUT de 6 bytes (cmd, vida, ligarBanco) e GET de 6 bytes (fbk, vida, seletoraAuto) por banco; DB38/DB39 com 12 bytes.

**FREQ_TOL / STBY_MIN** — Tolerância de frequência (padrão 5 %) e carga mínima no stand-by (padrão 107 %) do relatório; ajustáveis em Faixas.

**CHV-005** — Ocorrência "banco bloqueado pelo PLC".
