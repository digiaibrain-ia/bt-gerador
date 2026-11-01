# ATUALIZACAO v2 (20/10/2026 14:06) - decisoes do usuario (prevalecem sobre o texto abaixo)
- Bancos de carga se chamam **BC56** e **BC400** (cancelado BC1..BC4). 6 posicoes k=1..6: k=1 BC56 (base DB150), k=2 BC400 (base DB158), k=3..6 reserva (166, 174, 182, 190).
- 1214 = PLC dos Bancos de Carga (confirmado). Nomes com 3 digitos aprovados. Somente um DSE por BT (sem DSE comum). FB/FC com faixas proprias aprovado.
- Regra matematica: DB card BT = Base_BT + offset (BT2=50, BT1=100); FB do card = 50 + offset; instancia = Base_BT + 10 + offset (ex.: Etapas offset 6 -> DB56/FB56/DB66 no BT2, DB106/DB116 no BT1). Banco k: base = 150 + 8*(k-1); DB chaves = base+0; FB100+f; instancia = base+4+f (BC56 setupChaves = DB154, BC400 = DB162).
- Tabela viva com formulas: `PLANO_NUMERACAO_BLOCOS_PLC_v2.xlsx` (parametros editaveis na aba Regras). Em caso de divergencia, vale o Excel.
- DB DSE: o texto da secao 3 sobre DSE comum fica sem efeito.

# Plano de numeração de blocos do PLC dos Bancos de Carga (proposta v1 - 20/10/2026)

Status: PROPOSTA para aprovação. Nada foi criado/renomeado. Tudo que já existe fica CONGELADO até depois do teste a quente (quinta e sexta).
Complementa/substitui a "Regra de numeração" de 19/10 (`claude/REGRA_NUMERACAO_DB_BT2.md`) - diferenças na seção 9.

## 0. Separação (regra 4 do projeto)

**(a) Confirmado (dito pelo usuário ou lido em arquivo real)**
- PLC dos Bancos de Carga recebe DB DSE próprio **do BT1 e do BT2**; o JSON do Node-RED é o mesmo nos dois, muda só o IP; o direcionamento é feito pelo Node-RED.
- IP .156 = PC do BT2; .135 = PLC (172.17.209.135, rack 0, slot 1).
- CPU de produção = **S7-1200F 1214FC** (ainda não comprada). Hoje roda numa **1515 provisória**; tudo que for testado migra depois para a 1214.
- Datasheet 1214FC (`A700000006981255.pdf`): memória de trabalho 200 kB; carga 4 MB; área retentiva 14 kB; blocos (DB+FC+FB+contadores+temporizadores) endereçáveis de 1 a 65535; OB limitado só pela RAM; S7: 8 conexões reservadas / 14 máx.
- DBs acessados por Node-RED (node-red-contrib-s7) = `S7_Optimized_Access := FALSE` (DB52, DB53, DB55 reais). DB52 = DSE BT2, DB53 = SNAP MANUAL BT2, DB55 = chaves.
- BT2 = DB50-99, BT1 = DB100-149, DB50-59 = cards, DB60-69 = instâncias de FB (regra de 19/10).
- Bancos de carga: 4 hoje (BC1-BC4) + 2 reserva = 6 posições; hoje só BC56 e BC400 são usados.
- O HTML não tem número de DB em código (só em texto de histórico/comentário): trocar a numeração NÃO exige mexer no HTML; só no PLC e nos endereços S7 dos JSONs do Node-RED.

**(b) Assumido (confirmar)**
- A 1214 será o "PLC dos Bancos de Carga" (o que tem DB52/53/55). O "PLC Ensaio Automático" é outro e fica fora desta etapa.
- Posição física de cada banco (qual é BC1..BC4) - ver pergunta P1.

**(c) A desenvolver**: DBs novos abaixo, FB/FC dos cards, DB seletor, DB "Dados do ensaio" (hoje preenchimento está dentro do DB53).

## 1. Princípios (conceito Siemens)

1. **Dado separado de lógica**: DB de dados do card (acessado por Node-RED, não otimizado) ≠ FB/FC (lógica) ≠ DB de instância (otimizado). Cada um em faixa própria.
2. **Lógica escrita uma vez, instanciada por escopo**: um FB genérico + um DB de instância por BT/por banco. Nunca copiar FB para BT1/BT2/banco.
3. **Mesmo "gabarito" em todo escopo**: DB do BT1 = DB do BT2 + 50; DB do banco N tem o mesmo deslocamento interno. Quem sabe um, sabe todos.
4. **Dado do banco de carga não pertence ao BT**: um banco pode servir BT1 ou BT2; quem associa banco->BT é o Node-RED (config), não o PLC. Isso mantém o DB do banco igual qualquer que seja o BT.
5. **Nome simbólico com número de 3 dígitos** (`db052_...`): evita `db100` ordenar antes de `db50` na árvore do TIA. (Decisão P3.)
6. Seguir a skill `siemens-s7-scl-master` seção 25: `prefixo+número+_+descrição`; FB padrão MWM `fb[nº]_[NomePascalCase]`; cabeçalho TITLE/AUTHOR 'Reginaldo Lobo'/VERSION; ASCII.
7. Reserva explícita em cada faixa (nunca preencher 100%).

## 2. Mapa geral de faixas

| Faixa DB | Escopo | Observação |
|---|---|---|
| 1-49 | COMUM (todos) | seletor manual/auto, config global, diagnóstico |
| 50-99 | BT2 | 50-59 dados dos cards · 60-69 instâncias de FB |
| 100-149 | BT1 | mesmo gabarito do BT2 (+50) |
| 150-197 | BANCOS DE CARGA | 6 posições x 8 DBs |
| 198-199 | reserva | |
| 200+ | livre (criação sob demanda, como você definiu) | testes/experimentos; nada definitivo |

| Faixa FB/FC | Uso |
|---|---|
| 1-49 | comum (utilidades, mapeamento de I/O, diagnóstico) |
| 50-99 | lógica dos cards do Banco de Teste (1 FB, 2 instâncias: BT1 e BT2) |
| 100-149 | lógica do banco de carga (1 FB, N instâncias: uma por banco) |
| 150-199 | reserva |
| 200+ | livre |

OBs: OB1 Main (só chama FCs de área); OB100 Startup; demais OBs só se necessários (reserva). (Proposta; a 1214 aceita, OB limitado só por RAM.)

## 3. COMUM (DB 1-49)

| DB | Função | Status |
|---|---|---|
| 1-9 | reserva sistema | |
| 10 | Seletor manual/automático (DB seletor do doc de arquitetura, "nº a definir") | a desenvolver |
| 11-19 | config global / atribuição (se um dia for para o PLC) | reserva |
| 20-29 | diagnóstico / watchdog de comunicação | reserva |
| 30-49 | reserva | |

Nota: "DB DSE comum" do seu pedido -> como cada BT tem o seu DSE, o comum fica só com seletor/config. Se quiser um DB DSE "genérico" comum, é pergunta P4.

## 4. Gabarito do BT (BT2 = base 50, BT1 = base 100)

| Offset | BT2 | BT1 | Conteúdo (card / popup) | Hoje |
|---|---|---|---|---|
| +0, +1 | 50, 51 | 100, 101 | reserva | - |
| +2 | 52 | 102 | **DSE** (SB_DSE, escrito pelo Node-RED DSE): Grandezas, Motor, popup Grandezas/Motor | DB52 existe |
| +3 | 53 | 103 | **Registro / SNAP MANUAL**: card Registro do ensaio, popup Resultado, "Abrir" etapa | DB53 existe |
| +4 | 54 | 104 | **Parâmetros**: popup Faixas (tipo de ensaio/faixas), faixa de água | proposto (já citado por você) |
| +5 | 55 | 105 | reserva (o antigo DB55 Chaves sai daqui - vai para o banco) | - |
| +6 | 56 | 106 | **Etapas do ensaio** (estado, cronômetro, comandos) | proposto |
| +7 | 57 | 107 | **Dados do ensaio** (SAP; "ensaio em andamento" nasce aqui) | proposto |
| +8 | 58 | 108 | **Modo** (tipo, salvamento, gráfico, Node-RED manual/auto) | proposto |
| +9 | 59 | 109 | reserva | - |
| +10..+19 | 60-69 | 110-119 | instâncias de FB dos cards do BT (otimizado) | - |
| +20..+49 | 70-99 | 120-149 | reserva do BT | - |

Nomes (exemplos): `db052_BancoTeste2_Dse`, `db053_BancoTeste2_SnapManual`, `db054_BancoTeste2_Parametros`, `db056_BancoTeste2_Etapas`, `db106_BancoTeste1_Etapas`

## 5. Bancos de carga (6 posições x 8 DBs, DB 150-197)

| Posição | Base | Uso |
|---|---|---|
| BC1 | 150-157 | a mapear (P1) |
| BC2 | 158-165 | a mapear |
| BC3 | 166-173 | a mapear |
| BC4 | 174-181 | a mapear |
| BC5 | 182-189 | reserva |
| BC6 | 190-197 | reserva |

Gabarito interno de cada banco (offset sobre a base):

| Offset | Conteúdo | Hoje |
|---|---|---|
| +0 | **Chaves** (cb/sb/setup) = card Cargas + popup Chaves | DB55 (um para os 2 bancos) |
| +1 | status/medição do banco (aplicado kW, diferença) - a definir | - |
| +2, +3 | reserva | - |
| +4 | instância do FB `setupChaves` | DB200 (56 kW) / DB201 (400 kW) |
| +5..+7 | instâncias futuras / reserva | - |

Consequência: hoje o DB55 guarda os dois bancos (sufixos 56/400). No gabarito novo cada banco tem o seu DB de chaves com um só conjunto de arrays -> o nome do array deixa de levar "56"/"400". Isso muda a estrutura do DB55 (é a "reorganização com retrabalho" que você aceitou) - só após a janela de teste.

## 6. Lógica (FB/FC)

| Nº | Bloco | Instâncias |
|---|---|---|
| FB100 | setupChaves (hoje FB200) | 1 por banco: DB154 (BC1), DB162 (BC2), ... (offset +4) |
| FB50.. | lógica dos cards do BT (Etapas, Modo, Dados) - a desenvolver | instâncias em DB60-69 (BT2) e DB110-119 (BT1) |
| FC1.. | utilidades comuns | - |

## 7. Todos os cards, sub-módulos e popups (extraído de medidor_gerador_v1.9.38.html)

| Card (tela) | Sub-módulos | Popups | PLC (proposto) |
|---|---|---|---|
| Modo (novo) | fonte REAL/DEMO, tipo, salvamento, Node-RED, gráfico | dlgModo | BT +8 (DEMO/fonte é só da tela) |
| Etapas do ensaio | cronômetro, INICIAR/PAUSAR/ZERAR/FINALIZAR, barras de etapa, lâmpada | dlgDados (Dados do ensaio), dlgEtapa, dlgFim, dlgResalva | BT +6 e +7 |
| Gráfico | gráfico carga x tempo, exportar PNG/CSV/PDF | - | nenhum (só tela) |
| Leitura das grandezas | carga, tensão, corrente, geral (kW, água, rpm, bateria), PDF | dlgGrand, dlgMotor, dlgParam (Faixas), dlgAgua | BT +2 (DSE) e +4 (parâmetros) |
| Simulação | operador/slider/velocidade (só Demo) | - | nenhum |
| Cargas · banco | chaves, aplicado/DSE/diferença | dlgChaves | banco +0 (e +1) |
| Registro do ensaio | tabela por etapa, strip do ensaio | dlgRes (Resultado), dlgVer | BT +3 |
| Barra superior | Dados, Amostras, Servidor, Demo, versão | dlgDados, dlgReg (Amostras), dlgSrv, dlgDemo, dlgVer | nenhum (tela/Node-RED) |

Quais popups gravam no PLC além de DB52/53/55 não está confirmado nos arquivos -> marcado "proposto".

## 8. Node-RED (por card, tudo no PC BT2 .156)

- **1 aba (flow) por card**, nome `BT2 | <nn> <Card>`; abas previstas: 00 Comum/config S7, 01 DSE (Modbus->DB), 02 Modo/Seletor, 03 Etapas, 04 Dados do ensaio, 05 Registro/SNAP, 06 Parâmetros/Faixas, 07 Cargas/Chaves (um sub-fluxo por banco).
- **Um único endpoint S7 (config node) por PC**, compartilhado por todas as abas: a 1214 só tem 14 conexões S7 (8 reservadas); um endpoint por aba estouraria.
- Endereços S7 = número do DB. Na migração, vira uma tabela de/para (seção 10) aplicada em localização-substituição nos JSONs; IP do PLC (.135) e do PC (.156) ficam em **variáveis de ambiente/config node**, não espalhados em function nodes - assim BT1 usa o mesmo JSON trocando só o IP.
- Rotas HTTP existentes ficam como estão (contrato `claude/CONTRATO_HTTP_HTML_NODERED_SELECAO.md`); novas rotas por card só depois de ler os JSONs (regra 3).

## 9. Diferenças em relação à regra de 19/10

1. DB55 (Chaves) sai do BT2 e vai para a faixa do banco (os bancos servem BT1 ou BT2).
2. FB200/DB200/DB201 viram FB100 + instâncias na faixa do banco; 200+ volta a ser só livre.
3. Faixa de bancos 150-197 e faixa COMUM 1-49 (não existiam).
4. FB/FC com faixas próprias (antes: "mesmo intervalo do DB").
5. Nomes com 3 dígitos.

## 10. Migração (só depois do teste de quinta/sexta)

| Hoje | Novo (BT2) | Observação |
|---|---|---|
| DB52 db52_BancoTeste2_DSE | DB52 db052_BancoTeste2_Dse | mantém número |
| DB53 SNAP MANUAL | DB53 db053_BancoTeste2_SnapManual | mantém número |
| DB54 | DB54 | mantém |
| DB55 chaves (56+400) | DB bancos (+0 de cada banco) | estrutura muda (arrays sem sufixo) |
| FB200 | FB100 | |
| DB200 / DB201 | instâncias +4 de cada banco | |

Passos: (1) congelar; (2) testar quinta/sexta e corrigir só o que falhar; (3) criar DBs novos em paralelo (sem apagar os antigos); (4) trocar endereços nos JSONs; (5) validar em bancada; (6) remover os antigos.
Cuidado ao trocar de CPU (1515 -> 1214): reconfirmar "permitir acesso PUT/GET" na proteção da CPU, número de conexões S7 e tamanho total dos DBs vs 200 kB.

## 11. Perguntas em aberto

- P1: BC56 e BC400 são quais posições BC1..BC4? Quais ficam com BT1/BT2 hoje?
- P2: confirma que a 1214 = PLC dos Bancos de Carga (e que o PLC Ensaio Automático segue fora desta etapa)?
- P3: aprova nomes com 3 dígitos (`db052_...`)?
- P4: quer algum DB DSE genérico no COMUM, ou só DSE por BT?
- P5: a numeração de FB/FC separada da de DB (seção 2) está ok?
