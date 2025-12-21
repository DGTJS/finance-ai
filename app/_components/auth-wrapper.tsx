"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import AssistantButton from "./assistant/assistant-button";
import AddTransactionFab from "./add-transaction-fab";

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isLandingPage = pathname === "/landing";
  const isPublicPage = isLoginPage || isLandingPage;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enquanto não montou, não renderizar nada (evitar flash)
  if (!mounted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">Carregando...</div>
        </div>
      </div>
    );
  }

  // Enquanto está carregando a sessão, mostrar loading
  if (status === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">
            Verificando autenticação...
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado
  if (!session) {
    // Se está em uma página pública, mostrar apenas o conteúdo
    if (isPublicPage) {
      return <>{children}</>;
    }
    // Se não está em página pública, redirecionar para landing
    router.push("/landing");
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">Redirecionando...</div>
        </div>
      </div>
    );
  }

  // Se está autenticado e em página pública, redirecionar para dashboard
  if (session && (isLoginPage || isLandingPage)) {
    router.push("/dashboard");
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">Redirecionando...</div>
        </div>
      </div>
    );
  }

  // Se estiver autenticado, mostrar navbar, sidebar e conteúdo
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-background pt-16 lg:pl-64">{children}</main>
      <AssistantButton />
      <AddTransactionFab />
    </>
  );
}
