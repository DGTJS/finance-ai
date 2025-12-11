import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsClient from "../_components/settings/settings-client";
import { Metadata } from "next";
import { db } from "@/app/_lib/prisma";
import { Suspense } from "react";
import { getUserSettings } from "../_actions/user-settings";
import { getFamilyAccount } from "../_actions/family-account";

export const metadata: Metadata = {
  title: "Configurações | Finance AI",
  description: "Gerencie suas preferências e configurações da conta",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscar contas vinculadas do usuário
  const accounts = await db.account.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      provider: true,
      providerAccountId: true,
      type: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Buscar configurações do usuário
  const settingsResult = await getUserSettings();
  const userSettings = settingsResult.success ? settingsResult.data : null;

  // Buscar conta compartilhada
  const familyAccountResult = await getFamilyAccount();
  const familyAccount = familyAccountResult.success ? familyAccountResult.data : null;

  // Buscar dados atualizados do usuário do banco de dados
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  // Usar dados do banco se disponíveis, caso contrário usar da sessão
  const userData = dbUser || {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <Suspense fallback={<div className="container mx-auto p-6">Carregando configurações...</div>}>
      <SettingsClient 
        user={userData} 
        accounts={accounts} 
        initialSettings={userSettings}
        familyAccount={familyAccount}
      />
    </Suspense>
  );
}
