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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCompanyProduct,
  updateCompanyProduct,
  deleteCompanyProduct,
} from "@/app/_actions/company-product";

interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  margin: number;
  description: string | null;
  isActive: boolean;
}

interface ProductManagerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
  editingProduct?: Product | null;
}

export default function ProductManager({
  isOpen,
  onClose,
  companyId,
  onSuccess,
  editingProduct,
}: ProductManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState(0);
  const [costPrice, setCostPrice] = useState<string>("0");
  const [salePrice, setSalePrice] = useState<string>("0");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setName(editingProduct.name);
        setQuantity(editingProduct.quantity);
        setMinQuantity(editingProduct.minQuantity);
        // Converter número para formato do MoneyInput (multiplicar por 100 para centavos)
        setCostPrice(Math.round(editingProduct.costPrice * 100).toString());
        setSalePrice(Math.round(editingProduct.salePrice * 100).toString());
        setDescription(editingProduct.description || "");
        setIsActive(editingProduct.isActive);
      } else {
        setName("");
        setQuantity(0);
        setMinQuantity(0);
        setCostPrice("0");
        setSalePrice("0");
        setDescription("");
        setIsActive(true);
      }
    }
  }, [isOpen, editingProduct]);

  const calculateMargin = () => {
    // MoneyInput retorna string numérica pura (ex: "96500" para "965,00")
    // Sempre dividir por 100 para converter centavos para reais
    const cost = parseFloat(costPrice) / 100 || 0;
    const sale = parseFloat(salePrice) / 100 || 0;

    if (sale === 0) return 0;

    // Calcular MARGEM DE LUCRO corretamente: ((sale - cost) / sale) * 100
    // Margem nunca pode ser acima de 100%
    // Exemplo: Custo R$ 10, Preço R$ 30 → Margem = ((30-10)/30)*100 = 66,6%
    const margin = ((sale - cost) / sale) * 100;

    // Margem nunca pode ser acima de 100%
    return Math.min(Math.max(margin, 0), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    const cost = parseFloat(costPrice) || 0;
    const sale = parseFloat(salePrice) || 0;

    if (cost < 0 || sale < 0) {
      toast.error("Preços não podem ser negativos");
      return;
    }

    if (quantity < 0 || minQuantity < 0) {
      toast.error("Quantidades não podem ser negativas");
      return;
    }

    setIsSubmitting(true);

    try {
      // Converter valores de string para número
      // MoneyInput retorna string numérica pura (ex: "96500" para "965,00")
      // Sempre dividir por 100 para converter centavos para reais
      const costPriceNum = parseFloat(costPrice) / 100 || 0;
      const salePriceNum = parseFloat(salePrice) / 100 || 0;

      const data = {
        name: name.trim(),
        quantity,
        minQuantity,
        costPrice: costPriceNum,
        salePrice: salePriceNum,
        description: description.trim() || null,
        isActive,
      };

      let result;
      if (editingProduct) {
        result = await updateCompanyProduct(editingProduct.id, companyId, data);
      } else {
        result = await createCompanyProduct(companyId, data);
      }

      if (result.success) {
        toast.success(
          editingProduct
            ? "Produto atualizado com sucesso!"
            : "Produto criado com sucesso!",
        );
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

  const margin = calculateMargin();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Atualize as informações do produto."
              : "Cadastre um novo produto no estoque."}
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade em Estoque *</Label>
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
              <Label htmlFor="minQuantity">Quantidade Mínima *</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-muted-foreground text-xs">
                Alerta será exibido quando estoque estiver abaixo deste valor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo *</Label>
              <MoneyInput
                value={costPrice}
                onValueChange={(value) => setCostPrice(value)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda *</Label>
              <MoneyInput
                value={salePrice}
                onValueChange={(value) => setSalePrice(value)}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {/* Margem calculada */}
          {(() => {
            // MoneyInput sempre retorna string numérica pura (ex: "96500" para "965,00")
            // Sempre dividir por 100 para converter centavos para reais
            const cost = parseFloat(costPrice) / 100 || 0;
            const sale = parseFloat(salePrice) / 100 || 0;
            return cost > 0 && sale > 0;
          })() && (
            <div className="bg-muted rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">Margem de Lucro</p>
              <p
                className={`text-lg font-semibold ${margin >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {margin.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">
                Lucro:{" "}
                {formatCurrency(
                  parseFloat(salePrice) / 100 - parseFloat(costPrice) / 100,
                )}
              </p>
              {margin < 0 && (
                <p className="mt-1 text-xs text-red-600">
                  ⚠️ Preço de venda menor que o custo
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição do produto..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Produto ativo
            </Label>
          </div>

          <DialogFooter>
            {editingProduct && (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (
                    !confirm(
                      "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.",
                    )
                  ) {
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    const result = await deleteCompanyProduct(
                      editingProduct.id,
                      companyId,
                    );
                    if (result.success) {
                      toast.success("Produto excluído com sucesso!");
                      onClose();
                      onSuccess();
                    } else {
                      toast.error(result.error || "Erro ao excluir produto");
                    }
                  } catch (error) {
                    toast.error("Erro ao excluir produto");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
              >
                Excluir
              </Button>
            )}
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
              ) : editingProduct ? (
                "Atualizar"
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
