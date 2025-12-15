"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatHours } from "./utils";
import type { WeekdayStats } from "../_lib/calculations";

interface WeekdayPerformanceGridProps {
  weekdayStats: WeekdayStats[];
  bestDays: WeekdayStats[];
  worstDays: WeekdayStats[];
}

export default function WeekdayPerformanceGrid({
  weekdayStats,
  bestDays,
  worstDays,
}: WeekdayPerformanceGridProps) {
  const weekdayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Criar array ordenado por dia da semana (domingo = 0)
  const orderedStats = weekdayNames.map((name, index) => {
    const stat = weekdayStats.find((s) => s.weekday === index);
    return {
      weekday: index,
      weekdayName: name,
      ...(stat || {
        totalAmount: 0,
        totalHours: 0,
        totalExpenses: 0,
        netProfit: 0,
        periodCount: 0,
        averageHourlyRate: 0,
        averageNetProfitPerHour: 0,
      }),
    };
  });

  const isBestDay = (weekday: number) => bestDays.some((d) => d.weekday === weekday);
  const isWorstDay = (weekday: number) => worstDays.some((d) => d.weekday === weekday);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Performance por Dia da Semana</h2>
        <p className="text-sm text-muted-foreground">
          Descubra quais dias rendem mais para você
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {orderedStats.map((stat) => {
          const hasData = stat.periodCount > 0;
          const best = isBestDay(stat.weekday);
          const worst = isWorstDay(stat.weekday);

          return (
            <Card
              key={stat.weekday}
              className={`relative overflow-hidden transition-all hover:shadow-md ${
                best
                  ? "border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20"
                  : worst
                    ? "border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20"
                    : hasData
                      ? "border"
                      : "border border-dashed opacity-60"
              }`}
            >
              {best && (
                <div className="absolute right-2 top-2">
                  <Badge className="bg-green-600 text-white">Melhor</Badge>
                </div>
              )}
              {worst && hasData && (
                <div className="absolute right-2 top-2">
                  <Badge variant="destructive">Pior</Badge>
                </div>
              )}

              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="text-lg font-bold">{stat.weekdayName}</div>
                  {!hasData && (
                    <div className="text-xs text-muted-foreground">Sem dados</div>
                  )}
                </div>

                {hasData ? (
                  <div className="space-y-2">
                    {/* Lucro por Hora - Destaque */}
                    <div className="rounded-lg bg-background/50 p-2">
                      <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Lucro/hora
                      </div>
                      <div className="text-lg font-bold">
                        {formatCurrency(stat.averageNetProfitPerHour)}
                      </div>
                    </div>

                    {/* Ganho Médio (Lucro Líquido) */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Ganho médio</span>
                      <span className="font-medium">
                        {formatCurrency(stat.netProfit / Math.max(1, stat.periodCount))}
                      </span>
                    </div>

                    {/* Horas Médias */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Horas médias
                      </span>
                      <span className="font-medium">
                        {formatHours(stat.totalHours / Math.max(1, stat.periodCount))}
                      </span>
                    </div>

                    {/* Total de Períodos */}
                    <div className="pt-2 text-xs text-muted-foreground">
                      {stat.periodCount} {stat.periodCount === 1 ? "período" : "períodos"}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    Nenhum registro
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border-2 border-green-500 bg-green-50" />
          <span>Melhor dia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border-2 border-red-500 bg-red-50" />
          <span>Pior dia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-dashed" />
          <span>Sem dados</span>
        </div>
      </div>
    </div>
  );
}

