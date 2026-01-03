"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface MonthlyData {
  month: string;
  monthNumber: number;
  year: number;
  revenues: number;
  costs: number;
  profit: number;
  stockValue: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum dado disponível ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  // Para barras empilhadas, os valores devem ser sempre positivos
  // A ordem importa: primeiro lucro (base), depois custo (meio), depois estoque (topo)
  const chartData = data.map((item) => {
    const lucro = Math.max(0, item.profit);
    const custo = Math.abs(item.costs);
    const estoque = Math.max(0, item.stockValue);

    // Debug: log para verificar valores recebidos
    if (typeof window !== "undefined") {
      console.log(`[MONTHLY CHART] ${item.month}:`, {
        raw: {
          revenues: item.revenues,
          costs: item.costs,
          profit: item.profit,
          stockValue: item.stockValue,
        },
        processed: { lucro, custo, estoque },
      });
    }

    return {
      month: item.month.substring(0, 3), // Primeiras 3 letras do mês
      fullMonth: item.month,
      lucro, // Lucro (verde) - base da torre
      custo, // Custo (vermelho) - meio da torre
      estoque, // Estoque (cinza) - topo da torre
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Mensal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -10, bottom: -5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
                  }
                  return `R$ ${value}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    lucro: "Lucro",
                    custo: "Custo",
                    estoque: "Valor em Estoque",
                  };
                  return [formatCurrency(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    lucro: "Lucro",
                    custo: "Custo",
                    estoque: "Valor em Estoque",
                  };
                  return labels[value] || value;
                }}
              />
              <Bar
                dataKey="lucro"
                stackId="stack"
                fill="#22c55e"
                radius={[0, 0, 0, 0]}
                name="Lucro"
              />
              <Bar
                dataKey="custo"
                stackId="stack"
                fill="#ef4444"
                radius={[0, 0, 0, 0]}
                name="Custo"
              />
              <Bar
                dataKey="estoque"
                stackId="stack"
                fill="#6b7280"
                radius={[12, 12, 0, 0]}
                name="Valor em Estoque"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
