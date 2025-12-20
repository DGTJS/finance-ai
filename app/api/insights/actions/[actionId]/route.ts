/**
 * API Route: POST /api/insights/actions/:actionId
 * Executa uma ação rápida sugerida pela IA
 * 
 * Por enquanto, apenas retorna sucesso. Pode ser expandido para
 * criar limites, ajustar metas, etc.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // Por enquanto, apenas logar a ação
    // Futuramente, pode implementar lógica específica para cada actionId
    console.log(`Ação executada: ${params.actionId}`, {
      userId: session.user.id,
      params: body,
    });

    // TODO: Implementar lógica específica para cada ação
    // Exemplos:
    // - create_limit: Criar um limite de gasto
    // - review_expenses: Redirecionar para página de despesas
    // - adjust_goal: Ajustar meta
    // etc.

    return NextResponse.json({
      success: true,
      message: `Ação ${params.actionId} executada com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao executar ação:", error);
    return NextResponse.json(
      {
        error: "Erro ao executar ação",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}






