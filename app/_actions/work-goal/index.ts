"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const workGoalSchema = z.object({
  goalType: z.enum(["daily", "weekly", "monthly", "custom"]).default("monthly"),
  dailyGoal: z.number().positive().optional().nullable(),
  weeklyGoal: z.number().positive().optional().nullable(),
  monthlyGoal: z.number().positive().optional().nullable(),
  customGoal: z.number().positive().optional().nullable(),
  customStartDate: z
    .union([z.date(), z.string().transform((str) => new Date(str))])
    .optional()
    .nullable(),
  customEndDate: z
    .union([z.date(), z.string().transform((str) => new Date(str))])
    .optional()
    .nullable(),
  maxHoursDay: z.number().positive().optional().nullable(),
  workDays: z.string().default("1,2,3,4,5,6,7"), // Dias da semana: 1=domingo, 2=segunda, ..., 7=sábado
});

type WorkGoalInput = z.infer<typeof workGoalSchema>;

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session.user.id;
}

export async function createOrUpdateWorkGoal(data: WorkGoalInput) {
  try {
    const userId = await getUserId();
    
    // Tentar usar o modelo userGoal, se não existir, usar query raw como fallback
    let userGoalModel;
    let useRawQuery = false;
    
    try {
      userGoalModel = (db as any).userGoal;
      if (!userGoalModel) {
        useRawQuery = true;
      }
    } catch (e) {
      useRawQuery = true;
    }
    
    console.log("Dados recebidos:", JSON.stringify(data, null, 2));
    
    // Validar dados
    let validatedData;
    try {
      validatedData = workGoalSchema.parse(data);
      console.log("Dados validados:", JSON.stringify(validatedData, null, 2));
    } catch (zodError) {
      console.error("Erro de validação Zod:", zodError);
      if (zodError instanceof z.ZodError) {
        const errorMessages = zodError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.error("Mensagens de erro:", errorMessages);
        return {
          success: false,
          error: `Erro de validação: ${errorMessages}`,
        };
      }
      throw zodError;
    }

    // Verificar se já existe meta para o usuário
    let existingGoal;
    if (useRawQuery) {
      try {
        const result: any = await db.$queryRaw`
          SELECT * FROM UserGoal WHERE userId = ${userId}
        `;
        existingGoal = Array.isArray(result) && result.length > 0 ? result[0] : null;
      } catch (rawError) {
        console.error("Erro ao buscar meta com raw query:", rawError);
        // Se a tabela não existir, existingGoal será null
        existingGoal = null;
      }
    } else {
      existingGoal = await userGoalModel.findUnique({
        where: { userId },
      });
    }

    // Validar que pelo menos uma meta está preenchida baseada no tipo
    const goalType = validatedData.goalType || "monthly";
    let hasGoal = false;
    if (goalType === "daily" && validatedData.dailyGoal) hasGoal = true;
    else if (goalType === "weekly" && validatedData.weeklyGoal) hasGoal = true;
    else if (goalType === "monthly" && validatedData.monthlyGoal) hasGoal = true;
    else if (goalType === "custom" && validatedData.customGoal) {
      hasGoal = true;
      // Validar datas para meta personalizada
      if (!validatedData.customStartDate || !validatedData.customEndDate) {
        return {
          success: false,
          error: "Selecione a data inicial e final para a meta personalizada",
        };
      }
      if (validatedData.customEndDate < validatedData.customStartDate) {
        return {
          success: false,
          error: "A data final deve ser posterior à data inicial",
        };
      }
    }

    if (!hasGoal) {
      return {
        success: false,
        error: "Preencha o valor da meta selecionada",
      };
    }

    console.log("Meta existente:", existingGoal ? "Sim" : "Não");
    console.log("Dados para salvar:", JSON.stringify(validatedData, null, 2));
    console.log("Usando query raw:", useRawQuery);

    let goal;
    try {
      if (useRawQuery) {
        // Usar query raw como fallback se o modelo não estiver disponível
        if (existingGoal) {
          // Atualizar usando raw query
          console.log("Atualizando meta existente com raw query...");
          await db.$executeRawUnsafe(`
            UPDATE UserGoal 
            SET goalType = ?,
                dailyGoal = ?,
                weeklyGoal = ?,
                monthlyGoal = ?,
                customGoal = ?,
                customStartDate = ?,
                customEndDate = ?,
                maxHoursDay = ?,
                workDays = ?,
                updatedAt = NOW()
            WHERE userId = ?
          `, 
            validatedData.goalType,
            validatedData.dailyGoal,
            validatedData.weeklyGoal,
            validatedData.monthlyGoal,
            validatedData.customGoal,
            validatedData.customStartDate,
            validatedData.customEndDate,
            validatedData.maxHoursDay,
            validatedData.workDays,
            userId
          );
          // Buscar o registro atualizado
          const result: any = await db.$queryRawUnsafe(
            `SELECT * FROM UserGoal WHERE userId = ?`,
            userId
          );
          goal = Array.isArray(result) && result.length > 0 ? result[0] : existingGoal;
          console.log("Meta atualizada com sucesso");
        } else {
          // Criar usando raw query
          console.log("Criando nova meta com raw query...");
          const id = `clx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.$executeRawUnsafe(`
            INSERT INTO UserGoal (id, userId, goalType, dailyGoal, weeklyGoal, monthlyGoal, customGoal, customStartDate, customEndDate, maxHoursDay, workDays, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `,
            id,
            userId,
            validatedData.goalType,
            validatedData.dailyGoal,
            validatedData.weeklyGoal,
            validatedData.monthlyGoal,
            validatedData.customGoal,
            validatedData.customStartDate,
            validatedData.customEndDate,
            validatedData.maxHoursDay,
            validatedData.workDays
          );
          // Buscar o registro criado
          const result: any = await db.$queryRawUnsafe(
            `SELECT * FROM UserGoal WHERE id = ?`,
            id
          );
          goal = Array.isArray(result) && result.length > 0 ? result[0] : null;
          console.log("Meta criada com sucesso");
        }
      } else {
        // Usar o modelo Prisma normalmente
        if (existingGoal) {
          // Atualizar meta existente
          console.log("Atualizando meta existente...");
          goal = await userGoalModel.update({
            where: { userId },
            data: validatedData,
          });
          console.log("Meta atualizada com sucesso");
        } else {
          // Criar nova meta
          console.log("Criando nova meta...");
          goal = await userGoalModel.create({
            data: {
              userId,
              ...validatedData,
            },
          });
          console.log("Meta criada com sucesso");
        }
      }
    } catch (dbError) {
      console.error("Erro ao salvar no banco:", dbError);
      throw dbError;
    }

    revalidatePath("/entrepreneur");
    return { success: true, data: goal };
  } catch (error) {
    console.error("Erro ao salvar meta de trabalho:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar meta",
    };
  }
}

export async function getWorkGoal() {
  try {
    const userId = await getUserId();

    // Tentar usar o modelo userGoal, se não existir, usar query raw como fallback
    let userGoalModel;
    let useRawQuery = false;
    
    try {
      userGoalModel = (db as any).userGoal;
      if (!userGoalModel) {
        useRawQuery = true;
      }
    } catch (e) {
      useRawQuery = true;
    }

    let goal;
    if (useRawQuery) {
      // Usar query raw como fallback
      const result = await db.$queryRaw`
        SELECT * FROM UserGoal WHERE userId = ${userId}
      `;
      goal = Array.isArray(result) ? (result.length > 0 ? result[0] : null) : result;
    } else {
      goal = await userGoalModel.findUnique({
        where: { userId },
      });
    }

    return {
      success: true,
      data: goal,
    };
  } catch (error) {
    console.error("Erro ao buscar meta de trabalho:", error);
    return {
      success: false,
      error: "Erro ao buscar meta",
      data: null,
    };
  }
}

