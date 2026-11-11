# Alinhamento do projeto × texto oficial ISO 8528 / ISO 3046 · v0.1 · 11/11/2026

**Escopo:** conferir os critérios de aprovação e o relatório do medidor (`medidor_gerador_v1.10.134.html`, `avaliaEnsaio()` / `gerarPdf()`) contra o **texto oficial** das normas que estão na pasta *ISO* do Google Drive.
**Status:** análise. **Nenhum código foi alterado.** Complementa `CRITERIOS_APROVACAO_ENSAIO_vs_ISO8528_v0.1.md`, que só tinha fontes secundárias (fabricantes).

## Normas efetivamente lidas

| Arquivo (Drive/ISO) | Edição | Leitura |
|---|---|---|
| ABNT NBR ISO 8528-5 | 2014/2015 (PT-BR) | Completa. **Tabela 4** (classes G1–G4) |
| ISO 8528-6 | 2005 | Completa (métodos de ensaio) |
| ISO 3046-1 | 2002 | Trecho de potências/sobrecarga (3.3.5) |
| ISO 8528-3 | 2020 | Só confirmado que o texto é legível; não analisada |
| ISO 8528-1 (2018) | 2018 | **Ilegível**: PDF é imagem, sem camada de texto (precisa OCR) |
| 8528-2, 4, 7, 8, 9, 10, 12, 13 | vários | **Não lidas** nesta rodada |

## 1. O que a norma confirma

**Tensão ±2,5 % = classe G2.** ISO 8528-5, Tabela 4, "Desvio de tensão em regime constante δUst": G1 ≤ ±5 %, **G2 ≤ ±2,5 %**, G3 ≤ ±1 %. Confere com `TENS_TOL = 2.5`.

**Sobrecarga de 110 %.** ISO 3046-1, 3.3.5: *"Unless otherwise stated, an overload power of 110 % of the continuous power … is permitted for a period of 1 h, with or without interruptions, within 12 h of operation."* É a origem do teto de 110 % usado como limite de segurança no Manual guiado/Escalonador (antes "provisório"). **Agora tem fonte normativa.** Observação: a norma fala em 110 % da potência *contínua* por no máx. 1 h a cada 12 h; o ensaio de 107 % está dentro dessa margem.

**Relatório.** ISO 8528-6 (5.5 e 6.8) exige no mínimo: classe de desempenho, cliente/pedido, fabricante, nº de série de motor/gerador/quadro, dados declarados **e medidos** (potência, tensão, frequência, corrente, fator de potência, rotação), condições ambientais (altitude, pressão barométrica, temperatura, umidade, temperatura do ar de admissão e do líquido de arrefecimento) e combustível (tipo, densidade, PCI).

## 2. O que a norma NÃO sustenta (critério interno da fábrica)

| Critério do projeto | Situação |
|---|---|
| **≥ 5 min em 100 %** (`T100_MIN = 300`) | Não está nas partes lidas. ISO 8528-6, 6.7.3: duração do ensaio de carga "geralmente entre 0,5 h e 2 h, normalmente especificada pelo fabricante". Logo, 5 min é **critério interno**, não da ISO. |
| **Stand-by mínimo 107 %** (`STBY_MIN = 107`) | Não consta na norma. O 110 % existe (ver acima); o **107 % é interno**. |
| **Frequência ±5 %** (`FREQ_TOL = 5`) | Não corresponde ao critério de regime constante (ver item 3). |

## 3. Frequência: o 5 % provavelmente vem de outro parâmetro

Tabela 4 (ISO 8528-5), classes G1 / G2 / G3:

| Parâmetro | G1 | G2 | G3 |
|---|---|---|---|
| **Queda de frequência δfst** (vazio → carga nominal) | ≤ 8 % | **≤ 5 %** | ≤ 3 % |
| **Faixa de frequência em regime constante βf** | ≤ 2,5 % | ≤ 1,5 % | ≤ 0,5 % |

- O doc anterior comparava os 5 % com βf e concluía "não bate". Pela norma, **5 % = queda de frequência δfst da classe G2**, coerente com a tensão em G2. Hipótese forte de que o critério do relatório mistura G2: tensão ±2,5 % + frequência 5 %.
- **Mas δfst é a queda entre vazio e carga nominal**, não um "desvio máximo acima/abaixo do nominal" por etapa. O código hoje verifica `fmax ≤ nominal·1,05` e `fmin ≥ nominal·0,95` em cada etapa, o que é **muito mais frouxo** que o critério de regime constante da própria G2 (βf ≤ 1,5 %).
- O critério de regime constante βf é uma **faixa** (largura da oscilação) em torno da frequência estável, medida entre 20 % e 100 % da potência (definição na própria Parte 5), não um ± sobre 60 Hz.

## 4. Ensaio: pontos de carga e exatidão (ISO 8528-6)

- **Pontos de carga (6.7.4.1):** vazio, **25, 50, 75, 100 %**. O projeto usa **0, 30, 50, 100, 107, 0 %**. A norma diz que o ensaio de carga é "sujeito a acordo entre fabricante e cliente", então a sequência do projeto é permitida se acordada, mas **não é a sequência da ISO** (30 em vez de 25; sem 75 %).
- **Fator de potência:** ensaio normalmente com FP unitário *ou* o FP nominal, por acordo (banco resistivo = unitário). Convém constar no relatório.
- **Exatidão mínima dos instrumentos (fábrica, 5.4):** corrente, tensão, potência ativa/reativa **1,5 %**; fator de potência 3 %; **frequência 0,5 %**. No local de instalação (Tab. 2): 2,5 % / 5 % / 1 %. Verificar se a leitura do DSE e a cadeia Modbus atendem, principalmente porque a tolerância de tensão (2,5 %) é pouco maior que a exatidão exigida (1,5 %).
- **Aquecimento:** ensaio com o grupo já na temperatura de operação (5.3 e 6.7.2). Hoje não há verificação de "grupo aquecido" antes de contar o 100 %.
- **Transitórios:** 6.6.3.9 (grupo MH) pede oscilografia de tensão/corrente/frequência em aplicação e retirada de carga. A Tabela 4 define limites transitórios (ex.: G2, retirada de 100 %: +12 % de frequência, +25 % de tensão; recuperação ≤ 5 s freq. e ≤ 6 s tensão). O medidor **não avalia transitório** hoje.

## 5. Lacunas do relatório × exigência da ISO 8528-6

Campos exigidos que não aparecem em `DADOS` (`serie, versao, equip[], fase, freq, tensao, tamb, pot, data`): **classe de desempenho (G1/G2/G3)**, cliente/pedido, nº de série individual de motor/gerador, altitude, pressão barométrica, umidade, combustível, FP, e valores **medidos** de corrente, FP e rotação.

## 6. Propostas (nenhuma aplicada; aguardam decisão)

1. **Campo "Classe de desempenho"** (G1/G2/G3) em *Dados do ensaio*, que preenche o relatório e sugere `TENS_TOL` (5 / 2,5 / 1 %). Baixo risco.
2. **Frequência:** decidir entre (a) manter ±5 % como critério interno e rotulá-lo assim no relatório, (b) passar a avaliar βf por classe (≤ 2,5 / 1,5 / 0,5 %) ou (c) avaliar a queda δfst (vazio → 100 %) ≤ 8 / 5 / 3 %. Recomendo (c)+(b) com a classe escolhida, mantendo o ±5 % só se a engenharia confirmar.
3. **Rotular a origem** de cada linha em "Valores de Referência": "ISO 8528-5 G2", "ISO 3046-1", "Critério interno" (5 min e 107 %). Hoje o cabeçalho diz "ISO8528 e ISO3046" para tudo, o que sugere que 5 min e 107 % são da norma.
4. **Campos ambientais e de combustível** no relatório (altitude, pressão, umidade, combustível).
5. **Conversão de potência às condições de referência** (ISO 8528-1/3046-1) se o ambiente do ensaio diferir; precisa da Parte 1 (OCR) para os fatores.

## 7. Pendências

- **OCR da ISO 8528-1:2018** (definição das classes de potência ESP/PRP/LTP/COP, condições de referência, requisitos de sobrecarga). Alternativa: o usuário enviar versão com texto.
- Leitura das Partes **4** (quadros: proteções/CB), **12** (serviços de segurança) e **13** (segurança), potencialmente úteis para `PROTECAO_COMANDOS_PERSISTENTES_CB.md`.
- Confirmar com a engenharia: classe exigida, origem do 5 % de frequência, do 5 min e do 107 %, e o significado de "DPP" (item 4 do doc anterior).
- Edição citada: a Parte 5 lida é a **2014/2015**; a Parte 1 do Drive é **2018**. Confirmar qual edição a fábrica adota.
