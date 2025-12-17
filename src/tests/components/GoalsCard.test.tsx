/**
 * Testes unitários para GoalsCard
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoalsCard } from "@/app/dashboard/components/GoalsCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

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
  },
];

describe("GoalsCard", () => {
  it("renderiza metas corretamente", () => {
    render(<GoalsCard goals={mockGoals} />, { wrapper: createWrapper() });
    expect(screen.getByText("Viagem")).toBeInTheDocument();
    expect(screen.getByText("Reserva de Emergência")).toBeInTheDocument();
  });

  it("calcula progresso corretamente", () => {
    render(<GoalsCard goals={mockGoals} />, { wrapper: createWrapper() });
    // 400 / 2000 = 20%
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument();
  });

  it("exibe mensagem quando não há metas", () => {
    render(<GoalsCard goals={[]} />, { wrapper: createWrapper() });
    expect(screen.getByText("Nenhuma meta ativa")).toBeInTheDocument();
  });

  it("abre dialog ao clicar em adicionar valor", async () => {
    const onAddAmount = jest.fn();
    render(
      <GoalsCard goals={mockGoals} onAddAmount={onAddAmount} />,
      { wrapper: createWrapper() }
    );

    const addButtons = screen.getAllByLabelText(/Adicionar valor à meta/i);
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Adicionar valor/i)).toBeInTheDocument();
    });
  });
});




