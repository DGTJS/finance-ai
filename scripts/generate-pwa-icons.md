# Gerar Ícones PWA

Para criar os ícones necessários para o PWA, você precisa gerar:

1. **icon-192x192.png** - Ícone 192x192 pixels
2. **icon-512x512.png** - Ícone 512x512 pixels

## Opções para gerar os ícones:

### Opção 1: Usar o logo existente
1. Abra o arquivo `public/logo.png` em um editor de imagens
2. Redimensione para 192x192 e salve como `public/icon-192x192.png`
3. Redimensione para 512x512 e salve como `public/icon-512x512.png`

### Opção 2: Usar ferramenta online
- Acesse: https://realfavicongenerator.net/
- Faça upload do `logo.png`
- Configure para gerar ícones PWA
- Baixe e coloque em `public/`

### Opção 3: Usar ImageMagick (se instalado)
```bash
# Converter logo.png para os tamanhos necessários
magick convert public/logo.png -resize 192x192 public/icon-192x192.png
magick convert public/logo.png -resize 512x512 public/icon-512x512.png
```

### Opção 4: Criar manualmente
- Use qualquer editor de imagens (Photoshop, GIMP, Figma, etc.)
- Crie ícones quadrados com fundo transparente ou sólido
- Salve como PNG nos tamanhos: 192x192 e 512x512
- Coloque em `public/`

## Importante:
- Os ícones devem ser quadrados (mesma largura e altura)
- Formato PNG
- Fundo transparente ou sólido (recomendado transparente)
- Nome exato: `icon-192x192.png` e `icon-512x512.png`
- Colocar na pasta `public/`

