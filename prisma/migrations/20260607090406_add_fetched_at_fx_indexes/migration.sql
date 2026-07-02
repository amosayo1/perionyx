-- AlterEnum
ALTER TYPE "RiskAlertCategory" ADD VALUE 'FX_SYNC';

-- AlterTable
ALTER TABLE "exchange_rates" ADD COLUMN     "fetchedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "exchange_rates_baseCurrency_idx" ON "exchange_rates"("baseCurrency");

-- CreateIndex
CREATE INDEX "exchange_rates_quoteCurrency_idx" ON "exchange_rates"("quoteCurrency");

-- CreateIndex
CREATE INDEX "exchange_rates_fetchedAt_idx" ON "exchange_rates"("fetchedAt");
