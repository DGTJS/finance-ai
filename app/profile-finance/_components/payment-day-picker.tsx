"use client";

import { useState } from "react";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { MoneyInput } from "@/app/_components/money-input";
import { Plus, Trash2 } from "lucide-react";
import { PaymentInput } from "@/app/_actions/financial-profile/schema";

interface PaymentDayPickerProps {
  diaPagamento: number | null;
  multiplePayments: PaymentInput[] | null;
  onDiaPagamentoChange: (day: number | null) => void;
  onMultiplePaymentsChange: (payments: PaymentInput[] | null) => void;
  disabled?: boolean;
}

export function PaymentDayPicker({
  diaPagamento,
  multiplePayments,
  onDiaPagamentoChange,
  onMultiplePaymentsChange,
  disabled = false,
}: PaymentDayPickerProps) {
  const [paymentMode, setPaymentMode] = useState<"single" | "multiple">(
    multiplePayments && multiplePayments.length > 0 ? "multiple" : "single"
  );

  const handleModeChange = (mode: "single" | "multiple") => {
    setPaymentMode(mode);
    if (mode === "single") {
      onMultiplePaymentsChange(null);
    } else {
      onDiaPagamentoChange(null);
      if (!multiplePayments || multiplePayments.length === 0) {
        onMultiplePaymentsChange([
          { label: "Salário", day: 5, value: 0 },
        ]);
      }
    }
  };

  const handleAddPayment = () => {
    const current = multiplePayments || [];
    onMultiplePaymentsChange([
      ...current,
      { label: "", day: 5, value: 0 },
    ]);
  };

  const handleRemovePayment = (index: number) => {
    const current = multiplePayments || [];
    const updated = current.filter((_, i) => i !== index);
    onMultiplePaymentsChange(updated.length > 0 ? updated : null);
  };

  const handleUpdatePayment = (index: number, field: keyof PaymentInput, value: string | number) => {
    const current = multiplePayments || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    onMultiplePaymentsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Modo de Pagamento</Label>
        <Select
          value={paymentMode}
          onValueChange={(value) => handleModeChange(value as "single" | "multiple")}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Dia Único</SelectItem>
            <SelectItem value="multiple">Múltiplos Pagamentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMode === "single" ? (
        <div className="space-y-2">
          <Label htmlFor="dia-pagamento">Dia de Pagamento</Label>
          <Select
            value={diaPagamento?.toString() || ""}
            onValueChange={(value) =>
              onDiaPagamentoChange(value ? parseInt(value) : null)
            }
            disabled={disabled}
          >
            <SelectTrigger id="dia-pagamento">
              <SelectValue placeholder="Selecione o dia" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  Dia {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Dia do mês em que você recebe seu pagamento principal
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Múltiplos Pagamentos</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPayment}
              disabled={disabled}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {multiplePayments && multiplePayments.length > 0 ? (
            <div className="space-y-3">
              {multiplePayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`payment-label-${index}`}>Descrição</Label>
                    <Input
                      id={`payment-label-${index}`}
                      value={payment.label}
                      onChange={(e) =>
                        handleUpdatePayment(index, "label", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="Ex: Salário"
                    />
                  </div>
                  <div className="w-full space-y-2 sm:w-24">
                    <Label htmlFor={`payment-day-${index}`}>Dia</Label>
                    <Select
                      value={payment.day.toString()}
                      onValueChange={(value) =>
                        handleUpdatePayment(index, "day", parseInt(value))
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger id={`payment-day-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full space-y-2 sm:w-32">
                    <Label htmlFor={`payment-value-${index}`}>Valor</Label>
                    <MoneyInput
                      value={payment.value.toString()}
                      onValueChange={(value) => {
                        const numValue = parseFloat(value) || 0;
                        handleUpdatePayment(index, "value", numValue);
                      }}
                      disabled={disabled}
                      id={`payment-value-${index}`}
                      placeholder="0,00"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePayment(index)}
                    disabled={disabled || multiplePayments.length === 1}
                    className="h-10 w-10 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum pagamento configurado. Clique em "Adicionar" para começar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

