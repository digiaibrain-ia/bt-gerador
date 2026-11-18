# Passos 1 e 2: medir e congelar (medidor 1.10.226) · 18/11/2026

Base: branch `ccr-bt2-pacote-v1.21`, arquivo `dashboard/ferramentas/medidor_gerador_v1.10.226.html`.
Modo: somente leitura. Nenhum arquivo do repositório foi alterado. Ferramentas e saídas ficaram fora do Git.
Provas: PLC simulado, Node-RED 5.0.9 do harness, Chromium. Nada foi testado no PC BT2 nem no PLC real.

## Passo 1: medição

Extraídos 16 scripts inline (13.124 linhas de HTML, ~1,25 MB de JS). O script 12 (245 KB, linha 12078) é só dado embutido (HTML do gráfico) e foi excluído das métricas.

| Ferramenta | Resultado |
|---|---|
| ESLint (`complexity` ≤15) | **92 funções acima do limite; 29 acima de 30** |
| sonarjs (complexidade cognitiva ≤25) | **47 funções acima** |
| Linhas por função (>80) | só 3 (`criaMae` 127, `faseEnsaio` 104, `ciclo` 87) |
| `catch` vazio | **276** (+1 bloco vazio) |
| `eval` | 3 usos em 2 pontos (linhas ~10274 e ~10565 do concatenado), sem entrada de usuário aparente |
| Variáveis/funções sem uso | 15 (ex.: função `cmdGerador`, `descartaEnsaio`, `ensPreparaNovo`) |
| Código duplicado (jscpd) | **0,26%** (3 trechos de 8 a 14 linhas, todos dentro do bloco principal) |
| innerHTML não vazio | 90; 8 candidatos por heurística, a maioria texto fixo; os 2 de RNC já usam `esc()`/`escHtml` |
| gitleaks (300 commits) | 100 alertas, **todos falsos positivos**: `const KEY='medidor.bancosUso.v1'` (chave de localStorage) repetida nas cópias do HTML. Nenhum segredo real |
| Semgrep | **não rodou**: o registro de regras (semgrep.dev) está bloqueado pelo proxy do ambiente |

### Pontos quentes (maior complexidade ciclomática)
`ciclo` 95 · `faseRncDurante` 74 · `live` 72 · `faseEnsaio` 61 · `ui` 55 · `varre` 55 · `aplicaFaixas` 48 · `avaliaEnsaio` 44.

### Correção do relatório anterior
Eu disse que só 2 funções passam de 100 linhas e isso era verdade, mas **enganava**: o código é denso (linhas longas, várias instruções por linha). O problema real é a **complexidade**, não o tamanho em linhas.
Também a duplicação é baixa (0,26%): o ruído do medidor não vem de copiar e colar, vem de funções que decidem coisas demais.

### `catch` vazios: classificação (amostra por contexto)
- 67 em `localStorage`/`sessionStorage` (aceitáveis).
- 6 em DOM/interface (aceitáveis).
- 115 "outros" (a classificar um a um).
- **23 ao redor de chamadas de rede ou comando**. Exemplo relevante: em `chZeraPlc` (~linha 4911 do concatenado) o desligamento de chaves envia `POST .../selecionar` e `.../ligar` com `ligar:false` dentro de `try{...}catch(e){}`. A falha é engolida sem avisar o operador. A chave só é marcada como desligada no sucesso, então o estado não mente, mas **o operador não é avisado**. A segurança continua no PLC.

## Passo 2: linha de base (comportamento congelado da 1.10.226)

| Bateria | Resultado |
|---|---|
| Unitários (`tests/fb`, `plc_modelo`, RNC, série) | **132 de 132** |
| Integração (fase4, segurança, f1 a f11, trava de produção) | **247 de 250 passam, 0 falham, 3 `todo`** (antes dos ajustes: 245 passavam e 2 falhavam) |
| `s4_rnc_d3` (guarda D3 do RNC) | 17 de 17 na v1.2; 10 falhas na v1.1 (esperado) |
| e2e Playwright (25 arquivos rodados) | **23 passam, 2 falham** (`modo_operador`, `pacote_ia`), ver abaixo |

### Falhas e pendências na linha de base (não corrigi nada)
1. **`cada ferramenta aponta para a maior versao presente na pasta` (fase4/l_catalogo_auto).** Falha real e simples: `catalogo_ferramentas.js` aponta para `medidor_gerador_v1.10.220`, mas a maior na pasta é a 226. O catálogo está desatualizado.
2. **`C5 DSE-001` (fase4/c_medidor_troubleshooter).** Timeout de 30 s esperando o botão do alarme "DSE" na lista de ocorrências. Não sei se é regressão do medidor ou do teste. **A investigar.**
3. **3 `todo` conhecidos**, entre eles `ACHADO F2-1`: JSON malformado volta 500 em vez de 400.
4. **e2e `alertas_falhas`, `modo_operador`, `pacote_ia`, `pacote_ia_toque_longo`:** precisam de servidor local na porta 8790. Com ele: `alertas_falhas` e `pacote_ia_toque_longo` passam; `modo_operador` falha (seção "Referências" lista 0 itens, pode depender da pasta `referencias/` ao lado do HTML); `pacote_ia` falha em 4 verificações (menu do botão direito e OCR com Tesseract). **Prováveis dependências de ambiente, não confirmei.**
5. **e2e `modos_operacao_matriz`:** passa, mas leva ~282 s (o meu limite inicial de 240 s cortou a primeira execução).

### O que o Passo 2 ainda não cobre (lacunas de caracterização)
- Nenhum teste verifica diretamente os 276 `catch` vazios ou o aviso ao operador quando o desligamento de chave falha.
- Sem teste de alarme com tempo (alarme fugaz abaixo de 10 s) como comportamento atual. Hoje o comportamento "cria ocorrência na hora" está só na documentação (`ALARME_INTELIGENTE_v0.2.md`).
- Capacidade e degrau só existem no HTML; não há teste no backend porque a regra não existe lá.
- Cobertura do medidor por linha não foi medida.

## Decisões do Reginaldo (registradas)
- Passos 1 e 2: autorizados.
- kW e capacidade por banco: espelho em `nodered/config/bancos_capacidade.json` + verdade no PLC (DB2100).
- Alarmes: tempo mínimo por criticidade (crítico/segurança: imediato; advertência/analógico: 10 s ou mais; histerese na saída).
- Mover versões antigas para `arquivo/`: autorizado.

## Próximo passo sugerido
Resolver as 2 falhas da linha de base antes de refatorar (catálogo desatualizado; investigar o C5), e só então abrir o Passo 3 (build modular a partir da 1.10.226).

## Atualização (18/11/2026, depois dos ajustes autorizados)

Linha de base **limpa e compreendida**. O que foi feito:

1. **Catálogo de ferramentas (`l_catalogo_auto`).** `catalogo_ferramentas.js` é um arquivo GERADO ("não editar à mão"). Rodei o gerador oficial `dashboard/gerador/gerar_catalogo_auto_v0.2.2.py` (o mesmo que o pacote v1.26 usa). Diferença: o medidor passou de `v1.10.220` para `v1.10.226` e a data de geração. Teste: 3 de 3.
2. **`C5 DSE-001`: não era regressão do medidor, era teste desatualizado.** Na 1.10.226 o DSE-001 ("DSE nunca conectado") passou a ser **Informação** (`I-DSE-001`), decisão documentada em `ALARME_INTELIGENTE_v0.2.md`. A janela de ocorrências não mostra Informação por padrão (botão "Informações" desligado), então a linha que o teste procurava não aparecia. Diagnóstico confirmado: a lista ativa trazia `["DSE-001","i",""]` e a tabela só tinha as 3 falhas COM. Atualizei o teste: confere que o tipo é Informação, que ela **não** aparece por padrão, liga o filtro "Informações" e só então confere o texto e o roteiro (as verificações de conteúdo não foram enfraquecidas). Teste: 6 de 6.
3. **`modo_operador`:** passou **24 de 24** quando o servidor local serve a pasta `referencias/` ao lado do HTML. A falha anterior era do meu servidor de teste, não do medidor.
4. **`pacote_ia`: causa em parte entendida, não alterado.** O teste espera **5** itens no menu do botão direito; a 1.10.226 tem **6** (entrou "Tamanho desta janela"). É expectativa desatualizada. A falha do OCR (Tesseract local) **não foi esclarecida** (mesmo com `vendor/tesseract` servido). Deixei como `todo` conhecido (não mexi no teste, por estar fora do pedido).
5. **Integração completa:** 250 testes, 247 passam, 0 falham, 3 `todo` (inclui `ACHADO F2-1`: JSON malformado devolve 500 em vez de 400).

Linha de base a partir daqui: unitários 132/132; integração 247 + 3 `todo`; e2e 24 de 25 passam (única falha: `pacote_ia`, com causa descrita acima).
