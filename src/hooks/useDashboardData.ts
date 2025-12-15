/**
 * Hook customizado para buscar dados do dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/src/lib/api";
import type { DashboardSummary } from "@/src/types/dashboard";

export function useDashboardData() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000, // 1 minuto (dados mensais não mudam tão frequentemente)
    refetchOnWindowFocus: false, // Não refazer fetch ao focar na janela
  });
}

