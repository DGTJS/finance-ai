"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Checkbox } from "@/app/_components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { MoneyInput } from "@/app/_components/money-input";
import { DatePickerForm } from "@/app/_components/date-pick";
import { createOrUpdateWorkGoal } from "@/app/_actions/work-goal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const workGoalSchema = z.object({
  goalType: z.enum(["daily", "weekly", "monthly", "custom"]),
  dailyGoal: z.number().positive().optional().nullable(),
  weeklyGoal: z.number().positive().optional().nullable(),
  monthlyGoal: z.number().positive().optional().nullable(),
  customGoal: z.number().positive().optional().nullable(),
  customStartDate: z.date().optional().nullable(),
  customEndDate: z.date().optional().nullable(),
  maxHoursDay: z.number().positive().optional().nullable(),
  workDays: z.array(z.number()).min(1, "Selecione pelo menos um dia"),
});

type WorkGoalFormData = z.infer<typeof workGoalSchema>;

interface WorkGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    goalType?: string;
    dailyGoal?: number | null;
    weeklyGoal?: number | null;
    monthlyGoal?: number | null;
    customGoal?: number | null;
    customStartDate?: Date | null;
    customEndDate?: Date | null;
    maxHoursDay?: number | null;
    workDays: string; // "1,2,3,4,5,6,7"
  } | null;
  onSuccess: () => void;
}

export default function WorkGoalForm({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: WorkGoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determinar tipo de meta inicial baseado nos dados existentes
  const getInitialGoalType = (): "daily" | "weekly" | "monthly" | "custom" => {
    if (initialData?.goalType) {
      return initialData.goalType as "daily" | "weekly" | "monthly" | "custom";
    }
    // Se tem monthlyGoal, assume mensal
    if (initialData?.monthlyGoal) return "monthly";
    // Se tem weeklyGoal, assume semanal
    if (initialData?.weeklyGoal) return "weekly";
    // Se tem dailyGoal, assume diária
    if (initialData?.dailyGoal) return "daily";
    // Se tem customGoal, assume personalizada
    if (initialData?.customGoal) return "custom";
    // Padrão: mensal
    return "monthly";
  };

  const form = useForm<WorkGoalFormData>({
    resolver: zodResolver(workGoalSchema),
    defaultValues: {
      goalType: getInitialGoalType(),
      dailyGoal: initialData?.dailyGoal || null,
      weeklyGoal: initialData?.weeklyGoal || null,
      monthlyGoal: initialData?.monthlyGoal || null,
      customGoal: initialData?.customGoal || null,
      customStartDate: initialData?.customStartDate
        ? new Date(initialData.customStartDate)
        : null,
      customEndDate: initialData?.customEndDate
        ? new Date(initialData.customEndDate)
        : null,
      maxHoursDay: initialData?.maxHoursDay || null,
      workDays: initialData?.workDays
        ? initialData.workDays.split(",").map(Number)
        : [2, 3, 4, 5, 6], // Segunda a sexta por padrão
    },
  });

  const goalType = form.watch("goalType");

  useEffect(() => {
    if (initialData) {
      // Os valores vêm do banco em reais (Float)
      // Precisamos manter em reais para o formulário, mas converter para centavos ao passar para MoneyInput
      form.reset({
        goalType: getInitialGoalType(),
        dailyGoal: initialData.dailyGoal || null,
        weeklyGoal: initialData.weeklyGoal || null,
        monthlyGoal: initialData.monthlyGoal || null,
        customGoal: initialData.customGoal || null,
        customStartDate: initialData.customStartDate
          ? new Date(initialData.customStartDate)
          : null,
        customEndDate: initialData.customEndDate
          ? new Date(initialData.customEndDate)
          : null,
        maxHoursDay: initialData.maxHoursDay || null,
        workDays: initialData.workDays
          ? initialData.workDays.split(",").map(Number)
          : [2, 3, 4, 5, 6],
      });
      console.log("📥 [WORK-GOAL-FORM] Dados carregados:", {
        dailyGoal: initialData.dailyGoal,
        weeklyGoal: initialData.weeklyGoal,
        monthlyGoal: initialData.monthlyGoal,
        customGoal: initialData.customGoal,
      });
    }
  }, [initialData, form]);

  const weekdayOptions = [
    { value: 1, label: "Domingo" },
    { value: 2, label: "Segunda" },
    { value: 3, label: "Terça" },
    { value: 4, label: "Quarta" },
    { value: 5, label: "Quinta" },
    { value: 6, label: "Sexta" },
    { value: 7, label: "Sábado" },
  ];

  const onSubmit = async (data: WorkGoalFormData) => {
    setIsSubmitting(true);
    try {
      // Validar que pelo menos uma meta está preenchida baseada no tipo
      let hasGoal = false;
      if (data.goalType === "daily" && data.dailyGoal) hasGoal = true;
      else if (data.goalType === "weekly" && data.weeklyGoal) hasGoal = true;
      else if (data.goalType === "monthly" && data.monthlyGoal) hasGoal = true;
      else if (data.goalType === "custom" && data.customGoal) {
        hasGoal = true;
        // Validar datas para meta personalizada
        if (!data.customStartDate || !data.customEndDate) {
          toast.error(
            "Selecione a data inicial e final para a meta personalizada",
          );
          setIsSubmitting(false);
          return;
        }
        if (data.customEndDate < data.customStartDate) {
          toast.error("A data final deve ser posterior à data inicial");
          setIsSubmitting(false);
          return;
        }
      }

      if (!hasGoal) {
        toast.error("Preencha o valor da meta selecionada");
        setIsSubmitting(false);
        return;
      }

      // Preparar dados para envio
      const goalData = {
        goalType: data.goalType,
        dailyGoal: data.goalType === "daily" ? data.dailyGoal : null,
        weeklyGoal: data.goalType === "weekly" ? data.weeklyGoal : null,
        monthlyGoal: data.goalType === "monthly" ? data.monthlyGoal : null,
        customGoal: data.goalType === "custom" ? data.customGoal : null,
        customStartDate:
          data.goalType === "custom" ? data.customStartDate : null,
        customEndDate: data.goalType === "custom" ? data.customEndDate : null,
        maxHoursDay: data.maxHoursDay,
        workDays: data.workDays.sort((a, b) => a - b).join(","),
      };

      console.log(
        "📝 [WORK-GOAL-FORM] Enviando dados:",
        JSON.stringify(goalData, null, 2),
      );
      console.log("📝 [WORK-GOAL-FORM] Valores brutos do form:", {
        dailyGoal: data.dailyGoal,
        weeklyGoal: data.weeklyGoal,
        monthlyGoal: data.monthlyGoal,
        customGoal: data.customGoal,
      });

      const result = await createOrUpdateWorkGoal(goalData);

      console.log("Resultado:", result);

      if (result.success) {
        toast.success("Meta salva com sucesso!");
        onSuccess();
        onClose();
      } else {
        console.error("Erro ao salvar:", result.error);
        toast.error(result.error || "Erro ao salvar meta");
      }
    } catch (error) {
      toast.error("Erro ao salvar meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Metas de Trabalho</DialogTitle>
          <DialogDescription>
            Escolha o tipo de meta e defina seus objetivos para o AI Work
            Planner calcular seu plano ideal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de Meta */}
            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Meta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de meta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Meta Diária</SelectItem>
                      <SelectItem value="weekly">Meta Semanal</SelectItem>
                      <SelectItem value="monthly">Meta Mensal</SelectItem>
                      <SelectItem value="custom">Meta Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {goalType === "daily" &&
                      "Defina quanto você quer ganhar por dia"}
                    {goalType === "weekly" &&
                      "Defina quanto você quer ganhar por semana"}
                    {goalType === "monthly" &&
                      "Defina quanto você quer ganhar por mês"}
                    {goalType === "custom" && "Defina uma meta personalizada"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meta Diária */}
            {goalType === "daily" && (
              <FormField
                control={form.control}
                name="dailyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Diária (R$)</FormLabel>
                    <FormControl>
                      <MoneyInput
                        placeholder="0,00"
                        value={
                          field.value !== undefined && field.value !== null
                            ? Math.round(field.value * 100).toString()
                            : ""
                        }
                        onValueChange={(value) => {
                          // MoneyInput retorna centavos (string), converter para reais (number)
                          const centsValue = parseFloat(value) || 0;
                          const reaisValue = centsValue / 100;
                          console.log(
                            `💰 [WORK-GOAL-FORM] Conversão ${field.name}: ${centsValue} centavos = ${reaisValue} reais`,
                          );
                          field.onChange(reaisValue > 0 ? reaisValue : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Meta Semanal */}
            {goalType === "weekly" && (
              <FormField
                control={form.control}
                name="weeklyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Semanal (R$)</FormLabel>
                    <FormControl>
                      <MoneyInput
                        placeholder="0,00"
                        value={
                          field.value !== undefined && field.value !== null
                            ? Math.round(field.value * 100).toString()
                            : ""
                        }
                        onValueChange={(value) => {
                          // MoneyInput retorna centavos (string), converter para reais (number)
                          const centsValue = parseFloat(value) || 0;
                          const reaisValue = centsValue / 100;
                          console.log(
                            `💰 [WORK-GOAL-FORM] Conversão ${field.name}: ${centsValue} centavos = ${reaisValue} reais`,
                          );
                          field.onChange(reaisValue > 0 ? reaisValue : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Meta Mensal */}
            {goalType === "monthly" && (
              <FormField
                control={form.control}
                name="monthlyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Mensal (R$)</FormLabel>
                    <FormControl>
                      <MoneyInput
                        placeholder="0,00"
                        value={
                          field.value !== undefined && field.value !== null
                            ? Math.round(field.value * 100).toString()
                            : ""
                        }
                        onValueChange={(value) => {
                          // MoneyInput retorna centavos (string), converter para reais (number)
                          const centsValue = parseFloat(value) || 0;
                          const reaisValue = centsValue / 100;
                          console.log(
                            `💰 [WORK-GOAL-FORM] Conversão ${field.name}: ${centsValue} centavos = ${reaisValue} reais`,
                          );
                          field.onChange(reaisValue > 0 ? reaisValue : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Meta Personalizada */}
            {goalType === "custom" && (
              <>
                <FormField
                  control={form.control}
                  name="customGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Personalizada (R$)</FormLabel>
                      <FormControl>
                        <MoneyInput
                          placeholder="0,00"
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) =>
                            field.onChange(value ? parseFloat(value) : null)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Defina uma meta personalizada para um período específico
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data Inicial */}
                <FormField
                  control={form.control}
                  name="customStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Inicial</FormLabel>
                      <FormControl>
                        <DatePickerForm
                          value={field.value || undefined}
                          onChange={(date) => field.onChange(date || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data Final */}
                <FormField
                  control={form.control}
                  name="customEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Final</FormLabel>
                      <FormControl>
                        <DatePickerForm
                          value={field.value || undefined}
                          onChange={(date) => field.onChange(date || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Horas Máximas por Dia */}
            <FormField
              control={form.control}
              name="maxHoursDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horas Máximas por Dia - Opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Ex: 8"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Limite máximo de horas que você pode trabalhar por dia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dias Disponíveis */}
            <FormField
              control={form.control}
              name="workDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Disponíveis para Trabalhar</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {weekdayOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`day-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, option.value]);
                            } else {
                              field.onChange(
                                current.filter((d) => d !== option.value),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`day-${option.value}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Meta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
