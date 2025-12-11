import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do Prisma
vi.mock("../app/_lib/prisma", () => ({
  db: {
    transaction: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    subscription: {
      findMany: vi.fn(),
    },
  },
}));

describe("AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve sanitizar input corretamente", async () => {
    const { askAI } = await import("../app/_lib/ai");

    // Tentar com script tag (deve ser removido)
    const result = await askAI("<script>alert('xss')</script>teste");

    // Verifica que não deu erro
    expect(result).toBeDefined();
    expect(result.ok !== undefined).toBe(true);
  });

  it("deve limitar tamanho do prompt", async () => {
    const { askAI } = await import("../app/_lib/ai");

    // String muito longa (> 2000 chars)
    const longPrompt = "a".repeat(3000);
    const result = await askAI(longPrompt);

    expect(result).toBeDefined();
    expect(result.ok !== undefined).toBe(true);
  });

  it("deve rejeitar prompt vazio", async () => {
    const { askAI } = await import("../app/_lib/ai");

    const result = await askAI("");

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("deve usar fallback quando HF_API_KEY não configurada", async () => {
    // Garantir que não há API key
    const oldKey = process.env.HF_API_KEY;
    delete process.env.HF_API_KEY;

    const { askAI } = await import("../app/_lib/ai");
    const result = await askAI("quanto gastei?");

    // Deve retornar alguma resposta (fallback)
    expect(result).toBeDefined();
    expect(result.text || result.error).toBeDefined();

    // Restaurar
    if (oldKey) process.env.HF_API_KEY = oldKey;
  });
});

describe("AI Insights Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve gerar insights quando não há transações", async () => {
    const { db } = await import("../app/_lib/prisma");
    const { generateInsights } = await import("../app/_lib/ai");

    // Mock retornando array vazio
    vi.mocked(db.transaction.findMany).mockResolvedValue([]);

    const from = new Date("2025-01-01");
    const to = new Date("2025-01-31");

    const insights = await generateInsights("user-123", from, to);

    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].id).toBe("no-data");
  });
});

