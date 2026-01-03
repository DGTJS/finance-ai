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
  const familyUserIds = user?.familyAccount?.users.map((u) => u.id) || [
    session.user.id,
  ];

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
  const categoryIcons =
    (userSettings?.categoryIcons as Record<string, string>) || null;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        {/* Header Minimalista */}
        <div className="border-b pb-4">
          <h1 className="text-xl font-light tracking-tight sm:text-2xl md:text-3xl">
            Transações
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Gerencie suas receitas, despesas e investimentos
          </p>
        </div>

        {/* Stats Cards Minimalistas */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {/* Total Receitas */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 sm:h-7 sm:w-7">
                <svg
                  className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4 dark:text-green-400"
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
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Receitas
              </p>
            </div>
            <p className="mt-2 text-lg font-light tracking-tight text-green-600 sm:text-xl md:text-2xl dark:text-green-400">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalIncome)}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {transactions.filter((t) => t.type === "DEPOSIT").length}{" "}
              transações
            </p>
          </div>

          {/* Total Despesas */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 sm:h-7 sm:w-7">
                <svg
                  className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4 dark:text-red-400"
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
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Despesas
              </p>
            </div>
            <p className="mt-2 text-lg font-light tracking-tight text-red-600 sm:text-xl md:text-2xl dark:text-red-400">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalExpenses)}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {transactions.filter((t) => t.type === "EXPENSE").length}{" "}
              transações
            </p>
          </div>

          {/* Total Investimentos */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 sm:h-7 sm:w-7">
                <svg
                  className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400"
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
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Investimentos
              </p>
            </div>
            <p className="mt-2 text-lg font-light tracking-tight text-blue-600 sm:text-xl md:text-2xl dark:text-blue-400">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalInvestments)}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {transactions.filter((t) => t.type === "INVESTMENT").length}{" "}
              transações
            </p>
          </div>

          {/* Saldo */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full sm:h-7 sm:w-7 ${
                  balance >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <svg
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    balance >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
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
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Saldo
              </p>
            </div>
            <p
              className={`mt-2 text-lg font-light tracking-tight sm:text-xl md:text-2xl ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(balance)}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {transactions.length} transações totais
            </p>
          </div>
        </div>

        {/* Tabela de Transações */}
        <TransactionsClient
          transactions={transactions}
          categoryIcons={categoryIcons}
        />
      </div>
    </div>
  );
};

export default Transactions;
