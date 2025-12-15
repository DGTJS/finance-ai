"use client";

import { formatCurrency } from "./utils";
import { Progress } from "@/app/_components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

interface MonthlyGoalHeroProps {
  goalType: "daily" | "weekly" | "monthly" | "custom";
  goal: number;
  currentAmount: number;
  remainingAmount: number;
  aiInsight?: string;
}

export default function MonthlyGoalHero({
  goalType,
  goal,
  currentAmount,
  remainingAmount,
  aiInsight,
}: MonthlyGoalHeroProps) {
  const progress = goal > 0 ? (currentAmount / goal) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, progress));

  const getGoalLabel = () => {
    switch (goalType) {
      case "daily":
        return "Meta Diária";
      case "weekly":
        return "Meta Semanal";
      case "monthly":
        return "Meta Mensal";
      case "custom":
        return "Meta Personalizada";
      default:
        return "Meta Mensal";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 shadow-xl">
      {/* Decoração de fundo */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-muted-foreground">{getGoalLabel()}</h2>
            <p className="text-2xl font-bold">{formatCurrency(goal)}</p>
          </div>
        </div>

        {/* Progresso */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Progresso</span>
            <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-4" />
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Alcançado: </span>
              <span className="font-semibold">{formatCurrency(currentAmount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Falta: </span>
              <span className="font-semibold text-primary">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Insight da IA */}
        {aiInsight && (
          <div className="rounded-xl border bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground">{aiInsight}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

