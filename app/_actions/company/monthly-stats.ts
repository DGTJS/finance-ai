"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

/**
 * Busca estatísticas mensais da empresa (receitas, custos e valor de estoque)
 */
export async function getCompanyMonthlyStats(
  companyId: string,
  months: number = 6,
) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada",
        data: [],
      };
    }

    const now = new Date();
    const monthlyStats: Array<{
      month: string;
      monthNumber: number;
      year: number;
      revenues: number;
      costs: number;
      profit: number;
      stockValue: number;
    }> = [];

    // Buscar dados dos últimos N meses
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
      const monthNumber = date.getMonth() + 1;
      const year = date.getFullYear();

      // Buscar receitas do mês
      let revenues = 0;
      try {
        const revenuesData = await db.companyRevenue.findMany({
          where: {
            companyId,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });
        revenues = revenuesData.reduce((sum, r) => sum + r.amount, 0);
      } catch (error) {
        console.error(`Erro ao buscar receitas de ${monthName}:`, error);
      }

      // Buscar custos do mês usando a mesma lógica de getCompanyCostsThisMonth
      let costs = 0;
      try {
        // Buscar todos os custos da empresa usando SQL raw para garantir que isFixed seja retornado
        const query = `SELECT * FROM \`fixedcost\` WHERE \`entityType\` = ? AND \`entityId\` = ? AND \`isActive\` = 1 ORDER BY \`createdAt\` DESC`;
        const allCostsRaw = (await db.$queryRawUnsafe(
          query,
          "COMPANY",
          companyId,
        )) as any[];

        // Converter isFixed de tinyint(1) para boolean
        const allCosts = allCostsRaw.map((cost: any) => ({
          id: cost.id,
          name: cost.name,
          amount: Number(cost.amount),
          frequency: cost.frequency,
          isFixed:
            cost.isFixed !== undefined && cost.isFixed !== null
              ? cost.isFixed === 1 || cost.isFixed === true
              : true, // Padrão true se não existir (valores antigos)
          description: cost.description,
          isActive: cost.isActive === 1 || cost.isActive === true,
          createdAt: cost.createdAt,
          updatedAt: cost.updatedAt,
        }));

        console.log(
          `[MONTHLY STATS] ${monthName}: Total de custos encontrados: ${allCosts.length}`,
          allCosts.map((c) => ({
            name: c.name,
            amount: c.amount,
            isFixed: c.isFixed,
            frequency: c.frequency,
          })),
        );

        // Para meses passados, usar o final do mês como referência
        // Para o mês atual, usar a data atual (incluindo hoje)
        const isCurrentMonth =
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();
        const referenceDate = isCurrentMonth
          ? new Date(now)
          : new Date(endOfMonth);
        referenceDate.setHours(23, 59, 59, 999); // Incluir o dia inteiro

        allCosts.forEach((cost) => {
          if (!cost.isActive) return;

          const costStartDate = new Date(cost.createdAt);
          costStartDate.setHours(0, 0, 0, 0);

          // Se o custo foi criado após o final do mês, não incluir
          if (costStartDate > endOfMonth) {
            return;
          }

          // Se não for custo fixo (isFixed = false) ou frequency for "ONCE", adiciona apenas uma vez
          // REGRA SIMPLES: TODOS os gastos criados até o final do mês devem ser incluídos
          if (!cost.isFixed || cost.frequency === "ONCE") {
            // Se o gasto foi criado até o final do mês, sempre incluir
            if (costStartDate <= endOfMonth) {
              console.log(
                `[MONTHLY STATS] ${monthName}: Adicionando custo único: ${cost.name} = ${cost.amount}`,
              );
              costs += cost.amount;
            }
            return;
          }

          // Se for custo fixo (isFixed = true), acumula ao longo do tempo
          const actualStartDate =
            costStartDate > startOfMonth ? costStartDate : startOfMonth;
          actualStartDate.setHours(0, 0, 0, 0);

          switch (cost.frequency) {
            case "DAILY":
              // Diário: conta quantos dias passaram desde o início do mês até a data de referência
              const daysDiff =
                Math.floor(
                  (referenceDate.getTime() - actualStartDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1;
              if (daysDiff > 0) {
                const dailyCost = cost.amount * daysDiff;
                console.log(
                  `[MONTHLY STATS] ${monthName}: Adicionando custo diário: ${cost.name} = ${cost.amount} x ${daysDiff} dias = ${dailyCost}`,
                );
                costs += dailyCost;
              }
              break;
            case "WEEKLY":
              // Semanal: conta quantas semanas completas passaram desde o início
              const weekStart = new Date(actualStartDate);
              weekStart.setDate(
                actualStartDate.getDate() - actualStartDate.getDay(),
              );
              weekStart.setHours(0, 0, 0, 0);

              const referenceWeekStart = new Date(referenceDate);
              referenceWeekStart.setDate(
                referenceDate.getDate() - referenceDate.getDay(),
              );
              referenceWeekStart.setHours(0, 0, 0, 0);

              const weeksDiff =
                Math.floor(
                  (referenceWeekStart.getTime() - weekStart.getTime()) /
                    (1000 * 60 * 60 * 24 * 7),
                ) + 1;
              if (weeksDiff > 0) {
                const weeklyCost = cost.amount * weeksDiff;
                console.log(
                  `[MONTHLY STATS] ${monthName}: Adicionando custo semanal: ${cost.name} = ${cost.amount} x ${weeksDiff} semanas = ${weeklyCost}`,
                );
                costs += weeklyCost;
              }
              break;
            case "MONTHLY":
              // Mensal: conta quantos meses completos passaram desde o início
              const monthsDiff =
                (referenceDate.getFullYear() - actualStartDate.getFullYear()) *
                  12 +
                (referenceDate.getMonth() - actualStartDate.getMonth()) +
                1;
              if (monthsDiff > 0) {
                const monthlyCost = cost.amount * monthsDiff;
                console.log(
                  `[MONTHLY STATS] ${monthName}: Adicionando custo mensal: ${cost.name} = ${cost.amount} x ${monthsDiff} meses = ${monthlyCost}`,
                );
                costs += monthlyCost;
              }
              break;
          }
        });
      } catch (error) {
        console.error(`Erro ao buscar custos de ${monthName}:`, error);
      }

      // Buscar valor de estoque no final do mês
      // O valor de estoque é calculado com base nos produtos existentes até o final do mês
      let stockValue = 0;
      if (company.hasStock) {
        try {
          const products = await db.companyProduct.findMany({
            where: {
              companyId,
              isActive: true,
              createdAt: {
                lte: endOfMonth,
              },
            },
          });
          // Valor de estoque = quantidade * preço de custo
          stockValue = products.reduce(
            (sum, p) => sum + Number(p.quantity) * Number(p.costPrice),
            0,
          );
        } catch (error) {
          console.error(
            `Erro ao buscar valor de estoque de ${monthName}:`,
            error,
          );
        }
      }

      const profit = revenues - costs;

      // Debug: log para verificar valores calculados
      console.log(
        `[MONTHLY STATS] ${monthName}: revenues=${revenues}, costs=${costs}, profit=${profit}, stockValue=${stockValue}`,
      );

      monthlyStats.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        monthNumber,
        year,
        revenues,
        costs,
        profit,
        stockValue,
      });
    }

    return {
      success: true,
      data: monthlyStats,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas mensais:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas mensais",
      data: [],
    };
  }
}
