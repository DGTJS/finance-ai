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
import { createCompanyRevenue } from "@/app/_actions/company-revenue";

interface SimpleRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

export function SimpleRevenueModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: SimpleRevenueModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [origin, setOrigin] = useState<"Venda" | "Serviço" | "Assinatura">(
    "Venda",
  );

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setOrigin("Venda");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount === "") {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    // O NumericFormat com decimalSeparator="," retorna values.value como string numérica pura
    // Se o usuário digita "324,00", retorna "32400" (sem separadores)
    // Com decimalScale={2}, os últimos 2 dígitos são centavos
    // Então "32400" = 324.00 (dividir por 100)
    // Mas se o valor já contém ponto (formatação inesperada), usar diretamente
    let amountValue: number;

    if (amount.includes(".")) {
      // Valor já formatado com ponto decimal (formato inesperado, mas tratamos)
      amountValue = parseFloat(amount) || 0;
    } else {
      // Valor numérico puro (formato esperado), dividir por 100
      amountValue = parseFloat(amount) / 100 || 0;
    }

    if (amountValue <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[SIMPLE REVENUE MODAL] Criando receita:", {
        companyId,
        amount: amountValue,
        origin,
        rawAmount: amount,
        parsed: amount.includes(".") ? "com ponto" : "sem ponto",
      });

      const result = await createCompanyRevenue(companyId, {
        amount: amountValue,
        origin,
        paymentMethod: "PIX",
        date: new Date(),
        description: null,
      });

      console.log("[SIMPLE REVENUE MODAL] Resultado:", result);

      if (result.success) {
        toast.success("Receita registrada com sucesso!");
        onClose();
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar receita");
      }
    } catch (error) {
      toast.error("Erro ao salvar receita");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Receita</DialogTitle>
          <DialogDescription>
            Registre uma nova entrada para sua empresa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <MoneyInput
              id="amount"
              value={amount}
              onValueChange={(value) => {
                console.log(
                  "[SIMPLE REVENUE MODAL] MoneyInput onValueChange:",
                  value,
                );
                setAmount(value);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Origem *</Label>
            <Select
              value={origin}
              onValueChange={(value: any) => setOrigin(value)}
            >
              <SelectTrigger id="origin">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Venda">Venda</SelectItem>
                <SelectItem value="Serviço">Serviço</SelectItem>
                <SelectItem value="Assinatura">Assinatura</SelectItem>
              </SelectContent>
            </Select>
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
