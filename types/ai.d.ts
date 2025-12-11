// AI Service Types

export interface AIResponse {
  ok: boolean;
  text?: string;
  data?: any;
  error?: string;
}

export interface AIOptions {
  userId?: string;
  context?: any;
  maxTokens?: number;
  temperature?: number;
}

export interface AIInsight {
  id: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
  category?: string;
  actionable?: boolean;
}

export interface InsightsRequest {
  userId: string;
  from: string;
  to: string;
}

export interface InsightsResponse {
  ok: boolean;
  insights: AIInsight[];
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    period: string;
  };
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  meta?: any;
}

export interface ChatRequest {
  userId: string;
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  ok: boolean;
  message?: ChatMessage;
  error?: string;
}

