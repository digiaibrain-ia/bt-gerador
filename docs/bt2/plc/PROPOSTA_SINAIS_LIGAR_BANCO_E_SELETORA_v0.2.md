# Sinais "Ligar banco" e "seletora Local/Remoto" (BC56 e BC400) · v0.2 · 24/10/2026

**Situação: DECIDIDO e GERADO (arquivos abaixo). Testado só em emulador (nrsim + emulação do FB101 + Playwright). Nada foi compilado no TIA nem carregado em hardware.**
Substitui a v0.1 (23/10/2026, que tinha as decisões em aberto).

## Decisões do usuário (24/10/2026)
| # | Pergunta | Decisão |
|---|---|---|
| D1 | Seletora em 1 ou 2 bits | **1 bit** (`seletoraAuto`: 1 = Auto/remoto). Fio solto lê Manual: lado seguro, sem aviso de defeito. |
| D2 | Onde entram os sinais | Delegado ("boas práticas"): **opção A** — 1 PUT + 1 GET de 6 bytes por banco. Limite da instrução ~212 bytes por chamada (fonte secundária; confirmar na documentação Siemens). |
| D3 | Nomes | **Padrão `cb`/`sb`.** Implementado como `cbBanco.ligar` e `sbBanco.seletoraAuto` (structs novos no **fim** do DB150/DB158). `cb.ligarBanco` dentro do struct `cb` deslocaria `sb` e `setup` e quebraria todos os endereços do Node-RED. |
| — | Sinais individuais por banco | Confirmado: cada banco tem o seu "Ligar banco" e a sua seletora (DB38 = BC56, DB39 = BC400). |

## (a) O que foi gerado
**ET200 ("Gerador_BC015")** — `plc_bancos_cargas/db38_db39_ComEt200_v0.2.scl`, 12 bytes por banco:

| Byte | Membro | Sentido |
|---|---|---|
| DBX0.0..1.7 | `cmd[1..16]` | PUT do 1515 |
| DBW2 | `vida1515` | PUT |
| DBX4.0 | `ligarBanco` | PUT |
| DBB5 | `resPut` (reserva) | PUT |
| DBX6.0..7.7 | `fbk[1..16]` | GET (FC4 escreve) |
| DBW8 | `vidaET` | GET |
| DBX10.0 | `seletoraAuto` | GET |
| DBB11 | `resGet` (reserva) | GET |

**1515** — `fb101_ComEt200_v0.4.scl` + `fb101_ComEt200_chamadas_v0.4.scl` (`P#DB38.DBX0.0 BYTE 6` / `P#DB38.DBX6.0 BYTE 6`; BC400 com DB39). Novo `VAR_IN_OUT LigarBanco`, novo `VAR_OUTPUT SeletoraAuto`; `ComOk` passa a ser gravado em `sbBanco.comEt200Ok`.
**REGION 0 (segurança no PLC):** `SeletoraAuto = ComOk AND rx.seletoraAuto`; se falso → `LigarBanco := FALSE`; se `LigarBanco` falso → `CbLigar[1..16] := FALSE` (inclui a chave do Setup). Nada religa sozinho quando a comunicação volta.

**DB150/DB158 v0.2** — `db150_BC56_Chaves_v0.2.db`, `db158_BC400_Chaves_v0.2.db`: `cbBanco.ligar` (X460.0), `sbBanco.seletoraAuto` (X462.0), `sbBanco.comEt200Ok` (X462.1).

**Node-RED** — `chaves-56-api-v2.4.json`, `chaves-400-api-v2.4.json` (rota nova `POST /api/chaves/{banco}/banco`; "Desligar banco" e o vigia furam a fila de gravações; ver `CONTRATO_HTTP_HTML_NODERED_CHAVES.md`, bloco v2.4).

**HTML** — `medidor_gerador_v1.9.77.html`: chip mostra a seletora física (Auto / Manual / "sem comunicação ET200"); botão envia `/banco`; "Desligar banco" sempre liberado; ocorrências `COM-005` (PLC sem comunicação com o ET200) e `CHV-005` (banco bloqueado pelo PLC).

## (b) Assumido / a confirmar
1. **Canal → DB do ET200 por nome** (BC56 → DB38, BC400 → DB39). Se a foto do ET200/FC4 mostrar o contrário, trocar só os literais `DB38`↔`DB39` nas chamadas.
2. **O que o `ligarBanco` aciona no ET200** (contator geral? só libera as saídas?) é do FC4 — você define. Requisito mínimo sugerido para o FC4: saída de cada chave = `cmd[i] AND ligarBanco AND seletoraAuto AND vida do 1515 mudando`.
3. Tipo `Remote` como parâmetro e PUT/GET multi-instância: mesmos pontos de atenção da v0.3 (não compilado aqui).
4. Ao passar a seletora para Manual, o PLC zera `cb.ligar[]`, mas **não** zera `setup.chaveSel`: após religar o banco, a chave do Setup precisa ser selecionada de novo.

## (c) O que falta (você, em campo)
1. **FC4 no ET200:** escrever `seletoraAuto` (DBX10.0) a partir da entrada da seletora, `vidaET` (DBW8) e `fbk[]` (DBX6.0..7.7) nos novos offsets; usar `ligarBanco` (DBX4.0).
2. **Ordem de carga:** (1) snapshot dos valores do DB150/DB158 → aplicar como valores iniciais → carregar v0.2 (o download reinicializa o DB); (2) DB38/DB39 v0.2 + FC4 no ET200 e FB101 v0.4 + chamadas no 1515 **juntos**; (3) flows v2.4 (apagar as abas v2.3); (4) HTML v1.9.77.
3. **Teste em bancada (gerador desligado):** seletora Auto/Manual; Ligar/Desligar banco; chave ligada + seletora para Manual (tem que abrir); cabo do ET200 desconectado (ComOk falso → banco desliga; ao voltar, nada religa); queda do Node-RED com banco ligado (vigia desliga após `WD_HTML_S`).
4. Tabela de observação no TIA: `db155.ComOk`, `.SeletoraAuto`, `.StatusPut`, `.StatusGet`, `db150.cbBanco.ligar`, `db150.sbBanco.*`.

---
**Fontes**: `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md`; `PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md`; flows `chaves-*-api-v2.3.json` (offsets do DB150/DB158); respostas do usuário de 24/10/2026 (D1 = 1 bit, D2 = boas práticas, D3 = cb/sb, sinais individuais).
