import { Button } from "../_components/ui/button";
import { ArrowDownUp } from "lucide-react";
import { DataTable } from "../_components/ui/data-table"; // Adjust the path if needed
import { db } from "../_lib/prisma";
import { transactionsColumns } from "./_columns/index";

const Transactions = async () => {
  const transactions = await db.transaction.findMany({});
  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <Button className="rounded-full bg-green-600 text-white hover:bg-green-600">
          Adicionar Transação <ArrowDownUp />
        </Button>
      </div>
      <DataTable columns={transactionsColumns} data={transactions} />
    </div>
  );
};

export default Transactions;
