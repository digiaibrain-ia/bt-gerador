# Passo 5 · C2: recusa por capacidade e por degrau no backend (desligada por padrão) · 19/11/2026

Autorizado pelo Reginaldo (19/11/2026: "pode seguir na sequência 1, 2 e 3"). **Seguro por padrão: o arquivo vem com `"modo": "registrar"`, então nada é recusado até alguém mudar para `"recusar"` depois de validar na bancada com carga desacoplada.** Nada foi implantado no PC BT2.

## O que foi feito
- `nodered/config/bancos_capacidade.json` v0.2: `modo` (`registrar`|`recusar`), `gerador.kw100` / `kw100_max` (1000) / `validade_s` (180), `degrau.max_kw` (null) / `janela_s` (10).
- Fluxos novos (as versões do C1 ficam intactas): **chaves-56 v3.9, chaves-400 v3.8, chaves-550 v1.9, chaves-595 v1.9** e o fluxo **`gerador-capacidade-api-v1.0`** (`POST` e `GET /api/gerador/capacidade`). Gerador: `nodered/gerador/gerar_capacidade_c2_v0.1.py`.
- Regra (nó "limite de capacidade e degrau (C2)", entre "valida ligar" e a fila):
  - só avalia **ligar**; **desligar nunca é recusado**;
  - **sem kW a 100 % conhecido nunca recusa** (nem em modo recusar);
  - modo `recusar`: HTTP **409** `{ok:false, codigo:'LIMITE_EXCEDIDO'|'DEGRAU_EXCEDIDO', erro, totalKw, limiteKw, origemKw100}` e **o comando não vai ao PLC**; modo `registrar`: só anota no log do banco;
  - a soma é entre bancos; o kW usado é o do PLC (`Nominal`), com o espelho como reserva; fail-open (erro no nó = o comando segue).
- Fonte do `kw100` (decisão técnica): **arquivo (se preenchido) > valor informado pelo medidor (se recente) > nenhum**. O medidor (1.10.230) envia o kW a 100 % a cada 60 s e quando muda; o backend deixa de usar o valor após 180 s sem aviso. A rota exige a guarda D3 (só a própria tela, em JSON), aceita só número entre 0 e `kw100_max` (senão 400) e o `GET` mostra o valor efetivo e de onde veio.
- Degrau: soma da carga NOVA ligada dentro da janela; `max_kw` é **null** (não avaliado) porque não há valor normativo (BK-AUD-10): precisa da Engenharia.

## Prova
`tests/integracao/fase4/w_capacidade_c2.test.js` (16 testes, estável em 3 execuções): S3 (cada fluxo C2 só difere do C1 no nó de limite, na validação do arquivo e no padrão embutido; padrão embutido = arquivo inteiro), R1 a R10 (registrar aceita; recusar dá 409 e o PLC não recebe; desligar sempre passa; sem kw100 nunca recusa; rota do medidor com D3, 400 e GET; arquivo vale mais que o medidor; validade; degrau; soma entre bancos; arquivo ausente/inválido; arquivo do repositório). Contra-prova: com os fluxos do C1 sete testes falham.
Esteira inteira na 1.10.230 e nos fluxos novos: unitários 139/139; integração 52 arquivos verdes (0 falhas); e2e 24/25 (só `pacote_ia`). `f10` passou a cobrir a rota nova.

## Riscos e limites
- **Nunca confiar no cliente:** o `kw100` que o medidor informa é do próprio cliente. Mitigações: D3, teto `kw100_max`, validade curta, e o valor do arquivo sempre vence. **Risco residual:** um cliente na LAN com a origem certa pode afrouxar o limite enquanto o arquivo estiver `null`. A correção definitiva é o limite no PLC (BK-AUD-04) ou o backend validar o valor contra o catálogo. Em modo `registrar` isso não tem efeito algum.
- O medidor continua com o próprio limite; o backend é a segunda barreira, não a primeira.
- Não testado no PLC/ET200 reais nem no PC BT2. Os tempos e a leitura de `Nominal` reais precisam da bancada.
- Passar para `"modo": "recusar"` é decisão do Reginaldo, depois de: (1) preencher `kw100` (ou conferir `GET /api/gerador/capacidade`), (2) validar na bancada com carga desacoplada que um comando acima do limite volta 409 e que nada recusa abaixo dele.
