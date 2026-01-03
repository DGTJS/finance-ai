"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  setIsOpen: (open: boolean) => void;
}

// Valores padrão para evitar erros durante SSR
const defaultContextValue: SidebarContextType = {
  isOpen: true,
  toggleSidebar: () => {},
  setIsOpen: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultContextValue);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpenState] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Carregar preferência do localStorage após montar
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("sidebar-open");
      if (saved !== null) {
        setIsOpenState(saved === "true");
      }
    } catch (error) {
      // Ignorar erros do localStorage (SSR, modo privado, etc)
      console.warn("Não foi possível acessar localStorage:", error);
    }
  }, []);

  // Salvar preferência no localStorage
  const setIsOpen = (open: boolean) => {
    setIsOpenState(open);
    if (mounted) {
      try {
        localStorage.setItem("sidebar-open", String(open));
      } catch (error) {
        // Ignorar erros do localStorage
        console.warn("Não foi possível salvar no localStorage:", error);
      }
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    isOpen,
    toggleSidebar,
    setIsOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  return context;
}
