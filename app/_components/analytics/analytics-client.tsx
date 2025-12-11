"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/app/_lib/utils";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: "DEPOSIT" | "EXPENSE" | "INVESTMENT";
  category: string;
  paymentMethod: string;
  date: Date | null;
  createdAt: Date;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  active: boolean;
}

interface AnalyticsClientProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
}

export default function AnalyticsClient({
  transactions,
  subscriptions,
}: AnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Calcular métricas
  const totalIncome = transactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = transactions
    .filter((t) => t.type === "INVESTMENT")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses - totalInvestments;

  const monthlySubscriptionsCost = subscriptions.reduce(
    (sum, s) => sum + s.amount,
    0,
  );

  // Gastos por categoria
  const expensesByCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category:
        TRANSACTION_CATEGORY_LABELS[
          category as keyof typeof TRANSACTION_CATEGORY_LABELS
        ] || category,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Gastos por método de pagamento
  const expensesByPaymentMethod = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const paymentMethodData = Object.entries(expensesByPaymentMethod)
    .map(([method, amount]) => ({
      method:
        TRANSACTION_PAYMENT_METHOD_LABELS[
          method as keyof typeof TRANSACTION_PAYMENT_METHOD_LABELS
        ] || method,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Análise mensal (últimos 6 meses)
  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        }),
        monthKey: `${date.getFullYear()}-${date.getMonth()}`,
      });
    }
    return months;
  };

  const last6Months = getLast6Months();

  const monthlyData = last6Months.map(({ month, monthKey }) => {
    const monthTransactions = transactions.filter((t) => {
      const transactionDate = t.date || t.createdAt;
      const tDate = new Date(transactionDate);
      const tKey = `${tDate.getFullYear()}-${tDate.getMonth()}`;
      return tKey === monthKey;
    });

    const income = monthTransactions
      .filter((t) => t.type === "DEPOSIT")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return { month, income, expenses, balance: income - expenses };
  });

  // Transações mais recentes
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 5);

  // Maiores gastos
  const topExpenses = [...transactions]
    .filter((t) => t.type === "EXPENSE")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Taxa de economia
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return (
    <div className="container mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="flex flex-col gap-2 text-2xl font-bold sm:flex-row sm:items-center sm:text-3xl">
          <BarChart3 className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
          Análises Financeiras
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Insights detalhados sobre suas finanças
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receitas Totais
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-muted-foreground text-xs">
              {transactions.filter((t) => t.type === "DEPOSIT").length}{" "}
              transações
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas Totais
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-muted-foreground text-xs">
              {transactions.filter((t) => t.type === "EXPENSE").length}{" "}
              transações
            </p>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {formatCurrency(balance)}
            </div>
            <p className="text-muted-foreground text-xs">
              Taxa de economia: {savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Assinaturas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {formatCurrency(monthlySubscriptionsCost)}
            </div>
            <p className="text-muted-foreground text-xs">
              {subscriptions.length} assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análises */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-1 lg:grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Tendências</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Transações</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Análise Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{data.month}</span>
                        <span
                          className={
                            data.balance >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {formatCurrency(data.balance)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-green-500/20">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: (() => {
                                  const maxIncome = Math.max(...monthlyData.map((d) => d.income));
                                  if (maxIncome === 0) return "0%";
                                  return `${Math.min((data.income / maxIncome) * 100, 100)}%`;
                                })(),
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-red-500/20">
                            <div
                              className="h-full bg-red-500"
                              style={{
                                width: (() => {
                                  const maxExpenses = Math.max(...monthlyData.map((d) => d.expenses));
                                  if (maxExpenses === 0) return "0%";
                                  return `${Math.min((data.expenses / maxExpenses) * 100, 100)}%`;
                                })(),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Gastos */}
            <Card>
              <CardHeader>
                <CardTitle>Maiores Despesas</CardTitle>
                <CardDescription>Top 5 gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topExpenses.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{transaction.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {
                              TRANSACTION_CATEGORY_LABELS[
                                transaction.category as keyof typeof TRANSACTION_CATEGORY_LABELS
                              ]
                            }
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-red-500 sm:ml-4">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                  {topExpenses.length === 0 && (
                    <p className="text-muted-foreground text-center text-sm">
                      Nenhuma despesa registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categorias */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(totalExpenses)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.amount)} (
                          {item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {categoryData.length === 0 && (
                    <p className="text-muted-foreground text-center text-sm">
                      Nenhum dado disponível
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Por Método de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Por Método de Pagamento</CardTitle>
                <CardDescription>Distribuição de gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((item) => (
                    <div key={item.method} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.method}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.amount)} (
                          {item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {paymentMethodData.length === 0 && (
                    <p className="text-muted-foreground text-center text-sm">
                      Nenhum dado disponível
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold">{data.month}</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">
                          Receitas
                        </p>
                        <p className="text-lg font-bold text-green-500">
                          {formatCurrency(data.income)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">
                          Despesas
                        </p>
                        <p className="text-lg font-bold text-red-500">
                          {formatCurrency(data.expenses)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">Saldo</p>
                        <p
                          className={`text-lg font-bold ${data.balance >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {formatCurrency(data.balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transações Recentes */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas 5 transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const date = transaction.date || transaction.createdAt;
                  return (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{transaction.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(date).toLocaleDateString("pt-BR")} •{" "}
                          {
                            TRANSACTION_CATEGORY_LABELS[
                              transaction.category as keyof typeof TRANSACTION_CATEGORY_LABELS
                            ]
                          }
                        </p>
                      </div>
                      <p
                        className={`font-bold sm:ml-4 ${
                          transaction.type === "DEPOSIT"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "DEPOSIT" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <p className="text-muted-foreground text-center text-sm">
                    Nenhuma transação encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
