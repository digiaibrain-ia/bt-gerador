# Area RNC no medidor (1.10.216, 16/11/2026)

**Pedido (Reginaldo):** o RNC hoje e o **cartao escrito**; a automacao e melhoria. Area separada no HTML principal, com botao de ativacao, para nao engessar uma coisa na outra. Sem rede, guardar em arquivo (.txt/.csv) e enviar quando a rede voltar.

## Como funciona
| Item | Comportamento |
|---|---|
| Botao **RNC** (cabecalho) | Abre a area RNC. Sempre existe. |
| Interruptor **Usar RNC** | Nasce **DESLIGADO**; fica guardado no navegador (`medidor.rncAtivo`). **Desligado = medidor igual ao de antes**: sem "Registrar defeito", sem "RNC: BLOQUEADO", **zero chamadas a /api/rnc**. |
| Ligado | Botao "⚠ Registrar defeito" (janela simples: serie, modelo, banco, tipo, o que aconteceu, nome; anexa modelo/etapa/hora/grandezas/alarmes), aviso "RNC: BLOQUEADO", pendentes de envio, RNCs recentes e atalho **Abrir Reparo** (tela `rnc_reparo`, outro HTML, para quem conserta). |
| **Sem rede** (queda ou erro 5xx/408/429) | O registro entra numa fila e o medidor **baixa `RNC_pendente_<serie>_<data-hora>.csv`** (`;`, BOM, abre no Excel). Aviso: "salvo SO neste aparelho, ainda NAO esta no sistema — coloque a etiqueta BLOQUEADO". |
| Reenvio | Sozinho, a cada 30 s e quando a rede volta (com a pagina aberta); ou **Enviar agora**; ou **Enviar pendentes (.csv)** (le o arquivo salvo). **Mesma chave de idempotencia**: o servidor nunca cria duas RNCs. |
| Recusa (400/409/413...) | **Nao** entra na fila: aparece "NAO foi salvo" e a janela continua preenchida. Item recusado no reenvio fica **RECUSADA**, visivel; nunca some em silencio. |

## Limites (honestos)
- A fila fica na memoria da pagina; o **.csv e a copia duravel**. Fechar a pagina com pendentes e apagar o arquivo perde o registro.
- O navegador baixa o .csv para a pasta **Downloads** (nao grava numa pasta escolhida).
- O gerador so fica BLOQUEADO **no sistema** depois que o servidor confirma. O bloqueio real continua sendo a etiqueta fisica.
- Foto nao vai pelo medidor (so pela tela avulsa `rnc_registro`).
- A fase RNC do Dev/Operador oculto e **pulada** com aviso quando o RNC esta desligado.

## Onde ficam os dados (Node-RED)
Fluxo `rnc-api-v1.1.json` (sem nos s7/modbus). Variavel **`RNC_DIR`** pelo PM2 (pasta **fora** da `public`): `rnc.jsonl` (so acrescenta), `fotos/`, `backup/` (diario 00:05, ultimos 30). Capacidade medida: 2000 RNCs = 6 MB, ~4 ms por pedido; a producao (6 a 18 geradores/dia) nao chega perto de limite. SQL: BK-RNC-02 (copia assincrona, desligada, depois dos testes).

## Provado
- `tests/e2e/rnc_area_fila.js` (40): desligado por padrao e zero chamadas em 6 s; ligar/desligar; sem rede -> fila + .csv; rede volta -> 1 envio com a mesma chave; 400 nao entra na fila; 503 entra; reenvio recusado fica RECUSADA; ida e volta do .csv com `;`, aspas, quebra de linha e acentos; importar .csv.
- `tests/integracao/rnc_medidor_fila_real.js` (5): o medidor contra o **fluxo RNC real** (Node-RED 5.x): sem rede nao cria nada; com rede cria **exatamente 1** RNC e a serie fica BLOQUEADA; reenviar a chave nao duplica.
- **Nao provado:** PC BT2 real, navegador do notebook/celular do operador, rede de fabrica.
