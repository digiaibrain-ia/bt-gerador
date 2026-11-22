# Padrão — Siglas de Card e Subcard (23/10/2026)

**Objetivo**: dar um nome curto e único para cada Card e para os popups/subcards de cada um, só para facilitar a comunicação entre nós (pedidos de correção, relatos de bug). **Não muda nenhum ID do HTML** — os elementos continuam com os nomes que já têm no código (`dlgChSetup`, `dlgDemo`, etc.); as siglas abaixo são uma camada de documentação, não de implementação.

As siglas de Card (`modo`, `ens`, `gra`, `med`, `bco`, `reg`, `app`) já existem no HTML — são os valores de `CARDS`/`SEC`/`CAT` do módulo de Mensagens e falhas (`medidor_gerador_v1.9.68.html`). As de subcard são novas, só deste doc.

## Cards (tela principal)

| Sigla | Card | Observação |
|---|---|---|
| `modo` | Modo | bolinhas PLC/Node-RED/HTML, fonte dos dados |
| `ens` | Etapas do ensaio | cronômetro, etapas, salvar |
| `gra` | Gráfico | carga × tempo |
| `med` | Leitura das grandezas | DSE — tensão, corrente, água, motor |
| `bco` | Cargas · banco de carga | chaves BC56/BC400 |
| `reg` | Registro do ensaio | DB53, preenchimento, etapas gravadas |
| `app` | Aplicação (geral) | sem card próprio — erro interno (`SIS-001`) |

## Subcards (popups dentro de um Card)

| Sigla | Popup | Dentro de | ID real no HTML |
|---|---|---|---|
| `bco.HD` | Chaves · Habilitar/Desabilitar | Cargas | `dlgChHD` |
| `bco.SU` | Setup (kW real) | Cargas | `dlgChSetup` |
| `bco.LOG` | Log da comunicação das chaves | Cargas | `dlgLogs` |
| `ens.DAD` | Dados do ensaio | Etapas do ensaio | `dlgDados` |
| `modo.POP` | ⚙ Modo (tipo/salvamento/gráfico/modo Node-RED) | Modo | `dlgModo` |
| `med.MOT` | Falhas do motor | Leitura das grandezas | `dlgMotor` |
| `med.FX` | Faixas de alarme | Leitura das grandezas | `dlgParam` (Faixas) e `dlgAgua` (água) — corrigido 23/10: `dlgFaixaAgua` não existe no HTML |

## Ferramentas de desenvolvedor (sem Card — atrás da senha do Demo)

| Sigla | Popup | ID real no HTML |
|---|---|---|
| `DEV.DEM` | Demo e Servidor | `dlgDemo` |
| `DEV.CARDS` | 🧪 Cards x flow | `dlgDevCards` |
| `DEV.OBS` | 📋 Gerenciador de logs | arquivo à parte `gerenciador_logs_v1.html` (outra aba). O botão `bDevObs` e a caixa `obsBox` (Abertura Manual/Automático, "Enviar eventos ao Node-RED") ficam dentro de `DEV.DEM` |

Separado de `app` de propósito: `app` já tem significado reservado no código (erro interno da tela, `SIS-001`); `DEV.*` é só ferramenta, nunca aparece pro operador.

## Como usar

Num pedido de correção, em vez de descrever a tela ("aquele popup que mostra o kW real"), usar a sigla: *"corrigir `bco.SU`: o campo X não está validando Y"*. Ajuda a apontar rápido o trecho certo do HTML sem ambiguidade entre Cards parecidos (ex.: `ens.DAD` × `reg`, que são coisas diferentes mas relacionadas).

---
## Campo `card` dos eventos de log (DEV.OBS, HTML v1.9.73)
O logger preenche `card` com estas mesmas siglas: popup primeiro (`bco.SU`, `bco.HD`, `bco.LOG`, `ens.DAD`, `modo.POP`, `med.MOT`, `med.FX`, `DEV.DEM`, `DEV.CARDS`, `reg`, `gra`, `ens`), depois a seção da tela (`modo`, `ens`, `gra`, `med`, `bco`, `reg`); o que não pertence a card vira `app`. Transições de estado usam: modo→`DEV.DEM`, ensaio/etapa→`ens`, chaves→`bco`, chave do Setup→`bco.SU`, bolinhas de comunicação→`modo`. Chamadas de API: `/api/chaves`→`bco`, `/api/ensaio`→`reg`, `/api/gerador`→`med`, `/api/logs`→`bco.LOG`. O id real do elemento vai em `det.area`.

---
## Texto dos eventos de chave nos logs (HTML v1.9.74, 23/10/2026)
Até a v1.9.73 o log dizia "clique na chave #0" e "chaves ligadas [0,1,2]" (índice **global, base 0**, os dois bancos em fila) enquanto a API/flow usam `indice` **1-based por banco** (`{"indice":1}`). Isso confundiu a leitura do log (BC56 × BC400). Agora: "clique na chave **BC56 #3 de 13**", "chaves ligadas (verde): **BC56 1,2 · BC400 1**" (ou "nenhuma"), "chave no Setup: **BC400 2**". O número depois do banco é a **posição dentro do banco** = `indice` da API = bit n−1 de `cb.ligar[]`. `det.chave` continua com o índice global só para depuração; `det.banco` e `det.pos` trazem banco e posição. O `est` de cada evento ganhou `chL`, `cmdL`, `setupL` (mesmo texto) e `sel56`, `lig56`, `sel400`, `lig400` (seletora e "Ligar banco" simulados). Botões sem id passam a dizer o popup: `clique em botão "✕" [dlgChHD]`. O gerenciador v1.1 mostra os logs antigos com a marca "índice global base 0, HTML ≤ 1.9.73".

---
**Atualizado em**: 23/10/2026
