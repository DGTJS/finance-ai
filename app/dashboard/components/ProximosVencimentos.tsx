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
        <CardHeader className="flex-shrink-0 border-b p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 sm:h-8 sm:w-8">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span>Próximos Vencimentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-3 sm:p-4">
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            Nenhum vencimento próximo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="flex-shrink-0 border-b p-3 sm:p-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 sm:h-8 sm:w-8">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span>Próximos Vencimentos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {payments.slice(0, 4).map((payment) => {
            const severity = getPaymentSeverity(payment.daysUntil);
            const config = getSeverityConfig(severity, payment.daysUntil);
            const Icon = config.icon;

            return (
              <div
                key={payment.id}
                className={`group flex items-center gap-2.5 rounded-lg border-l-4 p-2.5 transition-all hover:shadow-sm ${config.bg} ${config.border}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                >
                  <Icon className={`h-4 w-4 ${config.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold">
                      {payment.name}
                    </p>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${config.text} ${config.bg}`}
                    >
                      {config.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[10px]">
                      {formatDate(payment.dueDate)}
                    </p>
                    <p className="text-sm font-bold">
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
