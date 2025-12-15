"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { FinancialProfileInput } from "@/app/_actions/financial-profile/schema";

interface ProfileCardProps {
  profile: FinancialProfileInput | null;
  projection?: {
    saldoPrevisto: number;
    percentComprometido: number;
    sugestaoParaMeta: number;
  } | null;
}

export function ProfileCard({ profile, projection }: ProfileCardProps) {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil Financeiro</CardTitle>
          <CardDescription>
            Configure seu perfil financeiro para obter insights personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum perfil configurado. Configure seu perfil para começar.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rendaTotal = profile.rendaFixa + profile.rendaVariavelMedia;
  const beneficiosTotal = profile.beneficios.reduce(
    (sum, b) => sum + (b.value || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Perfil</CardTitle>
        <CardDescription>Visão geral das suas informações financeiras</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground text-xs">Renda Total Mensal</p>
            <p className="text-lg font-semibold">
              R$ {rendaTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-muted-foreground text-xs">Total de Benefícios</p>
            <p className="text-lg font-semibold">
              R$ {beneficiosTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {projection && (
          <div className="space-y-2 rounded-lg border p-4">
            <h4 className="font-semibold">Projeção do Mês</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Saldo Previsto:</span>
                <span
                  className={`font-semibold ${
                    projection.saldoPrevisto >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  R$ {projection.saldoPrevisto.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">% Comprometido:</span>
                <span className="font-semibold">
                  {projection.percentComprometido.toFixed(1)}%
                </span>
              </div>
              {projection.sugestaoParaMeta > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sugestão para Meta:</span>
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
        )}

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">Detalhes:</p>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Renda Fixa: R$ {profile.rendaFixa.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</li>
            <li>• Renda Variável: R$ {profile.rendaVariavelMedia.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</li>
            <li>• Benefícios: {profile.beneficios.length} cadastrado(s)</li>
            {profile.diaPagamento && (
              <li>• Dia de Pagamento: Dia {profile.diaPagamento}</li>
            )}
            {profile.multiplePayments && profile.multiplePayments.length > 0 && (
              <li>• Pagamentos: {profile.multiplePayments.length} configurado(s)</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

