"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
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
import { Plus, Trash2, Edit, Check, X, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  getFixedCosts,
  createFixedCost,
  updateFixedCost,
  deleteFixedCost,
  type FixedCostInput,
} from "@/app/_actions/fixed-cost";

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
  isFixed: boolean;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyFixedCostManagerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export default function CompanyFixedCostManager({
  isOpen,
  onClose,
  companyId,
}: CompanyFixedCostManagerProps) {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);
  const [formData, setFormData] = useState<
    FixedCostInput & { isFixed?: boolean }
  >({
    name: "",
    amount: 0,
    frequency: "DAILY",
    isFixed: true,
    description: "",
    isActive: true,
    entityType: "COMPANY",
    entityId: companyId,
  });

  // Estado para controlar se é custo único (independente do campo isFixed)
  const [isUniqueCost, setIsUniqueCost] = useState(false);

  // Ref para prevenir duplo submit
  const isSubmittingRef = useRef(false);

  // Carregar custos fixos
  useEffect(() => {
    if (isOpen) {
      loadFixedCosts();
    }
  }, [isOpen, companyId]);

  const loadFixedCosts = async () => {
    setIsLoading(true);
    try {
      const result = await getFixedCosts("COMPANY", companyId);
      if (result.success && result.data) {
        // Mapear os dados e garantir que isFixed existe (valores antigos serão tratados como true)
        setFixedCosts(
          result.data.map((cost: any) => ({
            ...cost,
            isFixed:
              cost.isFixed !== undefined && cost.isFixed !== null
                ? cost.isFixed
                : true,
          })) as FixedCost[],
        );
      } else {
        toast.error(result.error || "Erro ao carregar custos fixos");
      }
    } catch (error) {
      toast.error("Erro ao carregar custos fixos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (cost?: FixedCost) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        name: cost.name,
        amount: cost.amount,
        frequency: cost.frequency,
        isFixed: cost.isFixed,
        description: cost.description || "",
        isActive: cost.isActive,
        entityType: "COMPANY",
        entityId: companyId,
      });
      setIsUniqueCost(cost.frequency === "ONCE" || !cost.isFixed);
    } else {
      setEditingCost(null);
      setFormData({
        name: "",
        amount: 0,
        frequency: "DAILY",
        isFixed: true,
        description: "",
        isActive: true,
        entityType: "COMPANY",
        entityId: companyId,
      });
      setIsUniqueCost(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCost(null);
    setFormData({
      name: "",
      amount: 0,
      frequency: "DAILY",
      isFixed: true,
      description: "",
      isActive: true,
      entityType: "COMPANY",
      entityId: companyId,
    });
    setIsUniqueCost(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Nome do custo é obrigatório");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    isSubmittingRef.current = true;

    try {
      const submitData: FixedCostInput = {
        name: formData.name.trim(),
        amount: formData.amount,
        frequency: isUniqueCost ? "ONCE" : formData.frequency,
        isFixed: !isUniqueCost,
        description: formData.description || undefined,
        isActive: formData.isActive,
        entityType: "COMPANY",
        entityId: companyId,
      };

      let result;
      if (editingCost) {
        result = await updateFixedCost(editingCost.id, submitData);
      } else {
        result = await createFixedCost(submitData);
      }

      if (result.success) {
        toast.success(
          editingCost
            ? "Custo atualizado com sucesso!"
            : "Custo criado com sucesso!",
        );
        handleCloseForm();
        loadFixedCosts();
      } else {
        toast.error(result.error || "Erro ao salvar custo");
      }
    } catch (error) {
      toast.error("Erro ao salvar custo");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este custo?")) {
      return;
    }

    try {
      const result = await deleteFixedCost(id);
      if (result.success) {
        toast.success("Custo excluído com sucesso!");
        loadFixedCosts();
      } else {
        toast.error(result.error || "Erro ao excluir custo");
      }
    } catch (error) {
      toast.error("Erro ao excluir custo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "DAILY":
        return "Diário";
      case "WEEKLY":
        return "Semanal";
      case "MONTHLY":
        return "Mensal";
      case "ONCE":
        return "Único";
      default:
        return frequency;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Gerenciar Custos da Empresa
            </DialogTitle>
            <DialogDescription>
              Configure os custos (fixos ou únicos) da sua empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Botão Adicionar */}
            <Button
              onClick={() => handleOpenForm()}
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Adicionar Custo
            </Button>

            {/* Lista de Custos Fixos */}
            {isLoading && fixedCosts.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Carregando...
              </div>
            ) : fixedCosts.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center">
                <p className="mb-2">Nenhum custo cadastrado</p>
                <p className="text-xs">
                  Clique em "Adicionar Custo" para começar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {fixedCosts.map((cost) => (
                  <div
                    key={cost.id}
                    className={`rounded-lg border p-4 ${
                      !cost.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cost.name}</h3>
                          {!cost.isActive && (
                            <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 text-xs">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {formatCurrency(cost.amount)} -{" "}
                          {getFrequencyLabel(cost.frequency)}
                        </p>
                        {cost.description && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {cost.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(cost)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cost.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulário de Custo */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? "Editar Custo" : "Novo Custo"}
            </DialogTitle>
            <DialogDescription>
              {editingCost
                ? "Atualize as informações do custo."
                : "Adicione um novo custo para sua empresa."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Custo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Aluguel do escritório"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <MoneyInput
                id="amount"
                value={formData.amount}
                onChange={(value) =>
                  setFormData({ ...formData, amount: value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costType">Tipo de Custo</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isUniqueCost}
                    onChange={() => {
                      setIsUniqueCost(false);
                      setFormData({ ...formData, frequency: "DAILY" });
                    }}
                  />
                  <span className="text-sm">Custo Fixo (Recorrente)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isUniqueCost}
                    onChange={() => {
                      setIsUniqueCost(true);
                      setFormData({ ...formData, frequency: "ONCE" });
                    }}
                  />
                  <span className="text-sm">Custo Único</span>
                </label>
              </div>
            </div>

            {!isUniqueCost && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Adicione uma descrição..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Custo ativo
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingRef.current}>
                {isSubmittingRef.current ? (
                  <>
                    <span className="mr-2">Salvando...</span>
                  </>
                ) : editingCost ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Atualizar
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
