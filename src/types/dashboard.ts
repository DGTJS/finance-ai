/**
 * Tipos TypeScript para a Dashboard Financeira
 */

export type TransactionType = "DEPOSIT" | "EXPENSE" | "INVESTMENT";

export type TransactionCategory =
  | "HOUSING"
  | "TRANSPORTATION"
  | "FOOD"
  | "ENTERTAINMENT"
  | "HEALTH"
  | "UTILITY"
  | "SALARY"
  | "EDUCATION"
  | "OTHER";

export type InsightSeverity = "low" | "medium" | "high";

export interface Transaction {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  value: number;
  category: TransactionCategory;
  createdAt: string;
  date?: string | null;
  description?: string | null;
  icon?: string | null;
}

export interface ScheduledPayment {
  id: string;
  name: string;
  dueDate: string;
  value: number;
  logoUrl?: string | null;
  daysUntil: number; // Dias até o vencimento
  isOverdue: boolean; // Se está vencido
}

/**
 * Próximo vencimento (assinatura, pagamento recorrente, etc)
 */
export interface UpcomingPayment {
  id: string;
  name: string;
  dueDate: string;
  value: number;
  daysUntil: number; // Dias até o vencimento (negativo se vencido)
  type: "subscription" | "recurring"; // Tipo de pagamento
  logoUrl?: string | null;
}

/**
 * Saldo de salário por usuário (familiar)
 */
export interface FamilySalaryBalance {
  total: number; // Total familiar
  byUser: Array<{
    userId: string;
    name: string;
    amount: number; // Salário do mês do usuário
  }>;
}

/**
 * Benefício individual de um usuário
 */
export interface UserBenefit {
  type: string; // "VR", "VA", "VT", "OUTRO"
  value: number; // Saldo disponível
  notes?: string;
  category?: string;
}

/**
 * Saldo de benefícios por usuário (familiar)
 */
export interface FamilyBenefitsBalance {
  total: number; // Total familiar
  byUser: Array<{
    userId: string;
    name: string;
    benefits: UserBenefit[]; // Lista de benefícios do usuário
    total: number; // Total de benefícios do usuário
  }>;
  used: number; // Total de benefícios usados (do mês)
  available: number; // Total de benefícios disponíveis
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  dueDate: string;
  isShared: boolean;
  icon?: string | null;
  color?: string | null;
  category?: string | null;
}

export interface CategoryData {
  key: TransactionCategory;
  value: number;
  emoji: string;
  color: string;
}

export interface UserStat {
  userId: string;
  name: string;
  avatarUrl: string | null;
  revenues: number;
  expenses: number;
  investments: number;
}

export interface InsightAction {
  id: string;
  label: string;
}

export interface Insight {
  severity: InsightSeverity;
  message: string;
  actions: InsightAction[];
}

/**
 * Breakdown de receitas
 */
export interface IncomeBreakdown {
  salary: number; // Salário fixo
  benefits: number; // Benefícios recorrentes
  variable: number; // Receitas variáveis
  total: number; // Total de receitas
}

/**
 * Breakdown de despesas
 */
export interface ExpenseBreakdown {
  fixed: number; // Despesas fixas (aluguel, assinaturas, etc)
  variable: number; // Despesas variáveis
  subscriptions: number; // Valor total de assinaturas ativas
  total: number; // Total de despesas
}

/**
 * Visão mensal (mês atual)
 */
export interface MonthlyOverview {
  month: string; // YYYY-MM
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
  investments: number;
  netBalance: number; // Receitas - Despesas - Investimentos
  projectedBalance: number; // Saldo previsto até fim do mês
  changePercent: number; // Variação percentual vs mês anterior
}

/**
 * Saldo diário para sparkline
 */
export interface DailyBalance {
  date: string; // YYYY-MM-DD
  balance: number;
}

export interface DashboardSummary {
  // Visão principal
  currentBalance: number; // Saldo atual
  projectedBalance: number; // Saldo previsto até fim do mês
  
  // Breakdowns financeiros
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
  investments: number;
  
  // Visão mensal
  monthlyOverview: MonthlyOverview;
  
  // Dados de contexto
  dailyBalanceSparkline: DailyBalance[]; // Evolução diária do saldo
  categories: CategoryData[]; // Gastos por categoria (apenas despesas)
  recentTransactions: Transaction[]; // Últimas transações
  scheduledPayments: ScheduledPayment[]; // Assinaturas próximas
  goals: Goal[]; // Metas ativas
  userStats: UserStat[]; // Estatísticas por usuário (família)
  
  // Novos dados familiares
  upcomingPayments: UpcomingPayment[]; // Próximos vencimentos (ordenados)
  familySalaryBalance: FamilySalaryBalance; // Saldo de salário familiar
  familyBenefitsBalance: FamilyBenefitsBalance; // Saldo de benefícios familiar
  
  // Insights
  insight: Insight;
}

export interface Projection {
  saldo_previsto: number;
  percent_comprometido: number;
  sugestao_para_meta: number;
}

