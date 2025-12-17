"use client";

import { useState } from "react";
import AssistantPanel from "./assistant-panel";

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Painel do assistente */}
      <AssistantPanel isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  );
}
