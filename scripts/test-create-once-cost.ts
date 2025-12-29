/**
 * Script de teste para criar um custo único diretamente
 * Execute com: npx tsx scripts/test-create-once-cost.ts
 */

import { db } from "../app/_lib/prisma";

async function testCreateOnceCost() {
  console.log("🧪 Testando criação direta de custo único via SQL raw...\n");

  const id = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
  const userId = "cmi3oetic0000w4ogbjv4057n"; // Substitua pelo seu userId
  const now = new Date();

  const sql = `INSERT INTO \`fixedcost\` (\`id\`, \`userId\`, \`name\`, \`amount\`, \`frequency\`, \`isFixed\`, \`description\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    id,
    userId,
    "Teste Custo Único",
    1000,
    "ONCE",
    0, // false
    null,
    1, // true
    now,
    now,
  ];

  console.log("📤 SQL:", sql);
  console.log("📤 Valores:", values);

  try {
    // Verificar se a coluna existe primeiro
    const columnCheck = (await db.$queryRawUnsafe(`
      SHOW COLUMNS FROM \`fixedcost\` LIKE 'isFixed'
    `)) as any[];

    console.log("\n📋 Verificação de coluna isFixed:");
    console.log("   Existe:", columnCheck && columnCheck.length > 0);
    if (columnCheck && columnCheck.length > 0) {
      console.log("   Info:", columnCheck[0]);
    }

    // Verificar ENUM de frequency
    const enumCheck = (await db.$queryRawUnsafe(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'fixedcost' 
      AND COLUMN_NAME = 'frequency'
    `)) as Array<{ COLUMN_TYPE: string }>;

    console.log("\n📋 Verificação de ENUM frequency:");
    if (enumCheck && enumCheck.length > 0) {
      console.log("   ENUM:", enumCheck[0].COLUMN_TYPE);
      console.log(
        "   Contém ONCE:",
        enumCheck[0].COLUMN_TYPE.includes("'ONCE'"),
      );
    }

    // Tentar inserir
    console.log("\n🔨 Tentando inserir registro...");
    await db.$executeRawUnsafe(sql, ...values);

    console.log("✅ Registro inserido com sucesso!");

    // Buscar o registro
    const selectResult = (await db.$queryRawUnsafe(
      `SELECT * FROM \`fixedcost\` WHERE \`id\` = ?`,
      id,
    )) as any[];

    if (selectResult && selectResult.length > 0) {
      console.log("\n📥 Registro recuperado:");
      console.log("   ID:", selectResult[0].id);
      console.log("   Nome:", selectResult[0].name);
      console.log("   Frequência:", selectResult[0].frequency);
      console.log(
        "   isFixed:",
        selectResult[0].isFixed,
        `(${typeof selectResult[0].isFixed})`,
      );
      console.log("   isActive:", selectResult[0].isActive);
    } else {
      console.error("❌ Registro não encontrado após inserção!");
    }
  } catch (error: any) {
    console.error("\n❌ Erro ao inserir:", error);
    console.error("   Mensagem:", error?.message);
    console.error("   Código:", error?.code);
    console.error("   Meta:", error?.meta);
  } finally {
    await db.$disconnect();
  }
}

testCreateOnceCost()
  .then(() => {
    console.log("\n✅ Teste concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Teste falhou:", error);
    process.exit(1);
  });
