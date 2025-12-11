#!/bin/bash

echo "========================================"
echo " Finance AI v2.0 - Setup Automatico"
echo "========================================"
echo ""

echo "[1/4] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias"
    exit 1
fi
echo "✓ Dependencias instaladas!"
echo ""

echo "[2/4] Gerando Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao gerar Prisma Client"
    exit 1
fi
echo "✓ Prisma Client gerado!"
echo ""

echo "[3/4] Aplicando migracoes do banco..."
npx prisma migrate dev --name add_ai_and_subscriptions
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao aplicar migracoes"
    exit 1
fi
echo "✓ Migracoes aplicadas!"
echo ""

echo "[4/4] Populando dados de teste (opcional)..."
npm run seed
echo "✓ Dados de teste criados!"
echo ""

echo "========================================"
echo " Setup Concluido com Sucesso!"
echo "========================================"
echo ""
echo "Agora execute: npm run dev"
echo ""
echo "Usuario de teste:"
echo "  Email: teste@finance.ai"
echo "  Senha: 123456"
echo ""

