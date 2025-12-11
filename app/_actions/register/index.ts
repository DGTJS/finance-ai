"use server";

import { db } from "@/app/_lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    // Validar dados
    const validatedData = registerSchema.parse(data);

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Conta criada com sucesso! Faça login para continuar.",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    // Erro de conexão com banco de dados
    if (error.code === "P1001" || error.code === "P1000") {
      console.error("❌ Erro de conexão com banco de dados:", error);
      return {
        success: false,
        error: "Erro de conexão com o banco de dados. Verifique se o MySQL está rodando.",
      };
    }

    // Erro de email duplicado
    if (error.code === "P2002") {
      return {
        success: false,
        error: "Este email já está cadastrado",
      };
    }

    // Erro de schema/tabela não encontrada
    if (error.code === "P1003") {
      console.error("❌ Erro: Tabelas não encontradas:", error);
      return {
        success: false,
        error: "Banco de dados não configurado. Execute: npx prisma migrate dev",
      };
    }

    console.error("Erro ao criar usuário:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar conta. Tente novamente.",
    };
  }
}



