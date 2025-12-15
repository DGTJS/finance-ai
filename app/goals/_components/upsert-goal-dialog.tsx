"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { MoneyInput } from "@/app/_components/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { DatePickerForm } from "@/app/_components/date-pick";
import { EmojiPicker } from "@/app/_components/emoji-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createGoal, updateGoal } from "@/app/_actions/goal";
import { GoalCategory, GoalStatus } from "@/app/generated/prisma/client";
import { getFamilyAccount } from "@/app/_actions/family-account";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { X, UserPlus } from "lucide-react";

const goalFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  currentAmount: z
    .number()
    .min(0, "Valor atual não pode ser negativo")
    .default(0),
  deadline: z.date({ required_error: "Data limite é obrigatória" }),
  category: z.nativeEnum(GoalCategory, {
    required_error: "Categoria é obrigatória",
  }),
  status: z.nativeEnum(GoalStatus).optional().default(GoalStatus.ACTIVE),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isShared: z.boolean().default(false),
  sharedWith: z.array(z.string()).default([]),
});

type GoalFormInput = z.infer<typeof goalFormSchema>;

interface UpsertGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: {
    id: string;
    name: string;
    description: string | null;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    category: string;
    status: string;
    icon: string | null;
    color: string | null;
    isShared?: boolean;
    sharedWith?: string[] | null;
  };
  onSuccess: () => void;
}

const GOAL_CATEGORY_OPTIONS = [
  { value: "SAVINGS", label: "Poupança" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "EMERGENCY", label: "Reserva de Emergência" },
  { value: "VACATION", label: "Viagem/Férias" },
  { value: "HOUSE", label: "Casa/Imóvel" },
  { value: "VEHICLE", label: "Veículo" },
  { value: "EDUCATION", label: "Educação" },
  { value: "WEDDING", label: "Casamento" },
  { value: "OTHER", label: "Outro" },
];

const GOAL_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "PAUSED", label: "Pausada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export default function UpsertGoalDialog({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: UpsertGoalDialogProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<Array<{ id: string; name: string | null; email: string; image: string | null }>>([]);
  const isEditing = !!goal;

  const form = useForm<GoalFormInput>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(),
      category: GoalCategory.OTHER,
      status: GoalStatus.ACTIVE,
      icon: "",
      color: "",
      isShared: false,
      sharedWith: [],
    },
    mode: "onChange",
  });

  // Buscar membros da família quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      getFamilyAccount().then((result) => {
        if (result.success && result.data?.users) {
          setFamilyMembers(result.data.users);
        }
      });
    }
  }, [isOpen]);

  // Resetar form quando o dialog abrir/fechar ou a goal mudar
  useEffect(() => {
    if (isOpen) {
      if (goal) {
        form.reset({
          name: goal.name,
          description: goal.description || "",
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: new Date(goal.deadline),
          category: goal.category as GoalCategory,
          status: goal.status as GoalStatus,
          icon: goal.icon || "",
          color: goal.color || "",
          isShared: goal.isShared || false,
          sharedWith: Array.isArray(goal.sharedWith) ? goal.sharedWith : [],
        });
      } else {
        form.reset({
          name: "",
          description: "",
          targetAmount: 0,
          currentAmount: 0,
          deadline: new Date(),
          category: GoalCategory.OTHER,
          status: GoalStatus.ACTIVE,
          icon: "",
          color: "",
        });
      }
    }
  }, [goal, form, isOpen]);

  const onSubmit = async (data: GoalFormInput) => {
    setIsLoading(true);

    try {
      let result;

      if (isEditing) {
        result = await updateGoal(goal.id, data);
      } else {
        result = await createGoal(data);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Meta atualizada com sucesso!"
            : "Meta criada com sucesso!",
        );
        form.reset();
        onClose();
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar meta");
      }
    } catch (error) {
      toast.error("Erro ao salvar meta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Meta" : "Nova Meta"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da sua meta."
              : "Adicione uma nova meta financeira para acompanhar seu progresso."}
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
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reserva de Emergência" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua meta..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor Alvo */}
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Alvo</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => {
                        // O NumericFormat retorna o valor numérico como string (ex: "1234.56")
                        const numericValue = parseFloat(value) || 0;
                        field.onChange(numericValue);
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor Atual */}
            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Atual</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => {
                        // O NumericFormat retorna o valor numérico como string (ex: "1234.56")
                        const numericValue = parseFloat(value) || 0;
                        field.onChange(numericValue);
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormDescription>
                    Quanto você já conseguiu juntar para esta meta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Limite */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Limite</FormLabel>
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

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value as GoalCategory)
                    }
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOAL_CATEGORY_OPTIONS.map((option) => (
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value as GoalStatus)
                    }
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOAL_STATUS_OPTIONS.map((option) => (
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

            {/* Meta Conjunta */}
            {familyMembers.length > 0 && (
              <>
                <FormField
                  control={form.control}
                  name="isShared"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Meta Conjunta</FormLabel>
                        <FormDescription>
                          {isEditing 
                            ? "Esta é uma meta compartilhada. Todos os participantes podem contribuir e ver o histórico de contribuições."
                            : "Marque esta opção para criar uma meta compartilhada com outros membros da família. Todos poderão contribuir e ver o histórico de contribuições."}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("isShared") && (
                  <FormField
                    control={form.control}
                    name="sharedWith"
                    render={({ field }) => {
                      const selectedIds = field.value || [];
                      // Filtrar: remover usuário atual e membros já selecionados
                      const availableMembers = familyMembers.filter(
                        (m) => m.id !== currentUserId && !selectedIds.includes(m.id)
                      );

                      return (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Participantes</FormLabel>
                            <FormDescription>
                              Selecione os membros da família que participarão desta meta.
                            </FormDescription>
                          </div>

                          {/* Select para adicionar usuários */}
                          {availableMembers.length > 0 && (
                            <div className="mb-4">
                              <Select
                                onValueChange={(value) => {
                                  if (value && !selectedIds.includes(value)) {
                                    field.onChange([...selectedIds, value]);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="Selecione um membro para adicionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name || member.email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Cards dos usuários selecionados */}
                          {selectedIds.length > 0 && (
                            <div className="space-y-2">
                              {selectedIds.map((userId) => {
                                const member = familyMembers.find((m) => m.id === userId);
                                if (!member) return null;

                                return (
                                  <div
                                    key={userId}
                                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage
                                          src={member.image || undefined}
                                          alt={member.name || member.email}
                                        />
                                        <AvatarFallback>
                                          {(member.name || member.email)
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">
                                          {member.name || member.email}
                                        </p>
                                        {member.name && (
                                          <p className="text-muted-foreground text-xs">
                                            {member.email}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        field.onChange(
                                          selectedIds.filter((id) => id !== userId)
                                        );
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </>
            )}

            {/* Ícone (Opcional) */}
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
                  <FormDescription>
                    Adicione um emoji ou ícone para identificar sua meta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor (Opcional) */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                      value={field.value || "#6b7280"}
                      className="h-12 w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Escolha uma cor para personalizar sua meta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
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
