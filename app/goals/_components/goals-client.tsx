"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import GoalCard from "./goal-card";
import UpsertGoalDialog from "./upsert-goal-dialog";
import { deleteGoal } from "@/app/_actions/goal";
import { toast } from "sonner";
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

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  status: string;
  icon: string | null;
  color: string | null;
  isShared?: boolean;
  sharedWith?: string[] | null;
  contributions?: Array<{
    userId: string;
    amount: number;
    date: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalsClientProps {
  initialGoals: Goal[];
}

export default function GoalsClient({ initialGoals }: GoalsClientProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Atualizar goals quando initialGoals mudar (após refresh)
  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setSelectedGoal(goal);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteGoal(deleteId);

      if (result.success) {
        setGoals((prev) => prev.filter((g) => g.id !== deleteId));
        toast.success("Meta excluída com sucesso!");
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir meta");
      }
    } catch (error) {
      toast.error("Erro ao excluir meta");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = async () => {
    // Atualizar a lista de metas buscando do servidor
    const response = await fetch("/goals", { cache: "no-store" });
    if (response.ok) {
      router.refresh();
    } else {
      router.refresh();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedGoal(undefined);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Pequeno delay para garantir que o estado seja atualizado visualmente
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.refresh();
      // Aguardar um pouco mais para garantir que o refresh foi processado
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success("Metas atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar metas");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Agrupar metas por status
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const otherGoals = goals.filter(
    (g) => g.status !== "ACTIVE" && g.status !== "COMPLETED"
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl">Todas as Metas</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-300 ${
                isRefreshing ? "animate-spin" : "hover:rotate-180"
              }`}
            />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
          <Button
            onClick={() => {
              setSelectedGoal(undefined);
              setIsDialogOpen(true);
            }}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="mb-2 text-lg font-semibold">Nenhuma meta cadastrada</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Comece adicionando suas metas financeiras para acompanhar seu progresso
              e alcançar seus objetivos.
            </p>
            <Button
              onClick={() => {
                setSelectedGoal(undefined);
                setIsDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Primeira Meta
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metas Ativas */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                Metas Ativas ({activeGoals.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Metas Concluídas */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                Metas Concluídas ({completedGoals.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Outras Metas */}
          {otherGoals.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                Outras ({otherGoals.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <UpsertGoalDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        goal={selectedGoal}
        onSuccess={handleSuccess}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser
              desfeita.
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

