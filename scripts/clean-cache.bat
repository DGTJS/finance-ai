@echo off
echo 🧹 Limpando cache do Next.js e Turbopack...

if exist .next (
    echo Removendo pasta .next...
    rmdir /s /q .next
    echo ✅ Pasta .next removida
) else (
    echo ℹ️ Pasta .next não encontrada
)

if exist node_modules\.cache (
    echo Removendo cache do node_modules...
    rmdir /s /q node_modules\.cache
    echo ✅ Cache do node_modules removido
) else (
    echo ℹ️ Cache do node_modules não encontrado
)

if exist .turbo (
    echo Removendo cache do Turbopack...
    rmdir /s /q .turbo
    echo ✅ Cache do Turbopack removido
) else (
    echo ℹ️ Cache do Turbopack não encontrado
)

echo.
echo ✨ Limpeza concluída! Agora você pode executar 'npm run dev' novamente.
pause









