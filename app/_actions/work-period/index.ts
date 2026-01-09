"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const workPeriodSchema = z.object({
  projectId: z.string().optional().nullable(),
  date: z.date(),
  startTime: z.string(), // "HH:mm" format
  endTime: z.string(), // "HH:mm" format
  amount: z.number().positive("Valor deve ser positivo"),
  expenses: z.number().min(0, "Despesas não podem ser negativas").default(0),
  description: z.string().optional().nullable(),
});

type WorkPeriodInput = z.infer<typeof workPeriodSchema>;

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

// Calcular horas entre dois horários
function calculateHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Se o fim for antes do início, assumir que é no dia seguinte
  let diffMinutes = endMinutes - startMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Adicionar 24 horas
  }

  return diffMinutes / 60; // Converter para horas decimais
}

export async function createWorkPeriod(data: WorkPeriodInput) {
  try {
    const userId = await getUserId();

    console.log(
      "📥 [WORK-PERIOD-ACTION] Dados recebidos:",
      JSON.stringify(data, null, 2),
    );
    console.log("📥 [WORK-PERIOD-ACTION] Tipos dos valores:", {
      amount: typeof data.amount,
      expenses: typeof data.expenses,
      amountValue: data.amount,
      expensesValue: data.expenses,
    });

    // Verificar se o modelo existe
    if (!db.workPeriod) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }

    const validatedData = workPeriodSchema.parse(data);
    console.log(
      "✅ [WORK-PERIOD-ACTION] Dados validados:",
      JSON.stringify(validatedData, null, 2),
    );

    // Calcular horas trabalhadas
    const hours = calculateHours(
      validatedData.startTime,
      validatedData.endTime,
    );

    // Converter valores de reais para centavos (inteiros) antes de salvar
    // O formulário envia valores em centavos (já convertidos pelo MoneyInput)
    const amountInCents = Math.round(validatedData.amount);
    const expensesInCents = Math.round(validatedData.expenses);
    const netProfitInCents = amountInCents - expensesInCents;

    console.log("💰 [WORK-PERIOD-ACTION] Conversão para centavos:", {
      amount: `${validatedData.amount} -> ${amountInCents} centavos`,
      expenses: `${validatedData.expenses} -> ${expensesInCents} centavos`,
      netProfit: `${netProfitInCents} centavos`,
    });

    // Combinar data com horários (usando horário brasileiro)
    // A data já vem no horário brasileiro do cliente, precisamos garantir que seja salva corretamente
    const date = new Date(validatedData.date);
    date.setHours(0, 0, 0, 0);

    const [startHour, startMin] = validatedData.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = validatedData.endTime.split(":").map(Number);

    // Criar datas no horário brasileiro
    const startTime = new Date(date);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    // Se o fim for antes do início, assumir que é no dia seguinte
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const workPeriod = await db.workPeriod.create({
      data: {
        userId,
        projectId: validatedData.projectId || null,
        date,
        startTime,
        endTime,
        hours,
        amount: amountInCents,
        expenses: expensesInCents,
        netProfit: netProfitInCents,
        description: validatedData.description || null,
      },
    });

    console.log("✅ [WORK-PERIOD-ACTION] Período criado com sucesso:", {
      id: workPeriod.id,
      amount: workPeriod.amount,
      expenses: workPeriod.expenses,
      netProfit: workPeriod.netProfit,
    });

    revalidatePath("/entrepreneur");
    return { success: true, data: workPeriod };
  } catch (error) {
    console.error("Erro ao criar período de trabalho:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar período",
    };
  }
}

export async function updateWorkPeriod(
  id: string,
  data: Partial<WorkPeriodInput>,
) {
  try {
    const userId = await getUserId();

    console.log("📥 [WORK-PERIOD-ACTION] Atualizando período:", id);
    console.log(
      "📥 [WORK-PERIOD-ACTION] Dados recebidos:",
      JSON.stringify(data, null, 2),
    );

    // Verificar se o modelo existe
    if (!db.workPeriod) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }

    const validatedData = workPeriodSchema.partial().parse(data);
    console.log(
      "✅ [WORK-PERIOD-ACTION] Dados validados:",
      JSON.stringify(validatedData, null, 2),
    );

    const existingPeriod = await db.workPeriod.findUnique({
      where: { id },
    });

    if (!existingPeriod || existingPeriod.userId !== userId) {
      return {
        success: false,
        error: "Período não encontrado ou sem permissão",
      };
    }

    // Recalcular horas se startTime ou endTime foram alterados
    let hours = existingPeriod.hours;
    let startTime = existingPeriod.startTime;
    let endTime = existingPeriod.endTime;
    let date = existingPeriod.date;

    if (
      validatedData.startTime ||
      validatedData.endTime ||
      validatedData.date
    ) {
      const finalStartTime =
        validatedData.startTime ||
        `${existingPeriod.startTime.getHours().toString().padStart(2, "0")}:${existingPeriod.startTime.getMinutes().toString().padStart(2, "0")}`;
      const finalEndTime =
        validatedData.endTime ||
        `${existingPeriod.endTime.getHours().toString().padStart(2, "0")}:${existingPeriod.endTime.getMinutes().toString().padStart(2, "0")}`;

      hours = calculateHours(finalStartTime, finalEndTime);

      date = validatedData.date || existingPeriod.date;
      const [startHour, startMin] = finalStartTime.split(":").map(Number);
      const [endHour, endMin] = finalEndTime.split(":").map(Number);

      startTime = new Date(date);
      startTime.setHours(startHour, startMin, 0, 0);

      endTime = new Date(date);
      endTime.setHours(endHour, endMin, 0, 0);

      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
    }

    // Recalcular lucro líquido (valores em centavos)
    const amountInCents =
      validatedData.amount !== undefined
        ? Math.round(validatedData.amount)
        : existingPeriod.amount;
    const expensesInCents =
      validatedData.expenses !== undefined
        ? Math.round(validatedData.expenses)
        : existingPeriod.expenses;
    const netProfitInCents = amountInCents - expensesInCents;

    const updatedPeriod = await db.workPeriod.update({
      where: { id },
      data: {
        projectId:
          validatedData.projectId !== undefined
            ? validatedData.projectId
            : existingPeriod.projectId,
        date,
        startTime,
        endTime,
        hours,
        amount: amountInCents,
        expenses: expensesInCents,
        netProfit: netProfitInCents,
        description:
          validatedData.description !== undefined
            ? validatedData.description
            : existingPeriod.description,
      },
    });

    console.log("✅ [WORK-PERIOD-ACTION] Período atualizado com sucesso:", {
      id: updatedPeriod.id,
      amount: updatedPeriod.amount,
      expenses: updatedPeriod.expenses,
      netProfit: updatedPeriod.netProfit,
    });

    revalidatePath("/entrepreneur");
    return { success: true, data: updatedPeriod };
  } catch (error) {
    console.error("Erro ao atualizar período:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar período",
    };
  }
}

export async function deleteWorkPeriod(id: string) {
  try {
    const userId = await getUserId();

    // Verificar se o modelo existe
    if (!db.workPeriod) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
      };
    }

    const period = await db.workPeriod.findUnique({
      where: { id },
    });

    if (!period || period.userId !== userId) {
      return {
        success: false,
        error: "Período não encontrado ou sem permissão",
      };
    }

    await db.workPeriod.delete({
      where: { id },
    });

    revalidatePath("/entrepreneur");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar período:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar período",
    };
  }
}

export async function getWorkPeriods(startDate?: Date, endDate?: Date) {
  try {
    const userId = await getUserId();

    // Verificar se o modelo existe
    if (!db.workPeriod) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
        data: [],
      };
    }

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const periods = await db.workPeriod.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            clientName: true,
            projectName: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Converter valores de centavos para reais para exibição
    const periodsWithReais = periods.map((period) => ({
      ...period,
      amount: period.amount / 100,
      expenses: period.expenses / 100,
      netProfit: period.netProfit / 100,
    }));

    return {
      success: true,
      data: periodsWithReais,
    };
  } catch (error) {
    console.error("Erro ao buscar períodos:", error);
    return {
      success: false,
      error: "Erro ao buscar períodos",
      data: [],
    };
  }
}

export async function getWorkPeriodStats(startDate?: Date, endDate?: Date) {
  try {
    const userId = await getUserId();

    // Verificar se o modelo existe
    if (!db.workPeriod) {
      return {
        success: false,
        error: "Prisma Client não foi regenerado. Execute: npx prisma generate",
        data: {
          totalHours: 0,
          totalAmount: 0,
          totalExpenses: 0,
          totalNetProfit: 0,
          periodCount: 0,
          averageHourlyRate: 0,
        },
      };
    }

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const periods = await db.workPeriod.findMany({
      where,
    });

    const totalHours = periods.reduce((sum, p) => sum + p.hours, 0);
    // Valores estão em centavos no banco, converter para reais
    const totalAmountCents = periods.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const totalExpensesCents = periods.reduce(
      (sum, p) => sum + Number(p.expenses),
      0,
    );
    const totalNetProfitCents = periods.reduce(
      (sum, p) => sum + Number(p.netProfit),
      0,
    );
    const periodCount = periods.length;

    // Converter para reais
    const totalAmount = totalAmountCents / 100;
    const totalExpenses = totalExpensesCents / 100;
    const totalNetProfit = totalNetProfitCents / 100;

    return {
      success: true,
      data: {
        totalHours,
        totalAmount,
        totalExpenses,
        totalNetProfit,
        periodCount,
        averageHourlyRate: totalHours > 0 ? totalAmount / totalHours : 0,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return {
      success: false,
      error: "Erro ao calcular estatísticas",
      data: {
        totalHours: 0,
        totalAmount: 0,
        totalExpenses: 0,
        totalNetProfit: 0,
        periodCount: 0,
        averageHourlyRate: 0,
      },
    };
  }
}
