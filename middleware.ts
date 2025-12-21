import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Garantir que o middleware use Node.js runtime (não Edge)
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rotas que devem ser ignoradas pelo middleware
  const isAuthRoute = pathname.startsWith("/api/auth");
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Páginas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/landing"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Debug: log para verificar o estado da autenticação
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Middleware] ${pathname} - Auth:`,
      req.auth ? "✅ Autenticado" : "❌ Não autenticado",
    );
  }

  // Se não está autenticado e não está em uma rota pública, redireciona para login
  if (!req.auth && !isPublicRoute) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] Redirecionando ${pathname} para /login`);
    }
    // Garantir que a URL de redirecionamento use a mesma origem da requisição
    const loginUrl = new URL("/login", req.url);
    // Usar o host da requisição original para garantir a mesma porta
    const host = req.headers.get("host");
    if (host) {
      loginUrl.host = host;
    }
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar o login, redireciona para home
  if (req.auth && isPublicRoute) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
