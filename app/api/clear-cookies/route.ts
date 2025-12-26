import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Lista de cookies do NextAuth que devem ser limpos
    const authCookies = [
      "next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "__Secure-next-auth.callback-url",
      "__Host-next-auth.callback-url",
    ];

    // Limpar todos os cookies de autenticação
    authCookies.forEach((cookieName) => {
      cookieStore.delete(cookieName);
    });

    // Também limpar cookies com variações de domínio
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
      if (
        cookie.name.includes("next-auth") ||
        cookie.name.includes("authjs") ||
        cookie.name.includes("csrf")
      ) {
        cookieStore.delete(cookie.name);
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cookies limpos com sucesso",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": authCookies
            .map(
              (name) =>
                `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
            )
            .join(", "),
        },
      },
    );
  } catch (error) {
    console.error("Erro ao limpar cookies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao limpar cookies",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
