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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProject, updateProject } from "@/app/_actions/project";

const projectSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  projectName: z.string().optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional().nullable(),
});

type ProjectFormInput = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  clientName: string;
  projectName: string | null;
  hourlyRate: number | null;
  status: string;
  notes: string | null;
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess: () => void;
}

export default function ProjectForm({
  isOpen,
  onClose,
  project,
  onSuccess,
}: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!project;

  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientName: "",
      projectName: "",
      hourlyRate: null,
      status: "ACTIVE",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        form.reset({
          clientName: project.clientName,
          projectName: project.projectName || "",
          hourlyRate: project.hourlyRate || null,
          status: project.status as "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
          notes: project.notes || "",
        });
      } else {
        form.reset({
          clientName: "",
          projectName: "",
          hourlyRate: null,
          status: "ACTIVE",
          notes: "",
        });
      }
    }
  }, [project, form, isOpen]);

  const onSubmit = async (data: ProjectFormInput) => {
    setIsLoading(true);

    try {
      let result;

      if (isEditing && project) {
        result = await updateProject(project.id, data);
      } else {
        result = await createProject(data);
      }

      if (result.success) {
        toast.success(
          isEditing ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!",
        );
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar projeto");
      }
    } catch (error) {
      toast.error("Erro ao salvar projeto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Projeto" : "Novo Projeto/Cliente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do projeto."
              : "Cadastre um novo projeto ou cliente para organizar seus períodos de trabalho."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome do Cliente */}
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome do Projeto */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvimento de Site" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Nome específico do projeto, se houver
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor por Hora */}
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por Hora (Opcional)</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => {
                        const numericValue = parseFloat(value) || 0;
                        field.onChange(numericValue > 0 ? numericValue : null);
                      }}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormDescription>
                    Valor de referência por hora para este projeto
                  </FormDescription>
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
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value || "ACTIVE"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="PAUSED">Pausado</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o projeto..."
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
    </Dialog>
  );
}



