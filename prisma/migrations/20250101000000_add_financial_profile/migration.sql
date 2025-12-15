-- Migration: Add Financial Profile and Update Goals
-- Created: 2025-01-XX

-- Criar tabela financial_profiles
CREATE TABLE IF NOT EXISTS `financial_profiles` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL UNIQUE,
  `rendaFixa` DOUBLE NOT NULL DEFAULT 0,
  `rendaVariavelMedia` DOUBLE NOT NULL DEFAULT 0,
  `beneficios` JSON NOT NULL DEFAULT ('[]'),
  `diaPagamento` INT NULL,
  `multiplePayments` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `financial_profiles_userId_key` (`userId`),
  KEY `financial_profiles_userId_idx` (`userId`),
  CONSTRAINT `financial_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Atualizar tabela Goal para suportar metas compartilhadas
ALTER TABLE `Goal` 
  ADD COLUMN `isShared` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `sharedWith` JSON NULL DEFAULT ('[]'),
  ADD COLUMN `ownerUserId` VARCHAR(191) NULL,
  ADD INDEX `Goal_isShared_idx` (`isShared`),
  ADD INDEX `Goal_ownerUserId_idx` (`ownerUserId`);



