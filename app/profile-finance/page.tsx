"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getFinancialProfile,
  upsertFinancialProfile,
  addBenefit,
  updateBenefit,
  removeBenefit,
  getMonthlyProjection,
} from "@/app/_actions/financial-profile";
import {
  FinancialProfileInput,
  BenefitInput,
} from "@/app/_actions/financial-profile/schema";
import { IncomeSection } from "./_components/income-section";
import { BenefitsList } from "./_components/benefits-list";
import { PaymentDayPicker } from "./_components/payment-day-picker";
import { ProfileCard } from "./_components/profile-card";
import { OnboardingModal } from "./_components/onboarding-modal";

export default function ProfileFinancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<FinancialProfileInput | null>(null);
  const [projection, setProjection] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Estados do formulário
  const [rendaFixa, setRendaFixa] = useState(0);
  const [rendaVariavelMedia, setRendaVariavelMedia] = useState(0);
  const [beneficios, setBeneficios] = useState<BenefitInput[]>([]);
  const [diaPagamento, setDiaPagamento] = useState<number | null>(null);
  const [multiplePayments, setMultiplePayments] = useState<any[] | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const result = await getFinancialProfile();
      if (result.success) {
        if (result.data) {
          setProfile(result.data);
          setRendaFixa(result.data.rendaFixa);
          setRendaVariavelMedia(result.data.rendaVariavelMedia);
          setBeneficios(result.data.beneficios || []);
          setDiaPagamento(result.data.diaPagamento);
          setMultiplePayments(result.data.multiplePayments);
          loadProjection();
        } else {
          // Primeiro acesso - mostrar onboarding
          setShowOnboarding(true);
        }
      } else {
        toast.error(result.error || "Erro ao carregar perfil");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil financeiro");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjection = async () => {
    try {
      const result = await getMonthlyProjection();
      if (result.success && result.data) {
        setProjection(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar projeção:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: FinancialProfileInput = {
        rendaFixa,
        rendaVariavelMedia,
        beneficios,
        diaPagamento,
        multiplePayments,
      };

      const result = await upsertFinancialProfile(data);
      if (result.success) {
        toast.success("Perfil financeiro salvo com sucesso!");
        setProfile(result.data);
        await loadProjection();
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar perfil financeiro");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndProject = async () => {
    await handleSave();
    if (activeTab !== "projection") {
      setActiveTab("projection");
    }
  };

  const handleAddBenefit = async (benefit: BenefitInput) => {
    const result = await addBenefit(benefit);
    if (result.success) {
      setBeneficios(result.data || []);
      return Promise.resolve();
    } else {
      toast.error(result.error || "Erro ao adicionar benefício");
      return Promise.reject(new Error(result.error));
    }
  };

  const handleEditBenefit = async (index: number, benefit: BenefitInput) => {
    const result = await updateBenefit(index, benefit);
    if (result.success) {
      setBeneficios(result.data || []);
      return Promise.resolve();
    } else {
      toast.error(result.error || "Erro ao editar benefício");
      return Promise.reject(new Error(result.error));
    }
  };

  const handleRemoveBenefit = async (index: number) => {
    const result = await removeBenefit(index);
    if (result.success) {
      setBeneficios(result.data || []);
      return Promise.resolve();
    } else {
      toast.error(result.error || "Erro ao remover benefício");
      return Promise.reject(new Error(result.error));
    }
  };

  const handleOnboardingComplete = async (data: FinancialProfileInput) => {
    setRendaFixa(data.rendaFixa);
    setRendaVariavelMedia(data.rendaVariavelMedia);
    setBeneficios(data.beneficios || []);
    setDiaPagamento(data.diaPagamento);
    setMultiplePayments(data.multiplePayments);
    await handleSave();
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil Financeiro</h1>
        <p className="text-muted-foreground text-sm">
          Configure sua renda, benefícios e dias de pagamento para obter insights personalizados
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="projection">Projeção</TabsTrigger>
          <TabsTrigger value="goals" className="hidden sm:block">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileCard profile={profile} projection={projection} />

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Atualize suas informações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <IncomeSection
                rendaFixa={rendaFixa}
                rendaVariavelMedia={rendaVariavelMedia}
                onRendaFixaChange={setRendaFixa}
                onRendaVariavelChange={setRendaVariavelMedia}
                disabled={isSaving}
              />

              <BenefitsList
                beneficios={beneficios}
                onAdd={handleAddBenefit}
                onEdit={handleEditBenefit}
                onRemove={handleRemoveBenefit}
                disabled={isSaving}
              />

              <PaymentDayPicker
                diaPagamento={diaPagamento}
                multiplePayments={multiplePayments}
                onDiaPagamentoChange={setDiaPagamento}
                onMultiplePaymentsChange={setMultiplePayments}
                disabled={isSaving}
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAndProject}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Salvar e Ver Projeção
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projeção Mensal</CardTitle>
              <CardDescription>
                Análise do seu saldo previsto para o mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projection ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-muted-foreground text-sm">Renda Total</p>
                      <p className="text-xl font-bold">
                        R$ {projection.rendaTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-muted-foreground text-sm">Total de Benefícios</p>
                      <p className="text-xl font-bold">
                        R$ {projection.beneficiosTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-muted-foreground text-sm">Assinaturas</p>
                      <p className="text-xl font-bold text-red-500">
                        - R$ {projection.assinaturasTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-muted-foreground text-sm">Despesas</p>
                      <p className="text-xl font-bold text-red-500">
                        - R$ {projection.despesasTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Saldo Previsto</h3>
                      <span
                        className={`text-2xl font-bold ${
                          projection.saldoPrevisto >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        R$ {projection.saldoPrevisto.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">% Comprometido</span>
                        <span className="font-semibold">
                          {projection.percentComprometido.toFixed(1)}%
                        </span>
                      </div>
                      {projection.sugestaoParaMeta > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Sugestão para Meta Mensal</span>
                          <span className="font-semibold text-primary">
                            R$ {projection.sugestaoParaMeta.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Configure seu perfil financeiro para ver a projeção
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metas Financeiras</CardTitle>
              <CardDescription>
                Gerencie suas metas individuais e compartilhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                A integração com o módulo de metas será implementada em breve.
                Acesse a página de Metas para gerenciar suas metas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

