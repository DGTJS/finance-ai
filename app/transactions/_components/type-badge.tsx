import { Badge } from "@/app/_components/ui/badge";
import { CircleIcon } from "lucide-react";

// If you have a Transaction type, import it correctly or define it here
export type TransactionType = "DEPOSIT" | "EXPENSE" | "INVESTMENT";

export interface Transaction {
  type: TransactionType;
  // add other fields as needed
}

interface TransactionTypeBadgeProps {
  transaction: Transaction;
}

const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({
  transaction,
}) => {
  if (transaction.type === "DEPOSIT") {
    return (
      <Badge className="bg-green-950 text-green-500 hover:bg-green-950">
        <CircleIcon className="mr-1 bg-green-950 fill-green-500" size={10} />
        Depósito
      </Badge>
    );
  }
  if (transaction.type === "EXPENSE") {
    return (
      <Badge className="bg-red-950 text-red-500 hover:bg-red-950">
        <CircleIcon className="mr-1 bg-red-950 fill-red-500" size={10} />
        Despesas
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-800 text-white">
      <CircleIcon className="fill-primary mr-1" size={10} />
      Investimento
    </Badge>
  );
};

export default TransactionTypeBadge;
