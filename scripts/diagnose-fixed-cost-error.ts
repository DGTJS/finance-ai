/**
 * Script de diagnóstico para verificar problemas com criação de custos fixos
 * Execute com: npx tsx scripts/diagnose-fixed-cost-error.ts
 */

import { db } from "../app/_lib/prisma";

async function diagnose() {
  console.log("🔍 Diagnóstico de problemas com custos fixos...\n");

  try {
    // 1. Verificar se a tabela existe
    console.log("1️⃣ Verificando se a tabela 'fixedcost' existe...");
    const tables = (await db.$queryRawUnsafe(`
      SHOW TABLES LIKE 'fixedcost'
    `)) as any[];

    if (tables && tables.length > 0) {
      console.log("   ✅ Tabela 'fixedcost' existe");
    } else {
      console.log("   ❌ Tabela 'fixedcost' NÃO existe!");
      return;
    }

    // 2. Verificar todas as colunas
    console.log("\n2️⃣ Verificando colunas da tabela...");
    const columns = (await db.$queryRawUnsafe(`
      SHOW COLUMNS FROM fixedcost
    `)) as Array<{
      Field: string;
      Type: string;
      Null: string;
      Key: string;
      Default: string | null;
    }>;

    console.log("   Colunas encontradas:");
    columns.forEach((col) => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // 3. Verificar especificamente isFixed
    console.log("\n3️⃣ Verificando coluna 'isFixed'...");
    const isFixedColumn = columns.find((col) => col.Field === "isFixed");
    if (isFixedColumn) {
      console.log("   ✅ Coluna 'isFixed' existe");
      console.log(`   Tipo: ${isFixedColumn.Type}`);
      console.log(`   Null: ${isFixedColumn.Null}`);
      console.log(`   Default: ${isFixedColumn.Default}`);
    } else {
      console.log("   ❌ Coluna 'isFixed' NÃO existe!");
    }

    // 4. Verificar ENUM de frequency
    console.log("\n4️⃣ Verificando ENUM de 'frequency'...");
    const frequencyColumn = columns.find((col) => col.Field === "frequency");
    if (frequencyColumn) {
      console.log(`   Tipo: ${frequencyColumn.Type}`);
      if (frequencyColumn.Type.includes("ONCE")) {
        console.log("   ✅ ENUM contém 'ONCE'");
      } else {
        console.log("   ❌ ENUM NÃO contém 'ONCE'");
      }
    }

    // 5. Verificar índices
    console.log("\n5️⃣ Verificando índices...");
    const indexes = (await db.$queryRawUnsafe(`
      SHOW INDEXES FROM fixedcost
    `)) as Array<{ Key_name: string; Column_name: string }>;

    console.log("   Índices encontrados:");
    indexes.forEach((idx) => {
      console.log(`   - ${idx.Key_name} (${idx.Column_name})`);
    });

    // 6. Tentar uma inserção de teste
    console.log("\n6️⃣ Testando inserção de teste...");
    const testId = `test_${Date.now()}`;
    const testUserId = "cmi3oetic0000w4ogbjv4057n"; // Substitua pelo seu userId real

    try {
      await db.$executeRawUnsafe(
        `
        INSERT INTO \`fixedcost\` 
        (\`id\`, \`userId\`, \`name\`, \`amount\`, \`frequency\`, \`isFixed\`, \`description\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        testId,
        testUserId,
        "Teste Diagnóstico",
        100,
        "ONCE",
        0,
        null,
        1,
      );

      console.log("   ✅ Inserção de teste bem-sucedida!");

      // Limpar o teste
      await db.$executeRawUnsafe(
        `
        DELETE FROM \`fixedcost\` WHERE \`id\` = ?
      `,
        testId,
      );
      console.log("   🧹 Registro de teste removido");
    } catch (insertError: any) {
      console.error("   ❌ Erro na inserção de teste:");
      console.error(`   Código: ${insertError?.code}`);
      console.error(`   Meta código: ${insertError?.meta?.code}`);
      console.error(`   Mensagem: ${insertError?.message}`);
      console.error(`   Meta mensagem: ${insertError?.meta?.message}`);
    }

    console.log("\n✅ Diagnóstico concluído!");
  } catch (error: any) {
    console.error("\n❌ Erro no diagnóstico:", error);
    console.error("Mensagem:", error?.message);
    console.error("Stack:", error?.stack);
  } finally {
    await db.$disconnect();
  }
}

diagnose()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
