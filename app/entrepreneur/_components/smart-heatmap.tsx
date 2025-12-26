"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { DayStats } from "../_lib/calculations";
import { formatCurrency, formatHours } from "./utils";
import { CalendarDays, Lightbulb } from "lucide-react";

interface SmartHeatmapProps {
  dayStats: DayStats[];
  currentMonth: number;
  currentYear: number;
  aiInsights?: string[];
}

export default function SmartHeatmap({
  dayStats,
  currentMonth,
  currentYear,
  aiInsights,
}: SmartHeatmapProps) {
  const dayMap = new Map<string, DayStats>();
  dayStats.forEach((stat) => {
    const dateKey = stat.date.toISOString().split("T")[0];
    dayMap.set(dateKey, stat);
  });

  const allNetProfits = dayStats.map((d) => d.netProfit);
  const maxNetProfit = Math.max(...allNetProfits, 1);
  const avgNetProfit =
    allNetProfits.reduce((a, b) => a + b, 0) / (allNetProfits.length || 1);

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  const days: Array<{ day: number; stats?: DayStats }> = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: 0 });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split("T")[0];
    const stats = dayMap.get(dateKey);
    days.push({ day, stats });
  }

  const getColorClass = (stats?: DayStats): string => {
    if (!stats || stats.periodCount === 0) {
      return "bg-gray-100 hover:bg-gray-200";
    }

    const netProfitPerHour =
      stats.totalHours > 0 ? stats.netProfit / stats.totalHours : 0;
    const avgNetProfitPerHour =
      avgNetProfit > 0 && dayStats.length > 0
        ? dayStats.reduce(
            (sum, d) =>
              sum + (d.totalHours > 0 ? d.netProfit / d.totalHours : 0),
            0,
          ) / dayStats.length
        : 0;

    if (
      netProfitPerHour < avgNetProfitPerHour * 0.7 &&
      avgNetProfitPerHour > 0
    ) {
      return "bg-red-200 hover:bg-red-300";
    }

    const ratio = stats.netProfit / maxNetProfit;
    if (ratio >= 0.8) {
      return "bg-green-600 hover:bg-green-700 text-white";
    } else if (ratio >= 0.5) {
      return "bg-green-400 hover:bg-green-500 text-white";
    } else if (ratio >= 0.2) {
      return "bg-green-200 hover:bg-green-300";
    } else {
      return "bg-green-100 hover:bg-green-200";
    }
  };

  const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="text-primary h-5 w-5" />
          Calendário de Ganhos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Cabeçalho */}
          <div className="text-muted-foreground grid grid-cols-7 gap-1 text-xs font-medium">
            {weekdayNames.map((day) => (
              <div key={day} className="p-1 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((item, index) => {
              if (item.day === 0) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const stats = item.stats;
              const hasData = stats && stats.periodCount > 0;
              const netProfitPerHour =
                stats && stats.totalHours > 0
                  ? stats.netProfit / stats.totalHours
                  : 0;

              return (
                <div
                  key={item.day}
                  className={`aspect-square cursor-pointer rounded-md p-1 text-xs transition-all ${getColorClass(
                    stats,
                  )} ${!hasData ? "opacity-50" : ""}`}
                  title={
                    hasData
                      ? `${item.day}/${currentMonth + 1}\n${formatCurrency(
                          stats.netProfit,
                        )} líquido\n${formatHours(stats.totalHours)} trabalhadas\n${formatCurrency(
                          netProfitPerHour,
                        )}/h`
                      : `${item.day}/${currentMonth + 1}: Sem trabalho`
                  }
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="font-medium">{item.day}</span>
                    {hasData && (
                      <div className="text-[10px] leading-tight">
                        <div className="font-semibold">
                          {formatCurrency(stats.netProfit)}
                        </div>
                        <div className="opacity-80">
                          {formatHours(stats.totalHours)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="text-muted-foreground flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-600" />
              <span>Muito lucrativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-400" />
              <span>Bom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-200" />
              <span>Fraco</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-200" />
              <span>Abaixo da média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-gray-100" />
              <span>Sem trabalho</span>
            </div>
          </div>
        </div>

        {/* Insights da IA */}
        {aiInsights && aiInsights.length > 0 && (
          <div className="border-primary bg-primary/5 rounded-lg border-l-4 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="text-primary h-4 w-4" />
              <span className="text-sm font-semibold">
                Insights Automáticos
              </span>
            </div>
            <ul className="space-y-1">
              {aiInsights.map((insight, index) => (
                <li key={index} className="text-muted-foreground text-sm">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
