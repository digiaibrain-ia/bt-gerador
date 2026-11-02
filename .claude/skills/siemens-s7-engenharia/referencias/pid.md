# PID — Controle de Processo

> 💡 **Para times não técnicos:** PID é o algoritmo que mantém uma variável de
> processo (temperatura, pressão, nível, velocidade) no valor desejado (*setpoint*).
> O "P" corrige o erro atual, o "I" elimina o erro acumulado e o "D" antecipa
> variações futuras.

**Regra absoluta:** PID **NUNCA no OB1** — use um OB cíclico (OB30..38) com período
fixo, e configure o `CYCLE`/tempo de amostragem igual a esse período. POR QUÊ: o
termo integral e o derivativo dependem de um intervalo de tempo *constante*; o OB1
tem ciclo variável e desestabiliza a malha.

## 1. Seleção do bloco

| Plataforma | Saída analógica | Válvula motorizada | PWM digital | Temperatura |
|---|---|---|---|---|
| S7-300/400 | **FB41 CONT_C** | **FB42 CONT_S** | **FB43 PULSEGEN** | FB41 + PULSEGEN |
| TIA Portal | **PID_Compact** | **PID_3Step** | PID_Compact (PWM) | **PID_Temp** |

## 2. FB41 CONT_C — S7-300/400

```scl
// Parâmetros principais (comente sempre o significado de cada um):
// COM_RST  TRUE no OB100 (reset de estado) / FALSE em operação
// MAN_ON   FALSE = automático / TRUE = manual (operador controla LMN)
// P_SEL/I_SEL/D_SEL  habilitam cada ação
// GAIN     ganho proporcional (Kp)
// TI       tempo integral [s] (maior = integrador mais lento)
// TD       tempo derivativo [s]
// PV_IN    valor de processo medido (escalado)
// SP_INT   setpoint interno
// LMN      saída de controle (0..100%)  ·  LMN_HLM/LMN_LLM limites da saída
// CYCLE    deve ser igual ao período do OB que chama o FB
```
```pascal
// Kickstart conservador para o primeiro teste:
CALL FB41, DB41
  COM_RST := TRUE     // no OB100
  CYCLE   := T#100MS  // = período exato do OB35
  SP_INT  := setpoint;  PV_IN := pvEscalada
  GAIN := 1.0;  TI := T#30S;  TD := T#0S
  LMN_HLM := 100.0;  LMN_LLM := 0.0
  LMN => saidaPid;  ER => erro
```

## 3. PID_Compact — TIA Portal (com auto-tuning)

```scl
// Versão moderna: o próprio CLP determina P, I, D automaticamente.
// Modos (State): 0=inativo 1=automático 2=manual 3=pretuning 4=finetuning
// Anti-windup e bumpless transfer (troca manual↔auto sem salto) são automáticos.
VAR pid : PID_Compact; END_VAR    // multi-instância no FB pai
#pid(Setpoint := #sp, Input := #pv, Output => #saida,
     OutputUpperLimit := 100.0, OutputLowerLimit := 0.0,
     ManualEnable := #modoManual, ManualValue := #saidaManual,
     Reset := #reset, State => #estado);
// Auto-tuning: TIA Online → Technology objects → PID → Start tuning
```

## 4. Sintonia Ziegler-Nichols (ponto de partida)

```
1. Desabilite I e D (apenas P).
2. Aumente Kp até a malha oscilar com amplitude constante → esse Kp = Ku (ganho crítico).
3. Meça o período da oscilação Tu [s].
   PI : Kp = 0.45×Ku   Ti = 0.83×Tu
   PID: Kp = 0.60×Ku   Ti = 0.50×Tu   Td = 0.12×Tu
```
> É só um ponto de partida — refine observando a resposta real do processo.
> Para processos lentos com tempo morto, Cohen-Coon costuma dar melhor resultado.

## 5. PID em cascata

```scl
// POR QUÊ cascata: dois laços aninhados. Ex.: temperatura de um reator (laço
// externo) que ajusta a vazão do refrigerante (laço interno).
// A SAÍDA do PID mestre é o SETPOINT do PID escravo.
pidEscravo_SP := pidMestre_LMN;
```
