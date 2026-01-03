"use server";

import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

export interface FixedCostInput {
  name: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE"; // ONCE = custo único (aplicado apenas uma vez)
  isFixed?: boolean; // DEPRECATED: Use frequency = "ONCE" para custos únicos
  description?: string;
  isActive?: boolean;
  entityType?: "USER" | "COMPANY"; // Tipo da entidade
  entityId?: string; // ID da entidade
}

/**
 * Busca todos os custos fixos do usuário
 * @param entityType - Tipo da entidade: "USER" (pessoa física) ou "COMPANY" (empresa)
 * @param entityId - ID da entidade (userId para USER, companyId para COMPANY)
 */
export async function getFixedCosts(
  entityType?: "USER" | "COMPANY",
  entityId?: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    let query = `SELECT * FROM \`fixedcost\` WHERE \`userId\` = ?`;
    const params: any[] = [session.user.id];

    // Se entityType e entityId foram fornecidos, filtrar por eles
    if (entityType && entityId) {
      query += ` AND \`entityType\` = ? AND \`entityId\` = ?`;
      params.push(entityType, entityId);
    } else {
      // Se não especificado, buscar apenas custos de pessoa física (entityType IS NULL ou entityType = 'USER')
      query += ` AND (\`entityType\` IS NULL OR \`entityType\` = 'USER' OR \`entityType\` = '')`;
    }

    query += ` ORDER BY \`createdAt\` DESC`;

    // Usar SQL raw para garantir que isFixed seja retornado mesmo se o Prisma Client não tiver o campo
    const fixedCostsRaw = (await db.$queryRawUnsafe(query, ...params)) as any[];

    // Converter isFixed de tinyint(1) para boolean e mapear para o formato esperado
    const fixedCosts = fixedCostsRaw.map((cost: any) => ({
      id: cost.id,
      userId: cost.userId,
      name: cost.name,
      amount: cost.amount,
      frequency: cost.frequency,
      isFixed:
        cost.isFixed !== undefined && cost.isFixed !== null
          ? cost.isFixed === 1 || cost.isFixed === true
          : true, // Padrão true se não existir (valores antigos)
      description: cost.description,
      isActive: cost.isActive === 1 || cost.isActive === true,
      entityType: cost.entityType || null,
      entityId: cost.entityId || null,
      createdAt: cost.createdAt,
      updatedAt: cost.updatedAt,
    }));

    console.log(
      "[GET FIXED COSTS] Raw from DB:",
      fixedCostsRaw.map((c: any) => ({
        name: c.name,
        isFixed: c.isFixed,
        isFixedType: typeof c.isFixed,
      })),
    );

    console.log(
      "[GET FIXED COSTS] Mapped:",
      fixedCosts.map((c: any) => ({
        name: c.name,
        isFixed: c.isFixed,
        isFixedType: typeof c.isFixed,
      })),
    );

    return {
      success: true,
      data: fixedCosts,
    };
  } catch (error: any) {
    return {
      success: false,
      error: "Erro ao buscar custos fixos",
    };
  }
}

/**
 * Cria um novo custo fixo
 */
export async function createFixedCost(data: FixedCostInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Validação dos dados
    if (!data.name || data.name.trim() === "") {
      return {
        success: false,
        error: "O nome do custo fixo é obrigatório",
      };
    }

    if (!data.amount || data.amount <= 0) {
      return {
        success: false,
        error: "O valor deve ser maior que zero",
      };
    }

    // Validar frequência
    // O frontend já envia frequency="ONCE" quando é custo único, então confiamos nos dados recebidos
    const finalFrequency = data.frequency || "DAILY";

    if (!["DAILY", "WEEKLY", "MONTHLY", "ONCE"].includes(finalFrequency)) {
      return {
        success: false,
        error: "Frequência inválida",
      };
    }

    // Se frequency for "ONCE", isFixed sempre será false
    // Caso contrário, usar o valor enviado pelo frontend ou padrão true
    const finalIsFixed =
      finalFrequency === "ONCE"
        ? false
        : data.isFixed !== undefined
          ? data.isFixed
          : true;

    const createData = {
      userId: session.user.id,
      name: data.name.trim(),
      amount: data.amount,
      frequency: finalFrequency,
      isFixed: finalIsFixed,
      description: data.description?.trim() || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      entityType: data.entityType || null,
      entityId: data.entityId || null,
    };

    console.log("[CREATE FIXED COST] Data received:", {
      data,
      createData,
      isFixedValue: data.isFixed,
      isFixedType: typeof data.isFixed,
    });

    let fixedCost;

    // Se frequency for "ONCE", usar SQL raw diretamente porque o Prisma Client pode não ter o enum atualizado
    if (createData.frequency === "ONCE") {
      console.log("[CREATE FIXED COST] Using SQL raw for ONCE frequency");

      // Verificar e criar colunas necessárias antes de tentar inserir
      try {
        // Verificar isFixed
        const isFixedCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'isFixed'
        `)) as any[];

        if (!isFixedCheck || isFixedCheck.length === 0) {
          console.log(
            "[CREATE FIXED COST] Coluna isFixed não existe - tentando adicionar...",
          );
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`isFixed\` BOOLEAN NOT NULL DEFAULT true
            `);
            console.log(
              "[CREATE FIXED COST] Coluna isFixed adicionada com sucesso!",
            );
          } catch (addColumnError: any) {
            console.error(
              "[CREATE FIXED COST] Erro ao adicionar coluna isFixed:",
              addColumnError?.message,
            );
          }
        }

        // Verificar entityType
        const entityTypeCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'entityType'
        `)) as any[];

        if (!entityTypeCheck || entityTypeCheck.length === 0) {
          console.log(
            "[CREATE FIXED COST] Coluna entityType não existe - tentando adicionar...",
          );
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`entityType\` VARCHAR(20) NULL
            `);
            console.log(
              "[CREATE FIXED COST] Coluna entityType adicionada com sucesso!",
            );
          } catch (addColumnError: any) {
            console.error(
              "[CREATE FIXED COST] Erro ao adicionar coluna entityType:",
              addColumnError?.message,
            );
          }
        }

        // Verificar entityId
        const entityIdCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'entityId'
        `)) as any[];

        if (!entityIdCheck || entityIdCheck.length === 0) {
          console.log(
            "[CREATE FIXED COST] Coluna entityId não existe - tentando adicionar...",
          );
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`entityId\` VARCHAR(191) NULL
            `);
            console.log(
              "[CREATE FIXED COST] Coluna entityId adicionada com sucesso!",
            );
          } catch (addColumnError: any) {
            console.error(
              "[CREATE FIXED COST] Erro ao adicionar coluna entityId:",
              addColumnError?.message,
            );
          }
        }
      } catch (checkError: any) {
        console.error(
          "[CREATE FIXED COST] Erro ao verificar colunas antes de inserir:",
          checkError?.message,
        );
        // Continuar mesmo se a verificação falhar
      }

      // Gerar ID simples (o Prisma cuid será usado quando regenerar)
      const id = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date();

      // MySQL usa tinyint(1) para boolean, então usamos 1 ou 0
      // Usar backticks para garantir que os nomes das colunas sejam tratados corretamente
      const sql = `INSERT INTO \`fixedcost\` (\`id\`, \`userId\`, \`name\`, \`amount\`, \`frequency\`, \`isFixed\`, \`description\`, \`isActive\`, \`entityType\`, \`entityId\`, \`createdAt\`, \`updatedAt\`) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // IMPORTANTE: Para frequency = "ONCE", isFixed sempre deve ser false
      const isFixedValue = 0; // false para custos únicos

      console.log("[SQL RAW INSERT] Values for ONCE:", {
        id,
        userId: createData.userId,
        name: createData.name,
        amount: createData.amount,
        frequency: createData.frequency,
        isFixed: isFixedValue,
        description: createData.description,
        isActive: createData.isActive ? 1 : 0,
        entityType: createData.entityType,
        entityId: createData.entityId,
      });

      try {
        await db.$executeRawUnsafe(
          sql,
          id,
          createData.userId,
          createData.name,
          createData.amount,
          createData.frequency, // "ONCE"
          isFixedValue, // 0 (false)
          createData.description || null,
          createData.isActive ? 1 : 0,
          createData.entityType || null,
          createData.entityId || null,
          now,
          now,
        );

        console.log("[SQL RAW INSERT] Insert executado com sucesso");

        // Buscar o registro criado usando SQL raw para garantir que isFixed seja retornado
        const selectResult = (await db.$queryRawUnsafe(
          `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
          id,
        )) as any[];

        console.log("[SQL RAW SELECT] Resultado da busca:", {
          found: selectResult?.length > 0,
          result: selectResult,
        });

        if (selectResult && selectResult.length > 0) {
          const rawCost = selectResult[0];
          // Converter isFixed de tinyint(1) para boolean
          rawCost.isFixed = rawCost.isFixed === 1 || rawCost.isFixed === true;
          fixedCost = rawCost;
          console.log("[SQL RAW INSERT] Custo criado e recuperado com sucesso");
        } else {
          console.warn(
            "[SQL RAW INSERT] Registro não encontrado após inserção, tentando Prisma...",
          );
          fixedCost = await db.fixedCost.findUnique({ where: { id } });
          if (!fixedCost) {
            throw new Error(`Registro criado mas não encontrado. ID: ${id}`);
          }
        }

        console.log("[SQL RAW INSERT] Created ONCE cost:", {
          id: fixedCost?.id,
          name: fixedCost?.name,
          frequency: (fixedCost as any)?.frequency,
          isFixed: (fixedCost as any)?.isFixed,
          rawSelectResult: selectResult,
        });
      } catch (sqlError: any) {
        console.error("[SQL RAW INSERT] Erro ao inserir:", {
          error: sqlError,
          message: sqlError?.message,
          code: sqlError?.code,
          meta: sqlError?.meta,
          sql: sql,
          values: {
            id,
            userId: createData.userId,
            name: createData.name,
            amount: createData.amount,
            frequency: createData.frequency,
            isFixed: isFixedValue,
            description: createData.description,
            isActive: createData.isActive,
          },
        });

        // Se o erro for sobre coluna não encontrada especificamente 'isFixed', verificar
        const isColumnError =
          sqlError?.code === "P2010" &&
          (sqlError?.meta?.code === "1054" ||
            sqlError?.message?.includes("Unknown column 'isFixed'") ||
            sqlError?.message?.includes("doesn't exist"));

        if (isColumnError) {
          console.error(
            "[SQL RAW INSERT] Erro de coluna não encontrada detectado",
          );
          // Verificar se a coluna realmente existe
          try {
            const columnCheck = (await db.$queryRawUnsafe(`
              SHOW COLUMNS FROM \`fixedcost\` LIKE 'isFixed'
            `)) as any[];
            console.error("[SQL RAW INSERT] Verificação de coluna:", {
              exists: columnCheck?.length > 0,
              columns: columnCheck,
            });

            // Se a coluna existe mas ainda assim deu erro, pode ser outro problema
            if (columnCheck && columnCheck.length > 0) {
              console.error(
                "[SQL RAW INSERT] Coluna existe mas erro ocorreu - pode ser problema de permissão ou sintaxe",
              );
              // Continuar e relançar o erro com contexto melhor
            }
          } catch (checkError) {
            console.error(
              "[SQL RAW INSERT] Erro ao verificar coluna:",
              checkError,
            );
          }
        }

        // Relançar o erro para ser tratado no catch externo
        throw sqlError;
      }
    } else {
      // Para outras frequências, verificar e criar colunas necessárias antes de tentar inserir
      try {
        // Verificar entityType
        const entityTypeCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'entityType'
        `)) as any[];

        if (!entityTypeCheck || entityTypeCheck.length === 0) {
          console.log(
            "[CREATE FIXED COST] Coluna entityType não existe - tentando adicionar...",
          );
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`entityType\` VARCHAR(20) NULL
            `);
            console.log(
              "[CREATE FIXED COST] Coluna entityType adicionada com sucesso!",
            );
          } catch (addColumnError: any) {
            console.error(
              "[CREATE FIXED COST] Erro ao adicionar coluna entityType:",
              addColumnError?.message,
            );
          }
        }

        // Verificar entityId
        const entityIdCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'entityId'
        `)) as any[];

        if (!entityIdCheck || entityIdCheck.length === 0) {
          console.log(
            "[CREATE FIXED COST] Coluna entityId não existe - tentando adicionar...",
          );
          try {
            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`entityId\` VARCHAR(191) NULL
            `);
            console.log(
              "[CREATE FIXED COST] Coluna entityId adicionada com sucesso!",
            );
          } catch (addColumnError: any) {
            console.error(
              "[CREATE FIXED COST] Erro ao adicionar coluna entityId:",
              addColumnError?.message,
            );
          }
        }
      } catch (checkError: any) {
        console.error(
          "[CREATE FIXED COST] Erro ao verificar colunas antes de inserir:",
          checkError?.message,
        );
        // Continuar mesmo se a verificação falhar
      }

      // Para outras frequências, tentar usar Prisma Client primeiro
      try {
        console.log(
          "[PRISMA CREATE] Attempting to create with data:",
          createData,
        );
        fixedCost = await db.fixedCost.create({
          data: createData as any, // Type assertion temporário até regenerar Prisma Client
        });
        // Buscar novamente usando SQL raw para garantir que isFixed seja retornado corretamente
        const selectResult = (await db.$queryRawUnsafe(
          `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
          fixedCost.id,
        )) as any[];

        let verifiedCost = fixedCost;
        if (selectResult && selectResult.length > 0) {
          const rawCost = selectResult[0];
          rawCost.isFixed = rawCost.isFixed === 1 || rawCost.isFixed === true;
          verifiedCost = rawCost as any;
        }

        console.log("[PRISMA CREATE] Created cost:", {
          id: verifiedCost.id,
          name: verifiedCost.name,
          isFixed: (verifiedCost as any).isFixed,
          isFixedType: typeof (verifiedCost as any).isFixed,
          frequency: verifiedCost.frequency,
          rawSelectResult: selectResult,
        });

        fixedCost = verifiedCost;
      } catch (prismaError: any) {
        console.log("[CREATE FIXED COST] Análise do erro:", {
          code: prismaError?.code,
          metaCode: prismaError?.meta?.code,
          mentionsIsFixed: prismaError?.message?.includes("isFixed"),
          isIsFixedColumnError:
            prismaError?.code === "P2022" &&
            prismaError?.meta?.column === "isFixed",
          errorMessage: prismaError?.message,
          metaMessage: prismaError?.meta?.message || "",
          fullError: JSON.stringify({
            code: prismaError?.code,
            meta: prismaError?.meta,
            clientVersion: prismaError?.clientVersion,
            name: prismaError?.name,
          }),
        });

        // Se o erro for sobre coluna não existir (P2022), tentar criar e tentar novamente
        let columnCreated = false;
        if (
          prismaError?.code === "P2022" &&
          (prismaError?.meta?.column === "entityType" ||
            prismaError?.meta?.column === "entityId")
        ) {
          console.log(
            `[CREATE FIXED COST] Coluna ${prismaError?.meta?.column} não existe - tentando criar...`,
          );
          try {
            const columnName = prismaError?.meta?.column;
            const columnType =
              columnName === "entityType" ? "VARCHAR(20)" : "VARCHAR(191)";

            await db.$executeRawUnsafe(`
              ALTER TABLE \`fixedcost\` 
              ADD COLUMN \`${columnName}\` ${columnType} NULL
            `);
            console.log(
              `[CREATE FIXED COST] Coluna ${columnName} criada com sucesso! Tentando novamente...`,
            );
            columnCreated = true;

            // Tentar criar novamente
            fixedCost = await db.fixedCost.create({
              data: createData as any,
            });

            // Buscar novamente usando SQL raw para garantir que isFixed seja retornado corretamente
            const selectResult = (await db.$queryRawUnsafe(
              `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
              fixedCost.id,
            )) as any[];

            let verifiedCost = fixedCost;
            if (selectResult && selectResult.length > 0) {
              const rawCost = selectResult[0];
              rawCost.isFixed =
                rawCost.isFixed === 1 || rawCost.isFixed === true;
              verifiedCost = rawCost as any;
            }

            fixedCost = verifiedCost;
            console.log(
              `[CREATE FIXED COST] Custo criado com sucesso após criar coluna ${columnName}`,
            );
          } catch (retryError: any) {
            console.error(
              `[CREATE FIXED COST] Erro ao criar coluna ou tentar novamente:`,
              retryError?.message,
            );
            // Continuar para o fallback SQL raw
            columnCreated = false;
          }
        }

        // Se o erro for sobre campo desconhecido ou se a coluna não foi criada com sucesso, usar SQL raw
        if (
          !columnCreated &&
          (prismaError?.message?.includes("Unknown argument `isFixed`") ||
            prismaError?.message?.includes("Unknown argument") ||
            (prismaError?.code === "P2022" &&
              (prismaError?.meta?.column === "entityType" ||
                prismaError?.meta?.column === "entityId")))
        ) {
          try {
            // Gerar ID simples (o Prisma cuid será usado quando regenerar)
            const id = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
            const now = new Date();

            // MySQL usa tinyint(1) para boolean, então usamos 1 ou 0
            // Usar backticks para garantir que os nomes das colunas sejam tratados corretamente
            const sql = `INSERT INTO \`fixedcost\` (\`id\`, \`userId\`, \`name\`, \`amount\`, \`frequency\`, \`isFixed\`, \`description\`, \`isActive\`, \`entityType\`, \`entityId\`, \`createdAt\`, \`updatedAt\`) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            // IMPORTANTE: Preservar false explicitamente - usar comparação estrita
            const isFixedValue =
              createData.isFixed === false
                ? 0
                : createData.isFixed === true
                  ? 1
                  : 1;
            console.log("[SQL RAW INSERT] Values:", {
              id,
              userId: createData.userId,
              name: createData.name,
              amount: createData.amount,
              frequency: createData.frequency,
              isFixed: isFixedValue,
              isFixedOriginal: createData.isFixed,
              isFixedType: typeof createData.isFixed,
              isFixedStrictFalse: createData.isFixed === false,
              isFixedStrictTrue: createData.isFixed === true,
              description: createData.description,
              isActive: createData.isActive ? 1 : 0,
              entityType: createData.entityType,
              entityId: createData.entityId,
            });

            await db.$executeRawUnsafe(
              sql,
              id,
              createData.userId,
              createData.name,
              createData.amount,
              createData.frequency,
              isFixedValue, // MySQL boolean = tinyint(1): 1 = true, 0 = false
              createData.description || null,
              createData.isActive ? 1 : 0,
              createData.entityType || null,
              createData.entityId || null,
              now,
              now,
            );

            // Buscar o registro criado usando SQL raw para garantir que isFixed seja retornado
            const selectResult = (await db.$queryRawUnsafe(
              `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
              id,
            )) as any[];

            if (selectResult && selectResult.length > 0) {
              const rawCost = selectResult[0];
              // Converter isFixed de tinyint(1) para boolean
              rawCost.isFixed =
                rawCost.isFixed === 1 || rawCost.isFixed === true;
              fixedCost = rawCost;
            } else {
              fixedCost = await db.fixedCost.findUnique({ where: { id } });
            }

            console.log("[SQL RAW INSERT] Created cost:", {
              id: fixedCost?.id,
              name: fixedCost?.name,
              isFixed: (fixedCost as any)?.isFixed,
              isFixedType: typeof (fixedCost as any)?.isFixed,
              rawSelectResult: selectResult,
            });
          } catch (sqlError: any) {
            // Se o SQL raw também falhar (ex: coluna não existe), tentar sem isFixed
            if (
              sqlError?.code === "P2010" ||
              sqlError?.meta?.code === "1054" ||
              sqlError?.message?.includes("Unknown column 'isFixed'")
            ) {
              // Tentar inserir sem o campo isFixed (usando valor padrão do banco)
              const id = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
              const now = new Date();

              const sqlWithoutIsFixed = `INSERT INTO \`fixedcost\` (\`id\`, \`userId\`, \`name\`, \`amount\`, \`frequency\`, \`description\`, \`isActive\`, \`entityType\`, \`entityId\`, \`createdAt\`, \`updatedAt\`) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

              await db.$executeRawUnsafe(
                sqlWithoutIsFixed,
                id,
                createData.userId,
                createData.name,
                createData.amount,
                createData.frequency,
                createData.description || null,
                createData.isActive ? 1 : 0,
                createData.entityType || null,
                createData.entityId || null,
                now,
                now,
              );

              // Buscar o registro criado
              fixedCost = await db.fixedCost.findUnique({ where: { id } });
            } else {
              // Re-lançar o erro SQL se não for sobre coluna não encontrada
              throw sqlError;
            }
          }
        } else {
          // Re-lançar o erro se não for sobre campo desconhecido
          throw prismaError;
        }
      }
    }

    // Remover revalidatePath para evitar reload da página
    // revalidatePath("/entrepreneur");

    if (!fixedCost) {
      console.error(
        "[CREATE FIXED COST] Erro: fixedCost é null/undefined após criação",
      );
      return {
        success: false,
        error: "Erro ao criar custo fixo: registro não foi criado corretamente",
      };
    }

    return {
      success: true,
      data: fixedCost,
    };
  } catch (error: any) {
    console.error("[CREATE FIXED COST] Erro capturado:", {
      error,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      metaCode: error?.meta?.code,
      metaMessage: error?.meta?.message,
      stack: error?.stack,
    });

    // Retornar mensagem de erro mais específica
    if (error?.code === "P2002") {
      return {
        success: false,
        error: "Já existe um custo fixo com este nome",
      };
    }

    if (error?.code === "P2021") {
      return {
        success: false,
        error: `Tabela não encontrada. Detalhes: ${error?.message}`,
      };
    }

    // Verificar se é erro de foreign key (código MySQL 1452) - DEVE VIR ANTES de outros tratamentos P2010
    if (error?.code === "P2010" && error?.meta?.code === "1452") {
      console.error("[CREATE FIXED COST] Erro de foreign key detectado");
      return {
        success: false,
        error: `Erro de chave estrangeira: ${error?.meta?.message || error?.message || "Usuário não encontrado ou inválido"}`,
      };
    }

    // Verificar se é erro de coluna não encontrada (código MySQL 1054)
    // IMPORTANTE: Só tratar como erro de isFixed se a mensagem mencionar especificamente 'isFixed'
    const errorMessage = error?.message || "";
    const metaMessage = error?.meta?.message || "";
    const mentionsIsFixed =
      errorMessage.includes("isFixed") ||
      metaMessage.includes("isFixed") ||
      errorMessage.includes("Unknown column 'isFixed'");

    // Só tratar como erro de isFixed se:
    // 1. Código for P2010 (erro SQL)
    // 2. Código MySQL for 1054 (coluna não encontrada)
    // 3. E a mensagem mencionar especificamente 'isFixed'
    const isIsFixedColumnError =
      error?.code === "P2010" &&
      error?.meta?.code === "1054" &&
      mentionsIsFixed;

    console.error("[CREATE FIXED COST] Análise do erro:", {
      code: error?.code,
      metaCode: error?.meta?.code,
      mentionsIsFixed,
      isIsFixedColumnError,
      errorMessage,
      metaMessage,
      fullError: JSON.stringify(error, null, 2),
    });

    // Se não for erro de coluna isFixed, tratar genericamente primeiro
    if (!isIsFixedColumnError && error?.code === "P2010") {
      // Erro SQL mas não é sobre isFixed - retornar mensagem genérica
      return {
        success: false,
        error: `Erro SQL ao criar custo fixo: ${error?.meta?.message || error?.message || "Erro desconhecido"}`,
      };
    }

    if (isIsFixedColumnError) {
      // Verificar se a coluna realmente existe antes de retornar erro
      try {
        const columnCheck = (await db.$queryRawUnsafe(`
          SHOW COLUMNS FROM \`fixedcost\` LIKE 'isFixed'
        `)) as any[];

        console.error("[CREATE FIXED COST] Verificação de coluna após erro:", {
          columnExists: columnCheck && columnCheck.length > 0,
          columnCount: columnCheck?.length,
          columnCheckType: typeof columnCheck,
          columnCheckIsArray: Array.isArray(columnCheck),
          columnInfo: columnCheck?.[0],
          fullColumnCheck: columnCheck,
          originalError: error,
        });

        if (columnCheck && columnCheck.length > 0) {
          // Coluna existe, então o erro pode ser de outra natureza (permissão, sintaxe, etc)
          console.error(
            "[CREATE FIXED COST] Coluna existe mas erro ocorreu - retornando erro detalhado",
          );
          return {
            success: false,
            error: `Erro ao criar custo fixo. A coluna 'isFixed' existe no banco de dados, mas houve um erro ao acessá-la. Detalhes: ${error?.meta?.message || error?.message || "Erro desconhecido"}`,
          };
        } else {
          console.error(
            "[CREATE FIXED COST] Coluna NÃO encontrada na verificação",
          );
        }
      } catch (checkError: any) {
        console.error("[CREATE FIXED COST] Erro ao verificar coluna:", {
          error: checkError,
          message: checkError?.message,
          code: checkError?.code,
          stack: checkError?.stack,
        });
        // Se não conseguir verificar, não assumir que não existe - retornar erro genérico
        return {
          success: false,
          error: `Erro ao verificar estrutura da tabela. Detalhes: ${checkError?.message || "Erro desconhecido"}. Erro original: ${error?.meta?.message || error?.message}`,
        };
      }

      // Só retornar erro de coluna não encontrada se realmente não existir
      console.error(
        "[CREATE FIXED COST] Retornando erro de coluna não encontrada",
      );
      return {
        success: false,
        error: `Coluna 'isFixed' não encontrada na tabela. Execute o script: npx tsx scripts/check-and-add-is-fixed.ts`,
      };
    }

    // Se for erro P2010 mas não for sobre isFixed nem foreign key, tratar genericamente
    if (
      error?.code === "P2010" &&
      !isIsFixedColumnError &&
      error?.meta?.code !== "1452"
    ) {
      return {
        success: false,
        error: `Erro SQL ao criar custo fixo: ${error?.meta?.message || error?.message || "Erro desconhecido"}`,
      };
    }

    return {
      success: false,
      error: error?.message || "Erro ao criar custo fixo",
    };
  }
}

/**
 * Atualiza um custo fixo
 */
export async function updateFixedCost(
  id: string,
  data: Partial<FixedCostInput>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Verificar se o custo fixo pertence ao usuário usando SQL raw para evitar problemas com enum
    const existingRaw = (await db.$queryRawUnsafe(
      `SELECT * FROM \`fixedcost\` WHERE \`id\` = ? AND \`userId\` = ?`,
      id,
      session.user.id,
    )) as any[];

    if (!existingRaw || existingRaw.length === 0) {
      return {
        success: false,
        error: "Custo fixo não encontrado",
      };
    }

    const existing = existingRaw[0];
    // Normalizar frequency - garantir que não seja vazio e converter para string maiúscula
    const existingFrequency = existing.frequency
      ? String(existing.frequency).trim().toUpperCase()
      : "DAILY";

    if (!existingFrequency || existingFrequency === "") {
      existing.frequency = "DAILY";
    } else {
      existing.frequency = existingFrequency;
    }

    // Verificar se é custo único: frequency === "ONCE" OU isFixed === 0/false
    // isFixed pode vir como 0, false, "0", ou null do banco
    const existingIsFixedValue = existing.isFixed;
    const existingIsFixed =
      existingIsFixedValue === 0 ||
      existingIsFixedValue === false ||
      existingIsFixedValue === "0" ||
      String(existingIsFixedValue) === "0";

    // Verificar se o campo isFixed existe no Prisma Client
    // Se não existir (Prisma Client não regenerado), usar SQL raw para atualizar
    // Se frequency for "ONCE" OU isFixed for false, usar SQL raw diretamente porque o Prisma Client pode não ter o enum atualizado
    let fixedCost;

    // Verificar se o custo existente é "ONCE" ou se está sendo atualizado para "ONCE"
    const newFrequency = data.frequency
      ? String(data.frequency).trim().toUpperCase()
      : undefined;

    // Verificar se é custo único: frequency === "ONCE" OU isFixed === false OU o custo existente tem isFixed === 0
    const newIsFixed = data.isFixed === false;
    const isOnceCost =
      newFrequency === "ONCE" ||
      existingFrequency === "ONCE" ||
      existingIsFixed ||
      newIsFixed;

    console.log("[UPDATE FIXED COST] Verificação:", {
      isOnceCost,
      existingFrequency: existingFrequency,
      normalizedExistingFrequency: existing.frequency,
      newFrequency: data.frequency,
      normalizedNewFrequency: newFrequency,
      dataReceived: data,
      existingIsActive: existing.isActive,
      existingRawData: existing,
    });

    // Se frequency for "ONCE" (novo ou existente), usar SQL raw diretamente
    if (isOnceCost) {
      console.log("[UPDATE FIXED COST] Using SQL raw for ONCE frequency", {
        existingFrequency: existing.frequency,
        newFrequency: data.frequency,
        isActiveUpdate: data.isActive,
      });
      try {
        // Construir query SQL dinamicamente
        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
          updates.push("name = ?");
          values.push(data.name);
        }
        if (data.amount !== undefined) {
          updates.push("amount = ?");
          values.push(data.amount);
        }
        if (data.frequency !== undefined) {
          updates.push("frequency = ?");
          values.push(data.frequency);
        }
        // Para frequency = "ONCE", isFixed sempre deve ser false
        updates.push("`isFixed` = ?");
        values.push(0); // false para custos únicos
        if (data.description !== undefined) {
          updates.push("description = ?");
          values.push(data.description);
        }
        if (data.isActive !== undefined) {
          // Converter boolean para número (MySQL tinyint)
          const isActiveValue = data.isActive ? 1 : 0;
          updates.push("isActive = ?");
          values.push(isActiveValue);
          console.log("[UPDATE SQL RAW] Atualizando isActive:", {
            original: data.isActive,
            type: typeof data.isActive,
            converted: isActiveValue,
          });
        } else {
          console.log(
            "[UPDATE SQL RAW] isActive não foi fornecido, mantendo valor atual:",
            existing.isActive,
          );
        }

        updates.push("updatedAt = ?");
        values.push(new Date());
        values.push(id);

        const sql = `UPDATE \`fixedcost\` SET ${updates.join(", ")} WHERE \`id\` = ?`;
        console.log("[UPDATE SQL RAW] SQL:", sql);
        console.log("[UPDATE SQL RAW] Values:", values);

        await db.$executeRawUnsafe(sql, ...values);

        console.log("[UPDATE SQL RAW] Update executado com sucesso");

        // Buscar o registro atualizado usando SQL raw para garantir que isFixed seja retornado corretamente
        const selectResult = (await db.$queryRawUnsafe(
          `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
          id,
        )) as any[];

        if (selectResult && selectResult.length > 0) {
          const rawCost = selectResult[0];
          rawCost.isFixed = rawCost.isFixed === 1 || rawCost.isFixed === true;
          fixedCost = rawCost as any;
        } else {
          fixedCost = await db.fixedCost.findUnique({ where: { id } });
        }

        console.log("[UPDATE SQL RAW] Updated ONCE cost:", {
          id: fixedCost?.id,
          name: fixedCost?.name,
          frequency: (fixedCost as any)?.frequency,
          isFixed: (fixedCost as any)?.isFixed,
          isActive: (fixedCost as any)?.isActive,
        });
      } catch (sqlError: any) {
        console.error("[UPDATE SQL RAW] Error:", sqlError);
        throw sqlError;
      }
    } else {
      // Para outras frequências, tentar usar Prisma Client primeiro
      try {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;
        if (data.description !== undefined)
          updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        // IMPORTANTE: Sempre incluir isFixed se estiver definido, mesmo que seja false
        if (data.isFixed !== undefined && data.isFixed !== null) {
          updateData.isFixed =
            data.isFixed === false
              ? false
              : data.isFixed === true
                ? true
                : true;
        }

        console.log("[UPDATE FIXED COST] Data received:", {
          id,
          data,
          updateData,
          isFixedValue: data.isFixed,
          isFixedType: typeof data.isFixed,
        });

        fixedCost = await db.fixedCost.update({
          where: { id },
          data: updateData,
        });

        console.log("[UPDATE FIXED COST] Updated cost:", {
          id: fixedCost.id,
          name: fixedCost.name,
          isFixed: (fixedCost as any).isFixed,
          frequency: fixedCost.frequency,
        });
      } catch (prismaError: any) {
        // Se o erro for sobre campo desconhecido, usar SQL raw
        if (
          prismaError?.message?.includes("Unknown argument `isFixed`") ||
          prismaError?.message?.includes("Unknown argument")
        ) {
          try {
            // Construir query SQL dinamicamente
            const updates: string[] = [];
            const values: any[] = [];

            if (data.name !== undefined) {
              updates.push("name = ?");
              values.push(data.name);
            }
            if (data.amount !== undefined) {
              updates.push("amount = ?");
              values.push(data.amount);
            }
            if (data.frequency !== undefined) {
              updates.push("frequency = ?");
              values.push(data.frequency);
            }
            if (data.isFixed !== undefined && data.isFixed !== null) {
              updates.push("`isFixed` = ?");
              // IMPORTANTE: Preservar false explicitamente
              const isFixedValue =
                data.isFixed === false ? 0 : data.isFixed === true ? 1 : 1;
              console.log("[UPDATE SQL RAW] isFixed value:", {
                original: data.isFixed,
                type: typeof data.isFixed,
                converted: isFixedValue,
              });
              values.push(isFixedValue);
            }
            if (data.description !== undefined) {
              updates.push("description = ?");
              values.push(data.description);
            }
            if (data.isActive !== undefined) {
              updates.push("isActive = ?");
              values.push(data.isActive ? 1 : 0);
            }

            if (updates.length === 0) {
              // Nenhum campo para atualizar, apenas buscar o registro
              fixedCost = await db.fixedCost.findUnique({ where: { id } });
            } else {
              updates.push("updatedAt = ?");
              values.push(new Date());
              values.push(id);

              // Usar $executeRaw com template string para segurança
              // Usar backticks para garantir que os nomes das colunas sejam tratados corretamente
              const sql = `UPDATE \`fixedcost\` SET ${updates.join(", ")} WHERE \`id\` = ?`;
              await db.$executeRawUnsafe(sql, ...values);

              // Buscar o registro atualizado usando SQL raw para garantir que isFixed seja retornado corretamente
              const selectResult = (await db.$queryRawUnsafe(
                `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
                id,
              )) as any[];

              if (selectResult && selectResult.length > 0) {
                const rawCost = selectResult[0];
                rawCost.isFixed =
                  rawCost.isFixed === 1 || rawCost.isFixed === true;
                fixedCost = rawCost as any;
              } else {
                fixedCost = await db.fixedCost.findUnique({ where: { id } });
              }

              console.log("[UPDATE SQL RAW] Updated cost:", {
                id: fixedCost?.id,
                name: fixedCost?.name,
                isFixed: (fixedCost as any)?.isFixed,
                isFixedType: typeof (fixedCost as any)?.isFixed,
                rawSelectResult: selectResult,
              });
            }
          } catch (sqlError: any) {
            // Se o SQL raw também falhar (ex: coluna não existe), tentar sem isFixed
            if (
              sqlError?.code === "P2010" ||
              sqlError?.meta?.code === "1054" ||
              sqlError?.message?.includes("Unknown column 'isFixed'")
            ) {
              // Construir query sem isFixed
              const updates: string[] = [];
              const values: any[] = [];

              if (data.name !== undefined) {
                updates.push("name = ?");
                values.push(data.name);
              }
              if (data.amount !== undefined) {
                updates.push("amount = ?");
                values.push(data.amount);
              }
              if (data.frequency !== undefined) {
                updates.push("frequency = ?");
                values.push(data.frequency);
              }
              // Não incluir isFixed se a coluna não existir
              if (data.description !== undefined) {
                updates.push("description = ?");
                values.push(data.description);
              }
              if (data.isActive !== undefined) {
                updates.push("isActive = ?");
                values.push(data.isActive ? 1 : 0);
              }

              if (updates.length === 0) {
                // Nenhum campo para atualizar, apenas buscar o registro
                fixedCost = await db.fixedCost.findUnique({ where: { id } });
              } else {
                updates.push("updatedAt = ?");
                values.push(new Date());
                values.push(id);

                const sql = `UPDATE \`fixedcost\` SET ${updates.join(", ")} WHERE \`id\` = ?`;
                await db.$executeRawUnsafe(sql, ...values);

                // Buscar o registro atualizado
                fixedCost = await db.fixedCost.findUnique({ where: { id } });
              }
            } else {
              // Re-lançar o erro SQL se não for sobre coluna não encontrada
              throw sqlError;
            }
          }
        } else {
          // Re-lançar o erro se não for sobre campo desconhecido
          throw prismaError;
        }
      }
    }

    // Remover revalidatePath para evitar reload da página
    // revalidatePath("/entrepreneur");
    return {
      success: true,
      data: fixedCost,
    };
  } catch (error: any) {
    // Retornar mensagem de erro mais específica
    if (error?.code === "P2021") {
      return {
        success: false,
        error: `Campo 'isFixed' não existe na tabela. Execute a migration SQL para adicionar o campo.`,
      };
    }

    if (error?.code === "P2002") {
      return {
        success: false,
        error: "Já existe um custo fixo com este nome",
      };
    }

    return {
      success: false,
      error: error?.message || "Erro ao atualizar custo fixo",
    };
  }
}

/**
 * Deleta um custo fixo
 */
export async function deleteFixedCost(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    // Verificar se o custo fixo pertence ao usuário usando SQL raw para evitar problemas com enum
    const existingRaw = (await db.$queryRawUnsafe(
      `SELECT * FROM \`fixedcost\` WHERE \`id\` = ? AND \`userId\` = ?`,
      id,
      session.user.id,
    )) as any[];

    if (!existingRaw || existingRaw.length === 0) {
      return {
        success: false,
        error: "Custo fixo não encontrado",
      };
    }

    // Deletar usando SQL raw para evitar problemas com enum
    await db.$executeRawUnsafe(
      `DELETE FROM \`fixedcost\` WHERE \`id\` = ?`,
      id,
    );

    // Remover revalidatePath para evitar reload da página
    // revalidatePath("/entrepreneur");
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao deletar custo fixo",
    };
  }
}

/**
 * Calcula o custo fixo total para uma data específica
 * Considera a frequência de cada custo fixo ativo e acumula ao longo do tempo
 */
export async function calculateFixedCostForDate(date: Date) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Usuário não autenticado",
      total: 0,
    };
  }

  try {
    // Usar SQL raw para evitar problemas com enum quando há valores vazios ou inválidos
    const fixedCostsRaw = (await db.$queryRawUnsafe(
      `SELECT * FROM \`fixedcost\` WHERE \`userId\` = ? AND \`isActive\` = 1`,
      session.user.id,
    )) as any[];

    // Converter para o formato esperado e garantir que frequency não seja vazio
    const fixedCosts = fixedCostsRaw.map((cost: any) => ({
      ...cost,
      frequency:
        cost.frequency && cost.frequency.trim() !== ""
          ? cost.frequency
          : "DAILY", // Garantir que não seja vazio
      isFixed: cost.isFixed === 1 || cost.isFixed === true,
      isActive: cost.isActive === 1 || cost.isActive === true,
    }));

    // Data de referência: início do mês atual (ou data de criação do custo fixo, se mais recente)
    const referenceDate = new Date(date.getFullYear(), date.getMonth(), 1);
    referenceDate.setHours(0, 0, 0, 0);

    let total = 0;

    fixedCosts.forEach((cost) => {
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      // Se não for custo fixo (isFixed = false) ou frequency for "ONCE", adiciona apenas uma vez
      if (!cost.isFixed || cost.frequency === "ONCE") {
        // Verificar se a data atual é maior ou igual à data de criação do custo
        const costStartDate = new Date(cost.createdAt);
        costStartDate.setHours(0, 0, 0, 0);

        if (currentDate >= costStartDate) {
          total += cost.amount;
        }
        return; // Não acumula, apenas adiciona uma vez
      }

      // Se for custo fixo (isFixed = true), acumula ao longo do tempo
      // Usar a data de criação do custo fixo como referência, se for mais recente
      const costStartDate = new Date(cost.createdAt);
      const actualStartDate =
        costStartDate > referenceDate ? costStartDate : referenceDate;
      actualStartDate.setHours(0, 0, 0, 0);

      switch (cost.frequency) {
        case "DAILY":
          // Diário: conta quantos dias passaram desde o início
          const daysDiff =
            Math.floor(
              (currentDate.getTime() - actualStartDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1; // +1 para incluir o dia atual
          if (daysDiff > 0) {
            total += cost.amount * daysDiff;
          }
          break;
        case "WEEKLY":
          // Semanal: conta quantas semanas completas passaram desde o início
          const weekStart = new Date(actualStartDate);
          weekStart.setDate(
            actualStartDate.getDate() - actualStartDate.getDay(),
          ); // Domingo da semana inicial
          weekStart.setHours(0, 0, 0, 0);

          const currentWeekStart = new Date(currentDate);
          currentWeekStart.setDate(
            currentDate.getDate() - currentDate.getDay(),
          ); // Domingo da semana atual
          currentWeekStart.setHours(0, 0, 0, 0);

          const weeksDiff =
            Math.floor(
              (currentWeekStart.getTime() - weekStart.getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            ) + 1; // +1 para incluir a semana atual

          if (weeksDiff > 0) {
            total += cost.amount * weeksDiff;
          }
          break;
        case "MONTHLY":
          // Mensal: conta quantos meses completos passaram desde o início
          const monthsDiff =
            (currentDate.getFullYear() - actualStartDate.getFullYear()) * 12 +
            (currentDate.getMonth() - actualStartDate.getMonth()) +
            1; // +1 para incluir o mês atual

          if (monthsDiff > 0) {
            total += cost.amount * monthsDiff;
          }
          break;
      }
    });

    return {
      success: true,
      total,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao calcular custo fixo",
      total: 0,
    };
  }
}
