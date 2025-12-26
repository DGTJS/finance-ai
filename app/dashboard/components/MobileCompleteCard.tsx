/**
 * MobileCompleteCard - Card único consolidado para mobile
 * Design minimalista seguindo o mesmo padrão do desktop
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
  Insight,
  ScheduledPayment,
  Goal,
  UserStat,
} from "@/src/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Gift,
  PieChart,
  Users,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { DailyBalanceChart } from "./DailyBalanceChart";
import { RecentExpensesCard } from "./RecentExpensesCard";
import { BeneficiosPieChart } from "./BeneficiosPieChart";
import { CategoryPieCard } from "./CategoryPieCard";
import { FamilySummaryCard } from "./FamilySummaryCard";
import { ActionsInsightsCard } from "./ActionsInsightsCard";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";

interface MobileCompleteCardProps {
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
  insight?: Insight;
  scheduledPayments: ScheduledPayment[];
  goals: Goal[];
  userStats?: UserStat[];
  dashboardView: "financeiro" | "freelancer";
  onViewChange: (view: "financeiro" | "freelancer") => void;
  onRefresh: () => void;
  onAddGoalAmount?: (goalId: string, amount: number) => Promise<void>;
  isRefreshing?: boolean;
}

export function MobileCompleteCard({
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
  insight,
  scheduledPayments,
  goals,
  userStats,
  dashboardView,
  onViewChange,
  onRefresh,
  onAddGoalAmount,
  isRefreshing = false,
}: MobileCompleteCardProps) {
  const isPositive = currentBalance >= 0;
  const isProjectedPositive = projectedBalance >= 0;
  const hasImprovement = projectedBalance > currentBalance;
  const hasSignificantChange = Math.abs(changePercent) > 0.01;

  return (
    <Card className="bg-background overflow-hidden border-0 shadow-sm">
      {/* Header integrado */}
      <div className="bg-muted/20 border-b px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant={dashboardView === "financeiro" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("financeiro")}
              className={cn(
                "h-7 gap-1 px-2.5 text-[10px] font-medium",
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
                "h-7 gap-1 px-2.5 text-[10px] font-medium",
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
            className="h-7 gap-1 px-2.5 text-[10px]"
          >
            <RefreshCw
              className={cn("h-3 w-3", isRefreshing && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Seção 1: Visão Geral */}
        <div className="mb-6 grid grid-cols-3 gap-4 border-b pb-6">
          {/* Saldo */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-[9px] font-medium tracking-wider uppercase">
              Saldo
            </p>
            <p className="text-lg font-light tracking-tight text-green-600 dark:text-green-400">
              {formatCurrency(currentBalance)}
            </p>
            <div className="border-muted border-l-2 pl-2">
              <Eye className="text-muted-foreground mb-1 h-3 w-3" />
              <p className="text-muted-foreground text-[9px]">Previsto</p>
              <p className="text-sm font-light text-green-600 dark:text-green-400">
                {formatCurrency(projectedBalance)}
              </p>
            </div>
          </div>

          {/* Receitas */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              <p className="text-muted-foreground text-[9px] font-medium tracking-wider uppercase">
                Receitas
              </p>
            </div>
            <p className="text-lg font-light tracking-tight text-green-600 dark:text-green-400">
              {formatCurrency(income.total)}
            </p>
            {income.salary > 0 && (
              <p className="text-muted-foreground text-[9px]">
                Salário: {formatCurrency(income.salary)}
              </p>
            )}
          </div>

          {/* Despesas */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              <p className="text-muted-foreground text-[9px] font-medium tracking-wider uppercase">
                Despesas
              </p>
            </div>
            <p className="text-lg font-light tracking-tight text-red-600 dark:text-red-400">
              {formatCurrency(expenses.total)}
            </p>
            {expenses.fixed > 0 && (
              <p className="text-muted-foreground text-[9px]">
                Fixas: {formatCurrency(expenses.fixed)}
              </p>
            )}
          </div>
        </div>

        {/* Seção 2: Gráfico e Transações */}
        <div className="mb-6 space-y-4 border-b pb-6">
          <DailyBalanceChart dailyBalance={dailyBalance} />
          <RecentExpensesCard transactions={recentTransactions} />
        </div>

        {/* Seção 3: Benefícios e Categorias */}
        <div className="mb-6 grid grid-cols-1 gap-4 border-b pb-6 sm:grid-cols-2">
          {familyBenefitsBalance && (
            <BeneficiosPieChart benefitsBalance={familyBenefitsBalance} />
          )}
          <CategoryPieCard categories={categories} />
        </div>

        {/* Seção 4: Salário, Benefícios e Vencimentos */}
        <FamilySummaryCard
          salaryBalance={familySalaryBalance}
          benefitsBalance={familyBenefitsBalance}
          upcomingPayments={upcomingPayments}
        />

        {/* Seção 5: Insights, Pagamentos e Metas */}
        {insight && (
          <div className="mt-6 border-t pt-6">
            <ActionsInsightsCard
              insight={insight}
              scheduledPayments={scheduledPayments}
              goals={goals}
              onAddGoalAmount={onAddGoalAmount}
            />
          </div>
        )}

        {/* Seção 6: Analytics Summary */}
        <div className="mt-6 border-t pt-6">
          <AnalyticsSummaryCard
            benefitsBalance={familyBenefitsBalance}
            categories={categories}
            userStats={userStats}
          />
        </div>
      </CardContent>
    </Card>
  );
}
