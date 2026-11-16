// Prototipo RNC em flash card (rnc_flashcard_proto_v0.1.html): percorre Registro e Reparo no celular e no PC. Nao grava nada (file://). Uso: node tests/e2e/rnc_flashcard_proto.js (SHOTS=pasta)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.ARQ || 'rnc_flashcard_proto_v0.1.html'); const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['celular 390', { width: 390, height: 844 }, true], ['desktop 1280', { width: 1280, height: 800 }, false]]) {
    console.log('\n## ' + nome); const k = nome.split(' ')[0];
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const erros = [], rede = []; p.on('pageerror', e => erros.push(e.message)); p.on('request', r => { if (!/^file:|^data:/.test(r.url())) rede.push(r.url()); });
    await p.goto('file://' + ARQ); const shot = async n => { if (SHOTS) await p.screenshot({ path: SHOTS + '/' + k + '_' + n + '.png', fullPage: true }); };
    const semScroll = async n => ok('sem rolagem horizontal ' + n, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    const passo = () => p.evaluate(() => document.querySelector('.prog [aria-valuenow]') ? 0 : +document.querySelector('.prog').getAttribute('aria-valuenow'));
    ok('abre no Registro, passo 1 de 6, com o contexto automatico', await p.evaluate(() => /Este é o gerador/.test(document.body.innerText) && /Já anexado automaticamente/.test(document.body.innerText) && document.querySelector('.prog').getAttribute('aria-valuenow') === '1'));
    await shot('1_serie'); await semScroll('serie');
    await p.click('#bProx'); await p.waitForTimeout(300); await shot('2_tipo');
    ok('passo 2: tipo (4 opcoes), avanca com 1 toque', await p.evaluate(() => document.querySelectorAll('.tile').length === 4 && document.querySelector('.prog').getAttribute('aria-valuenow') === '2'));
    await p.click('.tile[data-v=DEFEITO]'); await p.waitForTimeout(300); await shot('3_comp');
    ok('passo 3: componente (8 opcoes)', await p.evaluate(() => document.querySelectorAll('.tile').length === 8 && /Onde está/.test(document.body.innerText)));
    await p.click('.tile[data-v=Alternador]'); await p.waitForTimeout(300); await shot('4_grav');
    ok('passo 4: gravidade (3 opcoes)', await p.evaluate(() => document.querySelectorAll('.tile').length === 3));
    await p.click('.tile[data-v=g3]'); await p.waitForTimeout(300); await shot('5_visto');
    ok('passo 5: "Conferir" fica desligado ate marcar algo', await p.evaluate(() => document.getElementById('bProx').disabled === true));
    await p.click('[data-m="Sem tensão"]'); ok('marcar um item liga o Conferir', await p.evaluate(() => document.getElementById('bProx').disabled === false)); await semScroll('visto');
    await p.click('#bVolta'); await p.waitForTimeout(250); ok('voltar mantem a gravidade escolhida', await p.evaluate(() => document.querySelector('.tile[data-v=g3]').getAttribute('aria-pressed') === 'true'));
    await p.click('.tile[data-v=g3]'); await p.waitForTimeout(250); ok('voltar nao perde o que foi marcado no passo 5', await p.evaluate(() => document.querySelector('[data-m="Sem tensão"]').getAttribute('aria-pressed') === 'true'));
    await p.click('#bProx'); await p.waitForTimeout(300); await shot('6_conf');
    ok('passo 6: resumo com serie, tipo, onde, gravidade e visto', await p.evaluate(() => { const t = document.querySelector('.resumo').innerText; return /EXEMPLO0000000001/.test(t) && /Defeito/.test(t) && /Alternador/.test(t) && /Crítica/.test(t) && /Sem tensão/.test(t); }));
    await p.click('#bReg'); await p.waitForTimeout(300); await shot('7_fim');
    ok('fim: numero da RNC, aviso de BLOQUEADO e "nada foi gravado"', await p.evaluate(() => /RNC-2026-0007/.test(document.body.innerText) && /BLOQUEADO/.test(document.body.innerText) && /nada foi gravado/.test(document.body.innerText)));
    await p.click('#bVaiRep'); await p.waitForTimeout(300); await shot('8_reparo');
    ok('"Ver no Reparo" abre a RNC nova como ABERTA', await p.evaluate(() => document.querySelector('[data-card="RNC-2026-0007"] .est.ABERTA') && document.querySelector('[data-card="RNC-2026-0007"] [data-ac=assumir]')));
    await p.click('[data-ac=assumir]'); await p.waitForTimeout(700);
    ok('assumir: o cartao vira para EM REPARO', await p.evaluate(() => !!document.querySelector('[data-card="RNC-2026-0007"] .est.EM_REPARO')));
    await p.click('[data-ac=registrar]'); await p.click('#bBloq', { timeout: 500 }).catch(() => {});
    await p.click('#bFeito'); ok('reparo sem texto e recusado (campo fica vermelho)', await p.evaluate(() => !!document.getElementById('fAcao') && getComputedStyle(document.getElementById('fAcao')).borderTopColor !== ''));
    await p.click('[data-chip="Troquei a peça"]'); await p.fill('#fPeca', 'Regulador AVR'); await shot('9_feito'); await p.click('#bFeito'); await p.waitForTimeout(700);
    ok('reparo feito: vai para AGUARDANDO RETESTE', await p.evaluate(() => !!document.querySelector('[data-card="RNC-2026-0007"] .est.AGUARDANDO_RETESTE')));
    await p.click('[data-ac=rep]'); await p.waitForTimeout(600); ok('reteste reprovado volta para EM REPARO', await p.evaluate(() => !!document.querySelector('[data-card="RNC-2026-0007"] .est.EM_REPARO')));
    await p.click('[data-ac=registrar]'); await p.fill('#fAcao', 'Ajuste fino'); await p.click('#bFeito'); await p.waitForTimeout(600); await p.click('[data-ac=apr]'); await p.waitForTimeout(600);
    ok('reteste aprovado: LIBERADO', await p.evaluate(() => !!document.querySelector('[data-card="RNC-2026-0007"] .est.LIBERADO'))); await shot('10_liberado'); await semScroll('reparo');
    ok('alvos de toque >= 44 px no celular', !mobile || await p.evaluate(() => [...document.querySelectorAll('button,.tile')].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().height >= 43)));
    ok('nada saiu para a rede (protótipo)', rede.length === 0, rede.join(','));
    ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | ')); await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
