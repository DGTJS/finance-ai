/**
 * API Route: POST /api/goals/:id/add-amount
 * Adiciona valor a uma meta usando a action real
 */

import { NextRequest, NextResponse } from "next/server";
import { addGoalAmount } from "@/app/_actions/goal";
import { z } from "zod";

const addAmountSchema = z.object({
  amount: z.number().positive("Valor deve ser maior que zero"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = addAmountSchema.parse(body);

    const result = await addGoalAmount(params.id, validatedData.amount);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao adicionar valor à meta" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao adicionar valor à meta:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erro ao adicionar valor à meta",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}



