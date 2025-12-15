/**
 * UserStatsCard - Card exibindo estatísticas por usuário (contas familiares)
 * 
 * Props:
 * - userStats: Array de estatísticas por usuário
 * 
 * Funcionalidades:
 * - Exibe receitas, despesas e investimentos por pessoa
 * - Badges de performance (se implementado)
 * - Avatar ou inicial do usuário
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { UserStat } from "@/src/types/dashboard";
import { formatCurrency } from "@/src/lib/utils";

interface UserStatsCardProps {
  userStats: UserStat[];
}

export function UserStatsCard({ userStats }: UserStatsCardProps) {
  if (userStats.length === 0) {
    return null;
  }

  const calculatePerformance = (stat: UserStat) => {
    const net = stat.revenues - stat.expenses;
    const percentage = stat.revenues > 0 ? (net / stat.revenues) * 100 : 0;
    return {
      net,
      percentage,
      badge: percentage >= 30 ? "excellent" : percentage >= 10 ? "good" : "needs-improvement",
    };
  };

  return (
    <Card role="region" aria-label="Estatísticas por usuário">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Estatísticas por Usuário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userStats.map((stat) => {
            const performance = calculatePerformance(stat);
            const net = stat.revenues - stat.expenses;

            return (
              <div
                key={stat.userId}
                className="rounded-lg border p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  {stat.avatarUrl ? (
                    <img
                      src={stat.avatarUrl}
                      alt={stat.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg border-2 border-primary/20">
                      {stat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{stat.name}</p>
                    <Badge
                      variant={
                        performance.badge === "excellent"
                          ? "default"
                          : performance.badge === "good"
                            ? "secondary"
                            : "outline"
                      }
                      className="mt-1"
                    >
                      {performance.badge === "excellent"
                        ? "Excelente"
                        : performance.badge === "good"
                          ? "Bom"
                          : "Atenção"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Receitas */}
                  <div className="text-center rounded-lg border p-3 bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-muted-foreground">
                        Receitas
                      </span>
                    </div>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(stat.revenues)}
                    </p>
                  </div>

                  {/* Despesas */}
                  <div className="text-center rounded-lg border p-3 bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs text-muted-foreground">
                        Despesas
                      </span>
                    </div>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(stat.expenses)}
                    </p>
                  </div>

                  {/* Investimentos */}
                  <div className="text-center rounded-lg border p-3 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-muted-foreground">
                        Investimentos
                      </span>
                    </div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(stat.investments)}
                    </p>
                  </div>
                </div>

                {/* Saldo líquido */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Saldo Líquido
                    </span>
                    <span
                      className={`font-semibold ${
                        net >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

