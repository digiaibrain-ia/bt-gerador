# Fluxo DSE → /api/gerador — v3.6 (29/10/2026)
**Arquivo:** `servidor-deepsea-api-gerador-v3_6.json` (mesmos ids da v3.4/v3.5; importar substitui a aba).

| Item | v3.4 | v3.5 (não usar) | **v3.6** |
|---|---|---|---|
| Período dos blocos A e B | 2 s | 1 s | **2 s** (decisão do operador, 29/10 noite) |
| Tolerância do agendador | nenhuma | 100 ms | **100 ms** (evita período real de 3 s por jitter) |
| `diag.versaoApi` | "3.2" | "3.5" | **"3.6"** |

**Por que voltou a 2 s:** com 1 s, o card Banco de Cargas do medidor passou a perder a leitura das chaves. **Causa não confirmada** — o dobro de pedidos Modbus ao DSE (59 registradores/s) sobre o mesmo Node-RED que lê o PLC era o suspeito. Se, com a v3.6, a perda continuar, a causa é outra (ver medidor 1.10.115: o log [DEV.OBS] passa a registrar "PERDEU/VOLTOU a leitura do PLC" com o motivo).
**Efeito colateral aceito:** o medidor consulta a cada 1 s, então os pontos repetem em pares (dado novo a cada 2 s).
**Teste:** apenas o JSON foi validado (sem Node-RED/DSE aqui). Importar, fazer Deploy, abrir `/api/gerador` e ver `diag.versaoApi: "3.6"`.
