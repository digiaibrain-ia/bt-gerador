// Gera as imagens da pasta referencias/ a partir do PROPRIO medidor (elementos reais, estados forçados por classe). Uso:
//   (servir a pasta do medidor na porta 8790) NODE_PATH=$(npm root -g) node tests/e2e/gera_referencias.js
// Só registra o que está no CÓDIGO; o significado de figuras que não existem no código fica para o operador descrever (ver referencias/LEIA-ME.md).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'referencias', 'img'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 3 }); const p = await ctx.newPage();
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' }));
  await p.goto('http://localhost:8790/' + (process.env.MEDIDOR || 'medidor_gerador_v1.10.166.html')); await p.waitForTimeout(2000);
  // Demo local: as chaves mostram estados reais (sem PLC elas ficam em 'sem leitura' com ? e borda vermelha, que nao serve de referencia)
  await p.fill('#demoSenha', 'mwm'); await p.click('#bDemo'); await p.check('#dmTradicional'); await p.waitForTimeout(500); await p.evaluate(() => document.getElementById('dlgDemo').close()); await p.waitForTimeout(1500);
  const foto = async (nome, sel, pad = 6) => { const el = await p.$(sel); const bb = await el.boundingBox(); await p.screenshot({ path: path.join(OUT, nome + '.png'), clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad } }); console.log('ok', nome, Math.round(bb.width) + 'x' + Math.round(bb.height)); };
  // botões independentes Alertas e Falhas (cabeçalho, 1.10.166): sem ocorrência / com ocorrência
  const botao = async (id, cls, txt, nome) => { await p.evaluate(([i, c, t]) => { const b = document.getElementById(i); b.classList.toggle('tem', c); b.querySelector('span').textContent = t; }, [id, cls, txt]); await foto(nome, '#' + id); };
  await botao('bAlertas', false, 'Alertas 0', 'botao_alertas_vazio');
  await botao('bAlertas', true, 'Alertas 2', 'botao_alertas_com_alerta');
  await botao('bFalhas', false, 'Falhas 0', 'botao_falhas_vazio');
  await botao('bFalhas', true, 'Falhas 2', 'botao_falhas_com_falha');
  // triângulo amarelo com contador no cabeçalho de um card
  const tri = await p.evaluate(() => { const t = document.querySelector('.ocb'); if (!t) return false; t.hidden = false; t.querySelector('.ocn').textContent = '3'; return true; });
  if (tri) await foto('triangulo_card_com_contador', '.ocb:not([hidden])');
  // chip do Patamar
  if (await p.$('#bGuiadoRun')) await foto('chip_patamar_off', '#bGuiadoRun');
  await b.close();
})();
