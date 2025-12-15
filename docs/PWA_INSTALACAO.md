# 📱 PWA - Instalação no Mobile

O Finance AI agora é um **Progressive Web App (PWA)** instalável! Isso significa que você pode adicionar o sistema como um atalho na tela inicial do seu celular, como se fosse um app nativo.

## 🎯 Como Instalar no Mobile

### Android (Chrome/Samsung Internet)

1. Abra o Finance AI no navegador do celular
2. Aguarde alguns segundos - aparecerá um popup perguntando se deseja instalar
3. Ou clique no menu (3 pontos) → **"Adicionar à tela inicial"** ou **"Instalar app"**
4. Confirme a instalação
5. O ícone aparecerá na tela inicial do celular

### iOS (Safari)

1. Abra o Finance AI no Safari do iPhone/iPad
2. Clique no botão de compartilhar (quadrado com seta para cima)
3. Role para baixo e clique em **"Adicionar à Tela de Início"**
4. Personalize o nome (opcional) e clique em **"Adicionar"**
5. O ícone aparecerá na tela inicial

## ✨ Funcionalidades do PWA

- ✅ **Acesso rápido** - Abre direto sem precisar digitar o endereço
- ✅ **Funciona offline** - Algumas funcionalidades funcionam sem internet
- ✅ **Experiência nativa** - Abre em tela cheia, sem barra do navegador
- ✅ **Atalhos rápidos** - Acesso direto ao Dashboard, Transações e Freelancer
- ✅ **Notificações** - Receba alertas mesmo com o app fechado (em breve)

## 🔧 Configuração Técnica

### Arquivos Criados

- `public/manifest.json` - Configuração do PWA
- `app/_components/pwa-install-prompt.tsx` - Componente de instalação
- Ícones PWA (precisam ser criados - veja abaixo)

### Ícones Necessários

Você precisa criar dois ícones e colocá-los em `public/`:

1. **icon-192x192.png** - Ícone 192x192 pixels
2. **icon-512x512.png** - Ícone 512x512 pixels

**Como criar:**
- Use o arquivo `public/logo.png` como base
- Redimensione para os tamanhos acima
- Salve como PNG na pasta `public/`

Veja instruções detalhadas em `scripts/generate-pwa-icons.md`

## 📋 Checklist de Implementação

- [x] Manifest.json criado
- [x] Metadados PWA configurados no layout
- [x] Componente de instalação criado
- [x] Configuração Next.js atualizada
- [ ] Ícones PWA criados (192x192 e 512x512)
- [ ] Testado no Android
- [ ] Testado no iOS

## 🐛 Troubleshooting

### O popup de instalação não aparece

- Verifique se está usando HTTPS (obrigatório para PWA)
- Limpe o cache do navegador
- Verifique se os ícones existem em `public/`

### O ícone não aparece após instalação

- Verifique se os arquivos `icon-192x192.png` e `icon-512x512.png` existem
- Verifique se o `manifest.json` está acessível em `/manifest.json`

### Não funciona no iOS

- iOS tem suporte limitado a PWA
- Use Safari (não Chrome no iOS)
- Algumas funcionalidades podem não funcionar como no Android

## 🚀 Próximos Passos

1. Criar os ícones PWA (192x192 e 512x512)
2. Testar instalação no Android
3. Testar instalação no iOS
4. Adicionar Service Worker para funcionalidades offline (opcional)

---

**Última atualização:** Janeiro 2025

