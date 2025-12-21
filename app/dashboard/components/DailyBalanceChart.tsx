/**
 * DailyBalanceChart - Gráfico moderno de evolução diária do saldo
 * Design aprimorado com gradientes, áreas preenchidas e visual moderno
 * Inclui seletor de mês/ano
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { DailyBalance } from "@/src/types/dashboard";
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";

interface DailyBalanceChartProps {
  dailyBalance: DailyBalance[];
}

export function DailyBalanceChart({
  dailyBalance,
}: DailyBalanceChartProps) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Formatar datas para input type="date" (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectionMode, setSelectionMode] = useState<"month" | "custom">("month");
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [startDate, setStartDate] = useState(formatDateForInput(firstDayOfMonth));
  const [endDate, setEndDate] = useState(formatDateForInput(lastDayOfMonth));

  // Calcular datas baseado no modo de seleção
  const dateRange = useMemo(() => {
    if (selectionMode === "month") {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
      return { start, end };
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }, [selectionMode, selectedYear, selectedMonth, startDate, endDate]);

  // Formatar dados para o gráfico
  const chartData = useMemo(() => {
    return dailyBalance
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      })
      .map((item) => {
        const date = new Date(item.date);
        return {
          date: date.getDate(), // Dia do mês
          balance: item.balance,
          formattedDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
      };
    });
  }, [dailyBalance, dateRange]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        inicio: 0,
        atual: 0,
        variacao: 0,
        variacaoPercentual: 0,
        isPositive: true,
        hasVariation: false,
        maxBalance: 0,
        minBalance: 0,
      };
    }

    const inicio = chartData[0]?.balance || 0;
    const atual = chartData[chartData.length - 1]?.balance || 0;
    const variacao = atual - inicio;
    
    // Calcular variação percentual
    let variacaoPercentual = 0;
    if (Math.abs(inicio) > 0.01) {
      variacaoPercentual = (variacao / Math.abs(inicio)) * 100;
    } else if (Math.abs(atual) > 0.01) {
      // Se início é ~0 e atual não é, considerar como variação significativa
      variacaoPercentual = atual > 0 ? 100 : -100;
    }
    
    const balances = chartData.map((d) => d.balance);
    const maxBalance = Math.max(...balances);
    const minBalance = Math.min(...balances);
    
    const hasVariation = Math.abs(variacaoPercentual) > 0.01;

    return {
      inicio,
      atual,
      variacao,
      variacaoPercentual,
      isPositive: variacao > 0,
      hasVariation,
      maxBalance,
      minBalance,
    };
  }, [chartData]);

  // Determinar cor baseada no saldo
  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? "#10b981" : "#ef4444"; // green-500 : red-500
  };


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.balance >= 0;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg backdrop-blur-sm">
          <p className="text-xs text-muted-foreground mb-1">{data.fullDate}</p>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-lg font-bold ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(data.balance)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const lineColor = getBalanceColor(stats.atual);
  const gradientId = "balanceGradient";

  return (
    <Card className="flex flex-col border shadow-sm lg:h-full">
      <CardHeader className="border-b flex-shrink-0 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg mb-1">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Saldo Diário</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Acompanhe a evolução do seu saldo ao longo do tempo
              </p>
            </div>
            {/* Badge de variação */}
            {stats.hasVariation && (
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 ${
                  stats.isPositive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {stats.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
                <span className="text-[10px] sm:text-xs font-semibold">
                  {stats.variacaoPercentual > 0 ? "+" : ""}
                  {stats.variacaoPercentual.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          {/* Seletor de período */}
          <div className="flex items-center gap-3 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            
            {/* Toggle entre modo mês e personalizado */}
            <div className="flex items-center gap-2 border rounded-md p-0.5">
              <Button
                variant={selectionMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("month")}
                className="h-7 px-2 text-xs"
              >
                Mês/Ano
              </Button>
              <Button
                variant={selectionMode === "custom" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("custom")}
                className="h-7 px-2 text-xs"
              >
                Personalizado
              </Button>
            </div>

            {selectionMode === "month" ? (
              /* Modo Mês/Ano */
              <div className="flex items-center gap-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 1, label: "Janeiro" },
                      { value: 2, label: "Fevereiro" },
                      { value: 3, label: "Março" },
                      { value: 4, label: "Abril" },
                      { value: 5, label: "Maio" },
                      { value: 6, label: "Junho" },
                      { value: 7, label: "Julho" },
                      { value: 8, label: "Agosto" },
                      { value: 9, label: "Setembro" },
                      { value: 10, label: "Outubro" },
                      { value: 11, label: "Novembro" },
                      { value: 12, label: "Dezembro" },
                    ].map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Modo Personalizado */
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="start-date" className="text-[10px] text-muted-foreground">
                    De
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 w-[140px] text-xs"
                    max={endDate}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="end-date" className="text-[10px] text-muted-foreground">
                    Até
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 w-[140px] text-xs"
                    min={startDate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-3 sm:p-4 md:p-6 min-h-0">
        {chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-sm text-center">
              Nenhum dado disponível para o período selecionado
            </div>
          </div>
        ) : (
          <>
            {/* Gráfico */}
            <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:flex-1 xl:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={lineColor}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={lineColor}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="opacity-20"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
                    tickFormatter={(value) => `Dia ${value}`}
                    stroke="currentColor"
                    className="opacity-50"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
                    tickFormatter={(value) => {
                      if (Math.abs(value) >= 1000) {
                        return `R$ ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
                      }
                      return `R$ ${value}`;
                    }}
                    stroke="currentColor"
                    className="opacity-50"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={0}
                    stroke="currentColor"
                    strokeDasharray="2 2"
                    className="opacity-30"
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke={lineColor}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    dot={{ fill: lineColor, r: 3, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{
                      r: 5,
                      fill: lineColor,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Estatísticas */}
            <div className="mt-4 flex-shrink-0 grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  Início
                </p>
                <p className="text-sm sm:text-base font-bold">
                  {formatCurrency(stats.inicio)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  Atual
                </p>
                <p
                  className={`text-sm sm:text-base font-bold ${
                    stats.atual >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(stats.atual)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  Variação
                </p>
                <div className="flex items-center justify-center gap-1">
                  {stats.isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                  <p
                    className={`text-sm sm:text-base font-bold ${
                      stats.isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(stats.variacao)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
