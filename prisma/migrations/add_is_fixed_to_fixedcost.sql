-- Adicionar campo isFixed à tabela fixedcost
-- Se o campo já existir, o comando será ignorado
ALTER TABLE `fixedcost` 
ADD COLUMN IF NOT EXISTS `isFixed` BOOLEAN NOT NULL DEFAULT true;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS `fixedcost_isFixed_idx` ON `fixedcost`(`isFixed`);




