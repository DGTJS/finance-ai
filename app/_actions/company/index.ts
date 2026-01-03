"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CompanyData } from "@/app/_contexts/company-context";

const companySchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  companyType: z.string().min(1, "Tipo da empresa é obrigatório"),
  hasStock: z.boolean().default(false),
});

type CompanyInput = z.infer<typeof companySchema>;

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

/**
 * Cria uma nova empresa para o usuário logado
 */
export async function createCompany(data: CompanyInput) {
  try {
    console.log("[CREATE COMPANY] Dados recebidos:", data);
    const userId = await getUserId();
    console.log("[CREATE COMPANY] UserId:", userId);

    const validatedData = companySchema.parse(data);
    console.log("[CREATE COMPANY] Dados validados:", validatedData);

    // Verificar se já existe empresa com o mesmo nome para este usuário
    let existingCompany = null;
    try {
      existingCompany = await db.company.findFirst({
        where: {
          userId,
          name: validatedData.name.trim(),
          isActive: true,
        },
      });
    } catch (checkError: any) {
      // Se o erro for sobre tabela não existir, criar a tabela e continuar
      if (
        checkError?.code === "P2021" ||
        checkError?.message?.includes("does not exist")
      ) {
        console.log(
          "[CREATE COMPANY] Tabela não existe na verificação. Criando tabela...",
        );

        try {
          // Criar a tabela company
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`company\` (
              \`id\` VARCHAR(191) NOT NULL,
              \`userId\` VARCHAR(191) NOT NULL,
              \`name\` VARCHAR(191) NOT NULL,
              \`companyType\` VARCHAR(191) NOT NULL,
              \`hasStock\` BOOLEAN NOT NULL DEFAULT false,
              \`isActive\` BOOLEAN NOT NULL DEFAULT true,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
              PRIMARY KEY (\`id\`),
              INDEX \`company_userId_idx\` (\`userId\`),
              INDEX \`company_isActive_idx\` (\`isActive\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
          `);

          // Tentar adicionar foreign key (pode falhar se já existir)
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`company\` 
              ADD CONSTRAINT \`company_userId_fkey\` 
              FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
              ON DELETE CASCADE ON UPDATE CASCADE
            `);
          } catch (fkError: any) {
            // Foreign key pode já existir, ignorar
            console.log(
              "[CREATE COMPANY] Foreign key já existe ou erro ao criar:",
              fkError.message,
            );
          }

          console.log(
            "[CREATE COMPANY] Tabela criada. Continuando verificação...",
          );
          // Tabela criada, não há empresas duplicadas ainda
          existingCompany = null;
        } catch (createTableError: any) {
          console.error(
            "[CREATE COMPANY] Erro ao criar tabela:",
            createTableError,
          );
          return {
            success: false,
            error:
              "Erro ao criar tabela company. Tente novamente ou execute: npx prisma generate",
          };
        }
      } else {
        // Re-lançar o erro se não for sobre tabela não existir
        throw checkError;
      }
    }

    if (existingCompany) {
      console.log(
        "[CREATE COMPANY] Empresa duplicada encontrada:",
        existingCompany,
      );
      return {
        success: false,
        error: "Já existe uma empresa com este nome. Use um nome diferente.",
      };
    }

    console.log("[CREATE COMPANY] Criando empresa no banco...");

    let company;
    try {
      // Tentar criar usando Prisma Client
      company = await db.company.create({
        data: {
          userId,
          name: validatedData.name.trim(),
          companyType: validatedData.companyType,
          hasStock: validatedData.hasStock,
        },
      });
    } catch (prismaError: any) {
      // Se o erro for sobre tabela não existir, criar a tabela e tentar novamente
      if (
        prismaError?.code === "P2021" ||
        prismaError?.message?.includes("does not exist")
      ) {
        console.log("[CREATE COMPANY] Tabela não existe. Criando tabela...");

        try {
          // Criar a tabela company
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`company\` (
              \`id\` VARCHAR(191) NOT NULL,
              \`userId\` VARCHAR(191) NOT NULL,
              \`name\` VARCHAR(191) NOT NULL,
              \`companyType\` VARCHAR(191) NOT NULL,
              \`hasStock\` BOOLEAN NOT NULL DEFAULT false,
              \`isActive\` BOOLEAN NOT NULL DEFAULT true,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
              PRIMARY KEY (\`id\`),
              INDEX \`company_userId_idx\` (\`userId\`),
              INDEX \`company_isActive_idx\` (\`isActive\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
          `);

          // Tentar adicionar foreign key (pode falhar se já existir)
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`company\` 
              ADD CONSTRAINT \`company_userId_fkey\` 
              FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
              ON DELETE CASCADE ON UPDATE CASCADE
            `);
          } catch (fkError: any) {
            // Foreign key pode já existir, ignorar
            console.log(
              "[CREATE COMPANY] Foreign key já existe ou erro ao criar:",
              fkError.message,
            );
          }

          console.log(
            "[CREATE COMPANY] Tabela criada. Tentando criar empresa novamente...",
          );

          // Tentar criar novamente
          company = await db.company.create({
            data: {
              userId,
              name: validatedData.name.trim(),
              companyType: validatedData.companyType,
              hasStock: validatedData.hasStock,
            },
          });
        } catch (createTableError: any) {
          console.error(
            "[CREATE COMPANY] Erro ao criar tabela:",
            createTableError,
          );
          throw new Error(
            "Erro ao criar tabela company. Execute o script de migração manualmente.",
          );
        }
      } else {
        // Re-lançar o erro se não for sobre tabela não existir
        throw prismaError;
      }
    }

    console.log("[CREATE COMPANY] Empresa criada com sucesso:", company);

    revalidatePath("/dashboard/company");
    return {
      success: true,
      data: {
        companyId: company.id,
        companyName: company.name,
        hasStock: company.hasStock,
        companyType: company.companyType,
      } as CompanyData,
    };
  } catch (error: any) {
    console.error("[CREATE COMPANY] Erro completo:", {
      error,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    // Verificar se é erro do Prisma sobre tabela não existir
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      // Este erro já deveria ter sido tratado no fallback acima
      // Se chegou aqui, significa que o fallback falhou
      return {
        success: false,
        error:
          "Erro ao acessar tabela company. Tente novamente ou verifique a conexão com o banco de dados.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao criar empresa. Tente novamente.",
    };
  }
}

/**
 * Busca todas as empresas do usuário logado
 */
export async function getUserCompanies() {
  try {
    const userId = await getUserId();

    const companies = await db.company.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const companiesData: CompanyData[] = companies.map((company) => ({
      companyId: company.id,
      companyName: company.name,
      hasStock: company.hasStock,
      companyType: company.companyType,
    }));

    return {
      success: true,
      data: companiesData,
    };
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return {
      success: false,
      error: "Erro ao buscar empresas",
      data: [] as CompanyData[],
    };
  }
}

/**
 * Atualiza uma empresa
 */
export async function updateCompany(
  companyId: string,
  data: Partial<
    Pick<CompanyInput, "name" | "companyType" | "hasStock"> & {
      hasEmployees?: boolean;
      hasPartners?: boolean;
      numberOfPartners?: string;
    }
  >,
) {
  try {
    const userId = await getUserId();

    // Verificar se a empresa pertence ao usuário
    const existingCompany = await db.company.findFirst({
      where: {
        id: companyId,
        userId,
        isActive: true,
      },
    });

    if (!existingCompany) {
      return {
        success: false,
        error: "Empresa não encontrada ou sem permissão",
      };
    }

    // Validar dados
    if (data.name !== undefined && (!data.name || data.name.trim() === "")) {
      return {
        success: false,
        error: "O nome da empresa é obrigatório",
      };
    }

    // Preparar dados de atualização
    const updateData: any = {
      ...(data.name && { name: data.name.trim() }),
      ...(data.companyType && { companyType: data.companyType }),
      ...(data.hasStock !== undefined && { hasStock: data.hasStock }),
    };

    // Atualizar empresa
    const updatedCompany = await db.company.update({
      where: {
        id: companyId,
      },
      data: updateData,
    });

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard/company/settings");

    return {
      success: true,
      data: {
        companyId: updatedCompany.id,
        companyName: updatedCompany.name,
        hasStock: updatedCompany.hasStock,
        companyType: updatedCompany.companyType,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar empresa. Tente novamente.",
    };
  }
}

/**
 * Busca uma empresa específica por ID (apenas se pertencer ao usuário)
 */
export async function getCompanyById(companyId: string) {
  try {
    const userId = await getUserId();

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
        error: "Empresa não encontrada",
        data: null,
      };
    }

    const companyData: CompanyData = {
      companyId: company.id,
      companyName: company.name,
      hasStock: company.hasStock,
      companyType: company.companyType,
    };

    return {
      success: true,
      data: companyData,
    };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return {
      success: false,
      error: "Erro ao buscar empresa",
      data: null,
    };
  }
}
