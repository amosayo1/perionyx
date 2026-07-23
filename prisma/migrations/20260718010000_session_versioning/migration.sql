-- AlterTable
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "User_tokenVersion_idx" ON "User"("tokenVersion");
