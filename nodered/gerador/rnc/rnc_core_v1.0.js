/* =====================================================================================================================
   rnc_core_v1.0.js — REGRAS do RNC (Registro de Não Conformidade) e retrabalho do gerador  ·  13/11/2026
   PARA QUE SERVE (leigo): é o "cérebro" das regras. Recebe o histórico já gravado + um pedido (abrir RNC, iniciar reparo...)
   e responde: pode ou não pode, e qual linha nova deve ser gravada. NÃO grava arquivo, NÃO usa rede, NÃO toca PLC/chave/DSE.
   POR QUE SEPARADO: o mesmo código roda (1) dentro do Node-RED, colado pelo gerador do fluxo, e (2) nos testes (tests/rnc_core.test.js).
   COMO SE LÊ: o histórico é uma lista de EVENTOS imutáveis (uma linha do rnc.jsonl cada). O estado atual é sempre recalculado deles.
   ESTADOS da RNC:  ABERTA (já bloqueia expedição) -> EM_REPARO -> AGUARDANDO_RETESTE -> LIBERADO.  Reteste REPROVADO volta a EM_REPARO.
   REGRAS TRAVADAS AQUI (servidor): rev velha é recusada · não pula estado · reparo exige ação e responsável · só libera com reteste APROVADO ·
   gerador (série) só fica liberado quando TODAS as RNCs dele estiverem LIBERADO.
   Formato do evento (tabela-ready):
     { event_id, rnc_id, serial, event, timestamp, actor, rev, schema_version, banco, idem?, data:{...} }
   Para acrescentar campo no futuro: ponha DENTRO de data, opcional; nunca altere eventos antigos; suba schema_version só se mudar o sentido de algo.
   ===================================================================================================================== */
'use strict';

const SCHEMA_VERSION = 1;

// Configuração padrão (o fluxo pode sobrescrever por variável de ambiente do PM2: RNC_SERIAL_REGEX, RNC_BANCOS)
const CFG_PADRAO = {
  // ASSUMIDO a partir do exemplo M9MGD26060019SDFWA01715 (23 caracteres, letras e números). Largo de propósito: ajustar quando o formato for confirmado.
  serialRegex: '^[A-Z0-9]{15,30}$',
  bancos: ['BT1', 'BT2'],
  tiposNc: ['DEFEITO', 'ERRO_MONTAGEM', 'FALHA_ENSAIO', 'OUTRO'],
  maxTexto: 1000,
  maxNome: 60,
  maxModelo: 60,
};

const ESTADOS = ['ABERTA', 'EM_REPARO', 'AGUARDANDO_RETESTE', 'LIBERADO'];

// Transições permitidas: estado atual -> { evento: estado seguinte } (o RETESTE depende do resultado, tratado em proximoEstado)
const TRANSICOES = {
  ABERTA: { REPARO_INICIADO: 'EM_REPARO' },
  EM_REPARO: { REPARO_REGISTRADO: 'AGUARDANDO_RETESTE' },
  AGUARDANDO_RETESTE: { RETESTE_REGISTRADO: '*' },
  LIBERADO: {},
};

const pad = (n, w) => String(n).padStart(w, '0');
const txt = (v) => (typeof v === 'string' ? v.trim() : '');

/** Normaliza o número de série: sem espaços, maiúsculo. */
function normalizaSerie(s) {
  return txt(s).replace(/\s+/g, '').toUpperCase();
}

function erro(status, msg, extra) {
  return Object.assign({ status, body: Object.assign({ ok: false, erro: msg }, extra || {}), evento: null });
}

/** Reconstrói o estado de cada RNC a partir dos eventos (ordem de gravação). */
function reconstruir(eventos) {
  const rncs = {};
  for (const e of eventos) {
    let r = rncs[e.rnc_id];
    if (e.event === 'RNC_ABERTA') {
      r = rncs[e.rnc_id] = {
        rnc_id: e.rnc_id, serial: e.serial, banco: e.banco, modelo: e.data.modelo, tipo_nc: e.data.tipo_nc,
        descricao: e.data.descricao, ensaio_id: e.data.ensaio_id || null,
        estado: 'ABERTA', rev: e.rev, aberta_por: e.actor, aberta_em: e.timestamp, atualizado_em: e.timestamp,
        fotos: [], reparos: [], retestes: [], historico: [],
      };
    }
    if (!r) continue; // evento órfão (arquivo editado à mão): ignorado, não quebra
    r.historico.push({ event_id: e.event_id, event: e.event, timestamp: e.timestamp, actor: e.actor, rev: e.rev });
    r.atualizado_em = e.timestamp;
    if (e.event === 'REPARO_INICIADO') { r.estado = 'EM_REPARO'; r.rev = e.rev; }
    else if (e.event === 'REPARO_REGISTRADO') {
      r.estado = 'AGUARDANDO_RETESTE'; r.rev = e.rev;
      r.reparos.push({ acao: e.data.acao, peca: e.data.peca || null, por: e.actor, em: e.timestamp });
    } else if (e.event === 'RETESTE_REGISTRADO') {
      r.estado = e.data.resultado === 'APROVADO' ? 'LIBERADO' : 'EM_REPARO'; r.rev = e.rev;
      r.retestes.push({ resultado: e.data.resultado, ensaio_id: e.data.ensaio_id || null, por: e.actor, em: e.timestamp });
    } else if (e.event === 'FOTO_ANEXADA') {
      r.fotos.push({ foto_ref: e.data.foto_ref, bytes: e.data.bytes || null, por: e.actor, em: e.timestamp });
    }
  }
  return rncs;
}

/** Situação do gerador (série): BLOQUEADO se qualquer RNC dele não estiver LIBERADO. */
function situacaoSerie(rncs, serial) {
  const lista = Object.values(rncs).filter((r) => r.serial === serial);
  const abertas = lista.filter((r) => r.estado !== 'LIBERADO');
  return {
    serial,
    situacao: lista.length === 0 ? 'SEM_RNC' : abertas.length ? 'BLOQUEADO' : 'LIBERADO',
    total: lista.length,
    pendentes: abertas.map((r) => ({ rnc_id: r.rnc_id, estado: r.estado })),
    rncs: lista,
  };
}

function validaComum(req, cfg) {
  const actor = txt(req.actor);
  if (!actor) return 'informe quem está registrando (nome)';
  if (actor.length > cfg.maxNome) return 'nome muito longo';
  return null;
}

/**
 * processar(eventos, req, agora, cfg) — decide um pedido.
 *   req = { acao:'abrir'|'evento'|'foto', ... }  (ver docs/modulos/RNC_RETRABALHO_v0.1.md)
 * Devolve { status, body, evento }. Se evento != null, o chamador DEVE gravá-lo (e só então responder ao HTML).
 */
function processar(eventos, req, agora, cfgIn) {
  const cfg = Object.assign({}, CFG_PADRAO, cfgIn || {});
  const rncs = reconstruir(eventos);
  const ts = agora.toISOString();
  const proxEvt = 'EVT-' + pad(eventos.length + 1, 6);

  // Idempotência: mesmo pedido reenviado (queda de rede) não duplica.
  const idem = txt(req.idempotency_key);
  if (idem) {
    const ja = eventos.find((e) => e.idem === idem);
    if (ja) return { status: 200, body: { ok: true, repetido: true, rnc: rncs[ja.rnc_id] }, evento: null };
  }

  const e0 = validaComum(req, cfg);
  if (e0) return erro(400, e0);
  const actor = txt(req.actor);

  if (req.acao === 'abrir') {
    const serial = normalizaSerie(req.serial);
    if (!new RegExp(cfg.serialRegex).test(serial)) return erro(400, 'número de série fora do formato', { serialRegex: cfg.serialRegex });
    const banco = txt(req.banco).toUpperCase();
    if (!cfg.bancos.includes(banco)) return erro(400, 'banco inválido (use ' + cfg.bancos.join(' ou ') + ')');
    const modelo = txt(req.modelo);
    if (!modelo || modelo.length > cfg.maxModelo) return erro(400, 'informe o modelo');
    const tipo = txt(req.tipo_nc).toUpperCase();
    if (!cfg.tiposNc.includes(tipo)) return erro(400, 'tipo de não conformidade inválido');
    const descricao = txt(req.descricao);
    if (descricao.length < 5 || descricao.length > cfg.maxTexto) return erro(400, 'descreva o defeito (5 a ' + cfg.maxTexto + ' caracteres)');
    const ano = agora.getUTCFullYear();
    const n = Object.keys(rncs).filter((id) => id.startsWith('RNC-' + ano + '-')).length + 1;
    const rnc_id = 'RNC-' + ano + '-' + pad(n, 4);
    const evento = {
      event_id: proxEvt, rnc_id, serial, event: 'RNC_ABERTA', timestamp: ts, actor, rev: 1, schema_version: SCHEMA_VERSION, banco,
      data: { modelo, tipo_nc: tipo, descricao, ensaio_id: txt(req.ensaio_id) || null },
    };
    if (idem) evento.idem = idem;
    const novo = reconstruir(eventos.concat([evento]))[rnc_id];
    return { status: 201, body: { ok: true, rnc: novo, situacao: situacaoSerie(reconstruir(eventos.concat([evento])), serial).situacao }, evento };
  }

  // Daqui em diante o pedido é sobre uma RNC existente
  const r = rncs[txt(req.rnc_id)];
  if (!r) return erro(404, 'RNC não encontrada');

  if (req.acao === 'foto') {
    const evento = {
      event_id: proxEvt, rnc_id: r.rnc_id, serial: r.serial, event: 'FOTO_ANEXADA', timestamp: ts, actor, rev: r.rev, schema_version: SCHEMA_VERSION, banco: r.banco,
      data: { foto_ref: req.foto_ref, bytes: req.bytes || null },
    };
    const novo = reconstruir(eventos.concat([evento]))[r.rnc_id];
    return { status: 201, body: { ok: true, rnc: novo }, evento };
  }

  if (req.acao !== 'evento') return erro(400, 'ação desconhecida');

  // Controle de edição simultânea: quem salva com versão velha recebe aviso e a tela atualiza.
  if (!Number.isInteger(req.rev_esperado)) return erro(400, 'informe rev_esperado');
  if (req.rev_esperado !== r.rev) return erro(409, 'esta RNC foi alterada por outra pessoa; atualize a tela', { rev_atual: r.rev, rnc: r });

  const nome = txt(req.event).toUpperCase();
  const permitidas = TRANSICOES[r.estado] || {};
  if (!(nome in permitidas)) {
    return erro(422, 'transição não permitida: ' + nome + ' em ' + r.estado, { estado: r.estado, permitidos: Object.keys(permitidas) });
  }

  const d = req.data || {};
  const data = {};
  if (nome === 'REPARO_REGISTRADO') {
    const acao = txt(d.acao);
    if (acao.length < 3 || acao.length > cfg.maxTexto) return erro(400, 'descreva a ação executada no reparo');
    data.acao = acao;
    const peca = txt(d.peca);
    if (peca) data.peca = peca.slice(0, cfg.maxTexto); // peça é opcional: nem todo reparo troca peça
  } else if (nome === 'RETESTE_REGISTRADO') {
    const res = txt(d.resultado).toUpperCase();
    if (res !== 'APROVADO' && res !== 'REPROVADO') return erro(400, 'resultado do reteste deve ser APROVADO ou REPROVADO');
    data.resultado = res;
    if (txt(d.ensaio_id)) data.ensaio_id = txt(d.ensaio_id);
  }

  const evento = {
    event_id: proxEvt, rnc_id: r.rnc_id, serial: r.serial, event: nome, timestamp: ts, actor, rev: r.rev + 1, schema_version: SCHEMA_VERSION, banco: r.banco, data,
  };
  if (idem) evento.idem = idem;
  const todos = reconstruir(eventos.concat([evento]));
  return { status: 200, body: { ok: true, rnc: todos[r.rnc_id], situacao: situacaoSerie(todos, r.serial).situacao }, evento };
}

module.exports = { SCHEMA_VERSION, CFG_PADRAO, ESTADOS, TRANSICOES, normalizaSerie, reconstruir, situacaoSerie, processar };
