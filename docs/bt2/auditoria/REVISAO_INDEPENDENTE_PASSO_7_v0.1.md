# Registro: revisão independente do Passo 7 e das promessas · 19/11/2026

Origem: parecer de uma segunda IA (Gemini), trazido pelo Reginaldo. O texto original está **sem alterações** abaixo da linha. Conferência feita ao registrar:
- Os números de mutação citados (93,7 %, 92,0 %, 87,5 %, 69,9 %) **batem** com `PASSO_7_PROVAR_OS_TESTES_v0.1.md`. O parecer é anterior ao Passo 7b (RNC 99,1 %, nó C2 92,9 %), que ele não cobre.
- As respostas 2.1 a 2.5 são **decisões de domínio**, adotadas por este projeto como respondidas (ver `PROMESSAS_DOS_MODULOS_v0.1.md`, seção "Decisões da revisão").
- "Aprovado" vale para a promessa de cada módulo. **Não** fecha: confirmação dos valores assumidos com o datasheet do motor (110 %, 25 %/10 s gás, 20 %/15 s biometano, debounce 10 s/5 s), bancada física, `degrau.max_kw` (BK-AUD-10) nem a passagem do C2 para `recusar`. Esses itens estão em `docs/bt2/migracao/CHECKLIST_GO_LIVE_v0.1.md`.
- Uma IA revisando o trabalho de outra IA reduz o viés, mas não substitui a conferência humana nem a bancada.

---

# Revisão Independente: Passo 7 e Promessas dos Módulos · 19/11/2026

**Revisor:** Gemini (Segunda Opinião Independente / Arquitetura & Engenharia de Controle)  
**Solicitante:** Reginaldo  
**Documentos Base:** `PASSO_7_PROVAR_OS_TESTES_v0.1.md` e `PROMESSAS_DOS_MODULOS_v0.1.md`  
**Status Geral:** **APROVADO COM DIRETRIZES DE BANCADA**

---

## 1. Parecer Técnico sobre o Passo 7 (Propriedades e Mutação)

A execução dos testes baseados em propriedades (`fast-check`) e de mutação (`Stryker`) elevou drasticamente a confiabilidade das camadas de decisão crítica do medidor (`1.10.231`), mitigando o viés da IA avaliar o próprio código:

1. **Salto nos Scores de Mutação:** A elevação nos módulos puros (`93,7%` no perfil de combustível, `92,0%` no decodificador MWM e `87,5%` na guarda de capacidade) demonstra que as regras de contorno e bloqueio estão rigorosamente cercadas.
2. **Análise dos Mutantes Sobreviventes (`fbs_virtuais_v0.14` - `69,9%`):** A taxa global menor na FB mãe é **tecnicamente justificada e aceitável**, pois ~60% dos sobreviventes (`75 de 125`) pertencem estritamente à camada de apresentação visual do mapa (`set`/`reg`/`vai`). Os caminhos críticos de segurança (comando armado, falha de DSE, travamento pós-FALHA e limite excedido) estão blindados.
3. **Verificação de Integridade (`modulos_entregues.test.js`):** A criação do teste automático que compara o código testado com o código embutido no HTML do dashboard (`dashboard/src/js`) elimina um risco operacional gravíssimo (regressões silenciosas ou dessincronização de versões).
4. **Correção do Contexto `vm` no Stryker:** A identificação e correção da ausência de `process` no contexto `vm` prova que a medição de mutação não foi apenas rodada, mas auditada criticamente.

---

## 2. Respostas às Perguntas das Promessas (`PROMESSAS_DOS_MODULOS_v0.1.md`)

Abaixo estão as decisões formais e validações para cada pergunta levantada ao revisor independente:

### 2.1. Guarda de Capacidade (`rodizio_chaves`)
* **Pergunta:** *A regra "carga abaixo do alvo é permitida, acima do limite é bloqueada" está do jeito que a operação quer?*
* **Resposta / Decisão:** **SIM, APROVADO.** Em um banco de cargas de ensaio, operar abaixo da potência alvo é uma condição normal e segura (degrau intermediário ou ensaio parcial). O papel da guarda de capacidade é atuar exclusivamente como **barreira de proteção contra sobrecarga** do gerador/rede. Portanto, permitir qualquer combinação $\le \text{Limite}$ e bloquear estritamente $> \text{Limite}$ (com liberação no valor exato) reflete exatamente o comportamento esperado pela engenharia.
* **Diretriz:** O valor assumido de `110%` e os valores de kW a 100% do catálogo permanecem travados por teste como padrão seguro de referência, ficando sujeitos apenas à conferência documental do catálogo de máquinas antes da operação a plena carga.

### 2.2. FB Mãe do Patamar (`fbs_virtuais`)
* **Pergunta:** *Derrubar todas as chaves quando o DSE cai (decisão de 27/10) é o que a operação quer em todos os casos?*
* **Resposta / Decisão:** **SIM, MANTIDO COMO REGRA INVIOLÁVEL (FAIL-SAFE).** Se o controlador DSE deixa de responder, o medidor perde a telemetria de frequência, tensão e estado do grupo gerador (ficando "cego" sobre a estabilidade da máquina). Manter cargas conectadas sem supervisão ativa do controlador do gerador representa risco de disparo por subfrequência/sobrecarga ou dano mecânico. A ação de derrubar todas as chaves no mesmo ciclo, desarmar e exigir rearme explícito do operador após o retorno da comunicação do DSE está **100% alinhada com a filosofia Fail-Safe**.

### 2.3. Perfil de Combustível (`fb_perfil_combustivel`)
* **Pergunta:** *Os valores dos perfis batem com o datasheet do motor a gás e a biometano usado?*
* **Resposta / Decisão:** **VALORES ASSUMIDOS APROVADOS COMO CONSERVADORES (PENDENTE DE CONFERÊNCIA DE DATASHEET).** Os patamares travados nos testes (`25%` de degrau máximo e `10s` de pausa para gás; `20%` de degrau máximo e `15s` de pausa para biometano) são parâmetros conservadores e seguros para motores ciclo Otto estacionários.
* **Diretriz:** Não alterar esses valores no código agora. Mantê-los travados na suíte de testes e registrar como item de verificação documental com o datasheet específico do motor MWM em ensaio (caso o motor real exija degraus ainda menores, o ajuste será feito via revisão explícita de parâmetro).

### 2.4. Plano de Entrada (`rodizio_chaves` → `planoEntrada`, `picoPlano`)
* **Pergunta:** *Pausa 0 funde os passos no mesmo instante (por desenho): é aceitável?*
* **Resposta / Decisão:** **SIM, ACEITÁVEL E COERENTE COM O DOMÍNIO.** Se o operador ou a receita configurar explicitamente `pausa = 0`, a intenção física é o acionamento simultâneo em um único degrau (desde que validado pela guarda de capacidade total). Fundir os passos no instante $t = 0$ evita atrasos artificiais ou agendamentos redundantes no loop de execução, mantendo a consistência matemática do `picoPlano`.

### 2.5. Decodificador de Série MWM (`decodifica_serie_mwm`)
* **Avaliação:** O comportamento defensivo (nunca lançar exceção, rejeitar formatos fora das normas ETD 091 rev.05 / ETD 094 rev.00, invalidar combustível desconhecido e emitir avisos não bloqueantes para datas limítrofes) está **aprovado**. Como a própria norma declara que a tabela é não exaustiva, o modelo de *aviso* para códigos válidos estruturalmente, porém não mapeados, evita travar a operação em campo por conta de uma revisão nova de fábrica.

---

## 3. Conclusão e Próximos Passos

1. **Encerramento do Passo 7:** As promessas dos 5 módulos críticos estão formalmente validadas e aprovadas pela revisão independente. Nenhuma alteração de código é necessária neste momento.
2. **Foco Operacional:** Como bem apontado no documento, testes automatizados não substituem a verificação física. O próximo passo permanece sendo a **validação em bancada física** (conferência do PLC/ET200 reais, compilação TIA, tempos de leitura e confrontação final dos valores assumidos com o datasheet do motor).