"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { formatCurrency, formatTime } from "./utils";
import { Clock, TrendingUp, Award } from "lucide-react";

interface HourlyValueCardProps {
  averageHourlyRate: number;
  bestDay?: {
    weekday: string;
    hourlyRate: number;
  };
  bestTimeRange?: {
    start: Date;
    end: Date;
    hourlyRate: number;
  };
}

export default function HourlyValueCard({
  averageHourlyRate,
  bestDay,
  bestTimeRange,
}: HourlyValueCardProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Quanto Vale Sua Hora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Média Atual */}
        <div className="rounded-lg border-2 bg-primary/5 p-4">
          <div className="mb-1 text-sm text-muted-foreground">Média atual</div>
          <div className="text-3xl font-bold">{formatCurrency(averageHourlyRate)}</div>
          <div className="mt-1 text-xs text-muted-foreground">por hora trabalhada</div>
        </div>

        {/* Melhor Dia */}
        {bestDay && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Melhor desempenho</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {bestDay.weekday}: {formatCurrency(bestDay.hourlyRate)}/h
            </div>
            {bestDay.hourlyRate > averageHourlyRate && (
              <Badge variant="secondary" className="mt-2">
                +{(((bestDay.hourlyRate - averageHourlyRate) / averageHourlyRate) * 100).toFixed(0)}% acima da média
              </Badge>
            )}
          </div>
        )}

        {/* Melhor Faixa de Horário */}
        {bestTimeRange && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Melhor faixa de horário</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatTime(bestTimeRange.start)} - {formatTime(bestTimeRange.end)}:{" "}
              {formatCurrency(bestTimeRange.hourlyRate)}/h
            </div>
            {bestTimeRange.hourlyRate > averageHourlyRate && (
              <Badge variant="secondary" className="mt-2">
                +{(((bestTimeRange.hourlyRate - averageHourlyRate) / averageHourlyRate) * 100).toFixed(0)}% acima da média
              </Badge>
            )}
          </div>
        )}

        {/* Microcopy */}
        <div className="rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground">
          <p>
            Seu tempo é seu maior ativo. Foque nos horários e dias que geram mais valor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}




