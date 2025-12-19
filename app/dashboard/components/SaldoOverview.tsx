/**
 * SaldoOverview - Card principal mostrando saldo atual e previsto
 *
 * Props:
 * - currentBalance: Saldo atual do mês
 * - projectedBalance: Saldo previsto até o fim do mês
 * - changePercent: Variação percentual vs mês anterior
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";

interface SaldoOverviewProps {
  currentBalance: number;
  projectedBalance: number;
  changePercent: number;
}

export function SaldoOverview({
  currentBalance,
  projectedBalance,
  changePercent,
}: SaldoOverviewProps) {
  const isPositive = currentBalance >= 0;
  const isProjectedPositive = projectedBalance >= 0;
  const hasImprovement = projectedBalance > currentBalance;

  return (
    <Card className="overflow-hidden border-2 shadow-lg">
      {/* Mobile: Layout ultra-compacto para grid de 3 */}
      <div className="md:hidden">
        <div className="from-primary/10 via-primary/5 bg-gradient-to-br to-transparent p-2 sm:p-3">
          <div className="mb-2">
            <p className="text-muted-foreground mb-0.5 text-[8px] sm:text-[9px]">
              Saldo Atual
            </p>
            <p
              className={`text-base leading-tight font-extrabold sm:text-lg ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(currentBalance)}
            </p>
          </div>

          <div className="mb-2">
            <Badge
              variant={changePercent >= 0 ? "default" : "destructive"}
              className="px-1 py-0 text-[7px] sm:text-[8px]"
            >
              {changePercent >= 0 ? (
                <TrendingUp className="mr-0.5 h-2 w-2" />
              ) : (
                <TrendingDown className="mr-0.5 h-2 w-2" />
              )}
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="bg-background/80 rounded border p-1.5 backdrop-blur-sm">
              <p className="text-muted-foreground mb-0.5 text-[8px]">
                Previsto
              </p>
              <p
                className={`truncate text-xs font-bold sm:text-sm ${
                  isProjectedPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(projectedBalance)}
              </p>
            </div>
            <div className="bg-background/80 rounded border p-1.5 backdrop-blur-sm">
              <p className="text-muted-foreground mb-0.5 text-[8px]">Status</p>
              <p
                className={`truncate text-[9px] font-bold ${
                  projectedBalance > 0 && changePercent >= 0
                    ? "text-green-600 dark:text-green-400"
                    : projectedBalance > 0
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {projectedBalance > 0 && changePercent >= 0
                  ? "✅ Saudável"
                  : projectedBalance > 0
                    ? "⚠️ Atenção"
                    : "❌ Crítico"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop: Layout completo */}
      <div className="hidden md:block">
        <CardHeader className="from-primary/5 border-b bg-gradient-to-r to-transparent">
          <CardTitle className="flex items-center justify-between text-lg lg:text-xl">
            <span className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Visão Geral
            </span>
            <Badge
              variant={changePercent >= 0 ? "default" : "destructive"}
              className="text-xs sm:text-sm"
            >
              {changePercent >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 lg:space-y-6 lg:p-6">
          {/* Saldo Atual */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Saldo Atual
              </span>
              <span className="text-muted-foreground text-xs">
                {new Date().toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div
              className={`text-3xl font-bold lg:text-4xl ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(currentBalance)}
            </div>
          </div>

          {/* Saldo Previsto */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                Saldo Previsto
              </span>
              <span className="text-muted-foreground text-xs">
                Até fim do mês
              </span>
            </div>
            <div
              className={`mt-2 text-2xl font-bold lg:text-3xl ${
                isProjectedPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(projectedBalance)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Inclui gastos previstos do próximo mês (assinaturas e parcelas)
            </p>
            {hasImprovement && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Projeção indica melhora no saldo até o fim do mês
              </p>
            )}
          </div>

          {/* Indicador de Saúde Financeira */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Saúde Financeira</span>
              <span
                className={`font-semibold ${
                  projectedBalance > 0 && changePercent >= 0
                    ? "text-green-600 dark:text-green-400"
                    : projectedBalance > 0
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {projectedBalance > 0 && changePercent >= 0
                  ? "✅ Saudável"
                  : projectedBalance > 0
                    ? "⚠️ Atenção"
                    : "❌ Crítico"}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
