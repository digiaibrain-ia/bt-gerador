---
name: "padrao-codigo-modular-documentado"
description: "Use ao gerar ou revisar QUALQUER código/artefato do projeto de bancos de teste (JS, HTML, fluxo Node-RED, JSON, FB/FC/DB SCL, Ajuda dos HTML): modular, comentado em PT-BR e com .MD."
---

# Padrão mandatório de código e documentação

Vale para TODO artefato novo e para toda revisão. Para SCL (FB/FC/OB/DB) aplicar TAMBÉM a skill padrao-comentarios-scl (moldura, REGION, nomes, autor); este padrão complementa, não substitui.

## 1. Requisitos técnicos
- Código modular: uma responsabilidade por função/bloco; dados na entrada, resultado na saída; adaptador separado do módulo; fácil de adaptar e escalar.
- Parâmetros (limites, tempos, pesos, percentuais) ficam em um único lugar, nunca espalhados; todo valor sem fonte confirmada é marcado "ASSUMIDO — a confirmar".
- Nunca inventar tag, endereço, registrador, DB, rota ou nome de função: sem fonte, perguntar.
- BT1 e BT2 (e BC56 e BC400) são sistemas distintos.

## 2. Comentários (PT-BR, técnicos e não técnicos)
Em: JS, HTML, fluxos Node-RED (campo info/comentário de cada nó e nós comment), JSON (arquivo irmão ou campo de descrição, pois JSON puro não aceita comentário), FB/DI/FC/DB, e no texto da Ajuda dos HTML.
1. Cabeçalho do arquivo: para que serve (linguagem simples), de onde vêm os dados, o que NÃO faz, versão e data.
2. Cada função/bloco/nó: o que faz e, em seguida, o PORQUÊ (razão operacional, não a sintaxe).
3. Constantes e limites: origem (arquivo/tabela) ou "ASSUMIDO — a confirmar".
4. Siglas explicadas na primeira vez; frases curtas; sem jargão desnecessário.
5. Falha e segurança: dizer o que acontece quando a comunicação/dado falha (estado seguro).
6. Ajuda dentro dos HTML: explicar o que cada item mostra, de onde vem o dado e por que importa; sem bloquear a tela principal (ver regra de Ajuda abaixo).

## 3. Arquivos .MD que acompanham cada entrega
Dicionário de dados; lógica de transformação (passo e porquê); instruções de uso e teste (com riscos); padrão de comentários; glossário contextual (termos do projeto com exemplo do projeto). Separar sempre: (a) implementado e confirmado, (b) assumido, (c) a desenvolver.

## 4. Entrega e VERSÃO (regra de 27/10/2026)
- Nome do arquivo com versão (nome_v0.1.ext); nunca sobrescrever versão anterior; HTML também como arquivo; fluxo Node-RED como .json pronto para importar; resumo de 2-3 linhas no início de tarefas complexas.
- Blocos PLC (FB/FC/DB .scl/.db importados como "External source file"): o sufixo de versão do nome do arquivo SE PERDE quando o TIA gera o bloco na pasta Program blocks. Por isso a versão deve SEMPRE constar também DENTRO do bloco: (1) `TITLE = nome vX.Y (DBn)`; (2) `VERSION : X.Y`; (3) linha `//// VERSAO : X.Y (dd/mm/aaaa) - o que mudou` logo abaixo do nome na moldura de comentário, com a explicação de que o nome do bloco não leva versão; (4) histórico de versões na moldura.
- Snippets de chamada (arquivos que não são bloco) também levam VERSAO no cabeçalho.
- Antes de gerar chamadas/instâncias, usar os NOMES REAIS do projeto TIA (ex.: db155i_BC400_ComEt200 = DB155, db163i_BC56_ComEt200 = DB163) e deixar o mapeamento instância→DB remoto→DB do banco numa tabela única no cabeçalho, marcando "CONFIRMAR" o que não foi visto no projeto.

## 5. Ajuda dos HTML (decisão 27/10/2026)
A ajuda não deve bloquear a tela principal. Plano para o fim do projeto: um HTML de ajuda por tela (réplica do frontend, sem backend, com imagem e a mesma interação) e depois uma ajuda única com índice, estilo ajuda de software, visual moderno.

## 6. Padrão de interface (27/10/2026)
Em toda popup/janela o botão ✕ de fechar fica no canto superior ESQUERDO da barra do título.

## 7. Revisão do legado
O que já existe é revisado no FIM do projeto, em lote, pelo gerenciador de revisão (GERENCIADOR_REVISAO_PADRAO), para economizar tokens. Revisão = só comentários, .MD e ajuda, sem mudar lógica; gerar arquivo com versão nova.