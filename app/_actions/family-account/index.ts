"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const addUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(),
  userTitle: z.string().optional().nullable(),
});

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

/**
 * Busca a conta compartilhada do usuário atual
 */
export async function getFamilyAccount() {
  try {
    const userId = await getUserId();

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        familyAccount: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Se não tem conta compartilhada, criar uma
    if (!user.familyAccountId) {
      const familyAccount = await db.familyAccount.create({
        data: {
          name: `${user.name || "Conta"} - Família`,
          ownerId: userId, // Definir o criador como dono
          users: {
            connect: { id: userId },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      // Atualizar o usuário para vincular à conta e definir como OWNER
      await db.user.update({
        where: { id: userId },
        data: {
          familyAccountId: familyAccount.id,
          role: "OWNER",
        },
      });

      return {
        success: true,
        data: {
          ...familyAccount,
          users: familyAccount.users.map((u) => ({
            ...u,
            role: u.id === userId ? "OWNER" : u.role,
          })),
        },
      };
    }

    return {
      success: true,
      data: user.familyAccount,
    };
  } catch (error) {
    console.error("Erro ao buscar conta compartilhada:", error);
    return {
      success: false,
      error: "Erro ao buscar conta compartilhada",
    };
  }
}

/**
 * Adiciona um novo usuário à conta compartilhada
 */
export async function addUserToFamilyAccount(
  data: z.infer<typeof addUserSchema>,
) {
  try {
    const userId = await getUserId();
    const validatedData = addUserSchema.parse(data);

    // Verificar permissões: apenas OWNER ou ADMIN podem adicionar usuários
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, familyAccountId: true },
    });

    if (
      !currentUser ||
      (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")
    ) {
      return {
        success: false,
        error: "Você não tem permissão para adicionar usuários",
      };
    }

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está em uso",
      };
    }

    // Buscar a conta compartilhada do usuário atual (já buscado acima)
    let currentUserData = await db.user.findUnique({
      where: { id: userId },
      select: { familyAccountId: true, name: true },
    });

    // Se não tem conta compartilhada, criar uma
    if (!currentUserData?.familyAccountId) {
      const familyAccount = await db.familyAccount.create({
        data: {
          name: `${currentUserData?.name || "Conta"} - Família`,
          ownerId: userId, // Definir o criador como dono
          users: {
            connect: { id: userId },
          },
        },
      });

      // Atualizar o usuário para vincular à conta e definir como OWNER
      await db.user.update({
        where: { id: userId },
        data: {
          familyAccountId: familyAccount.id,
          role: "OWNER",
        },
      });

      // Buscar novamente para obter o familyAccountId
      currentUserData = await db.user.findUnique({
        where: { id: userId },
        select: { familyAccountId: true, name: true },
      });
    }

    if (!currentUserData?.familyAccountId) {
      return {
        success: false,
        error: "Erro ao criar conta compartilhada",
      };
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Criar novo usuário e vincular à conta compartilhada (padrão: MEMBER)
    const newUser = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        familyAccountId: currentUserData.familyAccountId,
        role: "MEMBER", // Novo usuário começa como MEMBER
      },
    });

    revalidatePath("/settings");
    return {
      success: true,
      data: newUser,
    };
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao adicionar usuário",
    };
  }
}

/**
 * Atualiza um usuário da conta compartilhada
 */
export async function updateFamilyAccountUser(
  data: z.infer<typeof updateUserSchema>,
) {
  try {
    const userId = await getUserId();
    const validatedData = updateUserSchema.parse(data);

    // Verificar se o usuário pertence à mesma conta compartilhada
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { familyAccountId: true, role: true },
    });

    const targetUser = await db.user.findUnique({
      where: { id: validatedData.id },
      select: { familyAccountId: true, role: true },
    });

    if (!currentUser?.familyAccountId || !targetUser?.familyAccountId) {
      return {
        success: false,
        error: "Usuário não encontrado ou não pertence à mesma conta",
      };
    }

    if (currentUser.familyAccountId !== targetUser.familyAccountId) {
      return {
        success: false,
        error: "Usuário não pertence à mesma conta compartilhada",
      };
    }

    // Verificar permissões para editar usuários
    // OWNER pode editar qualquer um, ADMIN pode editar apenas MEMBER, MEMBER não pode editar ninguém
    if (currentUser.role === "MEMBER") {
      // MEMBER só pode editar a si mesmo
      if (userId !== validatedData.id) {
        return {
          success: false,
          error: "Você não tem permissão para editar outros usuários",
        };
      }
    } else if (currentUser.role === "ADMIN") {
      // ADMIN não pode editar OWNER
      if (targetUser.role === "OWNER") {
        return {
          success: false,
          error: "Você não tem permissão para editar o dono da conta",
        };
      }
    }

    // Verificar se está tentando alterar o role
    if (validatedData.role) {
      // Apenas OWNER pode alterar roles
      if (currentUser.role !== "OWNER") {
        return {
          success: false,
          error: "Apenas o dono da conta pode alterar permissões",
        };
      }
      // Não permitir alterar o role do OWNER
      if (targetUser.role === "OWNER" && validatedData.role !== "OWNER") {
        return {
          success: false,
          error: "Não é possível alterar a permissão do dono da conta",
        };
      }
    }

    // Preparar dados para atualização
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: "OWNER" | "ADMIN" | "MEMBER";
    } = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) {
      // Verificar se o email já existe em outro usuário
      const emailExists = await db.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: validatedData.id },
        },
      });

      if (emailExists) {
        return {
          success: false,
          error: "Este email já está em uso",
        };
      }

      updateData.email = validatedData.email;
    }
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }
    if (validatedData.role) {
      updateData.role = validatedData.role;
    }

    const updatedUser = await db.user.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    // Atualizar também o userTitle nas configurações do usuário
    if (validatedData.userTitle !== undefined) {
      await db.userSettings.upsert({
        where: {
          userId: validatedData.id,
        },
        update: {
          userTitle: validatedData.userTitle || null,
        },
        create: {
          userId: validatedData.id,
          userTitle: validatedData.userTitle || null,
        },
      });
    }

    revalidatePath("/settings");
    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar usuário",
    };
  }
}

/**
 * Remove um usuário da conta compartilhada
 */
export async function removeUserFromFamilyAccount(userIdToRemove: string) {
  try {
    const userId = await getUserId();

    // Verificar se o usuário pertence à mesma conta compartilhada
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { familyAccountId: true, role: true },
    });

    const targetUser = await db.user.findUnique({
      where: { id: userIdToRemove },
      select: { familyAccountId: true, role: true },
    });

    if (!currentUser?.familyAccountId || !targetUser?.familyAccountId) {
      return {
        success: false,
        error: "Usuário não encontrado ou não pertence à mesma conta",
      };
    }

    if (currentUser.familyAccountId !== targetUser.familyAccountId) {
      return {
        success: false,
        error: "Usuário não pertence à mesma conta compartilhada",
      };
    }

    // Verificar permissões: apenas OWNER ou ADMIN podem remover usuários
    if (currentUser.role === "MEMBER") {
      return {
        success: false,
        error: "Você não tem permissão para remover usuários",
      };
    }

    // ADMIN não pode remover OWNER
    if (currentUser.role === "ADMIN" && targetUser.role === "OWNER") {
      return {
        success: false,
        error: "Você não tem permissão para remover o dono da conta",
      };
    }

    // Não permitir remover a si mesmo
    if (userId === userIdToRemove) {
      return {
        success: false,
        error: "Você não pode remover a si mesmo",
      };
    }

    // Remover o vínculo com a conta compartilhada
    await db.user.update({
      where: { id: userIdToRemove },
      data: { familyAccountId: null },
    });

    revalidatePath("/settings");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao remover usuário",
    };
  }
}
