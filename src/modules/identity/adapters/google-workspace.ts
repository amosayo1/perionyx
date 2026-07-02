import type { CompanyRole } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit";
import { logger } from "@/lib/logger";
import type { IIdentityProvider } from "../provider";
import type {
  AuthRequest,
  AuthResult,
  ProviderUser,
  DirectorySyncResult,
  IdentityProviderConfig,
  IdentityProviderCapabilities,
} from "../types";

const GOOGLE_OAUTH_URL = "https://accounts.google.com";
const GOOGLE_ADMIN_API = "https://admin.googleapis.com/admin/directory/v1";

const capabilities: IdentityProviderCapabilities = {
  authentication: true,
  provisioning: true,
  directorySync: true,
  mfa: true,
  sso: true,
};

interface GoogleMetadata {
  clientId: string;
  clientSecret: string;
  domain?: string;
  adminEmail?: string;
  groupRoleMap?: string;
}

interface CachedJwks {
  keys: Record<string, any>;
  fetchedAt: number;
}

interface RawIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  hd?: string;
  groups?: string[];
  [key: string]: unknown;
}

function getMetadata(config: IdentityProviderConfig): GoogleMetadata {
  const m = config.metadata;
  return {
    clientId: m.clientId ?? "",
    clientSecret: m.clientSecret ?? "",
    domain: m.domain,
    adminEmail: m.adminEmail,
    groupRoleMap: m.groupRoleMap,
  };
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function decodeJwt(token: string): { header: any; payload: RawIdTokenPayload } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  return {
    header: JSON.parse(base64UrlDecode(parts[0])),
    payload: JSON.parse(base64UrlDecode(parts[1])) as RawIdTokenPayload,
  };
}

function parseGroupRoleMap(raw: string | undefined): Record<string, CompanyRole> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, CompanyRole>;
  } catch {
    return {};
  }
}

export class GoogleWorkspaceProvider implements IIdentityProvider {
  readonly kind = "google-workspace";
  readonly label = "Google Workspace";
  readonly capabilities = capabilities;

  private config: IdentityProviderConfig | null = null;
  private jwksCache: CachedJwks | null = null;

  async initialize(config: IdentityProviderConfig): Promise<void> {
    const meta = getMetadata(config);
    if (!meta.clientId) throw new Error("clientId is required for Google Workspace");
    if (!meta.clientSecret) throw new Error("clientSecret is required for Google Workspace");
    this.config = config;
  }

  async authenticate(request: AuthRequest): Promise<AuthResult> {
    if (!this.config) throw new Error("Provider not initialized");
    const meta = getMetadata(this.config);

    if (!request.code) {
      throw new Error("Authorization code is required for Google Workspace authentication");
    }

    const tokens = await this.exchangeCodeForTokens(meta, request.code, request.redirectUri ?? "");
    const idToken: string = tokens.id_token;

    const payload = await this.verifyJwtLocally(idToken);
    if (!payload) throw new Error("ID token verification failed");

    const email = payload.email;
    if (!email) throw new Error("Email not found in ID token");

    const name = payload.name ?? null;
    const hd = payload.hd;

    if (meta.domain && hd && hd !== meta.domain) {
      throw new Error(`Domain mismatch: expected ${meta.domain}, got ${hd}`);
    }

    const groups: string[] = payload.groups ?? [];
    const groupRoleMap = parseGroupRoleMap(meta.groupRoleMap);
    const roles: CompanyRole[] = [];
    for (const groupId of groups) {
      const role = groupRoleMap[groupId];
      if (role) roles.push(role);
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
      include: { accounts: { where: { provider: "google-workspace" } } },
    });

    let userId: string;

    if (existingUser) {
      const existingAccount = existingUser.accounts.find(
        (a) => a.provider === "google-workspace" && a.providerAccountId === payload.sub,
      );
      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oidc",
            provider: "google-workspace",
            providerAccountId: payload.sub,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600),
            id_token: idToken,
            scope: "openid profile email",
          },
        });
      }
      userId = existingUser.id;
    } else {
      const companyId = this.config.companyId;
      const created = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: null,
          accounts: {
            create: {
              type: "oidc",
              provider: "google-workspace",
              providerAccountId: payload.sub,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600),
              id_token: idToken,
              scope: "openid profile email",
            },
          },
          memberships: {
            create: {
              companyId,
              role: (roles[0] ?? "MEMBER") as CompanyRole,
            },
          },
        },
      });
      userId = created.id;
    }

    await recordAudit(prisma, {
      action: "IDENTITY_AUTH_SUCCESS",
      resourceType: "identity",
      companyId: this.config.companyId,
      actorUserId: userId,
      metadata: { provider: "google-workspace", email, method: "oidc" },
    });

    return {
      userId,
      email,
      name,
      providerKind: "google-workspace",
      providerId: payload.sub,
      mfaRequired: false,
    };
  }

  async validateToken(token: string): Promise<ProviderUser | null> {
    if (!this.config) throw new Error("Provider not initialized");
    try {
      const payload = await this.verifyJwtLocally(token);
      if (!payload) return null;

      const meta = getMetadata(this.config);
      const groupRoleMap = parseGroupRoleMap(meta.groupRoleMap);
      const groups: string[] = payload.groups ?? [];
      const roles: string[] = [];
      for (const groupId of groups) {
        const role = groupRoleMap[groupId];
        if (role) roles.push(role);
      }

      return {
        externalId: payload.sub,
        email: payload.email ?? "",
        name: payload.name ?? null,
        groups,
        roles,
        active: true,
      };
    } catch (err) {
      logger.error({ err }, "Google Workspace token validation failed");
      return null;
    }
  }

  async provisionUser(user: ProviderUser): Promise<string> {
    if (!this.config) throw new Error("Provider not initialized");
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash: null,
        memberships: {
          create: {
            companyId: this.config.companyId,
            role: (user.roles[0] as CompanyRole) ?? "MEMBER",
          },
        },
      },
    });

    await recordAudit(prisma, {
      action: "IDENTITY_PROVISION_USER",
      resourceType: "user",
      companyId: this.config.companyId,
      actorUserId: created.id,
      metadata: { provider: "google-workspace", email: user.email, roles: user.roles },
    });

    return created.id;
  }

  async deprovisionUser(externalId: string): Promise<void> {
    if (!this.config) throw new Error("Provider not initialized");

    const account = await prisma.account.findFirst({
      where: { provider: "google-workspace", providerAccountId: externalId },
      include: { user: true },
    });

    if (!account) throw new Error(`No user found for external ID: ${externalId}`);

    await prisma.account.delete({ where: { id: account.id } });

    const otherAccounts = await prisma.account.count({
      where: { userId: account.userId },
    });

    if (otherAccounts === 0) {
      await prisma.user.update({
        where: { id: account.userId },
        data: { passwordHash: null },
      });
    }

    await recordAudit(prisma, {
      action: "IDENTITY_DEPROVISION_USER",
      resourceType: "user",
      companyId: this.config.companyId,
      actorUserId: account.userId,
      metadata: { provider: "google-workspace", externalId },
    });
  }

  async syncDirectory(_users: ProviderUser[]): Promise<DirectorySyncResult> {
    if (!this.config) throw new Error("Provider not initialized");

    const meta = getMetadata(this.config);
    if (!meta.adminEmail) {
      return { added: 0, updated: 0, deactivated: 0, errors: ["adminEmail is required for directory sync"] };
    }

    const accessToken = await this.getAdminAccessToken(meta);
    const groupRoleMap = parseGroupRoleMap(meta.groupRoleMap);
    const domain = meta.domain;

    const result: DirectorySyncResult = { added: 0, updated: 0, deactivated: 0, errors: [] };
    let pageToken: string | undefined;

    try {
      do {
        const params = new URLSearchParams({ customer: "my_customer", maxResults: "100" });
        if (pageToken) params.set("pageToken", pageToken);
        if (domain) params.set("domain", domain);

        const url = `${GOOGLE_ADMIN_API}/users?${params.toString()}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          result.errors.push(`Directory API error (${res.status}): ${errText.slice(0, 200)}`);
          break;
        }

        const data = await res.json();
        const dirUsers: any[] = data.users ?? [];

        for (const du of dirUsers) {
          try {
            const email = du.primaryEmail;
            if (!email) continue;

            const groupsRes = await fetch(
              `${GOOGLE_ADMIN_API}/groups?userKey=${encodeURIComponent(email)}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            const groupsData = await groupsRes.json().catch(() => ({ groups: [] }));
            const groupIds: string[] = (groupsData.groups ?? []).map((g: any) => g.id ?? g.email);

            const roles: CompanyRole[] = [];
            for (const groupId of groupIds) {
              const role = groupRoleMap[groupId];
              if (role) roles.push(role);
            }

            const existingUser = await prisma.user.findFirst({
              where: { email },
              include: { accounts: { where: { provider: "google-workspace" } } },
            });

            if (existingUser) {
              const googleAccount = existingUser.accounts.find(
                (a) => a.providerAccountId === du.id,
              );
              if (!googleAccount) {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: "oidc",
                    provider: "google-workspace",
                    providerAccountId: du.id,
                    scope: "openid profile email",
                  },
                });
              }

              if (du.suspended && existingUser.passwordHash !== null) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { passwordHash: null },
                });
                result.deactivated++;
              }

              result.updated++;
            } else {
              await prisma.user.create({
                data: {
                  email,
                  name: du.name?.fullName ?? null,
                  passwordHash: null,
                  accounts: {
                    create: {
                      type: "oidc",
                      provider: "google-workspace",
                      providerAccountId: du.id,
                      scope: "openid profile email",
                    },
                  },
                  memberships: {
                    create: {
                      companyId: this.config.companyId,
                      role: (roles[0] ?? "MEMBER") as CompanyRole,
            },
          },
        },
      });

      result.added++;
            }
          } catch (err: any) {
            result.errors.push(`Error processing user ${du.primaryEmail}: ${err?.message ?? String(err)}`);
          }
        }

        pageToken = data.nextPageToken ?? undefined;
      } while (pageToken);
    } catch (err: any) {
      result.errors.push(`Sync error: ${err?.message ?? String(err)}`);
    }

    await recordAudit(prisma, {
      action: "IDENTITY_SYNC_DIRECTORY",
      resourceType: "identity",
      companyId: this.config.companyId,
      metadata: {
        provider: "google-workspace",
        added: result.added,
        updated: result.updated,
        deactivated: result.deactivated,
        errors: result.errors.length,
      },
    });

    return result;
  }

  getConfig(): IdentityProviderConfig {
    if (!this.config) throw new Error("Provider not initialized");
    return this.config;
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.config) return { ok: false, message: "Provider not initialized" };
    try {
      const res = await fetch(`${GOOGLE_OAUTH_URL}/.well-known/openid-configuration`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return { ok: false, message: `OIDC discovery failed: ${res.status}` };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err?.message ?? "Health check failed" };
    }
  }

  private async exchangeCodeForTokens(
    meta: GoogleMetadata,
    code: string,
    redirectUri: string,
  ): Promise<Record<string, any>> {
    const tokenEndpoint = `${GOOGLE_OAUTH_URL}/o/oauth2/token`;
    const body = new URLSearchParams({
      client_id: meta.clientId,
      client_secret: meta.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error({ status: res.status, body: text }, "Google OAuth token exchange failed");

      await recordAudit(prisma, {
        action: "IDENTITY_AUTH_FAILED",
        resourceType: "identity",
        companyId: this.config!.companyId,
        severity: "WARNING",
        metadata: { provider: "google-workspace", status: res.status, error: text.slice(0, 500) },
      });

      throw new Error(`Token exchange failed: ${res.status}`);
    }

    return res.json();
  }

  private async verifyJwtLocally(token: string): Promise<RawIdTokenPayload | null> {
    try {
      const { header, payload } = decodeJwt(token);

      const jwksUri = `${GOOGLE_OAUTH_URL}/oauth2/v3/certs`;
      const keys = await this.getJwks(jwksUri);
      const jwk = keys.find((k: any) => k.kid === header.kid);
      if (!jwk) throw new Error("No matching JWK found for token kid");

      const algorithm: RsaHashedImportParams = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
      const cryptoKey = await crypto.subtle.importKey("jwk", jwk, algorithm, false, ["verify"]);

      const parts = token.split(".");
      const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
      const signature = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");

      const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signature, data);
      if (!valid) return null;

      return payload;
    } catch (err) {
      logger.error({ err }, "JWT verification failed");
      return null;
    }
  }

  private async getJwks(jwksUri: string): Promise<any[]> {
    if (this.jwksCache && Date.now() - this.jwksCache.fetchedAt < 86_400_000) {
      return Object.values(this.jwksCache.keys);
    }
    const res = await fetch(jwksUri);
    if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
    const { keys } = await res.json();
    const keyMap: Record<string, any> = {};
    for (const k of keys) {
      if (k.kid) keyMap[k.kid] = k;
    }
    this.jwksCache = { keys: keyMap, fetchedAt: Date.now() };
    return keys;
  }

  private async getAdminAccessToken(meta: GoogleMetadata): Promise<string> {
    const tokenEndpoint = `${GOOGLE_OAUTH_URL}/o/oauth2/token`;
    const body = new URLSearchParams({
      client_id: meta.clientId,
      client_secret: meta.clientSecret,
      grant_type: "client_credentials",
      scope:
        "https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/admin.directory.group.readonly",
    });

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to get Admin SDK access token: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.access_token;
  }
}
