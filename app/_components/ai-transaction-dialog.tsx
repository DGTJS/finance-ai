"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FaMagic, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

interface AiTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiTransactionDialog = ({ isOpen, onClose }: AiTransactionDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const examplePrompts = [
    "Comprei um notebook de R$ 3.500 parcelado em 12x",
    "Paguei R$ 45 no Uber hoje",
    "Recebi meu salário de R$ 5.000",
    "Gastei R$ 250 no supermercado",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Digite uma descrição da transação");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Transação adicionada com sucesso!");
        setTimeout(() => {
          setSuccess(false);
          setPrompt("");
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || "Erro ao processar transação");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erro ao processar transação:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar transação";
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20">
              <FaMagic className="h-6 w-6 text-purple-600" />
            </div>
            Adicionar Transação com IA
          </DialogTitle>
          <DialogDescription>
            Descreva sua transação em linguagem natural e a IA irá processar automaticamente.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <FaCheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">
              Transação Adicionada!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecionando...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Input de Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Descreva sua transação
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  console.log("Prompt alterado:", e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (!isProcessing && prompt.trim()) {
                      handleSubmit();
                    }
                  }
                }}
                placeholder="Ex: Comprei um notebook de R$ 3.500 parcelado em 12x no cartão de crédito"
                className="min-h-[120px] resize-none"
                disabled={isProcessing}
              />
              <p className="text-muted-foreground text-xs">
                💡 Dica: Pressione Ctrl+Enter para processar rapidamente
              </p>
            </div>

            {/* Exemplos */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                💡 Exemplos:
              </p>
              <div className="grid gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="rounded-lg border border-dashed bg-muted/50 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                    disabled={isProcessing}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Botão clicado, prompt:", prompt);
                  handleSubmit();
                }}
                disabled={isProcessing || !prompt.trim()}
                type="button"
                className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FaMagic className="h-4 w-4" />
                    Processar com IA
                  </>
                )}
              </Button>
            </div>

            {/* Dica */}
            <div className="rounded-lg bg-purple-500/10 p-3 text-xs text-purple-700 dark:text-purple-300">
              <strong>Dica:</strong> Seja específico! Inclua valor, forma de pagamento e
              se for parcelado.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiTransactionDialog;



