# Plano de juntada: branch do RNC × branch da sessão BT2 — v0.1 (13/11/2026)

Branches: **RNC** = `ccr-69b3bd0c-yhr48g` (20 commits desde a base) · **BT2** = `ccr-4f9e06b7-bw4qef` (198 commits desde a base; último em 13/11 03:55, a passagem de sessão do RNC). Base comum: `47b0123` (01/11/2026).
**Nada foi juntado nem enviado.** Foi feita uma **juntada de ensaio** numa cópia de trabalho temporária (descartada) para validar esta receita.

## Resultado da juntada de ensaio
| Ponto | Achado |
|---|---|
| Arquivos tocados nos **dois** lados | Só `.gitignore` (as duas linhas novas convivem: união simples) |
| Colisão de nomes de arquivo | **Nenhuma** hoje: a BT2 chega à `medidor_gerador_v1.10.201`; a RNC tem 202–205 (e a 135, da base antiga). Não há `rnc_*` nem `catalogo_ferramentas_v0.9` lá |
| "Conflitos de local de arquivo" | A BT2 **moveu** `docs/modulos` → `docs/bt2/modulos` (e outras pastas de `docs/`). Os docs novos do RNC aparecem como conflito, mas a resolução é **mecânica**: aceitar o caminho novo (`docs/bt2/modulos/`) |
| Código do RNC (regras, fluxo, telas, medidor) | Sem conflito: 22 testes automáticos passam na árvore juntada |
| **Caminhos dentro de scripts** | `gerar_pacote_rnc_bancada_v0.3.py` lê `docs/modulos/…` e **quebra** depois do movimento (FileNotFoundError). Ajuste: trocar por `docs/bt2/modulos/…` (conferido: gera o pacote) |
| Catálogo do menu ☰ | O gerador da BT2 (`gerar_catalogo_auto_v0.2.py`, base v0.8) **não lista** as telas RNC. Com `gerar_catalogo_auto_v0.3.py` (base v0.9) na árvore juntada: 9 ferramentas, medidor → **205**, `rnc_registro_v0.2`, `rnc_reparo_v0.3` |
| Medidor v1.10.205 na árvore juntada | Navegador: abre, botão "Registrar defeito" presente, menu ☰ do **operador** lista Medidor, Gráfico, RNC · Registro de defeito e RNC · Reparo; modo dev lista também as ferramentas de desenvolvimento; 0 erro de JavaScript |

## Receita (quem for juntar; sugestão: partir da BT2, que é a árvore "maior" e tem o novo layout de `docs/`)
```bash
git fetch origin
git switch -c juncao-rnc origin/ccr-4f9e06b7-bw4qef        # ou na própria BT2, se o Reginaldo preferir
git merge --no-ff origin/ccr-69b3bd0c-yhr48g               # conflitos esperados: .gitignore + "file location" dos docs do RNC
# 1) .gitignore: manter as duas linhas (rnc-dados/ e tests/integracao/runtime/)
# 2) docs do RNC: aceitar o caminho novo
git add docs/bt2/modulos .gitignore
# 3) caminhos dentro do gerador do pacote (executável; quebra sem isto)
sed -i "s#'docs/modulos/#'docs/bt2/modulos/#g" dashboard/gerador/gerar_pacote_rnc_bancada_v0.3.py
# 4) regenerar o catálogo do menu com o gerador v0.3 (lê a base v0.9; escreve dashboard/ferramentas/catalogo_ferramentas.js)
python3 dashboard/gerador/gerar_catalogo_auto_v0.3.py
# 5) conferir
node --test tests/rnc_core.test.js tests/rnc_core_v1.1.test.js          # esperado: 22 OK
python3 dashboard/gerador/gerar_pacote_rnc_bancada_v0.3.py /tmp/pkg      # esperado: zip com 9 arquivos
git commit
```
Opcional (cosmético): textos dentro dos docs do RNC ainda citam `docs/modulos/…`; trocar por `docs/bt2/modulos/…` depois da juntada.

## Decisões que são do Reginaldo / da sessão BT2
1. **Direção e destino:** juntar a RNC na BT2 (recomendado) e depois na `main`, ou cada branch na `main` separada. Nenhum push foi feito para a branch da BT2.
2. **Versões de medidor:** manter só a **v1.10.205** como corrente e arquivar 135, 202, 203 e 204 em `dashboard/arquivo/` (convenção da BT2), ou mantê-las. Se a sessão BT2 criar outra 202–205 antes da juntada, **renumerar** uma delas.
3. **Gerador do pacote da BT2:** passar a usar o catálogo v0.9 + gerador v0.3 (senão as telas RNC somem do menu).
4. **`SETUP-ROBO-01`** (8 falhas do robô no Setup, anteriores ao RNC): levar ao `BACKLOG_FORA_DE_ESCOPO.md` da BT2, se ainda não foi.
5. A premissa de que a **v1.10.201 é a versão em uso no PC BT2** continua **não confirmada**.

## Limites
Foi um ensaio de juntada na árvore tal como está hoje; se a BT2 ou a RNC receberem commits novos, repetir a simulação (`git merge-tree --write-tree --name-only <RNC> <BT2>`). A juntada não prova nada de bancada: DSE real, PC BT2 e rede seguem pendentes.
