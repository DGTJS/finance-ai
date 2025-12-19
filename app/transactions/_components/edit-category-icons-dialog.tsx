"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { EmojiPicker } from "@/app/_components/emoji-picker";
import { Label } from "@/app/_components/ui/label";
import { TRANSACTION_CATEGORY_LABELS, TRANSACTION_CATEGORY_EMOJIS } from "@/app/_constants/transactions";
import { TransactionCategory } from "@/app/generated/prisma/client";
import { saveUserSettings } from "@/app/_actions/user-settings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditCategoryIconsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentIcons: Record<string, string>;
  onSave: (icons: Record<string, string>) => void;
}

export default function EditCategoryIconsDialog({
  isOpen,
  onClose,
  currentIcons,
  onSave,
}: EditCategoryIconsDialogProps) {
  const [icons, setIcons] = useState<Record<string, string>>(currentIcons);
  const [isSaving, setIsSaving] = useState(false);

  const categories = Object.keys(TRANSACTION_CATEGORY_LABELS) as TransactionCategory[];

  const handleIconChange = (category: TransactionCategory, icon: string) => {
    setIcons((prev) => ({
      ...prev,
      [category]: icon,
    }));
  };

  const handleReset = (category: TransactionCategory) => {
    const defaultIcon = TRANSACTION_CATEGORY_EMOJIS[category];
    setIcons((prev) => {
      const newIcons = { ...prev };
      delete newIcons[category];
      return newIcons;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveUserSettings({
        categoryIcons: icons,
      });

      if (result.success) {
        toast.success("Ícones de categorias atualizados com sucesso!");
        onSave(icons);
        onClose();
      } else {
        toast.error(result.error || "Erro ao salvar ícones");
      }
    } catch (error) {
      toast.error("Erro ao salvar ícones");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ícones das Categorias</DialogTitle>
          <DialogDescription>
            Personalize os ícones exibidos para cada categoria de transação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {categories.map((category) => {
            const label = TRANSACTION_CATEGORY_LABELS[category];
            const defaultIcon = TRANSACTION_CATEGORY_EMOJIS[category];
            const currentIcon = icons[category] || defaultIcon;

            return (
              <div
                key={category}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentIcon}</span>
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">
                      Padrão: {defaultIcon}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EmojiPicker
                    value={icons[category] || ""}
                    onChange={(emoji) => handleIconChange(category, emoji)}
                    placeholder="Escolha um emoji"
                  />
                  {icons[category] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReset(category)}
                      title="Restaurar padrão"
                    >
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}






