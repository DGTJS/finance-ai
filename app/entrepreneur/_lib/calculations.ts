/**
 * Funções de cálculo para AI Work Planner
 * Todos os cálculos são determinísticos e baseados em dados reais
 */

// WorkPeriod type definition
export interface WorkPeriod {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hours: number;
  amount: number;
  expenses: number;
  netProfit: number;
  description: string | null;
  projectId: string | null;
}

export interface DayStats {
  date: Date;
  totalAmount: number;
  totalHours: number;
  totalExpenses: number;
  netProfit: number;
  periodCount: number;
  averageHourlyRate: number;
}

export interface WeekdayStats {
  weekday: number; // 0=domingo, 1=segunda, ..., 6=sábado
  weekdayName: string;
  totalAmount: number;
  totalHours: number;
  totalExpenses: number;
  netProfit: number;
  periodCount: number;
  averageHourlyRate: number;
  averageNetProfitPerHour: number;
}

export interface GoalAnalysis {
  monthlyGoal: number;
  currentAmount: number;
  remainingAmount: number;
  daysRemaining: number;
  workDaysRemaining: number;
  hoursNeeded: number;
  hoursPerDayNeeded: number;
  currentAverageHourlyRate: number;
  isRealistic: boolean;
  probability: number; // 0 a 100
}

/**
 * Agrupa períodos por dia
 */
export function groupPeriodsByDay(periods: WorkPeriod[]): Map<string, DayStats> {
  const dayMap = new Map<string, DayStats>();

  periods.forEach((period) => {
    const dateKey = new Date(period.date).toISOString().split("T")[0];
    
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: new Date(period.date),
        totalAmount: 0,
        totalHours: 0,
        totalExpenses: 0,
        netProfit: 0,
        periodCount: 0,
        averageHourlyRate: 0,
      });
    }

    const dayStats = dayMap.get(dateKey)!;
    dayStats.totalAmount += Number(period.amount);
    dayStats.totalHours += period.hours;
    dayStats.totalExpenses += Number(period.expenses);
    dayStats.netProfit += Number(period.netProfit);
    dayStats.periodCount += 1;
  });

  // Calcular média por hora para cada dia usando LUCRO LÍQUIDO
  dayMap.forEach((stats) => {
    if (stats.totalHours > 0) {
      // Usar netProfit ao invés de totalAmount para calcular ganho por hora
      stats.averageHourlyRate = stats.netProfit / stats.totalHours;
    }
  });

  return dayMap;
}

/**
 * Analisa estatísticas por dia da semana
 */
export function analyzeWeekdayStats(periods: WorkPeriod[]): WeekdayStats[] {
  const weekdayMap = new Map<number, WeekdayStats>();

  // Inicializar todos os dias da semana
  const weekdayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  for (let i = 0; i < 7; i++) {
    weekdayMap.set(i, {
      weekday: i,
      weekdayName: weekdayNames[i],
      totalAmount: 0,
      totalHours: 0,
      totalExpenses: 0,
      netProfit: 0,
      periodCount: 0,
      averageHourlyRate: 0,
      averageNetProfitPerHour: 0,
    });
  }

  // Agrupar por dia da semana
  periods.forEach((period) => {
    const date = new Date(period.date);
    const weekday = date.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado

    const stats = weekdayMap.get(weekday)!;
    stats.totalAmount += Number(period.amount);
    stats.totalHours += period.hours;
    stats.totalExpenses += Number(period.expenses);
    stats.netProfit += Number(period.netProfit);
    stats.periodCount += 1;
  });

  // Calcular médias usando LUCRO LÍQUIDO
  weekdayMap.forEach((stats) => {
    if (stats.totalHours > 0) {
      // averageHourlyRate agora representa lucro líquido por hora
      stats.averageHourlyRate = stats.netProfit / stats.totalHours;
      stats.averageNetProfitPerHour = stats.netProfit / stats.totalHours;
    }
  });

  return Array.from(weekdayMap.values());
}

/**
 * Calcula análise de meta
 */
export function calculateGoalAnalysis(
  periods: WorkPeriod[],
  goalType: "daily" | "weekly" | "monthly" | "custom",
  goal: number,
  workDays: string, // "1,2,3,4,5,6,7"
  maxHoursDay?: number | null,
  customStartDate?: Date | null,
  customEndDate?: Date | null,
): GoalAnalysis {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Determinar período baseado no tipo de meta
  let firstDay: Date;
  let lastDay: Date;
  
  if (goalType === "custom" && customStartDate && customEndDate) {
    // Meta personalizada: usar as datas fornecidas
    firstDay = new Date(customStartDate);
    firstDay.setHours(0, 0, 0, 0);
    lastDay = new Date(customEndDate);
    lastDay.setHours(23, 59, 59, 999);
  } else {
    // Meta mensal, semanal ou diária: usar mês atual
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    firstDay = new Date(currentYear, currentMonth, 1);
    lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  }

  // Filtrar períodos do período definido
  const currentPeriods = periods.filter((p) => {
    const periodDate = new Date(p.date);
    return (
      periodDate >= firstDay &&
      periodDate <= lastDay
    );
  });

  // Calcular valores atuais usando LUCRO LÍQUIDO (netProfit) ao invés de valor bruto
  const currentNetProfit = currentPeriods.reduce(
    (sum, p) => sum + Number(p.netProfit),
    0,
  );
  const currentHours = currentPeriods.reduce((sum, p) => sum + p.hours, 0);
  const currentExpenses = currentPeriods.reduce(
    (sum, p) => sum + Number(p.expenses),
    0,
  );
  // currentAmount agora é o lucro líquido (para compatibilidade com código existente)
  const currentAmount = currentNetProfit;

  // Calcular meta baseada no tipo
  let targetGoal = goal;
  
  // Se for meta diária ou semanal, converter para mensal para comparação
  if (goalType === "daily") {
    // Assumir ~22 dias úteis no mês
    targetGoal = goal * 22;
  } else if (goalType === "weekly") {
    // Assumir ~4.3 semanas no mês
    targetGoal = goal * 4.3;
  }
  // Para monthly e custom, usar o valor direto

  const remainingAmount = Math.max(0, targetGoal - currentNetProfit);

  // Calcular dias restantes considerando workDays
  const workDaysArray = workDays.split(",").map(Number);
  let workDaysRemaining = 0;
  let daysRemaining = 0;

  // Calcular dias restantes considerando o período
  const periodEnd = goalType === "custom" && customEndDate
    ? new Date(customEndDate)
    : lastDay;
  
  for (let day = new Date(today); day <= periodEnd; day.setDate(day.getDate() + 1)) {
    daysRemaining++;
    const weekday = day.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
    // Converter para formato do workDays (1=domingo, 2=segunda, ..., 7=sábado)
    const workDayNumber = weekday === 0 ? 1 : weekday + 1;
    if (workDaysArray.includes(workDayNumber)) {
      workDaysRemaining++;
    }
  }

  // Calcular horas necessárias usando LUCRO LÍQUIDO por hora
  const currentAverageHourlyRate =
    currentHours > 0 ? currentNetProfit / currentHours : 0;
  const hoursNeeded =
    currentAverageHourlyRate > 0
      ? remainingAmount / currentAverageHourlyRate
      : 0;
  const hoursPerDayNeeded =
    workDaysRemaining > 0 ? hoursNeeded / workDaysRemaining : 0;

  // Verificar se é realista
  const averageHoursPerDay = currentPeriods.length > 0
    ? currentHours / Math.max(1, new Set(currentPeriods.map(p => new Date(p.date).toDateString())).size)
    : 0;

  const isRealistic =
    hoursPerDayNeeded <= (maxHoursDay || 12) &&
    hoursPerDayNeeded <= averageHoursPerDay * 1.5; // 50% acima da média atual

  // Calcular probabilidade (0 a 100)
  let probability = 50; // Base

  if (remainingAmount <= 0) {
    probability = 100; // Meta já batida
  } else if (workDaysRemaining === 0) {
    probability = 0; // Sem dias restantes
  } else {
    // Ajustar probabilidade baseado em vários fatores
    // currentAverageHourlyRate já está usando netProfit
    if (currentAverageHourlyRate > 0) {
      const daysNeededAtCurrentRate = remainingAmount / (currentAverageHourlyRate * (averageHoursPerDay || 1));
      if (daysNeededAtCurrentRate <= workDaysRemaining) {
        probability = Math.min(95, 50 + (workDaysRemaining - daysNeededAtCurrentRate) * 10);
      } else {
        probability = Math.max(5, 50 - (daysNeededAtCurrentRate - workDaysRemaining) * 10);
      }
    }

    // Ajustar baseado em horas por dia necessárias
    if (hoursPerDayNeeded > (maxHoursDay || 12)) {
      probability = Math.max(0, probability - 30);
    }

    // Ajustar baseado em histórico
    if (currentPeriods.length === 0) {
      probability = Math.max(0, probability - 20); // Sem histórico
    }
  }

  return {
    monthlyGoal: targetGoal, // Usar targetGoal calculado para compatibilidade
    currentAmount: currentNetProfit, // Agora currentAmount representa o lucro líquido
    remainingAmount,
    daysRemaining,
    workDaysRemaining,
    hoursNeeded,
    hoursPerDayNeeded,
    currentAverageHourlyRate, // Já calculado com netProfit
    isRealistic,
    probability: Math.max(0, Math.min(100, probability)),
  };
}

/**
 * Identifica melhores e piores dias da semana
 */
export function identifyBestWorstDays(weekdayStats: WeekdayStats[]): {
  bestDays: WeekdayStats[];
  worstDays: WeekdayStats[];
  neutralDays: WeekdayStats[];
} {
  // Filtrar apenas dias com dados
  const daysWithData = weekdayStats.filter((d) => d.periodCount > 0);

  if (daysWithData.length === 0) {
    return {
      bestDays: [],
      worstDays: [],
      neutralDays: [],
    };
  }

  // Ordenar por lucro líquido por hora
  const sorted = [...daysWithData].sort(
    (a, b) => b.averageNetProfitPerHour - a.averageNetProfitPerHour,
  );

  const topCount = Math.ceil(sorted.length / 3);
  const bottomCount = Math.ceil(sorted.length / 3);

  const bestDays = sorted.slice(0, topCount);
  const worstDays = sorted.slice(-bottomCount).reverse();
  const neutralDays = sorted.slice(topCount, -bottomCount);

  return {
    bestDays,
    worstDays,
    neutralDays,
  };
}

