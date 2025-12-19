#!/usr/bin/env tsx
/**
 * Script completo de testes para Finance AI
 * Testa: banco de dados, build, lint, testes unitários, e mais
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config({ path: ".env.local" });
config();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(name: string, command: () => void): TestResult {
  const start = Date.now();
  log(`\n🧪 ${name}...`, "cyan");
  
  try {
    command();
    const duration = Date.now() - start;
    log(`✅ ${name} - PASSOU (${duration}ms)`, "green");
    return { name, passed: true, duration };
  } catch (error: any) {
    const duration = Date.now() - start;
    log(`❌ ${name} - FALHOU (${duration}ms)`, "red");
    return {
      name,
      passed: false,
      error: error.message || String(error),
      duration,
    };
  }
}

function execCommand(command: string, options: { cwd?: string; stdio?: any } = {}) {
  try {
    execSync(command, {
      stdio: options.stdio || "inherit",
      cwd: options.cwd || process.cwd(),
      env: { ...process.env },
    });
  } catch (error: any) {
    throw new Error(`Comando falhou: ${command}\n${error.message}`);
  }
}

async function main() {
  log("\n" + "=".repeat(60), "blue");
  log("🚀 TESTE COMPLETO DO FINANCE AI", "blue");
  log("=".repeat(60) + "\n", "blue");

  // 1. Verificar arquivos essenciais
  results.push(
    runTest("Verificar arquivos essenciais", () => {
      const requiredFiles = [
        "package.json",
        "tsconfig.json",
        "next.config.ts",
        "prisma/schema.prisma",
        "auth.ts",
        "middleware.ts",
      ];

      const missing = requiredFiles.filter((file) => !existsSync(file));
      if (missing.length > 0) {
        throw new Error(`Arquivos faltando: ${missing.join(", ")}`);
      }
    })
  );

  // 2. Verificar variáveis de ambiente
  results.push(
    runTest("Verificar variáveis de ambiente", () => {
      const required = ["DATABASE_URL"];
      const missing = required.filter((key) => !process.env[key]);
      if (missing.length > 0) {
        throw new Error(`Variáveis faltando: ${missing.join(", ")}`);
      }
    })
  );

  // 3. Verificar dependências instaladas
  results.push(
    runTest("Verificar node_modules", () => {
      if (!existsSync("node_modules")) {
        throw new Error("node_modules não encontrado. Execute: npm install");
      }
    })
  );

  // 4. Testar Prisma Client
  results.push(
    runTest("Gerar Prisma Client", () => {
      execCommand("npx prisma generate", { stdio: "pipe" });
    })
  );

  // 5. Testar conexão com banco de dados
  results.push(
    runTest("Testar conexão com banco de dados", () => {
      execCommand("npm run test:db", { stdio: "pipe" });
    })
  );

  // 6. Testar lint
  results.push(
    runTest("Executar ESLint", () => {
      execCommand("npm run lint", { stdio: "pipe" });
    })
  );

  // 7. Testar TypeScript
  results.push(
    runTest("Verificar tipos TypeScript", () => {
      execCommand("npx tsc --noEmit", { stdio: "pipe" });
    })
  );

  // 8. Testar testes unitários
  results.push(
    runTest("Executar testes unitários", () => {
      execCommand("npm test -- --run", { stdio: "pipe" });
    })
  );

  // 9. Testar build (sem output)
  results.push(
    runTest("Testar build de produção", () => {
      // Limpar cache primeiro
      if (existsSync(".next")) {
        execCommand("npm run clean:win", { stdio: "pipe" });
      }
      // Build sem output para ser mais rápido
      execCommand("npm run build:webpack", { stdio: "pipe" });
    })
  );

  // 10. Verificar estrutura de pastas
  results.push(
    runTest("Verificar estrutura de pastas", () => {
      const requiredDirs = [
        "app",
        "app/_components",
        "app/_lib",
        "app/api",
        "prisma",
        "scripts",
        "__tests__",
      ];

      const missing = requiredDirs.filter((dir) => !existsSync(dir));
      if (missing.length > 0) {
        throw new Error(`Pastas faltando: ${missing.join(", ")}`);
      }
    })
  );

  // Resumo final
  log("\n" + "=".repeat(60), "blue");
  log("📊 RESUMO DOS TESTES", "blue");
  log("=".repeat(60) + "\n", "blue");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  results.forEach((result) => {
    if (result.passed) {
      log(`✅ ${result.name} (${result.duration}ms)`, "green");
    } else {
      log(`❌ ${result.name} (${result.duration}ms)`, "red");
      if (result.error) {
        log(`   Erro: ${result.error}`, "yellow");
      }
    }
  });

  log("\n" + "-".repeat(60), "blue");
  log(`Total: ${results.length} testes`, "cyan");
  log(`✅ Passou: ${passed}`, "green");
  log(`❌ Falhou: ${failed}`, failed > 0 ? "red" : "green");
  log(`⏱️  Tempo total: ${totalDuration}ms`, "cyan");
  log("-".repeat(60) + "\n", "blue");

  if (failed > 0) {
    log("⚠️  Alguns testes falharam. Verifique os erros acima.", "yellow");
    process.exit(1);
  } else {
    log("🎉 Todos os testes passaram!", "green");
    process.exit(0);
  }
}

main().catch((error) => {
  log(`\n❌ Erro fatal: ${error.message}`, "red");
  process.exit(1);
});








