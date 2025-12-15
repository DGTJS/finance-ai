"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { DayStats } from "../_lib/calculations";
import { formatCurrency, formatHours } from "./utils";
import { CalendarDays } from "lucide-react";

interface EarningsHeatmapProps {
  dayStats: DayStats[];
  currentMonth: number;
  currentYear: number;
}

export default function EarningsHeatmap({
  dayStats,
  currentMonth,
  currentYear,
}: EarningsHeatmapProps) {
  // Criar mapa de datas para acesso rápido
  const dayMap = new Map<string, DayStats>();
  dayStats.forEach((stat) => {
    const dateKey = stat.date.toISOString().split("T")[0];
    dayMap.set(dateKey, stat);
  });

  // Calcular estatísticas para determinar cores
  const allNetProfits = dayStats.map((d) => d.netProfit);
  const maxNetProfit = Math.max(...allNetProfits, 1);
  const avgNetProfit = allNetProfits.reduce((a, b) => a + b, 0) / (allNetProfits.length || 1);

  // Obter primeiro e último dia do mês
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Obter dia da semana do primeiro dia (0=domingo, 6=sábado)
  const firstDayOfWeek = firstDay.getDay();

  // Gerar array de dias do mês
  const days: Array<{ day: number; stats?: DayStats }> = [];

  // Adicionar dias vazios antes do primeiro dia
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: 0 });
  }

  // Adicionar dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split("T")[0];
    const stats = dayMap.get(dateKey);
    days.push({ day, stats });
  }

  // Função para determinar cor baseada no lucro
  const getColorClass = (stats?: DayStats): string => {
    if (!stats || stats.periodCount === 0) {
      return "bg-gray-100 hover:bg-gray-200"; // Não trabalhou
    }

    const netProfitPerHour = stats.totalHours > 0 ? stats.netProfit / stats.totalHours : 0;
    const avgNetProfitPerHour = avgNetProfit > 0 && dayStats.length > 0
      ? dayStats.reduce((sum, d) => sum + (d.totalHours > 0 ? d.netProfit / d.totalHours : 0), 0) / dayStats.length
      : 0;

    // Se lucro/hora está abaixo da média, vermelho
    if (netProfitPerHour < avgNetProfitPerHour * 0.7 && avgNetProfitPerHour > 0) {
      return "bg-red-200 hover:bg-red-300"; // Trabalhou mas abaixo da média
    }

    // Verde baseado no lucro total
    const ratio = stats.netProfit / maxNetProfit;
    if (ratio >= 0.8) {
      return "bg-green-600 hover:bg-green-700 text-white"; // Muito lucrativo
    } else if (ratio >= 0.5) {
      return "bg-green-400 hover:bg-green-500 text-white"; // Bom
    } else if (ratio >= 0.2) {
      return "bg-green-200 hover:bg-green-300"; // Fraco
    } else {
      return "bg-green-100 hover:bg-green-200"; // Muito fraco
    }
  };

  const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendário de Ganhos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground">
            {weekdayNames.map((day) => (
              <div key={day} className="text-center p-1">
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

              return (
                <div
                  key={item.day}
                  className={`aspect-square rounded-md p-1 text-xs transition-colors cursor-pointer ${getColorClass(
                    stats,
                  )} ${!hasData ? "opacity-50" : ""}`}
                  title={
                    hasData
                      ? `${item.day}/${currentMonth + 1}: ${formatCurrency(
                          stats.netProfit,
                        )} | ${formatHours(stats.totalHours)}`
                      : `${item.day}/${currentMonth + 1}: Sem trabalho`
                  }
                >
                  <div className="flex flex-col h-full justify-between">
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
          <div className="flex flex-wrap gap-4 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600" />
              <span>Muito lucrativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-400" />
              <span>Bom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200" />
              <span>Fraco</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200" />
              <span>Abaixo da média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <span>Sem trabalho</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

