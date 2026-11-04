# Estado do projeto (atualizado em 04/11/2026; confirmar com o usuario)

- Repositorio `digiaibrain-ia/bt-gerador`, branch de trabalho `ccr-4f9e06b7-bw4qef`. **Codigo congelado no commit `51481df`** (Fases 1 a 3); depois dele so documentos e scripts.
- Suite: 190 testes, 185 passando, 0 falhando, 5 pendentes de proposito (F2-1, F4-1, F4-2, P3-E1, P3-E2). Tudo validado so contra PLC simulado.
- Versoes vigentes dos fluxos: chaves-56/400 v3.4, chaves-550/595 v1.5, registro-ensaio v1.8, dev-logs v1.3, cliente-156 v3, cliente-31 v4, servidor v3_7; simulador v7 (so bancada). Front: medidor 1.10.167.
- **PLC do usuario ainda na numeracao ANTIGA** (DB150/152/158/160/52/53). Os fluxos novos leem DB3000/3002/3100/3102/3200/3202/3300/3302/2000/2100: a Etapa 1 do PLC (renumerar) vem ANTES de importar os JSON. Regra: PLC e Node-RED mudam juntos.
- Pacote atual: `entrega_atualizacao_bt2_v0.3.zip` (roteiro unico em `docs/bt2/migracao/ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md`).
- Pendente: atualizacao em etapas (PLC + Node-RED + HTML), depois o checklist de bancada (carga desacoplada). Depois dos numeros da bancada: decidir `CONF_JANELA_MS`, P3-E1/E2 e se a quarentena (P3-A5) fica.
- FB100 v0.4 / FB102 v0.2 (correcoes de seguranca) existem no repositorio sem teste em PLC; carregar ou nao e decisao do usuario.
- O processo de aprovacao com o Gemini foi encerrado; nao enviar mais perguntas a ele.
- Futuro: SQL Server (o usuario e o administrador), via Node-RED; nada a fazer agora.
