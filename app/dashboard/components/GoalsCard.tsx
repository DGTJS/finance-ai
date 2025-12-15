/**
 * GoalsCard - Card exibindo metas financeiras em andamento
 *
 * Props:
 * - goals: Array de metas
 * - maxItems: Número máximo de itens a exibir (padrão: 3)
 * - onAddAmount: Callback para adicionar valor a uma meta
 *
 * Funcionalidades:
 * - Barra de progresso animada
 * - Botão para adicionar valor rapidamente
 * - Link para ver todas as metas
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Goal } from "@/src/types/dashboard";
import { formatCurrency, daysUntil } from "@/src/lib/utils";
import { useState } from "react";
import AddGoalAmountDialog from "@/app/_components/add-goal-amount-dialog";

interface GoalsCardProps {
  goals: Goal[];
  maxItems?: number;
  onAddAmount?: (goalId: string, amount: number) => Promise<void>;
}

export function GoalsCard({
  goals,
  maxItems = 3,
  onAddAmount,
}: GoalsCardProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const displayGoals = goals.slice(0, maxItems);

  const handleAddClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleClose = () => {
    setSelectedGoal(null);
  };

  const handleSubmit = async (amount: number) => {
    if (selectedGoal && onAddAmount) {
      await onAddAmount(selectedGoal.id, amount);
      setSelectedGoal(null);
    }
  };

  return (
    <>
      <Card role="region" aria-label="Metas financeiras">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Metas em Andamento
            </CardTitle>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/goals">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayGoals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma meta ativa
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/goals?action=add">Criar meta</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayGoals.map((goal) => {
                const progress =
                  goal.target > 0
                    ? Math.min((goal.current / goal.target) * 100, 100)
                    : 0;
                const days = daysUntil(goal.dueDate);
                const isOverdue = days < 0;

                return (
                  <div
                    key={goal.id}
                    className="hover:border-primary/50 rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {goal.icon && (
                            <span className="text-lg">{goal.icon}</span>
                          )}
                          <h3 className="truncate text-sm font-semibold">
                            {goal.title}
                          </h3>
                        </div>

                        {/* Barra de progresso */}
                        <div className="mb-2">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {progress.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">
                              {formatCurrency(goal.current)} /{" "}
                              {formatCurrency(goal.target)}
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="h-full transition-all duration-500 ease-out"
                              style={{
                                width: `${progress}%`,
                                backgroundColor:
                                  goal.color || "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>

                        {/* Prazo */}
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={
                              isOverdue
                                ? "text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                            }
                          >
                            {isOverdue
                              ? `${Math.abs(days)} dia${
                                  Math.abs(days) !== 1 ? "s" : ""
                                } de atraso`
                              : `${days} dia${days !== 1 ? "s" : ""} restante${
                                  days !== 1 ? "s" : ""
                                }`}
                          </span>
                          {goal.isShared && (
                            <span className="text-muted-foreground text-xs">
                              Compartilhada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botão adicionar */}
                      {onAddAmount && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddClick(goal)}
                          aria-label={`Adicionar valor à meta ${goal.title}`}
                          className="h-8 w-8 shrink-0 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar valor */}
      {selectedGoal && (
        <AddGoalAmountDialog
          isOpen={!!selectedGoal}
          onClose={handleClose}
          goalId={selectedGoal.id}
          goalName={selectedGoal.title}
          currentAmount={selectedGoal.current}
          targetAmount={selectedGoal.target}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
