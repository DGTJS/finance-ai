/**
 * API Route: GET /api/profile-finance/projection?month=YYYY-MM
 * Retorna projeção mensal baseada em dados reais
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/_lib/prisma";

export const runtime = "nodejs";
import { getMonthlyProjection } from "@/app/_actions/financial-profile";
import type { Projection } from "@/src/types/dashboard";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { error: "Parâmetro month é obrigatório (formato: YYYY-MM)" },
        { status: 400 }
      );
    }

    // Validar formato do mês
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { error: "Formato do mês inválido. Use YYYY-MM" },
        { status: 400 }
      );
    }

    // Usar a função existente getMonthlyProjection
    const projectionResult = await getMonthlyProjection(month);
    
    if (!projectionResult.success || !projectionResult.data) {
      // Se não tem perfil, retornar valores padrão baseados em transações
      return calculateProjectionFromTransactions(session.user.id, month);
    }

    const projection: Projection = {
      saldo_previsto: projectionResult.data.saldoPrevisto || 0,
      percent_comprometido: projectionResult.data.percentComprometido || 0,
      sugestao_para_meta: projectionResult.data.sugestaoParaMeta || 0,
    };

    return NextResponse.json(projection);
  } catch (error) {
    console.error("Erro ao calcular projeção:", error);
    return NextResponse.json(
      {
        error: "Erro ao calcular projeção",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * Calcula projeção baseada apenas em transações (quando não há perfil financeiro)
 */
async function calculateProjectionFromTransactions(
  userId: string,
  month: string
): Promise<NextResponse<Projection>> {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const subscriptions = await db.subscription.findMany({
    where: {
      userId,
      active: true,
    },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const subscriptionsTotal = subscriptions.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  const despesasTotal = totalExpenses + subscriptionsTotal;
  const saldoPrevisto = totalIncome - despesasTotal;
  const percentComprometido = totalIncome > 0 
    ? (despesasTotal / totalIncome) * 100 
    : 0;
  const sugestaoParaMeta = saldoPrevisto > 0 ? saldoPrevisto * 0.3 : 0;

  return NextResponse.json({
    saldo_previsto: saldoPrevisto,
    percent_comprometido: percentComprometido,
    sugestao_para_meta: sugestaoParaMeta,
  });
}

