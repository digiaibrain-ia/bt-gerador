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
