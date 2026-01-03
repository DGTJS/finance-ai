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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCompanyProduct } from "@/app/_actions/company-product";

interface SimpleProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

export function SimpleProductModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: SimpleProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setQuantity(0);
      setCostPrice("");
      setSalePrice("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    // O NumericFormat retorna values.value como string numérica pura (sem separadores)
    // Com decimalScale={2}, "123456" significa 1234.56 (últimos 2 dígitos são centavos)
    const costPriceValue = costPrice ? parseFloat(costPrice) / 100 : 0;
    const salePriceValue = salePrice ? parseFloat(salePrice) / 100 : 0;

    if (costPriceValue < 0 || salePriceValue < 0) {
      toast.error("Preços não podem ser negativos");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCompanyProduct(companyId, {
        name: name.trim(),
        quantity,
        minQuantity: 0,
        costPrice: costPriceValue,
        salePrice: salePriceValue,
        description: null,
        isActive: true,
      });

      if (result.success) {
        toast.success("Produto cadastrado com sucesso!");
        onClose();
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar produto");
      }
    } catch (error) {
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto no seu estoque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Notebook Dell"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Custo *</Label>
            <MoneyInput
              id="costPrice"
              value={costPrice}
              onValueChange={(value) => setCostPrice(value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Preço de Venda *</Label>
            <MoneyInput
              id="salePrice"
              value={salePrice}
              onValueChange={(value) => setSalePrice(value)}
              required
            />
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
