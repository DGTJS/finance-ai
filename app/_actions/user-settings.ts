"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

export interface UserSettingsData {
  userTitle?: string;
  hfApiKey?: string;
  closingDay?: number;
  emailNotifications?: boolean;
  subscriptionAlerts?: boolean;
  transactionAlerts?: boolean;
  aiInsights?: boolean;
  categoryIcons?: Record<string, string> | null;
}

/**
 * Busca as configurações do usuário atual
 */
export async function getUserSettings() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const settings = await db.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return {
      success: false,
      error: "Erro ao buscar configurações",
    };
  }
}

/**
 * Salva ou atualiza as configurações do usuário atual
 */
export async function saveUserSettings(data: UserSettingsData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const settings = await db.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/transactions");

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return {
      success: false,
      error: "Erro ao salvar configurações",
    };
  }
}

/**
 * Busca a chave da API Hugging Face do usuário
 */
export async function getUserHfApiKey(userId: string): Promise<string | null> {
  try {
    const settings = await db.userSettings.findUnique({
      where: {
        userId,
      },
      select: {
        hfApiKey: true,
      },
    });

    return settings?.hfApiKey || null;
  } catch (error) {
    console.error("Erro ao buscar chave da API:", error);
    return null;
  }
}

/**
 * Busca as configurações de um usuário específico (apenas para admins/owners)
 */
export async function getUserSettingsByUserId(targetUserId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const settings = await db.userSettings.findUnique({
      where: {
        userId: targetUserId,
      },
    });

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return {
      success: false,
      error: "Erro ao buscar configurações",
    };
  }
}

/**
 * Atualiza as configurações de um usuário específico (apenas para admins/owners)
 */
export async function updateUserSettingsByUserId(
  targetUserId: string,
  data: UserSettingsData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const settings = await db.userSettings.upsert({
      where: {
        userId: targetUserId,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId: targetUserId,
        ...data,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/transactions");

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return {
      success: false,
      error: "Erro ao salvar configurações",
    };
  }
}
