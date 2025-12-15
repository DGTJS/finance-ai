/**
 * DailyBalanceChart - Gráfico de linha mostrando evolução diária do saldo
 * 
 * Props:
 * - dailyBalance: Array de {date, balance} para cada dia
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { DailyBalance } from "@/src/types/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DailyBalanceChartProps {
  dailyBalance: DailyBalance[];
}

export function DailyBalanceChart({
  dailyBalance,
}: DailyBalanceChartProps) {
  // Formatar dados para o gráfico
  const chartData = dailyBalance.map((item) => ({
    date: new Date(item.date).getDate(), // Dia do mês
    balance: item.balance,
    formattedDate: new Date(item.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
  }));

  // Calcular valores min/max para melhor visualização
  const balances = chartData.map((d) => d.balance);
  const minBalance = Math.min(...balances, 0);
  const maxBalance = Math.max(...balances);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-md">
          <p className="text-sm font-semibold">{data.formattedDate}</p>
          <p
            className={`text-lg font-bold ${
              data.balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(data.balance)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5" />
            Evolução do Saldo Diário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o mês atual
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border shadow-sm lg:h-full">
      <CardHeader className="border-b flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-5 w-5" />
          Evolução do Saldo Diário
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Saldo acumulado ao longo do mês
        </p>
      </CardHeader>
      <CardContent className="flex flex-col p-4 sm:p-6">
        <div className="w-full min-h-[300px] h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Dia ${value}`}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `R$ ${(value / 1000).toFixed(0)}k`;
                }
                return `R$ ${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#888" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
        <div className="mt-4 flex-shrink-0 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Início</p>
            <p className="font-semibold">
              {formatCurrency(chartData[0]?.balance || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Atual</p>
            <p className="font-semibold">
              {formatCurrency(chartData[chartData.length - 1]?.balance || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Variação</p>
            <p
              className={`font-semibold ${
                (chartData[chartData.length - 1]?.balance || 0) >=
                (chartData[0]?.balance || 0)
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(
                (chartData[chartData.length - 1]?.balance || 0) -
                  (chartData[0]?.balance || 0)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


