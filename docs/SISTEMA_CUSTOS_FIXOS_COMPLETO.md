# Sistema de Custos Fixos - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tipos de Custos](#tipos-de-custos)
5. [Fluxo de Criação](#fluxo-de-criação)
6. [Fluxo de Atualização](#fluxo-de-atualização)
7. [Integração com o Gráfico](#integração-com-o-gráfico)
8. [Problemas Resolvidos](#problemas-resolvidos)
9. [Scripts de Manutenção](#scripts-de-manutenção)

---

## 🎯 Visão Geral

O sistema de custos fixos permite que freelancers gerenciem dois tipos de custos:

1. **Custos Fixos (Recorrentes)**: Custos que se acumulam ao longo do tempo (diário, semanal, mensal)
   - Exemplo: Aluguel mensal de R$ 1.000 → acumula R$ 1.000 por mês
   - Campo `isFixed = true`
   - Campo `frequency = "DAILY" | "WEEKLY" | "MONTHLY"`

2. **Custos Únicos**: Custos aplicados apenas uma vez, no dia em que foram criados
   - Exemplo: Taxa de plataforma de R$ 500 → aplicado apenas uma vez
   - Campo `isFixed = false` OU `frequency = "ONCE"`
   - Campo `frequency = "ONCE"`

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `fixedcost`

```sql
CREATE TABLE `fixedcost` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE') NOT NULL DEFAULT 'DAILY',
  `isFixed` TINYINT(1) NOT NULL DEFAULT 1,  -- 1 = true (custo fixo), 0 = false (custo único)
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,  -- 1 = ativo, 0 = inativo
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX `fixedcost_userId_idx` (`userId`),
  INDEX `fixedcost_isActive_idx` (`isActive`),
  INDEX `fixedcost_isFixed_idx` (`isFixed`),
  
  FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Campos Importantes:

- **`frequency`**: ENUM que pode ser `'DAILY'`, `'WEEKLY'`, `'MONTHLY'`, ou `'ONCE'`
- **`isFixed`**: 
  - `1` (true) = Custo fixo recorrente (acumula ao longo do tempo)
  - `0` (false) = Custo único (aplicado apenas uma vez)
- **`isActive`**: 
  - `1` (true) = Custo ativo (é considerado nos cálculos)
  - `0` (false) = Custo inativo (não é considerado nos cálculos)

### Regras de Negócio:

1. **Se `frequency = "ONCE"`** → `isFixed` SEMPRE deve ser `0` (false)
2. **Se `frequency != "ONCE"`** → `isFixed` pode ser `1` (true) ou `0` (false)
3. **Se `isFixed = 0`** → Tratar como custo único, independente da `frequency`

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais:

1. **Backend (Server Actions)**: `app/_actions/fixed-cost.ts`
   - `getFixedCosts()` - Busca todos os custos do usuário
   - `createFixedCost()` - Cria novo custo
   - `updateFixedCost()` - Atualiza custo existente
   - `deleteFixedCost()` - Deleta custo
   - `calculateFixedCostForDate()` - Calcula custos para uma data específica

2. **Frontend - Gerenciador**: `app/entrepreneur/_components/fixed-cost-manager.tsx`
   - Interface para criar/editar/deletar/ativar custos
   - Formulário com validação
   - Prevenção de duplo submit

3. **Frontend - Gráfico**: `app/entrepreneur/_components/daily-earnings-chart.tsx`
   - Exibe evolução diária dos ganhos
   - Calcula e exibe custos fixos e únicos
   - Atualiza em tempo real via eventos customizados

---

## 📊 Tipos de Custos

### 1. Custo Fixo Recorrente

**Características:**
- `isFixed = true` (1 no banco)
- `frequency = "DAILY" | "WEEKLY" | "MONTHLY"`
- Acumula ao longo do tempo

**Exemplos:**
- Aluguel mensal: `frequency = "MONTHLY"`, `amount = 1000`
  - No dia 1: R$ 1.000
  - No dia 2: R$ 1.000 (mantém)
  - No dia 32: R$ 2.000 (acumula mais um mês)

- Taxa diária: `frequency = "DAILY"`, `amount = 10`
  - Dia 1: R$ 10
  - Dia 2: R$ 20 (10 + 10)
  - Dia 3: R$ 30 (10 + 10 + 10)

### 2. Custo Único

**Características:**
- `isFixed = false` (0 no banco) OU `frequency = "ONCE"`
- Aplicado apenas UMA VEZ no dia em que foi criado
- Não acumula

**Exemplos:**
- Taxa de plataforma: `frequency = "ONCE"`, `amount = 500`, `isFixed = 0`
  - Dia da criação: R$ 500 deduzido
  - Dias seguintes: R$ 0 (não acumula)

---

## 🔄 Fluxo de Criação

### Frontend → Backend

1. **Usuário preenche formulário** (`fixed-cost-manager.tsx`)
   - Seleciona tipo: "Custo Fixo" ou "Custo Único"
   - Se "Custo Único" → `isUniqueCost = true`
   - Preenche nome, valor, frequência (se fixo), descrição

2. **Preparação dos dados** (`handleSubmit`)
   ```typescript
   const finalFrequency = isUniqueCost ? "ONCE" : formData.frequency;
   const finalIsFixed = isUniqueCost ? false : true;
   
   const dataToSend = {
     name: formData.name.trim(),
     amount: formData.amount,
     frequency: finalFrequency, // "ONCE" se for único
     isFixed: finalIsFixed,      // false se for único
     description: formData.description?.trim() || undefined,
     isActive: true
   };
   ```

3. **Backend recebe** (`createFixedCost` em `fixed-cost.ts`)
   - Valida dados
   - Normaliza `frequency` (garante que não seja vazio)
   - Se `frequency === "ONCE"` → `isFixed = false`

4. **Verificação pré-inserção** (apenas para `frequency === "ONCE"`)
   ```typescript
   // Verifica se coluna isFixed existe
   const columnCheck = await db.$queryRawUnsafe(`
     SHOW COLUMNS FROM `fixedcost` LIKE 'isFixed'
   `);
   
   // Se não existir, cria automaticamente
   if (!columnCheck || columnCheck.length === 0) {
     await db.$executeRawUnsafe(`
       ALTER TABLE `fixedcost` 
       ADD COLUMN `isFixed` BOOLEAN NOT NULL DEFAULT true
     `);
   }
   ```

5. **Inserção no banco**
   - Se `frequency === "ONCE"` → Usa SQL raw diretamente
   - Se `frequency != "ONCE"` → Tenta Prisma Client, fallback para SQL raw se necessário

6. **SQL Raw para custos únicos**:
   ```sql
   INSERT INTO `fixedcost` 
   (`id`, `userId`, `name`, `amount`, `frequency`, `isFixed`, `description`, `isActive`, `createdAt`, `updatedAt`) 
   VALUES (?, ?, ?, ?, 'ONCE', 0, ?, 1, NOW(), NOW())
   ```

7. **Retorno**
   - Busca registro criado usando SQL raw
   - Converte `isFixed` de `tinyint(1)` para `boolean`
   - Retorna dados formatados

---

## 🔄 Fluxo de Atualização

### Atualização de Custo Único

1. **Usuário clica em ativar/desativar** (`handleToggleActive`)
   ```typescript
   await updateFixedCost(cost.id, {
     isActive: !cost.isActive
   });
   ```

2. **Backend verifica tipo de custo** (`updateFixedCost`)
   ```typescript
   // Busca custo existente usando SQL raw
   const existingRaw = await db.$queryRawUnsafe(`
     SELECT * FROM `fixedcost` WHERE `id` = ? AND `userId` = ?
   `, id, userId);
   
   const existing = existingRaw[0];
   
   // Normaliza frequency
   const existingFrequency = existing.frequency 
     ? String(existing.frequency).trim().toUpperCase() 
     : "DAILY";
   
   // Verifica se é custo único
   const existingIsFixed = 
     existing.isFixed === 0 || 
     existing.isFixed === false || 
     String(existing.isFixed) === "0";
   
   const isOnceCost = 
     data.frequency === "ONCE" || 
     existingFrequency === "ONCE" || 
     existingIsFixed;
   ```

3. **Se for custo único** → Usa SQL raw
   ```typescript
   if (isOnceCost) {
     const updates = [];
     const values = [];
     
     if (data.isActive !== undefined) {
       updates.push("isActive = ?");
       values.push(data.isActive ? 1 : 0);
     }
     
     // Sempre garantir que isFixed = 0 para custos únicos
     updates.push("`isFixed` = ?");
     values.push(0);
     
     updates.push("updatedAt = ?");
     values.push(new Date());
     values.push(id);
     
     const sql = `UPDATE `fixedcost` SET ${updates.join(", ")} WHERE `id` = ?`;
     await db.$executeRawUnsafe(sql, ...values);
   }
   ```

4. **Dispara evento para atualizar gráfico**
   ```typescript
   window.dispatchEvent(new CustomEvent("fixedCostsUpdated"));
   ```

---

## 📈 Integração com o Gráfico

### Sistema de Eventos

1. **Gerenciador dispara evento** quando custo é criado/atualizado/deletado/ativado
   ```typescript
   window.dispatchEvent(new CustomEvent("fixedCostsUpdated"));
   ```

2. **Gráfico escuta evento** e recarrega custos
   ```typescript
   useEffect(() => {
     const handleFixedCostsUpdate = () => {
       fetchFixedCosts(); // Recarrega custos do banco
     };
     
     window.addEventListener("fixedCostsUpdated", handleFixedCostsUpdate);
     return () => {
       window.removeEventListener("fixedCostsUpdated", handleFixedCostsUpdate);
     };
   }, []);
   ```

### Cálculo de Custos no Gráfico

#### 1. Custos Fixos Recorrentes (`calculateFixedCostForDay`)

```typescript
// Filtra apenas custos fixos (isFixed = true e frequency != "ONCE")
const activeFixedCosts = fixedCosts.filter(
  (cost) => cost.isActive && cost.isFixed && cost.frequency !== "ONCE"
);

// Calcula acumulado baseado na frequência
switch (cost.frequency) {
  case "DAILY":
    // Dias desde início * valor diário
    total += cost.amount * daysDiff;
    break;
  case "WEEKLY":
    // Semanas desde início * valor semanal
    total += cost.amount * weeksDiff;
    break;
  case "MONTHLY":
    // Meses desde início * valor mensal
    total += cost.amount * monthsDiff;
    break;
}
```

#### 2. Custos Únicos (`oneTimeCostsByDate`)

```typescript
// Cria mapa de custos únicos por data
const oneTimeCostsByDate = new Map<string, number>();

fixedCosts
  .filter((cost) => cost.isActive && (cost.frequency === "ONCE" || !cost.isFixed))
  .forEach((cost) => {
    const costStartDate = new Date(cost.createdAt);
    costStartDate.setHours(0, 0, 0, 0);
    
    // Se criado dentro do período do gráfico
    if (costStartDate >= dateRange.start && costStartDate <= dateRange.end) {
      const dateKey = `${ano}-${mês}-${dia}`;
      oneTimeCostsByDate.set(dateKey, (oneTimeCostsByDate.get(dateKey) || 0) + cost.amount);
    }
    // Se criado antes do período, adiciona ao primeiro dia
    else if (costStartDate < dateRange.start) {
      const firstDayKey = `${primeiroDia}`;
      oneTimeCostsByDate.set(firstDayKey, (oneTimeCostsByDate.get(firstDayKey) || 0) + cost.amount);
    }
  });
```

#### 3. Aplicação no Acumulado

```typescript
// Para cada dia do gráfico
days.map((day) => {
  const date = day.date;
  const dateKey = `${ano}-${mês}-${dia}`;
  const oneTimeCostsForDay = oneTimeCostsByDate.get(dateKey) || 0;
  
  // Calcula custos fixos recorrentes acumulados
  const recurringFixedCostForDay = calculateFixedCostForDay(date);
  
  // Acumula ganhos do dia
  cumulative += day.earnings;
  
  // Deduz diferença de custos fixos recorrentes
  cumulative -= (recurringFixedCostForDay - previousFixedCost);
  
  // Deduz custos únicos do dia específico
  cumulative -= oneTimeCostsForDay; // ← QUEDA NO GRÁFICO AQUI
  
  return {
    date,
    earnings: day.earnings,
    fixedCost: recurringFixedCostForDay + oneTimeCostsForDay,
    cumulative // Saldo acumulado com queda no dia do custo único
  };
});
```

---

## 🐛 Problemas Resolvidos

### 1. ENUM não incluía 'ONCE'
**Problema**: Banco de dados tinha ENUM `('DAILY','WEEKLY','MONTHLY')` sem `'ONCE'`
**Solução**: Script `fix-frequency-enum.ts` adiciona `'ONCE'` ao ENUM
```sql
ALTER TABLE `fixedcost` 
MODIFY COLUMN `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE') NOT NULL DEFAULT 'DAILY'
```

### 2. Coluna `isFixed` não existia
**Problema**: Tabela criada sem coluna `isFixed`
**Solução**: 
- Verificação pré-inserção cria coluna automaticamente
- Script `check-and-add-is-fixed.ts` para adicionar manualmente

### 3. Prisma Client não reconhecia `isFixed`
**Problema**: Prisma Client gerado não tinha campo `isFixed` no schema
**Solução**: Uso de SQL raw para inserções/atualizações quando necessário

### 4. Detecção incorreta de custos únicos
**Problema**: Código só verificava `frequency === "ONCE"`, mas custos antigos tinham `frequency = "DAILY"` e `isFixed = 0`
**Solução**: Verificação dupla:
```typescript
const isOnceCost = 
  data.frequency === "ONCE" || 
  existing.frequency === "ONCE" || 
  existing.isFixed === 0 || 
  data.isFixed === false;
```

### 5. Custos únicos deduzidos no dia errado
**Problema**: Todos os custos únicos eram deduzidos no primeiro dia do período
**Solução**: Mapa por data, cada custo único deduzido no dia específico de criação

### 6. Gráfico não atualizava em tempo real
**Problema**: `useEffect` só executava na montagem
**Solução**: Sistema de eventos customizados (`fixedCostsUpdated`)

### 7. Duplo submit
**Problema**: Múltiplos cliques criavam registros duplicados
**Solução**: `useRef` para prevenir duplo submit + desabilitar botão durante loading

---

## 🛠️ Scripts de Manutenção

### 1. `fix-frequency-enum.ts`
**Propósito**: Adiciona `'ONCE'` ao ENUM de `frequency`
```bash
npx tsx scripts/fix-frequency-enum.ts
```

### 2. `check-and-add-is-fixed.ts`
**Propósito**: Verifica e adiciona coluna `isFixed` se não existir
```bash
npx tsx scripts/check-and-add-is-fixed.ts
```

### 3. `test-fixed-cost.ts`
**Propósito**: Testa criação de custos fixos e únicos
```bash
npx tsx scripts/test-fixed-cost.ts
```

### 4. `test-create-once-cost.ts`
**Propósito**: Testa criação direta de custo único via SQL
```bash
npx tsx scripts/test-create-once-cost.ts
```

### 5. `diagnose-fixed-cost-error.ts`
**Propósito**: Diagnóstico completo da estrutura da tabela
```bash
npx tsx scripts/diagnose-fixed-cost-error.ts
```

---

## 📝 Interface TypeScript

### `FixedCostInput`
```typescript
export interface FixedCostInput {
  name: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
  isFixed?: boolean; // DEPRECATED: Use frequency = "ONCE" para custos únicos
  description?: string;
  isActive?: boolean;
}
```

### `FixedCost` (Frontend)
```typescript
interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
  isFixed: boolean;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔍 Fluxo Completo de Dados

### Criação de Custo Único

```
1. Usuário preenche formulário
   └─> Seleciona "Custo Único"
   └─> isUniqueCost = true

2. Frontend prepara dados
   └─> finalFrequency = "ONCE"
   └─> finalIsFixed = false
   └─> dataToSend = { frequency: "ONCE", isFixed: false, ... }

3. Backend recebe (createFixedCost)
   └─> Valida dados
   └─> Se frequency === "ONCE":
       ├─> Verifica se coluna isFixed existe
       ├─> Cria coluna se necessário
       ├─> Gera ID
       └─> Executa SQL raw:
           INSERT INTO fixedcost (..., frequency='ONCE', isFixed=0, ...)

4. Busca registro criado
   └─> SELECT * FROM fixedcost WHERE id = ?
   └─> Converte isFixed: tinyint(1) → boolean

5. Retorna dados
   └─> { success: true, data: { ... } }

6. Frontend recebe
   └─> Fecha formulário
   └─> Recarrega lista
   └─> Dispara evento: fixedCostsUpdated

7. Gráfico escuta evento
   └─> Recarrega custos fixos
   └─> Recalcula dados do gráfico
   └─> Atualiza visualização
```

### Atualização de isActive (Ativar/Desativar)

```
1. Usuário clica em ativar/desativar
   └─> handleToggleActive(cost)
   └─> updateFixedCost(cost.id, { isActive: !cost.isActive })

2. Backend (updateFixedCost)
   └─> Busca custo existente (SQL raw)
   └─> Verifica se é custo único:
       ├─> existing.frequency === "ONCE" OU
       └─> existing.isFixed === 0
   └─> Se for custo único:
       ├─> Usa SQL raw para atualizar
       ├─> UPDATE fixedcost SET isActive=?, isFixed=0, updatedAt=? WHERE id=?
       └─> Busca registro atualizado

3. Retorna dados atualizados
   └─> { success: true, data: { ... } }

4. Frontend recebe
   └─> Recarrega lista
   └─> Dispara evento: fixedCostsUpdated

5. Gráfico atualiza
   └─> Recalcula com novos dados
```

---

## 🎨 Lógica de Cálculo no Gráfico

### Modo de Acumulação: DAILY

```typescript
// Para cada dia
cumulative += day.earnings;                    // Adiciona ganhos
cumulative -= (recurringCost - previousCost); // Deduz diferença de custos fixos
cumulative -= oneTimeCostsForDay;              // Deduz custos únicos do dia
```

**Exemplo:**
- Dia 1: Ganho R$ 100, Custo fixo R$ 10, Custo único R$ 50
  - Acumulado: 0 + 100 - 10 - 50 = **R$ 40**
- Dia 2: Ganho R$ 100, Custo fixo R$ 20 (acumulado), Sem custo único
  - Acumulado: 40 + 100 - (20-10) = **R$ 130**

### Modo de Acumulação: WEEKLY

```typescript
// Reset a cada semana (domingo)
if (mudouSemana) {
  periodCumulative = 0;
  previousFixedCost = 0;
}

// Dentro da semana
periodCumulative += day.earnings;
periodCumulative -= (recurringCost - previousCost);
periodCumulative -= oneTimeCostsForDay;
cumulative = periodCumulative;
```

### Modo de Acumulação: MONTHLY

```typescript
// Reset a cada mês
if (mudouMes) {
  periodCumulative = 0;
  previousFixedCost = 0;
}

// Dentro do mês
periodCumulative += day.earnings;
periodCumulative -= (recurringCost - previousCost);
periodCumulative -= oneTimeCostsForDay;
cumulative = periodCumulative;
```

---

## 🔐 Validações e Segurança

### Validações no Backend

1. **Autenticação**: Verifica `session.user.id`
2. **Nome**: Não pode ser vazio
3. **Valor**: Deve ser > 0
4. **Frequência**: Deve ser um dos valores válidos
5. **Ownership**: Usuário só pode editar/deletar seus próprios custos

### Conversões de Tipo

```typescript
// MySQL tinyint(1) → JavaScript boolean
isFixed: cost.isFixed === 1 || cost.isFixed === true

// JavaScript boolean → MySQL tinyint(1)
isFixed: data.isActive ? 1 : 0

// Normalização de frequency
frequency: String(frequency).trim().toUpperCase()
```

---

## 📊 Exemplo Completo

### Cenário: Criar Custo Único de R$ 500

**1. Frontend (Formulário)**
```typescript
formData = {
  name: "Taxa da Plataforma",
  amount: 500,
  frequency: "DAILY",  // Não importa, será sobrescrito
  isFixed: false,
  description: "Taxa única de adesão"
}

isUniqueCost = true

// Preparação
finalFrequency = "ONCE"
finalIsFixed = false

dataToSend = {
  name: "Taxa da Plataforma",
  amount: 500,
  frequency: "ONCE",
  isFixed: false,
  description: "Taxa única de adesão",
  isActive: true
}
```

**2. Backend (createFixedCost)**
```typescript
// Validação
finalFrequency = "ONCE" // ✓ válido
finalIsFixed = false    // ✓ válido

// Verificação pré-inserção
columnCheck = await db.$queryRawUnsafe(`SHOW COLUMNS FROM fixedcost LIKE 'isFixed'`);
// Se não existir, cria

// SQL Raw
sql = `INSERT INTO fixedcost (id, userId, name, amount, frequency, isFixed, description, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

values = [
  "cmjrsdbi6co9b5gj",           // id gerado
  "cmi3oetic0000w4ogbjv4057n", // userId
  "Taxa da Plataforma",        // name
  500,                          // amount
  "ONCE",                       // frequency
  0,                            // isFixed (false)
  "Taxa única de adesão",       // description
  1,                            // isActive (true)
  new Date(),                   // createdAt
  new Date()                    // updatedAt
]

// Executa
await db.$executeRawUnsafe(sql, ...values);

// Busca criado
const result = await db.$queryRawUnsafe(`SELECT * FROM fixedcost WHERE id = ?`, id);
// Converte isFixed: 0 → false
```

**3. Gráfico (Cálculo)**
```typescript
// Dia da criação: 2025-12-29
const costStartDate = new Date("2025-12-29");
const dateKey = "2025-12-29";

oneTimeCostsByDate.set(dateKey, 500);

// No dia 2025-12-29
const oneTimeCostsForDay = 500;
cumulative -= 500; // Queda de R$ 500 no gráfico

// Dias seguintes
const oneTimeCostsForDay = 0; // Sem dedução
```

---

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções

1. **P2010 + 1054**: Coluna não encontrada
   - Verifica se coluna existe
   - Se existir mas erro ocorreu → retorna erro detalhado
   - Se não existir → instrui a executar script

2. **P2010 + 1452**: Foreign key constraint
   - Retorna erro específico sobre usuário não encontrado

3. **P2002**: Duplicata
   - Retorna erro sobre nome já existente

4. **Enum inválido**: String vazia ou valor não permitido
   - Normaliza para "DAILY" se vazio
   - Valida contra lista permitida

---

## 🔄 Migração de Dados Antigos

### Custos Antigos sem `isFixed`

```typescript
// Ao buscar custos
const fixedCosts = result.data.map((cost: any) => ({
  ...cost,
  isFixed: cost.isFixed !== undefined && cost.isFixed !== null 
    ? cost.isFixed 
    : true, // Padrão: true para valores antigos
}));
```

### Custos com `frequency` vazio

```typescript
// Normalização
const frequency = cost.frequency && cost.frequency.trim() !== "" 
  ? cost.frequency 
  : "DAILY";
```

---

## 📱 Interface do Usuário

### Formulário de Criação

```
┌─────────────────────────────────────┐
│ Novo Custo                          │
├─────────────────────────────────────┤
│ Nome: [________________]            │
│ Valor: [R$ ___________]             │
│                                     │
│ Tipo de Custo:                      │
│ [▼] Custo Fixo (acumula)            │
│   └─> Frequência: [▼] Diário        │
│                                     │
│ OU                                  │
│                                     │
│ [▼] Custo Único (aplicado 1x)      │
│                                     │
│ Descrição: [___________]            │
│                                     │
│ [Cancelar]  [Criar]                │
└─────────────────────────────────────┘
```

### Lista de Custos

```
┌─────────────────────────────────────────┐
│ Gerenciar Custos                        │
├─────────────────────────────────────────┤
│ [+ Adicionar Custo]                     │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ Taxa da Plataforma    [✓] [✏] [🗑]│  │
│ │ R$ 500 (aplicado uma vez)         │  │
│ │ [Único]                           │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ Aluguel Mensal      [✓] [✏] [🗑]  │  │
│ │ R$ 1.000 / Mensal                 │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎯 Pontos Críticos

### 1. Detecção de Custo Único

**Sempre verificar AMBOS:**
- `frequency === "ONCE"` (novo formato)
- `isFixed === 0` (formato antigo ou inconsistente)

### 2. SQL Raw vs Prisma Client

**Usar SQL Raw quando:**
- `frequency === "ONCE"` (enum pode não estar atualizado no Prisma)
- `isFixed === 0` (campo pode não existir no Prisma Client)
- Erro do Prisma sobre campo desconhecido

**Usar Prisma Client quando:**
- `frequency != "ONCE"` e `isFixed == 1`
- Prisma Client reconhece todos os campos

### 3. Conversão de Tipos

**Sempre converter:**
- MySQL `tinyint(1)` → JavaScript `boolean`
- JavaScript `boolean` → MySQL `tinyint(1)` (1 ou 0)

### 4. Normalização de Frequency

**Sempre normalizar:**
- Converter para maiúsculas
- Remover espaços
- Validar contra lista permitida

---

## 📚 Referências de Código

### Arquivos Principais

1. **`app/_actions/fixed-cost.ts`** (1208 linhas)
   - Todas as funções de CRUD
   - Lógica de negócio
   - Tratamento de erros

2. **`app/entrepreneur/_components/fixed-cost-manager.tsx`** (568 linhas)
   - Interface do formulário
   - Gerenciamento de estado
   - Eventos de atualização

3. **`app/entrepreneur/_components/daily-earnings-chart.tsx`** (1018 linhas)
   - Cálculo de custos fixos
   - Cálculo de custos únicos
   - Renderização do gráfico

### Schema Prisma

```prisma
model FixedCost {
  id          String             @id @default(cuid())
  userId      String
  name        String
  amount      Float
  frequency   FixedCostFrequency @default(DAILY)
  isFixed     Boolean            @default(true)
  isActive    Boolean            @default(true)
  description String?            @db.Text
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("fixedcost")
  @@index([userId])
  @@index([isActive])
  @@index([isFixed])
}

enum FixedCostFrequency {
  DAILY
  WEEKLY
  MONTHLY
  ONCE
}
```

---

## ✅ Checklist de Funcionalidades

- [x] Criar custo fixo recorrente
- [x] Criar custo único
- [x] Editar custo fixo
- [x] Editar custo único
- [x] Deletar custo
- [x] Ativar/desativar custo fixo
- [x] Ativar/desativar custo único
- [x] Gráfico atualiza em tempo real
- [x] Custos únicos aparecem no dia correto
- [x] Custos fixos acumulam corretamente
- [x] Tratamento de dados antigos
- [x] Validação de dados
- [x] Prevenção de duplo submit
- [x] Logs de debug
- [x] Tratamento de erros específicos

---

## 🎓 Para ChatGPT

**Use este documento como contexto completo do sistema de custos fixos. Ele contém:**

1. ✅ Estrutura completa do banco de dados
2. ✅ Fluxo de dados end-to-end
3. ✅ Lógica de negócio detalhada
4. ✅ Exemplos práticos
5. ✅ Problemas conhecidos e soluções
6. ✅ Código de referência
7. ✅ Regras de validação
8. ✅ Tratamento de erros

**Ao usar no ChatGPT, mencione:**
- "Consulte o documento SISTEMA_CUSTOS_FIXOS_COMPLETO.md"
- "Baseado na arquitetura descrita no documento..."
- "Seguindo o fluxo de criação de custos únicos..."

Este documento fornece contexto suficiente para entender e trabalhar com o sistema completo de custos fixos.

