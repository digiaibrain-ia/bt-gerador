// Dados do ensaio: opcao "Por no de serie (MES)" (medidor 1.10.206). Abre o arquivo direto (file://), sem servidor. Exemplos de NS: SO os das normas (ETD 091 5.1-5.3, ETD 094 5.1-5.3).
// Uso: node tests/e2e/dados_ensaio_ns.js     (MEDIDOR=nome.html para testar outra versao)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.206.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const eq = (p, nome, c) => p.evaluate(([nome, c]) => { const i = DADOS.equip.findIndex(r => r[0] === nome); return document.querySelector('#dEquip input[data-r="' + i + '"][data-c="' + c + '"]').value; }, [nome, c]);
const cls = (p, nome, c, k) => p.evaluate(([nome, c, k]) => { const i = DADOS.equip.findIndex(r => r[0] === nome); return document.querySelector('#dEquip input[data-r="' + i + '"][data-c="' + c + '"]').classList.contains(k); }, [nome, c, k]);
const setEq = (p, nome, c, v) => p.evaluate(([nome, c, v]) => { const i = DADOS.equip.findIndex(r => r[0] === nome); const e = document.querySelector('#dEquip input[data-r="' + i + '"][data-c="' + c + '"]'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [nome, c, v]);
const digita = async (p, v) => { await p.fill('#dServ', v); await p.dispatchEvent('#dServ', 'input'); await p.waitForTimeout(40); };
const caixa = p => p.evaluate(() => document.getElementById('dNsBox').textContent);
const popAberto = p => p.evaluate(() => document.querySelector('.dns-pop').classList.contains('dns-aberto') && getComputedStyle(document.querySelector('.dns-pop')).display !== 'none');
const abrePop = async p => { if (!(await popAberto(p))) await p.click('#dNsBox .dns-i'); await p.waitForTimeout(80); };
const textoPop = p => p.evaluate(() => document.querySelector('.dns-pop').textContent);
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
    // ETD 091 5.3: DTMFØ4447 = diesel, Yanmar, Mecc Alte, AGC150, nº 4447
    ok('ETD 091 5.3 DTMFØ4447 preenche Motor Yanmar', (await eq(p, 'Motor', 1)) === 'Yanmar', await eq(p, 'Motor', 2));
    ok('... Alternador Mecc Alte', (await eq(p, 'Alternador', 1)) === 'Mecc Alte');
    ok('... Controlador DEIF AGC150', (await eq(p, 'Controlador', 1)) === 'DEIF' && (await eq(p, 'Controlador', 2)) === 'AGC150');
    ok('sem marca de alterado ainda', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 0));
    // REGRA DE TEXTO: so uma linha curta na tela
    const cx = await caixa(p);
    ok('REGRA: caixa do NS tem texto curto (<= 120 caracteres) e UMA linha de conteudo', cx.length <= 120 && await p.evaluate(() => document.querySelectorAll('#dNsBox > div').length === 1), cx.length + ' car.: ' + cx);
    ok('REGRA: caixa nao estoura a largura (sem corte)', await p.evaluate(() => { const e = document.getElementById('dNsBox'); return e.scrollWidth <= e.clientWidth + 1; }));
    ok('REGRA: botao ⓘ existe e o painel comeca fechado', await p.evaluate(() => !!document.querySelector('#dNsBox .dns-i')) && !(await popAberto(p)));
    await abrePop(p); const tp = await textoPop(p);
    ok('painel abre e mostra o detalhe (combustivel, motor, alternador, controlador)', (await popAberto(p)) && /Combustível: Diesel/.test(tp) && /Motor: Yanmar/.test(tp) && /Alternador: Mecc Alte/.test(tp) && /Controlador: Deif AGC150/.test(tp));
    ok('painel traz os exemplos da norma (ETD 091 e ETD 094)', /ETD 091 · 5\.1/.test(tp) && /GDWAØ4447/.test(tp) && /ETD 094 · 5\.3/.test(tp) && /BNNØ4447/.test(tp));
    ok('painel cabe na tela (nao sai da janela)', await p.evaluate(() => { const r = document.querySelector('.dns-pop').getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; }));
    await p.keyboard.press('Escape'); await p.waitForTimeout(80);
    ok('Esc fecha so o painel (o dialogo continua aberto)', !(await popAberto(p)) && await p.evaluate(() => document.getElementById('dlgDados').open));
    await abrePop(p); await p.mouse.click(5, 5); await p.waitForTimeout(80);
    ok('clique fora fecha o painel', !(await popAberto(p)));
    await abrePop(p); await p.click('.dns-pop .dns-x'); await p.waitForTimeout(60);
    ok('✕ fecha o painel', !(await popAberto(p)));
    await abrePop(p); await p.click('.dns-pop .dns-ex:nth-of-type(1) button'); await p.waitForTimeout(80);
    ok('exemplo "usar" (ETD 091 5.1 GDWAØ4447) preenche o NS e o Controlador DSE 4520', (await p.inputValue('#dServ')) === 'GDWAØ4447' && (await eq(p, 'Controlador', 2)) === 'DSE 4520', await eq(p, 'Alternador', 1));
    await p.click('.dns-pop .dns-x'); await digita(p, 'DTMFØ4447'); await p.waitForTimeout(40);
    await setEq(p, 'Alternador', 1, 'WEG');
    ok('editar marca o campo (contorno azul) e conta em "✎ 1 alterado"', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 1 && /✎ 1 alterado/.test(document.getElementById('dNsBox').textContent)));
    await abrePop(p); ok('o detalhe dos alterados esta no painel', /Alterados em relação ao NS \(1\)/.test(await textoPop(p)) && /Alternador fabricante/.test(await textoPop(p))); await p.click('.dns-pop .dns-x');
    await digita(p, 'DTMFØ4447'); ok('mesmo NS nao sobrescreve a edicao', (await eq(p, 'Alternador', 1)) === 'WEG');
    // ETD 091 5.2: DRCBØ4447 = diesel, 229-3 3,1 L, Cramaco, DSE 7320
    await digita(p, 'DRCBØ4447'); ok('ETD 091 5.2 DRCBØ4447: NS novo preenche de novo (Alternador Cramaco) e zera marcas', (await eq(p, 'Alternador', 1)) === 'Cramaco' && await p.evaluate(() => document.querySelectorAll('#dEquip .dns-alt').length === 0));
    // ETD 091 5.1: GDWAØ4447 = gas, 12 (2V) 4 cil, WEG, DSE 4520
    await digita(p, 'GDWAØ4447'); ok('ETD 091 5.1 GDWAØ4447: Alternador WEG e Controlador DSE 4520', (await eq(p, 'Alternador', 1)) === 'WEG' && (await eq(p, 'Controlador', 2)) === 'DSE 4520');
    // origem e catalogo
    ok('origem: campos do NS com barra azul (Motor, Alternador, Controlador)', await p.evaluate(() => document.querySelectorAll('#dEquip .dns-o-ns').length >= 6));
    await digita(p, 'DTMFØ4447');
    await p.evaluate(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
      set('dFreq', '60'); set('dTens', '220'); set('dPot', '208'); const i = DADOS.equip.findIndex(r => r[0] === 'Controlador');
      document.querySelector('#dEquip input[data-r="' + i + '"][data-c="1"]').value = 'Deep Sea'; document.querySelector('#dEquip input[data-r="' + i + '"][data-c="2"]').value = '4520';
      window.fichaModelo({ kVA: 260, V: 220, Hz: 60, kW: 208, arquivo: 'teste.dse' }); });
    ok('catalogo marca Frequencia, Tensao e Potencia com barra verde', await p.evaluate(() => ['dFreq', 'dTens', 'dPot'].every(id => document.getElementById(id).classList.contains('dns-o-cat'))));
    ok('catalogo vence no Controlador (verde) e Motor segue do NS (azul)', (await cls(p, 'Controlador', 1, 'dns-o-cat')) && (await cls(p, 'Motor', 1, 'dns-o-ns')));
    ok('conflito: so um chip curto na tela ("⚠ conflito")', await p.evaluate(() => /⚠ conflito/.test(document.getElementById('dNsBox').textContent)) && (await caixa(p)).length <= 140, String((await caixa(p)).length));
    await abrePop(p); ok('texto do conflito (NS Deif AGC150 x catalogo Deep Sea) esta no painel', /indica o controlador "Deif AGC150".*Deep Sea/.test(await textoPop(p))); await p.click('.dns-pop .dns-x');
    await p.fill('#dTens', '380'); ok('digitar a mao tira a marca do campo (Tensao)', await p.evaluate(() => !document.getElementById('dTens').classList.contains('dns-o-cat')));
    await digita(p, 'GDWAØ4447');
    ok('NS novo: o NS vence no Controlador, Frequencia segue como catalogo', (await cls(p, 'Controlador', 1, 'dns-o-ns')) && await p.evaluate(() => document.getElementById('dFreq').classList.contains('dns-o-cat')));
    // estrito: so as normas
    const antesMotor = await eq(p, 'Motor', 1); await digita(p, 'XDTMFØ4447');
    ok('estrito: 10 caracteres fora da norma e recusado, texto curto na tela, NAO preenche nada', /não reconhecido/.test(await caixa(p)) && (await caixa(p)).length <= 120 && (await eq(p, 'Motor', 1)) === antesMotor, await caixa(p));
    await abrePop(p); ok('detalhe do erro esta no painel (tamanho invalido + nada preenchido)', /Tamanho inválido: 10 caracteres/.test(await textoPop(p)) && /Nenhum campo foi preenchido/.test(await textoPop(p))); await p.click('.dns-pop .dns-x');
    await digita(p, 'DQMFØ0001'); ok('letra de motor desconhecida: chip de aviso e Motor intacto', await p.evaluate(() => /⚠ 1 aviso/.test(document.getElementById('dNsBox').textContent)) && (await eq(p, 'Motor', 1)) === antesMotor);
    // ETD 094 5.2: SNNØ4447 = torre solar sem motor e sem alternador
    await digita(p, '*SNNØ4447*'); ok('ETD 094 5.2 *SNNØ4447* (com * do codigo de barras): torre solar sem motor/alternador', (await eq(p, 'Motor', 1)) === '-' && (await eq(p, 'Alternador', 1)) === '-');
    // confirmar: normaliza e manda origem
    await digita(p, '*DTMFØ4447*'); await setEq(p, 'Alternador', 1, 'WEG');
    await p.click('#dOk'); await p.waitForTimeout(600);
    const c = await p.evaluate(() => ensCamposPreench());
    ok('confirmar normaliza o NS (DTMF04447)', c.serie === 'DTMF04447', c.serie);
    ok('envio leva origemDados=ns e metadados', c.origemDados === 'ns' && c.ns && c.ns.valido === true && c.ns.tipo === 'gerador' && c.ns.sequencial === 4447 && c.ns.alterados.includes('Alternador fabricante'), JSON.stringify(c.ns));
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200);
    await p.fill('#dServ', 'SN-1'); await p.click('#dOk'); await p.waitForTimeout(600);
    const m = await p.evaluate(() => ensCamposPreench());
    ok('modo Manual confirmado: origemDados=manual, ns=null, NS so normalizado', m.origemDados === 'manual' && m.ns === null && m.serie === 'SN-1', JSON.stringify([m.origemDados, m.serie]));
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200); await p.evaluate(() => document.querySelector('input[name=dModo][value=ns]').click()); await digita(p, 'DTMFØ4447');
    ok('dialogo cabe na tela (titulo e botao OK visiveis)', await p.evaluate(() => { const r = document.querySelector('#dlgDados .jt').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && document.getElementById('dOk').getBoundingClientRect().bottom <= innerHeight + 1; }));
    await abrePop(p); await p.evaluate(() => document.getElementById('dlgDados').close()); await p.waitForTimeout(80);
    ok('fechar o dialogo com o painel aberto fecha tudo', !(await popAberto(p)));
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(200);
    ok('reabrir em Manual: nenhuma barra de origem e caixa escondida', await p.evaluate(() => document.querySelectorAll('.dns-o-ns,.dns-o-cat').length === 0 && document.getElementById('dNsBox').hidden));
    ok('fechar e reabrir volta para Manual', await p.evaluate(() => document.querySelector('input[name=dModo]:checked').value === 'manual'));
    ok('sem erro de JavaScript na pagina', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
