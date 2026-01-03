/**
 * Script para criar a tabela Company no banco de dados
 * Execute: npx tsx scripts/create-company-table.ts
 */

import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

async function createCompanyTable() {
  try {
    console.log("Verificando se a tabela 'company' existe...");

    // Verificar se a tabela já existe
    const tableExists = await prisma.$queryRawUnsafe<
      Array<{ TABLE_NAME: string }>
    >(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'company'`,
    );

    if (tableExists.length > 0) {
      console.log("✓ Tabela 'company' já existe!");
      return;
    }

    console.log("Criando tabela 'company'...");

    // Criar a tabela Company
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`company\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`companyType\` VARCHAR(191) NOT NULL,
        \`hasStock\` BOOLEAN NOT NULL DEFAULT false,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`company_userId_idx\` (\`userId\`),
        INDEX \`company_isActive_idx\` (\`isActive\`),
        CONSTRAINT \`company_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    console.log("✓ Tabela 'company' criada com sucesso!");
  } catch (error: any) {
    if (error.code === "P2010" && error.meta?.code === "1050") {
      console.log("✓ Tabela 'company' já existe!");
    } else {
      console.error("Erro ao criar tabela:", error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createCompanyTable()
  .then(() => {
    console.log("\n✅ Script executado com sucesso!");
    console.log("Agora execute: npx prisma generate");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro ao executar script:", error);
    process.exit(1);
  });
