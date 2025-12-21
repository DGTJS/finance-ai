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
      <CardHeader className="flex-shrink-0 border-b p-1.5 sm:p-2 md:p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs md:gap-2 md:text-sm lg:text-base">
            <div className="flex h-4 w-4 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8">
              <span className="text-[10px] sm:text-xs md:text-base lg:text-lg">
                💰
              </span>
            </div>
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </CardTitle>
          {hasSignificantChange && (
            <div
              className={`flex items-center gap-0.5 rounded-full px-1 py-0.5 sm:gap-0.5 sm:px-1.5 sm:py-0.5 md:gap-1 md:px-2 md:py-1 ${
                changePercent >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {changePercent >= 0 ? (
                <ArrowUpRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
              ) : (
                <ArrowDownRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
              )}
              <span className="text-[8px] font-semibold sm:text-[9px] md:text-[10px] lg:text-xs">
                {changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-2 md:p-3 lg:p-4">
        {/* Saldo Atual - Destaque */}
        <div className="mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
          <p className="text-muted-foreground mb-0.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
            Saldo Atual{" "}
            <span className="text-[7px] sm:text-[8px] md:text-[9px]">
              {new Date().toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>
          <p
            className={`text-sm font-bold sm:text-lg md:text-2xl lg:text-3xl ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(currentBalance)}
          </p>
        </div>

        {/* Saldo Previsto */}
        <div className="bg-muted/50 flex flex-1 flex-col justify-between rounded-lg border p-1.5 sm:p-2 md:p-3">
          <div>
            <div className="mb-1 flex items-center justify-between sm:mb-1.5 md:mb-2">
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
                <Eye className="text-muted-foreground h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                <span className="text-muted-foreground text-[8px] font-medium sm:text-[9px] md:text-xs">
                  Previsto
                </span>
              </div>
              <span className="text-muted-foreground text-[7px] sm:text-[8px] md:text-[9px]">
                Fim mês
              </span>
            </div>
            <p
              className={`mb-0.5 text-sm font-bold sm:mb-1 sm:text-base md:text-xl lg:text-2xl ${
                isProjectedPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(projectedBalance)}
            </p>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-muted-foreground text-[7px] leading-tight sm:text-[8px] md:text-[9px] lg:text-[10px]">
              Inclui gastos previstos
            </p>
            {hasImprovement && (
              <div className="flex items-center gap-0.5 text-[7px] text-green-600 sm:gap-1 sm:text-[8px] md:gap-1.5 md:text-[9px] lg:text-[10px] dark:text-green-400">
                <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
                <span className="font-medium">Melhora prevista</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
