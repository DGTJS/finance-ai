/**
 * Testes unitários para BalanceCard
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { BalanceCard } from "@/app/dashboard/components/BalanceCard";
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

describe("BalanceCard", () => {
  const defaultProps = {
    balance: 1245.5,
    changePercent: -4.5,
    sparklineData: [1200, 1220, 1250, 1245],
  };

  it("renderiza o saldo corretamente", () => {
    render(<BalanceCard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText(/R\$\s*1\.245,50/i)).toBeInTheDocument();
  });

  it("exibe variação percentual", () => {
    render(<BalanceCard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText(/-4\.5%/)).toBeInTheDocument();
  });

  it("aplica cor verde para saldo positivo", () => {
    render(
      <BalanceCard {...defaultProps} balance={1000} changePercent={5} />,
      { wrapper: createWrapper() }
    );
    const balanceElement = screen.getByText(/R\$\s*1\.000,00/i);
    expect(balanceElement).toHaveClass("text-green-600");
  });

  it("aplica cor vermelha para saldo negativo", () => {
    render(
      <BalanceCard {...defaultProps} balance={-500} changePercent={-10} />,
      { wrapper: createWrapper() }
    );
    const balanceElement = screen.getByText(/-R\$\s*500,00/i);
    expect(balanceElement).toHaveClass("text-red-600");
  });

  it("chama onRefresh quando botão é clicado", () => {
    const onRefresh = jest.fn();
    render(<BalanceCard {...defaultProps} onRefresh={onRefresh} />, {
      wrapper: createWrapper(),
    });

    const refreshButton = screen.getByLabelText("Atualizar saldo");
    fireEvent.click(refreshButton);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("tem acessibilidade correta", () => {
    render(<BalanceCard {...defaultProps} />, { wrapper: createWrapper() });
    const card = screen.getByRole("region", { name: "Saldo atual" });
    expect(card).toBeInTheDocument();
  });
});




