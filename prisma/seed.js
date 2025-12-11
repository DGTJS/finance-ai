const path = require("path");
const fs = require("fs");

// Tentar carregar .env.local primeiro, depois .env
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
  console.log("📄 Carregando .env.local");
} else if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
  console.log("📄 Carregando .env");
} else {
  console.error("❌ Arquivo .env ou .env.local não encontrado!");
  process.exit(1);
}

const { PrismaClient } = require("../app/generated/prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Criando usuário de teste...");

  // Hash da senha "123456"
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: "teste@finance.ai" },
    update: {
      password: hashedPassword,
      name: "Usuário Teste",
    },
    create: {
      email: "teste@finance.ai",
      name: "Usuário Teste",
      password: hashedPassword,
    },
  });

  console.log("✅ Usuário de teste criado com sucesso!");
  console.log("📧 Email: teste@finance.ai");
  console.log("🔑 Senha: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuário:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

