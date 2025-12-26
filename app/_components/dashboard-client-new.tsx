"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Transaction,
  TransactionCategory,
} from "@/app/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AIInsight } from "@/types/ai";
import {
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaCalendar,
  FaArrowRight,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_CATEGORY_COLORS,
  TRANSACTION_CATEGORY_EMOJIS,
  getCategoryIcon,
} from "../_constants/transactions";
import { Button } from "./ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CircularExpenseChart from "./circular-expense-chart";
import AddGoalAmountDialog from "./add-goal-amount-dialog";
import { Plus } from "lucide-react";

interface DashboardClientProps {
  userName: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    balance: number;
  };
  expensesByCategory: Record<string, number>;
  expensesChartData: Array<{
    category: TransactionCategory;
    total: number;
    percentage: number;
  }>;
  transactionsByDay: Array<{
    date: string;
    income: number;
    expenses: number;
    investments: number;
  }>;
  recentTransactions: (Transaction & {
    createdBy?: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  })[];
  upcomingSubscriptions: Array<{
    id: string;
    name: string;
    amount: number;
    nextDueDate: Date | null;
  }>;
  upcomingTransactions: Transaction[];
  aiInsight?: AIInsight;
  transactionsByUser?: Record<
    string,
    {
      name: string;
      transactions: (Transaction & {
        createdBy?: { id: string; name: string | null; email: string | null };
      })[];
      income: number;
      expenses: number;
      investments: number;
    }
  >;
  familyUsers?: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  }>;
  activeGoals?: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    category: string;
    icon: string | null;
    color: string | null;
  }>;
}

export default function DashboardClient({
  userName,
  stats,
  expensesByCategory,
  expensesChartData,
  transactionsByDay,
  recentTransactions,
  upcomingSubscriptions,
  upcomingTransactions,
  aiInsight,
  transactionsByUser,
  familyUsers = [],
  activeGoals = [],
}: DashboardClientProps) {
  const [selectedGoalForAdd, setSelectedGoalForAdd] = useState<{
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
  } | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Injetar estilos para garantir que o Recharts seja contido
    const styleId = "recharts-container-fix";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .chart-wrapper-container .recharts-wrapper {
          position: relative !important;
        }
        .chart-wrapper-container .recharts-surface {
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Preparar dados para o gráfico de barras comparativo (últimos 13 dias)
  const last13Days = Array.from({ length: 13 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (12 - i));
    return date.toISOString().split("T")[0];
  });

  // Calcular dados da semana atual (últimos 7 dias)
  const currentWeekDates = last13Days.slice(-7);
  const currentWeekTotal = currentWeekDates.reduce((sum, date) => {
    const dayTransactions = transactionsByDay.find((d) => d.date === date);
    return sum + (dayTransactions?.expenses || 0);
  }, 0);

  // Calcular dados da semana anterior (7 dias antes da semana atual)
  const previousWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (19 - i)); // 19 = 12 + 7 (13 dias atrás + offset para a semana anterior)
    return date.toISOString().split("T")[0];
  });
  const previousWeekTotal = previousWeekDates.reduce((sum, date) => {
    const dayTransactions = transactionsByDay.find((d) => d.date === date);
    return sum + (dayTransactions?.expenses || 0);
  }, 0);

  const barChartData = last13Days.map((date, index) => {
    const dayTransactions = transactionsByDay.find((d) => d.date === date);
    // Buscar dados da semana anterior (7 dias antes)
    const previousWeekDate =
      previousWeekDates[index >= 7 ? index - 7 : undefined];
    const previousWeekDayTransactions = previousWeekDate
      ? transactionsByDay.find((d) => d.date === previousWeekDate)
      : undefined;

    return {
      date: format(new Date(date), "dd", { locale: ptBR }),
      "Despesas Atuais": dayTransactions?.expenses || 0,
      "Semana Anterior": previousWeekDayTransactions?.expenses || 0,
    };
  });

  // Calcular variação percentual usando dados reais
  const variation =
    previousWeekTotal > 0
      ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
      : currentWeekTotal > 0
        ? 100
        : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto animate-pulse space-y-6 p-6">
          <div className="h-32 rounded-lg bg-gray-200" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Grid Principal - 2 colunas */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Latest Expenses Card */}
          <Card
            className="bg-card relative border shadow-sm"
            style={{ zIndex: 1, overflow: "hidden" }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Últimas Despesas
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Resumo de despesas de 1-13{" "}
                    {format(new Date(), "MMM", { locale: ptBR })},{" "}
                    {format(new Date(), "yyyy")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-card relative overflow-hidden">
              <div className="mb-4">
                <div className="mb-2 text-3xl font-bold">
                  {formatCurrency(stats.totalExpenses)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                    <FaArrowUp className="h-3 w-3" />
                    <span className="text-sm font-medium">
                      {variation.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    vs semana anterior
                  </span>
                </div>
              </div>

              {/* Gráfico de Barras Comparativo */}
              <div
                className="chart-wrapper-container bg-card relative h-[180px] w-full rounded-md sm:h-[200px]"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  contain: "layout style paint",
                  isolation: "isolate",
                  backgroundColor: "hsl(var(--card))",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    zIndex: 0,
                    backgroundColor: "hsl(var(--card))",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `R$ ${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          color: "hsl(var(--foreground))",
                          zIndex: 50,
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar
                        dataKey="Despesas Atuais"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Semana Anterior"
                        fill="hsl(var(--muted))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary h-3 w-3 shrink-0 rounded-full"></div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Despesas Atuais
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-3 w-3 shrink-0 rounded-full"></div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      Semana Anterior
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href="/transactions">Ver Relatório</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reimbursement / Transações Recentes Card */}
          <Card
            className="bg-card relative border shadow-sm"
            style={{ zIndex: 2 }}
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Transações Recentes
                </CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/transactions">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.slice(0, 3).map((transaction, index) => {
                  // Buscar foto do usuário que criou a transação
                  const creatorUser = familyUsers.find(
                    (u) => u.id === transaction.createdBy?.id,
                  );
                  const creatorImage =
                    creatorUser?.image || transaction.createdBy?.image || null;
                  const creatorName =
                    transaction.createdBy?.name?.split(" ")[0] ||
                    transaction.createdBy?.email?.split("@")[0] ||
                    "Usuário";
                  const isExpense = transaction.type === "EXPENSE";
                  const daysAgo = transaction.date
                    ? Math.floor(
                        (new Date().getTime() -
                          new Date(transaction.date).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-start gap-2 border-b pb-4 last:border-0 last:pb-0 sm:gap-3"
                    >
                      <div className="flex-shrink-0">
                        {creatorImage ? (
                          <div className="border-primary/20 h-8 w-8 overflow-hidden rounded-full border-2 sm:h-10 sm:w-10">
                            <img
                              src={creatorImage}
                              alt={creatorName}
                              className="h-full w-full object-cover object-center"
                              style={{
                                objectPosition: "center center",
                                minWidth: "100%",
                                minHeight: "100%",
                              }}
                            />
                          </div>
                        ) : (
                          <div className="from-primary to-primary/80 text-primary-foreground border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-xs font-bold sm:h-10 sm:w-10 sm:text-sm">
                            {creatorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                            <span className="truncate text-sm font-medium sm:text-base">
                              {creatorName}
                            </span>
                            <span className="text-muted-foreground truncate text-xs sm:text-sm">
                              - {transaction.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold sm:text-base ${isExpense ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                            >
                              {formatCurrency(Number(transaction.amount))}
                            </span>
                            {isExpense ? (
                              <FaChevronDown className="text-muted-foreground h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                            ) : (
                              <FaChevronUp className="text-muted-foreground h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                            )}
                          </div>
                        </div>
                        {transaction.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2 text-xs sm:text-sm">
                            {transaction.description}
                          </p>
                        )}
                        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-4">
                          <div className="flex items-center gap-1">
                            <FaClock className="h-3 w-3 shrink-0" />
                            <span>
                              {daysAgo}{" "}
                              {daysAgo === 1 ? "dia atrás" : "dias atrás"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            asChild
                          >
                            <Link
                              href={`/transactions?transaction=${transaction.id}`}
                            >
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda Linha - 3 colunas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
          {/* Scheduled Payment Card */}
          <Card className="bg-card flex h-full min-h-0 flex-col border shadow-sm">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="truncate text-sm font-semibold sm:text-base md:text-lg">
                  Pagamentos Agendados
                </CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto shrink-0 p-0 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/subscription">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {upcomingSubscriptions.length > 0 ? (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto sm:space-y-3">
                  {upcomingSubscriptions.slice(0, 4).map((sub) => {
                    const dueDate = sub.nextDueDate
                      ? new Date(sub.nextDueDate)
                      : new Date();
                    const month = format(dueDate, "MMM", { locale: ptBR });
                    const day = format(dueDate, "dd");

                    // Gerar iniciais do nome
                    const initials = sub.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    // Cores alternadas usando tema
                    const colors = [
                      {
                        bg: "bg-green-100 dark:bg-green-900/30",
                        text: "text-green-700 dark:text-green-400",
                        border: "border-green-200 dark:border-green-800",
                      },
                      {
                        bg: "bg-muted",
                        text: "text-foreground",
                        border: "border-border",
                      },
                      {
                        bg: "bg-primary",
                        text: "text-primary-foreground",
                        border: "border-primary",
                      },
                      {
                        bg: "bg-blue-100 dark:bg-blue-900/30",
                        text: "text-blue-700 dark:text-blue-400",
                        border: "border-blue-200 dark:border-blue-800",
                      },
                    ];
                    const color =
                      colors[
                        upcomingSubscriptions.indexOf(sub) % colors.length
                      ];

                    return (
                      <div
                        key={sub.id}
                        className="flex min-w-0 items-center gap-2 sm:gap-3"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12 ${color.bg} ${color.text} ${color.border} shrink-0 text-xs font-semibold sm:text-sm`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium sm:text-sm">
                                {sub.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {day} {month}
                              </p>
                            </div>
                            <p className="shrink-0 text-xs font-semibold sm:text-sm">
                              {formatCurrency(sub.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Nenhum pagamento agendado
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/subscription">Adicionar Assinatura</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metas Card */}
          <Card className="bg-card flex h-full min-h-0 flex-col border shadow-sm">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="truncate text-sm font-semibold sm:text-base md:text-lg">
                  Metas em Andamento
                </CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto shrink-0 p-0 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/goals">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {activeGoals && activeGoals.length > 0 ? (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto sm:space-y-3">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const progressPercentage =
                      goal.targetAmount > 0
                        ? Math.min(
                            (goal.currentAmount / goal.targetAmount) * 100,
                            100,
                          )
                        : 0;
                    const daysUntil = Math.ceil(
                      (new Date(goal.deadline).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const getCategoryColor = () => {
                      if (goal.color) return goal.color;
                      const colors: Record<string, string> = {
                        SAVINGS: "#10b981",
                        INVESTMENT: "#3b82f6",
                        EMERGENCY: "#ef4444",
                        VACATION: "#f59e0b",
                        HOUSE: "#8b5cf6",
                        VEHICLE: "#6366f1",
                        EDUCATION: "#06b6d4",
                        WEDDING: "#ec4899",
                        OTHER: "#6b7280",
                      };
                      return colors[goal.category] || "#6b7280";
                    };

                    return (
                      <div
                        key={goal.id}
                        className="hover:border-primary block rounded-lg border p-2 transition-all hover:shadow-md sm:p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link href="/goals" className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
                              {goal.icon && (
                                <span className="shrink-0 text-base sm:text-lg">
                                  {goal.icon}
                                </span>
                              )}
                              <p className="truncate text-xs font-medium sm:text-sm">
                                {goal.name}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Progresso
                                </span>
                                <span className="font-semibold">
                                  {progressPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${progressPercentage}%`,
                                    backgroundColor: getCategoryColor(),
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {formatCurrency(goal.currentAmount)} /{" "}
                                  {formatCurrency(goal.targetAmount)}
                                </span>
                                <span className="text-muted-foreground">
                                  {daysUntil >= 0
                                    ? `${daysUntil} dia(s)`
                                    : `${Math.abs(daysUntil)} atraso`}
                                </span>
                              </div>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedGoalForAdd({
                                id: goal.id,
                                name: goal.name,
                                currentAmount: goal.currentAmount,
                                targetAmount: goal.targetAmount,
                              });
                            }}
                            className="h-8 w-8 shrink-0 p-0"
                            title="Adicionar valor à meta"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Nenhuma meta ativa
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/goals">Criar Meta</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Circular Expense Chart */}
          <Card className="bg-card flex h-full min-h-0 flex-col overflow-visible border shadow-sm">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="truncate text-sm font-semibold sm:text-base md:text-lg">
                  Gastos por Categoria
                </CardTitle>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto shrink-0 p-0 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/transactions">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-visible p-2 sm:p-4 md:p-6">
              {expensesChartData.length > 0 ? (
                <div className="flex min-h-[250px] flex-1 items-center justify-center sm:min-h-[300px]">
                  <CircularExpenseChart
                    categories={expensesChartData.map((item) => ({
                      name:
                        TRANSACTION_CATEGORY_LABELS[item.category] ||
                        item.category,
                      emoji: TRANSACTION_CATEGORY_EMOJIS[item.category] || "📦",
                      color:
                        TRANSACTION_CATEGORY_COLORS[item.category] || "#6B7280",
                      value: item.total,
                    }))}
                    onViewTransactions={() => router.push("/transactions")}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Nenhuma despesa registrada
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/transactions">Adicionar Transação</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terceira Linha - Estatísticas por Usuário */}
        {transactionsByUser && Object.keys(transactionsByUser).length > 0 && (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Estatísticas por Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(transactionsByUser).map(
                    ([userId, userData]) => {
                      const userInfo = familyUsers.find((u) => u.id === userId);
                      const userImage = userInfo?.image || null;
                      const userName = userData.name || "Usuário";

                      return (
                        <div key={userId} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center gap-3">
                            {userImage ? (
                              <div className="border-primary/20 h-10 w-10 overflow-hidden rounded-full border-2">
                                <img
                                  src={userImage}
                                  alt={userName}
                                  className="h-full w-full object-cover object-center"
                                  style={{
                                    objectPosition: "center center",
                                    minWidth: "100%",
                                    minHeight: "100%",
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="from-primary to-primary/80 text-primary-foreground border-primary/20 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-gradient-to-br text-sm font-bold">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">{userName}</p>
                              <p className="text-muted-foreground text-xs">
                                {userData.transactions.length} transação(ões)
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-muted-foreground mb-1 text-xs">
                                Receitas
                              </p>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(userData.income)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground mb-1 text-xs">
                                Despesas
                              </p>
                              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(userData.expenses)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground mb-1 text-xs">
                                Investimentos
                              </p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(userData.investments)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card de Resumo Geral */}
            <Card className="bg-card border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <FaArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Total de Receitas
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(stats.totalIncome)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <FaArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Total de Despesas
                        </p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(stats.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <FaDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Investimentos
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(stats.totalInvestments)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border-primary flex items-center justify-between rounded-lg border-2 p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
                        <FaDollarSign className="text-primary-foreground h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Saldo Atual
                        </p>
                        <p
                          className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {formatCurrency(stats.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog para adicionar valor à meta */}
      {selectedGoalForAdd && (
        <AddGoalAmountDialog
          isOpen={!!selectedGoalForAdd}
          onClose={() => setSelectedGoalForAdd(null)}
          goalId={selectedGoalForAdd.id}
          goalName={selectedGoalForAdd.name}
          currentAmount={selectedGoalForAdd.currentAmount}
          targetAmount={selectedGoalForAdd.targetAmount}
        />
      )}
    </div>
  );
}
