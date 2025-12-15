"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Edit, Trash2, Clock, DollarSign, TrendingDown } from "lucide-react";
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

interface WorkPeriodListProps {
  periods: WorkPeriod[];
  onEdit: (period: WorkPeriod) => void;
  onDelete: () => void;
}

export default function WorkPeriodList({
  periods,
  onEdit,
  onDelete,
}: WorkPeriodListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkPeriod(deleteId);

      if (result.success) {
        toast.success("Período excluído com sucesso!");
        setDeleteId(null);
        onDelete();
      } else {
        toast.error(result.error || "Erro ao excluir período");
      }
    } catch (error) {
      toast.error("Erro ao excluir período");
    } finally {
      setIsDeleting(false);
    }
  };

  // Agrupar períodos por data
  const groupedPeriods = periods.reduce((acc, period) => {
    const dateKey = formatDate(new Date(period.date));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(period);
    return acc;
  }, {} as Record<string, WorkPeriod[]>);

  // Calcular totais por dia
  const getDayTotals = (dayPeriods: WorkPeriod[]) => {
    const totalHours = dayPeriods.reduce((sum, p) => sum + p.hours, 0);
    const totalAmount = dayPeriods.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = dayPeriods.reduce((sum, p) => sum + Number(p.expenses), 0);
    const totalNetProfit = dayPeriods.reduce((sum, p) => sum + Number(p.netProfit), 0);
    return { totalHours, totalAmount, totalExpenses, totalNetProfit };
  };

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="mb-2 text-lg font-semibold">Nenhum período registrado</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Comece adicionando seus períodos de trabalho para acompanhar seus ganhos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedPeriods)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([dateKey, dayPeriods]) => {
            const totals = getDayTotals(dayPeriods);
            return (
              <Card key={dateKey}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold">{dateKey}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{formatHours(totals.totalHours)}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(totals.totalNetProfit)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="flex items-start justify-between rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatTime(new Date(period.startTime))} - {formatTime(new Date(period.endTime))}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              ({formatHours(period.hours)})
                            </span>
                          </div>

                          {period.project && (
                            <p className="text-muted-foreground mb-1 text-sm">
                              {period.project.clientName}
                              {period.project.projectName && ` - ${period.project.projectName}`}
                            </p>
                          )}

                          {period.description && (
                            <p className="text-muted-foreground mb-2 text-sm">
                              {period.description}
                            </p>
                          )}

                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-medium">{formatCurrency(period.amount)}</span>
                            </div>
                            {period.expenses > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingDown className="h-3 w-3 text-red-600" />
                                <span className="text-red-600">{formatCurrency(period.expenses)}</span>
                              </div>
                            )}
                            <div className="font-medium text-green-600 dark:text-green-400">
                              Lucro: {formatCurrency(period.netProfit)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(period)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(period.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
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

