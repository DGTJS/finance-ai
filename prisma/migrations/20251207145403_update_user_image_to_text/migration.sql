-- AlterTable
-- Alterar o campo image de VARCHAR para TEXT para suportar imagens base64 maiores
ALTER TABLE `User` MODIFY COLUMN `image` TEXT NULL;

