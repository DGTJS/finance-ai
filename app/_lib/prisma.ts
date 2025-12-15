import { PrismaClient } from "../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.cachedPrisma) {
    globalThis.cachedPrisma = new PrismaClient();
  }
  prisma = globalThis.cachedPrisma;
}

// Verificar se o modelo financialProfile está disponível
if (process.env.NODE_ENV === "development" && !prisma.financialProfile) {
  console.warn("⚠️ Modelo financialProfile não encontrado no Prisma Client. Execute: npx prisma generate");
}

export const db = prisma;
