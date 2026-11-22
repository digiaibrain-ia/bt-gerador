# tests/fixtures — versões antigas que os testes ainda precisam

Aqui ficam **só** as cópias antigas de fluxos do Node-RED que algum teste usa de propósito: contra-prova ("a versão anterior tem que falhar"), caracterização de uma etapa ou conferência de "a versão anterior continua intacta".
Tudo o mais nos testes usa **a versão mais nova** que está nas pastas de entrega.

- Resolução: `tests/versoes.js` (`medidorAtual()`, `caminhoFluxo(nome)`, `caminhoFerramenta(nome)`). O harness (`tests/integracao/harness.js`) procura o fluxo primeiro em `nodered/flows/bt2` e depois aqui em `fluxos/`.
- Regra: **não** edite os arquivos daqui (são prova do passado). Não são para importar no PC BT2.
- Para provar contra outra versão: `BT2_FASE4_HTML`, `BT2_MED`, `MEDIDOR` (medidor) e `BT2_FASE4_VERSAO` (fluxos de chaves) continuam valendo.
