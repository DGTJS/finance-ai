/**
 * CategoryPieCard - Card com gráfico de pizza de gastos por categoria
 * Usa o mesmo componente ExpensesPieChart da dashboard anterior
 *
 * Props:
 * - categories: Array de dados de categorias com emoji e cor
 * - onCategoryClick: Callback quando clica em um segmento
 */

"use client";

import ExpensesPieChart from "@/app/_components/expenses-pie-chart";
import type { CategoryData } from "@/src/types/dashboard";
import { TransactionCategory } from "@/app/generated/prisma/client";

interface CategoryPieCardProps {
  categories: CategoryData[];
  onCategoryClick?: (category: CategoryData) => void;
}

export function CategoryPieCard({
  categories,
  onCategoryClick,
}: CategoryPieCardProps) {
  // Converter dados da API para o formato esperado pelo ExpensesPieChart
  const expensesData = categories.map((cat) => ({
    category: cat.key as TransactionCategory,
    total: cat.value,
    percentage: 0, // Será calculado pelo componente
  }));

  // Calcular percentuais
  const total = categories.reduce((sum, cat) => sum + cat.value, 0);
  const expensesWithPercentage = expensesData.map((exp) => ({
    ...exp,
    percentage: total > 0 ? (exp.total / total) * 100 : 0,
  }));

  return <ExpensesPieChart expenses={expensesWithPercentage} />;
}
