"use client";

import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";
import { Transaction } from "@/app/generated/prisma/client";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

interface EditTransactionButtonProps {
  Transaction: Transaction;
}

const EditTransactionButton = ({ Transaction }: EditTransactionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UpsertTransactionDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="text-muted-foreground hover:text-muted-foreground bg-transparent hover:bg-transparent"
      id={Transaction.id}
      defaultValues={{
        ...Transaction,
        amount: Transaction.amount.toString(),
        data: Transaction.date ? new Date(Transaction.date) : undefined,
      }}
    >
      <PencilIcon />
    </UpsertTransactionDialog>
  );
};

export default EditTransactionButton;
