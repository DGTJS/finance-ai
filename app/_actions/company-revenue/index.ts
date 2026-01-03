"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const revenueSchema = z.object({
  amount: z.number().positive("Valor deve ser maior que zero"),
  origin: z.enum(["Venda", "Serviço", "Assinatura"], {
    required_error: "Origem é obrigatória",
  }),
  paymentMethod: z.enum(
    ["PIX", "Cartão", "Boleto", "Dinheiro", "Transferência"],
    {
      required_error: "Forma de recebimento é obrigatória",
    },
  ),
  date: z.date({ required_error: "Data é obrigatória" }),
  description: z.string().optional().nullable(),
});

type RevenueInput = z.infer<typeof revenueSchema>;

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

/**
 * Cria uma nova receita para a empresa
 */
export async function createCompanyRevenue(
  companyId: string,
  data: RevenueInput,
) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou sem permissão",
      };
    }

    const validatedData = revenueSchema.parse(data);

    let revenue;
    try {
      revenue = await db.companyRevenue.create({
        data: {
          companyId,
          userId,
          amount: validatedData.amount,
          origin: validatedData.origin,
          paymentMethod: validatedData.paymentMethod,
          date: validatedData.date,
          description: validatedData.description?.trim() || null,
        },
      });
    } catch (prismaError: any) {
      // Se o erro for sobre tabela não existir, criar a tabela e tentar novamente
      if (
        prismaError?.code === "P2021" ||
        prismaError?.message?.includes("does not exist")
      ) {
        console.log("[CREATE REVENUE] Tabela não existe. Criando tabela...");

        try {
          // Criar a tabela companyrevenue
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`companyrevenue\` (
              \`id\` VARCHAR(191) NOT NULL,
              \`companyId\` VARCHAR(191) NOT NULL,
              \`userId\` VARCHAR(191) NOT NULL,
              \`amount\` DOUBLE NOT NULL,
              \`origin\` VARCHAR(191) NOT NULL,
              \`paymentMethod\` VARCHAR(191) NOT NULL,
              \`date\` DATETIME(3) NOT NULL,
              \`description\` TEXT NULL,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
              PRIMARY KEY (\`id\`),
              INDEX \`companyrevenue_companyId_idx\` (\`companyId\`),
              INDEX \`companyrevenue_userId_idx\` (\`userId\`),
              INDEX \`companyrevenue_date_idx\` (\`date\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
          `);

          // Tentar adicionar foreign keys
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`companyrevenue\` 
              ADD CONSTRAINT \`companyrevenue_companyId_fkey\` 
              FOREIGN KEY (\`companyId\`) REFERENCES \`company\` (\`id\`) 
              ON DELETE CASCADE ON UPDATE CASCADE
            `);
          } catch (fkError: any) {
            // Foreign key pode já existir, ignorar
          }

          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`companyrevenue\` 
              ADD CONSTRAINT \`companyrevenue_userId_fkey\` 
              FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
              ON DELETE CASCADE ON UPDATE CASCADE
            `);
          } catch (fkError: any) {
            // Foreign key pode já existir, ignorar
          }

          console.log(
            "[CREATE REVENUE] Tabela criada. Tentando criar receita novamente...",
          );

          // Tentar criar novamente
          revenue = await db.companyRevenue.create({
            data: {
              companyId,
              userId,
              amount: validatedData.amount,
              origin: validatedData.origin,
              paymentMethod: validatedData.paymentMethod,
              date: validatedData.date,
              description: validatedData.description?.trim() || null,
            },
          });
        } catch (createTableError: any) {
          console.error(
            "[CREATE REVENUE] Erro ao criar tabela:",
            createTableError,
          );
          throw new Error(
            "Erro ao criar tabela companyrevenue. Execute o script de migração manualmente.",
          );
        }
      } else {
        // Re-lançar o erro se não for sobre tabela não existir
        throw prismaError;
      }
    }

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard/company/revenue");
    return {
      success: true,
      data: revenue,
    };
  } catch (error) {
    console.error("Erro ao criar receita:", error);
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
          : "Erro ao criar receita. Tente novamente.",
    };
  }
}

/**
 * Busca todas as receitas da empresa
 */
export async function getCompanyRevenues(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou sem permissão",
        data: [],
      };
    }

    const revenues = await db.companyRevenue.findMany({
      where: {
        companyId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      success: true,
      data: revenues,
    };
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return {
      success: false,
      error: "Erro ao buscar receitas",
      data: [],
    };
  }
}

/**
 * Busca receitas do mês atual da empresa
 */
export async function getCompanyRevenuesThisMonth(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou sem permissão",
        data: [],
        total: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const revenues = await db.companyRevenue.findMany({
      where: {
        companyId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const total = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);

    return {
      success: true,
      data: revenues,
      total,
    };
  } catch (error) {
    console.error("Erro ao buscar receitas do mês:", error);
    return {
      success: false,
      error: "Erro ao buscar receitas do mês",
      data: [],
      total: 0,
    };
  }
}

/**
 * Busca receitas do mês anterior da empresa (para comparação)
 */
export async function getCompanyRevenuesLastMonth(companyId: string) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou sem permissão",
        total: 0,
      };
    }

    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const revenues = await db.companyRevenue.findMany({
      where: {
        companyId,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const total = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);

    return {
      success: true,
      total,
    };
  } catch (error) {
    console.error("Erro ao buscar receitas do mês anterior:", error);
    return {
      success: false,
      error: "Erro ao buscar receitas do mês anterior",
      total: 0,
    };
  }
}

/**
 * Atualiza uma receita
 */
export async function updateCompanyRevenue(
  revenueId: string,
  companyId: string,
  data: Partial<RevenueInput>,
) {
  try {
    const userId = await getUserId();

    // Verificar se a receita pertence à empresa do usuário
    const revenue = await db.companyRevenue.findFirst({
      where: {
        id: revenueId,
        companyId,
        userId,
      },
    });

    if (!revenue) {
      return {
        success: false,
        error: "Receita não encontrada ou sem permissão",
      };
    }

    const validatedData = revenueSchema.partial().parse(data);

    const updated = await db.companyRevenue.update({
      where: { id: revenueId },
      data: validatedData,
    });

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard/company/revenue");
    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
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
          : "Erro ao atualizar receita. Tente novamente.",
    };
  }
}

/**
 * Deleta uma receita
 */
export async function deleteCompanyRevenue(
  revenueId: string,
  companyId: string,
) {
  try {
    const userId = await getUserId();

    // Verificar se a receita pertence à empresa do usuário
    const revenue = await db.companyRevenue.findFirst({
      where: {
        id: revenueId,
        companyId,
        userId,
      },
    });

    if (!revenue) {
      return {
        success: false,
        error: "Receita não encontrada ou sem permissão",
      };
    }

    await db.companyRevenue.delete({
      where: { id: revenueId },
    });

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard/company/revenue");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar receita:", error);
    return {
      success: false,
      error: "Erro ao deletar receita",
    };
  }
}
