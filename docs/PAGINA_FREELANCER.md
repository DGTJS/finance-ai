# Página Freelancer - Documentação Completa

## 📋 Visão Geral

A página **Freelancer** (`/entrepreneur`) é uma ferramenta completa para trabalhadores autônomos e freelancers gerenciarem seus períodos de trabalho, calcular ganhos por hora/dia/mês, controlar despesas e organizar projetos/clientes.

**Rota:** `/entrepreneur`  
**Tipo:** Página Server-Side com componentes Client-Side  
**Tecnologias:** Next.js 15, React, TypeScript, Prisma, MySQL

---

## 🎯 Objetivo

Permitir que freelancers registrem manualmente seus períodos de trabalho (horário de início e fim), calculem automaticamente horas trabalhadas, registrem valores recebidos e despesas, e organizem tudo por projetos/clientes.

---

## 📊 Estrutura da Página

### 1. **Header**

- Título: "Freelancer"
- Descrição: "Gerencie seus períodos de trabalho e ganhos"

### 2. **Cards de Resumo (4 cards)**

- **Ganho Hoje**: Valor total recebido no dia atual
- **Horas do Mês**: Total de horas trabalhadas no mês atual
- **Ganho do Mês**: Valor total recebido no mês atual
- **Lucro Líquido**: Ganho total - Despesas totais do mês

### 3. **Seção de Projetos/Clientes**

- Lista de projetos cadastrados
- Botão "Novo Projeto" para criar projetos
- Cards mostrando: nome do cliente, projeto, valor/hora, status

### 4. **Seção de Períodos de Trabalho**

- Lista de períodos registrados (agrupados por data)
- Botões: "Atualizar" e "Adicionar Período"

---

## 🗄️ Modelo de Dados

### Tabela: `Project` (Projetos/Clientes)

```prisma
model Project {
  id          String   @id @default(cuid())
  userId      String
  clientName  String   // Nome do cliente (obrigatório)
  projectName String?  // Nome do projeto (opcional)
  hourlyRate  Float?   // Valor por hora de referência (opcional)
  status      ProjectStatus @default(ACTIVE)
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User        @relation(fields: [userId], references: [id])
  periods  WorkPeriod[]

  @@index([userId])
  @@index([status])
}

enum ProjectStatus {
  ACTIVE      // Projeto ativo
  PAUSED      // Projeto pausado
  COMPLETED   // Projeto concluído
  CANCELLED   // Projeto cancelado
}
```

**Campos:**

- `clientName`: Nome do cliente (ex: "João Silva")
- `projectName`: Nome específico do projeto (ex: "Desenvolvimento de Site")
- `hourlyRate`: Valor por hora de referência (ex: R$ 50,00/hora)
- `status`: Status do projeto (Ativo, Pausado, Concluído, Cancelado)
- `notes`: Observações sobre o projeto

### Tabela: `WorkPeriod` (Períodos de Trabalho)

```prisma
model WorkPeriod {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?  // Opcional - pode trabalhar sem projeto
  date        DateTime // Data do serviço
  startTime   DateTime // Horário de início
  endTime     DateTime // Horário de fim
  hours       Float    // Calculado automaticamente (em horas decimais)
  amount      Float    // Valor recebido neste período
  expenses    Float    @default(0) // Despesas deste período
  netProfit   Float    // Calculado: amount - expenses
  description String?  @db.Text // O que foi feito
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id])
  project Project? @relation(fields: [projectId], references: [id])

  @@index([userId])
  @@index([date])
  @@index([projectId])
}
```

**Campos:**

- `date`: Data do serviço
- `startTime`: Horário de início (ex: 08:00)
- `endTime`: Horário de fim (ex: 12:30)
- `hours`: Horas trabalhadas (calculado automaticamente: endTime - startTime)
- `amount`: Valor recebido neste período (ex: R$ 200,00)
- `expenses`: Despesas relacionadas (ex: R$ 20,00 de material)
- `netProfit`: Lucro líquido (calculado: amount - expenses)
- `description`: Descrição do trabalho realizado
- `projectId`: Projeto/cliente relacionado (opcional)

---

## 🔄 Fluxo de Uso

### Fluxo 1: Criar um Projeto/Cliente

1. **Acessar a página**: `/entrepreneur`
2. **Clicar em "Novo Projeto"** na seção de Projetos/Clientes
3. **Preencher o formulário**:
   - Nome do Cliente (obrigatório): "João Silva"
   - Nome do Projeto (opcional): "Desenvolvimento de Site"
   - Valor por Hora (opcional): R$ 50,00
   - Status: Ativo
   - Notas (opcional): Informações adicionais
4. **Clicar em "Criar"**
5. **Resultado**: Projeto criado e aparecendo na lista

### Fluxo 2: Registrar um Período de Trabalho

1. **Clicar em "Adicionar Período"**
2. **Preencher o formulário**:
   - **Data**: Selecionar a data do serviço (padrão: hoje)
   - **Horário Início**: Inserir horário (ex: 08:00)
   - **Horário Fim**: Inserir horário (ex: 12:30)
   - **Duração**: Calculada automaticamente (ex: 4h 30min)
   - **Projeto/Cliente**: Selecionar projeto ou deixar "Sem projeto"
     - Opção: Clicar em "Novo" para criar projeto rapidamente
   - **Valor Recebido**: R$ 200,00
   - **Despesas**: R$ 20,00 (materiais, transporte, etc.)
   - **Lucro Líquido**: Calculado automaticamente (R$ 180,00)
   - **Descrição**: "Desenvolvimento de funcionalidade X"
3. **Clicar em "Criar"**
4. **Resultado**:
   - Período criado e salvo no banco
   - Cards de resumo atualizados automaticamente
   - Período aparece na lista

### Fluxo 3: Visualizar Períodos

1. **Períodos são agrupados por data**
2. **Cada dia mostra**:
   - Data (ex: "15/12/2025")
   - Total de horas do dia
   - Total recebido do dia
   - Total de lucro do dia
3. **Cada período mostra**:
   - Horário início - fim (ex: 08:00 - 12:30)
   - Duração (ex: 4h 30min)
   - Cliente/Projeto (se houver)
   - Valor recebido
   - Despesas (se houver)
   - Lucro líquido
   - Descrição (se houver)
   - Botões: Editar e Excluir

### Fluxo 4: Editar Período

1. **Clicar no botão "Editar"** no período desejado
2. **Formulário abre com dados preenchidos**
3. **Modificar os campos necessários**
4. **Clicar em "Atualizar"**
5. **Resultado**: Período atualizado e lista atualizada

### Fluxo 5: Excluir Período

1. **Clicar no botão "Excluir"** (ícone de lixeira)
2. **Dialog de confirmação aparece**
3. **Confirmar exclusão**
4. **Resultado**: Período excluído e removido da lista

---

## 🧮 Cálculos Automáticos

### 1. Cálculo de Horas Trabalhadas

```typescript
function calculateHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  let diffMinutes = endMinutes - startMinutes;

  // Se o fim for antes do início, assumir que é no dia seguinte
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Adicionar 24 horas
  }

  return diffMinutes / 60; // Converter para horas decimais
}
```

**Exemplo:**

- Início: 08:00
- Fim: 12:30
- Cálculo: (12 × 60 + 30) - (8 × 60 + 0) = 750 - 480 = 270 minutos = 4.5 horas

### 2. Cálculo de Lucro Líquido

```typescript
netProfit = amount - expenses;
```

**Exemplo:**

- Valor recebido: R$ 200,00
- Despesas: R$ 20,00
- Lucro líquido: R$ 180,00

### 3. Estatísticas do Mês

```typescript
// Totais do mês
totalHours = sum(periods.hours);
totalAmount = sum(periods.amount);
totalExpenses = sum(periods.expenses);
totalNetProfit = sum(periods.netProfit);
averageHourlyRate = totalAmount / totalHours;
```

### 4. Estatísticas do Dia

```typescript
// Totais do dia atual
todayTotalHours = sum(periodsToday.hours);
todayTotalAmount = sum(periodsToday.amount);
todayTotalExpenses = sum(periodsToday.expenses);
todayTotalNetProfit = sum(periodsToday.netProfit);
```

---

## 📁 Estrutura de Arquivos

```
app/entrepreneur/
├── page.tsx                          # Página principal (Server Component)
└── _components/
    ├── entrepreneur-client.tsx       # Componente cliente principal
    ├── work-period-form.tsx          # Formulário de adicionar/editar período
    ├── work-period-list.tsx           # Lista de períodos agrupados por data
    ├── project-form.tsx              # Formulário de adicionar/editar projeto
    └── utils.ts                      # Funções auxiliares (formatação)

app/_actions/
├── work-period/
│   └── index.ts                      # Server actions para períodos
└── project/
    └── index.ts                      # Server actions para projetos
```

---

## 🔧 Server Actions

### Work Period Actions (`app/_actions/work-period/index.ts`)

#### `createWorkPeriod(data: WorkPeriodInput)`

- **Função**: Cria um novo período de trabalho
- **Validação**: Schema Zod
- **Cálculos**: Horas e lucro líquido calculados automaticamente
- **Retorno**: `{ success: boolean, data?: WorkPeriod, error?: string }`

#### `updateWorkPeriod(id: string, data: Partial<WorkPeriodInput>)`

- **Função**: Atualiza um período existente
- **Validação**: Verifica permissão (apenas o dono pode editar)
- **Recálculo**: Recalcula horas e lucro se necessário
- **Retorno**: `{ success: boolean, data?: WorkPeriod, error?: string }`

#### `deleteWorkPeriod(id: string)`

- **Função**: Exclui um período
- **Validação**: Verifica permissão
- **Retorno**: `{ success: boolean, error?: string }`

#### `getWorkPeriods(startDate?: Date, endDate?: Date)`

- **Função**: Busca períodos com filtro de data
- **Inclui**: Relacionamento com projeto
- **Ordenação**: Por data (mais recente primeiro)
- **Retorno**: `{ success: boolean, data: WorkPeriod[], error?: string }`

#### `getWorkPeriodStats(startDate?: Date, endDate?: Date)`

- **Função**: Calcula estatísticas agregadas
- **Retorna**: Total de horas, ganhos, despesas, lucro, média por hora
- **Retorno**: `{ success: boolean, data: Stats, error?: string }`

### Project Actions (`app/_actions/project/index.ts`)

#### `createProject(data: ProjectInput)`

- **Função**: Cria um novo projeto/cliente
- **Validação**: Schema Zod
- **Retorno**: `{ success: boolean, data?: Project, error?: string }`

#### `updateProject(id: string, data: Partial<ProjectInput>)`

- **Função**: Atualiza um projeto existente
- **Validação**: Verifica permissão
- **Retorno**: `{ success: boolean, data?: Project, error?: string }`

#### `deleteProject(id: string)`

- **Função**: Exclui um projeto
- **Validação**: Verifica permissão
- **Retorno**: `{ success: boolean, error?: string }`

#### `getProjects()`

- **Função**: Busca todos os projetos do usuário
- **Inclui**: Contagem de períodos relacionados
- **Ordenação**: Por data de criação (mais recente primeiro)
- **Retorno**: `{ success: boolean, data: Project[], error?: string }`

---

## 🎨 Componentes

### 1. `EntrepreneurClient` (Componente Principal)

**Localização**: `app/entrepreneur/_components/entrepreneur-client.tsx`

**Props:**

```typescript
interface EntrepreneurClientProps {
  initialPeriods: WorkPeriod[];
  initialStats: Stats;
  todayStats: Stats;
  initialProjects: Project[];
}
```

**Funcionalidades:**

- Gerencia estado dos períodos, estatísticas e projetos
- Renderiza cards de resumo
- Gerencia abertura/fechamento de formulários
- Atualização de dados (refresh)

**Estados:**

- `periods`: Lista de períodos
- `stats`: Estatísticas do mês
- `todayStats`: Estatísticas do dia
- `projects`: Lista de projetos
- `isFormOpen`: Controla abertura do formulário de período
- `isProjectFormOpen`: Controla abertura do formulário de projeto
- `isRefreshing`: Estado de loading do refresh

### 2. `WorkPeriodForm` (Formulário de Período)

**Localização**: `app/entrepreneur/_components/work-period-form.tsx`

**Props:**

```typescript
interface WorkPeriodFormProps {
  isOpen: boolean;
  onClose: () => void;
  period?: WorkPeriod | null;
  projects: Project[];
  onSuccess: () => void;
  onProjectCreated?: () => void;
}
```

**Funcionalidades:**

- Formulário para criar/editar período
- Cálculo automático de horas em tempo real
- Cálculo automático de lucro líquido
- Integração com formulário de projeto (criar projeto rápido)
- Validação com Zod
- Conversão de horários para fuso brasileiro

**Campos do Formulário:**

1. **Data**: DatePicker (padrão: hoje, horário brasileiro)
2. **Horário Início**: Input type="time" (formato HH:mm)
3. **Horário Fim**: Input type="time" (formato HH:mm)
4. **Duração**: Calculada automaticamente e exibida
5. **Projeto/Cliente**: Select com opção "Novo" para criar rapidamente
6. **Valor Recebido**: MoneyInput (R$)
7. **Despesas**: MoneyInput (R$)
8. **Lucro Líquido**: Calculado e exibido automaticamente
9. **Descrição**: Textarea (opcional)

**Validações:**

- Data: obrigatória
- Horários: formato HH:mm válido
- Valor recebido: deve ser positivo
- Despesas: não pode ser negativa

### 3. `WorkPeriodList` (Lista de Períodos)

**Localização**: `app/entrepreneur/_components/work-period-list.tsx`

**Props:**

```typescript
interface WorkPeriodListProps {
  periods: WorkPeriod[];
  onEdit: (period: WorkPeriod) => void;
  onDelete: () => void;
}
```

**Funcionalidades:**

- Agrupa períodos por data
- Exibe totais do dia (horas, ganho, despesas, lucro)
- Permite editar e excluir períodos
- Dialog de confirmação para exclusão
- Formatação de horários no fuso brasileiro

**Estrutura de Exibição:**

```
📅 15/12/2025
   Total: 4h 30min | R$ 200,00 | Lucro: R$ 180,00

   🕐 08:00 - 12:30 (4h 30min)
      Cliente: João Silva - Desenvolvimento de Site
      Recebido: R$ 200,00
      Despesas: R$ 20,00
      Lucro: R$ 180,00
      [✏️ Editar] [🗑️ Excluir]
```

### 4. `ProjectForm` (Formulário de Projeto)

**Localização**: `app/entrepreneur/_components/project-form.tsx`

**Props:**

```typescript
interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess: () => void;
}
```

**Funcionalidades:**

- Formulário para criar/editar projeto
- Validação com Zod
- Campos opcionais e obrigatórios

**Campos do Formulário:**

1. **Nome do Cliente**: Input (obrigatório)
2. **Nome do Projeto**: Input (opcional)
3. **Valor por Hora**: MoneyInput (opcional, referência)
4. **Status**: Select (Ativo, Pausado, Concluído, Cancelado)
5. **Notas**: Textarea (opcional)

### 5. `utils.ts` (Funções Auxiliares)

**Localização**: `app/entrepreneur/_components/utils.ts`

**Funções:**

#### `formatCurrency(value: number): string`

Formata valores monetários em Real brasileiro.

```typescript
formatCurrency(200.5); // "R$ 200,50"
```

#### `formatHours(hours: number): string`

Formata horas decimais em formato legível.

```typescript
formatHours(4.5); // "4h 30min"
formatHours(1.0); // "1h"
formatHours(0.5); // "30min"
```

#### `formatTime(date: Date): string`

Formata horário no fuso brasileiro.

```typescript
formatTime(new Date("2025-12-15T08:00:00Z")); // "08:00" (horário brasileiro)
```

#### `formatDate(date: Date): string`

Formata data no formato brasileiro.

```typescript
formatDate(new Date("2025-12-15")); // "15/12/2025"
```

---

## 🌍 Tratamento de Fuso Horário

### Horário Brasileiro (America/Sao_Paulo)

Todos os horários são tratados no fuso horário brasileiro:

1. **Ao exibir**: Horários são convertidos para horário brasileiro
2. **Ao salvar**: Horários são salvos no banco (UTC) mas interpretados como brasileiro
3. **Ao editar**: Horários salvos são convertidos para horário brasileiro antes de exibir

**Implementação:**

```typescript
// Formatação com fuso horário
new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
}).format(date);
```

---

## 📊 Exemplo de Uso Completo

### Cenário: Freelancer registra 3 serviços no dia

**Serviço 1:**

- Data: 15/12/2025
- Horário: 08:00 - 08:40 (40 minutos)
- Cliente: João Silva
- Valor recebido: R$ 100,00
- Despesas: R$ 20,00 (material)
- Lucro: R$ 80,00
- Descrição: "Reparo em computador"

**Serviço 2:**

- Data: 15/12/2025
- Horário: 14:00 - 15:30 (1h 30min)
- Cliente: Maria Santos
- Valor recebido: R$ 200,00
- Despesas: R$ 0,00
- Lucro: R$ 200,00
- Descrição: "Instalação de software"

**Serviço 3:**

- Data: 15/12/2025
- Horário: 18:00 - 19:15 (1h 15min)
- Cliente: João Silva
- Valor recebido: R$ 150,00
- Despesas: R$ 10,00 (transporte)
- Lucro: R$ 140,00
- Descrição: "Manutenção preventiva"

**Resultado no Sistema:**

**Card "Ganho Hoje":**

- R$ 450,00
- 3 períodos

**Card "Horas do Mês":**

- 45h 30min (acumulado do mês)
- 120 períodos (acumulado do mês)

**Card "Ganho do Mês":**

- R$ 4.500,00 (acumulado do mês)
- Média: R$ 98,90/hora

**Card "Lucro Líquido":**

- R$ 4.200,00 (acumulado do mês)
- Despesas: R$ 300,00

**Lista de Períodos:**

```
📅 15/12/2025
   Total: 3h 25min | R$ 450,00 | Lucro: R$ 420,00

   🕐 08:00 - 08:40 (40min)
      Cliente: João Silva
      Recebido: R$ 100,00 | Despesas: R$ 20,00
      Lucro: R$ 80,00

   🕐 14:00 - 15:30 (1h 30min)
      Cliente: Maria Santos
      Recebido: R$ 200,00
      Lucro: R$ 200,00

   🕐 18:00 - 19:15 (1h 15min)
      Cliente: João Silva
      Recebido: R$ 150,00 | Despesas: R$ 10,00
      Lucro: R$ 140,00
```

---

## 🔐 Segurança e Permissões

### Validações de Acesso

1. **Autenticação**: Usuário deve estar logado
2. **Autorização**: Usuário só pode ver/editar seus próprios períodos e projetos
3. **Validação de Dados**: Schema Zod valida todos os inputs
4. **Sanitização**: Dados são validados antes de salvar no banco

### Verificações Implementadas

```typescript
// Verificação de permissão em todas as actions
const userId = await getUserId();
const period = await db.workPeriod.findUnique({ where: { id } });

if (!period || period.userId !== userId) {
  return { success: false, error: "Sem permissão" };
}
```

---

## 🚀 Performance

### Otimizações

1. **Server Components**: Página principal é Server Component (melhor SEO e performance)
2. **Client Components**: Apenas componentes interativos são Client Components
3. **Revalidação**: `revalidatePath` após mutações para atualizar cache
4. **Agrupamento**: Períodos são agrupados no cliente (reduz processamento no servidor)
5. **Lazy Loading**: Formulários são carregados apenas quando necessário

### Queries Otimizadas

- Índices no banco: `userId`, `date`, `projectId`
- Filtros aplicados no banco (não no cliente)
- Relacionamentos carregados apenas quando necessário

---

## 🐛 Tratamento de Erros

### Erros Comuns e Soluções

1. **"Prisma Client não foi regenerado"**
   - **Causa**: Tabelas adicionadas mas Prisma Client não regenerado
   - **Solução**: Executar `npx prisma generate`

2. **"Não autorizado"**
   - **Causa**: Usuário não está logado
   - **Solução**: Fazer login

3. **"Horário inválido"**
   - **Causa**: Formato de horário incorreto
   - **Solução**: Usar formato HH:mm (ex: 08:30)

4. **"Valor deve ser positivo"**
   - **Causa**: Valor recebido é zero ou negativo
   - **Solução**: Inserir valor maior que zero

---

## 📝 Notas Técnicas

### Fuso Horário

- **Banco de Dados**: Armazena em UTC
- **Exibição**: Sempre no horário brasileiro (America/Sao_Paulo)
- **Input**: Usuário insere no horário brasileiro
- **Cálculos**: Feitos considerando horário brasileiro

### Formato de Horas

- **Armazenamento**: Decimal (ex: 4.5 horas)
- **Exibição**: Formato legível (ex: "4h 30min")
- **Cálculo**: Minutos convertidos para decimal (minutos / 60)

### Validação de Horários

- Aceita horários de 00:00 a 23:59
- Se fim < início, assume que é no dia seguinte
- Exemplo: 22:00 - 02:00 = 4 horas (trabalho noturno)

---

## 🔄 Fluxo de Dados Completo

```
┌─────────────────┐
│   Usuário       │
│   (Browser)     │
└────────┬────────┘
         │
         │ 1. Acessa /entrepreneur
         ▼
┌─────────────────┐
│  page.tsx       │
│  (Server)       │
└────────┬────────┘
         │
         │ 2. Busca dados iniciais
         ▼
┌─────────────────┐
│  Server Actions │
│  - getWorkPeriods()
│  - getWorkPeriodStats()
│  - getProjects()
└────────┬────────┘
         │
         │ 3. Query no banco
         ▼
┌─────────────────┐
│   Database      │
│   (MySQL)       │
└────────┬────────┘
         │
         │ 4. Retorna dados
         ▼
┌─────────────────┐
│  page.tsx       │
│  Passa props    │
└────────┬────────┘
         │
         │ 5. Renderiza componente
         ▼
┌─────────────────┐
│ Entrepreneur    │
│ Client          │
└────────┬────────┘
         │
         │ 6. Usuário interage
         │    (adiciona período)
         ▼
┌─────────────────┐
│ WorkPeriodForm  │
│ Valida dados    │
└────────┬────────┘
         │
         │ 7. Chama action
         ▼
┌─────────────────┐
│ createWorkPeriod│
│ (Server Action) │
└────────┬────────┘
         │
         │ 8. Salva no banco
         ▼
┌─────────────────┐
│   Database      │
│   (MySQL)       │
└────────┬────────┘
         │
         │ 9. Revalida path
         ▼
┌─────────────────┐
│  Router Refresh │
│  Atualiza UI    │
└─────────────────┘
```

---

## 🎨 UI/UX

### Design

- **Cards de Resumo**: Visual claro e direto
- **Formulários**: Dialog modal com validação em tempo real
- **Lista**: Agrupamento por data facilita visualização
- **Feedback**: Toasts para sucesso/erro
- **Loading**: Estados de loading em botões e ações

### Responsividade

- **Mobile**: Layout em coluna única
- **Tablet**: Grid de 2 colunas
- **Desktop**: Grid de 3-4 colunas

### Acessibilidade

- Labels descritivos
- Mensagens de erro claras
- Navegação por teclado
- ARIA labels nos botões

---

## 📈 Melhorias Futuras Sugeridas

1. **Relatórios**: Exportar relatórios em PDF/Excel
2. **Gráficos**: Visualização de ganhos ao longo do tempo
3. **Metas**: Definir metas de ganho mensal
4. **Notificações**: Lembretes para registrar períodos
5. **Integração**: Sincronizar com outras ferramentas
6. **Templates**: Salvar projetos como templates
7. **Recorrência**: Períodos recorrentes
8. **Tags**: Sistema de tags para categorizar períodos
9. **Filtros Avançados**: Filtrar por projeto, data, valor
10. **Dashboard**: Gráficos de produtividade e ganhos

---

## 🔗 Integração com Outras Páginas

### Menu

A página está acessível através do menu lateral:

- **Ícone**: Relógio (FaClock)
- **Label**: "Freelancer"
- **Rota**: `/entrepreneur`

### Relacionamentos

- **Transações**: Períodos podem gerar transações automaticamente (futuro)
- **Metas**: Ganhos podem ser relacionados a metas financeiras (futuro)
- **Dashboard**: Estatísticas podem aparecer no dashboard principal (futuro)

---

## 📚 Referências Técnicas

- **Prisma Schema**: `prisma/schema.prisma`
- **Server Actions**: `app/_actions/work-period/` e `app/_actions/project/`
- **Componentes**: `app/entrepreneur/_components/`
- **Utils**: `app/entrepreneur/_components/utils.ts`

---

## ✅ Checklist de Funcionalidades

- [x] Criar período de trabalho
- [x] Editar período de trabalho
- [x] Excluir período de trabalho
- [x] Listar períodos agrupados por data
- [x] Calcular horas automaticamente
- [x] Calcular lucro líquido automaticamente
- [x] Criar projeto/cliente
- [x] Editar projeto/cliente
- [x] Excluir projeto/cliente
- [x] Listar projetos
- [x] Associar período a projeto
- [x] Estatísticas do dia
- [x] Estatísticas do mês
- [x] Formatação em Real brasileiro
- [x] Formatação de horas legível
- [x] Fuso horário brasileiro
- [x] Validação de dados
- [x] Tratamento de erros
- [x] Feedback visual (toasts)
- [x] Loading states
- [x] Responsividade

---

## 🎯 Conclusão

A página Freelancer é uma ferramenta completa e intuitiva para trabalhadores autônomos gerenciarem seus períodos de trabalho, calcular ganhos e organizar projetos. Com cálculos automáticos, interface clara e funcionalidades essenciais, oferece uma solução prática para o controle financeiro de freelancers.

**Última atualização**: 15/12/2025

