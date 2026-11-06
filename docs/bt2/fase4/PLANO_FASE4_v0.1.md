# Plano da Fase 4 (pos-bancada de 06/11/2026) - v0.1 - AGUARDA OK

Regra do projeto: nada de producao e alterado antes do OK. Toda mudanca vai para versao nova. Teste que falha vira `todo` com ID e gravidade.
Origem: licoes da bancada (BANC-1..4 no `BACKLOG_FORA_DE_ESCOPO.md`), pedidos do Reginaldo e pendencias das conversas anteriores.
Decisao ja tomada pelo Reginaldo: **se o SB some, o CB cai; tempo de verificacao T = 2 s.**

## Portao A - Seguranca: comando sem retorno (BANC-2) - FAZER PRIMEIRO
Causa: com o SB bloqueado o CB ficou em 1; ao voltar o SB a chave ligou sozinha (partida automatica).
- **A1 PLC do banco (hoje o ET200 provisorio), bloco SCL novo** (numero do bloco a definir com o Reginaldo; nenhum bloco existente e sobrescrito):
  - Por chave, TON de 2 s (parametro `TempoRetornoMs`, padrao 2000): `CB=1` e `SB=0` por mais de T -> `CB:=0` e trava `FalhaRetorno[n]`.
  - Chave que estava ligada e perdeu o SB: mesma regra.
  - `CB=0` e `SB=1` por mais de T: `ContatorColado[n]` (falha e bloqueio; derrubar o CB nao resolve).
  - Falha travada: so rearma com novo comando do operador (borda 0->1 do pedido) e com SB=0 confirmado. Nunca rearma sozinha quando o SB volta.
  - Campos novos no fim do DB (nao muda endereco dos existentes). Exige backup do TIA antes e OK explicito.
- **A2 Fluxos `chaves-56/400 v3.5` e `chaves-550/595 v1.6`:** GET passa a trazer `falhaRetorno[]` e `contatorColado[]`; em 504 "incerto" o fluxo manda `ligar:false` (camada extra); comando de ligar recusa (409) enquanto houver falha travada ou contator colado.
- **A3 Medidor:** novas ocorrencias `CHV-006` (sem retorno) e `CHV-007` (contator colado), com texto no troubleshooter.
- **A4 Testes:** modelo de referencia em JS da logica do bloco + vetores (apoio do especialista de verificacao); testes de integracao do fluxo no PLC simulado.
- **O que NAO se prova aqui:** o SCL real e o tempo do contator. Isso so a bancada prova (carga DESACOPLADA).

## Portao B - Chave que nao aceita o clique (BANC-3)
- Falta: mensagem da tela, JSON de `/api/chaves/56` (`cb`,`sb`,`hab`) e log do momento. Sem isso nao ha causa confirmada.
- Hipoteses: `CH_PEND` preso (o clique e ignorado em silencio) ou recusa do fluxo por estado inconsistente (CB=0 com SB=1).
- Correcao no medidor (v1.10.168): clique ignorado passa a mostrar aviso; `CH_PEND` com limite de tempo. A causa final entra assim que os dados chegarem.

## Portao C - Medidor v1.10.168 (a 167 nao e tocada)
- **C1** Animacao discreta dos triangulos (falha mais forte, alerta mais fraca; respeita "reduzir movimento").
- **C2** Troubleshooter Efeito -> Causa -> Solucao por codigo (objeto `TROUBLE`), com teste rapido por causa, passos marcados "no PC / Node-RED" ou "depende de bancada/TI" e botao "Copiar diagnostico". Texto da solucao validado pelo Reginaldo.
- **C3** Legenda (icone i) do catalogo de codigos na janela Alertas e Falhas, gerada do mesmo catalogo.
- **C4** "Cards x flow" abre atras do Demo: reproduzir no navegador de teste antes de corrigir; teste automatico de qual janela fica na frente.
- **C5** `DSE-001` dividido por `statusModbus`/`ultimoErro` (API fora x DSE sem Modbus). Se o `/api/gerador` 503 nao trouxer esses campos, ajuste pequeno no servidor Deep Sea v3_8.
- **C6** Tabela de potencia (BANC-4): os valores da `TAB60` conferem com a foto; falta o print da tela com as duas potencias na mesma linha.
- **C7** Lacuna de teste: medidor com o ET200 sem comunicacao (`comEt200Ok:false` -> `sel='semcom'`).

## Portao D - Central de registros (chip + botao direito)
- Junta logs, amostras, monitoramento, grafico e dados do ensaio em uma lista com caixas de selecao; "Salvar selecionados", "Imprimir agora" e salvar tudo ao fim do ensaio, em pasta local por ensaio, com um `.md` de resumo para enviar aqui.
- Preferencia fixa: chip/botao direito nas proximas telas.
- **Decisoes abertas (padrao sugerido):** pasta escolhida uma vez no navegador, com Downloads como alternativa; fim do ensaio PERGUNTA antes de salvar.

## Portao E - Achados abertos nos fluxos (junto com A2)
- F4-2 (alta): `/tensao` responde 500 mas ja gravou; F4-1 (media): idade 5 s x 2,5 s; F2-1 (baixa): JSON malformado vira 500 em vez de 400.
- P3-E1 (media): fila nao falha rapido sem leitura; P3-E2 (baixa/media): registro sem janela de confirmacao (`limpar`).
- Proposta: F4-2, F4-1 e F2-1 entram nas versoes novas do Portao A; P3-E1/P3-E2 em versao propria do registro (`registro-ensaio-db2100-api-v1.9`) so se voce quiser.

## Portao F - PLC e bancada
- Etapas 2 e 3 (BC550, BC595) com blocos do ET200/1200, depois de A1 validado.
- Diagnostico do `ComOk` que oscila (BC56/BC400): faltam valores do TIA em `db3005i_BC56_ComEt200` (`ComOk`, `StatusPut`, `StatusGet`, `FalhaPut`, `FalhaGet`).
- `CHECKLIST_BANCADA` v0.2: itens novos do SB/CB, ventilador, DSE e placa 2 do PC (so a faixa e a regra; IP real nao vai para o Git).

## Portao G - Documentos
- Diagramas v0.2/v0.4 ainda ligam o MES ao PLC (o editavel v0.5 ja esta certo).
- `IMPLANTACAO_ROTEIRO` v0.6 e `LEIA-ME_ENTREGA` v0.3 com as versoes novas; pacote .zip de entrega.

## Fora desta fase
- BANC-1 ventilador sem monitoramento: decisao de projeto para a reuniao (monitoramentos no PLC 1200 do banco).
- SQL Server (nada agora) e o item `rid` (adiado).

## Ordem proposta
A (PLC+fluxo+medidor) -> E junto com A2 -> B -> C -> D -> F -> G. O PLC e o Node-RED mudam juntos: o DB novo pede o fluxo novo logo depois.

## O que preciso do Reginaldo
1. OK deste plano (e do bloco SCL novo no PLC do banco, com backup antes).
2. Numero do bloco/DB novo a usar.
3. Dados do clique travado (B) e print da tabela (C6).
4. Valores do TIA do `ComOk` (F).
5. Decisoes do Portao D e se P3-E1/P3-E2 entram.
