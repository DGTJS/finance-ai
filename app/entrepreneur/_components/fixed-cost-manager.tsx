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
import { formatCurrency } from "./utils";

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

interface FixedCostManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FixedCostManager({
  isOpen,
  onClose,
}: FixedCostManagerProps) {
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
  }, [isOpen]);

  const loadFixedCosts = async () => {
    setIsLoading(true);
    try {
      const result = await getFixedCosts();
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
      const costIsUnique = cost.frequency === "ONCE" || cost.isFixed === false;
      setIsUniqueCost(costIsUnique);
      setFormData({
        name: cost.name,
        amount: cost.amount,
        frequency: cost.frequency === "ONCE" ? "DAILY" : cost.frequency, // Mostrar DAILY no select se for ONCE
        isFixed: cost.isFixed,
        description: cost.description || "",
        isActive: cost.isActive,
      });
    } else {
      setEditingCost(null);
      setIsUniqueCost(false);
      setFormData({
        name: "",
        amount: 0,
        frequency: "DAILY",
        isFixed: true,
        description: "",
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCost(null);
    setIsUniqueCost(false);
    isSubmittingRef.current = false; // Resetar ref ao fechar formulário
    setFormData({
      name: "",
      amount: 0,
      frequency: "DAILY",
      isFixed: true,
      description: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[FORM SUBMIT] Iniciado", {
      isSubmittingRef: isSubmittingRef.current,
      isLoading,
      timestamp: new Date().toISOString(),
    });

    // Prevenir duplo submit usando ref (mais confiável que state)
    if (isSubmittingRef.current || isLoading) {
      console.log("[FORM SUBMIT] Bloqueado - já está submetendo");
      return;
    }

    // Validação
    if (!formData.name || formData.name.trim() === "") {
      toast.error("Por favor, informe o nome do custo fixo");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Por favor, informe um valor maior que zero");
      return;
    }

    // Marcar como submetendo ANTES de qualquer async
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      // Preparar dados para envio
      // Se isUniqueCost for true, usar frequency = "ONCE"
      const finalFrequency = isUniqueCost ? "ONCE" : formData.frequency;
      const finalIsFixed = isUniqueCost ? false : true;

      const dataToSend: FixedCostInput = {
        name: formData.name.trim(),
        amount: formData.amount,
        frequency: finalFrequency as "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE",
        isFixed: finalIsFixed,
        description: formData.description?.trim() || undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      console.log("[FORM SUBMIT] Complete form state:", {
        formDataRaw: formData,
        isUniqueCost,
        finalFrequency,
        finalIsFixed,
        dataToSend,
      });

      let result;
      if (editingCost) {
        result = await updateFixedCost(editingCost.id, dataToSend);
      } else {
        result = await createFixedCost(dataToSend);
      }

      if (result.success) {
        toast.success(
          editingCost
            ? "Custo atualizado com sucesso!"
            : "Custo criado com sucesso!",
        );
        handleCloseForm();
        loadFixedCosts();
        // Disparar evento para atualizar o gráfico
        window.dispatchEvent(new CustomEvent("fixedCostsUpdated"));
      } else {
        console.error("[FORM SUBMIT] Erro do servidor:", result.error);
        toast.error(result.error || "Erro ao salvar custo fixo");
      }
    } catch (error: any) {
      console.error("[FORM SUBMIT] Exceção capturada:", {
        error,
        message: error?.message,
        stack: error?.stack,
      });
      toast.error(
        `Erro ao salvar custo fixo: ${error?.message || "Erro desconhecido"}`,
      );
    } finally {
      setIsLoading(false);
      // Resetar ref após um pequeno delay para evitar race conditions
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este custo?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteFixedCost(id);
      if (result.success) {
        toast.success("Custo excluído com sucesso!");
        loadFixedCosts();
        // Disparar evento para atualizar o gráfico
        window.dispatchEvent(new CustomEvent("fixedCostsUpdated"));
      } else {
        toast.error(result.error || "Erro ao excluir custo");
      }
    } catch (error) {
      toast.error("Erro ao excluir custo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (cost: FixedCost) => {
    setIsLoading(true);
    try {
      const result = await updateFixedCost(cost.id, {
        isActive: !cost.isActive,
      });
      if (result.success) {
        toast.success(cost.isActive ? "Custo desativado" : "Custo ativado");
        loadFixedCosts();
        // Disparar evento para atualizar o gráfico
        window.dispatchEvent(new CustomEvent("fixedCostsUpdated"));
      } else {
        toast.error(result.error || "Erro ao atualizar custo");
      }
    } catch (error) {
      toast.error("Erro ao atualizar custo");
    } finally {
      setIsLoading(false);
    }
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
              Gerenciar Custos
            </DialogTitle>
            <DialogDescription>
              Configure seus custos (fixos ou únicos) que serão aplicados aos
              períodos de trabalho.
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
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-semibold">{cost.name}</h4>
                          {!cost.isActive && (
                            <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
                              Inativo
                            </span>
                          )}
                          {(cost.frequency === "ONCE" || !cost.isFixed) && (
                            <span className="text-muted-foreground rounded-full bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900/30">
                              Único
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground space-y-1 text-sm">
                          <p>
                            <span className="font-medium">
                              {formatCurrency(cost.amount)}
                            </span>
                            {cost.frequency === "ONCE" || !cost.isFixed ? (
                              <> (aplicado uma vez)</>
                            ) : (
                              <> / {getFrequencyLabel(cost.frequency)}</>
                            )}
                          </p>
                          {cost.description && (
                            <p className="text-xs">{cost.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(cost)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          {cost.isActive ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(cost)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cost.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? "Editar Custo" : "Novo Custo"}
            </DialogTitle>
            <DialogDescription>
              {editingCost
                ? "Atualize as informações do custo."
                : "Configure um novo custo que será aplicado aos períodos de trabalho."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Custo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Taxa da plataforma, Aluguel do escritório"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <MoneyInput
                id="amount"
                value={formData.amount > 0 ? formData.amount.toString() : ""}
                onValueChange={(value) => {
                  // O MoneyInput retorna string no formato "1234.56" (ponto como separador decimal)
                  const numValue = value
                    ? parseFloat(value.replace(/[^\d.-]/g, "")) || 0
                    : 0;
                  setFormData({ ...formData, amount: numValue });
                }}
                placeholder="R$ 0,00"
                required
              />
              {formData.amount <= 0 && (
                <p className="text-muted-foreground text-xs text-red-500">
                  O valor deve ser maior que zero
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isFixed">Tipo de Custo</Label>
              <Select
                value={isUniqueCost ? "unique" : "fixed"}
                onValueChange={(value) => {
                  const newIsUnique = value === "unique";
                  setIsUniqueCost(newIsUnique);
                  setFormData({
                    ...formData,
                    isFixed: !newIsUnique,
                    // Se mudar para custo único, resetar frequency para DAILY (não será usado)
                    frequency: newIsUnique ? "DAILY" : formData.frequency,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">
                    Custo Fixo (acumula ao longo do tempo)
                  </SelectItem>
                  <SelectItem value="unique">
                    Custo Único (aplicado apenas uma vez)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {!isUniqueCost
                  ? "O custo será acumulado ao longo do tempo conforme a frequência."
                  : "O custo será aplicado apenas uma vez, independente da frequência."}
              </p>
            </div>

            {!isUniqueCost && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: "DAILY" | "WEEKLY" | "MONTHLY") =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {formData.frequency === "DAILY" &&
                    "O valor será aplicado todos os dias."}
                  {formData.frequency === "WEEKLY" &&
                    "O valor será dividido pelos 7 dias da semana."}
                  {formData.frequency === "MONTHLY" &&
                    "O valor será dividido pelos dias do mês."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Adicione uma descrição ou observação..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Salvando..."
                  : editingCost
                    ? "Atualizar"
                    : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
