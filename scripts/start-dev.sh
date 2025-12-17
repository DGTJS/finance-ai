#!/bin/bash

# Script de desenvolvimento para Dashboard Financeira
# Inicia o servidor de desenvolvimento com todas as configurações necessárias

echo "🚀 Iniciando Dashboard Financeira em modo desenvolvimento..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Iniciar servidor de desenvolvimento
echo "🔥 Iniciando Next.js com Turbopack..."
echo "📊 MSW será iniciado automaticamente"
echo "📚 Acesse http://localhost:3000/dashboard quando estiver pronto"
echo ""

npm run dev




