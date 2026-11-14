# Estado da bancada em 14/11/2026 e próximos passos (2 semanas sem acesso à fábrica)

**Para que serve:** o Reginaldo fica ~2 semanas sem ir à fábrica; este é o ponto de retomada. Sem IP/senha (regra do projeto). Rascunho: nada foi compilado no TIA pela sessão; o que foi provado em bancada está marcado.

## 1. O que funcionou (provado em bancada, 14/11/2026)
- Node-RED **lê o PLC de Ensaio (1515)**: `/api/chaves/56` devolve `habilitada` com `idadeMs` baixo (leitura recente). Causas dos problemas anteriores: IP do ET200 usado no lugar do 1515; DB3000 antigo (menos de 471 bytes; v0.3 exigida); variável `PLC_IP` não chegava ao Node-RED (PM2 como serviço do Windows). Lições LL-054/LL-055.
- Fluxos organizados importados no editor (visual aprovado): chaves-56 v3.7 etc. (ver `PADRAO_FLUXOS_NODERED_v0.2.md`).

## 2. O que NÃO está provado / pendente
1. **ET200:** compilar o `fb_bancoEt200_16` v0.4 (corrige "Invalid parameter assignment") e o `fc_bancosEt200` v0.3 no TIA. Remover do FC4 as networks 31 e 32 (escrevem a resposta no DB). Testar só o BC56 primeiro; BC400 depois (DB39 ainda no layout antigo de 12 bytes).
2. **Comunicação 1515 ↔ ET200:** `vidaET` mudando em `db38_ComBC56`, `ComOk` TRUE no 1515, `StatusPut`/`StatusGet` = 0; medidor deixa de mostrar "sem comunicação ET200".
3. **DB3100 (BC400) v0.3** no 1515 (como o DB3000); DB3002/DB3102 (setup por tensão) com tamanho mínimo.
4. **PLC de Carga 1214FC:** entrega 1200 v0.16 (PUT do `fb104_putDseCarga`, DB2000 de 136 B) — nada testado.
5. **Variável `PLC_IP` pelo PM2** (`pm2 restart ... --update-env` + `pm2 save`, PowerShell no usuário do serviço); hoje os fluxos de teste têm IP fixo (arquivos fora do Git).
6. **Revisão da documentação** (DB2000 fica no 1515; ~40 documentos), junção das branches (RNC, medidor 1.10.205), chamadas do 1515 em formato copiável, pacote de implantação v1.12 já gerado.
7. Medidor ainda diz "sem comunicação ET200" nos chips (texto fixo); decidir se vira "PLC de Carga".

## 3. Teste em simulação (PLCSIM) — o que dá e o que não dá (a confirmar no TIA)
- O ET200 é **IM 151-8 (S7-300)**: o TIA **não simula** essa CPU no PLCSIM (PLCSIM do TIA simula S7-1200/1500). Logo o `fb_bancoEt200_16` v0.4 **não** roda "como ET200" no simulador.
- **Alternativa de adiantar:** importar os **mesmos fontes SCL** (db38/db39, fb_supervisaoChaves16, fb_bancoEt200_16, fc_bancosEt200) em um projeto **S7-1500 no PLCSIM** (o código usa `TON`, arrays e DBs tipados, válidos no 1500) e exercitar a lógica: vida, perda de comunicação (parar a vida do 1515 por mais de 2 s), religar só com novo comando, SB some → CB cai em 2 s, habilitar/desabilitar. Isso prova a **lógica**, não a compilação S7-300 nem a conexão S7 real.
- PUT/GET entre duas CPUs simuladas e o Node-RED ligado ao simulador exigem **PLCSIM Advanced** (ou ferramenta de ponte de rede); depende da licença e do adaptador virtual: **a confirmar** com o que o Reginaldo tem instalado.
- Para o 1515 e o 1214FC (S7-1500/1200) o PLCSIM serve diretamente para a lógica do `fb101`, `fb100` e do `fb_bancoCarga16` (este usa PEEK/POKE com DB_ANY, ainda **não provado** em nenhuma CPU).

## 4. Pacotes e versões vigentes (14/11/2026)
- Pacote de implantação **v1.12** (fluxos com "PLC de Ensaio (1515)" nos nomes; sem `cliente-31`); entrega **1200 v0.16**; entrega **ET200 v0.3** (FB v0.4, DB38/39 v0.5, FC v0.3); fluxo de teste `teste-s7-isolado-v0.1`; medidor 1.10.201 (as telas RNC e a 1.10.205 estão na outra branch).
