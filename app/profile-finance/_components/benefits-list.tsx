"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { MoneyInput } from "@/app/_components/money-input";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { BenefitInput } from "@/app/_actions/financial-profile/schema";
import { toast } from "sonner";

interface BenefitsListProps {
  beneficios: BenefitInput[];
  onAdd: (benefit: BenefitInput) => Promise<void>;
  onEdit: (index: number, benefit: BenefitInput) => Promise<void>;
  onRemove: (index: number) => Promise<void>;
  disabled?: boolean;
}

const BENEFIT_ICONS: Record<string, string> = {
  VA: "🍱",
  VR: "🥗",
  VT: "🚌",
  OUTRO: "💼",
};

const BENEFIT_LABELS: Record<string, string> = {
  VA: "Vale Alimentação",
  VR: "Vale Refeição",
  VT: "Vale Transporte",
  OUTRO: "Outro",
};

export function BenefitsList({
  beneficios,
  onAdd,
  onEdit,
  onRemove,
  disabled = false,
}: BenefitsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BenefitInput>({
    type: "VA",
    value: 0,
    notes: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setFormData(beneficios[index]);
    } else {
      setEditingIndex(null);
      setFormData({
        type: "VA",
        value: 0,
        notes: "",
        category: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
    setFormData({
      type: "VA",
      value: 0,
      notes: "",
      category: "",
    });
  };

  const handleSubmit = async () => {
    if (formData.value < 0) {
      toast.error("Valor deve ser maior ou igual a zero");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingIndex !== null) {
        await onEdit(editingIndex, formData);
        toast.success("Benefício atualizado com sucesso!");
      } else {
        await onAdd(formData);
        toast.success("Benefício adicionado com sucesso!");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar benefício");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (index: number) => {
    if (confirm("Tem certeza que deseja remover este benefício?")) {
      try {
        await onRemove(index);
        toast.success("Benefício removido com sucesso!");
      } catch (error) {
        toast.error("Erro ao remover benefício");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Benefícios</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenDialog()}
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Benefício
        </Button>
      </div>

      {beneficios.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum benefício cadastrado. Clique em "Adicionar Benefício" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {beneficios.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{BENEFIT_ICONS[benefit.type] || "💼"}</span>
                <div>
                  <p className="font-medium">
                    {BENEFIT_LABELS[benefit.type] || "Outro"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    R$ {benefit.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {benefit.notes && (
                    <p className="text-muted-foreground text-xs">{benefit.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(index)}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Editar Benefício" : "Adicionar Benefício"}
            </DialogTitle>
            <DialogDescription>
              Adicione ou edite um benefício do seu perfil financeiro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="benefit-type">Tipo de Benefício</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as BenefitInput["type"] })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="benefit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VA">🍱 Vale Alimentação</SelectItem>
                  <SelectItem value="VR">🥗 Vale Refeição</SelectItem>
                  <SelectItem value="VT">🚌 Vale Transporte</SelectItem>
                  <SelectItem value="OUTRO">💼 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit-value">Valor</Label>
              <MoneyInput
                value={formData.value.toString()}
                onValueChange={(value) => {
                  const numValue = parseFloat(value) || 0;
                  setFormData({ ...formData, value: numValue });
                }}
                disabled={isSubmitting}
                id="benefit-value"
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit-notes">Observações (Opcional)</Label>
              <Textarea
                id="benefit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isSubmitting}
                placeholder="Ex: Vale refeição da empresa"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit-category">Categoria (Opcional)</Label>
              <Input
                id="benefit-category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isSubmitting}
                placeholder="Ex: Alimentação"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {editingIndex !== null ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

