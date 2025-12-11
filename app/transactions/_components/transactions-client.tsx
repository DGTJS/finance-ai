"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Transaction, TransactionCategory } from "@/app/generated/prisma/client";
import { DataTable } from "@/app/_components/ui/data-table";
import { Button } from "@/app/_components/ui/button";
import { Plus, Trash2, RefreshCw, CheckSquare, Square, Edit2 } from "lucide-react";
import { deleteTransaction, deleteMultipleTransactions } from "@/app/_actions/transaction";
import { toast } from "sonner";
import { TRANSACTION_CATEGORY_LABELS, getCategoryIcon } from "@/app/_constants/transactions";
import EditCategoryIconsDialog from "./edit-category-icons-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";
import { transactionsColumns } from "../_columns";
import { RowSelectionState } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";

interface TransactionsClientProps {
  transactions: Transaction[];
  categoryIcons?: Record<string, string> | null;
}

export default function TransactionsClient({
  transactions: initialTransactions,
  categoryIcons,
}: TransactionsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isEditIconsDialogOpen, setIsEditIconsDialogOpen] = useState(false);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteTransaction(deleteId);

      if (result.success) {
        toast.success("Transação excluída com sucesso!");
        setDeleteId(null);
        // Forçar atualização dos dados
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir transação");
      }
    } catch (error) {
      toast.error("Erro ao excluir transação");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(undefined);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Aguardar um pouco para dar feedback visual
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleDeleteMultiple = async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("Nenhuma transação selecionada");
      return;
    }

    setIsDeletingMultiple(true);
    try {
      const result = await deleteMultipleTransactions(selectedIds);

      if (result.success) {
        toast.success(
          `${selectedIds.length} transação(ões) excluída(s) com sucesso!`
        );
        setRowSelection({});
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir transações");
      }
    } catch (error) {
      toast.error("Erro ao excluir transações");
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleSelectAll = () => {
    if (Object.keys(rowSelection).length === initialTransactions.length) {
      setRowSelection({});
    } else {
      const allSelected: RowSelectionState = {};
      initialTransactions.forEach((transaction) => {
        allSelected[transaction.id] = true;
      });
      setRowSelection(allSelected);
    }
  };

  const selectedCount = Object.keys(rowSelection).length;
  const allSelected = selectedCount === initialTransactions.length && initialTransactions.length > 0;

  // Criar coluna de seleção
  const selectColumn: ColumnDef<Transaction> = {
    id: "select",
    header: () => (
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8 w-8 p-0"
          title={allSelected ? "Desselecionar todas" : "Selecionar todas"}
          type="button"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => {
            row.toggleSelected(e.target.checked);
          }}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Selecionar transação ${row.original.name}`}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  };

  // Criar colunas com ações
  const columnsWithActions: ColumnDef<Transaction>[] = [
    selectColumn,
    ...transactionsColumns.map((col) => {
      if (col.accessorKey === "category") {
        return {
          ...col,
          cell: ({ row: { original: transaction } }: any) => {
            const icon = getCategoryIcon(transaction.category, categoryIcons);
            return (
              <div className="flex items-center gap-2 group">
                <span className="text-lg">{icon}</span>
                <span>{TRANSACTION_CATEGORY_LABELS[transaction.category]}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditIconsDialogOpen(true);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar ícone da categoria"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            );
          },
        };
      }
      return col;
    }),
    {
      accessorKey: "actions",
      header: "Ações",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(transaction)}
              className="h-8 w-8 p-0"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(transaction.id)}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Header com botão adicionar */}
      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Todas as Transações</h2>
          <p className="text-muted-foreground text-sm">
            {initialTransactions.length} transação(ões) encontrada(s)
            {selectedCount > 0 && (
              <span className="ml-2 text-primary">
                • {selectedCount} selecionada(s)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteMultiple}
              disabled={isDeletingMultiple}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingMultiple
                ? "Excluindo..."
                : `Excluir ${selectedCount} selecionada(s)`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Button
            onClick={() => {
              setSelectedTransaction(undefined);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Tabela */}
      {initialTransactions.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <svg
                className="text-primary h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Nenhuma transação encontrada
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Comece adicionando sua primeira transação para acompanhar suas
              finanças.
            </p>
            <Button
              onClick={() => {
                setSelectedTransaction(undefined);
                setIsDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Primeira Transação
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <DataTable
            columns={columnsWithActions}
            data={initialTransactions}
            enableRowSelection={true}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
          />
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <UpsertTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => {
          handleCloseDialog();
          // Forçar refresh quando fechar o diálogo
          handleRefresh();
        }}
        transactionId={selectedTransaction?.id}
        defaultValues={
          selectedTransaction
            ? {
                ...selectedTransaction,
                amount: Number(selectedTransaction.amount),
                date: selectedTransaction.date || new Date(),
              }
            : undefined
        }
      />

      {/* Dialog de Editar Ícones de Categoria */}
      <EditCategoryIconsDialog
        isOpen={isEditIconsDialogOpen}
        onClose={() => setIsEditIconsDialogOpen(false)}
        currentIcons={categoryIcons || {}}
        onSave={(icons) => {
          router.refresh();
          setIsEditIconsDialogOpen(false);
        }}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
