/**
 * BalanceCard - Card principal exibindo saldo atual
 * 
 * Props:
 * - balance: Saldo atual em número
 * - changePercent: Percentual de variação (positivo ou negativo)
 * - sparklineData: Array de números para o gráfico sparkline
 * - onRefresh: Callback para atualizar dados manualmente
 * 
 * Acessibilidade: role="region" com aria-label
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/src/lib/utils";

interface BalanceCardProps {
  balance: number;
  changePercent: number;
  sparklineData: number[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function BalanceCard({
  balance,
  changePercent,
  sparklineData,
  onRefresh,
  isLoading = false,
}: BalanceCardProps) {
  const isPositive = balance >= 0;
  const isChangePositive = changePercent >= 0;

  // Preparar dados para o sparkline
  const chartData = sparklineData.map((value, index) => ({
    day: index + 1,
    value,
  }));

  return (
    <Card
      role="region"
      aria-label="Saldo atual"
      className="relative overflow-hidden border-2"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Atual
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Atualizar saldo"
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Saldo principal */}
          <div>
            <p
              className={`text-3xl font-bold ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>

          {/* Variação percentual */}
          <div className="flex items-center gap-2">
            {isChangePositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                isChangePositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isChangePositive ? "+" : ""}
              {changePercent.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs. período anterior
            </span>
          </div>

          {/* Sparkline */}
          {sparklineData.length > 0 && (
            <div className="h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      isPositive
                        ? "hsl(142, 76%, 36%)"
                        : "hsl(0, 84%, 60%)"
                    }
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

