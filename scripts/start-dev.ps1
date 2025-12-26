# Script de desenvolvimento para Dashboard Financeira (PowerShell)
# Inicia o servidor de desenvolvimento com todas as configurações necessárias

Write-Host "🚀 Iniciando Dashboard Financeira em modo desenvolvimento..." -ForegroundColor Green
Write-Host ""

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Iniciar servidor de desenvolvimento
Write-Host "🔥 Iniciando Next.js com Turbopack..." -ForegroundColor Cyan
Write-Host "📊 MSW será iniciado automaticamente" -ForegroundColor Cyan
Write-Host "📚 Acesse http://localhost:3000/dashboard quando estiver pronto" -ForegroundColor Cyan
Write-Host ""

npm run dev









