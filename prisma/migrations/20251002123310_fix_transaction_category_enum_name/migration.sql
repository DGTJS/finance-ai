/*
  Warnings:

  - Changed the type of `category` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."TransactionCategory" AS ENUM ('HOUSING', 'TRANSPORTATION', 'FOOD', 'ENTERTAINMENT', 'HEALTH', 'UTILITY', 'SALARY', 'EDUCATION', 'OTHER');

-- AlterTable (preserving data)
ALTER TABLE "public"."Transaction" ALTER COLUMN "category" TYPE "public"."TransactionCategory" USING "category"::text::"public"."TransactionCategory";

-- DropEnum
DROP TYPE "public"."TranscationCategory";

