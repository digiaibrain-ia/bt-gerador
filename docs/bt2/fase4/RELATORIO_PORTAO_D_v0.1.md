# Relatorio do Portao D (Fase 4) - v0.1 - 06/11/2026 - Central de registros (medidor 1.10.171)

Arquivo novo: `dashboard/ferramentas/medidor_gerador_v1.10.171.html` (gerador `dashboard/gerador/gerar_medidor_v1.10.171_v0.1.py`; modulo-fonte `dashboard/modulos-fonte/central_registros_v0.1.js`; a 1.10.170 nao foi tocada). O catalogo aponta para a 1.10.171.

## O que a tela faz
- **Entradas:** chip **"🗂 Registros"** no cabecalho; **botao direito -> "Central de registros..."** (menu do Pacote para a IA); e o aviso do fim do ensaio.
- **Lista com caixas de selecao** (a escolha fica lembrada): Alertas e Falhas (historico + ativas com Efeito/Causa/Solucao), Monitoramento (estado agora: DSE, PLC, bancos, chaves com falha de retorno/contator colado, ensaio, ocorrencias ativas), Amostras (so se houver sessoes pendentes), Logs (eventos da tela + log de comunicacao do Node-RED BC56/BC400) e Dados do ensaio.
- **Salvar em pasta** (escolhida uma vez, lembrada pelo navegador; ao reabrir ele pode pedir para liberar com um clique): `BT2_registros/ensaio_AAAAMMDD_HHMMSS_modelo/` com uma **subpasta por tipo** (`alertas`, `monitoramento`, `amostras`, `logs`, `ensaio`), mais `RESUMO.md` e `AGRUPADO.md` (tudo junto, para colar na conversa).
- **Downloads** (alternativa): **um** arquivo agrupado `.md` com tudo (+ o CSV das amostras, se marcado).
- **Imprimir agora** e **Copiar resumo**.
- **Fim do ensaio: so PERGUNTA** ("Salvar os registros agora?"; "Agora nao" fecha). Nada e gravado sem o clique em Salvar.

## O que a Central NAO faz
Nao comanda PLC, DSE ou chaves; nao apaga nem "baixa" as amostras pendentes (o fluxo de Amostras continua igual); nao envia nada pela rede (so le `/api/logs/{banco}`, como a janela de Logs).

## Provas
`tests/integracao/fase4/d_central_registros.test.js` (Chromium; pasta simulada pelo OPFS): 7/7 passam na 1.10.171 e a bateria **falha na 1.10.170**. Cobre: lista e caixas, salvar em pasta (subpastas, RESUMO e AGRUPADO), Downloads (1 arquivo agrupado), imprimir, botao direito, aviso de fim do ensaio sem gravar sozinho, escolha lembrada. Regressao do front (f10, f11, s1, s3, A3, B, C, D): **50/50 passam**; `tests/e2e/alertas_falhas.js`: 0 falhas.

## Limites (honestos)
- **O seletor de pasta REAL do Chrome/Edge nao foi exercitado** (o teste usa o OPFS, mesma API de `FileSystemDirectoryHandle`). Na bancada: escolher a pasta, salvar, abrir a pasta e conferir; reabrir o navegador e ver se ele pede para liberar de novo.
- O item **Amostras** nao foi testado com sessoes reais (o teste cobre o estado "sem amostras" desabilitado); o formato e o do proprio fluxo de Amostras (`rgResumoTxt`/`rgCsvTxt`).
- O **Log de comunicacao do Node-RED** nao foi lido de um servidor real nos testes desta Central (a janela de Logs tem testes proprios).
- O **grafico** nao entra na Central (use o "Exportar" do proprio grafico: PDF/imagem/dados).
- Em navegador sem seletor de pasta (ou celular) so funciona Downloads.
