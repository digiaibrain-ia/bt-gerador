/*
 * calculos_setup_v0.1.js — Cálculos do Setup das chaves do banco de carga
 * ---------------------------------------------------------------------
 * PARA QUE SERVE
 *   Mostra, com a mesma conta usada pelo medidor (v1.9.78) e pelo FB100 (v0.3),
 *   como se chega aos números do Setup: kW real, resistência medida (R) e a
 *   tensão de referência estimada (V ref.).
 *
 * POR QUE OS CÁLCULOS SÃO ASSIM
 *   - Cada chave do banco é uma carga resistiva. Potência e tensão se ligam por
 *     P = V² / R. Se a resistência é fixa, a potência muda com a tensão.
 *   - O kW que cada chave "vale" é medido: liga-se só uma chave e tira-se o kW
 *     sem carga (o que o gerador já consome). A diferença é o kW real da chave.
 *   - Com o kW real e a tensão medida, calcula-se a resistência equivalente.
 *     Se a resistência é a mesma nas 3 tensões (220/380/440 V), a resistência
 *     calculada deve bater em todas elas. Esse é o teste de validação.
 *   - A identificação em kW da placa (3 kW, 4 kW…) só faz sentido numa tensão
 *     de referência que ainda não conhecemos (V ref.). Por isso estimamos V ref.
 *     a partir do kW medido e não assumimos um valor.
 *
 * COMO RODAR O TESTE
 *   node calculos_setup_v0.1.js
 */

'use strict';

/**
 * Tensão média fase-fase (V), usada em todas as contas.
 * Por que média: as três tensões de linha (L1-L2, L2-L3, L3-L1) podem ter
 * pequenas diferenças. A média dá um valor único para a resistência.
 * @param {number} va  tensão L1-L2 (V)  — tag tensaoL1L2 no DB52
 * @param {number} vb  tensão L2-L3 (V)  — tag tensaoL2L3 no DB52
 * @param {number} vc  tensão L3-L1 (V)  — tag tensaoL3L1 no DB52
 * @returns {number} tensão média (V)
 */
function tensaoMedia(va, vb, vc) {
  return (va + vb + vc) / 3;
}

/**
 * kW real de uma chave = kW com a chave ligada − kW sem carga (base).
 * Por que subtrair: o gerador já alimenta o próprio consumo (base). Só o que
 * sobra com a chave ligada é a carga da chave.
 * @param {number} kwComChave  kW medido com a chave ligada (tag kw)
 * @param {number} kwSemCarga  kW da base (média móvel, ver FB100 REGION 1)
 * @returns {number} kW real da chave
 */
function kwReal(kwComChave, kwSemCarga) {
  return kwComChave - kwSemCarga;
}

/**
 * Resistência medida (Ω, equivalente em estrela por fase).
 * Fórmula: R = V² / (P × 1000), com P em kW.
 * Trava: só calcula se o kW real for maior que 0,05 kW. Abaixo disso é ruído
 * e a divisão daria um número sem sentido.
 * @param {number} vMedia  tensão média (V)
 * @param {number} kwRealChave  kW real da chave (kW)
 * @returns {number|null} resistência (Ω) ou null se o kW for ruído
 */
function resistenciaMedida(vMedia, kwRealChave) {
  if (!(kwRealChave > 0.05)) return null;
  return (vMedia * vMedia) / (kwRealChave * 1000);
}

/**
 * Tensão de referência estimada (V ref.) para a placa.
 * Dedução: se a carga é resistiva, P = V²/R. A placa diz kW_placa numa V_ref
 * desconhecida; a medição dá kW_real na tensão vMedia. Como R é constante:
 *   kW_placa / V_ref² = kW_real / vMedia²   →   V_ref = vMedia × √(kW_placa / kW_real)
 * Se o cálculo for consistente, o valor será igual para todas as chaves e
 * tensões. Se variar muito, a premissa (carga resistiva pura) não vale.
 * @param {number} vMedia   tensão média medida (V)
 * @param {number} kwPlaca  kW de identificação da chave (kW)
 * @param {number} kwRealChave  kW real medido (kW)
 * @returns {number|null} V ref. estimada (V) ou null se não der para calcular
 */
function vRefEstimada(vMedia, kwPlaca, kwRealChave) {
  if (!(kwRealChave > 0.05) || !(kwPlaca > 0)) return null;
  return vMedia * Math.sqrt(kwPlaca / kwRealChave);
}

/**
 * Variação de R entre tensões (%). Mede o quanto a resistência muda de um
 * chaveamento para outro. Perto de 0 % = a premissa "mesma resistência nas 3
 * tensões" vale. Usa máximo − mínimo sobre a média.
 * @param {number[]} resistencias  valores de R (Ω) nas tensões disponíveis
 * @returns {number|null} variação em % ou null se faltar mais de um valor
 */
function variacaoR(resistencias) {
  const v = resistencias.filter((x) => x > 0);
  if (v.length < 2) return null;
  const media = v.reduce((a, b) => a + b, 0) / v.length;
  return ((Math.max(...v) - Math.min(...v)) / media) * 100;
}

// ---------------------------------------------------------------------------
// TESTE COM VALORES INVENTADOS (só para conferir a conta, não são medições)
// ---------------------------------------------------------------------------
if (require.main === module) {
  const kwPlaca = 3;          // chave "3 kW" da identificação
  const kwSemCarga = 0.7;     // base medida
  const tensoes = [
    { v: 220, kwComChave: 0.7 + 3 / (380 / 220) ** 2 }, // kW cai com a tensão (P ∝ V²)
    { v: 380, kwComChave: 0.7 + 3 },
    { v: 440, kwComChave: 0.7 + 3 * (440 / 380) ** 2 }, // kW sobe com a tensão
  ];
  console.log('Chave 3 kW (teste com valores inventados)');
  const rs = [];
  for (const t of tensoes) {
    const kr = kwReal(t.kwComChave, kwSemCarga);
    const vm = t.v; // sem ruído: tensão média = tensão nominal
    const r = resistenciaMedida(vm, kr);
    const vref = vRefEstimada(vm, kwPlaca, kr);
    rs.push(r);
    console.log(`  ${t.v} V -> kW real ${kr.toFixed(2)} | R ${r.toFixed(2)} Ω | V ref. ${vref.toFixed(0)} V`);
  }
  console.log(`  Variação de R entre tensões: ${variacaoR(rs).toFixed(2)} %  (perto de 0 = premissa válida)`);
}

module.exports = { tensaoMedia, kwReal, resistenciaMedida, vRefEstimada, variacaoR };
