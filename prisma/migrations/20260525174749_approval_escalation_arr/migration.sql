/*
  Warnings:

  - The `escalationPath` column on the `ApprovalRule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ApprovalRule" DROP COLUMN "escalationPath",
ADD COLUMN     "escalationPath" TEXT[];
