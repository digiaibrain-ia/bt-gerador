# Bancos de teste de geradores — supervisão e controle

Supervisão dos bancos de teste de geradores diesel (BT1 e BT2): dashboard HTML,
Node-RED como gateway central e PLC Siemens S7. Uso principal pelo celular.

## Arquitetura
```
DSE ──Modbus TCP──► Node-RED (único cliente Modbus + API HTTP) ──► Dashboard HTML
                         └──► DB do PLC dos bancos de carga
```
Detalhes: [docs/arquitetura.md](docs/arquitetura.md).

## Pastas
| Pasta | Conteúdo |
|---|---|
| `dashboard/src/` | Fonte do dashboard (HTML base + módulos) |
| `dashboard/build/` | Script que monta o HTML único |
| `nodered/flows/bt1`, `bt2` | Fluxos JSON exportados (sem credenciais) |
| `plc/bt1`, `bt2`, `shared` | Blocos SCL e DB exportados em texto |
| `docs/` | Arquitetura, decisões (ADR), contratos HTTP |
| `catalogo/` | CSV de modelos de gerador |
| `tests/` | Testes e roteiros de validação |

## Como obter o dashboard (operador)
Abra a aba **Releases** do repositório e baixe o `.html` da última tag `medidor-v*`.
No dashboard, informe a URL do Node-RED no campo de servidor (não vem preenchida).

## Build local (opcional)
```bash
node dashboard/build/build.js     # gera dashboard/dist/medidor_gerador_vX.Y.Z.html
```

## Regras
- BT1 e BT2 são sistemas distintos: pastas e fluxos separados.
- Nunca commitar `.env`, `flows_cred.json`, IPs reais ou dados de ensaio.
- Convenções de branch, commit e tag: [CONTRIBUTING.md](CONTRIBUTING.md).
