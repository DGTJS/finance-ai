import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import EconomyClient from "./_components/economy-client";

export default async function EconomyPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Buscar contas bancárias
  const bankAccounts = await db.bankAccount.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Buscar investimentos (transações do tipo INVESTMENT)
  const investments = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      type: "INVESTMENT",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calcular totais
  const totalInvestments = investments.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );

  const totalBankBalance = bankAccounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0,
  );

  // Agrupar investimentos por categoria
  const investmentsByCategory = investments.reduce(
    (acc, investment) => {
      const category = investment.category;
      acc[category] = (acc[category] || 0) + Number(investment.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  // Investimentos dos últimos 6 meses
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentInvestments = investments.filter(
    (inv) => new Date(inv.createdAt) >= sixMonthsAgo,
  );

  // Calcular renda e despesas mensais (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthlyTransactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <EconomyClient
      bankAccounts={bankAccounts}
      investments={investments}
      totalInvestments={totalInvestments}
      totalBankBalance={totalBankBalance}
      investmentsByCategory={investmentsByCategory}
      recentInvestments={recentInvestments}
      monthlyIncome={monthlyIncome}
      monthlyExpenses={monthlyExpenses}
    />
  );
}

