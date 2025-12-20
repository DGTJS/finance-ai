# Script PowerShell para limpar cache do Next.js/Turbopack no Windows

Write-Host "🧹 Limpando cache do Next.js e Turbopack..." -ForegroundColor Cyan

# Remover pasta .next
if (Test-Path ".next") {
    Write-Host "Removendo pasta .next..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Pasta .next removida" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Pasta .next não encontrada" -ForegroundColor Gray
}

# Remover cache do node_modules
if (Test-Path "node_modules\.cache") {
    Write-Host "Removendo cache do node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Cache do node_modules removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Cache do node_modules não encontrado" -ForegroundColor Gray
}

# Remover cache do Turbopack (se existir)
if (Test-Path ".turbo") {
    Write-Host "Removendo cache do Turbopack..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".turbo"
    Write-Host "✅ Cache do Turbopack removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Cache do Turbopack não encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Limpeza concluída! Agora você pode executar 'npm run dev' novamente." -ForegroundColor Green









