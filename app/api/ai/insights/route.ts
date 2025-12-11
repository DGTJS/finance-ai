import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateInsights } from "@/app/_lib/ai";
import { db } from "@/app/_lib/prisma";
import { z } from "zod";

const InsightsRequestSchema = z.object({
  userId: z.string().optional(),
  from: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  to: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Não autorizado. Faça login para continuar.",
        },
        { status: 401 },
      );
    }

    // Parse do body
    const body = await request.json();

    // Validar com Zod
    const validation = InsightsRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Dados inválidos",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { userId, from, to } = validation.data;

    // Usar o userId da sessão (mais seguro)
    const actualUserId = userId || session.user.id;

    // Verificar se o usuário pode acessar esses dados
    if (actualUserId !== session.user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Você não tem permissão para acessar esses dados.",
        },
        { status: 403 },
      );
    }

    // Converter strings para Date
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Validar datas
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        {
          ok: false,
          error: "Datas inválidas",
        },
        { status: 400 },
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        {
          ok: false,
          error: "A data inicial deve ser anterior à data final",
        },
        { status: 400 },
      );
    }

    // Gerar insights
    const insights = await generateInsights(actualUserId, fromDate, toDate);

    // Buscar resumo de transações
    const [expenses, deposits, investments] = await Promise.all([
      db.transaction.aggregate({
        where: {
          userId: actualUserId,
          createdAt: { gte: fromDate, lte: toDate },
          type: "EXPENSE",
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          userId: actualUserId,
          createdAt: { gte: fromDate, lte: toDate },
          type: "DEPOSIT",
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          userId: actualUserId,
          createdAt: { gte: fromDate, lte: toDate },
          type: "INVESTMENT",
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      insights,
      summary: {
        totalIncome: deposits._sum.amount || 0,
        totalExpenses: expenses._sum.amount || 0,
        totalInvestments: investments._sum.amount || 0,
        period: `${fromDate.toLocaleDateString("pt-BR")} - ${toDate.toLocaleDateString("pt-BR")}`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}

