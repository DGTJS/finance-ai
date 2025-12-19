"use client";

import { FaPlus, FaMagic, FaReceipt, FaTimes, FaDollarSign, FaBriefcase, FaBullseye, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import AiTransactionDialog from "./ai-transaction-dialog";
import UpsertSubscriptionDialog from "./subscription/upsert-subscription-dialog";
import WorkPeriodForm from "@/app/entrepreneur/_components/work-period-form";
import UpsertGoalDialog from "@/app/goals/_components/upsert-goal-dialog";
import { getProjects } from "@/app/_actions/project";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/app/_lib/utils";

type TransactionType = "financeiro" | "freelancer" | "assinatura" | "meta";

const AddTransactionFab = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  
  // Detectar qual view está ativa
  const currentView = searchParams?.get("view") || (pathname === "/entrepreneur" ? "freelancer" : pathname === "/dashboard" ? "financeiro" : null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showWorkPeriodDialog, setShowWorkPeriodDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

  // Buscar projetos quando o componente montar
  useEffect(() => {
    const fetchProjects = async () => {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    };
    fetchProjects();
  }, []);

  // Bloquear scroll do body quando o menu estiver aberto
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  const handleTypeSelect = (type: TransactionType, useAI: boolean = false) => {
    setSelectedType(type);
    setShowMenu(false);
    
    if (useAI) {
      setShowAiDialog(true);
    } else {
      switch (type) {
        case "financeiro":
          setShowTransactionDialog(true);
          break;
        case "freelancer":
          // Navegar para o dashboard com view freelancer
          router.push("/dashboard?view=freelancer");
          break;
        case "assinatura":
          setShowSubscriptionDialog(true);
          break;
        case "meta":
          setShowGoalDialog(true);
          break;
      }
    }
  };

  const handleSuccess = () => {
    // Fechar o diálogo e atualizar projetos se necessário
    setShowWorkPeriodDialog(false);
    setShowSubscriptionDialog(false);
    setShowGoalDialog(false);
    setShowTransactionDialog(false);
    
    // Recarregar projetos
    const fetchProjects = async () => {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    };
    fetchProjects();
  };

  const handleProjectCreated = () => {
    // Recarregar projetos quando um novo projeto é criado
    const fetchProjects = async () => {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    };
    fetchProjects();
  };

  const handleSubscriptionSuccess = (subscription?: any) => {
    setShowSubscriptionDialog(false);
    handleSuccess();
  };

  return (
    <>
      {/* Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Menu Lateral (Drawer) */}
      <div
        className={cn(
          "bg-background fixed top-0 right-0 z-[70] h-full w-80 max-w-[85vw] border-l shadow-2xl transition-transform duration-300 ease-in-out",
          showMenu ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 shrink-0">
            <h2 className="text-lg font-bold">Adicionar</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(false)}
              className="h-8 w-8 p-0"
            >
              <FaTimes className="h-5 w-5" />
            </Button>
          </div>

          {/* Conteúdo com scroll customizado */}
          <div className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4">
            <div className="space-y-4">
              {/* Seção: Escolher Tipo */}
              <div>
                <p className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  Escolha o tipo
                </p>
                <div className="space-y-2">
                  <Button
                    variant={currentView === "financeiro" ? "default" : "outline"}
                    className={cn(
                      "h-auto w-full justify-start gap-3 px-4 py-3",
                      currentView === "financeiro" && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleTypeSelect("financeiro")}
                  >
                    <FaDollarSign className="h-5 w-5 text-green-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Financeiro</div>
                      <div className="text-muted-foreground text-xs">Transação financeira</div>
                    </div>
                    {currentView === "financeiro" && (
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </Button>

                  <Button
                    variant={currentView === "freelancer" ? "default" : "outline"}
                    className={cn(
                      "h-auto w-full justify-start gap-3 px-4 py-3",
                      currentView === "freelancer" && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleTypeSelect("freelancer")}
                  >
                    <FaUser className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Freelancer</div>
                      <div className="text-muted-foreground text-xs">Período de trabalho</div>
                    </div>
                    {currentView === "freelancer" && (
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 px-4 py-3"
                    onClick={() => handleTypeSelect("assinatura")}
                  >
                    <FaBriefcase className="h-5 w-5 text-purple-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Assinatura</div>
                      <div className="text-muted-foreground text-xs">Nova assinatura</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 px-4 py-3"
                    onClick={() => handleTypeSelect("meta")}
                  >
                    <FaBullseye className="h-5 w-5 text-orange-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Meta</div>
                      <div className="text-muted-foreground text-xs">Nova meta financeira</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Seção: Adicionar com IA */}
              <div>
                <p className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wider">
                  Com Inteligência Artificial
                </p>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start gap-3 border-purple-200 bg-purple-50 px-4 py-3 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/20 dark:hover:bg-purple-950/40"
                  onClick={() => handleTypeSelect("financeiro", true)}
                >
                  <FaMagic className="h-5 w-5 text-purple-600" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Adicionar com IA</div>
                    <div className="text-muted-foreground text-xs">Use IA para criar transações</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Principal Flutuante - só em telas sm+ */}
      <div className={cn(
        "fixed right-4 bottom-4 z-50 hidden transition-opacity duration-300 sm:right-6 sm:bottom-6 sm:flex",
        showMenu && "opacity-0 pointer-events-none"
      )}>
        <TooltipProvider delayDuration={300}>
          <Tooltip open={!showMenu ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowMenu(!showMenu)}
                size="lg"
                className="group bg-gradient-to-r from-green-500 to-green-600 h-auto rounded-full px-6 py-4 text-white shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:from-green-600 hover:to-green-700"
                aria-label="Adicionar transação"
              >
                <div className="flex items-center gap-2">
                  <FaPlus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="text-base font-bold hidden md:inline">
                    Adicionar Transação
                  </span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[250px] p-3">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Adicionar Transação</p>
                <p className="text-xs text-muted-foreground">
                  Clique para adicionar transações financeiras, períodos de trabalho, assinaturas ou metas. Você também pode usar IA para criar transações automaticamente.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* FAB mobile: botão centralizado na parte inferior */}
      <div className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-300 sm:hidden",
        showMenu && "opacity-0 pointer-events-none"
      )}>
        <TooltipProvider delayDuration={300}>
          <Tooltip open={!showMenu ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowMenu(!showMenu)}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 h-14 w-14 rounded-full text-white shadow-2xl transition-all hover:scale-110 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:from-green-600 hover:to-green-700"
                aria-label="Adicionar transação"
              >
                <FaPlus className="h-6 w-6 transition-transform duration-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] p-3">
              <div className="space-y-1">
                <p className="font-semibold text-sm">➕ Adicionar Transação</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toque para adicionar transações financeiras, períodos de trabalho, assinaturas ou metas
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Diálogos */}
      <UpsertTransactionDialog
        isOpen={showTransactionDialog}
        onClose={() => setShowTransactionDialog(false)}
      />

      <AiTransactionDialog
        isOpen={showAiDialog}
        onClose={() => setShowAiDialog(false)}
      />

      <UpsertSubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={handleSubscriptionSuccess}
      />

      <WorkPeriodForm
        isOpen={showWorkPeriodDialog}
        onClose={() => setShowWorkPeriodDialog(false)}
        projects={projects}
        onSuccess={handleSuccess}
        onProjectCreated={handleProjectCreated}
      />

      <UpsertGoalDialog
        isOpen={showGoalDialog}
        onClose={() => setShowGoalDialog(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default AddTransactionFab;
