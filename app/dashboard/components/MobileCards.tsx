/**
 * MobileCards - Versões mobile otimizadas dos cards principais
 * Design minimalista e focado para telas pequenas
 */

"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type {
  IncomeBreakdown,
  ExpenseBreakdown,
  UpcomingPayment,
} from "@/src/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MobileSaldoCardProps {
  currentBalance: number;
  projectedBalance: number;
  changePercent: number;
}

export function MobileSaldoCard({
  currentBalance,
  projectedBalance,
  changePercent,
}: MobileSaldoCardProps) {
  const isPositive = currentBalance >= 0;
  const hasSignificantChange = Math.abs(changePercent) > 0.01;

  return (
    <Card className="border bg-gradient-to-br from-yellow-50 to-yellow-100/50 shadow-sm dark:from-yellow-950/20 dark:to-yellow-900/10">
      <CardContent className="p-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500">
              <span className="text-sm">💰</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[9px] font-medium">
                Saldo Atual
              </p>
              <p
                className={`truncate text-xs font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatCurrency(currentBalance)}
              </p>
            </div>
            {hasSignificantChange && (
              <div
                className={`flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0.5 ${changePercent >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
              >
                {changePercent >= 0 ? (
                  <ArrowUpRight className="h-2.5 w-2.5" />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5" />
                )}
                <span className="text-[8px] font-semibold">
                  {changePercent >= 0 ? "+" : ""}
                  {changePercent.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="border-t pt-1.5">
            <p className="text-muted-foreground mb-0.5 text-[8px]">
              Previsto até fim do mês
            </p>
            <p
              className={`truncate text-[10px] font-semibold ${projectedBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {formatCurrency(projectedBalance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileIncomeCardProps {
  income: IncomeBreakdown;
}

export function MobileIncomeCard({ income }: MobileIncomeCardProps) {
  return (
    <Card className="border bg-gradient-to-br from-green-50 to-green-100/50 shadow-sm dark:from-green-950/20 dark:to-green-900/10">
      <CardContent className="p-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[9px] font-medium">
                Receitas
              </p>
              <p className="truncate text-xs font-bold text-green-600 dark:text-green-400">
                {formatCurrency(income.total)}
              </p>
            </div>
          </div>
          <div className="space-y-1 border-t pt-1.5">
            {income.salary > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[8px]">
                  Salário
                </span>
                <span className="ml-1 truncate text-[9px] font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(income.salary)}
                </span>
              </div>
            )}
            {income.benefits > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[8px]">
                  Benefícios
                </span>
                <span className="ml-1 truncate text-[9px] font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(income.benefits)}
                </span>
              </div>
            )}
            {income.variable > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[8px]">
                  Variável
                </span>
                <span className="ml-1 truncate text-[9px] font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(income.variable)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileExpenseCardProps {
  expenses: ExpenseBreakdown;
}

export function MobileExpenseCard({ expenses }: MobileExpenseCardProps) {
  return (
    <Card className="border bg-gradient-to-br from-red-50 to-red-100/50 shadow-sm dark:from-red-950/20 dark:to-red-900/10">
      <CardContent className="p-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500">
              <TrendingDown className="h-3 w-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[9px] font-medium">
                Despesas
              </p>
              <p className="truncate text-xs font-bold text-red-600 dark:text-red-400">
                {formatCurrency(expenses.total)}
              </p>
            </div>
          </div>
          <div className="space-y-1 border-t pt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[8px]">Fixas</span>
              <span className="ml-1 truncate text-[9px] font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(expenses.fixed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[8px]">
                Variáveis
              </span>
              <span className="ml-1 truncate text-[9px] font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(expenses.variable)}
              </span>
            </div>
            {expenses.subscriptions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[8px]">
                  Assinaturas
                </span>
                <span className="ml-1 truncate text-[9px] font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(expenses.subscriptions)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileVencimentosCardProps {
  payments: UpcomingPayment[];
}

export function MobileVencimentosCard({
  payments,
}: MobileVencimentosCardProps) {
  if (payments.length === 0) {
    return (
      <Card className="border bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm dark:from-blue-950/20 dark:to-blue-900/10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-medium">
                Vencimentos
              </p>
              <p className="text-muted-foreground text-[9px]">Nenhum próximo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPayment = payments[0];
  const daysUntil = nextPayment.daysUntil;
  const isUrgent = daysUntil <= 3;

  return (
    <Card
      className={`border shadow-sm ${isUrgent ? "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10" : "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10"}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isUrgent ? "bg-orange-500" : "bg-blue-500"}`}
          >
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground mb-1 text-[10px] font-medium">
              Próximo Vencimento
            </p>
            <p className="mb-1 truncate text-sm font-bold">
              {nextPayment.name}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-[10px]">
                {daysUntil < 0
                  ? "Vencido"
                  : daysUntil === 0
                    ? "Hoje"
                    : `${daysUntil} dia${daysUntil !== 1 ? "s" : ""}`}
              </span>
              <span
                className={`text-sm font-bold ${isUrgent ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`}
              >
                {formatCurrency(nextPayment.value)}
              </span>
            </div>
            {payments.length > 1 && (
              <p className="text-muted-foreground mt-1 text-[9px]">
                +{payments.length - 1} outro(s)
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
