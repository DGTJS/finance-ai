import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import TransactionsClient from "./_components/transactions-client";
import { getUserSettings } from "@/app/_actions/user-settings";

const Transactions = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar usuário e conta compartilhada
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      familyAccount: {
        include: {
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Se o usuário tem conta compartilhada, buscar transações de todos os usuários
  const familyUserIds = user?.familyAccount?.users.map((u) => u.id) || [session.user.id];

  const transactions = await db.transaction.findMany({
    where: {
      userId: {
        in: familyUserIds,
      },
    },
    include: {
      bankAccount: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calcular estatísticas
  const totalIncome = transactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvestments = transactions
    .filter((t) => t.type === "INVESTMENT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses - totalInvestments;

  // Buscar configurações do usuário
  const settingsResult = await getUserSettings();
  const userSettings = settingsResult.success ? settingsResult.data : null;
  const categoryIcons = (userSettings?.categoryIcons as Record<string, string>) || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transações</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie suas receitas, despesas e investimentos
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Receitas */}
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Receitas
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 sm:h-10 sm:w-10">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-green-500 sm:text-2xl">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalIncome)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "DEPOSIT").length}{" "}
              transações
            </p>
          </div>

          {/* Total Despesas */}
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Despesas
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 sm:h-10 sm:w-10">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalExpenses)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "EXPENSE").length}{" "}
              transações
            </p>
          </div>

          {/* Total Investimentos */}
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Investimentos
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 sm:h-10 sm:w-10">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalInvestments)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "INVESTMENT").length}{" "}
              transações
            </p>
          </div>

          {/* Saldo */}
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">Saldo</p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  balance >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${balance >= 0 ? "text-green-500" : "text-red-500"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p
              className={`mt-2 text-2xl font-bold ${
                balance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(balance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.length} transações totais
            </p>
          </div>
        </div>

        {/* Tabela de Transações */}
        <TransactionsClient transactions={transactions} categoryIcons={categoryIcons} />
      </div>
    </div>
  );
};

export default Transactions;
