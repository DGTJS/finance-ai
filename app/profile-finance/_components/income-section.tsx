"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { MoneyInput } from "@/app/_components/money-input";
import { Label } from "@/app/_components/ui/label";

interface IncomeSectionProps {
  rendaFixa: number;
  rendaVariavelMedia: number;
  onRendaFixaChange: (value: number) => void;
  onRendaVariavelChange: (value: number) => void;
  disabled?: boolean;
}

export function IncomeSection({
  rendaFixa,
  rendaVariavelMedia,
  onRendaFixaChange,
  onRendaVariavelChange,
  disabled = false,
}: IncomeSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="renda-fixa">Renda Fixa</Label>
        <MoneyInput
          value={rendaFixa.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value) || 0;
            onRendaFixaChange(numValue);
          }}
          disabled={disabled}
          id="renda-fixa"
          placeholder="0,00"
        />
        <p className="text-muted-foreground text-xs">
          Valor fixo que você recebe mensalmente (salário, aluguel, etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="renda-variavel">Renda Variável (Média Mensal)</Label>
        <MoneyInput
          value={rendaVariavelMedia.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value) || 0;
            onRendaVariavelChange(numValue);
          }}
          disabled={disabled}
          id="renda-variavel"
          placeholder="0,00"
        />
        <p className="text-muted-foreground text-xs">
          Média mensal de renda variável (comissões, freelances, etc.)
        </p>
      </div>

      <div className="rounded-lg bg-primary/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Renda Total Mensal:</span>
          <span className="text-lg font-bold text-primary">
            R$ {(rendaFixa + rendaVariavelMedia).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}





