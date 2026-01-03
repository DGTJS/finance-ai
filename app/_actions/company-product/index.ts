"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  quantity: z.number().int().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z
    .number()
    .int()
    .min(0, "Quantidade mínima não pode ser negativa"),
  costPrice: z.number().min(0, "Preço de custo não pode ser negativo"),
  salePrice: z.number().min(0, "Preço de venda não pode ser negativo"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

type ProductInput = z.infer<typeof productSchema>;

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

// Calcular MARGEM DE LUCRO: ((salePrice - costPrice) / salePrice) * 100
// Margem nunca pode ser acima de 100%
// Exemplo: Custo R$ 10, Preço R$ 30 → Margem = ((30-10)/30)*100 = 66,6%
function calculateMargin(costPrice: number, salePrice: number): number {
  if (salePrice === 0) return 0;
  const margin = ((salePrice - costPrice) / salePrice) * 100;
  // Garantir que margem está entre 0% e 100%
  return Math.min(Math.max(margin, 0), 100);
}

/**
 * Cria um novo produto para a empresa
 */
export async function createCompanyProduct(
  companyId: string,
  data: ProductInput,
) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário e tem estoque habilitado
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
      };
    }

    const validatedData = productSchema.parse(data);
    const margin = calculateMargin(
      validatedData.costPrice,
      validatedData.salePrice,
    );

    let product;
    try {
      product = await db.companyProduct.create({
        data: {
          companyId,
          userId,
          name: validatedData.name.trim(),
          quantity: validatedData.quantity,
          minQuantity: validatedData.minQuantity,
          costPrice: validatedData.costPrice,
          salePrice: validatedData.salePrice,
          margin,
          description: validatedData.description?.trim() || null,
          isActive: validatedData.isActive ?? true,
        },
      });
    } catch (createError: any) {
      // Se a tabela não existir, criar e tentar novamente
      if (
        createError?.code === "P2021" ||
        createError?.message?.includes("does not exist")
      ) {
        console.log(
          "[CREATE PRODUCT] Tabela companyproduct não encontrada, criando...",
        );

        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS \`companyproduct\` (
            \`id\` VARCHAR(191) NOT NULL,
            \`companyId\` VARCHAR(191) NOT NULL,
            \`userId\` VARCHAR(191) NOT NULL,
            \`name\` VARCHAR(191) NOT NULL,
            \`quantity\` INT NOT NULL DEFAULT 0,
            \`minQuantity\` INT NOT NULL DEFAULT 0,
            \`costPrice\` DOUBLE NOT NULL DEFAULT 0,
            \`salePrice\` DOUBLE NOT NULL DEFAULT 0,
            \`margin\` DOUBLE NOT NULL DEFAULT 0,
            \`description\` TEXT,
            \`isActive\` BOOLEAN NOT NULL DEFAULT true,
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            PRIMARY KEY (\`id\`),
            INDEX \`companyproduct_companyId_idx\` (\`companyId\`),
            INDEX \`companyproduct_userId_idx\` (\`userId\`),
            INDEX \`companyproduct_isActive_idx\` (\`isActive\`),
            CONSTRAINT \`companyproduct_companyId_fkey\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT \`companyproduct_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Tentar novamente após criar a tabela
        product = await db.companyProduct.create({
          data: {
            companyId,
            userId,
            name: validatedData.name.trim(),
            quantity: validatedData.quantity,
            minQuantity: validatedData.minQuantity,
            costPrice: validatedData.costPrice,
            salePrice: validatedData.salePrice,
            margin,
            description: validatedData.description?.trim() || null,
            isActive: validatedData.isActive ?? true,
          },
        });
      } else {
        throw createError;
      }
    }

    revalidatePath("/dashboard/company/stock");
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao criar produto. Tente novamente.",
    };
  }
}

/**
 * Busca todos os produtos da empresa
 */
export async function getCompanyProducts(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário e tem estoque habilitado
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
        data: [],
      };
    }

    const products = await db.companyProduct.findMany({
      where: {
        companyId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return {
      success: false,
      error: "Erro ao buscar produtos",
      data: [],
    };
  }
}

/**
 * Busca produtos com estoque baixo
 */
export async function getLowStockProducts(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário e tem estoque habilitado
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
        data: [],
      };
    }

    // Buscar produtos onde quantity <= minQuantity usando SQL raw
    // pois Prisma não suporta comparação entre campos diretamente
    const productsRaw = (await db.$queryRawUnsafe(
      `SELECT * FROM \`companyproduct\` 
       WHERE \`companyId\` = ? 
       AND \`isActive\` = 1 
       AND \`quantity\` <= \`minQuantity\`
       ORDER BY \`quantity\` ASC`,
      companyId,
    )) as any[];

    const products = productsRaw.map((p: any) => ({
      id: p.id,
      companyId: p.companyId,
      userId: p.userId,
      name: p.name,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      margin: p.margin,
      description: p.description,
      isActive: p.isActive === 1 || p.isActive === true,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Erro ao buscar produtos com estoque baixo:", error);
    return {
      success: false,
      error: "Erro ao buscar produtos com estoque baixo",
      data: [],
    };
  }
}

/**
 * Atualiza um produto
 */
export async function updateCompanyProduct(
  productId: string,
  companyId: string,
  data: Partial<ProductInput>,
) {
  try {
    const userId = await getUserId();

    // Verificar se o produto pertence à empresa do usuário
    const product = await db.companyProduct.findFirst({
      where: {
        id: productId,
        companyId,
        userId,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Produto não encontrado ou sem permissão",
      };
    }

    const validatedData = productSchema.partial().parse(data);

    // Recalcular margem se preços foram atualizados
    const costPrice = validatedData.costPrice ?? product.costPrice;
    const salePrice = validatedData.salePrice ?? product.salePrice;
    const margin = calculateMargin(costPrice, salePrice);

    const updateData: any = { ...validatedData };
    if (
      validatedData.costPrice !== undefined ||
      validatedData.salePrice !== undefined
    ) {
      updateData.margin = margin;
    }

    const updated = await db.companyProduct.update({
      where: { id: productId },
      data: updateData,
    });

    revalidatePath("/dashboard/company/stock");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar produto. Tente novamente.",
    };
  }
}

/**
 * Atualiza a quantidade de um produto
 */
export async function updateProductQuantity(
  productId: string,
  companyId: string,
  quantity: number,
) {
  try {
    const userId = await getUserId();

    // Verificar se o produto pertence à empresa do usuário
    const product = await db.companyProduct.findFirst({
      where: {
        id: productId,
        companyId,
        userId,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Produto não encontrado ou sem permissão",
      };
    }

    if (quantity < 0) {
      return {
        success: false,
        error: "Quantidade não pode ser negativa",
      };
    }

    const updated = await db.companyProduct.update({
      where: { id: productId },
      data: { quantity },
    });

    revalidatePath("/dashboard/company/stock");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    return {
      success: false,
      error: "Erro ao atualizar quantidade",
    };
  }
}

/**
 * Deleta um produto
 */
export async function deleteCompanyProduct(
  productId: string,
  companyId: string,
) {
  try {
    const userId = await getUserId();

    // Verificar se o produto pertence à empresa do usuário
    const product = await db.companyProduct.findFirst({
      where: {
        id: productId,
        companyId,
        userId,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Produto não encontrado ou sem permissão",
      };
    }

    await db.companyProduct.delete({
      where: { id: productId },
    });

    revalidatePath("/dashboard/company/stock");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return {
      success: false,
      error: "Erro ao deletar produto",
    };
  }
}
