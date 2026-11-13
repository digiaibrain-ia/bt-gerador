# Protótipo do card de chaves de carga — v0.1

**Arquivo:** `card-chaves_v0.1.html` (um arquivo só, sem internet, sem instalar nada).
**Situação:** PROTÓTIPO. Não faz parte do medidor. Dados **fictícios**. Não conversa com PLC nem com a rede.

## O que foi feito
- Card com **8 chaves**. Cada uma mostra: estado (Ligada / Desligada / Falha), kW, e se está Habilitada ou DESABILITADA.
- **Potência total em kW** no topo. Soma só chave **ligada e habilitada** (falha e desabilitada não contam).
- Botão **Habilitar / Desabilitar** em cada chave. Antes de mudar, abre um **aviso de confirmação**
  (o foco já vem no "Cancelar", para um toque sem querer não confirmar). Chave em falha mostra um alerta extra.
- **Tema claro e escuro** com as mesmas variáveis de cor do medidor (`dashboard/src/index.html`).
- O estado aparece em **palavra + símbolo** (● ○ ⚠), não só em cor.
- Botões com altura mínima de **48 px**; letra mínima de **16 px**.
- **Sem animação.** Existe uma caixa "Animações discretas", **desligada** por padrão; liga só um leve
  surgimento do aviso e respeita a opção "reduzir movimento" do aparelho. Os números nunca animam.

## Como abrir no celular
1. Baixe o arquivo `card-chaves_v0.1.html` do GitHub (botão "Raw" → salvar) e abra no navegador do celular, ou
2. No computador, dê duplo clique no arquivo (abre no navegador).

## Diferenças de cor em relação ao medidor (de propósito)
- Botão "Habilitar" usa um laranja **mais escuro** (`#a84f00`): o laranja do medidor (`#c25a00`) dá só 4,4:1
  com letra branca; este dá 5,5:1.
- Textos de estado usam tons verde/vermelho mais escuros que `--ok`/`--bad`, para ler bem como letra.

## O que NÃO foi testado
- Nenhum aparelho real (só navegador do computador simulando 390 px e 1536 px).
- Nenhum leitor de tela. Nenhuma luz forte de pátio. Nenhum uso com luva.
- Nada de comunicação real: o botão só muda o dado fictício em memória.
- Só os estados Ligada/Desligada/Falha. Falta o estado "sem leitura do PLC" (`.tile.unk` do medidor).
- Sem as abas por banco, o Setup de kW real e o rodízio — só o card de habilitar/desabilitar.

## Como integrar no medidor depois (à mão, em OUTRA branch)
1. Criar uma branch nova a partir da `main`. **Não trabalhar na `design/proposta-v0.1`.**
2. Trocar apenas o HTML/CSS do popup `dlgChHD` em `dashboard/src/index.html`, mantendo os mesmos `id`s
   (`chGrade`, `chNota`) e o mesmo estado (`DIS`, `KWR`, `SEL`, `CH_SRV`) para não quebrar a lógica atual.
3. O botão de comando deve chamar a mesma rota do PLC de hoje — o protótipo **não** tem essa parte.
4. Conferir no medidor real o que o protótipo não cobre (lista acima).
5. Só então rodar `dashboard/build/build.js` e testar. Fazer isso por um humano, não automático.

## Capturas
Pasta `capturas_v0.1/`: celular (390 px) e notebook (1536 px), claro e escuro, e o aviso de confirmação.
