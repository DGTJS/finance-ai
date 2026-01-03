"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface CompanyData {
  companyId: string;
  companyName: string;
  hasStock: boolean;
  companyType: string;
}

interface CompanyContextType {
  company: CompanyData | null;
  setCompany: (company: CompanyData | null) => void;
  isLoading: boolean;
}

// Valores padrão para evitar erros durante SSR
const defaultContextValue: CompanyContextType = {
  company: null,
  setCompany: () => {},
  isLoading: true,
};

const CompanyContext = createContext<CompanyContextType>(defaultContextValue);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompanyState] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Carregar empresa ativa do localStorage após montar
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("active-company");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompanyState(parsed);
      }
    } catch (error) {
      // Ignorar erros do localStorage (SSR, modo privado, etc)
      console.warn("Não foi possível acessar localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar empresa ativa no localStorage
  const setCompany = (newCompany: CompanyData | null) => {
    setCompanyState(newCompany);
    if (mounted) {
      try {
        if (newCompany) {
          localStorage.setItem("active-company", JSON.stringify(newCompany));
        } else {
          localStorage.removeItem("active-company");
        }
      } catch (error) {
        // Ignorar erros do localStorage
        console.warn("Não foi possível salvar no localStorage:", error);
      }
    }
  };

  const value = {
    company,
    setCompany,
    isLoading,
  };

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

/**
 * Hook para acessar os dados da empresa ativa
 * @returns CompanyData | null - Retorna null se não houver empresa ativa
 */
export function useCompany(): CompanyData | null {
  const context = useContext(CompanyContext);

  // Se não houver empresa ativa, retornar null
  if (!context.company) {
    return null;
  }

  return context.company;
}

/**
 * Hook para acessar o contexto completo da empresa (incluindo setCompany)
 * Use este hook quando precisar atualizar a empresa ativa
 */
export function useCompanyContext(): CompanyContextType {
  return useContext(CompanyContext);
}
