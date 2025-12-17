/**
 * TopActionBar - Barra de ações rápidas no topo do dashboard
 * 
 * Funcionalidades:
 * - Toggle de tema (dark/light)
 * - Botões de ação rápida (adicionar transação, meta, etc)
 * - Links para páginas principais
 */

"use client";

import { Button } from "@/app/_components/ui/button";
import { Plus, Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export function TopActionBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className="flex h-12 items-center justify-between rounded-lg border bg-card p-4" />
    );
  }

  return (
    <div
      role="toolbar"
      aria-label="Ações rápidas"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Dashboard Financeiro</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle de tema */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Alternar para tema ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Adicionar transação */}
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push("/transactions?action=add")}
          aria-label="Adicionar transação"
        >
          <Plus className="mr-2 h-4 w-4" />
          Transação
        </Button>

        {/* Configurações */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          aria-label="Configurações"
        >
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}




