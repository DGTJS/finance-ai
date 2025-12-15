/**
 * Gera insights inteligentes baseados em dados reais
 * Linguagem humana, curta e orientada à ação
 */

import type { WeekdayStats, DayStats } from "./calculations";

export interface AIInsights {
  monthlyGoalInsight?: string;
  todayInsight?: string;
  heatmapInsights?: string[];
  bestDay?: string;
  bestTimeRange?: string;
}

/**
 * Gera insight para meta mensal
 */
export function generateMonthlyGoalInsight(
  currentAmount: number,
  monthlyGoal: number,
  daysRemaining: number,
  hoursPerDayNeeded: number,
  averageHourlyRate: number,
): string {
  if (currentAmount >= monthlyGoal) {
    return "Parabéns! Você já atingiu sua meta mensal. 🎉";
  }

  if (daysRemaining === 0) {
    return "O mês acabou. Considere ajustar sua meta para o próximo mês.";
  }

  if (hoursPerDayNeeded > 12) {
    return `Para bater sua meta, você precisaria trabalhar ${hoursPerDayNeeded.toFixed(
      1,
    )}h por dia, o que é inviável. Considere ajustar sua meta.`;
  }

  if (hoursPerDayNeeded <= 4) {
    return `Mantendo sua média atual de ${averageHourlyRate.toFixed(
      0,
    )}/h, você atinge sua meta em ${daysRemaining} dias trabalhando cerca de ${hoursPerDayNeeded.toFixed(
      1,
    )}h/dia.`;
  }

  return `Você precisa trabalhar ${hoursPerDayNeeded.toFixed(
    1,
  )}h por dia nos próximos ${daysRemaining} dias para bater sua meta.`;
}

/**
 * Gera insight para o dia de hoje
 */
export function generateTodayInsight(
  todayWeekday: string,
  todayAverage: number,
  overallAverage: number,
): string {
  if (todayAverage === 0) {
    return `Você ainda não tem histórico suficiente para ${todayWeekday}s. Comece registrando seus períodos!`;
  }

  const diff = ((todayAverage - overallAverage) / overallAverage) * 100;

  if (diff > 20) {
    return `${todayWeekday}s rendem em média ${Math.abs(diff).toFixed(
      0,
    )}% mais para você. Aproveite!`;
  } else if (diff < -20) {
    return `${todayWeekday}s costumam render ${Math.abs(diff).toFixed(
      0,
    )}% menos. Considere focar em outros dias.`;
  }

  return `${todayWeekday}s têm rendimento próximo da sua média.`;
}

/**
 * Gera insights para o heatmap
 */
export function generateHeatmapInsights(
  weekdayStats: WeekdayStats[],
  dayStats: DayStats[],
): string[] {
  const insights: string[] = [];

  // Melhores dias
  const daysWithData = weekdayStats.filter((s) => s.periodCount > 0);
  if (daysWithData.length > 0) {
    const sorted = [...daysWithData].sort(
      (a, b) => b.averageNetProfitPerHour - a.averageNetProfitPerHour,
    );
    const bestDays = sorted.slice(0, 2);
    if (bestDays.length > 0) {
      const bestNames = bestDays.map((d) => d.weekdayName).join(" e ");
      insights.push(`Você ganha mais nas ${bestNames}s.`);
    }
  }

  // Piores dias
  if (daysWithData.length > 1) {
    const sorted = [...daysWithData].sort(
      (a, b) => a.averageNetProfitPerHour - b.averageNetProfitPerHour,
    );
    const worstDays = sorted.slice(0, 1);
    if (worstDays.length > 0 && worstDays[0].averageNetProfitPerHour < sorted[sorted.length - 1].averageNetProfitPerHour * 0.7) {
      insights.push(`${worstDays[0].weekdayName}s têm baixa performance.`);
    }
  }

  // Padrão de dias trabalhados
  const workedDays = dayStats.filter((d) => d.periodCount > 0).length;
  const totalDays = dayStats.length;
  if (workedDays > 0 && totalDays > 0) {
    const workRate = (workedDays / totalDays) * 100;
    if (workRate < 30) {
      insights.push("Você trabalha poucos dias no mês. Considere aumentar a frequência.");
    } else if (workRate > 80) {
      insights.push("Você mantém uma frequência alta de trabalho. Ótimo!");
    }
  }

  return insights;
}

/**
 * Identifica melhor dia
 */
export function identifyBestDay(weekdayStats: WeekdayStats[]): string | undefined {
  const daysWithData = weekdayStats.filter((s) => s.periodCount > 0);
  if (daysWithData.length === 0) return undefined;

  const best = daysWithData.reduce(
    (best, current) =>
      current.averageNetProfitPerHour > best.averageNetProfitPerHour ? current : best,
    daysWithData[0],
  );

  return `${best.weekdayName}: ${best.averageNetProfitPerHour.toFixed(2)}/h`;
}

/**
 * Identifica melhor faixa de horário (simplificado)
 */
export function identifyBestTimeRange(periods: any[]): string | undefined {
  // Análise simplificada - em produção, você pode fazer análise mais sofisticada
  if (periods.length === 0) return undefined;

  // Agrupar por faixa de horário
  const timeRanges: Record<string, { total: number; hours: number; count: number }> = {};

  periods.forEach((period) => {
    const startHour = new Date(period.startTime).getHours();
    let range = "";
    if (startHour >= 6 && startHour < 12) range = "Manhã (6h-12h)";
    else if (startHour >= 12 && startHour < 18) range = "Tarde (12h-18h)";
    else if (startHour >= 18 && startHour < 24) range = "Noite (18h-24h)";
    else range = "Madrugada (0h-6h)";

    if (!timeRanges[range]) {
      timeRanges[range] = { total: 0, hours: 0, count: 0 };
    }
    timeRanges[range].total += Number(period.netProfit);
    timeRanges[range].hours += period.hours;
    timeRanges[range].count += 1;
  });

  // Encontrar melhor faixa
  let bestRange = "";
  let bestRate = 0;

  Object.entries(timeRanges).forEach(([range, data]) => {
    const rate = data.hours > 0 ? data.total / data.hours : 0;
    if (rate > bestRate) {
      bestRate = rate;
      bestRange = range;
    }
  });

  if (bestRange && bestRate > 0) {
    return `${bestRange}: ${bestRate.toFixed(2)}/h`;
  }

  return undefined;
}

