# Roteiro para o programador do PLC de cargas: troca de sinais com o 1515

**Data:** 07/11/2026 · **Uso:** explicar ao programador o que precisa ser feito hoje.
**Atenção:** nomes de DB/FB e a numeração foram reorganizados depois da última documentação do repositório. Os números abaixo estão marcados como **a confirmar**. Antes de qualquer alteração, conferir com a sessão que orquestra o projeto.

---

## 1. Contexto em 5 linhas

1. O **1515** (ensaio, IP 172.17.209.135) decide o que ligar e manda o comando das chaves.
2. O **PLC de cargas** recebe esse comando, aciona as contatoras e devolve o feedback real dos contatos auxiliares.
3. A troca é feita por **PUT/GET** (comunicação S7), feita pelo 1515 a cada ~200 ms.
4. Cada lado tem um **contador de vida** que muda o tempo todo. Se o contador de um lado para de mudar, o outro lado sabe que a comunicação caiu.
5. Quando a comunicação cai, o PLC de cargas **desliga as saídas sozinho**. Essa é a principal responsabilidade do seu lado.

---

## 2. Conceitos que o programador precisa ter

| Termo | Significado no projeto |
|---|---|
| **DB não otimizado** | `S7_Optimized_Access := 'FALSE'`. Offset fixo, obrigatório para PUT/GET e para o Node-RED. |
| **PUT / GET** | PUT escreve no DB do outro PLC. GET lê do DB do outro PLC. Ambos são iniciados pelo 1515. |
| **TSAP / rack-slot** | Endereço da CPU na conexão S7. Confirmar na configuração de hardware, não chutar. |
| **Vida (contador)** | Inteiro que sobe a cada envio. Se parar de mudar, a comunicação caiu. |
| **Escritor único** | Cada campo do DB é escrito por um só lado. Quebrar isso causa "pisca-pisca". |
| **cmd / fbk** | `cmd` = comando que vem do 1515. `fbk` = contato auxiliar real de cada contatora, que volta para o 1515. |

---

## 3. Layout do DB de troca (lado de cargas)

Base: DB de troca de 12 bytes, não otimizado. **Confirmar o número e o nome do DB com a sessão orquestradora.**

| Byte / bit | Campo | Quem escreve | Sentido |
|---|---|---|---|
| DBX0.0 a DBX1.7 | `cmd[1..16]`: comando de cada chave (bit n-1 = chave n) | 1515 (PUT) | 1515 → cargas |
| DBW2 | `vida1515`: contador de vida do 1515 | 1515 (PUT) | 1515 → cargas |
| DBX4.0 | `ligarBanco`: comando "Ligar banco" | 1515 (PUT) | 1515 → cargas |
| DBX6.0 a DBX7.7 | `fbk[1..16]`: contato auxiliar de cada contatora | cargas | cargas → 1515 |
| DBW8 | `vidaET`: contador de vida do PLC de cargas | cargas | cargas → 1515 |
| DBX10.0 | `seletoraAuto`: seletora do banco em Auto (1 = Auto) | cargas | cargas → 1515 |

Exemplos: chave 1 = `DBX0.0`; chave 9 = `DBX1.0`.

---

## 4. O que o PLC de cargas precisa fazer

### 4.1 Contador de vida (lado de cargas)
- Incrementar `vidaET` a cada ciclo (ou a cada 100 ms), sempre.
- Voltar a zero ao passar do limite (ex.: 32767).

### 4.2 Detectar perda de comunicação
- Se `vida1515` **não mudar por 2 s**, a comunicação caiu.
- O tempo de 2 s é menor que o do 1515 (3 s) de propósito: o PLC de cargas desliga antes do 1515 achar que o feedback está válido.
- **Sugestão, a confirmar:** exigir que `cmd[n]` vá a FALSE e depois TRUE de novo para religar. Assim nada religa sozinho quando a comunicação volta.

### 4.3 Saída das contatoras
- Saída da chave n = `cmd[n]` **E** comunicação ok **E** intertravamento local (emergência, etc.).
- Se a comunicação cair, a saída vai a FALSE mesmo que `cmd[n]` ainda esteja TRUE.

### 4.4 Feedback
- `fbk[n]` = contato auxiliar **real** da contatora n (entrada física).
- **Nunca** copiar `cmd[n]` para `fbk[n]`. Se fizer isso, o 1515 nunca percebe uma falha de contator.

### 4.5 Bit de estado para o programa
- Criar um bit "comunicação ok" para o restante do programa do PLC de cargas.
- Esse bit é a base para outras ações na perda de comunicação (ex.: sinalizar, registrar, bloquear). **O que fazer além de desligar é decisão a tomar, não está definido.**

---

## 5. Configuração no TIA Portal

1. **CPU de cargas:** habilitar "Permitir acesso com comunicação PUT/GET de parceiro remoto" (propriedades da CPU → proteção e segurança → mecanismos de conexão).
2. **DB de troca:** não otimizado. Os offsets são fixos e não podem ser reordenados.
3. **Conexão S7 (lado de cargas):** o parceiro é o 1515. Anotar o ID local da conexão. O TSAP e o rack-slot são **a confirmar** na configuração de hardware.
4. **Ordem de carga:** (a) snapshot dos valores atuais; (b) importar o DB; (c) importar o FB; (d) colar as chamadas; (e) compilar e carregar; (f) conferir no monitor.

---

## 6. Ordem sugerida para explicar hoje

1. Mostrar o diagrama da seção 1 (dois PLCs, um comando, um feedback).
2. Explicar o DB de troca (seção 3) com um exemplo: "apertar chave 1 = `DBX0.0` vai a TRUE no 1515 → chega no DB de cargas → contatora 1 liga → `fbk[1]` volta TRUE".
3. Explicar o contador de vida e o timeout (seção 4.1 e 4.2).
4. Explicar por que `fbk` não pode ser cópia de `cmd` (seção 4.4).
5. Montar um FB com a lógica da seção 4 e testar com o cabo desligado.
6. Teste de bancada: parar a comunicação e ver as saídas caírem.

---

## 7. Teste mínimo antes de considerar pronto

| Teste | Esperado |
|---|---|
| Comando de uma chave | Contatora liga e `fbk` volta TRUE em menos de 1 s |
| Desligar cabo de rede | Em ~2 s, saídas das contatoras vão a FALSE |
| Religar cabo | Saídas **não** religam sozinhas. Precisa de novo comando |
| Parar a CPU do 1515 | Mesmo resultado do cabo |
| Chave com `cmd` TRUE e `fbk` sem resposta | Diagnóstico visível (a definir) |

---

## 8. Perguntas para fechar com o programador e com a sessão orquestradora

1. Qual é o modelo e o firmware da CPU de cargas? (Sem isso, não dá para confirmar `PEEK`/`POKE` com DB dinâmico.)
2. Qual é o número e o nome final do DB de troca e do FB de cargas, pela numeração nova?
3. TSAP / rack-slot da CPU de cargas.
4. O PLC de cargas é a 1214FC ou o ET200 (IM151-8, programa "Gerador_BC015")? Os docs se contradizem.
5. Exigir religamento manual (`cmd` FALSE → TRUE) após perda de comunicação: confirmar.
6. Além de desligar, o que o PLC de cargas faz na perda de comunicação? (Só desligar, sinalizar, registrar?)
7. O espelho completo do DB de chaves cabe em 212 bytes, ou precisa de mais de uma passada?
