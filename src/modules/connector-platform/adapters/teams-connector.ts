import type { IConnector, ConnectorAuthConfig, ConnectorSyncOptions } from "../interface";
import type {
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
  ConnectorCapability,
  ConnectorAuthMethod,
} from "../types";
import { storeConnectorSecret, resolveConnectorSecrets } from "../secrets";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db/prisma";
import type { TeamsMessage, CommunicationChannel, CommunicationDeliveryResult } from "../communication-types";

const GRAPH_API = "https://graph.microsoft.com/v1.0";
const OAUTH_AUTHORITY = "https://login.microsoftonline.com";

const capabilities: ConnectorCapability[] = [
  "export-data",
  "oauth",
  "health-check",
  "audit-log",
];
const supportedAuthMethods: ConnectorAuthMethod[] = ["oauth2"];

interface TeamsTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GraphTeam {
  id: string;
  displayName: string;
  description?: string;
}

interface GraphChannel {
  id: string;
  displayName: string;
  description?: string;
}

interface GraphTeamsResponse {
  value?: GraphTeam[];
  "@odata.nextLink"?: string;
}

interface GraphChannelsResponse {
  value?: GraphChannel[];
  "@odata.nextLink"?: string;
}

export class TeamsConnector implements IConnector {
  readonly kind = "teams" as const;
  readonly label = "Microsoft Teams";
  readonly description = "Send notifications and adaptive cards to Microsoft Teams channels";
  readonly capabilities = capabilities;
  readonly supportedAuthMethods = supportedAuthMethods;

  private config: ConnectorConfigRecord | null = null;
  private accessToken: string | null = null;
  private tenantId: string | null = null;

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;
    const secrets = await resolveConnectorSecrets(config);
    this.accessToken = secrets.accessToken ?? null;
    this.tenantId = config.config?.tenantId as string ?? null;
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!this.config) { errors.push("Not initialized"); return { ok: false, errors }; }
    const meta = this.config.config ?? {};
    if (!meta.clientId) errors.push("Client ID is required");
    if (!meta.clientSecret) errors.push("Client Secret is required");
    if (!meta.tenantId) errors.push("Tenant ID is required");
    return { ok: errors.length === 0, errors };
  }

  async authenticate(auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    if (!this.config) return { ok: false, message: "Not initialized" };
    const meta = this.config.config ?? {};

    try {
      const tenant = (meta.tenantId as string) ?? "common";
      const tokenEndpoint = `${OAUTH_AUTHORITY}/${tenant}/oauth2/v2.0/token`;

      const code = auth.credentials.code ?? "";
      const redirectUri = auth.credentials.redirectUri ?? "";
      const clientId = (meta.clientId as string) ?? "";
      const clientSecret = (meta.clientSecret as string) ?? "";

      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: "https://graph.microsoft.com/.default",
      });

      const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data: TeamsTokenResponse = await res.json();

      if (!data.access_token) {
        return { ok: false, message: `Teams OAuth failed: ${data.error_description ?? data.error ?? "unknown"}` };
      }

      this.accessToken = data.access_token;
      this.tenantId = tenant;

      await storeConnectorSecret(this.config.id, "accessToken", data.access_token);

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      const teamsCurrent = await prisma.connectorConfig.findUnique({
        where: { id: this.config.id },
        select: { version: true },
      });
      if (!teamsCurrent) throw new Error("Connector config not found");
      const teamsResult = await prisma.connectorConfig.updateMany({
        where: { id: this.config.id, version: teamsCurrent.version },
        data: { config: { ...this.config.config, tokenExpiresAt: expiresAt } as any, version: { increment: 1 } },
      });
      if (teamsResult.count === 0) {
        const { ConflictError } = await import("@/lib/errors/app-error");
        throw new ConflictError("Concurrent modification detected");
      }

      return { ok: true, message: "Connected to Microsoft Teams" };
    } catch (err: any) {
      return { ok: false, message: `Teams OAuth error: ${err?.message ?? String(err)}` };
    }
  }

  async connect(): Promise<ConnectorHealth> {
    return this.healthCheck();
  }

  async disconnect(): Promise<void> {
    if (!this.config) throw new Error("Not initialized");
    this.accessToken = null;
    this.tenantId = null;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      if (!this.accessToken) return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: "No access token" };

      const res = await fetch(`${GRAPH_API}/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      }
      if (res.status === 401) {
        return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "Token may be expired", latencyMs };
      }
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: `Graph API returned ${res.status}`, latencyMs };
    } catch (err: any) {
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: err?.message ?? "Health check failed" };
    }
  }

  async syncData(_options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();
    if (!this.accessToken) {
      return { success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, recordsFailed: 0, errors: ["Not authenticated"], startedAt, completedAt: new Date().toISOString() };
    }

    try {
      const teams = await this.fetchTeamsInternal();
      return {
        success: true,
        recordsProcessed: teams.length,
        recordsCreated: 0,
        recordsUpdated: teams.length,
        recordsFailed: 0,
        errors: [],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return { success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, recordsFailed: 0, errors: [err?.message ?? "Sync failed"], startedAt, completedAt: new Date().toISOString() };
    }
  }

  getConfig(): ConnectorConfigRecord {
    if (!this.config) throw new Error("Not initialized");
    return this.config;
  }

  async sendMessage(message: TeamsMessage): Promise<CommunicationDeliveryResult> {
    if (!this.accessToken) return { ok: false, message: "Not authenticated" };

    try {
      const card = this.buildAdaptiveCard(message);

      const url = `${GRAPH_API}/teams/${message.teamId}/channels/${message.channelId}/messages`;
      const body = {
        body: {
          contentType: "html",
          content: `<attachment id="adaptiveCard"></attachment>`,
        },
        attachments: [
          {
            id: "adaptiveCard",
            contentType: "application/vnd.microsoft.card.adaptive",
            content: card,
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return { ok: true, externalId: data.id as string, message: "Sent" };
      }

      const errText = await res.text().catch(() => "");
      return { ok: false, message: `Teams API error (${res.status}): ${errText.slice(0, 200)}` };
    } catch (err: any) {
      return { ok: false, message: err?.message ?? "Network error" };
    }
  }

  async listTeams(): Promise<CommunicationChannel[]> {
    if (!this.accessToken) return [];
    try {
      return await this.fetchTeamsInternal();
    } catch {
      return [];
    }
  }

  async listChannels(teamId: string): Promise<CommunicationChannel[]> {
    if (!this.accessToken) return [];

    try {
      const channels: CommunicationChannel[] = [];
      let nextLink: string | undefined = `${GRAPH_API}/teams/${teamId}/channels`;

      while (nextLink) {
        const res = await fetch(nextLink, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        if (!res.ok) break;

        const data: GraphChannelsResponse = await res.json();
        if (!data.value) break;

        for (const ch of data.value) {
          channels.push({ id: ch.id, name: ch.displayName, type: "teams" });
        }

        nextLink = data["@odata.nextLink"];
      }

      return channels;
    } catch {
      return [];
    }
  }

  private async fetchTeamsInternal(): Promise<CommunicationChannel[]> {
    if (!this.accessToken) return [];

    const teams: CommunicationChannel[] = [];
    let nextLink: string | undefined = `${GRAPH_API}/me/joinedTeams`;

    while (nextLink) {
      const res = await fetch(nextLink, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (!res.ok) break;

      const data: GraphTeamsResponse = await res.json();
      if (!data.value) break;

      for (const team of data.value) {
        teams.push({ id: team.id, name: team.displayName, type: "teams" });
      }

      nextLink = data["@odata.nextLink"];
    }

    return teams;
  }

  private buildAdaptiveCard(message: TeamsMessage): Record<string, unknown> {
    const body: Record<string, unknown>[] = [];

    if (message.summary) {
      body.push({
        type: "TextBlock",
        text: message.summary,
        weight: "bolder",
        size: "large",
        wrap: true,
      });
    }

    if (message.title) {
      body.push({
        type: "TextBlock",
        text: message.title,
        weight: "default",
        size: "medium",
        wrap: true,
        spacing: "small",
      });
    }

    if (message.text) {
      body.push({
        type: "TextBlock",
        text: message.text,
        wrap: true,
        spacing: "small",
      });
    }

    if (message.sections) {
      for (const section of message.sections) {
        if (section.title) {
          body.push({
            type: "TextBlock",
            text: section.title,
            weight: "bolder",
            wrap: true,
            spacing: "medium",
          });
        }

        if (section.text) {
          body.push({
            type: "TextBlock",
            text: section.text,
            wrap: true,
          });
        }

        if (section.facts) {
          body.push({
            type: "FactSet",
            facts: section.facts.map((f) => ({ title: f.name, value: f.value })),
          });
        }
      }
    }

    const card: Record<string, unknown> = {
      type: "AdaptiveCard",
      version: "1.5",
      body,
    };

    if (message.potentialAction && message.potentialAction.length > 0) {
      card.actions = message.potentialAction.map((action) => ({
        type: "Action.OpenUrl",
        title: action.name ?? "Open",
        url: action.url ?? "",
      }));
    }

    return card;
  }
}
