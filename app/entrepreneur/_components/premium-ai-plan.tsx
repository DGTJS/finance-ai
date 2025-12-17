"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Progress } from "@/app/_components/ui/progress";
import { Badge } from "@/app/_components/ui/badge";
import { Brain, Target, TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { formatCurrency, formatHours } from "./utils";
import WorkGoalForm from "./work-goal-form";
import { useState } from "react";
import type { AIPlan } from "../_lib/ai-planner";
import type { GoalAnalysis } from "../_lib/calculations";

interface PremiumAIPlanProps {
  goal: {
    monthlyGoal: number;
    dailyGoal?: number | null;
  } | null;
  goalAnalysis: GoalAnalysis | null;
  aiPlan: AIPlan | null;
  isGenerating: boolean;
  onGoalUpdate: () => void;
}

export default function PremiumAIPlan({
  goal,
  goalAnalysis,
  aiPlan,
  isGenerating,
  onGoalUpdate,
}: PremiumAIPlanProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!goal) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Configure sua meta</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Defina uma meta mensal para o AI Work Planner criar seu plano personalizado.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Definir Meta
          </Button>
          <WorkGoalForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            initialData={null}
            onSuccess={() => {
              setIsFormOpen(false);
              onGoalUpdate();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const getAlertConfig = () => {
    if (!aiPlan) return { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    
    switch (aiPlan.alert) {
      case "positive":
        return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" };
      case "critical":
        return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" };
      default:
        return { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    }
  };

  const alertConfig = getAlertConfig();
  const AlertIcon = alertConfig.icon;

  return (
    <>
      <Card className={`relative overflow-hidden border-2 ${alertConfig.bg} shadow-lg`}>
        {/* Decoração premium */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        
        <CardContent className="relative z-10 p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Plano da IA para Você</h2>
                <p className="text-sm text-muted-foreground">Recomendações personalizadas</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="text-xs"
            >
              Editar Meta
            </Button>
          </div>

          {isGenerating ? (
            <div className="py-8 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-8 w-8 animate-pulse" />
              <p>Gerando seu plano personalizado...</p>
            </div>
          ) : aiPlan && goalAnalysis ? (
            <div className="space-y-6">
              {/* Resumo da Meta */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="mb-1 text-xs text-muted-foreground">Meta Mensal</div>
                  <div className="text-2xl font-bold">{formatCurrency(goal.monthlyGoal)}</div>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="mb-1 text-xs text-muted-foreground">Falta</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(goalAnalysis.remainingAmount)}
                  </div>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="mb-1 text-xs text-muted-foreground">Progresso</div>
                  <div className="text-2xl font-bold">
                    {((goalAnalysis.currentAmount / goalAnalysis.monthlyGoal) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progresso Visual */}
              <div className="space-y-2">
                <Progress
                  value={(goalAnalysis.currentAmount / goalAnalysis.monthlyGoal) * 100}
                  className="h-3"
                />
              </div>

              {/* Insight Principal da IA */}
              <div className={`rounded-xl border-2 ${alertConfig.bg} p-4`}>
                <div className="flex items-start gap-3">
                  <AlertIcon className={`h-5 w-5 ${alertConfig.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="font-medium leading-relaxed">{aiPlan.summary}</p>
                  </div>
                </div>
              </div>

              {/* Plano Recomendado */}
              <div className="rounded-lg border bg-background/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Plano Recomendado</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Horas por dia</div>
                    <div className="text-lg font-bold">
                      {goalAnalysis.hoursPerDayNeeded.toFixed(1)}h
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dias restantes</div>
                    <div className="text-lg font-bold">{goalAnalysis.workDaysRemaining} dias</div>
                  </div>
                </div>
                {aiPlan.plan.focusDays.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs text-muted-foreground">Foque nestes dias:</div>
                    <div className="flex flex-wrap gap-2">
                      {aiPlan.plan.focusDays.map((day) => (
                        <Badge key={day} variant="secondary" className="font-medium">
                          {day}s
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Probabilidade */}
              <div className="flex items-center justify-between rounded-lg border bg-background/50 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Probabilidade de bater a meta</span>
                </div>
                <Badge
                  variant={
                    aiPlan.probability >= 70
                      ? "default"
                      : aiPlan.probability >= 40
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-base font-bold"
                >
                  {aiPlan.probability}%
                </Badge>
              </div>

              {/* Insights */}
              {aiPlan.insights.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Insights</div>
                  <ul className="space-y-2">
                    {aiPlan.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>Configure sua meta para ver o plano da IA.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <WorkGoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={goal}
        onSuccess={() => {
          setIsFormOpen(false);
          onGoalUpdate();
        }}
      />
    </>
  );
}


