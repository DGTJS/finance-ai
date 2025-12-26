#!/bin/bash

echo "============================================================"
echo "🚀 TESTE COMPLETO DO FINANCE AI"
echo "============================================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Verificar se tsx está disponível
if ! npx tsx --version &> /dev/null; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "Executando testes..."
echo ""

# Executar script de testes
npx tsx scripts/test-all.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Alguns testes falharam."
    exit 1
else
    echo ""
    echo "✅ Todos os testes passaram!"
    exit 0
fi












