/**
 * Camada de IA para gerar insights e planos de trabalho
 * Recebe dados estatísticos e retorna texto + plano em linguagem humana
 */

import { generateInsights } from "@/app/_lib/ai";
import type { GoalAnalysis, WeekdayStats } from "./calculations";

export interface AIPlan {
  summary: string;
  plan: {
    hoursPerDay: number;
    daysPerWeek: number;
    focusDays: string[];
    avoidDays?: string[];
  };
  insights: string[];
  probability: number;
  alert: "positive" | "neutral" | "critical";
}

/**
 * Gera plano e insights usando IA
 */
export async function generateWorkPlan(
  goalAnalysis: GoalAnalysis,
  weekdayStats: WeekdayStats[],
  currentMonthStats: {
    totalHours: number;
    totalAmount: number;
    totalExpenses: number;
    totalNetProfit: number;
    periodCount: number;
    averageHourlyRate: number;
  },
  bestDays: WeekdayStats[],
  worstDays: WeekdayStats[],
): Promise<AIPlan> {
  // Preparar contexto para a IA
  const context = buildContext(
    goalAnalysis,
    weekdayStats,
    currentMonthStats,
    bestDays,
    worstDays,
  );

  // Por enquanto, sempre usar o plano determinístico
  // Em produção, você pode descomentar para usar IA real
  try {
    // const aiResponse = await generateWorkPlanWithAI(context);
    // return aiResponse;
    throw new Error("Usando fallback determinístico");
  } catch (error) {
    // Fallback para plano determinístico (sempre usado por enquanto)
    return generateDeterministicPlan(
      goalAnalysis,
      weekdayStats,
      bestDays,
      worstDays,
    );
  }
}

/**
 * Constrói contexto para a IA
 */
function buildContext(
  goalAnalysis: GoalAnalysis,
  weekdayStats: WeekdayStats[],
  currentMonthStats: any,
  bestDays: WeekdayStats[],
  worstDays: WeekdayStats[],
): string {
  const bestDaysNames = bestDays.map((d) => d.weekdayName).join(", ");
  const worstDaysNames = worstDays.map((d) => d.weekdayName).join(", ");

  return `
CONTEXTO FINANCEIRO DO FREELANCER:

Meta Mensal: R$ ${goalAnalysis.monthlyGoal.toFixed(2)}
Ganho Atual: R$ ${goalAnalysis.currentAmount.toFixed(2)}
Falta: R$ ${goalAnalysis.remainingAmount.toFixed(2)}

Dias Restantes: ${goalAnalysis.workDaysRemaining} dias úteis
Horas Necessárias: ${goalAnalysis.hoursNeeded.toFixed(1)}h
Horas por Dia Necessárias: ${goalAnalysis.hoursPerDayNeeded.toFixed(1)}h/dia

Média Atual por Hora: R$ ${goalAnalysis.currentAverageHourlyRate.toFixed(2)}/h

ESTATÍSTICAS DO MÊS:
- Total de horas: ${currentMonthStats.totalHours.toFixed(1)}h
- Total ganho: R$ ${currentMonthStats.totalAmount.toFixed(2)}
- Lucro líquido: R$ ${currentMonthStats.totalNetProfit.toFixed(2)}
- Períodos registrados: ${currentMonthStats.periodCount}

MELHORES DIAS DA SEMANA (por lucro/hora):
${bestDaysNames}

PIORES DIAS DA SEMANA (por lucro/hora):
${worstDaysNames}

ESTATÍSTICAS POR DIA DA SEMANA:
${weekdayStats
  .filter((d) => d.periodCount > 0)
  .map(
    (d) =>
      `${d.weekdayName}: R$ ${d.averageNetProfitPerHour.toFixed(2)}/h (${d.periodCount} períodos)`,
  )
  .join("\n")}
`;
}

/**
 * Gera plano usando IA
 */
async function generateWorkPlanWithAI(context: string): Promise<AIPlan> {
  const prompt = `
Você é um assistente financeiro especializado em ajudar freelancers a bater metas de ganho.

Analise os dados abaixo e gere um plano de trabalho realista e prático.

${context}

INSTRUÇÕES:
1. Seja direto e honesto - não prometa coisas irreais
2. Use linguagem humana e clara
3. Baseie-se apenas nos dados fornecidos
4. Se a meta for inviável, diga claramente
5. Dê recomendações práticas e acionáveis

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo em 1-2 frases",
  "plan": {
    "hoursPerDay": número,
    "daysPerWeek": número,
    "focusDays": ["Dias da semana para focar"],
    "avoidDays": ["Dias para evitar (opcional)"]
  },
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ],
  "probability": número de 0 a 100,
  "alert": "positive" | "neutral" | "critical"
}

Gere APENAS o JSON, sem markdown, sem explicações adicionais.
`;

  // Por enquanto, sempre usar fallback determinístico
  // Em produção, você pode integrar com a API de IA existente
  // ou criar uma rota específica para work planner
  throw new Error("Usando fallback determinístico");
}

/**
 * Valida e corrige plano da IA
 */
function validateAndFixPlan(plan: any): AIPlan {
  return {
    summary:
      plan.summary ||
      "Analise seus dados para gerar um plano personalizado.",
    plan: {
      hoursPerDay: Math.max(0, Math.min(16, plan.plan?.hoursPerDay || 0)),
      daysPerWeek: Math.max(0, Math.min(7, plan.plan?.daysPerWeek || 0)),
      focusDays: Array.isArray(plan.plan?.focusDays)
        ? plan.plan.focusDays
        : [],
      avoidDays: Array.isArray(plan.plan?.avoidDays)
        ? plan.plan.avoidDays
        : undefined,
    },
    insights: Array.isArray(plan.insights) ? plan.insights : [],
    probability: Math.max(0, Math.min(100, plan.probability || 50)),
    alert:
      plan.alert === "positive" ||
      plan.alert === "neutral" ||
      plan.alert === "critical"
        ? plan.alert
        : "neutral",
  };
}

/**
 * Gera plano determinístico (fallback)
 */
function generateDeterministicPlan(
  goalAnalysis: GoalAnalysis,
  weekdayStats: WeekdayStats[],
  bestDays: WeekdayStats[],
  worstDays: WeekdayStats[],
): AIPlan {
  const { remainingAmount, workDaysRemaining, hoursPerDayNeeded, probability } =
    goalAnalysis;

  let summary = "";
  let alert: "positive" | "neutral" | "critical" = "neutral";

  if (remainingAmount <= 0) {
    summary = "Parabéns! Você já bateu sua meta mensal. 🎉";
    alert = "positive";
  } else if (workDaysRemaining === 0) {
    summary =
      "Não há mais dias úteis restantes. Sua meta não será alcançada este mês.";
    alert = "critical";
  } else if (hoursPerDayNeeded > 12) {
    summary = `Para bater a meta, você precisaria trabalhar ${hoursPerDayNeeded.toFixed(
      1,
    )}h por dia, o que é inviável. Considere ajustar sua meta.`;
    alert = "critical";
  } else if (hoursPerDayNeeded <= 4) {
    summary = `Se você trabalhar ${hoursPerDayNeeded.toFixed(
      1,
    )}h por dia nos próximos ${workDaysRemaining} dias, bate sua meta antes do fim do mês.`;
    alert = "positive";
  } else {
    summary = `Você precisa trabalhar ${hoursPerDayNeeded.toFixed(
      1,
    )}h por dia nos próximos ${workDaysRemaining} dias para bater a meta.`;
    alert = probability > 60 ? "positive" : probability < 40 ? "critical" : "neutral";
  }

  const insights: string[] = [];

  if (bestDays.length > 0) {
    const bestDay = bestDays[0];
    if (worstDays.length > 0) {
      const worstDay = worstDays[0];
      const diff =
        ((bestDay.averageNetProfitPerHour - worstDay.averageNetProfitPerHour) /
          worstDay.averageNetProfitPerHour) *
        100;
      if (diff > 20) {
        insights.push(
          `${bestDay.weekdayName}s rendem ${diff.toFixed(0)}% mais que ${worstDay.weekdayName}s para você.`,
        );
      }
    }
  }

  if (goalAnalysis.currentAverageHourlyRate > 0) {
    insights.push(
      `Sua média atual é R$ ${goalAnalysis.currentAverageHourlyRate.toFixed(
        2,
      )}/hora.`,
    );
  }

  if (workDaysRemaining > 0 && hoursPerDayNeeded > 0) {
    insights.push(
      `Faltam ${workDaysRemaining} dias úteis. Você precisa trabalhar ${hoursPerDayNeeded.toFixed(
        1,
      )}h por dia em média.`,
    );
  }

  if (bestDays.length > 0) {
    insights.push(
      `Foque em trabalhar nas ${bestDays.map((d) => d.weekdayName).join("s, ")}s para maximizar seus ganhos.`,
    );
  }

  return {
    summary,
    plan: {
      hoursPerDay: Math.max(0, hoursPerDayNeeded),
      daysPerWeek: Math.ceil(workDaysRemaining / 4), // Aproximação
      focusDays: bestDays.map((d) => d.weekdayName),
      avoidDays: worstDays.length > 0 ? worstDays.map((d) => d.weekdayName) : undefined,
    },
    insights,
    probability,
    alert,
  };
}

