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
    "Assinatura Netflix R$ 45,90 mensal",
    "Meta: economizar R$ 10.000 para viagem em 6 meses",
    "Trabalhei das 9h às 18h e recebi R$ 800",
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
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-[550px] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 sm:h-10 sm:w-10">
              <FaMagic className="h-4 w-4 text-purple-600 sm:h-6 sm:w-6" />
            </div>
            <span className="text-base sm:text-xl">Adicionar Transação com IA</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Descreva sua transação, assinatura, meta ou período de trabalho em linguagem natural e a IA irá processar automaticamente.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 sm:h-16 sm:w-16">
              <FaCheckCircle className="h-8 w-8 text-green-500 sm:h-10 sm:w-10" />
            </div>
            <h3 className="text-base font-semibold text-green-600 sm:text-lg">
              Transação Adicionada!
            </h3>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Redirecionando...
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Input de Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium sm:text-sm">
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
                placeholder="Ex: Comprei um notebook de R$ 3.500 parcelado em 12x"
                className="min-h-[100px] resize-none text-sm sm:min-h-[120px] sm:text-base"
                disabled={isProcessing}
              />
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                💡 Dica: Pressione Ctrl+Enter para processar rapidamente
              </p>
            </div>

            {/* Exemplos */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                💡 Exemplos:
              </p>
              <div className="grid gap-1.5 sm:gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="rounded-lg border border-dashed bg-muted/50 px-2 py-1.5 text-left text-[10px] transition-colors hover:bg-muted sm:px-3 sm:py-2 sm:text-xs"
                    disabled={isProcessing}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 text-sm sm:text-base"
                size="sm"
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
                className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-sm hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FaMagic className="h-3 w-3 sm:h-4 sm:w-4" />
                    Processar com IA
                  </>
                )}
              </Button>
            </div>

            {/* Dica */}
            <div className="rounded-lg bg-purple-500/10 p-2.5 text-[10px] text-purple-700 dark:text-purple-300 sm:p-3 sm:text-xs">
              <strong>Dica:</strong> Seja específico! A IA pode criar:
              <ul className="mt-1.5 ml-3 list-disc space-y-0.5 sm:mt-2 sm:ml-4 sm:space-y-1">
                <li>Transações parceladas (ex: "R$ 3.500 em 12x")</li>
                <li>Assinaturas (ex: "Netflix R$ 45,90 mensal")</li>
                <li>Metas (ex: "Meta: economizar R$ 10.000 para viagem")</li>
                <li>Períodos de trabalho (ex: "Trabalhei das 9h às 18h e recebi R$ 800")</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiTransactionDialog;



