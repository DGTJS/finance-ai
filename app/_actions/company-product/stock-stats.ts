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
 * Calcula estatísticas do estoque da empresa
 */
export async function getCompanyStockStats(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
        hasStock: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou estoque não habilitado",
        data: null,
      };
    }

    let products = [];
    try {
      products = await db.companyProduct.findMany({
        where: {
          companyId,
          isActive: true,
        },
      });
    } catch (error: any) {
      // Se a tabela não existir, retornar estatísticas vazias
      if (
        error?.code === "P2021" ||
        error?.message?.includes("does not exist")
      ) {
        console.log(
          "[STOCK STATS] Tabela companyproduct não encontrada, retornando estatísticas vazias",
        );
        return {
          success: true,
          data: {
            totalCostValue: 0,
            totalSaleValue: 0,
            totalProducts: 0,
            productsWithLowStock: 0,
            idleProductsCount: 0,
            oldestProductDays: 0,
            averageMargin: 0,
          },
        };
      }
      throw error;
    }

    const now = new Date();
    let totalCostValue = 0; // Valor total em custo
    let totalSaleValue = 0; // Valor total em venda
    let totalProducts = products.length;
    let productsWithLowStock = 0;
    let productsStopped = 0; // Produtos parados há mais de 30 dias
    let oldestProductDays = 0;

    products.forEach((product) => {
      const costValue = product.quantity * product.costPrice;
      const saleValue = product.quantity * product.salePrice;

      totalCostValue += costValue;
      totalSaleValue += saleValue;

      if (product.quantity <= product.minQuantity) {
        productsWithLowStock++;
      }

      // Calcular dias desde criação
      const daysSinceCreation = Math.floor(
        (now.getTime() - new Date(product.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceCreation > oldestProductDays) {
        oldestProductDays = daysSinceCreation;
      }

      // Produto parado há mais de 30 dias sem venda (assumindo que se não foi atualizado, não vendeu)
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(product.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceUpdate > 30 && product.quantity > 0) {
        productsStopped++;
      }
    });

    return {
      success: true,
      data: {
        totalCostValue,
        totalSaleValue,
        totalProducts,
        productsWithLowStock,
        productsStopped,
        oldestProductDays,
        // Calcular MARGEM DE LUCRO média corretamente: ((totalSaleValue - totalCostValue) / totalSaleValue) * 100
        // Margem nunca pode ser acima de 100%
        averageMargin:
          totalSaleValue > 0
            ? Math.min(
                Math.max(
                  ((totalSaleValue - totalCostValue) / totalSaleValue) * 100,
                  0,
                ),
                100,
              )
            : 0,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas de estoque:", error);
    return {
      success: false,
      error: "Erro ao calcular estatísticas de estoque",
      data: null,
    };
  }
}
