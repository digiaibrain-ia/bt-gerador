# Medidor 1.10.121 — clique na sugestão, Setup redesenhado, chaveamento liga/desliga · flows chaves v2.6 — 30/10/2026

## (a) Implementado e testado (Playwright, sem erro de JS)
- **Patamar Manual esperando o Aplicar:** clique do operador numa chave (`e.isTrusted`) só tira/põe a chave na sugestão (`G.sel`/`G.sug`), sem POST ao PLC. Cliques programáticos (Abrir TODAS, parada por falha do DSE, plano do Aplicar) passam direto — teste: clique real interceptado, `t.click()` do sistema não.
- **Setup:** fórmulas do kW real e da resistência em caixas grandes, cada termo nomeado, resultado em destaque, valor pisca ao mudar (mesmos ids; lógica de preenchimento intacta).
- **Chaveamento 220/380/440:** clicar na tensão ativa desliga ("não informado"). Demo local validado (220 → liga, 220 de novo → desliga).

## (b) Assumido
- Desligar no PLC = `POST /api/chaves/{56|400}/tensao {tensao:0}` → `TensaoSel = 0` (valor 0 já existe no contrato do GET: tensaoSel 0..3, ver chaves-56-api-v2.5.json). A rota v2.5 recusava 0; os flows **v2.6** só trocam a validação (`mapa {0:0,…}`; `idx === undefined`). O resto (conferência da releitura) já comparava `TensaoSel === _idx`. **Não testado no PLC real.**
- Sem o flow v2.6, o HTML avisa "desligar exige o flow v2.6".

## Importar o flow v2.6 (como na v2.5)
Apague a aba antiga do banco (chv2 = BC56, chv3 = BC400) e importe `chaves-56-api-v2.6.json` / `chaves-400-api-v2.6.json`; Deploy. Offsets de DB continuam os ASSUMIDOS da v2.5 (conferir no TIA).

## (c) A fazer
Teste em campo; vários bancos (ver resposta sobre 4 bancos: lista única de bancos no HTML + FBs/flows parametrizados).
