# Senha de testes "mwm": o que ela e e o que ela NAO e

**Decisao (D2, aprovada):** a senha `mwm` e uma **trava de UX** contra clique por engano na interface do operador.
**Ela NAO e seguranca.** Como o medidor e um HTML que roda no navegador, a senha esta no codigo da pagina e qualquer pessoa com acesso a pagina consegue le-la.

## O que ela protege
- O botao **Demo** (simulacao local, sem PLC) e as ferramentas de desenvolvedor so aparecem depois de digitar a senha.
- Evita que um operador entre em modo de simulacao por acidente durante um ensaio real.

## O que ela NAO protege
- Comandos ao PLC: as rotas de escrita do Node-RED nao dependem da senha. A protecao de escrita e outra camada (verificacao de origem e de tipo de conteudo, e login do Node-RED no PC, a validar com a TI).
- Acesso ao PLC ou ao DSE pela rede.

## Onde esta
- Campo "senha" ao lado da barra superior (somente para desbloquear o Demo).
- No codigo: duas comparacoes com a palavra em minusculo (`desbloqueiaTestes`).

## Regra
Nao colocar nenhum segredo de verdade no HTML. Se algum dia for preciso proteger o Demo de verdade, a verificacao tem que ficar no Node-RED, com o segredo fora do HTML.
