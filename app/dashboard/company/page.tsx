/**
 * Módulo Empresa - Dashboard Intuitiva e Orientada a Ação
 *
 * Princípio: Toda informação exibida deve levar a uma ação clara.
 * Nenhum número deve ser "morto".
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompany, useCompanyContext } from "@/app/_contexts/company-context";
import { getUserCompanies } from "@/app/_actions/company";
import {
  getCompanyRevenuesThisMonth,
  getCompanyRevenuesLastMonth,
  getCompanyRevenues,
} from "@/app/_actions/company-revenue";
import {
  getCompanyCostsThisMonth,
  getCompanyCostsLastMonth,
} from "@/app/_actions/company-costs";
import { getLowStockProducts } from "@/app/_actions/company-product";
import { getFixedCosts } from "@/app/_actions/fixed-cost";
import { getCompanyStockStats } from "@/app/_actions/company-product/stock-stats";
import { getCompanyMonthlyStats } from "@/app/_actions/company/monthly-stats";
import CircularExpenseChart from "@/app/_components/circular-expense-chart";
import { MonthlyChart } from "./_components/monthly-chart";
import { AIAssistant } from "./_components/ai-assistant";
import { CompanyWizard } from "./_components/company-wizard";
import { StockTab } from "./_components/stock-tab";
import { QuickActionBar } from "./_components/quick-action-bar";
import { SimpleRevenueModal } from "./_components/simple-revenue-modal";
import { SimpleCostModal } from "./_components/simple-cost-modal";
import { SimpleProductModal } from "./_components/simple-product-modal";
import { TransactionsModal } from "./_components/transactions-modal";
import FixedCostManager from "./finance/_components/company-fixed-cost-manager";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Package,
  Plus,
  Sparkles,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/_components/ui/tabs";
import { cn } from "@/app/_lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CompanyPage() {
  const router = useRouter();
  const company = useCompany();
  const { setCompany, isLoading: contextLoading } = useCompanyContext();
  const [isCheckingCompanies, setIsCheckingCompanies] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"finance" | "stock">("finance");

  // Modais
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showCostsManagerModal, setShowCostsManagerModal] = useState(false);

  // Dados do dashboard
  const [revenuesThisMonth, setRevenuesThisMonth] = useState(0);
  const [revenuesLastMonth, setRevenuesLastMonth] = useState(0);
  const [costsThisMonth, setCostsThisMonth] = useState(0);
  const [costsLastMonth, setCostsLastMonth] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Dados para gráficos
  const [revenuesByOrigin, setRevenuesByOrigin] = useState<
    Array<{ name: string; emoji: string; color: string; value: number }>
  >([]);
  const [costsByCategory, setCostsByCategory] = useState<
    Array<{ name: string; emoji: string; color: string; value: number }>
  >([]);

  // Últimas transações
  const [recentRevenues, setRecentRevenues] = useState<any[]>([]);
  const [recentCosts, setRecentCosts] = useState<any[]>([]);

  // Todas as transações para o modal
  const [allRevenues, setAllRevenues] = useState<any[]>([]);
  const [allCosts, setAllCosts] = useState<any[]>([]);

  // Estatísticas de estoque
  const [stockStats, setStockStats] = useState<any>(null);

  // Dados mensais para gráfico
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);

  // Verificar se já existe empresa ao carregar
  useEffect(() => {
    const checkExistingCompany = async () => {
      if (contextLoading) return;

      try {
        if (company) {
          setIsCheckingCompanies(false);
          return;
        }

        const result = await getUserCompanies();

        if (result.success && result.data && result.data.length > 0) {
          setCompany(result.data[0]);
          setIsCheckingCompanies(false);
        } else {
          setIsCheckingCompanies(false);
          setShowWizard(true);
        }
      } catch (error) {
        console.error("Erro ao verificar empresas:", error);
        setIsCheckingCompanies(false);
        setShowWizard(true);
      }
    };

    const timer = setTimeout(() => {
      checkExistingCompany();
    }, 100);

    return () => clearTimeout(timer);
  }, [contextLoading, company, setCompany]);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    if (!company) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        revenuesThisMonthResult,
        revenuesLastMonthResult,
        costsThisMonthResult,
        costsLastMonthResult,
        lowStockResult,
        allRevenuesResult,
        allCostsResult,
        stockStatsResult,
        monthlyStatsResult,
      ] = await Promise.all([
        getCompanyRevenuesThisMonth(company.companyId),
        getCompanyRevenuesLastMonth(company.companyId),
        getCompanyCostsThisMonth(company.companyId),
        getCompanyCostsLastMonth(company.companyId),
        company.hasStock
          ? getLowStockProducts(company.companyId)
          : Promise.resolve({ success: true, data: [] }),
        getCompanyRevenues(company.companyId),
        getFixedCosts("COMPANY", company.companyId),
        company.hasStock
          ? getCompanyStockStats(company.companyId)
          : Promise.resolve({ success: true, data: null }),
        getCompanyMonthlyStats(company.companyId, 6),
      ]);

      // Armazenar estatísticas de estoque
      if (stockStatsResult.success) {
        setStockStats(stockStatsResult.data);
      }

      // Armazenar estatísticas mensais
      if (monthlyStatsResult.success && monthlyStatsResult.data) {
        setMonthlyStats(monthlyStatsResult.data);
      }

      if (revenuesThisMonthResult.success) {
        setRevenuesThisMonth(revenuesThisMonthResult.total || 0);
        // Armazenar últimas receitas (limitado a 5)
        if (revenuesThisMonthResult.data) {
          setRecentRevenues(revenuesThisMonthResult.data.slice(0, 5));
        }
      }
      if (revenuesLastMonthResult.success) {
        setRevenuesLastMonth(revenuesLastMonthResult.total || 0);
      }
      if (costsThisMonthResult.success) {
        setCostsThisMonth(costsThisMonthResult.total || 0);
      }
      if (costsLastMonthResult.success) {
        setCostsLastMonth(costsLastMonthResult.total || 0);
      }
      if (lowStockResult.success && company.hasStock) {
        setLowStockCount(lowStockResult.data?.length || 0);
      }

      // Processar receitas por origem
      if (allRevenuesResult.success && allRevenuesResult.data) {
        // Armazenar todas as receitas
        setAllRevenues(allRevenuesResult.data);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
        );

        const revenuesThisMonth = allRevenuesResult.data.filter(
          (r: any) =>
            new Date(r.date) >= startOfMonth && new Date(r.date) <= endOfMonth,
        );

        const byOrigin: Record<string, number> = {};
        revenuesThisMonth.forEach((r: any) => {
          const origin = r.origin || "Outros";
          byOrigin[origin] = (byOrigin[origin] || 0) + Number(r.amount);
        });

        const originColors: Record<string, string> = {
          Venda: "#10b981",
          Serviço: "#3b82f6",
          Assinatura: "#8b5cf6",
          Outros: "#6b7280",
        };

        const originEmojis: Record<string, string> = {
          Venda: "🛒",
          Serviço: "💼",
          Assinatura: "📅",
          Outros: "📊",
        };

        const revenuesByOriginData = Object.entries(byOrigin)
          .map(([origin, value]) => ({
            name: origin,
            emoji: originEmojis[origin] || "📊",
            color: originColors[origin] || "#6b7280",
            value: Number(value),
          }))
          .sort((a, b) => b.value - a.value);

        setRevenuesByOrigin(revenuesByOriginData);
      }

      // Processar despesas por categoria
      if (allCostsResult.success && allCostsResult.data) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
        );

        // Calcular custos do mês atual
        const costsThisMonth = allCostsResult.data.filter((cost: any) => {
          if (!cost.isActive) return false;

          const costDate = new Date(cost.createdAt);
          if (cost.frequency === "ONCE") {
            // Custos únicos apenas se criados neste mês
            return costDate >= startOfMonth && costDate <= endOfMonth;
          }

          // Para custos recorrentes, considerar se foram criados antes ou durante o mês
          return costDate <= endOfMonth;
        });

        const byCategory: Record<string, number> = {};
        costsThisMonth.forEach((cost: any) => {
          // Usar description como categoria se disponível, senão usar "Outros"
          const category = cost.description || "Outros";
          const amount = Number(cost.amount);

          // Para custos recorrentes, calcular valor do mês
          let monthlyAmount = amount;
          if (cost.frequency === "WEEKLY") {
            monthlyAmount = amount * 4; // Aproximadamente 4 semanas no mês
          } else if (cost.frequency === "DAILY") {
            monthlyAmount = amount * 30; // Aproximadamente 30 dias no mês
          } else if (cost.frequency === "MONTHLY") {
            monthlyAmount = amount; // Já é mensal
          } else if (cost.frequency === "ONCE") {
            monthlyAmount = amount; // Custo único
          }

          byCategory[category] = (byCategory[category] || 0) + monthlyAmount;
        });

        const categoryColors: Record<string, string> = {
          Aluguel: "#ef4444",
          Marketing: "#f59e0b",
          Funcionários: "#3b82f6",
          Outros: "#6b7280",
        };

        const categoryEmojis: Record<string, string> = {
          Aluguel: "🏠",
          Marketing: "📢",
          Funcionários: "👥",
          Outros: "📦",
        };

        const costsByCategoryData = Object.entries(byCategory)
          .map(([category, value]) => ({
            name: category,
            emoji: categoryEmojis[category] || "📦",
            color: categoryColors[category] || "#6b7280",
            value: Number(value),
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Top 6 categorias

        setCostsByCategory(costsByCategoryData);

        // Armazenar todas as despesas
        setAllCosts(allCostsResult.data);

        // Armazenar últimas despesas (limitado a 5)
        const recentCostsData = costsThisMonth
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);
        setRecentCosts(recentCostsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (company && !isCheckingCompanies) {
      loadDashboardData();
    }
  }, [company, isCheckingCompanies]);

  const handleSuccess = () => {
    loadDashboardData();
  };

  if (isCheckingCompanies || contextLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Cálculos
  const currentBalance = revenuesThisMonth - costsThisMonth;
  const resultThisMonth = revenuesThisMonth - costsThisMonth;
  const resultLastMonth = revenuesLastMonth - costsLastMonth;
  const resultChange =
    resultLastMonth !== 0
      ? ((resultThisMonth - resultLastMonth) / Math.abs(resultLastMonth)) * 100
      : 0;

  // Calcular progresso da gestão
  const hasRevenue = revenuesThisMonth > 0;
  const hasCosts = costsThisMonth > 0;
  const hasProducts = company?.hasStock ? lowStockCount >= 0 : true; // Se não tem estoque, considera completo
  const progress =
    (((hasRevenue ? 1 : 0) + (hasCosts ? 1 : 0) + (hasProducts ? 1 : 0)) / 3) *
    100;

  // Verificar se tem dados
  const hasData = revenuesThisMonth > 0 || costsThisMonth > 0;

  if (!company) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma empresa ativa. Crie uma empresa para começar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
          {/* Header com progresso */}
          <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Gestão da Empresa
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {company.companyName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Barra de ação rápida */}
                <QuickActionBar
                  onAddRevenue={() => setShowRevenueModal(true)}
                  onAddCost={() => setShowCostModal(true)}
                  onAddProduct={
                    company.hasStock
                      ? () => setShowProductModal(true)
                      : undefined
                  }
                  hasStock={company.hasStock}
                />

                {/* Botão de Configurações */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/company/settings")}
                  className="gap-2 border-black"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurações</span>
                </Button>
              </div>
            </div>

            {/* Assistente de IA */}
            <AIAssistant
              revenuesThisMonth={revenuesThisMonth}
              costsThisMonth={costsThisMonth}
              resultThisMonth={resultThisMonth}
              resultLastMonth={resultLastMonth}
              lowStockCount={lowStockCount}
              hasStock={company.hasStock}
              stockStats={stockStats}
              onOpenCostsManager={() => setShowCostsManagerModal(true)}
            />
          </div>

          {/* Tabs de Navegação */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "finance" | "stock")
            }
            className="space-y-4"
          >
            <TabsList
              className="grid w-full grid-cols-2"
              style={{ maxWidth: company.hasStock ? "400px" : "200px" }}
            >
              <TabsTrigger value="finance" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Finanças
              </TabsTrigger>
              {company.hasStock && (
                <TabsTrigger value="stock" className="gap-2">
                  <Package className="h-4 w-4" />
                  Estoque
                </TabsTrigger>
              )}
            </TabsList>

            {/* Tab: Finanças */}
            <TabsContent value="finance" className="space-y-4">
              {/* Alertas com botões de ação */}
              <div className="space-y-2">
                {costsThisMonth > revenuesThisMonth && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">
                            Você gastou mais do que ganhou este mês
                          </p>
                          <p className="text-xs text-red-700">
                            Diferença:{" "}
                            {formatCurrency(costsThisMonth - revenuesThisMonth)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowRevenueModal(true)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Adicionar Receita
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {resultChange < -10 && resultLastMonth > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />
                        <div>
                          <p className="text-sm font-semibold text-orange-800">
                            Seu resultado caiu{" "}
                            {Math.abs(resultChange).toFixed(1)}% este mês
                          </p>
                          <p className="text-xs text-orange-700">
                            Compare com o mês anterior para entender o que mudou
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowCostsManagerModal(true)}
                        size="sm"
                        variant="outline"
                      >
                        Ver Gastos
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {company.hasStock && lowStockCount > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 shrink-0 text-orange-600" />
                        <div>
                          <p className="text-sm font-semibold text-orange-800">
                            {lowStockCount} produto
                            {lowStockCount > 1 ? "s" : ""} com estoque baixo
                          </p>
                          <p className="text-xs text-orange-700">
                            É hora de repor para não perder vendas
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveTab("stock")}
                        size="sm"
                        variant="outline"
                      >
                        Repor Estoque
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Gráfico Mensal */}
              {hasData && monthlyStats.length > 0 && (
                <MonthlyChart data={monthlyStats} />
              )}

              {/* Cards Interativos */}
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Caixa Atual */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Caixa Atual
                      </CardTitle>
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(currentBalance)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Entradas - Saídas do mês
                      </p>
                    </CardContent>
                  </Card>

                  {/* Entradas do Mês - Clicável */}
                  <Card
                    onClick={() => setShowRevenueModal(true)}
                    className="hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Entradas do Mês
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(revenuesThisMonth)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Clique para registrar uma nova entrada
                      </p>
                    </CardContent>
                  </Card>

                  {/* Saídas do Mês - Clicável */}
                  <Card
                    onClick={() => setShowCostModal(true)}
                    className="hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Saídas do Mês
                      </CardTitle>
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(costsThisMonth)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Clique para adicionar um novo gasto
                      </p>
                    </CardContent>
                  </Card>

                  {/* Resultado do Mês */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Resultado do Mês
                      </CardTitle>
                      {resultThisMonth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        className={cn(
                          "text-2xl font-bold",
                          resultThisMonth >= 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {formatCurrency(resultThisMonth)}
                      </div>
                      {resultLastMonth !== 0 && (
                        <p className="text-muted-foreground text-xs">
                          {resultChange >= 0 ? "+" : ""}
                          {resultChange.toFixed(1)}% vs mês anterior
                        </p>
                      )}
                      {resultLastMonth === 0 && (
                        <p className="text-muted-foreground text-xs">
                          Primeiro mês de registro
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Gráficos e Análises */}
              {hasData && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Gráfico de Receitas por Origem */}
                  {revenuesByOrigin.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">
                          Receitas por Origem
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Gráfico */}
                          <div>
                            <CircularExpenseChart
                              categories={revenuesByOrigin}
                            />
                          </div>

                          {/* Lista de últimas receitas */}
                          <div className="space-y-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-sm font-semibold">
                                Últimas Receitas
                              </h3>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => setShowTransactionsModal(true)}
                              >
                                Ver todas
                              </Button>
                            </div>
                            {recentRevenues.length > 0 ? (
                              <div className="space-y-2">
                                {recentRevenues.map((revenue: any) => (
                                  <div
                                    key={revenue.id}
                                    className="hover:bg-accent flex items-center justify-between rounded-md p-2 transition-colors"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium">
                                        {revenue.origin || "Receita"}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {format(
                                          new Date(revenue.date),
                                          "dd/MM/yyyy",
                                          { locale: ptBR },
                                        )}
                                      </p>
                                    </div>
                                    <div className="ml-2 text-right">
                                      <p className="text-sm font-semibold text-green-600">
                                        {formatCurrency(revenue.amount)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground py-4 text-center text-sm">
                                Nenhuma receita registrada
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gráfico de Despesas por Categoria */}
                  {costsByCategory.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">
                          Despesas por Categoria
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Gráfico */}
                          <div>
                            <CircularExpenseChart
                              categories={costsByCategory}
                            />
                          </div>

                          {/* Lista de últimas despesas */}
                          <div className="space-y-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-sm font-semibold">
                                Últimas Despesas
                              </h3>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => setShowTransactionsModal(true)}
                              >
                                Ver todas
                              </Button>
                            </div>
                            {recentCosts.length > 0 ? (
                              <div className="space-y-2">
                                {recentCosts.map((cost: any) => (
                                  <div
                                    key={cost.id}
                                    className="hover:bg-accent flex items-center justify-between rounded-md p-2 transition-colors"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium">
                                        {cost.name}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {cost.description || "Sem categoria"} •{" "}
                                        {format(
                                          new Date(cost.createdAt),
                                          "dd/MM/yyyy",
                                          { locale: ptBR },
                                        )}
                                      </p>
                                    </div>
                                    <div className="ml-2 text-right">
                                      <p className="text-sm font-semibold text-red-600">
                                        {formatCurrency(cost.amount)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground py-4 text-center text-sm">
                                Nenhuma despesa registrada
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Estado inicial guiado - apenas se não tiver dados */}
              {!hasData && (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Sparkles className="text-primary mb-4 h-12 w-12" />
                    <h2 className="mb-2 text-xl font-semibold">
                      Vamos começar registrando sua primeira receita
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md text-sm">
                      Registrar suas receitas é o primeiro passo para ter
                      controle total sobre o financeiro da sua empresa. Isso
                      ajuda a entender quanto você está ganhando e planejar
                      melhor o futuro.
                    </p>
                    <Button
                      onClick={() => setShowRevenueModal(true)}
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-5 w-5" />
                      Adicionar primeira receita
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Estoque */}
            {company.hasStock && (
              <TabsContent value="stock" className="space-y-4">
                <StockTab
                  companyId={company.companyId}
                  onAddProduct={() => setShowProductModal(true)}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Modais */}
      <SimpleRevenueModal
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        companyId={company.companyId}
        onSuccess={handleSuccess}
      />
      <SimpleCostModal
        isOpen={showCostModal}
        onClose={() => setShowCostModal(false)}
        companyId={company.companyId}
        onSuccess={handleSuccess}
      />
      {company.hasStock && (
        <SimpleProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          companyId={company.companyId}
          onSuccess={handleSuccess}
        />
      )}

      <TransactionsModal
        isOpen={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        revenues={allRevenues}
        costs={allCosts}
      />

      {/* Modal de Gerenciamento de Gastos */}
      <FixedCostManager
        isOpen={showCostsManagerModal}
        onClose={() => setShowCostsManagerModal(false)}
        companyId={company.companyId}
      />

      <CompanyWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />
    </>
  );
}
