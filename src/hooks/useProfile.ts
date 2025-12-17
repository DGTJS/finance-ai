/**
 * Hook customizado para dados do perfil financeiro
 * (pode ser expandido conforme necessário)
 */

import { useQuery } from "@tanstack/react-query";

export interface FinancialProfile {
  rendaFixa: number;
  rendaVariavelMedia: number;
  beneficios: Array<{ type: string; value: number }>;
}

export function useProfile() {
  return useQuery<FinancialProfile>({
    queryKey: ["profile", "finance"],
    queryFn: async () => {
      const response = await fetch("/api/profile-finance");
      if (!response.ok) throw new Error("Erro ao buscar perfil");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}




