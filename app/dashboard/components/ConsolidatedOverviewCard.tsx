/**
 * ConsolidatedOverviewCard - Card consolidado minimalista e criativo
 * Design limpo, simples mas com detalhes criativos sutis
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { IncomeBreakdown, ExpenseBreakdown } from "@/src/types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Gift,
  Sparkles,
  Home,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

interface ConsolidatedOverviewCardProps {
  currentBalance: number;
  projectedBalance: number;
  changePercent: number;
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
}

export function ConsolidatedOverviewCard({
  currentBalance,
  projectedBalance,
  changePercent,
  income,
  expenses,
}: ConsolidatedOverviewCardProps) {
  const isPositive = currentBalance >= 0;
  const isProjectedPositive = projectedBalance >= 0;
  const hasImprovement = projectedBalance > currentBalance;
  const hasSignificantChange = Math.abs(changePercent) > 0.01;

  const incomeItems = [
    {
      label: "Salário",
      value: income.salary,
      icon: Wallet,
      color: "text-green-600 dark:text-green-400",
      percentage: income.total > 0 ? (income.salary / income.total) * 100 : 0,
    },
    ...(income.benefits > 0
      ? [
          {
            label: "Benefícios",
            value: income.benefits,
            icon: Gift,
            color: "text-green-600 dark:text-green-400",
            percentage:
              income.total > 0 ? (income.benefits / income.total) * 100 : 0,
          },
        ]
      : []),
    ...(income.variable > 0
      ? [
          {
            label: "Variável",
            value: income.variable,
            icon: Sparkles,
            color: "text-green-600 dark:text-green-400",
            percentage:
              income.total > 0 ? (income.variable / income.total) * 100 : 0,
          },
        ]
      : []),
  ];

  const expenseItems = [
    {
      label: "Fixas",
      value: expenses.fixed,
      icon: Home,
      color: "text-red-600 dark:text-red-400",
      percentage:
        expenses.total > 0 ? (expenses.fixed / expenses.total) * 100 : 0,
    },
    {
      label: "Variáveis",
      value: expenses.variable,
      icon: ShoppingCart,
      color: "text-red-600 dark:text-red-400",
      percentage:
        expenses.total > 0 ? (expenses.variable / expenses.total) * 100 : 0,
    },
    ...(expenses.subscriptions > 0
      ? [
          {
            label: "Assinaturas",
            value: expenses.subscriptions,
            icon: CreditCard,
            color: "text-red-600 dark:text-red-400",
            percentage:
              expenses.total > 0
                ? (expenses.subscriptions / expenses.total) * 100
                : 0,
          },
        ]
      : []),
  ];

  return (
    <Card className="bg-background flex h-full flex-col overflow-hidden border-0 shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium tracking-tight">
            Visão Geral
          </CardTitle>
          {hasSignificantChange && (
            <div
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                changePercent >= 0
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {changePercent >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Coluna 1: Saldo */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                Saldo Atual
              </p>
              <p className="text-muted-foreground mb-1 text-xs">
                {new Date().toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p
                className={`text-3xl font-light tracking-tight ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(currentBalance)}
              </p>
            </div>

            <div className="border-muted border-l-2 pl-4">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="text-muted-foreground h-4 w-4" />
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Previsto
                </p>
              </div>
              <p className="text-muted-foreground mb-2 text-xs">Fim do mês</p>
              <p
                className={`mb-2 text-2xl font-light tracking-tight ${
                  isProjectedPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
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

          {/* Coluna 2: Receitas */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Receitas
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-green-600 dark:text-green-400">
                {formatCurrency(income.total)}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              {incomeItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="group">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-3.5 w-3.5 ${item.color} opacity-60`}
                        />
                        <p className="text-muted-foreground text-xs font-medium">
                          {item.label}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${item.color}`}>
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                    <div className="bg-muted relative h-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full bg-green-500 transition-all duration-500 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna 3: Despesas */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Despesas
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-red-600 dark:text-red-400">
                {formatCurrency(expenses.total)}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              {expenseItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="group">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-3.5 w-3.5 ${item.color} opacity-60`}
                        />
                        <p className="text-muted-foreground text-xs font-medium">
                          {item.label}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${item.color}`}>
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                    <div className="bg-muted relative h-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full bg-red-500 transition-all duration-500 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
