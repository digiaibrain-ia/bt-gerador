#!/usr/bin/env python3
"""17/11/2026 - arquitetura BT2 v0.6 a partir da v0.5 (nao sobrescreve): medidor 1.10.220 (RNC, perfil de combustivel, alarme inteligente), chaves-56 v3.7 (eco/seq),
RNC no Node-RED, ET200 v0.7 (PROVISORIO, validado na bancada), PLC de Carga 1200 v0.17 (RASCUNHO, nao compilado) e o repasse do DB2000 (FB104). Atualiza pendencias."""
import os, re
D = os.path.dirname(os.path.abspath(__file__))
src, dst = os.path.join(D, 'arquitetura_bt2_v0.5_editavel.html'), os.path.join(D, 'arquitetura_bt2_v0.6_editavel.html')
assert not os.path.exists(dst)
s = open(src, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
def bloco(kind, id_, novo):   # substitui o objeto (1 ou 2 linhas) que comeca em " {id:'ID'"
    global s
    ini = s.index(" {id:'%s'" % id_); fim = s.index('\n', s.index("},", ini) if kind == 'e' else ini)
    # N: entrada termina na primeira linha que acaba em "'}," ou "}," seguida de nova entrada
    m = re.compile(r"\n (?=\{id:|/\*|\];)").search(s, ini + 5); fim = m.start()
    s = s[:ini] + novo.rstrip('\n').rstrip(',') + ',' + s[fim:] if s[fim - 1] == ',' else s[:ini] + novo.rstrip('\n') + s[fim:]
# ---- titulo e armazenamento (posicoes salvas da v0.5 nao valem para o novo desenho)
rep('<title>Arquitetura BT2 Editável</title>', '<title>Arquitetura BT2 v0.6</title>')
rep('<h1>Arquitetura BT2</h1><span class="sub">Um modelo, três estilos. Edite, salve e exporte como na maquete.</span>', '<h1>Arquitetura BT2 <small style="font-weight:500;color:var(--muted)">v0.6 · 17/11/2026</small></h1><span class="sub">Quem fala com quem. Um modelo, três estilos. Amarelo = provisório ou rascunho; passe o mouse para o detalhe.</span>')
rep("var CHAVE='bt2.arquitetura.v1';", "var CHAVE='bt2.arquitetura.v2';")
# ---- tela
rep("sub:'v1.10.167 · PC e celular'", "sub:'v1.10.220 · PC e celular'")
rep("Publica eventos em /api/dev/log-evento e, no navegador, nos canais bt2-dev-obs e bt2-grafico.'}", "Publica eventos em /api/dev/log-evento e, no navegador, nos canais bt2-dev-obs e bt2-grafico. Na v1.10.220: área RNC (switch, desligado por padrão, com fila local), alarme inteligente, bancos visíveis só os selecionados, Patamar manual que espera o Aplicar e a carga chegar ao degrau, e o perfil de combustível (diesel, gás e biometano) com pausa mínima, trava por frequência e descida escalonada. Os FBs virtuais rodam no navegador (JS); o PLC ainda não limita degrau nem capacidade (BK-AUD-04/10).'}")
rep("Visor da API dos cards 0.3, Mapa dos FBs 0.15, Maquete de layout 0.4 e Simulador de amostras 0.7.", "Visor da API dos cards 0.3, Mapa dos FBs 0.19, Maquete de layout 0.4, Simulador de amostras 0.7, Registro de RNC (entrada simples) e Reparo de RNC (HTML separado, para quem repara).")
# ---- Node-RED e fluxos
rep("Testado no Node-RED 5.0.9; a versão do PC ainda precisa ser confirmada.'}", "Testado no Node-RED 5.0.9; a versão do PC ainda precisa ser confirmada. Nas chaves, cada comando carrega um número de pacote (seq) e o PLC devolve o eco; o fluxo chaves-56 v3.7 só confirma quando o eco bate (janela de 2 s, quarentena se não bater).'}")
rep("sub:'v3.4 · /api/chaves/{banco}'", "sub:'chaves-56 v3.7 · chaves-400 v3.6'")
rep("sub:'v1.8 · /api/ensaio/*'", "sub:'v1.10 · /api/ensaio/*'")
rep("sub:'grava o DB2000 no PLC'", "sub:'v4.0 · grava o DB2000 no PLC 1500'")
rep("sub:'v3.6 · /api/gerador'", "sub:'v3.7 · /api/gerador'")
rep("sub:'v1.5 · Etapas 2 e 3'", "sub:'v1.7 · Etapas 2 e 3'")
# ---- PLC 1500
rep("sub:'FB100 (setup) · FB101 (ET200)'", "sub:'FB100 setup · FB101 (ET200 e 1200) · FB104 (DSE)'")
rep("FB101: PUT/GET com o ET200 (vida do 1515 e do ET200, seletora do banco).'}", "FB101: PUT/GET com o banco (ComEt200 para o ET200, ComCarga v0.9 para a 1200): comando, vida do 1515 e do banco, Ligar banco, seletora, seq/eco; RespEcoOk precisa estar ligado ao respEcoOk do DB3000. FB104: repassa o DB2000 (136 bytes do DSE) ao PLC de Carga por PUT, só informação para a tela (não é comando).'}")
rep("det:'Chaves do BC56 (DB3000) e do BC400 (DB3100). Lidas a cada 200 ms. Renumerados e carregados no 1515.'}", "det:'Chaves do BC56 (DB3000) e do BC400 (DB3100). Lidas a cada 200 ms. Renumerados e carregados no 1515. O Node-RED é o único que escreve o pedido; o retorno vem do banco (ET200 hoje, 1200 depois).'}")
rep("det:'Dados do DSE gravados pelo fluxo Ler gerador (.156).'}", "det:'Dados do DSE gravados pelo fluxo Ler gerador (.156). O FB104 do 1515 envia uma cópia (136 bytes) ao PLC de Carga.'}")
# ---- ET200 (provisorio) + 1200 (rascunho) + DB2000 copia
bloco('n', 'et200', """ {id:'et200',nome:'ET200 (IM151-8)',sub:'PROVISÓRIO · validado na bancada',st:'pend',cor:'yellow',gl:'server',fig:'et',g:'G_ET',ga:'A_SIS',b:[290,1110],a:[380,830],in:'ba',sz:{blocos:[250,96],ilustrado:[150,120]},
  det:'Faz hoje o papel do PLC do Banco de Carga (família S7-300). Blocos v0.7: fb_bancosEt200 v0.2 (guarda as imagens em STAT e chama um fb_bancoEt200_16 por banco), fc_bancosEt200 v0.7 (só organiza os tags) e DB de instância ibancosEt200. PROVISÓRIO: o retorno da contatora é a própria saída (ainda não há contato auxiliar), então a proteção de contator travado/colado não tem sentido nesta fase. Validado na bancada: 1515 em STOP derruba saídas e Ligar Banco; queda do cabo de rede derruba e só religa com novo comando.'}""")
bloco('n', 'dse_sig', """ {id:'plc1200',nome:'PLC de Carga 1200 (1214FC)',sub:'v0.17 · RASCUNHO, não compilado',st:'pend',cor:'yellow',gl:'cpu',fig:'plc',g:'G_ET',ga:'A_SIS',b:[640,1110],a:[290,930],in:'ba',sz:{blocos:[250,96],ilustrado:[150,120]},
  det:'Assume o banco de carga depois do Retrofit, com o contato auxiliar REAL das contatoras. Entrega v0.17 (Alexandre programa): fb_bancosCarga1200 (espelho do ET200), fb_bancoCarga16, fb_supervisaoChaves16, fc_bancosCarga1200 (só organiza), DB3007 e DB3107 (telegrama), db3006i (instância pronta) e DB2000. Mesma lógica do ET200, só TON → TON_TIME. Nada compilado no TIA nem testado no PLC; comentários em //[F] funcionamento e //[M] montagem.'},
 {id:'db2000c',nome:'DB2000 · cópia no 1200',sub:'grandezas do DSE · só leitura',st:'pend',cor:'mint',gl:'db',fig:'db',g:'G_ET',b:[940,1110],in:'b',
  det:'Cópia só de leitura das grandezas do DSE (136 bytes: carga %, tensões, correntes, kW, água, rpm, bateria, heartbeat) para a tela WinCC do PLC de Carga. Escritor único: o PUT do FB104 do 1515. Se o heartbeat parar de mudar (~5 s) a tela avisa dado desatualizado. Mesmo número e mesmos offsets nos dois PLCs.'}""")
rep("det:'Banco BC56: 13 chaves, em uso.'}", "det:'Banco BC56: 13 chaves. Hoje comandado pelo ET200; depois do Retrofit, pela 1200 (DB3007).'}")
rep("det:'Banco BC400: 13 chaves, em uso.'}", "det:'Banco BC400: 13 chaves. Hoje comandado pelo ET200; depois do Retrofit, pela 1200 (DB3107).'}")
rep("det:'Programa e carrega os blocos no PLC 1500 e no ET200/1200.'}", "det:'Programa e carrega os blocos no PLC 1500, no ET200 e na 1200. O Alexandre programa a 1200 a partir do pacote v0.17.'}")
# ---- RNC (Node-RED + disco)
rep(" {id:'sim',nome:'Simulador DSE'", """ {id:'rnc',nome:'RNC (não conformidade)',sub:'rnc-api v1.2 · opcional',st:'pend',cor:'blue',gl:'clip',fig:'reg',g:'G_PC',ga:'A_RNC',b:[660,770],a:[1010,735],in:'ba',sz:{blocos:[170,84],ilustrado:[134,124],agentes:[150,62]},
  det:'Aba própria, opcional (switch no medidor desligado por padrão), sem nós S7. Único escritor do arquivo rnc.jsonl. Exige chave de idempotência (repetir o mesmo pedido devolve 200 sem duplicar; mesma chave com dados diferentes = 409), guarda de origem (403) e pasta fora de public. Se a rede cair, o medidor guarda numa fila local e reenvia. O registro hoje é feito em cartão de papel: a automação é melhoria. Espelho no SQL fica para depois.'},
 {id:'rncdisk',nome:'rnc.jsonl',sub:'disco do PC · fora de public',st:'pend',cor:'gray',gl:'db',fig:'db',g:'G_PC',b:[445,770],in:'b',sz:{blocos:[160,84],ilustrado:[134,124]},
  det:'Arquivo de linhas JSON com os registros de RNC (pasta definida por variável do PM2, RNC_DIR). Só o fluxo RNC escreve.'},
 {id:'sim',nome:'Simulador DSE'""")
# ---- ligacoes
rep(" {id:'e20',de:'plc',pa:'et200',rot:'PUT/GET',st:'diag',sk:'b',bi:1,det:'PUT/GET de 6 bytes: comando das chaves, vida do 1515 e Ligar banco; retorno com feedback, vida do ET200 e seletora em Auto. Hoje o ComOk está falso.'},",
    " {id:'e20',de:'plc',pa:'et200',rot:'PUT/GET · FB101',st:'pend',sk:'b',bi:1,det:'PUT/GET de 24 bytes (DB38/DB39 no ET200): pedido (comando, vida do 1515, Ligar banco, habilitar, seq) e resposta (retorno, vida do ET200, seletora, eco, falhas). Vida do 1515 parada por 2 s = o ET200 derruba tudo. Validado na bancada, retorno provisório.'},")
rep(" {id:'e21',de:'dse_sig',pa:'et200',rot:'futuro',st:'fut',sk:'b',det:'Sinais do DSE para o banco de carga (futuro).'},",
    " {id:'e21',de:'plc',pa:'plc1200',rot:'PUT/GET · FB101',st:'pend',sk:'b',bi:1,det:'Mesmo telegrama de 24 bytes (DB3007 e DB3107 na 1200; PUT P#DB3007.DBX0.0 BYTE 10 e GET P#DB3007.DBX10.0 BYTE 14). Substitui o ET200 depois do Retrofit. Rascunho.'},\n {id:'e21b',de:'db2000',pa:'db2000c',rot:'PUT · FB104',st:'pend',sk:'b',det:'PUT cíclico de 136 bytes (P#DB2000.DBX0.0). Só informação para a tela: falha deste PUT não pode afetar as contatoras.',o:{sa:'r',sb:'r',via:1120}},\n {id:'e21c',de:'plc1200',pa:'db2000c',rot:'',st:'pend',sk:'b',det:'O DB2000 vive no PLC de Carga ao lado dos blocos do banco.'},\n {id:'e21d',de:'plc1200',pa:'bc56',rot:'Retrofit',st:'fut',sk:'b',det:'Depois do Retrofit a 1200 comanda o BC56.'},\n {id:'e21e',de:'plc1200',pa:'bc400',rot:'',st:'fut',sk:'b',det:'Depois do Retrofit a 1200 comanda o BC400.'},\n {id:'e21f',de:'nodered',pa:'rnc',rot:'',st:'pend',sk:'b',det:'Fluxo rnc-api v1.2.',o:{sa:'r',sb:'r',via:905}},\n {id:'e21g',de:'rnc',pa:'rncdisk',rot:'',st:'pend',sk:'b',det:'Grava (anexa) uma linha por registro em rnc.jsonl.'},")
rep(" {id:'a24',de:'plc',pa:'et200',rot:'PUT/GET',st:'diag',sk:'a',bi:1,det:'PUT/GET entre o PLC 1500 e o ET200. ComOk falso hoje.'},",
    " {id:'a24',de:'plc',pa:'et200',rot:'PUT/GET',st:'pend',sk:'a',bi:1,det:'PUT/GET entre o PLC 1500 e o ET200 (provisório, validado na bancada).'},\n {id:'a24b',de:'plc',pa:'plc1200',rot:'PUT/GET',st:'pend',sk:'a',bi:1,det:'Mesmo telegrama com a 1200 (rascunho v0.17).'},\n {id:'a30',de:'nodered',pa:'rnc',rot:'',st:'pend',sk:'a',det:'Fluxo RNC (opcional).'},")
rep("{id:'A_FER',nome:'Ferramentas',cor:'gray',sk:'a',tr:1}", "{id:'A_FER',nome:'Ferramentas',cor:'gray',sk:'a',tr:1},{id:'A_RNC',nome:'RNC (opcional)',cor:'blue',sk:'a'}")
# agentes: separa as fileiras de baixo para caber o plc1200
for nid, old, new in (('mes', "a:[330,965]", "a:[330,1050]"), ('sql', "a:[560,965]", "a:[560,1050]"), ('srv31', "a:[780,965]", "a:[780,1050]"),
                      ('tia', "a:[150,1095]", "a:[150,1180]"), ('pm2b', "a:[400,1095]", "a:[400,1180]"), ('git', "a:[620,1095]", "a:[620,1180]"), ('tests', "a:[840,1095]", "a:[840,1180]")):
    rep(old, new)
rep("agentes:{cl:'sk-a',nome:'Agentes',W:1180,H:1210}", "agentes:{cl:'sk-a',nome:'Agentes',W:1180,H:1290}")
rep("sub:'provisório · comunicação em diagnóstico'", "sub:'x'", 0) if False else None
# ---- abre espaco: tudo com b.y >= 810 desce 115 (a fileira do RNC entra no fim do grupo PC BT2)
def desce(m):
    x, y = int(m.group(1)), int(m.group(2)); return 'b:[%d,%d]' % (x, y + 115 if y >= 810 else y)
ini = s.index('var N=['); fim = s.index('/* grupos:')
s = s[:ini] + re.sub(r'\bb:\[(\d+),(\d+)\]', desce, s[ini:fim]) + s[fim:]
rep("blocos:{cl:'sk-b',nome:'Blocos',W:1240,H:1670}", "blocos:{cl:'sk-b',nome:'Blocos',W:1240,H:1790}")
rep("ilustrado:{cl:'sk-i',nome:'Ilustrado',W:1240,H:2190}", "ilustrado:{cl:'sk-i',nome:'Ilustrado',W:1240,H:2340}")
# ---- ferramentas, rotas e pendencias
rep("det:'190 testes de integração (Node.js e Playwright) contra um PLC simulado. Não substitui a validação na bancada.'}", "det:'Testes automáticos (Node.js, Playwright e um Node-RED real com PLC simulado) a cada versão. Não substituem a validação na bancada nem o TIA.'}")
rep("['Suíte de testes','190 testes (Node.js + Playwright), PLC simulado','repositório']", "['Suíte de testes','Node.js + Playwright + Node-RED 5.0.9 com PLC simulado','repositório']")
rep(" ['chaves-56 / chaves-400 (v3.4)',", " ['chaves-56 (v3.7) / chaves-400 (v3.6)',")
rep(" ['registro-ensaio (v1.8)',", " ['registro-ensaio (v1.10)',")
rep(" ['Deep Sea → REST (v3.6)',", " ['rnc-api (v1.2, opcional)','GET /api/rnc/*','POST /api/rnc/* (chave de idempotência obrigatória; 409 se a chave voltar com dados diferentes)','—','pendente (opcional)'],\n ['Deep Sea → REST (v3.7)',")
ini = s.index('var PEND=['); fim = s.index('];', ini) + 2
pend = """var PEND=[
 ['ET200 é provisório','O retorno da contatora é a própria saída: não detecta contator travado ou colado. Só a 1200 pós-Retrofit terá o contato auxiliar real.'],
 ['PLC de Carga 1200 (v0.17)','Rascunho do Alexandre: nada compilado no TIA nem testado no PLC. Falta ligar os tags reais (retornos, seletoras, saídas, Ligar Banco) e testar com a carga desacoplada.'],
 ['Heartbeat do 1515 em STOP (BK-PLC-02)','Hoje o ET200 derruba tudo quando a vida do 1515 para, e foi provado. Falta um heartbeat explícito do Node-RED/medidor; aguarda OK e bancada.'],
 ['Limites no PLC (BK-AUD-04 e 10)','Capacidade do banco e tamanho de degrau são limitados só no medidor/Node-RED. O PLC ainda não recusa um comando fora do limite.'],
 ['Login e perfis (BK-AUD-05)','A guarda de escrita confere origem e JSON, mas não substitui login.'],
 ['Perfil de combustível','Valores de gás e biometano (degraus, pausa, frequência) são provisórios: confirmar com o datasheet do gerador.'],
 ['RNC','Switch desligado por padrão; precisa ser importado no PC e testado com o PLC real. O espelho no SQL fica para depois.'],
 ['Cliques rápidos (504)','A janela de confirmação (2 s) pode dar 504 em cliques muito rápidos. Ajustável (CONF_JANELA_MS); ainda não alterado.'],
 ['Rótulo do fluxo do DSE','O arquivo é v3_7 e o nome mostrado no Node-RED ainda diz v3.6 (só rótulo).'],
 ['Caminho físico do OPC (MES Four Elements)','O MES vai preencher os Dados de Ensaio por OPC. Falta definir se entra no PLC 1500 ou passa pelo Node-RED.'],
 ['DSE desligado','O fluxo Deep Sea → REST responde sem dados quando o DSE está desligado.'],
 ['SQL Server','Futuro: gravação assíncrona, fora do caminho de comando. Credenciais só em variável do PM2.'],
 ['BC550 e BC595','Etapas 2 e 3: blocos do ET200/1200 e fluxos v1.7 ainda não importados.'],
 ['Versão do Node-RED e PM2 do PC','Confirmar no PC BT2.']
];"""
s = s[:ini] + pend + s[fim:]
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
