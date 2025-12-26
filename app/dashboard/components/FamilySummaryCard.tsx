/**
 * FamilySummaryCard - Card único consolidando Salário, Benefícios e Vencimentos
 * Design minimalista, simples e atraente
 */

"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type {
  FamilySalaryBalance,
  FamilyBenefitsBalance,
  UpcomingPayment,
} from "@/src/types/dashboard";
import { Wallet, Gift, Calendar, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface FamilySummaryCardProps {
  salaryBalance?: FamilySalaryBalance;
  benefitsBalance?: FamilyBenefitsBalance;
  upcomingPayments?: UpcomingPayment[];
}

export function FamilySummaryCard({
  salaryBalance,
  benefitsBalance,
  upcomingPayments,
}: FamilySummaryCardProps) {
  const getPaymentSeverity = (
    daysUntil: number,
  ): "critical" | "warning" | "upcoming" => {
    if (daysUntil < 0) return "critical";
    if (daysUntil <= 3) return "critical";
    if (daysUntil <= 7) return "warning";
    return "upcoming";
  };

  const getSeverityConfig = (
    severity: "critical" | "warning" | "upcoming",
    days: number,
  ) => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-red-600 dark:text-red-400",
          badge: days < 0 ? "Vencido" : `${days}d`,
        };
      case "warning":
        return {
          icon: Clock,
          color: "text-orange-600 dark:text-orange-400",
          badge: `${days}d`,
        };
      default:
        return {
          icon: Calendar,
          color: "text-blue-600 dark:text-blue-400",
          badge: `${days}d`,
        };
    }
  };

  return (
    <Card className="bg-background overflow-hidden border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {/* Vencimentos - Primeiro no mobile, último no desktop */}
          <div className="order-1 space-y-4 sm:order-3 lg:order-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Vencimentos
                </p>
              </div>
              {upcomingPayments && upcomingPayments.length > 0 ? (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-light tracking-tight text-blue-600 dark:text-blue-400">
                    {upcomingPayments.length}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {upcomingPayments.length === 1
                      ? "vencimento"
                      : "vencimentos"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum</p>
              )}
            </div>

            {upcomingPayments && upcomingPayments.length > 0 && (
              <div className="space-y-2.5">
                {upcomingPayments.slice(0, 3).map((payment) => {
                  const severity = getPaymentSeverity(payment.daysUntil);
                  const config = getSeverityConfig(severity, payment.daysUntil);
                  const Icon = config.icon;

                  return (
                    <div
                      key={payment.id}
                      className={cn(
                        "group rounded-lg border p-2.5 transition-all hover:shadow-sm",
                        severity === "critical"
                          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                          : severity === "warning"
                            ? "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20"
                            : "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <Icon
                            className={cn("h-3.5 w-3.5 shrink-0", config.color)}
                          />
                          <p className="truncate text-xs font-medium">
                            {payment.name}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                            config.color,
                            severity === "critical"
                              ? "bg-red-100 dark:bg-red-950/50"
                              : severity === "warning"
                                ? "bg-orange-100 dark:bg-orange-950/50"
                                : "bg-blue-100 dark:bg-blue-950/50",
                          )}
                        >
                          {config.badge}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <p
                          className={cn("text-sm font-semibold", config.color)}
                        >
                          {formatCurrency(payment.value)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {upcomingPayments.length > 3 && (
                  <div className="rounded-lg border border-dashed p-2 text-center">
                    <p className="text-muted-foreground text-[10px] font-medium">
                      +{upcomingPayments.length - 3} mais vencimento
                      {upcomingPayments.length - 3 !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Salário - Segundo no mobile, primeiro no desktop */}
          <div className="order-2 space-y-4 sm:order-1 lg:order-1">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Salário
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-green-600 dark:text-green-400">
                {salaryBalance
                  ? formatCurrency(salaryBalance.total)
                  : "R$ 0,00"}
              </p>
            </div>

            {salaryBalance && salaryBalance.byUser.length > 0 && (
              <div className="space-y-2">
                {salaryBalance.byUser.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <p className="text-muted-foreground truncate text-xs">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(user.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Benefícios - Terceiro no mobile, segundo no desktop */}
          <div className="order-3 space-y-4 sm:order-2 lg:order-2">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Benefícios
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-purple-600 dark:text-purple-400">
                {benefitsBalance
                  ? formatCurrency(benefitsBalance.available)
                  : "R$ 0,00"}
              </p>
            </div>

            {benefitsBalance && benefitsBalance.byUser.length > 0 && (
              <div className="space-y-2">
                {benefitsBalance.byUser.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <p className="text-muted-foreground truncate text-xs">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {formatCurrency(user.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {benefitsBalance && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-600 dark:text-green-400">
                  Disp: {formatCurrency(benefitsBalance.available)}
                </span>
                {benefitsBalance.used > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    Usado: {formatCurrency(benefitsBalance.used)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
