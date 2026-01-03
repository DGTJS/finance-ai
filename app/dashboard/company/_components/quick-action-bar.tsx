"use client";

import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";

interface QuickActionBarProps {
  onAddRevenue: () => void;
  onAddCost: () => void;
  onAddProduct?: () => void;
  hasStock?: boolean;
}

export function QuickActionBar({
  onAddRevenue,
  onAddCost,
  onAddProduct,
  hasStock = false,
}: QuickActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={onAddRevenue}
        size="sm"
        className="gap-2 border border-black bg-black text-white shadow-sm transition-all hover:bg-gray-900 hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar Receita</span>
        <span className="sm:hidden">Receita</span>
      </Button>

      <Button
        onClick={onAddCost}
        size="sm"
        variant="outline"
        className="gap-2 border-2 border-black bg-white text-black shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar Gasto</span>
        <span className="sm:hidden">Gasto</span>
      </Button>

      {hasStock && onAddProduct && (
        <Button
          onClick={onAddProduct}
          size="sm"
          variant="outline"
          className="gap-2 border-2 border-black bg-white text-black shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar Produto</span>
          <span className="sm:hidden">Produto</span>
        </Button>
      )}
    </div>
  );
}
