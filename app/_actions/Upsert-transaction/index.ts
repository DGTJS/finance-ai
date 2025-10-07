"use server";
import { db } from "@/app/_lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { addTransactionSchema } from "./schema";
import { revalidatePath } from "next/cache";

export const UpsertTransaction = async (
  params: Omit<Prisma.TransactionCreateInput, "UserId">,
) => {
  await addTransactionSchema.parseAsync(params);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  await db.transaction.upsert({
    update: {
      ...params,
      UserId: userId,
    },
    create: {
      ...params,
      UserId: userId,
    },
    where: {
      id: params.id ?? "",
    },
  });

  revalidatePath("/transactions");
};
