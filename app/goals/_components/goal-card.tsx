"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { Trash2, Edit, Calendar, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    description: string | null;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    category: string;
    status: string;
    icon: string | null;
    color: string | null;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const GOAL_CATEGORY_LABELS: Record<string, string> = {
  SAVINGS: "Poupança",
  INVESTMENT: "Investimento",
  EMERGENCY: "Reserva de Emergência",
  VACATION: "Viagem/Férias",
  HOUSE: "Casa/Imóvel",
  VEHICLE: "Veículo",
  EDUCATION: "Educação",
  WEDDING: "Casamento",
  OTHER: "Outro",
};

const GOAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  PAUSED: "Pausada",
};

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const progressPercentage =
    goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      : 0;

  const remaining = goal.targetAmount - goal.currentAmount;
  const daysUntilDeadline = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    switch (goal.status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Concluída</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "PAUSED":
        return <Badge variant="secondary">Pausada</Badge>;
      default:
        if (daysUntilDeadline < 0) {
          return <Badge variant="destructive">Vencida</Badge>;
        }
        if (daysUntilDeadline <= 7) {
          return <Badge className="bg-yellow-500">Urgente</Badge>;
        }
        return <Badge className="bg-blue-500">Ativa</Badge>;
    }
  };

  const getCategoryColor = () => {
    if (goal.color) return goal.color;
    // Cores padrão por categoria
    const colors: Record<string, string> = {
      SAVINGS: "#10b981",
      INVESTMENT: "#3b82f6",
      EMERGENCY: "#ef4444",
      VACATION: "#f59e0b",
      HOUSE: "#8b5cf6",
      VEHICLE: "#6366f1",
      EDUCATION: "#06b6d4",
      WEDDING: "#ec4899",
      OTHER: "#6b7280",
    };
    return colors[goal.category] || "#6b7280";
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
              style={{ backgroundColor: `${getCategoryColor()}20` }}
            >
              {goal.icon || <Target className="h-6 w-6" style={{ color: getCategoryColor() }} />}
            </div>

            {/* Nome e Status */}
            <div className="flex-1">
              <h3 className="font-semibold">{goal.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                {getStatusBadge()}
                <Badge variant="outline" className="text-xs">
                  {GOAL_CATEGORY_LABELS[goal.category] || goal.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-3">
        {/* Progresso */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full transition-all"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: getCategoryColor(),
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(goal.currentAmount)}
            </span>
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(goal.targetAmount)}
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Prazo: {format(new Date(goal.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          {goal.status === "ACTIVE" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>
                {daysUntilDeadline >= 0
                  ? `${daysUntilDeadline} dia(s) restante(s)`
                  : `${Math.abs(daysUntilDeadline)} dia(s) de atraso`}
              </span>
            </div>
          )}
          {remaining > 0 && goal.status === "ACTIVE" && (
            <div className="text-xs text-muted-foreground">
              Faltam{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(remaining)}
            </div>
          )}
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(goal.id)}
          className="flex-1"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(goal.id)}
          className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}


