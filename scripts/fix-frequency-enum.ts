/**
 * Script para adicionar 'ONCE' ao ENUM de frequency na tabela fixedcost
 * Execute com: npx tsx scripts/fix-frequency-enum.ts
 */

import { db } from "../app/_lib/prisma";

async function fixFrequencyEnum() {
  console.log("🔧 Corrigindo ENUM de frequency para incluir 'ONCE'...\n");

  try {
    // Verificar o ENUM atual
    const enumCheck = (await db.$queryRawUnsafe(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'fixedcost' 
      AND COLUMN_NAME = 'frequency'
    `)) as Array<{ COLUMN_TYPE: string }>;

    if (enumCheck && enumCheck.length > 0) {
      console.log("📋 ENUM atual:", enumCheck[0].COLUMN_TYPE);

      if (enumCheck[0].COLUMN_TYPE.includes("'ONCE'")) {
        console.log("✅ ENUM já contém 'ONCE'!");
        return;
      }
    }

    console.log("🔨 Modificando ENUM para incluir 'ONCE'...");

    // Modificar o ENUM para incluir 'ONCE'
    // MySQL requer recriar a coluna para adicionar valores ao ENUM
    await db.$executeRawUnsafe(`
      ALTER TABLE \`fixedcost\` 
      MODIFY COLUMN \`frequency\` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE') NOT NULL DEFAULT 'DAILY'
    `);

    console.log("✅ ENUM modificado com sucesso!");

    // Verificar novamente
    const verifyEnum = (await db.$queryRawUnsafe(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'fixedcost' 
      AND COLUMN_NAME = 'frequency'
    `)) as Array<{ COLUMN_TYPE: string }>;

    if (verifyEnum && verifyEnum.length > 0) {
      console.log("📋 ENUM após modificação:", verifyEnum[0].COLUMN_TYPE);

      if (verifyEnum[0].COLUMN_TYPE.includes("'ONCE'")) {
        console.log("✅ Verificação: ENUM contém 'ONCE'!");
      } else {
        console.error("❌ Erro: ENUM não contém 'ONCE' após modificação!");
      }
    }
  } catch (error: any) {
    console.error("❌ Erro ao modificar ENUM:", error);
    console.error("Mensagem:", error?.message);
    console.error("Código:", error?.code);

    // Tentar método alternativo se o primeiro falhar
    if (
      error?.code === "ER_PARSE_ERROR" ||
      error?.message?.includes("syntax")
    ) {
      console.log("\n🔄 Tentando método alternativo...");

      try {
        // Método alternativo: usar ALTER TABLE com MODIFY
        await db.$executeRawUnsafe(`
          ALTER TABLE \`fixedcost\` 
          CHANGE COLUMN \`frequency\` \`frequency\` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ONCE') NOT NULL DEFAULT 'DAILY'
        `);
        console.log("✅ Método alternativo funcionou!");
      } catch (altError: any) {
        console.error(
          "❌ Método alternativo também falhou:",
          altError?.message,
        );
        throw altError;
      }
    } else {
      throw error;
    }
  } finally {
    await db.$disconnect();
  }
}

// Executar
fixFrequencyEnum()
  .then(() => {
    console.log("\n✅ Script concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script falhou:", error);
    process.exit(1);
  });
