# Checklist — Validação do Ensaio Manual BT2 (v6 — 23/10/2026)

**Versões:** HTML `medidor_gerador_v1.9.66.html` · flows **`chaves-56-api-v2.3.json`**, **`chaves-400-api-v2.3.json`** e `registro-ensaio-db53-api-v1.4.json`.
**Substitui a v5.** Novidades da v6: **um só Servidor** (no botão Demo) e **três modos** — Real / Demo local / Demo + PLC —, Demo travado com DSE real, desligamento automático do Demo e condição segura a cada troca (seção 1B); removidos os vários "⚙ Servidor" e o "Forçar salvar". Da v5 (mantida): vigia que zera `cbLigar` quando a tela some (seção 1A). Da v4 (mantidas): flow do registro com rotas `/api/ensaio/*`; triângulo e janela **Mensagens e falhas**; popup Dados maior; nome sugerido ao imprimir.
**Regra do ensaio:** `claude/REGRAS_ENSAIO_MANUAL_BT2.md`. **Prioridade:** ensaio MANUAL do BT2 (sem ensaio automático).

---

## 0. Instalação (uma vez)
- [ ] Node-RED: **apagar TODAS** as abas antigas "Chaves BC56 (API)" e "Chaves BC400 (API)" (v2, v2.1 e v2.2). Aba antiga duplicada responde no lugar da nova e o log fica vazio.
- [ ] Node-RED: **apagar a(s) aba(s) "Selecao do ensaio (manual/auto)"** — as duas cópias (`selecao-ensaio-v1.3` e `_2`) são o mesmo flow; com elas ativas o HTML v1.9.64 recebe 404 nas rotas novas.
- [ ] Importar `chaves-56-api-v2.3.json`, `chaves-400-api-v2.3.json` e `registro-ensaio-db53-api-v1.4.json` → **Deploy**.
- [ ] No navegador: `GET <URL>/api/ensaio/modo` → `"flow":"registro-ensaio-v1.4"`.
- [ ] Abrir `medidor_gerador_v1.9.66.html` → botão **v1.9.66** (topo) confere a versão.
- [ ] Se o HTML **for servido pelo próprio Node-RED** (http://…): não precisa configurar nada — vale o mesmo endereço da página (o popup mostra "Padrão: …"). Se for aberto **como arquivo** (file://) ou o Node-RED do PLC estiver em **outro endereço**: botão **Demo** (topo, senha) → campo **Servidor** → URL completa `http://…:1880`; o Node-RED precisa permitir CORS (`httpNodeCors` no `settings.js`). A URL vale para chaves **e** registro do ensaio; a URL antiga já salva é aproveitada na 1ª abertura.
- [ ] Conferir o modo: o botão **Demo** do topo deve estar **neutro, escrito "Demo"** (= MODO REAL: DSE real, chaves e registro no PLC). Se estiver "DEMO local" ou "DEMO + PLC", está simulando. A URL do Servidor **não** é a URL do DSE do campo "API" do topo.

## 1. Verificação rápida (2 min, sem carga)
- [ ] Card **Modo**: bolinha **PLC verde "leitura ok"** (passe o mouse: BC56 e BC400 devem aparecer com "leitura ok", **sem** "flow ANTIGO").
  - Cinza "sem leitura" = o Node-RED está de pé mas não lê o PLC (rede/endpoint/PLC). A mensagem exata está no tooltip e no chip do popup Chaves.
- [ ] Cada banco na tela principal mostra "**N kW ligados**" (e **não** "sem leitura do PLC").
- [ ] **Logs** (topo): abre; escolha BC56 e BC400 → sem faixa vermelha. A janela é arrastável pelo título. **Imprimir / PDF** sugere o nome `log_chaves_BC56_REAL_aaaaMMdd_HHmmss`.
- [ ] **Mensagens e falhas** (botão amarelo do topo): sem ocorrência ativa = nenhum triângulo "!" nos cards e contador 0. Desligue o cabo/Node-RED de propósito: aparece o triângulo no card **Modo** (`COM-001`/`COM-002`) e o botão geral soma; ao religar vira "Normalizou".
- [ ] Passe o mouse nas bolinhas do card **Modo**: o balão **não pisca** e dá para ler.
- [ ] `GET <URL>/api/chaves/400` no navegador → `"banco":"400"` e `"flow":"chaves-v2.3"` (e idem 56).

## 1A. Vigia dos comandos (novo — SEM o fb101/PUT ligado e sem carga)
- [ ] Chip do PLC mostra "OK" (se mostrar "SEM vigia", o flow ainda é o v2.2).
- [ ] Ligar 2 chaves de cada banco pela tela → TIA: `cb.ligar` TRUE no DB150 e no DB158.
- [ ] **Fechar o navegador** e cronometrar: em ≈ 30 s os `cb.ligar` vão a FALSE nos dois bancos; log do banco mostra `ZERAR` com OK.
- [ ] Reabrir a tela (se possível em outro computador): nenhuma chave laranja; triângulo `CHV-004` no card Banco de Carga.
- [ ] Aba **minimizada/escondida > 6 min** com chaves ligadas: **não** pode cortar (valida o Web Worker no seu Chrome — não verificado fora do emulador).
- [ ] Reiniciar o Node-RED com `cb` TRUE e nenhuma tela aberta: ≈ 35 s depois zera.
- [ ] Cabo do PLC fora ≈ 40 s com `cb` TRUE: nada acontece; ao voltar, zera em poucos segundos.
- [ ] **Demo + PLC** (botão Demo → ① + "Usar o PLC real"): aparece `CHV-003`. Em **Demo local** não aparece e **nada** vai ao PLC.
- [ ] Tempo diferente de 30 s: Node-RED → aba da chave → Propriedades → variável de ambiente `WD_HTML_S`.
- Lacuna conhecida: Node-RED parado com `cb` TRUE **não** zera até existir o `fb102` (`PROTECAO_COMANDOS_PERSISTENTES_CB.md`).

## 1B. Modos, trava e condição segura (novo na v6 — pode ser feito sem carga)
- [ ] Abertura: botão **Demo** neutro; chip do PLC "OK"; `Leitura` do DSE vinda do gerador real (sem Demo).
- [ ] Botão **Demo** (senha) → popup "Demo e Servidor": faixa de estado diz **MODO REAL**; campo Servidor mostra o padrão.
- [ ] Com o **DSE real conectado** (leitura válida): ① aparece **desabilitado** com "🔒 Demo travado".
- [ ] Desconectar o DSE (cabo/Node-RED da telemetria) → destrava. Marcar ① → **Demo local**: botão "DEMO local" (âmbar); chip "Demo local: nada vai ao PLC"; **nenhum** GET/POST em `/api/chaves` ou `/api/ensaio` (aba Rede do navegador).
- [ ] Marcar "Usar o PLC real durante o Demo" → pede confirmação (**há algo ligado nos bancos? os contatores vão acionar**) → botão "DEMO + PLC" (vermelho) + `CHV-003`.
- [ ] Em Demo + PLC, ligar 1–2 chaves; **desmarcar** "Usar o PLC real" (ou desligar o Demo): TIA `cb.ligar` dos bancos vai a FALSE; janelas abertas (Mensagens, Chaves, Setup…) fecham; o popup Demo continua aberto.
- [ ] Deixar `cb.ligar` sobrando no TIA e entrar em Demo + PLC: ≈ 1–2 s depois da primeira leitura volta a FALSE.
- [ ] Com o Demo ligado, **ligar o DSE real** (telemetria voltando com leitura válida): em ≤ 5–7 s o Demo **desliga sozinho**, aparece `DSE-002` (card Leitura das grandezas), todas as janelas fecham, chaves desligadas no PLC, ensaio simulado em andamento é encerrado.
- [ ] Ensaio em andamento: ① e "Usar o PLC real" ficam travados ("pare o ensaio antes de trocar de modo").
- [ ] Abrir o HTML por **file://** sem URL: chip "PLC: informe a URL no botão Demo"; após informar, vira "OK".
- Atenção (não testável fora do campo): se existir um flow que **simule** `/api/gerador` no próprio Node-RED (ex.: `simulador-dse-demo-v3.json` ativo), a tela o vê como "DSE real" e **não** deixa ligar o Demo / desliga o Demo. Desative esse flow para usar o Demo.

## 2. Chaves — liga/desliga (tela principal)
Para **BC56** e depois **BC400**:
- [ ] Clicar 1 chave → **laranja** (comandada) → **verde** em ≈ 0,5–1 s (feedback `sb.ligada`).
- [ ] TIA: `db150…cb.ligar[n]` (BC56) / `db158…cb.ligar[n]` (BC400) = TRUE; `sb.ligada[n]` = TRUE.
- [ ] Clicar de novo → apaga. Ligar 2–3 chaves ao mesmo tempo (cliques seguidos) → todas confirmam.
- [ ] **Logs**: cada clique aparece com ≈ 450 ms e "OK". Se enviou comandos e o log está **vazio** → aba duplicada/antiga (aviso amarelo/vermelho na janela).
- [ ] Chave desabilitada (⚙ Chaves) não liga e a mensagem explica.

## 3. Setup (calibração, uma chave por vez)
Pré-condição: gerador operando (DSE real, ou Demo → "Ligar gerador (Demo)"); **sem ensaio em andamento** (Setup fica bloqueado).
- [ ] **🛠 Setup** → aba do banco → "kW sem carga" aparece sozinho (todas as chaves **desligadas**).
- [ ] Clicar numa chave do popup → "selecionada no PLC" (`chaveSel` = índice; só 1 por vez) → aguardar estabilizar.
- [ ] **Salvar esta chave** → TIA `setupOk[n]` = TRUE, `kwReal[n]` e `rMedidoOhm[n]` preenchidos pelo **FB100**; tabela do popup atualiza.
- [ ] Clicar de novo na chave → desmarca (`chaveSel` = 0). Só então trocar de banco.
- [ ] **Só Demo (HTML v1.9.69)** — com a chave selecionada no Setup: a fórmula "Cálculo do kW real" acompanha (kW ≈ nominal da chave, Ia/Ib/Ic ≠ 0) e o **potenciômetro da Simulação e o botão Auto ficam desabilitados** (tooltip explica). Mexer neles (ou fim de ensaio simulado) não pode zerar a chave. Desmarcar a chave ou fechar o Setup libera os controles. *(Bug da v1.9.68 e anteriores: a chave continuava "selecionada" na tela mas o simulador a apagava → fórmula congelada em 0,0.)*
- [ ] **(HTML v1.9.71, Demo)** O STOP do gerador desmarca a chave **imediatamente** (não espera o gerador simulado parar, ~10 s) e o chip "Gerador" do Setup fica vermelho na hora.
- [ ] **(HTML v1.9.70)** Com uma chave selecionada, apertar **STOP do gerador**: o quadrado deixa de ficar azul "SELECIONADA", aparece "desmarcada automaticamente (gerador parado)" e o "kW sem carga" volta a "aguardando" (não mantém o valor antigo). Religar o gerador (todas as chaves desligadas) → baseline reaparece e a fórmula volta a calcular.
- [ ] Repetir nas 13 chaves de cada banco; **usar kW real** (checkbox) só depois.

## 4. Ensaio manual (conforme `REGRAS_ENSAIO_MANUAL_BT2.md`)
- [ ] **INICIAR** → "Dados do ensaio" → confirmar (gerador operando: cronômetro já parte; senão fica ARMADO e pisca até o 2º clique).
- [ ] Ajustar carga com as chaves até ±3 pontos do alvo da etapa → **Salvar** da coluna da etapa (só libera dentro da tolerância e do tempo mínimo).
- [ ] Repetir as etapas; **PARAR ENSAIO** / **FINALIZAR** só por ação do operador.
- [ ] **Resultado** e PDF conferidos.
- Se **Salvar etapa** não responde: confira o modo no botão **Demo**. Em **Demo local** o registro é simulado (fica só no navegador, relatório marcado como simulação); em **Demo + PLC** e no **modo real** grava no Node-RED/PLC. Não existe mais "Forçar salvar": para gravar no PLC é preciso o PLC ativo.

- [ ] **Salvar dados** (popup Dados, ensaio guiado): chip "Preenchimento" fica verde; TIA `db53…preenchValido` = TRUE e `serie` preenchido. Se aparecer `COM-003`/`ENS-001`: ler o texto na janela Mensagens e falhas (rota 404 = flow antigo; "Failed to fetch"/"file://" = URL/CORS).

## 5. Falhas — o que olhar
| Sintoma | Causa provável | Onde ver |
|---|---|---|
| PLC cinza "sem leitura", Node-RED verde | CPU/rede do PLC, endpoint S7 (IP/rack/slot), PLC em STOP | Tooltip PLC; HTTP 503 no chip do popup Chaves |
| Banco "sem leitura do PLC" e tiles apagados | Esse banco sem leitura há > 5 s (flow BC do banco, DB) | Tooltip; Logs |
| Comando bloqueado na tela ("Sem leitura do PLC …") | O HTML não envia comando sem leitura (segurança) | Mensagem na tela |
| Log vazio com comandos enviados | Aba duplicada/antiga, ou Deploy zerou o log | Aviso na janela Logs |
| "flow ANTIGO" | Flow v2/v2.1 respondendo | Tooltip PLC; Logs |
| Bolinha cinza "perdeu a conexão" | Havia leitura e parou (cabo, Node-RED, PLC em STOP) | Triângulo do card Modo → `COM-001`/`COM-002` |
| "Não conectado" desde a abertura | Nunca houve leitura: URL do Servidor (botão Demo), Node-RED desligado, ou Demo local ligado | Janela Mensagens e falhas (após 8 s) |
| Salvar dados: HTTP 404 | Aba antiga "Selecao do ensaio" ainda no Node-RED, ou flow v1.4 não importado | `COM-003` |
| Laranja que não vira verde | Comando foi, **feedback** `sb.ligada` não voltou (I/O, ET200, FC100 loopback) | TIA |

## 6. Troca de sinais 1515 ⇄ ET200
Procedimento e SCL em `claude/PASSO_A_PASSO_PUT_GET_1515_ET200_v3.md` (blocos **aprovados** FB101/DB155/DB163; faltam Q1 parcial, Q5, Q6, Q7). Registre cada bloco criado na aba **Blocos_novos** do `PLANO_NUMERACAO_BLOCOS_PLC_v3.xlsx`. Ao ligar o `fb101`, **desligar o loopback do FC100**.

## 7. Em aberto
- Heartbeat do PLC: DB58 **aprovado** (`claude/ESPECIFICACAO_DB58_MODO_HEARTBEAT.md` v0.2); falta criar o DB no PLC → depois o flow "Modo (API)".
- `comOk` PLC↔ET200 exposto ao Node-RED (flow v2.3).
- ~~Migrar `/ensaio/*`~~ feito (v1.4 + HTML v1.9.64). O modo manual/auto ainda mora no flow do Registro (decisão: mover para o flow Modo?).
- Falhas do PLC nas Mensagens e falhas (família `PLC`) — depois de conectar os PLCs.
- **Não testado em hardware real** nesta versão: s7 in/out reais, feedback do ET200, diálogo de impressão do Chrome (testei só que o título/nome sugerido é definido), desempenho com DSE real, CORS do seu Node-RED.
