# Menu ☰ de desenvolvimento + catálogo de ferramentas + página de entrada — v0.1 (medidor v1.10.109)

## Resumo
Abrir o HTML com duplo clique usa `file:///C:/Users/…` e o navegador **bloqueia as chamadas ao Node-RED**. Agora há (1) um **catálogo único** com o nome (e a versão) de cada ferramenta, (2) uma **página de entrada** `index.html` para guardar nos favoritos, e (3) um **menu ☰** no medidor, só para dev, que abre as outras páginas **no mesmo IP:porta** em que ele está.

## 1. Arquivos (todos na pasta `public`, juntos)
| Arquivo | Função |
|---|---|
| `catalogo_ferramentas_v0.1.js` | **Única lista** de arquivos/versões. Para uma ferramenta nova versão: troque `arquivo` aqui e copie o HTML novo |
| `menu_dev_v0.1.js` | Botão ☰ + painel com as ferramentas; "Verificar se os arquivos existem" (HEAD, não baixa) |
| `index.html` | Entrada: `http://IP:1880/index.html`; marca ✓/✗ se cada arquivo existe |
| `medidor_gerador_v1.10.109.html` | Carrega os dois `.js` (`<script src>`); se não existirem funciona igual, sem o menu |
Nome do `index.html` é fixo de propósito (é o endereço dos favoritos); a versão fica no comentário do arquivo.

## 2. Fluxo de trabalho
1. Copie o HTML novo para `public`. 2. Edite **uma linha** em `catalogo_ferramentas_v0.1.js`. 3. Abra `index.html` (ou o ☰ do medidor) e confira os ✓. Não é mais preciso editar o final do medidor para trocar a versão de outra página.
Observação: o gráfico (v0.5) e o mapa (v0.8) continuam **embutidos** no medidor (abrem em janela própria sem servidor); trocar a versão deles ainda exige uma nova versão do medidor. O catálogo cobre as páginas abertas como arquivos.

## 3. Quando o ☰ aparece
Depois da senha do Demo (mesmo do modo de testes) **ou** com `?dev=1` no endereço (fica lembrado neste navegador; `?dev=0` desliga). Em `file://` o painel mostra um aviso com o endereço correto em vez de links que não funcionam. Layout: o painel é um popover por cima (REGRA_LAYOUT_ESTAVEL_v0.1): não empurra nada.

## 4. Confirmado / assumido / a fazer
- **Confirmado (testado em navegador via http):** botão escondido sem dev; visível com `?dev=1`; escondido com `?dev=0`; verificação ✓ nos 7 itens; sem erro de JavaScript.
- **Assumido:** que `index.html` é servido em `http://IP:1880/index.html` (pasta `public` como `httpStatic`); a raiz `/` pode ser do editor do Node-RED (conforme o `settings.js`).
- **A fazer (opcional):** carregar o ☰ nas outras páginas (gráfico, gerenciador, amostras…) acrescentando 2 linhas `<script src>` quando elas ganharem a próxima versão; não forcei novas versões só para isso.
- A lista do catálogo vem dos arquivos entregues; `painel_bt2_v0.2.html` está marcado como legado (aponta para versões antigas).

## Glossário
**file://:** abrir do disco, sem servidor. **HEAD:** pergunta ao servidor se o arquivo existe, sem baixar. **popover:** painel na camada de cima do navegador, acima de janelas.
