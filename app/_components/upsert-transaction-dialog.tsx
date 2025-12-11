"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MoneyInput } from "@/app/_components/money-input";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "../_constants/transactions";
import { DatePickerForm } from "./date-pick";
import {
  TransactionPaymentMethod,
  TransactionType,
  TransactionCategory,
} from "../generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTransaction, updateTransaction } from "../_actions/transaction";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { getBankAccounts } from "../_actions/bank-account";
import { BankAccount } from "../generated/prisma/client";
import { EmojiPicker } from "./emoji-picker";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório" }),
  amount: z.number().positive({ message: "O valor deve ser positivo" }),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod),
  date: z.date(),
  installments: z.number().optional(),
  installmentEndDate: z.date().optional(),
  bankAccountId: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

type FormSchema = z.infer<typeof formSchema>;

interface UpsertTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  defaultValues?: FormSchema;
}

const UpsertTransactionDialog = ({
  isOpen,
  onClose,
  transactionId,
  defaultValues,
}: UpsertTransactionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const isUpdate = Boolean(transactionId);

  // Buscar contas bancárias quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      getBankAccounts().then((result) => {
        if (result.success && result.data) {
          setBankAccounts(result.data);
        }
      });
    }
  }, [isOpen]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      amount: 0,
      category: TransactionCategory.OTHER,
      date: new Date(),
      name: "",
      paymentMethod: TransactionPaymentMethod.CASH,
      type: TransactionType.EXPENSE,
      installments: undefined,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        form.reset(defaultValues);
      } else {
      form.reset({
        amount: 0,
        category: TransactionCategory.OTHER,
        date: new Date(),
        name: "",
        paymentMethod: TransactionPaymentMethod.CASH,
        type: TransactionType.EXPENSE,
        bankAccountId: null,
        icon: null,
      });
      }
    }
  }, [isOpen, defaultValues, form]);

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    try {
      let result;

      if (isUpdate && transactionId) {
        result = await updateTransaction(transactionId, data);
      } else {
        result = await createTransaction(data);
      }

      if (result.success) {
        toast.success(
          result.message ||
            (isUpdate
              ? "Transação atualizada com sucesso!"
              : "Transação criada com sucesso!"),
        );
        form.reset();
        onClose(); // O componente pai vai fazer o refresh
      } else {
        toast.error(result.error || "Erro ao salvar transação");
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast.error("Erro inesperado ao salvar transação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Atualize as informações da transação."
              : "Adicione uma nova transação ao sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Ícone/Emoji */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone/Emoji (Opcional)</FormLabel>
                  <FormControl>
                    <EmojiPicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Ex: 🏠, 💰, ✈️"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Salário, Supermercado, etc."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        const numValue = parseFloat(value) || 0;
                        field.onChange(numValue);
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parcelas (só para EXPENSE) */}
            {form.watch("type") === TransactionType.EXPENSE && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isInstallment"
                    checked={isInstallment}
                    onChange={(e) => {
                      setIsInstallment(e.target.checked);
                      if (!e.target.checked) {
                        form.setValue("installments", undefined);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="isInstallment"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    💳 Parcelar compra
                  </label>
                </div>

                {isInstallment && (
                  <>
                    <FormField
                      control={form.control}
                      name="installments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Parcelas</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString()}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione as parcelas" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  { length: 24 },
                                  (_, i) => i + 2,
                                ).map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}x de R${" "}
                                    {(form.getValues("amount") / num).toFixed(
                                      2,
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                          <p className="text-muted-foreground text-xs">
                            Valor da parcela: R${" "}
                            {(
                              form.getValues("amount") / (field.value || 1)
                            ).toFixed(2)}
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="installmentEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>📅 Data de Término das Parcelas</FormLabel>
                          <FormControl>
                            <DatePickerForm
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-muted-foreground text-xs">
                            {field.value && form.watch("date") && (
                              <>
                                As parcelas serão distribuídas mensalmente entre{" "}
                                {new Date(
                                  form.watch("date"),
                                ).toLocaleDateString("pt-BR", {
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                e{" "}
                                {new Date(field.value).toLocaleDateString(
                                  "pt-BR",
                                  { month: "short", year: "numeric" },
                                )}
                              </>
                            )}
                          </p>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Método de Pagamento */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conta/Cartão Vinculado */}
            {(form.watch("paymentMethod") === TransactionPaymentMethod.CREDIT_CARD ||
              form.watch("paymentMethod") === TransactionPaymentMethod.DEBIT_CARD ||
              form.watch("paymentMethod") === TransactionPaymentMethod.BANK_TRANSFER) &&
              bankAccounts.length > 0 && (
                <FormField
                  control={form.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Conta/Cartão
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        value={field.value || "none"}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a conta/cartão (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma conta específica</SelectItem>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <span>{account.icon || "🏦"}</span>
                                <span>{account.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  ({account.bankName})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-muted-foreground text-xs">
                        Vincule esta transação a uma conta ou cartão específico
                      </p>
                    </FormItem>
                  )}
                />
              )}

            {/* Data */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePickerForm
                      value={field.value}
                      onChange={(date) => field.onChange(date || new Date())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUpdate ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
