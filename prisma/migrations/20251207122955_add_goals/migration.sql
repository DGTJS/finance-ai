-- CreateTable
CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `targetAmount` DOUBLE NOT NULL,
    `currentAmount` DOUBLE NOT NULL DEFAULT 0,
    `deadline` DATETIME(3) NOT NULL,
    `category` ENUM('SAVINGS', 'INVESTMENT', 'EMERGENCY', 'VACATION', 'HOUSE', 'VEHICLE', 'EDUCATION', 'WEDDING', 'OTHER') NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Goal_userId_idx`(`userId`),
    INDEX `Goal_status_idx`(`status`),
    INDEX `Goal_deadline_idx`(`deadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

