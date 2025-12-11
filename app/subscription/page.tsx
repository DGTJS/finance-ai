import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SubscriptionsClient from "./_components/subscriptions-client";
import { getUserSubscriptions } from "@/app/_actions/subscription";

const SubscriptionPage = async () => {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Buscar assinaturas do usuário
  const result = await getUserSubscriptions();
  const subscriptions = result.success ? result.data || [] : [];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Minhas Assinaturas
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie suas assinaturas e pagamentos recorrentes
            </p>
          </div>
        </div>

        {/* Stats */}
        {subscriptions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ativas
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {subscriptions.filter((s) => s.active).length}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Gasto Mensal
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold">
                R${" "}
                {subscriptions
                  .filter((s) => s.active && s.recurring)
                  .reduce((acc, s) => acc + s.amount, 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Vencendo em 7 dias
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {
                  subscriptions.filter((s) => {
                    if (!s.nextDueDate || !s.active) return false;
                    const days = Math.ceil(
                      (new Date(s.nextDueDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return days <= 7 && days >= 0;
                  }).length
                }
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assinaturas
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold">{subscriptions.length}</p>
            </div>
          </div>
        )}

        {/* Lista de Assinaturas */}
        <SubscriptionsClient initialSubscriptions={subscriptions} />
      </div>
    </div>
  );
};

export default SubscriptionPage;
