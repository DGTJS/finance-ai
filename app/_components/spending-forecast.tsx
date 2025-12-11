"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/app/_lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: Date;
  installments?: number | null;
  currentInstallment?: number | null;
}

interface SpendingForecastProps {
  upcomingTransactions: Transaction[];
  currentBalance: number;
}

export default function SpendingForecast({
  upcomingTransactions,
  currentBalance,
}: SpendingForecastProps) {
  const [mounted, setMounted] = useState(false);
  const [closingDay, setClosingDay] = useState<number>(5);
  const [tempClosingDay, setTempClosingDay] = useState<number>(5);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar dia de fechamento do localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("closingDay");
    if (saved) {
      const day = parseInt(saved);
      setClosingDay(day);
      setTempClosingDay(day);
    }
  }, []);

  // Evitar hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleSave = () => {
    localStorage.setItem("closingDay", tempClosingDay.toString());
    setClosingDay(tempClosingDay);
    setIsOpen(false);
  };

  // Calcular próxima data de fechamento
  const getNextClosingDate = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const closingDate = new Date(today);

    if (currentDay >= closingDay) {
      // Próximo mês
      closingDate.setMonth(closingDate.getMonth() + 1);
    }

    closingDate.setDate(closingDay);
    return closingDate;
  };

  const nextClosingDate = getNextClosingDate();

  // Filtrar transações até a data de fechamento
  const forecastTransactions = upcomingTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate <= nextClosingDate && transactionDate >= new Date();
  });

  const totalForecast = forecastTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const balanceAfterExpenses = currentBalance - totalForecast;

  const daysUntilClosing = Math.ceil(
    (nextClosingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  // Status da previsão
  const getStatus = () => {
    if (balanceAfterExpenses < 0) {
      return {
        color: "text-red-500",
        bg: "bg-red-500/10",
        icon: AlertCircle,
        message: "Saldo insuficiente!",
      };
    } else if (balanceAfterExpenses < totalForecast * 0.2) {
      return {
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        icon: AlertCircle,
        message: "Atenção ao saldo",
      };
    } else {
      return {
        color: "text-green-500",
        bg: "bg-green-500/10",
        icon: CheckCircle2,
        message: "Saldo saudável",
      };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="text-primary h-5 w-5" />
            Previsão de Gastos
          </CardTitle>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Configurar Dia de Fechamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">
                    Dia do Fechamento/Pagamento
                  </Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={tempClosingDay}
                    onChange={(e) =>
                      setTempClosingDay(parseInt(e.target.value) || 1)
                    }
                    className="text-lg"
                  />
                  <p className="text-muted-foreground text-xs">
                    Escolha o dia do mês que você recebe seu salário ou o dia de
                    fechamento da sua fatura.
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-3 text-sm">
                  <p className="font-medium">Próximo fechamento:</p>
                  <p className="text-muted-foreground">
                    {new Date(
                      new Date().setDate(tempClosingDay),
                    ).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <Button onClick={handleSave} className="w-full">
                  Salvar Configuração
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground text-sm">
          Gastos previstos até dia{" "}
          <span className="text-primary font-semibold">{closingDay}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumo da Previsão */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Total Previsto */}
          <div className="bg-card rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Total Previsto</p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(totalForecast)}
            </p>
            <p className="text-muted-foreground text-xs">
              {forecastTransactions.length} transaç
              {forecastTransactions.length === 1 ? "ão" : "ões"}
            </p>
          </div>

          {/* Saldo após gastos */}
          <div className={`rounded-lg border p-3 ${status.bg}`}>
            <p className="text-muted-foreground text-xs">Saldo Previsto</p>
            <p className={`text-2xl font-bold ${status.color}`}>
              {formatCurrency(balanceAfterExpenses)}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <StatusIcon className={`h-3 w-3 ${status.color}`} />
              <p className={`text-xs font-medium ${status.color}`}>
                {status.message}
              </p>
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="bg-primary/5 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Faltam</p>
              <p className="text-primary text-lg font-bold">
                {daysUntilClosing} dias
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Próximo fechamento</p>
            <p className="text-sm font-semibold">
              {nextClosingDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>

        {/* Lista de Próximos Gastos */}
        {forecastTransactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-semibold">
              Próximos gastos ({forecastTransactions.length}):
            </p>
            <div className="max-h-[200px] space-y-2 overflow-y-auto">
              {forecastTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-2 text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(transaction.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {transaction.installments &&
                        transaction.currentInstallment && (
                          <span className="ml-2">
                            • {transaction.currentInstallment}/
                            {transaction.installments}x
                          </span>
                        )}
                    </p>
                  </div>
                  <p className="font-bold text-red-500">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
              {forecastTransactions.length > 5 && (
                <p className="text-muted-foreground text-center text-xs">
                  +{forecastTransactions.length - 5} mais
                </p>
              )}
            </div>
          </div>
        )}

        {forecastTransactions.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <TrendingUp className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              Nenhum gasto previsto até o dia {closingDay}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
