/**
 * PróximosVencimentos - Card moderno mostrando próximos vencimentos
 * Design compacto e visualmente atraente
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
import { Calendar, AlertCircle, Clock } from "lucide-react";

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

  const getSeverityConfig = (
    severity: "critical" | "warning" | "upcoming",
    days: number,
  ) => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertCircle,
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900/50",
          text: "text-red-700 dark:text-red-400",
          badge: days < 0 ? "Vencido" : `${days} dia${days !== 1 ? "s" : ""}`,
        };
      case "warning":
        return {
          icon: Clock,
          bg: "bg-orange-50 dark:bg-orange-950/20",
          border: "border-orange-200 dark:border-orange-900/50",
          text: "text-orange-700 dark:text-orange-400",
          badge: `${days} dias`,
        };
      default:
        return {
          icon: Calendar,
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-900/50",
          text: "text-blue-700 dark:text-blue-400",
          badge: `${days} dias`,
        };
    }
  };

  if (payments.length === 0) {
    return (
      <Card className="flex h-full flex-col border shadow-sm">
        <CardHeader className="flex-shrink-0 border-b p-1.5 sm:p-2 md:p-3 lg:p-4">
          <CardTitle className="flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs md:gap-2 md:text-sm lg:text-base">
            <div className="flex h-4 w-4 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8">
              <Calendar className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3 md:h-4 md:w-4" />
            </div>
            <span className="hidden sm:inline">Próximos Vencimentos</span>
            <span className="sm:hidden">Vencimentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-1.5 sm:p-2 md:p-3 lg:p-4">
          <p className="text-muted-foreground text-center text-[8px] sm:text-[9px] md:text-xs lg:text-sm">
            Nenhum vencimento próximo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-1.5 sm:p-2 md:p-3 lg:p-4">
        <CardTitle className="flex items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs md:gap-2 md:text-sm lg:text-base">
          <div className="flex h-4 w-4 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8">
            <Calendar className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3 md:h-4 md:w-4" />
          </div>
          <span className="hidden sm:inline">Próximos Vencimentos</span>
          <span className="sm:hidden">Vencimentos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-1.5 sm:p-2 md:p-3 lg:p-4">
        <div className="flex-1 space-y-1 overflow-y-auto sm:space-y-1.5 md:space-y-2">
          {payments.slice(0, 4).map((payment) => {
            const severity = getPaymentSeverity(payment.daysUntil);
            const config = getSeverityConfig(severity, payment.daysUntil);
            const Icon = config.icon;

            return (
              <div
                key={payment.id}
                className={`group flex items-center gap-1 rounded-lg border-l-2 p-1 transition-all hover:shadow-sm sm:gap-1.5 sm:p-1.5 md:gap-2.5 md:border-l-4 md:p-2.5 ${config.bg} ${config.border}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg sm:h-6 sm:w-6 md:h-8 md:w-8 ${config.bg}`}
                >
                  <Icon
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 ${config.text}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-1 sm:mb-1 sm:gap-1.5 md:gap-2">
                    <p className="truncate text-[8px] font-semibold sm:text-[9px] md:text-xs">
                      {payment.name}
                    </p>
                    <span
                      className={`shrink-0 rounded px-0.5 py-0.5 text-[7px] font-semibold sm:px-1 sm:text-[8px] md:px-1.5 md:text-[10px] ${config.text} ${config.bg}`}
                    >
                      {config.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[7px] sm:text-[8px] md:text-[10px]">
                      {formatDate(payment.dueDate)}
                    </p>
                    <p className="text-[9px] font-bold sm:text-xs md:text-sm">
                      {formatCurrency(payment.value)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
