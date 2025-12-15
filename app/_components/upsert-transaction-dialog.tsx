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
  installments: z.number().optional().nullable().transform((val) => val ?? undefined),
  installmentEndDate: z.date().optional().nullable().transform((val) => val ?? undefined),
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
  const [isFixedInstallmentValue, setIsFixedInstallmentValue] = useState(false);
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
        // Garantir que null seja convertido para undefined
        const cleanedValues = {
          ...defaultValues,
          installments: defaultValues.installments ?? undefined,
          installmentEndDate: defaultValues.installmentEndDate ?? undefined,
        };
        form.reset(cleanedValues);
        setIsInstallment(!!cleanedValues.installments);
        setIsFixedInstallmentValue(false); // Reset sempre para false ao abrir
      } else {
        form.reset({
          amount: 0,
          category: TransactionCategory.OTHER,
          date: new Date(),
          name: "",
          paymentMethod: TransactionPaymentMethod.CASH,
          type: TransactionType.EXPENSE,
          installments: undefined,
          installmentEndDate: undefined,
          bankAccountId: null,
          icon: null,
        });
        setIsInstallment(false);
        setIsFixedInstallmentValue(false);
      }
    }
  }, [isOpen, defaultValues, form]);

  const onSubmit = async (data: FormSchema) => {
    console.log("onSubmit chamado com dados:", data);
    setIsSubmitting(true);
    try {
      // Se está em modo valor fixo de parcela, calcular o valor total antes de enviar
      let submitData = { ...data };
      
      if (isInstallment && isFixedInstallmentValue && data.installments) {
        // Modo valor fixo: o usuário digitou o valor da parcela
        // A action divide amount/installments, então precisamos multiplicar aqui
        // para que após a divisão resulte no valor correto da parcela
        submitData.amount = data.amount * data.installments;
      }
      
      console.log("Dados que serão enviados:", submitData);
      
      let result;

      if (isUpdate && transactionId) {
        console.log("Atualizando transação:", transactionId);
        result = await updateTransaction(transactionId, submitData);
      } else {
        console.log("Criando nova transação...");
        result = await createTransaction(submitData);
        console.log("Resultado da criação:", result);
      }

      if (result.success) {
        console.log("✅ Transação salva com sucesso!");
        toast.success(
          result.message ||
            (isUpdate
              ? "Transação atualizada com sucesso!"
              : "Transação criada com sucesso!"),
        );
        form.reset();
        setIsInstallment(false);
        setIsFixedInstallmentValue(false);
        onClose(); // O componente pai vai fazer o refresh
      } else {
        console.error("❌ Erro ao salvar transação:", result.error);
        const errorMessage = result.error || "Erro ao salvar transação";
        
        // Verificar se é erro de saldo insuficiente para destacar melhor
        if (errorMessage.includes("Saldo insuficiente") || errorMessage.includes("saldo")) {
          // Mensagem mais destacada para saldo insuficiente
          toast.error(errorMessage, {
            duration: 6000, // Mostrar por 6 segundos para dar tempo de ler
          });
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("❌ Exceção ao salvar transação:", error);
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
          <form 
            id="transaction-form"
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
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
              render={({ field }) => {
                const installments = form.watch("installments");
                const showTotalValue = isInstallment && !isFixedInstallmentValue;
                const showInstallmentValue = isInstallment && isFixedInstallmentValue;
                
                // Calcular valor total ou valor da parcela conforme o modo
                let displayValue = field.value;
                if (showInstallmentValue && installments) {
                  // Modo valor fixo: mostra o valor total calculado
                  displayValue = field.value * installments;
                }
                
                return (
                  <FormItem>
                    <FormLabel>
                      {showInstallmentValue
                        ? "Valor da Parcela (Fixo)"
                        : showTotalValue
                          ? "Valor Total"
                          : "Valor"}
                    </FormLabel>
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
                    {showInstallmentValue && installments && (
                      <p className="text-muted-foreground text-xs">
                        Total: R$ {(field.value * installments).toFixed(2)} em{" "}
                        {installments}x
                      </p>
                    )}
                    {showTotalValue && installments && (
                      <p className="text-muted-foreground text-xs">
                        Cada parcela: R$ {(field.value / installments).toFixed(2)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Parcelas (só para EXPENSE) */}
            {form.watch("type") === TransactionType.EXPENSE && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInstallment"
                      checked={isInstallment}
                      onChange={(e) => {
                        setIsInstallment(e.target.checked);
                        setIsFixedInstallmentValue(false); // Reset ao desmarcar
                        if (!e.target.checked) {
                          form.setValue("installments", undefined);
                          form.setValue("installmentEndDate", undefined);
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

                  {/* Opção de valor fixo de parcela */}
                  {isInstallment && (
                    <div className="ml-6 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isFixedInstallmentValue"
                        checked={isFixedInstallmentValue}
                        onChange={(e) => {
                          setIsFixedInstallmentValue(e.target.checked);
                          // Recalcular valor se necessário
                          const currentAmount = form.getValues("amount");
                          const installments = form.getValues("installments");
                          
                          if (e.target.checked && installments) {
                            // Mudando para valor fixo: divide o valor total pelo número de parcelas
                            form.setValue("amount", currentAmount / installments);
                          } else if (!e.target.checked && installments) {
                            // Mudando para valor total: multiplica pelo número de parcelas
                            form.setValue("amount", currentAmount * installments);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="isFixedInstallmentValue"
                        className="text-xs text-muted-foreground"
                      >
                        Valor fixo de parcela (mesmo valor todo mês)
                      </label>
                    </div>
                  )}
                </div>

                {isInstallment && (
                  <>
                    <FormField
                      control={form.control}
                      name="installments"
                      render={({ field }) => {
                        const currentAmount = form.getValues("amount");
                        const numInstallments = field.value || 1;
                        
                        // Calcular valor da parcela conforme o modo
                        const installmentValue = isFixedInstallmentValue
                          ? currentAmount // Valor fixo: usa o valor digitado diretamente
                          : currentAmount / numInstallments; // Valor total: divide pelo número de parcelas
                        
                        return (
                          <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => {
                                  const newNumInstallments = parseInt(value);
                                  
                                  // Se está em modo valor fixo, mantém o valor da parcela
                                  // Se está em modo valor total, recalcula o valor total
                                  if (!isFixedInstallmentValue && field.value) {
                                    // Ajustar valor total proporcionalmente
                                    const oldInstallmentValue = currentAmount / field.value;
                                    form.setValue(
                                      "amount",
                                      oldInstallmentValue * newNumInstallments
                                    );
                                  }
                                  
                                  field.onChange(newNumInstallments);
                                }}
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
                                      {num}x
                                      {isFixedInstallmentValue
                                        ? ` de R$ ${currentAmount.toFixed(2)}`
                                        : ` de R$ ${(currentAmount / num).toFixed(2)}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                            {!isFixedInstallmentValue && (
                              <p className="text-muted-foreground text-xs">
                                Valor da parcela: R${" "}
                                {installmentValue.toFixed(2)}
                              </p>
                            )}
                          </FormItem>
                        );
                      }}
                    />

                    {/* Data de Início das Parcelas - usando o campo date principal */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>📅 Data de Início das Parcelas</FormLabel>
                          <FormControl>
                            <DatePickerForm
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-muted-foreground text-xs">
                            {field.value && form.watch("installments") && (
                              <>
                                {form.watch("installments")} parcelas mensais a partir de{" "}
                                {new Date(field.value).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </>
                            )}
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    {/* Campo oculto para manter compatibilidade com a action (será calculado) */}
                    <FormField
                      control={form.control}
                      name="installmentEndDate"
                      render={({ field }) => {
                        // Calcular data de término automaticamente baseado na data de início e número de parcelas
                        const installments = form.watch("installments");
                        const startDate = form.watch("date");
                        
                        if (startDate && installments) {
                          const endDate = new Date(startDate);
                          endDate.setMonth(endDate.getMonth() + installments - 1);
                          
                          // Atualizar o valor se necessário
                          if (!field.value || new Date(field.value).getTime() !== endDate.getTime()) {
                            setTimeout(() => field.onChange(endDate), 0);
                          }
                        }
                        
                        return <input type="hidden" {...field} />;
                      }}
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
                  {field.value === TransactionPaymentMethod.BENEFIT && (
                    <p className="text-muted-foreground text-xs">
                      💡 O valor será descontado automaticamente do seu benefício
                      correspondente à categoria desta transação
                    </p>
                  )}
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

            {/* Data - só mostrar se não for parcela */}
            {!isInstallment && (
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
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
            )}

            <DialogFooter className="gap-2" style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={async (e) => {
                  console.log("=== INÍCIO DO CLIQUE ===");
                  console.log("Event:", e);
                  console.log("isSubmitting:", isSubmitting);
                  console.log("isUpdate:", isUpdate);
                  console.log("transactionId:", transactionId);
                  
                  if (isSubmitting) {
                    console.log("Já está submetendo, ignorando");
                    e.preventDefault();
                    return;
                  }
                  
                  try {
                    console.log("Iniciando validação...");
                    // Validar formulário
                    const isValid = await form.trigger();
                    console.log("Validação concluída. Válido?", isValid);
                    console.log("Erros do formulário:", JSON.stringify(form.formState.errors, null, 2));
                    
                    if (!isValid) {
                      console.log("Formulário inválido, mostrando erro");
                      toast.error("Por favor, corrija os erros no formulário");
                      e.preventDefault();
                      return;
                    }
                    
                    // Obter dados
                    console.log("Obtendo dados do formulário...");
                    const formData = form.getValues();
                    
                    // Garantir que installments seja undefined em vez de null
                    if (formData.installments === null) {
                      formData.installments = undefined;
                    }
                    if (formData.installmentEndDate === null) {
                      formData.installmentEndDate = undefined;
                    }
                    
                    console.log("Dados obtidos (após limpeza):", JSON.stringify(formData, null, 2));
                    
                    // Prevenir comportamento padrão antes de submeter
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Chamar onSubmit diretamente
                    console.log("Chamando onSubmit...");
                    await onSubmit(formData);
                    console.log("onSubmit concluído");
                  } catch (error) {
                    console.error("ERRO NO CLIQUE DO BOTÃO:", error);
                    toast.error("Erro ao processar formulário: " + (error instanceof Error ? error.message : String(error)));
                  }
                }}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
                style={{ 
                  pointerEvents: isSubmitting ? 'none' : 'auto',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  zIndex: 1000
                }}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUpdate ? "Atualizar" : "Criar"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
