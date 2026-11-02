# Dicionário de dados — Setup das chaves (v0.1 · 25/10/2026)
Cada linha diz **o que é**, **de onde vem** e **por que existe**. Os nomes de tag seguem os arquivos de origem citados. Itens marcados **(proposta)** ainda não existem no PLC.

## 1. Medições do gerador (vindas do DSE)
| Nome no código | Tag de origem | Unidade | Significado | Por que existe |
|---|---|---|---|---|
| `kWMedido` | `db52_BancoTeste2_DSE.potenciaKw` (FB100) | kW | Potência ativa total do gerador agora | Base de todo o cálculo de kW real |
| `VaMedido` | `db52_BancoTeste2_DSE.tensaoL1L2` | V | Tensão L1-L2 | Entra na tensão média |
| `VbMedido` | `db52_BancoTeste2_DSE.tensaoL2L3` | V | Tensão L2-L3 | Idem |
| `VcMedido` | `db52_BancoTeste2_DSE.tensaoL3L1` | V | Tensão L3-L1 | Idem |
| `GeradorOperando` | `db52_BancoTeste2_DSE.ledManual` | BOOL | Gerador em START/operando | Só mede kW sem carga com o gerador ligado |
| `kw` (HTML) | tag `kw` do DSE | kW | Mesmo que `kWMedido`, na tela | Leitura do operador |
| `percCarga` (HTML) | tag `percCarga` do DSE | % | Carga relativa lida no DSE | Referência do operador |

## 2. Chaves do banco (DB do banco de carga)
| Nome | Onde fica | Tipo | Significado | Por que existe |
|---|---|---|---|---|
| `setup.nominal[1..16]` | DB150 / DB158 | REAL | kW de identificação de cada chave | Ponto de comparação do kW real |
| `setup.habilitada[1..16]` | DB150 / DB158 | BOOL | Chave liberada para operar | Permite tirar uma chave de uso (manutenção) |
| `cb.ligar[1..16]` | DB150 / DB158 | BOOL | Comando para ligar a chave | Saída do PLC para o contator |
| `sb.ligada[1..16]` | DB150 / DB158 | BOOL | Confirmação de chave ligada | Feedback real, não o comando |
| `setup.chaveSel` | DB150 / DB158 | INT | Chave em calibração (0 = nenhuma) | Só uma chave é calibrada por vez |
| `setup.salvar` | DB150 / DB158 | BOOL | Pulso para gravar o Setup | Evita gravar sem querer |
| `setup.setupOk[1..16]` | DB150 / DB158 | BOOL | Chave tem Setup salvo | Indica que o kW real vale |
| `setup.kwReal[1..16]` | DB150 / DB158 | REAL | kW real de cada chave | Espelho do chaveamento ativo |
| `setup.rMedidoOhm[1..16]` | DB150 / DB158 | REAL | R medido de cada chave | Espelho do chaveamento ativo |
| `setup.rTeoricoOhm[1..16]` | DB150 / DB158 | REAL | **Não calculado (sempre 0.0)** | Removido: V ref. desconhecida |
| `setup.setupData[1..16]` | DB150 / DB158 | DTL | Data e hora do Setup | Rastreabilidade |
| `cbBanco.ligar` | DB150 / DB158 (X460.0) | BOOL | Ligar/desligar o banco inteiro | Operação do banco |
| `sbBanco.seletoraAuto` | DB150 / DB158 (X462.0) | BOOL | Seletora física em Auto | Segurança do operador |
| `sbBanco.comEt200Ok` | DB150 / DB158 (X462.1) | BOOL | Comunicação com o ET200 OK | Se perde, o banco desliga |

## 3. Setup por tensão (proposta — DB152 / DB160 v0.2)
| Nome | Offset (assumido) | Tipo | Significado | Por que existe |
|---|---|---|---|---|
| `selV.tensaoSel` | DBW1356 | INT | Chaveamento ativo: 0 = não informado, 1 = 220 V, 2 = 380 V, 3 = 440 V | Diz qual tensão está sendo medida |
| `setupV.tensaoV[1..3]` | DBW0/2/4 | INT | 220, 380, 440 | Constantes de referência |
| `setupV.kwReal[c,k]` | DBD6 + 4·p | REAL | kW real por tensão e chave | Mesma chave muda de kW com a tensão |
| `setupV.rMedidoOhm[c,k]` | DBD198 + 4·p | REAL | R medido por tensão e chave | Teste: deve ser igual nas 3 tensões |
| `setupV.vMedidaV[c,k]` | DBD390 + 4·p | REAL | Tensão média no momento do Salvar | Permite recalcular V ref. |
| `setupV.baseKw[c,k]` | DBD582 + 4·p | REAL | kW sem carga usado no Salvar | Rastreabilidade do cálculo |
| `setupV.setupData[c,k]` | DBB774 + 12·p | DTL | Data do Salvar | Rastreabilidade |
| `setupV.setupOk[c,k]` | DBX1350.0 + p | BOOL | Chave tem Setup salvo nesta tensão | Evita usar valor de outra tensão |

`c` = chaveamento (1..3), `k` = chave (1..16), `p = (c−1)·16 + (k−1)`.

## 4. Grandezas calculadas
| Nome | Fórmula | Unidade | Por que existe |
|---|---|---|---|
| `vMedia` | (Va + Vb + Vc) / 3 | V | Uma tensão única para a resistência |
| `kwBase` (kW sem carga) | média móvel: base = base·0,8 + kW·0,2 (só com gerador ligado e nenhuma chave ligada) | kW | Desconta o próprio consumo do gerador |
| `kwRealChave` | kWMedido − kwBase | kW | Quanto a chave consome de verdade |
| `rMedido` | vMedia² / (kwRealChave · 1000) | Ω | Resistência equivalente por fase |
| `vRefEstimada` | vMedia · √(kwPlaca / kwRealChave) | V | Tensão em que a placa foi dada (estimativa) |
| `variacaoR` | (máx − mín) / média · 100 | % | Teste da premissa de resistência constante |

## 5. Estados e controles (HTML)
| Nome | Significado | Por que existe |
|---|---|---|
| `TENS[banco]` | Chaveamento ativo do banco (0..3) | Controla o que pode ser selecionado |
| `KWRT[chave][c]` | Setup da chave na tensão c | Guarda o Setup por tensão no navegador (Demo local) |
| `KWR[chave]` | Setup do chaveamento ativo | Visão usada pelas tabelas |
| `SEL` | Chave selecionada no Setup | Só uma por vez |
| `BASE_OK` | kW sem carga já medido | Sem ele, o kW real não é confiável |
