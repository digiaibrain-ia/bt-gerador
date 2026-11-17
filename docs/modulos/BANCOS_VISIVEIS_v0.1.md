# Card "Banco de Cargas": só os bancos selecionados — v0.1 (13/11/2026)

**Medidor v1.10.205** (sobre a v1.10.204). **Ajuste só VISUAL**, a pedido do Reginaldo. Nada muda em lógica, chaves, PLC, Setup ou sugestão do Patamar. Fonte: `dashboard/modulos-fonte/bancos_visiveis_v0.1.js`; gerador: `dashboard/gerador/gerar_medidor_v1.10.205_v0.1.py` (lê a v1.10.204, que não é alterada).
Imagem do resultado: `img_bancos_visiveis_v1.10.205.png` (Demo: BC56 e BC400 selecionados, botão "👁 2/4").

## Como funciona
- Os checks de **Detalhes do Patamar** (BC56, BC400, BC59,5, BC550) continuam sendo a única fonte da seleção. O card "Banco de Cargas" passa a mostrar **só os selecionados**. Antes (desde a v1.10.153) os não selecionados apareciam fechados; agora ficam ocultos.
- Técnica: só se acrescenta a classe `bk-oculto` (`display:none`) ao subcard do banco; o HTML dele continua no lugar (robô de teste, Setup, rotas e desenho do card não mudam).
- **Segurança:** um banco desmarcado **reaparece** se tiver **chave ligada**, **comando pendente** ou **leitura perdida** (estado desconhecido), e volta a ocultar quando isso passa. **"Ligar banco" ativo não conta**: ele só libera o comando das chaves (não energiza carga) e está ativo nos quatro bancos do Demo; se contasse, nenhum banco poderia sumir.
- Botão **"👁 n/N"** no cabeçalho do card: mostra quantos bancos estão visíveis; ao tocar, alterna para **"Todos"** (lembrado neste navegador, chave `medidor.bancosTodos`). Sem nenhum banco visível aparece um aviso.
- Se o módulo falhar, o card fica como era (todos visíveis).

## O que foi provado (simulado, Demo)
- Padrão: BC56 e BC400 visíveis, BC59,5 e BC550 ocultos, botão "👁 2/4".
- Marcar/desmarcar um banco em Detalhes mostra/oculta na hora (≤ 0,7 s).
- Regra de segurança: classes `s1`, `cmd`, `unk` fazem o banco oculto aparecer e ele volta a ocultar ao soltar; com chave ligada **de verdade** no simulador (BC550) o botão foi para "👁 3/4" e voltou.
- "Todos" funciona e é lembrado ao recarregar; sem nenhum selecionado o aviso aparece; 0 erro de JavaScript.
- **Robô Dev/Operador oculto na v1.10.205: 186 OK · 8 FALHA · 1 AVISO, idêntico ao da v1.10.204** (mesmas 8 falhas do Setup, `SETUP-ROBO-01`; nenhum item mudou).
- **Não provado:** DSE/PLC real e o medidor no PC BT2; em modo real o estado das chaves vem do PLC (a regra usa as mesmas classes do desenho do card).

## Sugestão de projeto (NÃO implementada): FB "ordenador de cargas"
Só uma ideia do Reginaldo, **sem nenhuma alteração no PLC** nem no que já existe. Encaixaria na proposta `PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md` como mais um FB filho (entre o "Motor de sugestão" e o "Escalonador de entrada"):
- **Entra:** bancos selecionados (os mesmos checks), tamanho do degrau. **Sai:** sequência de passos `(banco, posição 1..32)`; com N bancos, 32×N passos. Cada banco é tratado como 32 posições (normalização por percentual do banco, **não** resistores físicos: os bancos reais têm 13 chaves de kW diferentes).
- **Ordem escolhida: intercalada** (uma posição de cada banco por vez): `banco = k MOD N`, `posição = k DIV N`. (Banco por banco seria `k DIV 32` e `k MOD 32`.) A dificuldade de programar é parecida; na intercalada trocar a seleção no meio do ensaio reordena todos os passos, então a ordem precisa ser **congelada ao iniciar o ensaio**. Vantagem: espalha calor e desgaste.
- O "Motor de sugestão" converteria cada posição lógica nas chaves reais (mapeamento tolerante); a **Guarda de capacidade (mandatória)** continuaria mandando; a numeração segue `PLANO_NUMERACAO_BLOCOS_PLC.md` (sem inventar número de bloco); nada vai ao PLC sem backup e OK; primeiro um protótipo em JavaScript, depois o FB em SCL.
