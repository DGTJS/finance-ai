/**
 * Script de teste para criar custos fixos
 * Execute com: npx tsx scripts/test-fixed-cost.ts
 */

import {
  createFixedCost,
  getFixedCosts,
  type FixedCostInput,
} from "../app/_actions/fixed-cost";

async function testCreateUniqueCost() {
  console.log("🧪 Testando criação de custo único...\n");

  const testData: FixedCostInput = {
    name: `Teste Custo Único ${Date.now()}`,
    amount: 1000,
    frequency: "ONCE",
    isFixed: false,
    description: "Teste de custo único",
    isActive: true,
  };

  console.log("📤 Dados a serem enviados:", JSON.stringify(testData, null, 2));

  try {
    const result = await createFixedCost(testData);

    console.log("\n📥 Resultado:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n✅ Custo criado com sucesso!");
      console.log("ID:", result.data?.id);
      console.log("Nome:", result.data?.name);
      console.log("Frequência:", (result.data as any)?.frequency);
      console.log("isFixed:", (result.data as any)?.isFixed);
    } else {
      console.error("\n❌ Erro ao criar custo:", result.error);
    }
  } catch (error: any) {
    console.error("\n❌ Exceção capturada:", error);
    console.error("Stack:", error.stack);
  }
}

async function testCreateFixedCost() {
  console.log("\n🧪 Testando criação de custo fixo...\n");

  const testData: FixedCostInput = {
    name: `Teste Custo Fixo ${Date.now()}`,
    amount: 500,
    frequency: "MONTHLY",
    isFixed: true,
    description: "Teste de custo fixo mensal",
    isActive: true,
  };

  console.log("📤 Dados a serem enviados:", JSON.stringify(testData, null, 2));

  try {
    const result = await createFixedCost(testData);

    console.log("\n📥 Resultado:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n✅ Custo criado com sucesso!");
      console.log("ID:", result.data?.id);
      console.log("Nome:", result.data?.name);
      console.log("Frequência:", (result.data as any)?.frequency);
      console.log("isFixed:", (result.data as any)?.isFixed);
    } else {
      console.error("\n❌ Erro ao criar custo:", result.error);
    }
  } catch (error: any) {
    console.error("\n❌ Exceção capturada:", error);
    console.error("Stack:", error.stack);
  }
}

async function testGetFixedCosts() {
  console.log("\n🧪 Testando busca de custos...\n");

  try {
    const result = await getFixedCosts();

    console.log("\n📥 Resultado:", JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      console.log(`\n✅ Encontrados ${result.data.length} custos:`);
      result.data.forEach((cost: any, index: number) => {
        console.log(`\n${index + 1}. ${cost.name}`);
        console.log(`   ID: ${cost.id}`);
        console.log(`   Valor: R$ ${cost.amount}`);
        console.log(`   Frequência: ${cost.frequency}`);
        console.log(`   isFixed: ${cost.isFixed}`);
        console.log(`   Ativo: ${cost.isActive}`);
      });
    } else {
      console.error("\n❌ Erro ao buscar custos:", result.error);
    }
  } catch (error: any) {
    console.error("\n❌ Exceção capturada:", error);
    console.error("Stack:", error.stack);
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("TESTE DE CUSTOS FIXOS");
  console.log("=".repeat(60));

  await testCreateUniqueCost();
  await testCreateFixedCost();
  await testGetFixedCosts();

  console.log("\n" + "=".repeat(60));
  console.log("TESTES CONCLUÍDOS");
  console.log("=".repeat(60));
}

// Executar testes
runTests().catch(console.error);
