"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash2, Clock, DollarSign } from "lucide-react";
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

interface MinimalTimelineProps {
  periods: WorkPeriod[];
  onEdit: (period: WorkPeriod) => void;
  onDelete: () => void;
}

export default function MinimalTimeline({
  periods,
  onEdit,
  onDelete,
}: MinimalTimelineProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

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

  // Agrupar por data
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

  const toggleDate = (dateKey: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDates(newExpanded);
  };

  if (periods.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Nenhum período registrado ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {sortedDates.map((dateKey) => {
          const dayPeriods = groupedPeriods[dateKey];
          const isExpanded = expandedDates.has(dateKey);
          const date = new Date(dateKey);
          const dayTotal = dayPeriods.reduce((sum, p) => sum + Number(p.netProfit), 0);
          const dayHours = dayPeriods.reduce((sum, p) => sum + p.hours, 0);

          return (
            <div key={dateKey} className="rounded-lg border bg-card">
              {/* Header do Dia - Sempre Visível */}
              <button
                onClick={() => toggleDate(dateKey)}
                className="w-full p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {date.getDate()}
                    </div>
                    <div>
                      <div className="font-semibold">{formatDate(date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {dayPeriods.length} {dayPeriods.length === 1 ? "período" : "períodos"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(dayTotal)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatHours(dayHours)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {/* Períodos do Dia - Expandível */}
              {isExpanded && (
                <div className="border-t bg-muted/20">
                  <div className="divide-y">
                    {dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir período?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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


