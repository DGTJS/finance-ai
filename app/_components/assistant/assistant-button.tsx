"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "../ui/button";
import AssistantPanel from "./assistant-panel";

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full shadow-lg transition-all hover:scale-110 sm:bottom-28 sm:right-6 sm:h-14 sm:w-14"
        aria-label="Abrir Assistente IA"
      >
        <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Painel do assistente */}
      <AssistantPanel isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  );
}

