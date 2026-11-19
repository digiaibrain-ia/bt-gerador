'use strict';
/* =====================================================================================================================
   rnc_core_v1.2.prop.test.js — TESTES DE PROPRIEDADES (fast-check) das REGRAS do RNC (Registro de Nao Conformidade) · Passo 7b · 19/11/2026.
   PARA QUE SERVE (leigo): o RNC bloqueia o gerador para expedicao enquanto houver defeito aberto. O computador inventa sequencias inteiras de pedidos (abrir, repetir, iniciar reparo,
   registrar reparo, reteste, foto), certos e errados, e confere as regras que nao podem falhar: repetir o mesmo pedido nunca duplica; chave de idempotencia reutilizada com outro conteudo
   e recusada; revisao velha e recusada; nao se pula estado; so libera com reteste APROVADO; o historico nunca e alterado; numeracao sem buracos.
   MODULO REAL: nodered/gerador/rnc/rnc_core_v1.2.js (o mesmo codigo colado no fluxo rnc-api-v1.2; ver tests/modulos_entregues.test.js).
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js        MODULO: RNC_MODULO=<arquivo> troca o modulo (contra-prova).
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const path = require('path');
const C = require(process.env.RNC_MODULO ? path.resolve(process.env.RNC_MODULO) : path.join(__dirname, '../../nodered/gerador/rnc/rnc_core_v1.2.js'));
const cfg = { numRuns: +process.env.FC_RUNS || 300, seed: +process.env.FC_SEED || 20261119 };
const SERIES = ['M9MGD26060019SDFWA01715', 'ABCDEFGHIJKLMNO12345', 'ZZZZZZZZZZZZZZZZ99999'];
const AGORA = new Date('2026-11-19T10:00:00.000Z');

// ---- o "servidor": aplica processar() e grava o evento SO quando ele vem (como o fluxo faz) ----
const servidor = () => { const s = { eventos: [], resp: [], agora: AGORA };
  s.pede = req => { const antes = JSON.stringify(s.eventos); const r = C.processar(s.eventos, req, s.agora); assert.equal(JSON.stringify(s.eventos), antes, 'processar nao pode alterar o historico recebido');
    if (r.evento) s.eventos.push(r.evento); s.resp.push({ req, r }); return r; };
  s.rncs = () => C.reconstruir(s.eventos); return s; };
const abrirOk = (o = {}) => Object.assign({ acao: 'abrir', serial: SERIES[0], banco: 'BT2', modelo: 'Mod X', tipo_nc: 'DEFEITO', descricao: 'vazamento de oleo', actor: 'Ana', idempotency_key: 'chave-0001-a' }, o);

// ---- gerador de roteiros ----
const idemArb = fc.constantFrom('chave-0001-a', 'chave-0002-b', 'chave-0003-c', 'curta', undefined, '', 'x'.repeat(101), 'y'.repeat(100), 'z'.repeat(8));
const abrirArb = fc.record({ acao: fc.constant('abrir'), serial: fc.constantFrom(...SERIES, 'curto', 'abc def ghi jkl mno pqr', ' m9mgd26060019sdfwa01715 '), banco: fc.constantFrom('BT1', 'BT2', 'bt2', 'BT3'),
  modelo: fc.constantFrom('Mod X', 'Mod Y', '', 'm'.repeat(61)), tipo_nc: fc.constantFrom('DEFEITO', 'ERRO_MONTAGEM', 'defeito', 'OUTRO', 'NADA'), descricao: fc.constantFrom('vazamento de oleo', 'ruido', 'abcd', 'a'.repeat(1001), 'a'.repeat(1000)),
  actor: fc.constantFrom('Ana', 'Beto', '', '   ', 'n'.repeat(61)), idempotency_key: idemArb, contexto: fc.constantFrom(undefined, null, { etapa: 2 }, [], 'x', { grande: 'g'.repeat(8001) }) });
const eventoArb = fc.record({ acao: fc.constant('evento'), rnc: fc.nat(3), rev: fc.constantFrom('certa', 'velha', 'futura', 'texto', undefined), event: fc.constantFrom('REPARO_INICIADO', 'REPARO_REGISTRADO', 'RETESTE_REGISTRADO', 'reparo_iniciado', 'LIBERAR', ''),
  data: fc.constantFrom(undefined, {}, { acao: 'troca de junta' }, { acao: 'ab' }, { acao: 'troca', peca: 'retentor' }, { resultado: 'APROVADO' }, { resultado: 'reprovado' }, { resultado: 'TALVEZ' }), actor: fc.constantFrom('Beto', '') });
const fotoArb = fc.record({ acao: fc.constant('foto'), rnc: fc.nat(3), foto_ref: fc.constantFrom('f1.jpg', 'f2.jpg'), bytes: fc.constantFrom(undefined, 1234), actor: fc.constantFrom('Ana', '') });
const roteiroArb = fc.array(fc.oneof({ weight: 4, arbitrary: abrirArb }, { weight: 8, arbitrary: eventoArb }, { weight: 2, arbitrary: fotoArb }, { weight: 1, arbitrary: fc.constant({ acao: 'xyz' }) }), { minLength: 1, maxLength: 40 });

function executa(roteiro) {
  const s = servidor();
  for (const p of roteiro) {
    const ids = Object.keys(s.rncs()).sort(), alvo = ids[p.rnc % Math.max(ids.length, 1)], atual = alvo ? s.rncs()[alvo] : null;
    let req = p;
    if (p.acao === 'evento' || p.acao === 'foto') {
      req = { ...p, rnc_id: alvo || 'RNC-2026-9999', actor: p.actor, event: p.event, data: p.data };
      if (p.acao === 'evento') req.rev_esperado = ({ certa: atual ? atual.rev : 1, velha: atual ? atual.rev - 1 : 0, futura: atual ? atual.rev + 1 : 2, texto: String(atual ? atual.rev : 1), undefined: undefined })[p.rev];
    }
    s.pede(req);
  }
  return s;
}

test('ESTRUTURA: status previstos; so 200/201 gravam; erro nao grava e explica; ids e revisoes sem buraco; nunca lanca erro', () => {
  fc.assert(fc.property(roteiroArb, rot => {
    const s = executa(rot);
    s.resp.forEach(({ r }) => { assert.ok([200, 201, 400, 404, 409, 422].includes(r.status), 'status ' + r.status); assert.equal(typeof r.body, 'object');
      if (r.evento) { assert.ok(r.status === 200 || r.status === 201); assert.equal(r.body.ok, true); } else if (r.status >= 400) { assert.equal(r.body.ok, false); assert.equal(typeof r.body.erro, 'string'); } });
    s.eventos.forEach((e, i) => { assert.equal(e.event_id, 'EVT-' + String(i + 1).padStart(6, '0')); assert.equal(e.schema_version, 1); assert.equal(e.timestamp, AGORA.toISOString()); assert.ok(e.actor && e.actor.trim()); });
    const abertas = s.eventos.filter(e => e.event === 'RNC_ABERTA'); assert.deepEqual(abertas.map(e => e.rnc_id), abertas.map((_, i) => 'RNC-2026-' + String(i + 1).padStart(4, '0')), 'numeracao por ano sem buracos');
    for (const id of Object.keys(s.rncs())) { const evs = s.eventos.filter(e => e.rnc_id === id), mudam = evs.filter(e => e.event !== 'FOTO_ANEXADA'); assert.deepEqual(mudam.map(e => e.rev), mudam.map((_, i) => i + 1), 'rev sobe de 1 em 1 a cada mudanca de estado'); evs.filter(e => e.event === 'FOTO_ANEXADA').forEach(e => assert.ok(e.rev >= 1)); }
  }), cfg);
});

test('MAQUINA DE ESTADOS: so as transicoes da tabela; LIBERADO so depois de RETESTE APROVADO; reteste reprovado volta a EM_REPARO; estado final = reconstruido dos eventos', () => {
  fc.assert(fc.property(roteiroArb, rot => {
    const s = executa(rot), AUT = { ABERTA: { REPARO_INICIADO: 'EM_REPARO' }, EM_REPARO: { REPARO_REGISTRADO: 'AGUARDANDO_RETESTE' }, AGUARDANDO_RETESTE: { RETESTE_REGISTRADO: '*' } };
    for (const id of Object.keys(s.rncs())) { let est = 'ABERTA';
      for (const e of s.eventos.filter(x => x.rnc_id === id && x.event !== 'RNC_ABERTA' && x.event !== 'FOTO_ANEXADA')) {
        const t = (AUT[est] || {})[e.event]; assert.ok(t, `transicao proibida ${e.event} em ${est}`);
        est = t === '*' ? (e.data.resultado === 'APROVADO' ? 'LIBERADO' : 'EM_REPARO') : t; }
      assert.equal(s.rncs()[id].estado, est);
      if (est === 'LIBERADO') assert.ok(s.eventos.some(x => x.rnc_id === id && x.event === 'RETESTE_REGISTRADO' && x.data.resultado === 'APROVADO'), 'liberou sem reteste aprovado'); }
  }), cfg);
});

test('IDEMPOTENCIA: repetir um "abrir" ja aceito devolve 200 repetido sem gravar; mesma chave com OUTRO conteudo e 409 CHAVE_REUTILIZADA; sem chave ou chave fora de 8 a 100 = 400', () => {
  fc.assert(fc.property(abrirArb, fc.integer({ min: 1, max: 4 }), (a, n) => {
    const s = servidor(), r1 = s.pede(a);
    if (r1.status !== 201) { assert.ok([400].includes(r1.status)); assert.equal(s.eventos.length, 0); return; }
    for (let i = 0; i < n; i++) { const r = s.pede(a); assert.equal(r.status, 200); assert.equal(r.body.repetido, true); assert.equal(r.evento, null); assert.equal(r.body.rnc.rnc_id, r1.body.rnc.rnc_id); }
    assert.equal(s.eventos.length, 1, 'nenhuma RNC a mais');
    const outro = s.pede({ ...a, descricao: a.descricao === 'ruido de motor' ? 'outro defeito grave' : 'ruido de motor' });
    assert.equal(outro.status, 409); assert.equal(outro.body.codigo, 'CHAVE_REUTILIZADA'); assert.equal(outro.body.rnc_id, r1.body.rnc.rnc_id); assert.equal(s.eventos.length, 1);
  }), cfg);
  const s = servidor();
  for (const k of [undefined, '', '   ', 'curta12', 'x'.repeat(101)]) { const r = s.pede(abrirOk({ idempotency_key: k })); assert.equal(r.status, 400); assert.match(r.body.erro, /idempotency_key/); }
  assert.equal(s.pede(abrirOk({ idempotency_key: '12345678' })).status, 201); assert.equal(s.pede(abrirOk({ idempotency_key: 'x'.repeat(100), descricao: 'outra falha qualquer' })).status, 201); assert.equal(s.eventos.length, 2);
});

test('IDEMPOTENCIA: o conteudo e comparado depois de normalizar (serie minuscula/espacada, banco minusculo, tipo minusculo, espacos nas pontas)', () => {
  const s = servidor(); assert.equal(s.pede(abrirOk()).status, 201);
  const r = s.pede(abrirOk({ serial: ' m9mgd26060019sdfwa01715 ', banco: 'bt2', tipo_nc: 'defeito', modelo: ' Mod X ', descricao: '  vazamento de oleo  ' }));
  assert.equal(r.status, 200); assert.equal(r.body.repetido, true);
  for (const mud of [{ serial: SERIES[1] }, { banco: 'BT1' }, { modelo: 'Mod Y' }, { tipo_nc: 'OUTRO' }, { descricao: 'vazamento de agua' }]) { const x = s.pede(abrirOk(mud)); assert.equal(x.status, 409, JSON.stringify(mud)); }
  assert.equal(s.eventos.length, 1);
});

test('REVISAO (controle de edicao simultanea): rev velha ou futura = 409 com rev_atual; nao inteira ou ausente = 400; nada e gravado', () => {
  const s = servidor(); const id = s.pede(abrirOk()).body.rnc.rnc_id;
  const ev = (rev, extra) => s.pede({ acao: 'evento', rnc_id: id, rev_esperado: rev, event: 'REPARO_INICIADO', actor: 'Beto', ...extra });
  for (const rev of [0, 2, -1, 99]) { const r = ev(rev); assert.equal(r.status, 409); assert.equal(r.body.rev_atual, 1); assert.equal(r.body.rnc.rnc_id, id); assert.equal(r.evento, null); }
  for (const rev of [undefined, null, '1', 1.5, NaN]) { const r = ev(rev); assert.equal(r.status, 400); assert.match(r.body.erro, /rev_esperado/); }
  assert.equal(s.eventos.length, 1); const ok = ev(1); assert.equal(ok.status, 200); assert.equal(ok.body.rnc.rev, 2);
  assert.equal(ev(1).status, 409, 'repetir com a rev antiga depois de aceita e recusado (protecao contra duplo clique)'); assert.equal(s.eventos.length, 2);
});

test('TRANSICAO: pular estado = 422 com a lista do que e permitido; LIBERADO e terminal; reparo exige acao (3+ caracteres); reteste exige APROVADO ou REPROVADO', () => {
  const s = servidor(); const id = s.pede(abrirOk()).body.rnc.rnc_id; let rev = 1;
  const ev = (event, data, extra) => s.pede({ acao: 'evento', rnc_id: id, rev_esperado: rev, event, data, actor: 'Beto', ...extra });
  for (const e of ['REPARO_REGISTRADO', 'RETESTE_REGISTRADO', 'LIBERAR', '']) { const r = ev(e, { acao: 'abcde', resultado: 'APROVADO' }); assert.equal(r.status, 422); assert.deepEqual(r.body.permitidos, ['REPARO_INICIADO']); assert.equal(r.body.estado, 'ABERTA'); }
  assert.equal(ev('reparo_iniciado').status, 200); rev++;
  for (const d of [undefined, {}, { acao: 'ab' }, { acao: '  a ' }, { acao: 'x'.repeat(1001) }]) assert.equal(ev('REPARO_REGISTRADO', d).status, 400, String(JSON.stringify(d)).slice(0, 30));
  assert.equal(ev('REPARO_REGISTRADO', { acao: 'abc', peca: 'p'.repeat(2000) }).status, 200); rev++;
  assert.equal(s.rncs()[id].reparos[0].peca.length, 1000, 'peca e cortada em 1000');
  for (const d of [undefined, {}, { resultado: 'TALVEZ' }, { resultado: '' }]) assert.equal(ev('RETESTE_REGISTRADO', d).status, 400);
  assert.equal(ev('RETESTE_REGISTRADO', { resultado: 'reprovado', ensaio_id: 'E1' }).status, 200); rev++; assert.equal(s.rncs()[id].estado, 'EM_REPARO'); assert.equal(s.rncs()[id].retestes[0].ensaio_id, 'E1');
  assert.equal(ev('REPARO_REGISTRADO', { acao: 'refeito' }).status, 200); rev++;
  const lib = ev('RETESTE_REGISTRADO', { resultado: 'APROVADO' }); assert.equal(lib.status, 200); assert.equal(lib.body.rnc.estado, 'LIBERADO'); assert.equal(lib.body.situacao, 'LIBERADO'); rev++;
  const depois = ev('REPARO_INICIADO'); assert.equal(depois.status, 422); assert.deepEqual(depois.body.permitidos, []);
  assert.equal(s.pede({ acao: 'evento', rnc_id: 'RNC-2026-0099', rev_esperado: 1, event: 'REPARO_INICIADO', actor: 'x' }).status, 404);
  assert.equal(s.pede({ acao: 'evento', rnc_id: id, rev_esperado: rev, event: 'REPARO_INICIADO', actor: '' }).status, 400, 'sem nome de quem registra');
});

test('SITUACAO DO GERADOR: BLOQUEADO enquanto QUALQUER RNC da serie nao estiver LIBERADO; LIBERADO so com todas liberadas; SEM_RNC sem nenhuma', () => {
  fc.assert(fc.property(roteiroArb, rot => {
    const s = executa(rot), rncs = s.rncs();
    for (const serie of [...SERIES, 'OUTRA']) { const sit = C.situacaoSerie(rncs, serie), lista = Object.values(rncs).filter(r => r.serial === serie);
      assert.equal(sit.total, lista.length); assert.deepEqual(sit.pendentes.map(p => p.rnc_id), lista.filter(r => r.estado !== 'LIBERADO').map(r => r.rnc_id));
      assert.equal(sit.situacao, lista.length === 0 ? 'SEM_RNC' : lista.every(r => r.estado === 'LIBERADO') ? 'LIBERADO' : 'BLOQUEADO'); }
  }), cfg);
  const s = servidor(); const a = s.pede(abrirOk()).body.rnc.rnc_id, b = s.pede(abrirOk({ idempotency_key: 'chave-0002-b', descricao: 'segundo defeito' })).body.rnc.rnc_id;
  const lib = id => { let rev = 1; for (const [event, data] of [['REPARO_INICIADO'], ['REPARO_REGISTRADO', { acao: 'conserto' }], ['RETESTE_REGISTRADO', { resultado: 'APROVADO' }]]) s.pede({ acao: 'evento', rnc_id: id, rev_esperado: rev++, event, data, actor: 'B' }); };
  lib(a); assert.equal(C.situacaoSerie(s.rncs(), SERIES[0]).situacao, 'BLOQUEADO', 'ainda ha a segunda RNC'); lib(b); assert.equal(C.situacaoSerie(s.rncs(), SERIES[0]).situacao, 'LIBERADO');
});

test('ABRIR: validacoes (serie, banco, modelo, tipo, descricao, contexto, nome) e normalizacao gravada', () => {
  const s = servidor(); const bad = (mud, re) => { const r = s.pede(abrirOk({ idempotency_key: 'chv-' + Math.random().toString(36).slice(2, 12), ...mud })); assert.equal(r.status, 400, JSON.stringify(mud).slice(0, 50)); assert.match(r.body.erro, re); return r; };
  bad({ serial: 'curto' }, /número de série fora do formato/); bad({ serial: 'a'.repeat(31) }, /fora do formato/); bad({ serial: 'AAAAAAAAAAAAAA' }, /fora do formato/); bad({ banco: 'BT3' }, /banco inválido/); bad({ modelo: '' }, /informe o modelo/); bad({ modelo: 'm'.repeat(61) }, /modelo/);
  bad({ tipo_nc: 'NADA' }, /tipo/); bad({ descricao: 'abcd' }, /descreva o defeito \(5 a 1000/); bad({ descricao: 'a'.repeat(1001) }, /descreva/); bad({ actor: '  ' }, /quem está registrando/); bad({ actor: 'n'.repeat(61) }, /nome muito longo/);
  bad({ contexto: [] }, /contexto deve ser um objeto/); bad({ contexto: 'x' }, /objeto/); bad({ contexto: { g: 'g'.repeat(8001) } }, /grande demais/); assert.equal(s.eventos.length, 0);
  assert.equal(s.pede(abrirOk({ idempotency_key: 'borda-1234', serial: 'A'.repeat(15), descricao: 'abcde' })).status, 201); assert.equal(s.pede(abrirOk({ idempotency_key: 'borda-5678', serial: 'B'.repeat(30), descricao: 'a'.repeat(1000), modelo: 'm'.repeat(60), actor: 'n'.repeat(60) })).status, 201);
  const r = s.pede(abrirOk({ idempotency_key: 'norm-12345', serial: ' m9mg d260600 19sdfwa01715 ', banco: ' bt1 ', tipo_nc: ' outro ', contexto: { etapa: 3, hz: 60.01 }, ensaio_id: ' E-9 ' })); assert.equal(r.status, 201);
  const e = r.evento; assert.equal(e.serial, SERIES[0]); assert.equal(e.banco, 'BT1'); assert.equal(e.data.tipo_nc, 'OUTRO'); assert.deepEqual(e.data.contexto, { etapa: 3, hz: 60.01 }); assert.equal(e.data.ensaio_id, 'E-9'); assert.equal(e.idem, 'norm-12345'); assert.equal(e.rev, 1); assert.equal(r.body.situacao, 'BLOQUEADO');
  assert.equal(s.pede(abrirOk({ idempotency_key: 'sem-ctx-123' })).evento.data.contexto, undefined);
});

test('FOTO: anexa a RNC existente sem mudar estado nem revisao; RNC inexistente = 404; acao desconhecida = 400', () => {
  const s = servidor(); const id = s.pede(abrirOk()).body.rnc.rnc_id;
  const r = s.pede({ acao: 'foto', rnc_id: id, foto_ref: 'f1.jpg', bytes: 99, actor: 'Ana' }); assert.equal(r.status, 201); assert.equal(r.body.rnc.estado, 'ABERTA'); assert.equal(r.body.rnc.rev, 1); assert.deepEqual(r.body.rnc.fotos.map(f => [f.foto_ref, f.bytes, f.por]), [['f1.jpg', 99, 'Ana']]);
  assert.equal(s.pede({ acao: 'foto', rnc_id: 'RNC-2026-0042', foto_ref: 'x', actor: 'Ana' }).status, 404);
  assert.equal(s.pede({ acao: 'xyz', rnc_id: id, actor: 'Ana' }).status, 400); assert.equal(s.pede({ acao: 'evento', rnc_id: id, rev_esperado: 1, event: 'REPARO_INICIADO', actor: 'B' }).body.rnc.fotos.length, 1);
});

test('RECONSTRUIR: determinista, ignora evento orfao (arquivo editado a mao) sem quebrar e nao altera a entrada', () => {
  fc.assert(fc.property(roteiroArb, rot => {
    const s = executa(rot), ev = s.eventos, antes = JSON.stringify(ev), a = C.reconstruir(ev), b = C.reconstruir(ev);
    assert.deepEqual(a, b); assert.equal(JSON.stringify(ev), antes);
    const comOrfao = [{ event_id: 'EVT-X', rnc_id: 'RNC-1999-0001', event: 'REPARO_INICIADO', timestamp: 't', actor: 'x', rev: 9, data: {} }, ...ev]; assert.deepEqual(C.reconstruir(comOrfao), a);
  }), cfg);
  assert.deepEqual(C.reconstruir([]), {}); assert.equal(C.normalizaSerie('  ab c\td '), 'ABCD'); assert.equal(C.normalizaSerie(undefined), ''); assert.equal(C.normalizaSerie(123), '');
});

test('NUMERACAO por ano: o contador reinicia a cada ano (RNC-AAAA-NNNN) e o evento seguinte tem numero seguinte', () => {
  const s = servidor(); s.pede(abrirOk()); s.agora = new Date('2027-01-02T00:00:00Z'); const r = s.pede(abrirOk({ idempotency_key: 'ano-novo-1', descricao: 'defeito de 2027' }));
  assert.equal(r.evento.rnc_id, 'RNC-2027-0001'); assert.equal(r.evento.event_id, 'EVT-000002'); assert.deepEqual(Object.keys(s.rncs()).sort(), ['RNC-2026-0001', 'RNC-2027-0001']);
});

// ---- exemplos exatos que fecham os buracos mostrados pelo teste de mutacao ----
test('IDEMPOTENCIA tambem nos EVENTOS (idempotency_key opcional): repetir devolve 200 repetido sem gravar; a chave fica no evento gravado', () => {
  const s = servidor(); const id = s.pede(abrirOk()).body.rnc.rnc_id;
  const pedido = { acao: 'evento', rnc_id: id, rev_esperado: 1, event: 'REPARO_INICIADO', actor: 'Beto', idempotency_key: 'evt-chave-1' };
  const r1 = s.pede(pedido); assert.equal(r1.status, 200); assert.equal(r1.body.ok, true); assert.equal(r1.evento.idem, 'evt-chave-1'); assert.equal(r1.body.rnc.estado, 'EM_REPARO');
  const n = s.eventos.length, r2 = s.pede(pedido); assert.equal(r2.status, 200); assert.equal(r2.body.repetido, true); assert.equal(r2.body.ok, true); assert.equal(r2.evento, null); assert.equal(r2.body.rnc.rnc_id, id); assert.equal(s.eventos.length, n);
  const r3 = s.pede({ ...pedido, idempotency_key: undefined, rev_esperado: 2 }); assert.equal(r3.status, 422, 'sem chave nao e repeticao'); assert.equal(s.eventos.length, n);
  assert.equal(s.eventos[0].idem, 'chave-0001-a'); assert.equal('idem' in s.pede({ acao: 'evento', rnc_id: id, rev_esperado: 2, event: 'REPARO_REGISTRADO', data: { acao: 'conserto' }, actor: 'B' }).evento, false, 'sem chave: o evento nao carrega idem');
});

test('mensagens e campos exatos das recusas (a chave obrigatoria, formato da serie, acao desconhecida) e dos retornos de sucesso', () => {
  const s = servidor();
  assert.equal(s.pede(abrirOk({ idempotency_key: undefined })).body.erro, 'idempotency_key é obrigatória para abrir RNC (reenviar sem ela duplicaria o registro)');
  assert.equal(s.pede(abrirOk({ idempotency_key: 'curta' })).body.erro, 'idempotency_key deve ter de 8 a 100 caracteres');
  const f = s.pede(abrirOk({ serial: 'curto' })); assert.equal(f.body.serialRegex, '^[A-Z0-9]{15,30}$');
  const r = s.pede(abrirOk()); assert.equal(r.body.ok, true); assert.equal(r.body.rnc.estado, 'ABERTA'); assert.deepEqual([r.body.rnc.fotos, r.body.rnc.reparos, r.body.rnc.retestes], [[], [], []]); assert.equal(r.body.rnc.ensaio_id, null); assert.equal(r.body.rnc.contexto, null);
  assert.deepEqual(r.body.rnc.historico.map(h => [h.event, h.actor, h.rev]), [['RNC_ABERTA', 'Ana', 1]]);
  const id = r.body.rnc.rnc_id, rep = s.pede(abrirOk()); assert.equal(rep.body.repetido, true); assert.equal(rep.body.ok, true);
  assert.equal(s.pede({ acao: 'xyz', rnc_id: id, rev_esperado: 1, event: 'REPARO_INICIADO', actor: 'Ana' }).body.erro, 'ação desconhecida');
  assert.equal(s.pede({ acao: 'evento', rnc_id: id, actor: 'Ana' }).body.erro, 'informe rev_esperado');
  const ok = s.pede({ acao: 'evento', rnc_id: id, rev_esperado: 1, event: 'REPARO_INICIADO', actor: 'Beto' }); assert.equal(ok.body.ok, true); assert.deepEqual(ok.body.rnc.historico.map(h => h.event), ['RNC_ABERTA', 'REPARO_INICIADO']);
  const rep2 = s.pede({ acao: 'evento', rnc_id: id, rev_esperado: 2, event: 'REPARO_REGISTRADO', data: { acao: 'conserto' }, actor: 'B' }); assert.deepEqual(rep2.evento.data, { acao: 'conserto' }, 'sem peca: o campo nao e gravado');
  const ret = s.pede({ acao: 'evento', rnc_id: id, rev_esperado: 3, event: 'RETESTE_REGISTRADO', data: { resultado: 'APROVADO' }, actor: 'B' }); assert.deepEqual(ret.evento.data, { resultado: 'APROVADO' }, 'sem ensaio_id: o campo nao e gravado');
});

test('limites exatos (contexto 8000, acao 1000, nome 60, modelo 60) e configuracao sobrescrita por quem chama', () => {
  const s = servidor(), ctx = n => ({ g: 'g'.repeat(n - 8) });                     // JSON = {"g":"..."} tem 8 caracteres de moldura
  assert.equal(JSON.stringify(ctx(8000)).length, 8000);
  assert.equal(s.pede(abrirOk({ idempotency_key: 'ctx-8000-ok', contexto: ctx(8000) })).status, 201); assert.equal(s.pede(abrirOk({ idempotency_key: 'ctx-8001-no', contexto: ctx(8001) })).status, 400);
  const id = Object.keys(s.rncs())[0]; let rev = 1; const ev = (event, data) => s.pede({ acao: 'evento', rnc_id: id, rev_esperado: rev, event, data, actor: 'B' });
  assert.equal(ev('REPARO_INICIADO').status, 200); rev++; assert.equal(ev('REPARO_REGISTRADO', { acao: 'a'.repeat(1000) }).status, 200);
  const custom = C.processar([], abrirOk({ banco: 'BT9', serial: 'curto', descricao: 'abcdef' }), AGORA, { bancos: ['BT9'], serialRegex: '^C.+$', maxTexto: 5 });
  assert.equal(custom.status, 400); assert.match(custom.body.erro, /descreva o defeito \(5 a 5/); assert.equal(C.processar([], abrirOk({ banco: 'BT9', serial: 'CURTO', descricao: 'abcde' }), AGORA, { bancos: ['BT9'], serialRegex: '^C.+$', maxTexto: 5 }).status, 201);
  assert.deepEqual(C.ESTADOS, ['ABERTA', 'EM_REPARO', 'AGUARDANDO_RETESTE', 'LIBERADO']); assert.equal(C.SCHEMA_VERSION, 1);
  assert.deepEqual(C.TRANSICOES.LIBERADO, {}); assert.equal(C.TRANSICOES.AGUARDANDO_RETESTE.RETESTE_REGISTRADO, '*');
  const comEns = servidor(); const r = comEns.pede(abrirOk({ ensaio_id: 'E-7' })); assert.equal(r.body.rnc.ensaio_id, 'E-7');
});
