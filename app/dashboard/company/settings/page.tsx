"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompany, useCompanyContext } from "@/app/_contexts/company-context";
import { updateCompany } from "@/app/_actions/company";
import { countCompanyProducts } from "@/app/_actions/company/count-products";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Loader2, ArrowLeft, Building2, Users, Package } from "lucide-react";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const router = useRouter();
  const company = useCompany();
  const { setCompany } = useCompanyContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<
    "MEI" | "EIRELI" | "LTDA" | "OUTROS"
  >("MEI");
  const [hasStock, setHasStock] = useState(false);
  const [hasEmployees, setHasEmployees] = useState(false);
  const [hasPartners, setHasPartners] = useState(false);
  const [numberOfPartners, setNumberOfPartners] = useState("");

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName);
      setCompanyType(company.companyType);
      setHasStock(company.hasStock);
      setIsLoading(false);
    }
  }, [company]);

  const handleSave = async () => {
    if (!company) return;

    if (!companyName.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    // Verificar se está desabilitando estoque e há produtos cadastrados
    if (company.hasStock && !hasStock) {
      const productsResult = await countCompanyProducts(company.companyId);
      if (productsResult.success && productsResult.count > 0) {
        const confirmed = window.confirm(
          `Você tem ${productsResult.count} produto(s) cadastrado(s). Ao desabilitar o controle de estoque, você não poderá mais gerenciar produtos. Deseja continuar?`,
        );
        if (!confirmed) {
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const result = await updateCompany(company.companyId, {
        name: companyName.trim(),
        companyType,
        hasStock,
        // hasEmployees, hasPartners e numberOfPartners serão salvos em uma futura versão
        // Por enquanto, apenas hasStock é persistido no banco
      });

      if (result.success && result.data) {
        // Atualizar contexto
        setCompany(result.data);
        toast.success("Configurações salvas com sucesso!");
        router.push("/dashboard/company");
      } else {
        toast.error(result.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !company) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Configurações da Empresa
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie as informações da sua empresa
            </p>
          </div>
        </div>

        {/* Formulário de Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Atualize as informações da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Minha Empresa LTDA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Tipo de Empresa *</Label>
              <select
                id="companyType"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as any)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="MEI">MEI</option>
                <option value="EIRELI">EIRELI</option>
                <option value="LTDA">LTDA</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>

            {/* Opções da Empresa */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">
                Características da Empresa
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasStock"
                    checked={hasStock}
                    onCheckedChange={(checked) => setHasStock(checked === true)}
                  />
                  <div className="flex flex-1 items-center gap-2">
                    <Label
                      htmlFor="hasStock"
                      className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                    >
                      <Package className="h-4 w-4" />
                      Possui controle de estoque
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEmployees"
                    checked={hasEmployees}
                    onCheckedChange={(checked) =>
                      setHasEmployees(checked === true)
                    }
                  />
                  <div className="flex flex-1 items-center gap-2">
                    <Label
                      htmlFor="hasEmployees"
                      className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                    >
                      <Users className="h-4 w-4" />
                      Possui funcionários
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPartners"
                      checked={hasPartners}
                      onCheckedChange={(checked) => {
                        setHasPartners(checked === true);
                        if (!checked) setNumberOfPartners("");
                      }}
                    />
                    <div className="flex flex-1 items-center gap-2">
                      <Label
                        htmlFor="hasPartners"
                        className="cursor-pointer text-sm font-normal"
                      >
                        Possui sócios
                      </Label>
                    </div>
                  </div>

                  {hasPartners && (
                    <div className="ml-6 space-y-2">
                      <Label
                        htmlFor="numberOfPartners"
                        className="text-muted-foreground text-xs"
                      >
                        Quantidade de sócios
                      </Label>
                      <Input
                        id="numberOfPartners"
                        type="number"
                        min="1"
                        value={numberOfPartners}
                        onChange={(e) => setNumberOfPartners(e.target.value)}
                        placeholder="Ex: 2"
                        className="max-w-[200px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black text-white hover:bg-gray-900"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
