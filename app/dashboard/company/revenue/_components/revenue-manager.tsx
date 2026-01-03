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
import { Textarea } from "@/app/_components/ui/textarea";
import { MoneyInput } from "@/app/_components/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  createCompanyRevenue,
  updateCompanyRevenue,
  deleteCompanyRevenue,
} from "@/app/_actions/company-revenue";
import { cn } from "@/app/_lib/utils";

interface RevenueManagerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
  editingRevenue?: {
    id: string;
    amount: number;
    origin: "Venda" | "Serviço" | "Assinatura";
    paymentMethod: "PIX" | "Cartão" | "Boleto" | "Dinheiro" | "Transferência";
    date: Date;
    description: string | null;
  } | null;
}

export default function RevenueManager({
  isOpen,
  onClose,
  companyId,
  onSuccess,
  editingRevenue,
}: RevenueManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0);
  const [origin, setOrigin] = useState<"Venda" | "Serviço" | "Assinatura">(
    "Venda",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "PIX" | "Cartão" | "Boleto" | "Dinheiro" | "Transferência"
  >("PIX");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingRevenue) {
        setAmount(editingRevenue.amount);
        setOrigin(editingRevenue.origin);
        setPaymentMethod(editingRevenue.paymentMethod);
        setDate(new Date(editingRevenue.date));
        setDescription(editingRevenue.description || "");
      } else {
        setAmount(0);
        setOrigin("Venda");
        setPaymentMethod("PIX");
        setDate(new Date());
        setDescription("");
      }
    }
  }, [isOpen, editingRevenue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        amount,
        origin,
        paymentMethod,
        date,
        description: description.trim() || null,
      };

      let result;
      if (editingRevenue) {
        result = await updateCompanyRevenue(editingRevenue.id, companyId, data);
      } else {
        result = await createCompanyRevenue(companyId, data);
      }

      if (result.success) {
        toast.success(
          editingRevenue
            ? "Receita atualizada com sucesso!"
            : "Receita registrada com sucesso!",
        );
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

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingRevenue ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
          <DialogDescription>
            {editingRevenue
              ? "Atualize as informações da receita."
              : "Registre uma nova receita para sua empresa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <MoneyInput
              id="amount"
              value={amount}
              onChange={(value) => setAmount(value)}
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

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Recebimento *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: any) => setPaymentMethod(value)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              ) : editingRevenue ? (
                "Atualizar"
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
