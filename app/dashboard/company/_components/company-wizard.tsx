"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Checkbox } from "@/app/_components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { createCompany } from "@/app/_actions/company";
import { useCompanyContext } from "@/app/_contexts/company-context";
import { useRouter } from "next/navigation";

interface CompanyWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPANY_TYPES = [
  { value: "MEI", label: "MEI - Microempreendedor Individual" },
  { value: "EIRELI", label: "EIRELI - Empresa Individual" },
  { value: "LTDA", label: "LTDA - Sociedade Limitada" },
  { value: "SA", label: "SA - Sociedade Anônima" },
  { value: "EPP", label: "EPP - Empresa de Pequeno Porte" },
  { value: "OUTRO", label: "Outro" },
];

export function CompanyWizard({ isOpen, onClose }: CompanyWizardProps) {
  const router = useRouter();
  const { setCompany } = useCompanyContext();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [hasStock, setHasStock] = useState(false);
  const [hasEmployees, setHasEmployees] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      // Validar passo 1
      if (!name.trim() || !companyType) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Validar antes de submeter
    if (!name.trim() || !companyType) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[WIZARD] Criando empresa com dados:", {
        name: name.trim(),
        companyType,
        hasStock,
      });

      const result = await createCompany({
        name: name.trim(),
        companyType,
        hasStock,
      });

      console.log("[WIZARD] Resultado da criação:", result);

      if (result.success && result.data) {
        // Atualizar contexto
        setCompany(result.data);

        toast.success("Empresa criada com sucesso!");

        // Limpar formulário
        setName("");
        setCompanyType("");
        setHasStock(false);
        setHasEmployees(false);
        setStep(1);

        // Fechar wizard
        onClose();

        // Redirecionar para /dashboard/company
        router.push("/dashboard/company");
        router.refresh();
      } else {
        console.error("[WIZARD] Erro ao criar empresa:", result.error);
        toast.error(result.error || "Erro ao criar empresa");
      }
    } catch (error) {
      console.error("[WIZARD] Erro ao criar empresa:", error);
      toast.error("Erro ao criar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return name.trim().length > 0 && companyType.length > 0;
    }
    return true; // Passo 2 não tem campos obrigatórios
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Não permitir fechar o wizard se estiver no meio do processo
      // O wizard só pode ser fechado após criar a empresa ou cancelar no primeiro passo
      if (step === 1) {
        setName("");
        setCompanyType("");
        setHasStock(false);
        setHasEmployees(false);
        setStep(1);
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Só permitir fechar se não estiver submetendo e estiver no passo 1
        if (!open && !isSubmitting && step === 1) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
        onInteractOutside={(e) => {
          // Prevenir fechar clicando fora se estiver no passo 2 ou submetendo
          if (step > 1 || isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Criar Nova Empresa
          </DialogTitle>
          <DialogDescription>
            Configure sua empresa em poucos passos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Indicador de progresso */}
          <div className="flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full ${
                step >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>

          {/* Passo 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Passo 1: Informações Básicas
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Minha Empresa LTDA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType">Tipo da Empresa *</Label>
                <Select
                  value={companyType}
                  onValueChange={setCompanyType}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="companyType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Passo 2: Configurações */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passo 2: Configurações</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasStock"
                    checked={hasStock}
                    onCheckedChange={(checked) => setHasStock(checked === true)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="hasStock"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Possui controle de estoque
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEmployees"
                    checked={hasEmployees}
                    onCheckedChange={(checked) =>
                      setHasEmployees(checked === true)
                    }
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="hasEmployees"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Possui funcionários
                  </Label>
                </div>

                <p className="text-muted-foreground text-sm">
                  Essas configurações podem ser alteradas depois.
                </p>
              </div>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === 2 ? "Criar Empresa" : "Próximo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
