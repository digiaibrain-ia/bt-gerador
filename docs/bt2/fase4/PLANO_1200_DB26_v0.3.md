# Plano: PLC 1200 do banco de cargas - v0.3 (06/11/2026) - CORRIGE a v0.2 (chaveamento); AGUARDA os DBs do programador
Muda em relacao a `PLANO_1200_DB26_v0.2.md`. Nada foi aplicado.
**CORRECAO (Reginaldo):** o chaveamento 220/380/440 V NAO passa a ser lido do banco. Continua sendo o **ensaio que informa ao banco** a tensao do gerador que entrou para teste; isso vai pelo DB de competencia (1515 -> 1200), a combinar depois. A regra de "banco liberado" da tela NAO muda por enquanto.

## Hardware informado (MLFB)
- Banco de cargas: `6ES7 215-1AF40-0XB0` (os datasheets o descrevem como S7-1200F, CPU 1215 FC DC/DC/DC; confirmar a etiqueta e o firmware no TIA).
- Ensaio: `6ES7 515-2FM02-0AB0` (CPU 1515F-2 PN; firmware V2.8/V2.9 segundo os datasheets; ler o real no TIA). Ambas sao CPUs F; nossa supervisao e logica de programa PADRAO.
- PEEK/POKE/DB_ANY: nao confirmado em documento oficial. Se os DBs dele forem simbolicos, usamos acesso tipado (sem PEEK/POKE).

## Principio (Reginaldo): cada coisa no seu lugar
- **1515 (ensaio)**: comando de chaves, habilitar, setup/calibracao (resistencias), registro do ensaio.
- **1200 (banco de cargas)**: contatoras, retorno SB, seletora, protecoes/intertravamentos do banco, **liberacao de trabalho do ensaio**, e a IHM/Runtime proprio do banco (monitorar chaves, tensoes, seguranca). **Recebe do 1515 a tensao do gerador em teste (220/380/440 V)** pelo DB de competencia.
- Um dono por campo; o que e do banco vem do banco por um **DB de competencia** (dele); o 1515 so le.

## Telegramas e DBs (proposta, a confirmar com o programador)
| DB no 1200 | Funcao | Dono | Tamanho |
|---|---|---|---|
| DB3007 (+7 do banco) | controle PEDIDO/RESPOSTA (cmd, habPed, ligarBanco, vida, seq <-> fbk, seletora, habResp, eco, falhas) | pedido: 1515; resposta: 1200 | 24 B, rapido |
| DB3000 (mesmo numero do 1515) | **copia de mao unica** do DB de chaves (so consulta/IHM) | so o 1515 | **bytes 4-199 (196 B) numa passada** (habilitada, setupOk, kwReal, rMedidoOhm, rTeoricoOhm); setupData e nominal so sob pedido |
| DB de competencia do banco (numero a definir) | sinais do banco para o 1515: chaveamento ativo, liberacao de trabalho, protecoes (ex.: ventilador), alarmes | so o 1200 | a definir (GET rapido) |
- O retorno real (SB, seletora, falhas) vem pelo DB3007. O `sb` que aparece na copia do DB3000 e so a visao do 1515: nao e para controle.
- Resistencia: o `rMedidoOhm` do DB de chaves e o do chaveamento atual; por tensao (220/380/440) ficam no DB3002 (perguntar qual ele quer para a IHM).
- Os valores de resistencia/kW servem a IHM (pouca dinamica): nao entram no ciclo rapido de controle.

## Chaveamento (corrigido)
1. O 1515 continua **informando** o chaveamento (hoje `POST /api/chaves/{banco}/tensao` grava `TensaoSel` no DB3002; o FB100 usa). Depois, o mesmo valor vai ao 1200 pelo DB de competencia (a combinar).
2. **Proposta do Reginaldo (medidor):** a tensao ja vem dos Dados do ensaio (modelo do gerador). No card Setup o chaveamento deve aparecer **selecionado sozinho** por essa tensao, sem selecao manual. O Setup so funciona com o gerador ligado, e a configuracao correta ja foi escolhida nos Dados do ensaio. Hoje (v1.10.123) isso so acontece no Demo local; em modo PLC so mostra a dica. Aguarda OK para virar versao nova.
3. A regra "banco liberado" da tela fica **como esta** (seletora Auto + ligar banco + chaveamento informado); tratar depois (inclui ventilador/protecoes, licao BANC-1).
4. O 1515 **nao comanda** o chaveamento fisico; so informa a tensao do gerador. O banco deve conferir com o chaveamento fisico dele.

## Perguntas em aberto
- Lista exata dos sinais do DB de competencia (tensao do gerador informada pelo 1515; liberacao, ventilador, protecoes, emergencia do banco), quem escreve cada um, taxa de atualizacao.
- DBs por banco do programador (correcao dele), nomes simbolicos ou nao; numeros livres no 1200 (3000/3007...).
- Firmware real das duas CPUs; conexoes S7 livres na 1215 FC (para uma segunda conexao, se precisar).
- Roteiro de configuracao PUT/GET no 1200 (permitir acesso, DBs nao otimizados) e nova conexao no 1515.
