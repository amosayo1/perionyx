import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    company: { findUnique: vi.fn() },
    rolePermission: { count: vi.fn() },
    userRole: { count: vi.fn() },
    companyMembership: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/server/db/prisma";
import { RBACService } from "@/modules/rbac/rbac.service";
import { ForbiddenError } from "@/lib/errors/app-error";

describe("RBACService.ensurePermission", () => {
  let service: RBACService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RBACService();
  });

  it("throws ForbiddenError when userId is undefined (unauthenticated)", async () => {
    await expect(
      service.ensurePermission(undefined, "c1", "some.permission"),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ForbiddenError with 'Unauthenticated' message when no userId", async () => {
    try {
      await service.ensurePermission(undefined, "c1", "some.permission");
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenError);
      expect((e as ForbiddenError).message).toBe("Unauthenticated");
    }
  });

  describe("sandbox restrictions", () => {
    const sandboxRestrictedPerms = [
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
    ];

    it.each(sandboxRestrictedPerms)("blocks %s in sandbox mode", async (perm) => {
      (prisma.company.findUnique as Mock).mockResolvedValue({ sandbox: true });

      await expect(
        service.ensurePermission("u1", "c1", perm),
      ).rejects.toThrow("not available in the sandbox");
    });

    it("allows non-restricted permissions in sandbox mode", async () => {
      (prisma.company.findUnique as Mock).mockResolvedValue({ sandbox: true });
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(1);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue(null);

      await expect(
        service.ensurePermission("u1", "c1", "treasury.view_balance"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("does not check sandbox for non-restricted permissions", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(1);

      const result = await service.ensurePermission("u1", "c1", "treasury.view_balance");

      expect(result).toBe(true);
      expect(prisma.company.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("permission checks", () => {
    it("returns true when user has the required permission", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(1);

      const result = await service.ensurePermission("u1", "c1", "treasury.view_balance");

      expect(result).toBe(true);
      expect(prisma.rolePermission.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            permission: { name: "treasury.view_balance" },
          }),
        }),
      );
    });

    it("throws ForbiddenError when user lacks the permission", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(1);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue(null);

      await expect(
        service.ensurePermission("u1", "c1", "treasury.view_balance"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws ForbiddenError with permission name in message", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(1);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue(null);

      try {
        await service.ensurePermission("u1", "c1", "admin.delete_something");
      } catch (e) {
        expect((e as ForbiddenError).message).toContain("admin.delete_something");
      }
    });
  });

  describe("OWNER fallback", () => {
    it("allows user without roles but with OWNER membership", async () => {
      (prisma.company.findUnique as Mock).mockResolvedValue({ sandbox: false });
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(0);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue({ role: "OWNER" });

      const result = await service.ensurePermission("u1", "c1", "admin.manage_users");

      expect(result).toBe(true);
    });

    it("does not fallback for non-OWNER membership", async () => {
      (prisma.company.findUnique as Mock).mockResolvedValue({ sandbox: false });
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(0);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue({ role: "MEMBER" });

      await expect(
        service.ensurePermission("u1", "c1", "admin.manage_billing"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("still throws when OWNER but lacks permission and has roles assigned", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(1);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue({ role: "OWNER" });

      await expect(
        service.ensurePermission("u1", "c1", "some.permission"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("does not check sandbox for non-restricted permission in OWNER fallback", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(0);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue({ role: "OWNER" });

      const result = await service.ensurePermission("u1", "c1", "treasury.view_balance");

      expect(result).toBe(true);
      expect(prisma.company.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("scope parameter", () => {
    it("passes scope to userHasPermission", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(1);

      await service.ensurePermission("u1", "c1", "wallet.manage", {
        type: "WALLET",
        id: "wallet-1",
      });

      expect(prisma.rolePermission.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { scopeType: "GLOBAL" },
              { scopeType: "COMPANY" },
              { scopeType: "WALLET" as any, scopeId: "wallet-1" },
            ]),
          }),
        }),
      );
    });

    it("defaults to GLOBAL scope when not provided", async () => {
      (prisma.rolePermission.count as Mock).mockResolvedValue(0);
      (prisma.userRole.count as Mock).mockResolvedValue(1);
      (prisma.companyMembership.findFirst as Mock).mockResolvedValue(null);

      await expect(
        service.ensurePermission("u1", "c1", "some.permission"),
      ).rejects.toThrow();

      expect(prisma.rolePermission.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { scopeType: "GLOBAL" },
              { scopeType: "COMPANY" },
            ]),
          }),
        }),
      );
    });
  });
});
