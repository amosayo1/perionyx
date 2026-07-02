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

const ENTRA_ID_GRAPH_API = "https://graph.microsoft.com/v1.0";
const OAUTH_AUTHORITY = "https://login.microsoftonline.com";

const capabilities: IdentityProviderCapabilities = {
  authentication: true,
  provisioning: true,
  directorySync: true,
  mfa: true,
  sso: true,
};

interface EntraIdMetadata {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  domain?: string;
  groupRoleMap?: string;
}

interface CachedJwks {
  keys: Record<string, any>;
  fetchedAt: number;
}

interface RawIdTokenPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  upn?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  groups?: string[];
  [key: string]: unknown;
}

function getMetadata(config: IdentityProviderConfig): EntraIdMetadata {
  const m = config.metadata;
  return {
    clientId: m.clientId ?? "",
    clientSecret: m.clientSecret ?? "",
    tenantId: m.tenantId ?? "",
    domain: m.domain,
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

export class MicrosoftEntraIdProvider implements IIdentityProvider {
  readonly kind = "entra-id";
  readonly label = "Microsoft Entra ID";
  readonly capabilities = capabilities;

  private config: IdentityProviderConfig | null = null;
  private jwksCache: CachedJwks | null = null;

  async initialize(config: IdentityProviderConfig): Promise<void> {
    const meta = getMetadata(config);
    if (!meta.clientId) throw new Error("clientId is required for Microsoft Entra ID");
    if (!meta.clientSecret) throw new Error("clientSecret is required for Microsoft Entra ID");
    if (!meta.tenantId) throw new Error("tenantId is required for Microsoft Entra ID");
    this.config = config;
  }

  async authenticate(request: AuthRequest): Promise<AuthResult> {
    if (!this.config) throw new Error("Provider not initialized");
    const meta = getMetadata(this.config);

    if (!request.code) {
      throw new Error("Authorization code is required for Entra ID authentication");
    }

    const tokens = await this.exchangeCodeForTokens(meta, request.code, request.redirectUri ?? "");
    const idToken: string = tokens.id_token;

    const payload = await this.verifyJwtLocally(idToken);
    if (!payload) throw new Error("ID token verification failed");

    const email = payload.email ?? payload.preferred_username ?? payload.upn;
    if (!email) throw new Error("Email not found in ID token");

    const name = payload.name ?? (payload.given_name
      ? `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim()
      : null);

    const groups: string[] = payload.groups ?? [];
    const groupRoleMap = parseGroupRoleMap(meta.groupRoleMap);
    const roles: CompanyRole[] = [];
    for (const groupId of groups) {
      const role = groupRoleMap[groupId];
      if (role) roles.push(role);
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
      include: { accounts: { where: { provider: "entra-id" } } },
    });

    let userId: string;

    if (existingUser) {
      const existingAccount = existingUser.accounts.find(
        (a) => a.provider === "entra-id" && a.providerAccountId === payload.sub,
      );
      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oidc",
            provider: "entra-id",
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
              provider: "entra-id",
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
      metadata: { provider: "entra-id", email, method: "oidc" },
    });

    return {
      userId,
      email,
      name,
      providerKind: "entra-id",
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
        email: payload.email ?? payload.preferred_username ?? "",
        name: payload.name ?? null,
        groups,
        roles,
        active: true,
      };
    } catch (err) {
      logger.error({ err }, "Entra ID token validation failed");
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
      metadata: { provider: "entra-id", email: user.email, roles: user.roles },
    });

    return created.id;
  }

  async deprovisionUser(externalId: string): Promise<void> {
    if (!this.config) throw new Error("Provider not initialized");

    const account = await prisma.account.findFirst({
      where: { provider: "entra-id", providerAccountId: externalId },
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
      metadata: { provider: "entra-id", externalId },
    });
  }

  async syncDirectory(_users: ProviderUser[]): Promise<DirectorySyncResult> {
    if (!this.config) throw new Error("Provider not initialized");

    const meta = getMetadata(this.config);
    const groupRoleMap = parseGroupRoleMap(meta.groupRoleMap);

    let accessToken: string;
    try {
      accessToken = await this.getGraphAccessToken(meta);
    } catch (err: any) {
      return { added: 0, updated: 0, deactivated: 0, errors: [err?.message ?? "Failed to acquire Graph token"] };
    }

    const result: DirectorySyncResult = { added: 0, updated: 0, deactivated: 0, errors: [] };
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `${ENTRA_ID_GRAPH_API}/users?$top=100&$skip=${skip}&$select=id,userPrincipalName,displayName,givenName,surname,mail,accountEnabled`;
        const graphRes = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!graphRes.ok) {
          const errText = await graphRes.text().catch(() => "");
          result.errors.push(`Graph API error (${graphRes.status}): ${errText.slice(0, 200)}`);
          break;
        }

        const graphData = await graphRes.json();
        const graphUsers: any[] = graphData.value ?? [];

        if (graphUsers.length === 0) {
          hasMore = false;
          break;
        }

        for (const gu of graphUsers) {
          try {
            const email = gu.mail ?? gu.userPrincipalName;
            if (!email) continue;

            const groupsRes = await fetch(
              `${ENTRA_ID_GRAPH_API}/users/${gu.id}/memberOf?$select=id,displayName`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            const groupsData = await groupsRes.json().catch(() => ({ value: [] }));
            const groupIds: string[] = (groupsData.value ?? []).map((g: any) => g.id);

            const roles: CompanyRole[] = [];
            for (const groupId of groupIds) {
              const role = groupRoleMap[groupId];
              if (role) roles.push(role);
            }

            const existingUser = await prisma.user.findFirst({
              where: { email },
              include: { accounts: { where: { provider: "entra-id" } } },
            });

            if (existingUser) {
              const entraAccount = existingUser.accounts.find(
                (a) => a.providerAccountId === gu.id,
              );
              if (!entraAccount) {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: "oidc",
                    provider: "entra-id",
                    providerAccountId: gu.id,
                    scope: "openid profile email",
                  },
                });
              }

              if (gu.accountEnabled === false && existingUser.passwordHash !== null) {
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
                  name: gu.displayName ?? null,
                  passwordHash: null,
                  accounts: {
                    create: {
                      type: "oidc",
                      provider: "entra-id",
                      providerAccountId: gu.id,
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
            result.errors.push(`Error processing user ${gu.userPrincipalName}: ${err?.message ?? String(err)}`);
          }
        }

        skip += 100;
      } catch (err: any) {
        result.errors.push(`Sync batch error: ${err?.message ?? String(err)}`);
        break;
      }
    }

    await recordAudit(prisma, {
      action: "IDENTITY_SYNC_DIRECTORY",
      resourceType: "identity",
      companyId: this.config.companyId,
      metadata: {
        provider: "entra-id",
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
      const meta = getMetadata(this.config);
      const authority = `${OAUTH_AUTHORITY}/${meta.tenantId}/v2.0/.well-known/openid-configuration`;
      const res = await fetch(authority, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return { ok: false, message: `OIDC discovery failed: ${res.status}` };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err?.message ?? "Health check failed" };
    }
  }

  private async exchangeCodeForTokens(
    meta: EntraIdMetadata,
    code: string,
    redirectUri: string,
  ): Promise<Record<string, any>> {
    const tokenEndpoint = `${OAUTH_AUTHORITY}/${meta.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: meta.clientId,
      client_secret: meta.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: "openid profile email offline_access User.Read",
    });

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error({ status: res.status, body: text }, "Entra ID token exchange failed");

      await recordAudit(prisma, {
        action: "IDENTITY_AUTH_FAILED",
        resourceType: "identity",
        companyId: this.config!.companyId,
        severity: "WARNING",
        metadata: { provider: "entra-id", status: res.status, error: text.slice(0, 500) },
      });

      throw new Error(`Token exchange failed: ${res.status}`);
    }

    return res.json();
  }

  private async verifyJwtLocally(token: string): Promise<RawIdTokenPayload | null> {
    try {
      const { header, payload } = decodeJwt(token);

      const jwksUri = `${OAUTH_AUTHORITY}/${getMetadata(this.config!).tenantId}/discovery/v2.0/keys`;
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

  private async getGraphAccessToken(meta: EntraIdMetadata): Promise<string> {
    const tokenEndpoint = `${OAUTH_AUTHORITY}/${meta.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: meta.clientId,
      client_secret: meta.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to get Graph access token: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.access_token;
  }
}
