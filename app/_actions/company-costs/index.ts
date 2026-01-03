"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { getFixedCosts } from "@/app/_actions/fixed-cost";

/**
 * Calcula os custos do mês atual para a empresa
 */
export async function getCompanyCostsThisMonth(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
        total: 0,
      };
    }

    // Buscar custos fixos da empresa
    const costsResult = await getFixedCosts("COMPANY", companyId);

    if (!costsResult.success || !costsResult.data) {
      return {
        success: true,
        total: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    let total = 0;

    costsResult.data.forEach((cost: any) => {
      if (!cost.isActive) return;

      const costStartDate = new Date(cost.createdAt);
      costStartDate.setHours(0, 0, 0, 0);

      // Se não for custo fixo (isFixed = false) ou frequency for "ONCE", adiciona apenas uma vez
      if (!cost.isFixed || cost.frequency === "ONCE") {
        // Verificar se a data atual é maior ou igual à data de criação do custo
        if (currentDate >= costStartDate) {
          total += cost.amount;
        }
        return; // Não acumula, apenas adiciona uma vez
      }

      // Se for custo fixo (isFixed = true), acumula ao longo do tempo
      const actualStartDate =
        costStartDate > startOfMonth ? costStartDate : startOfMonth;
      actualStartDate.setHours(0, 0, 0, 0);

      switch (cost.frequency) {
        case "DAILY":
          // Diário: conta quantos dias passaram desde o início do mês
          const daysDiff =
            Math.floor(
              (currentDate.getTime() - actualStartDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1; // +1 para incluir o dia atual
          if (daysDiff > 0) {
            total += cost.amount * daysDiff;
          }
          break;
        case "WEEKLY":
          // Semanal: conta quantas semanas completas passaram desde o início
          const weekStart = new Date(actualStartDate);
          weekStart.setDate(
            actualStartDate.getDate() - actualStartDate.getDay(),
          ); // Domingo da semana inicial
          weekStart.setHours(0, 0, 0, 0);

          const currentWeekStart = new Date(currentDate);
          currentWeekStart.setDate(
            currentDate.getDate() - currentDate.getDay(),
          ); // Domingo da semana atual
          currentWeekStart.setHours(0, 0, 0, 0);

          const weeksDiff =
            Math.floor(
              (currentWeekStart.getTime() - weekStart.getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            ) + 1; // +1 para incluir a semana atual

          if (weeksDiff > 0) {
            total += cost.amount * weeksDiff;
          }
          break;
        case "MONTHLY":
          // Mensal: conta quantos meses completos passaram desde o início
          const monthsDiff =
            (currentDate.getFullYear() - actualStartDate.getFullYear()) * 12 +
            (currentDate.getMonth() - actualStartDate.getMonth()) +
            1; // +1 para incluir o mês atual

          if (monthsDiff > 0) {
            total += cost.amount * monthsDiff;
          }
          break;
      }
    });

    return {
      success: true,
      total,
    };
  } catch (error) {
    console.error("Erro ao calcular custos do mês:", error);
    return {
      success: false,
      error: "Erro ao calcular custos do mês",
      total: 0,
    };
  }
}

/**
 * Calcula os custos do mês anterior para comparação
 */
export async function getCompanyCostsLastMonth(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
        total: 0,
      };
    }

    // Buscar custos fixos da empresa
    const costsResult = await getFixedCosts("COMPANY", companyId);

    if (!costsResult.success || !costsResult.data) {
      return {
        success: true,
        total: 0,
      };
    }

    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );
    const lastMonthEnd = new Date(endOfLastMonth);
    lastMonthEnd.setHours(0, 0, 0, 0);

    let total = 0;

    costsResult.data.forEach((cost: any) => {
      if (!cost.isActive) return;

      const costStartDate = new Date(cost.createdAt);
      costStartDate.setHours(0, 0, 0, 0);

      // Se não for custo fixo (isFixed = false) ou frequency for "ONCE", adiciona apenas uma vez
      if (!cost.isFixed || cost.frequency === "ONCE") {
        // Verificar se a data de fim do mês anterior é maior ou igual à data de criação do custo
        if (lastMonthEnd >= costStartDate) {
          total += cost.amount;
        }
        return;
      }

      // Se for custo fixo (isFixed = true), acumula ao longo do tempo
      const actualStartDate =
        costStartDate > startOfLastMonth ? costStartDate : startOfLastMonth;
      actualStartDate.setHours(0, 0, 0, 0);

      switch (cost.frequency) {
        case "DAILY":
          const daysDiff =
            Math.floor(
              (lastMonthEnd.getTime() - actualStartDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;
          if (daysDiff > 0) {
            total += cost.amount * daysDiff;
          }
          break;
        case "WEEKLY":
          const weekStart = new Date(actualStartDate);
          weekStart.setDate(
            actualStartDate.getDate() - actualStartDate.getDay(),
          );
          weekStart.setHours(0, 0, 0, 0);

          const lastMonthWeekStart = new Date(lastMonthEnd);
          lastMonthWeekStart.setDate(
            lastMonthEnd.getDate() - lastMonthEnd.getDay(),
          );
          lastMonthWeekStart.setHours(0, 0, 0, 0);

          const weeksDiff =
            Math.floor(
              (lastMonthWeekStart.getTime() - weekStart.getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            ) + 1;

          if (weeksDiff > 0) {
            total += cost.amount * weeksDiff;
          }
          break;
        case "MONTHLY":
          const monthsDiff =
            (lastMonthEnd.getFullYear() - actualStartDate.getFullYear()) * 12 +
            (lastMonthEnd.getMonth() - actualStartDate.getMonth()) +
            1;

          if (monthsDiff > 0) {
            total += cost.amount * monthsDiff;
          }
          break;
      }
    });

    return {
      success: true,
      total,
    };
  } catch (error) {
    console.error("Erro ao calcular custos do mês anterior:", error);
    return {
      success: false,
      error: "Erro ao calcular custos do mês anterior",
      total: 0,
    };
  }
}
