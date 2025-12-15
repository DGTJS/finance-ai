import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Configurações para melhorar a estabilidade do Turbopack
  experimental: {
    // Desabilitar otimizações que podem causar problemas com chunks
    optimizePackageImports: [],
  },
  // Garantir que o Prisma não seja usado no Edge Runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@prisma/client");
    }
    return config;
  },
  // Não falhar o build por erros do ESLint (apenas avisar)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Não falhar o build por erros de TypeScript (apenas avisar)
  typescript: {
    ignoreBuildErrors: true,
  },
  // PWA - Configuração para Progressive Web App
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
