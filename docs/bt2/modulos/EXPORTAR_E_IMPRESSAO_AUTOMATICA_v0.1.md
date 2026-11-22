# EXPORTAR ▾ UNIFICADO + IMPRESSÃO AUTOMÁTICA — v0.1
Medidor v1.10.107 · gráfico v0.5 · mapa v0.7 · gerenciador v1.4 · amostras v0.5 · módulo `exportar_menu_v0.1.js` · 29/10/2026

## 1. Problema
- O menu "Exportar" abria ATRÁS das janelas (Grandezas, Motor, Log…): janelas `showModal()` ficam na camada de cima do navegador; um `<div>` comum, mesmo com z-index alto, fica por baixo.
- Cada tela tinha botões soltos (gráfico: só "Salvar JSON"; gerenciador: 3 botões; amostras: 5; registro: 3; chaves: só PDF).

## 2. Solução
Um botão "Exportar ▾" por tela; o menu usa `popover` (showPopover) = mesma camada de cima, abre sempre por cima. Sem popover (Chrome < 114) cai no z-index alto.

| Tela | Itens do Exportar ▾ |
|---|---|
| Medidor › Gráfico do ensaio | Relatório do ensaio (PDF) · Gráfico (PNG) · Dados (CSV) |
| Medidor › Grandezas / Motor / Log / Alertas / Histórico | TXT · Markdown · PDF (já existiam; só corrigida a camada) |
| Medidor › Chaves › Setup | PDF · TXT · Markdown (novos TXT/MD) |
| Medidor › Registro de aprendizado | Tudo (TXT+CSV) · só resumo · só amostras |
| Gráfico v0.5 | PDF (1 página, gerado na página) · PNG · CSV · Ensaio para reabrir (.json) |
| Mapa v0.7 | PDF · PNG · SVG |
| Gerenciador v1.4 | JSON (todas as abas) · Markdown · PDF (imprimir) |
| Amostras v0.5 | CSV amostras · CSV resumo · CSV manobras · JSON · Markdown · PDF (imprimir) |

JSON só aparece onde é formato de retorno (gráfico reabrível, gerenciador, amostras), separado por linha divisória.

## 3. Impressão automática ao fim do ensaio (⚙ Modo › card novo)
- Caixa "Gerar o relatório (PDF) sozinho quando o ensaio terminar" — chamada por `finalizaManual()` → `window.__autoImprime()`; `T.autoImp` impede duplicar; "Gravar com relatório" não gera de novo.
- Caixa "Também abrir a impressão do navegador" (iframe oculto + `print()`; sem `--kiosk-printing` o Chrome ainda pede confirmação).
- "Escolher pasta…": mesma pasta do Registro de aprendizado (`RG_DIR`, File System Access, só Chrome/Edge no PC). O handle fica no IndexedDB; após reabrir o navegador pode ser preciso "Autorizar pasta" (um clique).
- Sem pasta/permissão: o PDF vai para Downloads e a mensagem avisa.
- Campo "caminho de destino": **referência**. O navegador não grava em caminho digitado/colado; o texto aparece na mensagem final e no Log (`devObs`, card `ens`). Gravar num caminho de rede/servidor exigiria rota do Node-RED — NÃO definida (não inventada).
- Configuração em `localStorage['medidor.autoImp']` = `{on, prt, cam}`.

## 4. Testes feitos (Playwright, Demo 10×)
Menu acima do diálogo Grandezas (popover aberto, visual conferido); ensaio completo com a opção ligada → 1 PDF `relatorio_X1_DEMO_…pdf` (%PDF, 112 KB), nenhuma duplicata ao clicar em "Gravar com relatório"; gráfico embutido com 588 pontos exportou PDF/PNG/CSV/JSON; mapa exportou PDF/PNG/SVG; gerenciador e amostras abrem o menu sem erro.
Não testado: gravação real na pasta (precisa do seletor de pasta do navegador, não automatizável) e impressão física.

## 5. Pendências / a confirmar
- Se o destino deve ser um caminho de rede ou do servidor Node-RED: definir rota e pasta no servidor.
- Relatórios de ensaio incompleto (PARAR ENSAIO) também disparam a impressão automática (passam por `finalizaManual`).
