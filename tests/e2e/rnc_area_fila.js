// Medidor 1.10.216: area RNC com interruptor (nasce DESLIGADO), fila de envio sem rede e arquivo .csv. Servidor SIMULADO por page.route (file://).
// Uso: node tests/e2e/rnc_area_fila.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const os = require('os');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.216.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, acceptDownloads: true }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    const S = { modo: 'fora', posts: [], rncGets: 0, n: 0 };   // modo: fora | ok | 400 | 503
    await p.route('**/*', async r => {
      const u = r.request().url(), m = r.request().method(); if (!/\/api\//.test(u)) return r.continue();
      if (!/\/api\/rnc/.test(u)) return r.fulfill({ status: 503, body: '{}' });
      if (m === 'GET') S.rncGets++;
      if (S.modo === 'fora') return r.abort();
      if (S.modo === '503') return r.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false,"erro":"servidor ocupado"}' });
      if (m === 'POST' && /\/api\/rnc\/abrir/.test(u)) { let j = {}; try { j = JSON.parse(r.request().postData() || '{}'); } catch (e) {} S.posts.push(j); if (S.modo === '400') return r.fulfill({ status: 400, contentType: 'application/json', body: '{"ok":false,"erro":"descreva o defeito"}' }); S.n++; return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, rnc: { rnc_id: 'RNC-2026-' + String(S.n).padStart(4, '0'), estado: 'ABERTA' } }) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, rncs: [], total: 0, situacao: 'SEM_RNC', pendentes: [] }) });
    });
    await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(800);
    // ---- A) desligado por padrao ----
    ok('padrao DESLIGADO: botao "RNC" existe, "Registrar defeito" e o aviso NAO existem', await p.evaluate(() => !!document.getElementById('bRncArea') && !document.getElementById('bRnc') && !document.getElementById('pRncAv') && !RNC_DEFEITO.ativo()));
    await p.evaluate(() => { document.getElementById('dServ') && (document.getElementById('dServ').value = 'ABCDEFGHIJ0123456789'); }); await p.waitForTimeout(6500);
    ok('desligado: ZERO chamadas a /api/rnc em 6 s (mesmo com serie informada)', S.rncGets === 0 && S.posts.length === 0, 'GETs ' + S.rncGets);
    // ---- B) ligar pela area ----
    await p.evaluate(() => document.getElementById('bRncArea').click()); await p.waitForTimeout(500);
    ok('a area abre, com o interruptor desligado e o painel interno escondido', await p.evaluate(() => document.getElementById('dlgRncArea').open && !document.getElementById('rncOn').checked && document.getElementById('rncAreaOn').hidden));
    await p.evaluate(() => { const c = document.getElementById('rncOn'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(500);
    ok('ligado: aparece "Registrar defeito", o painel interno abre e a escolha fica guardada', await p.evaluate(() => !!document.getElementById('bRnc') && !document.getElementById('rncAreaOn').hidden && localStorage.getItem('medidor.rncAtivo') === '1'));
    await p.evaluate(() => document.getElementById('dlgRncArea').close());
    // ---- C) sem rede: fila + .csv ----
    await p.evaluate(() => document.getElementById('bRnc').click()); await p.waitForTimeout(400);
    await p.fill('#rncSerie', 'abc123def456ghi789'); await p.fill('#rncModelo', 'Modelo de teste'); await p.fill('#rncNome', 'Tecnico Teste'); await p.fill('#rncDesc', 'Falha; com "aspas"\ne quebra de linha');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 6000 }), p.evaluate(() => document.getElementById('rncEnv').click())]); await p.waitForTimeout(500);
    const arq = await dl.path(); const csv = fs.readFileSync(arq, 'utf8');
    ok('sem rede: baixou RNC_pendente_<serie>_<data-hora>.csv', /^RNC_pendente_ABC123DEF456GHI789_\d{8}_\d{6}\.csv$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    ok('o .csv tem BOM, cabecalho, a serie, a chave e o texto com aspas e quebra de linha preservados', csv.startsWith('﻿"chave";"serie"') && /ABC123DEF456GHI789/.test(csv) && /Falha; com ""aspas""\ne quebra/.test(csv) && /\[DEMO\]/.test(csv));
    ok('aviso: salvo SO neste aparelho, NAO esta no sistema, etiqueta de bloqueio', await p.evaluate(() => /NÃO está no sistema/.test(document.getElementById('rncRes').textContent) && /etiqueta/.test(document.getElementById('rncRes').textContent)));
    ok('o cabecalho mostra "RNC a enviar: 1"', await p.evaluate(() => { const e = document.getElementById('pRncPend'); return e && e.style.display !== 'none' && /a enviar: 1/.test(e.textContent); }));
    ok('nada chegou ao servidor ainda', S.posts.length === 0);
    const chave = await p.evaluate(() => RNC_DEFEITO.fila()[0].chave);
    // ---- D) rede volta: evento 'online' ----
    S.modo = 'ok'; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.waitForTimeout(1200);
    ok('rede voltou: enviou 1 vez, com a MESMA chave do arquivo, e a fila esvaziou', S.posts.length === 1 && S.posts[0].idempotency_key === chave && csv.includes(chave) && (await p.evaluate(() => RNC_DEFEITO.fila().length)) === 0, JSON.stringify(S.posts.map(x => x.idempotency_key)));
    ok('o cabecalho some quando nao ha pendentes e o operador ve "Enviada"', await p.evaluate(() => document.getElementById('pRncPend').style.display === 'none' && /Enviada/.test((document.getElementById('rncToast') || {}).textContent || '')));
    await p.evaluate(() => RNC_DEFEITO.reenvia()); await p.waitForTimeout(500); ok('reenviar de novo nao envia nada (sem duplicar)', S.posts.length === 1);
    // ---- E) recusa 400 nao entra na fila ----
    S.modo = '400'; await p.evaluate(() => document.getElementById('bRnc').click()); await p.waitForTimeout(300);
    await p.fill('#rncSerie', 'ZZZ123def456ghi789'); await p.fill('#rncModelo', 'M'); await p.fill('#rncNome', 'T'); await p.fill('#rncDesc', 'descricao valida');
    await p.evaluate(() => document.getElementById('rncEnv').click()); await p.waitForTimeout(700);
    ok('recusa do servidor (400): NAO entra na fila, aparece "NÃO foi salvo" e a janela segue preenchida', await p.evaluate(() => RNC_DEFEITO.fila().length === 0 && /NÃO foi salvo/.test(document.getElementById('rncRes').textContent) && document.getElementById('rncDesc').value === 'descricao valida'));
    // ---- F) 503 entra na fila; reenvio recusado fica visivel ----
    S.modo = '503'; await p.evaluate(() => document.getElementById('rncEnv').click()); await p.waitForTimeout(900);
    ok('erro 503 entra na fila', await p.evaluate(() => RNC_DEFEITO.fila().length === 1 && RNC_DEFEITO.fila()[0].estado === 'pendente'));
    S.modo = '400'; await p.evaluate(() => RNC_DEFEITO.reenvia()); await p.waitForTimeout(700);
    ok('reenvio recusado (400): fica na lista como RECUSADA, nunca some em silencio', await p.evaluate(() => RNC_DEFEITO.fila().length === 1 && RNC_DEFEITO.fila()[0].estado === 'recusada' && /recusadas: 1/.test(document.getElementById('pRncPend').textContent)));
    // ---- G) importar .csv ----
    const itens = [1, 2].map(i => ({ chave: 'imp-' + i, serial: 'IMPORT0000000000' + i + '0', modelo: 'Modelo; ' + i, banco: 'BT2', tipo_nc: 'DEFEITO', descricao: 'Linha ' + i + ';\ncom "aspas" e acentuação ç', actor: 'Importador', criado: new Date().toISOString(), contexto: { demo: true, n: i } }));
    const roda = await p.evaluate(its => { const t = RNC_DEFEITO.csvTexto(its), r = RNC_DEFEITO.itensDoCsv(t); return { ok: r.itens.length === 2 && r.erros.length === 0 && r.itens.every((x, i) => x.chave === its[i].chave && x.serial === its[i].serial && x.modelo === its[i].modelo && x.descricao === its[i].descricao && x.contexto && x.contexto.n === i + 1), texto: t }; }, itens);
    ok('ida e volta do .csv (ponto e virgula, aspas, quebra de linha, acentos, contexto) sem perda', roda.ok);
    const tmp = path.join(os.tmpdir(), 'rnc_import_teste_' + Date.now() + '.csv'); fs.writeFileSync(tmp, roda.texto);
    S.modo = 'ok'; S.posts.length = 0; await p.evaluate(() => document.getElementById('bRncArea').click()); await p.waitForTimeout(400);
    await p.setInputFiles('#rncImp', tmp); await p.waitForTimeout(1500);
    ok('"Enviar pendentes (.csv)": leu 2, enviou 2 com as chaves do arquivo (a RECUSADA antiga segue la)', S.posts.length === 2 && S.posts.map(x => x.idempotency_key).sort().join() === 'imp-1,imp-2' && (await p.evaluate(() => RNC_DEFEITO.fila().filter(i => i.estado === 'pendente').length)) === 0, JSON.stringify(S.posts.map(x => x.idempotency_key)));
    S.posts.length = 0; await p.setInputFiles('#rncImp', tmp); await p.waitForTimeout(1200);
    ok('importar o MESMO arquivo outra vez: o servidor recebe de novo (a chave garante que nao duplica la); a fila local nao acumula', (await p.evaluate(() => RNC_DEFEITO.fila().filter(i => i.estado === 'pendente').length)) === 0);
    // ---- H) desligar de novo: sem botao e sem rede ----
    await p.evaluate(() => { const c = document.getElementById('rncOn'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(400);
    ok('desligar tira o botao "Registrar defeito" e esconde o painel interno', await p.evaluate(() => !document.getElementById('bRnc') && document.getElementById('rncAreaOn').hidden && localStorage.getItem('medidor.rncAtivo') === '0'));
    ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | ')); await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
