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
    <div className="from-primary/10 via-background to-primary/5 relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-3 shadow-xl sm:rounded-2xl sm:p-6 md:p-8">
      {/* Decoração de fundo */}
      <div className="bg-primary/5 pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-primary/5 pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 sm:mb-4 md:mb-6 md:gap-3">
          <div className="bg-primary/10 rounded-lg p-1.5 sm:p-2 md:p-3">
            <Target className="text-primary h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-muted-foreground text-xs font-semibold sm:text-sm md:text-lg">
              {getGoalLabel()}
            </h2>
            <p className="truncate text-base font-bold sm:text-lg md:text-2xl">
              {formatCurrency(goal)}
            </p>
          </div>
        </div>

        {/* Progresso */}
        <div className="mb-3 space-y-2 sm:mb-4 sm:space-y-3 md:mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground font-medium">Progresso</span>
            <span className="text-lg font-bold sm:text-xl md:text-2xl">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={percentage} className="h-2 sm:h-3 md:h-4" />
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <div className="truncate">
              <span className="text-muted-foreground">Alcançado: </span>
              <span className="font-semibold">
                {formatCurrency(currentAmount)}
              </span>
            </div>
            <div className="truncate">
              <span className="text-muted-foreground">Falta: </span>
              <span className="text-primary font-semibold">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Insight da IA */}
        {aiInsight && (
          <div className="bg-primary/5 rounded-lg border p-2 sm:rounded-xl sm:p-3 md:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp className="text-primary mt-0.5 h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <p className="text-foreground text-[10px] leading-relaxed sm:text-xs md:text-sm">
                {aiInsight}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
