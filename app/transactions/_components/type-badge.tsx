import { Badge } from "@/app/_components/ui/badge";
import { FaCircle } from "react-icons/fa";

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
        <FaCircle className="mr-1 bg-green-950 fill-green-500" size={10} />
        Depósito
      </Badge>
    );
  }
  if (transaction.type === "EXPENSE") {
    return (
      <Badge className="bg-red-950 text-red-500 hover:bg-red-950">
        <FaCircle className="mr-1 bg-red-950 fill-red-500" size={10} />
        Despesas
      </Badge>
    );
  }
  return (
    <Badge className="bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
      <FaCircle className="mr-1 fill-current" size={10} />
      Investimento
    </Badge>
  );
};

export default TransactionTypeBadge;
