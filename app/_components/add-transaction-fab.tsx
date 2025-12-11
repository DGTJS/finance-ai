"use client";

import { FaPlus, FaMagic } from "react-icons/fa";
import { useState } from "react";
import { Button } from "./ui/button";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import AiTransactionDialog from "./ai-transaction-dialog";

const AddTransactionFab = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);

  return (
    <>
      {/* Botão Principal Flutuante */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {/* Menu de Opções */}
        {showMenu && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in">
            {/* IA */}
            <Button
              onClick={() => {
                setShowAiDialog(true);
                setShowMenu(false);
              }}
              size="lg"
              className="h-auto rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <FaMagic className="h-5 w-5" />
              <span className="text-sm font-semibold">Adicionar com IA</span>
            </Button>

            {/* Manual */}
            <Button
              onClick={() => {
                setShowTransactionDialog(true);
                setShowMenu(false);
              }}
              size="lg"
              className="h-auto rounded-full px-4 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <FaPlus className="h-5 w-5" />
              <span className="text-sm font-semibold">Adicionar Manual</span>
            </Button>
          </div>
        )}

        {/* Botão Principal */}
        <Button
          onClick={() => setShowMenu(!showMenu)}
          size="lg"
          className={`h-12 w-12 rounded-full shadow-2xl transition-all hover:scale-110 sm:h-14 sm:w-14 ${
            showMenu ? "rotate-45" : ""
          }`}
          aria-label={showMenu ? "Fechar menu" : "Abrir menu de adicionar"}
        >
          <FaPlus className="h-6 w-6 sm:h-7 sm:w-7" />
        </Button>
      </div>

      {/* Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Diálogos */}
      <UpsertTransactionDialog
        isOpen={showTransactionDialog}
        onClose={() => setShowTransactionDialog(false)}
      />
      
      <AiTransactionDialog
        isOpen={showAiDialog}
        onClose={() => setShowAiDialog(false)}
      />
    </>
  );
};

export default AddTransactionFab;



