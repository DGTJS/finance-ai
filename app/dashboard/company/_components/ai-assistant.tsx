"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AIAssistantProps {
  revenuesThisMonth: number;
  costsThisMonth: number;
  resultThisMonth: number;
  resultLastMonth: number;
  lowStockCount: number;
  hasStock: boolean;
  stockStats?: {
    totalCostValue: number;
    totalSaleValue: number;
    totalProducts: number;
    productsWithLowStock: number;
    productsStopped: number;
    oldestProductDays: number;
    averageMargin: number;
  } | null;
  onOpenCostsManager?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AIAssistant({
  revenuesThisMonth,
  costsThisMonth,
  resultThisMonth,
  resultLastMonth,
  lowStockCount,
  hasStock,
  stockStats,
  onOpenCostsManager,
}: AIAssistantProps) {
  const router = useRouter();

  const insights = useMemo(() => {
    const tips: Array<{
      type: "success" | "warning" | "error" | "info";
      icon: React.ReactNode;
      title: string;
      message: string;
      action?: {
        label: string;
        onClick: () => void;
      };
    }> = [];

    // Análise financeira
    if (costsThisMonth > revenuesThisMonth) {
      tips.push({
        type: "error",
        icon: <TrendingDown className="h-5 w-5 text-red-600" />,
        title: "Atenção: Gastos maiores que receitas",
        message: `Você está gastando ${formatCurrency(costsThisMonth - revenuesThisMonth)} a mais do que ganha este mês. Considere reduzir custos ou aumentar receitas.`,
        action: {
          label: "Ver Gastos",
          onClick: () =>
            onOpenCostsManager
              ? onOpenCostsManager()
              : router.push("/dashboard/company/finance"),
        },
      });
    }

    const resultChange =
      resultLastMonth !== 0
        ? ((resultThisMonth - resultLastMonth) / Math.abs(resultLastMonth)) *
          100
        : 0;

    if (resultChange < -20 && resultLastMonth > 0) {
      tips.push({
        type: "warning",
        icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
        title: "Queda significativa no resultado",
        message: `Seu resultado caiu ${Math.abs(resultChange).toFixed(1)}% em relação ao mês anterior. Analise o que mudou.`,
      });
    }

    if (resultThisMonth > 0 && resultChange > 20) {
      tips.push({
        type: "success",
        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
        title: "Crescimento positivo!",
        message: `Parabéns! Seu resultado melhorou ${resultChange.toFixed(1)}% este mês. Continue assim!`,
      });
    }

    // Análise de estoque (se habilitado)
    if (hasStock && stockStats) {
      if (stockStats.productsWithLowStock > 0) {
        tips.push({
          type: "warning",
          icon: <Package className="h-5 w-5 text-orange-600" />,
          title: "Estoque baixo",
          message: `${stockStats.productsWithLowStock} produto${stockStats.productsWithLowStock > 1 ? "s" : ""} com estoque baixo. Reponha para não perder vendas.`,
          action: {
            label: "Ver Estoque",
            onClick: () => router.push("/dashboard/company/stock"),
          },
        });
      }

      if (stockStats.productsStopped > 0) {
        tips.push({
          type: "warning",
          icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
          title: "Produtos parados",
          message: `${stockStats.productsStopped} produto${stockStats.productsStopped > 1 ? "s" : ""} sem movimento há mais de 30 dias. Considere promoções ou ajustes.`,
          action: {
            label: "Ver Estoque",
            onClick: () => router.push("/dashboard/company/stock"),
          },
        });
      }

      if (stockStats.totalCostValue > 0) {
        const stockPercentage =
          (stockStats.totalCostValue / (revenuesThisMonth || 1)) * 100;

        if (stockPercentage > 50) {
          tips.push({
            type: "info",
            icon: <DollarSign className="h-5 w-5 text-blue-600" />,
            title: "Capital imobilizado em estoque",
            message: `Você tem ${formatCurrency(stockStats.totalCostValue)} em mercadoria (${stockPercentage.toFixed(0)}% das receitas). Considere acelerar a rotatividade.`,
          });
        }

        if (stockStats.averageMargin < 20) {
          tips.push({
            type: "warning",
            icon: <TrendingDown className="h-5 w-5 text-orange-600" />,
            title: "Margem de lucro baixa",
            message: `Sua margem média é de ${stockStats.averageMargin.toFixed(1)}%. Considere revisar preços ou custos.`,
          });
        }
      }
    }

    // Dicas gerais
    if (revenuesThisMonth === 0 && costsThisMonth === 0) {
      tips.push({
        type: "info",
        icon: <Lightbulb className="h-5 w-5 text-blue-600" />,
        title: "Comece registrando suas operações",
        message:
          "Registre suas primeiras receitas e despesas para começar a ter insights valiosos sobre seu negócio.",
        action: {
          label: "Adicionar Receita",
          onClick: () => {},
        },
      });
    }

    if (tips.length === 0) {
      tips.push({
        type: "success",
        icon: <Sparkles className="h-5 w-5 text-green-600" />,
        title: "Tudo certo!",
        message:
          "Seu negócio está em bom caminho. Continue monitorando suas finanças regularmente.",
      });
    }

    return tips;
  }, [
    revenuesThisMonth,
    costsThisMonth,
    resultThisMonth,
    resultLastMonth,
    lowStockCount,
    hasStock,
    stockStats,
    router,
  ]);

  const primaryTip = insights[0];

  if (!primaryTip) return null;

  const typeStyles = {
    success: "border-green-200 bg-green-50",
    warning: "border-orange-200 bg-orange-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  const iconStyles = {
    success: "text-green-600",
    warning: "text-orange-600",
    error: "text-red-600",
    info: "text-blue-600",
  };

  return (
    <Card className={typeStyles[primaryTip.type]}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={iconStyles[primaryTip.type]}>{primaryTip.icon}</div>
          <CardTitle className="text-base font-semibold">
            {primaryTip.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">{primaryTip.message}</p>

        {primaryTip.action && (
          <Button
            onClick={primaryTip.action.onClick}
            size="sm"
            variant={primaryTip.type === "error" ? "destructive" : "outline"}
            className="w-full sm:w-auto"
          >
            {primaryTip.action.label}
          </Button>
        )}

        {hasStock && (
          <div className="border-t pt-2">
            <Button
              onClick={() => router.push("/dashboard/company/stock")}
              size="sm"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
            >
              <Package className="h-4 w-4" />
              Controle de Estoque
            </Button>
          </div>
        )}

        {insights.length > 1 && (
          <div className="border-t pt-2">
            <p className="text-muted-foreground mb-2 text-xs">
              {insights.length - 1} outra{insights.length > 2 ? "s" : ""} dica
              {insights.length > 2 ? "s" : ""} disponível
              {insights.length > 2 ? "is" : ""}
            </p>
            <div className="space-y-1">
              {insights.slice(1, 4).map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <span className={iconStyles[tip.type]}>{tip.icon}</span>
                  <div>
                    <p className="font-medium">{tip.title}</p>
                    <p className="text-muted-foreground">{tip.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
