/**
 * IncomeBreakdownCard - Card moderno mostrando breakdown de receitas
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
import type { IncomeBreakdown } from "@/src/types/dashboard";
import { TrendingUp, Wallet, Gift, Sparkles } from "lucide-react";

interface IncomeBreakdownCardProps {
  income: IncomeBreakdown;
}

export function IncomeBreakdownCard({ income }: IncomeBreakdownCardProps) {
  const total = income.total || 1;

  const incomeItems = [
    {
      label: "Salário",
      value: income.salary,
      icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      percentage: total > 0 ? (income.salary / total) * 100 : 0,
    },
    ...(income.benefits > 0
      ? [
          {
            label: "Benefícios",
            value: income.benefits,
            icon: Gift,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
            percentage: total > 0 ? (income.benefits / total) * 100 : 0,
          },
        ]
      : []),
    ...(income.variable > 0
      ? [
          {
            label: "Variável",
            value: income.variable,
            icon: Sparkles,
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
            percentage: total > 0 ? (income.variable / total) * 100 : 0,
          },
        ]
      : []),
  ];

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-1.5 sm:p-2 md:p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs md:gap-2 md:text-sm lg:text-base">
            <div className="flex h-4 w-4 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8">
              <TrendingUp className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3 md:h-4 md:w-4" />
            </div>
            <span className="hidden sm:inline">Receitas do Mês</span>
            <span className="sm:hidden">Receitas</span>
          </CardTitle>
        </div>
        <p className="mt-1 text-sm font-bold text-green-600 sm:mt-1.5 sm:text-base md:mt-2 md:text-xl lg:text-2xl dark:text-green-400">
          {formatCurrency(income.total)}
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-2 md:p-3 lg:p-4">
        <div className="flex-1 space-y-1 sm:space-y-1.5 md:space-y-2.5">
          {incomeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-card hover:bg-muted/50 flex items-center gap-1 rounded-lg border p-1 transition-colors sm:gap-1.5 sm:p-1.5 md:gap-2.5 md:p-2"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg sm:h-6 sm:w-6 md:h-8 md:w-8 ${item.bgColor}`}
                >
                  <Icon
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 ${item.color}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <p className="text-muted-foreground text-[8px] font-medium sm:text-[9px] md:text-xs">
                      {item.label}
                    </p>
                    <p
                      className={`text-[9px] font-bold sm:text-xs md:text-sm ${item.color}`}
                    >
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <div className="bg-muted h-0.5 flex-1 overflow-hidden rounded-full sm:h-1 md:h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.bgColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[8px] font-medium sm:text-[9px] md:text-[10px]">
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
