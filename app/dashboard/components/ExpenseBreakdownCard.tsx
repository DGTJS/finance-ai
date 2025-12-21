/**
 * ExpenseBreakdownCard - Card moderno mostrando breakdown de despesas
 * Design compacto e visualmente atraente
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { ExpenseBreakdown } from "@/src/types/dashboard";
import { TrendingDown, Home, ShoppingCart, CreditCard } from "lucide-react";

interface ExpenseBreakdownCardProps {
  expenses: ExpenseBreakdown;
}

export function ExpenseBreakdownCard({ expenses }: ExpenseBreakdownCardProps) {
  const total = expenses.total || 1;

  const expenseItems = [
    {
      label: "Fixas",
      value: expenses.fixed,
      icon: Home,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      percentage: total > 0 ? (expenses.fixed / total) * 100 : 0,
    },
    {
      label: "Variáveis",
      value: expenses.variable,
      icon: ShoppingCart,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      percentage: total > 0 ? (expenses.variable / total) * 100 : 0,
    },
    ...(expenses.subscriptions > 0
      ? [
          {
            label: "Assinaturas",
            value: expenses.subscriptions,
            icon: CreditCard,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
            percentage: total > 0 ? (expenses.subscriptions / total) * 100 : 0,
          },
        ]
      : []),
  ];

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-red-600 sm:h-8 sm:w-8">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <span>Despesas do Mês</span>
          </CardTitle>
        </div>
        <p className="mt-2 text-xl font-bold text-red-600 sm:text-2xl dark:text-red-400">
          {formatCurrency(expenses.total)}
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex-1 space-y-2.5">
          {expenseItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-card hover:bg-muted/50 flex items-center gap-2.5 rounded-lg border p-2 transition-colors"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bgColor}`}
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium">
                      {item.label}
                    </p>
                    <p className={`text-sm font-bold ${item.color}`}>
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.bgColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
