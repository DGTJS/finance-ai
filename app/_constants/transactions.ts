import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@/app/generated/prisma/client";
import {
  FaGraduationCap,
  FaFilm,
  FaUtensils,
  FaHeartbeat,
  FaHome,
  FaBox,
  FaWallet,
  FaCar,
  FaBolt,
} from "react-icons/fa";
import { IconType } from "react-icons";

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

// Ícones elegantes para cada categoria
export const TRANSACTION_CATEGORY_ICONS: Record<
  TransactionCategory,
  IconType
> = {
  EDUCATION: FaGraduationCap,
  ENTERTAINMENT: FaFilm,
  FOOD: FaUtensils,
  HEALTH: FaHeartbeat,
  HOUSING: FaHome,
  OTHER: FaBox,
  SALARY: FaWallet,
  TRANSPORTATION: FaCar,
  UTILITY: FaBolt,
};

// Emojis padrão para cada categoria (para uso em strings/emojis)
export const TRANSACTION_CATEGORY_EMOJIS: Record<TransactionCategory, string> = {
  EDUCATION: "🎓",
  ENTERTAINMENT: "🎬",
  FOOD: "🍔",
  HEALTH: "❤️",
  HOUSING: "🏠",
  OTHER: "📦",
  SALARY: "💼",
  TRANSPORTATION: "🚗",
  UTILITY: "⚡",
};

// Função helper para obter o ícone de uma categoria
// Retorna o ícone personalizado se existir, senão retorna o emoji padrão
export function getCategoryIcon(
  category: TransactionCategory,
  customIcons?: Record<string, string> | null
): string {
  if (customIcons && customIcons[category]) {
    return customIcons[category];
  }
  return TRANSACTION_CATEGORY_EMOJIS[category];
}

// Cores vibrantes e elegantes para cada categoria
export const TRANSACTION_CATEGORY_COLORS: Record<TransactionCategory, string> =
  {
    EDUCATION: "#8B5CF6", // Roxo vibrante
    ENTERTAINMENT: "#EC4899", // Rosa
    FOOD: "#F59E0B", // Laranja
    HEALTH: "#EF4444", // Vermelho
    HOUSING: "#3B82F6", // Azul
    OTHER: "#6B7280", // Cinza
    SALARY: "#10B981", // Verde
    TRANSPORTATION: "#14B8A6", // Turquesa
    UTILITY: "#F97316", // Laranja escuro
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
    label: "Pix",
    value: TransactionPaymentMethod.PIX,
  },
  {
    label: "Benefício",
    value: TransactionPaymentMethod.BENEFIT,
  },
  {
    label: "Outros",
    value: TransactionPaymentMethod.OTHER,
  },
];
