# Plano: PLC 1200 do banco de cargas - v0.2 (06/11/2026) - decisoes do Reginaldo registradas; AGUARDA os DBs do programador
Muda em relacao a `PLANO_1200_DB26_v0.1.md`. Nada foi aplicado.

## Hardware informado (MLFB)
- Banco de cargas: `6ES7 215-1AF40-0XB0` (os datasheets o descrevem como S7-1200F, CPU 1215 FC DC/DC/DC; confirmar a etiqueta e o firmware no TIA).
- Ensaio: `6ES7 515-2FM02-0AB0` (CPU 1515F-2 PN; firmware V2.8/V2.9 segundo os datasheets; ler o real no TIA). Ambas sao CPUs F; nossa supervisao e logica de programa PADRAO.
- PEEK/POKE/DB_ANY: nao confirmado em documento oficial. Se os DBs dele forem simbolicos, usamos acesso tipado (sem PEEK/POKE).

## Principio (Reginaldo): cada coisa no seu lugar
- **1515 (ensaio)**: comando de chaves, habilitar, setup/calibracao (resistencias), registro do ensaio.
- **1200 (banco de cargas)**: contatoras, retorno SB, seletora, **chaveamento 220/380/440 V**, protecoes/intertravamentos do banco, **liberacao de trabalho do ensaio**, e a IHM/Runtime proprio do banco (monitorar chaves, tensoes, seguranca).
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

## O que isto muda no 1515 / Node-RED / medidor (ainda NAO feito)
1. **Chaveamento passa a ser lido do banco**, nao digitado: hoje a tela informa e `POST /api/chaves/{banco}/tensao` grava `TensaoSel` no DB3002 (FB100 usa). Passaria a vir do DB de competencia (somente leitura na tela). Decidir a transicao (fallback manual no ET200 provisorio).
2. A regra "banco liberado" da tela (seletora Auto + ligar banco + chaveamento informado) passa a considerar os sinais de liberacao do banco (incluindo ventilador e protecoes; licao BANC-1).
3. O 1515 **nao comanda** o chaveamento (seguranca e do banco).

## Perguntas em aberto
- Lista exata dos sinais do DB de competencia (chaveamento valor + valido + "em troca", liberacao, ventilador, protecoes, emergencia), quem escreve, taxa de atualizacao.
- DBs por banco do programador (correcao dele), nomes simbolicos ou nao; numeros livres no 1200 (3000/3007...).
- Firmware real das duas CPUs; conexoes S7 livres na 1215 FC (para uma segunda conexao, se precisar).
- Roteiro de configuracao PUT/GET no 1200 (permitir acesso, DBs nao otimizados) e nova conexao no 1515.
