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
      ? ((todayAverage.hourlyRate - overallAverage.hourlyRate) / overallAverage.hourlyRate) * 100
      : 0;

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Resumo Inteligente de Hoje</h3>
          </div>
          <Badge variant={statusConfig.badge as any}>{statusConfig.label}</Badge>
        </div>

        {/* Status do Dia */}
        <div className={`mb-4 rounded-lg border-2 ${statusConfig.bgColor} p-4`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
            <div className="flex-1">
              <p className="font-semibold">{statusConfig.label}</p>
              {todayAverage.hours > 0 && (
                <p className="text-sm text-muted-foreground">
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
          <div className="mb-4 rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 text-xs text-muted-foreground">Média histórica para {todayWeekday}s</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Ganho médio</div>
                <div className="text-lg font-bold">
                  {formatCurrency(todayAverage.amount / Math.max(1, todayAverage.hours))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Por hora</div>
                <div className="text-lg font-bold">{formatCurrency(todayAverage.hourlyRate)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Projeção */}
        {projection && (
          <div className="mb-4 rounded-lg border bg-primary/5 p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Projeção se trabalhar {formatHours(projection.hours)} hoje
            </div>
            <div className="text-lg font-bold">
              Entre {formatCurrency(projection.minAmount)} e {formatCurrency(projection.maxAmount)}
            </div>
          </div>
        )}

        {/* Insight da IA */}
        {aiInsight && (
          <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3">
            <p className="text-sm leading-relaxed text-foreground">{aiInsight}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

