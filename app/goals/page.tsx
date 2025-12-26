import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GoalsClient from "./_components/goals-client";
import { getUserGoals } from "@/app/_actions/goal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metas | Finance AI",
  description: "Gerencie suas metas financeiras",
};

const GoalsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar metas do usuário
  const result = await getUserGoals();
  const goals = result.success ? result.data || [] : [];

  // Calcular estatísticas
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const totalTarget = activeGoals.reduce(
    (sum, g) => sum + Number(g.targetAmount),
    0,
  );
  const totalCurrent = activeGoals.reduce(
    (sum, g) => sum + Number(g.currentAmount),
    0,
  );
  const progressPercentage =
    totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        {/* Header Minimalista */}
        <div className="border-b pb-4">
          <h1 className="text-xl font-light tracking-tight sm:text-2xl md:text-3xl">
            Metas Financeiras
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Defina e acompanhe suas metas financeiras
          </p>
        </div>

        {/* Stats Cards Minimalistas */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {/* Metas Ativas */}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                Metas Ativas
              </p>
            </div>
            <p className="mt-2 text-lg font-light tracking-tight sm:text-xl md:text-2xl">
              {activeGoals.length}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {completedGoals.length} concluída(s)
            </p>
          </div>

          {/* Valor Total Alvo */}
          <div className="bg-card rounded-lg border p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                Valor Total Alvo
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-green-500 sm:text-2xl">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalTarget)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {goals.length} meta(s) cadastrada(s)
            </p>
          </div>

          {/* Valor Atual */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 sm:h-7 sm:w-7">
                <svg
                  className="h-3.5 w-3.5 text-purple-600 sm:h-4 sm:w-4 dark:text-purple-400"
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
                Valor Atual
              </p>
            </div>
            <p className="mt-2 text-lg font-light tracking-tight text-purple-600 sm:text-xl md:text-2xl dark:text-purple-400">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalCurrent)}
            </p>
            <p className="text-muted-foreground mt-1 text-[9px] sm:text-xs">
              {progressPercentage.toFixed(1)}% do total
            </p>
          </div>

          {/* Progresso Geral */}
          <div className="bg-muted/20 rounded-lg border-0 p-3 shadow-sm sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 sm:h-7 sm:w-7">
                <svg
                  className="h-3.5 w-3.5 text-orange-600 sm:h-4 sm:w-4 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs">
              Progresso Geral
            </p>
            <p className="mt-2 text-lg font-light tracking-tight sm:text-xl md:text-2xl">
              {progressPercentage.toFixed(1)}%
            </p>
            <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de Metas */}
        <GoalsClient initialGoals={goals} />
      </div>
    </div>
  );
};

export default GoalsPage;
