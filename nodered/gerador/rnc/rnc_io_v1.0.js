/* =====================================================================================================================
   rnc_io_v1.0.js — GRAVAÇÃO do RNC em arquivo (rnc.jsonl), fotos e backup  ·  13/11/2026
   PARA QUE SERVE (leigo): guarda cada evento do RNC numa linha do arquivo rnc.jsonl, no disco do PC do Node-RED, e só avisa "salvo"
   depois que a linha realmente foi para o disco. Também guarda as fotos em pasta e faz a cópia diária (backup).
   POR QUE ASSIM (técnico): Node-RED é o ÚNICO escritor. Tudo (ler cache -> validar -> gravar -> atualizar cache) roda SÍNCRONO dentro de
   uma chamada, então dois pedidos simultâneos nunca se misturam (JavaScript é de uma thread só). Gravação = open(append) + write + fsync.
   NÃO FAZ: não toca PLC/chave/DSE; não usa banco SQL; não apaga linhas (o histórico só cresce).
   Pasta: variável RNC_DIR (PM2); sem ela usa ./rnc-dados relativo à pasta onde o Node-RED foi iniciado.
   ===================================================================================================================== */
'use strict';

/** deps = { fs, path, core, dir, cfg } — o fluxo entrega fs/path; os testes entregam os mesmos. */
module.exports = function criarArmazem(deps) {
  const { fs, path, core } = deps;
  const dir = path.resolve(deps.dir || 'rnc-dados');
  const arq = path.join(dir, 'rnc.jsonl');
  const dirFotos = path.join(dir, 'fotos');
  const dirBackup = path.join(dir, 'backup');
  const MAX_FOTO = 3 * 1024 * 1024; // 3 MB por foto (o HTML já reduz antes de enviar)
  const TIPOS_FOTO = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

  let cache = null;      // eventos em memória
  let tamanhoLido = -1;  // tamanho do arquivo quando foi lido (detecta troca externa, ex.: restauração de backup)
  let corrompidas = 0;

  function garantePastas() { for (const d of [dir, dirFotos, dirBackup]) fs.mkdirSync(d, { recursive: true }); }

  /** Lê o arquivo inteiro (só quando mudou por fora). Linha quebrada é contada e ignorada: nunca derruba o serviço. */
  function carregar() {
    garantePastas();
    const tam = fs.existsSync(arq) ? fs.statSync(arq).size : 0;
    if (cache && tam === tamanhoLido) return cache;
    cache = []; corrompidas = 0;
    if (tam > 0) {
      for (const linha of fs.readFileSync(arq, 'utf8').split('\n')) {
        if (!linha.trim()) continue;
        try { cache.push(JSON.parse(linha)); } catch (e) { corrompidas++; }
      }
    }
    tamanhoLido = tam;
    return cache;
  }

  /** Grava UMA linha com fsync. Só depois disso o evento entra no cache. Lança erro se o disco falhar (HTML recebe 500, não "salvo"). */
  function gravar(evento) {
    const fd = fs.openSync(arq, 'a');
    try {
      fs.writeSync(fd, JSON.stringify(evento) + '\n');
      fs.fsyncSync(fd);
    } finally { fs.closeSync(fd); }
    tamanhoLido = fs.statSync(arq).size;
    cache.push(evento);
  }

  /** Pedido de abrir/evento: decide (core) e grava. */
  function executar(req, agora) {
    const eventos = carregar();
    const r = core.processar(eventos, req, agora || new Date(), deps.cfg);
    if (r.evento) gravar(r.evento);
    return r;
  }

  /** Pedido de foto: valida, grava o arquivo em fotos/<rnc_id>/<n>.<ext>, depois grava o evento. */
  function executarFoto(rnc_id, actor, contentType, buffer, agora) {
    const eventos = carregar();
    const ext = TIPOS_FOTO[String(contentType || '').split(';')[0].trim().toLowerCase()];
    if (!ext) return { status: 415, body: { ok: false, erro: 'foto deve ser JPEG, PNG ou WebP' }, evento: null };
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return { status: 400, body: { ok: false, erro: 'foto vazia' }, evento: null };
    if (buffer.length > MAX_FOTO) return { status: 413, body: { ok: false, erro: 'foto maior que 3 MB' }, evento: null };
    const rncs = core.reconstruir(eventos);
    const r = rncs[rnc_id];
    if (!r) return { status: 404, body: { ok: false, erro: 'RNC não encontrada' }, evento: null };
    const pasta = path.join(dirFotos, rnc_id); // rnc_id vem do arquivo (RNC-AAAA-NNNN), nunca do cliente cru: já conferido acima
    fs.mkdirSync(pasta, { recursive: true });
    const nome = (r.fotos.length + 1) + '.' + ext;
    const fd = fs.openSync(path.join(pasta, nome), 'w');
    try { fs.writeSync(fd, buffer); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    const res = core.processar(eventos, { acao: 'foto', rnc_id, actor, foto_ref: rnc_id + '/' + nome, bytes: buffer.length }, agora || new Date(), deps.cfg);
    if (res.evento) gravar(res.evento);
    return res;
  }

  /** Lê uma foto para exibir no Reparo. Só aceita referência que existe no histórico (evita ler caminho arbitrário). */
  function lerFoto(rnc_id, nome) {
    const eventos = carregar();
    const ref = rnc_id + '/' + nome;
    if (!eventos.some((e) => e.event === 'FOTO_ANEXADA' && e.data.foto_ref === ref)) return null;
    const ext = nome.split('.').pop();
    const tipo = Object.keys(TIPOS_FOTO).find((k) => TIPOS_FOTO[k] === ext);
    return { tipo, buffer: fs.readFileSync(path.join(dirFotos, rnc_id, nome)) };
  }

  function listar() { return core.reconstruir(carregar()); }

  /** Backup diário: copia rnc.jsonl para backup/rnc-AAAA-MM-DD.jsonl (sobrescreve o do mesmo dia) e mantém os 30 mais novos. */
  function backup(agora) {
    carregar();
    if (!fs.existsSync(arq)) return { ok: true, copiado: false };
    const d = (agora || new Date()).toISOString().slice(0, 10);
    const dest = path.join(dirBackup, 'rnc-' + d + '.jsonl');
    fs.copyFileSync(arq, dest);
    const todos = fs.readdirSync(dirBackup).filter((f) => /^rnc-\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort();
    for (const f of todos.slice(0, Math.max(0, todos.length - 30))) fs.unlinkSync(path.join(dirBackup, f));
    return { ok: true, copiado: true, arquivo: path.basename(dest) };
  }

  function saude() {
    const ev = carregar();
    return { ok: true, arquivo: arq, eventos: ev.length, linhasIgnoradas: corrompidas, ultimoEvento: ev.length ? ev[ev.length - 1].timestamp : null, serialRegex: (deps.cfg && deps.cfg.serialRegex) || core.CFG_PADRAO.serialRegex };
  }

  return { executar, executarFoto, lerFoto, listar, backup, saude, carregar, dir };
};
