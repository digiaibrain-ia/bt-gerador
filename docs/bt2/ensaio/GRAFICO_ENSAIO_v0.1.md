# Página do gráfico do ensaio (segunda tela) — v0.1

**Arquivos:** `grafico_ensaio_v0.1.html` (página) · `modulos/analisador_grafico_v0.2.js` (módulo embutido na página) · `medidor_gerador_v1.9.80.html` (quem envia os dados).
**Natureza:** somente leitura. Não comanda chave, não escreve no PLC, não decide aprovação. Substitui o popup da v1.9.79.

## 1. Para que serve (equipe não técnica)
O operador clica em **📈 Analisar** no medidor; abre uma janela só com o gráfico. Ele arrasta a janela para o outro monitor e acompanha o ensaio ao vivo: carga × alvo, desvio, tensão, frequência, kW, com as tolerâncias desenhadas. Também abre um ensaio salvo (.json) para analisar depois.

## 2. Separação (regra 4)
| | Item |
|---|---|
| **(a) Implementado e testado (Playwright, dados simulados e medidor em modo simulado)** | Envio ao vivo medidor→página (dois canais), reinício quando o ensaio é zerado, parada automática do envio ao fechar a página, faixa de leitura (etapa, cronômetro, carga, desvio, tensão, frequência com dentro/fora), tema claro/escuro, tela cheia, salvar/abrir .json, janela móvel "Últimos 1/2/5/10 min" |
| **(b) Assumido** | Tolerâncias = as do medidor (`TOL`, `TENS_TOL`, `FREQ_TOL`; ±2,5 % tensão e ±5 % frequência vêm do print do relatório, origem a confirmar com a engenharia). Tensão comparada = média das tensões de linha. Banda de tensão/frequência só aparece se o nominal foi informado em "Dados do ensaio" |
| **(c) A desenvolver** | Teste com ensaio real no BT2; marcos do **Manual guiado** (a mensagem `marco` já existe, ninguém a envia ainda); relatório do tempo dentro da tolerância por etapa |

## 3. Protocolo de mensagens (contrato)
Canais: `window.opener.postMessage` (janela aberta pelo medidor) **e** `BroadcastChannel('bt2-grafico')`.

| Sentido | Mensagem | Significado |
|---|---|---|
| medidor → página | `{k:'lote', de:N, pts:[…], estado:{…}}` | pontos a partir do índice `N` + estado atual |
| medidor → página | `{k:'reset'}` | ensaio zerado: apagar tudo |
| medidor → página | `{k:'marco', t, rotulo}` | risco vertical (ex.: "Confirmou 50 %") |
| página → medidor | `{k:'oi'}` | batimento a cada 3 s: "há alguém vendo" (sem isto o medidor não envia, por 8 s) |
| página → medidor | `{k:'pede'}` | enviar tudo de novo (página nova ou lote perdido) |

**Sem registro duplicado ou perdido:** cada lote traz o índice do 1º ponto. Página ignora o que já tem; se `de` > pontos recebidos, pede tudo.

## 4. Dicionário de dados
**Ponto** `{t,c,s,e,n,va,vb,vc,hz,kw}`: `t` relógio do ensaio (s) · `c` carga medida (%) · `s` 0 contando/1 ajuste-estabilização/2 pausa · `e` índice da etapa · `n` 1 se o cronômetro estava contando · `va,vb,vc` tensões L1-L2, L2-L3, L3-L1 (V) · `hz` frequência · `kw` potência (origem: `MED` do medidor, lida do DSE).
**Estado** `{par:{modo,tol,tensTol,freqTol}, nominal:{tensao,freq}, etapas:[{alvo,min,nome}], plano:[{s,e,a}], et, el, cron, iniciado, run, fim, t}` — `plano` = `geom()` do medidor; `el` cronômetro da etapa; `cron` cronômetro total.
**Arquivo salvo:** `{formato:'bt2-grafico/1', salvoEm, estado, pts, marcos}`.

## 5. Lógica (o "porquê")
| Passo | Por quê |
|---|---|
| Medidor só envia com "oi" recente | Ninguém vendo = custo zero no ensaio |
| Dois canais ao mesmo tempo | `window.open` funciona sempre; BroadcastChannel cobre a página aberta à mão. Duplicatas são descartadas pelo índice |
| Ao ficar sem dados >4 s a página avisa "Sem dados há N s" e mantém o último gráfico | O operador nunca vê dado velho como se fosse atual |
| Estado dentro/fora com ícone + texto | Cor sozinha não pode carregar o significado |
| Salvar/abrir .json | Analisar depois, sem o medidor |

## 6. Instruções
1. Coloque `grafico_ensaio_v0.1.html` **na mesma pasta/endereço** do `medidor_gerador_v1.9.80.html`.
2. No medidor, clique **📈 Analisar** (permita pop-ups se o navegador bloquear). Arraste a janela para a segunda tela; **Tela cheia** ou F11.
3. Teste: modo Demo → iniciar ensaio → a faixa de leitura anda e o gráfico cresce. Zere o ensaio: a página recomeça. Feche a página: o medidor para de enviar.
**Riscos:** (i) abrir os dois por `file://` pode bloquear BroadcastChannel (a janela aberta pelo botão continua funcionando); (ii) a página não tem lógica de aprovação — só mostra.

## 7. Padrão de comentários
Igual a `ANALISADOR_GRAFICO_v0.1.md` §7.

## Glossário
**BroadcastChannel:** canal do navegador para abas da mesma origem conversarem. **Idempotente:** receber duas vezes dá o mesmo resultado. **Batimento:** aviso periódico "estou aqui". **Lote:** pacote de pontos novos.
