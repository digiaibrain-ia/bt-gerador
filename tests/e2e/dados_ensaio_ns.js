// Dados do ensaio: segunda opcao "Por no de serie (MES)" (medidor 1.10.202; envio ao registro a partir da 1.10.203). Abre o arquivo direto (file://), sem servidor.
// Uso: node tests/e2e/dados_ensaio_ns.js     (MEDIDOR=nome.html para testar outra versao)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.205.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const eq = (p, nome, c) => p.evaluate(([nome, c]) => { const i = DADOS.equip.findIndex(r => r[0] === nome); return document.querySelector('#dEquip input[data-r="' + i + '"][data-c="' + c + '"]').value; }, [nome, c]);
const setEq = (p, nome, c, v) => p.evaluate(([nome, c, v]) => { const i = DADOS.equip.findIndex(r => r[0] === nome); const e = document.querySelector('#dEquip input[data-r="' + i + '"][data-c="' + c + '"]'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [nome, c, v]);
const digita = async (p, v) => { await p.fill('#dServ', v); await p.dispatchEvent('#dServ', 'input'); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1536x694', { width: 1536, height: 694 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(1800);
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(300);
    ok('dialogo abre e o modo padrao e Manual (original)', await p.evaluate(() => document.getElementById('dlgDados').open && document.querySelector('input[name=dModo]:checked').value === 'manual'));
    ok('modo Manual: caixa do NS escondida e area do SAP visivel', await p.evaluate(() => document.getElementById('dNsBox').hidden && getComputedStyle(document.querySelector('#dlgDados .sapimp')).display !== 'none'));
    const antes = await eq(p, 'Motor', 1);
    await digita(p, 'DTMFØ4447'); ok('Manual: digitar NS NAO preenche nada (igual ao original)', (await eq(p, 'Motor', 1)) === antes);
    await p.evaluate(() => document.querySelector('input[name=dModo][value=ns]').click()); await p.waitForTimeout(100);
    ok('modo NS: caixa visivel e SAP escondido', await p.evaluate(() => !document.getElementById('dNsBox').hidden && getComputedStyle(document.querySelector('#dlgDados .sapimp')).display === 'none'));
    ok('NS DTMFØ4447 preenche Motor Yanmar', (await eq(p, 'Motor', 1)) === 'Yanmar', await eq(p, 'Motor', 2));
    ok('... Alternador Mecc Alte', (await eq(p, 'Alternador', 1)) === 'Mecc Alte');
    ok('... Controlador DEIF AGC150', (await eq(p, 'Controlador', 1)) === 'DEIF' && (await eq(p, 'Controlador', 2)) === 'AGC150');
    ok('sem marca de alterado ainda', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 0));
    await setEq(p, 'Alternador', 1, 'WEG');
    ok('editar marca o campo (contorno azul) e conta no aviso', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 1 && /Alterados em relação ao NS \(1\)/.test(document.getElementById('dNsBox').textContent)));
    await digita(p, 'DTMFØ4447'); ok('mesmo NS nao sobrescreve a edicao', (await eq(p, 'Alternador', 1)) === 'WEG');
    await digita(p, 'GDWAØ4447'); await p.waitForTimeout(50);
    ok('NS novo preenche de novo e zera marcas', (await eq(p, 'Alternador', 1)) === 'WEG' && (await eq(p, 'Controlador', 2)) === 'DSE 4520' && await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 0));
    await digita(p, 'XXXX'); ok('NS invalido: mostra erro e nao quebra', await p.evaluate(() => /não reconhecido/.test(document.getElementById('dNsBox').textContent)));
    await digita(p, 'DQMFØ0001'); ok('letra de motor desconhecida: aviso na caixa', await p.evaluate(() => /desconhecida/.test(document.getElementById('dNsBox').textContent)));
    // 1.10.203: ao confirmar, NS normalizado e origem/ns no que vai ao registro (so roda se a versao tiver ensCamposPreench com origem)
    if (await p.evaluate(() => typeof window.__DADOS_ORIGEM !== 'undefined' || /1\.10\.2(0[3-9]|[1-9]\d)/.test(document.querySelector('meta[name=app-version]').content))) {
      await digita(p, '*DTMFØ4447*'); await setEq(p, 'Alternador', 1, 'WEG');
      await p.click('#dOk'); await p.waitForTimeout(600);
      const c = await p.evaluate(() => ensCamposPreench());
      ok('confirmar normaliza o NS (DTMF04447)', c.serie === 'DTMF04447', c.serie);
      ok('envio leva origemDados=ns e metadados', c.origemDados === 'ns' && c.ns && c.ns.valido === true && c.ns.tipo === 'gerador' && c.ns.sequencial === 4447 && c.ns.alterados.includes('Alternador fabricante'), JSON.stringify(c.ns));
      await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200);
      await p.fill('#dServ', 'SN-1'); await p.click('#dOk'); await p.waitForTimeout(600);
      const m = await p.evaluate(() => ensCamposPreench());
      ok('modo Manual confirmado: origemDados=manual, ns=null, NS so normalizado', m.origemDados === 'manual' && m.ns === null && m.serie === 'SN-1', JSON.stringify([m.origemDados, m.serie]));
      await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200); await p.evaluate(() => document.querySelector('input[name=dModo][value=ns]').click());
    }
    if (await p.evaluate(() => /1\.10\.2(0[5-9]|[1-9]\d)/.test(document.querySelector('meta[name=app-version]').content))) {
      // 1.10.205: decodificador estrito (so as normas) + origem dos campos + conflito com o catalogo
      await digita(p, 'DTMFØ4447'); await p.waitForTimeout(50);
      ok('origem: campos do NS com barra azul (Motor, Alternador, Controlador)', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-o-ns').length >= 6), String(await p.evaluate(() => document.querySelectorAll('#dEquip .dns-o-ns').length)));
      ok('legenda de origem aparece', await p.evaluate(() => /Origem dos campos: .*NS \(\d+\).*catálogo \(0\)/.test(document.getElementById('dNsBox').textContent)));
      // simula o que a busca de modelo faz (preenche freq/tensao/potencia e o controlador Deep Sea) e termina chamando fichaModelo
      await p.evaluate(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
        set('dFreq', '60'); set('dTens', '220'); set('dPot', '208'); const i = DADOS.equip.findIndex(r => r[0] === 'Controlador');
        document.querySelector('#dEquip input[data-r="' + i + '"][data-c="1"]').value = 'Deep Sea'; document.querySelector('#dEquip input[data-r="' + i + '"][data-c="2"]').value = '4520';
        window.fichaModelo({ kVA: 260, V: 220, Hz: 60, kW: 208, arquivo: 'teste.dse' }); });
      ok('catalogo marca Frequencia, Tensao e Potencia com barra verde', await p.evaluate(() => ['dFreq', 'dTens', 'dPot'].every(id => document.getElementById(id).classList.contains('dns-o-cat'))));
      ok('catalogo vence no Controlador (barra verde) e Motor segue do NS (azul)', await p.evaluate(() => { const i = DADOS.equip.findIndex(r => r[0] === 'Controlador'), m = DADOS.equip.findIndex(r => r[0] === 'Motor'); return document.querySelector('#dEquip input[data-r="' + i + '"][data-c="1"]').classList.contains('dns-o-cat') && document.querySelector('#dEquip input[data-r="' + m + '"][data-c="1"]').classList.contains('dns-o-ns'); }));
      ok('conflito: NS diz Deif AGC150 e o catalogo e Deep Sea -> aviso', await p.evaluate(() => /indica o controlador "Deif AGC150".*Deep Sea/.test(document.getElementById('dNsBox').textContent)));
      await p.fill('#dTens', '380'); ok('digitar a mao tira a marca do campo (Tensao)', await p.evaluate(() => !document.getElementById('dTens').classList.contains('dns-o-cat')));
      await digita(p, 'GDWAØ4447'); await p.waitForTimeout(50);
      ok('NS novo: o NS vence no Controlador, mas Frequencia e Potencia seguem como catalogo', await p.evaluate(() => { const i = DADOS.equip.findIndex(r => r[0] === 'Controlador'); return document.querySelector('#dEquip input[data-r="' + i + '"][data-c="1"]').classList.contains('dns-o-ns') && document.getElementById('dFreq').classList.contains('dns-o-cat'); }));
      const antesMotor = await eq(p, 'Motor', 1); await digita(p, 'SDFWA01715');
      ok('estrito: SDFWA01715 (10 caracteres) e recusado e NAO preenche nada', await p.evaluate(() => /não reconhecido/.test(document.getElementById('dNsBox').textContent) && /Nenhum campo foi preenchido/.test(document.getElementById('dNsBox').textContent)) && (await eq(p, 'Motor', 1)) === antesMotor);
    }
    await digita(p, '*SNNØ4447*'); ok('torre solar sem motor/alternador (com * do codigo de barras)', (await eq(p, 'Motor', 1)) === '-' && (await eq(p, 'Alternador', 1)) === '-');
    ok('dialogo cabe na tela (titulo e botao OK visiveis)', await p.evaluate(() => { const r = document.querySelector('#dlgDados .jt').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && document.getElementById('dOk').getBoundingClientRect().bottom <= innerHeight + 1; }));
    await p.evaluate(() => document.getElementById('dlgDados').close());
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200);
    ok('reabrir em Manual: nenhuma barra de origem', await p.evaluate(() => document.querySelectorAll('.dns-o-ns,.dns-o-cat').length === 0));
    ok('fechar e reabrir volta para Manual', await p.evaluate(() => document.querySelector('input[name=dModo]:checked').value === 'manual' && document.getElementById('dNsBox').hidden));
    ok('sem erro de JavaScript na pagina', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
