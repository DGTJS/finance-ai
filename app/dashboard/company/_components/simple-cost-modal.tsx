"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { MoneyInput } from "@/app/_components/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createFixedCost,
  type FixedCostInput,
} from "@/app/_actions/fixed-cost";

interface SimpleCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

export function SimpleCostModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: SimpleCostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAmount("");
      setCategory("Outros");
      setIsRecurring(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do gasto é obrigatório");
      return;
    }

    if (!amount || amount === "") {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    // O NumericFormat com decimalSeparator="," retorna values.value como string numérica pura
    // Se o usuário digita "100,00", retorna "10000" (sem separadores)
    // Com decimalScale={2}, os últimos 2 dígitos são centavos
    // Então "10000" = 100.00 (dividir por 100)
    // Mas se o valor já contém ponto (formatação inesperada), usar diretamente
    let amountValue: number;

    // Verificar se o valor contém ponto decimal
    // Se contém ponto, já está no formato correto (ex: "100.00")
    // Se não contém ponto, é numérico puro e precisa dividir por 100 (ex: "10000")
    if (amount.includes(".")) {
      // Valor já formatado com ponto decimal
      amountValue = parseFloat(amount) || 0;
    } else {
      // Valor numérico puro, dividir por 100 para converter centavos
      amountValue = parseFloat(amount) / 100 || 0;
    }

    if (amountValue <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[SIMPLE COST MODAL] Criando gasto:", {
        companyId,
        name: name.trim(),
        amount: amountValue,
        rawAmount: amount,
        category,
        isRecurring,
        parsed: amount.includes(".") ? "com ponto" : "sem ponto",
      });

      const data: FixedCostInput = {
        name: name.trim(),
        amount: amountValue,
        frequency: isRecurring ? "MONTHLY" : "ONCE",
        isFixed: isRecurring,
        description: category,
        isActive: true,
        entityType: "COMPANY",
        entityId: companyId,
      };

      const result = await createFixedCost(data);

      console.log("[SIMPLE COST MODAL] Resultado:", result);

      if (result.success) {
        toast.success("Gasto registrado com sucesso!");
        onClose();
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar gasto");
      }
    } catch (error) {
      toast.error("Erro ao salvar gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Gasto</DialogTitle>
          <DialogDescription>
            Registre um novo gasto da sua empresa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Gasto *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <MoneyInput
              id="amount"
              value={amount}
              onValueChange={(value) => {
                console.log(
                  "[SIMPLE COST MODAL] MoneyInput onValueChange:",
                  value,
                );
                setAmount(value);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aluguel">Aluguel</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Funcionários">Funcionários</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            <Label
              htmlFor="isRecurring"
              className="cursor-pointer text-sm font-normal"
            >
              É recorrente? (repete todo mês)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
