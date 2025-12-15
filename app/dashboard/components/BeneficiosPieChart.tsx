/**
 * BeneficiosPieChart - Gráfico de pizza exclusivo para benefícios
 *
 * Usa o mesmo design do ExpensesPieChart (donut chart com legenda)
 *
 * Mostra apenas:
 * - Benefícios usados
 * - Benefícios disponíveis
 *
 * Foco principal: valor disponível
 * NÃO mistura com salário ou despesas comuns
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/app/_lib/utils";
import type { FamilyBenefitsBalance } from "@/src/types/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Gift, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface BeneficiosPieChartProps {
  benefitsBalance: FamilyBenefitsBalance;
}

const COLORS = {
  available: "#10b981", // green-500
  used: "#ef4444", // red-500
};

export function BeneficiosPieChart({
  benefitsBalance,
}: BeneficiosPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = [
    {
      name: "Disponível",
      value: Math.max(0, benefitsBalance.available),
      color: COLORS.available,
      icon: CheckCircle2,
    },
    {
      name: "Usado",
      value: Math.max(0, benefitsBalance.used),
      color: COLORS.used,
      icon: XCircle,
    },
  ].filter((item) => item.value > 0); // Remover itens com valor zero

  const total = benefitsBalance.total;

  if (total === 0 || chartData.length === 0) {
    return (
      <Card className="border-2 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 to-transparent p-3 pb-2 sm:p-4 sm:pb-3 md:p-6">
          <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base md:text-lg lg:text-xl">
            <Gift className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            <span className="leading-tight">
              Benefícios (Usado vs Disponível)
            </span>
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-[10px] leading-tight sm:text-xs md:text-sm">
            Distribuição dos seus benefícios
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[300px] items-center justify-center sm:h-[350px]">
            Nenhum benefício disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartDataWithPercentage = chartData.map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: { name: string; percentage: number };
    }>;
  }) => {
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
      <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 to-transparent p-3 pb-2 sm:p-4 sm:pb-3 md:p-6">
        <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base md:text-lg lg:text-xl">
          <Gift className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          <span className="leading-tight">
            Benefícios (Usado vs Disponível)
          </span>
        </CardTitle>
        <p className="text-muted-foreground mt-1 text-[10px] leading-tight sm:text-xs md:text-sm">
          Distribuição dos seus benefícios
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
                      {chartDataWithPercentage.map((entry, index) => (
                        <filter
                          key={`shadow-${index}`}
                          id={`benefit-shadow-${index}`}
                          height="200%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="4"
                            floodColor={entry.color}
                            floodOpacity="0.3"
                          />
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={chartDataWithPercentage}
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
                      }: {
                        cx?: number;
                        cy?: number;
                        midAngle?: number;
                        innerRadius?: number;
                        outerRadius?: number;
                        percentage?: number;
                      }) => {
                        if (
                          !cx ||
                          !cy ||
                          !midAngle ||
                          !innerRadius ||
                          !outerRadius ||
                          !percentage
                        ) {
                          return null;
                        }

                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

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
                      {chartDataWithPercentage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer transition-all duration-300"
                          style={{
                            filter: `url(#benefit-shadow-${index})`,
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
                  Benefícios totais
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
          {chartDataWithPercentage
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => {
              const Icon = entry.icon;
              const isActive = activeIndex === index;

              return (
                <div
                  key={`legend-${index}`}
                  className="group bg-card cursor-pointer overflow-hidden rounded-lg border-2 p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md sm:p-3.5 md:p-4"
                  style={{
                    borderColor: isActive ? entry.color : "transparent",
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
                        backgroundColor: entry.color,
                        boxShadow: `0 2px 8px ${entry.color}40`,
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
                      style={{ color: entry.color }}
                    >
                      {formatCurrency(entry.value)}
                    </p>
                    <p
                      className="text-base font-bold sm:text-lg md:text-xl"
                      style={{ color: entry.color }}
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
                          backgroundColor: entry.color,
                          boxShadow: `0 0 4px ${entry.color}60`,
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
