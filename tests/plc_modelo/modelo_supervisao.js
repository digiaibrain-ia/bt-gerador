'use strict';
// Modelo de REFERENCIA em JS da logica do Portao A (Fase 4): fb_supervisaoChaves16 v0.1 (PLC do banco) + as partes novas do FB101 v0.8 (1515).
// NAO e o SCL: e a mesma regra escrita de novo para provar a LOGICA com vetores de teste. O SCL real e o tempo do contator so a bancada prova.
// Escaneamento simulado: 10 ms. Base de tempo de 100 ms como no SCL (TON que se reinicia), contagem em ticks, precisao +100 ms.
const N = 16;
const arr = v => Array.from({ length: N + 1 }, () => v);   // indices 1..16 (0 nao usado)

class Supervisao {
  constructor({ numChaves = 13, tempoRetornoMs = 2000 } = {}) {
    this.numChaves = numChaves; this.tempoRetornoMs = tempoRetornoMs;
    this.cmdAnt = arr(false); this.cRet = arr(0); this.cCol = arr(0);
    this.habResp = arr(false); this.falhaRetorno = arr(false); this.contatorColado = arr(false); this.permite = arr(false);
    this.eco = 0; this.acum = 0;
  }
  scan(dtMs, e) { // e = { comOk, seq, cmd[], habPed[], saidaQ[], aux[] }
    this.acum += dtMs; let tick = false;
    if (this.acum >= 100) { this.acum -= 100; tick = true; }
    const lim = Math.max(2, Math.trunc(this.tempoRetornoMs / 100));
    const n = Math.max(0, Math.min(16, this.numChaves));
    this.eco = e.seq;
    for (let i = 1; i <= N; i++) {
      if (i <= n && e.comOk) {
        this.habResp[i] = !!e.habPed[i];
        if (e.cmd[i] && !this.cmdAnt[i] && !e.aux[i]) { this.falhaRetorno[i] = false; this.contatorColado[i] = false; this.cRet[i] = 0; this.cCol[i] = 0; }
        if (tick) {
          this.cRet[i] = (e.saidaQ[i] && !e.aux[i]) ? Math.min(32000, this.cRet[i] + 1) : 0;
          this.cCol[i] = (!e.saidaQ[i] && e.aux[i]) ? Math.min(32000, this.cCol[i] + 1) : 0;
          if (this.cRet[i] >= lim) this.falhaRetorno[i] = true;
          if (this.cCol[i] >= lim) this.contatorColado[i] = true;
        }
        this.permite[i] = this.habResp[i] && !this.falhaRetorno[i] && !this.contatorColado[i];
      } else {
        this.habResp[i] = false; this.permite[i] = false; this.cRet[i] = 0; this.cCol[i] = 0;
        if (i > n) { this.falhaRetorno[i] = false; this.contatorColado[i] = false; }
      }
      this.cmdAnt[i] = !!e.cmd[i];
    }
  }
}

// Planta + 1515 + PLC do banco juntos (transporte PUT/GET ideal: a parte de comunicacao e testada nos fluxos e na bancada).
class Sistema {
  constructor(opc = {}) {
    this.sup = new Supervisao(opc);
    this.bloq = arr(false);
    this.cbLigar = arr(false);          // CB no DB do 1515 (db.cb.ligar)
    this.habilitada = arr(true);        // setup.habilitada (pedido)
    this.ligarBanco = true; this.comOk = true; this.seq = 0;
    this.saidaQ = arr(false); this.aux = arr(false);
    this.auxBloqueado = arr(false);     // defeito simulado: retorno preso em 0
    this.auxColado = arr(false);        // defeito simulado: contator colado (retorno preso em 1)
    this.atraso = opc.atrasoContatorMs ?? 100; this.tSaida = arr(0); this.t = 0;
    this.ecoAtrasado = false; this.cGraca = arr(0); this.ciclosGraca = opc.ciclosGraca ?? 3;           // defeito simulado: o PLC do banco nao devolve o eco novo
    this.habRespNo1515 = arr(false); this.falhaNo1515 = arr(false); this.colNo1515 = arr(false); this.ecoOk = false;
  }
  clique(i, ligar) { this.cbLigar[i] = ligar; }
  passo(ms = 10) {
    for (let k = 0; k < ms; k += 10) {
      this.t += 10;
      this.seq = (this.seq % 32766) + 1;
      // FB101 v0.8 REGION 0: CB cai nas chaves com falha travada no banco
      // (conta ciclos de PUT/GET com comando numa chave em falha; 1 passo do modelo = 1 ciclo; no PLC real 1 ciclo ~ 100-300 ms)
      for (let i = 1; i <= N; i++) {
        if ((this.falhaNo1515[i] || this.colNo1515[i]) && this.cbLigar[i]) this.cGraca[i] = Math.min(32000, this.cGraca[i] + 1); else this.cGraca[i] = 0;
        if (this.cGraca[i] >= this.ciclosGraca) this.cbLigar[i] = false;
      }
      if (!this.ligarBanco) for (let i = 1; i <= N; i++) this.cbLigar[i] = false;
      // PUT (pedido) -> PLC do banco
      const sup = this.sup;
      sup.scan(10, { comOk: this.comOk, seq: this.seq, cmd: this.cbLigar, habPed: this.habilitada, saidaQ: this.saidaQ, aux: this.aux });
      // driver das saidas (FC4 do usuario ou fb_bancoEt200_16): Saida = Cmd E Permite E (banco ligado)
      // fb_bancoEt200_16 v0.3: queda de comunicacao TRAVA a chave (_bloq); so solta quando o comando cai a FALSE (nao religa sozinha na volta da rede)
      for (let i = 1; i <= N; i++) { if (!this.comOk) this.bloq[i] = true; else if (!this.cbLigar[i]) this.bloq[i] = false; }
      for (let i = 1; i <= N; i++) this.saidaQ[i] = !!(this.cbLigar[i] && sup.permite[i] && this.ligarBanco && this.comOk && !this.bloq[i]);
      // planta: contato auxiliar acompanha a saida com atraso, salvo defeito simulado
      for (let i = 1; i <= N; i++) {
        if (this.auxBloqueado[i]) this.aux[i] = false;
        else if (this.auxColado[i]) this.aux[i] = true;
        else { this.tSaida[i] = (this.saidaQ[i] !== this.aux[i]) ? this.tSaida[i] + 10 : 0; if (this.tSaida[i] >= this.atraso) { this.aux[i] = this.saidaQ[i]; this.tSaida[i] = 0; } }
      }
      // GET (resposta) -> 1515 (FB101 v0.8 REGION 4)
      const ecoRef = this.ecoAtrasado ? sup.eco - 5 : sup.eco;
      this.ecoOk = this.comOk && (ecoRef === this.seq || ecoRef === this.seq - 1 || (this.seq === 1 && ecoRef === 32766));
      for (let i = 1; i <= N; i++) {
        if (this.comOk) { this.habRespNo1515[i] = sup.habResp[i] && this.ecoOk; this.falhaNo1515[i] = sup.falhaRetorno[i]; this.colNo1515[i] = sup.contatorColado[i]; }
        else this.habRespNo1515[i] = false;
      }
    }
  }
}
module.exports = { Supervisao, Sistema, N };
