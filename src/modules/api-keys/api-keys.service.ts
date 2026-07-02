import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { encrypt, decrypt } from "@/server/security/encryption";

const KEY_PREFIX = "va_";

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function isEncrypted(value: string): boolean {
  return value.includes(":") && value.split(":").length === 3;
}

function generateApiKey(): { key: string; prefix: string; lastChars: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const key = `${KEY_PREFIX}${raw}`;
  return {
    key,
    prefix: key.slice(0, 10),
    lastChars: key.slice(-4),
  };
}

export class ApiKeyService {
  static async list(ctx: TenantContext) {
    return prisma.apiKey.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, prefix: true, lastChars: true,
        scopes: true, active: true, expiresAt: true,
        lastUsedAt: true, usedCount: true, createdAt: true,
      },
    });
  }

  static async create(ctx: TenantContext, data: { name: string; scopes?: string[]; expiresAt?: string }) {
    const { key, prefix, lastChars } = generateApiKey();
    const keyHash = hashKey(key);
    const keyEncrypted = encrypt(key);

    const apiKey = await prisma.apiKey.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        key: keyEncrypted,
        keyHash,
        prefix,
        lastChars,
        scopes: data.scopes ?? ["read:accounts"],
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "API_KEY_CREATED", resourceType: "ApiKey", resourceId: apiKey.id,
      metadata: { name: data.name, scopes: data.scopes },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key,
      prefix: apiKey.prefix,
      lastChars: apiKey.lastChars,
      scopes: apiKey.scopes,
      active: apiKey.active,
      expiresAt: apiKey.expiresAt?.toISOString() ?? null,
      createdAt: apiKey.createdAt.toISOString(),
    };
  }

  static async update(ctx: TenantContext, keyId: string, data: {
    name?: string; scopes?: string[]; active?: boolean; expiresAt?: string | null;
  }) {
    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, companyId: ctx.companyId },
    });
    if (!existing) throw new Error("API key not found");

    const updated = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.scopes !== undefined ? { scopes: data.scopes } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } : {}),
      },
    });

    return updated;
  }

  static async delete(ctx: TenantContext, keyId: string) {
    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, companyId: ctx.companyId },
    });
    if (!existing) throw new Error("API key not found");

    await prisma.apiKey.delete({ where: { id: keyId } });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "API_KEY_DELETED", resourceType: "ApiKey", resourceId: keyId,
      metadata: { name: existing.name },
    });

    return { success: true };
  }

  static async rotate(ctx: TenantContext, keyId: string) {
    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, companyId: ctx.companyId },
    });
    if (!existing) throw new Error("API key not found");

    const { key, prefix, lastChars } = generateApiKey();
    const keyHash = hashKey(key);
    const keyEncrypted = encrypt(key);

    const updated = await prisma.apiKey.update({
      where: { id: keyId },
      data: { key: keyEncrypted, keyHash, prefix, lastChars },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "API_KEY_ROTATED", resourceType: "ApiKey", resourceId: keyId,
      metadata: { name: existing.name },
    });

    return {
      id: updated.id, name: updated.name, key, prefix: updated.prefix,
      lastChars: updated.lastChars, scopes: updated.scopes,
      active: updated.active, expiresAt: updated.expiresAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Validate an API key from the Authorization header.
   * Looks up by SHA-256 hash, supports backward-compat with plaintext keys.
   */
  static async validate(authHeader: string | null): Promise<{
    companyId: string; scopes: string[]; keyId: string;
  } | null> {
    if (!authHeader?.startsWith("Bearer ")) return null;
    const key = authHeader.slice(7);
    const keyHash = hashKey(key);

    // Look up by hash first
    let apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { company: { select: { id: true } } },
    });

    // Backward compat: try plaintext lookup for pre-migration keys
    if (!apiKey) {
      const legacy = await prisma.apiKey.findFirst({
        where: { key },
        include: { company: { select: { id: true } } },
      });

      // Migrate on read: compute hash, encrypt key in-place
      if (legacy) {
        const newHash = hashKey(key);
        const encrypted = encrypt(key);
        await prisma.apiKey.update({
          where: { id: legacy.id },
          data: { keyHash: newHash, key: encrypted },
        }).catch(() => {});
        apiKey = legacy as unknown as typeof apiKey;
      }
    }

    if (!apiKey || !apiKey.active) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    void prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date(), usedCount: { increment: 1 } },
    });

    return {
      companyId: apiKey.companyId,
      scopes: apiKey.scopes,
      keyId: apiKey.id,
    };
  }
}
