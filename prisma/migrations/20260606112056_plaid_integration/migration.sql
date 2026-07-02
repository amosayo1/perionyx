-- AlterTable
ALTER TABLE "treasury_accounts" ADD COLUMN     "last_synced_at" TIMESTAMP(3),
ADD COLUMN     "plaid_access_token" TEXT,
ADD COLUMN     "plaid_account_id" TEXT,
ADD COLUMN     "plaid_item_id" TEXT;

-- CreateIndex
CREATE INDEX "treasury_accounts_companyId_plaid_item_id_idx" ON "treasury_accounts"("companyId", "plaid_item_id");
