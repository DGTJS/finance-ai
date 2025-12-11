"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const bankAccountSchema = z.object({
  name: z.string().min(1, "Nome da conta é obrigatório"),
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  accountType: z.enum([
    "CHECKING_ACCOUNT",
    "SAVINGS_ACCOUNT",
    "INVESTMENT_ACCOUNT",
    "CREDIT_CARD",
    "OTHER",
  ]),
  balance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function createBankAccount(data: z.infer<typeof bankAccountSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    const validatedData = bankAccountSchema.parse(data);

    const bankAccount = await db.bankAccount.create({
      data: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    return {
      success: true,
      data: bankAccount,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Erro ao criar conta bancária:", error);
    return {
      success: false,
      error: "Erro ao criar conta bancária. Tente novamente.",
    };
  }
}

export async function updateBankAccount(
  id: string,
  data: Partial<z.infer<typeof bankAccountSchema>>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar se a conta pertence ao usuário
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: "Conta não encontrada",
      };
    }

    const bankAccount = await db.bankAccount.update({
      where: { id },
      data,
    });

    return {
      success: true,
      data: bankAccount,
    };
  } catch (error: any) {
    console.error("Erro ao atualizar conta bancária:", error);
    return {
      success: false,
      error: "Erro ao atualizar conta bancária. Tente novamente.",
    };
  }
}

export async function deleteBankAccount(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar se a conta pertence ao usuário
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: "Conta não encontrada",
      };
    }

    await db.bankAccount.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Erro ao deletar conta bancária:", error);
    return {
      success: false,
      error: "Erro ao deletar conta bancária. Tente novamente.",
    };
  }
}

export async function getBankAccounts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
        data: [],
      };
    }

    const bankAccounts = await db.bankAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: bankAccounts,
    };
  } catch (error: any) {
    console.error("Erro ao buscar contas bancárias:", error);
    return {
      success: false,
      error: "Erro ao buscar contas bancárias.",
      data: [],
    };
  }
}

