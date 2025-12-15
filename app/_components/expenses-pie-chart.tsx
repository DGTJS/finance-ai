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
      <Card className="border shadow-sm">
        <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3 md:p-6">
          <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base md:text-lg lg:text-xl">
            <span className="text-base sm:text-xl md:text-2xl">📊</span>
            <span className="leading-tight">Despesas por Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[300px] items-center justify-center sm:h-[350px]">
            Nenhuma despesa encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card rounded-lg border p-3 shadow-md">
          <p className="text-sm font-semibold">{data.payload.name}</p>
          <p className="text-muted-foreground text-xs">
            {formatCurrency(data.value)} ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="from-primary/5 border-b bg-gradient-to-r to-transparent p-3 pb-2 sm:p-4 sm:pb-3 md:p-6">
        <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base md:text-lg lg:text-xl">
          <span className="text-base sm:text-xl md:text-2xl">📊</span>
          <span className="leading-tight">Despesas por Categoria</span>
        </CardTitle>
        <p className="text-muted-foreground mt-1 text-[10px] leading-tight sm:text-xs md:text-sm">
          Distribuição detalhada dos seus gastos
        </p>
      </CardHeader>
      <CardContent className="p-3 pb-3 sm:p-4 sm:pb-4 lg:p-6 lg:pb-4">
        {/* Gráfico de Pizza */}
        <div className="w-full">
          <div className="relative mx-auto w-full" style={{ maxWidth: "100%" }}>
            <div className="relative" style={{ paddingTop: "100%" }}>
              {/* Gráfico de Pizza */}
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {chartData.map((entry, index) => (
                        <filter
                          key={`shadow-${index}`}
                          id={`shadow-${index}`}
                          height="200%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="4"
                            floodColor={entry.fill}
                            floodOpacity="0.3"
                          />
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={450}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percentage,
                      }: any) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          (innerRadius as number) +
                          ((outerRadius as number) - (innerRadius as number)) *
                            0.5;
                        const x =
                          (cx as number) +
                          radius * Math.cos(-midAngle * RADIAN);
                        const y =
                          (cy as number) +
                          radius * Math.sin(-midAngle * RADIAN);

                        if (percentage < 5) return null;

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-[10px] font-bold drop-shadow-lg sm:text-xs"
                            style={{
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                            }}
                          >
                            {`${(percentage * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className="cursor-pointer transition-all duration-300"
                          style={{
                            filter: `url(#shadow-${index})`,
                            opacity:
                              activeIndex === undefined || activeIndex === index
                                ? 1
                                : 0.4,
                            strokeWidth: 2,
                            stroke: "white",
                          }}
                        />
                      ))}
                    </Pie>

                    {/* Círculo Branco no Centro */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="28%"
                      fill="white"
                      style={{
                        filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.1))",
                      }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Texto Central */}
              <div className="absolute top-1/2 left-1/2 z-20 flex w-[55%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-[9px] font-semibold sm:text-[10px]">
                  Gasto total
                </p>
                <p
                  className="text-foreground mt-0.5 text-sm font-bold sm:mt-1 sm:text-base md:text-lg"
                  style={{ lineHeight: "1.2" }}
                >
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda Compacta com Valores */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-3 lg:grid-cols-2 xl:grid-cols-2">
          {chartData
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => {
              const Icon = TRANSACTION_CATEGORY_ICONS[entry.category];
              const isActive = activeIndex === index;

              return (
                <div
                  key={`legend-${index}`}
                  className="group bg-card cursor-pointer overflow-hidden rounded-lg border-2 p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md sm:p-3.5 md:p-4"
                  style={{
                    borderColor: isActive ? entry.fill : "transparent",
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? undefined : index)
                  }
                >
                  {/* Linha 1: Ícone e Nome */}
                  <div className="mb-2 flex w-full items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      style={{
                        backgroundColor: entry.fill,
                        boxShadow: `0 2px 8px ${entry.fill}40`,
                      }}
                    >
                      <Icon
                        className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5"
                        style={{ color: "white" }}
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground truncate text-xs font-medium sm:text-sm md:text-base">
                        {entry.name}
                      </p>
                    </div>
                  </div>

                  {/* Linha 2: Valor e Porcentagem */}
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <p
                      className="text-sm font-bold sm:text-base md:text-lg"
                      style={{ color: entry.fill }}
                    >
                      {formatCurrency(entry.value)}
                    </p>
                    <p
                      className="text-base font-bold sm:text-lg md:text-xl"
                      style={{ color: entry.fill }}
                    >
                      {entry.percentage.toFixed(0)}%
                    </p>
                  </div>

                  {/* Mini Barra */}
                  <div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: entry.fill,
                          boxShadow: `0 0 4px ${entry.fill}60`,
                        }}
                      />
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
