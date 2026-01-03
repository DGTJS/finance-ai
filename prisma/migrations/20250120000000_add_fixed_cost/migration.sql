-- Migration: Add FixedCost table
-- Created: 2025-01-20

-- Criar tabela FixedCost
CREATE TABLE IF NOT EXISTS `FixedCost` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY',
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `FixedCost_userId_idx` (`userId`),
  KEY `FixedCost_isActive_idx` (`isActive`),
  CONSTRAINT `FixedCost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




