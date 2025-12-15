"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/button";
import { Plus, Target } from "lucide-react";
import WorkPeriodForm from "./work-period-form";
import ProjectForm from "./project-form";
import WorkGoalForm from "./work-goal-form";
import MonthlyGoalHero from "./monthly-goal-hero";
import TodayIntelligenceCard from "./today-intelligence-card";
import SmartHeatmap from "./smart-heatmap";
import HourlyValueCard from "./hourly-value-card";
import VisualTimeline from "./visual-timeline";
import { getWorkPeriods, getWorkPeriodStats } from "@/app/_actions/work-period";
import { getProjects } from "@/app/_actions/project";
import { getWorkGoal } from "@/app/_actions/work-goal";
import {
  groupPeriodsByDay,
  analyzeWeekdayStats,
  calculateGoalAnalysis,
  identifyBestWorstDays,
  type DayStats,
  type WeekdayStats,
  type GoalAnalysis,
} from "../_lib/calculations";
import {
  generateMonthlyGoalInsight,
  generateTodayInsight,
  generateHeatmapInsights,
  identifyBestDay,
  identifyBestTimeRange,
} from "../_lib/ai-insights";

interface WorkPeriod {
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
  project: {
    id: string;
    clientName: string;
    projectName: string | null;
  } | null;
}

interface Project {
  id: string;
  clientName: string;
  projectName: string | null;
  hourlyRate: number | null;
  status: string;
}

interface Stats {
  totalHours: number;
  totalAmount: number;
  totalExpenses: number;
  totalNetProfit: number;
  periodCount: number;
  averageHourlyRate: number;
}

interface EntrepreneurClientProps {
  initialPeriods: WorkPeriod[];
  initialStats: Stats;
  todayStats: Stats;
  initialProjects: Project[];
}

export default function EntrepreneurClient({
  initialPeriods,
  initialStats,
  todayStats,
  initialProjects,
}: EntrepreneurClientProps) {
  const router = useRouter();
  const [periods, setPeriods] = useState<WorkPeriod[]>(initialPeriods);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [todayStatsState, setTodayStats] = useState<Stats>(todayStats);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<WorkPeriod | null>(null);

  // States para análises
  const [goal, setGoal] = useState<any>(null);
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [weekdayStats, setWeekdayStats] = useState<WeekdayStats[]>([]);
  const [goalAnalysis, setGoalAnalysis] = useState<GoalAnalysis | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayWeekday = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][
    now.getDay()
  ];

  // Carregar meta
  useEffect(() => {
    loadGoal();
  }, []);

  // Calcular análises
  useEffect(() => {
    if (periods.length > 0) {
      calculateAll();
    }
  }, [periods, goal]);

  const loadGoal = async () => {
    try {
      const goalResult = await getWorkGoal();
      if (goalResult.success && goalResult.data) {
        setGoal(goalResult.data);
      }
    } catch (error) {
      console.error("Erro ao carregar meta:", error);
    }
  };

  const calculateAll = () => {
    // Agrupar por dia
    const dayMap = groupPeriodsByDay(periods);
    const dayStatsArray = Array.from(dayMap.values());
    setDayStats(dayStatsArray);

    // Analisar por dia da semana
    const weekdayStatsArray = analyzeWeekdayStats(periods);
    setWeekdayStats(weekdayStatsArray);

    // Calcular análise de meta
    if (goal) {
      const goalType = (goal.goalType || "monthly") as "daily" | "weekly" | "monthly" | "custom";
      let goalValue = 0;
      
      if (goalType === "daily" && goal.dailyGoal) goalValue = goal.dailyGoal;
      else if (goalType === "weekly" && goal.weeklyGoal) goalValue = goal.weeklyGoal;
      else if (goalType === "monthly" && goal.monthlyGoal) goalValue = goal.monthlyGoal;
      else if (goalType === "custom" && goal.customGoal) goalValue = goal.customGoal;
      else if (goal.monthlyGoal) goalValue = goal.monthlyGoal; // Fallback

      if (goalValue > 0) {
        const analysis = calculateGoalAnalysis(
          periods,
          goalType,
          goalValue,
          goal.workDays,
          goal.maxHoursDay,
          goal.customStartDate ? new Date(goal.customStartDate) : null,
          goal.customEndDate ? new Date(goal.customEndDate) : null,
        );
        setGoalAnalysis(analysis);
      }
    }
  };

  const handleSuccess = async () => {
    router.refresh();
    setIsFormOpen(false);
    setSelectedPeriod(null);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [periodsResult, statsResult, todayStatsResult, projectsResult] = await Promise.all([
      getWorkPeriods(startOfMonth, endOfMonth),
      getWorkPeriodStats(startOfMonth, endOfMonth),
      getWorkPeriodStats(startOfToday, endOfToday),
      getProjects(),
    ]);

    if (periodsResult.success) {
      setPeriods(periodsResult.data || []);
    }
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    if (todayStatsResult.success) {
      setTodayStats(todayStatsResult.data);
    }
    if (projectsResult.success) {
      setProjects(projectsResult.data || []);
    }
  };

  const handleProjectSuccess = async () => {
    router.refresh();
    setIsProjectFormOpen(false);
    const projectsResult = await getProjects();
    if (projectsResult.success) {
      setProjects(projectsResult.data || []);
    }
  };

  const handleEdit = (period: WorkPeriod) => {
    setSelectedPeriod(period);
    setIsFormOpen(true);
  };

  // Calcular insights
  const getGoalValue = () => {
    if (!goal) return 0;
    const goalType = (goal.goalType || "monthly") as "daily" | "weekly" | "monthly" | "custom";
    if (goalType === "daily" && goal.dailyGoal) return goal.dailyGoal;
    if (goalType === "weekly" && goal.weeklyGoal) return goal.weeklyGoal;
    if (goalType === "monthly" && goal.monthlyGoal) return goal.monthlyGoal;
    if (goalType === "custom" && goal.customGoal) return goal.customGoal;
    return goal.monthlyGoal || 0;
  };

  const goalValue = getGoalValue();
  const goalType = goal ? ((goal.goalType || "monthly") as "daily" | "weekly" | "monthly" | "custom") : "monthly";

  const monthlyGoalInsight = goal && goalAnalysis && goalValue > 0
    ? generateMonthlyGoalInsight(
        goalAnalysis.currentAmount,
        goalValue,
        goalAnalysis.workDaysRemaining,
        goalAnalysis.hoursPerDayNeeded,
        goalAnalysis.currentAverageHourlyRate,
      )
    : undefined;

  // Calcular dados para Today Intelligence
  const todayWeekdayStats = weekdayStats.find(
    (s) => s.weekdayName === todayWeekday,
  );
  const todayAverage = todayWeekdayStats
    ? {
        amount: todayWeekdayStats.netProfit, // Usar lucro líquido ao invés de totalAmount
        hours: todayWeekdayStats.totalHours,
        hourlyRate: todayWeekdayStats.averageNetProfitPerHour,
      }
    : { amount: 0, hours: 0, hourlyRate: 0 };

  const overallAverage = {
    hourlyRate: stats.totalHours > 0 ? stats.totalNetProfit / stats.totalHours : 0,
  };

  // Determinar status do dia
  const getTodayStatus = (): "good" | "neutral" | "bad" => {
    if (todayAverage.hours === 0) return "neutral";
    const diff = overallAverage.hourlyRate > 0
      ? ((todayAverage.hourlyRate - overallAverage.hourlyRate) / overallAverage.hourlyRate) * 100
      : 0;
    if (diff > 10) return "good";
    if (diff < -10) return "bad";
    return "neutral";
  };

  // Projeção para hoje
  const projection = todayAverage.hourlyRate > 0
    ? {
        hours: 4,
        minAmount: todayAverage.hourlyRate * 3,
        maxAmount: todayAverage.hourlyRate * 5,
      }
    : undefined;

  const todayInsight = generateTodayInsight(
    todayWeekday,
    todayAverage.hourlyRate,
    overallAverage.hourlyRate,
  );

  // Heatmap insights
  const heatmapInsights = generateHeatmapInsights(weekdayStats, dayStats);

  // Melhor dia e horário
  const bestDayInfo = identifyBestDay(weekdayStats);
  const bestTimeRangeInfo = identifyBestTimeRange(periods);

  // Calcular melhor dia e horário para HourlyValueCard
  const bestDay = weekdayStats.length > 0
    ? weekdayStats.reduce(
        (best, current) =>
          current.averageNetProfitPerHour > best.averageNetProfitPerHour ? current : best,
        weekdayStats[0],
      )
    : undefined;

  const bestDayForCard = bestDay
    ? {
        weekday: bestDay.weekdayName,
        hourlyRate: bestDay.averageNetProfitPerHour,
      }
    : undefined;

  // Calcular melhor faixa de horário (simplificado)
  const timeRanges: Record<string, { total: number; hours: number; startHour: number; endHour: number }> = {};
  periods.forEach((period) => {
    const startHour = new Date(period.startTime).getHours();
    let range = "";
    let startHourNum = 0;
    let endHourNum = 0;
    
    if (startHour >= 18 && startHour < 24) {
      range = "19h-22h";
      startHourNum = 19;
      endHourNum = 22;
    } else if (startHour >= 12 && startHour < 18) {
      range = "14h-17h";
      startHourNum = 14;
      endHourNum = 17;
    } else if (startHour >= 6 && startHour < 12) {
      range = "8h-11h";
      startHourNum = 8;
      endHourNum = 11;
    } else {
      range = "0h-5h";
      startHourNum = 0;
      endHourNum = 5;
    }

    if (!timeRanges[range]) {
      timeRanges[range] = { total: 0, hours: 0, startHour: startHourNum, endHour: endHourNum };
    }
    timeRanges[range].total += Number(period.netProfit);
    timeRanges[range].hours += period.hours;
  });

  let bestTimeRange = undefined;
  let bestRate = 0;
  Object.entries(timeRanges).forEach(([range, data]) => {
    const rate = data.hours > 0 ? data.total / data.hours : 0;
    if (rate > bestRate && data.hours > 0) {
      bestRate = rate;
      // Criar datas válidas usando uma data base
      const baseDate = new Date("2000-01-01T00:00:00Z");
      const startDate = new Date(baseDate);
      startDate.setUTCHours(data.startHour, 0, 0, 0);
      const endDate = new Date(baseDate);
      endDate.setUTCHours(data.endHour, 0, 0, 0);
      
      bestTimeRange = {
        start: startDate,
        end: endDate,
        hourlyRate: rate,
      };
    }
  });

  // Mensagem contextual para CTA
  const contextualMessage = goal && goalAnalysis
    ? `Registrar hoje pode te aproximar ${(
        (todayAverage.hourlyRate * 4) /
        goalAnalysis.remainingAmount
      ).toFixed(0)}% da sua meta mensal.`
    : "Registre seus períodos de trabalho para ver insights personalizados.";

  // Calcular média por hora (lucro líquido)
  const averageHourlyRate =
    stats.totalHours > 0 ? stats.totalNetProfit / stats.totalHours : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Ações Principais */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Freelancer</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie seus períodos de trabalho e ganhos
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setIsGoalFormOpen(true);
              }}
              className="gap-2"
            >
              <Target className="h-5 w-5" />
              {goal ? "Editar Meta" : "Definir Meta"}
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setSelectedPeriod(null);
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Registrar trabalho de hoje
            </Button>
          </div>
        </div>

        {/* 1. Hero Section - Meta em Primeiro Lugar */}
        {goal && goalValue > 0 ? (
          <MonthlyGoalHero
            goalType={goalType}
            goal={goalValue}
            currentAmount={goalAnalysis?.currentAmount || 0}
            remainingAmount={goalAnalysis?.remainingAmount || 0}
            aiInsight={monthlyGoalInsight}
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">
              Configure sua meta mensal para ver seu progresso e receber recomendações
              personalizadas.
            </p>
          </div>
        )}

        {/* 2. Card Resumo Inteligente de Hoje */}
        <TodayIntelligenceCard
          todayWeekday={todayWeekday}
          todayAverage={todayAverage}
          overallAverage={overallAverage}
          status={getTodayStatus()}
          projection={projection}
          aiInsight={todayInsight}
        />

        {/* Grid: Calendário + Quanto Vale Sua Hora */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 3. Calendário de Ganhos */}
          <div className="lg:col-span-2">
            {dayStats.length > 0 ? (
              <SmartHeatmap
                dayStats={dayStats}
                currentMonth={currentMonth}
                currentYear={currentYear}
                aiInsights={heatmapInsights}
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <p className="text-muted-foreground">
                  Registre seus períodos de trabalho para ver o calendário de ganhos.
                </p>
              </div>
            )}
          </div>

          {/* 4. Quanto Vale Sua Hora */}
          <div>
            <HourlyValueCard
              averageHourlyRate={averageHourlyRate}
              bestDay={bestDayForCard}
              bestTimeRange={bestTimeRange}
            />
          </div>
        </div>

        {/* 5. Histórico de Serviços */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Histórico de Serviços</h2>
            <p className="text-sm text-muted-foreground">
              Seus períodos de trabalho registrados
            </p>
          </div>
          <VisualTimeline
            periods={periods}
            onEdit={handleEdit}
            onDelete={handleSuccess}
            averageHourlyRate={averageHourlyRate}
          />
        </div>
      </div>

      {/* Formulários */}
      {isFormOpen && (
        <WorkPeriodForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedPeriod(null);
          }}
          period={selectedPeriod}
          projects={projects}
          onSuccess={handleSuccess}
          onProjectCreated={handleSuccess}
        />
      )}

      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSuccess={handleProjectSuccess}
      />

      <WorkGoalForm
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        initialData={goal}
        onSuccess={() => {
          setIsGoalFormOpen(false);
          loadGoal();
          if (periods.length > 0) {
            calculateAll();
          }
        }}
      />
    </>
  );
}
