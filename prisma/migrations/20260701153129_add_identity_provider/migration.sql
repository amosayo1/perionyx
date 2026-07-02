-- CreateTable
CREATE TABLE "identity_providers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'configuring',
    "label" TEXT NOT NULL,
    "domain" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identity_providers_companyId_kind_key" ON "identity_providers"("companyId", "kind");

-- CreateIndex
CREATE INDEX "identity_providers_companyId_idx" ON "identity_providers"("companyId");

-- CreateIndex
CREATE INDEX "identity_providers_companyId_status_idx" ON "identity_providers"("companyId", "status");

-- AddForeignKey
ALTER TABLE "identity_providers" ADD CONSTRAINT "identity_providers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
