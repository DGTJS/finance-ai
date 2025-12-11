"use server";
import { db } from "@/app/_lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import { addTransactionSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const UpsertTransaction = async (
  params: Omit<Prisma.TransactionCreateInput, "userId" | "user">,
) => {
  await addTransactionSchema.parseAsync(params);

  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  await db.transaction.upsert({
    update: {
      ...params,
      userId: session.user.id,
    },
    create: {
      ...params,
      userId: session.user.id,
    },
    where: {
      id: params.id ?? "",
    },
  });

  revalidatePath("/transactions");
};
