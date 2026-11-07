// Lado ET200 dos bancos novos (fb_bancoEt200_16/32): "nada religa sozinho" apos queda de comunicacao.
// Sem TIA aqui: o teste (1) confere que o SCL contem as linhas da regra e (2) roda, ciclo a ciclo, a transcricao dessas linhas.
// Versao testada: v0.2 por padrao; ET200_VER=0.1 node --test tests/fb/plc_et200.test.js mostra o defeito da v0.1.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const VER = process.env.ET200_VER || '0.2', DIR = path.join(__dirname, '../../plc/bt2/comunicacao_et200');
const scl = N => fs.readFileSync(path.join(DIR, `fb_bancoEt200_${N}_v${VER}.scl`), 'utf8');

// Transcricao fiel da saida da contatora (uma chave) de cada versao. st = memoria estatica da instancia.
const ciclo = {
  '0.1': (st, e) => {   // linhas da v0.1: rearme na subida de ComOk; saida com (_comOkAnt OR _rearmado)
    if (e.comOk && !st.comOkAnt) st.rearmado = false;
    if (!e.cmd && st.cmdAnt) st.rearmado = true;
    const q = e.comOk && e.ligar && e.sel && (st.comOkAnt || st.rearmado) ? e.cmd : false;
    st.cmdAnt = e.cmd; st.comOkAnt = e.comOk; return q;
  },
  '0.2': (st, e) => {   // linhas da v0.2: _bloq trava na queda/partida e so solta com Cmd = FALSE
    if (!e.comOk || !st.partiu) st.bloq = true; else if (!e.cmd) st.bloq = false;
    st.partiu = true;
    return e.comOk && e.ligar && e.sel && !st.bloq ? e.cmd : false;
  },
};

test('SCL contem a regra transcrita (16 e 32 iguais exceto o tamanho)', () => {
  const a = scl(16), b = scl(32);
  if (VER === '0.2') {
    for (const t of [a, b]) {
      assert.match(t, /IF NOT #ComOk OR NOT #_partiu THEN\s+#_bloq\[#i\] := TRUE;\s+ELSIF NOT #Cmd\[#i\] THEN\s+#_bloq\[#i\] := FALSE;/);
      assert.match(t, /IF #ComOk AND #LigarBanco AND #SeletoraEntrada AND NOT #_bloq\[#i\] THEN/);
      assert.doesNotMatch(t, /:\s*TON_TIME;|\{\s*S7_Optimized_Access/, 'IM151-8 (S7-300): sem TON_TIME e sem acesso otimizado');
    }
  }
  assert.equal(a.replace(/(?<![0-9])16(?![0-9])/g, 'N'), b.replace(/(?<![0-9])32(?![0-9])/g, 'N').replace(/8\+8/g, '6+6'), 'FB 16 e FB 32 diferem alem do tamanho');
});

test('apos queda de comunicacao, a chave NAO religa sozinha com o comando antigo (so com novo comando)', () => {
  const f = ciclo[VER], st = {}, base = { ligar: true, sel: true };
  for (let k = 0; k < 3; k++) f(st, { ...base, comOk: true, cmd: false });
  assert.equal(f(st, { ...base, comOk: true, cmd: true }), true, 'comando normal liga');
  for (let k = 0; k < 5; k++) assert.equal(f(st, { ...base, comOk: false, cmd: true }), false, 'sem comunicacao desliga');
  // comunicacao volta e o 1515 (que nao viu a queda: 2 s no ET200 < 3 s no 1515) ainda manda cmd = TRUE
  const saidas = []; for (let k = 0; k < 5; k++) saidas.push(f(st, { ...base, comOk: true, cmd: true }));
  assert.deepEqual(saidas, [false, false, false, false, false], 'religou sozinha: ' + JSON.stringify(saidas));
  f(st, { ...base, comOk: true, cmd: false });
  assert.equal(f(st, { ...base, comOk: true, cmd: true }), true, 'novo comando (FALSE -> TRUE) liga');
});

test('partida da CPU com comando TRUE no DB nao liga a contatora sem novo comando', () => {
  const f = ciclo[VER], st = {}, saidas = [];
  for (let k = 0; k < 3; k++) saidas.push(f(st, { ligar: true, sel: true, comOk: true, cmd: true }));
  assert.deepEqual(saidas, [false, false, false]);
});
