import { createHmac, randomBytes } from "crypto";
import { prisma } from "@/server/db/prisma";
import { ValidationError } from "@/lib/errors/app-error";
import type { TenantContext } from "@/server/context/tenant-context";

const LICENSE_SECRET = process.env.LICENSE_SECRET ?? "dev-secret-change-in-prod";

type LicenseResult = { valid: true } | { valid: false; reason: string };

const cache = new Map<string, { result: LicenseResult; expiresAt: number }>();

function cacheKey(companyId: string): string {
  return `license:${companyId}`;
}

function getCached(companyId: string): LicenseResult | null {
  const entry = cache.get(cacheKey(companyId));
  if (entry && entry.expiresAt > Date.now()) return entry.result;
  return null;
}

function setCached(companyId: string, result: LicenseResult): void {
  cache.set(cacheKey(companyId), { result, expiresAt: Date.now() + 60_000 });
}

export class LicenseService {
  static generateKey(companyId: string): string {
    const raw = `vlt_${companyId}_${randomBytes(4).toString("hex")}`;
    const sig = createHmac("sha256", LICENSE_SECRET).update(raw).digest("hex").slice(0, 8);
    return `${raw}_${sig}`;
  }

  static verifyKeySignature(key: string): boolean {
    const parts = key.split("_");
    const sig = parts.pop();
    const raw = parts.join("_");
    const expected = createHmac("sha256", LICENSE_SECRET).update(raw).digest("hex").slice(0, 8);
    return sig === expected;
  }

  static async validateCompany(companyId: string): Promise<LicenseResult> {
    const cached = getCached(companyId);
    if (cached) return cached;

    const license = await prisma.license.findUnique({ where: { companyId } });
    if (!license) {
      const result: LicenseResult = { valid: false, reason: "No license found for this company" };
      setCached(companyId, result);
      return result;
    }
    if (license.status !== "ACTIVE") {
      const result: LicenseResult = { valid: false, reason: `License is ${license.status.toLowerCase()}` };
      setCached(companyId, result);
      return result;
    }
    if (license.expiresAt && license.expiresAt < new Date()) {
      const result: LicenseResult = { valid: false, reason: "License has expired" };
      setCached(companyId, result);
      return result;
    }

    const ok: LicenseResult = { valid: true };
    setCached(companyId, ok);
    return ok;
  }

  static async issueLicense(
    ctx: TenantContext,
    data: {
      companyId: string;
      seats?: number;
      features?: Record<string, unknown>;
      expiresAt?: string;
    },
  ) {
    const existing = await prisma.license.findUnique({ where: { companyId: data.companyId } });
    if (existing) throw new ValidationError("Company already has a license");

    const key = this.generateKey(data.companyId);
    return prisma.license.create({
      data: {
        companyId: data.companyId,
        key,
        seats: data.seats ?? 5,
        features: (data.features ?? {}) as any,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  static async revokeLicense(licenseId: string, reason?: string) {
    const license = await prisma.license.update({
      where: { id: licenseId },
      data: { status: "REVOKED", revokedAt: new Date(), revocationReason: reason ?? null },
    });
    cache.delete(cacheKey(license.companyId));
    return license;
  }

  static async listLicenses(ctx: TenantContext) {
    return prisma.license.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async validateSeats(companyId: string): Promise<LicenseResult> {
    const license = await prisma.license.findUnique({ where: { companyId } });
    if (!license) return { valid: false, reason: "No license" };
    if (license.status !== "ACTIVE") return { valid: false, reason: "License not active" };

    const count = await prisma.companyMembership.count({ where: { companyId } });
    if (count >= license.seats) {
      return { valid: false, reason: `Seat limit (${license.seats}) reached` };
    }
    return { valid: true };
  }
}
