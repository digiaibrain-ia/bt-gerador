# navi no bt-gerador

[navi](https://github.com/denisidoro/navi) é uma cola interativa de comandos: você escolhe o comando, ele pede os argumentos e executa. O arquivo `bt-gerador.cheat` desta pasta reúne os comandos do projeto (build do dashboard, validação de fluxos Node-RED e blocos SCL, leitura da API, convenções de Git).

O navi é um programa de terminal e não faz parte do repositório: instale na sua máquina (ver instruções do projeto navi). Aqui só versionamos o cheatsheet.

## Usar

Na raiz do repositório:

```bash
navi --path ./ferramentas/navi           # abre o menu só com os comandos do projeto
navi --path ./ferramentas/navi --query "dashboard"
```

Para tornar permanente, adicione a pasta ao caminho do navi (`export NAVI_PATH="$PWD/ferramentas/navi"` no seu shell).

## Regras refletidas no cheatsheet

- Rotas HTTP só em `/api/` (`docs/PADRAO_ROTAS_API_NODERED.md`).
- BT1 e BT2 são sistemas separados; o cheatsheet não mistura os dois.
- Não há comando Modbus direto: o Node-RED é o único cliente Modbus do DSE (ADR-0001).
- A URL do Node-RED é digitada no momento do uso e nunca vai para o Git.

## Manter

Ao criar rota, script ou convenção nova, acrescente o comando em `bt-gerador.cheat`. Sintaxe: `%` tags, `#` descrição, `$` variável com sugestões, `;` comentário.
