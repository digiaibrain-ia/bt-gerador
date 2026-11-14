# Migração BT2 — plano v0.1 (03/11/2026)

> Substitui os planos de migração anteriores (`ANALISE_4_BANCOS_VISUAL_PLC_v0.1/v0.2`), que ficam só como histórico.
> Este documento é um PLANO para aprovação. Nada do que está nas fases 2 a 6 foi feito.

## 1. Ponto de partida (congelado em 03/11/2026)

| Item | Estado |
|---|---|
| Medidor | **1.10.154** — rodando no PC do BT2 (`http://[IP_PC_BT2]:1880/html/`), 4 bancos funcionando no **Demo local** |
| Backup da etapa de 2 bancos | branch `backup/etapa-bc56-bc400` (commit `fd3a81b`) |
| Backup da etapa 1.10.154 | branch `backup/medidor-1.10.154` |
| Pacote de entrega | `dashboard/pacotes/bt2-1.10.154/` (html + PUBLICAR.md) |
| Fluxos no PC | chaves BC56/BC400 **v2.6** e servidor DSE **v3_6** importados e testados em Demo + PLC. Registro do ensaio v1.4: conferir |
| Repositório | organizado por BT (`plc/bt2`, `nodered/flows/bt2`, `docs/bt2`…) |

**Confirmado:** o PLC 1515 comanda BC56 e BC400 pelo FB101 (PUT/GET com o ET200). BC59,5 e BC550 **não têm** rota no Node-RED nem DB no PLC.
**Assumido (a confirmar):** que os 4 bancos serão comandados pela mesma 1200 (decisão de 29/10 e 01/11); tensões 220/380/440 V para BC59,5 e BC550.

## 2. O que a migração faz

Levar BC59,5 e BC550 de "bancos de simulação" (`semPlc`) para bancos reais, e preparar a numeração e a competência entre BT1 e BT2, sem derrubar o que já roda (BC56 e BC400).

## 3. Fases e ordem (proposta)

| Fase | O quê | Quem | Depende de |
|---|---|---|---|
| 0 | Congelar versão e backups | feito | — |
| 1 | **Inventário do PLC 1515**: exportar OB1, FC100, DB52, DB20 do TIA como fonte externa | você (TIA) | acesso ao TIA |
| 2 | **Decisões de projeto** (seção 4) | você | — |
| 3 | **PLC**: DBs e instâncias para BC59,5 e BC550 (`cb/sb/setup`, FB100/FB101), no mesmo padrão do BC56/BC400 | eu escrevo, você importa e testa | fases 1 e 2 |
| 4 | **Node-RED**: fluxos `/api/chaves/{id}` para os dois bancos novos (parametrizar em vez de copiar o fluxo) | eu | fase 3 |
| 5 | **HTML**: tirar `semPlc`; trocar os 29 literais `'56'`/`'400'` por lista de bancos (dados), para um 5º banco não exigir mexer no código | eu | fases 2 e 4 |
| 6 | **Testes**: Demo + PLC por banco, com o banco desligado e a seletora em Manual; depois ensaio real | você + eu | fases 3 a 5 |
| 7 | **Numeração v4** (faixas 3000+) e DB de competência BT1/BT2 | decisão sua | fase 2 |

Cada fase gera arquivos novos com versão (nada é sobrescrito), commit e pacote para o PC.

## 4. Decisões pendentes (preciso de resposta)

1. **Numeração:** manter a atual (DB150, DB158, DB154…) ou migrar para a faixa v4 (BC56 = DB3000…). Recomendo **manter a atual para BC56/BC400 e criar BC59,5/BC550 já na faixa nova**? Isso mistura dois padrões. Alternativa: só migrar tudo junto, depois que os 4 bancos funcionarem. Sua escolha.
2. **Ficha dos bancos novos:** quantidade e kW de cada chave (ordem física), tensões atendidas (220/380/440) e se cada banco tem ET200 próprio ou entra na 1200.
3. **Competência BT1/BT2** (DBs 500–599 do plano v4): entra agora ou depois dos 4 bancos funcionarem? Recomendo **depois**: é independente e aumenta o risco.
4. **Ordem BT2 primeiro, BT1 depois** (decisão de 01/11): continua valendo?

## 5. Riscos conhecidos

- **Segurança:** o comando de chaves e a guarda de capacidade existem no PLC (FB101) e no HTML. A migração não pode enfraquecer essas travas. Toda fase de PLC é testada com os bancos **desligados** primeiro.
- **Dois padrões de numeração** no mesmo PLC confundem manutenção.
- **Fluxos copiados por banco** (hoje `chaves-56` e `chaves-400`) dobram o trabalho a cada banco novo — por isso a fase 4 propõe parametrizar.
- **Registro do ensaio v1.4:** o 🧪 Cards x flow ainda acusava "flow antigo" no PC em 02/11.

## 6. O que preciso agora (em ordem)

1. Exportar do TIA: `OB1`, `FC100 fc100_cardBancoCargas_BT2`, `DB52 db52_BancoTeste2_DSE`, `DB20 db20_exemploStruct`.
2. Respostas das decisões 1 a 4 da seção 4.
3. Ficha dos bancos novos (item 2 da seção 4).

Com isso eu começo a fase 3.
