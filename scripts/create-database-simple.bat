@echo off
echo ========================================
echo  Criar Banco de Dados Finance AI
echo ========================================
echo.
echo Este script vai tentar criar o banco de dados usando o MySQL.
echo Certifique-se de que o MySQL esta rodando (XAMPP).
echo.

REM Verificar se mysql.exe existe no PATH
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL nao encontrado no PATH.
    echo.
    echo Por favor, crie o banco manualmente:
    echo   1. Abra o phpMyAdmin: http://localhost/phpmyadmin
    echo   2. Clique em "Novo" no menu lateral
    echo   3. Digite o nome: finance_ai
    echo   4. Selecione collation: utf8mb4_unicode_ci
    echo   5. Clique em "Criar"
    echo.
    pause
    exit /b 1
)

echo Criando banco de dados finance_ai...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS finance_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Nao foi possivel criar o banco de dados.
    echo.
    echo Tente criar manualmente via phpMyAdmin:
    echo   http://localhost/phpmyadmin
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Banco de dados criado com sucesso!
echo.
echo Proximos passos:
echo   1. Execute: npx prisma migrate dev
echo   2. Execute: npm run seed
echo.
pause

