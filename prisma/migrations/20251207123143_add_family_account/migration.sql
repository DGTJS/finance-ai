-- CreateTable
CREATE TABLE `FamilyAccount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FamilyAccount_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `familyAccountId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `createdByUserId` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `User_familyAccountId_idx` ON `User`(`familyAccountId`);

-- CreateIndex
CREATE INDEX `Transaction_createdByUserId_idx` ON `Transaction`(`createdByUserId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_familyAccountId_fkey` FOREIGN KEY (`familyAccountId`) REFERENCES `FamilyAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Atualizar transações existentes para ter createdByUserId = userId
UPDATE `Transaction` SET `createdByUserId` = `userId` WHERE `createdByUserId` = '';

