# Teste minimo da API do BC56 contra o Node-RED local (PowerShell 5+). Edite $base se a porta nao for 1880.
# O Node-RED exige Origin/Referer do mesmo host e Content-Type JSON em toda rota de escrita (D3).
$base = "http://localhost:1880"
$h = @{ Origin = $base }
function Post($rota, $corpo) {
  try { Invoke-RestMethod -Method Post -Uri "$base$rota" -Headers $h -ContentType "application/json" -Body ($corpo | ConvertTo-Json -Compress) }
  catch { "ERRO " + $_.Exception.Response.StatusCode.value__ + " " + $_.ErrorDetails.Message }
}
"== 1) leitura";           (Invoke-RestMethod "$base/api/chaves/56") | ConvertTo-Json -Depth 4 | Select-Object -First 30
"== 2) ligar banco";       Post "/api/chaves/56/banco" @{ ligar = $true }
"== 3) ligar chave 1";     Post "/api/chaves/56/ligar" @{ indice = 1; ligar = $true }
Start-Sleep -Milliseconds 800
"== 4) lote 2,3 e 4 desl"; Post "/api/chaves/56/lote" @{ ligar = @(2,3); desligar = @(1) }
Start-Sleep -Milliseconds 800
"== 5) estado";           (Invoke-RestMethod "$base/api/chaves/56") | ConvertTo-Json -Depth 4 | Select-Object -First 30
"== 6) desligar banco";   Post "/api/chaves/56/banco" @{ ligar = $false }
