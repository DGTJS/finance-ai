import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Página Home - Landing page para não autenticados, Dashboard para autenticados
 *
 * - Usuários não autenticados: vão para a landing page
 * - Usuários autenticados: redirecionados para o dashboard
 */
export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/landing");
  }

  // Redirecionar para a nova dashboard implementada
  redirect("/dashboard");
}
