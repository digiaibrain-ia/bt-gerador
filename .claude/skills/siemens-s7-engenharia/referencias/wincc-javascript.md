# WinCC Unified — JavaScript

> 💡 **Para times não técnicos:** JavaScript é a linguagem das telas do supervisório
> WinCC Unified. Ele roda no HMI (touch ou PC), não no CLP. Serve para animar a tela,
> ler tags do CLP e atualizar a interface automaticamente.

> 🔗 **Style guide completo:** as regras de estilo oficiais Siemens (Entry ID 109758536
> — `===`, camelCase, `const`/`let`, `switch` com `default`, etc.) estão na skill
> **`siemens-wincc-001-js-styleguide`**. Consulte-a para *revisar* código; esta
> referência foca nos *padrões de geração* e nas APIs do WinCC.

## 1. Proibições absolutas

```javascript
// ✅ CORRETO
const nome = 'valor';        // aspas SIMPLES
let contador = 0;            // let para mutável; const para fixo

// ❌ NUNCA — causam erro ou comportamento imprevisível no WinCC
var x = 1;                   // var → escopo imprevisível (use let/const)
eval('codigo');              // proibido pela Siemens (segurança)
console.log('debug');        // NÃO EXISTE no WinCC Unified!
setTimeout(fn, 1000);        // não suportado → use o Task Scheduler do TIA Portal
setInterval(fn, 1000);       // idem

// Debug correto:
HMIRuntime.Trace('Mensagem');            // único método válido
HMIRuntime.Trace(`Valor: ${variavel}`);  // template string funciona
```

## 2. Leitura de tags — TagSet (obrigatório para múltiplas tags)

```javascript
// POR QUÊ TagSet: lê várias tags do CLP numa ÚNICA requisição OPC. Sem ele, cada
// leitura é uma requisição separada — sobrecarrega a rede e deixa a tela lenta.
async function lerDados () {
  try {
    const ts = HMIRuntime.Tags.CreateTagSet();
    ts.Add('DB_SRMV.ValvulaAtual');
    ts.Add('DB_SRMV.FE_Eixo1');
    await ts.Read();                       // uma comunicação só

    const valvula = ts.Item('DB_SRMV.ValvulaAtual').Value;
    const fe1 = ts.Item('DB_SRMV.FE_Eixo1').Value;

    Screen.Items('txt_Valvula').Text = `Válvula: ${valvula}`;
    Screen.Items('txt_FE1').Text = `FE1: ${fe1.toFixed(4)} µm`;
  } catch (err) {
    // POR QUÊ try/catch: falha de comunicação é normal em rede industrial.
    // Capturar evita que a tela trave.
    HMIRuntime.Trace(`[SRMV] Erro leitura: ${err}`);
  }
}
```

## 3. Escrita de tag

```javascript
async function escreverTag (tagName, valor) {
  try {
    await Tags(tagName).Write(valor);
  } catch (err) {
    HMIRuntime.Trace(`[Escrita] ${tagName}: ${err}`);
  }
}
```

## 4. Paleta de cores padrão (status de equipamento)

```javascript
const CORES = {
  OK: '#00C853',      // verde — operação normal
  NOK: '#FF1744',     // vermelho — falha/reprovado
  ALERTA: '#FFB300',  // âmbar — atenção/marginal
  INFO: '#00C8FF',    // ciano — informação
  INATIVO: '#6272A4', // cinza azulado — desabilitado
};
Screen.Items('led_Status').BackColor = statusOK ? CORES.OK : CORES.NOK;
```

## 5. Template de script de tela (ponto de partida comentado)

```javascript
// ============================================================
// Script: [NomeTela]_[NomeEvento]
// O QUÊ FAZ: [descreva em 1 linha]
// QUANDO EXECUTA: [evento — Load, Click, etc.]
// Autor: REGINALDO LOBO  ·  WinCC Unified V19  ·  Projeto: [nome]
// ============================================================
(async function () {
  'use strict';                       // modo estrito — detecta erros comuns

  // Constantes de tag — nunca hardcode inline; se o nome mudar, altera só aqui
  const TAG_VALOR = 'DB_xxx.Campo';
  const TAG_STATUS = 'DB_xxx.Status';

  try {
    const ts = HMIRuntime.Tags.CreateTagSet();
    ts.Add(TAG_VALOR);
    ts.Add(TAG_STATUS);
    await ts.Read();

    const valor = ts.Item(TAG_VALOR).Value;
    const status = ts.Item(TAG_STATUS).Value;

    if (status === 1) {
      Screen.Items('led_Status').BackColor = '#00C853';
      Screen.Items('txt_Valor').Text = `${valor.toFixed(2)} bar`;
    } else {
      Screen.Items('led_Status').BackColor = '#FF1744';
    }
  } catch (err) {
    HMIRuntime.Trace(`[${Screen.Name}] Erro: ${err}`);
  }
}());                                 // IIFE — executa já e isola o escopo
```

## 6. Módulo global — funções compartilhadas entre telas

```javascript
// POR QUÊ módulo global: lógica usada em várias telas fica num lugar só.
const utilHmi = (function () {
  'use strict';

  function _validarTag (tagName) {           // privada (não sai do módulo)
    return tagName && tagName.length > 0;
  }

  function corPorStatus (ok, alerta) {       // pública
    if (alerta) { return '#FFB300'; }        // âmbar = atenção
    if (ok) { return '#00C853'; }            // verde = OK
    return '#FF1744';                        // vermelho = NOK
  }

  return { corPorStatus };                   // expõe só o necessário (encapsulamento)
}());
```
