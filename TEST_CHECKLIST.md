# ✅ Checklist de Testes - Finance AI

Use este checklist para garantir que todos os aspectos do sistema estão funcionando corretamente.

## 🚀 Como Usar

### Teste Automatizado Completo
```bash
# Windows
.\scripts\test-all.bat

# Linux/Mac
chmod +x scripts/test-all.sh
./scripts/test-all.sh

# Ou diretamente
npm run test:all
```

---

## 📋 Checklist Manual

### 🔧 Pré-requisitos e Configuração

- [ ] **Node.js instalado** (versão 20+)
  ```bash
  node --version
  ```

- [ ] **Dependências instaladas**
  ```bash
  npm install
  ```

- [ ] **Variáveis de ambiente configuradas** (`.env.local`)
  - [ ] `DATABASE_URL` definida
  - [ ] `NEXTAUTH_SECRET` definida
  - [ ] `NEXTAUTH_URL=http://localhost:3000` (opcional)
  - [ ] `HF_API_KEY` (opcional, para IA)

- [ ] **Banco de dados configurado**
  ```bash
  npm run test:db
  ```

- [ ] **Prisma Client gerado**
  ```bash
  npx prisma generate
  ```

---

### 🗄️ Banco de Dados

- [ ] **Conexão com MySQL funciona**
  ```bash
  npm run test:db
  ```

- [ ] **Tabelas criadas**
  ```bash
  npx prisma migrate dev
  ```

- [ ] **Seed executado** (usuário de teste)
  ```bash
  npm run seed
  ```

- [ ] **Prisma Studio funciona**
  ```bash
  npx prisma studio
  ```

---

### 🏗️ Build e Compilação

- [ ] **TypeScript compila sem erros**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Build de produção funciona**
  ```bash
  npm run build
  ```

- [ ] **Sem erros de lint**
  ```bash
  npm run lint
  ```

---

### 🧪 Testes Unitários

- [ ] **Todos os testes passam**
  ```bash
  npm test
  ```

- [ ] **Teste de IA**
  - [ ] Sanitização de input funciona
  - [ ] Limite de tamanho funciona
  - [ ] Fallback funciona sem API key

- [ ] **Teste de detecção de logo**
  - [ ] URLs válidas são aceitas
  - [ ] URLs inválidas são rejeitadas

- [ ] **Teste de schema de assinatura**
  - [ ] Validação Zod funciona
  - [ ] Campos obrigatórios validados

---

### 🌐 Servidor de Desenvolvimento

- [ ] **Servidor inicia sem erros**
  ```bash
  npm run dev
  ```

- [ ] **Acessa `http://localhost:3000`**
  - [ ] Página carrega
  - [ ] Sem erros no console do navegador
  - [ ] Sem erros no terminal

- [ ] **Hot reload funciona**
  - [ ] Mudanças em arquivos recarregam automaticamente

---

### 🔐 Autenticação

- [ ] **Página de login carrega**
  - [ ] URL: `http://localhost:3000/login`
  - [ ] Formulário aparece
  - [ ] Botão Google aparece (se configurado)

- [ ] **Login com credenciais funciona**
  - [ ] Email: `teste@finance.ai`
  - [ ] Senha: `123456`
  - [ ] Redireciona para dashboard após login

- [ ] **Middleware de autenticação funciona**
  - [ ] Usuário não autenticado é redirecionado para `/login`
  - [ ] Usuário autenticado acessa páginas protegidas

- [ ] **Logout funciona**
  - [ ] Botão de logout existe
  - [ ] Logout redireciona para login

---

### 📊 Dashboard

- [ ] **Dashboard carrega após login**
  - [ ] Estatísticas aparecem (receitas, despesas, investimentos)
  - [ ] Gráficos aparecem
  - [ ] Transações recentes aparecem

- [ ] **Dados são exibidos corretamente**
  - [ ] Valores monetários formatados
  - [ ] Datas formatadas
  - [ ] Categorias aparecem

- [ ] **Gráficos funcionam**
  - [ ] Gráfico de pizza (gastos por categoria)
  - [ ] Gráfico de linha (transações por dia)

---

### 💰 Transações

- [ ] **Lista de transações carrega**
  - [ ] URL: `http://localhost:3000/transactions`
  - [ ] Tabela aparece com transações

- [ ] **Criar transação funciona**
  - [ ] Botão "Nova Transação" funciona
  - [ ] Formulário aparece
  - [ ] Salvar cria transação
  - [ ] Transação aparece na lista

- [ ] **Editar transação funciona**
  - [ ] Botão de editar funciona
  - [ ] Formulário pré-preenchido
  - [ ] Salvar atualiza transação

- [ ] **Deletar transação funciona**
  - [ ] Botão de deletar funciona
  - [ ] Confirmação aparece
  - [ ] Transação é removida

- [ ] **Filtros funcionam**
  - [ ] Filtro por tipo
  - [ ] Filtro por categoria
  - [ ] Filtro por data

---

### 📅 Assinaturas

- [ ] **Lista de assinaturas carrega**
  - [ ] URL: `http://localhost:3000/subscription`
  - [ ] Cards de assinaturas aparecem

- [ ] **Criar assinatura funciona**
  - [ ] Botão "Nova Assinatura" funciona
  - [ ] Formulário aparece
  - [ ] Detecção de logo funciona
  - [ ] Salvar cria assinatura

- [ ] **Editar assinatura funciona**
  - [ ] Botão de editar funciona
  - [ ] Formulário pré-preenchido
  - [ ] Salvar atualiza assinatura

- [ ] **Deletar assinatura funciona**
  - [ ] Botão de deletar funciona
  - [ ] Confirmação aparece
  - [ ] Assinatura é removida

- [ ] **Assinaturas próximas do vencimento aparecem no dashboard**

---

### 🎯 Metas (Goals)

- [ ] **Lista de metas carrega**
  - [ ] URL: `http://localhost:3000/goals`
  - [ ] Cards de metas aparecem

- [ ] **Criar meta funciona**
  - [ ] Botão "Nova Meta" funciona
  - [ ] Formulário aparece
  - [ ] Salvar cria meta

- [ ] **Progresso da meta é exibido corretamente**
  - [ ] Barra de progresso aparece
  - [ ] Porcentagem calculada corretamente

- [ ] **Metas ativas aparecem no dashboard**

---

### 🤖 Assistente de IA

- [ ] **Botão do assistente aparece**
  - [ ] No dashboard
  - [ ] Em outras páginas

- [ ] **Chat funciona**
  - [ ] Painel abre ao clicar
  - [ ] Mensagens podem ser enviadas
  - [ ] Respostas aparecem
  - [ ] Histórico é mantido

- [ ] **Insights da IA aparecem no dashboard**
  - [ ] Insight principal aparece
  - [ ] Severidade é exibida (alta/média/baixa)

---

### 📱 Responsividade

- [ ] **Layout funciona em desktop** (1920x1080)
- [ ] **Layout funciona em tablet** (768x1024)
- [ ] **Layout funciona em mobile** (375x667)
- [ ] **Menu hambúrguer funciona em mobile**
- [ ] **Tabelas são responsivas**
- [ ] **Gráficos são responsivos**

---

### 🔔 Notificações

- [ ] **Notificações aparecem**
  - [ ] Ícone de notificação no navbar
  - [ ] Contador de não lidas aparece

- [ ] **Dropdown de notificações funciona**
  - [ ] Abre ao clicar
  - [ ] Lista de notificações aparece
  - [ ] Marcar como lida funciona

---

### ⚙️ Configurações

- [ ] **Página de configurações carrega**
  - [ ] URL: `http://localhost:3000/settings`
  - [ ] Tabs aparecem

- [ ] **Alterar senha funciona**
  - [ ] Formulário aparece
  - [ ] Validação funciona
  - [ ] Senha é atualizada

- [ ] **Perfil do usuário pode ser editado**
  - [ ] Nome pode ser alterado
  - [ ] Imagem pode ser alterada

---

### 🔍 Funcionalidades Especiais

- [ ] **Conta familiar funciona** (se aplicável)
  - [ ] Usuários podem ser adicionados
  - [ ] Transações compartilhadas aparecem

- [ ] **Analytics funciona**
  - [ ] URL: `http://localhost:3000/analytics`
  - [ ] Gráficos e estatísticas aparecem

- [ ] **Economia funciona**
  - [ ] URL: `http://localhost:3000/economy`
  - [ ] Dados são exibidos

---

### 🐛 Testes de Erro

- [ ] **Erro 404 funciona**
  - [ ] Página não encontrada mostra mensagem

- [ ] **Erro de autenticação funciona**
  - [ ] Credenciais inválidas mostram erro
  - [ ] Sessão expirada redireciona

- [ ] **Erro de banco de dados é tratado**
  - [ ] Mensagens de erro aparecem
  - [ ] Sistema não quebra

---

### 🧹 Limpeza e Manutenção

- [ ] **Cache pode ser limpo**
  ```bash
  npm run clean:win  # Windows
  npm run clean      # Linux/Mac
  ```

- [ ] **Cookies podem ser limpos**
  - [ ] URL: `http://localhost:3000/clear-cookies`
  - [ ] Limpa cookies problemáticos

- [ ] **Script de verificação de assinaturas funciona**
  ```bash
  npm run check-due-subscriptions
  ```

---

## 📝 Notas

- Marque cada item conforme você testa
- Se algum item falhar, anote o erro
- Execute o teste automatizado primeiro: `npm run test:all`
- Use este checklist antes de fazer deploy

---

## 🎯 Prioridades

### Crítico (deve funcionar sempre)
- ✅ Autenticação
- ✅ Banco de dados
- ✅ Transações (CRUD)
- ✅ Dashboard básico

### Importante (deve funcionar na maioria dos casos)
- ✅ Assinaturas
- ✅ Metas
- ✅ Assistente de IA
- ✅ Responsividade

### Opcional (nice to have)
- ✅ Analytics avançado
- ✅ Conta familiar
- ✅ Notificações avançadas

---

**Última atualização:** $(date)



