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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enquanto não montou, não renderizar nada (evitar flash)
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">Carregando...</div>
        </div>
      </div>
    );
  }

  // Enquanto está carregando a sessão, mostrar loading
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-muted-foreground text-sm">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado
  if (!session) {
    // Se não está na página de login, redirecionar (o middleware já faz isso, mas garantir)
    if (!isLoginPage) {
      router.push("/login");
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="text-muted-foreground text-sm">Redirecionando...</div>
          </div>
        </div>
      );
    }
    // Se está na página de login, mostrar apenas o conteúdo
    return <>{children}</>;
  }

  // Se está autenticado e na página de login, redirecionar para home
  if (session && isLoginPage) {
    router.push("/");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
      <main className="pt-16 lg:pl-64 bg-background">{children}</main>
      <AssistantButton />
      <AddTransactionFab />
    </>
  );
}

