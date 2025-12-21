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
import { DailyBalanceChart } from "./components/DailyBalanceChart";
import { CategoryPieCard } from "./components/CategoryPieCard";
import { ScheduledPaymentsCard } from "./components/ScheduledPaymentsCard";
import { GoalsCard } from "./components/GoalsCard";
import { UserStatsCard } from "./components/UserStatsCard";
import { MainInsightCard } from "./components/MainInsightCard";
import { RecentExpensesCard } from "./components/RecentExpensesCard";
import { ProximosVencimentos } from "./components/ProximosVencimentos";
import { SaldoSalarioFamiliar } from "./components/SaldoSalarioFamiliar";
import { SaldoBeneficiosFamiliar } from "./components/SaldoBeneficiosFamiliar";
import { BeneficiosPieChart } from "./components/BeneficiosPieChart";
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDashboardView("financeiro")}
                className="gap-2"
              >
                <span>💰</span>
                Financeiro
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground gap-2"
              >
                <span>💼</span>
                Freelancer
              </Button>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
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
        {/* ===== HEADER COM BOTÕES DE DASHBOARD E REFRESH ===== */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={dashboardView === "financeiro" ? "default" : "outline"}
              size="sm"
              onClick={() => setDashboardView("financeiro")}
              className={cn(
                "gap-2",
                dashboardView === "financeiro" &&
                  "bg-primary text-primary-foreground",
              )}
            >
              <span>💰</span>
              Financeiro
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDashboardView("freelancer")}
              className="gap-2"
            >
              <span>💼</span>
              Freelancer
            </Button>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>

        {/* ===== PRIMEIRA SEÇÃO: GRID 2 COLUNAS ===== */}
        {/* Mobile/Tablet: Stack vertical */}
        <div className="space-y-4 lg:hidden">
          {/* Evolução do Saldo Diário */}
          {isLoading ? (
            <CategoryPieCardSkeleton />
          ) : data ? (
            <DailyBalanceChart dailyBalance={data.dailyBalanceSparkline} />
          ) : null}

          {/* Grid interno com Benefícios e Categorias */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Benefícios (Usado vs Disponível) */}
            {isLoading ? (
              <CategoryPieCardSkeleton />
            ) : data?.familyBenefitsBalance ? (
              <BeneficiosPieChart
                benefitsBalance={data.familyBenefitsBalance}
              />
            ) : null}

            {/* Gastos por Categoria */}
            {isLoading ? (
              <CategoryPieCardSkeleton />
            ) : data ? (
              <CategoryPieCard categories={data.categories} />
            ) : null}
          </div>
        </div>

        {/* Desktop: Grid 2 colunas - Grid 1: Evolução do Saldo (70%), Grid 2: Grid interno com Benefícios e Categorias (30%) */}
        <div className="hidden lg:grid lg:grid-cols-[7fr_3fr] lg:gap-6">
          {/* Grid 1: Evolução do Saldo Diário (70%) */}
          <div>
            {isLoading ? (
              <CategoryPieCardSkeleton />
            ) : data ? (
              <DailyBalanceChart dailyBalance={data.dailyBalanceSparkline} />
            ) : null}
          </div>

          {/* Grid 2: Grid interno com 2 divs uma embaixo da outra (Benefícios e Categorias) (30%) */}
          <div className="flex flex-col gap-3">
            {/* Grid 2-1: Benefícios (Usado vs Disponível) */}
            <div>
              {isLoading ? (
                <CategoryPieCardSkeleton />
              ) : data?.familyBenefitsBalance ? (
                <BeneficiosPieChart
                  benefitsBalance={data.familyBenefitsBalance}
                />
              ) : null}
            </div>

            {/* Grid 2-2: Gastos por Categoria */}
            <div>
              {isLoading ? (
                <CategoryPieCardSkeleton />
              ) : data ? (
                <CategoryPieCard categories={data.categories} />
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== BLOCO 1: VISÃO PRINCIPAL (GRID 4) ===== */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {/* Visão Geral */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <SaldoOverview
              currentBalance={data.currentBalance}
              projectedBalance={data.projectedBalance}
              changePercent={data.monthlyOverview.changePercent}
            />
          ) : null}

          {/* Receitas do Mês */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <IncomeBreakdownCard income={data.income} />
          ) : null}

          {/* Despesas do Mês */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <ExpenseBreakdownCard expenses={data.expenses} />
          ) : null}

          {/* Próximos Vencimentos */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data?.upcomingPayments && data.upcomingPayments.length > 0 ? (
            <ProximosVencimentos payments={data.upcomingPayments} />
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

        {/* Desktop: Cards de Salário e Benefícios (abaixo do grid principal) */}
        <div className="hidden lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-6">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-6">
          {/* Insights Financeiros */}
          {isLoading ? (
            <MainInsightCardSkeleton />
          ) : data?.insight ? (
            <MainInsightCard insight={data.insight} />
          ) : null}

          {/* Assinaturas Próximas */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <ScheduledPaymentsCard payments={data.scheduledPayments} />
          ) : null}

          {/* Metas */}
          {isLoading ? (
            <GoalsCardSkeleton />
          ) : data ? (
            <GoalsCard goals={data.goals} onAddAmount={handleAddGoalAmount} />
          ) : null}
        </div>

        {/* ===== DADOS ADICIONAIS ===== */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Transações Recentes */}
          {isLoading ? (
            <BalanceCardSkeleton />
          ) : data ? (
            <RecentExpensesCard transactions={data.recentTransactions} />
          ) : null}

          {/* Estatísticas por Usuário (se aplicável) */}
          {data?.userStats && data.userStats.length > 0 && (
            <>
              {isLoading ? (
                <BalanceCardSkeleton />
              ) : (
                <UserStatsCard userStats={data.userStats} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
