# Web API Siemens (S7-1500 / S7-1200) — fatos lidos na documentação oficial (v0.1)

Fonte: `docs.tia.siemens.cloud` (Manual Collection S7-1500/ET 200MP; Configuring automation systems), lido em 2026-11-22 pela API de busca do portal.
Regra: **FATO** = texto da página; **INTERPRETAÇÃO** = minha leitura para o BT2. Nada aqui foi medido na bancada.

## FATOS
- **Api.Browse**: lista todos os métodos que a Web API aceita no firmware atual. **Não exige autorização** e **não filtra pelas permissões do usuário**. Lista de exemplo: Api.Browse, GetCertificateUrl, GetPermissions, Login, Logout, Ping, Version, PlcProgram.Browse/Read/Write. Erro 4 = "No resources" (repetir quando houver recurso).
- Transporte: `POST /api/jsonrpc`, `Content-Type: application/json`, JSON-RPC 2.0; aceita **requisição em lote** (array com vários métodos num único HTTP).
- **PlcProgram.Read** lê **uma variável por chamada** (`var`, `mode` simple|raw); exige permissão `read_value`. **PlcProgram.Write** grava **uma variável** (`var`, `value`, `mode`); exige `write_value`; retorna `true`. Erros: 2 permissão, 4 sem recursos, 200 endereço inexistente, 201 inválido, 203 índice, 204 tipo não suportado.
- Firmware V3.0: ainda não dá para acessar todas as tags (ex.: objetos tecnológicos podem responder "unsupported").
- **Api.Login**: usuário/senha, devolve token de 28 bytes; enviar no cabeçalho `X-Auth-Token`. Token expira em até 2,5 min sem uso; sessão cai em 120 s sem chamada. Manter com `Api.Ping`/`Api.GetPermissions` com token. `include_web_application_cookie` só a partir do firmware V2.9.
- **Limite de sessões ativas** (S7-1500): 1510–1513 = 50; **1514, 1515, 1516 = 100**; 1517/1518 = 200. Sem token livre, o login é rejeitado. S7-1200: 50 sessões.
- Firmware ≥ V3.1: eventos de segurança (login ok/falha) vão para o syslog interno (`Syslog.Browse`); recarregar a configuração derruba apenas usuários apagados/desativados (≤ V3.0 derruba todas as sessões).
- **Api.Version** devolve número crescente (exemplo 3.28); serve para adaptar o cliente ao firmware. **Api.Ping** devolve um ID da CPU que muda a cada reinício/partida a quente.
- S7-1200: Web API é subconjunto; sem LWord, LInt, LTime_Of_Day, S5Time, LDT.
- Web API também serve para dashboards com várias CPUs ao mesmo tempo.
- O portal descreve só requisição/resposta: **não vi assinatura por mudança (push)** nestas páginas.

## NÃO ENCONTRADO (não afirmar)
- Tamanho máximo de requisição/lote e nº de variáveis por lote.
- Carga na CPU e tempo de resposta por chamada.
- Restrições específicas para CPU F (1515F): a busca não achou página sobre isso.
- Passo a passo de habilitar Web server/Web API no TIA e exigência mínima de firmware por método.

## INTERPRETAÇÃO para o BT2
- Como `PlcProgram.Read/Write` é por variável, o ganho só existe com **lote JSON-RPC** num único HTTPS — que precisa ser medido (latência, CPU, limite de lote) antes de qualquer decisão.
- 100 sessões num 1515 folga para 4 bancos, desde que o cliente reutilize o token e faça Ping dentro de 120 s.
- Para comando de chaves em produção, a Web API é candidata a **canal de diagnóstico/teste separado**, não substituta do S7 até haver medição (item A8 do checklist de go-live).
