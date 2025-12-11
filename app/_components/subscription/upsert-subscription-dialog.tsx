"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { DatePickerForm } from "../date-pick";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createSubscription,
  updateSubscription,
} from "@/app/_actions/subscription";
import {
  createSubscriptionSchema,
  type CreateSubscriptionInput,
} from "@/app/_actions/subscription/schema";

interface Subscription {
  id: string;
  name: string;
  logoUrl: string | null;
  amount: number;
  dueDate: Date;
  nextDueDate: Date | null;
  recurring: boolean;
  active: boolean;
}

interface UpsertSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: {
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    recurring: boolean;
    nextDueDate: Date | null;
    active: boolean;
  };
  onSuccess: (subscription?: Subscription) => void;
}

export default function UpsertSubscriptionDialog({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: UpsertSubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!subscription;

  const form = useForm<CreateSubscriptionInput>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date(),
      recurring: true,
      nextDueDate: null,
      active: true,
    },
  });

  // Resetar form quando o dialog abrir/fechar ou a subscription mudar
  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        dueDate: subscription.dueDate,
        recurring: subscription.recurring,
        nextDueDate: subscription.nextDueDate,
        active: subscription.active,
      });
    } else {
      form.reset({
        name: "",
        amount: 0,
        dueDate: new Date(),
        recurring: true,
        nextDueDate: null,
        active: true,
      });
    }
  }, [subscription, form]);

  const onSubmit = async (data: CreateSubscriptionInput) => {
    setIsLoading(true);

    try {
      let result;

      if (isEditing) {
        result = await updateSubscription({
          id: subscription.id,
          ...data,
        });
      } else {
        result = await createSubscription(data);
      }

      if (result.success && result.data) {
        toast.success(
          isEditing
            ? "Assinatura atualizada com sucesso!"
            : "Assinatura criada com sucesso!",
        );
        // Passar a assinatura criada/atualizada para o callback
        // Garantir que as datas são objetos Date
        const subscription: Subscription = {
          ...result.data,
          dueDate: new Date(result.data.dueDate),
          nextDueDate: result.data.nextDueDate ? new Date(result.data.nextDueDate) : null,
        };
        onSuccess(subscription);
        onClose();
        form.reset();
      } else {
        toast.error(result.error || "Erro ao salvar assinatura");
      }
    } catch {
      toast.error("Erro ao salvar assinatura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Assinatura" : "Nova Assinatura"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da sua assinatura."
              : "Adicione uma nova assinatura para acompanhar seus gastos recorrentes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Assinatura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Netflix, Spotify, etc."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    O logo será detectado automaticamente
                  </FormDescription>
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
                  <FormLabel>Valor Mensal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Vencimento */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <DatePickerForm value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recorrente */}
            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-0">
                    <FormLabel>Assinatura Recorrente</FormLabel>
                    <FormDescription>
                      Se marcado, a próxima data será calculada automaticamente
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ativa */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-0">
                    <FormLabel>Assinatura Ativa</FormLabel>
                    <FormDescription>
                      Desmarque se cancelou a assinatura
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

