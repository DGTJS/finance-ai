import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  // Configurações para melhorar a estabilidade do Turbopack
  experimental: {
    // Desabilitar otimizações que podem causar problemas com chunks
    optimizePackageImports: [],
  },
};

export default nextConfig;
