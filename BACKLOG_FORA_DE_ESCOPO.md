# Backlog fora de escopo (regra 5)

Achados que **não** são corrigidos durante a Fase 1. Ficam aqui para tratarmos depois, em passo próprio e com "OK".
Achados que os testes da Fase 1 revelaram aparecem como testes **pendentes** (`todo`) com o ID; o comportamento esperado continua escrito no teste.

## Achados da Fase 1 (testes pendentes)

| ID | Gravidade | Onde | O que acontece | O que deveria acontecer | Teste |
|---|---|---|---|---|---|
| F4-2 | **Alta** | `POST /api/chaves/{56,400,550,595}/tensao`, fluxo `chaves-*` | Com o PLC sem resposta, a rota responde **erro 500** ("leitura de volta nao conferiu"), mas o chaveamento **já foi gravado** no PLC. A conferência lê o cache parado, não o PLC. O operador vê erro e o estado mudou. | Se a resposta é erro, o PLC não pode ter mudado. Conferir no PLC, não no cache. | `f4_setup_tensao.test.js` (ACHADO F4-2) |
| F4-1 | Média | mesma rota | A validação aceita dado de até **5 s** de idade (DB3002), enquanto o `GET` já recusa com **2,5 s**. Entre 2,5 e 5 s o POST tenta escrever sem PLC. | Recusar com 503 antes de escrever, com a mesma regra de idade do `GET`. | `f4_setup_tensao.test.js` (ACHADO F4-1) |
| F2-1 | Baixa | `http in` de todas as rotas de chaves | JSON malformado no corpo volta como **500** ("Internal Server Error"): erro do cliente tratado como erro do servidor. | 400. | `f2_comando_chaves.test.js` (ACHADO F2-1) |

## Achados do F11 (para a Fase 2)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| F2-3 | ~~Média~~ **resolvido no Portão 1 (medidor 1.10.167)** | `medidor_gerador_v1.10.166.html` (antes) | O HTML traz **fixo o endereco real do DSE** (`172.17.210.156:1880`) e tenta falar com ele a cada consulta. Durante o teste o navegador foi bloqueado (a trava funcionou), mas o cliente conhece um endereco de producao. Tema da Fase 2 (nunca confiar no cliente). |

## Outros achados (anotados, sem teste ainda)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| D-1 | Baixa | cabeçalho do fluxo `chv56_wd_html` (vigia "HTML sumiu") | O texto diz que o vigia só zera `CbLigar`. O código também desliga o banco (`LigarBanco`, v2.4). Corrigir o texto (documentação), não o código. |
| D-2 | Baixa | `WD_HTML_S` (tempo do vigia) | O limite é lido da **variável da aba** (Propriedades da aba). Conferir no PC BT2 que a aba tem o valor certo (padrão 30 s). |
| D-3 | Média | `s7 in` de todos os fluxos | O teste roda com o **Node-RED 5.0.9**. A versão do PC BT2 não foi confirmada; comportamento pode diferir. |

## Itens já listados antes (sem mudança nesta fase)

- **Tipo `Remote` em `VAR_INPUT`** nos FBs de comunicação (FB101/FB103): a confirmar no TIA.
- **`EnsaioAtivo` fixo em FALSE** nas chamadas: a tag real ainda não existe no PLC.
- **FB100 v0.4 e FB102 v0.2:** os arquivos existem, mas a decisão de subir ao PLC é sua.
- **Gerador `gerar_banco`:** ainda não gera o FB100 v0.4 nem o FB102 v0.2 (só os FBs do ET200 v0.2).
- **Robô do Operador secreto:** 8 falhas no popup Setup, porque ele não informa o chaveamento (220/380/440 V) antes de selecionar a chave.
- **Cópia do gráfico embutida no medidor:** ainda na v0.10 (a versão separada é a v0.11).
- **FC de chamadas dos bancos:** nomes de instância genéricos no comentário.

## Limites da Fase 1 (o que os testes NÃO provam)
- O PLC é uma **simulação em memória**, não o driver S7 real nem o tempo real do 1515 ou do ET200.
- O **F11** (front real contra o Node-RED local, com Playwright) **ainda não foi feito**: fica para depois dos F1–F10.
- Segurança da senha de testes e rotas sem login são da **Fase 2**, não entram aqui.
