#!/usr/bin/env python3
"""11/11/2026 - entrega 1200 v0.13 = v0.12 (mesmos blocos) com COMO_USAR.txt COMPLETO (o v0.12 era curto demais: programador nao sabia o que fazer; foto do TIA mostrou DBs renumerados pelo TIA para DB1/DB2/DB3
e projeto existente com FC7 Resistencias/FC8 Saidas Digitais). So muda o texto. Nao sobrescreve. Uso: python3 plc/bt2/gerador/gerar_entrega_1200_v0.13.py"""
import os, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V12, V13 = os.path.join(R, 'entrega_1200_v0.12'), os.path.join(R, 'entrega_1200_v0.13')
assert os.path.exists(V12) and not os.path.exists(V13)
shutil.copytree(V12, V13)
open(os.path.join(V13, 'COMO_USAR.txt'), 'w', encoding='utf-8').write("""COMO USAR - PLC de Carga (S7-1214FC) - entrega v0.13   [rascunho: nao compilado]

O QUE E: o 1515 manda o comando de cada chave (PUT) e le o retorno (GET). Estes blocos, no 1214FC, ligam a contatora de verdade
e devolvem o contato auxiliar real. Sao 2 bancos: BC56 e BC400 (13 chaves cada).

BLOCOS (pasta PLC_CARGA_1200, 1 DB por arquivo)
  db3007_BC56_Com / db3107_BC400_Com   DB de TELEGRAMA (24 bytes). O 1515 escreve o pedido e le a resposta. Voce NAO escreve nele.
  fb_supervisaoChaves16                regra "contato auxiliar some -> a chave cai em 2 s". Usado dentro do fb_bancoCarga16.
  fb_bancoCarga16                      a logica do banco (1 por banco). Recebe o numero do DB de telegrama.
  db3006i_BC56_BancoCarga / db3106i_BC400_BancoCarga   DB de INSTANCIA do fb_bancoCarga16 (o "i" = instancia). Nao mexer.
  fc_bancosCarga1200                   liga as ENTRADAS/SAIDAS FISICAS aos 2 bancos. E o unico lugar que voce edita.

PASSO A PASSO
 1. Importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db3007, db3107, fb_supervisaoChaves16, fb_bancoCarga16, db3006i, db3106i, fc_bancosCarga1200.
 2. NUMERO DOS DBs (o TIA numera sozinho DB1, DB2...): ajuste para o numero do nome. Botao direito no DB > Propriedades > Geral > Numero (manual):
      db3007_BC56_Com = 3007 | db3107_BC400_Com = 3107 | db3006i_BC56_BancoCarga = 3006 | db3106i_BC400_BancoCarga = 3106
    Os de TELEGRAMA (3007 e 3107) TEM que ser esses: o 1515 acessa por P#DB3007 e P#DB3107. Os de telegrama: sem "Acesso otimizado".
 3. Tabela de tags: crie estes tags (Bool) e coloque o endereco fisico real de cada um:
      BC56_I01..I13   entrada: contato auxiliar (retorno) da contatora 1..13     BC400_I01..I13  idem
      BC56_Q01..Q13   saida: bobina da contatora 1..13                           BC400_Q01..Q13  idem
      BC56_SEL_AUTO   entrada: seletora do BC56 em Auto (1 = Auto)               BC400_SEL_AUTO  idem
    Se ja existirem tags com outro nome, troque o nome dentro do fc_bancosCarga1200.
 4. SAIDAS: depois disto, so o fc_bancosCarga1200 pode escrever nas saidas Q das contatoras. Se o FC7 (Resistencias) ou o FC8 (Saidas Digitais)
    atuais escrevem nas mesmas saidas, tire essa escrita (senao ha 2 escritores e a contatora pode ser acionada fora do comando do 1515).
 5. Chame o fc_bancosCarga1200 1 vez por ciclo no OB1 (ele ja chama os 2 bancos).
 6. Na CPU: Protecao e seguranca > Mecanismos de conexao > marque "Permitir acesso via PUT/GET". A conexao S7 com o 1515 e criada no 1515 (o ID vai la, em ID_Conexao).
 7. Compile. Se der erro, mande a lista das mensagens (e o nome do bloco).

TESTE (carga de potencia DESACOPLADA): no 1515 com o PLC em Run, ComOk deve ficar TRUE e a vida (vidaET) mudando; comando de uma chave liga a saida;
se o contato auxiliar nao voltar em 2 s a chave cai e trava; se o 1515 ficar mais de 2 s sem vida, todas as saidas caem.

Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo).
""")
print('ok', V13)
