"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { formatCurrency, formatHours } from "./utils";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TodayIntelligenceCardProps {
  todayWeekday: string;
  todayAverage: {
    amount: number;
    hours: number;
    hourlyRate: number;
  };
  overallAverage: {
    hourlyRate: number;
  };
  status: "good" | "neutral" | "bad";
  projection?: {
    hours: number;
    minAmount: number;
    maxAmount: number;
  };
  aiInsight?: string;
}

export default function TodayIntelligenceCard({
  todayWeekday,
  todayAverage,
  overallAverage,
  status,
  projection,
  aiInsight,
}: TodayIntelligenceCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "good":
        return {
          label: "Bom dia para trabalhar",
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          badge: "success",
        };
      case "bad":
        return {
          label: "Dia fraco",
          icon: TrendingDown,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
          badge: "destructive",
        };
      default:
        return {
          label: "Dia médio",
          icon: Minus,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          badge: "secondary",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const percentageDiff =
    overallAverage.hourlyRate > 0
      ? ((todayAverage.hourlyRate - overallAverage.hourlyRate) /
          overallAverage.hourlyRate) *
        100
      : 0;

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="mb-2 flex flex-col gap-1.5 sm:mb-3 sm:flex-row sm:items-center sm:justify-between md:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <h3 className="text-xs font-bold sm:text-sm md:text-lg">
              Resumo Inteligente de Hoje
            </h3>
          </div>
          <Badge
            variant={statusConfig.badge as any}
            className="px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[10px] md:text-xs"
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Status do Dia */}
        <div
          className={`mb-2 rounded-lg border-2 ${statusConfig.bgColor} p-2 sm:mb-3 sm:p-3 md:mb-4 md:p-4`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusIcon
              className={`h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5 ${statusConfig.color}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold sm:text-sm md:text-base">
                {statusConfig.label}
              </p>
              {todayAverage.hours > 0 && (
                <p className="text-muted-foreground text-[9px] sm:text-[10px] md:text-sm">
                  {todayWeekday}s rendem em média{" "}
                  {percentageDiff > 0 ? (
                    <span className="font-semibold text-green-600">
                      {Math.abs(percentageDiff).toFixed(0)}% mais
                    </span>
                  ) : percentageDiff < 0 ? (
                    <span className="font-semibold text-red-600">
                      {Math.abs(percentageDiff).toFixed(0)}% menos
                    </span>
                  ) : (
                    <span>igual</span>
                  )}{" "}
                  para você.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Média Histórica */}
        {todayAverage.hours > 0 && (
          <div className="bg-muted/30 mb-2 rounded-lg border p-2 sm:mb-3 sm:p-3 md:mb-4 md:p-4">
            <div className="text-muted-foreground mb-1 text-[9px] sm:mb-1.5 sm:text-[10px] md:mb-2 md:text-xs">
              Média histórica para {todayWeekday}s
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <div className="text-muted-foreground text-[9px] sm:text-[10px] md:text-sm">
                  Ganho médio
                </div>
                <div className="text-xs font-bold sm:text-sm md:text-lg">
                  {formatCurrency(
                    todayAverage.amount / Math.max(1, todayAverage.hours),
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[9px] sm:text-[10px] md:text-sm">
                  Por hora
                </div>
                <div className="text-xs font-bold sm:text-sm md:text-lg">
                  {formatCurrency(todayAverage.hourlyRate)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projeção */}
        {projection && (
          <div className="bg-primary/5 mb-2 rounded-lg border p-2 sm:mb-3 sm:p-3 md:mb-4 md:p-4">
            <div className="text-muted-foreground mb-1 text-[9px] font-medium sm:mb-1.5 sm:text-[10px] md:mb-2 md:text-xs">
              Projeção se trabalhar {formatHours(projection.hours)} hoje
            </div>
            <div className="text-xs font-bold sm:text-sm md:text-lg">
              Entre {formatCurrency(projection.minAmount)} e{" "}
              {formatCurrency(projection.maxAmount)}
            </div>
          </div>
        )}

        {/* Insight da IA */}
        {aiInsight && (
          <div className="border-primary bg-primary/5 rounded-lg border-l-2 p-2 sm:border-l-4 sm:p-2.5 md:p-3">
            <p className="text-foreground text-[9px] leading-relaxed sm:text-[10px] md:text-sm">
              {aiInsight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
