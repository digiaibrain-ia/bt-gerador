# Checklist de validação de bancada — v0.6 (10/11/2026)

Substitui a v0.5 (e anteriores). **Só existem BC56 e BC400; os testes com gerador ligado são só neles.** **Carga de potência DESACOPLADA** (disjuntores/contatores de potência abertos, sinalização de segurança ativa) em TODOS os blocos. Preencha "Resultado" e devolva. Engenharia conduz tempos/regras/segurança; TI conduz instalação, rede e logs; qualquer um interrompe o teste.
Dados: data ____ / Engenharia ____ / TI ____ / versão do Node-RED ____ / `node-red-contrib-s7` ____ / medidor 1.10.192.

## 0. Pré-condições
| # | Item | Resultado |
|---|---|---|
| 0.1 | Backup feito (TIA, fluxos, `settings.js`, `flows_cred.json`, `public/html`) e restauração listada | |
| 0.2 | `sha256sum -c MANIFESTO.sha256` sem erro | |
| 0.3 | `PLC_IP` e `DSE_URL` no PM2 e Node-RED reiniciado | |
| 0.4 | `adminAuth` ativo; porta só na rede da planta | |
| 0.5 | **Não existe** a aba "Simulador DSE (Demo)" no editor | |
| 0.6 | **Carga de potência DESACOPLADA**, conferido por (nome) ____ | |
| 0.7 | Estado seguro conhecido (banco desligado fora do Node-RED; seletora em Manual) | |

## 1. Importação (uma aba por vez; conferir antes da próxima)
| # | Aba | Conferência | Resultado |
|---|---|---|---|
| 1.1 | chaves-56 v3.5 | `GET /api/chaves/56` = 200; traz `habResp`, `falhaRetorno`, `contatorColado`, `respEcoOk` | |
| 1.2 | chaves-400 v3.5 | `GET /api/chaves/400` = 200 | |
| 1.3 | registro-ensaio v1.8 | `GET /api/ensaio/snap` = 200 | |
| 1.4 | dev-logs v1.3 | `GET /api/dev/logs` = 200 | |
| 1.5 | cliente-156 v3, cliente-31 v4, servidor v3_7 | `GET /api/gerador` responde | |
| 1.6 | chaves-550 v1.6 (**só se o banco existir**) | `GET /api/chaves/550` = 200 | |
| 1.7 | chaves-595 v1.6 (**só se o banco existir**) | `GET /api/chaves/595` = 200 | |
| 1.8 | medidor 1.10.192 + `catalogo_modelos_v0.1.csv` (`03_front_operacao`) | abre por `http://<servidor>:1880/html/...`; chip "PLC" = leitura ok; o catálogo de modelos carrega sozinho; o botão "Analisar" abre o gráfico | |

## 2. Medições (Engenharia)
| # | Medir | Resultado |
|---|---|---|
| 2.1 | Tempo real de uma escrita S7 e se o driver escreve em série ou em paralelo (decide `CONF_JANELA_MS`) | |
| 2.2 | "Desligar banco" do BC56/BC400 dentro da janela de 2 s? (BC595, se existir: 33 variáveis) | |
| 2.3 | Tempo do `limpar` do registro (42 variáveis) | |
| 2.4 | PLC mudo: tempo até o 503 do primeiro comando (P3-E1) | |

## 3. Regra "SB some → CB cai" (por banco; carga desacoplada)
| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 3.1 | Ligar uma chave com retorno normal | `ligada` = TRUE, sem falha | |
| 3.2 | Bloquear o retorno (SB) com a chave comandada | após ~2 s `falhaRetorno` = TRUE, CB cai (CHV-007) | |
| 3.3 | Liberar o SB depois | a chave **não** volta sozinha; só com novo comando | |
| 3.4 | Contator colado (SB = 1 sem comando) | `contatorColado` = TRUE, travado (CHV-008) | |
| 3.5 | Parar a vida do 1515 por mais de 2 s | saídas FALSE; religar só com novo comando | |
| 3.6 | Habilitar/desabilitar uma chave | `habResp` confirma; `respEcoOk` TRUE | |
| 3.7 | Repetir 3.1 a 3.6 em BC56 e BC400 (únicos bancos existentes) | iguais | |

## 4. PLC (Engenharia / programador)
| # | Item | Resultado |
|---|---|---|
| 4.1 | DBs renumerados conferidos (planilha v7) | |
| 4.2 | Telegrama: 16 chaves 10 + 14 B; 32 chaves 14 + 22 B; escritor único (PEDIDO só pelo PUT; RESPOSTA só pelo FB do banco) | |
| 4.3 | PLC de cargas 1200 (`fb_bancoCarga16` completo, DB3007/DB3107): compila; `PEEK`/`POKE` com DB dinâmico aceitos; `TON_TIME`; DBs não otimizados | |
| 4.4 | `ID_Conexao` S7 e conexões livres na CPU do banco; permissão PUT/GET | |
| 4.5 | `CbLigar` é zerado com o banco desligado (P3-A3); consumidores do DB2100 leem só com `preenchValido` = TRUE | |
| 4.7 | `fb100_setupChaves` v0.4: com `NumChaves` > 16 o PLC não vai a STOP (OB121); chave desabilitada ligada é desligada no mesmo ciclo; Salvar com kW real ≤ 0,05 grava `SetupOk` = FALSE e R = 0 (carga desacoplada) | |
| 4.6 | Ventilador sem monitoramento (BANC-1): risco aceito/registrado | |

## 5. Falhas e soak
| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 5.1 | Derrubar o PLC (ou desconectar) | tela "banco sem leitura"; nada liga | |
| 5.2 | Fechar a tela com banco ligado | vigia "HTML sumiu" desliga em ~30 s | |
| 5.3 | Reiniciar o Node-RED com banco ligado | estado seguro; sem religar sozinho | |
| 5.4 | Soak de 1 h com leitura contínua | sem erro e sem acúmulo de fila | |

## 6. Go / No-go e rollback
Go só com os blocos 0, 1, 3 e 4 sem falha. Ao menor comportamento inesperado: voltar à versão anterior (roteiro v0.9, seção 5). Decisão conjunta Engenharia + TI; **nada em produção sem o OK do Reginaldo**.
