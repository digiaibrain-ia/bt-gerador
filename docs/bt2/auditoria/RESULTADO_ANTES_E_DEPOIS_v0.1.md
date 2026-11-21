# Resultado da auditoria: estava como, ficou como · 19/11/2026

Base de comparação: medidor **1.10.226** (início, 18/11) contra **1.10.231** (agora). Tudo em PLC simulado e Node-RED 5.0.9 de teste; **nada foi testado no PC BT2 nem no PLC real**.

| Tema | Estava como | Ficou como |
|---|---|---|
| **Código do medidor** | 1 HTML monolítico de ~13 mil linhas, editado à mão | Gerado de `dashboard/src/` (módulos) por `dashboard/build/build.js`; teste garante que o HTML entregue é o do build. Versões antigas em `arquivo/` |
| **Complexidade das funções** | 92 funções acima do limite (29 muito acima); `ciclo` 95, `faseRncDurante` 74 | **Igual.** Modularizei o arquivo, mas não refatorei as funções (BK-AUD-09 segue aberto) |
| **`catch` vazios** | 276 (23 perto de rede ou comando); falha ao desligar chave não avisava o operador | 264 revisados e comentados; o desligamento que o PLC não confirma agora avisa (CHV-009); erro do motor de alarmes vira SIS-001 |
| **Limite de capacidade** | Só no HTML; um POST direto passava do limite | Também no Node-RED: C1 registra, C2 recusa com 409 em modo `recusar`. Regra única: **110 % do kW a 100 % de cada gerador**; desligar nunca é recusado; sem kW conhecido nada é recusado. **Padrão `registrar`** |
| **Corrida do limite** | Dois comandos de ligar quase juntos passavam do limite (provado: 25 kW com limite de 22 kW) | Reserva de capacidade na saída da fila (fluxos v3.10 / v3.9 / v1.10 / v1.10): um é aceito e o outro volta 409. Prova com contra-prova, 14 testes de propriedades e mutação 92,2 % (Passo 9) |
| **Degrau** | Indefinido (BK-AUD-10) | Descartado por decisão; só vale o 110 % |
| **Alarmes** | Alarme fugaz abria ocorrência na hora (ruído) | Comunicação entra após 10 s e sai após 5 s; segurança continua imediata |
| **Log do DSE** | Avisos repetidos | 1 aviso por bloco a cada 5 min (fluxo v3_8) |
| **RNC (segurança da API)** | 3 falhas de guarda (AUD-1 a AUD-3) | Corrigidas na v1.2 (`s4_rnc_d3` 17 de 17; a v1.1 falha 10, como esperado) |
| **Testes** | Unitários 132/132, integração 247 + 3 `todo`, e2e 23/25 | Unitários e propriedades **270/270**, integração **389 + 5 `todo`**, e2e **25/25** (o escopo da integração cresceu, os números não são idênticos) |
| **Qualidade dos testes** | Nunca medida | Mutação: perfil 69,5 → 93,7 %; série MWM 60,1 → 92,0 %; guarda de capacidade 56,0 → 87,5 %; FB mãe 45,8 → 69,9 %; RNC 88,4 → 99,1 %; C2 66,9 → 92,9 %. **Nenhum bug de produção achado** |
| **O código testado é o entregue?** | Sem garantia (cópias embutidas) | Teste compara o módulo testado com o embutido no medidor e no fluxo do RNC: idênticos |
| **Falhas da linha de base** | Catálogo desatualizado; C5 DSE-001; menu do `pacote_ia`; 500 em JSON inválido | Catálogo regerado; C5 era teste desatualizado; menus corrigidos (OCR era do meu servidor de teste); 500 → 400 por middleware opcional (F2-1) |
| **Revisão** | Só minha | Segunda opinião independente: promessas aprovadas, números conferidos |

## O que continua aberto (não é regressão, é o que falta)
- **Bancada física:** PLC/ET200 reais, compilação no TIA, tempos de leitura.
- **Datasheet do MWM** para os perfis de combustível (gás 25 %/10 s, biometano 20 %/15 s) e o 110 %.
- **BK-AUD-04:** o PLC não limita capacidade (hoje limitam o medidor e o Node-RED). **BK-AUD-05:** sem login.
- **Modo `recusar`:** só depois da bancada, com uma semana de `registrar` antes.
- **5 `todo` de teste:** P3-E1, P3-E2, F4-1, F4-2, DR-1.
- **Complexidade das funções do medidor** (BK-AUD-09) e o **SQL**, próximos temas.
