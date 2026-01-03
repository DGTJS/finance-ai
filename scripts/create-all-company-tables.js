/**
 * Script para criar todas as tabelas de Empresa no banco de dados
 * Execute: node scripts/create-all-company-tables.js
 */

const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function createTableIfNotExists(tableName, createSQL) {
  try {
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ${tableName}
    `;

    if (tables && tables.length > 0) {
      console.log(`✓ Tabela "${tableName}" já existe`);
      return false;
    }

    console.log(`Criando tabela "${tableName}"...`);
    await prisma.$executeRawUnsafe(createSQL);
    console.log(`✅ Tabela "${tableName}" criada com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar tabela "${tableName}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Verificando e criando tabelas de Empresa...\n');
  
  try {
    // Verificar qual banco está sendo usado
    const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as dbName`;
    console.log('Banco de dados atual:', dbInfo[0]?.dbName);
    console.log('');

    // 1. Tabela Company
    await createTableIfNotExists('company', `
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
        INDEX \`company_isActive_idx\` (\`isActive\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tentar adicionar foreign key para company
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`company\` 
        ADD CONSTRAINT \`company_userId_fkey\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key company_userId_fkey adicionada');
    } catch (fkError) {
      console.log('⚠ Foreign key company_userId_fkey já existe ou erro:', fkError.message);
    }

    // 2. Tabela CompanyRevenue
    await createTableIfNotExists('companyrevenue', `
      CREATE TABLE \`companyrevenue\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`companyId\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`amount\` DOUBLE NOT NULL,
        \`origin\` VARCHAR(191) NOT NULL,
        \`paymentMethod\` VARCHAR(191) NOT NULL,
        \`date\` DATETIME(3) NOT NULL,
        \`description\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`companyrevenue_companyId_idx\` (\`companyId\`),
        INDEX \`companyrevenue_userId_idx\` (\`userId\`),
        INDEX \`companyrevenue_date_idx\` (\`date\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tentar adicionar foreign keys para companyrevenue
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`companyrevenue\` 
        ADD CONSTRAINT \`companyrevenue_companyId_fkey\` 
        FOREIGN KEY (\`companyId\`) REFERENCES \`company\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key companyrevenue_companyId_fkey adicionada');
    } catch (fkError) {
      console.log('⚠ Foreign key companyrevenue_companyId_fkey já existe ou erro:', fkError.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`companyrevenue\` 
        ADD CONSTRAINT \`companyrevenue_userId_fkey\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key companyrevenue_userId_fkey adicionada');
    } catch (fkError) {
      console.log('⚠ Foreign key companyrevenue_userId_fkey já existe ou erro:', fkError.message);
    }

    // 3. Tabela CompanyProduct
    await createTableIfNotExists('companyproduct', `
      CREATE TABLE \`companyproduct\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`companyId\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 0,
        \`minQuantity\` INT NOT NULL DEFAULT 0,
        \`costPrice\` DOUBLE NOT NULL DEFAULT 0,
        \`salePrice\` DOUBLE NOT NULL DEFAULT 0,
        \`margin\` DOUBLE NOT NULL DEFAULT 0,
        \`description\` TEXT NULL,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`companyproduct_companyId_idx\` (\`companyId\`),
        INDEX \`companyproduct_userId_idx\` (\`userId\`),
        INDEX \`companyproduct_isActive_idx\` (\`isActive\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Tentar adicionar foreign keys para companyproduct
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`companyproduct\` 
        ADD CONSTRAINT \`companyproduct_companyId_fkey\` 
        FOREIGN KEY (\`companyId\`) REFERENCES \`company\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key companyproduct_companyId_fkey adicionada');
    } catch (fkError) {
      console.log('⚠ Foreign key companyproduct_companyId_fkey já existe ou erro:', fkError.message);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`companyproduct\` 
        ADD CONSTRAINT \`companyproduct_userId_fkey\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key companyproduct_userId_fkey adicionada');
    } catch (fkError) {
      console.log('⚠ Foreign key companyproduct_userId_fkey já existe ou erro:', fkError.message);
    }

    // 4. Verificar se as colunas entityType e entityId existem na tabela fixedcost
    const fixedCostColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'fixedcost' 
      AND COLUMN_NAME IN ('entityType', 'entityId')
    `;

    const hasEntityType = fixedCostColumns.some((col) => col.COLUMN_NAME === 'entityType');
    const hasEntityId = fixedCostColumns.some((col) => col.COLUMN_NAME === 'entityId');

    if (!hasEntityType) {
      console.log('Adicionando coluna "entityType" na tabela "fixedcost"...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`fixedcost\` 
        ADD COLUMN \`entityType\` VARCHAR(191) NULL
      `);
      console.log('✓ Coluna "entityType" adicionada');
    } else {
      console.log('✓ Coluna "entityType" já existe');
    }

    if (!hasEntityId) {
      console.log('Adicionando coluna "entityId" na tabela "fixedcost"...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`fixedcost\` 
        ADD COLUMN \`entityId\` VARCHAR(191) NULL
      `);
      console.log('✓ Coluna "entityId" adicionada');
    } else {
      console.log('✓ Coluna "entityId" já existe');
    }

    // Verificar se o índice composto existe
    const indexes = await prisma.$queryRaw`
      SELECT INDEX_NAME 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'fixedcost' 
      AND INDEX_NAME = 'fixedcost_entityType_entityId_idx'
    `;

    if (!indexes || indexes.length === 0) {
      console.log('Criando índice composto na tabela "fixedcost"...');
      await prisma.$executeRawUnsafe(`
        CREATE INDEX \`fixedcost_entityType_entityId_idx\` 
        ON \`fixedcost\` (\`entityType\`, \`entityId\`)
      `);
      console.log('✓ Índice composto criado');
    } else {
      console.log('✓ Índice composto já existe');
    }

    console.log('\n✅ Todas as tabelas foram criadas/verificadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

