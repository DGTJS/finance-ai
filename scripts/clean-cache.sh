#!/bin/bash

# Script para limpar cache do Next.js/Turbopack no Linux/Mac

echo "🧹 Limpando cache do Next.js e Turbopack..."

# Remover pasta .next
if [ -d ".next" ]; then
    echo "Removendo pasta .next..."
    rm -rf .next
    echo "✅ Pasta .next removida"
else
    echo "ℹ️ Pasta .next não encontrada"
fi

# Remover cache do node_modules
if [ -d "node_modules/.cache" ]; then
    echo "Removendo cache do node_modules..."
    rm -rf node_modules/.cache
    echo "✅ Cache do node_modules removido"
else
    echo "ℹ️ Cache do node_modules não encontrado"
fi

# Remover cache do Turbopack (se existir)
if [ -d ".turbo" ]; then
    echo "Removendo cache do Turbopack..."
    rm -rf .turbo
    echo "✅ Cache do Turbopack removido"
else
    echo "ℹ️ Cache do Turbopack não encontrado"
fi

echo ""
echo "✨ Limpeza concluída! Agora você pode executar 'npm run dev' novamente."








