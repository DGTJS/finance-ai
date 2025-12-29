import { db } from "../app/_lib/prisma";

async function checkAndAddIsFixed() {
  try {
    console.log("🔵 Verificando estrutura da tabela 'fixedcost'...");

    // Verificar todas as colunas da tabela
    const columns = (await db.$queryRawUnsafe(`
      SHOW COLUMNS FROM fixedcost
    `)) as Array<{
      Field: string;
      Type: string;
      Null: string;
      Key: string;
      Default: string | null;
      Extra: string;
    }>;

    console.log("📋 Colunas existentes na tabela 'fixedcost':");
    columns.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const hasIsFixed = columns.some((col) => col.Field === "isFixed");

    if (hasIsFixed) {
      console.log("✅ A coluna 'isFixed' já existe na tabela 'fixedcost'");

      // Verificar o valor padrão
      const isFixedColumn = columns.find((col) => col.Field === "isFixed");
      console.log(`   Tipo: ${isFixedColumn?.Type}`);
      console.log(`   Default: ${isFixedColumn?.Default}`);
      console.log(`   Null: ${isFixedColumn?.Null}`);

      return;
    }

    console.log("❌ A coluna 'isFixed' NÃO existe na tabela 'fixedcost'");
    console.log("🔵 Adicionando coluna 'isFixed'...");

    // Adicionar a coluna
    await db.$executeRawUnsafe(`
      ALTER TABLE \`fixedcost\` 
      ADD COLUMN \`isFixed\` BOOLEAN NOT NULL DEFAULT true
    `);

    console.log("✅ Coluna 'isFixed' adicionada com sucesso!");

    // Verificar se o índice já existe
    const indexes = (await db.$queryRawUnsafe(`
      SHOW INDEXES FROM fixedcost WHERE Key_name = 'fixedcost_isFixed_idx'
    `)) as Array<{ Key_name: string; Column_name: string }>;

    if (indexes.length === 0) {
      console.log("🔵 Criando índice 'fixedcost_isFixed_idx'...");
      await prisma.$executeRawUnsafe(`
        CREATE INDEX fixedcost_isFixed_idx ON fixedcost(isFixed)
      `);
      console.log("✅ Índice criado com sucesso!");
    } else {
      console.log("✅ O índice 'fixedcost_isFixed_idx' já existe");
    }

    // Verificar novamente
    const newColumns = (await db.$queryRawUnsafe(`
      SHOW COLUMNS FROM fixedcost
    `)) as Array<{ Field: string }>;
    console.log("\n📋 Colunas após adição:");
    newColumns.forEach((col) => {
      console.log(`  - ${col.Field}`);
    });

    console.log("\n✅ Migration concluída com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao executar migration:", error);
    console.error("❌ Mensagem:", error.message);
    console.error("❌ Código:", error.code);
    console.error("❌ Stack:", error.stack);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

checkAndAddIsFixed()
  .then(() => {
    console.log("\n✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro ao executar script:", error);
    process.exit(1);
  });
