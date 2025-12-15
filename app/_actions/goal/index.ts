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
  isShared: z.boolean().default(false),
  sharedWith: z.array(z.string()).default([]),
  ownerUserId: z.string().optional().nullable(),
  contributions: z.array(z.object({
    userId: z.string(),
    amount: z.number(),
    date: z.string(),
  })).optional().default([]),
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

    // Validação para metas compartilhadas
    let finalSharedWith = validatedData.sharedWith || [];
    if (validatedData.isShared) {
      // Garantir que o usuário atual está incluído
      if (!finalSharedWith.includes(userId)) {
        finalSharedWith = [...finalSharedWith, userId];
      }
      
      // Verificar se os usuários existem (incluindo o atual)
      const users = await db.user.findMany({
        where: {
          id: { in: finalSharedWith },
        },
      });
      if (users.length !== finalSharedWith.length) {
        return {
          success: false,
          error: "Um ou mais usuários não foram encontrados",
        };
      }
    }

    const goal = await db.goal.create({
      data: {
        ...validatedData,
        userId,
        ownerUserId: validatedData.isShared ? userId : null,
        sharedWith: validatedData.isShared ? finalSharedWith : [],
      },
    });

    // Se for meta compartilhada, criar também para os outros usuários
    if (validatedData.isShared && finalSharedWith.length > 0) {
      // Filtrar apenas os outros usuários (não incluir o criador)
      const sharedUserIds = finalSharedWith.filter((id) => id !== userId);
      
      // Criar metas para cada usuário compartilhado
      const initialContributions = validatedData.contributions || [];
      for (const sharedUserId of sharedUserIds) {
        await db.goal.create({
          data: {
            name: validatedData.name,
            description: validatedData.description,
            targetAmount: validatedData.targetAmount,
            currentAmount: validatedData.currentAmount, // Mesmo valor inicial para todos
            deadline: validatedData.deadline,
            category: validatedData.category,
            status: validatedData.status,
            icon: validatedData.icon,
            color: validatedData.color,
            isShared: true,
            sharedWith: finalSharedWith, // Incluir todos os participantes
            ownerUserId: userId,
            userId: sharedUserId,
            contributions: initialContributions, // Mesmo histórico inicial para todos
          },
        });
      }
    }

    revalidatePath("/goals");
    revalidatePath("/profile-finance");
    revalidatePath("/");
    return { success: true, data: goal };
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

    // Buscar a meta primeiro para verificar se é compartilhada
    const goal = await db.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return {
        success: false,
        error: "Meta não encontrada",
      };
    }

    // Verificar se o usuário tem acesso à meta
    const hasAccess = goal.userId === userId || 
      (goal.isShared && goal.sharedWith && 
        Array.isArray(goal.sharedWith) && 
        goal.sharedWith.includes(userId));

    if (!hasAccess) {
      return {
        success: false,
        error: "Você não tem permissão para atualizar esta meta",
      };
    }

    // Preparar dados de atualização (remover campos que não devem ser atualizados diretamente)
    const updateData: any = { ...validatedData };
    // Não permitir alterar isShared, sharedWith, ownerUserId e contributions diretamente
    delete updateData.isShared;
    delete updateData.sharedWith;
    delete updateData.ownerUserId;
    delete updateData.contributions;

    // Se for meta compartilhada, atualizar todas as instâncias relacionadas
    if (goal.isShared && goal.ownerUserId) {
      // Atualizar todas as metas compartilhadas com o mesmo ownerUserId
      await db.goal.updateMany({
        where: {
          ownerUserId: goal.ownerUserId,
          isShared: true,
        },
        data: updateData,
      });
    } else {
      // Meta individual - atualizar apenas esta
      await db.goal.update({
        where: { id, userId },
        data: updateData,
      });
    }

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

    // Buscar a meta primeiro para verificar se é compartilhada
    const goal = await db.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return {
        success: false,
        error: "Meta não encontrada",
      };
    }

    // Verificar se o usuário tem acesso à meta
    const hasAccess = goal.userId === userId || 
      (goal.isShared && goal.sharedWith && 
        Array.isArray(goal.sharedWith) && 
        goal.sharedWith.includes(userId));

    if (!hasAccess) {
      return {
        success: false,
        error: "Você não tem permissão para excluir esta meta",
      };
    }

    // Se for meta compartilhada, excluir todas as instâncias relacionadas
    if (goal.isShared && goal.ownerUserId) {
      // Excluir todas as metas compartilhadas com o mesmo ownerUserId
      await db.goal.deleteMany({
        where: {
          ownerUserId: goal.ownerUserId,
          isShared: true,
        },
      });
    } else {
      // Meta individual - excluir apenas esta
      await db.goal.delete({
        where: { id, userId },
      });
    }

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

    // Buscar usuário e conta compartilhada
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        familyAccount: {
          include: {
            users: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Obter IDs de todos os usuários da conta familiar (incluindo o próprio usuário)
    const familyUserIds = user?.familyAccount?.users.map((u) => u.id) || [userId];

    // Buscar todas as metas (próprias e compartilhadas)
    // O Prisma não suporta query direta em JSON arrays, então buscamos todas e filtramos
    const allGoals = await db.goal.findMany({
      orderBy: [
        { status: "asc" },
        { deadline: "asc" },
      ],
    });

    // Filtrar metas próprias e compartilhadas
    // IMPORTANTE: Para metas compartilhadas, cada usuário vê apenas sua própria instância
    // Usar um Map com ownerUserId como chave para metas compartilhadas para evitar duplicação
    const goalsMap = new Map<string, typeof allGoals[0]>();
    
    allGoals.forEach((goal) => {
      // Sempre incluir metas próprias do usuário (incluindo suas instâncias de metas compartilhadas)
      if (goal.userId === userId) {
        // Para metas compartilhadas, usar ownerUserId como chave única para evitar duplicação
        if (goal.isShared && goal.ownerUserId) {
          const key = `shared_${goal.ownerUserId}`;
          // Sempre usar a instância do próprio usuário
          goalsMap.set(key, goal);
        } else {
          // Meta individual - usar ID como chave
          goalsMap.set(goal.id, goal);
        }
        return;
      }
      
      // Para metas compartilhadas de outros usuários da família:
      // Verificar se o usuário está em sharedWith E se não há uma instância própria
      if (goal.isShared && goal.sharedWith && familyUserIds.includes(goal.userId)) {
        const sharedWith = Array.isArray(goal.sharedWith) 
          ? goal.sharedWith 
          : JSON.parse(goal.sharedWith as string);
        
        if (Array.isArray(sharedWith) && sharedWith.includes(userId)) {
          // Se tem ownerUserId, verificar se já existe instância própria
          if (goal.ownerUserId) {
            const key = `shared_${goal.ownerUserId}`;
            // Só adicionar se não houver uma instância própria
            // (se houver, significa que o usuário tem sua própria instância e não precisa ver a de outro)
            if (!goalsMap.has(key)) {
              goalsMap.set(key, goal);
            }
          } else {
            // Meta compartilhada sem ownerUserId (legado) - usar ID
            goalsMap.set(goal.id, goal);
          }
        }
      }
    });
    
    // Converter Map para array
    const goals = Array.from(goalsMap.values());

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

    // Buscar meta - verificar se é compartilhada e o usuário tem acesso
    const goal = await db.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return { success: false, error: "Meta não encontrada" };
    }

    // Verificar se o usuário tem acesso à meta
    const hasAccess = goal.userId === userId || 
      (goal.isShared && goal.sharedWith && 
        Array.isArray(goal.sharedWith) && 
        goal.sharedWith.includes(userId));

    if (!hasAccess) {
      return { success: false, error: "Você não tem permissão para esta meta" };
    }

    if (amountToAdd <= 0) {
      return { success: false, error: "Valor deve ser maior que zero" };
    }

    const newCurrentAmount = Number(goal.currentAmount) + amountToAdd;

    // Atualizar histórico de contribuições
    const contributions = Array.isArray(goal.contributions) 
      ? (goal.contributions as Array<{ userId: string; amount: number; date: string }>)
      : [];
    
    contributions.push({
      userId,
      amount: amountToAdd,
      date: new Date().toISOString(),
    });

    // Se for meta compartilhada, atualizar todas as instâncias da meta
    if (goal.isShared && goal.ownerUserId) {
      // Buscar todas as metas compartilhadas usando ownerUserId (todas têm o mesmo ownerUserId)
      const allSharedGoals = await db.goal.findMany({
        where: {
          ownerUserId: goal.ownerUserId,
          isShared: true,
        },
      });

      // Calcular novo valor total somando todas as contribuições
      const totalContributions = contributions.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      const newStatus = totalContributions >= goal.targetAmount
        ? GoalStatus.COMPLETED
        : GoalStatus.ACTIVE;

      // Atualizar todas as metas compartilhadas com o mesmo ownerUserId
      for (const sharedGoal of allSharedGoals) {
        await db.goal.update({
          where: { id: sharedGoal.id },
          data: {
            currentAmount: totalContributions,
            contributions: contributions,
            status: newStatus,
          },
        });
      }
    } else {
      // Meta individual - atualizar apenas esta
      const newStatus =
        newCurrentAmount >= goal.targetAmount
          ? GoalStatus.COMPLETED
          : goal.status;

      await db.goal.update({
        where: { id, userId },
        data: {
          currentAmount: newCurrentAmount,
          status: newStatus,
          contributions: contributions,
        },
      });
    }

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


