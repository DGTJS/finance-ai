/**
 * ActionsInsightsCard - Card único consolidando Insights, Pagamentos e Metas
 * Design simplificado, elegante e surpreendente
 */

"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { formatCurrency, daysUntil } from "@/src/lib/utils";
import type { Insight, ScheduledPayment, Goal } from "@/src/types/dashboard";
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Target,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import Link from "next/link";
import { useState } from "react";
import AddGoalAmountDialog from "@/app/_components/add-goal-amount-dialog";

interface ActionsInsightsCardProps {
  insight: Insight;
  scheduledPayments: ScheduledPayment[];
  goals: Goal[];
  onAddGoalAmount?: (goalId: string, amount: number) => Promise<void>;
}

export function ActionsInsightsCard({
  insight,
  scheduledPayments,
  goals,
  onAddGoalAmount,
}: ActionsInsightsCardProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const getInsightConfig = (severity: Insight["severity"]) => {
    switch (severity) {
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900/50",
        };
      case "medium":
        return {
          icon: Info,
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50 dark:bg-orange-950/20",
          border: "border-orange-200 dark:border-orange-900/50",
        };
      default:
        return {
          icon: CheckCircle,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-900/50",
        };
    }
  };

  const config = getInsightConfig(insight.severity);
  const Icon = config.icon;

  const displayPayments = scheduledPayments.slice(0, 2);
  const displayGoals = goals.slice(0, 2);

  return (
    <Card className="bg-background overflow-hidden border-0 shadow-sm">
      <CardContent className="p-6">
        {/* Insight da IA - Destaque Principal */}
        <div
          className={cn("mb-6 rounded-xl border p-4", config.bg, config.border)}
        >
          <div className="mb-3 flex items-start gap-3">
            <div className={cn("rounded-lg p-2", config.bg)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-sm font-semibold">Insight da IA</h3>
                <Sparkles className="text-primary h-3.5 w-3.5" />
              </div>
              <p className="text-muted-foreground text-xs">
                Análise inteligente dos seus dados
              </p>
            </div>
          </div>
          <p className="mb-3 text-sm leading-relaxed">{insight.message}</p>
          {insight.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {insight.actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  asChild={action.type === "link"}
                >
                  {action.type === "link" ? (
                    <Link href={action.url || "#"}>{action.label}</Link>
                  ) : (
                    <span>{action.label}</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Grid com Pagamentos e Metas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pagamentos Agendados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-semibold">Pagamentos</h4>
              </div>
              {scheduledPayments.length > 2 && (
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0 text-xs"
                >
                  <Link href="/subscriptions">
                    Ver todas
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>

            {displayPayments.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Nenhum pagamento agendado
              </p>
            ) : (
              <div className="space-y-2">
                {displayPayments.map((payment) => {
                  const days =
                    payment.daysUntil ??
                    (payment.dueDate ? daysUntil(payment.dueDate) : 999);
                  const isUrgent = days <= 7;

                  return (
                    <div
                      key={payment.id}
                      className={cn(
                        "rounded-lg border p-2.5 transition-all",
                        isUrgent
                          ? "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20"
                          : "border-muted bg-muted/30",
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <p className="truncate text-xs font-medium">
                          {payment.name}
                        </p>
                        {isUrgent && (
                          <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-medium text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                            {days}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(payment.value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Metas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-xs font-semibold">Metas</h4>
              </div>
              {goals.length > 2 && (
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0 text-xs"
                >
                  <Link href="/goals">
                    Ver todas
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>

            {displayGoals.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Nenhuma meta ativa
              </p>
            ) : (
              <div className="space-y-2">
                {displayGoals.map((goal) => {
                  const currentAmount = goal.current ?? 0;
                  const targetAmount = goal.target ?? 0;
                  const percentage =
                    targetAmount > 0
                      ? Math.min((currentAmount / targetAmount) * 100, 100)
                      : 0;
                  const daysLeft = goal.dueDate
                    ? daysUntil(goal.dueDate)
                    : null;

                  return (
                    <div
                      key={goal.id}
                      className="border-muted bg-muted/30 rounded-lg border p-2.5"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="truncate text-xs font-medium">
                          {goal.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 shrink-0 rounded-full p-0 hover:bg-purple-100 dark:hover:bg-purple-950/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGoal(goal.id);
                          }}
                          type="button"
                          aria-label={`Adicionar valor à meta ${goal.title}`}
                        >
                          <Plus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </Button>
                      </div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatCurrency(currentAmount)}
                        </span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-muted h-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className="text-muted-foreground mt-1 text-[9px]">
                          {daysLeft} dias restantes
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Dialog para adicionar valor à meta */}
      {selectedGoal &&
        onAddGoalAmount &&
        (() => {
          const goal = goals.find((g) => g.id === selectedGoal);
          if (!goal) return null;

          return (
            <AddGoalAmountDialog
              key={selectedGoal}
              isOpen={true}
              goalId={selectedGoal}
              goalName={goal.title}
              currentAmount={goal.current ?? 0}
              targetAmount={goal.target ?? 0}
              onClose={() => setSelectedGoal(null)}
              onSubmit={async (amount) => {
                await onAddGoalAmount(selectedGoal, amount);
                setSelectedGoal(null);
              }}
            />
          );
        })()}
    </Card>
  );
}
