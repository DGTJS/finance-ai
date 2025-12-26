/**
 * Cliente API para comunicação com o backend
 * Suporta tanto endpoints reais quanto mocks (MSW)
 */

import type { DashboardSummary, Projection } from "@/src/types/dashboard";
import {
  dashboardSummarySchema,
  projectionSchema,
} from "@/src/schemas/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Cliente HTTP genérico com tratamento de erros
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Busca resumo completo do dashboard
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const data = await fetchAPI<DashboardSummary>("/dashboard/summary");

  // Validar com Zod
  const validated = dashboardSummarySchema.parse(data);
  return validated;
}

/**
 * Busca projeção mensal
 */
export async function getProjection(month: string): Promise<Projection> {
  const data = await fetchAPI<Projection>(
    `/profile-finance/projection?month=${month}`,
  );

  // Validar com Zod
  const validated = projectionSchema.parse(data);
  return validated;
}

/**
 * Adiciona valor a uma meta
 */
export async function addGoalAmount(
  goalId: string,
  amount: number,
): Promise<void> {
  await fetchAPI(`/goals/${goalId}/add-amount`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

/**
 * Executa uma ação rápida sugerida pela IA
 */
export async function executeInsightAction(
  actionId: string,
  params?: Record<string, unknown>,
): Promise<void> {
  await fetchAPI(`/insights/actions/${actionId}`, {
    method: "POST",
    body: JSON.stringify(params || {}),
  });
}
