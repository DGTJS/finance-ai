-- AlterTable
ALTER TABLE `Transaction` MODIFY `paymentMethod` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'BANK_SLIP', 'CASH', 'PIX', 'BENEFIT', 'OTHER') NOT NULL;









