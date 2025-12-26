/**
 * DailyBalanceChart - Gráfico moderno de evolução diária do saldo
 * Design aprimorado com gradientes, áreas preenchidas e visual moderno
 * Inclui seletor de mês/ano
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { DailyBalance, Transaction } from "@/src/types/dashboard";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
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
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import type { UpcomingPayment, ScheduledPayment } from "@/src/types/dashboard";

interface DailyBalanceChartProps {
  dailyBalance: DailyBalance[];
  upcomingPayments?: UpcomingPayment[];
  scheduledPayments?: ScheduledPayment[];
  transactions?: Transaction[];
  familySalaryBalance?: {
    total: number;
    byUser: Array<{
      userId: string;
      name: string;
      amount: number;
      payments?: Array<{
        label: string;
        day: number;
        value: number;
      }>;
    }>;
  };
}

export function DailyBalanceChart({
  dailyBalance,
  upcomingPayments = [],
  scheduledPayments = [],
  transactions = [],
  familySalaryBalance,
}: DailyBalanceChartProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Injetar estilos para garantir que o Recharts seja contido
  useEffect(() => {
    const styleId = "daily-balance-chart-container-fix";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .daily-balance-chart-wrapper .recharts-wrapper {
          position: relative !important;
        }
        .daily-balance-chart-wrapper .recharts-surface {
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Formatar datas para input type="date" (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectionMode, setSelectionMode] = useState<"month" | "custom">(
    "month",
  );
  const [selectedYear, setSelectedYear] = useState(
    Math.max(2025, now.getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [startDate, setStartDate] = useState(
    formatDateForInput(firstDayOfMonth),
  );
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

  // Calcular salários esperados por dia baseado em familySalaryBalance
  const expectedSalariesByDay = useMemo(() => {
    const salariesMap = new Map<string, number>();

    if (familySalaryBalance?.byUser) {
      familySalaryBalance.byUser.forEach((user) => {
        // Sempre processar payments, mesmo que seja array vazio
        const payments = user.payments || [];

        if (Array.isArray(payments) && payments.length > 0) {
          payments.forEach((payment) => {
            // Criar data para o dia de pagamento no mês atual e futuros (até 6 meses)
            const now = new Date();
            for (let monthOffset = 0; monthOffset <= 6; monthOffset++) {
              const targetMonth = new Date(
                now.getFullYear(),
                now.getMonth() + monthOffset,
                1,
              );
              const daysInMonth = new Date(
                targetMonth.getFullYear(),
                targetMonth.getMonth() + 1,
                0,
              ).getDate();

              // Ajustar dia se exceder o último dia do mês
              const paymentDay = Math.min(payment.day, daysInMonth);
              const paymentDate = new Date(
                targetMonth.getFullYear(),
                targetMonth.getMonth(),
                paymentDay,
              );
              const dateStr = paymentDate.toISOString().split("T")[0];

              const current = salariesMap.get(dateStr) || 0;
              salariesMap.set(dateStr, current + payment.value);
            }
          });
        }
      });
    }

    return salariesMap;
  }, [familySalaryBalance]);

  // Adicionar salários aos dados históricos também
  const dailyBalanceWithSalaries = useMemo(() => {
    const now = new Date();

    // Criar mapa com saldos históricos de todos os meses no range
    const historicalBalanceMap = new Map<string, number>();
    dailyBalance.forEach((item) => {
      historicalBalanceMap.set(item.date, item.balance);
    });

    // Criar mapa final que inclui todos os dias no range selecionado
    const balanceMap = new Map<string, number>();

    // Encontrar o último saldo histórico conhecido (último dia com dados da API)
    let lastKnownBalance = 0;
    const sortedHistoricalDates = Array.from(
      historicalBalanceMap.keys(),
    ).sort();
    if (sortedHistoricalDates.length > 0) {
      const lastDate = sortedHistoricalDates[sortedHistoricalDates.length - 1];
      lastKnownBalance = historicalBalanceMap.get(lastDate) || 0;
    }

    // Processar cada mês que pode estar no range (mês atual e próximos 6 meses)
    let accumulatedBalance = lastKnownBalance; // Começar com o último saldo conhecido

    for (let monthOffset = 0; monthOffset <= 6; monthOffset++) {
      const targetMonth = new Date(
        now.getFullYear(),
        now.getMonth() + monthOffset,
        1,
      );
      const daysInMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      ).getDate();

      const firstDayOfMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        1,
      );
      const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

      // Para o mês atual, usar o saldo histórico se disponível
      // Para meses futuros, usar o saldo acumulado do mês anterior
      let runningBalance = accumulatedBalance;

      // Se há saldo histórico no primeiro dia deste mês, usar ele (mês atual)
      if (historicalBalanceMap.has(firstDayStr)) {
        runningBalance = historicalBalanceMap.get(firstDayStr) || 0;
      }

      // Processar cada dia do mês
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth(),
          day,
        );
        const dateStr = currentDate.toISOString().split("T")[0];
        const isFuture = currentDate > now;

        // Verificar se há saldo histórico para este dia (mês atual, dias passados)
        const historicalBalance = historicalBalanceMap.get(dateStr);
        const expectedSalary = expectedSalariesByDay.get(dateStr) || 0;

        // Para dias históricos (mês atual, já passados), usar o saldo da API
        if (historicalBalance !== undefined) {
          runningBalance = historicalBalance;
        } else if (isFuture) {
          // Para dias futuros, adicionar salário esperado se houver
          // Verificar se o salário já foi recebido (transações)
          const hasReceivedSalary = transactions.some((t) => {
            const txDate = new Date(t.date || t.createdAt);
            return (
              txDate.toISOString().split("T")[0] === dateStr &&
              t.type === "DEPOSIT" &&
              Math.abs(Number(t.amount) - expectedSalary) < 0.01
            );
          });

          // Adicionar salário apenas se não foi recebido ainda
          if (expectedSalary > 0 && !hasReceivedSalary) {
            runningBalance += expectedSalary;
          }

          // Subtrair despesas agendadas para este dia (upcomingPayments e scheduledPayments)
          const dayExpenses = [
            ...(upcomingPayments || []),
            ...(scheduledPayments || []),
          ]
            .filter((payment) => {
              const paymentDate = new Date(payment.dueDate);
              return paymentDate.toISOString().split("T")[0] === dateStr;
            })
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

          runningBalance -= dayExpenses;
        }

        // Atualizar o saldo acumulado para o próximo dia
        balanceMap.set(dateStr, runningBalance);
      }

      // Atualizar o saldo acumulado para o próximo mês
      // Usar o último dia do mês atual como base para o próximo mês
      const lastDayOfMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      );
      const lastDayStr = lastDayOfMonth.toISOString().split("T")[0];
      const lastDayBalance = balanceMap.get(lastDayStr);
      if (lastDayBalance !== undefined) {
        accumulatedBalance = lastDayBalance;
      }
    }

    return Array.from(balanceMap.entries())
      .map(([date, balance]) => ({ date, balance }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [
    dailyBalance,
    expectedSalariesByDay,
    transactions,
    upcomingPayments,
    scheduledPayments,
  ]);

  // Calcular projeção futura baseada em assinaturas, transações agendadas e salários
  const futureProjection = useMemo(() => {
    const projection: DailyBalance[] = [];
    const now = new Date();
    const lastBalance =
      dailyBalanceWithSalaries.length > 0
        ? dailyBalanceWithSalaries[dailyBalanceWithSalaries.length - 1].balance
        : 0;

    // Calcular até 3 meses no futuro
    for (let monthOffset = 1; monthOffset <= 3; monthOffset++) {
      const futureMonth = new Date(
        now.getFullYear(),
        now.getMonth() + monthOffset,
        1,
      );
      const daysInMonth = new Date(
        futureMonth.getFullYear(),
        futureMonth.getMonth() + 1,
        0,
      ).getDate();

      // Para cada mês futuro, começar com o último saldo do mês anterior
      let runningBalance =
        monthOffset === 1
          ? lastBalance
          : projection.length > 0
            ? projection[projection.length - 1].balance
            : lastBalance;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(
          futureMonth.getFullYear(),
          futureMonth.getMonth(),
          day,
        );
        const dateStr = currentDate.toISOString().split("T")[0];

        // Calcular receitas do dia (salários esperados)
        let dayIncome = 0;
        const expectedSalary = expectedSalariesByDay.get(dateStr) || 0;
        if (expectedSalary > 0) {
          dayIncome += expectedSalary;
        }

        // Calcular despesas do dia (assinaturas e transações agendadas)
        let dayExpenses = 0;

        // Assinaturas que vencem neste dia
        upcomingPayments.forEach((payment) => {
          const paymentDate = new Date(payment.dueDate);
          if (
            paymentDate.getFullYear() === currentDate.getFullYear() &&
            paymentDate.getMonth() === currentDate.getMonth() &&
            paymentDate.getDate() === currentDate.getDate()
          ) {
            dayExpenses += payment.value;
          }
        });

        scheduledPayments.forEach((payment) => {
          const paymentDate = new Date(payment.dueDate);
          if (
            paymentDate.getFullYear() === currentDate.getFullYear() &&
            paymentDate.getMonth() === currentDate.getMonth() &&
            paymentDate.getDate() === currentDate.getDate()
          ) {
            dayExpenses += payment.value;
          }
        });

        runningBalance += dayIncome - dayExpenses;

        projection.push({
          date: dateStr,
          balance: runningBalance,
        });
      }
    }

    return projection;
  }, [
    dailyBalanceWithSalaries,
    upcomingPayments,
    scheduledPayments,
    expectedSalariesByDay,
  ]);

  // Formatar dados para o gráfico (incluindo projeção futura)
  const chartData = useMemo(() => {
    const now = new Date();
    const rangeStart = dateRange.start;
    const rangeEnd = dateRange.end;

    // Filtrar dados históricos com salários no range
    const historical = dailyBalanceWithSalaries
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= rangeStart && itemDate <= rangeEnd;
      })
      .map((item) => {
        const date = new Date(item.date);
        const isFuture = date > now;
        return {
          date: date.getDate(), // Dia do mês
          balance: isFuture ? null : item.balance,
          projectedBalance: isFuture ? item.balance : null,
          formattedDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          dateStr: item.date,
          isProjected: isFuture,
        };
      });

    // Adicionar projeção futura se o período selecionado incluir meses futuros
    const future = futureProjection
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= rangeStart && itemDate <= rangeEnd;
      })
      .map((item) => {
        const date = new Date(item.date);
        return {
          date: date.getDate(),
          balance: null,
          projectedBalance: item.balance,
          formattedDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          dateStr: item.date,
          isProjected: true,
        };
      });

    // Combinar dados históricos e futuros, preenchendo gaps
    const combined: any[] = [];
    const allDates = new Set<string>();

    historical.forEach((item) => {
      allDates.add(item.dateStr);
      combined.push(item);
    });

    future.forEach((item) => {
      if (!allDates.has(item.dateStr)) {
        allDates.add(item.dateStr);
        combined.push(item);
      } else {
        // Se já existe, atualizar com dados da projeção se necessário
        const existingIndex = combined.findIndex(
          (d) => d.dateStr === item.dateStr,
        );
        if (existingIndex >= 0) {
          const existing = combined[existingIndex];
          // Se o histórico não tem projectedBalance mas a projeção tem, usar a projeção
          if (!existing.projectedBalance && item.projectedBalance) {
            combined[existingIndex] = {
              ...existing,
              projectedBalance: item.projectedBalance,
            };
          }
        }
      }
    });

    // Ordenar por data
    combined.sort((a, b) => {
      const dateA = new Date(a.dateStr).getTime();
      const dateB = new Date(b.dateStr).getTime();
      return dateA - dateB;
    });

    return combined;
  }, [dailyBalanceWithSalaries, futureProjection, dateRange]);

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
    useEffect(() => {
      // Limpar timeout anterior se existir
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Atualizar data hovered quando o tooltip aparece
        setHoveredDate(data.dateStr);
      } else {
        // Quando o tooltip desaparece, limpar a data após um delay
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredDate(null);
        }, 100);
      }

      // Cleanup
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      };
    }, [active, payload]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const balance = data.balance ?? data.projectedBalance ?? 0;
      const isPositive = balance >= 0;

      return (
        <div className="bg-card rounded-lg border p-3 shadow-lg backdrop-blur-sm">
          <p className="text-muted-foreground mb-1 text-xs">
            {data.fullDate}
            {data.isProjected && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Projeção
              </span>
            )}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-lg font-bold ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(balance)}
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
    <Card className="flex w-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="mb-1 flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 sm:h-8 sm:w-8 dark:bg-blue-900/30">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400" />
                </div>
                <span>Saldo Diário</span>
              </CardTitle>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Acompanhe a evolução do seu saldo ao longo do tempo
              </p>
            </div>
            {/* Badge de variação */}
            {stats.hasVariation && (
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 ${
                  stats.isPositive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {stats.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
                <span className="text-[10px] font-semibold sm:text-xs">
                  {stats.variacaoPercentual > 0 ? "+" : ""}
                  {stats.variacaoPercentual.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Seletor de período */}
          <div className="flex flex-wrap items-center gap-3">
            <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />

            {/* Toggle entre modo mês e personalizado */}
            <div className="flex items-center gap-2 rounded-md border p-0.5">
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
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
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
                    {Array.from(
                      { length: 10 },
                      (_, i) => Math.max(2025, now.getFullYear()) + i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Modo Personalizado */
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="start-date"
                    className="text-muted-foreground text-[10px]"
                  >
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
                  <Label
                    htmlFor="end-date"
                    className="text-muted-foreground text-[10px]"
                  >
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
      <CardContent className="flex flex-col p-3 sm:p-4 md:p-6">
        {chartData.length === 0 ? (
          <div className="flex min-h-[250px] flex-1 items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Nenhum dado disponível para o período selecionado
            </div>
          </div>
        ) : (
          <>
            {/* Gráfico */}
            <div
              className="daily-balance-chart-wrapper bg-card relative w-full"
              style={{
                height: "250px",
                minHeight: "250px",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "hsl(var(--card))",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "250px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 30, right: 10, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.7,
                      }}
                      tickFormatter={(value) => `Dia ${value}`}
                      stroke="currentColor"
                      className="opacity-50"
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.7,
                      }}
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

                    {/* Linhas de referência para dias de pagamento de salário */}
                    {Array.from(expectedSalariesByDay.entries()).map(
                      ([dateStr, salary]) => {
                        const salaryDate = new Date(dateStr);
                        const dayOfMonth = salaryDate.getDate();
                        // Verificar se a data está no range selecionado
                        if (
                          salaryDate >= dateRange.start &&
                          salaryDate <= dateRange.end
                        ) {
                          return (
                            <ReferenceLine
                              key={dateStr}
                              x={dayOfMonth}
                              stroke="#10b981"
                              strokeWidth={2}
                              strokeDasharray="3 3"
                              className="opacity-60"
                              label={{
                                value: `💰 ${formatCurrency(salary)}`,
                                position: "top",
                                fill: "#10b981",
                                fontSize: 10,
                                fontWeight: "bold",
                                offset: 15,
                              }}
                            />
                          );
                        }
                        return null;
                      },
                    )}

                    {/* Área histórica (linha sólida) */}
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke={lineColor}
                      strokeWidth={2.5}
                      fill={`url(#${gradientId})`}
                      dot={{
                        fill: lineColor,
                        r: 4,
                        strokeWidth: 2,
                        stroke: "#fff",
                        cursor: "pointer",
                      }}
                      activeDot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={7}
                              fill={lineColor}
                              stroke="#fff"
                              strokeWidth={3}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (payload && payload.dateStr) {
                                  setSelectedDate(payload.dateStr);
                                  setIsDetailsOpen(true);
                                }
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (payload && payload.dateStr) {
                                  setSelectedDate(payload.dateStr);
                                  setIsDetailsOpen(true);
                                }
                              }}
                            />
                          </g>
                        );
                      }}
                    />
                    {/* Área projetada (linha tracejada) */}
                    <Area
                      type="monotone"
                      dataKey="projectedBalance"
                      stroke={lineColor}
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      fill="transparent"
                      dot={{
                        fill: lineColor,
                        r: 4,
                        strokeWidth: 2,
                        stroke: "#fff",
                        opacity: 0.6,
                        cursor: "pointer",
                      }}
                      activeDot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={7}
                              fill={lineColor}
                              stroke="#fff"
                              strokeWidth={3}
                              style={{ cursor: "pointer", opacity: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (payload && payload.dateStr) {
                                  setSelectedDate(payload.dateStr);
                                  setIsDetailsOpen(true);
                                }
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                if (payload && payload.dateStr) {
                                  setSelectedDate(payload.dateStr);
                                  setIsDetailsOpen(true);
                                }
                              }}
                            />
                          </g>
                        );
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Botão de ver detalhes */}
            {hoveredDate && (
              <div className="mt-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSelectedDate(hoveredDate);
                    setIsDetailsOpen(true);
                  }}
                >
                  <Eye className="mr-1.5 h-3 w-3" />
                  Ver detalhes do dia
                </Button>
              </div>
            )}

            {/* Estatísticas */}
            <div className="mt-4 grid flex-shrink-0 grid-cols-3 gap-3 border-t pt-4 sm:gap-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">
                  Início
                </p>
                <p className="text-sm font-bold sm:text-base">
                  {formatCurrency(stats.inicio)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">
                  Atual
                </p>
                <p
                  className={`text-sm font-bold sm:text-base ${
                    stats.atual >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(stats.atual)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">
                  Variação
                </p>
                <div className="flex items-center justify-center gap-1">
                  {stats.isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                  <p
                    className={`text-sm font-bold sm:text-base ${
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

      {/* Dialog de detalhes do dia */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do dia{" "}
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </DialogTitle>
            <DialogDescription>
              Transações e pagamentos agendados para este dia
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4">
              {/* Saldo do dia */}
              {(() => {
                const dayData = chartData.find(
                  (d) => d.dateStr === selectedDate,
                );
                if (dayData) {
                  const balance =
                    dayData.balance ?? dayData.projectedBalance ?? 0;
                  const isPositive = balance >= 0;

                  return (
                    <div className="bg-muted/30 rounded-lg border-2 p-4">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Saldo do Dia
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p
                          className={`text-2xl font-bold ${
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(balance)}
                        </p>
                        {dayData.isProjected && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Projeção
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {/* Salários esperados para este dia */}
              {(() => {
                const expectedSalary =
                  expectedSalariesByDay.get(selectedDate) || 0;

                // Verificar se o salário já foi recebido nas transações
                const receivedSalary = transactions
                  .filter((t) => {
                    const txDate = (t.date || t.createdAt)?.split("T")[0];
                    return (
                      txDate === selectedDate &&
                      t.type === "DEPOSIT" &&
                      Math.abs(Number(t.amount) - expectedSalary) < 0.01
                    );
                  })
                  .reduce((sum, t) => sum + Number(t.amount), 0);

                if (expectedSalary > 0) {
                  const hasReceived = receivedSalary >= expectedSalary;
                  const remainingSalary = expectedSalary - receivedSalary;

                  return (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Salários Esperados
                      </h4>
                      <div className="flex items-center justify-between rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Salário Total Esperado
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {hasReceived
                              ? "✓ Já recebido"
                              : remainingSalary > 0
                                ? `Pendente: ${formatCurrency(remainingSalary)}`
                                : "A receber"}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{formatCurrency(expectedSalary)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Transações do dia */}
              {(() => {
                const dayTransactions = transactions.filter((t) => {
                  const txDate = (t.date || t.createdAt)?.split("T")[0];
                  return txDate === selectedDate;
                });

                if (dayTransactions.length > 0) {
                  return (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Transações do Dia
                      </h4>
                      {dayTransactions.map((transaction) => {
                        const isIncome = transaction.type === "DEPOSIT";
                        const isExpense = transaction.type === "EXPENSE";
                        const isInvestment = transaction.type === "INVESTMENT";

                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {transaction.name}
                              </p>
                              {transaction.category && (
                                <p className="text-muted-foreground text-xs">
                                  {TRANSACTION_CATEGORY_LABELS[
                                    transaction.category as keyof typeof TRANSACTION_CATEGORY_LABELS
                                  ] || transaction.category}
                                </p>
                              )}
                            </div>
                            <p
                              className={`font-semibold ${
                                isIncome
                                  ? "text-green-600 dark:text-green-400"
                                  : isInvestment
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isIncome ? "+" : isInvestment ? "" : "-"}
                              {formatCurrency(transaction.value)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Pagamentos agendados para este dia */}
              {(() => {
                const dayPayments = [
                  ...upcomingPayments.filter(
                    (p) => p.dueDate.split("T")[0] === selectedDate,
                  ),
                  ...scheduledPayments.filter(
                    (p) => p.dueDate.split("T")[0] === selectedDate,
                  ),
                ];

                const dayTransactions = transactions.filter((t) => {
                  const txDate = (t.date || t.createdAt)?.split("T")[0];
                  return txDate === selectedDate;
                });

                const expectedSalary =
                  expectedSalariesByDay.get(selectedDate) || 0;

                // Se não houver transações, pagamentos nem salários esperados no dia, mostrar transações da última semana
                if (
                  dayPayments.length === 0 &&
                  dayTransactions.length === 0 &&
                  expectedSalary === 0
                ) {
                  const selectedDateObj = new Date(selectedDate);
                  const oneWeekAgo = new Date(selectedDateObj);
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                  const recentTransactions = transactions
                    .filter((t) => {
                      const txDate = t.date || t.createdAt;
                      if (!txDate) return false;
                      const txDateObj = new Date(txDate);
                      return (
                        txDateObj >= oneWeekAgo && txDateObj <= selectedDateObj
                      );
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.date || a.createdAt).getTime();
                      const dateB = new Date(b.date || b.createdAt).getTime();
                      return dateB - dateA; // Mais recentes primeiro
                    })
                    .slice(0, 10); // Limitar a 10 transações

                  if (recentTransactions.length > 0) {
                    return (
                      <div className="space-y-2">
                        <div className="mb-2">
                          <p className="text-muted-foreground text-xs">
                            Nenhuma transação ou pagamento agendado para este
                            dia
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs font-medium">
                            Mostrando transações da última semana:
                          </p>
                        </div>
                        {recentTransactions.map((transaction) => {
                          const isIncome = transaction.type === "DEPOSIT";
                          const isExpense = transaction.type === "EXPENSE";
                          const isInvestment =
                            transaction.type === "INVESTMENT";
                          const txDate =
                            transaction.date || transaction.createdAt;

                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {transaction.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  {transaction.category && (
                                    <p className="text-muted-foreground text-xs">
                                      {TRANSACTION_CATEGORY_LABELS[
                                        transaction.category as keyof typeof TRANSACTION_CATEGORY_LABELS
                                      ] || transaction.category}
                                    </p>
                                  )}
                                  <span className="text-muted-foreground text-xs">
                                    •
                                  </span>
                                  <p className="text-muted-foreground text-xs">
                                    {txDate
                                      ? new Date(txDate).toLocaleDateString(
                                          "pt-BR",
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                          },
                                        )
                                      : ""}
                                  </p>
                                </div>
                              </div>
                              <p
                                className={`font-semibold ${
                                  isIncome
                                    ? "text-green-600 dark:text-green-400"
                                    : isInvestment
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isIncome ? "+" : isInvestment ? "" : "-"}
                                {formatCurrency(transaction.value)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div className="text-muted-foreground rounded-lg border p-4 text-center text-sm">
                      Nenhuma transação ou pagamento agendado para este dia
                    </div>
                  );
                }

                if (dayPayments.length > 0) {
                  return (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Pagamentos Agendados
                      </h4>
                      {dayPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {payment.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {payment.dueDate
                                ? new Date(payment.dueDate).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            -{formatCurrency(payment.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
