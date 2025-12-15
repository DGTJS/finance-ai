"use client";

import { Button } from "@/app/_components/ui/button";
import { Plus, Target } from "lucide-react";

interface FixedActionsProps {
  onAddPeriod: () => void;
  onSetGoal: () => void;
}

export default function FixedActions({ onAddPeriod, onSetGoal }: FixedActionsProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:bottom-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl gap-2 sm:justify-end">
        {/* Botão Secundário - Definir Meta */}
        {onSetGoal && (
          <Button
            variant="outline"
            size="lg"
            onClick={onSetGoal}
            className="flex-1 gap-2 shadow-lg sm:flex-initial"
          >
            <Target className="h-5 w-5" />
            <span className="hidden sm:inline">Definir Meta</span>
            <span className="sm:hidden">Meta</span>
          </Button>
        )}

        {/* Botão Primário - Nova Corrida/Job */}
        <Button
          size="lg"
          onClick={onAddPeriod}
          className="flex-1 gap-2 shadow-lg sm:flex-initial"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nova Corrida / Job</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </div>
  );
}

