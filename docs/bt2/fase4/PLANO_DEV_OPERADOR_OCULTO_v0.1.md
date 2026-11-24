# Plano - "Dev/Operador oculto" (antigo Operador secreto) avancado - v0.1 - 07/11/2026 - AGUARDA OK
Nada foi alterado. Este plano segue o metodo (plano -> OK -> versao nova -> provar -> relatorio).

## O que existe hoje (medidor 1.10.174)
Robo "Operador secreto" [DEV.OPS] (~570 linhas): fases Chaves, Cargas (local ou PLC), Setup e um Ensaio completo (INICIAR, Dados, 6 etapas com SALVAR, FINALIZAR, Gravar). Aperta os mesmos botoes (`element.click()`), confere a resposta, devolve a tela ao estado anterior, relatorio no popup Demo e eventos no log (DEV.OPS). Roda so com a senha do Demo, em Demo local e Demo+PLC; nunca no REAL.
Universo de objetos hoje: **241 botoes, 7 summary, 61 inputs, 4 selects, 28 dialogs, 56 tiles de chave, 22 abas, 1 canvas** (~400). No celular (390 px) ha 32 alvos de toque menores que 24 px.

## O que sera feito
1. **Renomear** para "Dev/Operador oculto" (botao, barra flutuante, relatorio; o id `opsIni` e o card `DEV.OPS` ficam, por compatibilidade).
2. **Tres modos:** (A) Rapido = as fases de hoje; (B) **Avancado** = varredura de 100 % dos objetos + ensaio + patamar + configuracoes; (C) **Monkey** = cliques/entradas aleatorios com semente fixa (reproduzivel) e duracao escolhida, com os mesmos invariantes.
3. **Varredura universal (modo B):** para cada objeto interativo: aciona (clique, marcar/desmarcar, digitar valor valido/limite/invalido, escolher em lista, deslizar), e registra **o que mudou**: janelas que abriram, **onde abriu** (posicao/tamanho, dentro da tela?), quem fica **por cima** (camada), se **fecha** (✕, Esc, clique fora), se **reabre**, mensagens, erros de JavaScript.
4. **Invariantes verificados em todo objeto/janela:** (a) alcancavel (o centro do objeto recebe o clique, nada o cobre); (b) toda janela aberta fecha e reabre; (c) janela cabe na tela e a barra de titulo e o ✕ ficam visiveis; (d) nenhum erro JS/console; (e) sem rolagem horizontal da pagina; (f) alvo de toque >= 44 px no celular (aviso); (g) texto nao estoura (truncamento); (h) estado volta ao anterior ao fim (nada fica preso: chave ligada, janela aberta, Dados alterados).
5. **Ensaio e patamar:** ensaio completo (6 etapas, SALVAR, FINALIZAR, Gravar) em varios tipos de ensaio e velocidades; **Patamar guiado** (sugerir, aplicar, editar sugestao, avancar patamar, salvar patamar, "chaves != sugerido"); modos (Manual guiado, relogio, sem grafico).
6. **Protecoes (caixa de areia):** durante o robo ficam **bloqueados e registrados**: POST/PUT/DELETE de rede, `window.print`, `window.open`, `alert/confirm/prompt` (resposta automatica), downloads, seletor de arquivo/pasta. O modo B e C **so rodam em Demo local** (nunca REAL, nunca Demo+PLC, porque cliques em massa gravariam no PLC). O modo A continua como hoje.
7. **Log ativo + saida:** liga o log (DEV.OBS) antes de comecar; ao fim mostra o relatorio (com **cobertura: X de Y objetos acionados**, lista do que nao deu para acionar e por que), salva pela Central de registros (RESUMO.md / agrupado) e permite copiar para me enviar.
8. **Desktop e celular:** o robo roda **dentro da pagina**, na tela em que estiver (PC ou celular). Alem disso um orquestrador de teste (Playwright) executa o mesmo robo em perfis **desktop 1280x800** e **celular 390x844 com toque** (e 360x740/tablet 768 se voce quiser) e acrescenta o que so entrada de verdade prova: **arrastar/mover janela com mouse e com o dedo**, redimensionar (⤢), toque longo, rolagem. Gera relatorio por perfil.
9. **Analise e correcao:** eu rodo aqui nos dois perfis, classifico os achados (defeito claro / UX duvidosa / fora de escopo), **corrijo os defeitos claros em versao nova do medidor**, reroda ate fechar, e levo para o `BACKLOG_FORA_DE_ESCOPO.md` o que nao for defeito claro. Entrego relatorio honesto com antes/depois.

## Limites (honestos)
- **"Todas as possibilidades, sem excecao" nao e atingivel ao pe da letra:** ~400 objetos combinados em qualquer ordem e estado dao um numero astronomico de caminhos (explosao combinatoria). O que se entrega e **100 % dos objetos acionados** + sequencias e pares dos fluxos criticos + **monkey reproduzivel** + um relatorio de cobertura que diz exatamente o que ficou de fora.
- Cliques em codigo (`element.click()`) nao provam toque/arraste real e nao pegam todos os problemas de camada; por isso o orquestrador com entrada real e os testes de "alcancavel".
- Nao substitui a bancada: PLC/DSE reais, ventilador, rede e o texto do roteiro continuam sendo validados por voce.

## Decisoes que preciso do OK
1. Modos B e C so em **Demo local** (nunca REAL/Demo+PLC). OK?
2. Perfis de celular: 390x844 (obrigatorio) + 360x740 e tablet 768? 
3. Politica de correcao: eu corrijo so **defeitos claros** e listo o duvidoso para voce decidir. OK?
4. Duracao do monkey: sugiro 3 min por perfil, semente fixa.
