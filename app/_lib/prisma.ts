import { PrismaClient } from "../generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Limpar cache se necessário (útil após regenerar o Prisma Client)
  if (process.env.CLEAR_PRISMA_CACHE === "true") {
    globalThis.cachedPrisma = undefined;
    delete process.env.CLEAR_PRISMA_CACHE;
  }

  if (!globalThis.cachedPrisma) {
    globalThis.cachedPrisma = new PrismaClient();
  }
  prisma = globalThis.cachedPrisma;
}

// Verificar se os modelos estão disponíveis
if (process.env.NODE_ENV === "development") {
  const missingModels: string[] = [];

  if (!prisma.financialProfile) {
    missingModels.push("financialProfile");
  }

  if (!prisma.fixedCost) {
    missingModels.push("fixedCost");
  }

  if (!prisma.company) {
    missingModels.push("company");
  }

  if (missingModels.length > 0) {
    console.warn(
      `⚠️ Modelos não encontrados no Prisma Client: ${missingModels.join(", ")}`,
    );
    console.warn("⚠️ Limpando cache e criando nova instância...");

    // Limpar cache
    globalThis.cachedPrisma = undefined;

    // Criar nova instância
    const newPrisma = new PrismaClient();

    const foundModels: string[] = [];
    if (newPrisma.fixedCost) foundModels.push("fixedCost");
    if (newPrisma.company) foundModels.push("company");
    if (newPrisma.financialProfile) foundModels.push("financialProfile");

    if (foundModels.length > 0) {
      globalThis.cachedPrisma = newPrisma;
      prisma = newPrisma;
      console.log(
        `✅ Prisma Client atualizado! Modelos disponíveis: ${foundModels.join(", ")}`,
      );
    } else {
      console.error("❌ Prisma Client ainda não tem os modelos necessários.");
      console.error("❌ Execute: npx prisma generate");
      console.error("❌ E reinicie o servidor Next.js");
    }
  } else {
    console.log("✅ Todos os modelos encontrados no Prisma Client");
  }
}

export const db = prisma;
