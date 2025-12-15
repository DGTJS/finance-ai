"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  image: z.union([z.string(), z.null()]).optional(),
});

/**
 * Atualiza o perfil do usuário atual
 */
export async function updateUserProfile(data: z.infer<typeof updateProfileSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    console.log("📝 Atualizando perfil para usuário:", session.user.id);
    console.log("📝 Dados recebidos:", { name: data.name, email: data.email, hasImage: !!data.image });
    
    const validatedData = updateProfileSchema.parse(data);
    console.log("✅ Dados validados com sucesso");

    // Verificar se o email já existe em outro usuário
    const emailExists = await db.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: session.user.id },
      },
    });

    if (emailExists) {
      console.log("❌ Email já existe:", validatedData.email);
      return {
        success: false,
        error: "Este email já está em uso",
      };
    }

    // Preparar dados para atualização
    const updateData: {
      name: string;
      email: string;
      image?: string | null;
    } = {
      name: validatedData.name,
      email: validatedData.email,
    };

    // Se a imagem foi fornecida (mesmo que seja null), atualizar também
    if (validatedData.image !== undefined) {
      if (validatedData.image === null || validatedData.image.trim() === "") {
        // Se for null ou string vazia, limpar a imagem
        updateData.image = null;
        console.log("ℹ️ Imagem será removida (null ou vazia)");
      } else {
        // MEDIUMTEXT no MySQL pode armazenar até 16MB, mas vamos limitar a 200KB base64 para evitar erro 431
        // Base64 aumenta o tamanho em ~33%, então 200KB base64 = ~150KB original
        const maxSize = 200 * 1024; // 200KB em caracteres base64
        if (validatedData.image.length > maxSize) {
          console.warn("⚠️ Imagem muito grande (", validatedData.image.length, "caracteres), não será salva. Máximo: 2MB");
          updateData.image = null;
        } else {
          // Verificar se a string base64 está completa (deve terminar com caracteres válidos)
          const base64Data = validatedData.image.split(',')[1] || validatedData.image;
          if (base64Data.length % 4 !== 0) {
            console.warn("⚠️ String base64 incompleta ou inválida (tamanho:", base64Data.length, ")");
            // Tentar corrigir adicionando padding
            const padding = '='.repeat((4 - (base64Data.length % 4)) % 4);
            const correctedBase64 = validatedData.image.includes(',') 
              ? validatedData.image.split(',')[0] + ',' + base64Data + padding
              : validatedData.image + padding;
            updateData.image = correctedBase64;
            console.log("✅ String base64 corrigida com padding");
          } else {
            updateData.image = validatedData.image;
          }
          console.log("✅ Imagem será atualizada (tamanho:", validatedData.image.length, "caracteres)");
        }
      }
    } else {
      // Se image não foi fornecido, não incluir no update (manter valor atual)
      console.log("ℹ️ Campo image não fornecido, mantendo valor atual");
    }

    console.log("💾 Atualizando usuário no banco...");
    console.log("💾 Dados de atualização:", {
      name: updateData.name,
      email: updateData.email,
      hasImage: updateData.image !== undefined,
      imageLength: updateData.image?.length || 0,
    });
    
    // Atualizar o usuário
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    console.log("✅ Usuário atualizado com sucesso:", {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      hasImage: !!updatedUser.image,
      imageLength: updatedUser.image?.length || 0,
    });

    revalidatePath("/settings");
    revalidatePath("/");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    if (error instanceof z.ZodError) {
      console.error("❌ Erro de validação:", error.errors);
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar perfil",
    };
  }
}

