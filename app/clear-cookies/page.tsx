"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearCookiesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"clearing" | "success" | "error">(
    "clearing"
  );

  useEffect(() => {
    const clearCookies = async () => {
      try {
        // Limpar cookies do lado do cliente também
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Limpar cookies relacionados ao NextAuth
          if (
            name.includes("next-auth") ||
            name.includes("authjs") ||
            name.includes("csrf")
          ) {
            // Limpar para diferentes paths e domains
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost`;
          }
        });

        // Chamar a API para limpar cookies do servidor
        const response = await fetch("/api/clear-cookies", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          setStatus("success");
          // Redirecionar para login após 2 segundos
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Erro ao limpar cookies:", error);
        setStatus("error");
      }
    };

    clearCookies();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "clearing" && (
          <>
            <div className="mb-4 text-lg">Limpando cookies...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mb-4 text-lg text-green-600">
              ✅ Cookies limpos com sucesso!
            </div>
            <div className="text-sm text-gray-600">
              Redirecionando para a página de login...
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-4 text-lg text-red-600">
              ❌ Erro ao limpar cookies
            </div>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ir para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}









