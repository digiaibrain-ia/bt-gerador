# Etapa BC56 + BC400 (uso fixo de 2 bancos)

Arquivos congelados da etapa em que o sistema trabalhava só com BC56 e BC400. Não editar; servem de referência e de volta atrás.
A etapa seguinte (4 bancos, BC59,5 e BC550 como bancos de verdade no Demo local) começa no medidor v1.10.140, em `dashboard/ferramentas/`.

| Arquivo | O que é |
|---|---|
| `medidor_gerador_v1.10.124.html` | último medidor com 2 bancos |
| `mapa_fbs_v0.13.html` | mapa dos FBs com 2 bancos |
| `rodizio_chaves_v0.1.js` | motor de sugestão v0.1 (BC56/BC400 fixos; a v0.2 está em `dashboard/modulos-fonte/`) |
| `simulador_rodizio_v0.1.html` | simulador do motor v0.1 (BC56/BC400 fixos) |
| `index_v0.2_catalogo_v0.1.html` | página de entrada ligada ao `catalogo_ferramentas_v0.1.js` (o repositório só tem o catálogo v0.2 e v0.6) |

Observação: o `catalogo_ferramentas_v0.1.js` e o `menu_dev_v0.2.js` são pedidos pelo medidor ao abrir (erro de arquivo não encontrado no console). Falta subir o catálogo v0.1 se quiser rodar esta etapa completa.
