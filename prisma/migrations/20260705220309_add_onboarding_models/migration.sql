-- CreateEnum
CREATE TYPE "OrganizationUnitType" AS ENUM ('SUBSIDIARY', 'LEGAL_ENTITY', 'BUSINESS_UNIT', 'DEPARTMENT', 'BRANCH', 'COST_CENTER');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "base_currency" TEXT,
ADD COLUMN     "brand_color" TEXT,
ADD COLUMN     "brand_name" TEXT,
ADD COLUMN     "fiscal_year_start" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "organization_units" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" "OrganizationUnitType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "currency" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_onboarding" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL DEFAULT 'company-setup',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_units_companyId_type_idx" ON "organization_units"("companyId", "type");

-- CreateIndex
CREATE INDEX "organization_units_parentId_idx" ON "organization_units"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "company_onboarding_companyId_key" ON "company_onboarding"("companyId");

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_onboarding" ADD CONSTRAINT "company_onboarding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
