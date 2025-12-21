/**
 * SaldoOverview - Card principal moderno mostrando saldo atual e previsto
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
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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
  const hasSignificantChange = Math.abs(changePercent) > 0.01;

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 sm:h-8 sm:w-8">
              <span className="text-base sm:text-lg">💰</span>
            </div>
            <span>Visão Geral</span>
          </CardTitle>
          {hasSignificantChange && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                changePercent >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {changePercent >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span className="text-[10px] font-semibold sm:text-xs">
                {changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        {/* Saldo Atual - Destaque */}
        <div className="mb-3 sm:mb-4">
          <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">
            Saldo Atual{" "}
            <span className="text-[9px]">
              {new Date().toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>
          <p
            className={`text-2xl font-bold sm:text-3xl ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(currentBalance)}
          </p>
        </div>

        {/* Saldo Previsto */}
        <div className="bg-muted/50 flex flex-1 flex-col justify-between rounded-lg border p-3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-muted-foreground text-xs font-medium">
                  Saldo Previsto
                </span>
              </div>
              <span className="text-muted-foreground text-[9px]">
                Até fim do mês
              </span>
            </div>
            <p
              className={`mb-1 text-xl font-bold sm:text-2xl ${
                isProjectedPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(projectedBalance)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground text-[9px] leading-tight sm:text-[10px]">
              Inclui gastos previstos do próximo mês (assinaturas e parcelas)
            </p>
            {hasImprovement && (
              <div className="flex items-center gap-1.5 text-[9px] text-green-600 sm:text-[10px] dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">
                  Projeção indica melhora no saldo
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
