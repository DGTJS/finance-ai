/**
 * PróximosVencimentos - Bloco fixo no topo do dashboard
 *
 * Exibe pagamentos próximos de vencer com destaque visual progressivo:
 * - Até 7 dias: atenção
 * - Até 3 dias: crítico
 * - Vencido: destaque máximo
 *
 * Prioriza clareza e leitura rápida (sem gráficos)
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import type { UpcomingPayment } from "@/src/types/dashboard";
import { Calendar } from "lucide-react";

interface ProximosVencimentosProps {
  payments: UpcomingPayment[];
}

export function ProximosVencimentos({ payments }: ProximosVencimentosProps) {
  const getPaymentSeverity = (
    daysUntil: number,
  ): "critical" | "warning" | "upcoming" => {
    if (daysUntil < 0) return "critical"; // Vencido
    if (daysUntil <= 3) return "critical"; // Até 3 dias
    if (daysUntil <= 7) return "warning"; // Até 7 dias
    return "upcoming"; // Mais de 7 dias
  };

  const getSeverityStyles = (severity: "critical" | "warning" | "upcoming") => {
    switch (severity) {
      case "critical":
        return {
          accent: "bg-red-500",
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-50/50 dark:bg-red-950/10",
          border: "border-red-200 dark:border-red-900/50",
        };
      case "warning":
        return {
          accent: "bg-orange-500",
          text: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50/50 dark:bg-orange-950/10",
          border: "border-orange-200 dark:border-orange-900/50",
        };
      default:
        return {
          accent: "bg-blue-500",
          text: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50/50 dark:bg-blue-950/10",
          border: "border-blue-200 dark:border-blue-900/50",
        };
    }
  };

  const getSeverityText = (
    severity: "critical" | "warning" | "upcoming",
    days: number,
  ) => {
    switch (severity) {
      case "critical":
        return days < 0
          ? { text: "VENCIDO", color: "text-red-600 dark:text-red-400" }
          : {
              text: `${days} dia${days !== 1 ? "s" : ""}`,
              color: "text-red-600 dark:text-red-400",
            };
      case "warning":
        return {
          text: `${days} dias`,
          color: "text-orange-600 dark:text-orange-400",
        };
      default:
        return {
          text: `${days} dias`,
          color: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  if (payments.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Próximos Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <p className="text-muted-foreground py-3 text-center text-xs sm:py-4 sm:text-sm">
            Nenhum vencimento próximo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border shadow-lg">
      <CardHeader className="border-b pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold md:text-base lg:text-lg">
          <Calendar className="text-primary h-4 w-4 md:h-5 md:w-5" />
          Próximos Vencimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-3 md:p-4 lg:p-6">
        <div className="flex flex-1 flex-col space-y-2 overflow-y-auto md:space-y-2.5">
          {payments.slice(0, 5).map((payment) => {
            const severity = getPaymentSeverity(payment.daysUntil);
            const severityInfo = getSeverityText(severity, payment.daysUntil);
            const styles = getSeverityStyles(severity);

            return (
              <div
                key={payment.id}
                className={`group relative flex items-center gap-2 rounded-lg border-l-4 ${styles.border} bg-card p-2.5 transition-all duration-200 hover:shadow-sm md:gap-3 md:p-3`}
              >
                {/* Mobile: Layout ultra-compacto */}
                <div className="flex w-full items-center gap-2 md:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold">
                        {payment.name}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-medium ${styles.text}`}
                      >
                        {severityInfo.text}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="text-muted-foreground text-[10px]">
                        {formatDate(payment.dueDate)}
                      </p>
                      <p className="text-xs font-bold">
                        {formatCurrency(payment.value)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tablet/Desktop: Layout compacto */}
                <div className="hidden md:flex md:w-full md:items-center md:justify-between md:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {payment.name}
                      </p>
                      <span
                        className={`shrink-0 text-xs font-medium ${styles.text}`}
                      >
                        {severityInfo.text}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    {formatCurrency(payment.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
