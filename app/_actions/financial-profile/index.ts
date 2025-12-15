"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import {
  financialProfileSchema,
  benefitSchema,
  type FinancialProfileInput,
  type BenefitInput,
  type PaymentInput,
} from "./schema";

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

// GET - Obter perfil financeiro do usuário
export async function getFinancialProfile() {
  try {
    const userId = await getUserId();

    // Debug: verificar se o modelo existe
    if (!db.financialProfile) {
      console.error("db.financialProfile está undefined. Modelos disponíveis:", Object.keys(db));
      throw new Error("Modelo FinancialProfile não está disponível no Prisma Client");
    }

    const profile = await db.financialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...profile,
        beneficios: profile.beneficios as BenefitInput[],
        multiplePayments: profile.multiplePayments as PaymentInput[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar perfil financeiro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar perfil financeiro",
    };
  }
}

// POST - Criar ou atualizar perfil financeiro (upsert)
export async function upsertFinancialProfile(data: FinancialProfileInput) {
  try {
    const userId = await getUserId();
    const validatedData = financialProfileSchema.parse(data);

    const profile = await db.financialProfile.upsert({
      where: { userId },
      create: {
        userId,
        rendaFixa: validatedData.rendaFixa,
        rendaVariavelMedia: validatedData.rendaVariavelMedia,
        beneficios: validatedData.beneficios,
        diaPagamento: validatedData.diaPagamento ?? null,
        multiplePayments: validatedData.multiplePayments ?? null,
      },
      update: {
        rendaFixa: validatedData.rendaFixa,
        rendaVariavelMedia: validatedData.rendaVariavelMedia,
        beneficios: validatedData.beneficios,
        diaPagamento: validatedData.diaPagamento ?? null,
        multiplePayments: validatedData.multiplePayments ?? null,
      },
    });

    revalidatePath("/profile-finance");
    revalidatePath("/");

    return {
      success: true,
      data: {
        ...profile,
        beneficios: profile.beneficios as BenefitInput[],
        multiplePayments: profile.multiplePayments as PaymentInput[] | null,
      },
    };
  } catch (error) {
    console.error("Erro ao salvar perfil financeiro:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar perfil financeiro",
    };
  }
}

// POST - Adicionar benefício
export async function addBenefit(benefit: BenefitInput) {
  try {
    const userId = await getUserId();
    const validatedBenefit = benefitSchema.parse(benefit);

    // Debug: verificar se o modelo existe
    if (!db.financialProfile) {
      console.error("db.financialProfile está undefined. Modelos disponíveis:", Object.keys(db));
      throw new Error("Modelo FinancialProfile não está disponível no Prisma Client");
    }

    const profile = await db.financialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: "Perfil financeiro não encontrado. Crie um perfil primeiro.",
      };
    }

    const beneficios = (profile.beneficios as BenefitInput[]) || [];
    const updatedBeneficios = [...beneficios, validatedBenefit];

    await db.financialProfile.update({
      where: { userId },
      data: {
        beneficios: updatedBeneficios,
      },
    });

    revalidatePath("/profile-finance");

    return {
      success: true,
      data: updatedBeneficios,
    };
  } catch (error) {
    console.error("Erro ao adicionar benefício:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar benefício",
    };
  }
}

// PUT - Editar benefício
export async function updateBenefit(index: number, benefit: BenefitInput) {
  try {
    const userId = await getUserId();
    const validatedBenefit = benefitSchema.parse(benefit);

    const profile = await db.financialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: "Perfil financeiro não encontrado.",
      };
    }

    const beneficios = (profile.beneficios as BenefitInput[]) || [];

    if (index < 0 || index >= beneficios.length) {
      return {
        success: false,
        error: "Índice de benefício inválido.",
      };
    }

    const updatedBeneficios = [...beneficios];
    updatedBeneficios[index] = validatedBenefit;

    await db.financialProfile.update({
      where: { userId },
      data: {
        beneficios: updatedBeneficios,
      },
    });

    revalidatePath("/profile-finance");

    return {
      success: true,
      data: updatedBeneficios,
    };
  } catch (error) {
    console.error("Erro ao editar benefício:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao editar benefício",
    };
  }
}

// DELETE - Remover benefício
export async function removeBenefit(index: number) {
  try {
    const userId = await getUserId();

    const profile = await db.financialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: "Perfil financeiro não encontrado.",
      };
    }

    const beneficios = (profile.beneficios as BenefitInput[]) || [];

    if (index < 0 || index >= beneficios.length) {
      return {
        success: false,
        error: "Índice de benefício inválido.",
      };
    }

    const updatedBeneficios = beneficios.filter((_, i) => i !== index);

    await db.financialProfile.update({
      where: { userId },
      data: {
        beneficios: updatedBeneficios,
      },
    });

    revalidatePath("/profile-finance");

    return {
      success: true,
      data: updatedBeneficios,
    };
  } catch (error) {
    console.error("Erro ao remover benefício:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao remover benefício",
    };
  }
}

// GET - Projeção mensal
export async function getMonthlyProjection(month?: string) {
  try {
    const userId = await getUserId();

    // Obter perfil financeiro
    const profile = await db.financialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: "Perfil financeiro não encontrado. Configure seu perfil primeiro.",
      };
    }

    // Calcular data do mês
    const targetDate = month ? new Date(month) : new Date();
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // Obter assinaturas ativas
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
        active: true,
      },
    });

    // Obter despesas recorrentes do mês (transações de despesa)
    const expenses = await db.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calcular totais
    const rendaTotal = profile.rendaFixa + profile.rendaVariavelMedia;
    const beneficiosTotal = Array.isArray(profile.beneficios)
      ? (profile.beneficios as BenefitInput[]).reduce((sum, b) => sum + (b.value || 0), 0)
      : 0;
    const assinaturasTotal = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const despesasTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    const saldoPrevisto = rendaTotal + beneficiosTotal - assinaturasTotal - despesasTotal;
    const percentComprometido = rendaTotal > 0 
      ? ((assinaturasTotal + despesasTotal) / rendaTotal) * 100 
      : 0;

    // Sugestão para meta (20% da renda disponível)
    const sugestaoParaMeta = saldoPrevisto > 0 ? saldoPrevisto * 0.2 : 0;

    return {
      success: true,
      data: {
        month: targetDate.toISOString().slice(0, 7), // YYYY-MM
        rendaTotal,
        beneficiosTotal,
        assinaturasTotal,
        despesasTotal,
        saldoPrevisto,
        percentComprometido: Math.round(percentComprometido * 100) / 100,
        sugestaoParaMeta: Math.round(sugestaoParaMeta * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular projeção:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao calcular projeção",
    };
  }
}

// DELETE - Resetar perfil financeiro (opcional)
export async function resetFinancialProfile() {
  try {
    const userId = await getUserId();

    await db.financialProfile.delete({
      where: { userId },
    });

    revalidatePath("/profile-finance");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao resetar perfil financeiro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao resetar perfil financeiro",
    };
  }
}

