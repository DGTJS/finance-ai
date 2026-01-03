/**
 * Script para criar a tabela fixedcost no banco de dados correto
 * Usa a DATABASE_URL do .env.local
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config({ path: ".env.local" });
config();

const prisma = new PrismaClient();

async function createFixedCostTable() {
  console.log("🔵 [create-fixedcost-table] Iniciando criação da tabela...");
  console.log(
    "🔵 [create-fixedcost-table] DATABASE_URL:",
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"),
  );

  try {
    // Verificar se a tabela já existe
    const tableCheck = await prisma.$queryRaw<
      Array<{ [key: string]: string }>
    >`SHOW TABLES LIKE 'fixedcost'`;

    if (tableCheck && tableCheck.length > 0) {
      console.log("✅ [create-fixedcost-table] Tabela 'fixedcost' já existe!");
      return;
    }

    console.log("🔵 [create-fixedcost-table] Criando tabela 'fixedcost'...");

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
      "✅ [create-fixedcost-table] Tabela 'fixedcost' criada com sucesso!",
    );

    // Verificar novamente
    const verify = await prisma.$queryRaw<
      Array<{ [key: string]: string }>
    >`SHOW TABLES LIKE 'fixedcost'`;
    if (verify && verify.length > 0) {
      console.log(
        "✅ [create-fixedcost-table] Verificação: Tabela encontrada no banco!",
      );
    } else {
      console.error(
        "❌ [create-fixedcost-table] Verificação: Tabela NÃO encontrada!",
      );
    }
  } catch (error: any) {
    console.error("❌ [create-fixedcost-table] Erro:", error);
    console.error("❌ [create-fixedcost-table] Código:", error?.code);
    console.error("❌ [create-fixedcost-table] Mensagem:", error?.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("🔵 [create-fixedcost-table] Conexão fechada");
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
