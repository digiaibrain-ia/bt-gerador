#!/usr/bin/env node
/* =====================================================================================================================
   comentar_catch_vazio_v0.1.js — Passo 5 (B3): marca cada `catch` VAZIO do medidor com o motivo de ele poder ser ignorado.
   PARA QUE SERVE (leigo): um erro engolido em silêncio é perigoso numa tela que comanda carga. Revisamos todos os `catch(e){}` vazios de
   dashboard/src/js e, para os que são inofensivos (guardar preferência no navegador, fechar um popover que já está fechado...), escrevemos DENTRO
   do bloco o motivo. Assim nenhum erro "some" sem explicação, e o teste tests/catch_vazio.test.js barra qualquer `catch` vazio novo sem motivo.
   COMO FUNCIONA (técnico): lê cada módulo com o parser `espree` (instale numa pasta temporária: npm i espree), acha CatchClause com corpo vazio, classifica pelo
   que o `try` faz e insere um comentário "ignorado: motivo" logo depois da chave de abertura. Só insere comentário (não muda comportamento). Os `catch` de COMANDO
   (rede+chave/ligar) NÃO são comentados: o script falha e lista, para tratamento manual (ver 31_chaves_e_bancos_painel).
   USO: NODE_PATH=<pasta com espree> node dashboard/gerador/comentar_catch_vazio_v0.1.js [--dry]
   ===================================================================================================================== */
const fs = require('fs'), path = require('path');
const espree = require('espree');
const SRC = path.join(__dirname, '..', 'src', 'js');
const andar = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? andar(path.join(d, e.name)) : [path.join(d, e.name)]));
const COMANDO = /(chFetch|selecionar|['"]ligar['"]|desligar|chZeraPlc|cmdGerador|clickIniciar|\/api\/(chaves|gerador|ensaio|simulador))/;
const REGRAS = [   // [teste no texto do try, motivo]
  [/postMessage/, 'janela ou canal já fechado'],
  [/BroadcastChannel/, 'navegador sem BroadcastChannel'],
  [/localStorage|sessionStorage|defineProperty\(window/, 'armazenamento do navegador indisponível; a preferência não é guardada'],
  [/showPopover|hidePopover|:popover-open/, 'popover já no estado pedido ou sem suporte'],
  [/\.close\(|showModal|showDirectoryPicker|requestPermission/, 'diálogo/seletor já fechado, cancelado ou sem permissão'],
  [/\.focus|scrollIntoView|\.select\(|\.blur|setPointerCapture|addEventListener/, 'elemento ausente ou sem suporte'],
  [/JSON\.(parse|stringify)|decodeURI|new URL|\.json\(\)|normaliza\(/, 'texto inválido: segue com o valor padrão'],
  [/devObs/, 'o log de desenvolvimento é opcional'],
  [/execCommand|clipboard|revokeObjectURL|dispatchEvent|navigator\.share|matchMedia|MutationObserver/, 'API opcional do navegador'],
  [/fetch\(/, 'sondagem opcional: a próxima tentativa refaz'],
];
const dev = f => /09_central_registros|39_dev_observacao|40_robo_operador|dica_ui|08_pacote_ia/.test(f);
const falhou = [], resumo = {}; let total = 0;
for (const f of andar(SRC).filter(x => x.endsWith('.js') && !x.includes('06_paginas_embutidas'))) {
  const src = fs.readFileSync(f, 'utf8'); const ast = espree.parse(src, { ecmaVersion: 'latest', sourceType: 'script', range: true, loc: true });
  const ins = [];
  (function v(n) {
    if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(v); return; }
    if (n.type === 'TryStatement' && n.handler && n.handler.body.body.length === 0) {
      const corpo = n.handler.body, miolo = src.slice(corpo.range[0] + 1, corpo.range[1] - 1);
      if (!/^\s*$/.test(miolo)) { /* ja tem comentario: nada a fazer */ } else {
        const t = src.slice(n.block.range[0], n.block.range[1]);
        if (COMANDO.test(t)) falhou.push(path.relative(SRC, f) + ':' + n.loc.start.line + ' | ' + t.replace(/\s+/g, ' ').slice(0, 90));
        else {
          let motivo = (REGRAS.find(([re]) => re.test(t)) || [])[1];
          if (!motivo) motivo = dev(f) ? 'ferramenta de diagnóstico/teste: a falha não afeta a operação' : 'atualização de tela opcional: o próximo ciclo refaz';
          ins.push([corpo.range[0] + 1, ' /* ignorado: ' + motivo + ' */ ']); resumo[motivo] = (resumo[motivo] || 0) + 1; total++;
        }
      }
    }
    for (const k in n) if (k !== 'loc' && k !== 'range') v(n[k]);
  })(ast.body);
  if (ins.length && !process.argv.includes('--dry')) { let s = src; ins.sort((a, b) => b[0] - a[0]).forEach(([p, t]) => { s = s.slice(0, p) + t + s.slice(p); }); fs.writeFileSync(f, s); }
}
console.log('catch vazios marcados:', total); console.log(resumo);
if (falhou.length) { console.log('\nCATCH DE COMANDO (tratar manualmente):'); falhou.forEach(x => console.log(' ', x)); process.exit(2); }
