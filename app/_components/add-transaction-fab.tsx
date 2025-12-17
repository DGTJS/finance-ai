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
      {/* Botão Principal Flutuante - só em telas sm+ */}
      <div className="fixed right-4 bottom-4 z-50 hidden flex-col items-end gap-3 sm:right-6 sm:bottom-6 sm:flex">
        {/* Menu de Opções */}
        {showMenu && (
          <div className="animate-in slide-in-from-bottom-2 fade-in mb-2 flex flex-col gap-2">
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

      {/* FAB mobile: botão centralizado na parte inferior */}
      <div className="fixed bottom-2 left-1/2 z-50 -translate-x-1/2 sm:hidden">
        <Button
          onClick={() => setShowMenu(!showMenu)}
          size="lg"
          className={`bg-primary h-12 w-12 rounded-full text-white shadow-2xl transition-all hover:scale-110 ${
            showMenu ? "rotate-45" : ""
          }`}
          aria-label={showMenu ? "Fechar menu" : "Abrir menu de adicionar"}
        >
          <FaPlus className="h-6 w-6" />
        </Button>
        {/* Menu de opções mobile */}
        {showMenu && (
          <div className="animate-in slide-in-from-bottom-2 fade-in absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
            <Button
              onClick={() => {
                setShowAiDialog(true);
                setShowMenu(false);
              }}
              size="sm"
              className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 text-white shadow-lg"
            >
              <FaMagic className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setShowTransactionDialog(true);
                setShowMenu(false);
              }}
              size="sm"
              className="rounded-full px-3 py-2 shadow-lg"
            >
              <FaPlus className="h-4 w-4" />
            </Button>
          </div>
        )}
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
