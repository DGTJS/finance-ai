# 💰 Finance AI

Sistema de gestão financeira inteligente com **Assistente de IA** construído com Next.js 15, NextAuth v5, Prisma e modelos open-source.

## 📋 Índice

- [⚡ Quick Start](#-quick-start)
- [Visão Geral](#-visão-geral)
- [🆕 Novidades](#-novidades)
- [Stack Tecnológica](#%EF%B8%8F-stack-tecnológica)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#%EF%B8%8F-configuração)
- [Autenticação](#-autenticação)
- [Banco de Dados](#-banco-de-dados)
- [Assistente de IA](#-assistente-de-ia)
- [Assinaturas](#-assinaturas)
- [Como Usar](#-como-usar)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

**5 passos para rodar o projeto:**

```bash
# 1. Clone e instale
git clone https://github.com/seu-usuario/finance-ai.git
cd finance-ai
npm install

# 2. Configure .env.local (copie do .env.example)
# Adicione DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Configure o banco
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# 4. Inicie
npm run dev

# 5. Acesse http://localhost:3000
# Login teste: teste@finance.ai / 123456
```

---

## 🎯 Visão Geral

Finance AI é uma plataforma completa de gestão financeira pessoal que oferece:
- 💰 Gerenciamento de transações (receitas, despesas, investimentos)
- 🤖 **Assistente de IA** com análise automática e chat
- 📊 Dashboard com insights inteligentes
- 💳 Gerenciamento de assinaturas com logos automáticos
- 🔔 Notificações de vencimento
- 📈 Análise financeira detalhada
- 🔐 Autenticação segura multi-provider

---

## 🆕 Novidades

### ✨ Versão 2.0 - Sistema de IA e Assinaturas

#### 🤖 Assistente de IA (Gratuito)
- Chat interativo com IA para consultas financeiras
- Geração automática de insights baseados em transações
- Análise inteligente de gastos e receitas
- Fallback local quando API não configurada
- Suporte a Hugging Face Inference API (modelos open-source)

#### 💳 Gerenciamento de Assinaturas
- CRUD completo de assinaturas
- Detecção automática de logos (60+ serviços)
- Alertas de vencimento (7 dias antes)
- Cálculo automático de próxima data
- Dashboard de gastos recorrentes

#### 🔔 Sistema de Notificações
- Notificações de assinaturas vencendo
- Insights da IA
- Alertas de transações
- Sistema escalável para múltiplos tipos

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15.5.2** - Framework React com Turbopack
- **React 19.1.0** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
  - Dialog, Label, Popover, Select, Slot, Alert Dialog
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Sonner** - Toast notifications

### Backend & Autenticação
- **NextAuth v5 (Auth.js)** - Autenticação
  - Google OAuth
  - Credenciais (Email/Senha)
- **Prisma 6.16.2** - ORM
- **MySQL (XAMPP)** - Banco de dados
- **bcryptjs** - Hash de senhas

### IA & Machine Learning
- **Hugging Face Inference API** - Modelos LLM gratuitos
- **Mistral-7B-Instruct** - Modelo padrão
- **Fallback local** - Análise baseada em regras
- **Sanitização de inputs** - Segurança XSS

### Ferramentas
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **Lint-staged** - Lint em arquivos staged
- **Vitest** - Framework de testes
- **tsx** - Execução de TypeScript

---

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Login com Google OAuth
- ✅ Login com Email/Senha
- ✅ Proteção de rotas automática (middleware)
- ✅ Sessões JWT seguras
- ✅ Logout seguro
- ✅ Usuário de teste pré-configurado

### 💸 Transações
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ 3 tipos: Receita, Despesa, Investimento
- ✅ 9 categorias: Moradia, Transporte, Alimentação, Entretenimento, Saúde, Utilidades, Salário, Educação, Outros
- ✅ 7 métodos de pagamento: Cartão de Crédito, Débito, Transferência, Boleto, Dinheiro, PIX, Outros
- ✅ Filtros e ordenação
- ✅ DataTable interativa
- ✅ Validação com Zod

### 🤖 Assistente de IA
- ✅ Chat interativo (painel lateral)
- ✅ Perguntas em linguagem natural
  - "Quanto gastei em alimentação?"
  - "Me dê um resumo financeiro"
  - "Quais minhas maiores despesas?"
- ✅ Geração automática de insights
  - Análise de gastos por categoria
  - Detecção de padrões
  - Alertas de gastos elevados
  - Sugestões de economia
- ✅ Histórico de conversas
- ✅ Botão flutuante sempre acessível
- ✅ Fallback local (funciona sem API externa)
- ✅ Sanitização de inputs (segurança)

### 💳 Assinaturas
- ✅ CRUD completo de assinaturas
- ✅ Detecção automática de logos (60+ serviços)
  - Netflix, Spotify, YouTube, Amazon Prime, Disney+, etc.
  - Fallback para Clearbit (opcional)
  - Ícone genérico para desconhecidos
- ✅ Cálculo automático de próxima data
- ✅ Status visual (ativa, vencendo, vencida)
- ✅ Dashboard de gastos mensais
- ✅ Alertas de vencimento (customizável)
- ✅ Logos de alta qualidade (Simple Icons CDN)

### 🔔 Notificações
- ✅ Sistema de notificações persistente
- ✅ 4 tipos: Assinaturas, Insights IA, Transações, Sistema
- ✅ Script automático de verificação
- ✅ Metadata JSON flexível
- ✅ Filtros por leitura/não leitura

### 🎨 Interface
- ✅ Design moderno com tema dark
- ✅ Totalmente responsivo (mobile-first)
- ✅ Navegação intuitiva
- ✅ Feedback visual (loading, erros, sucesso)
- ✅ Animações suaves
- ✅ Componentes shadcn/ui

---

## 📁 Estrutura do Projeto

```
finance-ai/
├── app/
│   ├── _actions/                    # Server Actions
│   │   ├── subscription/           # CRUD de Assinaturas
│   │   │   ├── index.ts           # Actions
│   │   │   └── schema.ts          # Validações Zod
│   │   └── Upsert-transaction/
│   ├── _components/                 # Componentes React
│   │   ├── ui/                    # Componentes base (shadcn/ui)
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (outros)
│   │   ├── assistant/             # Componentes da IA
│   │   │   ├── assistant-panel.tsx
│   │   │   └── assistant-button.tsx
│   │   ├── subscription/          # Componentes de Assinaturas
│   │   │   ├── subscription-card.tsx
│   │   │   └── upsert-subscription-dialog.tsx
│   │   ├── navbar.tsx
│   │   ├── login-form.tsx
│   │   ├── providers.tsx
│   │   └── ... (outros)
│   ├── _constants/                  # Constantes
│   │   └── transactions.ts
│   ├── _lib/                        # Utilitários e Serviços
│   │   ├── ai.ts                  # ⭐ Serviço de IA
│   │   ├── logo-detection.ts      # ⭐ Detecção de Logos
│   │   ├── prisma.ts              # Cliente Prisma
│   │   └── utils.ts               # Helpers
│   ├── api/                         # API Routes
│   │   ├── ai/
│   │   │   ├── chat/route.ts      # ⭐ Endpoint de Chat
│   │   │   └── insights/route.ts  # ⭐ Endpoint de Insights
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── subscriptions/
│   │       └── detect-logo/route.ts # ⭐ Detecção de Logo
│   ├── generated/                   # Prisma Client gerado
│   │   └── prisma/
│   ├── login/
│   │   └── page.tsx               # Página de Login
│   ├── subscription/                # ⭐ Módulo de Assinaturas
│   │   ├── _components/
│   │   │   └── subscriptions-client.tsx
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx               # Página de Transações
│   ├── layout.tsx                   # Layout Global
│   ├── page.tsx                     # Dashboard
│   └── globals.css
├── prisma/
│   ├── schema.prisma                # ⭐ Schema atualizado
│   └── seed.js                      # Seed do banco
├── scripts/
│   └── check-due-subscriptions.ts   # ⭐ Script de verificação
├── types/
│   ├── ai.d.ts                      # ⭐ Tipos da IA
│   └── subscription.d.ts            # ⭐ Tipos de Assinaturas
├── __tests__/                       # ⭐ Testes unitários
│   ├── ai.test.ts
│   ├── logo-detection.test.ts
│   └── subscription-schema.test.ts
├── public/
│   ├── logos/                       # ⭐ Logos de fallback
│   │   └── default.svg
│   ├── logo.svg
│   └── login.png
├── auth.ts                          # Configuração NextAuth
├── middleware.ts                    # Middleware de autenticação
├── vitest.config.ts                 # ⭐ Config de testes
├── .env.example                     # Exemplo de variáveis de ambiente
├── README.md                        # Este arquivo
├── package.json
└── tsconfig.json

⭐ = Arquivos/Diretórios novos na v2.0
```

---

## 📦 Instalação

### Pré-requisitos

- Node.js 20+ 
- npm ou yarn
- XAMPP instalado com MySQL ativo
- (Opcional) Conta no [Hugging Face](https://huggingface.co) para IA

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/finance-ai.git
cd finance-ai
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` (veja seção [Variáveis de Ambiente](#variáveis-de-ambiente))

4. **Configure o banco de dados**

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma migrate dev --name init

# (Opcional) Popular com dados de teste
npm run seed
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

6. **Acesse**

```
http://localhost:3000
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```env
# Database (Obrigatório) - MySQL XAMPP
DATABASE_URL="mysql://root:@localhost:3306/finance_ai"

# NextAuth (Obrigatório)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui" # Use: openssl rand -base64 32

# Google OAuth (Obrigatório para login com Google)
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"

# Hugging Face (Opcional - para IA avançada)
HF_API_KEY="hf_seu_token_aqui"

# Email (Opcional - para notificações por email)
SEND_EMAILS="false"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu@email.com"
SMTP_PASS="sua-senha"
```

### Obter Credenciais

#### 1. MySQL (XAMPP)

1. Instale o [XAMPP](https://www.apachefriends.org/)
2. Inicie o MySQL através do painel de controle do XAMPP
3. Acesse phpMyAdmin (http://localhost/phpmyadmin)
4. Crie um banco de dados chamado `finance_ai` (ou use o nome que preferir)
5. Configure a `DATABASE_URL` no formato:
   ```
   mysql://usuario:senha@localhost:3306/nome_do_banco
   ```
   
   Exemplo padrão (usuário root sem senha):
   ```
   DATABASE_URL="mysql://root:@localhost:3306/finance_ai"
   ```
   
   **Nota:** Se você configurou uma senha para o root do MySQL, use:
   ```
   DATABASE_URL="mysql://root:suasenha@localhost:3306/finance_ai"
   ```

#### 2. Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto
3. Ative Google+ API
4. Crie credenciais OAuth 2.0:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copie Client ID e Client Secret

#### 3. Hugging Face (Opcional)

1. Acesse [huggingface.co](https://huggingface.co)
2. Crie uma conta
3. Vá em Settings > Access Tokens
4. Crie um token de **Read**
5. Copie o token (começa com `hf_`)

**Nota:** A IA funciona sem Hugging Face usando fallback local!

---

## 🔐 Autenticação

### NextAuth v5 (Auth.js)

O projeto usa NextAuth v5 com:
- **Adapter:** PrismaAdapter (salva sessões no MySQL)
- **Strategy:** JWT
- **Providers:**
  - **Google OAuth** - Login social
  - **Credentials** - Email/Senha (bcrypt)

### Usuário de Teste

Após rodar `npm run seed`, use:

```
Email: teste@finance.ai
Senha: 123456
```

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Escolhe provider (Google ou Email/Senha)
3. NextAuth valida credenciais
4. Session JWT é criada
5. Middleware protege rotas automáticamente
6. Usuário é redirecionado para `/` (dashboard)

---

## 💾 Banco de Dados

### Modelos Prisma

#### User
Usuário do sistema (NextAuth)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  transactions  Transaction[]
  subscriptions Subscription[]  // ⭐ Novo
  notifications Notification[]   // ⭐ Novo
}
```

#### Transaction
Transações financeiras

```prisma
model Transaction {
  id            String @id @default(uuid())
  name          String
  type          TransactionType  // DEPOSIT, EXPENSE, INVESTMENT
  amount        Float
  category      TransactionCategory
  paymentMethod TransactionPaymentMethod
  date          DateTime?
  userId        String
  user          User @relation(...)
}
```

#### Subscription ⭐ Novo
Assinaturas e pagamentos recorrentes

```prisma
model Subscription {
  id          String    @id @default(cuid())
  userId      String
  name        String
  logoUrl     String?         // Logo automático
  amount      Float
  dueDate     DateTime
  recurring   Boolean @default(true)
  nextDueDate DateTime?       // Calculado automaticamente
  active      Boolean @default(true)
  user        User @relation(...)
}
```

#### Notification ⭐ Novo
Sistema de notificações

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType  // SUBSCRIPTION_DUE, AI_INSIGHT, etc.
  title     String
  message   String
  read      Boolean  @default(false)
  meta      Json?                // Metadata flexível
  user      User @relation(...)
}
```

### Migrações

```bash
# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações
npx prisma migrate deploy

# Resetar banco (cuidado!)
npx prisma migrate reset
```

---

## 🤖 Assistente de IA

### Visão Geral

O Assistente de IA é **100% gratuito** e usa:
- **Hugging Face Inference API** (se configurada)
- **Fallback local** baseado em regras (sempre disponível)

### Funcionalidades

#### 1. Chat Interativo
Faça perguntas em linguagem natural:

```
"Quanto gastei em alimentação esse mês?"
"Me dê um resumo financeiro"
"Quais minhas maiores despesas?"
```

#### 2. Geração de Insights
Clique em "Gerar Insights" para:
- Análise automática de transações
- Top 3 categorias de gastos
- Alertas de gastos elevados
- Dicas de economia
- Status de saldo (positivo/negativo)
- Assinaturas vencendo

#### 3. Exemplos de Uso

**Análise de Gastos:**
```typescript
POST /api/ai/insights
{
  "from": "2025-01-01",
  "to": "2025-01-31"
}

// Retorna
{
  "ok": true,
  "insights": [
    {
      "id": "high-expenses",
      "title": "Gastos Elevados",
      "detail": "Você gastou R$ 5.200 neste período...",
      "severity": "high"
    }
  ]
}
```

**Chat:**
```typescript
POST /api/ai/chat
{
  "message": "Quanto gastei?"
}

// Retorna
{
  "ok": true,
  "message": {
    "role": "assistant",
    "content": "Você gastou R$ 3.450 no total..."
  }
}
```

### Configuração da IA

#### Com Hugging Face (Recomendado)

1. Obtenha token em [huggingface.co](https://huggingface.co)
2. Adicione ao `.env.local`:
   ```env
   HF_API_KEY="hf_seu_token"
   ```
3. Reinicie o servidor

#### Sem Hugging Face (Fallback Local)

O sistema funciona automaticamente sem configuração! Usa análise baseada em regras:
- ✅ Suporte a perguntas comuns
- ✅ Análise de categorias
- ✅ Cálculos de saldos
- ✅ Resumos financeiros

### Segurança

- ✅ Sanitização de inputs (XSS)
- ✅ Limite de 2000 caracteres
- ✅ Validação com Zod
- ✅ Rate limiting (TODO)

### Modelos Suportados

- **Padrão:** Mistral-7B-Instruct-v0.2
- **Alternativas:** Qualquer modelo do Hugging Face

Para mudar o modelo, edite `app/_lib/ai.ts`:

```typescript
const HF_MODEL = "meta-llama/Llama-2-7b-chat-hf"; // Exemplo
```

---

## 💳 Assinaturas

### Visão Geral

Gerencie assinaturas e pagamentos recorrentes com:
- Detecção automática de logos
- Alertas de vencimento
- Dashboard de gastos mensais

### Detecção Automática de Logos

#### Serviços Suportados (60+)

**Streaming:**
Netflix, Spotify, YouTube Premium, Amazon Prime, Disney+, HBO Max, Paramount+, Star+, Globoplay, Deezer, Tidal, SoundCloud, Audible

**Cloud & Produtividade:**
Microsoft 365, Google One, Dropbox, iCloud, OneDrive, Notion, Trello, Asana, Figma, Canva

**Redes Sociais:**
LinkedIn Premium, Twitter, Instagram, Facebook

**E muito mais!**

#### Como Funciona

1. **Busca Exata:** Verifica mapeamento interno
2. **Busca Parcial:** Detecta palavras-chave
3. **Clearbit (Opcional):** Tenta buscar por domínio
4. **Fallback:** Usa ícone genérico

```typescript
// Automático ao criar/editar
const result = await createSubscription({
  name: "Netflix",  // Logo detectado automaticamente
  amount: 39.90,
  dueDate: new Date("2025-02-01"),
});
```

### Alertas de Vencimento

#### Script Automático

```bash
npm run check-due-subscriptions
```

**O que faz:**
- Verifica assinaturas vencendo em 7 dias
- Cria notificações no banco
- (Opcional) Envia emails

**Agendar com Cron:**

```bash
# Linux/Mac - Editar crontab
crontab -e

# Rodar todo dia às 9h
0 9 * * * cd /caminho/finance-ai && npm run check-due-subscriptions
```

**Windows Task Scheduler:** Use interface gráfica

### Dashboard de Assinaturas

- Total de assinaturas ativas
- Gasto mensal total
- Vencimentos nos próximos 7 dias
- Lista completa com status visual
- Edição rápida

---

## 🎯 Como Usar

### 1. Primeiro Acesso

1. Acesse `http://localhost:3000/login`
2. Faça login com:
   - **Google** (recomendado)
   - **Email/Senha de teste:**
     ```
     Email: teste@finance.ai
     Senha: 123456
     ```

### 2. Dashboard

- Visualize resumo financeiro
- Acesse módulos (Transações, Assinaturas)
- Abra o Assistente de IA (botão flutuante)

### 3. Gerenciar Transações

1. Clique em "Transações" no menu
2. "Adicionar Transação"
3. Preencha:
   - Nome
   - Valor
   - Tipo (Receita/Despesa/Investimento)
   - Categoria
   - Método de pagamento
   - Data
4. Salvar

### 4. Usar o Assistente de IA

1. Clique no botão flutuante (🤖) no canto inferior direito
2. **Opções:**
   - Digite uma pergunta
   - Clique em "Insights" para análise automática
   - Clique em "Resumo" para visão geral

### 5. Gerenciar Assinaturas

1. Clique em "Assinatura" no menu
2. "Nova Assinatura"
3. Preencha:
   - Nome (logo será detectado)
   - Valor mensal
   - Data de vencimento
   - Recorrente? (sim/não)
   - Ativa? (sim/não)
4. Salvar

**Recursos:**
- 🔄 Atualizar logo manualmente
- ✏️ Editar assinatura
- 🗑️ Deletar assinatura

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (Turbopack)

# Build
npm run build            # Build para produção
npm start                # Inicia servidor produção

# Banco de Dados
npx prisma generate      # Gerar Prisma Client
npx prisma migrate dev   # Criar migração
npx prisma studio        # Interface visual do banco
npm run seed             # Popular banco com dados de teste

# Assinaturas
npm run check-due-subscriptions  # Verificar vencimentos

# Testes
npm test                 # Rodar todos os testes
npm test -- --watch      # Modo watch
npm test -- --coverage   # Com coverage

# Code Quality
npm run lint             # Rodar ESLint
npm run format           # Formatar código (Prettier - manual)
```

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Teste específico
npm test logo-detection

# Com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Testes Implementados

- ✅ **Logo Detection** - Detecção de logos
- ✅ **AI Service** - Serviço de IA e sanitização
- ✅ **Subscription Schemas** - Validação Zod

Veja [TESTS.md](./TESTS.md) para detalhes.

---

## 🐛 Troubleshooting

### Erro: `@prisma/client did not initialize yet`

```bash
# Solução
npx prisma generate
npm run dev
```

### Erro: `Module not found: @radix-ui/react-alert-dialog`

```bash
# Instalar dependência faltante
npm install @radix-ui/react-alert-dialog

# Ou reinstalar tudo
rm -rf node_modules package-lock.json
npm install
```

### Erro: `Environment variable not found: DATABASE_URL`

1. Verifique se `.env.local` existe
2. Confirme `DATABASE_URL` está definida
3. Reinicie o servidor COMPLETAMENTE (Ctrl+C e `npm run dev`)

### Erro: `MissingSecret: Please define a secret`

```bash
# Gerar secret
openssl rand -base64 32

# Adicionar ao .env.local
NEXTAUTH_SECRET="sua-chave-gerada"
```

### IA não funciona / Respostas vazias

- ✅ Verifique se `HF_API_KEY` está correta (ou remova para usar fallback)
- ✅ Confirme que há transações no banco
- ✅ Teste com perguntas simples: "resumo", "quanto gastei?"

### Logos não aparecem

1. Verifique se `/public/logos/default.svg` existe
2. Confirme que a logo detection está ativa:
   ```bash
   npm test logo-detection
   ```
3. Tente atualizar logo manualmente no card

### Script de assinaturas não funciona

```bash
# Verificar se o banco tem assinaturas
npx prisma studio

# Executar com logs
npm run check-due-subscriptions

# Verificar variáveis de ambiente
cat .env.local | grep DATABASE_URL
```

---

## 🚀 Deploy (Produção)

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte no [Vercel](https://vercel.com)
3. Configure variáveis de ambiente
4. Deploy automático

### Outras Plataformas

- **Railway:** Suporta MySQL integrado
- **Render:** Fácil configuração
- **AWS/Digital Ocean:** Mais controle

**Importante:**
- Configure `NEXTAUTH_URL` para domínio de produção
- Use `NEXTAUTH_SECRET` forte e único
- Configure `HF_API_KEY` se quiser IA avançada

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

MIT © 2025

---

## 👨‍💻 Autor

Desenvolvido com ❤️ e IA

---

## 🎉 Agradecimentos

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://www.prisma.io)
- [Hugging Face](https://huggingface.co)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?
- Abra uma [Issue](https://github.com/seu-usuario/finance-ai/issues)
- Entre em contato: seu@email.com

---

<div align="center">

**Feito com ❤️ usando Next.js 15, NextAuth v5, Prisma e modelos de IA open-source**

</div>
