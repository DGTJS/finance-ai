"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

/**
 * Altera a senha do usuário atual
 */
export async function changePassword(data: z.infer<typeof changePasswordSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    const validatedData = changePasswordSchema.parse(data);

    // Buscar o usuário com a senha atual
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Verificar se o usuário tem senha (não é login via Google)
    if (!user.password) {
      return {
        success: false,
        error: "Usuários que fazem login com Google não podem alterar a senha aqui",
      };
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Senha atual incorreta",
      };
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Atualizar a senha
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    revalidatePath("/settings");

    return {
      success: true,
      message: "Senha alterada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao alterar senha",
    };
  }
}


