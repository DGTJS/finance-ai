"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import {
  FaPlus,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaBuilding,
  FaCreditCard,
  FaPiggyBank,
  FaTrash,
  FaEdit,
  FaMoneyBillWave,
  FaLightbulb,
  FaBullseye,
  FaCalculator,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaMagic,
  FaArrowRight,
  FaCoins,
  FaShieldAlt,
} from "react-icons/fa";
import { formatCurrency } from "@/app/_lib/utils";
import { BankAccount } from "@/app/generated/prisma/client";
import { createBankAccount, deleteBankAccount, getBankAccounts } from "@/app/_actions/bank-account";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { Transaction } from "@/app/generated/prisma/client";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Badge } from "@/app/_components/ui/badge";

interface EconomyClientProps {
  bankAccounts: BankAccount[];
  investments: Transaction[];
  totalInvestments: number;
  totalBankBalance: number;
  investmentsByCategory: Record<string, number>;
  recentInvestments: Transaction[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

const ACCOUNT_TYPE_LABELS = {
  CHECKING_ACCOUNT: "Conta Corrente",
  SAVINGS_ACCOUNT: "Poupança",
  INVESTMENT_ACCOUNT: "Investimento",
  CREDIT_CARD: "Cartão de Crédito",
  OTHER: "Outro",
};

const ACCOUNT_TYPE_ICONS = {
  CHECKING_ACCOUNT: FaBuilding,
  SAVINGS_ACCOUNT: FaPiggyBank,
  INVESTMENT_ACCOUNT: FaArrowUp,
  CREDIT_CARD: FaCreditCard,
  OTHER: FaWallet,
};

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4",
];

export default function EconomyClient({
  bankAccounts: initialBankAccounts,
  investments,
  totalInvestments,
  totalBankBalance,
  investmentsByCategory,
  recentInvestments,
  monthlyIncome,
  monthlyExpenses,
}: EconomyClientProps) {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Estados para calculadora e metas
  const [availableToSpend, setAvailableToSpend] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [investmentGoal, setInvestmentGoal] = useState(0);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [safetyMargin, setSafetyMargin] = useState(20); // 20% de margem de segurança

  // Função para lidar com ações dos botões das dicas
  const handleTipAction = (action: string) => {
    switch (action) {
      case "Aumentar poupança":
        setActiveTab("goals");
        // Scroll suave para a seção de metas após um pequeno delay
        setTimeout(() => {
          const goalsSection = document.querySelector('[value="goals"]');
          if (goalsSection) {
            goalsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        break;
      case "Revisar despesas":
        router.push("/transactions");
        break;
      case "Criar reserva":
        setActiveTab("goals");
        setTimeout(() => {
          const goalsSection = document.querySelector('[value="goals"]');
          if (goalsSection) {
            goalsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        break;
      case "Ver investimentos":
        router.push("/transactions?type=INVESTMENT");
        break;
      case "Analisar gastos":
        router.push("/analytics");
        break;
      default:
        break;
    }
  };

  // Calcular valores baseados na renda e despesas
  useEffect(() => {
    const balance = monthlyIncome - monthlyExpenses;
    const recommendedSavings = monthlyIncome * 0.2; // 20% para poupança
    const recommendedInvestment = monthlyIncome * 0.1; // 10% para investimentos
    const available = balance - recommendedSavings - recommendedInvestment;
    
    setAvailableToSpend(Math.max(0, available));
    setSavingsGoal(recommendedSavings);
    setInvestmentGoal(recommendedInvestment);
    setEmergencyFund(monthlyExpenses * 6); // 6 meses de despesas
  }, [monthlyIncome, monthlyExpenses]);

  const monthlyBalance = monthlyIncome - monthlyExpenses;
  const savingsPercentage = monthlyIncome > 0 ? (savingsGoal / monthlyIncome) * 100 : 0;
  const investmentPercentage = monthlyIncome > 0 ? (investmentGoal / monthlyIncome) * 100 : 0;
  const spendingPercentage = monthlyIncome > 0 ? (availableToSpend / monthlyIncome) * 100 : 0;

  // Gerar dicas personalizadas
  const generateTips = () => {
    const tips = [];
    
    if (monthlyBalance < 0) {
      tips.push({
        type: "error",
        icon: FaExclamationCircle,
        title: "Gastos maiores que receitas",
        message: "Você está gastando mais do que ganha. Revise suas despesas urgentemente.",
        action: "Revisar despesas",
      });
    }

    if (savingsPercentage < 10) {
      tips.push({
        type: "warning",
        icon: FaBullseye,
        title: "Poupança abaixo do recomendado",
        message: "Recomenda-se guardar pelo menos 20% da renda. Você está guardando apenas " + savingsPercentage.toFixed(1) + "%.",
        action: "Aumentar poupança",
      });
    }

    if (totalBankBalance < emergencyFund) {
      tips.push({
        type: "info",
        icon: FaShieldAlt,
        title: "Reserva de emergência insuficiente",
        message: `Recomenda-se ter R$ ${formatCurrency(emergencyFund)} em reserva (6 meses de despesas). Você tem R$ ${formatCurrency(totalBankBalance)}.`,
        action: "Criar reserva",
      });
    }

    if (monthlyBalance > 0 && investmentGoal > 0 && totalInvestments === 0) {
      tips.push({
        type: "success",
        icon: FaArrowUp,
        title: "Comece a investir!",
        message: "Você tem dinheiro disponível. Comece investindo pelo menos 10% da sua renda.",
        action: "Ver investimentos",
      });
    }

    if (monthlyExpenses > monthlyIncome * 0.5) {
      tips.push({
        type: "warning",
        icon: FaCalculator,
        title: "Despesas muito altas",
        message: "Suas despesas representam mais de 50% da sua renda. Considere reduzir gastos.",
        action: "Analisar gastos",
      });
    }

    return tips;
  };

  const tips = generateTips();

  // Comparador Parcelar vs À Vista
  const calculateInstallmentSavings = (value: number, installments: number, interestRate: number = 0) => {
    const totalWithInterest = value * (1 + interestRate / 100) * installments;
    const savings = totalWithInterest - value;
    const monthlyPayment = totalWithInterest / installments;
    
    return {
      total: totalWithInterest,
      savings,
      monthlyPayment,
      recommendation: savings > value * 0.1 ? "Pague à vista e economize!" : "Parcelar pode ser uma opção",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8">
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              💰 Gênio Financeiro
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sua inteligência artificial para educação financeira e economia
            </p>
          </div>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
              <FaArrowUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gastos Mensais</CardTitle>
              <FaArrowDown className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
              <FaCalculator className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(monthlyBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
              <FaMoneyBillWave className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalBankBalance + totalInvestments)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="tips">Dicas</TabsTrigger>
          </TabsList>

          {/* Tab: Calculadora de Gastos */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaCalculator className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">
                    Quanto Posso Gastar Este Mês?
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Baseado na sua renda e metas de economia
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Distribuição Recomendada */}
                <div className="rounded-lg border-2 bg-primary/5 p-4">
                  <h3 className="mb-4 font-semibold">Distribuição Recomendada da Renda</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Gastos Essenciais</span>
                        <span className="text-sm font-bold">{formatCurrency(availableToSpend)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${spendingPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {spendingPercentage.toFixed(1)}% da renda
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Poupança</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(savingsGoal)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${savingsPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {savingsPercentage.toFixed(1)}% da renda (Recomendado: 20%)
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Investimentos</span>
                        <span className="text-sm font-bold text-purple-600">{formatCurrency(investmentGoal)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${investmentPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {investmentPercentage.toFixed(1)}% da renda (Recomendado: 10%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div className={`rounded-lg border-2 p-6 shadow-lg transition-all ${monthlyBalance >= 0 
                  ? "border-green-500/30 bg-gradient-to-br from-green-500/15 via-green-500/10 to-green-500/5 backdrop-blur-sm" 
                  : "border-red-500/30 bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5 backdrop-blur-sm"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${monthlyBalance >= 0 
                      ? "bg-green-500/20" 
                      : "bg-red-500/20"}`}>
                      {monthlyBalance >= 0 ? (
                        <FaCheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <FaExclamationCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className={`font-bold text-base ${monthlyBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {monthlyBalance >= 0
                          ? "✅ Você pode gastar até"
                          : "⚠️ Atenção: Você está gastando mais do que ganha"}
                      </p>
                      <p className={`text-3xl font-extrabold ${monthlyBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(Math.abs(availableToSpend))}
                      </p>
                      <p className={`text-sm font-medium ${monthlyBalance >= 0 ? "text-green-700/80" : "text-red-700/80"}`}>
                        {monthlyBalance >= 0
                          ? "Este mês (após reservar para poupança e investimentos)"
                          : "Revise suas despesas urgentemente"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparador Parcelar vs À Vista */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaCreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">
                    Parcelar ou Pagar à Vista?
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Compare as opções e veja qual é mais vantajosa
                </p>
              </CardHeader>
              <CardContent>
                <InstallmentCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Metas */}
          <TabsContent value="goals" className="space-y-6">
            <GoalsManager
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              totalBankBalance={totalBankBalance}
              emergencyFund={emergencyFund}
            />
          </TabsContent>

          {/* Tab: Dicas do Gênio */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FaMagic className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">
                    Dicas Personalizadas do Gênio Financeiro
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Recomendações baseadas na sua situação financeira atual
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tips.length > 0 ? (
                    tips.map((tip, index) => {
                      const Icon = tip.icon;
                      const colorClasses = {
                        error: {
                          card: "border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent",
                          iconBg: "bg-red-500/20",
                          icon: "text-red-600 dark:text-red-400",
                          title: "text-red-700 dark:text-red-300",
                          button: "bg-red-500 hover:bg-red-600 text-white border-red-500",
                        },
                        warning: {
                          card: "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent",
                          iconBg: "bg-yellow-500/20",
                          icon: "text-yellow-600 dark:text-yellow-400",
                          title: "text-yellow-700 dark:text-yellow-300",
                          button: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
                        },
                        success: {
                          card: "border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent",
                          iconBg: "bg-green-500/20",
                          icon: "text-green-600 dark:text-green-400",
                          title: "text-green-700 dark:text-green-300",
                          button: "bg-green-500 hover:bg-green-600 text-white border-green-500",
                        },
                        info: {
                          card: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent",
                          iconBg: "bg-blue-500/20",
                          icon: "text-blue-600 dark:text-blue-400",
                          title: "text-blue-700 dark:text-blue-300",
                          button: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
                        },
                      };
                      const colors = colorClasses[tip.type];
                      
                      return (
                        <Card
                          key={index}
                          className={`group relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colors.card}`}
                        >
                          <div className="absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 blur-2xl"
                            style={{
                              backgroundColor: tip.type === "error" ? "#ef4444" : 
                                             tip.type === "warning" ? "#f59e0b" :
                                             tip.type === "success" ? "#10b981" : "#3b82f6"
                            }}
                          />
                          <CardContent className="relative p-6">
                            <div className="flex items-start gap-4">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.iconBg}`}>
                                <Icon className={`h-6 w-6 ${colors.icon}`} />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <h4 className={`font-bold text-lg ${colors.title}`}>{tip.title}</h4>
                                  <p className="text-muted-foreground mt-2 leading-relaxed">{tip.message}</p>
                                </div>
                                <Button
                                  size="sm"
                                  className={`gap-2 transition-all hover:scale-105 ${colors.button}`}
                                  onClick={() => handleTipAction(tip.action)}
                                >
                                  {tip.action}
                                  <FaArrowRight className="h-3 w-3 text-current" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full">
                      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
                        <CardContent className="p-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                            <FaCheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="mb-2 text-lg font-bold text-green-700">Parabéns! Suas finanças estão em ordem!</h3>
                          <p className="text-muted-foreground text-sm">
                            Continue mantendo essa disciplina financeira.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Educação Financeira */}
            <EducationSection onNavigateToTab={setActiveTab} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleting !== null} onOpenChange={() => setIsDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => isDeleting && handleDeleteAccount(isDeleting)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  async function handleDeleteAccount(id: string) {
    const result = await deleteBankAccount(id);
    if (result.success) {
      setBankAccounts(bankAccounts.filter((acc) => acc.id !== id));
      setIsDeleting(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  }
}

// Componente: Calculadora de Parcelas
function InstallmentCalculator() {
  const [purchaseValue, setPurchaseValue] = useState(1000);
  const [installments, setInstallments] = useState(12);
  const [interestRate, setInterestRate] = useState(2.5);

  const result = purchaseValue > 0 ? calculateInstallmentSavings(purchaseValue, installments, interestRate) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="value">Valor da Compra</Label>
          <Input
            id="value"
            type="number"
            value={purchaseValue}
            onChange={(e) => setPurchaseValue(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="installments">Número de Parcelas</Label>
          <Input
            id="installments"
            type="number"
            min="1"
            max="24"
            value={installments}
            onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest">Taxa de Juros Mensal (%)</Label>
          <Input
            id="interest"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Pagar à Vista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(purchaseValue)}
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                Economia de {formatCurrency(result.savings)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Parcelar em {installments}x</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(result.total)}
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatCurrency(result.monthlyPayment)} por mês
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className={`rounded-lg border-2 p-6 shadow-lg transition-all ${result.savings > purchaseValue * 0.1 
          ? "border-green-500/30 bg-gradient-to-br from-green-500/15 via-green-500/10 to-green-500/5 backdrop-blur-sm" 
          : "border-yellow-500/30 bg-gradient-to-br from-yellow-500/15 via-yellow-500/10 to-yellow-500/5 backdrop-blur-sm"}`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${result.savings > purchaseValue * 0.1 
              ? "bg-green-500/20" 
              : "bg-yellow-500/20"}`}>
              <FaLightbulb className={`h-6 w-6 ${result.savings > purchaseValue * 0.1 ? "text-green-600" : "text-yellow-600"}`} />
            </div>
            <div className="flex-1 space-y-2">
              <p className={`font-bold text-base ${result.savings > purchaseValue * 0.1 ? "text-green-700" : "text-yellow-700"}`}>
                {result.recommendation}
              </p>
              {result.savings > purchaseValue * 0.1 && (
                <p className={`text-lg font-semibold ${result.savings > purchaseValue * 0.1 ? "text-green-600" : "text-yellow-600"}`}>
                  💰 Você economizaria {formatCurrency(result.savings)} pagando à vista!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateInstallmentSavings(value: number, installments: number, interestRate: number = 0) {
  const monthlyRate = interestRate / 100;
  const totalWithInterest = value * Math.pow(1 + monthlyRate, installments);
  const savings = totalWithInterest - value;
  const monthlyPayment = totalWithInterest / installments;
  
  return {
    total: totalWithInterest,
    savings,
    monthlyPayment,
    recommendation: savings > value * 0.1 ? "Pague à vista e economize!" : "Parcelar pode ser uma opção",
  };
}

// Componente: Gerenciador de Metas
function GoalsManager({
  monthlyIncome,
  monthlyExpenses,
  totalBankBalance,
  emergencyFund,
}: {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalBankBalance: number;
  emergencyFund: number;
}) {
  const [savingsGoal, setSavingsGoal] = useState(monthlyIncome * 0.2);
  const [investmentGoal, setInvestmentGoal] = useState(monthlyIncome * 0.1);
  const [targetDate, setTargetDate] = useState("");

  const monthsToReachEmergency = emergencyFund > 0 
    ? Math.ceil((emergencyFund - totalBankBalance) / savingsGoal)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaBullseye className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Metas de Economia</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Mensal de Poupança</Label>
              <Input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
              />
              <p className="text-muted-foreground text-xs">
                Recomendado: 20% da renda ({formatCurrency(monthlyIncome * 0.2)})
              </p>
            </div>

            <div className="space-y-2">
              <Label>Meta Mensal de Investimentos</Label>
              <Input
                type="number"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(parseFloat(e.target.value) || 0)}
              />
              <p className="text-muted-foreground text-xs">
                Recomendado: 10% da renda ({formatCurrency(monthlyIncome * 0.1)})
              </p>
            </div>
          </div>

          {/* Progresso da Reserva de Emergência */}
          <div className="rounded-lg border-2 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Reserva de Emergência</h4>
                <p className="text-muted-foreground text-sm">
                  Meta: {formatCurrency(emergencyFund)} (6 meses de despesas)
                </p>
              </div>
              <Badge variant={totalBankBalance >= emergencyFund ? "default" : "secondary"}>
                {((totalBankBalance / emergencyFund) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${Math.min((totalBankBalance / emergencyFund) * 100, 100)}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Você tem {formatCurrency(totalBankBalance)} de {formatCurrency(emergencyFund)}
              {monthsToReachEmergency > 0 && (
                <span> • Faltam {monthsToReachEmergency} meses para completar</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente: Seção de Educação Financeira
function EducationSection({ onNavigateToTab }: { onNavigateToTab: (tab: string) => void }) {
  const educationTopics = [
    {
      title: "Regra 50/30/20",
      description: "50% para necessidades, 30% para desejos, 20% para poupança e investimentos",
      icon: FaCalculator,
      details: `A Regra 50/30/20 é uma estratégia simples e eficaz criada pela senadora americana Elizabeth Warren para gerenciar suas finanças pessoais. Ela divide sua renda líquida em três categorias principais, garantindo que você sempre tenha dinheiro para o essencial, para seus desejos e para construir seu futuro financeiro.

📊 **50% - Necessidades Essenciais**
Essas são as despesas que você não pode evitar e que são fundamentais para sua sobrevivência e bem-estar básico:
- Aluguel ou financiamento da casa
- Alimentação básica (supermercado, não restaurantes)
- Transporte (combustível, passagem, manutenção)
- Contas de água, luz, internet, telefone
- Seguro de saúde e despesas médicas essenciais
- Pagamentos mínimos de dívidas
- Roupas básicas e necessárias

💡 **Dica:** Se suas necessidades ultrapassam 50%, considere reduzir custos ou aumentar sua renda.

🎯 **30% - Desejos e Estilo de Vida**
Aqui entram os gastos que melhoram sua qualidade de vida, mas não são essenciais:
- Entretenimento (cinema, shows, jogos)
- Restaurantes e delivery
- Viagens e passeios
- Hobbies e atividades de lazer
- Compras não essenciais
- Assinaturas de streaming e serviços
- Roupas e acessórios de marca

💡 **Dica:** Este é o primeiro lugar para cortar se precisar economizar mais!

💰 **20% - Poupança e Investimentos**
Esta é a parte mais importante para seu futuro financeiro:
- Reserva de emergência (prioridade máxima!)
- Investimentos de longo prazo
- Aposentadoria
- Pagamento de dívidas além do mínimo
- Educação e desenvolvimento pessoal
- Investimentos em você mesmo

💡 **Dica:** Este percentual é o mínimo! Se conseguir economizar mais, melhor ainda!

✅ **Como aplicar na prática:**
1. Calcule sua renda líquida (após impostos e descontos)
2. Divida proporcionalmente conforme a regra
3. Ajuste conforme sua realidade (ex: se mora com os pais, pode economizar mais)
4. Revise mensalmente e ajuste conforme necessário
5. Use a calculadora desta página para ver seus valores ideais!`,
    },
    {
      title: "Reserva de Emergência",
      description: "Mantenha 6 meses de despesas guardadas para imprevistos",
      icon: FaShieldAlt,
      details: `A Reserva de Emergência é o seu "colchão financeiro" - uma quantia guardada especificamente para cobrir despesas inesperadas ou perda de renda. É a base da sua segurança financeira e o primeiro passo para qualquer planejamento financeiro sério. Sem ela, você está sempre um imprevisto longe de uma crise financeira.

🎯 **Por que é tão importante?**
A vida é imprevisível, e ter uma reserva de emergência é como ter um seguro para sua tranquilidade:
- Cobertura para despesas médicas inesperadas (acidentes, doenças)
- Proteção em caso de desemprego ou redução de renda
- Reparos urgentes em casa ou carro (vazamento, pane)
- Emergências familiares (viagem urgente, ajuda a parentes)
- Evita necessidade de empréstimos com juros altos
- Proporciona tranquilidade e paz de espírito
- Permite aproveitar oportunidades (descontos, investimentos)

💵 **Quanto guardar?**
A regra geral varia conforme sua situação:
- Mínimo recomendado: 3 meses de despesas essenciais
- Ideal para a maioria: 6 meses de despesas totais
- Para autônomos/freelancers: 12 meses (maior instabilidade de renda)
- Para funcionários públicos: 3-6 meses (maior estabilidade)

💡 **Exemplo prático:** Se suas despesas mensais são R$ 3.000, sua reserva ideal seria R$ 18.000 (6 meses).

📈 **Onde guardar?**
A reserva precisa estar acessível, mas também precisa render um pouco:
- Conta poupança de fácil acesso (rendimento baixo, mas seguro)
- CDB com liquidez diária (melhor rendimento, ainda acessível)
- Tesouro Selic (resgate rápido, rendimento melhor)
- Conta corrente com rendimento automático

⚠️ **Evite:** Investimentos de risco, ações, fundos imobiliários, ou qualquer coisa com prazo fixo que não possa ser resgatada rapidamente.

✅ **Como construir sua reserva:**
1. Defina sua meta (ex: R$ 30.000) - use a calculadora desta página!
2. Calcule quanto pode guardar por mês (mesmo que seja R$ 50)
3. Automatize a transferência (configure débito automático)
4. Trate como despesa fixa, não como "sobra"
5. Não use para gastos não emergenciais (férias, compras)
6. Replenhe imediatamente após usar
7. Revise anualmente e ajuste conforme suas despesas mudarem

🚀 **Dica de ouro:** Comece pequeno, mas comece hoje! R$ 50 por mês já é um começo.`,
    },
    {
      title: "Juros Compostos",
      description: "Quanto antes você investir, mais seu dinheiro trabalha para você",
      icon: FaArrowUp,
      details: `Juros Compostos são considerados a "oitava maravilha do mundo" por Albert Einstein. É quando você ganha juros sobre o valor inicial investido E sobre os juros já acumulados - os "juros sobre juros". É o poder do tempo trabalhando a seu favor, fazendo seu dinheiro crescer exponencialmente.

📊 **Como funciona na prática:**
Vamos ver um exemplo simples:
- Investimento inicial: R$ 1.000
- Taxa: 1% ao mês (12% ao ano)
- Mês 1: R$ 1.010 (R$ 1.000 + R$ 10 de juros)
- Mês 2: R$ 1.020,10 (R$ 1.010 + R$ 10,10 de juros - ganhou juros sobre os juros!)
- Mês 3: R$ 1.030,30 (R$ 1.020,10 + R$ 10,20)
- Após 1 ano: R$ 1.126,83 (ganhou R$ 126,83!)
- Após 5 anos: R$ 1.816,70 (quase dobrou!)

💡 **Regra dos 72 - Sua calculadora mental:**
Divida 72 pela taxa de juros anual para saber em quantos anos seu dinheiro dobrará.
- Exemplo 1: 12% ao ano = 72/12 = 6 anos para dobrar
- Exemplo 2: 6% ao ano = 72/6 = 12 anos para dobrar
- Exemplo 3: 24% ao ano = 72/24 = 3 anos para dobrar

⏰ **O poder do tempo - Exemplos reais:**
Veja como começar cedo faz TODA a diferença:

Cenário 1 - Começando aos 25 anos:
- Investindo R$ 100/mês por 40 anos a 10% ao ano = R$ 637.000
- Total investido: R$ 48.000
- Ganho com juros: R$ 589.000! 🚀

Cenário 2 - Começando aos 35 anos:
- Investindo R$ 200/mês por 30 anos a 10% ao ano = R$ 434.000
- Total investido: R$ 72.000
- Ganho com juros: R$ 362.000

💡 **Mesmo investindo o dobro por mês, começando 10 anos depois você tem MENOS dinheiro!**

🎯 **Como aproveitar os juros compostos:**
1. Comece o quanto antes - cada ano conta muito!
2. Invista regularmente (mensalmente é ideal)
3. Deixe o tempo trabalhar (não retire antes do tempo)
4. Reinvesta os juros recebidos (não gaste os rendimentos)
5. Use para objetivos de longo prazo (aposentadoria, casa própria)
6. Seja paciente - os maiores ganhos vêm nos últimos anos

💰 **Dica de ouro:** 
Mesmo com valores pequenos, comece hoje! R$ 50 por mês investidos desde os 20 anos podem se tornar mais de R$ 300.000 aos 60 anos (a 10% ao ano). O tempo é seu maior aliado!`,
    },
    {
      title: "Evite Dívidas",
      description: "Pague cartões de crédito em dia e evite juros altos",
      icon: FaExclamationCircle,
      details: `Dívidas podem ser o maior obstáculo para sua liberdade financeira. Entender a diferença entre dívidas boas e ruins, e como gerenciá-las, é fundamental para construir riqueza. Uma dívida mal gerenciada pode consumir anos de sua vida financeira.

⚠️ **Tipos de Dívidas - Conheça a diferença:**

💰 **Boa Dívida (Investimento):**
São dívidas que geram valor ou renda:
- Financiamento de imóvel (gera patrimônio e pode valorizar)
- Educação/curso (aumenta sua renda futura)
- Investimento em negócio próprio (pode gerar lucro)
- Empréstimo para investir (se o retorno > juros)

💸 **Má Dívida (Consumo):**
São dívidas que só tiram dinheiro do seu bolso:
- Cartão de crédito rotativo (juros de até 300% ao ano!)
- Cheque especial (juros altíssimos)
- Empréstimo pessoal (juros altos, sem gerar valor)
- Compras parceladas com juros (celular, eletrônicos)
- Empréstimo consignado desnecessário

🚫 **Evite ESPECIALMENTE estas armadilhas:**
- Cartão de crédito rotativo: Juros médios de 300% ao ano (R$ 1.000 vira R$ 4.000 em 1 ano!)
- Cheque especial: Juros de até 200% ao ano
- Parcelamento com juros: Você paga muito mais pelo mesmo produto
- Empréstimos para pagar outras dívidas: Só aumenta o problema

💡 **Regra de ouro:** Se os juros da dívida são maiores que o retorno de um investimento seguro, pague a dívida primeiro!

✅ **Estratégias para evitar dívidas:**
1. **Faça um orçamento** e siga-o rigorosamente (use a calculadora desta página!)
2. **Pague à vista** quando possível (geralmente tem desconto de 5-10%)
3. **Use cartão de crédito** apenas se puder pagar a fatura completa
4. **Construa reserva de emergência** para não precisar emprestar em emergências
5. **Evite compras por impulso** - espere 24-48h antes de comprar
6. **Compare preços** antes de comprar (pesquise online)
7. **Negocie descontos** pagando à vista
8. **Viva abaixo das suas posses** - não tente impressionar ninguém

💳 **Se já tem dívidas - Plano de ação:**
1. **Liste todas as dívidas** (valor, juros mensais, prazo)
2. **Priorize pagar as de maior juros primeiro** (método avalanche)
3. **Negocie com credores** (desconto, parcelamento, redução de juros)
4. **Considere consolidar** (se a taxa consolidada for menor)
5. **Não contraia novas dívidas** enquanto paga as antigas
6. **Use a calculadora de parcelas** desta página para comparar opções

📈 **Meta final:**
- Zero dívidas de consumo
- Apenas dívidas que geram valor (investimentos)
- Liberdade financeira para escolher como usar seu dinheiro

🚀 **Lembre-se:** Cada real que você não paga de juros é um real que pode ser investido e gerar mais dinheiro para você!`,
    },
  ];

  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaLightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Educação Financeira</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Clique em um tópico para aprender mais detalhes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {educationTopics.map((topic, index) => {
              const Icon = topic.icon;
              const colors = [
                "from-blue-500/10 to-blue-500/5 border-blue-500/30",
                "from-green-500/10 to-green-500/5 border-green-500/30",
                "from-purple-500/10 to-purple-500/5 border-purple-500/30",
                "from-orange-500/10 to-orange-500/5 border-orange-500/30",
              ];
              const iconColors = [
                "bg-blue-500/20 text-blue-600 dark:text-blue-400",
                "bg-green-500/20 text-green-600 dark:text-green-400",
                "bg-purple-500/20 text-purple-600 dark:text-purple-400",
                "bg-orange-500/20 text-orange-600 dark:text-orange-400",
              ];
              const colorClass = colors[index % colors.length];
              const iconClass = iconColors[index % iconColors.length];
              
              return (
                <Card
                  key={index}
                  className={`group relative cursor-pointer overflow-hidden border-2 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${colorClass}`}
                  onClick={() => setSelectedTopic(index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconClass.split(" ")[0]}`}>
                        <Icon className={`h-6 w-6 ${iconClass.split(" ")[1]} ${iconClass.split(" ")[2] || ""}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-bold text-base">{topic.title}</h4>
                        <p className="text-muted-foreground leading-relaxed text-sm">{topic.description}</p>
                        <Button variant="ghost" size="sm" className="mt-3 gap-2 text-xs">
                          Ler mais <FaArrowRight className="h-3 w-3 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={selectedTopic !== null} onOpenChange={() => setSelectedTopic(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          {selectedTopic !== null && (
            <div className="relative">
              {/* Header com gradiente */}
              <div className={`relative overflow-hidden rounded-t-lg px-6 py-8 ${
                selectedTopic === 0 ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" :
                selectedTopic === 1 ? "bg-gradient-to-br from-green-500 via-green-600 to-green-700" :
                selectedTopic === 2 ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700" :
                "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
              }`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm ${
                    selectedTopic === 0 ? "shadow-blue-500/50" :
                    selectedTopic === 1 ? "shadow-green-500/50" :
                    selectedTopic === 2 ? "shadow-purple-500/50" :
                    "shadow-orange-500/50"
                  } shadow-xl`}>
                    {(() => {
                      const Icon = educationTopics[selectedTopic].icon;
                      return <Icon className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="mb-2 text-2xl font-bold text-white">
                      {educationTopics[selectedTopic].title}
                    </DialogTitle>
                    <p className="text-white/90 text-sm">
                      {educationTopics[selectedTopic].description}
                    </p>
                  </div>
                </div>
                {/* Decoração */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 dark:bg-white/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 dark:bg-white/5 blur-2xl" />
              </div>

              {/* Conteúdo */}
              <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
                <EducationContent 
                  topic={educationTopics[selectedTopic]} 
                  index={selectedTopic}
                  onClose={() => setSelectedTopic(null)}
                  onNavigateToTab={onNavigateToTab}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente: Conteúdo do Modal de Educação
function EducationContent({ 
  topic, 
  index,
  onClose,
  onNavigateToTab
}: { 
  topic: any; 
  index: number;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}) {
  const colors = [
    { bg: "bg-blue-500/10 dark:bg-blue-500/20", border: "border-blue-500/30 dark:border-blue-500/50", text: "text-blue-700 dark:text-blue-300", icon: "text-blue-600 dark:text-blue-400" },
    { bg: "bg-green-500/10 dark:bg-green-500/20", border: "border-green-500/30 dark:border-green-500/50", text: "text-green-700 dark:text-green-300", icon: "text-green-600 dark:text-green-400" },
    { bg: "bg-purple-500/10 dark:bg-purple-500/20", border: "border-purple-500/30 dark:border-purple-500/50", text: "text-purple-700 dark:text-purple-300", icon: "text-purple-600 dark:text-purple-400" },
    { bg: "bg-orange-500/10 dark:bg-orange-500/20", border: "border-orange-500/30 dark:border-orange-500/50", text: "text-orange-700 dark:text-orange-300", icon: "text-orange-600 dark:text-orange-400" },
  ];
  const color = colors[index % colors.length];

  // Parse do conteúdo markdown simples
  const sections = topic.details.split(/\n\n/).filter((s: string) => s.trim());

  return (
    <div className="space-y-6">
      {sections.map((section: string, idx: number) => {
        const lines = section.split("\n").filter(l => l.trim());
        const firstLine = lines[0] || "";
        const isHeader = firstLine.includes("**") && firstLine.includes(":");
        const isList = lines.some(l => l.trim().startsWith("-"));
        const isNumberedList = lines.some(l => /^\d+\./.test(l.trim()));

        if (isHeader) {
          const headerMatch = firstLine.match(/\*\*(.+?)\*\*/);
          const headerText = headerMatch ? headerMatch[1] : "";
          const emojiMatch = firstLine.match(/^([📊🎯💰💵📈✅💡⏰🚫⚠️💳🚀])/);
          const emoji = emojiMatch ? emojiMatch[1] : "";
          const content = lines.slice(1);

          return (
            <Card key={idx} className={`${color.bg} ${color.border} border-2 shadow-sm`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {emoji && <span className="text-2xl">{emoji}</span>}
                  <CardTitle className={`${color.text} text-lg font-bold`}>
                    {headerText}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isList || isNumberedList ? (
                  <ul className="space-y-2">
                    {content.map((item: string, itemIdx: number) => {
                      const cleanItem = item.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "");
                      return (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <span className={`${color.icon} mt-1 shrink-0`}>
                            {isNumberedList ? (
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${color.bg} ${color.border} border-2 text-xs font-bold ${color.text}`}>
                                {itemIdx + 1}
                              </div>
                            ) : (
                              <div className={`h-2 w-2 rounded-full ${color.icon.replace("text-", "bg-").replace("-600", "-500").replace("-400", "-500")} mt-2`} />
                            )}
                          </span>
                          <span className="text-foreground leading-relaxed">{cleanItem}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : content.length > 0 ? (
                  <div className="space-y-2">
                    {content.map((line: string, lineIdx: number) => {
                      // Se a linha começa com emoji e texto em negrito, trata como sub-header
                      const subHeaderMatch = line.match(/^([📊🎯💰💵📈✅💡⏰🚫⚠️💳🚀])\s*\*\*(.+?)\*\*[:\s]*(.*)$/);
                      if (subHeaderMatch) {
                        const [, subEmoji, subTitle, subContent] = subHeaderMatch;
                        return (
                          <div key={lineIdx} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{subEmoji}</span>
                              <span className={`${color.text} font-semibold`}>{subTitle}</span>
                            </div>
                            {subContent && (
                              <p className="text-foreground leading-relaxed ml-7">{subContent}</p>
                            )}
                          </div>
                        );
                      }
                      // Linha normal de texto
                      return (
                        <p key={lineIdx} className="text-foreground leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">Sem conteúdo adicional</p>
                )}
              </CardContent>
            </Card>
          );
        }

        // Seção simples de texto
        return (
          <div key={idx} className="rounded-lg bg-muted/50 p-4">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {section}
            </p>
          </div>
        );
      })}

      {/* Call to Action */}
      <Card className={`${color.bg} ${color.border} border-2 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color.bg.replace("/10", "/20").replace("/20", "/30")}`}>
              <FaLightbulb className={`h-6 w-6 ${color.icon}`} />
            </div>
            <div className="flex-1">
              <h4 className={`${color.text} mb-2 font-bold text-lg`}>
                Pronto para aplicar?
              </h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Use as ferramentas desta página para calcular seus valores ideais e começar a aplicar este conceito hoje mesmo!
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${color.border} ${color.text} border-2 hover:opacity-80 transition-opacity`}
                  onClick={() => {
                    onClose();
                    onNavigateToTab("calculator");
                    setTimeout(() => {
                      const calculatorSection = document.querySelector('[value="calculator"]');
                      if (calculatorSection) {
                        calculatorSection.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }, 100);
                  }}
                >
                  <FaCalculator className="mr-2 h-4 w-4 text-current" />
                  Usar Calculadora
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${color.border} ${color.text} border-2 hover:opacity-80 transition-opacity`}
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      onNavigateToTab("goals");
                      setTimeout(() => {
                        const tabsContainer = document.querySelector('[role="tablist"]');
                        if (tabsContainer) {
                          tabsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 150);
                    }, 100);
                  }}
                >
                  <FaBullseye className="mr-2 h-4 w-4 text-current" />
                  Criar Meta
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente: Gerenciador de Contas
function BankAccountsManager({
  bankAccounts,
  setBankAccounts,
  setIsDialogOpen,
  setIsDeleting,
  router,
}: any) {
  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    accountType: "CHECKING_ACCOUNT" as const,
    balance: 0,
    color: COLORS[0],
    icon: "🏦",
  });

  const handleCreateAccount = async () => {
    const result = await createBankAccount(formData);
    if (result.success) {
      setIsDialogOpen(false);
      setFormData({
        name: "",
        bankName: "",
        accountType: "CHECKING_ACCOUNT",
        balance: 0,
        color: COLORS[0],
        icon: "🏦",
      });
      router.refresh();
      const updatedAccounts = await getBankAccounts();
      if (updatedAccounts.success) {
        setBankAccounts(updatedAccounts.data);
      }
    } else {
      alert(result.error);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Contas Vinculadas</CardTitle>
            <p className="text-muted-foreground text-sm">
              Gerencie todas as suas contas bancárias
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FaPlus className="h-4 w-4 text-current" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Conta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Conta Corrente Nubank"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nome do Banco</Label>
                  <Input
                    id="bankName"
                    placeholder="Ex: Nubank, Itaú, Bradesco"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Ícone/Emoji</Label>
                    <Input
                      id="icon"
                      placeholder="🏦"
                      maxLength={2}
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateAccount} className="w-full">
                  Adicionar Conta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bankAccounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bankAccounts.map((account: BankAccount) => {
              const IconComponent = ACCOUNT_TYPE_ICONS[account.accountType] || FaWallet;
              return (
                <Card
                  key={account.id}
                  className="group relative overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ borderColor: account.color || "#e5e7eb" }}
                >
                  <div
                    className="absolute top-0 h-1 w-full"
                    style={{ backgroundColor: account.color || "#3b82f6" }}
                  />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{account.icon || "🏦"}</span>
                        <div>
                          <CardTitle className="text-sm font-semibold">{account.name}</CardTitle>
                          <p className="text-muted-foreground text-xs">{account.bankName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setIsDeleting(account.id)}
                      >
                        <FaTrash className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {ACCOUNT_TYPE_LABELS[account.accountType]}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(Number(account.balance))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <FaWallet className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground mb-4 text-sm">Nenhuma conta vinculada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
