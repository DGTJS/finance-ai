"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  GoalCategory,
  GoalStatus,
} from "@/app/generated/prisma/client";

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  currentAmount: z.number().min(0, "Valor atual não pode ser negativo").default(0),
  deadline: z.date({ required_error: "Data limite é obrigatória" }),
  category: z.nativeEnum(GoalCategory, {
    required_error: "Categoria é obrigatória",
  }),
  status: z.nativeEnum(GoalStatus).optional().default(GoalStatus.ACTIVE),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

type GoalInput = z.infer<typeof goalSchema>;

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

export async function createGoal(data: GoalInput) {
  try {
    const userId = await getUserId();
    const validatedData = goalSchema.parse(data);

    await db.goal.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar meta",
    };
  }
}

export async function updateGoal(id: string, data: Partial<GoalInput>) {
  try {
    const userId = await getUserId();
    const validatedData = goalSchema.partial().parse(data);

    await db.goal.update({
      where: { id, userId },
      data: validatedData,
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar meta",
    };
  }
}

export async function deleteGoal(id: string) {
  try {
    const userId = await getUserId();

    await db.goal.delete({
      where: { id, userId },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao deletar meta",
    };
  }
}

export async function getUserGoals() {
  try {
    const userId = await getUserId();

    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: [
        { status: "asc" },
        { deadline: "asc" },
      ],
    });

    return {
      success: true,
      data: goals,
    };
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return {
      success: false,
      error: "Erro ao buscar metas",
      data: [],
    };
  }
}

export async function updateGoalProgress(id: string, currentAmount: number) {
  try {
    const userId = await getUserId();

    const goal = await db.goal.findUnique({
      where: { id, userId },
    });

    if (!goal) {
      return { success: false, error: "Meta não encontrada" };
    }

    // Atualizar valor atual e status se necessário
    const newStatus =
      currentAmount >= goal.targetAmount
        ? GoalStatus.COMPLETED
        : goal.status === GoalStatus.COMPLETED
          ? GoalStatus.ACTIVE
          : goal.status;

    await db.goal.update({
      where: { id, userId },
      data: {
        currentAmount,
        status: newStatus,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar progresso da meta:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar progresso da meta",
    };
  }
}

export async function addGoalAmount(id: string, amountToAdd: number) {
  try {
    const userId = await getUserId();

    const goal = await db.goal.findUnique({
      where: { id, userId },
    });

    if (!goal) {
      return { success: false, error: "Meta não encontrada" };
    }

    if (amountToAdd <= 0) {
      return { success: false, error: "Valor deve ser maior que zero" };
    }

    const newCurrentAmount = Number(goal.currentAmount) + amountToAdd;

    // Atualizar valor atual e status se necessário
    const newStatus =
      newCurrentAmount >= goal.targetAmount
        ? GoalStatus.COMPLETED
        : goal.status;

    await db.goal.update({
      where: { id, userId },
      data: {
        currentAmount: newCurrentAmount,
        status: newStatus,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true, newAmount: newCurrentAmount };
  } catch (error) {
    console.error("Erro ao adicionar valor à meta:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar valor à meta",
    };
  }
}


