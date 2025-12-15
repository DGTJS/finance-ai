/**
 * SaldoSalarioFamiliar - Card mostrando saldo de salário do mês (familiar)
 *
 * Exibe:
 * - Total familiar do salário
 * - Quebra por usuário (ex: Diego: 1.900, Raissa: 1.000)
 * - Total: 2.900
 *
 * Salário é tratado como saldo mensal renovável
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type { FamilySalaryBalance } from "@/src/types/dashboard";
import { Wallet, Users } from "lucide-react";

interface SaldoSalarioFamiliarProps {
  salaryBalance: FamilySalaryBalance;
}

export function SaldoSalarioFamiliar({
  salaryBalance,
}: SaldoSalarioFamiliarProps) {
  return (
    <Card className="border-2 shadow-xl">
      {/* Mobile: Layout compacto moderno */}
      <div className="lg:hidden">
        <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-4">
          <div className="mb-3">
            <p className="text-muted-foreground mb-1 text-xs">
              Salário do Mês (Família)
            </p>
            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              {formatCurrency(salaryBalance.total)}
            </p>
          </div>

          {salaryBalance.byUser.length === 0 ? (
            <p className="text-muted-foreground py-3 text-center text-[11px]">
              Nenhum salário registrado
            </p>
          ) : (
            <div className="space-y-1.5">
              {salaryBalance.byUser.map((user) => (
                <div
                  key={user.userId}
                  className="bg-background/80 flex items-center justify-between rounded-lg border px-3 py-2 backdrop-blur-sm"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Users className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                    <span className="truncate text-xs font-medium">
                      {user.name}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(user.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tablet/Desktop: Layout completo */}
      <div className="hidden lg:block">
        <CardHeader className="border-b bg-gradient-to-r from-green-500/5 to-transparent pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wallet className="h-5 w-5 text-green-600" />
            Saldo de Salário do Mês (Família)
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Total disponível para o mês
          </p>
          <div className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl dark:text-green-400">
            {formatCurrency(salaryBalance.total)}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {salaryBalance.byUser.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Nenhum salário registrado
            </p>
          ) : (
            <div className="space-y-4">
              {/* Quebra por usuário */}
              <div className="space-y-3">
                {salaryBalance.byUser.map((user) => (
                  <div
                    key={user.userId}
                    className="bg-muted/30 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap">
                      {formatCurrency(user.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total familiar */}
              <div className="mt-4 rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 p-4 shadow-sm dark:border-green-800 dark:from-green-950/30 dark:to-green-950/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold sm:text-base">
                    Total Familiar
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(salaryBalance.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
