import { prisma } from "@/server/db/prisma";
import { verifyCredentials } from "@/modules/users/users.service";
import { mfaService } from "@/server/iam/mfa";
import type { IIdentityProvider } from "../provider";
import type {
  AuthRequest,
  AuthResult,
  ProviderUser,
  DirectorySyncResult,
  IdentityProviderConfig,
  IdentityProviderCapabilities,
} from "../types";

const capabilities: IdentityProviderCapabilities = {
  authentication: true,
  provisioning: false,
  directorySync: false,
  mfa: true,
  sso: false,
};

export class LocalIdentityProvider implements IIdentityProvider {
  readonly kind = "local";
  readonly label = "Local Authentication";
  readonly capabilities = capabilities;

  private config: IdentityProviderConfig | null = null;

  async initialize(config: IdentityProviderConfig): Promise<void> {
    this.config = config;
  }

  async authenticate(request: AuthRequest): Promise<AuthResult> {
    const result = await verifyCredentials(request.email, request.password ?? "");
    if (!result) {
      throw new Error("Invalid credentials");
    }
    if ("locked" in result) {
      throw new Error("Account locked");
    }

    // Check if MFA is enabled for this user
    const user = await prisma.user.findUnique({
      where: { id: result.id },
      select: { mfaEnabled: true },
    });

    return {
      userId: result.id,
      email: result.email,
      name: result.name,
      providerKind: "local",
      providerId: result.id,
      mfaRequired: user?.mfaEnabled ?? false,
    };
  }

  async validateToken(_token: string): Promise<ProviderUser | null> {
    return null;
  }

  async provisionUser(_user: ProviderUser): Promise<string> {
    throw new Error("Local provider does not support provisioning");
  }

  async deprovisionUser(_externalId: string): Promise<void> {
    throw new Error("Local provider does not support deprovisioning");
  }

  async syncDirectory(_users: ProviderUser[]): Promise<DirectorySyncResult> {
    throw new Error("Local provider does not support directory sync");
  }

  getConfig(): IdentityProviderConfig {
    if (!this.config) throw new Error("Provider not initialized");
    return this.config;
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    try {
      await prisma.user.findFirst({ select: { id: true } });
      return { ok: true };
    } catch {
      return { ok: false, message: "Database unreachable" };
    }
  }
}
