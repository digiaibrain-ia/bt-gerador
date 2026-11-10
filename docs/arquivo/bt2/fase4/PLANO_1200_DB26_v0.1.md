# Plano: PLC 1200 do banco de cargas e o DB26 do programador - v0.1 (06/11/2026) - AGUARDA OS DADOS DO REGINALDO
Nada aqui foi aplicado. E so o entendimento e o que falta para gerar os blocos.

## Entendimento (confirmar)
- O programador do PLC de carga (1200) ja fez um **DB26 com todos os bancos** e a logica dele. **Ele nao deve precisar alterar a programacao.**
- O 1515 continua mandando, por banco, o telegrama pedido/resposta (hoje 10 + 14 bytes) por PUT/GET para **um DB por banco no 1200** (um espelho por banco).
- Eu entrego um **FB por banco** (nao unificado) que **le o DB do banco (pedido) e alimenta o DB26** (comando, habilitar, ligar banco) e **le o DB26** (retorno SB, seletora, falhas) para preencher a **resposta** no DB do banco. Assim o DB26 e a logica dele ficam intactos.
- O uso de `DB_ANY` (so o numero do DB) e desejado, **se a CPU suportar** (confirmar pelos MLFBs).
- No ET200 (provisorio) o teste e so dos bancos **56 e 400**: bloco novo `fb_bancoEt200_16_v0.3` + chamadas `chamadas_ET200_BC56_BC400_v0.1` (ja escritos, nao compilados).

## O que o FB do 1200 faria (por banco)
1. Pedido -> DB26: `cmd[i]` (comando das chaves), `habPed[i]`, `ligarBanco`.
2. DB26 -> Resposta: `fbk[i]` (retorno SB), `seletoraAuto`, `vidaET` (vida do 1200), `habResp[i]`, `eco` (copia do `seq`), `falhaRetorno[i]`, `contatorColado[i]`.
3. Vigia de vida do 1515 (se a vida parar, derruba os comandos de saida do banco) e supervisao do retorno (SB some -> CB cai, T = 2 s) **se a logica do programador nao fizer isso**: ver pergunta 3.
4. Um dono por campo: o FB so escreve nos campos do DB26 que sao dele e so na resposta.

## O que preciso (nao tenho)
1. **DB26 do programador:** exportacao do DB (fonte `.db`/`.scl` ou tabela nome/tipo/offset), com o nome dos campos de cada banco. Quantas chaves por banco e como ele indexa os bancos.
2. **MLFB das duas CPUs** (1515 e a do banco de cargas; e do ET200 IM151-8 provisorio): eu pesquiso se suportam `PEEK`/`POKE`/`DB_ANY`, o firmware minimo e o limite do PUT/GET.
3. **Quem comanda as saidas e supervisiona o retorno no 1200?** Se a logica do programador ja energiza as contatoras a partir do DB26, a supervisao do SB (T = 2 s) e o "Permite" precisam entrar **nessa logica** (ou o FB ler a imagem das saidas e os contatos auxiliares). Preciso saber onde ficam.
4. **Quais campos do DB26 sao entrada para mim e quais sao saida** (quem escreve o que), para manter o escritor unico.
5. Numeros dos DBs por banco no 1200 (proposta: seguir a planilha; confirmar livres com o programador).
6. O mapeamento das entradas/saidas fisicas do FC4 do ET200 (BC56 e BC400), para fechar `chamadas_ET200_BC56_BC400`.

## Limites
Nao compilado; sem os MLFBs nao confirmo `PEEK`/`POKE`. O 212 bytes por PUT/GET nao e problema para o telegrama de 24 bytes.
