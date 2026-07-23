import type { DbClient } from "@/modules/audit";
import { ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { prisma as defaultPrisma } from "@/server/db/prisma";
import type { PermissionScopeType } from "@prisma/client";
import { PermissionRegistry } from "./permissions";
import { EnterpriseRoles } from "./roles";
import { recordIAMAudit, IAMAuditEvent } from "./audit-events";
import type { EnterpriseRoleId, GranularPermission, RoleAssignment } from "./types";

export class IAMAdminService {
  constructor(private prisma: DbClient = defaultPrisma) {}

  async listRoles(companyId: string, opts?: { limit?: number; offset?: number }) {
    return this.prisma.role.findMany({
      where: { companyId },
      take: opts?.limit ?? 100,
      skip: opts?.offset ?? 0,
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { name: "asc" } },
        },
        _count: { select: { userRoles: true } },
      },
    });
  }

  async getRole(roleId: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { name: "asc" } },
        },
        userRoles: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { userRoles: true } },
      },
    });
    if (!role) throw new NotFoundError("Role");
    return role;
  }

  async createRole(companyId: string, data: { name: string; description?: string; permissions?: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { companyId, name: data.name },
    });
    if (existing) {
      throw new ForbiddenError(`Role "${data.name}" already exists in this company`);
    }

    const role = await this.prisma.role.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
      },
    });

    if (data.permissions?.length) {
      for (const permName of data.permissions) {
        const permission = await this.prisma.permission.upsert({
          where: { name: permName },
          create: { name: permName, description: `Granted by role: ${data.name}` },
          update: {},
        });
        await this.prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
            scopeType: "GLOBAL",
          },
        });
      }
    }

    return role;
  }

  async updateRole(
    roleId: string,
    companyId: string,
    data: { name?: string; description?: string },
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  async deleteRole(roleId: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.userRole.deleteMany({ where: { roleId } });
    await this.prisma.role.delete({ where: { id: roleId } });
  }

  async addPermissionToRole(
    roleId: string,
    companyId: string,
    permissionName: string,
    scopeType?: PermissionScopeType,
    scopeId?: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    const permission = await this.prisma.permission.upsert({
      where: { name: permissionName },
      create: { name: permissionName },
      update: {},
    });

    const sType = scopeType ?? "GLOBAL" as PermissionScopeType;
    const existing = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId: permission.id,
        scopeType: sType,
        scopeId: scopeId ?? null,
      },
    });

    if (existing) return existing;

    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: permission.id,
        scopeType: sType,
        scopeId: scopeId ?? null,
      },
    });
  }

  async removePermissionFromRole(
    roleId: string,
    companyId: string,
    permissionName: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) return;

    await this.prisma.rolePermission.deleteMany({
      where: { roleId, permissionId: permission.id },
    });
  }

  async assignRole(
    userId: string,
    roleId: string,
    companyId: string,
    actorUserId: string,
    requestId?: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    const membership = await this.prisma.companyMembership.findFirst({
      where: { userId, companyId },
    });
    if (!membership) {
      throw new ForbiddenError("User is not a member of this company");
    }

    const result = await this.prisma.userRole.upsert({
      where: {
        userId_roleId_companyId: { userId, roleId, companyId },
      } as any,
      create: { userId, roleId, companyId },
      update: {},
    });

    await recordIAMAudit({
      prisma: this.prisma as any,
      companyId,
      actorUserId,
      event: IAMAuditEvent.ROLE_ASSIGNED,
      resourceType: "role",
      resourceId: roleId,
      metadata: { targetUserId: userId, roleName: role.name },
      requestId,
    });

    return result;
  }

  async revokeRole(
    userId: string,
    roleId: string,
    companyId: string,
    actorUserId: string,
    requestId?: string,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundError("Role");

    const result = await this.prisma.userRole.deleteMany({
      where: { userId, roleId, companyId },
    });

    if (result.count > 0) {
      await recordIAMAudit({
        prisma: this.prisma as any,
        companyId,
        actorUserId,
        event: IAMAuditEvent.ROLE_REVOKED,
        resourceType: "role",
        resourceId: roleId,
        metadata: { targetUserId: userId, roleName: role.name },
        requestId,
      });
    }

    return result;
  }

  async getUserRoles(userId: string, companyId: string) {
    return this.prisma.userRole.findMany({
      where: { userId, companyId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  async listUsers(companyId: string, opts?: { limit?: number; offset?: number; search?: string }) {
    const where: any = { companyId };
    if (opts?.search) {
      where.user = {
        OR: [
          { name: { contains: opts.search, mode: "insensitive" } },
          { email: { contains: opts.search, mode: "insensitive" } },
        ],
      };
    }

    const memberships = await this.prisma.companyMembership.findMany({
      where: { companyId },
      take: opts?.limit ?? 100,
      skip: opts?.offset ?? 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            failedLoginAttempts: true,
            lockedUntil: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      memberships.map(async (m) => ({
        ...m,
        roles: await this.prisma.userRole.findMany({
          where: { userId: m.userId, companyId },
          include: { role: { select: { id: true, name: true } } },
        }),
      })),
    );
  }

  async searchAuditLogs(
    companyId: string,
    opts: {
      limit?: number;
      cursor?: string;
      search?: string;
      actions?: string[];
      actorUserId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: any = { companyId };

    if (opts.search) {
      where.OR = [
        { action: { contains: opts.search, mode: "insensitive" } },
        { resourceType: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    if (opts.actions?.length) {
      where.action = { in: opts.actions };
    }

    if (opts.actorUserId) {
      where.actorUserId = opts.actorUserId;
    }

    if (opts.startDate || opts.endDate) {
      where.createdAt = {};
      if (opts.startDate) where.createdAt.gte = opts.startDate;
      if (opts.endDate) where.createdAt.lte = opts.endDate;
    }

    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: (opts.limit ?? 50) + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > (opts.limit ?? 50)) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return { rows, nextCursor };
  }
}

export const iamAdminService = new IAMAdminService();
