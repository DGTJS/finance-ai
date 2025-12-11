import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import AnalyticsClient from "../_components/analytics/analytics-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análises | Finance AI",
  description: "Análises detalhadas e insights sobre suas finanças",
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar todas as transações do usuário
  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Buscar assinaturas
  const subscriptions = await db.subscription.findMany({
    where: {
      userId: session.user.id,
      active: true,
    },
  });

  return (
    <AnalyticsClient
      transactions={transactions}
      subscriptions={subscriptions}
    />
  );
}
