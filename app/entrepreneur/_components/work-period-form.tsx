"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createWorkPeriod, updateWorkPeriod } from "@/app/_actions/work-period";
import { formatHours } from "./utils";
import ProjectForm from "./project-form";

const workPeriodSchema = z.object({
  type: z.enum(["project", "platform", "none"]).optional().default("none"),
  projectId: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  date: z.date({ required_error: "Data é obrigatória" }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido (use HH:mm)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido (use HH:mm)"),
  amount: z.number().positive("Valor deve ser positivo"),
  expenses: z.number().min(0, "Despesas não podem ser negativas").default(0),
  description: z.string().optional().nullable(),
});

type WorkPeriodFormInput = z.infer<typeof workPeriodSchema>;

interface WorkPeriod {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hours: number;
  amount: number;
  expenses: number;
  description: string | null;
  projectId: string | null;
  platform: string | null;
}

interface Project {
  id: string;
  clientName: string;
  projectName: string | null;
}

interface WorkPeriodFormProps {
  isOpen: boolean;
  onClose: () => void;
  period?: WorkPeriod | null;
  projects: Project[];
  onSuccess: () => void;
  onProjectCreated?: () => void;
}

export default function WorkPeriodForm({
  isOpen,
  onClose,
  period,
  projects: initialProjects,
  onSuccess,
  onProjectCreated,
}: WorkPeriodFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const isEditing = !!period;

  // Atualizar projetos quando initialProjects mudar
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const form = useForm<WorkPeriodFormInput>({
    resolver: zodResolver(workPeriodSchema),
    defaultValues: {
      type: "none",
      projectId: null,
      platform: null,
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      amount: 0,
      expenses: 0,
      description: "",
    },
  });

  const selectedType = form.watch("type");

  // Calcular horas quando startTime ou endTime mudarem
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }

      const hours = diffMinutes / 60;
      // Não atualizar o form, apenas mostrar visualmente
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (isOpen) {
      if (period) {
        // Converter para horário brasileiro ao exibir
        const startTimeStr = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(period.startTime));

        const endTimeStr = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(period.endTime));

        // Converter data para horário brasileiro (apenas data, sem hora)
        const dateBR = new Date(period.date);
        const dateStr = new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }).format(dateBR);
        const [day, month, year] = dateStr.split("/");
        const dateObj = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );

        // Determinar o tipo baseado nos dados existentes
        let type: "project" | "platform" | "none" = "none";
        if (period.projectId) {
          type = "project";
        } else if ((period as any).platform) {
          type = "platform";
        }

        form.reset({
          type,
          projectId: period.projectId || null,
          platform: (period as any).platform || null,
          date: dateObj,
          startTime: startTimeStr,
          endTime: endTimeStr,
          amount: period.amount,
          expenses: period.expenses,
          description: period.description || "",
        });
      } else {
        // Usar data atual no horário brasileiro
        const now = new Date();
        const dateStr = new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }).format(now);
        const [day, month, year] = dateStr.split("/");
        const todayBR = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );

        form.reset({
          projectId: null,
          date: todayBR,
          startTime: "09:00",
          endTime: "17:00",
          amount: 0,
          expenses: 0,
          description: "",
        });
      }
    }
  }, [period, form, isOpen]);

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    return diffMinutes / 60;
  };

  const onSubmit = async (data: WorkPeriodFormInput) => {
    setIsLoading(true);

    try {
      console.log("📝 Dados do formulário:", data);

      let result;

      if (isEditing && period) {
        result = await updateWorkPeriod(period.id, data);
      } else {
        result = await createWorkPeriod(data);
      }

      console.log("✅ Resultado:", result);

      if (result.success) {
        toast.success(
          isEditing
            ? "Período atualizado com sucesso!"
            : "Período criado com sucesso!",
        );
        onSuccess();
        onClose();
      } else {
        console.error("❌ Erro:", result.error);
        toast.error(result.error || "Erro ao salvar período");
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      toast.error("Erro ao salvar período");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedHours =
    startTime && endTime ? calculateHours(startTime, endTime) : 0;
  const netProfit = form.watch("amount") - form.watch("expenses");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Período" : "Novo Período de Trabalho"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do período de trabalho."
              : "Registre um novo período de trabalho com horários, valor recebido e despesas."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Data */}
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

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duração Calculada */}
            {calculatedHours > 0 && (
              <div className="bg-muted rounded-lg border p-3">
                <p className="text-sm font-medium">
                  Duração: {formatHours(calculatedHours)}
                </p>
              </div>
            )}

            {/* Tipo: Projeto ou Plataforma */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Limpar valores quando mudar o tipo
                      if (value === "project") {
                        form.setValue("platform", null);
                      } else if (value === "platform") {
                        form.setValue("projectId", null);
                      } else {
                        form.setValue("projectId", null);
                        form.setValue("platform", null);
                      }
                    }}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="project">Projeto/Cliente</SelectItem>
                      <SelectItem value="platform">
                        Plataforma Online
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Projeto - mostrado apenas se tipo for "project" */}
            {selectedType === "project" && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Projeto/Cliente</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsProjectFormOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem projeto</SelectItem>
                        {projects
                          .filter((p) => p.status === "ACTIVE")
                          .map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.clientName}
                              {project.projectName &&
                                ` - ${project.projectName}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Plataforma - mostrado apenas se tipo for "platform" */}
            {selectedType === "platform" && (
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma Online</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione uma plataforma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem plataforma</SelectItem>
                        <SelectItem value="UBER">Uber</SelectItem>
                        <SelectItem value="99">99</SelectItem>
                        <SelectItem value="IFOOD">iFood</SelectItem>
                        <SelectItem value="RAPPI">Rappi</SelectItem>
                        <SelectItem value="OUTROS">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Valor Recebido */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Recebido</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => {
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

            {/* Despesas */}
            <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Despesas</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => {
                        const numericValue = parseFloat(value) || 0;
                        field.onChange(numericValue);
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormDescription>
                    Despesas relacionadas a este período (materiais, transporte,
                    etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lucro Calculado */}
            <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Lucro Líquido:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(netProfit)}
              </p>
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o trabalho realizado..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
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

      {/* Project Form Dialog */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSuccess={async () => {
          setIsProjectFormOpen(false);
          // Recarregar projetos
          const { getProjects } = await import("@/app/_actions/project");
          const projectsResult = await getProjects();
          if (projectsResult.success) {
            setProjects(projectsResult.data || []);
          }
          if (onProjectCreated) {
            onProjectCreated();
          }
        }}
      />
    </Dialog>
  );
}
