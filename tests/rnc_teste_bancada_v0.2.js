#!/usr/bin/env node
/* =====================================================================================================================
   rnc_teste_bancada_v0.2.js — CONFERÊNCIA AUTOMÁTICA dos testes de API do RNC, para rodar NO PC DO NODE-RED  ·  13/11/2026
   PARA QUE SERVE (leigo): em vez de clicar em tudo, este script faz sozinho os testes T01, T03, T04, T05, T06–T09, T10–T13 do roteiro
   (docs/modulos/RNC_CHECKLIST_BANCADA_v0.1.md) e escreve OK ou FALHOU em cada um. Os testes que dependem de gente, do DSE real, de reinício
   ou de queda de rede (T14 em diante) continuam manuais.
   v0.2 (revisão de código): (1) corrigido o erro "Cannot access 'fim' before initialization" que escondia o resumo quando o servidor estava fora do ar; (2) T13b agora confere de verdade a numeração sem buraco (1..N do ano). Resto igual à v0.1.
   COMO USAR (PowerShell/CMD no PC do Node-RED, com o Node-RED já rodando e a aba RNC importada):
        node rnc_teste_bancada_v0.2.js http://localhost:1880
   Para testar do PC do reparo (prova a rede, T02), rode lá com o endereço do PC BT2:   node rnc_teste_bancada_v0.2.js http://<IP-BT2>:1880
   Precisa de Node 18 ou mais novo (o Node-RED 4 já exige isso). Não instala nada.
   SEGURANÇA: só roda se a pasta de dados informada pelo servidor (GET /api/rnc/saude) tiver "teste" no caminho (ex.: ...\\rnc-dados-teste) e estiver VAZIA,
   para nunca sujar o registro real. Usa só séries TESTE0000000000NN. Só fala com /api/rnc/*: NÃO toca PLC, chaves nem DSE.
   NÃO FAZ: não apaga nada (o arquivo é só de acréscimo); os registros de teste ficam na pasta de teste como evidência.
   SAÍDA: lista dos testes e o código de saída 0 (tudo OK) ou 1 (algum FALHOU).
   ===================================================================================================================== */
'use strict';
const base = (process.argv[2] || 'http://localhost:1880').replace(/\/+$/, '');
const forcar = process.argv.includes('--forcar-pasta-nao-vazia');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'); // 1 pixel
const R = []; // resultados
const reg = (id, desc, ok, obs) => { R.push({ id, desc, ok, obs: obs || '' }); console.log((ok ? 'OK     ' : 'FALHOU ') + id + '  ' + desc + (ok ? '' : '  -> ' + obs)); };
async function http(m, caminho, corpo, headers) {
  const r = await fetch(base + caminho, { method: m, headers: Object.assign(corpo && !Buffer.isBuffer(corpo) ? { 'Content-Type': 'application/json' } : {}, headers || {}), body: corpo ? (Buffer.isBuffer(corpo) ? corpo : JSON.stringify(corpo)) : undefined });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { s: r.status, j };
}
const abrir = (serial, extra) => http('POST', '/api/rnc/abrir', Object.assign({ serial, banco: 'BT2', modelo: 'Modelo de teste', tipo_nc: 'DEFEITO', descricao: 'registro automatico de teste de bancada', actor: 'Teste Automatico' }, extra));
const ev = (rnc, rev, event, data, actor) => http('POST', '/api/rnc/evento', { rnc_id: rnc.rnc_id, rev_esperado: rev, event, data, actor: actor || 'Tecnico Teste' });

(async () => {
  console.log('Servidor: ' + base + '\n');
  // T01/T02 — serviço no ar e pasta de TESTE vazia
  let sa;
  try { sa = await http('GET', '/api/rnc/saude'); } catch (e) { reg('T01', 'serviço responde em /api/rnc/saude', false, 'sem conexão com ' + base + ' (' + e.message + ')'); return fim(); }
  reg('T01', 'serviço responde (ok:true)', sa.s === 200 && sa.j && sa.j.ok === true, 'HTTP ' + sa.s);
  const arq = String((sa.j && sa.j.arquivo) || '');
  if (!/teste/i.test(arq)) { console.log('\nPARADO POR SEGURANÇA: a pasta de dados (' + arq + ') não tem "teste" no nome. Defina RNC_DIR para uma pasta de TESTE e reinicie o Node-RED.'); process.exit(2); }
  if (sa.j.eventos > 0 && !forcar) { console.log('\nPARADO POR SEGURANÇA: a pasta de teste já tem ' + sa.j.eventos + ' evento(s). Use uma pasta de teste vazia (ou --forcar-pasta-nao-vazia).'); process.exit(2); }
  reg('T01b', 'pasta de dados é de TESTE e está vazia', true, arq);

  // T03 — registrar
  const A = 'TESTE000000000001', B = 'TESTE000000000002';
  const a1 = await abrir(A);
  reg('T03', 'registrar RNC (201, id RNC-AAAA-NNNN, estado ABERTA, gerador BLOQUEADO)', a1.s === 201 && /^RNC-\d{4}-\d{4}$/.test(a1.j.rnc.rnc_id) && a1.j.rnc.estado === 'ABERTA' && a1.j.situacao === 'BLOQUEADO', JSON.stringify(a1.j).slice(0, 120));
  const rncA = a1.j && a1.j.rnc;
  // T04 — foto
  const f = await http('POST', '/api/rnc/foto/' + rncA.rnc_id + '?actor=Teste%20Automatico', PNG, { 'Content-Type': 'image/png' });
  const fr = await fetch(base + '/api/rnc/foto/' + rncA.rnc_id + '/1.png'); const buf = Buffer.from(await fr.arrayBuffer());
  reg('T04', 'foto anexada e lida de volta idêntica', f.s === 201 && fr.status === 200 && buf.equals(PNG), 'HTTP ' + f.s + '/' + fr.status);
  const ft = await http('POST', '/api/rnc/foto/' + rncA.rnc_id + '?actor=X', Buffer.from('nao e imagem'), { 'Content-Type': 'text/plain' });
  reg('T04b', 'arquivo que não é imagem é recusado (415)', ft.s === 415, 'HTTP ' + ft.s);
  // T05 — inválidos
  const n0 = (await http('GET', '/api/rnc/saude')).j.eventos;
  const inv = [await abrir('AB1'), await abrir(A, { descricao: 'ab' }), await abrir(A, { actor: '' }), await abrir(A, { banco: 'BT9' })];
  const n1 = (await http('GET', '/api/rnc/saude')).j.eventos;
  reg('T05', 'campos inválidos recusados (400) e nada gravado', inv.every(x => x.s === 400) && n0 === n1, inv.map(x => x.s).join(',') + ' eventos ' + n0 + '->' + n1);
  // idempotência
  const i1 = await abrir(B, { idempotency_key: 'bancada-1' }), i2 = await abrir(B, { idempotency_key: 'bancada-1' });
  reg('T21a', 'reenvio com a mesma chave não duplica (parte do T21)', i1.s === 201 && i2.j.repetido === true && i2.j.rnc.rnc_id === i1.j.rnc.rnc_id, 'HTTP ' + i1.s + '/' + i2.s);
  const rncB1 = i1.j.rnc;
  // T06–T09 — ciclo
  const l = await http('GET', '/api/rnc?serial=' + A);
  reg('T06', 'listagem mostra a RNC aberta', l.s === 200 && l.j.rncs.some(r => r.rnc_id === rncA.rnc_id && r.estado === 'ABERTA' && r.fotos.length === 1), 'HTTP ' + l.s);
  const ini = await ev(rncA, 1, 'REPARO_INICIADO', {}, 'Tecnico 1');
  reg('T07', 'assumir reparo -> EM_REPARO', ini.s === 200 && ini.j.rnc.estado === 'EM_REPARO' && ini.j.rnc.rev === 2, 'HTTP ' + ini.s);
  const pulo = await ev(rncA, 2, 'RETESTE_REGISTRADO', { resultado: 'APROVADO' });
  reg('T07b', 'pular estado (liberar direto) é recusado (422)', pulo.s === 422, 'HTTP ' + pulo.s);
  const sem = await ev(rncA, 2, 'REPARO_REGISTRADO', { acao: '' });
  reg('T08', 'reparo sem ação é recusado (400)', sem.s === 400, 'HTTP ' + sem.s);
  const rep = await ev(rncA, 2, 'REPARO_REGISTRADO', { acao: 'troca de componente (teste)', peca: 'peca de teste 123' });
  reg('T09', 'reparo com ação e peça -> AGUARDANDO_RETESTE', rep.s === 200 && rep.j.rnc.estado === 'AGUARDANDO_RETESTE' && rep.j.rnc.reparos[0].peca === 'peca de teste 123', 'HTTP ' + rep.s);
  // T10/T11 — reteste
  const rep1 = await ev(rncA, 3, 'RETESTE_REGISTRADO', { resultado: 'REPROVADO' });
  reg('T10', 'reteste REPROVADO volta a EM_REPARO e o gerador segue BLOQUEADO', rep1.s === 200 && rep1.j.rnc.estado === 'EM_REPARO' && rep1.j.situacao === 'BLOQUEADO', 'HTTP ' + rep1.s);
  await ev(rncA, 4, 'REPARO_REGISTRADO', { acao: 'segundo reparo (teste)' });
  const apr = await ev(rncA, 5, 'RETESTE_REGISTRADO', { resultado: 'APROVADO' });
  reg('T11', 'reteste APROVADO -> LIBERADO e gerador LIBERADO', apr.s === 200 && apr.j.rnc.estado === 'LIBERADO' && apr.j.situacao === 'LIBERADO', 'HTTP ' + apr.s);
  // T12 — duas RNCs na mesma série
  const b2 = await abrir(B, { descricao: 'segunda falha da mesma serie (teste)' }); const rncB2 = b2.j.rnc;
  let rev = 1; for (const [e, d] of [['REPARO_INICIADO', {}], ['REPARO_REGISTRADO', { acao: 'ok teste' }], ['RETESTE_REGISTRADO', { resultado: 'APROVADO' }]]) { await ev(rncB1, rev++, e, d); }
  const sb = await http('GET', '/api/rnc/serie/' + B);
  reg('T12', 'série com 2 RNCs: liberando só 1, o gerador segue BLOQUEADO', sb.j.situacao === 'BLOQUEADO' && sb.j.pendentes.length === 1 && sb.j.pendentes[0].rnc_id === rncB2.rnc_id, JSON.stringify(sb.j.pendentes));
  // T13 — edição simultânea
  const c1 = await ev(rncB2, 1, 'REPARO_INICIADO', {}, 'Tecnico 1'), c2 = await ev(rncB2, 1, 'REPARO_INICIADO', {}, 'Tecnico 2');
  reg('T13', 'edição simultânea: o segundo recebe 409 e nada duplica', c1.s === 200 && c2.s === 409 && c2.j.rev_atual === 2, 'HTTP ' + c1.s + '/' + c2.s);
  // consistência do histórico
  const todas = (await http('GET', '/api/rnc?encerradas=todas')).j.rncs;
  const nums = todas.map(r => { const m = /^RNC-(\d{4})-(\d{4})$/.exec(r.rnc_id); return m ? +m[2] : -1; }).sort((a, b) => a - b);
  reg('T13b', 'IDs únicos e sem buraco (1..N, em sequência)', nums.length > 0 && nums.every((n, i) => n === i + 1), nums.join(','));
  // série sem RNC
  const s0 = await http('GET', '/api/rnc/serie/TESTE000000000099');
  reg('T18', 'série sem RNC -> SEM_RNC', s0.j.situacao === 'SEM_RNC' && s0.j.total === 0, JSON.stringify(s0.j).slice(0, 80));
  fim_();
})().catch(e => { console.log('ERRO INESPERADO: ' + e.message); fim_(); });

function fim_() { fim(); }
function fim() {
  const f = R.filter(x => !x.ok);
  console.log('\n' + (R.length - f.length) + ' OK / ' + f.length + ' FALHOU  (de ' + R.length + ')');
  console.log('Os registros de teste ficam na pasta de teste como evidência. Testes manuais restantes: T14 em diante (medidor/DSE real, reinício, rede, backup, expedição).');
  process.exit(f.length ? 1 : 0);
}
