# RNC · Pacote de bancada v0.1 — LEIA-ME (13/11/2026)

Pacote para o **teste de bancada** do sistema de RNC e retrabalho do gerador. **Só informativo:** nada aqui comanda PLC, chave ou DSE, e a aba do Node-RED só grava arquivo.
**Antes de instalar no PC BT2:** backup do Node-RED exportado e **OK explícito do Reginaldo**. Carga de potência **desacoplada** nos testes com gerador ligado.

## O que vem no zip
| Pasta | Conteúdo |
|---|---|
| `fluxo/` | `rnc-api-v1.1.json` — aba nova do Node-RED (não mexe nas abas das chaves) |
| `public/` | `rnc_registro_v0.1.html`, `rnc_reparo_v0.2.html`, `medidor_gerador_v1.10.202.html` (medidor v1.10.201 + botão "Registrar defeito") |
| `testes/` | `rnc_teste_bancada_v0.1.js` — confere sozinho a maior parte dos testes de API |
| `docs/` | `RNC_CHECKLIST_BANCADA_v0.1.md` (roteiro completo), `RNC_RETRABALHO_v0.2.md` (contrato) |
| `SHA256SUMS.txt` | soma de cada arquivo (para conferir que o zip não se corrompeu) |

## Passo a passo (PC BT2)
1. **Backup** do Node-RED (exportar todas as abas) e guardar fora do PC.
2. Criar a pasta de **teste** (o nome precisa ter `teste`), por exemplo `C:\...\rnc-dados-teste` (**ajuste o caminho**; o usuário do Node-RED precisa poder gravar nela).
3. Definir a variável `RNC_DIR` com esse caminho, do jeito que o PM2 deste PC já usa para as outras variáveis (`PLC_IP`, `DSE_URL`), e reiniciar o Node-RED **com** as variáveis novas.
4. Node-RED › menu › **Import** › `fluxo/rnc-api-v1.1.json` › **nova aba** › Import › **Deploy**. Conferir que as outras abas não mudaram.
5. Copiar os três `.html` de `public/` para a pasta `public` do Node-RED.
6. No PowerShell, na pasta `testes`: `node rnc_teste_bancada_v0.1.js http://localhost:1880`. Esperado: **18 OK / 0 FALHOU**. Se parar por segurança, o texto diz o motivo (pasta sem "teste" no nome ou não vazia).
7. **Rede (T02), no PC do reparo:** abrir no navegador `http://<IP-BT2>:1880/api/rnc/saude` (deve mostrar `"ok":true` e a pasta de **teste**) e depois `http://<IP-BT2>:1880/rnc_reparo_v0.2.html` (deve mostrar o quadro com as RNCs de teste do passo 6). Se algum não abrir, é rede/firewall entre os PCs: registrar como `todo`.
8. Seguir o **roteiro manual** (`docs/RNC_CHECKLIST_BANCADA_v0.1.md`): T14 em diante (medidor com DSE real, reinício, queda de rede, backup, expedição) e a conferência das telas.
9. Preencher a seção 7 do roteiro (resultado). Falha = registrar como `todo` com ID e gravidade; não apagar o teste.

## Volta atrás
Node-RED › desabilitar/excluir a aba `RNC · …` › Deploy; apagar os três `.html` de `public`. Nada nas abas das chaves, no PLC ou no DSE foi alterado.

## Limites
- O medidor `v1.10.202` assume que a versão em uso no PC BT2 é a **v1.10.201** (confirme). Se for outra, o botão precisa ser portado para ela.
- O menu ☰ com as duas telas (T28) depende do catálogo gerado pelo pacote da sessão BT2 (gerador v0.3): fica fora deste teste.
- Leitura de DSE **real** só se prova na bancada (T14). O sistema é informativo: o bloqueio de expedição depende de etiqueta e conferência na fábrica.
