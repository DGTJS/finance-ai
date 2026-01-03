/**
 * AnalyticsSummaryCard - Card único consolidando Benefícios, Categorias e Estatísticas
 * Design minimalista, simples e atraente
 */

"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import type {
  FamilyBenefitsBalance,
  CategoryData,
  UserStat,
} from "@/src/types/dashboard";
import {
  Gift,
  PieChart,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar";

interface AnalyticsSummaryCardProps {
  benefitsBalance?: FamilyBenefitsBalance;
  categories: CategoryData[];
  userStats?: UserStat[];
}

export function AnalyticsSummaryCard({
  benefitsBalance,
  categories,
  userStats,
}: AnalyticsSummaryCardProps) {
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.value, 0);
  const topCategory = categories.length > 0 ? categories[0] : null;

  return (
    <Card className="bg-background overflow-hidden border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Benefícios */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Benefícios
                </p>
              </div>
              {benefitsBalance ? (
                <>
                  <p className="text-2xl font-light tracking-tight text-purple-600 dark:text-purple-400">
                    {formatCurrency(benefitsBalance.available)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-green-600 dark:text-green-400">
                      Disp: {formatCurrency(benefitsBalance.available)}
                    </span>
                    {benefitsBalance.used > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        Usado: {formatCurrency(benefitsBalance.used)}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum</p>
              )}
            </div>

            {benefitsBalance && benefitsBalance.byUser.length > 0 && (
              <div className="space-y-2">
                {benefitsBalance.byUser.slice(0, 2).map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between"
                  >
                    <p className="text-muted-foreground truncate text-xs">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {formatCurrency(user.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Despesas por Categoria */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Despesas
                </p>
              </div>
              <p className="text-2xl font-light tracking-tight text-blue-600 dark:text-blue-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            {topCategory ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2.5 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{topCategory.emoji}</span>
                      <p className="text-xs font-medium">{topCategory.key}</p>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {totalExpenses > 0
                        ? ((topCategory.value / totalExpenses) * 100).toFixed(0)
                        : 0}
                      %
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(topCategory.value)}
                  </p>
                </div>
                {categories.length > 1 && (
                  <p className="text-muted-foreground text-[10px]">
                    +{categories.length - 1} categoria
                    {categories.length - 1 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Nenhuma despesa</p>
            )}
          </div>

          {/* Estatísticas por Usuário */}
          <div className="space-y-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Usuários
                </p>
              </div>
              {userStats && userStats.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {userStats.slice(0, 4).map((stat, index) => (
                      <Avatar
                        key={stat.userId}
                        className={cn(
                          "border-background h-8 w-8 border-2",
                          index > 0 && "-ml-2",
                        )}
                      >
                        <AvatarImage
                          src={stat.avatarUrl || undefined}
                          alt={stat.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {stat.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {userStats.length > 4 && (
                    <div className="bg-muted border-background flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold">
                      +{userStats.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum</p>
              )}
            </div>

            {userStats && userStats.length > 0 && (
              <div className="space-y-2.5">
                {userStats.slice(0, 2).map((stat) => {
                  const net = stat.revenues - stat.expenses;

                  return (
                    <div
                      key={stat.userId}
                      className="border-muted bg-muted/30 rounded-lg border p-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage
                              src={stat.avatarUrl || undefined}
                              alt={stat.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {stat.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="truncate text-xs font-medium">
                            {stat.name}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-xs font-semibold",
                            net >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {formatCurrency(net)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div className="text-center">
                          <TrendingUp className="mx-auto mb-0.5 h-3 w-3 text-green-600 dark:text-green-400" />
                          <p className="text-muted-foreground text-[9px]">
                            Receitas
                          </p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(stat.revenues)}
                          </p>
                        </div>
                        <div className="text-center">
                          <TrendingDown className="mx-auto mb-0.5 h-3 w-3 text-red-600 dark:text-red-400" />
                          <p className="text-muted-foreground text-[9px]">
                            Despesas
                          </p>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(stat.expenses)}
                          </p>
                        </div>
                        <div className="text-center">
                          <DollarSign className="mx-auto mb-0.5 h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <p className="text-muted-foreground text-[9px]">
                            Invest.
                          </p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(stat.investments)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {userStats.length > 2 && (
                  <p className="text-muted-foreground text-center text-[10px]">
                    +{userStats.length - 2} mais
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
