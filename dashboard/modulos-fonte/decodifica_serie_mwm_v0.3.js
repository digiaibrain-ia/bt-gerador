/* =====================================================================================================================
   decodifica_serie_mwm_v0.3.js — DECODIFICADOR DO NÚMERO DE SÉRIE MWM (gerador ETD 091 rev.05 / torre ETD 094 rev.00)  ·  14/11/2026
   v0.3: ESTRITO, só as normas (decisão do Reginaldo). É a lógica da v0.1: 9 caracteres = gerador (ETD 091 rev.05), 8 = torre (ETD 094 rev.00). A tolerância da v0.2 (aceitar 'S' + 9 caracteres) foi REMOVIDA:
   NS fora do formato da norma = inválido, nada é preenchido, o operador preenche à mão. Letra desconhecida nas tabelas continua só avisando (tabelas 'não exaustivas'). Abaixo, o texto da v0.1.
   PARA QUE SERVE (leigo): recebe o número de série que vem do MES (ex.: GDWAØ4447) e devolve em palavras: combustível, motor, alternador,
   controlador e o número sequencial. O resultado preenche os dados do ensaio; o que a norma não diz (potência, tensão etc.) o operador digita.
   COMO (técnico): tira os '*' do código de barras, troca 'Ø' (zero cortado) por '0', põe em maiúsculas. 9 caracteres = gerador (4 letras + 5 dígitos);
   8 caracteres = torre de iluminação (3 letras + 5 dígitos). Nunca lança erro: devolve {valido:false, erros:[...]}.
   REGRAS: letra fora da tabela NÃO invalida (a norma diz "relação não exaustiva"): grava a letra bruta e põe aviso 'desconhecido'.
   avisos[] só alertam (ex.: 'G' pode ser biogás antes de 14/12/2021; série anterior a 29/12/2020 segue estrutura antiga).
   API: decodificaSerie(texto, {dataFabricacao}) → objeto abaixo.  dataFabricacao é opcional ('AAAA-MM-DD' ou Date); sem ela, não há avisos de data.
     { valido, bruto, normalizado, tipo:'gerador'|'torre'|null, norma, combustivel|fonteEnergia, motor, alternador, controlador (só gerador),
       sequencial (número), prefixo (letras), avisos[], erros[] }
   Cada campo de tabela vem como { codigo, descricao, conhecido }.
   NÃO FAZ: não fala com PLC/DSE/MES, não grava nada. Funciona no navegador (window.MWM_SERIE) e no Node (require).
   ===================================================================================================================== */
(function (raiz) {
  'use strict';

  /* --- Tabelas da ETD 091 rev.05 (gerador). Fonte: tabelas I a IV, folha 4/6 --- */
  const GER_COMBUSTIVEL = { D: 'Diesel', G: 'Gás natural', B: 'Biogás' };
  const GER_MOTOR = {
    A: 'Série 229 · 3 cil · 3,0 L', B: 'Série 229 · 4 cil · 4,0 L', C: 'Série 229 · 6 cil · 6,0 L',
    R: 'Série 229 · 3 cil · 3,1 L', H: 'Série 229 · 4 cil · 4,2 L', W: 'Série 229 · 6 cil · 6,2 L',
    D: 'Série 12 (2V) · 4 cil · 4,8 L', F: 'Série 12 (2V) · 6 cil · 7,2 L',
    U: 'Série 12 (4V) · 4 cil · 4,8 L', Y: 'Série 12 (4V) · 6 cil · 7,2 L',
    S: 'Scania · 5/6 cil · 9,6/12,7 L', V: 'Volvo · 6 cil · 12,8/16 L', M: 'MAN · 6 cil · 28 L',
    T: 'Yanmar · 2/3/4 cil · 0,570 a 4,412 L', K: 'Kohler · 2/3/4 cil · 0,686 a 2,484 L', Z: 'SDEC · 4/6 cil · 2,7 a 12,8 L'
  };
  const GER_ALTERNADOR = { W: 'WEG', C: 'Cramaco', M: 'Mecc Alte', F: 'First All', N: 'Sem alternador' };
  const GER_CONTROLADOR = { A: 'Deep Sea 4520', B: 'Deep Sea 7320', C: 'Deep Sea 7420', D: 'Deep Sea 8620', E: 'Deep Sea 8610', F: 'Deif AGC150', N: 'Sem controlador' };

  /* --- Tabelas da ETD 094 rev.00 (torre de iluminação). Fonte: tabelas I a III, folha 4/5 --- */
  const TOR_FONTE = { D: 'Motor diesel', S: 'Painel solar', B: 'Bateria' };
  const TOR_MOTOR = { T: 'Yanmar · 2/3/4 cil · 0,570 a 4,412 L', K: 'Kohler · 2/3/4 cil · 0,686 a 2,484 L', N: 'Sem motor' };
  const TOR_ALTERNADOR = { M: 'Mecc Alte', N: 'Sem alternador' };

  const CORTE_ESTRUTURA_NOVA = '2020-12-29';   // ETD 091 item 8: antes disso vale a estrutura antiga (rev. anterior)
  const CORTE_LETRA_BIOGAS = '2021-12-14';     // ETD 091 item 8: 'B' para biogás já em uso desde esta data (antes era 'G')

  const campo = (tabela, codigo) => ({ codigo, descricao: tabela[codigo] || null, conhecido: Object.prototype.hasOwnProperty.call(tabela, codigo) });

  function paraData(d) {
    if (d == null || d === '') return null;
    const x = d instanceof Date ? d : new Date(String(d).length === 10 ? d + 'T00:00:00Z' : d);
    return isNaN(x.getTime()) ? null : x.toISOString().slice(0, 10);
  }

  function normaliza(texto) {
    return String(texto == null ? '' : texto)
      .replace(/[\s*]/g, '')            // espaços e asteriscos do código de barras
      .replace(/[Øø∅]/g, '0')           // zero cortado da plaqueta
      .toUpperCase();
  }

  function decodificaSerie(texto, opcoes) {
    const dataFab = paraData(opcoes && opcoes.dataFabricacao);
    const r = { valido: false, bruto: texto == null ? '' : String(texto), normalizado: '', tipo: null, norma: null, avisos: [], erros: [] };
    const n = normaliza(texto);
    r.normalizado = n;
    if (!n) { r.erros.push('Número de série vazio.'); return r; }
    if (!/^[A-Z0-9]+$/.test(n)) { r.erros.push('Há caracteres inválidos (só letras e números são permitidos).'); return r; }

    if (n.length === 9) {
      const m = /^([A-Z]{4})(\d{5})$/.exec(n);
      if (!m) { r.erros.push('Gerador (9 caracteres) deve ter 4 letras seguidas de 5 dígitos.'); return r; }
      r.tipo = 'gerador'; r.norma = 'ETD 091 rev.05'; r.prefixo = m[1]; r.sequencial = parseInt(m[2], 10);
      r.combustivel = campo(GER_COMBUSTIVEL, m[1][0]);
      r.motor = campo(GER_MOTOR, m[1][1]);
      r.alternador = campo(GER_ALTERNADOR, m[1][2]);
      r.controlador = campo(GER_CONTROLADOR, m[1][3]);
      if (!r.combustivel.conhecido) r.erros.push('Combustível "' + m[1][0] + '" não existe na tabela I (D, G ou B).');
      if (!r.motor.conhecido) r.avisos.push('Família de motor "' + m[1][1] + '" desconhecida (tabela II é não exaustiva).');
      if (!r.alternador.conhecido) r.avisos.push('Alternador "' + m[1][2] + '" desconhecido (tabela III).');
      if (!r.controlador.conhecido) r.avisos.push('Controlador "' + m[1][3] + '" desconhecido (tabela IV).');
      if (dataFab && dataFab < CORTE_ESTRUTURA_NOVA) r.avisos.push('Fabricado antes de 29/12/2020: pode seguir a estrutura antiga de número de série (ETD 091 rev. anterior).');
      if (dataFab && m[1][0] === 'G' && dataFab < CORTE_LETRA_BIOGAS) r.avisos.push('Letra G antes de 14/12/2021 pode ser biogás (a letra B só passou a distinguir biogás nessa data).');
    } else if (n.length === 8) {
      const m = /^([A-Z]{3})(\d{5})$/.exec(n);
      if (!m) { r.erros.push('Torre (8 caracteres) deve ter 3 letras seguidas de 5 dígitos.'); return r; }
      r.tipo = 'torre'; r.norma = 'ETD 094 rev.00'; r.prefixo = m[1]; r.sequencial = parseInt(m[2], 10);
      r.fonteEnergia = campo(TOR_FONTE, m[1][0]);
      r.motor = campo(TOR_MOTOR, m[1][1]);
      r.alternador = campo(TOR_ALTERNADOR, m[1][2]);
      if (!r.fonteEnergia.conhecido) r.erros.push('Fonte de energia "' + m[1][0] + '" não existe na tabela I (D, S ou B).');
      if (!r.motor.conhecido) r.avisos.push('Família de motor "' + m[1][1] + '" desconhecida (tabela II é não exaustiva; códigos conforme ETD 009).');
      if (!r.alternador.conhecido) r.avisos.push('Alternador "' + m[1][2] + '" desconhecido (tabela III).');
    } else {
      r.erros.push('Tamanho inválido: ' + n.length + ' caracteres (gerador = 9, torre = 8).');
      return r;
    }
    if (r.sequencial === 0) r.avisos.push('Sequencial 00000: a norma começa em 00001.');
    r.valido = r.erros.length === 0;
    return r;
  }

  const API = { decodificaSerie, normaliza, versao: '0.3', tabelas: { GER_COMBUSTIVEL, GER_MOTOR, GER_ALTERNADOR, GER_CONTROLADOR, TOR_FONTE, TOR_MOTOR, TOR_ALTERNADOR } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.MWM_SERIE = API;
})(typeof window !== 'undefined' ? window : globalThis);
