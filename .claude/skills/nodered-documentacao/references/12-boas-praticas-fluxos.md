# Boas práticas: estrutura, mensagens e documentação de fluxos

Fonte: `docs/developing-flows/*.md` (Flow structure, Message design, Documenting flows)

Objetivo oficial: fluxos **reutilizáveis, fáceis de manter e robustos**. Fluxos crescem e viram emaranhado de nós e fios se não houver estrutura desde o início.

## 1. Estrutura
### Abas
- Principal forma de organizar: **separar componentes lógicos em abas**. Exemplos: automação residencial por cômodo (físico) ou por função (iluminação × aquecimento); backend HTTP com uma aba por tipo de recurso.
- Meta: dar para "ler" um fluxo do começo ao fim numa aba.
- Com vários desenvolvedores, abas separadas facilitam merge; considere papéis/especialidades.

### Reutilização — evite cópias da mesma lógica (correções esquecidas)
| | **Link nodes** | **Subflows** |
|---|---|---|
| O que é | Fio virtual do fim de um fluxo ao início de outro (entre abas) | Novo nó na palette cuja implementação é um fluxo |
| Onde usar | **Só no início ou fim** de um fluxo (não no meio com retorno)* | Em qualquer ponto do fluxo |
| Ligações | Um link pode conectar a vários (fan-out/fan-in); também servem na mesma aba para evitar fios cruzando da direita para a esquerda | Cada instância é **independente**: contexto flow por instância; **cada instância abre sua própria conexão** a sistemas remotos |

\* O guia foi escrito antes do modo "return" do link call; hoje existe o **Link Call** (chama um fluxo e recebe resposta) e `node.linkcall` no Function (5.0+). Ver `06-nos-core.md` e `02-function-node.md`.

### Personalizar subflows
Em vez de um Change antes de cada instância setando `msg.topic`, configure o nó interno com `${MY_TOPIC}` e crie `MY_TOPIC` como **propriedade do subflow** (vira variável de ambiente, editável por instância). Funciona em campos de texto; **não** em checkboxes ou UIs customizadas.

### Estado
- Context: aba, subflow ou global. Se só uma aba usa, use **flow**, não global. Nomes descritivos.
- Fora do Node-RED: mensagens MQTT retidas, banco de dados. Adicionam dependência externa, mas servem para compartilhar entre **várias instâncias de Node-RED** ou (MQTT) disparar fluxo quando o valor muda. Podem complementar o contexto.

### Um fluxo, várias plataformas
Variáveis de ambiente para diferenças por dispositivo/SO (tópico MQTT único por dispositivo, caminho de arquivo por SO): configure `${MY_TOPIC}` e defina a variável antes de iniciar o Node-RED. Inject e Change leem env pelo TypedInput "env"; Function usa `env.get()`.

### Tratamento de erros
Catch e Status (ver `04-erros-status.md`). Não há ligação visual entre Catch e os nós-alvo, então:
- posicione perto da parte correspondente (sem poluir), **ou** agrupe todos os fluxos de erro **abaixo** do fluxo principal (caminho "bom" separado dos de erro);
- **nomeie cada Catch** pelo cenário que trata;
- seja consistente em todos os fluxos.

## 2. Design de mensagens
- A escolha de propriedades é guiada pelo que os nós exigem; a maioria usa `msg.payload`.
- Exemplo: MQTT traz um id no payload → nó de banco consulta e **sobrescreve** o payload com o resultado. Se precisar do id depois, copie antes com um Change para `msg.id`.
- **Princípio**: nós não devem alterar/remover propriedades que não são da sua função. Function deve, na maioria dos casos, devolver o mesmo objeto recebido.
- `msg.topic` tem significado especial em vários nós: identifica origem ou "streams" no mesmo fluxo e aparece no Debug. MQTT In o define; Delay pode limitar taxa **por tópico**. Pode usar para contexto extra, mas cuidado ao introduzir nós que dependem dele.
- Para nó/subflow reutilizável, as propriedades lidas e escritas **são a API** dele — projete com cuidado (vale para fluxos também).
  - Tudo sob payload (`{payload:{temperature, humidity, pressure}}`): junto, mas obriga a mover propriedades.
  - Dado principal no payload e metadados em outra propriedade (padrão do nó Twitter: texto em `payload`, tudo em `msg.tweet`).
  - Não há resposta única: projete para o uso mais comum.
- Nomes autoexplicativos (`msg.temperature` > `msg.t`). Evite `reset` e `parts`, que têm significado especial.

## 3. Documentação de fluxos
Por quê: você mesmo no futuro; quem recebe o fluxo; APIs externas expostas (parâmetros esperados); escrever revela melhorias.

- **Layout**: cada unidade de processamento numa **linha horizontal** (o snap à grade ajuda); ramos de nós com várias saídas alinhados **verticalmente** para comparar; fluxos longos: segmentos lógicos em blocos verticais — bons candidatos a subflow, principalmente se reutilizáveis. Minimize fios cruzados.
- **Nomes**: use `name` nos pontos-chave ("Get current time" em vez de "set msg.payload"). Equilíbrio: nome longo ocupa espaço; às vezes esconder o rótulo é melhor. Ícone customizado (ex.: por tipo de dispositivo em vários MQTT In) com cuidado — o ícone identifica o tipo do nó. Nomeie também abas e subflows.
- **Link nodes precisam de nome**: sem nome, a ligação entre abas usa o ID interno, gerando erros. Trate-os como APIs entre abas, com esquema de nomes que identifique início e fim.
- **Rótulos de porta**: em nós com várias saídas (Switch tem rótulos padrão; personalize na aba Appearance).
- **Comment node**: rótulo + descrição na barra Info; indentação sugere agrupamento.
- **Grupos**: agrupamento explícito; cor de fundo por tipo de grupo.
- **Descrição longa**: aba Description de todo nó, grupo e aba, em **Markdown** (listas, tabelas, links), exibida na barra Information. Ideal para lógica complexa e APIs expostas.
