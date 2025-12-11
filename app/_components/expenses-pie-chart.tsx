"use client";

import { TransactionCategory } from "@/app/generated/prisma/client";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_CATEGORY_ICONS,
  TRANSACTION_CATEGORY_COLORS,
} from "@/app/_constants/transactions";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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

export default function ExpensesPieChart({
  expenses,
}: ExpensesPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = expenses.map((expense) => ({
    name: TRANSACTION_CATEGORY_LABELS[expense.category],
    value: expense.total,
    percentage: expense.percentage,
    category: expense.category,
    fill: TRANSACTION_CATEGORY_COLORS[expense.category],
  }));

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.total, 0);

  // Calcular posição dos ícones e linhas
  const calculatePositions = (index: number, total: number) => {
    const angle = ((index / total) * 360 - 90) * (Math.PI / 180);
    
    // Posição do ícone (externo)
    const iconRadius = 165;
    const iconX = 50 + (iconRadius / 200) * 50 * Math.cos(angle);
    const iconY = 50 + (iconRadius / 200) * 50 * Math.sin(angle);
    
    // Posição da conexão no gráfico (borda da fatia)
    const pieRadius = 110; // outerRadius do gráfico
    const pieX = 50 + (pieRadius / 200) * 50 * Math.cos(angle);
    const pieY = 50 + (pieRadius / 200) * 50 * Math.sin(angle);
    
    return { iconX, iconY, pieX, pieY, angle };
  };

  if (expenses.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="text-xl sm:text-2xl">📊</span>
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] sm:h-[350px] items-center justify-center text-muted-foreground">
            Nenhuma despesa encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="text-xl sm:text-2xl">📊</span>
          Despesas por Categoria
        </CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Distribuição detalhada dos seus gastos
        </p>
      </CardHeader>
      <CardContent className="p-3 pb-3 sm:p-4 sm:pb-4 lg:p-6 lg:pb-4">
        {/* Container Responsivo do Gráfico */}
        <div className="relative mx-auto w-full" style={{ maxWidth: "500px" }}>
          <div className="relative" style={{ paddingTop: "100%" }}>
            {/* SVG para as linhas conectoras (estilo balão) */}
            <svg
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            >
              {chartData.map((entry, index) => {
                const { iconX, iconY, pieX, pieY } = calculatePositions(index, chartData.length);
                const isActive = activeIndex === index;
                
                return (
                  <line
                    key={`line-${index}`}
                    x1={`${iconX}%`}
                    y1={`${iconY}%`}
                    x2={`${pieX}%`}
                    y2={`${pieY}%`}
                    stroke={entry.fill}
                    strokeWidth={isActive ? "3" : "2"}
                    strokeDasharray={isActive ? "0" : "5,5"}
                    opacity={isActive ? "0.9" : "0.4"}
                    className="transition-all duration-300"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 4px ${entry.fill})` : "none",
                    }}
                  />
                );
              })}
            </svg>

            {/* Ícones Flutuantes com Linhas */}
            {chartData.map((entry, index) => {
              const Icon = TRANSACTION_CATEGORY_ICONS[entry.category];
              const { iconX, iconY } = calculatePositions(index, chartData.length);
              const isActive = activeIndex === index;
              
              return (
                <div
                  key={`floating-icon-${index}`}
                  className="absolute z-10 transition-all duration-500 cursor-pointer"
                  style={{
                    left: `${iconX}%`,
                    top: `${iconY}%`,
                    transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : 1})`,
                    animation: `float ${3 + index * 0.3}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  onClick={() => setActiveIndex(activeIndex === index ? undefined : index)}
                >
                  {/* Balão do Ícone */}
                  <div className="relative flex flex-col items-center">
                    {/* Badge de Porcentagem no Topo */}
                    <div
                      className="mb-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: entry.fill,
                        color: "white",
                        transform: `scale(${isActive ? 1.1 : 1})`,
                      }}
                    >
                      {entry.percentage.toFixed(0)}%
                    </div>
                    
                    {/* Ícone */}
                    <div
                      className="flex items-center justify-center rounded-full transition-all duration-300 shadow-xl"
                      style={{
                        width: "clamp(40px, 9vw, 56px)",
                        height: "clamp(40px, 9vw, 56px)",
                        backgroundColor: entry.fill,
                        border: `3px solid white`,
                        boxShadow: isActive
                          ? `0 0 0 3px ${entry.fill}, 0 8px 24px ${entry.fill}90`
                          : `0 6px 16px ${entry.fill}60`,
                      }}
                    >
                      <Icon
                        className="transition-all duration-300"
                        style={{ 
                          width: "clamp(20px, 5vw, 28px)",
                          height: "clamp(20px, 5vw, 28px)",
                          color: "white",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        }}
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Gráfico de Pizza */}
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {chartData.map((entry, index) => (
                      <filter key={`shadow-${index}`} id={`shadow-${index}`} height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={entry.fill} floodOpacity="0.5" />
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="35%"
                    outerRadius="52%"
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    paddingAngle={4}
                    startAngle={90}
                    endAngle={450}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
                      const RADIAN = Math.PI / 180;
                      const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                      const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                      const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);

                      if (percentage < 0.05) return null;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-xs font-bold drop-shadow-lg sm:text-sm"
                          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
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
                          opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.4,
                          strokeWidth: 3,
                          stroke: "white",
                        }}
                      />
                    ))}
                  </Pie>
                  
                  {/* Círculo Branco no Centro */}
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="33%" 
                    fill="white" 
                    style={{ 
                      filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))",
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Texto Central */}
              <div className="absolute left-1/2 top-1/2 z-20 flex w-[65%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                <p className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                  Gasto total
                </p>
                <p className="mt-0.5 text-base font-bold text-foreground sm:mt-1 sm:text-lg md:text-xl" style={{ lineHeight: "1.2" }}>
                  {formatCurrency(totalAmount)}
                </p>
                <button
                  className="mt-1.5 rounded-full bg-gradient-to-r from-primary to-primary/90 px-2.5 py-1 text-[9px] font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 sm:mt-2 sm:px-3 sm:py-1 sm:text-[10px]"
                  onClick={() => window.location.href = "/transactions"}
                >
                  Ver transações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda com Mini Gráficos - Responsiva */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
          {chartData.map((entry, index) => {
            const Icon = TRANSACTION_CATEGORY_ICONS[entry.category];
            const isActive = activeIndex === index;
            
            return (
              <div
                key={`legend-${index}`}
                className="group cursor-pointer overflow-hidden rounded-lg border-2 bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:rounded-xl"
                style={{
                  borderColor: isActive ? entry.fill : undefined,
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                onClick={() => setActiveIndex(activeIndex === index ? undefined : index)}
              >
                {/* Header do Card */}
                <div className="flex items-center gap-2 p-2 sm:gap-2.5 sm:p-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: entry.fill,
                      boxShadow: `0 4px 12px ${entry.fill}40`,
                    }}
                  >
                    <Icon
                      className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: "white" }}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                      {entry.name}
                    </p>
                    <p className="text-xs font-bold sm:text-sm" style={{ color: entry.fill }}>
                      {formatCurrency(entry.value)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold sm:text-base md:text-lg" style={{ color: entry.fill }}>
                      {entry.percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Mini Gráfico de Barra */}
                <div className="px-2 pb-2 sm:px-2.5 sm:pb-2.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${entry.percentage}%`,
                        backgroundColor: entry.fill,
                        boxShadow: `0 0 8px ${entry.fill}60`,
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
