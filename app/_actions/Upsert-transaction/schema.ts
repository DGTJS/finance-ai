import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@/app/generated/prisma/client";
import { z } from "zod";

export const addTransactionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  amount: z.number().positive().min(1),
  type: z.enum(
    Object.values(TransactionType) as unknown as [string, ...string[]],
  ),
  date: z.date(),
  category: z.enum(
    Object.values(TransactionCategory) as unknown as [string, ...string[]],
  ),
  paymentMethod: z.enum(
    Object.values(TransactionPaymentMethod) as unknown as [string, ...string[]],
  ),
  bankAccountId: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});
