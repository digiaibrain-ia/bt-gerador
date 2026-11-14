# Tesseract (OCR) — arquivos locais

Guardados no repositório para o OCR do "Importar print do SAP" funcionar sem depender de internet/CDN.

| Arquivo | O que é |
|---|---|
| `tesseract.min.js` | biblioteca principal do Tesseract.js |
| `worker.min.js` | worker que roda o OCR em segundo plano |
| `tesseract-core-lstm.wasm.js` | motor de OCR (WebAssembly, versão normal) |
| `tesseract-core-simd-lstm.wasm.js` | motor de OCR (WebAssembly com SIMD, mais rápido em navegadores modernos) |
| `por.traineddata.gz` | idioma português (dados de reconhecimento, comprimidos) |

Versões: não informadas no envio (ASSUMIDO — conferir com o arquivo de origem antes de atualizar). Não editar estes arquivos; para trocar de versão, substituir o conjunto inteiro.

Ainda não ligados ao medidor: o medidor continua apontando para a origem que já usa. Ligar a cópia local é uma etapa separada.
