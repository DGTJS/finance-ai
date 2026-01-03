/**
 * Script para verificar e criar a tabela company diretamente
 * Execute: node scripts/verify-and-create-company-table.js
 */

const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando conexão com o banco de dados...');
  
  try {
    // Verificar qual banco está sendo usado
    const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as dbName`;
    console.log('Banco de dados atual:', dbInfo[0]?.dbName);

    // Verificar se a tabela existe
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'company'
    `;

    console.log('Tabelas encontradas:', tables);

    if (tables && tables.length > 0) {
      console.log('✓ Tabela "company" já existe');
      
      // Verificar estrutura
      const columns = await prisma.$queryRaw`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'company'
        ORDER BY ORDINAL_POSITION
      `;
      
      console.log('Colunas da tabela company:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('❌ Tabela "company" NÃO existe. Criando...');
      
      // Criar a tabela diretamente
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
          INDEX \`company_isActive_idx\` (\`isActive\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      
      // Adicionar foreign key se a tabela User existir
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE \`company\` 
          ADD CONSTRAINT \`company_userId_fkey\` 
          FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log('✓ Foreign key adicionada');
      } catch (fkError) {
        console.log('⚠ Aviso: Não foi possível adicionar foreign key (pode já existir):', fkError.message);
      }
      
      console.log('✅ Tabela "company" criada com sucesso!');
    }

    // Testar se consegue fazer uma query
    console.log('\nTestando acesso à tabela...');
    try {
      const testQuery = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`company\``);
      console.log('✓ Query de teste bem-sucedida:', testQuery);
    } catch (testError) {
      console.error('❌ Erro ao testar query:', testError.message);
    }

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

