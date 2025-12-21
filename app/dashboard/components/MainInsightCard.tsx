/**
 * MainInsightCard - Card principal de insight da IA
 *
 * Props:
 * - insight: Objeto com severidade, mensagem e ações
 * - onActionClick: Callback quando clica em uma ação
 *
 * Funcionalidades:
 * - Exibe insight com cores baseadas na severidade
 * - Botões de ação rápida
 * - Modal para ações que requerem confirmação
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { AlertTriangle, Info, CheckCircle, Sparkles } from "lucide-react";
import type { Insight } from "@/src/types/dashboard";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { executeInsightAction } from "@/src/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MainInsightCardProps {
  insight: Insight;
  onActionClick?: (actionId: string) => void;
}

export function MainInsightCard({
  insight,
  onActionClick,
}: MainInsightCardProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (actionId: string) => executeInsightAction(actionId),
    onSuccess: () => {
      toast.success("Ação executada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSelectedAction(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao executar ação",
      );
    },
  });

  const getSeverityConfig = () => {
    switch (insight.severity) {
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-900",
        };
      case "medium":
        return {
          icon: Info,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-900",
        };
      default:
        return {
          icon: CheckCircle,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-900",
        };
    }
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  const handleActionClick = (actionId: string) => {
    if (onActionClick) {
      onActionClick(actionId);
    } else {
      setSelectedAction(actionId);
    }
  };

  const handleConfirmAction = () => {
    if (selectedAction) {
      mutation.mutate(selectedAction);
    }
  };

  return (
    <>
      <Card
        role="region"
        aria-label="Insight da IA"
        className={`border-2 ${config.borderColor} ${config.bgColor}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2 sm:items-center">
            <div className={`shrink-0 rounded-full p-2 ${config.bgColor}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold sm:text-base">
                <span>Insight da IA</span>
                <Sparkles className="text-primary h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">
                Análise inteligente dos seus dados
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {/* Mensagem */}
            <p className="text-xs leading-relaxed break-words sm:text-sm">
              {insight.message}
            </p>

            {/* Ações */}
            {insight.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insight.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={
                      insight.severity === "high"
                        ? "destructive"
                        : insight.severity === "medium"
                          ? "default"
                          : "outline"
                    }
                    size="sm"
                    onClick={() => handleActionClick(action.id)}
                    aria-label={`Executar ação: ${action.label}`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação */}
      {selectedAction && (
        <Dialog
          open={!!selectedAction}
          onOpenChange={() => setSelectedAction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Ação</DialogTitle>
              <DialogDescription>
                Deseja executar esta ação? Isso pode alterar suas configurações
                financeiras.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Executando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
