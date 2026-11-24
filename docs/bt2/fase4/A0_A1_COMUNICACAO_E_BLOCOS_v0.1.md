# Portao A - A0 (comunicacao entre PLCs) e A1 (blocos novos do PLC) - v0.1 - RASCUNHO PARA REVISAO DO REGINALDO
Nada foi alterado em producao. Todos os arquivos sao NOVOS (versao nova) e **nao foram compilados no TIA nem testados no PLC**.

## A0 - Comunicacao entre os PLCs (analise)
| Opcao | Ponto forte | Ponto fraco | Veredito |
|---|---|---|---|
| S7 PUT/GET (hoje) | Ja funciona na bancada; 1 conexao serve os bancos; sem projeto PROFINET novo | Exige liberar "acesso PUT/GET" na CPU; PUT e GET nao sao atomicos entre si; vigia de vida e feito na mao | **Manter na bancada** |
| Open User Communication (TSEND/TRCV) | Pacote unico e consistente; sem liberar PUT/GET | Mais codigo nos dois lados; tratar conexao e reconexao | Alternativa |
| PROFINET I-Device | Ciclico, dado consistente, vigia nativo com valor seguro na queda | Depende do modelo e firmware da CPU do banco; mexe na configuracao de hardware | **Candidato a definitivo** (avaliar) |
| OPC UA / Modbus TCP | Padrao aberto | Latencia e complexidade sem ganho aqui | Fora |
Volume: sao bits de ate 16 chaves por banco (PUT 10 bytes, GET 14 bytes); nao e o volume que decide. Decidem: consistencia, seguranca do PUT/GET e o que acontece na queda.
Falta: **modelo e firmware da CPU do Banco de Carga** (hoje o ET200 IM151-8, familia S7-300; o definitivo e S7-1200). Por isso o desenho abaixo **vale para qualquer transporte**: so muda quem copia os bytes.

## A1 - Desenho: um dono por campo, pedido/resposta
DB do PLC do banco (ComBC56/DB38 e ComBC400/DB39), versao 0.4, 24 bytes. **Nunca se espelha o DB inteiro nos dois sentidos.**
| Bytes | Dono | Campos |
|---|---|---|
| DBB0..9 PEDIDO (PUT, 1515 escreve) | 1515 | `cmd[1..16]` X0.0, `vida1515` W2, `ligarBanco` X4.0, `habPed[1..16]` X6.0, `seq` W8 |
| DBB10..23 RESPOSTA (GET, ET200 escreve) | ET200 | `fbk[1..16]` X10.0, `vidaET` W12, `seletoraAuto` X14.0, `habResp[1..16]` X16.0, `eco` W18, `falhaRetorno[1..16]` X20.0, `contatorColado[1..16]` X22.0 |
No 1515 (db3000/db3100 v0.3): acrescenta `sbRet` no fim (X464.0 `habResp`, X466.0 `falhaRetorno`, X468.0 `contatorColado`, X470.0 `respEcoOk`). Nenhum offset existente muda. **Conferir os deslocamentos no TIA.**

## A1 - Regra (T = 2 s, decidida pelo Reginaldo)
Por chave, no PLC do banco (`fb_supervisaoChaves16`):
1. Saida energizada e retorno (SB) em 0 por T -> `falhaRetorno` TRAVADA, `Permite=0`. Vale tambem para chave que estava ligada e perdeu o retorno.
2. Saida em 0 e retorno em 1 por T -> `contatorColado` TRAVADO, `Permite=0` (derrubar o CB nao resolve: e falha).
3. Rearme **so por novo comando** (borda de subida do CB com retorno em 0). O retorno voltar sozinho nunca rearma.
4. Habilitar/desabilitar: `habResp` = copia de `habPed`; chave desabilitada nao energiza. O 1515 so confirma se o `eco` acompanha o `seq` (resposta fresca).
No 1515 (`fb101_ComEt200` v0.8): ao receber falha, o CB da chave **cai** depois de `CiclosGraca` (3) ciclos de PUT/GET. A espera existe porque o rearme depende de o ET200 ver a borda do novo comando; zerar o CB na hora travaria a chave para sempre (o teste do modelo achou isso).
Tempo: contagem em ticks de 100 ms (precisao +100 ms): com T = 2 s a falha sai entre 2,0 e 2,1 s.

## Arquivos novos
- `plc/bt2/comunicacao_et200/fb_supervisaoChaves16_v0.1.scl` (PLC do banco)
- `plc/bt2/comunicacao_et200/db38_db39_ComEt200_v0.4.scl` (DB remoto 24 bytes)
- `plc/bt2/comunicacao_et200/fb101_ComEt200_v0.8.scl` (1515)
- `plc/bt2/bancos_cargas/db3000_BC56_Chaves_v0.3.db`, `db3100_BC400_Chaves_v0.3.db`, `chamadas_BC56_v0.3.scl`, `chamadas_BC400_v0.3.scl`
- `tests/plc_modelo/` (modelo em JS da logica e 14 vetores)

## Como integrar no ET200 (voce, no TIA)
1. **Driver das saidas** (o FC4 atual, que nao esta no repositorio; ou `fb_bancoEt200_16`): trocar a saida por `Saida[i] := Cmd[i] AND Permite[i] AND (a logica que ja existe)`.
2. Chamar `fb_supervisaoChaves16` 1x por ciclo, **antes** do driver: `ComOk` do vigia de vida do ET200, `Seq := ComBC56.seq`, `Cmd := ComBC56.cmd`, `HabPed := ComBC56.habPed`, `SaidaQ` = imagem das saidas, `AuxIn` = entradas dos contatos auxiliares, e as saidas gravando em `ComBC56.habResp/eco/falhaRetorno/contatorColado`.
3. O `fc_chamadasBancos_BT2` (que ja chama o FB101) precisa dos parametros novos: copiar de `chamadas_BC56_v0.3.scl`.

## Ordem de carga (os dois PLCs juntos; backup do TIA antes; OK explicito antes)
1. Backup do TIA (1515 e ET200). 2. ET200: DB38/DB39 v0.4, FB de supervisao, driver alterado. 3. 1515: DBs v0.3 (snapshot para valor inicial), FB101 v0.8 e as chamadas. 4. Carregar os dois na mesma janela. 5. Fluxos novos (Portao A2) logo depois.
**Rollback:** recarregar o backup. Com FB101 v0.7 e DB v0.3 antigos o telegrama de 6+6 bytes volta a fechar.

## O que este rascunho prova e o que nao prova
- Provado (modelo em JS, 14 vetores): falha em 2,0 a 2,2 s; nao religa quando o retorno volta; rearme so por novo comando; contator colado; oscilacao curta sem falha; habilitar com eco; queda de comunicacao. Mutantes (sem latch; sem a regra) fazem os testes falharem.
- NAO provado: o SCL compilado, S7-300 x S7-1200, tempo real do contator, comportamento do PUT/GET. **Bancada, com carga de potencia DESACOPLADA.**
- Checklist de bancada sugerido: (B1) SB bloqueado -> falha em ~2 s e CB cai; (B2) liberar o SB -> a chave NAO liga; (B3) novo clique -> liga; (B4) contator colado simulado; (B5) desabilitar chave -> `habResp` cai; (B6) cabo de rede fora -> saidas caem e a falha trava; (B7) volta da rede sem religar.

## Pendente deste portao
A2 (fluxos `chaves-56/400 v3.5` lendo `sbRet`; achados F4-2, F4-1, F2-1, P3-E1), A3 (medidor: `CHV-007`, `CHV-008`, troubleshooter), teste de integracao dos fluxos. Dependem do OK deste desenho (nomes e offsets de `sbRet`).
