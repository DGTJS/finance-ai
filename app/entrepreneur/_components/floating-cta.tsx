"use client";

import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";

interface FloatingCTAProps {
  onAddPeriod: () => void;
  contextualMessage?: string;
}

export default function FloatingCTA({ onAddPeriod, contextualMessage }: FloatingCTAProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        onClick={onAddPeriod}
        title={contextualMessage}
        className="h-14 w-14 rounded-full shadow-2xl sm:h-auto sm:w-auto sm:rounded-lg"
      >
        <Plus className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">Registrar trabalho de hoje</span>
      </Button>
    </div>
  );
}

