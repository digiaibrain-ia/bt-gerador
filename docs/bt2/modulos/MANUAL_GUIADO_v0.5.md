# Manual guiado + Catálogo DSE + Troca de resistência — v0.5 (medidor v1.9.89)

## Resumo
v1.9.89 (28/10): revisão de cores da aplicação inteira (azul-escuro + filete laranja; seleção em laranja; fundos cinza-azulados; verde/vermelho/amarelo só para sinal); botão **📋 Tabela de potência** no passo 1 do Manual guiado; **degrau máx. por cálculo teórico** (campo vazio = 30 % de kW a 100 %). Anteriores:
Mudanças de 28/10 (v1.9.88): diálogo ENXUTO (sem lista de chaves — elas já existem no card Cargas; a sugestão aparece tracejada em laranja lá e um resumo por banco aparece no diálogo); sem "Ajustar à mão" (o rodízio escolhe); sem "Seguir a etapa" (ensaio iniciado = patamar acompanha a etapa, ensaio parado = à mão); sem "Variante"; proteção "DSE caiu → abre chaves" OBRIGATÓRIA para qualquer controlador (fora do Demo); excesso no 107 % = 2,5 pontos (107+2,5 = 109,5 % < limite 110 %); pausa entre degraus (5 s) só com ensaio PARADO. Anteriores: v1.9.87 (modelo só em Dados do ensaio, patamar sem 0 %, emergência na barra), v0.2 (catálogo, rodízio, troca de resistência).

## 1. Instruções de uso (operador)
1. **Dados do ensaio** → bloco "Modelo do DSE (catálogo)": digite parte do nome (ex.: `40 kva 220 mwm`) e clique no modelo. Preenche Frequência, Tensão e Controlador; a **Potência (kW)** (se vazia) vira o "kW a 100 %" do Manual guiado — **confirmar se o kW do .dse é o 100 %**. Sem catálogo? Digite a Potência (kW) à mão. O **Manual guiado** só LÊ isso (passo 1 mostra modelo e kW; botão "Abrir Dados do ensaio").
2. Manual guiado, passo 2: patamar 30 / 50 / 100 / 107 % (sem 0 %; retorno sem carga = "Abrir TODAS as chaves"); com o ensaio iniciado o seletor trava e acompanha a etapa. 3: **Sugerir chaves**. 4: **Confirmar e aplicar**.
3. **⛔ Abrir TODAS as chaves** (botão na barra verde do título, ao lado do ✕): emergência/reinício — abre todas as chaves comandadas nos dois bancos, sem esperar o plano; é o mesmo ato da proteção "DSE caiu". Não mexe em banco/seletora nem no cronômetro.
4. **Troca de resistência** (card Cargas): marque as chaves trocadas → "Registrar troca" → desgaste zerado + data guardada.
5. **Dados do ensaio** → bloco "Modelo do DSE (catálogo)": preenche Frequência (Hz_xml), Tensão (V_nome), Controlador (Deep Sea / familia_zip). Potência só se vazia; kW do .dse = dica.
6. Modelo novo: gerar o `.csv` de novo (catalogo_dse_v0.1.py) e carregar no seletor (fica guardado no navegador).

## 2. Dicionário de dados
| Item | Onde | Conteúdo |
|---|---|---|
| `medidor.catalogo.v1` | localStorage | catálogo compacto (12 colunas do CSV) |
| `medidor.guiado.v1` | localStorage | parâmetros do assistente (kw100, limite %, excesso, degrau, pausa, proteção DSE, modelo) |
| `medidor.guiado.rodizio.v1` | localStorage | desgaste por chave `{56|400:{acion[],horas[]}}` |
| `medidor.guiado.trocas.v1` | localStorage | data ISO da última troca por chave |
Tudo **por navegador/PC**. Nenhuma rota, DB ou endereço novo.

## 3. Lógica
- Busca: todos os termos (E), sem acento/maiúscula, sobre pasta+arquivo+família+kVA+V+Hz+descrição.
- Rodízio: critério fixo "ambos" (acionamentos + horas), contagem automática (1 s) mesmo com o diálogo fechado.
- Troca: `RodizioChaves.chaveTrocada` zera acion/horas da chave; `window.GUIADO.chaveTrocada(banco,idx)` disponível.

## 4. Assumido / a confirmar
kW_xml = 100 % (não confirmado); limite 110 %; excesso 107 % = 2 pts; timeout DSE 5 s; "Modelo" do controlador = `familia_zip` (ex.: DSEG_4501) — ajustar se o SAP usar outro nome.

## 5. Padrão de comentários
Código em PT-BR com o "porquê" nos blocos CATDSE, Manual guiado e Troca (ver cabeçalhos no HTML).

## 6. Como usar na simulação (v1.9.83)
- **Sem clicar INICIAR:** ligue o DEMO local, abra o Manual guiado, escolha o patamar à mão (o "Seguir a etapa" só vale com o ensaio iniciado) → Sugerir → Confirmar e aplicar. Valida a sugestão e a guarda de capacidade sem gastar etapa.
- **Com INICIAR:** com "Seguir a etapa do ensaio" marcado, o patamar acompanha a etapa atual; a cada etapa nova clique em Sugerir e Aplicar (não há aplicação automática).
- Layout: ✕ no canto superior DIREITO (igual a toda a aplicação); Manual guiado em 2 colunas (1–3 esquerda, 4–5 direita); seleção das chaves por troca de classe (sem piscar); Dados do ensaio sem rolagem.



## Cores da interface (v1.9.89) — tokens `--ui-*` e variáveis do tema
| Token | Valor | Para quê |
|---|---|---|
| `--ui-tinta` | #1a4a78 | barra superior, barras de título, cabeçalho da tabela, botão ativo do segmento |
| `--ui-tinta-esc` | #0f2e4d | barra superior no tema escuro |
| `--ui-acento` | #ec7000 | filete sob as barras, seleção (chave/etapa), botão IR, sugestão tracejada (**ASSUMIDO**: laranja estilo Itaú) |
| `--ui-acento-esc` | #c25a00 | botão de ação principal (contraste com texto branco) |
| `--ui-acento-fraco` | #ec700026 | fundo suave de seleção/destaque |
Fundos (tema claro): `--bg #f3f5f8`, `--line #dde2e8`, `--band #eceff3`… (cinza-azulado). Tema escuro não mudou.
Regra: **verde, vermelho e amarelo = SINAL** (ligado, falha, alerta). O azul vivo #1d6fd0/#2a78d6 saiu (virou laranja de seleção). Hex exatos da paleta Nauka não foram lidos do site (acesso bloqueado); ajuste fino = editar só as linhas `:root` (uma vez só).
Não alterado de propósito: cor da linha do gráfico (#2f7fd8) e cores de sinal.

## Tabela de potência (v1.9.89)
- Botão no passo 1 do Manual guiado; janela arrastável de consulta, abre ao lado do Guiado, rola até a linha do gerador atual.
- Colunas: kVA · 30 % · 50 % · 100 % · 107 % · 110 %. **100 % = kW_xml do catálogo** (mesmo valor de "kW a 100 %"); 30/50/107 % = frações do 100 %; 110 % = 100 % × 1,1 (ex.: 260 kVA → 189 → 56,7 / 94,5 / 189,0 / 202,2 / 207,9).
- Fonte: catálogo DSE a 60 Hz (`catalogo_modelos_v0.1.csv`, coluna kW_xml): 99 valores de kW distintos. **Não é a tabela impressa**: se algum valor da folha divergir, enviar a linha para corrigir.

## Degrau máx. teórico (v1.9.89)
`degrauKw()`: número digitado vence; vazio = **30 % × kW a 100 %** (ASSUMIDO — a engenharia confirma). Placeholder do campo mostra o valor (ex.: teórico: 56,7). Para "tudo junto" digite um valor alto. Alimenta `RodizioChaves.planoEntrada` (escalonamento.degrauMaxKw), sem mudar o módulo.

## Pendências registradas
- "Rodar ensaio" (botão no lugar do "Seguir") pelos FBs mãe/filhos com gerador ideal simulado: **não implementado** — exige criar os FBs (PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md, numeração em PLANO_NUMERACAO_BLOCOS_PLC.md); o botão só entra depois.
- Confirmar com a engenharia: kW_xml = 100 %, limite 110 %, degrau 30 %, timeout DSE 5 s.
- Setup: depois de usar o SETUP, os kW reais entram como condição no rodízio (já usa `kwEf`).
