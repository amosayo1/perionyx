-- CreateEnum
CREATE TYPE "VersionChangeType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "intelligence_snapshots" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DECIMAL(38,12) NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "briefings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sections" JSONB NOT NULL,
    "recommendations" TEXT[],
    "requestedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_versions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changedByUserId" TEXT,
    "changeType" "VersionChangeType" NOT NULL DEFAULT 'UPDATE',
    "changedFields" TEXT[],
    "previousVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "object_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "companySize" TEXT,
    "country" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intelligence_snapshots_companyId_metric_takenAt_idx" ON "intelligence_snapshots"("companyId", "metric", "takenAt");

-- CreateIndex
CREATE INDEX "briefings_companyId_period_createdAt_idx" ON "briefings"("companyId", "period", "createdAt");

-- CreateIndex
CREATE INDEX "object_versions_companyId_entityType_entityId_createdAt_idx" ON "object_versions"("companyId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "object_versions_companyId_entityType_entityId_version_idx" ON "object_versions"("companyId", "entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "object_versions_previousVersionId_idx" ON "object_versions"("previousVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "object_versions_companyId_entityType_entityId_version_key" ON "object_versions"("companyId", "entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "demo_requests_email_idx" ON "demo_requests"("email");

-- CreateIndex
CREATE INDEX "demo_requests_status_idx" ON "demo_requests"("status");

-- CreateIndex
CREATE INDEX "demo_requests_createdAt_idx" ON "demo_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "intelligence_snapshots" ADD CONSTRAINT "intelligence_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_versions" ADD CONSTRAINT "object_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_versions" ADD CONSTRAINT "object_versions_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
