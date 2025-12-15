import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Página Home - Redireciona para a nova Dashboard Financeira
 * 
 * A implementação completa da dashboard está em /app/dashboard/page.tsx
 * com React Query, MSW para mocks, e todos os componentes modernos.
 */
export default async function Home() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Redirecionar para a nova dashboard implementada
  redirect("/dashboard");
}
