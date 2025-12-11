import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/app/_lib/prisma";
import DashboardClient from "./_components/dashboard-client";
import { generateInsights } from "./_lib/ai";
import { getUserGoals } from "./_actions/goal";

export default async function Home() {
  const session = await auth();
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log("[Page] Sessão:", session ? "✅ Autenticado" : "❌ Não autenticado");
    if (session) {
      console.log("[Page] User ID:", session.user?.id);
      console.log("[Page] User Email:", session.user?.email);
    }
  }
  
  if (!session) {
    redirect("/login");
  }

  try {
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
              email: true,
              image: true,
              role: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
    });

    // Buscar transações do último mês
    const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Se o usuário tem conta compartilhada, buscar transações de todos os usuários
    // Caso contrário, buscar apenas do usuário atual
    const familyUserIds = user?.familyAccount?.users.map((u) => u.id) || [session.user.id];

    const transactions = await db.transaction.findMany({
    where: {
      userId: {
        in: familyUserIds,
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    });

    // Buscar metas ativas do usuário (antes de calcular o saldo)
    const goalsResult = await getUserGoals();
    const allActiveGoals = goalsResult.success 
      ? (goalsResult.data || [])
          .filter((g) => g.status === "ACTIVE")
          .map((g) => ({
          id: g.id,
          name: g.name,
          targetAmount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount),
          deadline: new Date(g.deadline),
          category: g.category,
          icon: g.icon,
            color: g.color,
          }))
      : [];
    
    // Calcular total das metas ativas (para o saldo)
    const totalGoalsAmount = allActiveGoals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0
    );

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

    // Saldo = Receitas - Despesas - Investimentos + Metas (valor atual poupado)
    const balance = totalIncome - totalExpenses - totalInvestments + totalGoalsAmount;

    // Gastos por categoria com porcentagens
    const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");
    const expensesByCategory = expenseTransactions.reduce(
    (acc, t) => {
      const category = t.category;
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    },
      {} as Record<string, number>,
    );

    // Formatar dados para o gráfico de pizza
    const expensesChartData = Object.entries(expensesByCategory).map(
    ([category, total]) => ({
      category: category as any,
      total: total as number,
      percentage: totalExpenses > 0 ? (total as number / totalExpenses) * 100 : 0,
      }),
    ).sort((a, b) => b.total - a.total); // Ordenar por total decrescente

    // Transações por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const transactionsByDay = last7Days.map((date) => {
    const dayTransactions = transactions.filter(
      (t) =>
        t.createdAt.toISOString().split("T")[0] === date,
    );

    return {
      date,
      income: dayTransactions
        .filter((t) => t.type === "DEPOSIT")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      expenses: dayTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      investments: dayTransactions
        .filter((t) => t.type === "INVESTMENT")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      };
    });

    // Buscar todas as assinaturas ativas
    const allSubscriptions = await db.subscription.findMany({
    where: {
      userId: session.user.id,
      active: true,
    },
    });
    
    // Mapear e ordenar assinaturas usando nextDueDate ou dueDate como fallback
    const upcomingSubscriptions = allSubscriptions
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: Number(sub.amount),
        nextDueDate: sub.nextDueDate || sub.dueDate,
      }))
      .sort((a, b) => {
        const dateA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
        const dateB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, 10);

    // Buscar transações futuras (parcelas pendentes e assinaturas)
    const today = new Date();
    const next60Days = new Date(today);
    next60Days.setDate(next60Days.getDate() + 60);

    const upcomingTransactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: {
        gte: today,
        lte: next60Days,
      },
    },
    orderBy: {
      date: "asc",
    },
    });

    // Gerar insight da IA
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const insights = await generateInsights(
      session.user.id,
      firstDayOfMonth,
      now,
    );

    // Pegar primeiro insight de alta ou média severidade
    const mainInsight = insights.find(
      (i) => i.severity === "high" || i.severity === "medium",
    ) || insights[0];

    // Agrupar transações por criador (createdBy)
    const transactionsByUser = transactions.reduce((acc, transaction) => {
    const creatorId = transaction.createdBy?.id || transaction.userId;
    const creatorName = transaction.createdBy?.name || transaction.createdBy?.email || "Usuário";
    const firstName = creatorName.split(" ")[0];
    
    if (!acc[creatorId]) {
      acc[creatorId] = {
        name: firstName,
        transactions: [],
        income: 0,
        expenses: 0,
        investments: 0,
      };
    }
    
    acc[creatorId].transactions.push(transaction);
    
    if (transaction.type === "DEPOSIT") {
      acc[creatorId].income += Number(transaction.amount);
    } else if (transaction.type === "EXPENSE") {
      acc[creatorId].expenses += Number(transaction.amount);
    } else if (transaction.type === "INVESTMENT") {
      acc[creatorId].investments += Number(transaction.amount);
    }
    
      return acc;
    }, {} as Record<string, { name: string; transactions: typeof transactions; income: number; expenses: number; investments: number }>);

    // Metas para exibir no card (apenas as 3 primeiras)
    const activeGoals = allActiveGoals.slice(0, 3);

    // Usar dados do banco de dados em vez da sessão para garantir dados atualizados
    const currentUserName = user?.name || session.user.name || session.user.email || "Usuário";
    const currentUserImage = user?.image || session.user.image;

    return (
    <DashboardClient
      userName={currentUserName}
      stats={{
        totalIncome,
        totalExpenses,
        totalInvestments,
        balance,
      }}
      expensesByCategory={expensesByCategory}
      expensesChartData={expensesChartData}
      transactionsByDay={transactionsByDay}
      recentTransactions={transactions.slice(0, 5)}
      upcomingSubscriptions={upcomingSubscriptions}
      upcomingTransactions={upcomingTransactions}
      aiInsight={mainInsight}
      transactionsByUser={transactionsByUser}
      familyUsers={
        user?.familyAccount?.users || [
          {
            id: session.user.id,
            name: user?.name || session.user.name,
            email: user?.email || session.user.email || "",
            image: user?.image || session.user.image,
          },
        ]
      }
      activeGoals={activeGoals}
      />
    );
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    // Em caso de erro, redirecionar para login ou mostrar página de erro
    redirect("/login");
  }
}
