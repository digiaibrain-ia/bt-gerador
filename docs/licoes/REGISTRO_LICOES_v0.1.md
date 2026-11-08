# Registro de Lições Aprendidas — BT2 (v0.1, 08/11/2026)

**Para que serve (leigo):** cada erro que já custou tempo vira uma regra curta e, sempre que der, um teste. Assim o mesmo erro não volta.
**Como usar:** antes de mexer em Node-RED, PLC, HTML ou teste, ler as lições do assunto (as skills `bt2-licoes-*` carregam só o assunto certo). Depois de cada rodada de teste ou bancada, acrescentar as lições novas no fim.
**Formato de cada lição:** sintoma → causa raiz → correção → como detectar → regra. Descreve o **sistema** ("o sistema permitiu X"), nunca culpa pessoas.
**Status:** `FECHADA` (corrigida e com teste/evidência), `ABERTA` (sem correção), `A CONFIRMAR` (falta dado da bancada ou do Reginaldo).
**Fontes:** `BACKLOG_FORA_DE_ESCOPO.md`, `docs/bt2/fase3`, `docs/bt2/fase4`, relatórios em `tests/integracao/revisao/resultados/` e as conversas desta revisão. Nada aqui foi inventado: onde falta detalhe está marcado.

## PLC / segurança de comando
| ID | Sintoma | Causa raiz | Correção / evidência | Como detectar | Regra | Status |
|---|---|---|---|---|---|---|
| LL-001 | Com o SB bloqueado o CB ficou em 1; ao voltar o SB a chave **ligou sozinha** (BANC-2, bancada 06/11) | Nada derrubava o comando quando o retorno sumia | SB some → CB cai, T = 2 s, falha travada, rearme só por novo comando (fluxos chaves v3.5; `fb_supervisaoChaves16`, rascunho não compilado) · `fase4/a2_sbret.test.js` | Teste de retorno bloqueado; checklist de bancada | **O intertravamento de segurança mora no PLC do banco, nunca só no HTML ou no fluxo.** | FECHADA no simulador; **bancada A CONFIRMAR** |
| LL-002 | Chave ligada com o ventilador do banco desligado (BANC-1) | Não existe sinal do ventilador | — | — | Antes de liberar carga, o projeto precisa saber o estado do ventilador | ABERTA (decisão de projeto) |

## Node-RED (fila, corrida, idempotência)
| ID | Sintoma | Causa raiz | Correção / evidência | Como detectar | Regra | Status |
|---|---|---|---|---|---|---|
| LL-010 | Desligar banco não passava na fila; um "Ligar banco" antigo executava depois (P3-A1/A3) | Fila serial sem prioridade nem expurgo | Expurgo dos pendentes (409 `CANCELADO_POR_DESLIGAR`), prioridade do desligar · `c3_etapa4a` | Teste com dois comandos simultâneos | **Comando de segurança fura a fila e cancela o que ficou para trás.** | FECHADA |
| LL-011 | Comando validado antes e executado depois de mudar o estado (P3-A2) | Validação só na entrada da fila | Revalidação na saída (409 `ESTADO_MUDOU`) | idem | Validar de novo **na hora de executar**, não só ao receber | FECHADA |
| LL-012 | Falso 500 com a escrita aplicada depois (P3-A4); escrita antiga atrasada passava na frente da nova (P3-A5) | Resposta dada antes da confirmação; sem ordem por variável | Janela de confirmação 2 s (504 `incerto:true`), quarentena por variável, reafirmação dos comandos de segurança · `c4_etapa4b` | Estresse com escrita tardia | Resposta "incerta" é honesta; comando de segurança é reafirmado | FECHADA |
| LL-013 | `preenchValido=TRUE` gravado antes dos dados (P3-B1) | Gravação em uma fase só | Duas fases (dados, depois validade) · registro v1.8 | `c5_etapa4c` | Marca de "válido" só **depois** de os dados estarem lá | FECHADA |
| LL-014 | Lote de log antigo descartado como duplicado (P3-C1); cursor adiantado sem sinal (P3-C2) | Dedup por posição | Dedup por conjunto; `cursorAdiante` e `reiniciado` · dev-logs v1.3 | `c5_etapa4c` | Idempotência por identidade do lote, não por ordem | FECHADA |
| LL-015 | Teste de correção só vale se **falhar na versão anterior** | — | Verificação por mutação (Fase 3): todos falham nas versões antigas e passam nas novas | Rodar o teste novo contra a versão velha | **Todo teste de correção precisa falhar na versão que tinha o erro.** | FECHADA (prática) |
| LL-016 | Com o PLC sem leitura a fila não falha rápido; o front desiste aos 10 s e o comando executa depois (P3-E1) | Vigia de 8 s por comando | — (`todo`) | `f6`/Fase 3 etapa 5 | O front não pode desistir de um comando que o servidor ainda vai executar sem avisar | **ABERTA** |
| LL-017 | `limpar` do registro (42 variáveis) dá falso 500 se a escrita demorar (P3-E2) | Sem janela de confirmação (confere uma vez em 1,5 s) | — (`todo`) | Fase 3 etapa 5 | Operação longa precisa de janela de confirmação | **ABERTA** |
| LL-018 | JSON malformado volta 500 em vez de 400 (F2-1) | O nó `http in` responde 500 fixo | Não corrigível no fluxo; só com `httpNodeMiddleware` no `settings.js` (não tocamos) | `todo` F2-1 | Registrar limite do Node-RED em vez de forçar | ABERTA (limite da plataforma) |

## HTML / medidor
| ID | Sintoma | Causa raiz | Correção / evidência | Como detectar | Regra | Status |
|---|---|---|---|---|---|---|
| LL-020 | Janela arrastada saía da tela; o ✕ ficava inalcançável | Limite do arrasto deixava só 120 px dentro | Janela inteira na tela + guarda ao mudar tamanho/zoom (1.10.176) | `revisao.js` (mouse e toque reais) | **Janela sempre inteira na tela; título e ✕ nunca fora.** | FECHADA |
| LL-021 | ✕ da Central não fechava | ✕ ligado só no carregamento; diálogo criado depois não recebia | Diálogo passou para o HTML estático (1.10.174) | `fase4/g_janelas_fecha_move` | Todo diálogo novo liga seu próprio ✕ | FECHADA |
| LL-022 | Menu do botão direito abria fora da tela em monitor largo | `<body>` com zoom 1,5×/2× (≥ 2400 px) e `left/top` sem dividir pelo zoom | Posição divide pelo zoom (1.10.177) | Relatório do robô no note com zoom 50 % | Elemento posicionado dentro de `body` com `zoom` precisa compensar o zoom | FECHADA |
| LL-023 | "Copiado!" sem copiar; colou um Pix antigo | Campo temporário criado no `<body>`, inerte com popup modal aberto | Campo dentro do diálogo, texto na tela, Compartilhar (1.10.181) | Teste que lê a área de transferência | **Nunca dizer "copiado" sem poder provar; fallback dentro do modal.** | FECHADA |
| LL-024 | Erro `SecurityError` ao ler `localStorage` (arquivo aberto de Downloads / WebView) | Leitura de storage sem proteção | Armazenamento em memória quando bloqueado (1.10.188) | Relatório do Monkey no Poco | **Todo acesso a storage em try/catch; a tela funciona sem storage.** | FECHADA |
| LL-025 | A página recarregava no meio do teste | Caixa `chkPlcNovos` faz `location.reload()` | Caixa de areia bloqueia o toque (1.10.185) | Monkey no celular (o desktop mostrava aviso de saída e escondia o problema) | Controle que recarrega a página não entra em teste automático | FECHADA |
| LL-026 | Dica Alt+I nascia ligada no celular, sem como desligar | Preferência guardada no navegador, ligada por um teste; recurso de PC | Não vale em toque; caixa só no PC; `?ui=0` (1.10.184/186) | Poco | **Recurso que precisa de teclado não vale em aparelho de toque.** | FECHADA |
| LL-027 | Faixa de erro vazia e rodapé fixo cobriam campos | Elemento com altura mínima sobre o campo | `.jerr:empty` some, sem captura de clique (1.10.176) | Harness: "coberto por outro elemento" | Elemento vazio não ocupa lugar nem captura clique | FECHADA (REV-1 aberto: rodapé após o painel ⤢) |
| LL-028 | Botões e caixas de marcar pequenos no celular (13–22 px) | Layout pensado para mouse | Mínimo de toque só em `pointer:coarse` (1.10.176) | Harness: alvo de toque | Tamanho de toque é decisão de layout; 44 px **não aplicado** (decisão do Reginaldo) | FECHADA em parte |
| LL-029 | Arquivo aberto de Downloads (`content://`) dá `ERR_FILE_NOT_FOUND` ao recarregar | O Android perde a permissão de acesso; abas descartadas por memória | Relatório fica em tela/Copiar/Compartilhar/Baixar; servir pelo Node-RED recarrega sem erro | Relato do celular | Para teste longo no celular, preferir página servida pelo Node-RED | **A CONFIRMAR** (hipótese) |

## Teste e robô (Dev/Operador oculto)
| ID | Sintoma | Causa raiz | Correção / evidência | Como detectar | Regra | Status |
|---|---|---|---|---|---|---|
| LL-030 | O robô parava sozinho | O Esc sintético dele contava como "Parar" | Só tecla real (`isTrusted`) para (1.10.175) | Robô encerrava em 1 s | Evento criado pelo teste nunca vale como ação do operador | FECHADA |
| LL-031 | Ensaio do robô quebrava depois da varredura | A varredura deixou "Por patamar" ligado e o Guiado armado | Robô guarda e devolve configuração e salvamento (1.10.175/180) | Poco (8 falhas iguais) | **O robô devolve toda preferência que mexer** (salvamento, Guiado, Dica…) | FECHADA |
| LL-032 | O robô abria o Simulador de amostras, que baixava `amostras_sim_*` | A caixa de areia não bloqueava link `target=_blank` | Bloqueia todo link que sai da página, vale em todos os modos; impressão automática suspensa (1.10.189) | Tablet | Caixa de areia total: nada abre, baixa ou imprime sozinho | FECHADA |
| LL-033 | "Alvo 30 kW" nos 4 chips do Patamar | O robô guardava a lista de chips; o 1º clique redesenha o card e o resto virava elemento solto | Busca o chip a cada volta e confere o alvo (1.10.190) | Relatório do Poco | **Lista de elementos guardada antes de redesenhar fica obsoleta; buscar de novo.** | FECHADA (o card estava certo) |
| LL-034 | O botão Parar do balão não recebia toque com popup modal aberto | Tudo fora do modal fica inerte; `elementFromPoint` também engana | Balão passa para dentro do modal aberto (1.10.183) | Teste com `showModal()` no meio do Monkey | Controle de emergência precisa estar **dentro** do modal aberto | FECHADA |
| LL-035 | O balão sumia sem dizer se o teste acabou | Barra escondia no fim; relatório só em memória | Barra fica "concluído/interrompido"; relatório salvo no navegador e em `window.name`; botões Relatório/Copiar/Baixar | Poco | Todo teste automático tem fim visível e relatório recuperável | FECHADA |
| LL-036 | Achado "coberto por outro elemento" em massa | Objetos dentro de `<details>` fechado mantêm a caixa; popups esquecidos | Ignorar `<details>` fechado; fechar popups sobrando | Revisão desktop/Poco | Falso positivo também é defeito do teste: registrar e corrigir o teste | FECHADA |

## Método
| ID | Sintoma | Causa raiz | Correção / evidência | Como detectar | Regra | Status |
|---|---|---|---|---|---|---|
| LL-040 | **Setup: "Salvar" não funcionava** na bancada (relato do Reginaldo) | Condição do **Demo diferente da real** | *Detalhes da condição exata: A CONFIRMAR com o Reginaldo* | Só na bancada | **Toda bifurcação Demo × Real é inventariada e tem teste com o PLC simulado** (ver `INVENTARIO_DEMO_X_REAL_v0.1.md`) | A CONFIRMAR |
| LL-041 | O robô no Demo local aprova o que a bancada reprova | Demo local não passa por Node-RED nem PLC | Rodar o robô também contra o Node-RED + PLC simulado dos testes | — | Separar sempre: provado no simulador × depende da bancada | ABERTA (próximo passo) |
| LL-042 | (regra do projeto, `CLAUDE.md`) mudança em arquivo de produção sem rastro | — | Mudança vai para **versão nova**, gerada por script em `dashboard/gerador` ou `nodered/gerador`, nunca sobrescrevendo a anterior; teste que falha vira `todo` com ID e gravidade; relatório diz o que foi provado e o que depende da bancada | Revisão de commits | Versão nova + script + teste + relatório honesto | FECHADA (prática) |
