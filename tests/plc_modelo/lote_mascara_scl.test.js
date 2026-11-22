// Confere o RASCUNHO SCL do lote por mascara (plc/bt2/entrega_lote_v0.1): ASCII (importacao no TIA), etiquetas //[F] e //[M] em todo comentario e a regra do modelo (modelo_lote_mascara.js) escrita no bloco.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '..', 'plc', 'bt2', 'entrega_lote_v0.1', 'PLC_1515');
for (const a of fs.readdirSync(D)) {
  const t = fs.readFileSync(path.join(D, a), 'utf8');
  test('ASCII: ' + a, () => { assert.ok(!/[^\x00-\x7F]/.test(t), 'caractere nao ASCII'); });
  if (!a.endsWith('.scl')) continue;
  test('etiquetas: ' + a, () => {
    const sem = []; t.split(/\r?\n/).forEach((l, i) => { if (/\/\//.test(l) && !/\/\/\[(F|M)\]/.test(l)) sem.push((i + 1) + ': ' + l.trim().slice(0, 60)); });
    assert.deepStrictEqual(sem, [], 'comentario sem //[F] ou //[M]'); assert.ok(/\/\/\[F\]/.test(t) && /\/\/\[M\]/.test(t), 'falta uma das duas etiquetas');
  });
  test('regra do modelo escrita no bloco: ' + a, () => {
    const n = /32/.test(a) ? 32 : 16;
    assert.ok(new RegExp('Array\\[1\\.\\.' + n + '\\] of Bool').test(t), 'vetor de ' + n + ' chaves'); assert.ok(new RegExp('FOR #i := 1 TO ' + n + ' DO').test(t));
    assert.ok(/IF #Seq <> #SeqAck THEN/.test(t), 'so aplica com o contador novo'); assert.ok(/#SeqAck := #Seq;/.test(t), 'reconhece');
    const iDes = t.indexOf('#CbLigar[#i] := FALSE;'), iLig = t.indexOf('#CbLigar[#i] := TRUE;'); assert.ok(iDes > 0 && iLig > iDes, 'desligar vem ANTES de ligar');
    assert.ok(/#Habilitada\[#i\] AND #LigarBanco/.test(t), 'ligar so habilitada com o banco ligado'); assert.ok(!/#CbLigar\[#i\] := FALSE;[^]*#CbLigar\[#i\] := FALSE;[^]*#CbLigar\[#i\] := TRUE;/.test(t), 'um unico trecho de desligar');
    const tipo = n === 32 ? 'DWord' : 'Word'; assert.ok(new RegExp('SetMask : ' + tipo + ';').test(t) && new RegExp('ClrMask : ' + tipo + ';').test(t) && /Seq : UInt;/.test(t) && /SeqAck : UInt;/.test(t), 'tipos dos campos');
  });
}
test('a entrega traz os arquivos esperados e o aviso de que nao foi compilada', () => {
  const nomes = fs.readdirSync(D); for (const n of ['fb105_loteMascara_v0.1.scl', 'fb106_loteMascara32_v0.1.scl', 'db_campos_lote_v0.1.txt']) assert.ok(nomes.includes(n), n);
  assert.match(fs.readFileSync(path.join(D, '..', 'COMO_USAR.txt'), 'utf8'), /NAO COMPILADO NO TIA/);
});
