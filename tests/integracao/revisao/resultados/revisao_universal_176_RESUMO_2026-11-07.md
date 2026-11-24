# Revisao universal de UI

Gerado em 07/11/2026, 04:35:55

## Cobertura
| pagina | perfil | acionados | total | nao acionados | achados |
|---|---|---|---|---|---|
| medidor | desktop | 111 | 244 | 135 | 7 |
| medidor | desktop+demo | 108 | 260 | 154 | 3 |
| medidor | pocoA | 111 | 316 | 208 | 177 |
| medidor | pocoA+demo | 112 | 335 | 226 | 189 |
| medidor | pocoB | 127 | 350 | 226 | 210 |
| medidor | pocoB+demo | 115 | 336 | 224 | 191 |
| grafico | desktop | 19 | 19 | 0 | 0 |
| grafico | pocoA | 19 | 19 | 0 | 19 |
| grafico | pocoB | 19 | 19 | 0 | 19 |
| maquete | desktop | 15 | 37 | 22 | 6 |
| maquete | pocoA | 18 | 37 | 19 | 26 |
| maquete | pocoB | 18 | 37 | 19 | 26 |
| mapa | desktop | 8 | 29 | 21 | 0 |
| mapa | pocoA | 8 | 29 | 21 | 19 |
| mapa | pocoB | 8 | 29 | 21 | 19 |
| gerenciador | desktop | 21 | 22 | 1 | 0 |
| gerenciador | pocoA | 21 | 22 | 1 | 22 |
| gerenciador | pocoB | 21 | 22 | 1 | 22 |
| amostras | desktop | 20 | 22 | 2 | 0 |
| amostras | pocoA | 20 | 22 | 2 | 22 |
| amostras | pocoB | 20 | 22 | 2 | 22 |
| apicards | desktop | 1 | 1 | 0 | 0 |
| apicards | pocoA | 1 | 1 | 0 | 2 |
| apicards | pocoB | 1 | 1 | 0 | 2 |
| index | desktop | 8 | 8 | 0 | 0 |
| index | pocoA | 8 | 8 | 0 | 1 |
| index | pocoB | 8 | 8 | 0 | 1 |
| arquitetura | desktop | 1 | 22 | 21 | 0 |
| arquitetura | pocoA | 1 | 22 | 21 | 18 |
| arquitetura | pocoB | 1 | 22 | 21 | 18 |

## Achados por tipo
| gravidade e tipo | qtd |
|---|---|
| alta coberto_por_outro | 35 |
| alta janela_fechar_nao_responde | 2 |
| baixa alvo_toque_pequeno | 950 |
| baixa sem_nome_acessivel | 18 |
| media alvo_toque_muito_pequeno | 36 |

## Achados (alta e media)
- **alta** medidor [desktop] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: div.jbtns em (795,591) rect=220,586,1021,60 pos=sticky z=2 dlgPai=dlgDados scrollY=0 obj=702,584,185,15 dlg(scrollTop/scrollH/clientH)=0,516,516
- **alta** medidor [desktop] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (1053,591) rect=220,586,1021,60 pos=sticky z=2 dlgPai=dlgDados scrollY=0 obj=893,577,320,29 dlg(scrollTop/scrollH/clientH)=0,516,516
- **alta** medidor [desktop+demo] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: div.jbtns em (795,591) rect=220,586,1021,60 pos=sticky z=2 dlgPai=dlgDados scrollY=0 obj=702,584,185,15 dlg(scrollTop/scrollH/clientH)=0,516,516
- **alta** medidor [desktop+demo] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (1053,591) rect=220,586,1021,60 pos=sticky z=2 dlgPai=dlgDados scrollY=0 obj=893,577,320,29 dlg(scrollTop/scrollH/clientH)=0,516,516
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgReg] input#rgSemDemo "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgCentral] input "pasta" — 15x22 px (minimo recomendado 44)
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgCentral] input#cenAgr "on" — 19x22 px (minimo recomendado 44)
- **alta** medidor [pocoA] `coberto_por_outro` div "Clique para recolher" — o clique no centro cairia em: span#ensModo.enschip em (207,452) rect=32,439,348,36 pos=static z=auto dlgPai=- scrollY=19 obj=25,426,363,52 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoA] `coberto_por_outro` button "1 ocorrência ativa em "Modo" — clique pa" — o clique no centro cairia em: span#ensModo.enschip em (110,452) rect=32,439,348,36 pos=static z=auto dlgPai=- scrollY=19 obj=85,432,49,40 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoA] `coberto_por_outro` button#bModoCard "Alterar o modo de operação (abre o popup" — o clique no centro cairia em: span#ensModo.enschip em (315,452) rect=32,439,348,36 pos=static z=auto dlgPai=- scrollY=19 obj=278,432,73,40 dlg(scrollTop/scrollH/clientH)=-
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgDados] input "Monofásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgDados] input "Bifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgDados] input "Trifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgDados] input "" — 218x18 px (minimo recomendado 44)
- **alta** medidor [pocoA] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: button#dLimpa.bt em (244,739) rect=207,735,173,40 pos=static z=auto dlgPai=dlgDados scrollY=903 obj=135,730,218,18 dlg(scrollTop/scrollH/clientH)=162,1054,892
- **alta** medidor [pocoA] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (205,772) rect=14,723,379,175 pos=sticky z=2 dlgPai=dlgDados scrollY=903 obj=41,754,329,35 dlg(scrollTop/scrollH/clientH)=162,1054,892
- **media** medidor [pocoA] `alvo_toque_muito_pequeno` [dlgPatDet] input "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgReg] input#rgSemDemo "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgCentral] input "pasta" — 15x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgCentral] input#cenAgr "on" — 19x22 px (minimo recomendado 44)
- **alta** medidor [pocoA+demo] `coberto_por_outro` div "Clique para recolher" — o clique no centro cairia em: span#ensModo.enschip em (207,452) rect=101,439,279,22 pos=static z=auto dlgPai=- scrollY=19 obj=25,426,363,52 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoA+demo] `coberto_por_outro` button#bModoCard "Alterar o modo de operação (abre o popup" — o clique no centro cairia em: span#ensModo.enschip em (315,452) rect=101,439,279,22 pos=static z=auto dlgPai=- scrollY=19 obj=278,432,73,40 dlg(scrollTop/scrollH/clientH)=-
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Monofásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Bifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Trifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgDados] input "" — 218x18 px (minimo recomendado 44)
- **alta** medidor [pocoA+demo] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: button#dLimpa.bt em (244,739) rect=207,735,173,40 pos=static z=auto dlgPai=dlgDados scrollY=795 obj=135,730,218,18 dlg(scrollTop/scrollH/clientH)=162,1054,892
- **alta** medidor [pocoA+demo] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (205,772) rect=14,723,379,175 pos=sticky z=2 dlgPai=dlgDados scrollY=795 obj=41,754,329,35 dlg(scrollTop/scrollH/clientH)=162,1054,892
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` input#simCarga "0" — 315x16 px (minimo recomendado 44)
- **media** medidor [pocoA+demo] `alvo_toque_muito_pequeno` [dlgPatDet] input "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgReg] input#rgSemDemo "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgCentral] input "pasta" — 17x22 px (minimo recomendado 44)
- **alta** medidor [pocoB] `coberto_por_outro` div "Clique para recolher" — o clique no centro cairia em: span#ensModo.enschip em (225,471) rect=35,458,382,36 pos=static z=auto dlgPai=- scrollY=0 obj=25,445,400,52 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoB] `coberto_por_outro` button "1 ocorrência ativa em "Modo" — clique pa" — o clique no centro cairia em: span#ensModo.enschip em (110,471) rect=35,458,382,36 pos=static z=auto dlgPai=- scrollY=0 obj=85,451,49,40 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoB] `coberto_por_outro` button#bModoCard "Alterar o modo de operação (abre o popup" — o clique no centro cairia em: span#ensModo.enschip em (352,471) rect=35,458,382,36 pos=static z=auto dlgPai=- scrollY=0 obj=315,451,73,40 dlg(scrollTop/scrollH/clientH)=-
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgDados] input "Monofásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgDados] input "Bifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgDados] input "Trifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgDados] input "" — 218x18 px (minimo recomendado 44)
- **alta** medidor [pocoB] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: button#dLimpa.bt em (245,821) rect=226,816,191,40 pos=static z=auto dlgPai=dlgDados scrollY=843 obj=136,812,218,18 dlg(scrollTop/scrollH/clientH)=66,1039,973
- **alta** medidor [pocoB] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (224,853) rect=15,804,413,175 pos=sticky z=2 dlgPai=dlgDados scrollY=843 obj=42,836,363,35 dlg(scrollTop/scrollH/clientH)=66,1039,973
- **alta** medidor [pocoB] `coberto_por_outro` button#bFaixaAgua "Ajustar limites da água" — o clique no centro cairia em: div#tempAguaC.v em (406,493) rect=240,493,174,29 pos=static z=auto dlgPai=- scrollY=1239 obj=394,473,24,40 dlg(scrollTop/scrollH/clientH)=-
- **media** medidor [pocoB] `alvo_toque_muito_pequeno` [dlgPatDet] input "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgReg] input#rgSemDemo "on" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgCentral] input "pasta" — 17x22 px (minimo recomendado 44)
- **alta** medidor [pocoB+demo] `coberto_por_outro` div "Clique para recolher" — o clique no centro cairia em: span#ensModo.enschip em (225,471) rect=136,458,281,22 pos=static z=auto dlgPai=- scrollY=0 obj=25,445,400,52 dlg(scrollTop/scrollH/clientH)=-
- **alta** medidor [pocoB+demo] `coberto_por_outro` button#bModoCard "Alterar o modo de operação (abre o popup" — o clique no centro cairia em: span#ensModo.enschip em (352,471) rect=136,458,281,22 pos=static z=auto dlgPai=- scrollY=0 obj=315,451,73,40 dlg(scrollTop/scrollH/clientH)=-
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Monofásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Bifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgDados] input "Trifásico" — 13x22 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgDados] input "" — 218x18 px (minimo recomendado 44)
- **alta** medidor [pocoB+demo] `coberto_por_outro` [dlgDados] input "" — o clique no centro cairia em: button#dLimpa.bt em (245,821) rect=226,816,191,40 pos=static z=auto dlgPai=dlgDados scrollY=735 obj=136,812,218,18 dlg(scrollTop/scrollH/clientH)=66,1039,973
- **alta** medidor [pocoB+demo] `coberto_por_outro` [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — o clique no centro cairia em: div.jbtns em (224,853) rect=15,804,413,175 pos=sticky z=2 dlgPai=dlgDados scrollY=735 obj=42,836,363,35 dlg(scrollTop/scrollH/clientH)=66,1039,973
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` input#simCarga "0" — 352x16 px (minimo recomendado 44)
- **media** medidor [pocoB+demo] `alvo_toque_muito_pequeno` [dlgPatDet] input "on" — 13x22 px (minimo recomendado 44)
- **alta** maquete [desktop] `coberto_por_outro` button "B · Patamar abaixo do Banco" — o clique no centro cairia em: div.bd em (368,136) rect=22,131,428,115 pos=static z=auto dlgPai=- scrollY=0 obj=287,114,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [desktop] `coberto_por_outro` button "C · Patamar na faixa do topo (largo)" — o clique no centro cairia em: div.grid em (368,181) rect=30,139,412,103 pos=static z=auto dlgPai=- scrollY=0 obj=287,159,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [desktop] `coberto_por_outro` button "Mostrar todos os cards ocultos" — o clique no centro cairia em: div.cx em (368,225) rect=309,186,133,56 pos=static z=auto dlgPai=- scrollY=0 obj=287,204,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [desktop] `coberto_por_outro` button "MD — tabela do layout" — o clique no centro cairia em: div#area em (412,163) rect=12,91,1256,694 pos=relative z=auto dlgPai=- scrollY=0 obj=331,149,162,27 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [desktop] `coberto_por_outro` button "JSON — posições (para reabrir)" — o clique no centro cairia em: div#area em (412,199) rect=12,91,1256,694 pos=relative z=auto dlgPai=- scrollY=0 obj=331,177,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [desktop] `coberto_por_outro` button "PDF — imprimir a tela" — o clique no centro cairia em: div#area em (412,235) rect=12,91,1256,694 pos=relative z=auto dlgPai=- scrollY=0 obj=331,222,162,27 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [pocoA] `coberto_por_outro` button "MD — tabela do layout" — o clique no centro cairia em: span.nome em (296,340) rect=54,336,264,17 pos=static z=auto dlgPai=- scrollY=0 obj=215,320,162,40 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [pocoA] `coberto_por_outro` button "JSON — posições (para reabrir)" — o clique no centro cairia em: div#area em (296,382) rect=12,309,383,694 pos=relative z=auto dlgPai=- scrollY=0 obj=215,361,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [pocoA] `coberto_por_outro` button "PDF — imprimir a tela" — o clique no centro cairia em: div#area em (296,425) rect=12,309,383,694 pos=relative z=auto dlgPai=- scrollY=0 obj=215,405,162,40 dlg(scrollTop/scrollH/clientH)=-
- **media** maquete [pocoA] `alvo_toque_muito_pequeno` button "Recolher / abrir o card" — 18x40 px (minimo recomendado 44)
- **media** maquete [pocoA] `alvo_toque_muito_pequeno` button "Abrir/fechar" — 16x40 px (minimo recomendado 44)
- **alta** maquete [pocoB] `coberto_por_outro` button "MD — tabela do layout" — o clique no centro cairia em: div.bt em (215,340) rect=22,296,428,50 pos=static z=auto dlgPai=- scrollY=0 obj=134,320,162,40 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [pocoB] `coberto_por_outro` button "JSON — posições (para reabrir)" — o clique no centro cairia em: div#area em (215,382) rect=12,286,420,694 pos=relative z=auto dlgPai=- scrollY=0 obj=134,361,162,44 dlg(scrollTop/scrollH/clientH)=-
- **alta** maquete [pocoB] `coberto_por_outro` button "PDF — imprimir a tela" — o clique no centro cairia em: div#area em (215,425) rect=12,286,420,694 pos=relative z=auto dlgPai=- scrollY=0 obj=134,405,162,40 dlg(scrollTop/scrollH/clientH)=-
- **media** maquete [pocoB] `alvo_toque_muito_pequeno` button "Recolher / abrir o card" — 18x40 px (minimo recomendado 44)
- **media** maquete [pocoB] `alvo_toque_muito_pequeno` button "Abrir/fechar" — 16x40 px (minimo recomendado 44)
- **alta** apicards [pocoA] `janela_fechar_nao_responde` dialog#dlgAjuda — o clique no botao fechar nao fechou a janela (so o Esc fechou)
- **alta** apicards [pocoB] `janela_fechar_nao_responde` dialog#dlgAjuda — o clique no botao fechar nao fechou a janela (so o Esc fechou)