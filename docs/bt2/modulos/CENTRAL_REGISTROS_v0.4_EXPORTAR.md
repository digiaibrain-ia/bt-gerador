# Central de registros v0.4 — botão Exportar ▾ (15/11/2026) · medidor 1.10.210

**Pedido (Reginaldo):** "a Central de registros ficou sem a função do botão Exportar". As outras telas (Gráfico, Mapa, Logs) têm o menu **Exportar ▾**; a Central só tinha Salvar selecionados, Imprimir agora e Copiar resumo.
**Decisão dele:** menu Exportar ▾ com formatos, **no lugar do "Imprimir agora"**; Salvar selecionados e Copiar resumo ficam.
**Problema do "Imprimir agora" antigo:** despejava o JSON e os logs brutos no papel. No registro real do Reginaldo deu um PDF de **26 páginas e 23,5 MB**; no cenário de teste com 3099 eventos, **32 páginas e 236 mil caracteres**.

## O que mudou (módulo `dashboard/modulos-fonte/central_registros_v0.4.js`, gerador `dashboard/gerador/gerar_medidor_v1.10.210_v0.1.py`, de 1.10.209)
Menu **Exportar ▾** (mesmo menu `EXPO` dos outros diálogos do medidor):
| Item | O que faz |
|---|---|
| **PDF organizado (imprimir)** | Abre a impressão do navegador (escolha "Salvar como PDF") com tabelas curtas: resumo, alertas ativos e últimos 40 do histórico, monitoramento resumido (modo, DSE, chaves, bancos, chaves por banco, última leitura do DSE), falhas e avisos agrupados (top 15) com contagem e hora, dados do ensaio e equipamento. Respeita as caixas marcadas. **Nada de JSON/JSONL bruto.** |
| **Markdown agrupado (.md)** | Tudo o que está marcado num arquivo só (independe da pasta escolhida), para colar na conversa. |
| **Planilha de alertas (.csv)** | Histórico de alertas e falhas (`;`, com BOM, abre no Excel). Independe das caixas. |
| **Monitoramento (.json)** | Estado agora: DSE, PLC, bancos, chaves, ensaio e ocorrências ativas. Independe das caixas. |
| **Amostras (.csv)** | Só aparece quando há sessões pendentes. |
Nada marcado: PDF e Markdown avisam "Marque pelo menos um item" (não imprimem nem baixam).

**Também:** o ajuste da 1.10.191 (chave "perguntar ao fim do ensaio", `CEN_PERGUNTA_FIM`) existia só dentro do medidor; agora está no código-fonte da Central. O gerador confere, antes de trocar, que o módulo embutido era exatamente o v0.3 + esse ajuste.

## Medido (mesmo cenário, 3099 eventos)
| | Páginas | Texto impresso |
|---|---|---|
| "Imprimir agora" (1.10.209) | **32** | 236 596 caracteres |
| PDF organizado (1.10.210) | **2** | 2 925 caracteres |

## Testes
- `node tests/e2e/central_exportar.js` (32, desktop e celular): botão Exportar presente e Imprimir agora ausente; menu cabe na tela; cada formato baixa o arquivo certo (nome, BOM, JSON válido, versão do medidor); a seleção das caixas manda; nada marcado avisa; PDF sem JSON bruto, curto e **≤ 8 páginas medidas com `page.pdf` em volume de 3 mil eventos**; Salvar selecionados (Downloads) igual. Contra a 1.10.209 o teste falha.
- `tests/integracao/fase4/d_central_registros.test.js` (7): o teste "imprimir agora" virou "Exportar ▾ > PDF organizado" (mesma verificação: monta a área de impressão e chama a impressão); os outros 6 (inclui o aviso de fim de ensaio, que só PERGUNTA) inalterados.
- Sem regressão: Dados do ensaio por NS (84) e mapa embutido no medidor (28) na 1.10.210.

## Limites
- O PDF abre a **impressão do navegador** (escolha "Salvar como PDF"), como o "PDF (imprimir)" dos Logs; não gera o arquivo sozinho.
- A tabela "Última leitura do DSE" lista até 24 grandezas; se ficar longa, dá para reduzir na v0.5.
- Medido no Chromium de teste, não no Edge/Chrome do notebook do Reginaldo.
