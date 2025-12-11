"use client";

import {
  Transaction,
  TransactionCategory,
} from "@/app/generated/prisma/client";
import DashboardClientNew from "./dashboard-client-new";

export interface DashboardClientProps {
  userName: string;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    balance: number;
  };
  expensesByCategory: Record<string, number>;
  expensesChartData: Array<{
    category: TransactionCategory;
    total: number;
    percentage: number;
  }>;
  transactionsByDay: Array<{
    date: string;
    income: number;
    expenses: number;
    investments: number;
  }>;
  recentTransactions: (Transaction & { createdBy?: { id: string; name: string | null; email: string | null } })[];
  upcomingSubscriptions: Array<{
    id: string;
    name: string;
    amount: number;
    nextDueDate: Date | null;
  }>;
  upcomingTransactions: Transaction[];
  aiInsight?: {
    id: string;
    title: string;
    detail: string;
    severity: "high" | "medium" | "low";
    category?: string;
    actionable?: boolean;
  };
  transactionsByUser?: Record<string, { 
    name: string; 
    transactions: (Transaction & { createdBy?: { id: string; name: string | null; email: string | null } })[]; 
    income: number; 
    expenses: number; 
    investments: number 
  }>;
  familyUsers?: Array<{ id: string; name: string | null; email: string | null; image: string | null }>;
  activeGoals?: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    category: string;
    icon: string | null;
    color: string | null;
  }>;
}

export default function DashboardClient(props: DashboardClientProps) {
  return <DashboardClientNew {...props} />;
}
