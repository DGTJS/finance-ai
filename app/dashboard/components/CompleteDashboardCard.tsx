/**
 * CompleteDashboardCard - Card único com todas as informações
 * Design minimalista e organizado
 */

"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { formatCurrency } from "@/src/lib/utils";
import type {
  IncomeBreakdown,
  ExpenseBreakdown,
  DailyBalance,
  Transaction,
  UpcomingPayment,
  FamilySalaryBalance,
  FamilyBenefitsBalance,
  CategoryData,
} from "@/src/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { DailyBalanceChart } from "./DailyBalanceChart";
import { RecentExpensesCard } from "./RecentExpensesCard";
import { BeneficiosPieChart } from "./BeneficiosPieChart";
import { CategoryPieCard } from "./CategoryPieCard";
import { FamilySummaryCard } from "./FamilySummaryCard";

interface CompleteDashboardCardProps {
  currentBalance: number;
  projectedBalance: number;
  changePercent: number;
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
  dailyBalance: DailyBalance[];
  recentTransactions: Transaction[];
  upcomingPayments: UpcomingPayment[];
  familySalaryBalance?: FamilySalaryBalance;
  familyBenefitsBalance?: FamilyBenefitsBalance;
  categories: CategoryData[];
  dashboardView: "financeiro" | "freelancer";
  onViewChange: (view: "financeiro" | "freelancer") => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CompleteDashboardCard({
  currentBalance,
  projectedBalance,
  changePercent,
  income,
  expenses,
  dailyBalance,
  recentTransactions,
  upcomingPayments,
  familySalaryBalance,
  familyBenefitsBalance,
  categories,
  dashboardView,
  onViewChange,
  onRefresh,
  isRefreshing = false,
}: CompleteDashboardCardProps) {
  const isPositive = currentBalance >= 0;
  const isProjectedPositive = projectedBalance >= 0;
  const hasImprovement = projectedBalance > currentBalance;
  const hasSignificantChange = Math.abs(changePercent) > 0.01;

  return (
    <Card className="bg-background overflow-hidden border-0 shadow-sm">
      {/* Header integrado */}
      <div className="bg-muted/20 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={dashboardView === "financeiro" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("financeiro")}
              className={cn(
                "h-7 gap-1.5 px-3 text-xs font-medium",
                dashboardView === "financeiro" &&
                  "bg-primary text-primary-foreground shadow-sm",
              )}
            >
              <span>💰</span>
              Financeiro
            </Button>
            <Button
              variant={dashboardView === "freelancer" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("freelancer")}
              className={cn(
                "h-7 gap-1.5 px-3 text-xs font-medium",
                dashboardView === "freelancer" &&
                  "bg-primary text-primary-foreground shadow-sm",
              )}
            >
              <span>💼</span>
              Freelancer
            </Button>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Seção 1: Visão Geral (Saldo, Receitas, Despesas) */}
        <div className="mb-8 grid grid-cols-3 gap-8 border-b pb-8">
          {/* Saldo */}
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wider uppercase">
                Saldo Atual
              </p>
              <p className="text-muted-foreground mb-2 text-xs">
                {new Date().toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p
                className={cn(
                  "text-3xl font-light tracking-tight",
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {formatCurrency(currentBalance)}
              </p>
            </div>

            <div className="border-muted border-l-2 pl-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Eye className="text-muted-foreground h-3.5 w-3.5" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Previsto
                </p>
              </div>
              <p className="text-muted-foreground mb-1 text-xs">Fim do mês</p>
              <p
                className={cn(
                  "mb-1 text-2xl font-light tracking-tight",
                  isProjectedPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {formatCurrency(projectedBalance)}
              </p>
              {hasImprovement && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <div className="h-1 w-1 rounded-full bg-current"></div>
                  <span className="font-medium">Melhora prevista</span>
                </div>
              )}
            </div>
          </div>

          {/* Receitas */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Receitas
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-green-600 dark:text-green-400">
                {formatCurrency(income.total)}
              </p>
            </div>

            <div className="space-y-3">
              {income.salary > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">
                      Salário
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(income.salary)}
                    </p>
                  </div>
                  <div className="bg-muted h-0.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${income.total > 0 ? (income.salary / income.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {income.variable > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">
                      Variável
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(income.variable)}
                    </p>
                  </div>
                  <div className="bg-muted h-0.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${income.total > 0 ? (income.variable / income.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Despesas */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Despesas
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-red-600 dark:text-red-400">
                {formatCurrency(expenses.total)}
              </p>
            </div>

            <div className="space-y-3">
              {expenses.fixed > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">
                      Fixas
                    </p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(expenses.fixed)}
                    </p>
                  </div>
                  <div className="bg-muted h-0.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-500"
                      style={{
                        width: `${expenses.total > 0 ? (expenses.fixed / expenses.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {expenses.variable > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">
                      Variáveis
                    </p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(expenses.variable)}
                    </p>
                  </div>
                  <div className="bg-muted h-0.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-500"
                      style={{
                        width: `${expenses.total > 0 ? (expenses.variable / expenses.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Gráfico e Transações */}
        <div className="mb-8 grid grid-cols-[3fr_1fr] gap-6 border-b pb-8">
          <div className="flex h-full min-h-0 [&>div]:border-0 [&>div]:shadow-none">
            <DailyBalanceChart dailyBalance={dailyBalance} />
          </div>
          <div className="flex h-full min-h-0 w-full [&>div]:border-0 [&>div]:shadow-none">
            <RecentExpensesCard transactions={recentTransactions} />
          </div>
        </div>

        {/* Seção 3: Benefícios e Categorias */}
        <div className="mb-8 grid grid-cols-2 gap-6 border-b pb-8">
          {familyBenefitsBalance && (
            <div className="[&>div]:border-0 [&>div]:shadow-none">
              <BeneficiosPieChart benefitsBalance={familyBenefitsBalance} />
            </div>
          )}
          <div className="[&>div]:border-0 [&>div]:shadow-none">
            <CategoryPieCard categories={categories} />
          </div>
        </div>

        {/* Seção 4: Salário, Benefícios e Vencimentos Consolidados */}
        <FamilySummaryCard
          salaryBalance={familySalaryBalance}
          benefitsBalance={familyBenefitsBalance}
          upcomingPayments={upcomingPayments}
        />

        {/* Badge de mudança percentual */}
        {hasSignificantChange && (
          <div className="mt-6 flex justify-center">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                changePercent >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
              )}
            >
              {changePercent >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
