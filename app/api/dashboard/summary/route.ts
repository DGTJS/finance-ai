/**
 * API Route: GET /api/dashboard/summary
 * Retorna resumo completo do dashboard com classificação semântica correta
 *
 * ESTRUTURA:
 * - Separa salário, benefícios, receitas variáveis
 * - Separa despesas fixas e variáveis
 * - Calcula baseado no mês atual
 * - Compara com mês anterior
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";

export const runtime = "nodejs";
import { generateInsights } from "@/app/_lib/ai";
import { getUserGoals } from "@/app/_actions/goal";
import type { DashboardSummary, DailyBalance } from "@/src/types/dashboard";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_CATEGORY_EMOJIS,
  TRANSACTION_CATEGORY_COLORS,
} from "@/app/_constants/transactions";
import {
  classifyTransaction,
  checkIfRecurring,
} from "@/src/lib/dashboard/classification";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // ===== 1. PERÍODO: MÊS ATUAL E MÊS ANTERIOR =====
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Buscar usuário e conta compartilhada
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        familyAccount: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    const familyUserIds = user?.familyAccount?.users.map((u) => u.id) || [
      session.user.id,
    ];

    // ===== 2. BUSCAR TRANSAÇÕES =====
    // Buscar transações dos últimos 3 meses para análise de recorrência
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const allRecentTransactions = await db.transaction.findMany({
      where: {
        userId: { in: familyUserIds },
        createdAt: { gte: threeMonthsAgo },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filtrar transações do mês atual
    const currentMonthTransactions = allRecentTransactions.filter((t) => {
      const txDate = t.date || t.createdAt;
      return txDate >= currentMonthStart && txDate <= currentMonthEnd;
    });

    // Filtrar transações do mês anterior (para comparação)
    const previousMonthTransactions = allRecentTransactions.filter((t) => {
      const txDate = t.date || t.createdAt;
      return txDate >= previousMonthStart && txDate <= previousMonthEnd;
    });

    // ===== 3. BUSCAR ASSINATURAS E PERFIS FINANCEIROS (FAMÍLIA) =====
    // Buscar assinaturas de todos os usuários da família
    const subscriptions = await db.subscription.findMany({
      where: {
        userId: { in: familyUserIds },
        active: true,
      },
    });

    // Buscar perfis financeiros de todos os usuários da família
    const financialProfiles = await db.financialProfile.findMany({
      where: { userId: { in: familyUserIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Perfil financeiro do usuário atual (para compatibilidade)
    const financialProfile = financialProfiles.find(
      (p) => p.userId === session.user.id,
    );

    // Criar mapa de assinaturas para identificação rápida
    const subscriptionNames = new Set(
      subscriptions.map((s) => s.name.toLowerCase()),
    );

    // ===== 4. CLASSIFICAR TRANSAÇÕES DO MÊS ATUAL =====
    // Primeiro, calcular salários esperados baseados nos perfis financeiros
    // Considera todos os salários esperados para o mês atual de todos os usuários da família
    let expectedSalaryFromProfiles = 0;
    financialProfiles.forEach((profile) => {
      if (profile.multiplePayments && Array.isArray(profile.multiplePayments)) {
        try {
          const multiplePayments = profile.multiplePayments as Array<{
            label: string;
            day: number;
            value: number;
          }>;
          multiplePayments.forEach((payment) => {
            if (
              payment.label.toLowerCase().includes("salário") ||
              payment.label.toLowerCase().includes("salario")
            ) {
              // Incluir salário se o dia está no mês atual (entre 1 e último dia do mês)
              if (
                payment.day >= 1 &&
                payment.day <= currentMonthEnd.getDate()
              ) {
                expectedSalaryFromProfiles += payment.value;
              }
            }
          });
        } catch (error) {
          console.error(
            "Erro ao processar multiplePayments para salário esperado:",
            error,
          );
        }
      } else if (profile.diaPagamento && profile.rendaFixa > 0) {
        const paymentDay = profile.diaPagamento;
        // Incluir se o dia está no mês atual
        if (paymentDay >= 1 && paymentDay <= currentMonthEnd.getDate()) {
          expectedSalaryFromProfiles += profile.rendaFixa;
        }
      } else if (profile.rendaFixa > 0) {
        // Sem dia definido, considerar a renda fixa como esperada para o mês
        expectedSalaryFromProfiles += profile.rendaFixa;
      }
    });

    let salaryTotal = 0;
    let benefitsTotal = 0;
    let variableIncomeTotal = 0;
    let fixedExpensesTotal = 0;
    let variableExpensesTotal = 0;
    let investmentsTotal = 0;

    // Analisar recorrência baseado nos últimos 3 meses
    currentMonthTransactions.forEach((transaction) => {
      const txDate = transaction.date || transaction.createdAt;
      const isSubscription = subscriptionNames.has(
        transaction.name.toLowerCase(),
      );

      // Verificar recorrência: busca transações similares antes desta data
      const similarTransactions = allRecentTransactions.filter((t) => {
        const otherDate = t.date || t.createdAt;
        // Só considerar transações anteriores
        if (otherDate >= txDate) return false;

        // Mesmo nome (mais preciso)
        if (
          t.name.toLowerCase() === transaction.name.toLowerCase() &&
          t.category === transaction.category
        ) {
          return true;
        }

        // Nome similar + categoria + valor similar (±20%)
        const amountDiff = Math.abs(
          Number(t.amount) - Number(transaction.amount),
        );
        const amountRatio =
          amountDiff / Math.max(Number(transaction.amount), 1);

        if (t.category === transaction.category && amountRatio < 0.2) {
          // Verificar se o nome tem palavras-chave em comum
          const txWords = transaction.name.toLowerCase().split(/\s+/);
          const otherWords = t.name.toLowerCase().split(/\s+/);
          const commonWords = txWords.filter((w) => otherWords.includes(w));
          return commonWords.length >= 1; // Pelo menos 1 palavra em comum
        }

        return false;
      });

      // É recorrente se apareceu 2+ vezes antes
      const isRecurring = similarTransactions.length >= 2;

      // Classificar transação
      const classification = classifyTransaction(
        transaction.type,
        transaction.category,
        transaction.name,
        {
          isRecurring,
          isSubscription,
        },
      );

      const amount = Number(transaction.amount);

      if (classification.isSalary) {
        salaryTotal += amount;
      } else if (classification.isBenefit) {
        benefitsTotal += amount;
      } else if (classification.isVariableIncome) {
        variableIncomeTotal += amount;
      } else if (classification.isFixedExpense) {
        fixedExpensesTotal += amount;
      } else if (classification.isVariableExpense) {
        variableExpensesTotal += amount;
      } else if (classification.isInvestment) {
        investmentsTotal += amount;
      }
    });

    // Adicionar assinaturas às despesas fixas
    // FILTRAR APENAS ASSINATURAS DO MÊS ATUAL (já venceram ou vão vencer este mês)
    const currentMonthSubscriptions = subscriptions.filter((sub) => {
      if (!sub.recurring) return false;

      // Se tem nextDueDate, verificar se está no mês atual ou já passou
      if (sub.nextDueDate) {
        const dueDate = new Date(sub.nextDueDate);
        return dueDate <= currentMonthEnd; // Já venceu ou vai vencer este mês
      }

      // Se não tem nextDueDate, usar dueDate
      const dueDate = new Date(sub.dueDate);
      return dueDate <= currentMonthEnd; // Já venceu ou vai vencer este mês
    });

    const subscriptionsTotal = currentMonthSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amount),
      0,
    );
    fixedExpensesTotal += subscriptionsTotal;

    // ===== 5. CALCULAR BREAKDOWNS =====
    // Usar o maior entre salários recebidos e salários esperados dos perfis
    // Isso garante que salários esperados sejam incluídos mesmo se não foram transacionados ainda
    const effectiveSalaryTotal = Math.max(
      salaryTotal,
      expectedSalaryFromProfiles,
    );
    const incomeTotal =
      effectiveSalaryTotal + benefitsTotal + variableIncomeTotal;
    const expensesTotal = fixedExpensesTotal + variableExpensesTotal;
    const netBalance = incomeTotal - expensesTotal - investmentsTotal;

    // ===== 6. CALCULAR SALDO PREVISTO (projeção até fim do mês + gastos do próximo mês) =====
    const daysInMonth = currentMonthEnd.getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay;

    // Projeção baseada em média diária até agora
    const dailyAverageExpense = currentDay > 0 ? expensesTotal / currentDay : 0;
    const projectedExpenses =
      expensesTotal + dailyAverageExpense * daysRemaining;

    // Calcular salário ainda a receber no mês
    // Usar a diferença entre salários esperados dos perfis familiares e salários já recebidos
    let expectedSalaryThisMonth = 0;
    if (expectedSalaryFromProfiles > salaryTotal) {
      expectedSalaryThisMonth = expectedSalaryFromProfiles - salaryTotal;
    }

    // Projeção de receitas = receitas já recebidas + salário esperado
    const projectedIncome = incomeTotal + expectedSalaryThisMonth;

    // ===== 6.1. CALCULAR GASTOS PREVISTOS DO PRÓXIMO MÊS =====
    // Período do próximo mês
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      0,
      23,
      59,
      59,
    );

    // Buscar assinaturas que vão vencer no próximo mês
    const nextMonthSubscriptions = subscriptions.filter((sub) => {
      if (!sub.recurring) return false;

      // Se tem nextDueDate, usar ele
      if (sub.nextDueDate) {
        return (
          sub.nextDueDate >= nextMonthStart && sub.nextDueDate <= nextMonthEnd
        );
      }

      // Se não tem nextDueDate, calcular a próxima data baseada no dueDate
      const dueDate = new Date(sub.dueDate);
      const dayOfMonth = dueDate.getDate();

      // Calcular a próxima data de vencimento (mesmo dia do mês seguinte)
      const nextDue = new Date(
        nextMonthStart.getFullYear(),
        nextMonthStart.getMonth(),
        Math.min(dayOfMonth, nextMonthEnd.getDate()), // Garantir que não ultrapasse o último dia do mês
      );

      return nextDue >= nextMonthStart && nextDue <= nextMonthEnd;
    });

    const nextMonthSubscriptionsTotal = nextMonthSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amount),
      0,
    );

    // Buscar parcelas que vão vencer no próximo mês
    // Buscar todas as transações futuras (não apenas dos últimos 3 meses)
    const nextMonthInstallments = await db.transaction.findMany({
      where: {
        userId: { in: familyUserIds },
        type: "EXPENSE",
        date: {
          gte: nextMonthStart,
          lte: nextMonthEnd,
        },
        installments: { not: null }, // Apenas transações parceladas
      },
    });

    const nextMonthInstallmentsTotal = nextMonthInstallments
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Total de gastos previstos do próximo mês
    const nextMonthProjectedExpenses =
      nextMonthSubscriptionsTotal + nextMonthInstallmentsTotal;

    // Saldo previsto = receitas projetadas do mês atual - despesas projetadas do mês atual - investimentos - gastos previstos do próximo mês
    const projectedBalance =
      projectedIncome -
      projectedExpenses -
      investmentsTotal -
      nextMonthProjectedExpenses;

    // ===== 7. COMPARAR COM MÊS ANTERIOR =====
    let previousMonthIncome = 0;
    let previousMonthExpenses = 0;
    let previousMonthInvestments = 0;

    previousMonthTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "DEPOSIT") {
        previousMonthIncome += amount;
      } else if (transaction.type === "EXPENSE") {
        previousMonthExpenses += amount;
      } else if (transaction.type === "INVESTMENT") {
        previousMonthInvestments += amount;
      }
    });

    const previousMonthNetBalance =
      previousMonthIncome - previousMonthExpenses - previousMonthInvestments;

    const changePercent =
      previousMonthNetBalance !== 0
        ? ((netBalance - previousMonthNetBalance) /
            Math.abs(previousMonthNetBalance)) *
          100
        : 0;

    // ===== 8. GERAR SPARKLINE DIÁRIO (mês atual) =====
    const dailyBalanceSparkline: DailyBalance[] = [];
    let runningBalance = 0;

    // Criar mapa de salários esperados por dia
    const expectedSalariesByDay = new Map<number, number>();
    financialProfiles.forEach((profile) => {
      // Verificar múltiplos pagamentos
      if (profile.multiplePayments && Array.isArray(profile.multiplePayments)) {
        try {
          const multiplePayments = profile.multiplePayments as Array<{
            label: string;
            day: number;
            value: number;
          }>;

          multiplePayments.forEach((payment) => {
            if (
              payment.label.toLowerCase().includes("salário") ||
              payment.label.toLowerCase().includes("salario")
            ) {
              const paymentDay = payment.day;
              // Verificar se já foi recebido este mês
              const hasReceived = currentMonthTransactions.some((t) => {
                const txDate = t.date || t.createdAt;
                const txDay = txDate.getDate();
                return (
                  txDay === paymentDay &&
                  t.type === "DEPOSIT" &&
                  t.category === "SALARY" &&
                  Math.abs(Number(t.amount) - payment.value) < 0.01 &&
                  t.userId === profile.userId
                );
              });

              // Incluir salário se o dia já passou ou se já foi recebido
              if (paymentDay <= currentDay || hasReceived) {
                const current = expectedSalariesByDay.get(paymentDay) || 0;
                expectedSalariesByDay.set(paymentDay, current + payment.value);
              }
            }
          });
        } catch (error) {
          console.error("Erro ao processar multiplePayments:", error);
        }
      } else if (profile.diaPagamento && profile.rendaFixa > 0) {
        const paymentDay = profile.diaPagamento;
        const hasReceived = currentMonthTransactions.some((t) => {
          const txDate = t.date || t.createdAt;
          const txDay = txDate.getDate();
          return (
            txDay === paymentDay &&
            t.type === "DEPOSIT" &&
            t.category === "SALARY" &&
            Math.abs(Number(t.amount) - profile.rendaFixa) < 0.01 &&
            t.userId === profile.userId
          );
        });

        // Incluir salário se o dia já passou ou se já foi recebido
        if (paymentDay <= currentDay || hasReceived) {
          const current = expectedSalariesByDay.get(paymentDay) || 0;
          expectedSalariesByDay.set(paymentDay, current + profile.rendaFixa);
        }
      } else if (profile.rendaFixa > 0) {
        // Sem dia de pagamento definido, verificar se há transações de salário
        const salaryTransactions = currentMonthTransactions.filter(
          (t) =>
            t.type === "DEPOSIT" &&
            t.category === "SALARY" &&
            t.userId === profile.userId,
        );
        const receivedSalary = salaryTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0,
        );

        // Se recebeu salário, incluir no primeiro dia do mês (já foi recebido)
        if (receivedSalary > 0) {
          const current = expectedSalariesByDay.get(1) || 0;
          expectedSalariesByDay.set(1, current + receivedSalary);
        } else {
          // Se não recebeu, incluir no primeiro dia como esperado
          const current = expectedSalariesByDay.get(1) || 0;
          expectedSalariesByDay.set(1, current + profile.rendaFixa);
        }
      }
    });

    // Processar cada dia do mês
    for (let day = 1; day <= Math.min(currentDay, daysInMonth); day++) {
      const dayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        day,
        0,
        0,
        0,
      );
      const dayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        day,
        23,
        59,
        59,
      );

      // Somar transações do dia
      const dayTransactions = currentMonthTransactions.filter((t) => {
        const txDate = t.date || t.createdAt;
        return txDate >= dayStart && txDate <= dayEnd;
      });

      const dayIncome = dayTransactions
        .filter((t) => t.type === "DEPOSIT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Adicionar salários esperados do dia (se ainda não foram recebidos)
      const expectedSalary = expectedSalariesByDay.get(day) || 0;
      // Verificar se o salário esperado já foi recebido nas transações
      const receivedSalary = dayTransactions
        .filter(
          (t) =>
            t.type === "DEPOSIT" &&
            t.category === "SALARY" &&
            Math.abs(Number(t.amount) - expectedSalary) < 0.01,
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Se há salário esperado mas não foi recebido (ou foi parcialmente recebido), adicionar
      const additionalSalary =
        expectedSalary > 0 && receivedSalary < expectedSalary
          ? expectedSalary - receivedSalary
          : 0;

      const dayExpenses = dayTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const dayInvestments = dayTransactions
        .filter((t) => t.type === "INVESTMENT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      runningBalance +=
        dayIncome + additionalSalary - dayExpenses - dayInvestments;

      dailyBalanceSparkline.push({
        date: dayStart.toISOString().split("T")[0],
        balance: runningBalance,
      });
    }

    // ===== 9. PREPARAR DADOS PARA RESPOSTA =====
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Buscar metas ativas
    const goalsResult = await getUserGoals();
    const activeGoals = goalsResult.success
      ? (goalsResult.data || []).filter((g) => g.status === "ACTIVE")
      : [];

    const goals = activeGoals.slice(0, 3).map((g) => ({
      id: g.id,
      title: g.name,
      current: Number(g.currentAmount),
      target: Number(g.targetAmount),
      dueDate: g.deadline.toISOString(),
      isShared: false,
      icon: g.icon || null,
      color: g.color || null,
      category: g.category || null,
    }));

    // Assinaturas próximas (próximos 30 dias)
    const upcomingSubscriptions = subscriptions
      .filter((sub) => {
        const dueDate = sub.nextDueDate || sub.dueDate;
        return (
          dueDate >= now &&
          dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        );
      })
      .sort((a, b) => {
        const dateA = a.nextDueDate || a.dueDate;
        const dateB = b.nextDueDate || b.dueDate;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10)
      .map((sub) => {
        const dueDate = sub.nextDueDate || sub.dueDate;
        const daysUntil = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: sub.id,
          name: sub.name,
          dueDate: dueDate.toISOString(),
          value: Number(sub.amount),
          logoUrl: sub.logoUrl || null,
          daysUntil,
          isOverdue: daysUntil < 0,
        };
      });

    // ===== PRÓXIMOS VENCIMENTOS (CONSOLIDADO) =====
    const upcomingPayments: Array<{
      id: string;
      name: string;
      dueDate: string;
      value: number;
      daysUntil: number;
      type: "subscription" | "recurring";
      logoUrl?: string | null;
    }> = [];

    // Adicionar assinaturas (até 60 dias)
    subscriptions.forEach((sub) => {
      const dueDate = sub.nextDueDate || sub.dueDate;
      if (
        dueDate >= now &&
        dueDate <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      ) {
        const daysUntil = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        upcomingPayments.push({
          id: sub.id,
          name: sub.name,
          dueDate: dueDate.toISOString(),
          value: Number(sub.amount),
          daysUntil,
          type: "subscription",
          logoUrl: sub.logoUrl || null,
        });
      }
    });

    // Ordenar por data de vencimento (mais próximo primeiro)
    upcomingPayments.sort((a, b) => a.daysUntil - b.daysUntil);

    // ===== SALDO DE SALÁRIO FAMILIAR =====
    const familySalaryByUser: Array<{
      userId: string;
      name: string;
      amount: number;
    }> = [];

    financialProfiles.forEach((profile) => {
      let userSalary = 0;

      // Verificar múltiplos pagamentos
      if (profile.multiplePayments && Array.isArray(profile.multiplePayments)) {
        try {
          const multiplePayments = profile.multiplePayments as Array<{
            label: string;
            day: number;
            value: number;
          }>;

          multiplePayments.forEach((payment) => {
            // Se o pagamento é de salário (label contém "salário" ou similar)
            if (
              payment.label.toLowerCase().includes("salário") ||
              payment.label.toLowerCase().includes("salario")
            ) {
              // Verificar se já foi recebido este mês
              const hasReceived = currentMonthTransactions.some((t) => {
                const txDate = t.date || t.createdAt;
                const txDay = txDate.getDate();
                return (
                  txDay === payment.day &&
                  t.type === "DEPOSIT" &&
                  t.category === "SALARY" &&
                  Math.abs(Number(t.amount) - payment.value) < 0.01 &&
                  t.userId === profile.userId
                );
              });

              // Incluir salário se:
              // 1. Já foi recebido, OU
              // 2. O dia de pagamento já passou neste mês, OU
              // 3. O dia de pagamento está previsto para este mês (futuro mas ainda no mês atual)
              if (hasReceived) {
                userSalary += payment.value;
              } else if (payment.day <= currentMonthEnd.getDate()) {
                // Dia já passou ou está previsto para este mês
                userSalary += payment.value;
              }
            }
          });
        } catch (error) {
          console.error("Erro ao processar multiplePayments:", error);
        }
      } else if (profile.diaPagamento && profile.rendaFixa > 0) {
        // Dia único de pagamento
        const paymentDay = profile.diaPagamento;
        const hasReceived = currentMonthTransactions.some((t) => {
          const txDate = t.date || t.createdAt;
          const txDay = txDate.getDate();
          return (
            txDay === paymentDay &&
            t.type === "DEPOSIT" &&
            t.category === "SALARY" &&
            Math.abs(Number(t.amount) - profile.rendaFixa) < 0.01 &&
            t.userId === profile.userId
          );
        });

        // Incluir se já foi recebido ou se o dia de pagamento é deste mês
        if (hasReceived || paymentDay <= currentMonthEnd.getDate()) {
          userSalary = profile.rendaFixa;
        }
      } else if (profile.rendaFixa > 0) {
        // Sem dia de pagamento definido, usar renda fixa
        // Verificar se há transações de salário este mês
        const salaryTransactions = currentMonthTransactions.filter(
          (t) =>
            t.type === "DEPOSIT" &&
            t.category === "SALARY" &&
            t.userId === profile.userId,
        );
        const receivedSalary = salaryTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0,
        );

        // Se recebeu salário, usar o valor recebido, senão usar a renda fixa
        userSalary = receivedSalary > 0 ? receivedSalary : profile.rendaFixa;
      }

      // Sempre adicionar o usuário se tem renda fixa configurada, mesmo que seja 0
      // Mas vamos adicionar apenas se userSalary > 0 para não mostrar zeros
      if (userSalary > 0) {
        const userName = profile.user.name || profile.user.email || "Usuário";
        familySalaryByUser.push({
          userId: profile.userId,
          name: userName,
          amount: userSalary,
        });
      }
    });

    const familySalaryTotal = familySalaryByUser.reduce(
      (sum, u) => sum + u.amount,
      0,
    );

    const familySalaryBalance = {
      total: familySalaryTotal,
      byUser: familySalaryByUser,
    };

    // ===== SALDO DE BENEFÍCIOS FAMILIAR =====
    const familyBenefitsByUser: Array<{
      userId: string;
      name: string;
      benefits: Array<{
        type: string;
        value: number;
        notes?: string;
        category?: string;
      }>;
      total: number;
    }> = [];

    let totalBenefitsAvailable = 0;
    let totalBenefitsUsed = 0;

    financialProfiles.forEach((profile) => {
      const beneficios =
        (profile.beneficios as Array<{
          type: string;
          value: number;
          notes?: string;
          category?: string;
        }>) || [];

      if (beneficios.length > 0) {
        const userBenefitsTotal = beneficios.reduce(
          (sum, b) => sum + (b.value || 0),
          0,
        );
        totalBenefitsAvailable += userBenefitsTotal;

        const userName = profile.user.name || profile.user.email || "Usuário";
        familyBenefitsByUser.push({
          userId: profile.userId,
          name: userName,
          benefits: beneficios,
          total: userBenefitsTotal,
        });
      }
    });

    // Calcular benefícios usados no mês (transações com paymentMethod = BENEFIT)
    const benefitTransactions = currentMonthTransactions.filter(
      (t) => t.paymentMethod === "BENEFIT",
    );
    totalBenefitsUsed = benefitTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    const familyBenefitsBalance = {
      total: totalBenefitsAvailable,
      byUser: familyBenefitsByUser,
      used: totalBenefitsUsed,
      available: totalBenefitsAvailable - totalBenefitsUsed,
    };

    // Transações recentes (últimas 10)
    const recentTransactions = currentMonthTransactions
      .slice(0, 10)
      .map((t) => ({
        id: t.id,
        userId: t.userId,
        name: t.name || "Transação",
        type: t.type,
        value: Number(t.amount),
        category: t.category,
        createdAt: t.createdAt.toISOString(),
        date: (t.date || t.createdAt).toISOString(),
        description: null,
        icon: t.icon || null,
      }));

    // Gastos por categoria (apenas despesas variáveis do mês atual)
    // Para análise de recorrência das despesas variáveis
    const variableExpenseTransactions = currentMonthTransactions.filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const isSub = subscriptionNames.has(t.name.toLowerCase());

      // Verificar recorrência
      const txDate = t.date || t.createdAt;
      const similarTransactions = allRecentTransactions.filter((other) => {
        const otherDate = other.date || other.createdAt;
        return (
          otherDate < txDate &&
          (other.name.toLowerCase() === t.name.toLowerCase() ||
            (other.category === t.category &&
              Math.abs(Number(other.amount) - Number(t.amount)) /
                Number(t.amount) <
                0.2))
        );
      });
      const isRecurring = similarTransactions.length >= 2;

      const classification = classifyTransaction(t.type, t.category, t.name, {
        isSubscription: isSub,
        isRecurring,
      });
      return classification.isVariableExpense;
    });

    const expensesByCategory = variableExpenseTransactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const categories = Object.entries(expensesByCategory)
      .map(([key, value]) => {
        const category = key as keyof typeof TRANSACTION_CATEGORY_EMOJIS;
        return {
          key: category,
          value,
          emoji: TRANSACTION_CATEGORY_EMOJIS[category] || "📊",
          color: TRANSACTION_CATEGORY_COLORS[category] || "#3b82f6",
        };
      })
      .sort((a, b) => b.value - a.value);

    // Estatísticas por usuário
    const userStatsMap = new Map<
      string,
      {
        userId: string;
        name: string;
        avatarUrl: string | null;
        revenues: number;
        expenses: number;
        investments: number;
      }
    >();

    currentMonthTransactions.forEach((transaction) => {
      const creatorId = transaction.createdBy?.id || transaction.userId;
      const creatorName =
        transaction.createdBy?.name ||
        transaction.createdBy?.email ||
        "Usuário";
      const creatorImage = transaction.createdBy?.image || null;

      if (!userStatsMap.has(creatorId)) {
        userStatsMap.set(creatorId, {
          userId: creatorId,
          name: creatorName,
          avatarUrl: creatorImage,
          revenues: 0,
          expenses: 0,
          investments: 0,
        });
      }

      const userStat = userStatsMap.get(creatorId)!;
      if (transaction.type === "DEPOSIT") {
        userStat.revenues += Number(transaction.amount);
      } else if (transaction.type === "EXPENSE") {
        userStat.expenses += Number(transaction.amount);
      } else if (transaction.type === "INVESTMENT") {
        userStat.investments += Number(transaction.amount);
      }
    });

    const userStats = Array.from(userStatsMap.values());

    // Gerar insight da IA
    let mainInsight: {
      severity: "low" | "medium" | "high";
      message: string;
      actions: Array<{ id: string; label: string }>;
    };
    try {
      const insights = await generateInsights(
        session.user.id,
        currentMonthStart,
        now,
      );

      const foundInsight =
        insights.find(
          (i) => i.severity === "high" || i.severity === "medium",
        ) || insights[0];

      if (foundInsight) {
        const severity = foundInsight.severity as "low" | "medium" | "high";
        mainInsight = {
          severity,
          message:
            foundInsight.detail || foundInsight.title || "Insight disponível",
          actions: foundInsight.actionable
            ? [{ id: "review", label: "Revisar detalhes" }]
            : [],
        };
      } else {
        mainInsight = {
          severity: "low",
          message: "Sua situação financeira está estável.",
          actions: [],
        };
      }
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
      mainInsight = {
        severity: "low",
        message: "Sua situação financeira está estável.",
        actions: [],
      };
    }

    // ===== 10. MONTAR RESPOSTA =====
    const dashboardSummary: DashboardSummary = {
      // Visão principal
      currentBalance: netBalance,
      projectedBalance,

      // Breakdowns financeiros
      income: {
        salary: effectiveSalaryTotal,
        benefits: benefitsTotal,
        variable: variableIncomeTotal,
        total: incomeTotal,
      },
      expenses: {
        fixed: fixedExpensesTotal,
        variable: variableExpensesTotal,
        subscriptions: subscriptionsTotal,
        total: expensesTotal,
      },
      investments: investmentsTotal,

      // Visão mensal
      monthlyOverview: {
        month: monthString,
        income: {
          salary: effectiveSalaryTotal,
          benefits: benefitsTotal,
          variable: variableIncomeTotal,
          total: incomeTotal,
        },
        expenses: {
          fixed: fixedExpensesTotal,
          variable: variableExpensesTotal,
          subscriptions: subscriptionsTotal,
          total: expensesTotal,
        },
        investments: investmentsTotal,
        netBalance,
        projectedBalance,
        changePercent,
      },

      // Dados de contexto
      dailyBalanceSparkline,
      categories,
      recentTransactions,
      scheduledPayments: upcomingSubscriptions,
      goals,
      userStats,

      // Novos dados familiares
      upcomingPayments,
      familySalaryBalance,
      familyBenefitsBalance,

      // Insights
      insight: mainInsight,
    };

    return NextResponse.json(dashboardSummary);
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar dados do dashboard",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
