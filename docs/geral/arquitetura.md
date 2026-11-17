# Arquitetura

## Fluxo de dados
DSE (junto ao gerador) → Modbus TCP → Node-RED → API HTTP → Dashboard HTML.
Node-RED também escreve/lê o DB do PLC dos bancos de carga.

## Decisões
- ADR-0001: Node-RED é o único cliente Modbus do DSE (evita dois clientes no mesmo equipamento).
- ADR-0002: sem backend Node.js por ora; o dashboard consome a API do Node-RED. Reavaliar se surgir
  autenticação de operadores, histórico em banco, relatórios no servidor ou integração corporativa.
- ADR-0003: dashboard entregue como HTML único (uso offline/mobile); fonte modular em `dashboard/src/`.
- ADR-0004: BT1 e BT2 separados em todas as pastas.

## Segurança
Sem segredos, IPs de planta ou dados de ensaio no Git. O endereço do Node-RED é digitado no dispositivo.

## A preencher (não inventar)
- Rotas da API: copiar de `docs/contratos/` (CONTRATO_HTTP_*).
- Tags/DBs do PLC: gerar a partir da exportação em `plc/`.
