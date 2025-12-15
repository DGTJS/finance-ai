"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { detectLogo } from "@/app/_lib/logo-detection";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  deleteSubscriptionSchema,
  type CreateSubscriptionInput,
  type UpdateSubscriptionInput,
  type DeleteSubscriptionInput,
} from "./schema";
import { revalidatePath } from "next/cache";

/**
 * Calcula a próxima data de vencimento
 */
function calculateNextDueDate(dueDate: Date, recurring: boolean): Date | null {
  if (!recurring) {
    return null;
  }

  const next = new Date(dueDate);
  next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * Cria uma nova assinatura
 */
export async function createSubscription(input: CreateSubscriptionInput) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado. Faça login para continuar.",
      };
    }

    // Validar dados
    const validation = createSubscriptionSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Usar logoUrl fornecido ou detectar automaticamente
    let logoUrl: string | null = null;
    if (data.logoUrl) {
      logoUrl = data.logoUrl;
    } else {
      // Detectar logo automaticamente apenas se não foi fornecido
      const logoResult = await detectLogo(data.name);
      logoUrl = logoResult.logoUrl;
    }

    // Calcular próxima data de vencimento
    const nextDueDate = data.nextDueDate
      ? new Date(data.nextDueDate)
      : calculateNextDueDate(data.dueDate, data.recurring);

    // Criar assinatura
    const subscription = await db.subscription.create({
      data: {
        userId: session.user.id,
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        recurring: data.recurring,
        nextDueDate,
        active: data.active,
        logoUrl,
      },
    });

    revalidatePath("/subscription");

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao criar assinatura",
    };
  }
}

/**
 * Atualiza uma assinatura existente
 */
export async function updateSubscription(input: UpdateSubscriptionInput) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado. Faça login para continuar.",
      };
    }

    // Validar dados
    const validation = updateSubscriptionSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.error.flatten().fieldErrors,
      };
    }

    const { id, ...data } = validation.data;

    // Verificar se a assinatura existe e pertence ao usuário
    const existing = await db.subscription.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Assinatura não encontrada",
      };
    }

    // Se o nome mudou, detectar novo logo
    let logoUrl = data.logoUrl;
    if (data.name && data.name !== existing.name) {
      const logoResult = await detectLogo(data.name);
      logoUrl = logoResult.logoUrl;
    }

    // Recalcular nextDueDate se necessário
    let nextDueDate = data.nextDueDate;
    if (data.dueDate && data.recurring !== false) {
      nextDueDate = calculateNextDueDate(
        data.dueDate,
        data.recurring ?? existing.recurring,
      );
    }

    // Atualizar assinatura
    const subscription = await db.subscription.update({
      where: { id },
      data: {
        ...data,
        logoUrl,
        nextDueDate,
      },
    });

    revalidatePath("/subscription");

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Erro ao atualizar assinatura:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar assinatura",
    };
  }
}

/**
 * Deleta uma assinatura
 */
export async function deleteSubscription(input: DeleteSubscriptionInput) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado. Faça login para continuar.",
      };
    }

    // Validar dados
    const validation = deleteSubscriptionSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    const { id } = validation.data;

    // Verificar se a assinatura existe e pertence ao usuário
    const existing = await db.subscription.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Assinatura não encontrada",
      };
    }

    // Deletar assinatura
    await db.subscription.delete({
      where: { id },
    });

    revalidatePath("/subscription");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar assinatura:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao deletar assinatura",
    };
  }
}

/**
 * Lista todas as assinaturas do usuário
 */
export async function getUserSubscriptions() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ active: "desc" }, { nextDueDate: "asc" }],
    });

    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return {
      success: false,
      error: "Erro ao buscar assinaturas",
    };
  }
}

/**
 * Busca uma assinatura específica
 */
export async function getSubscription(id: string) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const subscription = await db.subscription.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return {
        success: false,
        error: "Assinatura não encontrada",
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    return {
      success: false,
      error: "Erro ao buscar assinatura",
    };
  }
}

/**
 * Atualiza logo de uma assinatura manualmente
 */
export async function updateSubscriptionLogo(id: string) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const subscription = await db.subscription.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return {
        success: false,
        error: "Assinatura não encontrada",
      };
    }

    const logoResult = await detectLogo(subscription.name);

    await db.subscription.update({
      where: { id },
      data: {
        logoUrl: logoResult.logoUrl,
      },
    });

    revalidatePath("/subscription");

    return {
      success: true,
      logoUrl: logoResult.logoUrl,
    };
  } catch (error) {
    console.error("Erro ao atualizar logo:", error);
    return {
      success: false,
      error: "Erro ao atualizar logo",
    };
  }
}

