"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  TransactionType,
  TransactionCategory,
  TransactionPaymentMethod,
} from "@/app/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

const transactionSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    amount: z.number().positive("Valor deve ser positivo"),
    type: z.nativeEnum(TransactionType, {
      required_error: "Tipo é obrigatório",
    }),
    category: z.nativeEnum(TransactionCategory, {
      required_error: "Categoria é obrigatória",
    }),
    paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
      required_error: "Método de pagamento é obrigatório",
    }),
    date: z.date({ required_error: "Data é obrigatória" }),
    installments: z.number().int().min(2).max(24).optional().nullable(),
    installmentEndDate: z.date().optional().nullable(),
    bankAccountId: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Se tem parcelas, deve ter data de fim
      if (
        data.installments &&
        data.installments > 1 &&
        !data.installmentEndDate
      ) {
        return false;
      }
      // Se tem data de fim, ela deve ser depois da data inicial
      if (data.installmentEndDate && data.date >= data.installmentEndDate) {
        return false;
      }
      return true;
    },
    {
      message:
        "A data de término é obrigatória quando há parcelas e deve ser posterior à data inicial",
      path: ["installmentEndDate"],
    },
  );

type TransactionInput = z.infer<typeof transactionSchema>;

// Helper para obter o userId da sessão
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

export async function createTransaction(data: TransactionInput) {
  try {
    const userId = await getUserId();
    const validatedData = transactionSchema.parse(data);

    // Se não tem parcelas ou não é despesa, cria transação normal
    if (
      !validatedData.installments ||
      validatedData.type !== TransactionType.EXPENSE
    ) {
      await db.transaction.create({
        data: {
          ...validatedData,
          userId: userId, // Sempre usar o userId do usuário atual
          createdByUserId: userId, // Sempre registrar quem criou
        },
      });

      revalidatePath("/transactions");
      revalidatePath("/");
      return { success: true };
    }

    // Calcular datas das parcelas distribuídas entre data inicial e final
    const installmentGroupId = uuidv4();
    const installmentAmount = validatedData.amount / validatedData.installments;
    const transactions = [];

    const startDate = new Date(validatedData.date);
    const endDate = new Date(validatedData.installmentEndDate!);

    // Calcular o intervalo em meses entre as datas
    const monthsDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;

    // Calcular o intervalo entre cada parcela
    const monthInterval = Math.floor(monthsDiff / validatedData.installments);
    const remainder = monthsDiff % validatedData.installments;

    for (let i = 0; i < validatedData.installments; i++) {
      const installmentDate = new Date(startDate);

      // Distribuir as parcelas uniformemente
      // Primeiras parcelas podem ter um intervalo ligeiramente maior se houver resto
      const monthsToAdd = i * monthInterval + Math.min(i, remainder);
      installmentDate.setMonth(startDate.getMonth() + monthsToAdd);

      transactions.push({
        name: `${validatedData.name} (${i + 1}/${validatedData.installments})`,
        amount: installmentAmount,
        type: validatedData.type,
        category: validatedData.category,
        paymentMethod: validatedData.paymentMethod,
        date: installmentDate,
        userId: userId, // Sempre usar o userId do usuário atual
        createdByUserId: userId, // Sempre registrar quem criou
        installments: validatedData.installments,
        currentInstallment: i + 1,
        installmentGroupId,
        bankAccountId: validatedData.bankAccountId || null,
        icon: validatedData.icon || null,
      });
    }

    // Criar todas as transações de uma vez
    await db.transaction.createMany({
      data: transactions,
    });

    revalidatePath("/transactions");
    revalidatePath("/");
    return {
      success: true,
      message: `${validatedData.installments} parcelas criadas com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar transação",
    };
  }
}

export async function updateTransaction(id: string, data: TransactionInput) {
  try {
    const userId = await getUserId();
    const validatedData = transactionSchema.parse(data);

    await db.transaction.update({
      where: { id, userId },
      data: {
        ...validatedData,
        // Não permite alterar parcelas em transações existentes
        installments: undefined,
        currentInstallment: undefined,
        installmentGroupId: undefined,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar transação",
    };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const userId = await getUserId();

    // Buscar a transação para ver se tem parcelas
    const transaction = await db.transaction.findUnique({
      where: { id, userId },
      select: { installmentGroupId: true },
    });

    if (!transaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    // Se faz parte de um grupo de parcelas, deletar todas do grupo
    if (transaction.installmentGroupId) {
      await db.transaction.deleteMany({
        where: {
          userId,
          installmentGroupId: transaction.installmentGroupId,
        },
      });
    } else {
      // Deletar só essa transação
      await db.transaction.delete({
        where: { id, userId },
      });
    }

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao deletar transação",
    };
  }
}

export async function deleteMultipleTransactions(ids: string[]) {
  try {
    const userId = await getUserId();

    if (!ids || ids.length === 0) {
      return { success: false, error: "Nenhuma transação selecionada" };
    }

    // Buscar todas as transações selecionadas para verificar grupos de parcelas
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: ids },
        userId,
      },
      select: {
        id: true,
        installmentGroupId: true,
      },
    });

    if (transactions.length === 0) {
      return { success: false, error: "Nenhuma transação encontrada" };
    }

    // Coletar todos os IDs de grupos de parcelas únicos
    const groupIds = new Set<string>();
    transactions.forEach((t) => {
      if (t.installmentGroupId) {
        groupIds.add(t.installmentGroupId);
      }
    });

    // Deletar todas as transações dos grupos de parcelas
    if (groupIds.size > 0) {
      await db.transaction.deleteMany({
        where: {
          userId,
          installmentGroupId: { in: Array.from(groupIds) },
        },
      });
    }

    // Deletar transações individuais (que não fazem parte de grupos)
    const individualIds = transactions
      .filter((t) => !t.installmentGroupId)
      .map((t) => t.id);

    if (individualIds.length > 0) {
      await db.transaction.deleteMany({
        where: {
          id: { in: individualIds },
          userId,
        },
      });
    }

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true, deletedCount: transactions.length };
  } catch (error) {
    console.error("Erro ao deletar múltiplas transações:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao deletar múltiplas transações",
    };
  }
}
