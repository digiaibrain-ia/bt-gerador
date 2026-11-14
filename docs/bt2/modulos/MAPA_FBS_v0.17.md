# MAPA_FBS v0.17 — iluminação (14/11/2026) · medidor 1.10.207

**Pedido (Reginaldo):** "a iluminação da animação dos FB não está legal" · escolhas: pulso no cartão quando o bloco age + cores mais fortes e distintas.
**Causa:** o cartão só era pintado pelo estado atual (ocioso, ok, contando, falha), com preenchimento muito claro; nada mostrava QUANDO o bloco agiu.

## O que mudou (gerador: `dashboard/gerador/gerar_mapa_fbs_v0.17_v0.1.py`, de v0.16)
- **Pulso:** a cada foto nova dos FBs o mapa compara estado, entradas e saídas de cada filho (e da mãe) com a foto anterior. Se mudou, o cartão ganha um halo âmbar de cerca de 1,2 s atrás do cartão (não muda tamanho nem posição).
- **O que NÃO conta como "agiu":** ruído de medição (variação menor que o maior entre 0,5 e 1 %), os contadores de tempo do filho 7, a primeira foto e a volta depois de "sem sinal".
- **Estados:** preenchimento mais forte e diferente (claro e escuro) + símbolo de forma: ■ ocioso, ✔ ok, ▶ contando, ▲ falha.
- **"Reduzir movimento"** ligado no aparelho: sem animação, anel fixo por cerca de 1,2 s.
- **Exportação** (PDF/PNG/SVG): não leva o halo. Legenda curta: "■ ocioso ✔ ok ▶ contando ▲ falha · âmbar: agiu agora".
- Dados, pinos, fios e Ajuda: iguais à v0.16. Nenhum rótulo novo nos cartões.

## Medidor 1.10.207 (gerador: `gerar_medidor_v1.10.207_v0.1.py`, de 1.10.206)
A cópia do mapa **embutida** no medidor (`window.EMB.mapa`) estava na **v0.14**. Ela é a que abre primeiro e, no PC de operação, a única (o pacote não leva o mapa na pasta de operação). Agora é a v0.17, e traz junto o ícone ⓘ com área de toque maior e a Ajuda nova (v0.15/v0.16).

## Testes
- `node tests/e2e/mapa_fbs_pulso.js` (54): pulso só no bloco que mudou; ruído, relógio e contadores não pulsam; volta de "sem sinal" não pulsa; layout idêntico durante e depois do pulso; halo some em ~1,5 s; "reduzir movimento"; cores distintas e contraste ≥ 4,5; símbolos; desktop claro, celular escuro e movimento reduzido. Contra a v0.16 o teste falha.
- `node tests/e2e/mapa_fbs_no_medidor.js` (20): abre o mapa embutido no medidor em DEMO real, confere que é a versão mais nova da pasta (guarda LL-059), parado não pulsa, ao armar e iniciar o ensaio pulsam só os blocos que agem.

## Limites
- No roteiro de teste a mãe para em SEM_CARGA (o gerador virtual não é ligado): a mãe em EXECUTANDO (sugestão e rodízio em ação) não foi exercitada de ponta a ponta.
- Se a iluminação "ficou legal" é julgamento visual do Reginaldo; ajustes viram a v0.18.
