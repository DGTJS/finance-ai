/**
 * IncomeBreakdownCard - Card mostrando breakdown de receitas
 * 
 * Props:
 * - income: Breakdown de receitas (salary, benefits, variable, total)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { IncomeBreakdown } from "@/src/types/dashboard";
import { TrendingUp, Wallet, Gift, Sparkles } from "lucide-react";
import { Progress } from "@/app/_components/ui/progress";

interface IncomeBreakdownCardProps {
  income: IncomeBreakdown;
}

export function IncomeBreakdownCard({ income }: IncomeBreakdownCardProps) {
  const total = income.total || 1; // Evitar divisão por zero

  return (
    <Card className="border shadow-sm overflow-hidden">
      {/* Mobile: Layout compacto para grid de 3 */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-2 sm:p-3">
          <div className="mb-2">
            <p className="text-[8px] text-muted-foreground mb-0.5 sm:text-[9px]">Receitas</p>
            <p className="text-base font-extrabold text-green-600 dark:text-green-400 sm:text-lg">
              {formatCurrency(income.total)}
            </p>
          </div>
          
          <div className="space-y-1.5">
            <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-blue-600 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[9px] font-medium sm:text-[10px]">Salário</span>
                </div>
                <span className="text-xs font-bold sm:text-sm">{formatCurrency(income.salary)}</span>
              </div>
            </div>
            {income.benefits > 0 && (
              <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Gift className="h-3 w-3 text-purple-600 sm:h-3.5 sm:w-3.5" />
                    <span className="text-[9px] font-medium sm:text-[10px]">Benefícios</span>
                  </div>
                  <span className="text-xs font-bold sm:text-sm">{formatCurrency(income.benefits)}</span>
                </div>
              </div>
            )}
            {income.variable > 0 && (
              <div className="bg-background/80 backdrop-blur-sm rounded border px-1.5 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-orange-600 sm:h-3.5 sm:w-3.5" />
                    <span className="text-[9px] font-medium sm:text-[10px]">Variável</span>
                  </div>
                  <span className="text-xs font-bold sm:text-sm">{formatCurrency(income.variable)}</span>
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
            <TrendingUp className="h-5 w-5 text-green-600" />
            Receitas do Mês
          </CardTitle>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(income.total)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 lg:p-6">
          {/* Salário */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Salário</span>
              </div>
              <span className="font-bold">{formatCurrency(income.salary)}</span>
            </div>
            {total > 0 && (
              <>
                <Progress value={(income.salary / total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {((income.salary / total) * 100).toFixed(1)}% do total
                </p>
              </>
            )}
          </div>

          {/* Benefícios */}
          {income.benefits > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Benefícios</span>
                </div>
                <span className="font-bold">{formatCurrency(income.benefits)}</span>
              </div>
              {total > 0 && (
                <>
                  <Progress
                    value={(income.benefits / total) * 100}
                    className="h-2 bg-purple-100 dark:bg-purple-900"
                  />
                  <p className="text-xs text-muted-foreground">
                    {((income.benefits / total) * 100).toFixed(1)}% do total
                  </p>
                </>
              )}
            </div>
          )}

          {/* Receitas Variáveis */}
          {income.variable > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Receitas Variáveis</span>
                </div>
                <span className="font-bold">{formatCurrency(income.variable)}</span>
              </div>
              {total > 0 && (
                <>
                  <Progress
                    value={(income.variable / total) * 100}
                    className="h-2 bg-orange-100 dark:bg-orange-900"
                  />
                  <p className="text-xs text-muted-foreground">
                    {((income.variable / total) * 100).toFixed(1)}% do total
                  </p>
                </>
              )}
            </div>
          )}

          {/* Resumo */}
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Fixa</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(income.salary + income.benefits)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Variável</p>
                <p className="text-sm font-semibold">{formatCurrency(income.variable)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                <p className="text-sm font-semibold">{formatCurrency(income.total)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}


