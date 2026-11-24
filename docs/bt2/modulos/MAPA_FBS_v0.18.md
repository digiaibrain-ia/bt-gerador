# MAPA_FBS v0.18 — auréola no bloco ativo (14/11/2026) · medidor 1.10.208

**Pedido (Reginaldo), sobre a v0.17:** o contorno âmbar "não ficou legal" e "pisca". Ele pediu uma **auréola de fundo**, como a iluminação do card Modo quando ativo, que vai e volta **sem zerar** (algo como 40 % a 90 %).
**Causa do pisca:** o anel acendia e apagava de uma vez (opacidade de 1 para 0 em 1,2 s) e, como o mapa **recria o desenho a cada foto**, qualquer animação reiniciava.

## O que mudou (gerador: `dashboard/gerador/gerar_mapa_fbs_v0.18_v0.1.py`, de v0.16; a v0.17 fica no repositório, substituída)
- **Auréola:** o bloco em estado **ATIVO** ("contando") ganha uma auréola azul, desfocada, **atrás** do cartão, que respira entre **40 % e 90 %** de opacidade (ida e volta suave, ciclo de 3,6 s) e **nunca apaga** enquanto o bloco está ativo. Vale também para a mãe (bloco 9).
- **Sem salto:** a fase da respiração vem do **relógio** (atraso de animação negativo calculado na hora do desenho), então recriar o desenho não reinicia a animação.
- **Desfoque por filtro SVG** (`feGaussianBlur`), não por CSS `filter`: funciona também no Safari/iOS.
- **Mantido da v0.17:** cores dos estados mais fortes (claro e escuro), símbolo de forma ■ ✔ ▶ ▲, legenda curta ("brilho: bloco ativo"), a auréola não vai na exportação (PDF/PNG/SVG). "Reduzir movimento": auréola fixa em 70 %.
- **Saiu:** o anel/pulso "agiu agora" da v0.17 (a detecção de mudança entre fotos foi removida).

## Medidor 1.10.208 (gerador: `gerar_medidor_v1.10.208_v0.1.py`, de 1.10.207)
Só troca a cópia **embutida** do mapa (`window.EMB.mapa`) da v0.17 para a v0.18.

## Testes
- `node tests/e2e/mapa_fbs_aura.js` (46): só o bloco ATIVO tem auréola (ocioso, ok e falha não); a mãe ativa também; layout idêntico com e sem auréola; filtro SVG e auréola atrás do cartão; **respiração medida por ~4,6 s com o desenho recriado a cada 400 ms: mínimo 0,40, máximo 0,90, maior degrau 0,05, presente em todas as amostras**; "reduzir movimento"; cores distintas, contraste ≥ 4,5, símbolos, legenda; desktop claro, celular escuro e movimento reduzido. Contra uma cópia sem a fase do relógio o teste falha (a auréola fica presa perto de 0,40).
- `node tests/e2e/mapa_fbs_no_medidor.js` (24): mapa embutido no medidor em DEMO real: é a versão mais nova da pasta (guarda LL-059); parado nada brilha; ao armar e iniciar o ensaio a auréola está **exatamente** nos blocos que a foto dos FBs marca como ativos (conferido contra os dados), permanece e respira entre 0,40 e 0,90.
- Regressão do Dados do ensaio por NS na 1.10.208: 84 verificações.

## Limites
- No roteiro de teste a mãe para em SEM_CARGA (o gerador virtual não é ligado): ficam ativos os blocos 6 e 7 (e a mãe nas fotos simuladas). A mãe em EXECUTANDO com sugestão e rodízio em ação não foi exercitada de ponta a ponta.
- Se a iluminação "ficou legal" é julgamento visual do Reginaldo; ajustes viram a v0.19.
- A exportação sem auréola foi implementada, mas a exportação em si não foi testada.
