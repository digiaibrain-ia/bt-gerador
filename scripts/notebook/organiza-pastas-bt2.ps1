<#
.SYNOPSIS
  Organiza no NOTEBOOK (Windows) as pastas do BT2 com a MESMA estrutura do GitHub e, se quiser, distribui nelas o conteudo do pacote .zip.

.DESCRIPTION
  - Cria  <Raiz>\bt-gerador\...  espelhando o repositorio (nodered\flows\bt2, dashboard\ferramentas, plc\bt2\..., docs\..., config).
  - Cria pastas de trabalho ao lado:  _entregas, _backups, _devolver_ao_claude, _NAO_IMPORTAR_NO_PC.
  - Com -Pacote (zip) ou -PacotePasta (zip ja descompactado): copia cada arquivo para o lugar certo.
  - NUNCA apaga e NUNCA sobrescreve: se o arquivo ja existe e e igual, avisa; se existe e e diferente, grava ao lado como  <nome>.NOVO  e avisa.
  - Use -Simular para so MOSTRAR o que faria, sem criar nada.

.EXAMPLE
  .\organiza-pastas-bt2.ps1 -Simular
  .\organiza-pastas-bt2.ps1 -Raiz D:\BT2 -Pacote "$env:USERPROFILE\Downloads\entrega_atualizacao_bt2_v0.3.zip"
#>
param(
  [string]$Raiz = (Join-Path $env:USERPROFILE 'BT2'),
  [string]$Pacote = '',
  [string]$PacotePasta = '',
  [switch]$Simular
)
$ErrorActionPreference = 'Stop'
$repo = Join-Path $Raiz 'bt-gerador'

$pastasRepo = @(
  'dashboard\ferramentas', 'nodered\flows\bt2',
  'plc\bt2\bancos_cargas', 'plc\bt2\comunicacao_et200', 'plc\bt2\gerador', 'plc\bt2\variaveis', 'plc\bt2\arquivo',
  'docs\bt2\migracao', 'docs\bt2\fase3', 'docs\bt2\plc', 'docs\seguranca', 'config', 'tests'
)
$pastasTrabalho = @('_entregas', '_backups', '_devolver_ao_claude', '_NAO_IMPORTAR_NO_PC')

function Novo-Dir([string]$p) {
  if (Test-Path -LiteralPath $p) { return }
  if ($Simular) { Write-Host "[simular] criaria a pasta: $p" } else { New-Item -ItemType Directory -Path $p | Out-Null; Write-Host "pasta criada: $p" }
}

# regra: caminho do arquivo DENTRO do pacote  ->  pasta destino (relativa ao repo; '@' = pasta de trabalho)
function Destino([string]$rel) {
  $r = $rel -replace '\\', '/'
  if ($r -match '^01_fluxos_importar/')                                   { return 'nodered\flows\bt2' }
  if ($r -match '^02_somente_bancada/')                                   { return '@_NAO_IMPORTAR_NO_PC' }
  if ($r -match '^03_front/')                                             { return 'dashboard\ferramentas' }
  if ($r -match '^04_config/')                                            { return 'config' }
  if ($r -match '^05_documentos/BACKLOG')                                 { return '.' }
  if ($r -match '^05_documentos/FECHAMENTO')                              { return 'docs\bt2\fase3' }
  if ($r -match '^05_documentos/SENHA')                                   { return 'docs\seguranca' }
  if ($r -match '^05_documentos/')                                        { return 'docs\bt2\migracao' }
  if ($r -match '^plc/01_etapa1_renumerar/MAPA')                          { return 'docs\bt2\plc' }
  if ($r -match '^plc/06_referencia_ja_no_plc/MANIFESTO')                 { return 'plc\bt2' }
  if ($r -match '^plc/[^/]+/(fb101|fb103|db40_|db41_|fb_bancoEt200|fc_bancosNovosEt200|fc_vidaET|tags_ET200)') { return 'plc\bt2\comunicacao_et200' }
  if ($r -match '^plc/')                                                  { return 'plc\bt2\bancos_cargas' }
  if ($r -match '^(LEIA-ME_PRIMEIRO|MANIFESTO)')                          { return '@_entregas' }
  return $null
}

Write-Host "Raiz: $Raiz" -ForegroundColor Cyan
Novo-Dir $Raiz; Novo-Dir $repo
foreach ($p in $pastasRepo)     { Novo-Dir (Join-Path $repo $p) }
foreach ($p in $pastasTrabalho) { Novo-Dir (Join-Path $Raiz $p) }

# ---- origem do pacote
$origem = ''
if ($PacotePasta) { $origem = $PacotePasta }
elseif ($Pacote) {
  if (-not (Test-Path -LiteralPath $Pacote)) { throw "Pacote nao encontrado: $Pacote" }
  $nome = [IO.Path]::GetFileNameWithoutExtension($Pacote)
  $dest = Join-Path (Join-Path $Raiz '_entregas') $nome
  if ($Simular) { Write-Host "[simular] descompactaria $Pacote em $dest"; $origem = '' }
  else {
    if (-not (Test-Path -LiteralPath $dest)) { Expand-Archive -LiteralPath $Pacote -DestinationPath $dest }
    $origem = $dest
  }
}

if ($origem) {
  # o zip traz uma pasta raiz (entrega_...): se existir, entra nela
  $filhos = Get-ChildItem -LiteralPath $origem -Directory
  if ($filhos.Count -eq 1 -and -not (Test-Path (Join-Path $origem '01_fluxos_importar'))) { $origem = $filhos[0].FullName }
  $etapas = @{}; $iguais = 0; $copiados = 0; $diferentes = 0; $semRegra = @()
  Get-ChildItem -LiteralPath $origem -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($origem.Length).TrimStart('\', '/')
    $d = Destino $rel
    if ($null -eq $d) { $semRegra += $rel; return }
    $pasta = if ($d.StartsWith('@')) { Join-Path $Raiz $d.Substring(1) } else { Join-Path $repo $d }
    Novo-Dir $pasta
    $alvo = Join-Path $pasta $_.Name
    if ($rel -match '^plc/([^/\\]+)/') { $e = $Matches[1]; if (-not $etapas.ContainsKey($e)) { $etapas[$e] = @() }; $etapas[$e] += $_.Name }
    if (Test-Path -LiteralPath $alvo) {
      $h1 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash; $h2 = (Get-FileHash -LiteralPath $alvo -Algorithm SHA256).Hash
      if ($h1 -eq $h2) { $iguais++; return }
      $alvo = $alvo + '.NOVO'; $diferentes++
      Write-Host "ATENCAO: ja existia um arquivo DIFERENTE; gravado ao lado como $alvo" -ForegroundColor Yellow
    }
    if ($Simular) { Write-Host "[simular] copiaria $rel -> $alvo" } else { Copy-Item -LiteralPath $_.FullName -Destination $alvo; $copiados++ }
  }
  if ($etapas.Count -gt 0 -and -not $Simular) {
    $txt = @("QUAIS ARQUIVOS DO PLC PERTENCEM A CADA ETAPA (ver ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md)", "")
    foreach ($k in ($etapas.Keys | Sort-Object)) { $txt += "== $k"; $txt += ($etapas[$k] | Sort-Object | ForEach-Object { "   $_" }) }
    Set-Content -LiteralPath (Join-Path $repo 'plc\bt2\LEIA-ME_ETAPAS.txt') -Value $txt -Encoding UTF8
  }
  Write-Host ("Resumo: {0} copiados, {1} ja existiam iguais, {2} diferentes (gravados como .NOVO)" -f $copiados, $iguais, $diferentes) -ForegroundColor Green
  if ($semRegra.Count -gt 0) { Write-Host "Sem regra de destino (nao copiados):" -ForegroundColor Yellow; $semRegra | ForEach-Object { Write-Host "   $_" } }
}
Write-Host "Pronto. Estrutura em: $repo" -ForegroundColor Cyan
