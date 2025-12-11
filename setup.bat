@echo off
echo ========================================
echo  Finance AI v2.0 - Setup Automatico
echo ========================================
echo.

echo [1/5] Verificando banco de dados...
call npm run test:db
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  ATENCAO: O banco de dados nao existe!
    echo.
    echo Por favor, crie o banco de dados primeiro:
    echo   1. Abra o phpMyAdmin: http://localhost/phpmyadmin
    echo   2. Clique em "Novo" no menu lateral
    echo   3. Digite o nome: finance_ai
    echo   4. Selecione collation: utf8mb4_unicode_ci
    echo   5. Clique em "Criar"
    echo.
    echo Depois execute este script novamente.
    echo.
    pause
    exit /b 1
)
echo ✓ Banco de dados OK!
echo.

echo [2/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas!
echo.

echo [3/5] Gerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client
    pause
    exit /b 1
)
echo ✓ Prisma Client gerado!
echo.

echo [4/5] Aplicando migracoes do banco...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERRO: Falha ao aplicar migracoes
    pause
    exit /b 1
)
echo ✓ Migracoes aplicadas!
echo.

echo [5/5] Populando dados de teste...
call npm run seed
if %errorlevel% neq 0 (
    echo AVISO: Falha ao criar dados de teste (pode ser ignorado)
) else (
    echo ✓ Dados de teste criados!
)
echo.

echo ========================================
echo  Setup Concluido com Sucesso!
echo ========================================
echo.
echo Agora execute: npm run dev
echo.
echo Usuario de teste:
echo   Email: teste@finance.ai
echo   Senha: 123456
echo.
pause

