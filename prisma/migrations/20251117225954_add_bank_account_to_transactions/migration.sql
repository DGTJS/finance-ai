-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `bankAccountId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Transaction_bankAccountId_idx` ON `Transaction`(`bankAccountId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
