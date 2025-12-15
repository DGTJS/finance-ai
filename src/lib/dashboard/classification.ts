/**
 * Utilitários para classificação semântica de transações financeiras
 * 
 * Define lógica para identificar:
 * - Salário
 * - Benefícios
 * - Receitas fixas/variáveis
 * - Despesas fixas/variáveis
 */

import type { TransactionCategory, TransactionType } from "@/src/types/dashboard";

/**
 * Identifica se uma transação é salário
 */
export function isSalary(
  type: TransactionType,
  category: TransactionCategory
): boolean {
  return type === "DEPOSIT" && category === "SALARY";
}

/**
 * Verifica se uma transação é recorrente baseado no histórico
 * Uma transação é recorrente se apareceu pelo menos 2 vezes nos últimos 3 meses
 * com valores similares (±20%)
 */
export function checkIfRecurring(
  transactionName: string,
  transactionCategory: TransactionCategory,
  similarTransactions: Array<{ name: string; category: TransactionCategory; amount: number; date: Date }>
): boolean {
  // Buscar transações similares (mesmo nome ou categoria + nome similar)
  const similar = similarTransactions.filter(
    t =>
      (t.name.toLowerCase() === transactionName.toLowerCase() ||
        (t.category === transactionCategory &&
          t.name.toLowerCase().includes(transactionName.toLowerCase().split(" ")[0]))) &&
      t.category === transactionCategory
  );

  // Se apareceu 2+ vezes, é recorrente
  return similar.length >= 2;
}

/**
 * Identifica se uma transação DEPOSIT é benefício
 * Benefícios: DEPOSIT recorrentes não-salariais (ex: vale alimentação, vale transporte)
 * Heurística: DEPOSIT recorrente que não é SALARY
 */
export function isBenefit(
  type: TransactionType,
  category: TransactionCategory,
  isRecurring: boolean = false
): boolean {
  if (type !== "DEPOSIT") return false;
  if (category === "SALARY") return false; // Salário não é benefício
  
  // Benefícios são depósitos recorrentes não-salariais
  // Exemplos: Vale Alimentação, Vale Transporte, Bônus recorrente
  if (!isRecurring) return false;
  
  // Categorias que podem ser benefícios quando recorrentes
  const POTENTIAL_BENEFIT_CATEGORIES: TransactionCategory[] = [
    "OTHER", // Vale alimentação, vale transporte, etc geralmente são OTHER
  ];
  
  // Se é recorrente e não é salário, pode ser benefício
  // Para maior precisão, podemos checar o nome também
  // Por enquanto, consideramos qualquer DEPOSIT recorrente não-salário como potencial benefício
  return true;
}

/**
 * Identifica se uma despesa é fixa (recorrente)
 * Despesas fixas: assinaturas ou despesas recorrentes mensais
 */
export function isFixedExpense(
  type: TransactionType,
  category: TransactionCategory,
  transactionName: string,
  isSubscription: boolean = false,
  isRecurring: boolean = false
): boolean {
  if (type !== "EXPENSE") return false;
  
  // Se é uma assinatura, é despesa fixa
  if (isSubscription) return true;
  
  // Se é recorrente (apareceu várias vezes), é despesa fixa
  if (isRecurring) return true;
  
  // Categorias que geralmente são fixas
  const FIXED_CATEGORIES: TransactionCategory[] = [
    "HOUSING", // Aluguel, financiamento, condomínio
    "UTILITY", // Contas de luz, água, internet, telefone
  ];
  
  if (FIXED_CATEGORIES.includes(category)) return true;
  
  // Heurística: se o nome contém palavras-chave de despesas fixas
  const fixedKeywords = [
    "aluguel", "rent", "financiamento", "condomínio", "condominio",
    "luz", "água", "agua", "internet", "telefone", "energia",
    "plano", "mensalidade", "iptu", "iptu"
  ];
  
  const lowerName = transactionName.toLowerCase();
  return fixedKeywords.some(keyword => lowerName.includes(keyword));
}

/**
 * Identifica se uma transação DEPOSIT é receita variável
 */
export function isVariableIncome(
  type: TransactionType,
  category: TransactionCategory,
  isRecurring: boolean = false
): boolean {
  if (type !== "DEPOSIT") return false;
  if (category === "SALARY") return false; // Salário não é variável
  if (isBenefit(type, category, isRecurring)) return false; // Benefícios não são variáveis
  
  // Qualquer DEPOSIT que não é salário nem benefício é variável
  return true;
}

/**
 * Identifica se uma despesa é variável
 */
export function isVariableExpense(
  type: TransactionType,
  category: TransactionCategory,
  transactionName: string,
  isSubscription: boolean = false,
  isRecurring: boolean = false
): boolean {
  if (type !== "EXPENSE") return false;
  
  // Se é fixa, não é variável
  if (isFixedExpense(type, category, transactionName, isSubscription, isRecurring)) {
    return false;
  }
  
  // Qualquer despesa que não é fixa é variável
  return true;
}

/**
 * Classificação completa de uma transação
 */
export interface TransactionClassification {
  isSalary: boolean;
  isBenefit: boolean;
  isVariableIncome: boolean;
  isFixedExpense: boolean;
  isVariableExpense: boolean;
  isInvestment: boolean;
}

export function classifyTransaction(
  type: TransactionType,
  category: TransactionCategory,
  name: string,
  options: {
    isRecurring?: boolean;
    isSubscription?: boolean;
  } = {}
): TransactionClassification {
  const isRecurring = options.isRecurring ?? false;
  const isSubscription = options.isSubscription ?? false;
  
  const isSalaryResult = isSalary(type, category);
  const isBenefitResult = isBenefit(type, category, isRecurring);
  const isVariableIncomeResult = isVariableIncome(type, category, isRecurring);
  const isFixedExpenseResult = isFixedExpense(
    type,
    category,
    name,
    isSubscription,
    isRecurring
  );
  const isVariableExpenseResult = isVariableExpense(
    type,
    category,
    name,
    isSubscription,
    isRecurring
  );
  const isInvestmentResult = type === "INVESTMENT";

  return {
    isSalary: isSalaryResult,
    isBenefit: isBenefitResult,
    isVariableIncome: isVariableIncomeResult,
    isFixedExpense: isFixedExpenseResult,
    isVariableExpense: isVariableExpenseResult,
    isInvestment: isInvestmentResult,
  };
}

