import { TransactionCategory } from "@/app/generated/prisma/client";

// Mapeamento de emojis para cada categoria
export const CATEGORY_EMOJIS: Record<TransactionCategory, string> = {
  EDUCATION: "🎓",
  ENTERTAINMENT: "🎬",
  FOOD: "🍔",
  HEALTH: "🏥",
  HOUSING: "🏠",
  OTHER: "🛒",
  SALARY: "💰",
  TRANSPORTATION: "🚗",
  UTILITY: "⚡",
};





