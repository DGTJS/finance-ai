/**
 * Testes E2E para o Dashboard
 */

describe("Dashboard E2E", () => {
  beforeEach(() => {
    // Visitar página do dashboard
    cy.visit("/dashboard");
  });

  it("carrega o dashboard com dados mock", () => {
    // Verificar se os elementos principais estão presentes
    cy.contains("Dashboard Financeiro").should("be.visible");
    cy.contains("Saldo Atual").should("be.visible");
    cy.contains("Transações Recentes").should("be.visible");
  });

  it("exibe saldo atual corretamente", () => {
    cy.contains("Saldo Atual").should("be.visible");
    // Verificar formato de moeda brasileira
    cy.contains(/R\$\s*\d+[.,]\d{2}/).should("exist");
  });

  it("exibe transações recentes", () => {
    cy.contains("Transações Recentes").should("be.visible");
    // Verificar se há pelo menos uma transação
    cy.get('[role="region"][aria-label="Transações recentes"]').within(() => {
      cy.get("div").should("have.length.greaterThan", 0);
    });
  });

  it("exibe metas em andamento", () => {
    cy.contains("Metas em Andamento").should("be.visible");
  });

  it("exibe pagamentos agendados", () => {
    cy.contains("Pagamentos Agendados").should("be.visible");
  });

  it("exibe insight da IA", () => {
    cy.contains("Insight da IA").should("be.visible");
  });

  it("navega para página de transações", () => {
    cy.contains("Ver todas").first().click();
    cy.url().should("include", "/transactions");
  });

  it("responsividade mobile", () => {
    cy.viewport(375, 667); // iPhone SE
    cy.contains("Dashboard Financeiro").should("be.visible");
    cy.contains("Saldo Atual").should("be.visible");
  });

  it("responsividade tablet", () => {
    cy.viewport(768, 1024); // iPad
    cy.contains("Dashboard Financeiro").should("be.visible");
  });

  it("responsividade desktop", () => {
    cy.viewport(1280, 720);
    cy.contains("Dashboard Financeiro").should("be.visible");
  });
});






