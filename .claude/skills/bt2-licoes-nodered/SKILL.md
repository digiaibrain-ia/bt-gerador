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
- **Fluxo no padrão do BT2 (LL-053/LL-054, 13-14/11/2026):** versão do arquivo = versão da aba = versão do info e da nota de cabeçalho; info em todo nó; nota (comment) ≤ 80 caracteres (o resto vai no info); faixas por rota + área compartilhada, com grupos e nós link; notas antigas no grupo "Notas do fluxo". Gerar por `organiza_fluxo_v0.3.py` e provar com `verifica_equivalencia_fluxo_v0.2.py` + a mesma bateria via `BT2_FLUXO_TROCA`. Doc: `docs/bt2/padroes/PADRAO_FLUXOS_NODERED_v0.2.md`.
- **Endpoint S7 dos fluxos = PLC de Ensaio (1515)** (rack 0, slot 1; `${PLC_IP}`); o PLC de Carga (1214FC) fala com o 1515 por PUT/GET e não é lido pelo Node-RED. `${PLC_IP}` não definido no processo = erro `getaddrinfo ENOTFOUND ${PLC_IP}` no Debug; teste isolado: `nodered/flows/bt2/teste-s7-isolado-v0.1.json`.
