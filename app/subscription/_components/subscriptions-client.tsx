"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";
import SubscriptionCard from "@/app/_components/subscription/subscription-card";
import UpsertSubscriptionDialog from "@/app/_components/subscription/upsert-subscription-dialog";
import { deleteSubscription } from "@/app/_actions/subscription";
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

interface Subscription {
  id: string;
  name: string;
  logoUrl: string | null;
  amount: number;
  dueDate: Date;
  nextDueDate: Date | null;
  recurring: boolean;
  active: boolean;
}

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[];
}

export default function SubscriptionsClient({
  initialSubscriptions,
}: SubscriptionsClientProps) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(initialSubscriptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<
    Subscription | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (sub) {
      setSelectedSubscription(sub);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteSubscription({ id: deleteId });

      if (result.success) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== deleteId));
        toast.success("Assinatura excluída com sucesso!");
        setDeleteId(null);
        // Forçar atualização dos dados
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir assinatura");
      }
    } catch (error) {
      toast.error("Erro ao excluir assinatura");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = async (newSubscription?: Subscription) => {
    if (newSubscription) {
      // Se for edição, atualizar a assinatura existente
      if (selectedSubscription) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === newSubscription.id ? newSubscription : s)),
        );
      } else {
        // Se for criação, adicionar a nova assinatura
        setSubscriptions((prev) => [...prev, newSubscription]);
      }
    } else {
      // Fallback: buscar assinaturas atualizadas do servidor
      try {
        const { getUserSubscriptions } = await import(
          "@/app/_actions/subscription"
        );
        const result = await getUserSubscriptions();
        if (result.success && result.data) {
          setSubscriptions(result.data);
        }
      } catch (error) {
        console.error("Erro ao atualizar assinaturas:", error);
      }
    }
    // Forçar atualização dos dados do servidor (para estatísticas no topo)
    router.refresh();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubscription(undefined);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl">
          Todas as Assinaturas
        </h2>
        <Button
          onClick={() => {
            setSelectedSubscription(undefined);
            setIsDialogOpen(true);
          }}
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="mb-2 text-lg font-semibold">
              Nenhuma assinatura cadastrada
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Comece adicionando suas assinaturas para acompanhar seus gastos
              recorrentes e receber alertas de vencimento.
            </p>
            <Button
              onClick={() => {
                setSelectedSubscription(undefined);
                setIsDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Primeira Assinatura
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <UpsertSubscriptionDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        subscription={selectedSubscription}
        onSuccess={handleSuccess}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta assinatura? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
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
