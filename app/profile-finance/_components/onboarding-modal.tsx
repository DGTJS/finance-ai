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
import { Loader2 } from "lucide-react";
import { FinancialProfileInput, BenefitInput } from "@/app/_actions/financial-profile/schema";
import { IncomeSection } from "./income-section";
import { BenefitsList } from "./benefits-list";
import { PaymentDayPicker } from "./payment-day-picker";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: FinancialProfileInput) => Promise<void>;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rendaFixa, setRendaFixa] = useState(0);
  const [rendaVariavelMedia, setRendaVariavelMedia] = useState(0);
  const [beneficios, setBeneficios] = useState<BenefitInput[]>([]);
  const [diaPagamento, setDiaPagamento] = useState<number | null>(null);
  const [multiplePayments, setMultiplePayments] = useState<any[] | null>(null);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
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
    setIsSubmitting(true);
    try {
      const data: FinancialProfileInput = {
        rendaFixa,
        rendaVariavelMedia,
        beneficios,
        diaPagamento,
        multiplePayments,
      };
      await onComplete(data);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBenefit = async (benefit: BenefitInput) => {
    setBeneficios([...beneficios, benefit]);
    return Promise.resolve();
  };

  const handleEditBenefit = async (index: number, benefit: BenefitInput) => {
    const updated = [...beneficios];
    updated[index] = benefit;
    setBeneficios(updated);
    return Promise.resolve();
  };

  const handleRemoveBenefit = async (index: number) => {
    setBeneficios(beneficios.filter((_, i) => i !== index));
    return Promise.resolve();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return rendaFixa > 0 || rendaVariavelMedia > 0;
      case 2:
        return true; // Benefícios são opcionais
      case 3:
        return diaPagamento !== null || (multiplePayments && multiplePayments.length > 0);
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bem-vindo ao Perfil Financeiro!</DialogTitle>
          <DialogDescription>
            Configure seu perfil em 3 passos simples para obter insights personalizados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicador de progresso */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Passo 1: Renda */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Passo 1: Informe sua Renda</h3>
              <IncomeSection
                rendaFixa={rendaFixa}
                rendaVariavelMedia={rendaVariavelMedia}
                onRendaFixaChange={setRendaFixa}
                onRendaVariavelChange={setRendaVariavelMedia}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Passo 2: Benefícios */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Passo 2: Adicione seus Benefícios (Opcional)</h3>
              <BenefitsList
                beneficios={beneficios}
                onAdd={handleAddBenefit}
                onEdit={handleEditBenefit}
                onRemove={handleRemoveBenefit}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Passo 3: Dia de Pagamento */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Passo 3: Defina seu Dia de Pagamento</h3>
              <PaymentDayPicker
                diaPagamento={diaPagamento}
                multiplePayments={multiplePayments}
                onDiaPagamentoChange={setDiaPagamento}
                onMultiplePaymentsChange={setMultiplePayments}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? "Pular" : "Voltar"}
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === 3 ? "Finalizar" : "Próximo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

