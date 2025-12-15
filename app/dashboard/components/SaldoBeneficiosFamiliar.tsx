/**
 * SaldoBeneficiosFamiliar - Card mostrando saldo de benefícios do mês (familiar)
 *
 * Exibe:
 * - Total familiar de benefícios
 * - Quebra por usuário com lista de benefícios
 * - Exemplo: Diego: 255, Raissa: 140 + 180 + 150
 * - Total: 725
 *
 * Benefícios NÃO se misturam com dinheiro comum
 * Benefícios são renovados mensalmente
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { FamilyBenefitsBalance } from "@/src/types/dashboard";
import { Gift, Users } from "lucide-react";

interface SaldoBeneficiosFamiliarProps {
  benefitsBalance: FamilyBenefitsBalance;
}

export function SaldoBeneficiosFamiliar({
  benefitsBalance,
}: SaldoBeneficiosFamiliarProps) {
  const getBenefitTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      VR: "Vale Refeição",
      VA: "Vale Alimentação",
      VT: "Vale Transporte",
      OUTRO: "Outro",
    };
    return labels[type] || type;
  };

  return (
    <Card className="border-2 shadow-xl">
      {/* Mobile: Layout compacto moderno */}
      <div className="lg:hidden">
        <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4">
          <div className="mb-3">
            <p className="text-muted-foreground mb-1 text-xs">
              Benefícios do Mês (Família)
            </p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {formatCurrency(benefitsBalance.available)}
            </p>
            <div className="mt-2 flex items-center gap-3 text-[10px]">
              <span className="font-semibold text-green-600 dark:text-green-400">
                Disp: {formatCurrency(benefitsBalance.available)}
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                Usado: {formatCurrency(benefitsBalance.used)}
              </span>
            </div>
          </div>

          {benefitsBalance.byUser.length === 0 ? (
            <p className="text-muted-foreground py-3 text-center text-[11px]">
              Nenhum benefício cadastrado
            </p>
          ) : (
            <div className="space-y-1.5">
              {benefitsBalance.byUser.map((user) => (
                <div
                  key={user.userId}
                  className="bg-background/80 rounded-lg border p-2.5 backdrop-blur-sm"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 flex-shrink-0 text-purple-600" />
                      <span className="truncate text-xs font-medium">
                        {user.name}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(user.total)}
                    </span>
                  </div>
                  {user.benefits.length > 0 && (
                    <div className="text-muted-foreground ml-5 space-y-0.5 text-[9px]">
                      {user.benefits.slice(0, 2).map((benefit, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate">
                            {getBenefitTypeLabel(benefit.type)}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            {formatCurrency(benefit.value)}
                          </span>
                        </div>
                      ))}
                      {user.benefits.length > 2 && (
                        <div className="text-muted-foreground pt-0.5 text-[8px]">
                          +{user.benefits.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tablet/Desktop: Layout completo */}
      <div className="hidden lg:block">
        <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 to-transparent pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gift className="h-5 w-5 text-purple-600" />
            Saldo de Benefícios do Mês (Família)
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Total de benefícios disponíveis
          </p>
          <div className="mt-2 text-2xl font-bold text-purple-600 sm:text-3xl dark:text-purple-400">
            {formatCurrency(benefitsBalance.available)}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm">
            <span className="text-green-600 dark:text-green-400">
              Disponível: {formatCurrency(benefitsBalance.available)}
            </span>
            <span className="text-red-600 dark:text-red-400">
              Usado: {formatCurrency(benefitsBalance.used)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {benefitsBalance.byUser.length === 0 ? (
            <p className="text-muted-foreground py-3 text-center text-xs sm:py-4 sm:text-sm">
              Nenhum benefício cadastrado
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Quebra por usuário */}
              <div className="space-y-2 sm:space-y-3">
                {benefitsBalance.byUser.map((user) => (
                  <div
                    key={user.userId}
                    className="bg-muted/30 rounded-lg border p-2.5 sm:p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                        <Users className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate text-xs font-medium sm:text-sm">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold whitespace-nowrap sm:text-sm">
                        {formatCurrency(user.total)}
                      </span>
                    </div>
                    {/* Lista de benefícios do usuário */}
                    <div className="ml-5 space-y-0.5 sm:ml-6 sm:space-y-1">
                      {user.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 text-[10px] sm:text-xs"
                        >
                          <span className="text-muted-foreground truncate">
                            {getBenefitTypeLabel(benefit.type)}
                            {benefit.notes && ` (${benefit.notes})`}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            {formatCurrency(benefit.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 p-2 shadow-sm sm:p-3 dark:border-green-800 dark:from-green-950/30 dark:to-green-950/10">
                  <div className="text-muted-foreground mb-0.5 text-[10px] sm:mb-1 sm:text-xs">
                    Disponível
                  </div>
                  <div className="text-sm font-bold text-green-600 sm:text-base md:text-lg dark:text-green-400">
                    {formatCurrency(benefitsBalance.available)}
                  </div>
                </div>
                <div className="rounded-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 p-2 shadow-sm sm:p-3 dark:border-red-800 dark:from-red-950/30 dark:to-red-950/10">
                  <div className="text-muted-foreground mb-0.5 text-[10px] sm:mb-1 sm:text-xs">
                    Usado
                  </div>
                  <div className="text-sm font-bold text-red-600 sm:text-base md:text-lg dark:text-red-400">
                    {formatCurrency(benefitsBalance.used)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
