"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import type { ChatMessage } from "@/types/ai";
import { cn } from "@/app/_lib/utils";

interface AssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AssistantPanel({
  isOpen,
  onToggle,
}: AssistantPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Olá! Sou seu assistente financeiro. Como posso ajudar hoje?\n\n" +
        "Você pode me perguntar sobre:\n" +
        "• Seus gastos e receitas\n" +
        "• Resumo financeiro\n" +
        "• Dicas de economia\n" +
        "• Análise de categorias",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-5), // Últimas 5 mensagens para contexto
        }),
      });

      const data = await response.json();

      if (data.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Erro de conexão. Verifique sua internet e tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);

    // Adicionar mensagem de carregamento
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "🔍 Analisando suas transações...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Gerar insights do último mês
      const to = new Date();
      const from = new Date();
      from.setMonth(from.getMonth() - 1);

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from.toISOString(),
          to: to.toISOString(),
        }),
      });

      const data = await response.json();

      // Remover mensagem de carregamento
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));

      if (data.ok && data.insights) {
        const summary = data.summary;
        const insights = data.insights;

        let content = "📊 **Análise Financeira do Último Mês**\n\n";

        if (summary) {
          content += `💰 **Resumo:**\n`;
          content += `• Receitas: R$ ${summary.totalIncome.toFixed(2)}\n`;
          content += `• Despesas: R$ ${summary.totalExpenses.toFixed(2)}\n`;
          content += `• Investimentos: R$ ${summary.totalInvestments.toFixed(2)}\n`;
          content += `• Saldo: R$ ${(summary.totalIncome - summary.totalExpenses - summary.totalInvestments).toFixed(2)}\n\n`;
        }

        if (insights.length > 0) {
          content += `💡 **Insights:**\n\n`;
          insights.forEach((insight, index) => {
            const emoji =
              insight.severity === "high"
                ? "🔴"
                : insight.severity === "medium"
                  ? "🟡"
                  : "🟢";
            content += `${emoji} **${insight.title}**\n${insight.detail}\n\n`;
          });
        } else {
          content += "Não há insights suficientes para este período.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `insights-${Date.now()}`,
            role: "assistant",
            content,
            timestamp: new Date(),
            meta: { insights, summary },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Não foi possível gerar insights. Tente adicionar mais transações.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Erro ao gerar insights. Tente novamente mais tarde.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Painel */}
      <div
        className={cn(
          "bg-background fixed top-0 right-0 z-50 flex h-screen w-full flex-col border-l shadow-2xl transition-transform duration-300 ease-in-out lg:w-[420px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Bot className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Assistente IA</h3>
              <p className="text-muted-foreground text-xs">
                Sempre disponível para ajudar
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-b p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="gap-2"
            >
              {isGeneratingInsights ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Insights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("Me dê um resumo financeiro");
                setTimeout(handleSendMessage, 100);
              }}
              disabled={isLoading}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Resumo
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                <div className="break-words whitespace-pre-wrap">
                  {message.content}
                </div>
                <div
                  className={cn(
                    "mt-1 text-xs",
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {mounted &&
                    new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
              {message.role === "user" && (
                <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xs font-semibold">EU</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Bot className="text-primary h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <div className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte sobre suas finanças..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            💡 Usando modelos open-source. Pode haver limitações.
          </p>
        </div>
      </div>
    </>
  );
}
