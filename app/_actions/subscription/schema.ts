import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .trim(),
  amount: z
    .number({ required_error: "Valor é obrigatório" })
    .positive("Valor deve ser positivo")
    .max(999999, "Valor muito alto"),
  dueDate: z.coerce.date({
    required_error: "Data de vencimento é obrigatória",
  }),
  recurring: z.boolean().default(true),
  nextDueDate: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
  logoUrl: z.string().optional().nullable(),
});

export const updateSubscriptionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(100).trim().optional(),
  amount: z.number().positive().max(999999).optional(),
  dueDate: z.coerce.date().optional(),
  recurring: z.boolean().optional(),
  nextDueDate: z.coerce.date().optional().nullable(),
  active: z.boolean().optional(),
  logoUrl: z.string().optional().nullable(),
});

export const deleteSubscriptionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type DeleteSubscriptionInput = z.infer<typeof deleteSubscriptionSchema>;

