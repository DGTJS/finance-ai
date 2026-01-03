"use client";

import { ReactNode } from "react";
import { CompanyProvider } from "@/app/_contexts/company-context";

/**
 * Layout do módulo Empresa
 * Fornece o CompanyContext para todas as rotas /dashboard/company/*
 */
export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <CompanyProvider>{children}</CompanyProvider>;
}
