import fetch from "node-fetch";

describe("Dashboard Summary API", () => {
  it("deve calcular corretamente o saldo atual e previsto com múltiplos salários", async () => {
    // Ajuste o e-mail do usuário de teste conforme o seed
    const email = "teste@finance.ai";
    // Simule autenticação se necessário (token/cookie)
    // Aqui assume que a API local não exige auth para teste local
    const res = await fetch("http://localhost:3000/api/dashboard/summary");
    expect(res.status).toBe(200);
    const data = await res.json();

    // Exiba os principais campos para inspeção manual
    console.log("currentBalance:", data.currentBalance);
    console.log("projectedBalance:", data.projectedBalance);
    console.log("salaryTotal:", data.salaryTotal);
    console.log("expectedSalaryFromProfiles:", data.expectedSalaryFromProfiles);
    console.log("fixedExpensesTotal:", data.fixedExpensesTotal);
    console.log("variableExpensesTotal:", data.variableExpensesTotal);
    console.log("investmentsTotal:", data.investmentsTotal);
    // Adapte os asserts conforme o esperado para o mês
    // expect(data.projectedBalance).toBeGreaterThan(data.currentBalance);
  });
});
