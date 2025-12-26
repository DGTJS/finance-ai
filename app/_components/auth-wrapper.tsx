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
  const isLandingPage = pathname === "/";
  const isPublicPage = isLoginPage || isLandingPage;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔑 REDIRECTS SEMPRE AQUI
  useEffect(() => {
    if (!mounted || status === "loading") return;

    // Não autenticado tentando acessar página privada
    if (!session && !isPublicPage) {
      router.replace("/");
      return;
    }

    // Autenticado tentando acessar login ou landing
    if (session && isPublicPage) {
      router.replace("/dashboard");
    }
  }, [mounted, status, session, isPublicPage, router]);

  // Enquanto não montou
  if (!mounted) {
    return loading("Carregando...");
  }

  // Enquanto carrega sessão
  if (status === "loading") {
    return loading("Verificando autenticação...");
  }

  // Não autenticado em página pública
  if (!session && isPublicPage) {
    return <>{children}</>;
  }

  // Estados intermediários (enquanto redireciona)
  if (!session && !isPublicPage) {
    return loading("Redirecionando...");
  }

  if (session && isPublicPage) {
    return loading("Redirecionando...");
  }

  // Autenticado em página privada
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

function loading(text: string) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        <div className="text-muted-foreground text-sm">{text}</div>
      </div>
    </div>
  );
}
