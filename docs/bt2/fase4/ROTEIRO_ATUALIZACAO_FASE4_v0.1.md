# Roteiro de atualizacao - Fase 4 (06/11/2026) - v0.1
Complementa `IMPLANTACAO_ROTEIRO_v0.5.md`. Regras: **backup antes**, **uma aba por vez**, **carga de potencia DESACOPLADA** em qualquer teste, nunca alterar o PC BT2/PLC/DSE sem o seu OK. Nada deste pacote foi validado em PLC real.

## O que muda (resumo)
| Parte | Versao nova | Depende de |
|---|---|---|
| Medidor (tela) | `medidor_gerador_v1.10.172.html` + `catalogo_ferramentas_v0.7.js` | nada (funciona com os fluxos v3.4 e v3.5) |
| Fluxos Node-RED | `chaves-56-api-v3.5`, `chaves-400-api-v3.5` | **PLC com os DBs v0.3 (sbRet)** |
| PLC 1515 | `fb101_ComEt200 v0.8`, `db3000`/`db3100` v0.3, chamadas v0.3 | ET200 carregado junto |
| PLC banco (ET200 provisorio) | `db38/db39 v0.4`, `fb_supervisaoChaves16`, `fb_bancoEt200_16 v0.3`, chamadas ET200 | o FC4 do Reginaldo (mapeamento fisico) |
Nao mudam: `chaves-550/595 v1.5` (Etapas 2 e 3 ficam para depois), registro v1.8, dev-logs v1.3, servidor Deep Sea v3_7.

## Ordem (com pontos de parada)
1. **Backup**: TIA (1515 e ET200) e Node-RED exportado. Guardar as versoes antigas.
2. **Medidor 1.10.172** (independente): copiar `medidor_gerador_v1.10.172.html` e `catalogo_ferramentas_v0.7.js` para `public\html` (sem apagar as antigas) e abrir `http://localhost:1880/html/medidor_gerador_v1.10.172.html`. Conferir: chip do PLC "leitura ok"; chip "🗂 Registros"; botao direito com "Central de registros". **Parada:** se algo falhar, abrir a 1.10.171/172 anterior (rollback = voltar o catalogo).
3. **PLC (os dois juntos, mesma janela)**: ET200 e 1515.
   - ET200: importar `db38_db39_ComEt200_v0.4`, `fb_supervisaoChaves16_v0.1`, `fb_bancoEt200_16_v0.3`; ajustar o FC4 (ou usar as chamadas ET200) com o mapeamento fisico das saidas/entradas; **uma unica rotina escreve as saidas** (sem FC4 antigo em paralelo); um unico escritor do `vidaET`.
   - 1515: copiar o snapshot do DB para valor inicial; importar `db3000_BC56_Chaves_v0.3` e `db3100_BC400_Chaves_v0.3`; `fb101_ComEt200_v0.8`; atualizar as chamadas (`chamadas_BC56/BC400_v0.3`, e no `fc_chamadasBancos_BT2`). **Conferir os deslocamentos no TIA** (esperado: `sbRet` em X464.0 a X470.0).
   - Compilar, carregar os dois. **Parada:** `ComOk` TRUE, `RespEcoOk` TRUE, `vidaET` mudando.
4. **Fluxos v3.5**: importar `chaves-56-api-v3.5` e depois `chaves-400-api-v3.5` (uma aba por vez), remover as v3.4 so depois de testar. No PC BT2 use os arquivos `-PC.json` do pacote separado (com o IP escrito; nunca vao para o Git).
   Conferir: `GET /api/chaves/56` traz `habResp`, `falhaRetorno`, `contatorColado`, `respEcoOk`.
5. **Checklist de bancada** (`CHECKLIST_BANCADA_v0.2.md`), com a carga desacoplada.

## Acoplamentos importantes
- Fluxo v3.5 com o PLC antigo: a leitura falha (o DB nao tem `sbRet`) e o medidor mostra "banco sem leitura".
- PLC novo com o fluxo v3.4: funciona, mas sem as regras novas no `ligar`/`habilitar`.
- FB101 v0.8 com DB38/39 v0.3 (12 bytes): o PUT/GET nao fecha. Carregar ET200 e 1515 juntos.

## Rollback
Recarregar o backup do TIA; reimportar `chaves-56/400 v3.4`; voltar o medidor e o catalogo para a versao anterior.

## Para os operadores (o que muda na tela)
- Setup: o chaveamento vem da tensao do gerador dos Dados do ensaio (confirme os Dados antes). 208/480 V so sinalizam.
- Alertas e Falhas: botao "▸ Roteiro" (Efeito, Causa, Solucao) e "ⓘ Legenda".
- "🗂 Registros": salvar/imprimir logs, amostras e monitoramento; no fim do ensaio a tela so pergunta.
- Se a chave nao responder ao clique, a tela agora avisa o motivo (em envio, ou Patamar manual esperando o Aplicar).
