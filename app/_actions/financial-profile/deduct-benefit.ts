/**
 * Função para descontar valor de um benefício quando uma transação é paga com benefício
 */

"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { TransactionCategory } from "@/app/generated/prisma/client";
import type { BenefitInput } from "./schema";

/**
 * Mapeia categoria de transação para tipo de benefício
 */
const categoryToBenefitType: Record<
  TransactionCategory,
  "VA" | "VR" | "VT" | "OUTRO" | null
> = {
  FOOD: "VR", // Vale Refeição
  TRANSPORTATION: "VT", // Vale Transporte
  HOUSING: "VA", // Vale Alimentação (pode ser usado para compras)
  ENTERTAINMENT: "OUTRO",
  HEALTH: "OUTRO",
  UTILITY: "OUTRO",
  SALARY: null,
  EDUCATION: "OUTRO",
  OTHER: "OUTRO",
};

/**
 * Desconta valor de um benefício baseado na categoria da transação
 */
export async function deductFromBenefit(
  amount: number,
  category: TransactionCategory
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  try {
    console.log("🔍 Iniciando desconto de benefício:", { amount, category });
    const session = await auth();
    if (!session?.user?.id) {
      console.error("❌ Usuário não autenticado");
      return { success: false, error: "Não autorizado" };
    }

    // Buscar perfil financeiro
    const profile = await db.financialProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      console.error("❌ Perfil financeiro não encontrado");
      return {
        success: false,
        error: "Perfil financeiro não encontrado",
      };
    }

    const beneficios = (profile.beneficios as BenefitInput[]) || [];
    console.log("📊 Benefícios disponíveis:", beneficios);

    if (beneficios.length === 0) {
      console.error("❌ Nenhum benefício cadastrado");
      return {
        success: false,
        error: "Nenhum benefício cadastrado",
      };
    }

    // Identificar qual benefício usar baseado na categoria
    const benefitType = categoryToBenefitType[category];
    console.log("🎯 Tipo de benefício identificado:", benefitType, "para categoria:", category);

    if (!benefitType) {
      console.error("❌ Categoria não compatível:", category);
      return {
        success: false,
        error: "Categoria não compatível com benefícios",
      };
    }

    // Encontrar o benefício correspondente
    let benefitIndex = beneficios.findIndex((b) => b.type === benefitType);

    // Se não encontrou pelo tipo específico, tentar OUTRO
    if (benefitIndex === -1 && benefitType !== "OUTRO") {
      benefitIndex = beneficios.findIndex((b) => b.type === "OUTRO");
    }

    // Se ainda não encontrou, retornar erro
    if (benefitIndex === -1) {
      return {
        success: false,
        error: `Nenhum benefício do tipo ${benefitType} encontrado. Cadastre um benefício no perfil financeiro primeiro.`,
      };
    }

    const benefit = beneficios[benefitIndex];

    console.log("💰 Verificando saldo:", {
      tipo: benefit.type,
      saldoAtual: benefit.value,
      valorNecessario: amount,
    });

    // Verificar se há saldo suficiente
    if (benefit.value < amount) {
      console.error("❌ Saldo insuficiente:", {
        disponivel: benefit.value,
        necessario: amount,
      });
      const falta = amount - benefit.value;
      const errorMessage = `Saldo insuficiente no benefício! Disponível: R$ ${benefit.value.toFixed(2)}, Necessário: R$ ${amount.toFixed(2)}. Faltam: R$ ${falta.toFixed(2)}`;
      return {
        success: false,
        error: errorMessage,
        remaining: benefit.value,
      };
    }

    // Descontar o valor
    const updatedBeneficios = [...beneficios];
    const novoSaldo = benefit.value - amount;
    updatedBeneficios[benefitIndex] = {
      ...benefit,
      value: novoSaldo,
    };

    console.log("💾 Atualizando saldo do benefício:", {
      tipo: benefit.type,
      saldoAnterior: benefit.value,
      valorDescontado: amount,
      novoSaldo,
    });

    // Atualizar no banco
    await db.financialProfile.update({
      where: { userId: session.user.id },
      data: {
        beneficios: updatedBeneficios,
      },
    });

    console.log("✅ Benefício atualizado com sucesso");
    return {
      success: true,
      remaining: novoSaldo,
    };
  } catch (error) {
    console.error("Erro ao descontar benefício:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao descontar benefício",
    };
  }
}

