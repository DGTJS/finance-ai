"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import type { Transaction } from "@/src/types/dashboard";
import { formatCurrency, daysUntil } from "@/src/lib/utils";
import { TRANSACTION_CATEGORY_EMOJIS } from "@/app/_constants/transactions";

interface RecentExpensesCardProps {
  transactions: Transaction[];
  maxItems?: number;
}

export function RecentExpensesCard({
  transactions,
  maxItems = 5,
}: RecentExpensesCardProps) {
  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <Card
      className="flex min-h-[220px] w-full flex-col sm:min-h-0"
      role="region"
      aria-label="Transações recentes"
    >
      <CardHeader className="border-b p-3 pb-2 sm:p-4 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold sm:text-base">
            Transações Recentes
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            asChild
            className="h-auto shrink-0 p-0 text-xs sm:text-sm"
          >
            <Link href="/transactions" className="flex items-center gap-1">
              Ver todas
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        {displayTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Nenhuma transação recente
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs sm:text-sm"
                asChild
              >
                <Link href="/transactions?action=add">Adicionar transação</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {displayTransactions.map((transaction) => {
              const isExpense = transaction.type === "EXPENSE";
              const daysAgo = transaction.date
                ? daysUntil(transaction.date)
                : daysUntil(transaction.createdAt);

              const emoji =
                TRANSACTION_CATEGORY_EMOJIS[transaction.category] || "📦";

              return (
                <div
                  key={transaction.id}
                  className="hover:bg-muted/50 flex items-start gap-2 rounded-lg border p-2 transition-colors sm:items-center sm:gap-3 sm:p-3"
                >
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm sm:h-9 sm:w-9 sm:text-base">
                    {emoji}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium break-words sm:text-sm">
                      {transaction.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
                      {daysAgo === 0
                        ? "Hoje"
                        : daysAgo === 1
                          ? "Ontem"
                          : daysAgo < 0
                            ? `Vencido há ${Math.abs(daysAgo)} dia${
                                Math.abs(daysAgo) !== 1 ? "s" : ""
                              }`
                            : `Há ${daysAgo} dia${daysAgo !== 1 ? "s" : ""}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {isExpense ? (
                      <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    <span
                      className={`text-xs font-semibold sm:text-sm ${
                        isExpense
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(transaction.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
