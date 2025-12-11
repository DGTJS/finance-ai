"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import {
  Trash2,
  Edit,
  RefreshCw,
  Calendar,
  DollarSign,
  Repeat,
  Power,
} from "lucide-react";
import { updateSubscriptionLogo } from "@/app/_actions/subscription";
import { toast } from "sonner";

interface SubscriptionCardProps {
  subscription: {
    id: string;
    name: string;
    logoUrl: string | null;
    amount: number;
    dueDate: Date;
    nextDueDate: Date | null;
    recurring: boolean;
    active: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(subscription.logoUrl);

  const daysUntilDue = subscription.nextDueDate
    ? Math.ceil(
        (new Date(subscription.nextDueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const getStatusBadge = () => {
    if (!subscription.active) {
      return <Badge variant="secondary">Inativa</Badge>;
    }

    if (!daysUntilDue) {
      return <Badge variant="secondary">Única</Badge>;
    }

    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Vencida</Badge>;
    }

    if (daysUntilDue <= 3) {
      return <Badge variant="destructive">Vence em {daysUntilDue}d</Badge>;
    }

    if (daysUntilDue <= 7) {
      return <Badge className="bg-yellow-500">Vence em {daysUntilDue}d</Badge>;
    }

    return <Badge variant="secondary">Ativa</Badge>;
  };

  const handleRefreshLogo = async () => {
    setIsUpdatingLogo(true);
    try {
      const result = await updateSubscriptionLogo(subscription.id);

      if (result.success && result.logoUrl) {
        setLogoUrl(result.logoUrl);
        toast.success("Logo atualizado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao atualizar logo");
      }
    } catch (error) {
      toast.error("Erro ao atualizar logo");
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={subscription.name}
                  fill
                  className="object-contain p-1"
                  onError={() => setLogoUrl("/logos/default.svg")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Nome e Status */}
            <div>
              <h3 className="font-semibold">{subscription.name}</h3>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </div>

          {/* Valor */}
          <div className="text-right">
            <p className="text-2xl font-bold">
              R$ {subscription.amount.toFixed(2)}
            </p>
            {subscription.recurring && (
              <p className="text-xs text-muted-foreground">/mês</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        {/* Informações */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Vencimento:{" "}
            {new Date(subscription.dueDate).toLocaleDateString("pt-BR")}
          </span>
        </div>

        {subscription.nextDueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat className="h-4 w-4" />
            <span>
              Próximo:{" "}
              {new Date(subscription.nextDueDate).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Power className="h-4 w-4" />
          <span>{subscription.active ? "Ativa" : "Inativa"}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshLogo}
          disabled={isUpdatingLogo}
          className="flex-1"
        >
          <RefreshCw
            className={`h-4 w-4 ${isUpdatingLogo ? "animate-spin" : ""}`}
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(subscription.id)}
          className="flex-1"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(subscription.id)}
          className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

