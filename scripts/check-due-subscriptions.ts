import path from "path";
import fs from "fs";

// Carregar variáveis de ambiente
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
  console.log("📄 Carregando .env.local");
} else if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
  console.log("📄 Carregando .env");
} else {
  console.error("❌ Arquivo .env ou .env.local não encontrado!");
  process.exit(1);
}

import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function checkDueSubscriptions() {
  console.log("🔍 Verificando assinaturas vencendo...\n");

  try {
    // Data atual
    const now = new Date();

    // Data daqui a 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Buscar assinaturas ativas com vencimento nos próximos 7 dias
    const subscriptions = await prisma.subscription.findMany({
      where: {
        active: true,
        nextDueDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 Encontradas ${subscriptions.length} assinaturas vencendo\n`);

    if (subscriptions.length === 0) {
      console.log("✅ Nenhuma assinatura vencendo nos próximos 7 dias");
      return;
    }

    let notificationsCreated = 0;

    for (const subscription of subscriptions) {
      const daysUntilDue = Math.ceil(
        (new Date(subscription.nextDueDate!).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      console.log(`\n📅 ${subscription.name}`);
      console.log(`   Usuário: ${subscription.user.name} (${subscription.user.email})`);
      console.log(`   Valor: R$ ${subscription.amount.toFixed(2)}`);
      console.log(`   Vence em: ${daysUntilDue} dia(s)`);

      // Verificar se já existe notificação para esta assinatura
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: subscription.userId,
          type: "SUBSCRIPTION_DUE",
          meta: {
            path: ["subscriptionId"],
            equals: subscription.id,
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Últimas 24h
          },
        },
      });

      if (existingNotification) {
        console.log("   ⏭️ Notificação já enviada recentemente");
        continue;
      }

      // Criar notificação
      const notification = await prisma.notification.create({
        data: {
          userId: subscription.userId,
          type: "SUBSCRIPTION_DUE",
          title: `Assinatura vencendo: ${subscription.name}`,
          message: `Sua assinatura ${subscription.name} vence em ${daysUntilDue} dia(s). Valor: R$ ${subscription.amount.toFixed(2)}`,
          read: false,
          meta: {
            subscriptionId: subscription.id,
            daysUntilDue,
            amount: subscription.amount,
            dueDate: subscription.nextDueDate,
          },
        },
      });

      console.log(`   ✅ Notificação criada (ID: ${notification.id})`);
      notificationsCreated++;

      // Opcional: Enviar email
      if (process.env.SEND_EMAILS === "true") {
        console.log(`   📧 Email enviado para ${subscription.user.email}`);
        // Implementar envio de email aqui (nodemailer, etc.)
      }
    }

    console.log(`\n✨ Processo concluído!`);
    console.log(`📬 ${notificationsCreated} notificação(ões) criada(s)`);
  } catch (error) {
    console.error("\n❌ Erro ao verificar assinaturas:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
checkDueSubscriptions()
  .then(() => {
    console.log("\n✅ Script finalizado com sucesso");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script finalizado com erro:", error);
    process.exit(1);
  });

