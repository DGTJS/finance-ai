"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { Edit, Trash2, Clock, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { deleteWorkPeriod } from "@/app/_actions/work-period";
import { toast } from "sonner";
import { formatCurrency, formatHours, formatTime, formatDate } from "./utils";

interface WorkPeriod {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hours: number;
  amount: number;
  expenses: number;
  netProfit: number;
  description: string | null;
  project: {
    id: string;
    clientName: string;
    projectName: string | null;
  } | null;
}

interface VisualTimelineProps {
  periods: WorkPeriod[];
  onEdit: (period: WorkPeriod) => void;
  onDelete: () => void;
  averageHourlyRate: number;
}

export default function VisualTimeline({
  periods,
  onEdit,
  onDelete,
  averageHourlyRate,
}: VisualTimelineProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkPeriod(deleteId);
      if (result.success) {
        toast.success("Período excluído");
        setDeleteId(null);
        onDelete();
      } else {
        toast.error(result.error || "Erro ao excluir");
      }
    } catch (error) {
      toast.error("Erro ao excluir período");
    } finally {
      setIsDeleting(false);
    }
  };

  const groupedPeriods = periods.reduce((acc, period) => {
    const dateKey = new Date(period.date).toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(period);
    return acc;
  }, {} as Record<string, WorkPeriod[]>);

  const sortedDates = Object.keys(groupedPeriods).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  // Calcular melhor e pior dia
  const dayStats = sortedDates.map((dateKey) => {
    const dayPeriods = groupedPeriods[dateKey];
    const totalNetProfit = dayPeriods.reduce((sum, p) => sum + Number(p.netProfit), 0);
    const totalHours = dayPeriods.reduce((sum, p) => sum + p.hours, 0);
    const hourlyRate = totalHours > 0 ? totalNetProfit / totalHours : 0;
    return { dateKey, totalNetProfit, hourlyRate };
  });

  const bestDay = dayStats.reduce(
    (best, current) => (current.hourlyRate > best.hourlyRate ? current : best),
    dayStats[0] || { dateKey: "", hourlyRate: 0 },
  );
  const worstDay = dayStats.reduce(
    (worst, current) => (current.hourlyRate < worst.hourlyRate ? current : worst),
    dayStats[0] || { dateKey: "", hourlyRate: Infinity },
  );

  if (periods.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Nenhum período registrado</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Comece registrando seus períodos de trabalho para ver seu histórico e insights
            personalizados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedDates.map((dateKey) => {
          const dayPeriods = groupedPeriods[dateKey];
          const date = new Date(dateKey);
          const dayTotal = dayPeriods.reduce((sum, p) => sum + Number(p.netProfit), 0);
          const dayHours = dayPeriods.reduce((sum, p) => sum + p.hours, 0);
          const dayHourlyRate = dayHours > 0 ? dayTotal / dayHours : 0;
          const isBestDay = dateKey === bestDay.dateKey;
          const isWorstDay = dateKey === worstDay.dateKey && dayHourlyRate < averageHourlyRate * 0.8;

          return (
            <Card
              key={dateKey}
              className={`border-2 transition-all hover:shadow-md ${
                isBestDay
                  ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                  : isWorstDay
                    ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                    : "border"
              }`}
            >
              <CardContent className="p-5">
                {/* Header do Dia */}
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {date.getDate()}
                    </div>
                    <div>
                      <div className="font-semibold">{formatDate(date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {dayPeriods.length} {dayPeriods.length === 1 ? "período" : "períodos"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {isBestDay && (
                      <Badge className="mb-1 bg-green-600">Melhor dia</Badge>
                    )}
                    {isWorstDay && <Badge variant="destructive" className="mb-1">Abaixo da média</Badge>}
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(dayTotal)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatHours(dayHours)} • {formatCurrency(dayHourlyRate)}/h
                    </div>
                  </div>
                </div>

                {/* Períodos do Dia */}
                <div className="space-y-2">
                  {dayPeriods.map((period) => {
                    const periodHourlyRate = period.hours > 0 ? period.netProfit / period.hours : 0;
                    return (
                      <div
                        key={period.id}
                        className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {formatTime(new Date(period.startTime))} -{" "}
                              {formatTime(new Date(period.endTime))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({formatHours(period.hours)})
                            </span>
                          </div>
                          {period.project && (
                            <div className="mb-1 text-xs text-muted-foreground">
                              {period.project.clientName}
                              {period.project.projectName && ` - ${period.project.projectName}`}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-medium">{formatCurrency(period.amount)}</span>
                            </div>
                            {period.expenses > 0 && (
                              <span className="text-muted-foreground">
                                -{formatCurrency(period.expenses)}
                              </span>
                            )}
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              = {formatCurrency(period.netProfit)}
                            </span>
                            <span className="text-muted-foreground">
                              ({formatCurrency(periodHourlyRate)}/h)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(period)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(period.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir período?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


