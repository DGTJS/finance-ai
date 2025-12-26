/**
 * BeneficiosPieChart - Gráfico compacto e moderno para benefícios
 * Design minimalista e eficiente
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
  ].filter((item) => item.value > 0);

  const total = benefitsBalance.total;

  if (total === 0 || chartData.length === 0) {
    return (
      <Card className="flex h-full flex-col border shadow-sm">
        <CardHeader className="flex-shrink-0 border-b p-3 pb-2.5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Benefícios</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-3">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum benefício disponível
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Configure seus benefícios no perfil financeiro
            </p>
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

  const availablePercentage =
    chartDataWithPercentage.find((item) => item.name === "Disponível")
      ?.percentage || 0;

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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span>Benefícios</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-3">
        {/* Layout: vertical no mobile, horizontal no desktop */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-3">
          {/* Gráfico compacto */}
          <div className="mx-auto h-24 w-24 flex-shrink-0 md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataWithPercentage}
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
                  {chartDataWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
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

          {/* Informações principais */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 md:gap-3">
            {/* Valor total */}
            <div>
              <p className="text-muted-foreground mb-0.5 text-[10px]">Total</p>
              <p className="text-base font-bold">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            {/* Status disponível */}
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS.available }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[10px]">Disponível</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(benefitsBalance.available)}
                </p>
              </div>
              <p className="text-xs font-bold text-green-600 dark:text-green-400">
                {availablePercentage.toFixed(0)}%
              </p>
            </div>

            {/* Status usado */}
            {benefitsBalance.used > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS.used }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px]">Usado</p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(benefitsBalance.used)}
                  </p>
                </div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  {(100 - availablePercentage).toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
