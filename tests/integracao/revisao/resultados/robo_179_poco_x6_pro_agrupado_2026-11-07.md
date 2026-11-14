# Registros do medidor — ensaio_20261107_171216_DEMO_DSE_4520_DEMO_4HTAA4_3_G21_QYI_274C_SA

- Gerado em: 07/11/2026, 17:12:16 · Medidor v1.10.179 · Central de registros v0.3
- Modo: DEMO
- Destino: Downloads (arquivo agrupado)
- Ensaio: finalizado
- Ocorrências ativas: 2 (CHV-006 BC56, CHV-006 BC400)

## Arquivos
- `alertas/alertas_falhas_historico.csv` (58 caracteres)
- `alertas/alertas_falhas_ativas.txt` (982 caracteres)
- `monitoramento/monitoramento_instantaneo.json` (19534 caracteres)
- `amostras/aprendizado_DEMO_DSE_4520_DEMO_4HTAA4_3_G21_QYI_274C_SA_20261107_1712_resumo.txt` (12908 caracteres)
- `amostras/aprendizado_DEMO_DSE_4520_DEMO_4HTAA4_3_G21_QYI_274C_SA_20261107_1712_amostras.csv` (44424 caracteres)
- `logs/eventos_tela.jsonl` (720686 caracteres)
- `robo/dev_operador_oculto_relatorio.md` (31490 caracteres)
- `ensaio/dados_do_ensaio.json` (1223 caracteres)

Para a engenharia: cole este arquivo (ou o agrupado) na conversa. Nada aqui comanda PLC, DSE ou chaves.


---

## alertas/alertas_falhas_historico.csv

```
Data e hora;Evento;Tipo;Card;Código;Referência;Texto;Modo
```

---

## alertas/alertas_falhas_ativas.txt

```
DIAGNÓSTICO — Medidor do Gerador v1.10.179 — 07/11/2026, 17:12:16
Código: F-CHV-006 · BC56 (Falha) · Card: Banco de Cargas · desde 17:05:18 · 1 vez(es) · ATIVA
Efeito: Banco sem leitura do PLC: o estado das chaves é desconhecido.
Texto: BC56: sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com "?")
Causa 1: O mesmo de COM-001 (Node-RED, rede ou DB).
  Teste: Veja o roteiro de COM-001.
  Solução [No PC / Node-RED]: Siga o roteiro de COM-001.

----------------------------------------

DIAGNÓSTICO — Medidor do Gerador v1.10.179 — 07/11/2026, 17:12:16
Código: F-CHV-006 · BC400 (Falha) · Card: Banco de Cargas · desde 17:05:18 · 1 vez(es) · ATIVA
Efeito: Banco sem leitura do PLC: o estado das chaves é desconhecido.
Texto: BC400: sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com "?")
Causa 1: O mesmo de COM-001 (Node-RED, rede ou DB).
  Teste: Veja o roteiro de COM-001.
  Solução [No PC / Node-RED]: Siga o roteiro de COM-001.
```

---

## monitoramento/monitoramento_instantaneo.json

```
{
  "gerado": "2026-11-07T20:12:16.688Z",
  "medidor": "1.10.179",
  "demo": true,
  "link": {
    "dse": {
      "ok": true,
      "http": 200,
      "ts": 1794082336454,
      "diag": {
        "versaoApi": "3.1",
        "unitId": 10,
        "blocos": {
          "A": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "B": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "D": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "R": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "C": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "E": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "L": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "J": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "G1": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "G2": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "V": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "S1": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          },
          "S2": {
            "idade": 0.4,
            "falhas": 0,
            "suspenso": false,
            "ultimoErro": null
          }
        },
        "statusModbus": "active",
        "errosModbusTotal": 0,
        "ultimoErro": null,
        "ultimoErroHa": null,
        "ultimoErroBloco": null
      }
    },
    "chv": {
      "ok": false,
      "http": 0,
      "ts": 0,
      "msg": ""
    },
    "banco": {
      "56": {
        "ok": false,
        "ts": 1794081926427,
        "erro": "informe a URL do Node-RED do PLC no botão Demo (campo Servidor)",
        "status": 0,
        "flow": null
      },
      "400": {
        "ok": false,
        "ts": 1794081926427,
        "erro": "informe a URL do Node-RED do PLC no botão Demo (campo Servidor)",
        "status": 0,
        "flow": null
      }
    }
  },
  "bancos": [
    {
      "id": "56",
      "leituraOk": false,
      "seletora": "auto",
      "bancoLigado": true
    },
    {
      "id": "400",
      "leituraOk": false,
      "seletora": "auto",
      "bancoLigado": true
    }
  ],
  "chaves": [
    {
      "i": 0,
      "banco": "56",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 1,
      "banco": "56",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 2,
      "banco": "56",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 3,
      "banco": "56",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 4,
      "banco": "56",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 5,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 6,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 7,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 8,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 9,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 10,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 11,
      "banco": "56",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 12,
      "banco": "56",
      "kw": 3,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 13,
      "banco": "400",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 14,
      "banco": "400",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 15,
      "banco": "400",
      "kw": 10,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 16,
      "banco": "400",
      "kw": 10,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 17,
      "banco": "400",
      "kw": 10,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 18,
      "banco": "400",
      "kw": 10,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 19,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 20,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 21,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 22,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 23,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 24,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 25,
      "banco": "400",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 26,
      "banco": "59,5",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 27,
      "banco": "59,5",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 28,
      "banco": "59,5",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 29,
      "banco": "59,5",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 30,
      "banco": "59,5",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 31,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 32,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 33,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 34,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 35,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 36,
      "banco": "59,5",
      "kw": 4,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 37,
      "banco": "59,5",
      "kw": 3,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 38,
      "banco": "59,5",
      "kw": 3,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 39,
      "banco": "59,5",
      "kw": 2,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 40,
      "banco": "59,5",
      "kw": 1,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 41,
      "banco": "59,5",
      "kw": 0.5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 42,
      "banco": "59,5",
      "kw": 0.5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 43,
      "banco": "59,5",
      "kw": 0.5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 44,
      "banco": "550",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 45,
      "banco": "550",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 46,
      "banco": "550",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 47,
      "banco": "550",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 48,
      "banco": "550",
      "kw": 5,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 49,
      "banco": "550",
      "kw": 25,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 50,
      "banco": "550",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 51,
      "banco": "550",
      "kw": 50,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 52,
      "banco": "550",
      "kw": 100,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 53,
      "banco": "550",
      "kw": 100,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 54,
      "banco": "550",
      "kw": 100,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    },
    {
      "i": 55,
      "banco": "550",
      "kw": 100,
      "habilitada": true,
      "comando": false,
      "retorno": false,
      "falhaRetorno": false,
      "contatorColado": false
    }
  ],
  "ocorrenciasAtivas": [
    {
      "cod": "CHV-006",
      "tipo": "f",
      "card": "bco",
      "ref": "BC56",
      "txt": "BC56: sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com \"?\")",
      "desde": "2026-11-07T20:05:18.412Z",
      "vezes": 1
    },
    {
      "cod": "CHV-006",
      "tipo": "f",
      "card": "bco",
      "ref": "BC400",
      "txt": "BC400: sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com \"?\")",
      "desde": "2026-11-07T20:05:18.412Z",
      "vezes": 1
    }
  ],
  "ensaio": {
    "iniciado": true,
    "rodando": false,
    "finalizado": true,
    "etapa": 5
  },
  "dse": {
    "ok": true,
    "idadeSegundos": 0.2,
    "modo": "MANUAL",
    "dse": {
      "modeloConfigurado": "DSE 4520",
      "familiaAlarmes": "4xxx",
      "fabricanteCodigo": 2,
      "modeloCodigo": 4520,
      "serie": 12345678,
      "modeloTexto": "DSE4520 MKII",
      "variante": "",
      "firmwareCodigo": 1792,
      "firmware": "7.0"
    },
    "tensaoL1L2": 0,
    "tensaoL2L3": 0,
    "tensaoL3L1": 0,
    "correnteL1": 0,
    "correnteL2": 0,
    "correnteL3": 0,
    "kw": 0,
    "tempAguaC": 46.120644831833125,
    "rpm": 0,
    "bateria": 25.60846724013905,
    "percCarga": 0,
    "leds": {
      "stop": true,
      "manual": false,
      "teste": false,
      "auto": false,
      "disjuntorGerador": false,
      "geradorDisponivel": false
    },
    "saidaCombustivel": false,
    "saidaPartida": false,
    "alternador": 0,
    "tempOleoC": 54,
    "tempAguaF": 115,
    "pressaoOleoKpa": 0,
    "pressaoOleoBar": 0,
    "nivelCombustivel": 78,
    "frequencia": 0,
    "tensaoL1N": 0,
    "tensaoL2N": 0,
    "tensaoL3N": 0,
    "tensaoFN": 0,
    "tensaoFF": 0,
    "tensaoFNMedia": 0,
    "tensaoFFMedia": 0,
    "corrente": 0,
    "correnteTerra": 0,
    "desequilibrioTensaoPct": null,
    "desequilibrioCorrentePct": null,
    "rotacaoFases": "L1-L2-L3",
    "kwL1": 0,
    "kwL2": 0,
    "kwL3": 0,
    "kvaL1": 0,
    "kvaL2": 0,
    "kvaL3": 0,
    "kvarL1": 0,
    "kvarL2": 0,
    "kvarL3": 0,
    "kva": 0,
    "kvar": 0,
    "fpL1": null,
    "fpL2": null,
    "fpL3": null,
    "fp": null,
    "percKvar": 0,
    "kwh": 1234.5,
    "kwhNegativo": 0,
    "kvah": 1290.2,
    "kvarh": 210.4,
    "horasMotor": 456.5,
    "horasMotorSegundos": 1643485,
    "partidas": 87,
    "relogioDse": "2026-11-07T20:12:16.497Z",
    "modoCodigo": 2,
    "temAlarme": false,
    "alarmeAviso": false,
    "alarmeDesligamento": false,
    "alarmeTripEletrico": false,
    "alarmeDesligamentoControlado": false,
    "alarmes": [],
    "ecu": {
      "pressaoRefrigeranteKpa": 0,
      "pressaoCombustivelKpa": 0,
      "pressaoTurboKpa": 0,
      "tempAdmissaoC": 41,
      "tempEscapeC": 0,
      "consumoLh": 0,
      "pressaoAtmosfericaKpa": 101,
      "tempCombustivelC": 35,
      "torquePct": 0,
      "torqueDemandadoPct": 0,
      "cargaNaRotacaoPct": 0,
      "posicaoAceleradorPct": 0,
      "nivelOleoPct": 82,
      "pressaoCarterKpa": 0.05,
      "nivelRefrigerantePct": 96
    },
    "falhasEcu": {
      "quantidade": 0,
      "lampadas": {
        "mil": "apagada",
        "parada": "apagada",
        "aviso": "apagada",
        "protecao": "apagada"
      },
      "codigos": [],
      "truncado": false
    },
    "leituraEm": "2026-11-07T20:12:16.497Z",
    "geradoEm": "2026-11-07T20:12:16.497Z",
    "diag": {
      "versaoApi": "3.1",
      "unitId": 10,
      "blocos": {
        "A": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "B": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "D": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "R": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "C": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "E": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "L": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "J": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "G1": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "G2": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "V": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "S1": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        },
        "S2": {
          "idade": 0.4,
          "falhas": 0,
          "suspenso": false,
          "ultimoErro": null
        }
      },
      "statusModbus": "active",
      "errosModbusTotal": 0,
      "ultimoErro": null,
      "ultimoErroHa": null,
      "ultimoErroBloco": null
    }
  }
}
```

---

## amostras/aprendizado_DEMO_DSE_4520_DEMO_4HTAA4_3_G21_QYI_274C_SA_20261107_1712_resumo.txt

```
REGISTRO DE APRENDIZADO - Medidor do Gerador v1.10.179
Gerado em 07/11/2026 17:12:16
Sessões: 4
======================================================================

SESSÃO S20261103_235058  (SIMULAÇÃO - DEMO)
  DSE: [DEMO] DSE 4520   Gerador: [DEMO] 4HTAA4.3-G21 + QYI 274C SA   Série: DZFA00045   Versão: 773323
  Início: 03/11/2026 23:50:58   Fim: 03/11/2026 23:52:31   Duração: 01:33
  (Os tempos deste resumo são em segundos de registro: 1 amostra por segundo.)
  Amostras: 88   Sem dado: 0   Tipo de ensaio no início: Padrão
  Parâmetros no início: tolerância ±10,0%, estabilidade 1,5 a 4,5 s, média 2,0 s, liberar SALVAR 98%, mín. em 100%: 5,0 min, desvio tensão ±2,5%
  Etapas planejadas (alvo%/min): 0/2  30/1  50/1  100/5  107/2  0/1
  Água: início 18,9 °C, máxima 72,8 °C, fim 50,3 °C; tempo em atenção 00:00, crítico 00:00

  POR ETAPA (valores na ordem da tela; tempos em mm:ss)
   Etapa 1 (alvo 0%): relógio 00:00 a 00:12, entrou na faixa após 00:00, contando 00:12, estabilizando 00:01
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 0,0 kW, tensão média 221,1 V, corrente média 0 A, água 26,1 °C, rpm 1800, freq 60,00 Hz, fp 1,00
   Etapa 2 (alvo 30%): relógio 00:13 a 00:19, entrou na faixa após 00:01, contando 00:06, estabilizando 00:01
     carga média 29,65% (mín 28,77, máx 30,47, desvio 0,62), maior excesso sobre o alvo 0,47 pt
     fim da etapa: 48,0 kW, tensão média 221,2 V, corrente média 60 A, água 31,5 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 3 (alvo 50%): relógio 00:20 a 00:30, entrou na faixa após 00:03, contando 00:06, estabilizando 00:05
     carga média 49,43% (mín 48,82, máx 49,94, desvio 0,43), maior excesso sobre o alvo 2,35 pt
     fim da etapa: 88,5 kW, tensão média 221,3 V, corrente média 110 A, água 37,1 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 4 (alvo 100%): relógio 00:31 a 01:06, entrou na faixa após 00:06, contando 00:30, estabilizando 00:06
     carga média 99,27% (mín 98,03, máx 99,98, desvio 0,49), maior excesso sobre o alvo -0,02 pt
     fim da etapa: 187,6 kW, tensão média 221,4 V, corrente média 233 A, água 67,0 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 5 (alvo 107%): relógio 01:07 a 01:21, entrou na faixa após 00:00, contando 00:11, estabilizando 00:03
     carga média 106,85% (mín 105,57, máx 107,63, desvio 0,54), maior excesso sobre o alvo 0,63 pt
     fim da etapa: 202,0 kW, tensão média 221,4 V, corrente média 251 A, água 71,2 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 6 (alvo 0%): relógio 01:23 a 01:33, entrou na faixa após 00:02, contando 00:03, estabilizando 00:01
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 28,8 kW, tensão média 221,1 V, corrente média 36 A, água 59,5 °C, rpm 1799, freq 60,00 Hz, fp 1,00

  PATAMARES DE CARGA (carga parada por 8 s ou mais) e TRANSIÇÕES
   1) início 00:00, duração 00:13, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW
      transição para 99,3% em 24 s
   2) início 00:37, duração 00:30, carga 99,3% (mín 98,0, máx 100,0), 187,8 kW
      transição para 106,8% em 3 s
   3) início 01:10, duração 00:13, carga 106,8% (mín 105,6, máx 107,6), 202,1 kW
      transição para 0,0% em 2 s
   4) início 01:25, duração 00:08, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW

  EVENTOS (tempo desde o início da sessão)
   00:00  Registro iniciado
   00:13  Etapa 2 iniciada (alvo 30%)
   00:14  Etapa salva (1 de 6)
   00:20  Etapa 3 iniciada (alvo 50%)
   00:21  Etapa salva (2 de 6)
   00:31  Etapa 4 iniciada (alvo 100%)
   00:32  Etapa salva (3 de 6)
   01:07  Etapa 5 iniciada (alvo 107%)
   01:08  Etapa salva (4 de 6)
   01:23  Etapa 6 iniciada (alvo 0%)
   01:27  Etapa salva (5 de 6)
   01:31  Todas as etapas salvas (aguardando FINALIZAR)
   01:32  Etapa salva (6 de 6)
   01:33  Registro encerrado (ensaio finalizado)
----------------------------------------------------------------------

SESSÃO S20261107_170549  (SIMULAÇÃO - DEMO)
  DSE: [DEMO] DSE 4520   Gerador: [DEMO] 4HTAA4.3-G21 + QYI 274C SA   Série: DZFA00045   Versão: 773323
  Início: 07/11/2026 17:05:49   Fim: 07/11/2026 17:06:43   Duração: 00:54
  (Os tempos deste resumo são em segundos de registro: 1 amostra por segundo.)
  Amostras: 54   Sem dado: 0   Tipo de ensaio no início: Padrão
  Parâmetros no início: tolerância ±10,0%, estabilidade 1,5 a 4,5 s, média 2,0 s, liberar SALVAR 98%, mín. em 100%: 5,0 min, desvio tensão ±2,5%
  Etapas planejadas (alvo%/min): 0/2  30/1  50/1  100/5  107/2  0/1
  Água: início 29,7 °C, máxima 29,7 °C, fim 28,9 °C; tempo em atenção 00:00, crítico 00:00

  PATAMARES DE CARGA (carga parada por 8 s ou mais) e TRANSIÇÕES
   1) início 00:00, duração 00:53, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW

  EVENTOS (tempo desde o início da sessão)
   00:00  Registro iniciado
   00:54  Registro encerrado
----------------------------------------------------------------------

SESSÃO S20261107_170749  (SIMULAÇÃO - DEMO)
  DSE: [DEMO] DSE 4520   Gerador: [DEMO] 4HTAA4.3-G21 + QYI 274C SA   Série: OPS-170748   Versão: dev/operador oculto
  Início: 07/11/2026 17:07:49   Fim: 07/11/2026 17:09:06   Duração: 01:17
  (Os tempos deste resumo são em segundos de registro: 1 amostra por segundo.)
  Amostras: 77   Sem dado: 0   Tipo de ensaio no início: Padrão
  Parâmetros no início: tolerância ±10,0%, estabilidade 1,5 a 4,5 s, média 2,0 s, liberar SALVAR 98%, mín. em 100%: 5,0 min, desvio tensão ±2,5%
  Etapas planejadas (alvo%/min): 0/2  30/1  50/1  100/5  107/2  0/1
  Água: início 29,7 °C, máxima 73,8 °C, fim 53,9 °C; tempo em atenção 00:00, crítico 00:00

  POR ETAPA (valores na ordem da tela; tempos em mm:ss)
   Etapa 1 (alvo 0%): relógio 00:01 a 00:12, entrou na faixa após 00:00, contando 00:12, estabilizando 00:00
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 0,0 kW, tensão média 221,1 V, corrente média 0 A, água 31,9 °C, rpm 1800, freq 60,00 Hz, fp 1,00
   Etapa 2 (alvo 30%): relógio 00:13 a 00:19, entrou na faixa após 00:00, contando 00:06, estabilizando 00:01
     carga média 30,05% (mín 29,34, máx 30,53, desvio 0,50), maior excesso sobre o alvo 0,53 pt
     fim da etapa: 30,1 kW, tensão média 221,2 V, corrente média 71 A, água 34,4 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 3 (alvo 50%): relógio 00:20 a 00:25, entrou na faixa após 00:00, contando 00:06, estabilizando 00:00
     carga média 50,88% (mín 50,59, máx 51,18, desvio 0,23), maior excesso sobre o alvo 1,18 pt
     fim da etapa: 50,8 kW, tensão média 221,3 V, corrente média 120 A, água 37,8 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 4 (alvo 100%): relógio 00:26 a 00:56, entrou na faixa após 00:00, contando 00:30, estabilizando 00:01
     carga média 101,68% (mín 101,04, máx 102,43, desvio 0,38), maior excesso sobre o alvo 2,43 pt
     fim da etapa: 101,5 kW, tensão média 221,5 V, corrente média 239 A, água 67,6 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 5 (alvo 107%): relógio 00:57 a 01:08, entrou na faixa após 00:00, contando 00:12, estabilizando 00:00
     carga média 109,27% (mín 108,75, máx 109,83, desvio 0,35), maior excesso sobre o alvo 2,83 pt
     fim da etapa: 109,2 kW, tensão média 221,5 V, corrente média 257 A, água 72,3 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 6 (alvo 0%): relógio 01:09 a 01:17, entrou na faixa após 00:00, contando 00:06, estabilizando 00:00
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 0,0 kW, tensão média 221,0 V, corrente média 0 A, água 62,0 °C, rpm 1800, freq 60,00 Hz, fp 1,00

  PATAMARES DE CARGA (carga parada por 8 s ou mais) e TRANSIÇÕES
   1) início 00:01, duração 00:11, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW
      transição para 101,7% em 14 s
   2) início 00:26, duração 00:30, carga 101,7% (mín 101,0, máx 102,4), 101,6 kW
      transição para 109,3% em 1 s
   3) início 00:57, duração 00:11, carga 109,3% (mín 108,8, máx 109,8), 109,3 kW
      transição para 0,0% em 1 s
   4) início 01:09, duração 00:08, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW

  EVENTOS (tempo desde o início da sessão)
   00:00  Registro iniciado
   00:13  Etapa 2 iniciada (alvo 30%)
   00:14  Etapa salva (1 de 6)
   00:20  Etapa 3 iniciada (alvo 50%)
   00:21  Etapa salva (2 de 6)
   00:26  Etapa 4 iniciada (alvo 100%)
   00:27  Etapa salva (3 de 6)
   00:57  Etapa 5 iniciada (alvo 107%)
   00:58  Etapa salva (4 de 6)
   01:09  Etapa 6 iniciada (alvo 0%)
   01:10  Etapa salva (5 de 6)
   01:15  Todas as etapas salvas (aguardando FINALIZAR)
   01:16  Etapa salva (6 de 6)
   01:17  Registro encerrado (ensaio finalizado)
----------------------------------------------------------------------

SESSÃO S20261107_170911  (SIMULAÇÃO - DEMO)
  DSE: [DEMO] DSE 4520   Gerador: [DEMO] 4HTAA4.3-G21 + QYI 274C SA   Série: OPS-170910   Versão: dev/operador oculto
  Início: 07/11/2026 17:09:11   Fim: 07/11/2026 17:10:28   Duração: 01:17
  (Os tempos deste resumo são em segundos de registro: 1 amostra por segundo.)
  Amostras: 77   Sem dado: 0   Tipo de ensaio no início: Padrão
  Parâmetros no início: tolerância ±10,0%, estabilidade 1,5 a 4,5 s, média 2,0 s, liberar SALVAR 98%, mín. em 100%: 5,0 min, desvio tensão ±2,5%
  Etapas planejadas (alvo%/min): 0/2  30/1  50/1  100/5  107/2  0/1
  Água: início 48,2 °C, máxima 73,5 °C, fim 53,3 °C; tempo em atenção 00:00, crítico 00:00

  POR ETAPA (valores na ordem da tela; tempos em mm:ss)
   Etapa 1 (alvo 0%): relógio 00:01 a 00:12, entrou na faixa após 00:00, contando 00:12, estabilizando 00:00
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 0,0 kW, tensão média 221,1 V, corrente média 0 A, água 42,9 °C, rpm 1800, freq 60,00 Hz, fp 1,00
   Etapa 2 (alvo 30%): relógio 00:13 a 00:18, entrou na faixa após 00:00, contando 00:06, estabilizando 00:00
     carga média 30,33% (mín 29,75, máx 31,25, desvio 0,54), maior excesso sobre o alvo 1,25 pt
     fim da etapa: 30,3 kW, tensão média 221,2 V, corrente média 71 A, água 39,8 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 3 (alvo 50%): relógio 00:19 a 00:25, entrou na faixa após 00:01, contando 00:06, estabilizando 00:01
     carga média 50,96% (mín 50,64, máx 51,42, desvio 0,33), maior excesso sobre o alvo 31,77 pt
     fim da etapa: 55,3 kW, tensão média 221,2 V, corrente média 130 A, água 41,0 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 4 (alvo 100%): relógio 00:26 a 00:55, entrou na faixa após 00:00, contando 00:30, estabilizando 00:00
     carga média 101,90% (mín 101,02, máx 103,15, desvio 0,47), maior excesso sobre o alvo 3,15 pt
     fim da etapa: 101,9 kW, tensão média 221,5 V, corrente média 240 A, água 67,9 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 5 (alvo 107%): relógio 00:56 a 01:08, entrou na faixa após 00:00, contando 00:12, estabilizando 00:01
     carga média 108,19% (mín 107,35, máx 108,86, desvio 0,45), maior excesso sobre o alvo 1,86 pt
     fim da etapa: 108,1 kW, tensão média 221,5 V, corrente média 254 A, água 72,3 °C, rpm 1800, freq 60,00 Hz, fp 0,99
   Etapa 6 (alvo 0%): relógio 01:09 a 01:17, entrou na faixa após 00:00, contando 00:06, estabilizando 00:00
     carga média 0,00% (mín 0,00, máx 0,00, desvio 0,00), maior excesso sobre o alvo 0,00 pt
     fim da etapa: 0,0 kW, tensão média 221,1 V, corrente média 0 A, água 61,1 °C, rpm 1800, freq 60,00 Hz, fp 1,00

  PATAMARES DE CARGA (carga parada por 8 s ou mais) e TRANSIÇÕES
   1) início 00:01, duração 00:11, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW
      transição para 101,9% em 14 s
   2) início 00:26, duração 00:29, carga 101,9% (mín 101,0, máx 103,1), 101,9 kW
      transição para 108,2% em 1 s
   3) início 00:56, duração 00:12, carga 108,2% (mín 107,3, máx 108,9), 108,2 kW
      transição para 0,0% em 1 s
   4) início 01:09, duração 00:08, carga 0,0% (mín 0,0, máx 0,0), 0,0 kW

  EVENTOS (tempo desde o início da sessão)
   00:00  Registro iniciado
   00:13  Etapa 2 iniciada (alvo 30%)
   00:14  Etapa salva (1 de 6)
   00:19  Etapa 3 iniciada (alvo 50%)
   00:20  Etapa salva (2 de 6)
   00:26  Etapa 4 iniciada (alvo 100%)
   00:27  Etapa salva (3 de 6)
   00:56  Etapa 5 iniciada (alvo 107%)
   00:57  Etapa salva (4 de 6)
   01:09  Etapa 6 iniciada (alvo 0%)
   01:10  Etapa salva (5 de 6)
   01:15  Todas as etapas salvas (aguardando FINALIZAR)
   01:16  Etapa salva (6 de 6)
   01:17  Registro encerrado (ensaio finalizado)
----------------------------------------------------------------------

Colunas do CSV: sessao, hora, t_s, relogio_s, tipo_ensaio, etapa, alvo_pct, cron_s, estado_cron, gerador, carga_pct, kw, va, vb, vc, ia, ib, ic, agua_c, rpm, bat_v, freq_hz, kva, kvar, fp, consumo_lh, nivel_agua, simulado
```

---

## amostras/aprendizado_DEMO_DSE_4520_DEMO_4HTAA4_3_G21_QYI_274C_SA_20261107_1712_amostras.csv

```
sessao;hora;t_s;relogio_s;tipo_ensaio;etapa;alvo_pct;cron_s;estado_cron;gerador;carga_pct;kw;va;vb;vc;ia;ib;ic;agua_c;rpm;bat_v;freq_hz;kva;kvar;fp;consumo_lh;nivel_agua;simulado
S20261103_235058;23:50:58;0,2;0,3;iso;1;0;0;estabilizando;operando;0,00;0,0;221,2;220,7;221,4;0;0;0;18,9;1789;28,31;59,60;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:50:59;1,2;10,2;iso;1;0;7;contando;operando;0,00;0,0;221,1;220,8;221,4;0;0;0;20,2;1800;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:00;2,2;20,2;iso;1;0;17;contando;operando;0,00;0,0;221,3;221,0;221,4;0;0;0;21,4;1800;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:01;3,2;30,3;iso;1;0;27;contando;operando;0,00;0,0;221,1;220,8;221,4;0;0;0;22,5;1800;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:02;4,2;40,2;iso;1;0;37;contando;operando;0,00;0,0;221,2;220,8;221,3;0;0;0;23,5;1800;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:03;5,2;50,3;iso;1;0;47;contando;operando;0,00;0,0;221,1;221,0;221,2;0;0;0;24,4;1799;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:04;6,2;60,2;iso;1;0;56;contando;operando;0,00;0,0;220,8;220,6;221,3;0;0;0;25,2;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:05;7,2;70,2;iso;1;0;67;contando;operando;0,00;0,0;221,2;220,8;221,3;0;0;0;26,0;1801;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:06;8,2;80,2;iso;1;0;77;contando;operando;0,00;0,0;221,1;220,9;221,2;0;0;0;26,7;1801;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:07;9,2;90,2;iso;1;0;87;contando;operando;0,00;0,0;221,1;220,7;221,2;0;0;0;27,4;1801;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:08;10,2;100,2;iso;1;0;97;contando;operando;0,00;0,0;221,2;220,9;221,4;0;0;0;28,0;1800;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:09;11,2;110,2;iso;1;0;107;contando;operando;0,00;0,0;221,1;221,0;221,2;0;0;0;28,6;1800;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:10;12,2;120,2;iso;1;0;117;contando;operando;0,00;0,0;221,2;221,0;221,3;0;0;0;29,1;1800;28,27;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:11;13,2;130,2;iso;2;30;120;estabilizando;operando;0,00;0,0;221,2;220,9;221,4;0;0;0;29,6;1799;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:51:12;14,2;140,3;iso;2;30;127;contando;operando;29,69;56,1;221,2;221,1;221,3;70;70;70;30,3;1799;28,27;60,00;56,7;8,0;0,99;12,53;0;1
S20261103_235058;23:51:13;15,2;150,2;iso;2;30;137;contando;operando;29,95;56,4;221,3;221,1;221,5;70;70;70;31,0;1800;28,28;60,00;57,2;8,1;0,99;12,59;0;1
S20261103_235058;23:51:14;16,2;160,2;iso;2;30;147;contando;operando;30,47;57,5;221,2;221,1;221,4;72;72;72;31,6;1800;28,31;60,00;58,2;8,2;0,99;12,70;0;1
S20261103_235058;23:51:15;17,2;170,3;iso;2;30;157;contando;operando;29,92;56,7;221,2;220,8;221,4;70;70;71;32,2;1800;28,28;60,00;57,1;8,1;0,99;12,58;0;1
S20261103_235058;23:51:16;18,2;180,2;iso;2;30;167;contando;operando;29,12;55,0;221,6;221,0;221,6;68;68;69;32,8;1800;28,30;60,00;55,6;7,8;0,99;12,41;0;1
S20261103_235058;23:51:17;19,2;190,2;iso;2;30;177;contando;operando;28,77;54,4;221,4;220,8;221,4;68;67;68;33,2;1801;28,28;60,00;54,9;7,8;0,99;12,33;0;1
S20261103_235058;23:51:18;20,2;200,2;iso;3;50;180;estabilizando;operando;29,70;56,2;221,1;220,7;221,5;70;70;70;33,7;1799;28,30;60,00;56,7;8,0;0,99;12,53;0;1
S20261103_235058;23:51:19;21,2;210,2;iso;3;50;180;estabilizando;operando;34,61;65,5;221,2;221,0;221,4;81;82;82;34,2;1800;28,28;60,00;66,1;9,3;0,99;13,61;0;1
S20261103_235058;23:51:20;22,2;220,2;iso;3;50;180;estabilizando;operando;38,77;73,5;221,3;220,9;221,7;90;91;91;34,8;1800;28,29;60,00;74,1;10,4;0,99;14,53;0;1
S20261103_235058;23:51:21;23,2;230,2;iso;3;50;180;estabilizando;operando;45,30;85,6;221,2;220,7;221,4;106;106;107;35,5;1800;28,31;60,00;86,5;12,2;0,99;15,97;0;1
S20261103_235058;23:51:22;24,2;240,2;iso;3;50;180;estabilizando;operando;52,35;99,4;221,3;221,1;221,7;123;123;123;36,3;1800;28,32;60,00;100,0;14,1;0,99;17,52;0;1
S20261103_235058;23:51:23;25,2;250,2;iso;3;50;181;contando;operando;49,45;93,6;221,4;220,9;221,4;116;116;116;37,0;1800;28,32;60,00;94,5;13,3;0,99;16,88;0;1
S20261103_235058;23:51:24;26,2;260,2;iso;3;50;191;contando;operando;49,83;94,2;221,5;221,2;221,5;117;117;117;37,6;1801;28,31;60,00;95,2;13,4;0,99;16,96;0;1
S20261103_235058;23:51:25;27,2;270,2;iso;3;50;201;contando;operando;49,94;94,5;221,2;221,2;221,6;117;118;118;38,2;1800;28,30;60,00;95,4;13,5;0,99;16,99;0;1
S20261103_235058;23:51:26;28,2;280,2;iso;3;50;211;contando;operando;49,07;92,9;221,5;221,2;221,3;115;115;115;38,8;1801;28,30;60,00;93,7;13,2;0,99;16,79;0;1
S20261103_235058;23:51:27;29,2;290,3;iso;3;50;221;contando;operando;48,82;92,6;221,1;221,0;221,3;114;114;115;39,3;1801;28,34;60,00;93,2;13,2;0,99;16,74;0;1
S20261103_235058;23:51:28;30,2;300,2;iso;3;50;231;contando;operando;49,51;93,6;221,3;221,1;221,4;116;116;117;39,7;1799;28,33;60,00;94,6;13,3;0,99;16,89;0;1
S20261103_235058;23:51:29;31,2;310,3;iso;4;100;240;estabilizando;operando;49,60;93,5;221,2;221,0;221,3;117;116;117;40,1;1800;28,31;60,00;94,7;13,4;0,99;16,91;0;1
S20261103_235058;23:51:30;32,2;320,2;iso;4;100;240;estabilizando;operando;58,17;110,1;221,3;220,9;221,5;136;137;138;40,8;1800;28,29;60,00;111,1;15,7;0,99;18,80;0;1
S20261103_235058;23:51:31;33,2;330,2;iso;4;100;240;estabilizando;operando;68,77;130,1;221,5;221,1;221,6;161;162;162;41,8;1801;28,29;60,00;131,4;18,5;0,99;21,13;0;1
S20261103_235058;23:51:32;34,2;340,2;iso;4;100;240;estabilizando;operando;81,72;154,5;221,3;220,9;221,7;191;193;193;43,2;1800;28,34;60,00;156,1;22,0;0,99;23,98;0;1
S20261103_235058;23:51:33;35,2;350,2;iso;4;100;240;estabilizando;operando;79,14;149,9;221,3;221,0;221,4;185;186;187;44,4;1800;28,29;60,00;151,2;21,3;0,99;23,41;0;1
S20261103_235058;23:51:34;36,2;360,3;iso;4;100;240;estabilizando;operando;88,98;168,4;221,6;221,1;221,6;208;209;210;46,0;1801;28,33;60,00;170,0;24,0;0,99;25,58;0;1
S20261103_235058;23:51:35;37,2;370,2;iso;4;100;242;contando;operando;98,55;186,4;221,6;221,3;221,8;231;232;232;47,9;1800;28,28;60,00;188,2;26,6;0,99;27,68;0;1
S20261103_235058;23:51:36;38,2;380,2;iso;4;100;252;contando;operando;99,84;188,8;221,6;221,1;221,7;234;234;236;49,6;1800;28,33;60,00;190,7;26,9;0,99;27,97;0;1
S20261103_235058;23:51:37;39,2;390,3;iso;4;100;262;contando;operando;98,88;187,2;221,5;221,3;221,7;231;233;233;51,3;1799;28,30;60,00;188,9;26,6;0,99;27,75;0;1
S20261103_235058;23:51:38;40,2;400,3;iso;4;100;272;contando;operando;99,42;187,8;221,5;221,3;221,7;233;233;234;52,8;1800;28,29;60,00;189,9;26,8;0,99;27,87;0;1
S20261103_235058;23:51:39;41,2;410,2;iso;4;100;282;contando;operando;99,18;187,7;221,3;221,3;221,5;233;234;234;54,1;1800;28,30;60,00;189,4;26,7;0,99;27,82;0;1
S20261103_235058;23:51:40;42,2;420,3;iso;4;100;292;contando;operando;99,69;188,5;221,6;221,1;221,8;234;234;235;55,4;1800;28,32;60,00;190,4;26,9;0,99;27,93;0;1
S20261103_235058;23:51:41;43,2;430,3;iso;4;100;302;contando;operando;99,51;188,2;221,3;221,4;221,6;233;234;235;56,6;1799;28,30;60,00;190,1;26,8;0,99;27,89;0;1
S20261103_235058;23:51:42;44,2;440,2;iso;4;100;312;contando;operando;99,36;188,1;221,5;221,3;221,7;233;233;234;57,7;1800;28,29;60,00;189,8;26,8;0,99;27,86;0;1
S20261103_235058;23:51:43;45,2;450,2;iso;4;100;322;contando;operando;99,98;189,0;221,6;221,2;221,9;234;235;236;58,7;1800;28,30;60,00;191,0;26,9;0,99;28,00;0;1
S20261103_235058;23:51:44;46,2;460,3;iso;4;100;332;contando;operando;99,58;188,4;221,4;221,2;221,7;233;234;235;59,6;1800;28,30;60,00;190,2;26,8;0,99;27,91;0;1
S20261103_235058;23:51:45;47,2;470,3;iso;4;100;342;contando;operando;99,49;188,5;221,5;221,2;221,6;233;234;235;60,4;1800;28,33;60,00;190,0;26,8;0,99;27,89;0;1
S20261103_235058;23:51:46;48,2;480,2;iso;4;100;352;contando;operando;99,95;189,1;221,6;221,0;221,6;234;235;236;61,2;1800;28,27;60,00;190,9;26,9;0,99;27,99;0;1
S20261103_235058;23:51:47;49,2;490,2;iso;4;100;362;contando;operando;99,82;188,9;221,6;221,2;221,6;234;235;236;61,9;1800;28,29;60,00;190,7;26,9;0,99;27,96;0;1
S20261103_235058;23:51:48;50,2;500,2;iso;4;100;372;contando;operando;98,85;187,3;221,4;221,2;221,8;231;232;233;62,6;1800;28,33;60,00;188,8;26,6;0,99;27,75;0;1
S20261103_235058;23:51:49;51,2;510,2;iso;4;100;382;contando;operando;99,24;187,6;221,5;221,3;221,6;232;233;234;63,2;1800;28,29;60,00;189,6;26,7;0,99;27,83;0;1
S20261103_235058;23:51:50;52,2;520,2;iso;4;100;392;contando;operando;99,30;187,8;221,5;221,4;221,6;233;234;234;63,7;1801;28,30;60,00;189,7;26,8;0,99;27,85;0;1
S20261103_235058;23:51:51;53,2;530,3;iso;4;100;402;contando;operando;99,53;188,2;221,5;221,4;221,8;233;234;235;64,2;1800;28,32;60,00;190,1;26,8;0,99;27,90;0;1
S20261103_235058;23:51:52;54,2;540,2;iso;4;100;412;contando;operando;98,27;185,8;221,6;221,2;221,7;230;231;232;64,7;1800;28,32;60,00;187,7;26,5;0,99;27,62;0;1
S20261103_235058;23:51:53;55,2;550,3;iso;4;100;422;contando;operando;99,30;187,7;221,8;221,2;221,6;233;233;234;65,1;1799;28,30;60,00;189,7;26,8;0,99;27,85;0;1
S20261103_235058;23:51:54;56,2;560,2;iso;4;100;431;contando;operando;98,71;186,7;221,6;221,2;221,7;231;232;233;65,5;1801;28,28;60,00;188,5;26,6;0,99;27,72;0;1
S20261103_235058;23:51:55;57,2;570,3;iso;4;100;442;contando;operando;99,53;188,3;221,5;221,2;221,5;233;234;234;65,8;1800;28,31;60,00;190,1;26,8;0,99;27,90;0;1
S20261103_235058;23:51:56;58,2;580,3;iso;4;100;452;contando;operando;98,03;185,3;221,4;221,2;221,7;229;231;231;66,1;1801;28,30;60,00;187,2;26,4;0,99;27,57;0;1
S20261103_235058;23:51:57;59,2;590,3;iso;4;100;462;contando;operando;99,79;188,5;221,4;221,3;221,9;234;234;235;66,4;1800;28,31;60,00;190,6;26,9;0,99;27,95;0;1
S20261103_235058;23:51:58;60,2;600,2;iso;4;100;471;contando;operando;99,09;187,6;221,5;221,1;221,8;232;233;233;66,7;1802;28,32;60,00;189,3;26,7;0,99;27,80;0;1
S20261103_235058;23:51:59;61,2;610,3;iso;4;100;482;contando;operando;99,24;187,8;221,5;220,9;221,6;232;233;234;67,0;1800;28,26;60,00;189,6;26,7;0,99;27,83;0;1
S20261103_235058;23:52:00;62,2;620,2;iso;4;100;491;contando;operando;99,80;188,8;221,6;221,1;221,8;233;234;236;67,2;1800;28,32;60,00;190,6;26,9;0,99;27,96;0;1
S20261103_235058;23:52:01;63,2;630,2;iso;4;100;501;contando;operando;99,62;188,3;221,5;221,3;221,7;233;234;235;67,4;1802;28,31;60,00;190,3;26,8;0,99;27,92;0;1
S20261103_235058;23:52:02;64,2;640,2;iso;4;100;511;contando;operando;98,87;186,9;221,4;221,0;221,7;231;232;233;67,6;1799;28,30;60,00;188,9;26,6;0,99;27,75;0;1
S20261103_235058;23:52:03;65,2;650,2;iso;4;100;521;contando;operando;98,88;187,1;221,5;221,2;221,4;232;233;233;67,8;1801;28,33;60,00;188,9;26,6;0,99;27,75;0;1
S20261103_235058;23:52:04;66,2;660,2;iso;4;100;532;contando;operando;98,91;187,2;221,2;221,1;221,8;232;232;234;68,0;1799;28,29;60,00;188,9;26,7;0,99;27,76;0;1
S20261103_235058;23:52:05;67,2;670,2;iso;5;107;540;estabilizando;operando;99,51;187,8;221,6;221,4;221,6;233;234;235;68,1;1799;28,28;60,00;190,1;26,8;0,99;27,89;0;1
S20261103_235058;23:52:06;68,2;680,3;iso;5;107;540;estabilizando;operando;104,32;197,2;221,4;221,1;221,7;244;245;246;68,5;1800;28,32;60,00;199,3;28,1;0,99;28,95;0;1
S20261103_235058;23:52:07;69,2;690,3;iso;5;107;540;estabilizando;operando;101,54;191,8;221,4;221,4;221,7;238;239;239;68,8;1800;28,31;60,00;194,0;27,4;0,99;28,34;0;1
S20261103_235058;23:52:08;70,2;700,2;iso;5;107;543;contando;operando;107,37;203,0;221,6;221,2;221,8;251;253;254;69,2;1800;28,29;60,00;205,1;28,9;0,99;29,62;0;1
S20261103_235058;23:52:09;71,2;710,2;iso;5;107;552;contando;operando;107,31;202,9;221,5;221,1;221,6;251;252;253;69,7;1800;28,27;60,00;205,0;28,9;0,99;29,61;0;1
S20261103_235058;23:52:10;72,2;720,2;iso;5;107;563;contando;operando;107,12;202,7;221,5;221,3;221,8;251;251;253;70,1;1799;28,31;60,00;204,6;28,9;0,99;29,57;0;1
S20261103_235058;23:52:11;73,2;730,2;iso;5;107;573;contando;operando;106,80;202,3;221,4;221,0;221,7;250;251;252;70,5;1800;28,30;60,00;204,0;28,8;0,99;29,50;0;1
S20261103_235058;23:52:12;74,2;740,2;iso;5;107;583;contando;operando;106,73;201,7;221,5;221,3;221,6;249;251;252;70,9;1800;28,31;60,00;203,9;28,8;0,99;29,48;0;1
S20261103_235058;23:52:13;75,2;750,2;iso;5;107;593;contando;operando;106,54;201,7;221,6;221,2;221,7;249;250;251;71,2;1801;28,31;60,00;203,5;28,7;0,99;29,44;0;1
S20261103_235058;23:52:14;76,2;760,2;iso;5;107;603;contando;operando;105,57;199,6;221,4;221,4;221,6;247;248;249;71,4;1799;28,29;60,00;201,6;28,4;0,99;29,23;0;1
S20261103_235058;23:52:15;77,2;770,2;iso;5;107;613;contando;operando;106,68;201,4;221,5;221,0;221,6;250;251;251;71,7;1801;28,33;60,00;203,8;28,7;0,99;29,47;0;1
S20261103_235058;23:52:16;78,2;780,2;iso;5;107;623;contando;operando;106,76;201,9;221,6;221,1;221,6;250;251;252;71,9;1800;28,30;60,00;203,9;28,8;0,99;29,49;0;1
S20261103_235058;23:52:17;79,2;790,2;iso;5;107;632;contando;operando;107,63;203,6;221,3;221,3;221,8;252;253;254;72,2;1801;28,32;60,00;205,6;29,0;0,99;29,68;0;1
S20261103_235058;23:52:19;81,1;801,4;iso;5;107;644;contando;operando;106,79;202,3;221,7;221,2;221,5;250;250;252;72,4;1799;28,30;60,00;204,0;28,8;0,99;29,49;0;1
S20261103_235058;23:52:21;83,2;821,6;iso;6;0;660;estabilizando;operando;106,57;201,7;221,4;221,2;221,7;250;250;251;72,8;1799;28,30;60,00;203,6;28,7;0,99;29,45;0;1
S20261103_235058;23:52:23;85,1;841,4;iso;6;0;676;contando;operando;0,00;0,0;221,1;220,8;221,3;0;0;0;67,0;1800;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:52:25;87,1;861,5;iso;6;0;697;contando;operando;0,00;0,0;221,1;220,6;221,4;0;0;0;62,1;1800;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:52:27;89,2;881,5;iso;6;0;717;contando;operando;0,00;0,0;221,0;220,8;221,3;0;0;0;57,9;1799;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:52:29;91,2;901,4;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,2;220,6;221,2;0;0;0;54,4;1801;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:52:30;92,2;920,2;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,2;220,9;221,4;0;0;0;51,6;1798;28,27;60,00;0,0;0,0;1,00;6,00;0;1
S20261103_235058;23:52:31;93,2;930,2;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,2;221,0;221,2;0;0;0;50,3;1799;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170549;17:05:49;0,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,7;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:50;1,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,7;0;25,63;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:51;2,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:52;3,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:53;4,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,61;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:54;5,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:55;6,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,63;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:56;7,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,57;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:57;8,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,6;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:58;9,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,61;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:05:59;10,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:00;11,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:01;12,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:02;13,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,57;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:03;14,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:04;15,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,5;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:05;16,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:06;17,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:07;18,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,57;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:08;19,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,63;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:09;20,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:10;21,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:11;22,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,61;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:12;23,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,4;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:13;24,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,55;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:14;25,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,63;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:15;26,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:16;27,2;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:17;28,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,57;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:18;29,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:19;30,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,3;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:20;31,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:21;32,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:22;33,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:23;34,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,61;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:24;35,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:25;36,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:26;37,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,2;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:27;38,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,57;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:28;39,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:29;40,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:30;41,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,56;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:31;42,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:32;43,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:33;44,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:34;45,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,1;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:35;46,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:36;47,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,65;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:37;48,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:38;49,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,60;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:39;50,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,58;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:40;51,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,61;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:41;52,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;29,0;0;25,59;0,00;0,0;0,0;;0,00;0;1
S20261107_170549;17:06:42;53,1;0,0;iso;;;;parado;parado;0,00;0,0;0,0;0,0;0,0;0;0;0;28,9;0;25,62;0,00;0,0;0,0;;0,00;0;1
S20261107_170749;17:07:50;0,6;5,0;iso;1;0;1;contando;operando;0,00;0,0;220,8;220,9;221,4;0;0;0;29,7;1799;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:51;1,6;15,0;iso;1;0;11;contando;operando;0,00;0,0;221,2;220,8;221,3;0;0;0;30,2;1800;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:52;2,6;25,0;iso;1;0;21;contando;operando;0,00;0,0;221,1;221,0;221,1;0;0;0;30,6;1800;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:53;3,6;35,0;iso;1;0;31;contando;operando;0,00;0,0;221,1;220,8;221,3;0;0;0;30,9;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:54;4,6;45,0;iso;1;0;41;contando;operando;0,00;0,0;221,0;220,8;221,3;0;0;0;31,2;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:55;5,6;55,0;iso;1;0;51;contando;operando;0,00;0,0;221,0;220,9;221,2;0;0;0;31,5;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:56;6,6;65,0;iso;1;0;61;contando;operando;0,00;0,0;221,3;220,8;221,4;0;0;0;31,8;1799;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:57;7,6;75,0;iso;1;0;71;contando;operando;0,00;0,0;221,1;220,8;221,4;0;0;0;32,1;1800;28,27;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:58;8,6;85,0;iso;1;0;81;contando;operando;0,00;0,0;221,2;220,7;221,1;0;0;0;32,3;1799;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:07:59;9,6;95,0;iso;1;0;91;contando;operando;0,00;0,0;221,4;220,8;221,3;0;0;0;32,5;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:08:00;10,6;105,0;iso;1;0;101;contando;operando;0,00;0,0;221,1;220,7;221,3;0;0;0;32,7;1800;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:08:01;11,6;115,0;iso;1;0;111;contando;operando;0,00;0,0;221,4;220,6;221,4;0;0;0;32,9;1800;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:08:02;12,6;125,0;iso;2;30;120;estabilizando;operando;30,17;30,3;221,2;220,8;221,6;71;71;71;33,1;1801;28,30;60,00;30,5;4,3;0,99;12,64;0;1
S20261107_170749;17:08:03;13,6;135,0;iso;2;30;128;contando;operando;30,02;29,9;221,2;221,0;221,5;70;70;71;33,6;1799;28,29;60,00;30,3;4,3;0,99;12,60;0;1
S20261107_170749;17:08:04;14,6;145,0;iso;2;30;138;contando;operando;30,35;30,5;221,0;221,1;221,4;71;71;72;34,0;1800;28,30;60,00;30,7;4,3;0,99;12,68;0;1
S20261107_170749;17:08:05;15,6;155,0;iso;2;30;148;contando;operando;30,53;30,4;221,1;220,8;221,5;71;71;72;34,4;1800;28,30;60,00;30,8;4,4;0,99;12,72;0;1
S20261107_170749;17:08:06;16,6;165,0;iso;2;30;158;contando;operando;29,57;29,7;221,1;220,9;221,4;69;69;70;34,8;1799;28,29;60,00;29,9;4,2;0,99;12,51;0;1
S20261107_170749;17:08:07;17,6;175,0;iso;2;30;168;contando;operando;29,34;29,4;221,2;221,0;221,4;68;69;70;35,1;1800;28,30;60,00;29,6;4,2;0,99;12,46;0;1
S20261107_170749;17:08:08;18,6;185,0;iso;2;30;177;contando;operando;30,48;30,4;221,2;220,9;221,5;72;72;72;35,4;1800;28,32;60,00;30,8;4,3;0,99;12,71;0;1
S20261107_170749;17:08:09;19,6;195,0;iso;3;50;183;contando;operando;50,59;50,5;221,2;221,1;221,6;118;119;119;36,2;1801;28,30;60,00;51,1;7,2;0,99;17,13;0;1
S20261107_170749;17:08:10;20,6;205,0;iso;3;50;193;contando;operando;50,64;50,5;221,3;221,0;221,3;118;119;119;36,9;1801;28,28;60,00;51,2;7,2;0,99;17,14;0;1
S20261107_170749;17:08:11;21,6;215,0;iso;3;50;203;contando;operando;51,01;51,0;221,2;221,0;221,5;120;120;120;37,6;1800;28,33;60,00;51,5;7,3;0,99;17,22;0;1
S20261107_170749;17:08:12;22,6;225,0;iso;3;50;213;contando;operando;51,18;51,0;221,2;221,0;221,6;120;121;121;38,2;1800;28,27;60,00;51,7;7,3;0,99;17,26;0;1
S20261107_170749;17:08:13;23,6;235,0;iso;3;50;223;contando;operando;51,01;51,0;221,4;221,2;221,7;119;120;120;38,8;1800;28,28;60,00;51,5;7,3;0,99;17,22;0;1
S20261107_170749;17:08:14;24,6;245,0;iso;3;50;233;contando;operando;50,84;50,7;221,2;221,0;221,7;119;119;120;39,3;1800;28,31;60,00;51,4;7,2;0,99;17,18;0;1
S20261107_170749;17:08:15;25,6;255,0;iso;4;100;240;estabilizando;operando;101,79;101,5;221,4;221,1;221,7;238;239;240;40,4;1799;28,28;60,00;102,8;14,5;0,99;28,39;0;1
S20261107_170749;17:08:17;27,4;273,8;iso;4;100;258;contando;operando;101,27;101,2;221,4;221,2;221,9;237;238;239;44,9;1800;28,31;60,00;102,3;14,4;0,99;28,28;0;1
S20261107_170749;17:08:18;28,4;283,8;iso;4;100;268;contando;operando;101,51;101,6;221,6;221,1;221,6;237;239;239;47,0;1801;28,27;60,00;102,5;14,5;0,99;28,33;0;1
S20261107_170749;17:08:18;28,7;287,0;iso;4;100;271;contando;operando;101,46;101,4;221,5;221,5;221,8;237;238;240;47,7;1801;28,28;60,00;102,5;14,5;0,99;28,32;0;1
S20261107_170749;17:08:19;29,6;295,0;iso;4;100;279;contando;operando;101,34;101,7;221,4;221,3;221,9;237;238;239;49,2;1800;28,32;60,00;102,4;14,4;0,99;28,30;0;1
S20261107_170749;17:08:20;30,6;305,0;iso;4;100;289;contando;operando;101,83;101,7;221,3;221,1;221,7;239;239;240;51,0;1800;28,29;60,00;102,9;14,5;0,99;28,40;0;1
S20261107_170749;17:08:21;31,6;315,0;iso;4;100;299;contando;operando;101,44;101,2;221,6;221,2;221,7;237;239;240;52,6;1800;28,28;60,00;102,5;14,5;0,99;28,32;0;1
S20261107_170749;17:08:22;32,6;325,0;iso;4;100;309;contando;operando;101,50;101,6;221,5;221,3;221,6;238;239;240;54,1;1799;28,29;60,00;102,5;14,5;0,99;28,33;0;1
S20261107_170749;17:08:23;33,6;335,0;iso;4;100;319;contando;operando;101,65;101,5;221,8;221,1;221,4;238;239;240;55,5;1800;28,30;60,00;102,7;14,5;0,99;28,36;0;1
S20261107_170749;17:08:24;34,6;345,0;iso;4;100;329;contando;operando;101,36;101,1;221,2;221,1;221,8;237;238;239;56,8;1800;28,29;60,00;102,4;14,4;0,99;28,30;0;1
S20261107_170749;17:08:25;35,6;355,0;iso;4;100;339;contando;operando;102,03;101,8;221,6;221,0;221,7;239;239;241;58,0;1799;28,29;60,00;103,1;14,5;0,99;28,45;0;1
S20261107_170749;17:08:26;36,6;365,0;iso;4;100;349;contando;operando;102,06;102,1;221,5;221,1;221,6;239;240;241;59,1;1800;28,32;60,00;103,1;14,5;0,99;28,45;0;1
S20261107_170749;17:08:27;37,6;375,0;iso;4;100;359;contando;operando;101,95;102,1;221,3;221,3;221,8;239;239;241;60,0;1800;28,30;60,00;103,0;14,5;0,99;28,43;0;1
S20261107_170749;17:08:28;38,6;385,0;iso;4;100;369;contando;operando;101,65;101,5;221,4;221,3;221,7;238;239;240;61,0;1801;28,32;60,00;102,7;14,5;0,99;28,36;0;1
S20261107_170749;17:08:29;39,6;395,0;iso;4;100;379;contando;operando;102,35;102,4;221,6;221,1;221,7;240;241;242;61,8;1801;28,31;60,00;103,4;14,6;0,99;28,52;0;1
S20261107_170749;17:08:30;40,6;405,0;iso;4;100;389;contando;operando;102,43;102,5;221,6;221,2;221,7;240;241;241;62,6;1800;28,30;60,00;103,5;14,6;0,99;28,53;0;1
S20261107_170749;17:08:31;41,6;415,0;iso;4;100;399;contando;operando;101,64;101,5;221,5;221,2;221,8;237;239;240;63,3;1800;28,29;60,00;102,7;14,5;0,99;28,36;0;1
S20261107_170749;17:08:32;42,6;425,0;iso;4;100;409;contando;operando;102,06;102,0;221,4;221,1;221,8;238;240;241;63,9;1800;28,32;60,00;103,1;14,5;0,99;28,45;0;1
S20261107_170749;17:08:33;43,6;435,0;iso;4;100;419;contando;operando;102,10;101,7;221,5;221,2;221,9;238;240;241;64,5;1800;28,30;60,00;103,1;14,5;0,99;28,46;0;1
S20261107_170749;17:08:34;44,6;445,0;iso;4;100;429;contando;operando;101,69;101,6;221,3;220,9;221,6;238;239;240;65,1;1801;28,30;60,00;102,7;14,5;0,99;28,37;0;1
S20261107_170749;17:08:35;45,6;455,0;iso;4;100;439;contando;operando;101,66;101,8;221,4;221,2;221,8;238;239;240;65,6;1800;28,31;60,00;102,7;14,5;0,99;28,36;0;1
S20261107_170749;17:08:36;46,6;465,0;iso;4;100;449;contando;operando;101,12;101,2;221,5;221,3;221,8;237;238;239;66,1;1799;28,32;60,00;102,1;14,4;0,99;28,25;0;1
S20261107_170749;17:08:37;47,6;475,0;iso;4;100;459;contando;operando;101,19;100,9;221,5;221,3;221,5;237;237;239;66,5;1800;28,30;60,00;102,2;14,4;0,99;28,26;0;1
S20261107_170749;17:08:38;48,6;485,0;iso;4;100;469;contando;operando;101,98;102,2;221,5;221,4;221,7;239;239;241;66,9;1800;28,32;60,00;103,0;14,5;0,99;28,44;0;1
S20261107_170749;17:08:39;49,8;495,0;iso;4;100;479;contando;operando;101,98;101,8;221,5;221,1;221,6;239;239;241;67,3;1800;28,27;60,00;103,0;14,5;0,99;28,44;0;1
S20261107_170749;17:08:40;50,6;505,0;iso;4;100;489;contando;operando;101,83;101,9;221,5;221,4;221,5;239;239;240;67,6;1800;28,31;60,00;102,9;14,5;0,99;28,40;0;1
S20261107_170749;17:08:41;51,6;515,0;iso;4;100;499;contando;operando;102,00;102,0;221,6;221,3;221,6;239;240;241;67,9;1799;28,29;60,00;103,0;14,5;0,99;28,44;0;1
S20261107_170749;17:08:42;52,6;525,0;iso;4;100;509;contando;operando;101,04;100,9;221,5;221,2;221,8;237;238;239;68,2;1800;28,32;60,00;102,1;14,4;0,99;28,23;0;1
S20261107_170749;17:08:43;53,6;535,0;iso;4;100;519;contando;operando;101,08;101,4;221,7;221,4;221,7;237;237;238;68,4;1801;28,33;60,00;102,1;14,4;0,99;28,24;0;1
S20261107_170749;17:08:44;54,6;545,0;iso;4;100;529;contando;operando;102,05;102,1;221,6;221,3;221,5;239;240;241;68,7;1800;28,30;60,00;103,1;14,5;0,99;28,45;0;1
S20261107_170749;17:08:45;55,6;555,0;iso;4;100;539;contando;operando;101,14;100,9;221,6;221,2;221,8;236;238;239;68,9;1800;28,31;60,00;102,2;14,4;0,99;28,25;0;1
S20261107_170749;17:08:46;56,6;565,0;iso;5;107;547;contando;operando;109,83;109,9;221,5;221,3;221,6;258;258;259;69,4;1800;28,29;60,00;110,9;15,7;0,99;30,16;0;1
S20261107_170749;17:08:47;57,6;575,0;iso;5;107;557;contando;operando;109,47;109,5;221,5;221,5;221,7;256;257;258;70,0;1801;28,28;60,00;110,6;15,6;0,99;30,08;0;1
S20261107_170749;17:08:48;58,6;585,0;iso;5;107;567;contando;operando;108,83;108,8;221,4;221,2;221,8;255;256;257;70,5;1799;28,31;60,00;109,9;15,5;0,99;29,94;0;1
S20261107_170749;17:08:49;59,6;595,0;iso;5;107;577;contando;operando;109,70;109,5;221,6;221,3;221,7;257;257;259;71,0;1799;28,29;60,00;110,8;15,6;0,99;30,13;0;1
S20261107_170749;17:08:50;60,6;605,0;iso;5;107;587;contando;operando;109,46;109,7;221,4;221,3;221,8;256;257;258;71,5;1800;28,30;60,00;110,6;15,6;0,99;30,08;0;1
S20261107_170749;17:08:51;61,6;615,0;iso;5;107;597;contando;operando;109,01;109,3;221,6;221,3;221,7;255;256;257;71,9;1800;28,30;60,00;110,1;15,5;0,99;29,98;0;1
S20261107_170749;17:08:52;62,6;625,0;iso;5;107;607;contando;operando;109,19;109,0;221,6;221,4;221,7;256;257;258;72,3;1800;28,32;60,00;110,3;15,6;0,99;30,02;0;1
S20261107_170749;17:08:53;63,6;635,0;iso;5;107;617;contando;operando;109,40;109,3;221,4;221,2;222,1;256;257;258;72,6;1800;28,30;60,00;110,5;15,6;0,99;30,07;0;1
S20261107_170749;17:08:54;64,6;645,0;iso;5;107;627;contando;operando;108,75;108,5;221,6;221,4;221,7;255;256;257;72,9;1801;28,26;60,00;109,8;15,5;0,99;29,93;0;1
S20261107_170749;17:08:55;65,6;655,0;iso;5;107;637;contando;operando;109,51;109,5;221,4;221,2;221,5;257;257;258;73,2;1800;28,30;60,00;110,6;15,6;0,99;30,09;0;1
S20261107_170749;17:08:56;66,6;665,0;iso;5;107;647;contando;operando;109,24;109,1;221,6;221,3;221,6;255;257;258;73,5;1800;28,29;60,00;110,3;15,6;0,99;30,03;0;1
S20261107_170749;17:08:57;67,6;675,0;iso;5;107;657;contando;operando;108,87;109,1;221,3;221,2;221,9;255;256;258;73,8;1801;28,27;60,00;110,0;15,5;0,99;29,95;0;1
S20261107_170749;17:08:58;68,6;685,0;iso;6;0;665;contando;operando;0,00;0,0;221,0;220,9;221,3;0;0;0;71,8;1800;28,26;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:08:59;69,6;695,0;iso;6;0;675;contando;operando;0,00;0,0;221,0;220,8;221,4;0;0;0;68,9;1798;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:00;70,6;705,0;iso;6;0;685;contando;operando;0,00;0,0;220,9;220,8;221,1;0;0;0;66,2;1800;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:01;71,6;715,0;iso;6;0;695;contando;operando;0,00;0,0;221,1;220,7;221,4;0;0;0;63,7;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:02;72,6;725,0;iso;6;0;705;contando;operando;0,00;0,0;221,0;220,8;221,4;0;0;0;61,4;1800;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:03;73,6;735,0;iso;6;0;715;contando;operando;0,00;0,0;220,9;220,7;221,1;0;0;0;59,3;1799;28,33;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:04;74,6;745,0;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;220,9;220,7;221,3;0;0;0;57,3;1799;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:05;75,6;755,0;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,1;220,7;221,3;0;0;0;55,5;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170749;17:09:06;76,6;765,0;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;220,9;220,8;221,4;0;0;0;53,9;1800;28,31;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:12;0,8;6,7;iso;1;0;5;contando;operando;0,00;0,0;221,1;220,8;221,3;0;0;0;48,2;1799;28,32;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:13;1,8;16,7;iso;1;0;15;contando;operando;0,00;0,0;221,1;221,0;221,2;0;0;0;47,1;1800;28,25;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:14;2,8;26,7;iso;1;0;25;contando;operando;0,00;0,0;221,2;220,9;221,3;0;0;0;46,2;1801;28,34;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:15;3,8;36,8;iso;1;0;35;contando;operando;0,00;0,0;221,0;220,9;221,3;0;0;0;45,3;1800;28,27;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:16;4,8;46,7;iso;1;0;45;contando;operando;0,00;0,0;221,3;221,1;221,2;0;0;0;44,5;1801;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:17;5,8;56,7;iso;1;0;55;contando;operando;0,00;0,0;221,3;220,7;221,2;0;0;0;43,7;1799;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:18;6,8;66,7;iso;1;0;65;contando;operando;0,00;0,0;221,3;220,9;221,2;0;0;0;43,0;1799;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:19;7,8;76,7;iso;1;0;75;contando;operando;0,00;0,0;220,9;220,9;221,3;0;0;0;42,4;1801;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:20;8,8;86,7;iso;1;0;85;contando;operando;0,00;0,0;221,1;220,8;221,3;0;0;0;41,8;1800;28,33;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:21;9,8;96,7;iso;1;0;95;contando;operando;0,00;0,0;221,0;220,8;221,0;0;0;0;41,2;1800;28,30;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:22;10,8;106,7;iso;1;0;105;contando;operando;0,00;0,0;220,9;220,8;221,3;0;0;0;40,7;1799;28,33;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:23;11,8;116,7;iso;1;0;115;contando;operando;0,00;0,0;221,2;220,5;221,3;0;0;0;40,3;1801;28,25;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:09:24;12,8;126,8;iso;2;30;121;contando;operando;30,02;29,7;221,1;221,0;221,3;70;71;70;40,0;1800;28,32;60,00;30,3;4,3;0,99;12,60;0;1
S20261107_170911;17:09:25;13,8;136,7;iso;2;30;131;contando;operando;30,61;30,6;221,1;221,1;221,4;72;72;72;39,9;1801;28,27;60,00;30,9;4,4;0,99;12,74;0;1
S20261107_170911;17:09:26;14,8;146,7;iso;2;30;141;contando;operando;30,07;30,1;221,1;220,9;221,3;71;71;71;39,9;1800;28,24;60,00;30,4;4,3;0,99;12,61;0;1
S20261107_170911;17:09:27;15,8;156,7;iso;2;30;151;contando;operando;29,75;29,9;221,2;220,9;221,4;70;70;70;39,8;1800;28,29;60,00;30,0;4,2;0,99;12,54;0;1
S20261107_170911;17:09:28;16,8;166,7;iso;2;30;161;contando;operando;30,26;30,2;221,1;221,0;221,5;71;72;71;39,7;1800;28,30;60,00;30,6;4,3;0,99;12,66;0;1
S20261107_170911;17:09:29;17,8;176,7;iso;2;30;171;contando;operando;31,25;31,0;221,1;220,7;221,4;73;73;74;39,7;1800;28,33;60,00;31,6;4,5;0,99;12,88;0;1
S20261107_170911;17:09:30;18,8;186,7;iso;3;50;180;estabilizando;operando;81,77;81,8;221,2;220,9;221,6;191;192;193;39,8;1801;28,28;60,00;82,6;11,7;0,99;23,99;0;1
S20261107_170911;17:09:31;19,8;196,7;iso;3;50;188;contando;operando;50,85;50,9;221,3;220,6;221,3;119;119;119;40,3;1800;28,31;60,00;51,4;7,2;0,99;17,19;0;1
S20261107_170911;17:09:32;20,8;206,8;iso;3;50;198;contando;operando;50,82;50,8;221,5;221,1;221,4;118;119;120;40,7;1800;28,26;60,00;51,3;7,2;0,99;17,18;0;1
S20261107_170911;17:09:33;21,8;216,7;iso;3;50;208;contando;operando;50,64;50,6;221,0;221,1;221,4;119;119;120;41,1;1800;28,31;60,00;51,1;7,2;0,99;17,14;0;1
S20261107_170911;17:09:34;22,8;226,8;iso;3;50;218;contando;operando;51,42;51,3;221,5;221,0;221,6;120;121;121;41,4;1799;28,29;60,00;51,9;7,3;0,99;17,31;0;1
S20261107_170911;17:09:35;23,8;236,7;iso;3;50;228;contando;operando;50,73;50,5;221,3;220,9;221,6;119;119;119;41,7;1800;28,30;60,00;51,2;7,2;0,99;17,16;0;1
S20261107_170911;17:09:36;24,8;246,8;iso;3;50;238;contando;operando;51,32;51,2;221,1;220,9;221,3;120;121;121;42,0;1800;28,32;60,00;51,8;7,3;0,99;17,29;0;1
S20261107_170911;17:09:37;25,8;256,7;iso;4;100;243;contando;operando;101,96;101,5;221,6;221,0;221,8;239;240;241;44,0;1800;28,26;60,00;103,0;14,5;0,99;28,43;0;1
S20261107_170911;17:09:38;26,8;266,7;iso;4;100;253;contando;operando;103,15;103,1;221,4;221,2;221,8;242;243;243;46,2;1799;28,29;60,00;104,2;14,7;0,99;28,69;0;1
S20261107_170911;17:09:39;27,8;276,7;iso;4;100;263;contando;operando;102,14;102,1;221,4;221,1;221,9;239;240;241;48,3;1801;28,26;60,00;103,2;14,6;0,99;28,47;0;1
S20261107_170911;17:09:40;28,8;286,7;iso;4;100;273;contando;operando;101,87;102,0;221,4;221,3;221,9;238;239;241;50,1;1801;28,31;60,00;102,9;14,5;0,99;28,41;0;1
S20261107_170911;17:09:41;29,8;296,7;iso;4;100;283;contando;operando;101,02;100,9;221,3;221,2;221,7;236;238;239;51,8;1801;28,30;60,00;102,0;14,4;0,99;28,22;0;1
S20261107_170911;17:09:42;30,8;306,7;iso;4;100;293;contando;operando;101,23;101,1;221,7;220,9;221,8;237;238;239;53,4;1801;28,28;60,00;102,3;14,4;0,99;28,27;0;1
S20261107_170911;17:09:43;31,8;316,7;iso;4;100;303;contando;operando;101,97;102,2;221,5;221,2;221,9;239;240;240;54,8;1800;28,31;60,00;103,0;14,5;0,99;28,43;0;1
S20261107_170911;17:09:44;32,8;326,7;iso;4;100;313;contando;operando;102,46;102,3;221,5;221,2;221,5;240;240;242;56,2;1800;28,33;60,00;103,5;14,6;0,99;28,54;0;1
S20261107_170911;17:09:45;33,8;336,8;iso;4;100;324;contando;operando;101,42;101,6;221,4;221,1;221,6;238;238;239;57,4;1800;28,31;60,00;102,4;14,5;0,99;28,31;0;1
S20261107_170911;17:09:46;34,8;346,7;iso;4;100;333;contando;operando;101,85;101,8;221,5;221,6;221,6;238;239;240;58,5;1800;28,33;60,00;102,9;14,5;0,99;28,41;0;1
S20261107_170911;17:09:47;35,8;356,7;iso;4;100;343;contando;operando;102,04;102,0;221,6;221,3;221,6;239;240;240;59,6;1800;28,35;60,00;103,1;14,5;0,99;28,45;0;1
S20261107_170911;17:09:48;36,8;366,7;iso;4;100;353;contando;operando;101,50;101,6;221,6;221,1;221,8;237;238;239;60,5;1800;28,32;60,00;102,5;14,5;0,99;28,33;0;1
S20261107_170911;17:09:49;37,8;376,7;iso;4;100;363;contando;operando;101,57;101,7;221,5;221,1;221,9;238;238;240;61,4;1801;28,32;60,00;102,6;14,5;0,99;28,35;0;1
S20261107_170911;17:09:50;38,8;386,7;iso;4;100;373;contando;operando;101,65;101,8;221,4;221,1;221,9;238;239;240;62,2;1800;28,33;60,00;102,7;14,5;0,99;28,36;0;1
S20261107_170911;17:09:51;39,8;396,8;iso;4;100;384;contando;operando;101,66;101,9;221,6;221,3;221,8;238;239;240;63,0;1801;28,28;60,00;102,7;14,5;0,99;28,37;0;1
S20261107_170911;17:09:52;40,8;406,7;iso;4;100;393;contando;operando;102,60;102,6;221,4;221,3;221,8;240;242;242;63,7;1799;28,26;60,00;103,6;14,6;0,99;28,57;0;1
S20261107_170911;17:09:53;41,8;416,7;iso;4;100;403;contando;operando;102,09;102,1;221,4;221,2;221,7;240;240;241;64,4;1800;28,26;60,00;103,1;14,5;0,99;28,46;0;1
S20261107_170911;17:09:54;42,8;426,7;iso;4;100;413;contando;operando;101,57;101,3;221,4;221,3;221,7;237;238;239;64,9;1800;28,30;60,00;102,6;14,5;0,99;28,34;0;1
S20261107_170911;17:09:55;43,8;436,7;iso;4;100;423;contando;operando;101,22;101,1;221,6;221,3;221,6;237;238;239;65,5;1800;28,33;60,00;102,2;14,4;0,99;28,27;0;1
S20261107_170911;17:09:56;44,8;446,7;iso;4;100;433;contando;operando;102,67;102,6;221,7;221,2;221,7;240;241;242;66,0;1801;28,31;60,00;103,7;14,6;0,99;28,59;0;1
S20261107_170911;17:09:57;45,8;456,7;iso;4;100;443;contando;operando;101,23;101,1;221,5;221,1;221,9;237;238;239;66,4;1801;28,29;60,00;102,3;14,4;0,99;28,27;0;1
S20261107_170911;17:09:58;46,8;466,7;iso;4;100;453;contando;operando;101,83;101,7;221,5;221,3;221,8;238;239;240;66,8;1800;28,31;60,00;102,9;14,5;0,99;28,40;0;1
S20261107_170911;17:09:59;47,8;476,7;iso;4;100;463;contando;operando;101,74;101,7;221,4;221,2;221,5;238;239;240;67,2;1800;28,32;60,00;102,8;14,5;0,99;28,38;0;1
S20261107_170911;17:10:00;48,8;486,7;iso;4;100;473;contando;operando;102,41;102,6;221,6;221,1;221,8;239;240;242;67,5;1800;28,31;60,00;103,4;14,6;0,99;28,53;0;1
S20261107_170911;17:10:01;49,8;496,7;iso;4;100;483;contando;operando;101,95;101,7;221,5;221,3;221,5;239;240;241;67,8;1799;28,33;60,00;103,0;14,5;0,99;28,43;0;1
S20261107_170911;17:10:02;50,8;506,8;iso;4;100;494;contando;operando;101,68;101,5;221,4;221,2;221,6;238;239;240;68,1;1800;28,28;60,00;102,7;14,5;0,99;28,37;0;1
S20261107_170911;17:10:03;51,8;516,7;iso;4;100;503;contando;operando;102,26;102,2;221,5;221,1;221,7;239;240;241;68,4;1800;28,24;60,00;103,3;14,6;0,99;28,50;0;1
S20261107_170911;17:10:04;52,8;526,7;iso;4;100;513;contando;operando;102,08;102,0;221,7;221,1;221,7;239;240;241;68,7;1800;28,35;60,00;103,1;14,5;0,99;28,46;0;1
S20261107_170911;17:10:05;53,8;536,7;iso;4;100;523;contando;operando;102,15;102,3;221,5;221,1;221,6;239;240;242;69,0;1800;28,29;60,00;103,2;14,6;0,99;28,47;0;1
S20261107_170911;17:10:06;54,8;546,7;iso;4;100;533;contando;operando;101,97;102,1;221,6;221,0;221,7;239;240;241;69,2;1801;28,32;60,00;103,0;14,5;0,99;28,43;0;1
S20261107_170911;17:10:07;55,8;556,8;iso;5;107;540;estabilizando;operando;108,38;108,6;221,6;221,3;221,6;254;255;256;69,5;1799;28,31;60,00;109,5;15,4;0,99;29,84;0;1
S20261107_170911;17:10:08;56,8;566,7;iso;5;107;550;contando;operando;108,51;108,6;221,6;221,2;221,8;254;255;256;70,0;1801;28,31;60,00;109,6;15,5;0,99;29,87;0;1
S20261107_170911;17:10:09;57,8;576,7;iso;5;107;560;contando;operando;108,86;108,8;221,6;221,3;221,9;255;256;257;70,5;1800;28,30;60,00;110,0;15,5;0,99;29,95;0;1
S20261107_170911;17:10:10;58,8;586,7;iso;5;107;570;contando;operando;107,69;107,6;221,4;221,1;221,4;252;253;254;70,9;1800;28,32;60,00;108,8;15,3;0,99;29,69;0;1
S20261107_170911;17:10:11;59,8;596,8;iso;5;107;580;contando;operando;107,89;107,8;221,5;221,2;221,5;252;254;254;71,3;1800;28,30;60,00;109,0;15,4;0,99;29,73;0;1
S20261107_170911;17:10:12;60,8;606,7;iso;5;107;590;contando;operando;107,78;107,7;221,5;221,2;221,9;252;253;254;71,7;1800;28,31;60,00;108,9;15,4;0,99;29,71;0;1
S20261107_170911;17:10:13;61,8;616,7;iso;5;107;600;contando;operando;108,16;108,0;221,6;221,2;221,8;253;254;255;72,0;1799;28,30;60,00;109,3;15,4;0,99;29,80;0;1
S20261107_170911;17:10:14;62,8;626,7;iso;5;107;610;contando;operando;107,35;107,3;221,5;221,3;221,8;251;252;253;72,3;1800;28,31;60,00;108,4;15,3;0,99;29,62;0;1
S20261107_170911;17:10:15;63,8;636,8;iso;5;107;620;contando;operando;108,16;108,3;221,5;221,2;221,7;253;254;255;72,5;1800;28,26;60,00;109,2;15,4;0,99;29,79;0;1
S20261107_170911;17:10:16;64,8;646,7;iso;5;107;630;contando;operando;108,47;108,4;221,8;221,0;221,5;254;255;256;72,8;1800;28,31;60,00;109,6;15,5;0,99;29,86;0;1
S20261107_170911;17:10:17;65,8;656,7;iso;5;107;640;contando;operando;108,23;108,2;221,7;221,2;221,8;253;255;255;73,0;1801;28,31;60,00;109,3;15,4;0,99;29,81;0;1
S20261107_170911;17:10:18;66,8;666,7;iso;5;107;650;contando;operando;108,80;108,8;221,6;221,3;221,7;255;256;257;73,3;1800;28,30;60,00;109,9;15,5;0,99;29,94;0;1
S20261107_170911;17:10:19;67,8;676,7;iso;5;107;660;contando;operando;108,41;108,4;221,5;221,0;221,9;254;255;256;73,5;1800;28,30;60,00;109,5;15,4;0,99;29,85;0;1
S20261107_170911;17:10:20;68,8;686,8;iso;6;0;665;contando;operando;0,00;0,0;220,8;220,7;221,2;0;0;0;70,6;1801;28,35;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:21;69,8;696,7;iso;6;0;675;contando;operando;0,00;0,0;221,0;220,7;221,4;0;0;0;67,7;1800;28,29;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:22;70,8;706,7;iso;6;0;685;contando;operando;0,00;0,0;221,1;220,9;221,2;0;0;0;65,1;1800;28,35;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:23;71,8;716,7;iso;6;0;695;contando;operando;0,00;0,0;221,2;220,8;221,3;0;0;0;62,7;1800;28,33;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:24;72,8;726,7;iso;6;0;705;contando;operando;0,00;0,0;221,2;220,7;221,6;0;0;0;60,5;1799;28,26;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:25;73,8;736,7;iso;6;0;715;contando;operando;0,00;0,0;221,1;220,6;221,2;0;0;0;58,5;1800;28,33;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:26;74,8;746,7;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,1;220,8;221,3;0;0;0;56,6;1800;28,28;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:27;75,8;756,7;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,2;220,8;221,2;0;0;0;54,9;1800;28,27;60,00;0,0;0,0;1,00;6,00;0;1
S20261107_170911;17:10:28;76,8;766,7;iso;6;0;720;aguardando_finalizar;operando;0,00;0,0;221,1;220,7;221,4;0;0;0;53,3;1802;28,27;60,00;0,0;0,0;1,00;6,00;0;1
```

---

## logs/eventos_tela.jsonl

```
{"sessao":"smw6u1pp7fsw0","n":1,"t":"2026-11-07T20:05:10.364Z","ms":2,"v":"1.10.179","modo":"real","card":"app","tipo":"sistema","acao":"HTML iniciado","res":"info","det":{"versao":"1.10.179","url":"content://com.google.android.apps.nbu.files.provider","ua":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.…"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":2,"t":"2026-11-07T20:05:10.365Z","ms":2,"v":"1.10.179","modo":"real","card":"app","tipo":"sistema","acao":"estado inicial","res":"info","det":null,"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":3,"t":"2026-11-07T20:05:10.367Z","ms":4,"v":"1.10.179","modo":"real","card":"reg","tipo":"api","acao":"GET /api/ensaio/snap → sem resposta","res":"falha","det":{"rota":"GET /api/ensaio/snap","status":0,"ms":1,"erro":"TypeError: Failed to fetch"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":4,"t":"2026-11-07T20:05:15.284Z","ms":4921,"v":"1.10.179","modo":"real","card":"reg","tipo":"api","acao":"GET /api/ensaio/modo → sem resposta","res":"falha","det":{"rota":"GET /api/ensaio/modo","status":0,"ms":0,"erro":"TypeError: Failed to fetch"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":5,"t":"2026-11-07T20:05:19.893Z","ms":9530,"v":"1.10.179","modo":"real","card":"app","tipo":"clique","acao":"clique em #bDemo \"Demo\"","res":"info","det":{"area":"tela","id":"bDemo"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":6,"t":"2026-11-07T20:05:19.969Z","ms":9606,"v":"1.10.179","modo":"real","card":"DEV.DEM","tipo":"transicao","acao":"abriu popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":7,"t":"2026-11-07T20:05:23.620Z","ms":13257,"v":"1.10.179","modo":"real","card":"DEV.DEM","tipo":"alteracao","acao":"alterou #opsModo = avancado","res":"info","det":{"id":"opsModo","name":null,"valor":"avancado","area":"dlgDemo"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":8,"t":"2026-11-07T20:05:25.284Z","ms":14922,"v":"1.10.179","modo":"real","card":"reg","tipo":"api","acao":"GET /api/ensaio/modo → sem resposta","res":"falha","det":{"rota":"GET /api/ensaio/modo","status":0,"ms":1,"omitidas":1,"erro":"TypeError: Failed to fetch"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":9,"t":"2026-11-07T20:05:25.286Z","ms":14923,"v":"1.10.179","modo":"real","card":"reg","tipo":"api","acao":"GET /api/ensaio/snap → sem resposta","res":"falha","det":{"rota":"GET /api/ensaio/snap","status":0,"ms":0,"omitidas":2,"erro":"TypeError: Failed to fetch"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":10,"t":"2026-11-07T20:05:26.437Z","ms":16074,"v":"1.10.179","modo":"real","card":"DEV.DEM","tipo":"alteracao","acao":"alterou #dmTradicional = marcado","res":"info","det":{"id":"dmTradicional","name":null,"valor":"marcado","area":"dlgDemo"},"est":{"modo":"real","gen":"—","sim":null,"ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":false,"b56":false,"b400":false}}}
{"sessao":"smw6u1pp7fsw0","n":11,"t":"2026-11-07T20:05:26.439Z","ms":16077,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"sistema","acao":"BC56: leitura do PLC VOLTOU","res":"ok","det":{"motivo":"informe a URL do Node-RED do PLC no botão Demo (campo Servidor)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo"],"com":{"dse":false,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":12,"t":"2026-11-07T20:05:26.440Z","ms":16077,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"sistema","acao":"BC400: leitura do PLC VOLTOU","res":"ok","det":{"motivo":"informe a URL do Node-RED do PLC no botão Demo (campo Servidor)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo"],"com":{"dse":false,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":13,"t":"2026-11-07T20:05:26.441Z","ms":16078,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"sistema","acao":"BC59,5: leitura do PLC VOLTOU","res":"ok","det":{"motivo":""},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo"],"com":{"dse":false,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":14,"t":"2026-11-07T20:05:26.441Z","ms":16078,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"sistema","acao":"BC550: leitura do PLC VOLTOU","res":"ok","det":{"motivo":""},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":null,"lig56":false,"sel400":null,"lig400":false,"sel595":null,"lig595":false,"sel550":null,"lig550":false,"setup":null,"pop":["dlgDemo"],"com":{"dse":false,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":15,"t":"2026-11-07T20:05:26.567Z","ms":16204,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"modo: real → demoLocal","res":"info","det":{"campo":"modo","de":"real","para":"demoLocal"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":16,"t":"2026-11-07T20:05:26.567Z","ms":16204,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"gerador: — → parado","res":"info","det":{"campo":"gen","de":"—","para":"parado"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":17,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"simulação: — → MANUAL","res":"info","det":{"campo":"sim","de":null,"para":"MANUAL"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":18,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"seletora BC56: sem sinal → Auto (remoto)","res":"info","det":{"campo":"sel56","de":null,"para":"auto"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":19,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"BC56 ligado (cbBanco.ligar): desligado → LIGADO","res":"info","det":{"campo":"lig56","de":false,"para":true},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":20,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"seletora BC400: sem sinal → Auto (remoto)","res":"info","det":{"campo":"sel400","de":null,"para":"auto"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":21,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"BC400 ligado (cbBanco.ligar): desligado → LIGADO","res":"info","det":{"campo":"lig400","de":false,"para":true},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":22,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"seletora BC59,5: sem sinal → Auto (remoto)","res":"info","det":{"campo":"sel595","de":null,"para":"auto"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":23,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"BC59,5 ligado (cbBanco.ligar): desligado → LIGADO","res":"info","det":{"campo":"lig595","de":false,"para":true},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":24,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"seletora BC550: sem sinal → Auto (remoto)","res":"info","det":{"campo":"sel550","de":null,"para":"auto"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":25,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"bco","tipo":"transicao","acao":"BC550 ligado (cbBanco.ligar): desligado → LIGADO","res":"info","det":{"campo":"lig550","de":false,"para":true},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":26,"t":"2026-11-07T20:05:26.568Z","ms":16205,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"transicao","acao":"comunicação DSE: FALHA → OK","res":"ok","det":{"campo":"com.dse","de":false,"para":true},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":27,"t":"2026-11-07T20:05:43.829Z","ms":33466,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"alteracao","acao":"alterou #opsDisp = Mobile Poco X6 Pro","res":"info","det":{"id":"opsDisp","name":null,"valor":"Mobile Poco X6 Pro","area":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":28,"t":"2026-11-07T20:05:48.636Z","ms":38273,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"clique","acao":"clique em #opsIni \"▶ Iniciar o Dev/Operador oculto\"","res":"info","det":{"area":"dlgDemo","id":"opsIni"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":29,"t":"2026-11-07T20:05:48.640Z","ms":38277,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"Dev/Operador oculto: início","res":"info","det":{"tipo":"avancado","modo":"demoLocal","semente":20261107,"perfil":{"larg":406,"alt":848,"dpr":3,"toque":true,"ua":"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0","nome":"Mobile Poco X6 Pro","tipo":"celular","zoomNav":100,"telaFisica":"407×904"},"versao":"1.10.179"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":30,"t":"2026-11-07T20:05:48.641Z","ms":38278,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"Preparação · dispositivo","res":"ok","det":{"det":"\"Mobile Poco X6 Pro\" · celular · zoom do navegador ≈ 100 %"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":31,"t":"2026-11-07T20:05:48.643Z","ms":38280,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"Preparação · perfil da tela","res":"ok","det":{"det":"406×848 px (tela física 407×904) · DPR 3 · toque · Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":32,"t":"2026-11-07T20:05:48.653Z","ms":38290,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"Chaves (⚙) · chaves já habilitadas","res":"aviso","det":{"det":"todas as 56 chaves estavam habilitadas: nada a mudar"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":33,"t":"2026-11-07T20:05:48.674Z","ms":38311,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bMenos \"A−\"","res":"info","det":{"area":"tela","id":"bMenos"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":34,"t":"2026-11-07T20:05:48.766Z","ms":38403,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"fechou popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":35,"t":"2026-11-07T20:05:48.849Z","ms":38486,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bMais \"A+\"","res":"info","det":{"area":"tela","id":"bMais"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":36,"t":"2026-11-07T20:05:49.025Z","ms":38662,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":37,"t":"2026-11-07T20:05:49.067Z","ms":38704,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":38,"t":"2026-11-07T20:05:49.218Z","ms":38855,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #bReg \"Registro\"","res":"info","det":{"area":"dlgReg","id":"bReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":39,"t":"2026-11-07T20:05:49.383Z","ms":39020,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em botão \"⤢\" [dlgReg]","res":"info","det":{"area":"dlgReg","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":40,"t":"2026-11-07T20:05:49.634Z","ms":39272,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":41,"t":"2026-11-07T20:05:49.977Z","ms":39614,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = ","res":"info","det":{"id":"rgMeta","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":42,"t":"2026-11-07T20:05:50.059Z","ms":39696,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 0","res":"info","det":{"id":"rgMeta","name":null,"valor":"0","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":43,"t":"2026-11-07T20:05:50.142Z","ms":39779,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = -1","res":"info","det":{"id":"rgMeta","name":null,"valor":"-1","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":44,"t":"2026-11-07T20:05:50.225Z","ms":39862,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 999999","res":"info","det":{"id":"rgMeta","name":null,"valor":"999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":45,"t":"2026-11-07T20:05:50.306Z","ms":39943,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = abc","res":"info","det":{"id":"rgMeta","name":null,"valor":"abc","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":46,"t":"2026-11-07T20:05:50.389Z","ms":40026,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 1e9","res":"info","det":{"id":"rgMeta","name":null,"valor":"1e9","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":47,"t":"2026-11-07T20:05:50.471Z","ms":40108,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 999999999999999999999999999999","res":"info","det":{"id":"rgMeta","name":null,"valor":"999999999999999999999999999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":48,"t":"2026-11-07T20:05:50.554Z","ms":40191,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 100","res":"info","det":{"id":"rgMeta","name":null,"valor":"100","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":49,"t":"2026-11-07T20:05:50.803Z","ms":40440,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgReg] input#rgAuto \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":50,"t":"2026-11-07T20:05:50.808Z","ms":40445,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgAuto = desmarcado","res":"info","det":{"id":"rgAuto","name":null,"valor":"desmarcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":51,"t":"2026-11-07T20:05:50.889Z","ms":40526,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgAuto = marcado","res":"info","det":{"id":"rgAuto","name":null,"valor":"marcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":52,"t":"2026-11-07T20:05:51.053Z","ms":40690,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgReg] input#rgSemDemo \"on\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":53,"t":"2026-11-07T20:05:51.061Z","ms":40698,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgSemDemo = marcado","res":"info","det":{"id":"rgSemDemo","name":null,"valor":"marcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":54,"t":"2026-11-07T20:05:51.143Z","ms":40780,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgSemDemo = desmarcado","res":"info","det":{"id":"rgSemDemo","name":null,"valor":"desmarcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":55,"t":"2026-11-07T20:05:51.308Z","ms":40945,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgExp \"Exportar ▾\"","res":"info","det":{"area":"dlgReg","id":"rgExp"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":56,"t":"2026-11-07T20:05:51.566Z","ms":41203,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgPasta \"📁 Escolher pasta p/ salvar automático\"","res":"info","det":{"area":"dlgReg","id":"rgPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":57,"t":"2026-11-07T20:05:51.736Z","ms":41373,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgFecha \"Fechar\"","res":"info","det":{"area":"dlgReg","id":"rgFecha"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":58,"t":"2026-11-07T20:05:51.767Z","ms":41404,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":59,"t":"2026-11-07T20:05:51.902Z","ms":41539,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":60,"t":"2026-11-07T20:05:52.066Z","ms":41703,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":61,"t":"2026-11-07T20:05:52.155Z","ms":41792,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em botão \"✕\" [dlgReg]","res":"info","det":{"area":"dlgReg","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":62,"t":"2026-11-07T20:05:52.367Z","ms":42004,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":63,"t":"2026-11-07T20:05:52.397Z","ms":42034,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":64,"t":"2026-11-07T20:05:52.670Z","ms":42307,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":65,"t":"2026-11-07T20:05:52.841Z","ms":42478,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":66,"t":"2026-11-07T20:05:52.967Z","ms":42604,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":67,"t":"2026-11-07T20:05:52.967Z","ms":42604,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":68,"t":"2026-11-07T20:05:53.016Z","ms":42653,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgCentral]","res":"info","det":{"area":"dlgCentral","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":69,"t":"2026-11-07T20:05:53.267Z","ms":42904,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":70,"t":"2026-11-07T20:05:53.270Z","ms":42907,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":71,"t":"2026-11-07T20:05:53.566Z","ms":43203,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":72,"t":"2026-11-07T20:05:53.600Z","ms":43237,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input \"pasta\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":73,"t":"2026-11-07T20:05:53.852Z","ms":43490,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenEscolhe \"Escolher pasta…\"","res":"info","det":{"area":"dlgCentral","id":"cenEscolhe"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":74,"t":"2026-11-07T20:05:54.016Z","ms":43653,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input \"down\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":75,"t":"2026-11-07T20:05:54.022Z","ms":43659,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou cenDest = marcado","res":"info","det":{"id":null,"name":"cenDest","valor":"marcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":76,"t":"2026-11-07T20:05:54.265Z","ms":43902,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input#cenAgr \"on\"","res":"aviso","det":{"det":"19×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":77,"t":"2026-11-07T20:05:54.270Z","ms":43908,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #cenAgr = desmarcado","res":"info","det":{"id":"cenAgr","name":null,"valor":"desmarcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":78,"t":"2026-11-07T20:05:54.352Z","ms":43989,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #cenAgr = marcado","res":"info","det":{"id":"cenAgr","name":null,"valor":"marcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":79,"t":"2026-11-07T20:05:54.517Z","ms":44154,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenSalva \"Salvar selecionados\"","res":"info","det":{"area":"dlgCentral","id":"cenSalva"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":80,"t":"2026-11-07T20:05:54.692Z","ms":44329,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenImprime \"Imprimir agora\"","res":"info","det":{"area":"dlgCentral","id":"cenImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":81,"t":"2026-11-07T20:05:54.867Z","ms":44504,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenCopia \"Copiar resumo\"","res":"info","det":{"area":"dlgCentral","id":"cenCopia"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":82,"t":"2026-11-07T20:05:55.034Z","ms":44671,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgCentral]","res":"info","det":{"area":"dlgCentral","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":83,"t":"2026-11-07T20:05:55.066Z","ms":44703,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":84,"t":"2026-11-07T20:05:55.267Z","ms":44904,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":85,"t":"2026-11-07T20:05:55.366Z","ms":45003,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":86,"t":"2026-11-07T20:05:55.667Z","ms":45304,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":87,"t":"2026-11-07T20:05:55.759Z","ms":45396,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bTema \"Modo escuro — clique para ligar o tema escuro\"","res":"info","det":{"area":"tela","id":"bTema"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":88,"t":"2026-11-07T20:05:55.931Z","ms":45568,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":89,"t":"2026-11-07T20:05:56.013Z","ms":45650,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":90,"t":"2026-11-07T20:05:56.171Z","ms":45808,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgVer]","res":"info","det":{"area":"dlgVer","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":91,"t":"2026-11-07T20:05:56.420Z","ms":46057,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":92,"t":"2026-11-07T20:05:56.792Z","ms":46429,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgVer]","res":"info","det":{"area":"dlgVer","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":93,"t":"2026-11-07T20:05:56.870Z","ms":46507,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":94,"t":"2026-11-07T20:05:57.036Z","ms":46673,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":95,"t":"2026-11-07T20:05:57.168Z","ms":46805,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":96,"t":"2026-11-07T20:05:57.468Z","ms":47105,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":97,"t":"2026-11-07T20:05:57.590Z","ms":47227,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAlertas \"Alertas 0\"","res":"info","det":{"area":"tela","id":"bAlertas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":98,"t":"2026-11-07T20:05:57.769Z","ms":47406,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":99,"t":"2026-11-07T20:05:57.774Z","ms":47411,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":100,"t":"2026-11-07T20:05:58.018Z","ms":47655,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Alertas 0\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":101,"t":"2026-11-07T20:05:58.190Z","ms":47827,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Falhas 2\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":102,"t":"2026-11-07T20:05:58.359Z","ms":47996,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ","res":"info","det":{"id":"ocCard","name":null,"valor":"","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":103,"t":"2026-11-07T20:05:58.440Z","ms":48078,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = modo","res":"info","det":{"id":"ocCard","name":null,"valor":"modo","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":104,"t":"2026-11-07T20:05:58.523Z","ms":48160,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ens","res":"info","det":{"id":"ocCard","name":null,"valor":"ens","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":105,"t":"2026-11-07T20:05:58.605Z","ms":48242,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = gra","res":"info","det":{"id":"ocCard","name":null,"valor":"gra","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":106,"t":"2026-11-07T20:05:58.686Z","ms":48323,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = med","res":"info","det":{"id":"ocCard","name":null,"valor":"med","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":107,"t":"2026-11-07T20:05:58.768Z","ms":48405,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = bco","res":"info","det":{"id":"ocCard","name":null,"valor":"bco","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":108,"t":"2026-11-07T20:05:58.851Z","ms":48489,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = reg","res":"info","det":{"id":"ocCard","name":null,"valor":"reg","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":109,"t":"2026-11-07T20:05:58.935Z","ms":48572,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = app","res":"info","det":{"id":"ocCard","name":null,"valor":"app","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":110,"t":"2026-11-07T20:05:59.019Z","ms":48656,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ","res":"info","det":{"id":"ocCard","name":null,"valor":"","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":111,"t":"2026-11-07T20:05:59.191Z","ms":48828,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Ativas\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":112,"t":"2026-11-07T20:05:59.359Z","ms":48996,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Todas\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":113,"t":"2026-11-07T20:05:59.529Z","ms":49166,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocLimpa \"Limpar normalizadas\"","res":"info","det":{"area":"dlgOcor","id":"ocLimpa"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":114,"t":"2026-11-07T20:05:59.697Z","ms":49334,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocLeg \"ⓘ Legenda\"","res":"info","det":{"area":"dlgOcor","id":"ocLeg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":115,"t":"2026-11-07T20:05:59.867Z","ms":49504,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocHist \"Histórico\"","res":"info","det":{"area":"dlgOcor","id":"ocHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":116,"t":"2026-11-07T20:05:59.903Z","ms":49540,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":117,"t":"2026-11-07T20:06:00.062Z","ms":49699,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":118,"t":"2026-11-07T20:06:00.312Z","ms":49949,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ","res":"info","det":{"id":"ohCard","name":null,"valor":"","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":119,"t":"2026-11-07T20:06:00.400Z","ms":50037,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = modo","res":"info","det":{"id":"ohCard","name":null,"valor":"modo","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":120,"t":"2026-11-07T20:06:00.487Z","ms":50124,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ens","res":"info","det":{"id":"ohCard","name":null,"valor":"ens","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":121,"t":"2026-11-07T20:06:00.569Z","ms":50207,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = gra","res":"info","det":{"id":"ohCard","name":null,"valor":"gra","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":122,"t":"2026-11-07T20:06:00.651Z","ms":50288,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = med","res":"info","det":{"id":"ohCard","name":null,"valor":"med","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":123,"t":"2026-11-07T20:06:00.738Z","ms":50375,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = bco","res":"info","det":{"id":"ohCard","name":null,"valor":"bco","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":124,"t":"2026-11-07T20:06:00.822Z","ms":50460,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = reg","res":"info","det":{"id":"ohCard","name":null,"valor":"reg","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":125,"t":"2026-11-07T20:06:00.906Z","ms":50543,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = app","res":"info","det":{"id":"ohCard","name":null,"valor":"app","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":126,"t":"2026-11-07T20:06:00.987Z","ms":50624,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ","res":"info","det":{"id":"ohCard","name":null,"valor":"","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":127,"t":"2026-11-07T20:06:01.163Z","ms":50800,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Todos\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":128,"t":"2026-11-07T20:06:01.339Z","ms":50976,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Falhas\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":129,"t":"2026-11-07T20:06:01.511Z","ms":51148,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Alertas\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":130,"t":"2026-11-07T20:06:01.681Z","ms":51318,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ohExp \"Exportar ▾\"","res":"info","det":{"area":"dlgOcHist","id":"ohExp"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":131,"t":"2026-11-07T20:06:01.941Z","ms":51578,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ohLimpa \"Limpar histórico\"","res":"info","det":{"area":"dlgOcHist","id":"ohLimpa"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":132,"t":"2026-11-07T20:06:02.108Z","ms":51745,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":133,"t":"2026-11-07T20:06:02.268Z","ms":51905,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":134,"t":"2026-11-07T20:06:02.350Z","ms":51987,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocHist \"Histórico\"","res":"info","det":{"area":"dlgOcor","id":"ocHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":135,"t":"2026-11-07T20:06:02.566Z","ms":52203,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":136,"t":"2026-11-07T20:06:02.849Z","ms":52486,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAlertas \"Alertas 0\"","res":"info","det":{"area":"tela","id":"bAlertas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":137,"t":"2026-11-07T20:06:02.867Z","ms":52504,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":138,"t":"2026-11-07T20:06:03.113Z","ms":52751,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocImprime \"Exportar ▾\"","res":"info","det":{"area":"dlgOcor","id":"ocImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":139,"t":"2026-11-07T20:06:03.365Z","ms":53002,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":140,"t":"2026-11-07T20:06:03.466Z","ms":53103,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":141,"t":"2026-11-07T20:06:03.611Z","ms":53248,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAlertas \"Alertas 0\"","res":"info","det":{"area":"tela","id":"bAlertas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":142,"t":"2026-11-07T20:06:03.767Z","ms":53404,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":143,"t":"2026-11-07T20:06:04.067Z","ms":53704,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":144,"t":"2026-11-07T20:06:04.116Z","ms":53753,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bFalhas \"Falhas 2\"","res":"info","det":{"area":"tela","id":"bFalhas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":145,"t":"2026-11-07T20:06:04.301Z","ms":53938,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":146,"t":"2026-11-07T20:06:04.366Z","ms":54003,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":147,"t":"2026-11-07T20:06:04.552Z","ms":54189,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Alertas 0\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":148,"t":"2026-11-07T20:06:04.727Z","ms":54364,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Falhas 2\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":149,"t":"2026-11-07T20:06:04.893Z","ms":54530,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ","res":"info","det":{"id":"ocCard","name":null,"valor":"","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":150,"t":"2026-11-07T20:06:04.975Z","ms":54612,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = modo","res":"info","det":{"id":"ocCard","name":null,"valor":"modo","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":151,"t":"2026-11-07T20:06:05.057Z","ms":54694,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ens","res":"info","det":{"id":"ocCard","name":null,"valor":"ens","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":152,"t":"2026-11-07T20:06:05.139Z","ms":54776,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = gra","res":"info","det":{"id":"ocCard","name":null,"valor":"gra","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":153,"t":"2026-11-07T20:06:05.221Z","ms":54858,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = med","res":"info","det":{"id":"ocCard","name":null,"valor":"med","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":154,"t":"2026-11-07T20:06:05.304Z","ms":54941,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = bco","res":"info","det":{"id":"ocCard","name":null,"valor":"bco","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":155,"t":"2026-11-07T20:06:05.386Z","ms":55023,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = reg","res":"info","det":{"id":"ocCard","name":null,"valor":"reg","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":156,"t":"2026-11-07T20:06:05.474Z","ms":55111,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = app","res":"info","det":{"id":"ocCard","name":null,"valor":"app","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":157,"t":"2026-11-07T20:06:05.556Z","ms":55193,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ocCard = ","res":"info","det":{"id":"ocCard","name":null,"valor":"","area":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":158,"t":"2026-11-07T20:06:05.731Z","ms":55368,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Ativas\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":159,"t":"2026-11-07T20:06:05.899Z","ms":55536,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Todas\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":160,"t":"2026-11-07T20:06:06.068Z","ms":55705,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocLimpa \"Limpar normalizadas\"","res":"info","det":{"area":"dlgOcor","id":"ocLimpa"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":161,"t":"2026-11-07T20:06:06.239Z","ms":55876,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocLeg \"ⓘ Legenda\"","res":"info","det":{"area":"dlgOcor","id":"ocLeg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":162,"t":"2026-11-07T20:06:06.404Z","ms":56041,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocHist \"Histórico\"","res":"info","det":{"area":"dlgOcor","id":"ocHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":163,"t":"2026-11-07T20:06:06.466Z","ms":56103,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":164,"t":"2026-11-07T20:06:06.591Z","ms":56228,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":165,"t":"2026-11-07T20:06:06.841Z","ms":56478,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ","res":"info","det":{"id":"ohCard","name":null,"valor":"","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":166,"t":"2026-11-07T20:06:06.923Z","ms":56560,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = modo","res":"info","det":{"id":"ohCard","name":null,"valor":"modo","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":167,"t":"2026-11-07T20:06:07.006Z","ms":56643,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ens","res":"info","det":{"id":"ohCard","name":null,"valor":"ens","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":168,"t":"2026-11-07T20:06:07.087Z","ms":56725,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = gra","res":"info","det":{"id":"ohCard","name":null,"valor":"gra","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":169,"t":"2026-11-07T20:06:07.170Z","ms":56807,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = med","res":"info","det":{"id":"ohCard","name":null,"valor":"med","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":170,"t":"2026-11-07T20:06:07.251Z","ms":56888,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = bco","res":"info","det":{"id":"ohCard","name":null,"valor":"bco","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":171,"t":"2026-11-07T20:06:07.333Z","ms":56970,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = reg","res":"info","det":{"id":"ohCard","name":null,"valor":"reg","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":172,"t":"2026-11-07T20:06:07.415Z","ms":57053,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = app","res":"info","det":{"id":"ohCard","name":null,"valor":"app","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":173,"t":"2026-11-07T20:06:07.501Z","ms":57138,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #ohCard = ","res":"info","det":{"id":"ohCard","name":null,"valor":"","area":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":174,"t":"2026-11-07T20:06:07.668Z","ms":57305,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Todos\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":175,"t":"2026-11-07T20:06:07.837Z","ms":57474,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Falhas\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":176,"t":"2026-11-07T20:06:08.007Z","ms":57644,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"Alertas\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":177,"t":"2026-11-07T20:06:08.174Z","ms":57811,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ohExp \"Exportar ▾\"","res":"info","det":{"area":"dlgOcHist","id":"ohExp"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":178,"t":"2026-11-07T20:06:08.432Z","ms":58069,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ohLimpa \"Limpar histórico\"","res":"info","det":{"area":"dlgOcHist","id":"ohLimpa"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":179,"t":"2026-11-07T20:06:08.597Z","ms":58234,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcHist]","res":"info","det":{"area":"dlgOcHist","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgOcHist","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":180,"t":"2026-11-07T20:06:08.839Z","ms":58476,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocHist \"Histórico\"","res":"info","det":{"area":"dlgOcor","id":"ocHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":181,"t":"2026-11-07T20:06:09.340Z","ms":58977,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bFalhas \"Falhas 2\"","res":"info","det":{"area":"tela","id":"bFalhas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":182,"t":"2026-11-07T20:06:09.472Z","ms":59109,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcHist","res":"info","det":{"campo":"pop","id":"dlgOcHist"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":183,"t":"2026-11-07T20:06:09.675Z","ms":59312,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ocImprime \"Exportar ▾\"","res":"info","det":{"area":"dlgOcor","id":"ocImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":184,"t":"2026-11-07T20:06:09.928Z","ms":59565,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":185,"t":"2026-11-07T20:06:10.070Z","ms":59707,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":186,"t":"2026-11-07T20:06:10.172Z","ms":59809,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bFalhas \"Falhas 2\"","res":"info","det":{"area":"tela","id":"bFalhas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":187,"t":"2026-11-07T20:06:10.368Z","ms":60005,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":188,"t":"2026-11-07T20:06:10.669Z","ms":60306,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":189,"t":"2026-11-07T20:06:10.676Z","ms":60313,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bLogs \"Logs\"","res":"info","det":{"area":"tela","id":"bLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":190,"t":"2026-11-07T20:06:10.861Z","ms":60499,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"⤢\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":191,"t":"2026-11-07T20:06:10.966Z","ms":60603,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"abriu popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":192,"t":"2026-11-07T20:06:11.117Z","ms":60754,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"BC56\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":193,"t":"2026-11-07T20:06:11.283Z","ms":60920,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"BC400\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":194,"t":"2026-11-07T20:06:11.451Z","ms":61088,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 50","res":"info","det":{"id":"logLimit","name":null,"valor":"50","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":195,"t":"2026-11-07T20:06:11.535Z","ms":61172,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 100","res":"info","det":{"id":"logLimit","name":null,"valor":"100","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":196,"t":"2026-11-07T20:06:11.619Z","ms":61256,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 200","res":"info","det":{"id":"logLimit","name":null,"valor":"200","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":197,"t":"2026-11-07T20:06:11.703Z","ms":61340,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 500","res":"info","det":{"id":"logLimit","name":null,"valor":"500","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":198,"t":"2026-11-07T20:06:11.787Z","ms":61424,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 100","res":"info","det":{"id":"logLimit","name":null,"valor":"100","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":199,"t":"2026-11-07T20:06:11.956Z","ms":61593,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em #logAtualiza \"Atualizar\"","res":"info","det":{"area":"dlgLogs","id":"logAtualiza"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":200,"t":"2026-11-07T20:06:12.127Z","ms":61764,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgLogs] input#logAuto \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":201,"t":"2026-11-07T20:06:12.133Z","ms":61770,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logAuto = marcado","res":"info","det":{"id":"logAuto","name":null,"valor":"marcado","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":202,"t":"2026-11-07T20:06:12.214Z","ms":61851,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logAuto = desmarcado","res":"info","det":{"id":"logAuto","name":null,"valor":"desmarcado","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":203,"t":"2026-11-07T20:06:12.383Z","ms":62021,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em #logImprime \"Exportar ▾\"","res":"info","det":{"area":"dlgLogs","id":"logImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":204,"t":"2026-11-07T20:06:12.636Z","ms":62273,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"✕\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":205,"t":"2026-11-07T20:06:12.766Z","ms":62403,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"fechou popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":206,"t":"2026-11-07T20:06:12.878Z","ms":62515,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bLogs \"Logs\"","res":"info","det":{"area":"tela","id":"bLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":207,"t":"2026-11-07T20:06:13.067Z","ms":62704,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"abriu popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":208,"t":"2026-11-07T20:06:13.367Z","ms":63004,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"fechou popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":209,"t":"2026-11-07T20:06:13.387Z","ms":63024,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bDemo \"DEMO local\"","res":"info","det":{"area":"tela","id":"bDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":210,"t":"2026-11-07T20:06:13.573Z","ms":63210,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"clique","acao":"clique em botão \"✕\" [dlgDemo]","res":"info","det":{"area":"dlgDemo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":211,"t":"2026-11-07T20:06:13.824Z","ms":63461,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bDemo \"DEMO local\"","res":"info","det":{"area":"tela","id":"bDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":212,"t":"2026-11-07T20:06:13.975Z","ms":63612,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"abriu popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":213,"t":"2026-11-07T20:06:14.270Z","ms":63907,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"fechou popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":214,"t":"2026-11-07T20:06:14.343Z","ms":63980,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ensInfo \"ⓘ SIM\"","res":"info","det":{"area":"tela","id":"ensInfo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":215,"t":"2026-11-07T20:06:14.509Z","ms":64146,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ensInfo \"ⓘ SIM\"","res":"info","det":{"area":"tela","id":"ensInfo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":216,"t":"2026-11-07T20:06:14.941Z","ms":64578,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"clique","acao":"clique em #bModoCard \"⚙ Alterar\"","res":"info","det":{"area":"modoCard","id":"bModoCard"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":217,"t":"2026-11-07T20:06:14.943Z","ms":64580,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bModo \"⚙ Modo: Guiado · salva por patamar\"","res":"info","det":{"area":"tela","id":"bModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":218,"t":"2026-11-07T20:06:15.142Z","ms":64779,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"⤢\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":219,"t":"2026-11-07T20:06:15.169Z","ms":64806,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"transicao","acao":"abriu popup dlgModo","res":"info","det":{"campo":"pop","id":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":220,"t":"2026-11-07T20:06:15.389Z","ms":65026,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"clique","acao":"clique em #bModoCard \"⚙ Alterar\"","res":"info","det":{"area":"modoCard","id":"bModoCard"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":221,"t":"2026-11-07T20:06:15.390Z","ms":65027,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bModo \"⚙ Modo: Guiado · salva por patamar\"","res":"info","det":{"area":"tela","id":"bModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":222,"t":"2026-11-07T20:06:15.738Z","ms":65375,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Livre (sem registro)\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":223,"t":"2026-11-07T20:06:15.912Z","ms":65549,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Guiado\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":224,"t":"2026-11-07T20:06:16.089Z","ms":65726,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Manual\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":225,"t":"2026-11-07T20:06:16.259Z","ms":65896,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Automático\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":226,"t":"2026-11-07T20:06:16.362Z","ms":65999,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"mensagem","acao":"Patamar Guiado desligado: use o salvamento \"Por patamar\" (⚙ Modo) ou, no Demo, OPERADOR = Auto (card Simulação) com salvamento manual — ou automático, só com a fonte SIDSE.","res":"aviso","det":{"onde":"gmsg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":227,"t":"2026-11-07T20:06:16.432Z","ms":66069,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Por patamar\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":228,"t":"2026-11-07T20:06:16.599Z","ms":66236,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgModo] input#aimpOn \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":229,"t":"2026-11-07T20:06:16.608Z","ms":66245,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpOn = marcado","res":"info","det":{"id":"aimpOn","name":null,"valor":"marcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":230,"t":"2026-11-07T20:06:16.691Z","ms":66328,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpOn = desmarcado","res":"info","det":{"id":"aimpOn","name":null,"valor":"desmarcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":231,"t":"2026-11-07T20:06:16.863Z","ms":66500,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgModo] input#aimpPrt \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":232,"t":"2026-11-07T20:06:16.870Z","ms":66508,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpPrt = marcado","res":"info","det":{"id":"aimpPrt","name":null,"valor":"marcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":233,"t":"2026-11-07T20:06:16.952Z","ms":66590,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpPrt = desmarcado","res":"info","det":{"id":"aimpPrt","name":null,"valor":"desmarcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":234,"t":"2026-11-07T20:06:17.121Z","ms":66758,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em #aimpPasta \"📁 Escolher pasta…\"","res":"info","det":{"area":"dlgModo","id":"aimpPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":235,"t":"2026-11-07T20:06:17.122Z","ms":66759,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgPasta \"📁 Escolher pasta p/ salvar automático\"","res":"info","det":{"area":"dlgReg","id":"rgPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":236,"t":"2026-11-07T20:06:17.294Z","ms":66931,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = ","res":"info","det":{"id":"aimpCam","name":null,"valor":"","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":237,"t":"2026-11-07T20:06:17.375Z","ms":67012,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 0","res":"info","det":{"id":"aimpCam","name":null,"valor":"0","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":238,"t":"2026-11-07T20:06:17.463Z","ms":67100,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = -1","res":"info","det":{"id":"aimpCam","name":null,"valor":"-1","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":239,"t":"2026-11-07T20:06:17.545Z","ms":67182,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 999999","res":"info","det":{"id":"aimpCam","name":null,"valor":"999999","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":240,"t":"2026-11-07T20:06:17.627Z","ms":67264,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = abc","res":"info","det":{"id":"aimpCam","name":null,"valor":"abc","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":241,"t":"2026-11-07T20:06:17.709Z","ms":67346,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 1e9","res":"info","det":{"id":"aimpCam","name":null,"valor":"1e9","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":242,"t":"2026-11-07T20:06:17.790Z","ms":67427,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 999999999999999999999999999999","res":"info","det":{"id":"aimpCam","name":null,"valor":"999999999999999999999999999999","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":243,"t":"2026-11-07T20:06:17.874Z","ms":67511,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = ","res":"info","det":{"id":"aimpCam","name":null,"valor":"","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":244,"t":"2026-11-07T20:06:18.126Z","ms":67763,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em #aimpCopia \"Copiar\"","res":"info","det":{"area":"dlgModo","id":"aimpCopia"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":245,"t":"2026-11-07T20:06:18.294Z","ms":67931,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Sem gráfico\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":246,"t":"2026-11-07T20:06:18.459Z","ms":68096,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Tempo de ensaio\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":247,"t":"2026-11-07T20:06:18.625Z","ms":68262,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Relógio (clássico)\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":248,"t":"2026-11-07T20:06:18.793Z","ms":68430,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Completa\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":249,"t":"2026-11-07T20:06:18.960Z","ms":68597,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Simples (só INICIAR)\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":250,"t":"2026-11-07T20:06:19.129Z","ms":68766,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em #ensM_manual \"Manual\"","res":"info","det":{"area":"dlgModo","id":"ensM_manual"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":251,"t":"2026-11-07T20:06:19.298Z","ms":68935,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"✕\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":252,"t":"2026-11-07T20:06:19.366Z","ms":69003,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"transicao","acao":"fechou popup dlgModo","res":"info","det":{"campo":"pop","id":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":253,"t":"2026-11-07T20:06:19.542Z","ms":69179,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"clique","acao":"clique em #bModoCard \"⚙ Alterar\"","res":"info","det":{"area":"modoCard","id":"bModoCard"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":254,"t":"2026-11-07T20:06:19.543Z","ms":69180,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bModo \"⚙ Modo: Guiado · salva por patamar · gráfico reló…\"","res":"info","det":{"area":"tela","id":"bModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":255,"t":"2026-11-07T20:06:19.669Z","ms":69306,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"transicao","acao":"abriu popup dlgModo","res":"info","det":{"campo":"pop","id":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":256,"t":"2026-11-07T20:06:19.967Z","ms":69604,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"transicao","acao":"fechou popup dlgModo","res":"info","det":{"campo":"pop","id":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":257,"t":"2026-11-07T20:06:20.396Z","ms":70033,"v":"1.10.179","modo":"demoLocal","card":"ens","tipo":"clique","acao":"clique em botão \"Dados do ensaio\" [ens]","res":"info","det":{"area":"ens","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":258,"t":"2026-11-07T20:06:20.569Z","ms":70206,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"transicao","acao":"abriu popup dlgDados","res":"info","det":{"campo":"pop","id":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":259,"t":"2026-11-07T20:06:20.607Z","ms":70244,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em botão \"⤢\" [dlgDados]","res":"info","det":{"area":"dlgDados","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":260,"t":"2026-11-07T20:06:20.864Z","ms":70501,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = ","res":"info","det":{"id":"dServ","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":261,"t":"2026-11-07T20:06:20.950Z","ms":70587,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = 0","res":"info","det":{"id":"dServ","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":262,"t":"2026-11-07T20:06:21.031Z","ms":70668,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = -1","res":"info","det":{"id":"dServ","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":263,"t":"2026-11-07T20:06:21.114Z","ms":70751,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = 999999","res":"info","det":{"id":"dServ","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":264,"t":"2026-11-07T20:06:21.197Z","ms":70834,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = abc","res":"info","det":{"id":"dServ","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":265,"t":"2026-11-07T20:06:21.279Z","ms":70916,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = 1e9","res":"info","det":{"id":"dServ","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":266,"t":"2026-11-07T20:06:21.362Z","ms":70999,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = 999999999999999999999999999999","res":"info","det":{"id":"dServ","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":267,"t":"2026-11-07T20:06:21.444Z","ms":71081,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dServ = DZFA00045","res":"info","det":{"id":"dServ","name":null,"valor":"DZFA00045","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":268,"t":"2026-11-07T20:06:21.694Z","ms":71331,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = ","res":"info","det":{"id":"dVer","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":269,"t":"2026-11-07T20:06:21.775Z","ms":71412,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = 0","res":"info","det":{"id":"dVer","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":270,"t":"2026-11-07T20:06:21.857Z","ms":71494,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = -1","res":"info","det":{"id":"dVer","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":271,"t":"2026-11-07T20:06:21.940Z","ms":71577,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = 999999","res":"info","det":{"id":"dVer","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":272,"t":"2026-11-07T20:06:22.021Z","ms":71658,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = abc","res":"info","det":{"id":"dVer","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":273,"t":"2026-11-07T20:06:22.103Z","ms":71740,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = 1e9","res":"info","det":{"id":"dVer","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":274,"t":"2026-11-07T20:06:22.183Z","ms":71820,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = 999999999999999999999999999999","res":"info","det":{"id":"dVer","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":275,"t":"2026-11-07T20:06:22.264Z","ms":71901,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dVer = 773323","res":"info","det":{"id":"dVer","name":null,"valor":"773323","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":276,"t":"2026-11-07T20:06:22.508Z","ms":72145,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = ","res":"info","det":{"id":"dData","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":277,"t":"2026-11-07T20:06:22.589Z","ms":72226,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = 0","res":"info","det":{"id":"dData","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":278,"t":"2026-11-07T20:06:22.670Z","ms":72307,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = -1","res":"info","det":{"id":"dData","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":279,"t":"2026-11-07T20:06:22.759Z","ms":72396,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = 999999","res":"info","det":{"id":"dData","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":280,"t":"2026-11-07T20:06:22.840Z","ms":72477,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = abc","res":"info","det":{"id":"dData","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":281,"t":"2026-11-07T20:06:22.921Z","ms":72558,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = 1e9","res":"info","det":{"id":"dData","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":282,"t":"2026-11-07T20:06:23.005Z","ms":72643,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = 999999999999999999999999999999","res":"info","det":{"id":"dData","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":283,"t":"2026-11-07T20:06:23.087Z","ms":72724,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dData = 07.11.2026","res":"info","det":{"id":"dData","name":null,"valor":"07.11.2026","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":284,"t":"2026-11-07T20:06:23.338Z","ms":72975,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = ","res":"info","det":{"id":"dFreq","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":285,"t":"2026-11-07T20:06:23.419Z","ms":73056,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = 0","res":"info","det":{"id":"dFreq","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":286,"t":"2026-11-07T20:06:23.503Z","ms":73140,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = -1","res":"info","det":{"id":"dFreq","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":287,"t":"2026-11-07T20:06:23.584Z","ms":73221,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = 999999","res":"info","det":{"id":"dFreq","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":288,"t":"2026-11-07T20:06:23.666Z","ms":73303,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = abc","res":"info","det":{"id":"dFreq","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":289,"t":"2026-11-07T20:06:23.753Z","ms":73390,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = 1e9","res":"info","det":{"id":"dFreq","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":290,"t":"2026-11-07T20:06:23.834Z","ms":73471,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = 999999999999999999999999999999","res":"info","det":{"id":"dFreq","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":291,"t":"2026-11-07T20:06:23.915Z","ms":73552,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dFreq = 60","res":"info","det":{"id":"dFreq","name":null,"valor":"60","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":292,"t":"2026-11-07T20:06:24.167Z","ms":73804,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = ","res":"info","det":{"id":"dTens","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":293,"t":"2026-11-07T20:06:24.252Z","ms":73889,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = 0","res":"info","det":{"id":"dTens","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":294,"t":"2026-11-07T20:06:24.333Z","ms":73970,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = -1","res":"info","det":{"id":"dTens","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":295,"t":"2026-11-07T20:06:24.414Z","ms":74051,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = 999999","res":"info","det":{"id":"dTens","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":296,"t":"2026-11-07T20:06:24.495Z","ms":74132,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = abc","res":"info","det":{"id":"dTens","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":297,"t":"2026-11-07T20:06:24.578Z","ms":74215,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = 1e9","res":"info","det":{"id":"dTens","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":298,"t":"2026-11-07T20:06:24.662Z","ms":74299,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = 999999999999999999999999999999","res":"info","det":{"id":"dTens","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":299,"t":"2026-11-07T20:06:24.743Z","ms":74380,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTens = 220","res":"info","det":{"id":"dTens","name":null,"valor":"220","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":300,"t":"2026-11-07T20:06:24.989Z","ms":74626,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = ","res":"info","det":{"id":"dTamb","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":301,"t":"2026-11-07T20:06:25.069Z","ms":74706,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = 0","res":"info","det":{"id":"dTamb","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":302,"t":"2026-11-07T20:06:25.150Z","ms":74787,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = -1","res":"info","det":{"id":"dTamb","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":303,"t":"2026-11-07T20:06:25.231Z","ms":74868,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = 999999","res":"info","det":{"id":"dTamb","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":304,"t":"2026-11-07T20:06:25.312Z","ms":74949,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = abc","res":"info","det":{"id":"dTamb","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":305,"t":"2026-11-07T20:06:25.393Z","ms":75030,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = 1e9","res":"info","det":{"id":"dTamb","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":306,"t":"2026-11-07T20:06:25.474Z","ms":75111,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = 999999999999999999999999999999","res":"info","det":{"id":"dTamb","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":307,"t":"2026-11-07T20:06:25.555Z","ms":75192,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dTamb = 17","res":"info","det":{"id":"dTamb","name":null,"valor":"17","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":308,"t":"2026-11-07T20:06:25.799Z","ms":75436,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = ","res":"info","det":{"id":"dPot","name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":309,"t":"2026-11-07T20:06:25.880Z","ms":75517,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = 0","res":"info","det":{"id":"dPot","name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":310,"t":"2026-11-07T20:06:25.961Z","ms":75598,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = -1","res":"info","det":{"id":"dPot","name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":311,"t":"2026-11-07T20:06:26.042Z","ms":75679,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = 999999","res":"info","det":{"id":"dPot","name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":312,"t":"2026-11-07T20:06:26.123Z","ms":75760,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = abc","res":"info","det":{"id":"dPot","name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":313,"t":"2026-11-07T20:06:26.205Z","ms":75842,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = 1e9","res":"info","det":{"id":"dPot","name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":314,"t":"2026-11-07T20:06:26.286Z","ms":75923,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = 999999999999999999999999999999","res":"info","det":{"id":"dPot","name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":315,"t":"2026-11-07T20:06:26.369Z","ms":76006,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou #dPot = 145.5","res":"info","det":{"id":"dPot","name":null,"valor":"145.5","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":316,"t":"2026-11-07T20:06:26.618Z","ms":76255,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":317,"t":"2026-11-07T20:06:26.700Z","ms":76337,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":318,"t":"2026-11-07T20:06:26.781Z","ms":76418,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":319,"t":"2026-11-07T20:06:26.862Z","ms":76499,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":320,"t":"2026-11-07T20:06:26.943Z","ms":76580,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":321,"t":"2026-11-07T20:06:27.025Z","ms":76662,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":322,"t":"2026-11-07T20:06:27.109Z","ms":76746,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":323,"t":"2026-11-07T20:06:27.191Z","ms":76828,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = SDEC","res":"info","det":{"id":null,"name":null,"valor":"SDEC","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":324,"t":"2026-11-07T20:06:27.436Z","ms":77073,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":325,"t":"2026-11-07T20:06:27.517Z","ms":77154,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":326,"t":"2026-11-07T20:06:27.598Z","ms":77235,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":327,"t":"2026-11-07T20:06:27.680Z","ms":77317,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":328,"t":"2026-11-07T20:06:27.761Z","ms":77399,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":329,"t":"2026-11-07T20:06:27.843Z","ms":77480,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":330,"t":"2026-11-07T20:06:27.925Z","ms":77562,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":331,"t":"2026-11-07T20:06:28.007Z","ms":77644,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 4HTAA4.3-G21","res":"info","det":{"id":null,"name":null,"valor":"4HTAA4.3-G21","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":332,"t":"2026-11-07T20:06:28.258Z","ms":77895,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":333,"t":"2026-11-07T20:06:28.339Z","ms":77976,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":334,"t":"2026-11-07T20:06:28.421Z","ms":78058,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":335,"t":"2026-11-07T20:06:28.503Z","ms":78140,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":336,"t":"2026-11-07T20:06:28.585Z","ms":78222,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":337,"t":"2026-11-07T20:06:28.668Z","ms":78306,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":338,"t":"2026-11-07T20:06:28.756Z","ms":78394,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":339,"t":"2026-11-07T20:06:28.840Z","ms":78477,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -","res":"info","det":{"id":null,"name":null,"valor":"-","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":340,"t":"2026-11-07T20:06:29.090Z","ms":78727,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":341,"t":"2026-11-07T20:06:29.171Z","ms":78808,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":342,"t":"2026-11-07T20:06:29.255Z","ms":78892,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":343,"t":"2026-11-07T20:06:29.337Z","ms":78974,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":344,"t":"2026-11-07T20:06:29.419Z","ms":79056,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":345,"t":"2026-11-07T20:06:29.501Z","ms":79138,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":346,"t":"2026-11-07T20:06:29.582Z","ms":79219,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":347,"t":"2026-11-07T20:06:29.665Z","ms":79302,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = WEG","res":"info","det":{"id":null,"name":null,"valor":"WEG","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":348,"t":"2026-11-07T20:06:29.919Z","ms":79557,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":349,"t":"2026-11-07T20:06:30.002Z","ms":79639,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":350,"t":"2026-11-07T20:06:30.084Z","ms":79721,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":351,"t":"2026-11-07T20:06:30.166Z","ms":79803,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":352,"t":"2026-11-07T20:06:30.252Z","ms":79889,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":353,"t":"2026-11-07T20:06:30.333Z","ms":79970,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":354,"t":"2026-11-07T20:06:30.416Z","ms":80053,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":355,"t":"2026-11-07T20:06:30.502Z","ms":80139,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = QYI 274C SA","res":"info","det":{"id":null,"name":null,"valor":"QYI 274C SA","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":356,"t":"2026-11-07T20:06:30.756Z","ms":80393,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":357,"t":"2026-11-07T20:06:30.839Z","ms":80476,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":358,"t":"2026-11-07T20:06:30.922Z","ms":80559,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":359,"t":"2026-11-07T20:06:31.006Z","ms":80643,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":360,"t":"2026-11-07T20:06:31.090Z","ms":80727,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":361,"t":"2026-11-07T20:06:31.173Z","ms":80810,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":362,"t":"2026-11-07T20:06:31.258Z","ms":80895,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":363,"t":"2026-11-07T20:06:31.341Z","ms":80978,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -","res":"info","det":{"id":null,"name":null,"valor":"-","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":364,"t":"2026-11-07T20:06:31.594Z","ms":81231,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":365,"t":"2026-11-07T20:06:31.676Z","ms":81313,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":366,"t":"2026-11-07T20:06:31.758Z","ms":81395,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":367,"t":"2026-11-07T20:06:31.839Z","ms":81476,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":368,"t":"2026-11-07T20:06:31.922Z","ms":81559,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":369,"t":"2026-11-07T20:06:32.003Z","ms":81640,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":370,"t":"2026-11-07T20:06:32.085Z","ms":81722,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":371,"t":"2026-11-07T20:06:32.166Z","ms":81803,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = Deep Sea","res":"info","det":{"id":null,"name":null,"valor":"Deep Sea","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":372,"t":"2026-11-07T20:06:32.418Z","ms":82055,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":373,"t":"2026-11-07T20:06:32.498Z","ms":82135,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":374,"t":"2026-11-07T20:06:32.579Z","ms":82216,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":375,"t":"2026-11-07T20:06:32.661Z","ms":82299,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":376,"t":"2026-11-07T20:06:32.743Z","ms":82380,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":377,"t":"2026-11-07T20:06:32.825Z","ms":82462,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":378,"t":"2026-11-07T20:06:32.905Z","ms":82542,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":379,"t":"2026-11-07T20:06:32.987Z","ms":82624,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = DSE_4520MKII","res":"info","det":{"id":null,"name":null,"valor":"DSE_4520MKII","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":380,"t":"2026-11-07T20:06:33.236Z","ms":82873,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":381,"t":"2026-11-07T20:06:33.318Z","ms":82955,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":382,"t":"2026-11-07T20:06:33.399Z","ms":83037,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":383,"t":"2026-11-07T20:06:33.483Z","ms":83120,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":384,"t":"2026-11-07T20:06:33.565Z","ms":83202,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":385,"t":"2026-11-07T20:06:33.647Z","ms":83284,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":386,"t":"2026-11-07T20:06:33.731Z","ms":83368,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":387,"t":"2026-11-07T20:06:33.814Z","ms":83451,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = DEEP SEA","res":"info","det":{"id":null,"name":null,"valor":"DEEP SEA","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":388,"t":"2026-11-07T20:06:34.070Z","ms":83707,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":389,"t":"2026-11-07T20:06:34.151Z","ms":83789,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":390,"t":"2026-11-07T20:06:34.233Z","ms":83870,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":391,"t":"2026-11-07T20:06:34.315Z","ms":83952,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":392,"t":"2026-11-07T20:06:34.397Z","ms":84035,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":393,"t":"2026-11-07T20:06:34.480Z","ms":84117,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":394,"t":"2026-11-07T20:06:34.563Z","ms":84200,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":395,"t":"2026-11-07T20:06:34.645Z","ms":84282,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 24V 5AMP","res":"info","det":{"id":null,"name":null,"valor":"24V 5AMP","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":396,"t":"2026-11-07T20:06:34.895Z","ms":84532,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":397,"t":"2026-11-07T20:06:34.976Z","ms":84613,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":398,"t":"2026-11-07T20:06:35.058Z","ms":84695,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":399,"t":"2026-11-07T20:06:35.145Z","ms":84782,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":400,"t":"2026-11-07T20:06:35.227Z","ms":84864,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":401,"t":"2026-11-07T20:06:35.309Z","ms":84946,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":402,"t":"2026-11-07T20:06:35.391Z","ms":85028,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":403,"t":"2026-11-07T20:06:35.473Z","ms":85110,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = EXCELL","res":"info","det":{"id":null,"name":null,"valor":"EXCELL","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":404,"t":"2026-11-07T20:06:35.726Z","ms":85363,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = ","res":"info","det":{"id":null,"name":null,"valor":"","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":405,"t":"2026-11-07T20:06:35.808Z","ms":85445,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 0","res":"info","det":{"id":null,"name":null,"valor":"0","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":406,"t":"2026-11-07T20:06:35.889Z","ms":85527,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = -1","res":"info","det":{"id":null,"name":null,"valor":"-1","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":407,"t":"2026-11-07T20:06:35.971Z","ms":85609,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999","res":"info","det":{"id":null,"name":null,"valor":"999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":408,"t":"2026-11-07T20:06:36.054Z","ms":85691,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = abc","res":"info","det":{"id":null,"name":null,"valor":"abc","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":409,"t":"2026-11-07T20:06:36.138Z","ms":85775,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 1e9","res":"info","det":{"id":null,"name":null,"valor":"1e9","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":410,"t":"2026-11-07T20:06:36.221Z","ms":85858,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 999999999999999999999999999999","res":"info","det":{"id":null,"name":null,"valor":"999999999999999999999999999999","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":411,"t":"2026-11-07T20:06:36.303Z","ms":85941,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou text = 60AH","res":"info","det":{"id":null,"name":null,"valor":"60AH","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":412,"t":"2026-11-07T20:06:36.553Z","ms":86191,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgDados] input \"Monofásico\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":413,"t":"2026-11-07T20:06:36.562Z","ms":86199,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou dFase = marcado","res":"info","det":{"id":null,"name":"dFase","valor":"marcado","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":414,"t":"2026-11-07T20:06:36.808Z","ms":86445,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgDados] input \"Bifásico\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":415,"t":"2026-11-07T20:06:36.813Z","ms":86450,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou dFase = marcado","res":"info","det":{"id":null,"name":"dFase","valor":"marcado","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":416,"t":"2026-11-07T20:06:37.058Z","ms":86695,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgDados] input \"Trifásico\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":417,"t":"2026-11-07T20:06:37.066Z","ms":86703,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"alteracao","acao":"alterou dFase = marcado","res":"info","det":{"id":null,"name":"dFase","valor":"marcado","area":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":418,"t":"2026-11-07T20:06:37.311Z","ms":86948,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em botão \"Modelo do DSE (catálogo .csv) — preenche Frequênc…\" [dlgDados]","res":"info","det":{"area":"dlgDados","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":419,"t":"2026-11-07T20:06:37.478Z","ms":87115,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em #dLimpa \"Limpar dados\"","res":"info","det":{"area":"dlgDados","id":"dLimpa"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":420,"t":"2026-11-07T20:06:37.652Z","ms":87289,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em #dRepete \"Repetir dados\"","res":"info","det":{"area":"dlgDados","id":"dRepete"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":421,"t":"2026-11-07T20:06:37.817Z","ms":87454,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em #dPadrao \"Carregar gerador padrão\"","res":"info","det":{"area":"dlgDados","id":"dPadrao"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":422,"t":"2026-11-07T20:06:37.982Z","ms":87619,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em #dOk \"Salvar dados\"","res":"info","det":{"area":"dlgDados","id":"dOk"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":423,"t":"2026-11-07T20:06:38.201Z","ms":87838,"v":"1.10.179","modo":"demoLocal","card":"ens","tipo":"clique","acao":"clique em botão \"Dados do ensaio\" [ens]","res":"info","det":{"area":"ens","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":424,"t":"2026-11-07T20:06:38.459Z","ms":88096,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"clique","acao":"clique em botão \"✕\" [dlgDados]","res":"info","det":{"area":"dlgDados","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":425,"t":"2026-11-07T20:06:38.567Z","ms":88204,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"transicao","acao":"fechou popup dlgDados","res":"info","det":{"campo":"pop","id":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":426,"t":"2026-11-07T20:06:38.704Z","ms":88341,"v":"1.10.179","modo":"demoLocal","card":"ens","tipo":"clique","acao":"clique em botão \"Dados do ensaio\" [ens]","res":"info","det":{"area":"ens","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":427,"t":"2026-11-07T20:06:38.866Z","ms":88503,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"transicao","acao":"abriu popup dlgDados","res":"info","det":{"campo":"pop","id":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDados","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":428,"t":"2026-11-07T20:06:39.167Z","ms":88804,"v":"1.10.179","modo":"demoLocal","card":"ens.DAD","tipo":"transicao","acao":"fechou popup dlgDados","res":"info","det":{"campo":"pop","id":"dlgDados"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":429,"t":"2026-11-07T20:06:39.540Z","ms":89177,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graPop \"⤢ Popup\"","res":"info","det":{"area":"gra","id":"graPop"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":430,"t":"2026-11-07T20:06:39.743Z","ms":89380,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graZoom \"🔍 Zoom\"","res":"info","det":{"area":"dlgGrafico","id":"graZoom"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":431,"t":"2026-11-07T20:06:39.766Z","ms":89403,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"abriu popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":432,"t":"2026-11-07T20:06:39.910Z","ms":89547,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em botão \"⤢\" [dlgGrafico]","res":"info","det":{"area":"dlgGrafico","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":433,"t":"2026-11-07T20:06:40.508Z","ms":90145,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graPop \"⤢ Popup (aberto)\"","res":"info","det":{"area":"dlgGrafico","id":"graPop"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":434,"t":"2026-11-07T20:06:40.666Z","ms":90303,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"fechou popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":435,"t":"2026-11-07T20:06:40.673Z","ms":90311,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graPop \"⤢ Popup\"","res":"info","det":{"area":"gra","id":"graPop"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":436,"t":"2026-11-07T20:06:40.966Z","ms":90603,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"abriu popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":437,"t":"2026-11-07T20:06:41.018Z","ms":90655,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graAnalisar \"📈 Analisar\"","res":"info","det":{"area":"dlgGrafico","id":"graAnalisar"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":438,"t":"2026-11-07T20:06:41.183Z","ms":90820,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em botão \"✕\" [dlgGrafico]","res":"info","det":{"area":"dlgGrafico","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":439,"t":"2026-11-07T20:06:41.266Z","ms":90903,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"fechou popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":440,"t":"2026-11-07T20:06:41.431Z","ms":91068,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graPop \"⤢ Popup\"","res":"info","det":{"area":"gra","id":"graPop"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":441,"t":"2026-11-07T20:06:41.567Z","ms":91204,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"abriu popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGrafico","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":442,"t":"2026-11-07T20:06:41.866Z","ms":91503,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"transicao","acao":"fechou popup dlgGrafico","res":"info","det":{"campo":"pop","id":"dlgGrafico"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":443,"t":"2026-11-07T20:06:41.932Z","ms":91569,"v":"1.10.179","modo":"demoLocal","card":"gra","tipo":"clique","acao":"clique em #graAnalisar \"📈 Analisar\"","res":"info","det":{"area":"gra","id":"graAnalisar"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":444,"t":"2026-11-07T20:06:42.430Z","ms":92067,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: h2 \"Clique para recolher\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":445,"t":"2026-11-07T20:06:42.435Z","ms":92072,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: span#dseOlhos \"DSE simulado (ideal): clique para esco\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":446,"t":"2026-11-07T20:06:42.439Z","ms":92076,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#mMan \"Simulação da CARGA (só no DEMO) — não \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":447,"t":"2026-11-07T20:06:42.441Z","ms":92078,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#mAuto \"Simulação da CARGA (só no DEMO) — não \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":448,"t":"2026-11-07T20:06:42.443Z","ms":92080,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: input#simCarga \"0\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":449,"t":"2026-11-07T20:06:42.445Z","ms":92082,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"1×\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":450,"t":"2026-11-07T20:06:42.447Z","ms":92084,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"5×\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":451,"t":"2026-11-07T20:06:42.449Z","ms":92086,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"8×\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":452,"t":"2026-11-07T20:06:42.450Z","ms":92087,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"10×\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":453,"t":"2026-11-07T20:06:42.452Z","ms":92089,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#bGuiado \"Assistente que sugere as chaves de cad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":454,"t":"2026-11-07T20:06:42.453Z","ms":92090,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#bPatDet \"Resumo por banco, plano de passos, ope\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":455,"t":"2026-11-07T20:06:42.455Z","ms":92092,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"Clique para recolher\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":456,"t":"2026-11-07T20:06:42.457Z","ms":92094,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"2 ocorrências ativas em \"Banco de Carg\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":457,"t":"2026-11-07T20:06:42.458Z","ms":92095,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#bPlacas \"Placas dos bancos de carga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":458,"t":"2026-11-07T20:06:42.460Z","ms":92097,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#bTroca \"Informe aqui quando trocar a resistênc\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":459,"t":"2026-11-07T20:06:42.461Z","ms":92098,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#bChaves \"Habilitar/desabilitar cada chave (não \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":460,"t":"2026-11-07T20:06:42.462Z","ms":92099,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button#btSetup \"Setup do kW real/resistência, chave a \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":461,"t":"2026-11-07T20:06:42.464Z","ms":92101,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: summary \"Banco de 56 kW⇄ Seletora: Auto (remoto\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":462,"t":"2026-11-07T20:06:42.465Z","ms":92102,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula a seletora Local/Remoto do banc\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":463,"t":"2026-11-07T20:06:42.466Z","ms":92103,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula o comando Ligar banco do BC56 (\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":464,"t":"2026-11-07T20:06:42.468Z","ms":92105,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 1 de 13 · 5 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":465,"t":"2026-11-07T20:06:42.469Z","ms":92106,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 2 de 13 · 5 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":466,"t":"2026-11-07T20:06:42.470Z","ms":92107,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 3 de 13 · 5 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":467,"t":"2026-11-07T20:06:42.471Z","ms":92108,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 4 de 13 · 5 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":468,"t":"2026-11-07T20:06:42.472Z","ms":92109,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 5 de 13 · 5 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":469,"t":"2026-11-07T20:06:42.473Z","ms":92110,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 6 de 13 · 4 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":470,"t":"2026-11-07T20:06:42.474Z","ms":92111,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 7 de 13 · 4 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":471,"t":"2026-11-07T20:06:42.476Z","ms":92113,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 8 de 13 · 4 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":472,"t":"2026-11-07T20:06:42.477Z","ms":92114,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 9 de 13 · 4 kW · desligad\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":473,"t":"2026-11-07T20:06:42.478Z","ms":92115,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 10 de 13 · 4 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":474,"t":"2026-11-07T20:06:42.481Z","ms":92118,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 11 de 13 · 4 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":475,"t":"2026-11-07T20:06:42.483Z","ms":92120,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 12 de 13 · 4 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":476,"t":"2026-11-07T20:06:42.484Z","ms":92121,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC56 · chave 13 de 13 · 3 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":477,"t":"2026-11-07T20:06:42.485Z","ms":92122,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: summary \"Banco de 400 kW⇄ Seletora: Auto (remot\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":478,"t":"2026-11-07T20:06:42.486Z","ms":92123,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula a seletora Local/Remoto do banc\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":479,"t":"2026-11-07T20:06:42.487Z","ms":92124,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula o comando Ligar banco do BC400 \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":480,"t":"2026-11-07T20:06:42.489Z","ms":92126,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 1 de 13 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":481,"t":"2026-11-07T20:06:42.490Z","ms":92127,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 2 de 13 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":482,"t":"2026-11-07T20:06:42.491Z","ms":92128,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 3 de 13 · 10 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":483,"t":"2026-11-07T20:06:42.492Z","ms":92129,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 4 de 13 · 10 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":484,"t":"2026-11-07T20:06:42.493Z","ms":92130,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 5 de 13 · 10 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":485,"t":"2026-11-07T20:06:42.494Z","ms":92131,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 6 de 13 · 10 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":486,"t":"2026-11-07T20:06:42.495Z","ms":92132,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 7 de 13 · 50 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":487,"t":"2026-11-07T20:06:42.496Z","ms":92133,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 8 de 13 · 50 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":488,"t":"2026-11-07T20:06:42.497Z","ms":92134,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 9 de 13 · 50 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":489,"t":"2026-11-07T20:06:42.498Z","ms":92135,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 10 de 13 · 50 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":490,"t":"2026-11-07T20:06:42.499Z","ms":92136,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 11 de 13 · 50 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":491,"t":"2026-11-07T20:06:42.500Z","ms":92137,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 12 de 13 · 50 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":492,"t":"2026-11-07T20:06:42.501Z","ms":92138,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC400 · chave 13 de 13 · 50 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":493,"t":"2026-11-07T20:06:42.502Z","ms":92139,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: summary \"Banco de 59,5 kW⇄ Seletora: Auto (remo\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":494,"t":"2026-11-07T20:06:42.503Z","ms":92141,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula o comando Ligar banco do BC59,5\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":495,"t":"2026-11-07T20:06:42.505Z","ms":92142,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 1 de 18 · 5 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":496,"t":"2026-11-07T20:06:42.506Z","ms":92143,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 2 de 18 · 5 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":497,"t":"2026-11-07T20:06:42.507Z","ms":92144,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 3 de 18 · 5 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":498,"t":"2026-11-07T20:06:42.508Z","ms":92145,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 4 de 18 · 5 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":499,"t":"2026-11-07T20:06:42.510Z","ms":92147,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 5 de 18 · 5 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":500,"t":"2026-11-07T20:06:42.511Z","ms":92148,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 6 de 18 · 4 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":501,"t":"2026-11-07T20:06:42.512Z","ms":92149,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 7 de 18 · 4 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":502,"t":"2026-11-07T20:06:42.513Z","ms":92150,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 8 de 18 · 4 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":503,"t":"2026-11-07T20:06:42.514Z","ms":92151,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 9 de 18 · 4 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":504,"t":"2026-11-07T20:06:42.515Z","ms":92152,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 10 de 18 · 4 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":505,"t":"2026-11-07T20:06:42.516Z","ms":92153,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 11 de 18 · 4 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":506,"t":"2026-11-07T20:06:42.518Z","ms":92155,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 12 de 18 · 3 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":507,"t":"2026-11-07T20:06:42.519Z","ms":92156,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 13 de 18 · 3 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":508,"t":"2026-11-07T20:06:42.520Z","ms":92157,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 14 de 18 · 2 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":509,"t":"2026-11-07T20:06:42.521Z","ms":92158,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 15 de 18 · 1 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":510,"t":"2026-11-07T20:06:42.522Z","ms":92159,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 16 de 18 · 0,5 kW · des\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":511,"t":"2026-11-07T20:06:42.523Z","ms":92160,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 17 de 18 · 0,5 kW · des\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":512,"t":"2026-11-07T20:06:42.525Z","ms":92162,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC59,5 · chave 18 de 18 · 0,5 kW · des\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":513,"t":"2026-11-07T20:06:42.526Z","ms":92163,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: summary \"Banco de 550 kW⇄ Seletora: Auto (remot\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":514,"t":"2026-11-07T20:06:42.528Z","ms":92165,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: button \"Simula o comando Ligar banco do BC550 \"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":515,"t":"2026-11-07T20:06:42.529Z","ms":92166,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 1 de 12 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":516,"t":"2026-11-07T20:06:42.531Z","ms":92168,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 2 de 12 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":517,"t":"2026-11-07T20:06:42.532Z","ms":92169,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 3 de 12 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":518,"t":"2026-11-07T20:06:42.533Z","ms":92170,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 4 de 12 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":519,"t":"2026-11-07T20:06:42.535Z","ms":92172,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 5 de 12 · 5 kW · desliga\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":520,"t":"2026-11-07T20:06:42.536Z","ms":92173,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 6 de 12 · 25 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":521,"t":"2026-11-07T20:06:42.537Z","ms":92174,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 7 de 12 · 50 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":522,"t":"2026-11-07T20:06:42.538Z","ms":92175,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 8 de 12 · 50 kW · deslig\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":523,"t":"2026-11-07T20:06:42.539Z","ms":92176,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 9 de 12 · 100 kW · desli\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":524,"t":"2026-11-07T20:06:42.540Z","ms":92177,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 10 de 12 · 100 kW · desl\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":525,"t":"2026-11-07T20:06:42.541Z","ms":92178,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 11 de 12 · 100 kW · desl\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":526,"t":"2026-11-07T20:06:42.543Z","ms":92180,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: div \"BC550 · chave 12 de 12 · 100 kW · desl\"","res":"aviso","det":{"det":"0×0 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":527,"t":"2026-11-07T20:06:42.723Z","ms":92360,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bMenos \"A−\"","res":"info","det":{"area":"tela","id":"bMenos"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":528,"t":"2026-11-07T20:06:42.895Z","ms":92532,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bMais \"A+\"","res":"info","det":{"area":"tela","id":"bMais"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":529,"t":"2026-11-07T20:06:43.071Z","ms":92708,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":530,"t":"2026-11-07T20:06:43.089Z","ms":92727,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":531,"t":"2026-11-07T20:06:43.266Z","ms":92903,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #bReg \"Registro · 54\"","res":"info","det":{"area":"dlgReg","id":"bReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":532,"t":"2026-11-07T20:06:43.437Z","ms":93074,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em botão \"⤢\" [dlgReg]","res":"info","det":{"area":"dlgReg","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":533,"t":"2026-11-07T20:06:43.669Z","ms":93306,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":534,"t":"2026-11-07T20:06:43.687Z","ms":93324,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":535,"t":"2026-11-07T20:06:43.967Z","ms":93604,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":536,"t":"2026-11-07T20:06:44.034Z","ms":93671,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = ","res":"info","det":{"id":"rgDse","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":537,"t":"2026-11-07T20:06:44.118Z","ms":93755,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = 0","res":"info","det":{"id":"rgDse","name":null,"valor":"0","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":538,"t":"2026-11-07T20:06:44.202Z","ms":93839,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = -1","res":"info","det":{"id":"rgDse","name":null,"valor":"-1","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":539,"t":"2026-11-07T20:06:44.285Z","ms":93922,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = 999999","res":"info","det":{"id":"rgDse","name":null,"valor":"999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":540,"t":"2026-11-07T20:06:44.369Z","ms":94006,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = abc","res":"info","det":{"id":"rgDse","name":null,"valor":"abc","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":541,"t":"2026-11-07T20:06:44.452Z","ms":94089,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = 1e9","res":"info","det":{"id":"rgDse","name":null,"valor":"1e9","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":542,"t":"2026-11-07T20:06:44.535Z","ms":94172,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = 999999999999999999999999999999","res":"info","det":{"id":"rgDse","name":null,"valor":"999999999999999999999999999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":543,"t":"2026-11-07T20:06:44.617Z","ms":94254,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgDse = ","res":"info","det":{"id":"rgDse","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":544,"t":"2026-11-07T20:06:44.871Z","ms":94508,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = ","res":"info","det":{"id":"rgGer","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":545,"t":"2026-11-07T20:06:44.953Z","ms":94590,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = 0","res":"info","det":{"id":"rgGer","name":null,"valor":"0","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":546,"t":"2026-11-07T20:06:45.035Z","ms":94672,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = -1","res":"info","det":{"id":"rgGer","name":null,"valor":"-1","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":547,"t":"2026-11-07T20:06:45.121Z","ms":94758,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = 999999","res":"info","det":{"id":"rgGer","name":null,"valor":"999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":548,"t":"2026-11-07T20:06:45.207Z","ms":94844,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = abc","res":"info","det":{"id":"rgGer","name":null,"valor":"abc","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":549,"t":"2026-11-07T20:06:45.292Z","ms":94929,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = 1e9","res":"info","det":{"id":"rgGer","name":null,"valor":"1e9","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":550,"t":"2026-11-07T20:06:45.382Z","ms":95019,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = 999999999999999999999999999999","res":"info","det":{"id":"rgGer","name":null,"valor":"999999999999999999999999999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":551,"t":"2026-11-07T20:06:45.466Z","ms":95103,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgGer = ","res":"info","det":{"id":"rgGer","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":552,"t":"2026-11-07T20:06:45.723Z","ms":95360,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = ","res":"info","det":{"id":"rgMeta","name":null,"valor":"","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":553,"t":"2026-11-07T20:06:45.804Z","ms":95441,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 0","res":"info","det":{"id":"rgMeta","name":null,"valor":"0","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":554,"t":"2026-11-07T20:06:45.886Z","ms":95523,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = -1","res":"info","det":{"id":"rgMeta","name":null,"valor":"-1","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":555,"t":"2026-11-07T20:06:45.971Z","ms":95609,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 999999","res":"info","det":{"id":"rgMeta","name":null,"valor":"999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":556,"t":"2026-11-07T20:06:46.056Z","ms":95693,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = abc","res":"info","det":{"id":"rgMeta","name":null,"valor":"abc","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":557,"t":"2026-11-07T20:06:46.143Z","ms":95780,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 1e9","res":"info","det":{"id":"rgMeta","name":null,"valor":"1e9","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":558,"t":"2026-11-07T20:06:46.228Z","ms":95865,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 999999999999999999999999999999","res":"info","det":{"id":"rgMeta","name":null,"valor":"999999999999999999999999999999","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":559,"t":"2026-11-07T20:06:46.315Z","ms":95952,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgMeta = 100","res":"info","det":{"id":"rgMeta","name":null,"valor":"100","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":560,"t":"2026-11-07T20:06:46.564Z","ms":96201,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgReg] input#rgAuto \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":561,"t":"2026-11-07T20:06:46.571Z","ms":96208,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgAuto = desmarcado","res":"info","det":{"id":"rgAuto","name":null,"valor":"desmarcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":562,"t":"2026-11-07T20:06:46.654Z","ms":96291,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgAuto = marcado","res":"info","det":{"id":"rgAuto","name":null,"valor":"marcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":563,"t":"2026-11-07T20:06:46.822Z","ms":96459,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgReg] input#rgSemDemo \"on\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":564,"t":"2026-11-07T20:06:46.829Z","ms":96466,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgSemDemo = marcado","res":"info","det":{"id":"rgSemDemo","name":null,"valor":"marcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":565,"t":"2026-11-07T20:06:46.911Z","ms":96548,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"alteracao","acao":"alterou #rgSemDemo = desmarcado","res":"info","det":{"id":"rgSemDemo","name":null,"valor":"desmarcado","area":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":566,"t":"2026-11-07T20:06:47.082Z","ms":96720,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgExp \"Exportar ▾\"","res":"info","det":{"area":"dlgReg","id":"rgExp"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":567,"t":"2026-11-07T20:06:47.347Z","ms":96984,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgPasta \"📁 Escolher pasta p/ salvar automático\"","res":"info","det":{"area":"dlgReg","id":"rgPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":568,"t":"2026-11-07T20:06:47.513Z","ms":97150,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgFecha \"Fechar\"","res":"info","det":{"area":"dlgReg","id":"rgFecha"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":569,"t":"2026-11-07T20:06:47.567Z","ms":97204,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":570,"t":"2026-11-07T20:06:47.678Z","ms":97315,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":571,"t":"2026-11-07T20:06:47.866Z","ms":97503,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":572,"t":"2026-11-07T20:06:47.942Z","ms":97579,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em botão \"✕\" [dlgReg]","res":"info","det":{"area":"dlgReg","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":573,"t":"2026-11-07T20:06:48.168Z","ms":97805,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":574,"t":"2026-11-07T20:06:48.191Z","ms":97828,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAmo \"Amostras\"","res":"info","det":{"area":"tela","id":"bAmo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":575,"t":"2026-11-07T20:06:48.467Z","ms":98104,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"abriu popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgReg","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":576,"t":"2026-11-07T20:06:48.695Z","ms":98332,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":577,"t":"2026-11-07T20:06:48.766Z","ms":98403,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":578,"t":"2026-11-07T20:06:48.767Z","ms":98404,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"transicao","acao":"fechou popup dlgReg","res":"info","det":{"campo":"pop","id":"dlgReg"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":579,"t":"2026-11-07T20:06:48.874Z","ms":98511,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgCentral]","res":"info","det":{"area":"dlgCentral","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":580,"t":"2026-11-07T20:06:49.068Z","ms":98705,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":581,"t":"2026-11-07T20:06:49.124Z","ms":98761,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":582,"t":"2026-11-07T20:06:49.367Z","ms":99004,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":583,"t":"2026-11-07T20:06:49.450Z","ms":99087,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input \"pasta\"","res":"aviso","det":{"det":"16×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":584,"t":"2026-11-07T20:06:49.459Z","ms":99096,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou cenDest = marcado","res":"info","det":{"id":null,"name":"cenDest","valor":"marcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":585,"t":"2026-11-07T20:06:49.706Z","ms":99343,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenEscolhe \"Escolher pasta…\"","res":"info","det":{"area":"dlgCentral","id":"cenEscolhe"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":586,"t":"2026-11-07T20:06:49.874Z","ms":99511,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input \"down\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":587,"t":"2026-11-07T20:06:49.881Z","ms":99518,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou cenDest = marcado","res":"info","det":{"id":null,"name":"cenDest","valor":"marcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":588,"t":"2026-11-07T20:06:50.135Z","ms":99772,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgCentral] input#cenAgr \"on\"","res":"aviso","det":{"det":"19×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":589,"t":"2026-11-07T20:06:50.142Z","ms":99779,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #cenAgr = desmarcado","res":"info","det":{"id":"cenAgr","name":null,"valor":"desmarcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":590,"t":"2026-11-07T20:06:50.224Z","ms":99861,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"alteracao","acao":"alterou #cenAgr = marcado","res":"info","det":{"id":"cenAgr","name":null,"valor":"marcado","area":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":591,"t":"2026-11-07T20:06:50.391Z","ms":100028,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenSalva \"Salvar selecionados\"","res":"info","det":{"area":"dlgCentral","id":"cenSalva"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":592,"t":"2026-11-07T20:06:50.568Z","ms":100205,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenImprime \"Imprimir agora\"","res":"info","det":{"area":"dlgCentral","id":"cenImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":593,"t":"2026-11-07T20:06:50.738Z","ms":100375,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #cenCopia \"Copiar resumo\"","res":"info","det":{"area":"dlgCentral","id":"cenCopia"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":594,"t":"2026-11-07T20:06:50.909Z","ms":100546,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgCentral]","res":"info","det":{"area":"dlgCentral","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":595,"t":"2026-11-07T20:06:51.162Z","ms":100800,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bCentral \"🗂 Registros\"","res":"info","det":{"area":"tela","id":"bCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":596,"t":"2026-11-07T20:06:51.167Z","ms":100804,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":597,"t":"2026-11-07T20:06:51.468Z","ms":101105,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgCentral","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":598,"t":"2026-11-07T20:06:51.665Z","ms":101303,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bTema \"Modo claro — clique para voltar ao tema claro\"","res":"info","det":{"area":"tela","id":"bTema"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":599,"t":"2026-11-07T20:06:51.766Z","ms":101403,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgCentral","res":"info","det":{"campo":"pop","id":"dlgCentral"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":600,"t":"2026-11-07T20:06:51.848Z","ms":101485,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":601,"t":"2026-11-07T20:06:52.066Z","ms":101704,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":602,"t":"2026-11-07T20:06:52.105Z","ms":101742,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"⤢\" [dlgVer]","res":"info","det":{"area":"dlgVer","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":603,"t":"2026-11-07T20:06:52.358Z","ms":101995,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":604,"t":"2026-11-07T20:06:52.664Z","ms":102301,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgVer]","res":"info","det":{"area":"dlgVer","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":605,"t":"2026-11-07T20:06:52.666Z","ms":102303,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":606,"t":"2026-11-07T20:06:52.909Z","ms":102546,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #pVer \"v1.10.179\"","res":"info","det":{"area":"tela","id":"pVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":607,"t":"2026-11-07T20:06:52.982Z","ms":102619,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgVer","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":608,"t":"2026-11-07T20:06:53.268Z","ms":102905,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgVer","res":"info","det":{"campo":"pop","id":"dlgVer"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":609,"t":"2026-11-07T20:06:53.391Z","ms":103029,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAlertas \"Alertas 0\"","res":"info","det":{"area":"tela","id":"bAlertas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":610,"t":"2026-11-07T20:06:53.577Z","ms":103214,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":611,"t":"2026-11-07T20:06:53.820Z","ms":103458,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bAlertas \"Alertas 0\"","res":"info","det":{"area":"tela","id":"bAlertas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":612,"t":"2026-11-07T20:06:53.868Z","ms":103505,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":613,"t":"2026-11-07T20:06:54.170Z","ms":103807,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":614,"t":"2026-11-07T20:06:54.252Z","ms":103889,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bFalhas \"Falhas 2\"","res":"info","det":{"area":"tela","id":"bFalhas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":615,"t":"2026-11-07T20:06:54.429Z","ms":104066,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"▸ Roteiro\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":616,"t":"2026-11-07T20:06:54.466Z","ms":104103,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":617,"t":"2026-11-07T20:06:54.599Z","ms":104236,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em botão \"✕\" [dlgOcor]","res":"info","det":{"area":"dlgOcor","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":618,"t":"2026-11-07T20:06:54.766Z","ms":104403,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":619,"t":"2026-11-07T20:06:54.844Z","ms":104481,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bFalhas \"Falhas 2\"","res":"info","det":{"area":"tela","id":"bFalhas"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":620,"t":"2026-11-07T20:06:55.068Z","ms":104705,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"abriu popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgOcor","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":621,"t":"2026-11-07T20:06:55.350Z","ms":104988,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bLogs \"Logs\"","res":"info","det":{"area":"tela","id":"bLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":622,"t":"2026-11-07T20:06:55.366Z","ms":105003,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"abriu popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":623,"t":"2026-11-07T20:06:55.366Z","ms":105003,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"transicao","acao":"fechou popup dlgOcor","res":"info","det":{"campo":"pop","id":"dlgOcor"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":624,"t":"2026-11-07T20:06:55.537Z","ms":105174,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"⤢\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":625,"t":"2026-11-07T20:06:55.797Z","ms":105434,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"BC56\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":626,"t":"2026-11-07T20:06:55.963Z","ms":105600,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"BC400\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":627,"t":"2026-11-07T20:06:56.134Z","ms":105771,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 50","res":"info","det":{"id":"logLimit","name":null,"valor":"50","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":628,"t":"2026-11-07T20:06:56.219Z","ms":105856,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 100","res":"info","det":{"id":"logLimit","name":null,"valor":"100","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":629,"t":"2026-11-07T20:06:56.306Z","ms":105943,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 200","res":"info","det":{"id":"logLimit","name":null,"valor":"200","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":630,"t":"2026-11-07T20:06:56.390Z","ms":106027,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 500","res":"info","det":{"id":"logLimit","name":null,"valor":"500","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":631,"t":"2026-11-07T20:06:56.475Z","ms":106112,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logLimit = 100","res":"info","det":{"id":"logLimit","name":null,"valor":"100","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":632,"t":"2026-11-07T20:06:56.646Z","ms":106283,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em #logAtualiza \"Atualizar\"","res":"info","det":{"area":"dlgLogs","id":"logAtualiza"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":633,"t":"2026-11-07T20:06:56.813Z","ms":106450,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgLogs] input#logAuto \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":634,"t":"2026-11-07T20:06:56.819Z","ms":106456,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logAuto = marcado","res":"info","det":{"id":"logAuto","name":null,"valor":"marcado","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":635,"t":"2026-11-07T20:06:56.902Z","ms":106539,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"alteracao","acao":"alterou #logAuto = desmarcado","res":"info","det":{"id":"logAuto","name":null,"valor":"desmarcado","area":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":636,"t":"2026-11-07T20:06:57.076Z","ms":106713,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em #logImprime \"Exportar ▾\"","res":"info","det":{"area":"dlgLogs","id":"logImprime"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":637,"t":"2026-11-07T20:06:57.327Z","ms":106964,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"clique","acao":"clique em botão \"✕\" [dlgLogs]","res":"info","det":{"area":"dlgLogs","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":638,"t":"2026-11-07T20:06:57.471Z","ms":107108,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"fechou popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":639,"t":"2026-11-07T20:06:57.569Z","ms":107206,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bLogs \"Logs\"","res":"info","det":{"area":"tela","id":"bLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":640,"t":"2026-11-07T20:06:57.768Z","ms":107405,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"abriu popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgLogs","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":641,"t":"2026-11-07T20:06:58.070Z","ms":107707,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bDemo \"DEMO local\"","res":"info","det":{"area":"tela","id":"bDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":642,"t":"2026-11-07T20:06:58.098Z","ms":107735,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"abriu popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":643,"t":"2026-11-07T20:06:58.098Z","ms":107735,"v":"1.10.179","modo":"demoLocal","card":"bco.LOG","tipo":"transicao","acao":"fechou popup dlgLogs","res":"info","det":{"campo":"pop","id":"dlgLogs"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":644,"t":"2026-11-07T20:06:58.261Z","ms":107898,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"clique","acao":"clique em botão \"✕\" [dlgDemo]","res":"info","det":{"area":"dlgDemo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":645,"t":"2026-11-07T20:06:58.367Z","ms":108004,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"fechou popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":646,"t":"2026-11-07T20:06:58.505Z","ms":108142,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bDemo \"DEMO local\"","res":"info","det":{"area":"tela","id":"bDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":647,"t":"2026-11-07T20:06:58.668Z","ms":108305,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"abriu popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgDemo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":648,"t":"2026-11-07T20:06:58.966Z","ms":108603,"v":"1.10.179","modo":"demoLocal","card":"DEV.DEM","tipo":"transicao","acao":"fechou popup dlgDemo","res":"info","det":{"campo":"pop","id":"dlgDemo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":649,"t":"2026-11-07T20:06:59.019Z","ms":108656,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ensInfo \"ⓘ SIM\"","res":"info","det":{"area":"tela","id":"ensInfo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":650,"t":"2026-11-07T20:06:59.186Z","ms":108823,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #ensInfo \"ⓘ SIM\"","res":"info","det":{"area":"tela","id":"ensInfo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":651,"t":"2026-11-07T20:06:59.273Z","ms":108910,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"clique","acao":"clique em #bModoCard \"⚙ Alterar\"","res":"info","det":{"area":"modoCard","id":"bModoCard"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":652,"t":"2026-11-07T20:06:59.274Z","ms":108911,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bModo \"⚙ Modo: Guiado · salva por patamar · gráfico reló…\"","res":"info","det":{"area":"tela","id":"bModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":653,"t":"2026-11-07T20:06:59.469Z","ms":109106,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"⤢\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":654,"t":"2026-11-07T20:06:59.567Z","ms":109204,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"transicao","acao":"abriu popup dlgModo","res":"info","det":{"campo":"pop","id":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":655,"t":"2026-11-07T20:06:59.717Z","ms":109354,"v":"1.10.179","modo":"demoLocal","card":"modo","tipo":"clique","acao":"clique em #bModoCard \"⚙ Alterar\"","res":"info","det":{"area":"modoCard","id":"bModoCard"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":656,"t":"2026-11-07T20:06:59.721Z","ms":109358,"v":"1.10.179","modo":"demoLocal","card":"app","tipo":"clique","acao":"clique em #bModo \"⚙ Modo: Guiado · salva por patamar · gráfico reló…\"","res":"info","det":{"area":"tela","id":"bModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":657,"t":"2026-11-07T20:07:00.061Z","ms":109698,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Livre (sem registro)\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":658,"t":"2026-11-07T20:07:00.233Z","ms":109870,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Guiado\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":659,"t":"2026-11-07T20:07:00.421Z","ms":110058,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Manual\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":660,"t":"2026-11-07T20:07:00.598Z","ms":110235,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Automático\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":661,"t":"2026-11-07T20:07:00.769Z","ms":110406,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em botão \"Por patamar\" [dlgModo]","res":"info","det":{"area":"dlgModo","id":null},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":662,"t":"2026-11-07T20:07:00.937Z","ms":110574,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgModo] input#aimpOn \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":663,"t":"2026-11-07T20:07:00.942Z","ms":110579,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpOn = marcado","res":"info","det":{"id":"aimpOn","name":null,"valor":"marcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":664,"t":"2026-11-07T20:07:01.024Z","ms":110661,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpOn = desmarcado","res":"info","det":{"id":"aimpOn","name":null,"valor":"desmarcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":665,"t":"2026-11-07T20:07:01.186Z","ms":110823,"v":"1.10.179","modo":"demoLocal","card":"DEV.OPS","tipo":"teste","acao":"U1 · Varredura da página · alvo de toque muito pequeno: [dlgModo] input#aimpPrt \"on\"","res":"aviso","det":{"det":"22×22 px (mínimo recomendado 44)"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":666,"t":"2026-11-07T20:07:01.189Z","ms":110826,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpPrt = marcado","res":"info","det":{"id":"aimpPrt","name":null,"valor":"marcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":667,"t":"2026-11-07T20:07:01.270Z","ms":110907,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpPrt = desmarcado","res":"info","det":{"id":"aimpPrt","name":null,"valor":"desmarcado","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":668,"t":"2026-11-07T20:07:01.443Z","ms":111080,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"clique","acao":"clique em #aimpPasta \"📁 Escolher pasta…\"","res":"info","det":{"area":"dlgModo","id":"aimpPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":669,"t":"2026-11-07T20:07:01.444Z","ms":111081,"v":"1.10.179","modo":"demoLocal","card":"reg","tipo":"clique","acao":"clique em #rgPasta \"📁 Escolher pasta p/ salvar automático\"","res":"info","det":{"area":"dlgReg","id":"rgPasta"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":670,"t":"2026-11-07T20:07:01.612Z","ms":111249,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = ","res":"info","det":{"id":"aimpCam","name":null,"valor":"","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":671,"t":"2026-11-07T20:07:01.694Z","ms":111331,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 0","res":"info","det":{"id":"aimpCam","name":null,"valor":"0","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":672,"t":"2026-11-07T20:07:01.777Z","ms":111414,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = -1","res":"info","det":{"id":"aimpCam","name":null,"valor":"-1","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":673,"t":"2026-11-07T20:07:01.859Z","ms":111496,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = 999999","res":"info","det":{"id":"aimpCam","name":null,"valor":"999999","area":"dlgModo"},"est":{"modo":"demoLocal","gen":"parado","sim":"MANUAL","ens":"sem ensaio","et":null,"ch":[],"cmd":[],"chL":"nenhuma","cmdL":"nenhuma","sel56":"auto","lig56":true,"sel400":"auto","lig400":true,"sel595":"auto","lig595":true,"sel550":"auto","lig550":true,"setup":null,"pop":["dlgModo","dlgGuiado"],"com":{"dse":true,"b56":null,"b400":null}}}
{"sessao":"smw6u1pp7fsw0","n":674,"t":"2026-11-07T20:07:01.941Z","ms":111578,"v":"1.10.179","modo":"demoLocal","card":"modo.POP","tipo":"alteracao","acao":"alterou #aimpCam = abc","res":"info","det":{"id":"aimp
```

_(cortado em 400000 caracteres; o arquivo completo está na pasta)_

---

## robo/dev_operador_oculto_relatorio.md

```
# Dev/Operador oculto — relatório

- Versão do HTML: 1.10.179
- Modo: Demo local
- Duração: 4min 42s
- Resultado: **109 OK · 8 FALHA · 111 AVISO**

## Preparação

- ✔ dispositivo — `"Mobile Poco X6 Pro" · celular · zoom do navegador ≈ 100 %`
- ✔ perfil da tela — `406×848 px (tela física 407×904) · DPR 3 · toque · Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0`

## Chaves (⚙)

- ⚠ chaves já habilitadas — `todas as 56 chaves estavam habilitadas: nada a mudar`
- ⚠ chaves já habilitadas — `todas as 56 chaves estavam habilitadas: nada a mudar`

## U1 · Varredura da página

- ⚠ alvo de toque muito pequeno: [dlgReg] input#rgAuto "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgReg] input#rgSemDemo "on" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input "pasta" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input "down" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input#cenAgr "on" — `19×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgLogs] input#logAuto "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgModo] input#aimpOn "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgModo] input#aimpPrt "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Monofásico" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Bifásico" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Trifásico" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: h2 "Clique para recolher" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: span#dseOlhos "DSE simulado (ideal): clique para esco" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#mMan "Simulação da CARGA (só no DEMO) — não " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#mAuto "Simulação da CARGA (só no DEMO) — não " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: input#simCarga "0" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "1×" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "5×" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "8×" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "10×" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#bGuiado "Assistente que sugere as chaves de cad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#bPatDet "Resumo por banco, plano de passos, ope" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "Clique para recolher" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "2 ocorrências ativas em "Banco de Carg" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#bPlacas "Placas dos bancos de carga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#bTroca "Informe aqui quando trocar a resistênc" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#bChaves "Habilitar/desabilitar cada chave (não " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button#btSetup "Setup do kW real/resistência, chave a " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: summary "Banco de 56 kW⇄ Seletora: Auto (remoto" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula a seletora Local/Remoto do banc" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula o comando Ligar banco do BC56 (" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 1 de 13 · 5 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 2 de 13 · 5 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 3 de 13 · 5 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 4 de 13 · 5 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 5 de 13 · 5 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 6 de 13 · 4 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 7 de 13 · 4 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 8 de 13 · 4 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 9 de 13 · 4 kW · desligad" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 10 de 13 · 4 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 11 de 13 · 4 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 12 de 13 · 4 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC56 · chave 13 de 13 · 3 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: summary "Banco de 400 kW⇄ Seletora: Auto (remot" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula a seletora Local/Remoto do banc" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula o comando Ligar banco do BC400 " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 1 de 13 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 2 de 13 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 3 de 13 · 10 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 4 de 13 · 10 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 5 de 13 · 10 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 6 de 13 · 10 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 7 de 13 · 50 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 8 de 13 · 50 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 9 de 13 · 50 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 10 de 13 · 50 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 11 de 13 · 50 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 12 de 13 · 50 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC400 · chave 13 de 13 · 50 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: summary "Banco de 59,5 kW⇄ Seletora: Auto (remo" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula o comando Ligar banco do BC59,5" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 1 de 18 · 5 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 2 de 18 · 5 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 3 de 18 · 5 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 4 de 18 · 5 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 5 de 18 · 5 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 6 de 18 · 4 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 7 de 18 · 4 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 8 de 18 · 4 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 9 de 18 · 4 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 10 de 18 · 4 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 11 de 18 · 4 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 12 de 18 · 3 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 13 de 18 · 3 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 14 de 18 · 2 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 15 de 18 · 1 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 16 de 18 · 0,5 kW · des" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 17 de 18 · 0,5 kW · des" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC59,5 · chave 18 de 18 · 0,5 kW · des" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: summary "Banco de 550 kW⇄ Seletora: Auto (remot" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: button "Simula o comando Ligar banco do BC550 " — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 1 de 12 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 2 de 12 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 3 de 12 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 4 de 12 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 5 de 12 · 5 kW · desliga" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 6 de 12 · 25 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 7 de 12 · 50 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 8 de 12 · 50 kW · deslig" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 9 de 12 · 100 kW · desli" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 10 de 12 · 100 kW · desl" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 11 de 12 · 100 kW · desl" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: div "BC550 · chave 12 de 12 · 100 kW · desl" — `0×0 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgReg] input#rgAuto "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgReg] input#rgSemDemo "on" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input "pasta" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input "down" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgCentral] input#cenAgr "on" — `19×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgLogs] input#logAuto "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgModo] input#aimpOn "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgModo] input#aimpPrt "on" — `22×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Monofásico" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Bifásico" — `16×22 px (mínimo recomendado 44)`
- ⚠ alvo de toque muito pequeno: [dlgDados] input "Trifásico" — `16×22 px (mínimo recomendado 44)`

## Menu do botão direito

- ✔ menu do botão direito abriu e fechou em 20 posições

## Patamar guiado

- ✔ há chips de patamar (30/50/100/107 %) — `4 chip(s)`
- ✔ patamar 30% da carga · 1 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 30% da carga · 1 min: Aplicar comandou 6 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (30% da carga · 1 min) — `0 ainda ligada(s)`
- ✔ patamar 50% da carga · 1 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 50% da carga · 1 min: Aplicar comandou 6 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (50% da carga · 1 min) — `0 ainda ligada(s)`
- ✔ patamar 100% da carga · 5 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 100% da carga · 5 min: Aplicar comandou 5 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (100% da carga · 5 min) — `0 ainda ligada(s)`
- ✔ patamar 107% da carga · 2 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 107% da carga · 2 min: Aplicar comandou 7 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (107% da carga · 2 min) — `0 ainda ligada(s)`

## Ensaio

- ✔ simulação em AUTO
- ✔ velocidade 10× — `sp=10`
- ✔ gerador simulado parou (STOP do Demo) — `SIM.gen=parado`
- ✔ INICIAR abre "Dados do ensaio"
- ✔ o botão do popup diz "Iniciar ensaio" — `Iniciar ensaio`
- ✔ confirmar os dados arma o ensaio — `dlgDados=false T.started=true · Dados enviados ao PLC. Gerador já operando — cronômetro iniciado.`
- ✔ ensaio armado: botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ ensaio armado: clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ ensaio armado: seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ gerador simulado operando — `SIM.gen=operando`
- ✔ cronômetro conta (T.run) — `T.run=true`
- ✖ **FALHA** todas as 6 etapas ficaram salvas — `✔✔✔✔✔✖`
- ✔ FINALIZAR libera ao final das etapas
- ✔ etapas cumpridas (antes de FINALIZAR): botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ etapas cumpridas (antes de FINALIZAR): clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ BC56: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC56 desligado: chaves soltas.`
- ✔ BC56: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC400: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC400 desligado: chaves soltas.`
- ✖ **FALHA** BC400: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC400 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ BC59,5: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC59,5 desligado: chaves soltas.`
- ✖ **FALHA** BC59,5: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC59,5 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ BC550: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC550 desligado: chaves soltas.`
- ✖ **FALHA** BC550: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC550 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ FINALIZAR encerra o ensaio e abre o resultado — `T.fim=true dlgRes=true · `
- ✔ o resultado traz o "Resultado final" — `Resultado final: APROVADO · condições definidas pelo DSE simulado`
- ✔ resultado sem etapas faltando
- ✔ "Gravar sem relatório" grava o ensaio — `T.gravado=true`
- ✔ depois de gravar, o botão Setup volta a ficar liberado — `cfgbtn inl`
- ✔ BC56: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC56: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC400: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC400: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC59,5: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC59,5: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC550: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC550: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ simulação em AUTO
- ✔ velocidade 10× — `sp=10`
- ✔ gerador simulado parou (STOP do Demo) — `SIM.gen=parado`
- ✔ INICIAR abre "Dados do ensaio"
- ✔ o botão do popup diz "Iniciar ensaio" — `Iniciar ensaio`
- ✔ confirmar os dados arma o ensaio — `dlgDados=false T.started=true · Dados enviados ao PLC. Gerador já operando — cronômetro iniciado.`
- ✔ ensaio armado: botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ ensaio armado: clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ ensaio armado: seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ gerador simulado operando — `SIM.gen=operando`
- ✔ cronômetro conta (T.run) — `T.run=true`
- ✖ **FALHA** todas as 6 etapas ficaram salvas — `✔✔✔✔✔✖`
- ✔ FINALIZAR libera ao final das etapas
- ✔ etapas cumpridas (antes de FINALIZAR): botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ etapas cumpridas (antes de FINALIZAR): clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ BC56: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC56 desligado: chaves soltas.`
- ✔ BC56: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC400: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC400 desligado: chaves soltas.`
- ✖ **FALHA** BC400: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC400 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ BC59,5: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC59,5 desligado: chaves soltas.`
- ✖ **FALHA** BC59,5: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC59,5 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ BC550: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC550 desligado: chaves soltas.`
- ✖ **FALHA** BC550: "Ligar banco" fica TRAVADO durante o ensaio — `lig=true · BC550 ligado (Ligar banco simulado): chaves liberadas.`
- ✔ FINALIZAR encerra o ensaio e abre o resultado — `T.fim=true dlgRes=true · `
- ✔ o resultado traz o "Resultado final" — `Resultado final: APROVADO · condições definidas pelo DSE simulado`
- ✔ resultado sem etapas faltando
- ✔ "Gravar sem relatório" grava o ensaio — `T.gravado=true`
- ✔ depois de gravar, o botão Setup volta a ficar liberado — `cfgbtn inl`
- ✔ BC56: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC56: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC400: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC400: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC59,5: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC59,5: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC550: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC550: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`

## Cobertura

- ✔ 218 de 228 objetos acionados (96 %); 94 não acionados

## Caixa de areia

- ✔ efeitos bloqueados/contados — `{"print":2,"janelaNova":8,"alerta":4,"confirmacao":1,"prompt":0,"redeBloqueada":0,"seletor":6,"download":4,"navegacao":0}`

## JavaScript

- ✔ nenhum erro de JavaScript durante o teste


## Cobertura e contexto

- Modo do robô: **avancado** · semente 20261107
- Dispositivo: Mobile Poco X6 Pro · celular · zoom do navegador ≈ 100 %
- Tela: 406×848 px · DPR 3 · toque
- Objetos acionados: 218 de 228
- Caixa de areia (bloqueado/contado): {"print":2,"janelaNova":8,"alerta":4,"confirmacao":1,"prompt":0,"redeBloqueada":0,"seletor":6,"download":4,"navegacao":0}

### Não acionados (94)

- [dlgReg] input#rgDse "[DEMO] DSE 4520" [desabilitado]
- [dlgReg] input#rgGer "[DEMO] 4HTAA4.3-G21 + QYI 274C SA" [desabilitado]
- button#bGenStop "■ STOP" [desabilitado]
- [dlgModo] button#ensM_auto "Modo automático: disponível futurament" [desabilitado]
- [dlgDados] button#sapLer "Ler dados do print" [desabilitado]
- [dlgDados] button#sapLimpa "Remover imagem" [desabilitado]
- [dlgDados] button "Trocar gerador" [escondido agora]
- h2 "Clique para recolher" [escondido agora]
- span#dseOlhos "DSE simulado (ideal): clique para esco" [escondido agora]
- button#mMan "Simulação da CARGA (só no DEMO) — não " [escondido agora]
- button#mAuto "Simulação da CARGA (só no DEMO) — não " [escondido agora]
- input#simCarga "0" [escondido agora]
- button "1×" [escondido agora]
- button "5×" [escondido agora]
- button "8×" [escondido agora]
- button "10×" [escondido agora]
- button#bGuiado "Assistente que sugere as chaves de cad" [escondido agora]
- button#bPatDet "Resumo por banco, plano de passos, ope" [escondido agora]
- div "Clique para recolher" [escondido agora]
- button "2 ocorrências ativas em "Banco de Carg" [escondido agora]
- button#bPlacas "Placas dos bancos de carga" [escondido agora]
- button#bTroca "Informe aqui quando trocar a resistênc" [escondido agora]
- button#bChaves "Habilitar/desabilitar cada chave (não " [escondido agora]
- button#btSetup "Setup do kW real/resistência, chave a " [escondido agora]
- summary "Banco de 56 kW⇄ Seletora: Auto (remoto" [escondido agora]
- button "Simula a seletora Local/Remoto do banc" [escondido agora]
- button "Simula o comando Ligar banco do BC56 (" [escondido agora]
- div "BC56 · chave 1 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 2 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 3 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 4 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 5 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 6 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 7 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 8 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 9 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 10 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 11 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 12 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 13 de 13 · 3 kW · desliga" [escondido agora]
- summary "Banco de 400 kW⇄ Seletora: Auto (remot" [escondido agora]
- button "Simula a seletora Local/Remoto do banc" [escondido agora]
- button "Simula o comando Ligar banco do BC400 " [escondido agora]
- div "BC400 · chave 1 de 13 · 5 kW · desliga" [escondido agora]
- div "BC400 · chave 2 de 13 · 5 kW · desliga" [escondido agora]
- div "BC400 · chave 3 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 4 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 5 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 6 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 7 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 8 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 9 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 10 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 11 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 12 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 13 de 13 · 50 kW · desli" [escondido agora]
- summary "Banco de 59,5 kW⇄ Seletora: Auto (remo" [escondido agora]
- button "Simula o comando Ligar banco do BC59,5" [escondido agora]
- div "BC59,5 · chave 1 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 2 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 3 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 4 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 5 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 6 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 7 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 8 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 9 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 10 de 18 · 4 kW · desli" [escondido agora]
- div "BC59,5 · chave 11 de 18 · 4 kW · desli" [escondido agora]
- div "BC59,5 · chave 12 de 18 · 3 kW · desli" [escondido agora]
- div "BC59,5 · chave 13 de 18 · 3 kW · desli" [escondido agora]
- div "BC59,5 · chave 14 de 18 · 2 kW · desli" [escondido agora]
- div "BC59,5 · chave 15 de 18 · 1 kW · desli" [escondido agora]
- div "BC59,5 · chave 16 de 18 · 0,5 kW · des" [escondido agora]
- div "BC59,5 · chave 17 de 18 · 0,5 kW · des" [escondido agora]
- div "BC59,5 · chave 18 de 18 · 0,5 kW · des" [escondido agora]
- summary "Banco de 550 kW⇄ Seletora: Auto (remot" [escondido agora]
- button "Simula o comando Ligar banco do BC550 " [escondido agora]
- div "BC550 · chave 1 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 2 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 3 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 4 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 5 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 6 de 12 · 25 kW · deslig" [escondido agora]
- div "BC550 · chave 7 de 12 · 50 kW · deslig" [escondido agora]
- div "BC550 · chave 8 de 12 · 50 kW · deslig" [escondido agora]
- div "BC550 · chave 9 de 12 · 100 kW · desli" [escondido agora]
- div "BC550 · chave 10 de 12 · 100 kW · desl" [escondido agora]
- div "BC550 · chave 11 de 12 · 100 kW · desl" [escondido agora]
- div "BC550 · chave 12 de 12 · 100 kW · desl" [escondido agora]
- button#bGenStop "■ STOP" [desabilitado]
- [dlgModo] button#ensM_auto "Modo automático: disponível futurament" [desabilitado]
- [dlgDados] button#sapLer "Ler dados do print" [desabilitado]
- [dlgDados] button#sapLimpa "Remover imagem" [desabilitado]

### Onde cada janela abriu

- `dlgReg` em 12,6 (382×782)
- `dlgCentral` em 12,6 (382×746)
- `dlgVer` em 12,34 (382×511)
- `dlgOcor` em 12,8 (382×779)
- `dlgOcHist` em 12,8 (382×450)
- `dlgLogs` em 12,8 (382×444)
- `dlgDemo` em 12,5 (382×782)
- `dlgModo` em 12,7 (382×734)
- `dlgDados` em 12,5 (382×782)
- `dlgGrafico` em 12,8 (382×201)

### O que cada objeto abriu

- button#bAmo "Painel do registro de aprendizado: amo" → abriu dlgReg
- button#bCentral "Central de registros: salvar ou imprim" → abriu dlgCentral
- button#pVer "Versão do programa — clique para ver o" → abriu dlgVer
- button#bAlertas "Sem alertas ativos. Clique para ver o " → abriu dlgOcor
- [dlgOcor] button#ocHist "Registro dos últimos 500 eventos, guar" → abriu dlgOcHist
- button#bFalhas "2 falhas ativas — clique para ver" → abriu dlgOcor
- button#bLogs "Log da comunicação HTML ↔ Node-RED ↔ P" → abriu dlgLogs
- button#bDemo "Demo e Servidor: URL do Node-RED do PL" → abriu dlgDemo
- button#bModoCard "Alterar o modo de operação (abre o pop" → abriu dlgModo
- button "Abrir os dados do ensaio (nº de série," → abriu dlgDados
- button#graPop "Vira popup (não bloqueia a tela, pode " → abriu dlgGrafico

```

---

## ensaio/dados_do_ensaio.json

```
{
  "gerado": "2026-11-07T20:12:16.707Z",
  "dados": {
    "serie": "DZFA00045",
    "versao": "773323",
    "equip": [
      [
        "Motor",
        "SDEC",
        "4HTAA4.3-G21",
        "-"
      ],
      [
        "Alternador",
        "WEG",
        "QYI 274C SA",
        "-"
      ],
      [
        "Controlador",
        "Deep Sea",
        "DSE_4520MKII",
        "-"
      ],
      [
        "Retificador",
        "DEEP SEA",
        "24V 5AMP",
        "-"
      ],
      [
        "RAT",
        "-",
        "-",
        "-"
      ],
      [
        "Bateria",
        "EXCELL",
        "60AH",
        "-"
      ]
    ],
    "fase": "Trifásico",
    "freq": 60,
    "tensao": 220,
    "tamb": 17,
    "pot": 145.5,
    "data": ""
  },
  "estado": {
    "iniciado": true,
    "rodando": false,
    "finalizado": true,
    "parcial": false,
    "etapa": 5
  },
  "etapasGravadas": [
    {
      "etapa": 1,
      "gravada": true
    },
    {
      "etapa": 2,
      "gravada": true
    },
    {
      "etapa": 3,
      "gravada": true
    },
    {
      "etapa": 4,
      "gravada": true
    },
    {
      "etapa": 5,
      "gravada": true
    },
    {
      "etapa": 6,
      "gravada": true
    }
  ]
}
```