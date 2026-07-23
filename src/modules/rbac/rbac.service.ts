import { prisma as defaultPrisma } from "@/server/db/prisma";
import { ForbiddenError, ValidationError } from "@/lib/errors/app-error";
import type { PermissionScopeType } from "@prisma/client";
import type { DbClient } from "@/lib/db/types";

// Permissions that are blocked in sandbox mode
const SANDBOX_RESTRICTED_PERMISSIONS = new Set([
  "admin.manage_users",
  "admin.manage_roles",
  "admin.manage_api_keys",
  "admin.manage_webhooks",
  "admin.manage_integrations",
  "admin.manage_billing",
  "admin.delete_company",
  "admin.manage_auth",
  "admin.manage_security",
  "admin.export_data",
]);

export type PermissionScope = {
  type: PermissionScopeType;
  id?: string | null;
};

export class RBACService {
  constructor(private prisma: DbClient = defaultPrisma) {}

  async createRole(companyId: string, name: string, description?: string) {
    return this.prisma.role.create({
      data: { companyId, name, description },
    });
  }

  async getAllRoles(companyId: string, opts?: { limit?: number; offset?: number }) {
    return this.prisma.role.findMany({
      where: { companyId },
      take: opts?.limit ?? 100,
      skip: opts?.offset ?? 0,
      include: {
        permissions: { include: { permission: true } },
        approvalAuthorities: true,
      },
    });
  }

  async getRoleById(roleId: string, companyId: string) {
    return this.prisma.role.findFirst({
      where: { id: roleId, companyId },
      include: {
        permissions: { include: { permission: true } },
        approvalAuthorities: true,
      },
    });
  }

  async upsertPermission(name: string, description?: string) {
    return this.prisma.permission.upsert({
      where: { name },
      create: { name, description },
      update: { description },
    });
  }

  async addPermissionToRole(
    roleId: string,
    permissionName: string,
    scopeType: PermissionScopeType = 'GLOBAL',
    scopeId?: string,
  ) {
    const permission = await this.upsertPermission(permissionName);

    const existingRolePermission = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId: permission.id, scopeType, scopeId: scopeId ?? null },
    });

    if (existingRolePermission) {
      return existingRolePermission;
    }

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId: permission.id, scopeType, scopeId: scopeId ?? null },
    });
  }

  async assignRoleToUser(userId: string, roleId: string, companyId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.companyId !== companyId) {
      throw new ValidationError("Role not found for company");
    }

    return this.prisma.userRole.upsert({
      where: { userId_roleId_companyId: { userId, roleId, companyId } } as any,
      create: { userId, roleId, companyId },
      update: {},
    });
  }

  async removeRoleFromUser(userId: string, roleId: string, companyId: string) {
    return this.prisma.userRole.deleteMany({ where: { userId, roleId, companyId } });
  }

  async getUserRoles(userId: string, companyId: string) {
    return this.prisma.userRole.findMany({ where: { userId, companyId }, include: { role: true } });
  }

  async getRolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({ where: { roleId }, include: { permission: true } });
  }

  async getUserPermissions(userId: string, companyId: string) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          userRoles: { some: { userId, companyId } },
          companyId,
        },
      },
      include: { permission: true },
    });

    const perms = new Set<string>();
    for (const rp of rolePermissions) {
      if (!rp.permission) continue;
      const name = rp.permission.name;
      const scope = rp.scopeType === 'GLOBAL' ? name : `${name}@${rp.scopeType}:${rp.scopeId ?? 'ANY'}`;
      perms.add(scope);
      perms.add(name);
    }

    return Array.from(perms);
  }

  async userHasPermission(
    userId: string,
    companyId: string,
    permissionName: string,
    scope?: PermissionScope,
  ) {
    const matchingScope = scope ?? { type: 'GLOBAL' as PermissionScopeType, id: null };
    const scopeId = matchingScope.id ?? null;

    const count = await this.prisma.rolePermission.count({
      where: {
        permission: { name: permissionName },
        role: {
          userRoles: { some: { userId, companyId } },
          companyId,
        },
        OR: [
          { scopeType: 'GLOBAL' },
          { scopeType: 'COMPANY' },
          ...(matchingScope.type === 'WALLET'
            ? [{ scopeType: 'WALLET' as PermissionScopeType, scopeId }]
            : []),
          ...(matchingScope.type === 'TRANSACTION_TYPE'
            ? [{ scopeType: 'TRANSACTION_TYPE' as PermissionScopeType, scopeId }]
            : []),
        ],
      },
    });

    return count > 0;
  }

  async ensurePermission(
    userId: string | undefined,
    companyId: string,
    permissionName: string,
    scope?: PermissionScope,
  ) {
    if (!userId) throw new ForbiddenError("Unauthenticated");

    if (SANDBOX_RESTRICTED_PERMISSIONS.has(permissionName)) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: { sandbox: true },
      });
      if (company?.sandbox) {
        throw new ForbiddenError("This action is not available in the sandbox environment.");
      }
    }

    const ok = await this.userHasPermission(userId, companyId, permissionName, scope);
    if (ok) return true;

    const userRoles = await this.prisma.userRole.count({ where: { userId, companyId } });
    if (userRoles === 0) {
      const membership = await this.prisma.companyMembership.findFirst({
        where: { userId, companyId },
      });
      if (membership?.role === "OWNER") return true;
    }

    throw new ForbiddenError("You do not have permission to perform this action.");
  }
}

export const rbacService = new RBACService();
export default RBACService;
