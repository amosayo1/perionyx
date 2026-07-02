-- Create enum for PermissionScopeType
CREATE TYPE "PermissionScopeType" AS ENUM ('GLOBAL', 'COMPANY', 'WALLET', 'TRANSACTION_TYPE');

-- AlterTable to add scope columns to RolePermission
ALTER TABLE "RolePermission" ADD COLUMN "scopeType" "PermissionScopeType" NOT NULL DEFAULT 'GLOBAL';
ALTER TABLE "RolePermission" ADD COLUMN "scopeId" TEXT;

-- Drop old unique constraint and add new one with scope
DROP INDEX "RolePermission_roleId_permissionId_key";
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_scopeType_scopeId_key" ON "RolePermission"("roleId", "permissionId", "scopeType", "scopeId");
