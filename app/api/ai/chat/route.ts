import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { chat } from "@/app/_lib/ai";
import { z } from "zod";
import type { ChatMessage } from "@/types/ai";

export const runtime = "nodejs";

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        timestamp: z.string().or(z.date()),
        meta: z.any().optional(),
      }),
    )
    .optional(),
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
    const validation = ChatRequestSchema.safeParse(body);

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

    const { message, history } = validation.data;

    // Converter history se necessário
    const parsedHistory: ChatMessage[] | undefined = history?.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    // Processar mensagem
    const response = await chat(message, session.user.id, parsedHistory);

    return NextResponse.json({
      ok: true,
      message: response,
    });
  } catch (error) {
    console.error("Erro no chat:", error);
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

