-- AlterTable
ALTER TABLE `transaction` ALTER COLUMN `createdByUserId` DROP DEFAULT;

-- CreateTable
CREATE TABLE `UserSettings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `hfApiKey` TEXT NULL,
    `closingDay` INTEGER NULL DEFAULT 5,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `subscriptionAlerts` BOOLEAN NOT NULL DEFAULT true,
    `transactionAlerts` BOOLEAN NOT NULL DEFAULT false,
    `aiInsights` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSettings_userId_key`(`userId`),
    INDEX `UserSettings_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
