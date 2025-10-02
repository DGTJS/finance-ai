import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "../generated/prisma";

export const TRANSACTION_CATEGORY_LABELS = {
  EDUCATION: "Educação",
  ENTERTAINMENT: "Entretenimento",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  HOUSING: "Moradia",
  OTHER: "Outros",
  SALARY: "Salário",
  TRANSPORTATION: "Transporte",
  UTILITY: "Utilidades",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: "Transferência Bancária",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  OTHER: "Outros",
  PIX: "Pix",
};

export const TRANSACTION_TYPE_OPTIONS = [
  {
    label: "Depósito",
    value: TransactionType.DEPOSIT,
  },
  {
    label: "Despesa",
    value: TransactionType.EXPENSE,
  },
  {
    label: "Investimento",
    value: TransactionType.INVESTMENT,
  },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  {
    label: "Educação",
    value: TransactionCategory.EDUCATION,
  },
  {
    label: "Entretenimento",
    value: TransactionCategory.ENTERTAINMENT,
  },
  {
    label: "Alimentação",
    value: TransactionCategory.FOOD,
  },
  {
    label: "Saúde",
    value: TransactionCategory.HEALTH,
  },
  {
    label: "Moradia",
    value: TransactionCategory.HOUSING,
  },
  {
    label: "Outros",
    value: TransactionCategory.OTHER,
  },
  {
    label: "Salário",
    value: TransactionCategory.SALARY,
  },
  {
    label: "Transporte",
    value: TransactionCategory.TRANSPORTATION,
  },
  {
    label: "Utilidades",
    value: TransactionCategory.UTILITY,
  },
];

export const TRANSACTION_PAYMENT_METHOD_OPTIONS = [
  {
    label: "Transferência Bancária",
    value: TransactionPaymentMethod.BANK_TRANSFER,
  },
  {
    label: "Boleto Bancário",
    value: TransactionPaymentMethod.BANK_SLIP,
  },
  {
    label: "Dinheiro",
    value: TransactionPaymentMethod.CASH,
  },

  {
    label: "Cartão de Crédito",
    value: TransactionPaymentMethod.CREDIT_CARD,
  },
  {
    label: "Cartão de Débito",
    value: TransactionPaymentMethod.DEBIT_CARD,
  },

  {
    label: "Outros",
    value: TransactionPaymentMethod.OTHER,
  },
  {
    label: "Pix",
    value: TransactionPaymentMethod.PIX,
  },
];
