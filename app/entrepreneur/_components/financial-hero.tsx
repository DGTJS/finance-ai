"use client";

import { formatCurrency, formatHours } from "./utils";
import { TrendingUp, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface FinancialHeroProps {
  monthlyNetProfit: number;
  averageHourlyRate: number;
  todayStats: {
    totalAmount: number;
    totalHours: number;
    totalNetProfit: number;
    periodCount: number;
    averageHourlyRate: number;
  };
  monthlyAverageHourlyRate: number;
}

export default function FinancialHero({
  monthlyNetProfit,
  averageHourlyRate,
  todayStats,
  monthlyAverageHourlyRate,
}: FinancialHeroProps) {
  // Determinar status do dia
  const getDayStatus = () => {
    if (todayStats.periodCount === 0) {
      return {
        status: "neutral" as const,
        label: "Dia neutro",
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        message: "Ainda não há registros hoje.",
      };
    }

    const todayRate = todayStats.averageHourlyRate;
    const monthlyRate = monthlyAverageHourlyRate;

    if (todayRate >= monthlyRate * 1.1) {
      return {
        status: "good" as const,
        label: "Compensa trabalhar hoje",
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        message: "Hoje está rendendo acima da sua média!",
      };
    } else if (todayRate >= monthlyRate * 0.9) {
      return {
        status: "neutral" as const,
        label: "Dia neutro",
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        message: "Rendimento próximo da média.",
      };
    } else {
      return {
        status: "bad" as const,
        label: "Não compensa",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        message: "Rendimento abaixo da média hoje.",
      };
    }
  };

  const dayStatus = getDayStatus();
  const StatusIcon = dayStatus.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 shadow-lg sm:p-8">
      {/* Hero Principal */}
      <div className="relative z-10">
        {/* Ganho Líquido do Mês - Destaque Principal */}
        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            Ganho Líquido do Mês
          </div>
          <div className="text-5xl font-bold tracking-tight sm:text-6xl">
            {formatCurrency(monthlyNetProfit)}
          </div>
        </div>

        {/* Ganho Médio por Hora - Destaque Secundário */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Média por hora</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(averageHourlyRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Status do Dia */}
        <div
          className={`rounded-xl border-2 ${dayStatus.bgColor} p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-start gap-3">
            <StatusIcon className={`h-6 w-6 ${dayStatus.color} mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              <div className={`mb-1 font-semibold ${dayStatus.color}`}>
                {dayStatus.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {dayStatus.message}
              </div>
              {todayStats.periodCount > 0 && (
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatHours(todayStats.totalHours)} hoje</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{formatCurrency(todayStats.totalNetProfit)} líquido</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Microcopy Humana */}
        <div className="mt-6 text-sm leading-relaxed text-muted-foreground">
          {averageHourlyRate > 0 ? (
            <p>
              Hoje, cada hora sua vale em média{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(averageHourlyRate)}
              </span>
              .
            </p>
          ) : (
            <p>Comece a registrar seus períodos de trabalho para ver seus ganhos.</p>
          )}
        </div>
      </div>

      {/* Decoração de fundo sutil */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}


