# Contexto para continuar — Projeto Bancada de Testes (BT2)

> Atualizado em 21/10/2026. Cole este arquivo no início da nova conversa
> junto com o arquivo HTML mais recente. Substitui a versão de 12/10/2026.

---

## 1. Quem é o usuário e como trabalhar

- Nome do autor: **Reginaldo Lobo** (usar em cabeçalhos SCL, docs, atribuição)
- Fala português (PT-BR). **Não programa**: explicações simples, diretas, sem jargão.
- Trabalha com automação industrial (Siemens S7-1200/S7-1500, TIA Portal, Node-RED, DSE, DEIF AGC-150).
- Público-alvo da tela: **operadores 35+, ambiente industrial** — visual sóbrio, letras legíveis, sem animações.
- Notebook 15": viewport real ≈ **1536×694 px** (1080p, Windows 125 %).
- Prefere que o assistente **implemente e teste** em vez de só propor.
- Mensagens costumam vir de **ditado por voz** (frases cortadas): interpretar com bom senso.
- **Regra de entrega de arquivos**: ao salvar/entregar, acrescentar a versão no nome (`medidor_gerador_v1.9.51.html`). Nunca sobrescrever a versão anterior — sempre novo arquivo com número incrementado.

---

## 2. Arquitetura geral do projeto

```
DSE 4520 (junto ao gerador)
  └── Modbus TCP
        └── Node-RED (PC BT2, IP 172.17.210.156, porta 1880)
              ├── /api/gerador  →  HTML medidor (leitura ao vivo)
              ├── Fluxo S7 "cliente 31"  →  DB52 no PLC (escrita contínua DSE)
              └── Rotas de API para chaves/seleção  →  PLC dos BC (DB150+)

PLC dos Bancos de Carga (hoje: S7-1515 provisória; produção: S7-1214FC)
  IP: 172.17.209.135, rack 0, slot 1
  DBs não-otimizados (S7_Optimized_Access := FALSE) para acesso S7 contrib
  Contem: DB52 (DSE BT2), DB53 (SNAP MANUAL), DB150 (Chaves BC56)

ET200SP (CPU IM151-8 PN/DP, IP 172.17.209.158)
  — contém a parte elétrica (chaves físicas/contatoras) dos bancos de carga
  — já na mesma rede PROFINET que o 1515, cabo físico puxado
  — sem blocos próprios ainda; vai receber os bits CB do DB do 1515
```

**Escopo atual (outubro/2026): somente BT2.** BT1 segue o mesmo padrão (+50 no offset dos DBs), mas não está em desenvolvimento.

---

## 3. Arquivo HTML — medidor do gerador

### Versão atual
`medidor_gerador_v1.9.51.html` — entregue em 21/10/2026.
Localização no servidor: `/home/claude/sap-ocr/medidor_gerador_v1.9.51.html`
Servido pelo Node-RED via `httpStatic` → `C:\Users\b02raf\.node-red\public`

### Histórico recente
| Versão | Data | O que mudou |
|---|---|---|
| v1.9.50 | 20/10/2026 | Setup das chaves: baseline kW sem carga, calibração individual por chave, tiles visuais, persistência em localStorage (KWR), popup Habilitar/Desabilitar atualizado com kW real medido |
| v1.9.51 | 21/10/2026 | Popup Chaves: kW real (verde) aparece ANTES do kW nominal; texto do rodapé corrigido (removido "DB55 a definir") |

### Convenções de versão no código
```js
// ~linha 2213 do HTML:
const VERSAO='1.9.51', VERSAO_DATA='21/10/2026';
// <head>:
<meta name="app-version" content="1.9.51">
// Array HISTORICO: item no topo a cada versão
```

### Estrutura da tela
Barra preta (título + pills + botões) → barra do gerador (estado, LEDs DSE, API/demo) → 3 colunas:
1. **Etapas do ensaio** (cronômetro, INICIAR/PAUSAR/ZERAR, SALVAR, FINALIZAR) + **Gráfico**
2. **Leitura das grandezas** (barra de carga, tensões, correntes, kW/Água/RPM/Bateria)
3. **Cargas · banco de carga** (card Setup + Habilitar/Desabilitar) + **Registro do ensaio**

### Card Setup das chaves (card 1 = Habilitar/Desabilitar, card 2 = grade de tiles Setup)
- **`rowChave(q, kw, i)`**: gera linha na lista do popup Habilitar/Desabilitar (checkbox + nome + kW real verde antes do kW nominal)
- **`tile(q, kw, extra, inner)`**: gera tile da grade do Setup (card 2), diferente do rowChave
- **`KWR[q]`**: `{kw, ohm, ohmTeo, data}` — calibração salva do Setup (localStorage)
- **`SEL`**: índice da chave selecionada no Setup (null = nenhuma)
- **`DIS[]`**: array de booleanos — true = chave desabilitada pelo operador
- **`BASE_OK`**: true quando baseline "kW sem carga" foi medido
- **`chPlcAtivo()`**: true se `CH_SRV.fonte==='nodered'` e banco ativo `id==='56'`

### API `/api/gerador` (Node-RED)
Campos usados na tela: `percCarga, kw, tensaoL1L2/L2L3/L3L1, correnteL1/2/3, tempAguaC, rpm, bateria`
Estado: `modo, leds{stop,manual,teste,auto,disjuntorGerador,geradorDisponivel}, saidaCombustivel, saidaPartida, dse.modeloConfigurado, ok, idadeSegundos`
**Não existe campo `bancos`** na API → no ensaio real o card Cargas mostra "banco acionado manualmente".

### Variáveis e funções-chave
`T` (cronômetro: run, started, et, el, estavel, fim, parcial, aguarda, aguardaFim, gravado)
`ETAPAS, SNAP[i], C, MED, FAIXAS.tempAguaC, DADOS, MODO (iso|livre|carga), LIB, TOL, salvarManual`
`passo/passoUnit, desenha, drawTabela, drawChart, render, aplicaAlarmes, gravaEtapa, avancaEtapa`
`finalizaManual, abreEtapa/abreDados/abreResultado/abreGrand/abreParametros, aplicaParametros, avaliaEnsaio, gerarPdf`
`demoData/demoExtras, rowChave, tile, renderSetup, renderHabilitar`

### Validação JS (como testar)
```bash
node -e "
const fs=require('fs'), src=fs.readFileSync('medidor_gerador_v1.9.51.html','utf8');
const re=/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
let m, erros=0;
while((m=re.exec(src))!==null){
  try{new Function(m[1]);}catch(e){console.error('ERRO bloco:', e.message); erros++;}
}
console.log('Blocos ok, erros:', erros);
"
```

---

## 4. PLC dos Bancos de Carga — estado atual

### CPU
- **Hoje (provisória):** S7-1515 2PN, IP 172.17.209.135
- **Produção (futura):** S7-1214FC (ainda não comprada)
- DB não-otimizados para S7 contrib; requer "Permitir acesso PUT/GET" na CPU

### DBs existentes (não alterar até depois do teste a quente 22-23/10/2026)
| DB | Nome atual | Conteúdo |
|---|---|---|
| DB52 | db52_BancoTeste2_DSE | Grandezas DSE, escrito continuamente pelo Node-RED |
| DB53 | SNAP MANUAL BT2 | Registro do ensaio (dados do SAP + etapas) |
| DB150 | Chaves BC56 | Chaves do Banco de 56 kW (13 chaves); acesso via Node-RED S7 contrib |

### Plano de numeração aprovado (v2, 20/10/2026)
**Regra geral:** `DB card BT = Base_BT + offset` (BT2 base=50, BT1 base=100)

| Offset | BT2 | BT1 | Conteúdo |
|---|---|---|---|
| +0,+1 | 50,51 | 100,101 | reserva |
| +2 | **52** | 102 | DSE (SB_DSE) |
| +3 | **53** | 103 | SNAP MANUAL / Registro |
| +4 | 54 | 104 | Parâmetros / Faixas |
| +5 | 55 | 105 | reserva (antigo DB55 Chaves migrou para banco) |
| +6 | 56 | 106 | Etapas do ensaio |
| +7 | 57 | 107 | Dados do ensaio (preenchimento SAP) |
| +8 | 58 | 108 | Modo (tipo, salvamento, gráfico) |
| +9 | 59 | 109 | reserva |
| +10..+19 | 60-69 | 110-119 | Instâncias de FB dos cards |
| +20..+49 | 70-99 | 120-149 | reserva do BT |

**Bancos de carga (DB 150-197, 6 posições × 8 DBs):**
| Posição | Base | Banco |
|---|---|---|
| k=1 | 150 | **BC56** (13 chaves: 5×5 kW + 7×4 kW + 1×3 kW) |
| k=2 | 158 | **BC400** (13 chaves: 7×50 kW + 4×10 kW + 2×5 kW) |
| k=3..6 | 166,174,182,190 | reserva |

Offset interno de cada banco: `+0` = Chaves (cb/sb/setup), `+1` = status/medição, `+2,+3` = reserva, `+4` = instância FB setupChaves

**FB/FC:**
| Faixa | Uso |
|---|---|
| 1-49 | comum (utilidades, mapeamento I/O) |
| 50-99 | lógica dos cards do BT (1 FB → 2 instâncias: BT1 e BT2) |
| 100-149 | lógica do banco de carga (FB100 = setupChaves; instâncias em base+4) |
| 200+ | livre / testes |

**Nomes com 3 dígitos:** `db052_BancoTeste2_Dse`, `db053_BancoTeste2_SnapManual`, `db150_BC56_Chaves`

**Atenção:** a migração (renomeação e reorganização) está **congelada até depois do teste a quente (22-23/10/2026).**

### ET200SP — próximo passo pendente
- Receber os 13 bits CB (liga/desliga) das chaves do BC56 vindos do DB150 no 1515
- Projeto TIA da ET200SP ainda sem blocos próprios
- Documento de referência: `claude/PASSO_A_PASSO_PUT_1515_ET200SP_BC56.md`

---

## 5. Node-RED — estado atual

- **PC:** 172.17.210.156, porta 1880. Usuário Windows: `b02raf`. Node-RED não é serviço — processo manual.
- **Fluxo DSE → /api/gerador v3.1** (Modbus → REST): em produção.
- **Fluxo S7 "cliente 31"** (Node-RED → DB52 PLC): em produção, escrita contínua.
- **Rotas HTTP para chaves (DB150/BC56):** em produção — ver `claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md`
- **Rotas HTTP para seleção:** ver `claude/CONTRATO_HTTP_HTML_NODERED_SELECAO.md`

**Abas (flows) planejadas (não criadas):**
`00 Comum/config S7` · `01 DSE` · `02 Modo/Seletor` · `03 Etapas` · `04 Dados do ensaio` · `05 Registro/SNAP` · `06 Parâmetros/Faixas` · `07 Cargas/Chaves`

**Regra:** 1 único endpoint S7 (config node) por PC — a 1214 só tem 14 conexões S7 (8 reservadas).

---

## 6. Janela de teste a quente

**Quinta e sexta (22-23/10/2026):** teste real ligado no PLC, atuando nos dois bancos de carga (BC56 e BC400). Tudo congelado até lá — nenhuma refatoração ou renumeração antes do teste.

---

## 7. Pendências em aberto

1. **ET200SP:** criar os blocos TIA e rotear os 13 bits CB do DB150 (1515) para as contatoras da ET200SP.
2. **Teste a quente (22-23/10):** validar o fluxo completo HTML → Node-RED → DB150 → PLC → ET200SP → chaves físicas.
3. **Após teste:** migração da numeração de DBs (renomear DB55→DB150, FB200→FB100, etc.) conforme plano v2.
4. **Confirmar limites reais da água** (atenção/crítico): padrão provisório 85/95 °C.
5. **Confirmar `CMD_URL`** (START/STOP do gerador via Node-RED) — hoje vazio, só funciona no demo.
6. **Perguntas em aberto do plano de numeração (v2):** P1 (quais posições BC1..BC4?), P4 (DB DSE genérico no COMUM?).

---

## 8. Docs de referência no projeto

| Arquivo | Conteúdo |
|---|---|
| `claude/PLANO_NUMERACAO_BLOCOS_PLC.md` | Plano v2 completo de numeração de DBs/FB/FC |
| `claude/PASSO_A_PASSO_PUT_1515_ET200SP_BC56.md` | Como enviar os bits CB da 1515 para a ET200SP |
| `claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md` | API REST das chaves (rotas, payloads, respostas) |
| `claude/CONTRATO_HTTP_HTML_NODERED_SELECAO.md` | API REST de seleção de chave no Setup |
| `claude/ARQUITETURA_FONTE_DADOS_LOCALSTORAGE_PLC.md` | Regras de fonte de dados (localStorage vs PLC) |
| `claude/REGRA_NUMERACAO_DB_BT2.md` | Regra original de 19/10 (v1 do plano) |
| `claude/REGISTRO_FLOW_CHAVES_BC56_DB150.md` | Fluxo Node-RED das chaves do BC56 |
| `claude/ARQUITETURA_DADOS_ENSAIO_PLC.md` | Arquitetura do DB Snap e dados do ensaio |
| `claude/AUDITORIA_TECNICA_IHM_BT2_v1928.md` | Auditoria técnica da IHM (v1.9.28) |
| `claude/REGRAS_ENSAIO_MANUAL_BT2.md` | Regras do ensaio manual |
