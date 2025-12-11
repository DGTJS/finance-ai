@echo off
echo ============================================================
echo 🚀 TESTE COMPLETO DO FINANCE AI
echo ============================================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se tsx está instalado
npx tsx --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando dependências...
    call npm install
)

echo.
echo Executando testes...
echo.

REM Executar script de testes
npx tsx scripts/test-all.ts

if %errorlevel% neq 0 (
    echo.
    echo ❌ Alguns testes falharam.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Todos os testes passaram!
    pause
    exit /b 0
)



