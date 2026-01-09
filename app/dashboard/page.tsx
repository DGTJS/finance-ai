/**
 * Dashboard Principal - Página principal do dashboard financeiro
 *
 * NOVA ESTRUTURA (Refatorada):
 * - SaldoOverview: Saldo atual e previsto
 * - IncomeBreakdownCard: Breakdown de receitas (salário, benefícios, variáveis)
 * - ExpenseBreakdownCard: Breakdown de despesas (fixas, variáveis)
 * - DailyBalanceChart: Gráfico de evolução diária do saldo
 * - CategoryPieCard: Gastos por categoria (despesas variáveis)
 * - ScheduledPaymentsCard: Assinaturas próximas
 * - GoalsCard: Metas em andamento
 * - UserStatsCard: Estatísticas por usuário (se aplicável)
 * - MainInsightCard: Insights financeiros
 *
 * Layout responsivo focado em clareza financeira e tomada de decisão
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardData } from "@/src/hooks/useDashboardData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGoalAmount } from "@/src/lib/api";
import { toast } from "sonner";
import { SaldoOverview } from "./components/SaldoOverview";
import { IncomeBreakdownCard } from "./components/IncomeBreakdownCard";
import { ExpenseBreakdownCard } from "./components/ExpenseBreakdownCard";
import { CompleteDashboardCard } from "./components/CompleteDashboardCard";
import { DailyBalanceChart } from "./components/DailyBalanceChart";
import { CategoryPieCard } from "./components/CategoryPieCard";
import { UserStatsCard } from "./components/UserStatsCard";
import { ActionsInsightsCard } from "./components/ActionsInsightsCard";
import { RecentExpensesCard } from "./components/RecentExpensesCard";
import { ProximosVencimentos } from "./components/ProximosVencimentos";
import { SaldoSalarioFamiliar } from "./components/SaldoSalarioFamiliar";
import { SaldoBeneficiosFamiliar } from "./components/SaldoBeneficiosFamiliar";
import { AnalyticsSummaryCard } from "./components/AnalyticsSummaryCard";
import { BeneficiosPieChart } from "./components/BeneficiosPieChart";
import { MobileCompleteCard } from "./components/MobileCompleteCard";
import {
  BalanceCardSkeleton,
  MainInsightCardSkeleton,
  CategoryPieCardSkeleton,
  GoalsCardSkeleton,
} from "./components/Skeletons";
import { Button } from "@/app/_components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/app/_lib/utils";
import { FreelancerDashboard } from "./components/FreelancerDashboard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardView, setDashboardView] = useState<
    "financeiro" | "freelancer"
  >(() => {
    // Verificar se há parâmetro na URL
    const view = searchParams.get("view");
    return view === "freelancer" ? "freelancer" : "financeiro";
  });
  const { data, isLoading, error, refetch } = useDashboardData();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Atualizar view se o parâmetro da URL mudar
    const view = searchParams.get("view");
    if (view === "freelancer") {
      setDashboardView("freelancer");
    } else if (view === "financeiro" || !view) {
      setDashboardView("financeiro");
    }
  }, [searchParams]);

  const addGoalAmountMutation = useMutation({
    mutationFn: ({ goalId, amount }: { goalId: string; amount: number }) =>
      addGoalAmount(goalId, amount),
    onSuccess: () => {
      toast.success("Valor adicionado à meta com sucesso");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar valor",
      );
    },
  });

  const handleAddGoalAmount = async (goalId: string, amount: number) => {
    await addGoalAmountMutation.mutateAsync({ goalId, amount });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Erro ao carregar dados:{" "}
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-red-600 underline dark:text-red-400"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderizar conteúdo baseado na view selecionada
  if (dashboardView === "freelancer") {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
          {/* ===== HEADER COM BOTÕES DE DASHBOARD E REFRESH ===== */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDashboardView("financeiro")}
                className="h-7 gap-1 px-2 text-[10px] sm:gap-2 sm:px-3 sm:text-xs"
              >
                <span>💰</span>
                <span className="hidden sm:inline">Financeiro</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground h-7 gap-1 px-2 text-[10px] sm:gap-2 sm:px-3 sm:text-xs"
              >
                <span>💼</span>
                <span className="hidden sm:inline">Freelancer</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/company")}
                className="h-7 gap-1 px-2 text-[10px] sm:gap-2 sm:px-3 sm:text-xs"
              >
                <span>🏢</span>
                <span className="hidden sm:inline">Empresa</span>
              </Button>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px] sm:gap-2 sm:px-3 sm:text-xs"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
          <FreelancerDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        {/* ===== MOBILE: CARD COMPLETO MINIMALISTA ===== */}
        <div className="lg:hidden">
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <MobileCompleteCard
              currentBalance={data.currentBalance}
              projectedBalance={data.projectedBalance}
              changePercent={data.monthlyOverview.changePercent}
              income={data.income}
              expenses={data.expenses}
              dailyBalance={data.dailyBalanceSparkline}
              recentTransactions={data.recentTransactions}
              upcomingPayments={data.upcomingPayments}
              familySalaryBalance={data.familySalaryBalance}
              familyBenefitsBalance={data.familyBenefitsBalance}
              categories={data.categories}
              insight={data.insight}
              scheduledPayments={data.scheduledPayments}
              goals={data.goals}
              userStats={data.userStats}
              dashboardView={dashboardView}
              onViewChange={setDashboardView}
              onRefresh={handleRefresh}
              onAddGoalAmount={handleAddGoalAmount}
              isRefreshing={isRefreshing || isLoading}
            />
          ) : null}
        </div>

        {/* ===== DESKTOP: CARD COMPLETO COM TODAS AS INFORMAÇÕES ===== */}
        <div className="hidden lg:block">
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <CompleteDashboardCard
              currentBalance={data.currentBalance}
              projectedBalance={data.projectedBalance}
              changePercent={data.monthlyOverview.changePercent}
              income={data.income}
              expenses={data.expenses}
              dailyBalance={data.dailyBalanceSparkline}
              recentTransactions={data.recentTransactions}
              upcomingPayments={data.upcomingPayments}
              familySalaryBalance={data.familySalaryBalance}
              familyBenefitsBalance={data.familyBenefitsBalance}
              categories={data.categories}
              dashboardView={dashboardView}
              onViewChange={setDashboardView}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing || isLoading}
            />
          ) : null}
        </div>

        {/* ===== BLOCO 3: SALÁRIO E BENEFÍCIOS ===== */}
        {/* Mobile/Tablet: Grid 2 colunas (1/2 cada) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:hidden">
          {/* Saldo de Salário do Mês */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data?.familySalaryBalance ? (
            <SaldoSalarioFamiliar salaryBalance={data.familySalaryBalance} />
          ) : null}

          {/* Saldo de Benefícios do Mês */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data?.familyBenefitsBalance ? (
            <SaldoBeneficiosFamiliar
              benefitsBalance={data.familyBenefitsBalance}
            />
          ) : null}
        </div>

        {/* ===== CONTEXTO E AÇÕES ===== */}
        <div className="hidden lg:block">
          {isLoading ? (
            <MainInsightCardSkeleton />
          ) : data?.insight ? (
            <ActionsInsightsCard
              insight={data.insight}
              scheduledPayments={data.scheduledPayments}
              goals={data.goals}
              onAddGoalAmount={handleAddGoalAmount}
            />
          ) : null}
        </div>

        {/* ===== DADOS ADICIONAIS ===== */}
        <div className="hidden lg:block">
          {isLoading ? (
            <CategoryPieCardSkeleton />
          ) : data ? (
            <AnalyticsSummaryCard
              benefitsBalance={data.familyBenefitsBalance}
              categories={data.categories}
              userStats={data.userStats}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
