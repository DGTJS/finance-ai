"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Progress } from "@/app/_components/ui/progress";
import { Badge } from "@/app/_components/ui/badge";
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { formatCurrency } from "./utils";
import WorkGoalForm from "./work-goal-form";
import EarningsHeatmap from "./earnings-heatmap";
import { getWorkGoal } from "@/app/_actions/work-goal";
import { getWorkPeriods, getWorkPeriodStats } from "@/app/_actions/work-period";
import {
  groupPeriodsByDay,
  analyzeWeekdayStats,
  calculateGoalAnalysis,
  identifyBestWorstDays,
  type DayStats,
  type WeekdayStats,
  type GoalAnalysis,
} from "../_lib/calculations";
import { generateWorkPlan, type AIPlan } from "../_lib/ai-planner";
import { toast } from "sonner";

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

interface AIWorkPlannerProps {
  initialPeriods: WorkPeriod[];
}

export default function AIWorkPlanner({ initialPeriods }: AIWorkPlannerProps) {
  const [goal, setGoal] = useState<any>(null);
  const [periods, setPeriods] = useState<WorkPeriod[]>(initialPeriods);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [weekdayStats, setWeekdayStats] = useState<WeekdayStats[]>([]);
  const [goalAnalysis, setGoalAnalysis] = useState<GoalAnalysis | null>(null);
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Recalcular quando goal ou periods mudarem
  useEffect(() => {
    if (goal && periods.length > 0) {
      calculateAll();
    }
  }, [goal, periods]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar períodos do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const [goalResult, periodsResult] = await Promise.all([
        getWorkGoal(),
        getWorkPeriods(startOfMonth, endOfMonth),
      ]);

      if (goalResult.success && goalResult.data) {
        setGoal(goalResult.data);
      }

      if (periodsResult.success && periodsResult.data) {
        setPeriods(periodsResult.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAll = async () => {
    if (!goal) return;

    try {
      // Agrupar períodos por dia
      const dayMap = groupPeriodsByDay(periods);
      const dayStatsArray = Array.from(dayMap.values());
      setDayStats(dayStatsArray);

      // Analisar por dia da semana
      const weekdayStatsArray = analyzeWeekdayStats(periods);
      setWeekdayStats(weekdayStatsArray);

      // Calcular análise de meta
      const analysis = calculateGoalAnalysis(
        periods,
        goal.monthlyGoal,
        goal.workDays,
        goal.maxHoursDay,
      );
      setGoalAnalysis(analysis);

      // Identificar melhores e piores dias
      const { bestDays, worstDays } = identifyBestWorstDays(weekdayStatsArray);

      // Buscar estatísticas do mês
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      const statsResult = await getWorkPeriodStats(firstDayOfMonth, lastDayOfMonth);

      const currentMonthStats = statsResult.success && statsResult.data
        ? statsResult.data
        : {
            totalHours: 0,
            totalAmount: 0,
            totalExpenses: 0,
            totalNetProfit: 0,
            periodCount: 0,
            averageHourlyRate: 0,
          };

      // Gerar plano com IA
      setIsGeneratingPlan(true);
      const plan = await generateWorkPlan(
        analysis,
        weekdayStatsArray,
        currentMonthStats,
        bestDays,
        worstDays,
      );
      setAiPlan(plan);
    } catch (error) {
      console.error("Erro ao calcular:", error);
      toast.error("Erro ao gerar plano");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGoalSaved = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (!goal) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Work Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Configure suas metas de trabalho para o AI Work Planner calcular seu plano ideal.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Configurar Metas
          </Button>
          <WorkGoalForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            initialData={null}
            onSuccess={handleGoalSaved}
          />
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = () => {
    if (!aiPlan) return <Info className="h-5 w-5" />;
    switch (aiPlan.alert) {
      case "positive":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = () => {
    if (!aiPlan) return "border-blue-200 bg-blue-50";
    switch (aiPlan.alert) {
      case "positive":
        return "border-green-200 bg-green-50";
      case "critical":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Principal - Plano da IA */}
      <Card className={`border-2 ${getAlertColor()}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Plano da IA para Você
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(true)}
              >
                Editar Metas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo da Meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Meta Mensal</div>
              <div className="text-2xl font-bold">
                {formatCurrency(goal.monthlyGoal)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Ganho Atual</div>
              <div className="text-2xl font-bold">
                {formatCurrency(goalAnalysis?.currentAmount || 0)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Falta</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(goalAnalysis?.remainingAmount || 0)}
              </div>
            </div>
          </div>

          {/* Progresso */}
          {goalAnalysis && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso da Meta</span>
                <span className="font-semibold">
                  {((goalAnalysis.currentAmount / goalAnalysis.monthlyGoal) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(goalAnalysis.currentAmount / goalAnalysis.monthlyGoal) * 100}
                className="h-3"
              />
            </div>
          )}

          {/* Resumo da IA */}
          {isGeneratingPlan ? (
            <div className="py-8 text-center text-muted-foreground">
              Gerando plano com IA...
            </div>
          ) : aiPlan ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                {getAlertIcon()}
                <div className="flex-1">
                  <p className="font-medium">{aiPlan.summary}</p>
                </div>
              </div>

              {/* Probabilidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Probabilidade de Bater a Meta</span>
                  <Badge
                    variant={
                      aiPlan.probability >= 70
                        ? "default"
                        : aiPlan.probability >= 40
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {aiPlan.probability}%
                  </Badge>
                </div>
                <Progress value={aiPlan.probability} className="h-2" />
              </div>

              {/* Plano Recomendado */}
              {goalAnalysis && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Plano Recomendado
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Horas por Dia</div>
                      <div className="text-lg font-semibold">
                        {goalAnalysis.hoursPerDayNeeded.toFixed(1)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Dias Restantes</div>
                      <div className="text-lg font-semibold">
                        {goalAnalysis.workDaysRemaining} dias
                      </div>
                    </div>
                  </div>
                  {aiPlan.plan.focusDays.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Foque nestes dias:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiPlan.plan.focusDays.map((day) => (
                          <Badge key={day} variant="secondary">
                            {day}s
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Insights */}
              {aiPlan.insights.length > 0 && (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Insights
                  </div>
                  <ul className="space-y-2">
                    {aiPlan.insights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Clique em "Gerar Plano" para ver recomendações
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendário Heatmap */}
      {dayStats.length > 0 && (
        <EarningsHeatmap
          dayStats={dayStats}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      )}

      {/* Análise por Dia da Semana */}
      {weekdayStats.some((s) => s.periodCount > 0) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Análise por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekdayStats
                .filter((s) => s.periodCount > 0)
                .sort((a, b) => b.averageNetProfitPerHour - a.averageNetProfitPerHour)
                .map((stat) => (
                  <div key={stat.weekday} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{stat.weekdayName}</span>
                      <Badge variant="secondary">
                        {stat.periodCount} {stat.periodCount === 1 ? "período" : "períodos"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lucro/Hora:</span>{" "}
                        <span className="font-semibold">
                          {formatCurrency(stat.averageNetProfitPerHour)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>{" "}
                        <span className="font-semibold">
                          {formatCurrency(stat.netProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form de Metas */}
      <WorkGoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={goal}
        onSuccess={handleGoalSaved}
      />
    </div>
  );
}

