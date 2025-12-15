/**
 * ScheduledPaymentsCard - Card exibindo pagamentos agendados
 * 
 * Props:
 * - payments: Array de pagamentos agendados
 * - maxItems: Número máximo de itens a exibir (padrão: 4)
 * 
 * Funcionalidades:
 * - Lista pagamentos ordenados por data de vencimento
 * - Destaque para vencimentos próximos (próximos 7 dias)
 * - Link para ver todas as assinaturas
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ScheduledPayment } from "@/src/types/dashboard";
import { formatCurrency, formatDate, daysUntil } from "@/src/lib/utils";

interface ScheduledPaymentsCardProps {
  payments: ScheduledPayment[];
  maxItems?: number;
}

export function ScheduledPaymentsCard({
  payments,
  maxItems = 4,
}: ScheduledPaymentsCardProps) {
  const displayPayments = payments
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    })
    .slice(0, maxItems);

  const getPaymentStatus = (dueDate: string) => {
    const days = daysUntil(dueDate);
    if (days < 0) return "overdue";
    if (days <= 7) return "soon";
    return "upcoming";
  };

  return (
    <Card role="region" aria-label="Pagamentos agendados">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Pagamentos Agendados
          </CardTitle>
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link href="/subscription">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayPayments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum pagamento agendado
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/subscription?action=add">
                Adicionar assinatura
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayPayments.map((payment) => {
              const status = getPaymentStatus(payment.dueDate);
              const days = daysUntil(payment.dueDate);
              const isUrgent = status === "soon" || status === "overdue";

              return (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    isUrgent
                      ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {payment.logoUrl ? (
                      <img
                        src={payment.logoUrl}
                        alt={payment.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {payment.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm">
                        {payment.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.dueDate)}
                        </p>
                        {isUrgent && (
                          <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-3 w-3" />
                            {status === "overdue"
                              ? "Vencido"
                              : `${days} dia${days !== 1 ? "s" : ""}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-semibold text-sm shrink-0 ml-2">
                    {formatCurrency(payment.value)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

