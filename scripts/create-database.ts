import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

// Carregar variáveis de ambiente
config({ path: ".env.local" });
config();

async function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ ERRO: DATABASE_URL não está definida no .env.local");
    process.exit(1);
  }

  // Parse da URL do banco de dados usando URL
  let parsedUrl: URL;
  try {
    // Adicionar protocolo se necessário para o parser de URL
    const urlToParse = databaseUrl.startsWith("mysql://") 
      ? databaseUrl.replace("mysql://", "http://") 
      : `http://${databaseUrl}`;
    parsedUrl = new URL(urlToParse);
  } catch {
    console.error("❌ ERRO: Formato inválido da DATABASE_URL");
    console.log(`   URL recebida: ${databaseUrl}`);
    process.exit(1);
  }

  // Extrair componentes da URL MySQL
  // mysql://user:password@host:port/database
  const user = parsedUrl.username || "";
  const password = parsedUrl.password || "";
  const host = parsedUrl.hostname || "localhost";
  const port = parsedUrl.port || "3306";
  
  // Extrair nome do banco do pathname
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  const database = pathParts[pathParts.length - 1] || "";
  
  if (!database) {
    console.error("❌ ERRO: Nome do banco de dados não encontrado na URL");
    console.log(`   URL recebida: ${databaseUrl}`);
    process.exit(1);
  }

  console.log("🔍 Criando banco de dados...\n");
  console.log(`   Host: ${host}`);
  console.log(`   Porta: ${port}`);
  console.log(`   Usuário: ${user}`);
  console.log(`   Banco: ${database}\n`);

  // Criar URL sem o nome do banco para conectar ao MySQL
  // Se não há senha, usar formato mysql://user@host:port
  const mysqlUrl = password 
    ? `mysql://${user}:${password}@${host}:${port}`
    : `mysql://${user}@${host}:${port}`;
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: mysqlUrl,
      },
    },
  });

  try {
    console.log("✅ Conectado ao MySQL\n");

    // Criar banco de dados se não existir
    console.log(`📦 Criando banco de dados '${database}'...`);
    await prisma.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Banco de dados '${database}' criado com sucesso!\n`);

    await prisma.$disconnect();
    console.log("🎉 Banco de dados configurado com sucesso!");
    console.log("\n💡 Próximos passos:");
    console.log("   1. Execute: npx prisma migrate dev");
    console.log("   2. Execute: npm run seed (opcional)");
  } catch (error: any) {
    console.error("\n❌ ERRO ao criar banco de dados:\n");
    console.error(error.message || error);

    if (error.code === "P1001" || error.code === "P1000") {
      console.log("\n💡 SOLUÇÃO:");
      console.log("   1. Verifique se o MySQL está rodando (XAMPP)");
      console.log("   2. Verifique se a porta 3306 está acessível");
      console.log("   3. Inicie o MySQL através do painel de controle do XAMPP");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR" || error.message?.includes("Access denied")) {
      console.log("\n💡 SOLUÇÃO:");
      console.log("   1. Verifique as credenciais no DATABASE_URL");
      console.log("   2. Verifique se o usuário tem permissão para criar bancos");
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

createDatabase().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});

