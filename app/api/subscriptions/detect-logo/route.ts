import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectLogo } from "@/app/_lib/logo-detection";
import { z } from "zod";

const DetectLogoRequestSchema = z.object({
  name: z.string().min(1).max(100),
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
    const validation = DetectLogoRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nome inválido",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { name } = validation.data;

    // Detectar logo
    const result = await detectLogo(name);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao detectar logo:", error);
    return NextResponse.json(
      {
        ok: false,
        logoUrl: "/logos/default.svg",
        source: "fallback",
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}

