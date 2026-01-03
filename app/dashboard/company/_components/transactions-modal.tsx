"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  name?: string;
  origin?: string;
  amount: number;
  date: Date | string;
  description?: string;
  category?: string;
  type: "revenue" | "cost";
}

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenues: Transaction[];
  costs: Transaction[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function TransactionsModal({
  isOpen,
  onClose,
  revenues,
  costs,
}: TransactionsModalProps) {
  // Combinar e ordenar todas as transações por data (mais recente primeiro)
  const allTransactions = [
    ...revenues.map((r) => ({ ...r, type: "revenue" as const })),
    ...costs.map((c) => ({ ...c, type: "cost" as const })),
  ].sort((a, b) => {
    try {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;

      // Se alguma data for inválida, colocar no final
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      return dateB - dateA;
    } catch (error) {
      console.error("Erro ao ordenar transações:", error, a, b);
      return 0;
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Todas as Transações</DialogTitle>
          <DialogDescription>Receitas e despesas da empresa</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {allTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Nenhuma transação registrada
                </p>
              </div>
            ) : (
              allTransactions.map((transaction) => {
                // Validar e formatar data
                let formattedDate = "Data inválida";
                try {
                  if (transaction.date) {
                    const dateObj = new Date(transaction.date);
                    if (!isNaN(dateObj.getTime())) {
                      formattedDate = format(dateObj, "dd/MM/yyyy", {
                        locale: ptBR,
                      });
                    }
                  }
                } catch (error) {
                  console.error("Erro ao formatar data:", error, transaction);
                }

                return (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className="hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-lg">
                          {transaction.type === "revenue" ? "🛒" : "📦"}
                        </span>
                        <p className="truncate text-sm font-medium">
                          {transaction.type === "revenue"
                            ? transaction.origin || "Receita"
                            : transaction.name ||
                              transaction.description ||
                              "Despesa"}
                        </p>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span>{formattedDate}</span>
                        {transaction.type === "cost" &&
                          transaction.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {transaction.description}
                              </span>
                            </>
                          )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === "revenue"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "revenue" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
