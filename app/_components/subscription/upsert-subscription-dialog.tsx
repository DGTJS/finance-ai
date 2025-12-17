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
import { Loader2, Upload, X } from "lucide-react";
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
    logoUrl?: string | null;
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      logoUrl: null,
    },
  });

  // Resetar form quando o dialog abrir/fechar ou a subscription mudar
  useEffect(() => {
    if (subscription) {
      // Buscar logoUrl da subscription se existir
      const logoUrl = subscription.logoUrl || null;
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        dueDate: subscription.dueDate,
        recurring: subscription.recurring,
        nextDueDate: subscription.nextDueDate,
        active: subscription.active,
        logoUrl,
      });
      setImagePreview(logoUrl);
    } else {
      form.reset({
        name: "",
        amount: 0,
        dueDate: new Date(),
        recurring: true,
        nextDueDate: null,
        active: true,
        logoUrl: null,
      });
      setImagePreview(null);
    }
  }, [subscription, form]);

  // Função para comprimir e converter imagem para base64
  const compressImage = (
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 200,
    quality: number = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo proporção
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Não foi possível criar contexto do canvas"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error("Erro ao carregar imagem"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressedImage = await compressImage(file);
      setImagePreview(compressedImage);
      form.setValue("logoUrl", compressedImage);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem. Tente novamente.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("logoUrl", null);
  };

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
            {/* Logo/Imagem */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Logo da Assinatura</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            disabled={isLoading || isUploadingImage}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <label
                            htmlFor="logo-upload"
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted"
                          >
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {isUploadingImage
                                ? "Carregando..."
                                : "Clique para fazer upload"}
                            </span>
                          </label>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isLoading || isUploadingImage}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {imagePreview
                      ? "Imagem carregada. Clique no X para remover."
                      : "Faça upload de um logo ou deixe em branco para detecção automática"}
                  </FormDescription>
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
                  <FormLabel>Nome da Assinatura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Netflix, Spotify, etc."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {imagePreview
                      ? "Nome da assinatura"
                      : "O logo será detectado automaticamente se não houver upload"}
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
              // Ensure value is always a Date object
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <DatePickerForm value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              // Add this to ensure correct type
              setValueAs={value => value instanceof Date ? value : new Date(value)}
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

