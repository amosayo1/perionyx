import { prisma } from "@/server/db/prisma";
import { encrypt, decrypt } from "@/server/security/encryption";
import type { TenantContext } from "@/server/context/tenant-context";
import type { CredentialData } from "./types";

export class CredentialManagerService {
  static async storeCredential(ctx: TenantContext, instanceId: string, key: string, value: string): Promise<void> {
    const encryptedValue = encrypt(value);
    await prisma.integrationCredential.upsert({
      where: { instanceId_key: { instanceId, key } },
      update: { encryptedValue, version: { increment: 1 } },
      create: { instanceId, companyId: ctx.companyId, key, encryptedValue },
    });
  }

  static async getCredential(ctx: TenantContext, instanceId: string, key: string): Promise<string | null> {
    const cred = await prisma.integrationCredential.findUnique({ where: { instanceId_key: { instanceId, key } } });
    if (!cred) return null;
    try { return decrypt(cred.encryptedValue); } catch { return null; }
  }

  static async rotateCredential(ctx: TenantContext, instanceId: string, key: string, newValue: string): Promise<void> {
    const encryptedValue = encrypt(newValue);
    await prisma.integrationCredential.update({
      where: { instanceId_key: { instanceId, key } },
      data: { encryptedValue, rotatedAt: new Date(), version: { increment: 1 } },
    });
  }

  static async deleteCredential(ctx: TenantContext, instanceId: string, key: string): Promise<void> {
    await prisma.integrationCredential.delete({ where: { instanceId_key: { instanceId, key } } });
  }

  static async listCredentials(ctx: TenantContext, instanceId: string): Promise<CredentialData[]> {
    const creds = await prisma.integrationCredential.findMany({ where: { instanceId, companyId: ctx.companyId } });
    return creds.map(c => ({ id: c.id, instanceId: c.instanceId, key: c.key, expiresAt: c.expiresAt?.toISOString(), rotatedAt: c.rotatedAt?.toISOString(), version: c.version }));
  }

  static async validateCredentials(ctx: TenantContext, instanceId: string): Promise<{ valid: boolean; expiring: boolean; expired: string[] }> {
    const creds = await prisma.integrationCredential.findMany({ where: { instanceId, companyId: ctx.companyId } });
    const expired: string[] = [];
    let expiring = false;
    const now = new Date();
    for (const c of creds) {
      if (c.expiresAt && c.expiresAt < now) expired.push(c.key);
      if (c.expiresAt && c.expiresAt > now && c.expiresAt < new Date(now.getTime() + 7 * 86400000)) expiring = true;
    }
    return { valid: expired.length === 0, expiring, expired };
  }
}
