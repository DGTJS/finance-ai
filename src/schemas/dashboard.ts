/**
 * Schemas Zod para validação de dados da Dashboard
 */

import { z } from "zod";

export const transactionTypeSchema = z.enum([
  "DEPOSIT",
  "EXPENSE",
  "INVESTMENT",
]);

export const transactionCategorySchema = z.enum([
  "HOUSING",
  "TRANSPORTATION",
  "FOOD",
  "ENTERTAINMENT",
  "HEALTH",
  "UTILITY",
  "SALARY",
  "EDUCATION",
  "OTHER",
]);

export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: transactionTypeSchema,
  value: z.number().min(0),
  category: transactionCategorySchema,
  createdAt: z.string(),
  date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const scheduledPaymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  dueDate: z.string(),
  value: z.number().min(0),
  logoUrl: z.string().optional().nullable(),
  daysUntil: z.number(),
  isOverdue: z.boolean(),
});

export const upcomingPaymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  dueDate: z.string(),
  value: z.number().min(0),
  daysUntil: z.number(),
  type: z.enum(["subscription", "recurring"]),
  logoUrl: z.string().optional().nullable(),
});

export const userBenefitSchema = z.object({
  type: z.string(),
  value: z.number().min(0),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export const familySalaryBalanceSchema = z.object({
  total: z.number().min(0),
  byUser: z.array(
    z.object({
      userId: z.string(),
      name: z.string(),
      amount: z.number().min(0),
    }),
  ),
});

export const familyBenefitsBalanceSchema = z.object({
  total: z.number().min(0),
  byUser: z.array(
    z.object({
      userId: z.string(),
      name: z.string(),
      benefits: z.array(userBenefitSchema),
      total: z.number().min(0),
    }),
  ),
  used: z.number().min(0),
  available: z.number().min(0),
});

export const goalSchema = z.object({
  id: z.string(),
  title: z.string(),
  current: z.number().min(0),
  target: z.number().min(0),
  dueDate: z.string(),
  isShared: z.boolean(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const categoryDataSchema = z.object({
  key: transactionCategorySchema,
  value: z.number().min(0),
  emoji: z.string(),
  color: z.string(),
});

export const userStatSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  revenues: z.number().min(0),
  expenses: z.number().min(0),
  investments: z.number().min(0),
});

export const insightActionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const insightSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
  actions: z.array(insightActionSchema),
});

/**
 * Schema para breakdown de receitas
 */
export const incomeBreakdownSchema = z.object({
  salary: z.number().min(0),
  benefits: z.number().min(0),
  variable: z.number().min(0),
  total: z.number().min(0),
});

/**
 * Schema para breakdown de despesas
 */
export const expenseBreakdownSchema = z.object({
  fixed: z.number().min(0),
  variable: z.number().min(0),
  subscriptions: z.number().min(0),
  total: z.number().min(0),
});

/**
 * Schema para visão mensal
 */
export const monthlyOverviewSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  income: incomeBreakdownSchema,
  expenses: expenseBreakdownSchema,
  investments: z.number().min(0),
  netBalance: z.number(),
  projectedBalance: z.number(),
  changePercent: z.number(),
});

/**
 * Schema para saldo diário
 */
export const dailyBalanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  balance: z.number(),
});

/**
 * Schema principal do dashboard
 */
export const dashboardSummarySchema = z.object({
  // Visão principal
  currentBalance: z.number(),
  projectedBalance: z.number(),

  // Breakdowns
  income: incomeBreakdownSchema,
  expenses: expenseBreakdownSchema,
  investments: z.number().min(0),

  // Visão mensal
  monthlyOverview: monthlyOverviewSchema,

  // Dados de contexto
  dailyBalanceSparkline: z.array(dailyBalanceSchema),
  categories: z.array(categoryDataSchema),
  recentTransactions: z.array(transactionSchema),
  scheduledPayments: z.array(scheduledPaymentSchema),
  goals: z.array(goalSchema),
  userStats: z.array(userStatSchema),

  // Novos dados familiares
  upcomingPayments: z.array(upcomingPaymentSchema),
  familySalaryBalance: familySalaryBalanceSchema,
  familyBenefitsBalance: familyBenefitsBalanceSchema,

  // Insights
  insight: insightSchema,
});

export const projectionSchema = z.object({
  saldo_previsto: z.number(),
  percent_comprometido: z.number(),
  sugestao_para_meta: z.number(),
});

// Schema para adicionar valor à meta
export const addGoalAmountSchema = z.object({
  goalId: z.string(),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
});
