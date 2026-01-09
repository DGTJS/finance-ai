/**
 * DailyEarningsChart - Gráfico de evolução diária dos ganhos do freelancer
 * Similar ao DailyBalanceChart do dashboard financeiro
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "./utils";
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
  DollarSign,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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
import { getFixedCosts } from "@/app/_actions/fixed-cost";

interface WorkPeriod {
  id: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  netProfit: number;
  amount: number;
  expenses: number;
}

interface DailyEarningsChartProps {
  periods: WorkPeriod[];
}

export function DailyEarningsChart({ periods }: DailyEarningsChartProps) {
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

  const [selectionMode, setSelectionMode] = useState<"month" | "custom">(
    "month",
  );
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [startDate, setStartDate] = useState(
    formatDateForInput(firstDayOfMonth),
  );
  const [endDate, setEndDate] = useState(formatDateForInput(lastDayOfMonth));
  const [fixedCosts, setFixedCosts] = useState<
    Array<{
      id: string;
      name: string;
      amount: number;
      frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
      isFixed: boolean;
      isActive: boolean;
      createdAt?: string | Date;
    }>
  >([]);

  // Frequência de acumulação dos ganhos (também controla o período exibido)
  // Carregar preferência salva do localStorage ou usar "MONTHLY" como padrão
  const [accumulationFrequency, setAccumulationFrequency] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY"
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("freelancer-accumulation-frequency");
        if (saved === "DAILY" || saved === "WEEKLY" || saved === "MONTHLY") {
          return saved;
        }
      } catch (error) {
        // Ignorar erros do localStorage (modo privado, etc)
        console.warn("Não foi possível acessar localStorage:", error);
      }
    }
    return "MONTHLY";
  });

  // Salvar preferência no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "freelancer-accumulation-frequency",
          accumulationFrequency,
        );
      } catch (error) {
        // Ignorar erros do localStorage
        console.warn("Não foi possível salvar no localStorage:", error);
      }
    }
  }, [accumulationFrequency]);

  // Função para buscar e atualizar custos fixos
  const fetchFixedCosts = async () => {
    const result = await getFixedCosts();
    if (result.success && result.data) {
      // Log para debug - verificar o que está vindo do banco
      console.log(
        "[FIXED COSTS FROM DB]:",
        result.data.map((c: any) => ({
          name: c.name,
          isFixed: c.isFixed,
          frequency: c.frequency,
          amount: c.amount,
        })),
      );

      // Mapear os dados para o formato esperado
      const mappedCosts = result.data.map((cost: any) => {
        // Se frequency for "ONCE", tratar como custo único (isFixed = false)
        const isUnique = cost.frequency === "ONCE";
        const isFixedValue = isUnique
          ? false
          : cost.isFixed !== undefined && cost.isFixed !== null
            ? cost.isFixed
            : true;

        return {
          id: cost.id,
          name: cost.name,
          amount: cost.amount || cost.value || 0,
          frequency: cost.frequency || "DAILY",
          isFixed: isFixedValue,
          isActive: cost.isActive !== undefined ? cost.isActive : true,
          createdAt: cost.createdAt,
        };
      });

      console.log(
        "[MAPPED FIXED COSTS]:",
        mappedCosts.map((c: any) => ({
          name: c.name,
          isFixed: c.isFixed,
          frequency: c.frequency,
          amount: c.amount,
        })),
      );

      setFixedCosts(mappedCosts);
    }
  };

  // Buscar custos fixos na montagem do componente
  useEffect(() => {
    fetchFixedCosts();
  }, []);

  // Escutar eventos de atualização de custos fixos
  useEffect(() => {
    const handleFixedCostsUpdate = () => {
      console.log(
        "[DAILY EARNINGS CHART] Evento de atualização recebido, recarregando custos...",
      );
      fetchFixedCosts();
    };

    // Escutar evento customizado
    window.addEventListener("fixedCostsUpdated", handleFixedCostsUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("fixedCostsUpdated", handleFixedCostsUpdate);
    };
  }, []);

  // Calcular datas baseado no modo de seleção e frequência de acumulação
  // Quando a frequência é DAILY ou WEEKLY, o período é controlado automaticamente
  const dateRange = useMemo(() => {
    // Se for modo diário, mostrar apenas o dia atual
    if (accumulationFrequency === "DAILY") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return { start: today, end: endOfToday };
    }

    // Se for modo semanal, mostrar os últimos 7 dias
    if (accumulationFrequency === "WEEKLY") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6 dias atrás + hoje = 7 dias
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return { start: sevenDaysAgo, end: today };
    }

    // Se for modo mensal, usar o modo de seleção normal
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
  }, [
    accumulationFrequency,
    selectionMode,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
  ]);

  // Cache para armazenar custos fixos calculados por semana/mês
  // IMPORTANTE: Deve ser definido DEPOIS de dateRange
  const fixedCostCache = useMemo(() => {
    const cache = new Map<string, number>();

    // Data de referência: início do período do gráfico
    const referenceDate = new Date(dateRange.start);
    referenceDate.setHours(0, 0, 0, 0);

    fixedCosts
      .filter(
        (cost) => cost.isActive && cost.isFixed && cost.frequency !== "ONCE",
      ) // Apenas custos fixos (não únicos) entram no cache
      .forEach((cost) => {
        // Data de criação do custo fixo
        const costStartDate = new Date(cost.createdAt || dateRange.start);
        costStartDate.setHours(0, 0, 0, 0);

        switch (cost.frequency) {
          case "DAILY":
            // Diário: não usar cache, calcula dia a dia
            break;
          case "WEEKLY":
            // Semanal: calcular para cada semana única no período do gráfico
            // Sempre começar do início do período do gráfico
            const periodWeekStart = new Date(referenceDate);
            periodWeekStart.setDate(
              referenceDate.getDate() - referenceDate.getDay(),
            );
            periodWeekStart.setHours(0, 0, 0, 0);

            // Domingo da semana em que o custo fixo foi criado
            const costWeekStart = new Date(costStartDate);
            costWeekStart.setDate(
              costStartDate.getDate() - costStartDate.getDay(),
            );
            costWeekStart.setHours(0, 0, 0, 0);

            // Calcular para todas as semanas no período
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);

            // Iterar por todas as semanas (domingos) no período
            let currentWeekStart = new Date(periodWeekStart);

            while (currentWeekStart <= endDate) {
              // Criar chave única para a semana (ano-mês-dia do domingo)
              // Esta chave será usada por todos os dias da mesma semana
              const weekKey = `${currentWeekStart.getFullYear()}-${currentWeekStart.getMonth()}-${currentWeekStart.getDate()}`;

              // Calcular quantas semanas completas passaram desde a criação do custo fixo
              // Se a semana atual for anterior à criação do custo, weeksDiff será 0 ou negativo
              const weeksDiff =
                Math.floor(
                  (currentWeekStart.getTime() - costWeekStart.getTime()) /
                    (1000 * 60 * 60 * 24 * 7),
                ) + 1; // +1 para incluir a semana atual

              if (weeksDiff > 0 && currentWeekStart >= costWeekStart) {
                // Acumular valores se houver múltiplos custos fixos semanais
                const existing = cache.get(weekKey) || 0;
                const newValue = existing + cost.amount * weeksDiff;
                cache.set(weekKey, newValue);
              }

              // Avançar para o próximo domingo (próxima semana)
              currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
            break;
          case "MONTHLY":
            // Mensal: calcular para cada mês único no período do gráfico
            // Sempre começar do início do período do gráfico
            const periodMonthStart = new Date(
              referenceDate.getFullYear(),
              referenceDate.getMonth(),
              1,
            );
            periodMonthStart.setHours(0, 0, 0, 0);

            // Mês em que o custo fixo foi criado
            const costMonthStart = new Date(
              costStartDate.getFullYear(),
              costStartDate.getMonth(),
              1,
            );
            costMonthStart.setHours(0, 0, 0, 0);

            const endDateMonth = new Date(dateRange.end);
            let currentMonth = new Date(periodMonthStart);

            while (currentMonth <= endDateMonth) {
              const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

              // Calcular quantos meses completos passaram desde a criação do custo fixo
              // Se o mês atual for anterior à criação do custo, monthsDiff será 0 ou negativo
              const monthsDiff =
                (currentMonth.getFullYear() - costMonthStart.getFullYear()) *
                  12 +
                (currentMonth.getMonth() - costMonthStart.getMonth()) +
                1;

              if (monthsDiff > 0 && currentMonth >= costMonthStart) {
                const existing = cache.get(monthKey) || 0;
                cache.set(monthKey, existing + cost.amount * monthsDiff);
              }

              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
            break;
        }
      });

    return cache;
  }, [fixedCosts, dateRange]);

  // Calcular custos únicos acumulados até uma data específica (apenas uma vez por custo)
  // IMPORTANTE: Custos únicos devem aparecer apenas uma vez no total acumulado
  // Eles são adicionados no dia em que foram criados e permanecem constantes nos dias seguintes
  const calculateOneTimeCostsUntilDate = (date: Date): number => {
    let total = 0;
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    fixedCosts
      .filter((cost) => cost.isActive && !cost.isFixed)
      .forEach((cost) => {
        // Verificar se a data atual é maior ou igual à data de criação do custo
        const costStartDate = new Date(cost.createdAt || dateRange.start);
        costStartDate.setHours(0, 0, 0, 0);

        // Custo único: adiciona apenas uma vez se a data atual >= data de criação
        // O valor aparece no dia em que foi criado e permanece constante nos dias seguintes
        // IMPORTANTE: Não acumula dia a dia, apenas aparece uma vez no total
        if (currentDate >= costStartDate) {
          total += cost.amount;
        }
      });

    return total;
  };

  // Função para calcular custo fixo de um dia específico (acumulado ao longo do tempo)
  // IMPORTANTE: Dentro da mesma semana/mês, todos os dias têm o mesmo valor acumulado
  // Deve ser definida DEPOIS de fixedCostCache e dateRange
  // IMPORTANTE: Esta função NÃO inclui custos únicos - eles são tratados separadamente
  const calculateFixedCostForDay = (date: Date): number => {
    let total = 0;

    // Data de referência: início do período do gráfico
    const referenceDate = new Date(dateRange.start);
    referenceDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    // Processar APENAS custos fixos (isFixed = true e frequency !== "ONCE")
    // Custos únicos (frequency = "ONCE" ou isFixed = false) são tratados separadamente e não entram aqui
    const activeFixedCosts = fixedCosts.filter(
      (cost) => cost.isActive && cost.isFixed && cost.frequency !== "ONCE",
    );

    activeFixedCosts.forEach((cost) => {
      // Se for custo fixo (isFixed = true), acumula ao longo do tempo
      // Usar a data de criação do custo fixo como referência, se for mais recente
      const costStartDate = new Date(cost.createdAt || dateRange.start);
      const actualStartDate =
        costStartDate > referenceDate ? costStartDate : referenceDate;
      actualStartDate.setHours(0, 0, 0, 0);

      switch (cost.frequency) {
        case "DAILY":
          // Diário: conta quantos dias passaram desde o início (acumula dia a dia)
          const daysDiff =
            Math.floor(
              (currentDate.getTime() - actualStartDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1; // +1 para incluir o dia atual
          if (daysDiff > 0) {
            const dailyValue = cost.amount * daysDiff;
            total += dailyValue;
          }
          break;
        case "WEEKLY":
          // Semanal: usar cache para garantir que todos os dias da mesma semana tenham o mesmo valor acumulado
          const currentWeekStart = new Date(currentDate);
          currentWeekStart.setDate(
            currentDate.getDate() - currentDate.getDay(),
          ); // Domingo da semana atual
          currentWeekStart.setHours(0, 0, 0, 0);

          // Criar chave única para a semana (ano-mês-dia do domingo)
          // IMPORTANTE: A chave deve ser exatamente igual à usada no cache
          const weekKey = `${currentWeekStart.getFullYear()}-${currentWeekStart.getMonth()}-${currentWeekStart.getDate()}`;
          const cachedWeekly = fixedCostCache.get(weekKey);

          if (cachedWeekly !== undefined && cachedWeekly > 0) {
            // Usar valor do cache - todos os dias da mesma semana terão o mesmo valor acumulado
            // O cache já contém o valor acumulado correto (amount * semanas)
            total += cachedWeekly;
          } else {
            // Se não estiver no cache, calcular diretamente
            // Calcular quantas semanas completas passaram desde a criação do custo
            const costWeekStart = new Date(costStartDate);
            costWeekStart.setDate(
              costStartDate.getDate() - costStartDate.getDay(),
            );
            costWeekStart.setHours(0, 0, 0, 0);

            const weeksDiff =
              Math.floor(
                (currentWeekStart.getTime() - costWeekStart.getTime()) /
                  (1000 * 60 * 60 * 24 * 7),
              ) + 1; // +1 para incluir a semana atual

            const calculatedValue = cost.amount * weeksDiff;

            if (weeksDiff > 0 && currentWeekStart >= costWeekStart) {
              // IMPORTANTE: Usar weeksDiff, não daysDiff - todos os dias da semana têm o mesmo valor acumulado
              total += calculatedValue;
            }
          }
          break;
        case "MONTHLY":
          // Mensal: usar cache para garantir que todos os dias do mesmo mês tenham o mesmo valor
          const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
          const cachedMonthly = fixedCostCache.get(monthKey);

          if (cachedMonthly !== undefined) {
            total += cachedMonthly;
          } else {
            // Fallback: calcular diretamente se não estiver no cache
            const monthsDiff =
              (currentDate.getFullYear() - actualStartDate.getFullYear()) * 12 +
              (currentDate.getMonth() - actualStartDate.getMonth()) +
              1;

            if (monthsDiff > 0) {
              total += cost.amount * monthsDiff;
            }
          }
          break;
      }
    });
    return total;
  };

  // Agrupar períodos por dia e calcular ganhos acumulados
  const chartData = useMemo(() => {
    if (!periods || periods.length === 0) {
      return [];
    }

    // Filtrar períodos no range selecionado
    const filteredPeriods = periods.filter((period) => {
      const periodDate = new Date(period.date);

      if (accumulationFrequency === "DAILY") {
        // Modo diário: verificar se é o mesmo dia
        const periodDateOnly = new Date(
          periodDate.getFullYear(),
          periodDate.getMonth(),
          periodDate.getDate(),
        );
        const startDateOnly = new Date(
          dateRange.start.getFullYear(),
          dateRange.start.getMonth(),
          dateRange.start.getDate(),
        );
        return periodDateOnly.getTime() === startDateOnly.getTime();
      } else {
        // Modo semanal ou mensal: comparar apenas datas
        const periodDateOnly = new Date(
          periodDate.getFullYear(),
          periodDate.getMonth(),
          periodDate.getDate(),
        );
        const startDateOnly = new Date(
          dateRange.start.getFullYear(),
          dateRange.start.getMonth(),
          dateRange.start.getDate(),
        );
        const endDateOnly = new Date(
          dateRange.end.getFullYear(),
          dateRange.end.getMonth(),
          dateRange.end.getDate(),
        );
        return periodDateOnly >= startDateOnly && periodDateOnly <= endDateOnly;
      }
    });

    // Agrupar por dia ou por hora (dependendo do modo)
    const dailyMap = new Map<string, number>();
    const hourlyMap = new Map<string, number>(); // Para modo diário

    filteredPeriods.forEach((period) => {
      try {
        const date = new Date(period.date);
        if (isNaN(date.getTime())) {
          return;
        }

        if (accumulationFrequency === "DAILY" && period.startTime) {
          // Modo diário: agrupar por hora
          const startTime = new Date(period.startTime);
          const hour = startTime.getHours();
          const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${String(hour).padStart(2, "0")}`;
          const current = hourlyMap.get(hourKey) || 0;
          const netProfit =
            typeof period.netProfit === "number" ? period.netProfit : 0;
          hourlyMap.set(hourKey, current + netProfit);
        } else {
          // Modo semanal ou mensal: agrupar por dia
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const current = dailyMap.get(dateKey) || 0;
          const netProfit =
            typeof period.netProfit === "number" ? period.netProfit : 0;
          dailyMap.set(dateKey, current + netProfit);
        }
      } catch (error) {
        // Ignorar erros ao processar período
      }
    });

    // Criar array de todos os dias/horas no range
    const days: { date: Date; earnings: number }[] = [];

    if (accumulationFrequency === "DAILY") {
      // Modo diário: criar array com as 24 horas do dia
      const today = new Date(dateRange.start);
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = new Date(today);
        hourDate.setHours(hour, 0, 0, 0);
        const hourKey = `${hourDate.getFullYear()}-${String(hourDate.getMonth() + 1).padStart(2, "0")}-${String(hourDate.getDate()).padStart(2, "0")}-${String(hour).padStart(2, "0")}`;
        days.push({
          date: hourDate,
          earnings: hourlyMap.get(hourKey) || 0,
        });
      }
    } else {
      // Modo semanal ou mensal: criar array com todos os dias
      const current = new Date(dateRange.start);
      current.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      while (current <= endDate) {
        const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        days.push({
          date: new Date(current),
          earnings: dailyMap.get(dateKey) || 0,
        });
        current.setDate(current.getDate() + 1);
      }
    }

    // Calcular custos únicos por dia - cada custo único deve ser deduzido no dia em que foi criado
    // Criar um mapa de custos únicos por data
    const oneTimeCostsByDate = new Map<string, number>();

    const oneTimeCostsList = fixedCosts.filter(
      (cost) => cost.isActive && (cost.frequency === "ONCE" || !cost.isFixed),
    );

    console.log(
      "[DAILY EARNINGS CHART] Custos únicos encontrados:",
      oneTimeCostsList.map((c) => ({
        name: c.name,
        amount: c.amount,
        createdAt: c.createdAt,
        frequency: c.frequency,
        isFixed: c.isFixed,
      })),
    );

    oneTimeCostsList.forEach((cost) => {
      const costStartDate = new Date(cost.createdAt || dateRange.start);
      costStartDate.setHours(0, 0, 0, 0);

      // Se o custo foi criado dentro do período do gráfico, adicionar ao dia correspondente
      if (costStartDate >= dateRange.start && costStartDate <= dateRange.end) {
        const dateKey = `${costStartDate.getFullYear()}-${String(costStartDate.getMonth() + 1).padStart(2, "0")}-${String(costStartDate.getDate()).padStart(2, "0")}`;
        const currentAmount = oneTimeCostsByDate.get(dateKey) || 0;
        oneTimeCostsByDate.set(dateKey, currentAmount + cost.amount);
        console.log(
          `[DAILY EARNINGS CHART] Custo único "${cost.name}" (R$ ${cost.amount}) adicionado ao dia ${dateKey}`,
        );
      }
      // Se o custo foi criado antes do período, adicionar ao primeiro dia do período
      else if (costStartDate < dateRange.start) {
        const firstDayKey = `${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, "0")}-${String(dateRange.start.getDate()).padStart(2, "0")}`;
        const currentAmount = oneTimeCostsByDate.get(firstDayKey) || 0;
        oneTimeCostsByDate.set(firstDayKey, currentAmount + cost.amount);
        console.log(
          `[DAILY EARNINGS CHART] Custo único "${cost.name}" (R$ ${cost.amount}) criado antes do período, adicionado ao primeiro dia ${firstDayKey}`,
        );
      }
    });

    console.log(
      "[DAILY EARNINGS CHART] Mapa de custos únicos por data:",
      Array.from(oneTimeCostsByDate.entries()),
    );

    // Calcular saldo acumulado baseado na frequência escolhida
    // IMPORTANTE: O saldo = ganhos acumulados - custos fixos acumulados - custos únicos (no dia específico)
    // Isso mostra quanto o cliente tem ou está devendo
    let cumulative = 0;
    let previousPeriodKey = "";
    let periodCumulative = 0; // Acumulado dentro do período atual
    let previousFixedCost = 0; // Custo fixo do período anterior (apenas custos fixos recorrentes)

    return days.map((day) => {
      const date = day.date;
      // Calcular apenas custos fixos recorrentes acumulados para este dia
      // Custos únicos NÃO entram aqui - são tratados separadamente
      const recurringFixedCostForDay = calculateFixedCostForDay(date);

      // Calcular custos únicos para este dia específico ANTES de calcular o acumulado
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const oneTimeCostsForDay = oneTimeCostsByDate.get(dateKey) || 0;

      // Log para debug quando há custos únicos no dia
      if (oneTimeCostsForDay > 0) {
        console.log(
          `[DAILY EARNINGS CHART] Dia ${dateKey}: Custo único de R$ ${oneTimeCostsForDay} será deduzido`,
        );
      }

      // Determinar a chave do período baseado na frequência de acumulação
      let currentPeriodKey = "";
      switch (accumulationFrequency) {
        case "DAILY":
          // Modo diário: acumular por hora, mas custos fixos são aplicados apenas uma vez no início do dia
          cumulative += day.earnings;

          // No modo diário, aplicar custos fixos apenas na primeira hora (00:00)
          if (date.getHours() === 0) {
            // Aplicar custos fixos do dia inteiro apenas na primeira hora
            const fixedCostDifference =
              recurringFixedCostForDay - previousFixedCost;
            cumulative -= fixedCostDifference;
            previousFixedCost = recurringFixedCostForDay;

            // Deduzir custos únicos do dia específico apenas na primeira hora
            if (oneTimeCostsForDay > 0) {
              console.log(
                `[DAILY EARNINGS CHART] DAILY: Deduzindo R$ ${oneTimeCostsForDay} do acumulado. Antes: ${cumulative}, depois: ${cumulative - oneTimeCostsForDay}`,
              );
              cumulative -= oneTimeCostsForDay;
            }
          }
          break;
        case "WEEKLY":
          // Acumular por semana (domingo a sábado)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          weekStart.setHours(0, 0, 0, 0);
          currentPeriodKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;

          // Se mudou de semana, resetar o acumulado do período
          if (currentPeriodKey !== previousPeriodKey) {
            periodCumulative = 0;
            previousFixedCost = 0;
            previousPeriodKey = currentPeriodKey;
          }

          // Acumular ganhos dentro da semana
          periodCumulative += day.earnings;

          // Deduzir apenas a diferença dos custos fixos recorrentes desde o início da semana
          const fixedCostDifferenceWeekly =
            recurringFixedCostForDay - previousFixedCost;
          periodCumulative -= fixedCostDifferenceWeekly;
          previousFixedCost = recurringFixedCostForDay;

          // Deduzir custos únicos do dia específico
          if (oneTimeCostsForDay > 0) {
            console.log(
              `[DAILY EARNINGS CHART] WEEKLY: Deduzindo R$ ${oneTimeCostsForDay} do acumulado do período. Antes: ${periodCumulative}, depois: ${periodCumulative - oneTimeCostsForDay}`,
            );
          }
          periodCumulative -= oneTimeCostsForDay;

          cumulative = periodCumulative;
          break;
        case "MONTHLY":
          // Acumular por mês
          currentPeriodKey = `${date.getFullYear()}-${date.getMonth()}`;

          // Se mudou de mês, resetar o acumulado do período
          if (currentPeriodKey !== previousPeriodKey) {
            periodCumulative = 0;
            previousFixedCost = 0;
            previousPeriodKey = currentPeriodKey;
          }

          // Acumular ganhos dentro do mês
          periodCumulative += day.earnings;

          // Deduzir apenas a diferença dos custos fixos recorrentes desde o início do mês
          const fixedCostDifferenceMonthly =
            recurringFixedCostForDay - previousFixedCost;
          periodCumulative -= fixedCostDifferenceMonthly;
          previousFixedCost = recurringFixedCostForDay;

          // Deduzir custos únicos do dia específico
          if (oneTimeCostsForDay > 0) {
            console.log(
              `[DAILY EARNINGS CHART] MONTHLY: Deduzindo R$ ${oneTimeCostsForDay} do acumulado do período. Antes: ${periodCumulative}, depois: ${periodCumulative - oneTimeCostsForDay}`,
            );
          }
          periodCumulative -= oneTimeCostsForDay;

          cumulative = periodCumulative;
          break;
      }

      // Ganho líquido do dia (ganhos - diferença dos custos fixos)
      const netEarnings = day.earnings;

      // Calcular custo total para exibição no tooltip (incluindo custos únicos do dia)
      const totalCostForDay = recurringFixedCostForDay + oneTimeCostsForDay;

      // Formatar data/hora para exibição
      let formattedDate: string;
      let fullDate: string;

      if (accumulationFrequency === "DAILY") {
        // Modo diário: mostrar hora
        formattedDate = `${date.getHours().toString().padStart(2, "0")}:00`;
        fullDate = `${date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })} às ${date.getHours().toString().padStart(2, "0")}:00`;
      } else {
        // Modo semanal ou mensal: mostrar data
        formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });
        fullDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      }

      const result = {
        date:
          accumulationFrequency === "DAILY" ? date.getHours() : date.getDate(), // Hora do dia ou dia do mês
        earnings: day.earnings, // Ganho bruto do dia/hora
        fixedCost: totalCostForDay, // Custo total acumulado do dia (recorrentes + únicos) para exibição no tooltip
        netEarnings, // Ganho bruto do dia/hora
        cumulative, // Saldo acumulado (ganhos - custos fixos recorrentes - custos únicos uma vez) - mostra quanto tem ou está devendo
        periodKey: currentPeriodKey, // Chave do período para agrupamento
        formattedDate,
        fullDate,
      };

      return result;
    });
  }, [periods, dateRange, fixedCosts, accumulationFrequency]);

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
        maxEarnings: 0,
        minEarnings: 0,
        totalEarnings: 0,
        totalFixedCosts: 0,
      };
    }

    const inicio = chartData[0]?.cumulative || 0;
    const atual = chartData[chartData.length - 1]?.cumulative || 0;
    const variacao = atual - inicio;
    const totalEarnings = chartData.reduce((sum, d) => sum + d.earnings, 0);
    const totalFixedCosts = chartData.reduce(
      (sum, d) => sum + (d.fixedCost || 0),
      0,
    );

    // Calcular variação percentual
    let variacaoPercentual = 0;
    if (Math.abs(inicio) > 0.01) {
      variacaoPercentual = (variacao / Math.abs(inicio)) * 100;
    } else if (Math.abs(atual) > 0.01) {
      variacaoPercentual = atual > 0 ? 100 : -100;
    }

    const earnings = chartData.map((d) => d.cumulative);
    const maxEarnings = Math.max(...earnings);
    const minEarnings = Math.min(...earnings);

    const hasVariation = Math.abs(variacaoPercentual) > 0.01;

    return {
      inicio,
      atual,
      variacao,
      variacaoPercentual,
      isPositive: variacao > 0,
      hasVariation,
      maxEarnings,
      minEarnings,
      totalEarnings,
      totalFixedCosts,
    };
  }, [chartData]);

  // Determinar cor do gráfico baseado no saldo
  // Se o saldo atual está negativo, usar vermelho; caso contrário, verde
  const hasNegativeBalance = stats.atual < 0;
  const lineColor = hasNegativeBalance ? "#ef4444" : "#10b981"; // red-500 ou green-500
  const gradientId = "earningsGradient";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card rounded-lg border p-3 shadow-lg backdrop-blur-sm">
          <p className="text-muted-foreground mb-1 text-xs">{data.fullDate}</p>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-muted-foreground text-xs">Ganho bruto:</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(data.earnings)}
              </p>
            </div>
            {data.fixedCost > 0 && (
              <div className="flex items-baseline gap-2">
                <p className="text-muted-foreground text-xs">Custos fixos:</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(data.fixedCost)}
                </p>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <p className="text-muted-foreground text-xs">Ganho líquido:</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(data.netEarnings)}
              </p>
            </div>
            <div className="flex items-baseline gap-2 border-t pt-1">
              <p className="text-muted-foreground text-xs">Saldo:</p>
              <p
                className={`text-lg font-bold ${
                  data.cumulative < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {formatCurrency(data.cumulative)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex h-full w-full flex-col border shadow-sm">
      <CardHeader className="shrink-0 border-b p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="mb-1 flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 sm:h-8 sm:w-8 dark:bg-green-900/30">
                  <DollarSign className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4 dark:text-green-400" />
                </div>
                <span>Evolução dos Ganhos</span>
              </CardTitle>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Acompanhe a evolução dos seus ganhos ao longo do tempo
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

          {/* Estatísticas rápidas */}
          {chartData.length > 0 && (
            <div className="bg-muted/50 grid grid-cols-3 gap-2 rounded-lg p-2">
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs">
                  Total do Período
                </p>
                <p className="text-sm font-bold sm:text-base">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs">
                  Início
                </p>
                <p className="text-sm font-bold sm:text-base">
                  {formatCurrency(stats.inicio)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs">
                  Atual
                </p>
                <p className="text-sm font-bold sm:text-base">
                  {formatCurrency(stats.atual)}
                </p>
              </div>
            </div>
          )}

          {/* Seletor de frequência de acumulação do lucro */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-xs">
                Acumular lucro por:
              </Label>
              <Select
                value={accumulationFrequency}
                onValueChange={(value: "DAILY" | "WEEKLY" | "MONTHLY") =>
                  setAccumulationFrequency(value)
                }
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Diário</SelectItem>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seletor de período - apenas mostrar quando for modo mensal */}
          {accumulationFrequency === "MONTHLY" && (
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
                        { length: 5 },
                        (_, i) => now.getFullYear() - i,
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
          )}

          {/* Mostrar período atual quando for diário ou semanal */}
          {accumulationFrequency === "DAILY" && (
            <div className="text-muted-foreground text-xs">
              Mostrando:{" "}
              {dateRange.start.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              - 24 horas
            </div>
          )}
          {accumulationFrequency === "WEEKLY" && (
            <div className="text-muted-foreground text-xs">
              Mostrando:{" "}
              {dateRange.start.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              até{" "}
              {dateRange.end.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              - 7 últimos dias
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-full flex-1 flex-col p-3 sm:p-4 md:p-6">
        {chartData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Nenhum dado disponível para o período selecionado
            </div>
          </div>
        ) : (
          <>
            {/* Gráfico */}
            <div className="relative mb-4 h-[500px] w-full overflow-hidden sm:h-[400px] md:h-[450px] lg:h-[500px]">
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
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
                    tick={{
                      fontSize: 11,
                      fill: "currentColor",
                      opacity: 0.7,
                    }}
                    tickFormatter={(value) => {
                      if (accumulationFrequency === "DAILY") {
                        return `${value.toString().padStart(2, "0")}h`;
                      }
                      return `Dia ${value}`;
                    }}
                    stroke="currentColor"
                    className="opacity-50"
                    height={40}
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
                    width={70}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <ReferenceLine
                    y={0}
                    stroke="currentColor"
                    className="opacity-30"
                    strokeDasharray="2 2"
                  />

                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={lineColor}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={{ r: 3, fill: lineColor }}
                    activeDot={{ r: 5, fill: lineColor }}
                  />
                  {/* Linha de referência para mostrar quando os custos fixos ultrapassam os ganhos */}
                  <ReferenceLine
                    y={0}
                    stroke="currentColor"
                    strokeDasharray="2 2"
                    className="opacity-30"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
