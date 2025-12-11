"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Busca todas as notificações do usuário atual
 */
export async function getUserNotifications() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
      data: [],
    };
  }

  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limitar a 50 notificações mais recentes
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      success: true,
      data: notifications,
      unreadCount,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar notificações:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar notificações",
      data: [],
      unreadCount: 0,
    };
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Verificar se a notificação pertence ao usuário
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return {
        success: false,
        error: "Notificação não encontrada",
      };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro ao marcar notificação como lida:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar notificação como lida",
    };
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsAsRead() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar notificações como lidas",
    };
  }
}

/**
 * Deleta uma notificação
 */
export async function deleteNotification(notificationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Verificar se a notificação pertence ao usuário
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return {
        success: false,
        error: "Notificação não encontrada",
      };
    }

    await db.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erro ao deletar notificação:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar notificação",
    };
  }
}


