-- AlterTable
ALTER TABLE `FamilyAccount` ADD COLUMN `ownerId` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE INDEX `FamilyAccount_ownerId_idx` ON `FamilyAccount`(`ownerId`);

-- Atualizar contas existentes: definir o primeiro usuário como OWNER
UPDATE `FamilyAccount` fa
INNER JOIN (
  SELECT `familyAccountId`, MIN(`createdAt`) as minDate
  FROM `User`
  WHERE `familyAccountId` IS NOT NULL
  GROUP BY `familyAccountId`
) u ON fa.id = u.familyAccountId
INNER JOIN `User` firstUser ON firstUser.familyAccountId = fa.id AND firstUser.createdAt = u.minDate
SET fa.ownerId = firstUser.id, firstUser.role = 'OWNER';

-- Remover o DEFAULT temporário do ownerId
ALTER TABLE `FamilyAccount` MODIFY COLUMN `ownerId` VARCHAR(191) NOT NULL;


