@echo off
rem Cria as pastas do BT2 no notebook com a mesma estrutura do GitHub (SO cria pastas; nao copia, nao apaga, nao sobrescreve).
rem Uso: duplo clique, ou no Prompt de Comando:  criar-pastas-bt2.bat [pasta-raiz]   (padrao: %USERPROFILE%\BT2)
setlocal
set "RAIZ=%~1"
if "%RAIZ%"=="" set "RAIZ=%USERPROFILE%\BT2"
set "R=%RAIZ%\bt-gerador"
for %%P in (
  "dashboard\ferramentas" "nodered\flows\bt2"
  "plc\bt2\bancos_cargas" "plc\bt2\comunicacao_et200" "plc\bt2\gerador" "plc\bt2\variaveis" "plc\bt2\arquivo"
  "docs\bt2\migracao" "docs\bt2\fase3" "docs\bt2\plc" "docs\seguranca" "config" "tests"
) do if not exist "%R%\%%~P" mkdir "%R%\%%~P"
for %%P in ("_entregas" "_backups" "_devolver_ao_claude" "_NAO_IMPORTAR_NO_PC") do if not exist "%RAIZ%\%%~P" mkdir "%RAIZ%\%%~P"
echo Pastas criadas em: %R%
endlocal
