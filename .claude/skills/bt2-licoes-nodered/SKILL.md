---
name: bt2-licoes-nodered
description: Licoes aprendidas do projeto BT2 sobre fluxos Node-RED (fila de comandos, corrida, idempotencia, confirmacao, JSON, settings). Use ao criar, revisar ou testar fluxos de chaves, banco, registro e logs.
---

# Lições BT2 — Node-RED
Fonte: `docs/licoes/REGISTRO_LICOES_v0.1.md` (IDs LL-010 a LL-018). Ler o registro para o detalhe; acrescentar lição nova no fim a cada rodada.

## Regras
- **Comando de segurança fura a fila e cancela o que ficou para trás** (Desligar banco expurga Ligar pendentes). LL-010
- **Validar de novo na hora de executar**, não só ao receber. LL-011
- **Resposta incerta é honesta**: janela de confirmação (2 s) e 504 `incerto:true`; quarentena por variável e reafirmação dos comandos de segurança. LL-012
- Marca de "válido" só depois dos dados (gravação em duas fases). LL-013
- Idempotência por identidade do lote, não por ordem. LL-014
- **Todo teste de correção deve falhar na versão que tinha o erro** (mutação). LL-015
- Abertas: fila com PLC mudo (LL-016, P3-E1), limpar registro sem janela (LL-017, P3-E2), JSON inválido = 500 (LL-018, limite do `http in`).
- Nunca editar fluxo de produção: versão nova gerada por script em `nodered/gerador/`, com backup e OK do Reginaldo. IP/DSE só por variável do PM2.
