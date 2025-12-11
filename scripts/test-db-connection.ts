import { PrismaClient } from "../app/generated/prisma/client";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config({ path: ".env.local" });
config();

async function testDatabaseConnection() {
  console.log("🔍 Testando conexão com o banco de dados...\n");

  const prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  try {
    // 1. Verificar variável de ambiente
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("❌ ERRO: DATABASE_URL não está definida no .env.local");
      console.log("\n💡 Solução:");
      console.log("   Crie um arquivo .env.local na raiz do projeto com:");
      console.log('   DATABASE_URL="mysql://root:@localhost:3306/finance_ai"');
      process.exit(1);
    }

    console.log("✅ DATABASE_URL encontrada");
    console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}\n`);

    // 2. Testar conexão básica
    console.log("📡 Testando conexão básica...");
    try {
      await prisma.$connect();
      console.log("✅ Conexão estabelecida com sucesso!\n");
    } catch (error: any) {
      if (error.code === "P1003" || error.errorCode === "P1003") {
        console.error("❌ ERRO: O banco de dados não existe!");
        console.log("\n💡 SOLUÇÃO:");
        console.log("   1. Abra o phpMyAdmin (http://localhost/phpmyadmin)");
        console.log("   2. Crie um banco de dados chamado 'finance_ai'");
        console.log("   3. Execute: npx prisma migrate dev");
        console.log("   4. Execute: npm run seed (opcional - cria usuário de teste)");
        await prisma.$disconnect();
        process.exit(1);
      }
      throw error;
    }

    // 3. Verificar se as tabelas existem
    console.log("📋 Verificando tabelas...");
    try {
      // Obter nome do banco da URL
      const dbName = databaseUrl.split("/").pop()?.split("?")[0] || "finance_ai";
      const tables = await prisma.$queryRawUnsafe<Array<{ [key: string]: string }>>(
        `SHOW TABLES FROM \`${dbName}\``
      );
      const tableNames = tables.map((t) => Object.values(t)[0]);
      console.log(`✅ Encontradas ${tableNames.length} tabelas:`);
      tableNames.forEach((table) => console.log(`   - ${table}`));
      console.log();
    } catch (error: any) {
      console.log("⚠️  Não foi possível listar tabelas (isso é normal se o banco estiver vazio)");
      console.log("💡 Execute: npx prisma migrate dev\n");
    }

    // 4. Verificar tabela User
    console.log("👤 Verificando tabela User...");
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tabela User existe com ${userCount} usuário(s)\n`);
    } catch (error: any) {
      if (error.code === "P2021" || error.code === "P1003") {
        console.error("❌ ERRO: Tabelas não encontradas!");
        console.log("\n💡 SOLUÇÃO:");
        console.log("   Execute: npx prisma migrate dev");
        console.log("   Isso criará todas as tabelas necessárias.\n");
        process.exit(1);
      }
      throw error;
    }

    // 5. Testar operação de leitura
    console.log("📖 Testando operação de leitura...");
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    console.log(`✅ Leitura bem-sucedida! Encontrados ${users.length} usuário(s):`);
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.name || "Sem nome"})`);
    });
    console.log();

    // 6. Testar operação de escrita (criar usuário de teste temporário)
    console.log("✍️  Testando operação de escrita...");
    const testEmail = `test-${Date.now()}@test.com`;
    try {
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: "Usuário de Teste",
          password: "hashed_password_test",
        },
      });
      console.log(`✅ Escrita bem-sucedida! Usuário criado: ${testUser.email}`);

      // Limpar usuário de teste
      await prisma.user.delete({
        where: { id: testUser.id },
      });
      console.log("✅ Usuário de teste removido\n");
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log("⚠️  Usuário de teste já existe, pulando criação\n");
      } else {
        throw error;
      }
    }

    // 7. Verificar usuário de teste padrão
    console.log("🧪 Verificando usuário de teste padrão...");
    const testUser = await prisma.user.findUnique({
      where: { email: "teste@finance.ai" },
    });

    if (testUser) {
      console.log("✅ Usuário de teste encontrado:");
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Nome: ${testUser.name || "Não definido"}`);
      console.log(`   Senha hash: ${testUser.password ? "Definida" : "Não definida"}\n`);
    } else {
      console.log("⚠️  Usuário de teste não encontrado");
      console.log("💡 Execute 'npm run seed' para criar o usuário de teste\n");
    }

    // 8. Testar transação
    console.log("🔄 Testando transação...");
    await prisma.$transaction(async (tx) => {
      const count = await tx.user.count();
      console.log(`✅ Transação bem-sucedida! Total de usuários: ${count}\n`);
    });

    console.log("🎉 Todos os testes passaram! O banco de dados está funcionando corretamente.\n");

    // Resumo final
    console.log("📊 RESUMO:");
    console.log("   ✅ Conexão: OK");
    console.log("   ✅ Tabelas: OK");
    console.log("   ✅ Leitura: OK");
    console.log("   ✅ Escrita: OK");
    console.log("   ✅ Transações: OK");
  } catch (error: any) {
    console.error("\n❌ ERRO ao testar conexão com o banco de dados:\n");
    console.error(error);

    const errorCode = error.code || error.errorCode;

    if (errorCode === "P1001" || errorCode === "P1000") {
      console.log("\n💡 Possíveis soluções:");
      console.log("   1. Verifique se o MySQL está rodando (XAMPP)");
      console.log("   2. Verifique se a porta 3306 está acessível");
      console.log("   3. Verifique se o banco 'finance_ai' existe");
      console.log("   4. Verifique as credenciais no DATABASE_URL");
    } else if (errorCode === "P1003") {
      console.log("\n💡 SOLUÇÃO:");
      console.log("   1. Abra o phpMyAdmin (http://localhost/phpmyadmin)");
      console.log("   2. Crie um banco de dados chamado 'finance_ai'");
      console.log("   3. Execute: npx prisma migrate dev");
      console.log("   4. Execute: npm run seed (opcional - cria usuário de teste)");
    } else if (errorCode === "P2002") {
      console.log("\n💡 Erro de duplicação - verifique se o email já existe");
    }

    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão fechada.");
  }
}

// Executar teste
testDatabaseConnection().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});

