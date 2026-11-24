'use strict';
/* =====================================================================================================================
   modelo_lote_mascara.js — MODELO EM JAVASCRIPT do bloco de PLC "lote por mascara" (fb105_loteMascara / fb106_loteMascara32) · Passo 10 (item 3) · 21/11/2026.
   PARA QUE SERVE (leigo): para comandar varias chaves de uma vez com UMA escrita (em vez de uma escrita por bit), o Node-RED escreve duas palavras (mascara de "ligar" e mascara de "desligar") e um contador;
   quem aplica os bits e o PLC, no mesmo ciclo. Isso evita o perigo de ler-e-reescrever uma palavra (que apagaria o que o PLC fez) e faz as chaves do degrau mudarem JUNTAS.
   Este arquivo e a ESPECIFICACAO executavel dessa regra: o bloco SCL (plc/bt2/entrega_lote_v0.1) tem que se comportar exatamente assim; os testes de propriedades conferem o modelo contra a regra "bit a bit".
   O MESMO contrato serve ao FB em JavaScript (o medidor manda os lotes) e ao FB do PLC (o proprio PLC executa a sequencia): o que muda e QUEM manda o lote e a pausa entre degraus.
   REGRA (por ciclo): se Seq <> SeqAck: 1) para cada bit de ClrMask: CbLigar[i] := FALSE (desligar PRIMEIRO); 2) para cada bit de SetMask: CbLigar[i] := TRUE somente se Habilitada[i] E LigarBanco;
   3) SeqAck := Seq. Se Seq = SeqAck: nao faz nada (repetir o mesmo lote nao tem efeito). Bit em ClrMask e em SetMask ao mesmo tempo e erro do chamador (aqui o ligar vence, como no SCL).
   ===================================================================================================================== */
const MAX_SEQ = 0x10000;                                    // UInt de 16 bits: 65535 + 1 volta a 0

const mascaraDe = (indices) => indices.reduce((m, i) => m | (1 << (i - 1)), 0) >>> 0;     // indices 1..N -> mascara (bit i-1)
const indicesDe = (mascara, n) => { const r = []; for (let i = 1; i <= n; i++) if ((mascara >>> (i - 1)) & 1) r.push(i); return r; };
const proximaSeq = (s) => (s + 1) % MAX_SEQ;

/** estado: { cb: bool[n], hab: bool[n], ligarBanco: bool, seqAck: int }; lote: { setMask, clrMask, seq }. Devolve o NOVO estado (nao altera o de entrada). */
function aplicaLote(estado, lote, n = 16) {
  const e = { cb: estado.cb.slice(), hab: estado.hab.slice(), ligarBanco: estado.ligarBanco, seqAck: estado.seqAck };
  if ((lote.seq >>> 0) === (e.seqAck >>> 0)) return e;      // mesmo contador: lote ja aplicado, nada a fazer
  for (let i = 1; i <= n; i++) if ((lote.clrMask >>> (i - 1)) & 1) e.cb[i - 1] = false;                                   // 1) desligar primeiro
  for (let i = 1; i <= n; i++) if (((lote.setMask >>> (i - 1)) & 1) && e.hab[i - 1] && e.ligarBanco) e.cb[i - 1] = true;   // 2) ligar so chave habilitada com o banco ligado
  e.seqAck = lote.seq;                                      // 3) reconhece
  return e;
}

/** O que o Node-RED faz HOJE no lote por bits: desligar primeiro (um bit por escrita), depois ligar. E o que a mascara precisa reproduzir. */
function loteBitABit(estado, ligar, desligar) {
  const e = { cb: estado.cb.slice(), hab: estado.hab.slice(), ligarBanco: estado.ligarBanco, seqAck: estado.seqAck };
  for (const i of desligar) e.cb[i - 1] = false;
  for (const i of ligar) if (e.hab[i - 1] && e.ligarBanco) e.cb[i - 1] = true;       // a regra "habilitada e banco ligado" que o valida/revalida ja garantem antes de escrever
  return e;
}

module.exports = { mascaraDe, indicesDe, proximaSeq, aplicaLote, loteBitABit, MAX_SEQ };
