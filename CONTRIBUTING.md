# Convenções

## Branches
`main` (sempre utilizável) + `feat/<assunto>`, `fix/<assunto>`, `docs/<assunto>`, `plc/<assunto>`, `nodered/<assunto>`.
Tudo entra na `main` por Pull Request, mesmo sozinho (o diff fica registrado).

## Commits — `tipo(escopo): descrição`
Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
Escopos: `dashboard`, `nodered`, `plc-bt1`, `plc-bt2`, `docs`.
Exemplos: `fix(dashboard): troca de chave em modo Manual`, `feat(nodered): rota de seleção do BT2`.
Um assunto por commit; não misturar tela com PLC.

## Tags (disparam o Release)
| Componente | Formato | Exemplo |
|---|---|---|
| Dashboard | `medidor-vX.Y.Z` | `medidor-v1.10.126` |
| Node-RED | `nodered-vX.Y` | `nodered-v2.6` |
| PLC | `plc-bt2-vX.Y` | `plc-bt2-v0.3` |
A versão da tag do dashboard deve ser igual à de `dashboard/src/versao.json`.

## Git x Drive
- Git: código-fonte, fluxos JSON, SCL/DB em texto, documentação, testes.
- Drive (backup): projeto TIA (`.ap*`), PDFs, relatórios, dados reais de ensaio.
