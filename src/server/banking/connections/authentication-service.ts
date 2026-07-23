import type { IBankProvider } from "../providers/interface";
import type { AuthenticateConnectionParams, ConnectionLinkResult } from "../providers/interface";
import type { BankConnection, BankProviderKind, ConnectionProtocol } from "../domain/types";
import { ConnectionStatus } from "../domain/types";
import { bankProviderRegistry } from "../providers/registry/engine";

export interface LinkGenerationResult {
  linkToken: string;
  expiration: string;
  url?: string;
  providerKind: BankProviderKind;
  metadata?: Record<string, unknown>;
}

export interface AuthResult {
  success: boolean;
  connectionId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  accounts: Array<{ externalId: string; name: string; type: string; currency: string; mask: string | null }>;
  message?: string;
}

export class BankingAuthenticationService {
  async generateLink(
    provider: IBankProvider,
    params: AuthenticateConnectionParams,
  ): Promise<ConnectionLinkResult> {
    return provider.createConnectionLink({
      companyId: params.companyId ?? "",
      userId: params.userId ?? "",
      institutionId: params.institutionId,
      country: params.country,
      redirectUri: params.redirectUri,
      credentials: params.credentials,
    });
  }

  async authenticate(
    provider: IBankProvider,
    connection: BankConnection,
    authParams: AuthenticateConnectionParams,
  ): Promise<AuthResult> {
    const result = await provider.authenticateConnection(authParams);

    return {
      success: result.success,
      connectionId: connection.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      accounts: result.accounts.map((a) => ({
        externalId: a.externalId,
        name: a.name,
        type: a.type,
        currency: a.currency,
        mask: a.mask,
      })),
      message: result.message,
    };
  }

  async revoke(provider: IBankProvider, connection: BankConnection): Promise<void> {
    await provider.revokeConnection(connection);
  }
}

export const bankingAuthService = new BankingAuthenticationService();