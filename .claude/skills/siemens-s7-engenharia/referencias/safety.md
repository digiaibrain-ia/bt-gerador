# Safety — Segurança Funcional (F-CPU)

> 💡 **Para times não técnicos:** "Safety" aqui é segurança funcional — a parte do
> sistema que garante que a máquina pare de forma segura para proteger pessoas
> (botão de emergência, cortina de luz, porta com intertravamento). É regulada por
> normas (SIL/PL) e roda numa CPU especial (F-CPU) com regras próprias.
>
> ⚠ **Importante:** o código de segurança deve ser concebido e validado por um
> **engenheiro de segurança qualificado**. Esta referência é um guia de arranque e
> de boas práticas, não substitui a análise de risco nem a validação formal.

## 1. Checklist inicial de Safety

```
[ ] F-CPU selecionada? (S7-315F / S7-317F / S7-1516F / S7-1518F)
[ ] F-I/O mapeados e tipo de fiação definido? (1oo1 / 1oo2 / 2oo2)
[ ] SIL / PLr calculado pelo engenheiro de segurança?
[ ] Proof test interval (T_proof) definido?
[ ] Pasta "System blocks" do F-CPU: NUNCA editar manualmente
[ ] F-FBs chamados no programa de segurança? (IDB de F-FB não chamado → STOP)
[ ] Maximum cycle time do F-runtime group calculado? (máx 20.000 ms)
[ ] Main Safety Block sem parâmetros? (obrigatório)
[ ] Outputs de F-FCs inicializados?
```

## 2. Arquitetura de troca Safety ↔ Standard

```
DB_ParaSafety   ← Standard escreve → Safety lê   (dados de permissivo)
DB_DoSafety     ← Safety escreve  → Standard lê  (estados/alarmes de segurança)

POR QUÊ separar: mudanças no programa Standard NÃO afetam o F-runtime, então a CPU
não vai a STOP de segurança quando você altera a lógica comum. A comunicação entre
os dois mundos passa exclusivamente por esses DBs de fronteira.
```

## 3. Conceitos-chave

- **F-Signature:** "impressão digital" do programa de segurança — só muda quando a
  lógica de segurança muda. O engenheiro de segurança verifica e aceita essa
  assinatura na validação; registre-a na documentação do projeto.
- **Value Status (VS):** bit que indica se o dado de um canal F é válido (1) ou se
  está usando valor substituto (0, por falha). Nomeie as tags VS com sufixo claro:
  `TagIn1VS`, `TagIn2VS`.
- **Passivação:** quando um canal F detecta falha, ele "passiva" (vai para o estado
  seguro) e precisa de *reintegração* (acknowledge) após a falha ser sanada.

## 4. Regras de ouro do código de segurança

```
1. Nunca edite os blocos automáticos do sistema F (pasta System blocks).
2. Todo F-FB instanciado precisa ser efetivamente chamado, senão a CPU vai a STOP.
3. Inicialize todos os outputs de F-FCs.
4. Mantenha o tempo de ciclo do F-runtime group dentro do máximo configurado.
5. A lógica de segurança nunca depende de dados não confiáveis do lado Standard sem
   tratar o Value Status.
6. Documente a F-Signature e obtenha aceite formal do engenheiro de segurança.
```
