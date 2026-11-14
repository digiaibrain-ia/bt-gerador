# Equipamentos e CPUs do BT2 — v0.1 (14/11/2026)

Registro do que foi visto no TIA e na bancada. **Sem IP, senha ou token** (regra do projeto: endereços vêm de variável do processo). O que não foi visto está marcado "a confirmar".

| Equipamento | Modelo / família | Papel | Observações |
|---|---|---|---|
| **PLC de Ensaio** | S7-1500 **1515F** (modelo exato 6ES7 515-2FN03-0AB0 × 515-2FM02-0AB0: **a confirmar**) | Node-RED lê e grava aqui (DB3000, DB3100, DB3002, DB3102, DB2000, DB2100); cliente PUT/GET do PLC de Carga ou do ET200 | rack 0, slot 1; PUT/GET habilitado (confirmado pelo Reginaldo em 14/11) |
| **ET200 (provisório)** | **IM 151-8 PN/DP CPU** (família **S7-300**), visto no TIA em 14/11/2026 | Faz o papel do PLC de Carga **provisoriamente**; o Reginaldo testa | Projeto TIA `Geradores_BC015_20260414_2216`, programa `Gerador_BC015`; TIA Portal provavelmente **V17** (visto no ícone; confirmar) |
| **PLC de Carga** | S7-**1214FC** | Destino final: liga as contatoras dos bancos; programador do 1200 faz a tela (WinCC) | só existem BC56 e BC400 |

## ET200 IM 151-8 (S7-300): o que vale para os blocos SCL
- **Sem** `TON_TIME` (usar `TON`), **sem** atributo `S7_Optimized_Access`, **sem** `DB_ANY`/`PEEK`/`POKE` (acesso por DB tipado), **sem** `REGION` (usar banners de comentário), `NumChaves` limitado a 0..16.
- **Parâmetro IN_OUT de tipo ARRAY não pode ser repassado** a outro FB (multi-instância): erro "Invalid parameter assignment". Copiar para arrays **estáticos** do próprio FB antes da chamada (`fb_bancoEt200_16` v0.4). Ver LL-055.
- Ao mudar a interface de um FB, nas chamadas: botão direito > "Update block call".

## Blocos e nomes no projeto do ET200 (vistos em 14/11/2026)
- DBs de telegrama: **`db38_ComBC56`** (DB38) e **`db39_ComBC400`** (DB39), 24 bytes (layout novo substitui o de 12 bytes).
- `fb_bancoEt200_16` [FB2], `fc_bancosEt200` [FC5]; FC4 antigo `fc4TesteHTML...`, e os FCs "Saidas Digitais" e "Resistencias". `fc_vidaET` **não é mais usado** (o FB incrementa o `vidaET`).
- Tags físicos citados pelo Reginaldo (a confirmar): seletora do BC400 = `%I5.2` ("Banco de Carga 01 em Automatico"); seletora do BC56 = `%I5.3` ("Banco de Carga 02 em Automatico"); `%Q8.0` "Ligar Banco Carga 01" acionado por `db39_ComBC400.ligarBanco` (network 33 do FC4, que fica); retorno do BC56 = tags "Resistencia 16" a "Resistencia 28".
