import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash da senha "123456"
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: "teste@finance.ai" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "teste@finance.ai",
      name: "Usuário Teste",
      password: hashedPassword,
    },
  });

  console.log("✅ Usuário de teste criado:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuário:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

