"use client";

import { Transaction } from "@/app/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import TransactionTypeBadge from "../_components/type-badge";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper para obter primeiro nome
const getFirstName = (name: string | null | undefined, email?: string | null) => {
  if (name) {
    return name.split(" ")[0];
  }
  if (email) {
    return email.split("@")[0];
  }
  return "Usuário";
};

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row: { original: transaction } }) => {
      const creatorName = transaction.createdBy 
        ? getFirstName(transaction.createdBy.name, transaction.createdBy.email)
        : null;
      
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{transaction.name}</span>
            {creatorName && (
              <span className="text-muted-foreground text-xs font-normal">
                • {creatorName}
              </span>
            )}
          </div>
          {transaction.installments && transaction.currentInstallment && (
            <span className="text-xs text-muted-foreground">
              Parcela {transaction.currentInstallment}/{transaction.installments}
              {transaction.currentInstallment === transaction.installments && " (Última)"}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row: { original: transaction } }) => (
      <TransactionTypeBadge transaction={transaction} />
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row: { original: transaction } }) =>
      TRANSACTION_CATEGORY_LABELS[transaction.category],
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    cell: ({ row: { original: transaction } }) => (
      <div className="flex flex-col">
        <span>{TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod]}</span>
        {transaction.bankAccount && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{transaction.bankAccount.icon || "🏦"}</span>
            {transaction.bankAccount.name}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row: { original: transaction } }) =>
      transaction.date
        ? format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })
        : "-",
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row: { original: transaction } }) => {
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(transaction.amount));
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{formatted}</span>
          {transaction.installments && transaction.currentInstallment && (
            <span className="text-xs text-muted-foreground">
              {transaction.installments - transaction.currentInstallment} parcela(s) restante(s)
            </span>
          )}
        </div>
      );
    },
  },
];
