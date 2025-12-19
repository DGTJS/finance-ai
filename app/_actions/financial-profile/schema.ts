import { z } from "zod";

// Schema para benefício
export const benefitSchema = z.object({
  type: z.enum(["VA", "VR", "VT", "OUTRO"]),
  value: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  notes: z.string().optional(),
  category: z.string().optional(),
});

// Schema para múltiplos pagamentos
export const paymentSchema = z.object({
  label: z.string().min(1, "Label é obrigatório"),
  day: z.number().int().min(1).max(31, "Dia deve estar entre 1 e 31"),
  value: z.number().min(0, "Valor deve ser maior ou igual a zero"),
});

// Schema principal do perfil financeiro
export const financialProfileSchema = z.object({
  rendaFixa: z.number().min(0, "Renda fixa deve ser maior ou igual a zero"),
  rendaVariavelMedia: z.number().min(0, "Renda variável deve ser maior ou igual a zero"),
  beneficios: z.array(benefitSchema).default([]),
  diaPagamento: z.number().int().min(1).max(31).nullable().optional(),
  multiplePayments: z.array(paymentSchema).nullable().optional(),
});

export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
export type BenefitInput = z.infer<typeof benefitSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;





