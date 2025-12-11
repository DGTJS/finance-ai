# Script PowerShell para criar banco de dados Finance AI
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Criar Banco de Dados Finance AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tentar encontrar MySQL no XAMPP
$mysqlPaths = @(
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\Program Files\xampp\mysql\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe"
)

$mysqlPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        break
    }
}

if (-not $mysqlPath) {
    Write-Host "[ERRO] MySQL nao encontrado nos caminhos padrao do XAMPP." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, crie o banco manualmente via phpMyAdmin:" -ForegroundColor Yellow
    Write-Host "   1. Abra: http://localhost/phpmyadmin" -ForegroundColor White
    Write-Host "   2. Clique em 'Novo' no menu lateral" -ForegroundColor White
    Write-Host "   3. Digite o nome: finance_ai" -ForegroundColor White
    Write-Host "   4. Selecione collation: utf8mb4_unicode_ci" -ForegroundColor White
    Write-Host "   5. Clique em 'Criar'" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou informe o caminho do mysql.exe:" -ForegroundColor Yellow
    $customPath = Read-Host "Caminho do mysql.exe (ou pressione Enter para pular)"
    if ($customPath -and (Test-Path $customPath)) {
        $mysqlPath = $customPath
    } else {
        exit 1
    }
}

Write-Host "[OK] MySQL encontrado: $mysqlPath" -ForegroundColor Green
Write-Host ""

# Criar banco de dados
Write-Host "Criando banco de dados 'finance_ai'..." -ForegroundColor Cyan

$createDbCommand = "CREATE DATABASE IF NOT EXISTS `finance_ai` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    & $mysqlPath -u root -e $createDbCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Banco de dados criado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Cyan
        Write-Host "   1. Execute: npx prisma migrate dev" -ForegroundColor White
        Write-Host "   2. Execute: npm run seed" -ForegroundColor White
    } else {
        Write-Host "[ERRO] Erro ao criar banco de dados." -ForegroundColor Red
        Write-Host "   Codigo de saida: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Tente criar manualmente via phpMyAdmin:" -ForegroundColor Yellow
        Write-Host "   http://localhost/phpmyadmin" -ForegroundColor White
    }
} catch {
    Write-Host "[ERRO] Erro ao executar comando MySQL:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "   1. O MySQL esta rodando (XAMPP)" -ForegroundColor White
    Write-Host "   2. O usuario root nao tem senha (ou ajuste o script)" -ForegroundColor White
}

Write-Host ""

