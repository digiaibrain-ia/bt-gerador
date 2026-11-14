# Dados do ensaio — opção "Por nº de série (MES)" (medidor 1.10.202)

Gerador: `dashboard/gerador/gerar_medidor_v1.10.202_v0.1.py` (copia a 1.10.201; a 201 não é alterada).
Teste: `node tests/e2e/dados_ensaio_ns.js` (Playwright, abre o arquivo direto; desktop 1536x694 e celular 390).

## Comportamento
- Seletor "Origem dos dados" no topo do diálogo. Padrão: **Manual / print do SAP (original)**, sem nenhuma mudança.
- **Por nº de série (MES):** o NS (digitado ou lido) é decodificado (`decodifica_serie_mwm_v0.1.js`, colado inline) e preenche Fabricante e Modelo de Motor, Alternador e Controlador.
- Tudo editável. Campo mudado em relação ao NS fica com contorno azul e entra na contagem do aviso.
- Mesmo NS não sobrescreve a edição; NS novo válido preenche de novo.
- Letra desconhecida: aviso, e o campo fica para digitar. NS inválido: mensagem, sem travar.
- Não vêm do NS: potência, tensão, frequência, temperatura, versão. Continuam digitados.
- Fechar o diálogo volta para Manual. A área do print do SAP some no modo NS.

## Não faz (ainda)
- Não grava o modo nem o NS decodificado no registro (`window.__NS_DECOD` fica disponível para o fluxo novo).
- O catálogo de ferramentas continua apontando para a 1.10.201; a 202 abre pelo arquivo ou pelo "Atualizar" do menu DEV.

## Atualização 14/11/2026 — fluxo mesclado (medidor 1.10.205, decodificador v0.3)
1. NS do MES → decifrador (**só as normas**, ETD 091 rev.05 = 9 caracteres, ETD 094 rev.00 = 8) preenche Motor, Alternador, Controlador.
2. Operador usa a busca de modelo (catálogo): frequência, tensão, potência (kW) e controlador.
3. O que faltar é digitado.
- **Estrito:** a tolerância da v0.2/1.10.204 (aceitar `S` + 9 caracteres) foi removida. NS fora da norma não preenche nada; a tela manda preencher à mão. O `S` só existe na ETD 091 como motor Scania (posição 2) e na ETD 094 como painel solar (posição 1).
- **Origem de cada campo:** barra azul = NS, barra verde = catálogo, sem barra = digitado. Quem rodar por último vence; digitar à mão tira a marca. Legenda no quadro do NS.
- **Conflito:** o catálogo preenche sempre "Deep Sea". Se o NS indicar outro controlador (ex.: Deif AGC150), aparece aviso.
- **Não faz:** não manda o nome do modelo do catálogo ao registro (exigiria fluxo v1.11); não recebe o NS direto do MES (depende da TI); a string longa do MES (aplicação + NS) não é decifrada.
