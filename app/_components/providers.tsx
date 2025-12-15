"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState, useEffect } from "react";
import { queryClient } from "@/src/lib/queryClient";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);
  const [mswReady, setMswReady] = useState(false);

  // Inicializar MSW em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      import("@/src/mocks/browser").then(({ worker }) => {
        worker
          .start({
            onUnhandledRequest: "bypass",
          })
          .then(() => {
            setMswReady(true);
          });
      });
    } else {
      setMswReady(true);
    }
  }, []);

  // Não renderizar até MSW estar pronto em desenvolvimento
  if (!mswReady && process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <SessionProvider
        refetchInterval={5 * 60} // Refetch a cada 5 minutos
        refetchOnWindowFocus={true} // Refetch quando a janela recebe foco
        refetchWhenOffline={false}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
