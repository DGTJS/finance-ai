"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
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
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-1.5 text-sm sm:gap-2 sm:text-base">
          <Clock className="text-primary h-3.5 w-3.5 sm:h-5 sm:w-5" />
          Quanto Vale Sua Hora
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Mobile: Layout horizontal (deitado) */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Média Atual - Destaque */}
          <div className="bg-primary/5 rounded-lg border-2 p-2">
            <div className="text-muted-foreground text-[9px]">Média atual</div>
            <div className="text-lg font-bold">
              {formatCurrency(averageHourlyRate)}
            </div>
            <div className="text-muted-foreground text-[8px]">
              por hora trabalhada
            </div>
          </div>

          {/* Informações lado a lado */}
          <div className="grid grid-cols-2 gap-2">
            {/* Melhor Dia */}
            {bestDay && (
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="mb-1 flex items-center gap-1">
                  <Award className="text-primary h-3 w-3" />
                  <span className="text-[9px] font-semibold">
                    Melhor desempenho
                  </span>
                </div>
                <div className="text-muted-foreground truncate text-[9px]">
                  {bestDay.weekday}: {formatCurrency(bestDay.hourlyRate)}/h
                </div>
              </div>
            )}

            {/* Melhor Faixa de Horário */}
            {bestTimeRange && (
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="mb-1 flex items-center gap-1">
                  <TrendingUp className="text-primary h-3 w-3" />
                  <span className="text-[9px] font-semibold">
                    Melhor horário
                  </span>
                </div>
                <div className="text-muted-foreground truncate text-[9px]">
                  {formatTime(bestTimeRange.start)} -{" "}
                  {formatTime(bestTimeRange.end)}:{" "}
                  {formatCurrency(bestTimeRange.hourlyRate)}/h
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Layout vertical */}
        <div className="hidden space-y-4 sm:block">
          {/* Média Atual */}
          <div className="bg-primary/5 rounded-lg border-2 p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              Média atual
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(averageHourlyRate)}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              por hora trabalhada
            </div>
          </div>

          {/* Melhor Dia */}
          {bestDay && (
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Award className="text-primary h-4 w-4" />
                <span className="text-sm font-semibold">Melhor desempenho</span>
              </div>
              <div className="text-muted-foreground text-sm">
                {bestDay.weekday}: {formatCurrency(bestDay.hourlyRate)}/h
              </div>
              {bestDay.hourlyRate > averageHourlyRate && (
                <Badge variant="secondary" className="mt-2">
                  +
                  {(
                    ((bestDay.hourlyRate - averageHourlyRate) /
                      averageHourlyRate) *
                    100
                  ).toFixed(0)}
                  % acima da média
                </Badge>
              )}
            </div>
          )}

          {/* Melhor Faixa de Horário */}
          {bestTimeRange && (
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="text-primary h-4 w-4" />
                <span className="text-sm font-semibold">
                  Melhor faixa de horário
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                {formatTime(bestTimeRange.start)} -{" "}
                {formatTime(bestTimeRange.end)}:{" "}
                {formatCurrency(bestTimeRange.hourlyRate)}/h
              </div>
              {bestTimeRange.hourlyRate > averageHourlyRate && (
                <Badge variant="secondary" className="mt-2">
                  +
                  {(
                    ((bestTimeRange.hourlyRate - averageHourlyRate) /
                      averageHourlyRate) *
                    100
                  ).toFixed(0)}
                  % acima da média
                </Badge>
              )}
            </div>
          )}

          {/* Microcopy */}
          <div className="bg-muted/20 text-muted-foreground rounded-lg p-3 text-xs">
            <p>
              Seu tempo é seu maior ativo. Foque nos horários e dias que geram
              mais valor.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
