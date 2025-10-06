"use client";

import UpsertTransactionDialog from "./upsert-transaction-dialog";
import { useState } from "react";
import { ArrowDownUp } from "lucide-react";

const AddTransactionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UpsertTransactionDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="rounded-full bg-green-600 text-white hover:bg-green-600"
    >
      Adicionar Transação <ArrowDownUp />
    </UpsertTransactionDialog>
  );
};

export default AddTransactionButton;
