"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/auth";

/**
 * Conta produtos de uma empresa (sem verificar hasStock)
 */
export async function countCompanyProducts(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autorizado",
        count: 0,
      };
    }

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada",
        count: 0,
      };
    }

    const count = await db.companyProduct.count({
      where: {
        companyId,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Erro ao contar produtos:", error);
    return {
      success: false,
      error: "Erro ao contar produtos",
      count: 0,
    };
  }
}
