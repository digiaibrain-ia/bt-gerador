# Monitoramento de Comunicação HTML ↔ Node-RED ↔ PLC

## O que registra

Cada POST/GET a uma rota `/api/...` gera uma linha de log com:
- **timestamp** (ISO 8601)
- **rota** (ex: `/api/chaves/56/ligar`)
- **operação** (ex: `POST {indice:1,ligar:true}`)
- **tempo_s7** (quanto o S7 levou pra executar, em ms)
- **tempo_leitura** (quanto esperou+releu, em ms)
- **status** (`ok:true` ou erro)
- **detalhes** (mensagem de erro se houver)

## Exemplo de log

```
2026-10-22T14:30:45.123Z | /api/chaves/56/ligar | POST {indice:1,ligar:true} | S7:45ms | Leitura:405ms | OK | 
2026-10-22T14:30:50.890Z | /api/chaves/56 | GET | S7:42ms | - | OK | ligada:[false,true,false,...]
2026-10-22T14:30:55.456Z | /api/chaves/56/ligar | POST {indice:2,ligar:true} | S7:48ms | Leitura:450ms | ERRO | cb.ligar[2] não conferiu após releitura
```

## Onde fica armazenado

### Opção A: Node-RED em memória (recomendado para testes rápidos)
- Node-RED mantém um array `flow.chv2_logs` (últimas 1000 linhas).
- Rota GET `/api/logs?banco=56` devolve o log em JSON.
- Apaga ao Restart do Node-RED (ok para desenvolvimento).

### Opção B: Arquivo na máquina Node-RED (para análise posterior)
- Node-RED escreve em `/tmp/nodered_comunicacao.log` a cada POST.
- Você baixa depois, analisa ou converte em PDF.

### Opção C: Node-RED → SQL (futuro, após testes)
- Armazena em DB permanente.
- Consulta e relatórios.

## Como usar

### 1. Ativar logs no Node-RED (Opção A + B simultâneas)

**No flow chaves-56-api-v2.json**, adicione um nó **Function** após `chv2_responde`:

```javascript
// Nó: "registra_log_chaves56"
const rota = msg.statusCode ? '/api/chaves/56' : msg._rota || '';
const tempo_s7 = msg._tempoS7 || 0;  // preenchido pelo nó "confere leitura x escrita"
const tempo_leitura = msg._tempoLeitura || 0;
const status = msg.statusCode === 200 ? 'OK' : 'ERRO';
const operacao = msg._operacao || JSON.stringify(msg.payload || {});
const erro = msg.payload?.erro || '';

const linha = `${new Date().toISOString()} | ${rota} | ${operacao} | S7:${tempo_s7}ms | Leitura:${tempo_leitura}ms | ${status} | ${erro}`;

// Armazenar em memória
let logs = flow.get('chv2_logs') || [];
logs.push(linha);
if (logs.length > 1000) logs.shift();  // manter últimas 1000
flow.set('chv2_logs', logs);

// Armazenar em arquivo (opcional)
const fs = require('fs');
fs.appendFileSync('/tmp/nodered_comunicacao.log', linha + '\n');

return null;  // não propagar
```

### 2. Consultar logs via HTTP

Adicione um **http in** + **Function**:

```
GET /api/logs?banco=56
  ↓
Retorna JSON com as últimas linhas
```

**Function:**
```javascript
const banco = msg.req.query.banco || '56';
const logs = flow.get('chv2_logs') || [];
msg.statusCode = 200;
msg.payload = {
  banco: banco,
  total: logs.length,
  logs: logs.slice(-100)  // últimas 100
};
return msg;
```

### 3. Baixar e analisar

Na máquina do Node-RED (SSH ou SCP):
```bash
cat /tmp/nodered_comunicacao.log | tail -200 > relatorio_22-10-2026.txt
```

Ou em Python (para gerar PDF):
```python
import pandas as pd
from datetime import datetime

# Ler
with open('/tmp/nodered_comunicacao.log') as f:
    linhas = [l.strip().split(' | ') for l in f]

# Tabular
df = pd.DataFrame(linhas, columns=['timestamp', 'rota', 'operacao', 'tempo_s7', 'tempo_leitura', 'status', 'erro'])

# PDF
from reportlab.pdfgen import canvas
# ... renderizar tabela
```

## O que observar

1. **Tempo S7** (comunicação até o PLC escrever): deve ser <100ms (hoje assumido 200ms ciclo).
2. **Tempo Leitura** (espera + releitura): deve ser ≈450ms (se >700ms, aumentar delay).
3. **Taxa de erro**: 0% em operação normal. Se >5%, investigar timeouts (PLC offline?).
4. **Sequência**: POST sempre antes de GET (HTML respeita a ordem?).

## Próximos passos

- Implementar os 3 nós no chaves-56-api-v2.json (registra_log, get_logs, http in).
- Testar com 1 chave.
- Coletar log de 10-15 min de operação.
- Analisar padrões (picos, erros, latência).
- Gerar PDF/TXT com gráficos (opcional, com pandas/matplotlib).

---

**Status**: Pronto pra implementar. Quer que eu coloque os 3 nós no flow agora, ou espera ver o resultado do teste de hoje?
