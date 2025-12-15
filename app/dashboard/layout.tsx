/**
 * Layout do Dashboard
 * 
 * Configurações específicas para a rota /dashboard
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Financeiro | Finance AI",
  description: "Visão geral da sua situação financeira",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



