"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/app/_contexts/company-context";
import { getCompanyRevenuesThisMonth } from "@/app/_actions/company-revenue";
import RevenueManager from "./_components/revenue-manager";
import { Building2, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

interface Revenue {
  id: string;
  amount: number;
  origin: string;
  paymentMethod: string;
  date: Date;
  description: string | null;
}

export default function CompanyRevenuePage() {
  const company = useCompany();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (company) {
      loadRevenues();
    }
  }, [company]);

  const loadRevenues = async () => {
    if (!company) return;

    setIsLoading(true);
    try {
      const result = await getCompanyRevenuesThisMonth(company.companyId);
      if (result.success) {
        setRevenues(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!company) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma empresa ativa. Crie uma empresa primeiro.
          </p>
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

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="text-primary h-6 w-6" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Receitas
              </h1>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Receita
            </Button>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {company.companyName} - Controle de receitas
          </p>
        </div>

        {/* Total do Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              Total do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : (
              <p className="text-primary text-3xl font-bold">
                {formatCurrency(total)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lista de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Carregando...
              </p>
            ) : revenues.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center">
                <p className="mb-2">Nenhuma receita registrada este mês</p>
                <p className="text-xs">Clique em "Nova Receita" para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {revenues.map((revenue) => (
                  <div
                    key={revenue.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {formatCurrency(revenue.amount)}
                        </h3>
                        <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 text-xs">
                          {revenue.origin}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {revenue.paymentMethod} • {formatDate(revenue.date)}
                      </p>
                      {revenue.description && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {revenue.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciador de Receitas */}
        <RevenueManager
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          companyId={company.companyId}
          onSuccess={loadRevenues}
        />
      </div>
    </div>
  );
}
