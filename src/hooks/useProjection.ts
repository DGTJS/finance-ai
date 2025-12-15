/**
 * Hook customizado para buscar projeção mensal
 */

import { useQuery } from "@tanstack/react-query";
import { getProjection } from "@/src/lib/api";
import type { Projection } from "@/src/types/dashboard";

export function useProjection(month: string) {
  return useQuery<Projection>({
    queryKey: ["projection", month],
    queryFn: () => getProjection(month),
    enabled: !!month,
    staleTime: 60 * 1000, // 1 minuto
  });
}



