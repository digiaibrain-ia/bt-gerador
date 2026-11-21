#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.203.html (de 1.10.202). Nao sobrescreve; aborta se um trecho esperado mudou.
Liga o "Dados do ensaio por NS" ao fluxo de registro v1.10 (registro-ensaio-db2100-api-v1.10):
 1) ao confirmar, o NS e normalizado na tela (tira espacos e '*', O cortado -> 0, maiusculas) - igual ao que o fluxo v1.10 faz no servidor. Sem isto a leitura de volta do PLC
    ('DTMF04447') nao bate com o que a tela enviou ('DTMFØ4447') e o medidor acusa erro.
 2) o preenchimento enviado ao Node-RED leva origemDados ('manual'|'ns') e ns {valido,tipo,prefixo,sequencial,alterados[],avisos[]} (campos opcionais; fluxo v1.9 ignora).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.203_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

SUBMIT = r"""  // v1.10.203: ao confirmar (fase de captura: roda ANTES do tratamento original do formulario) normaliza o NS e guarda a origem dos dados para o envio ao registro.
  $g('fDados').addEventListener('submit',()=>{
    try{ $g('dServ').value=window.MWM_SERIE.normaliza($g('dServ').value); }catch(x){}
    if(modo==='ns'&&ultimo){ window.__DADOS_ORIGEM={origemDados:'ns',ns:{valido:ultimo.valido===true,tipo:ultimo.tipo||'',prefixo:ultimo.prefixo||'',sequencial:ultimo.sequencial==null?null:ultimo.sequencial,alterados:(window.__NS_ALTERADOS||[]).slice(),avisos:(ultimo.avisos||[]).concat(ultimo.erros||[])}}; }
    else window.__DADOS_ORIGEM={origemDados:modo==='ns'?'ns':'manual',ns:null};
  },true);
"""

def medidor():
    o, d = os.path.join(FE, 'medidor_gerador_v1.10.202.html'), os.path.join(FE, 'medidor_gerador_v1.10.203.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.202">', '<meta name="app-version" content="1.10.203">', 'meta')
    t = troca(t, "const VERSAO='1.10.202', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.203', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.203\",d:\"14/11/2026\",i:[\n"
              "    'NÚMERO DE SÉRIE NO REGISTRO DO ENSAIO: ao confirmar os Dados do ensaio, o nº de série é normalizado (sem espaços e sem *, o Ø da plaqueta vira 0, letras maiúsculas) em qualquer modo. Antes, o Ø ia ao PLC como ? e a leitura de volta não conferia. Com o fluxo de registro v1.10, o Node-RED também normaliza.'\n"
              "    ,'O preenchimento enviado ao Node-RED agora leva a origem dos dados (Manual ou Por nº de série) e, no modo por NS, o que foi decodificado e quais campos o operador alterou. O fluxo v1.10 guarda isso na memória do Node-RED (some se reiniciar; o DB2100 do PLC não ganha campo novo) e devolve em GET /api/ensaio/snap (campo origem). Com o fluxo v1.9 o medidor continua funcionando: o fluxo ignora os campos novos.'\n"
              "  ]},\n", 'hist')
    t = troca(t, "return {serie:DADOS.serie,versao:DADOS.versao,data:DADOS.data||hojeTxt(),fase:DADOS.fase,frequenciaHz:DADOS.freq,tensaoV:DADOS.tensao,tempAmbienteC:DADOS.tamb,potenciaKw:DADOS.pot,equipamentos:eq};",
              "return Object.assign({serie:DADOS.serie,versao:DADOS.versao,data:DADOS.data||hojeTxt(),fase:DADOS.fase,frequenciaHz:DADOS.freq,tensaoV:DADOS.tensao,tempAmbienteC:DADOS.tamb,potenciaKw:DADOS.pot,equipamentos:eq},window.__DADOS_ORIGEM||{}); // v1.10.203: + origemDados/ns (opcionais)", 'campos')
    t = troca(t, "    const l=box.querySelector('.dns-alt-l'); if(l)l.textContent=", "    window.__NS_ALTERADOS=nomes; const l=box.querySelector('.dns-alt-l'); if(l)l.textContent=", 'alterados')
    t = troca(t, "  window.DADOS_ENSAIO_NS={ modo:()=>modo, decodificado:()=>ultimo };", SUBMIT + "  window.DADOS_ENSAIO_NS={ modo:()=>modo, decodificado:()=>ultimo };", 'submit')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.203.html ok')
if __name__ == '__main__': medidor()
