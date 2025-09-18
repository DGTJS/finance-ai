import { db } from "../_lib/prisma";

const Transactions = async () => {
  const transactions = await db.transaction.findMany({});
  return (
    <div>
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          {transaction.name} {transaction.amount}
        </div>
      ))}
    </div>
  );
};

export default Transactions;
