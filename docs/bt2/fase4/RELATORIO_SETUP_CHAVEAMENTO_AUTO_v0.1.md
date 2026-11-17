# Relatorio - chaveamento do Setup vindo dos Dados do ensaio (medidor 1.10.172) - v0.1 - 06/11/2026

Pedido do Reginaldo: o chaveamento (220/380/440 V) deve aparecer sozinho no card Setup pela tensao do gerador dos **Dados do ensaio**, sem selecao manual (o Setup so funciona com o gerador ligado e a configuracao ja foi escolhida nos Dados). Para 208 V ou 480 V: **so sinalizacao**; ele vai tirar a duvida com o operador.
Arquivo novo: `dashboard/ferramentas/medidor_gerador_v1.10.172.html` (gerador `dashboard/gerador/gerar_medidor_v1.10.172_v0.1.py`; a 1.10.171 nao foi tocada). O catalogo aponta para a 1.10.172.

## Como funciona
- **Modo PLC:** a tela informa o chaveamento ao PLC sozinha (`POST /tensao`), **so com os Dados do ensaio CONFIRMADOS na sessao** (o valor padrao 220 do formulario nao conta) e uma tensao 220/380/440 que o banco atenda. Se o gerador mudar, o chaveamento acompanha.
- **Botoes 220/380/440:** somente leitura (mostram o ativo). O chip diz a origem ("definido pela tensao do gerador nos Dados do ensaio").
- **208 V / 480 V:** o Setup mostra "Gerador em 208 V (Dados do ensaio) - sem chaveamento 220/380/440 correspondente: so sinalizacao". **Nada e gravado no PLC** e o Setup continua sem salvar (o fluxo exige chaveamento). A definir.
- **Dados nao confirmados:** chip "NAO INFORMADO - confirme os Dados do ensaio". Nao grava.
- **Chave selecionada no Setup:** o chaveamento nao troca (o fluxo recusa); a tela avisa para desmarcar.
- Protecao contra laco: repete o mesmo valor so apos 10 s. Demo local continua como antes.

## Provas
`tests/integracao/fase4/e_setup_chaveamento_auto.test.js`: 4/4 passam na 1.10.172 e a bateria **falha na 1.10.171**. Regressao do front (f10, f11, s1, s3, A3, B, C, D, Setup): **54/54 passam**.

## Limites
- O valor vem do que foi digitado/escolhido nos Dados do ensaio: se estiver errado, o chaveamento informado fica errado. O banco (1200) deve conferir com o chaveamento fisico dele.
- Nao testado: troca de gerador com chave selecionada no Setup (so o aviso previsto) e o comportamento com o DB de competencia do 1200 (ainda nao existe).
- A decisao para 208/480 (bloquear, liberar ou chaveamento proprio) depende do operador.
