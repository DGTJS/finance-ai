/**
 * Script para criar a tabela fixedcost no banco local (localhost)
 * Usa a DATABASE_URL padrão: mysql://root:@localhost:3306/finance_ai
 */

import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/finance_ai",
    },
  },
});

async function createFixedCostTable() {
  console.log(
    "🔵 [create-fixedcost-local] Iniciando criação da tabela no banco local...",
  );
  console.log(
    "🔵 [create-fixedcost-local] DATABASE_URL: mysql://root:****@localhost:3306/finance_ai",
  );

  try {
    // Verificar se a tabela já existe
    const tableCheck = await prisma.$queryRaw<
      Array<{ [key: string]: string }>
    >`SHOW TABLES LIKE 'fixedcost'`;

    if (tableCheck && tableCheck.length > 0) {
      console.log("✅ [create-fixedcost-local] Tabela 'fixedcost' já existe!");
      return;
    }

    console.log("🔵 [create-fixedcost-local] Criando tabela 'fixedcost'...");

    // Criar a tabela
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`fixedcost\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`amount\` DOUBLE NOT NULL,
        \`frequency\` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY',
        \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`description\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`fixedcost_userId_idx\` (\`userId\`),
        KEY \`fixedcost_isActive_idx\` (\`isActive\`),
        CONSTRAINT \`fixedcost_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log(
      "✅ [create-fixedcost-local] Tabela 'fixedcost' criada com sucesso!",
    );

    // Verificar novamente
    const verify = await prisma.$queryRaw<
      Array<{ [key: string]: string }>
    >`SHOW TABLES LIKE 'fixedcost'`;
    if (verify && verify.length > 0) {
      console.log(
        "✅ [create-fixedcost-local] Verificação: Tabela encontrada no banco!",
      );
    } else {
      console.error(
        "❌ [create-fixedcost-local] Verificação: Tabela NÃO encontrada!",
      );
    }
  } catch (error: any) {
    console.error("❌ [create-fixedcost-local] Erro:", error);
    console.error("❌ [create-fixedcost-local] Código:", error?.code);
    console.error("❌ [create-fixedcost-local] Mensagem:", error?.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("🔵 [create-fixedcost-local] Conexão fechada");
  }
}

createFixedCostTable()
  .then(() => {
    console.log("✅ Script executado com sucesso");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro ao executar script:", error);
    process.exit(1);
  });
