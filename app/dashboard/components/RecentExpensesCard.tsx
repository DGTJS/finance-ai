/**
 * RecentExpensesCard - Card exibindo transações recentes
 *
 * Props:
 * - transactions: Array de transações recentes
 * - maxItems: Número máximo de itens a exibir (padrão: 5)
 *
 * Funcionalidades:
 * - Lista transações com ícones e valores
 * - Link para ver todas as transações
 * - Exibe data relativa (há X dias)
 */

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
import { formatCurrency, formatDate, daysUntil } from "@/src/lib/utils";
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
    <Card role="region" aria-label="Transações recentes">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Transações Recentes
          </CardTitle>
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link href="/transactions">
              Ver todas
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma transação recente
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/transactions?action=add">Adicionar transação</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full text-lg">
                    {emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {transaction.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {daysAgo === 0
                        ? "Hoje"
                        : daysAgo === 1
                          ? "Ontem"
                          : `Há ${daysAgo} dias`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpense ? (
                      <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
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
