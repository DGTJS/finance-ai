import { PrismaClient } from "../app/generated/prisma";
import { config } from "dotenv";
import { resolve } from "path";

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, "../.env.local") });

const prisma = new PrismaClient();

async function addIsFixedColumn() {
  try {
    console.log("🔵 Verificando se a coluna 'isFixed' existe...");

    // Verificar se a coluna já existe
    const columns = await prisma.$queryRaw<Array<{ Field: string }>>`
      SHOW COLUMNS FROM fixedcost LIKE 'isFixed'
    `;

    if (columns.length > 0) {
      console.log("✅ A coluna 'isFixed' já existe na tabela 'fixedcost'");
      return;
    }

    console.log("🔵 Adicionando coluna 'isFixed' à tabela 'fixedcost'...");

    // Adicionar a coluna
    await prisma.$executeRaw`
      ALTER TABLE fixedcost 
      ADD COLUMN isFixed BOOLEAN NOT NULL DEFAULT true
    `;

    console.log("✅ Coluna 'isFixed' adicionada com sucesso!");

    // Verificar se o índice já existe
    const indexes = await prisma.$queryRaw<Array<{ Key_name: string }>>`
      SHOW INDEXES FROM fixedcost WHERE Key_name = 'fixedcost_isFixed_idx'
    `;

    if (indexes.length === 0) {
      console.log("🔵 Criando índice 'fixedcost_isFixed_idx'...");
      await prisma.$executeRaw`
        CREATE INDEX fixedcost_isFixed_idx ON fixedcost(isFixed)
      `;
      console.log("✅ Índice criado com sucesso!");
    } else {
      console.log("✅ O índice 'fixedcost_isFixed_idx' já existe");
    }

    console.log("✅ Migration concluída com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao executar migration:", error);
    console.error("❌ Mensagem:", error.message);
    console.error("❌ Código:", error.code);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addIsFixedColumn()
  .then(() => {
    console.log("✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro ao executar script:", error);
    process.exit(1);
  });
