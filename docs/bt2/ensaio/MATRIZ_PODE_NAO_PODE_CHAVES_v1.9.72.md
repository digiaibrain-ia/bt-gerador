# Matriz "isso pode / isso não pode" — clique em chaves (Demo local) — HTML v1.9.72

**Origem**: bug reportado em 23/10/2026 (chaves não ligavam após ensaio finalizado). Primeira matriz do método "pode / não pode" (ver skill proposta `matriz-pode-nao-pode`).
**Método**: emulador (Node-RED simulado + Playwright), HTML v1.9.72, Demo local, gerador simulado operando. Teste: `t23.js`.
**Referência do real**: no manual real o operador liga/desliga as chaves a qualquer momento; Setup só sem ensaio ativo (regra do HTML desde v1.9.62).

| Ação | Modo da Simulação | Estado do ensaio | Esperado (real) | Resultado v1.9.68–71 | Resultado v1.9.72 |
|---|---|---|---|---|---|
| Clicar chave no card principal | Manual | sem ensaio / rodando / finalizado / gravado | PODE | PODE | PODE |
| Clicar chave no card principal | Auto | sem ensaio / finalizado / gravado | PODE (operador manda) | **NÃO ligava, sem aviso (BUG)** | PODE (passa sozinho p/ Manual + aviso) |
| Clicar chave no card principal | Auto | ensaio rodando/pausado | NÃO (operador simulado manda) | NÃO, sem aviso | NÃO, **com aviso do motivo** |
| Clicar chave no card principal | qualquer | chave selecionada no Setup | NÃO | NÃO, sem aviso | NÃO, com aviso |
| Selecionar chave no Setup | Manual / Auto | sem ensaio / finalizado / gravado | PODE | PODE | PODE |
| Abrir Setup | qualquer | ensaio rodando/pausado | NÃO | NÃO (bloqueado, com aviso) | igual |
| Mexer no potenciômetro/Auto | — | chave selecionada no Setup | NÃO | apagava a chave (BUG, corrigido v1.9.69) | travado |
| STOP do gerador | — | chave selecionada no Setup | desmarcar | ficava presa (BUG, corrigido v1.9.70/71) | desmarca na hora |

## Lição aprendida (para o real)
- Nenhum comando de chave pode ser **ignorado em silêncio**: ou executa, ou mostra o motivo.
- Estado "dono do comando" (simulador Auto) não existe no real; no real vale sempre a mão do operador. O Demo deve entregar o comando ao operador quando não há ensaio ativo.
- **A validar no real**: clique nas chaves após FINALIZAR/GRAVAR em Demo+PLC e Real (caminho `CH_SRV.fonte==='nodered'` — não foi alterado nesta versão e não tem bloqueio por estado do ensaio).
