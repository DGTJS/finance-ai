/**
 * MSW Handlers - Mocks para desenvolvimento e testes
 * 
 * IMPORTANTE: Em produção ou quando o endpoint real estiver disponível,
 * os dados reais serão usados. Os mocks só são ativados em desenvolvimento
 * e quando o worker do MSW está ativo.
 */

import { http, HttpResponse } from "msw";
import type { DashboardSummary, Projection } from "@/src/types/dashboard";

// Fixtures de dados mock
const mockTransactions = [
  {
    id: "1",
    userId: "2",
    name: "Padaria",
    type: "EXPENSE" as const,
    value: 25.5,
    category: "FOOD" as const,
    createdAt: "2025-11-30T12:00:00Z",
  },
  {
    id: "2",
    userId: "2",
    name: "Salário",
    type: "DEPOSIT" as const,
    value: 3000.0,
    category: "SALARY" as const,
    createdAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "3",
    userId: "2",
    name: "Uber",
    type: "EXPENSE" as const,
    value: 15.0,
    category: "TRANSPORTATION" as const,
    createdAt: "2025-11-29T14:30:00Z",
  },
];

const mockScheduledPayments = [
  {
    id: "1",
    name: "Netflix",
    dueDate: "2025-12-10",
    value: 29.9,
  },
  {
    id: "2",
    name: "Spotify",
    dueDate: "2025-12-15",
    value: 19.9,
  },
  {
    id: "3",
    name: "Amazon Prime",
    dueDate: "2025-12-20",
    value: 14.9,
  },
];

const mockGoals = [
  {
    id: "1",
    title: "Viagem",
    current: 400,
    target: 2000,
    dueDate: "2026-06-01",
    isShared: false,
    icon: "✈️",
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Reserva de Emergência",
    current: 1500,
    target: 5000,
    dueDate: "2026-12-31",
    isShared: false,
    icon: "💰",
    color: "#10b981",
  },
  {
    id: "3",
    title: "Notebook",
    current: 800,
    target: 3000,
    dueDate: "2026-03-15",
    isShared: false,
    icon: "💻",
    color: "#8b5cf6",
  },
];

const mockCategories = [
  { key: "FOOD" as const, value: 842.0, emoji: "🍔", color: "#F59E0B" },
  { key: "TRANSPORTATION" as const, value: 320.0, emoji: "🚗", color: "#3B82F6" },
  { key: "HOUSING" as const, value: 1200.0, emoji: "🏠", color: "#EF4444" },
  { key: "ENTERTAINMENT" as const, value: 150.0, emoji: "🎬", color: "#8B5CF6" },
];

const mockUserStats = [
  {
    userId: "2",
    name: "Maria",
    avatarUrl: null,
    revenues: 3000,
    expenses: 1800,
    investments: 200,
  },
];

const mockDashboardSummary: DashboardSummary = {
  balance: 1245.5,
  changePercent: -4.5,
  sparkline: [1200, 1220, 1250, 1245, 1230, 1240, 1245.5],
  recentTransactions: mockTransactions,
  scheduledPayments: mockScheduledPayments,
  goals: mockGoals,
  categories: mockCategories,
  userStats: mockUserStats,
  insight: {
    severity: "medium",
    message: "Gastou 17% a mais em alimentação comparado ao mês anterior",
    actions: [
      { id: "create_limit", label: "Criar limite de alimentação" },
      { id: "review_expenses", label: "Revisar despesas" },
    ],
  },
};

const mockProjection: Projection = {
  saldo_previsto: 1500.0,
  percent_comprometido: 65.5,
  sugestao_para_meta: 300.0,
};

export const handlers = [
  // GET /api/dashboard/summary
  // COMENTADO: Usando endpoint real em app/api/dashboard/summary/route.ts
  // Para usar mocks, descomente a linha abaixo e comente o endpoint real
  // http.get("/api/dashboard/summary", () => {
  //   return HttpResponse.json(mockDashboardSummary);
  // }),

  // GET /api/profile-finance/projection
  // COMENTADO: Usando endpoint real em app/api/profile-finance/projection/route.ts
  // http.get("/api/profile-finance/projection", ({ request }) => {
  //   const url = new URL(request.url);
  //   const month = url.searchParams.get("month");
  //   
  //   if (month) {
  //     return HttpResponse.json(mockProjection);
  //   }
  //   
  //   return HttpResponse.json(
  //     { error: "Parâmetro month é obrigatório" },
  //     { status: 400 }
  //   );
  // }),

  // POST /api/goals/:id/add-amount
  // COMENTADO: Usando endpoint real em app/api/goals/[id]/add-amount/route.ts
  // http.post("/api/goals/:id/add-amount", async ({ request, params }) => {
  //   const { id } = params;
  //   const body = await request.json() as { amount: number };
  //   
  //   // Atualizar mock goal
  //   const goal = mockGoals.find((g) => g.id === id);
  //   if (goal) {
  //     goal.current += body.amount;
  //   }
  //   
  //   return HttpResponse.json({ success: true });
  // }),

  // POST /api/insights/actions/:actionId
  // COMENTADO: Usando endpoint real em app/api/insights/actions/[actionId]/route.ts
  // http.post("/api/insights/actions/:actionId", ({ params }) => {
  //   const { actionId } = params;
  //   
  //   // Simular execução de ação
  //   return HttpResponse.json({
  //     success: true,
  //     message: `Ação ${actionId} executada com sucesso`,
  //   });
  // }),
];

