# Manual guiado + Catálogo DSE + Troca de resistência — v0.2 (medidor v1.9.83)

## Resumo
Mudanças de 27/10 (18:06): catálogo com busca digitada, diálogo em passos, rodízio automático (sem tela), troca de resistência no card Cargas, escolha do modelo DSE em "Dados do ensaio".

## 1. Instruções de uso (operador)
1. **Manual guiado** → passo 1: digite parte do nome do modelo (ex.: `40 kva 220 mwm`), clique no modelo (ou Enter = 1º da lista). Preenche "kW a 100 %" (kW do .dse — **confirmar se é o 100 %**; pode corrigir).
2. Passo 2: patamar (ou "Seguir a etapa do ensaio"). 3: **Sugerir chaves**. 4: ajustar à mão (opcional). 5: **Confirmar e aplicar**.
3. **Abrir TODAS as chaves (zerar a carga)**: emergência/reinício — abre todas as chaves comandadas nos dois bancos, sem esperar o plano; é o mesmo ato da proteção "DSE caiu". Não mexe em banco/seletora nem no cronômetro.
4. **Troca de resistência** (card Cargas): marque as chaves trocadas → "Registrar troca" → desgaste zerado + data guardada.
5. **Dados do ensaio** → bloco "Modelo do DSE (catálogo)": preenche Frequência (Hz_xml), Tensão (V_nome), Controlador (Deep Sea / familia_zip). Potência só se vazia; kW do .dse = dica.
6. Modelo novo: gerar o `.csv` de novo (catalogo_dse_v0.1.py) e carregar no seletor (fica guardado no navegador).

## 2. Dicionário de dados
| Item | Onde | Conteúdo |
|---|---|---|
| `medidor.catalogo.v1` | localStorage | catálogo compacto (12 colunas do CSV) |
| `medidor.guiado.v1` | localStorage | parâmetros do assistente (kw100, limite %, excesso, degrau, pausa, proteção DSE, modelo) |
| `medidor.guiado.rodizio.v1` | localStorage | desgaste por chave `{56|400:{acion[],horas[]}}` |
| `medidor.guiado.trocas.v1` | localStorage | data ISO da última troca por chave |
Tudo **por navegador/PC**. Nenhuma rota, DB ou endereço novo.

## 3. Lógica
- Busca: todos os termos (E), sem acento/maiúscula, sobre pasta+arquivo+família+kVA+V+Hz+descrição.
- Rodízio: critério fixo "ambos" (acionamentos + horas), contagem automática (1 s) mesmo com o diálogo fechado.
- Troca: `RodizioChaves.chaveTrocada` zera acion/horas da chave; `window.GUIADO.chaveTrocada(banco,idx)` disponível.

## 4. Assumido / a confirmar
kW_xml = 100 % (não confirmado); limite 110 %; excesso 107 % = 2 pts; timeout DSE 5 s; "Modelo" do controlador = `familia_zip` (ex.: DSEG_4501) — ajustar se o SAP usar outro nome.

## 5. Padrão de comentários
Código em PT-BR com o "porquê" nos blocos CATDSE, Manual guiado e Troca (ver cabeçalhos no HTML).

## 6. Como usar na simulação (v1.9.83)
- **Sem clicar INICIAR:** ligue o DEMO local, abra o Manual guiado, escolha o patamar à mão (o "Seguir a etapa" só vale com o ensaio iniciado) → Sugerir → Confirmar e aplicar. Valida a sugestão e a guarda de capacidade sem gastar etapa.
- **Com INICIAR:** com "Seguir a etapa do ensaio" marcado, o patamar acompanha a etapa atual; a cada etapa nova clique em Sugerir e Aplicar (não há aplicação automática).
- Layout: ✕ sempre à esquerda; Manual guiado em 2 colunas (1–3 esquerda, 4–5 direita); Dados do ensaio sem rolagem.
