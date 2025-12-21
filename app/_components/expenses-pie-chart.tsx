"use client";

import { TransactionCategory } from "@/app/generated/prisma/client";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_CATEGORY_ICONS,
  TRANSACTION_CATEGORY_COLORS,
} from "@/app/_constants/transactions";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { formatCurrency } from "@/app/_lib/utils";

interface ExpensesPieChartProps {
  expenses: {
    category: TransactionCategory;
    total: number;
    percentage: number;
  }[];
}

export default function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = expenses.map((expense) => ({
    name: TRANSACTION_CATEGORY_LABELS[expense.category],
    value: expense.total,
    percentage: expense.percentage,
    category: expense.category,
    fill: TRANSACTION_CATEGORY_COLORS[expense.category],
  }));

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.total, 0);

  if (expenses.length === 0) {
    return (
      <Card className="flex h-full flex-col border shadow-sm">
        <CardHeader className="flex-shrink-0 border-b p-3 pb-2.5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="text-base">📊</span>
            </div>
            <span>Despesas por Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-3">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma despesa encontrada
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Adicione transações para ver suas despesas por categoria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar por valor (maior primeiro) e pegar top 3
  const topCategories = [...chartData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card rounded-lg border p-2 shadow-lg">
          <p className="text-xs font-semibold">{data.payload.name}</p>
          <p className="text-muted-foreground text-[10px]">
            {formatCurrency(data.value)} ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex h-full flex-col border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-3 pb-2.5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <span className="text-base">📊</span>
          </div>
          <span>Despesas por Categoria</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-3">
        {/* Layout vertical: gráfico primeiro, depois informações */}
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Gráfico compacto */}
          <div className="mx-auto h-24 w-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="85%"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className="transition-opacity duration-200"
                      style={{
                        opacity:
                          activeIndex === undefined || activeIndex === index
                            ? 1
                            : 0.3,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Valor total */}
          <div>
            <p className="text-muted-foreground mb-0.5 text-[10px]">
              Total gasto
            </p>
            <p className="text-base font-bold">{formatCurrency(totalAmount)}</p>
          </div>

          {/* Top categorias */}
          {topCategories.map((entry, index) => {
            const Icon = TRANSACTION_CATEGORY_ICONS[entry.category];
            return (
              <div
                key={index}
                className="flex items-center gap-2"
                onMouseEnter={() => {
                  const chartIndex = chartData.findIndex(
                    (item) => item.category === entry.category,
                  );
                  setActiveIndex(chartIndex);
                }}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                  style={{
                    backgroundColor: entry.fill,
                    opacity: 0.9,
                  }}
                >
                  <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground truncate text-[10px]">
                    {entry.name}
                  </p>
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: entry.fill }}
                  >
                    {formatCurrency(entry.value)}
                  </p>
                </div>
                <p className="text-xs font-bold" style={{ color: entry.fill }}>
                  {entry.percentage.toFixed(0)}%
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
