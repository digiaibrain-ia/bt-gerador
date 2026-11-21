# PRM-001 · O banco cai sem vida do 1515

- **Módulo:** `fb_bancoEt200_16` / `fb_bancosEt200` (ET200) e `fb_bancoCarga16` / `fb_bancosCarga1200` (1200, rascunho)
- **Quem revisa a promessa:** Reginaldo (especialista em PLC)
- **Estado da promessa:** ET200 validada na bancada · 1200 **não verificada** (nunca compilou no TIA)

## A promessa
Se o PLC do banco ficar mais de **2 s** sem ver a "vida" do 1515 mudar, **todas as saídas das chaves e o "Ligar Banco" vão a FALSO**. Depois da queda, **nada religa sozinho**: cada chave só solta quando o 1515 manda o comando cair a FALSO e depois comanda de novo. O mesmo vale para o primeiro ciclo depois de a CPU partir.

## O que NÃO é prometido
- Que o medidor **perceba** o 1515 em STOP: hoje não há batimento do programa do 1515 (BK-PLC-02).
- No ET200, o **retorno da contatora é a própria saída** (provisório): não detecta contator travado ou colado. Só a 1200, com o contato auxiliar real, terá isso.

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| Bancada: 1515 em STOP | PC BT2 (16/11/2026) | saídas e "Ligar Banco" caíram |
| Bancada: cabo de rede puxado | PC BT2 (16/11/2026) | derrubou e só religou com novo comando (as chaves 2 e 6 deram problema na volta, ver registro da bancada) |
| `tests/fb/plc_et200.test.js` | repositório | regra "nada religa sozinho" transcrita do SCL |

## Se a promessa falhar
O operador veria saída ligada sem comando do 1515. Estado seguro esperado: saídas em FALSO. Avisar o Reginaldo e parar o ensaio. Carga de potência sempre desacoplada em teste.

## Provado × não provado
- Provado: ET200, na bancada, com retorno provisório.
- Não provado: a 1200 v0.17 (rascunho, não compilado).
