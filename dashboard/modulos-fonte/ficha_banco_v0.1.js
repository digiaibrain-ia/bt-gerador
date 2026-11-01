/* =====================================================================================================================
   ficha_banco_v0.1.js — FICHA DO BANCO: quais chaveamentos de tensão (220 / 380 / 440 V) cada banco de carga atende
   Projeto bancos de teste · 29/10/2026 · trecho colado (inline) no medidor_gerador_v1.10.108.html, logo depois da lista BANCOS.

   PARA QUE SERVE (leigo): cada banco de carga é uma caixa física com resistências. Pela ligação física, nem todo banco funciona em
   todas as tensões: o BC56 atende 220, 380 e 440 V; o BC400 só 220 e 380 V. Esta "ficha" guarda isso num lugar só. Com ela a tela
   (a) não deixa escolher no Setup um chaveamento que o banco não tem e (b) não sugere/usa, no Patamar Guiado, um banco que não atende
   a tensão do gerador que está sendo testado.
   POR QUE (técnico): antes existia uma lista única TENS_V=[220,380,440] para todos os bancos; o BC400 oferecia 440 V sem existir.
   Se o retrofit passar o BC400 para 440 V, basta acrescentar 440 em tensoes:[...] na lista BANCOS — nenhuma outra linha muda.
   Quando o PLC 1200 dos bancos existir, a ficha passa a vir do próprio banco (ele informa o que atende) e esta lista vira só o padrão.

   REGRAS:
     - tensoes ausente na ficha = atende todas (compatível com bancos novos ainda sem ficha).
     - tensão do gerador = DADOS.tensao ("Dados do ensaio"). Só vale se for EXATAMENTE 220, 380 ou 440 (ASSUMIDO: outra tensão, ex. 400,
       não restringe banco nenhum — a tela só avisa).
     - banco elegível = tensão do gerador desconhecida OU o banco atende essa tensão.
     - um banco marcado mas inelegível NÃO é usado (nem sugerido nem comandado pelo Patamar); a marcação do operador é preservada.
   NÃO FAZ: não comanda chave, não fala com PLC/Node-RED, não muda DB nem rota.
   ===================================================================================================================== */
const TENS_CHAVEAMENTO = [220, 380, 440];                        // chaveamentos que existem no projeto (posição 0..2 = 1..3)
const bancoTensoes = b => (b && Array.isArray(b.tensoes) && b.tensoes.length) ? b.tensoes : TENS_CHAVEAMENTO;
const bancoAtende = (b, v) => bancoTensoes(b).includes(+v);
const tensaoGerador = () => { const v = +DADOS.tensao; return TENS_CHAVEAMENTO.includes(v) ? v : null; };   // null = não informada ou fora dos 3 chaveamentos
const bancoElegivel = b => { const v = tensaoGerador(); return v == null || bancoAtende(b, v); };
