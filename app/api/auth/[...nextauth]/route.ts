import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Forçar uso do Node.js runtime para suportar Prisma nos callbacks
export const runtime = "nodejs";

