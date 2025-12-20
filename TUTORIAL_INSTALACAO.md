# 🚀 Tutorial de Instalação - Finance AI

Guia passo a passo completo para configurar e subir o sistema Finance AI.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js 20+** ([Download](https://nodejs.org/))
- ✅ **npm** (vem com Node.js) ou **yarn**
- ✅ **XAMPP** com MySQL ativo ([Download](https://www.apachefriends.org/))
- ✅ **Git** (opcional, para clonar o repositório)

---

## 🔧 Passo 1: Preparar o Ambiente

### 1.1 Instalar Node.js

1. Baixe o Node.js 20+ em [nodejs.org](https://nodejs.org/)
2. Instale seguindo o assistente
3. Verifique a instalação:

```bash
node --version
npm --version
```

### 1.2 Instalar XAMPP

1. Baixe o XAMPP em [apachefriends.org](https://www.apachefriends.org/)
2. Instale (escolha MySQL e phpMyAdmin)
3. Abra o **XAMPP Control Panel**
4. Inicie o **MySQL** (clique em "Start")

### 1.3 Criar Banco de Dados

1. Abra o navegador e acesse: `http://localhost/phpmyadmin`
2. Clique em **"Novo"** (New) no menu lateral
3. Nome do banco: `finance_ai`
4. Colação: `utf8mb4_unicode_ci`
5. Clique em **"Criar"** (Create)

---

## 📥 Passo 2: Baixar o Projeto

### Opção A: Clonar do Git

```bash
git clone https://github.com/seu-usuario/finance-ai.git
cd finance-ai
```

### Opção B: Baixar ZIP

1. Baixe o projeto como ZIP
2. Extraia em uma pasta
3. Abra o terminal na pasta extraída

---

## 📦 Passo 3: Instalar Dependências

No terminal, na pasta do projeto:

```bash
npm install
```

**Aguarde** a instalação terminar (pode levar alguns minutos).

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local` (sem extensão).

### 4.2 Configurar DATABASE_URL

Edite o `.env.local` e adicione:

```env
# Banco de Dados MySQL (XAMPP)
DATABASE_URL="mysql://root:@localhost:3306/finance_ai"
```

**Nota:** Se você configurou senha para o MySQL, use:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/finance_ai"
```

### 4.3 Configurar NextAuth

Adicione ao `.env.local`:

```env
# NextAuth (Obrigatório)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

**Gerar NEXTAUTH_SECRET:**

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Cole o resultado no `NEXTAUTH_SECRET`.

### 4.4 Configurar Google OAuth (Opcional)

Para login com Google:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto
3. Ative **Google+ API**
4. Crie credenciais OAuth 2.0:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
5. Copie **Client ID** e **Client Secret**

Adicione ao `.env.local`:

```env
# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

### 4.5 Configurar IA (Opcional)

Para usar IA avançada com Hugging Face:

1. Acesse [huggingface.co](https://huggingface.co)
2. Crie uma conta
3. Vá em **Settings > Access Tokens**
4. Crie um token de **Read**
5. Copie o token (começa com `hf_`)

Adicione ao `.env.local`:

```env
# Hugging Face (Opcional - IA funciona sem isso)
HF_API_KEY="hf_seu_token_aqui"
```

**Nota:** A IA funciona sem Hugging Face usando fallback local!

### 4.6 Arquivo `.env.local` Completo (Exemplo)

```env
# Banco de Dados
DATABASE_URL="mysql://root:@localhost:3306/finance_ai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-gerada"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"

# Hugging Face (Opcional)
HF_API_KEY="hf_seu_token_aqui"
```

---

## 🗄️ Passo 5: Configurar Banco de Dados

### 5.1 Gerar Prisma Client

```bash
npx prisma generate
```

### 5.2 Criar Tabelas no Banco

```bash
npx prisma migrate dev --name init
```

**Se aparecer erro de migração:**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### 5.3 Popular com Dados de Teste (Opcional)

```bash
npm run seed
```

Isso cria um usuário de teste:
- **Email:** `teste@finance.ai`
- **Senha:** `123456`

---

## 🚀 Passo 6: Iniciar o Servidor

### 6.1 Modo Desenvolvimento

```bash
npm run dev
```

Aguarde a mensagem:
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

### 6.2 Acessar o Sistema

Abra o navegador e acesse:
```
http://localhost:3000
```

Você será redirecionado para `/login`.

---

## 🔐 Passo 7: Fazer Login

### Opção 1: Login com Email/Senha (Teste)

Se você rodou `npm run seed`:

- **Email:** `teste@finance.ai`
- **Senha:** `123456`

### Opção 2: Login com Google

Se configurou Google OAuth, clique em "Continuar com Google".

### Opção 3: Criar Nova Conta

1. Clique em "Criar conta"
2. Preencha nome, email e senha
3. Faça login

---

## ✅ Verificação Final

### Checklist

- [ ] MySQL está rodando no XAMPP
- [ ] Banco `finance_ai` foi criado
- [ ] Arquivo `.env.local` configurado
- [ ] `npx prisma generate` executado com sucesso
- [ ] `npx prisma migrate dev` executado com sucesso
- [ ] `npm run dev` iniciou sem erros
- [ ] Acessou `http://localhost:3000` com sucesso
- [ ] Conseguiu fazer login

---

## 🐛 Problemas Comuns

### Erro: `@prisma/client did not initialize yet`

**Solução:**
```bash
npx prisma generate
npm run dev
```

### Erro: `Environment variable not found: DATABASE_URL`

**Solução:**
1. Verifique se `.env.local` existe na raiz do projeto
2. Confirme que `DATABASE_URL` está definida
3. Reinicie o servidor (Ctrl+C e `npm run dev`)

### Erro: `MissingSecret: Please define a secret`

**Solução:**
1. Gere um secret (veja Passo 4.3)
2. Adicione `NEXTAUTH_SECRET` ao `.env.local`
3. Reinicie o servidor

### Erro: `Can't reach database server`

**Solução:**
1. Verifique se MySQL está rodando no XAMPP
2. Confirme a `DATABASE_URL` está correta
3. Teste a conexão:
   ```bash
   npm run test:db
   ```

### Erro: `EPERM: operation not permitted` ao rodar `prisma generate`

**Solução:**
1. Pare o servidor (`Ctrl+C`)
2. Execute `npx prisma generate`
3. Reinicie o servidor

### Porta 3000 já está em uso

**Solução:**
1. Pare outros processos na porta 3000
2. Ou use outra porta:
   ```bash
   npm run dev -- -p 3001
   ```

---

## 📚 Próximos Passos

Após instalar com sucesso:

1. **Explore o Dashboard** - Veja o resumo financeiro
2. **Adicione Transações** - Registre receitas e despesas
3. **Use o Assistente de IA** - Clique no botão flutuante (🤖)
4. **Gerencie Assinaturas** - Adicione serviços recorrentes
5. **Configure Metas** - Defina objetivos financeiros
6. **Use a Página Freelancer** - Para trabalhadores autônomos

---

## 🎯 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev

# Banco de Dados
npx prisma generate      # Regenera Prisma Client
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Criar nova migração
npm run seed             # Popular banco com dados de teste

# Build para Produção
npm run build            # Build do projeto
npm start                # Inicia servidor produção

# Testes
npm test                 # Rodar testes
npm run lint             # Verificar código
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique a seção **Problemas Comuns** acima
2. Consulte o `README.md` principal
3. Verifique os logs do terminal
4. Abra uma issue no GitHub

---

## 🎉 Pronto!

Seu sistema Finance AI está rodando! 🚀

Acesse: **http://localhost:3000**

---

**Última atualização:** Janeiro 2025




