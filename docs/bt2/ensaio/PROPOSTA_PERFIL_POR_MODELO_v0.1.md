# Proposta: onde guardar o comportamento específico de cada modelo de gerador — v0.1 (29/10/2026)

**Status:** PROPOSTA para decisão. Nada foi criado (nem no PLC, nem no Node-RED, nem no HTML). Nomes de campos abaixo são **rótulos**, não nomes de tag/DB.

## 1. A pergunta (visita do supervisor, 28/10)
"Chegou um gerador novo, ou um que foge da teoria (ex.: governador que oscila com degrau de 30 %). Onde fica a informação desse modelo?"

## 2. Como está hoje (confirmado nos arquivos)
- O modelo entra **só pelo kW a 100 %** (catálogo `catalogo_modelos_v0.1.csv`, 1663 linhas, coluna `kW_xml`). V, Hz e kVA não alteram o cálculo (TESTE_GUIADO_MODELOS_v0.1.md §3).
- Os parâmetros de comportamento (degrau máx., pausa, janela, sobreposição, trechos de sub-degrau) são **globais**, no objeto `G.esc` do Patamar Guiado e em `medidor.guiado.v1` (localStorage) — **por navegador, não por modelo** (ESCALONADOR_SUBDEGRAUS_v0.1.md §2, MANUAL_GUIADO_v0.5.md §2). Todos ASSUMIDOS.
- **Não existe hoje lugar algum** para dizer "este modelo precisa de outro degrau".

## 3. Resposta curta (recomendação)
Não colocar 1663 modelos no PLC. Guardar o **cadastro** fora do PLC (arquivo versionado, editado por um HTML de configuração) e levar ao PLC **só o perfil do modelo do ensaio em curso**, em um DB de tamanho fixo.

## 4. Três camadas com herança (só se guarda o que difere)
| Camada | Exemplo | Quem usa |
|---|---|---|
| **Padrão** | os valores atuais de `G.esc` | todo modelo sem exceção |
| **Família** | agrupamento a definir (o catálogo tem `familia_zip` e `pasta_modelo`; o nome da pasta, ex. `MWM_40KVA_eletr`, sugere pistas de motor/regulador — **a confirmar com a engenharia**) | grupo que se comporta igual |
| **Modelo** | exceção de um único arquivo `.dse` | caso específico |
Resolução: **modelo > família > padrão**. Um perfil "vazio" significa "usa o padrão". Assim os ~99 % de modelos comuns não ocupam nada.

## 5. O que entra no perfil (candidatos — a engenharia e o operador confirmam)
Todos vêm do que já existe no escalonador ou do que o operador descreveu em 29/10:
- degrau máximo (kW ou % do kW a 100 %); pausa entre degraus; janela liga-antes; sobreposição; trechos de sub-degrau (já existem em `G.esc`);
- **fracionamento inicial** (ideia do operador): entrar com ~28 dos 30 e completar o restante após uma janela curta (0,3–2 s), em vez de pausa de 1 s;
- **marca "governador sensível a degrau"** (força o fracionamento);
- observações livres e a **origem** do valor (medido em ensaio real / informado / copiado da família).
**Limitação a registrar:** hoje o HTML lê o DSE a cada 1 s (DB52 a cada 2 s). Uma "reação em 200–500 ms" **não é observável** com essa taxa; enquanto não houver leitura mais rápida, a janela só pode ser **fixa por tempo**, não "até reagir". A taxa real de leitura do DSE → Node-RED não está confirmada (flow DSE v3.1 não está nos arquivos).

## 6. Onde guardar
| O quê | Onde | Por quê |
|---|---|---|
| **Cadastro** (padrão + famílias + exceções) | arquivo versionado no servidor (fase 1: JSON estático na pasta `public`, lido pelo medidor; fase 2: rota no Node-RED para salvar) | editar não exige baixar o TIA; tem versão, data e autor; o mesmo cadastro serve BT1 e BT2 |
| **Perfil do ensaio em curso** | **um DB de tamanho fixo** no PLC (struct com poucas dezenas de valores), escrito ao confirmar o modelo, com leitura de volta (mesmo padrão do DB53) | os FBs filhos leem sempre do mesmo lugar; o número do DB não cresce com o nº de modelos |
| **Cópia no registro do ensaio** | junto do DB53/relatório: perfil usado + versão do cadastro | **editar o cadastro depois não altera o ensaio em curso nem o histórico** |
Por que não DB por modelo no PLC: 1663 × ~20 REAL cabem em memória, mas cada ajuste vira download no TIA, sem versão/autor, duplicado em BT1 e BT2, e 99 % seria "padrão". **DB por família** só faz sentido se a engenharia exigir que o PLC opere sem o PC (autonomia) — decisão a registrar.
O número do DB fixo seria definido na reorganização de 02/11 (plano de numeração); aqui **não é inventado**.

## 7. HTML de configuração de modelo (candidato a v0.1, só com "pode alterar")
Mesma linha do gráfico e do mapa: página própria na pasta `public` (e no catálogo). Lista os 1663 modelos com busca; mostra o **perfil efetivo** (e de que camada veio cada campo); permite editar família/modelo; **exporta o JSON** versionado. Fase 1 sem rota nova (arquivo estático); o mapa dos FBs poderia mostrar o perfil ativo no bloco 10 (escalonador).

## 8. Realimentação (o que o operador pediu: "realimenta o teste e o modelo")
Os ensaios reais já geram dados (Registro de aprendizado / amostras). Proposta: o sistema **sugere** ajuste de perfil a partir deles, **sempre com aprovação humana** (nunca grava sozinho no cadastro). Fase posterior, depois de haver ensaios reais com o guiado.

## 9. Confirmado / assumido / a desenvolver
- **Confirmado:** itens da §2.
- **Assumido:** campos da §5, as três camadas, o DB fixo, a fase 1 por arquivo estático.
- **A desenvolver:** tudo; nada criado.

## 10. Perguntas de implementação (para fechar o escopo, sem questionar critério nenhum)
1. Qual é a chave de **família** que a engenharia usa hoje (controlador, motor, regulador de velocidade)?
2. Quem **aprova** uma mudança de perfil, e ela precisa de registro de quem/quando?
3. O PLC precisa operar **sem o PC** (autonomia)? Se sim, perfil por família no PLC; se não, o DB fixo basta.
4. Quais modelos já se sabe que fogem do padrão (para a primeira carga do cadastro)?
