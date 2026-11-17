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
| `dashboard/` | App do operador (fonte em `src/`, build em `build/`, módulos, ferramentas, arquivo de versões antigas) — compartilhado pelos BTs |
| `nodered/flows/bt2/` | Fluxos Node-RED do BT2 (JSON exportado, sem credenciais). `bt1/` reservada |
| `plc/bt2/` | Blocos SCL e DB do BT2 em texto (`bancos_cargas/`, `comunicacao_et200/`, `variaveis/`, `arquivo/` = versões antigas) |
| `plc/bt1/` | Reservada (BT1 ainda não está em desenvolvimento) |
| `docs/geral/` | Arquitetura, glossário, dicionário de dados, processo de sincronização |
| `docs/padroes/` | Regras de nomes e versões, layout estável, padrão de alertas e falhas, mapa de versões |
| `docs/bt2/` | Documentos do BT2: `contratos/`, `plc/`, `ensaio/`, `migracao/`, `modulos/`, `diagramas/` |
| `catalogo/` | CSV de modelos de gerador (lido do `.dse`) |

Critério: o que vale para qualquer BT vai para `geral/` ou `padroes/`; o que é de um BT vai para a pasta dele. Regra do projeto: BT1 e BT2 nunca se misturam.

Os textos de documentos antigos ainda citam caminhos anteriores (ex.: `docs/PLANO_...`). Os caminhos atuais são os desta tabela.

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
