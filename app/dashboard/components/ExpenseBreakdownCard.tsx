/**
 * ExpenseBreakdownCard - Card mostrando breakdown de despesas
 * 
 * Props:
 * - expenses: Breakdown de despesas (fixed, variable, subscriptions, total)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { ExpenseBreakdown } from "@/src/types/dashboard";
import { TrendingDown, Home, ShoppingCart, CreditCard } from "lucide-react";
import { Progress } from "@/app/_components/ui/progress";

interface ExpenseBreakdownCardProps {
  expenses: ExpenseBreakdown;
}

export function ExpenseBreakdownCard({
  expenses,
}: ExpenseBreakdownCardProps) {
  const total = expenses.total || 1; // Evitar divisão por zero

  return (
    <Card className="border shadow-sm overflow-hidden">
      {/* Mobile: Layout compacto para grid de 3 */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent p-2 sm:p-3">
          <div className="mb-2">
            <p className="text-[8px] text-muted-foreground mb-0.5 sm:text-[9px]">Despesas</p>
            <p className="text-base font-extrabold text-red-600 dark:text-red-400 sm:text-lg">
              {formatCurrency(expenses.total)}
            </p>
          </div>
          
          <div className="space-y-1.5">
            <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Home className="h-3 w-3 text-blue-600 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[9px] font-medium sm:text-[10px]">Fixas</span>
                </div>
                <span className="text-xs font-bold sm:text-sm">{formatCurrency(expenses.fixed)}</span>
              </div>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3 text-orange-600 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[9px] font-medium sm:text-[10px]">Variáveis</span>
                </div>
                <span className="text-xs font-bold sm:text-sm">{formatCurrency(expenses.variable)}</span>
              </div>
            </div>
            {expenses.subscriptions > 0 && (
              <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-purple-600 sm:h-3.5 sm:w-3.5" />
                    <span className="text-[9px] font-medium sm:text-[10px]">Assinaturas</span>
                  </div>
                  <span className="text-xs font-bold sm:text-sm">{formatCurrency(expenses.subscriptions)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tablet/Desktop: Layout completo */}
      <div className="hidden md:block">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Despesas do Mês
          </CardTitle>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(expenses.total)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 lg:p-6">
          {/* Despesas Fixas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Despesas Fixas</span>
              </div>
              <span className="font-bold">{formatCurrency(expenses.fixed)}</span>
            </div>
            {total > 0 && (
              <>
                <Progress
                  value={(expenses.fixed / total) * 100}
                  className="h-2 bg-blue-100 dark:bg-blue-900"
                />
                <p className="text-xs text-muted-foreground">
                  {((expenses.fixed / total) * 100).toFixed(1)}% do total
                </p>
              </>
            )}
            {expenses.subscriptions > 0 && (
              <p className="text-xs text-muted-foreground">
                (Inclui {formatCurrency(expenses.subscriptions)} em assinaturas)
              </p>
            )}
          </div>

          {/* Despesas Variáveis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Despesas Variáveis</span>
              </div>
              <span className="font-bold">{formatCurrency(expenses.variable)}</span>
            </div>
            {total > 0 && (
              <>
                <Progress
                  value={(expenses.variable / total) * 100}
                  className="h-2 bg-orange-100 dark:bg-orange-900"
                />
                <p className="text-xs text-muted-foreground">
                  {((expenses.variable / total) * 100).toFixed(1)}% do total
                </p>
              </>
            )}
          </div>

          {/* Resumo */}
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Fixas</p>
                <p className="text-sm font-semibold">{formatCurrency(expenses.fixed)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Variáveis</p>
                <p className="text-sm font-semibold">{formatCurrency(expenses.variable)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}


