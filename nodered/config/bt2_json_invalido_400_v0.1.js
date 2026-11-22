'use strict';
/* =====================================================================================================================
   bt2_json_invalido_400_v0.1.js — middleware do Node-RED (httpNodeMiddleware) · 19/11/2026 · fecha o ACHADO F2-1.
   PARA QUE SERVE (leigo): quando alguem manda um comando com o corpo quebrado (JSON invalido), o Node-RED responde "500 Internal Server Error", como se o servidor tivesse falhado.
   Isso e erro de quem chamou, nao do servidor. Este pequeno filtro troca so esse caso por "400" com uma mensagem clara. Nada mais muda: corpo valido, GET e outros erros seguem como antes.
   PARA QUE SERVE (tecnico): o 500 vem do no "http in" do proprio Node-RED (res.sendStatus(500) no tratador de erro do body-parser), antes de o fluxo rodar; fluxo nao consegue corrigir.
   Este middleware roda o body-parser.json ANTES do no; se der certo, req._body = true e o no nao le de novo. Se o body-parser nao for encontrado, NAO faz nada (fail-open: comportamento antigo).
   COMO USAR (NAO FOI IMPLANTADO NO PC BT2): copiar este arquivo para a pasta do settings.js e, no settings.js, dentro de module.exports:
        httpNodeMiddleware: require('./bt2_json_invalido_400_v0.1.js'),
      reiniciar o Node-RED. Teste: POST com corpo "{abc" em /api/chaves/56/habilitar deve dar 400 {"ok":false,"erro":"corpo JSON invalido"}; corpo valido continua como antes.
      Retorno: tirar a linha do settings.js e reiniciar.
   ===================================================================================================================== */
const path = require('path');

function criar(bodyParser, limite) {
  const json = bodyParser && typeof bodyParser.json === 'function' ? bodyParser.json({ limit: limite || '5mb' }) : null;
  return function bt2JsonInvalido400(req, res, next) {
    const tipo = String(req.headers['content-type'] || '');
    if (!json || req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS' || !/^application\/json/i.test(tipo)) return next();
    json(req, res, err => {
      if (err && (err.type === 'entity.parse.failed' || err.status === 400)) { res.status(400).json({ ok: false, erro: 'corpo JSON invalido' }); return; }
      next(err);                                    // qualquer outro caso (ex.: corpo grande demais) segue como o Node-RED faria
    });
  };
}

function acharBodyParser() {                         // usa o body-parser que veio com o Node-RED instalado (fica ao lado do red.js)
  const bases = [require.main && require.main.filename, process.cwd(), path.join(__dirname, 'x')].filter(Boolean);
  for (const b of bases) { try { return require(require.resolve('body-parser', { paths: [path.dirname(b), b] })); } catch (e) { /* tenta o proximo */ } }
  return null;
}

module.exports = criar(acharBodyParser());
module.exports.criar = criar;
