import type {
  AIResponse,
  AIOptions,
  AIInsight,
  ChatMessage,
} from "@/types/ai";
import { db } from "./prisma";
import { getUserHfApiKey } from "@/app/_actions/user-settings";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"; // Modelo gratuito e bom
const MAX_PROMPT_LENGTH = 2000;

/**
 * Sanitiza o input do usuário para prevenir injection
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, MAX_PROMPT_LENGTH)
    .replace(/<script>/gi, "")
    .replace(/<\/script>/gi, "");
}

/**
 * Chama a API do Hugging Face
 */
async function callHuggingFace(
  prompt: string,
  options: AIOptions = {},
): Promise<AIResponse> {
  // Primeiro tenta buscar a chave do usuário no banco de dados
  let apiKey: string | null = null;
  
  if (options.userId) {
    apiKey = await getUserHfApiKey(options.userId);
  }
  
  // Se não encontrou no banco, tenta usar a variável de ambiente (fallback global)
  if (!apiKey) {
    apiKey = process.env.HF_API_KEY || null;
  }

  if (!apiKey) {
    return {
      ok: false,
      error: "HF_API_KEY não configurada. Usando fallback local.",
    };
  }

  try {
    const response = await fetch(`${HF_API_URL}/${HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao chamar Hugging Face:", error);
      return {
        ok: false,
        error: `API Error: ${response.status}`,
      };
    }

    const data = await response.json();

    // HF retorna array de objetos com generated_text
    const text =
      data[0]?.generated_text || data.generated_text || JSON.stringify(data);

    return {
      ok: true,
      text,
      data,
    };
  } catch (error) {
    console.error("Erro ao chamar Hugging Face:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Fallback local - análise simples baseada em regras
 */
async function localFallback(
  prompt: string,
  options: AIOptions = {},
): Promise<AIResponse> {
  const userId = options.userId;

  // Detectar tipo de pergunta
  const promptLower = prompt.toLowerCase();

  try {
    // Caso 1: Análise de gastos
    if (
      promptLower.includes("gasto") ||
      promptLower.includes("despesa") ||
      promptLower.includes("quanto gastei")
    ) {
      if (!userId) {
        return {
          ok: true,
          text: "Por favor, faça login para ver seus dados financeiros.",
        };
      }

      const transactions = await db.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
        },
        orderBy: { amount: "desc" },
        take: 5,
      });

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      const categories = transactions.reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const topCategory = Object.entries(categories).sort(
        (a, b) => b[1] - a[1],
      )[0];

      const categoryLabel = topCategory?.[0] 
        ? (TRANSACTION_CATEGORY_LABELS[topCategory[0] as keyof typeof TRANSACTION_CATEGORY_LABELS] || topCategory[0])
        : "N/A";

      return {
        ok: true,
        text: `Análise de Despesas:\n\n` +
          `💰 Total gasto: R$ ${total.toFixed(2)}\n` +
          `📊 Categoria com maior gasto: ${categoryLabel} (R$ ${topCategory?.[1]?.toFixed(2) || 0})\n` +
          `📝 Número de transações: ${transactions.length}\n\n` +
          `💡 Dica: Considere reduzir gastos em ${categoryLabel !== "N/A" ? categoryLabel : "categorias principais"} para economizar.`,
        data: { total, categories, transactions: transactions.length },
      };
    }

    // Caso 2: Análise de receitas
    if (promptLower.includes("receita") || promptLower.includes("ganho")) {
      if (!userId) {
        return {
          ok: true,
          text: "Por favor, faça login para ver seus dados financeiros.",
        };
      }

      const deposits = await db.transaction.findMany({
        where: {
          userId,
          type: "DEPOSIT",
        },
      });

      const total = deposits.reduce((sum, t) => sum + t.amount, 0);

      return {
        ok: true,
        text:
          `Análise de Receitas:\n\n` +
          `💵 Total de receitas: R$ ${total.toFixed(2)}\n` +
          `📝 Número de entradas: ${deposits.length}\n\n` +
          `💡 Continue assim! Manter múltiplas fontes de renda é uma boa prática.`,
        data: { total, count: deposits.length },
      };
    }

    // Caso 3: Resumo geral
    if (
      promptLower.includes("resumo") ||
      promptLower.includes("visão geral") ||
      promptLower.includes("overview")
    ) {
      if (!userId) {
        return {
          ok: true,
          text: "Por favor, faça login para ver seu resumo financeiro.",
        };
      }

      const [expenses, deposits, investments] = await Promise.all([
        db.transaction.aggregate({
          where: { userId, type: "EXPENSE" },
          _sum: { amount: true },
          _count: true,
        }),
        db.transaction.aggregate({
          where: { userId, type: "DEPOSIT" },
          _sum: { amount: true },
          _count: true,
        }),
        db.transaction.aggregate({
          where: { userId, type: "INVESTMENT" },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      const totalExpenses = expenses._sum.amount || 0;
      const totalDeposits = deposits._sum.amount || 0;
      const totalInvestments = investments._sum.amount || 0;
      const balance = totalDeposits - totalExpenses - totalInvestments;

      return {
        ok: true,
        text:
          `📊 Resumo Financeiro:\n\n` +
          `💰 Receitas: R$ ${totalDeposits.toFixed(2)} (${deposits._count} transações)\n` +
          `💸 Despesas: R$ ${totalExpenses.toFixed(2)} (${expenses._count} transações)\n` +
          `📈 Investimentos: R$ ${totalInvestments.toFixed(2)} (${investments._count} transações)\n` +
          `💵 Saldo: R$ ${balance.toFixed(2)}\n\n` +
          `${balance > 0 ? "✅ Parabéns! Você está no positivo." : "⚠️ Atenção: suas despesas superam suas receitas."}`,
        data: {
          expenses: totalExpenses,
          deposits: totalDeposits,
          investments: totalInvestments,
          balance,
        },
      };
    }

    // Caso padrão
    return {
      ok: true,
      text:
        `🤖 Assistente Finance AI (modo local)\n\n` +
        `Posso ajudar você com:\n` +
        `• Análise de gastos\n` +
        `• Resumo financeiro\n` +
        `• Dicas de economia\n` +
        `• Análise de receitas\n\n` +
        `Tente perguntas como:\n` +
        `- "Quanto gastei?"\n` +
        `- "Me dê um resumo"\n` +
        `- "Qual minha receita?"\n\n` +
        `💡 Configure HF_API_KEY para respostas mais inteligentes!`,
    };
  } catch (error) {
    console.error("Erro no fallback local:", error);
    return {
      ok: false,
      error: "Erro ao processar sua pergunta. Tente novamente.",
    };
  }
}

/**
 * Função principal - tenta HF primeiro, depois fallback
 */
export async function askAI(
  prompt: string,
  options: AIOptions = {},
): Promise<AIResponse> {
  // Sanitizar input
  const sanitizedPrompt = sanitizeInput(prompt);

  if (!sanitizedPrompt) {
    return {
      ok: false,
      error: "Prompt vazio ou inválido",
    };
  }

  // Tentar Hugging Face primeiro
  const hfResponse = await callHuggingFace(sanitizedPrompt, options);

  if (hfResponse.ok) {
    return hfResponse;
  }

  // Fallback local
  console.log("Usando fallback local para:", sanitizedPrompt.slice(0, 50));
  return localFallback(sanitizedPrompt, options);
}

/**
 * Gera insights automáticos baseados em transações
 */
export async function generateInsights(
  userId: string,
  from: Date,
  to: Date,
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  try {
    // Buscar transações do período
    const transactions = await db.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { amount: "desc" },
    });

    if (transactions.length === 0) {
      return [
        {
          id: "no-data",
          title: "Sem dados suficientes",
          detail:
            "Não há transações neste período para gerar insights. Adicione algumas transações primeiro!",
          severity: "low",
        },
      ];
    }

    // Análise 1: Total de gastos
    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > 5000) {
      insights.push({
        id: "high-expenses",
        title: "Gastos Elevados",
        detail: `Você gastou R$ ${totalExpenses.toFixed(2)} neste período. Considere revisar suas despesas maiores.`,
        severity: "high",
        actionable: true,
      });
    }

    // Análise 2: Categoria dominante
    const categoryTotals = expenses.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    if (topCategory && topCategory[1] > totalExpenses * 0.3) {
      const categoryLabel = TRANSACTION_CATEGORY_LABELS[topCategory[0] as keyof typeof TRANSACTION_CATEGORY_LABELS] || topCategory[0];
      
      insights.push({
        id: "dominant-category",
        title: `Alto gasto em ${categoryLabel}`,
        detail: `${categoryLabel} representa ${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% dos seus gastos (R$ ${topCategory[1].toFixed(2)}). Considere alternativas para reduzir.`,
        severity: "medium",
        category: topCategory[0],
        actionable: true,
      });
    }

    // Análise 3: Saldo positivo/negativo
    const deposits = transactions.filter((t) => t.type === "DEPOSIT");
    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalDeposits - totalExpenses;

    if (balance < 0) {
      insights.push({
        id: "negative-balance",
        title: "Saldo Negativo",
        detail: `Suas despesas superaram suas receitas em R$ ${Math.abs(balance).toFixed(2)}. É importante ajustar o orçamento.`,
        severity: "high",
        actionable: true,
      });
    } else if (balance > 0) {
      insights.push({
        id: "positive-balance",
        title: "Saldo Positivo! 🎉",
        detail: `Parabéns! Você economizou R$ ${balance.toFixed(2)} neste período. Continue assim!`,
        severity: "low",
      });
    }

    // Análise 4: Assinaturas próximas do vencimento
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
        active: true,
        nextDueDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
      },
    });

    if (subscriptions.length > 0) {
      const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      insights.push({
        id: "subscriptions-due",
        title: `${subscriptions.length} assinatura(s) vencendo`,
        detail: `Você tem ${subscriptions.length} assinatura(s) vencendo nos próximos 7 dias. Total: R$ ${total.toFixed(2)}`,
        severity: "medium",
        actionable: true,
      });
    }

    return insights;
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return [
      {
        id: "error",
        title: "Erro ao gerar insights",
        detail:
          "Não foi possível analisar seus dados. Tente novamente mais tarde.",
        severity: "low",
      },
    ];
  }
}

/**
 * Processa mensagens de chat
 */
export async function chat(
  message: string,
  userId?: string,
  history: ChatMessage[] = [],
): Promise<ChatMessage> {
  // Construir contexto do histórico
  const context =
    history.length > 0
      ? history
          .slice(-5)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

  const fullPrompt = context
    ? `Histórico:\n${context}\n\nUsuário: ${message}\n\nAssistente:`
    : `Usuário: ${message}\n\nAssistente:`;

  const response = await askAI(fullPrompt, { userId });

  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: response.text || response.error || "Desculpe, não entendi.",
    timestamp: new Date(),
    meta: response.data,
  };
}

