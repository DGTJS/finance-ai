"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { addGoalAmount } from "@/app/_actions/goal";
import { toast } from "sonner";

interface AddGoalAmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  onSubmit?: (amount: number) => Promise<void>;
}

export default function AddGoalAmountDialog({
  isOpen,
  onClose,
  goalId,
  goalName,
  currentAmount,
  targetAmount,
  onSubmit,
}: AddGoalAmountDialogProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(
      amount.replace(/[^\d,.-]/g, "").replace(",", "."),
    );

    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    setIsLoading(true);
    try {
      // Se onSubmit foi fornecido, usar ele; caso contrário, usar a função padrão
      if (onSubmit) {
        await onSubmit(amountValue);
        setAmount("");
        onClose();
      } else {
        const result = await addGoalAmount(goalId, amountValue);

        if (result.success) {
          toast.success("Valor adicionado à meta com sucesso!");
          setAmount("");
          onClose();
          router.refresh();
        } else {
          toast.error(result.error || "Erro ao adicionar valor");
        }
      }
    } catch (error) {
      toast.error("Erro ao adicionar valor à meta");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = targetAmount - currentAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Valor à Meta</DialogTitle>
          <DialogDescription>
            Adicione um valor ao progresso da meta "{goalName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor a adicionar (R$)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0,00"
              value={amount}
              onChange={(e) => {
                // Permitir apenas números, vírgula e ponto
                const value = e.target.value.replace(/[^\d,.-]/g, "");
                setAmount(value);
              }}
              disabled={isLoading}
            />
            <p className="text-muted-foreground text-xs">
              Restante:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(remaining)}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
