-- Script para criar tabelas de Empresa
-- Execute este script diretamente no banco de dados

-- Tabela Company
CREATE TABLE IF NOT EXISTS `company` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `companyType` VARCHAR(191) NOT NULL,
  `hasStock` BOOLEAN NOT NULL DEFAULT false,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `company_userId_idx` (`userId`),
  INDEX `company_isActive_idx` (`isActive`),
  CONSTRAINT `company_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela CompanyRevenue
CREATE TABLE IF NOT EXISTS `companyrevenue` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `origin` VARCHAR(191) NOT NULL,
  `paymentMethod` VARCHAR(191) NOT NULL,
  `date` DATETIME(3) NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `companyrevenue_companyId_idx` (`companyId`),
  INDEX `companyrevenue_userId_idx` (`userId`),
  INDEX `companyrevenue_date_idx` (`date`),
  CONSTRAINT `companyrevenue_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `companyrevenue_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela CompanyProduct
CREATE TABLE IF NOT EXISTS `companyproduct` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `minQuantity` INT NOT NULL DEFAULT 0,
  `costPrice` DOUBLE NOT NULL DEFAULT 0,
  `salePrice` DOUBLE NOT NULL DEFAULT 0,
  `margin` DOUBLE NOT NULL DEFAULT 0,
  `description` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `companyproduct_companyId_idx` (`companyId`),
  INDEX `companyproduct_userId_idx` (`userId`),
  INDEX `companyproduct_isActive_idx` (`isActive`),
  CONSTRAINT `companyproduct_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `companyproduct_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Adicionar colunas entityType e entityId na tabela fixedcost se não existirem
ALTER TABLE `fixedcost` 
ADD COLUMN IF NOT EXISTS `entityType` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `entityId` VARCHAR(191) NULL;

-- Criar índice composto se não existir
CREATE INDEX IF NOT EXISTS `fixedcost_entityType_entityId_idx` ON `fixedcost` (`entityType`, `entityId`);

