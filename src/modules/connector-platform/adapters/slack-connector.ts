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
import type { SlackMessage, CommunicationChannel, CommunicationDeliveryResult } from "../communication-types";

const SLACK_API = "https://slack.com/api";

const capabilities: ConnectorCapability[] = [
  "export-data",
  "oauth",
  "health-check",
  "audit-log",
];
const supportedAuthMethods: ConnectorAuthMethod[] = ["oauth2"];

interface SlackTokenResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  team_name?: string;
  team_id?: string;
  bot_user_id?: string;
  authed_user?: { id: string };
  error?: string;
}

interface SlackChannelResponse {
  ok: boolean;
  channels?: { id: string; name: string; is_member?: boolean; member_count?: number }[];
  response_metadata?: { next_cursor?: string };
  error?: string;
}

export class SlackConnector implements IConnector {
  readonly kind = "slack" as const;
  readonly label = "Slack";
  readonly description = "Send notifications and alerts to Slack channels";
  readonly capabilities = capabilities;
  readonly supportedAuthMethods = supportedAuthMethods;

  private config: ConnectorConfigRecord | null = null;
  private botToken: string | null = null;
  private teamId: string | null = null;

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;
    const secrets = await resolveConnectorSecrets(config);
    this.botToken = secrets.botToken ?? null;
    this.teamId = config.config?.teamId as string ?? null;
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!this.config) { errors.push("Not initialized"); return { ok: false, errors }; }
    const meta = this.config.config ?? {};
    if (!meta.clientId) errors.push("Client ID is required");
    if (!meta.clientSecret) errors.push("Client Secret is required");
    return { ok: errors.length === 0, errors };
  }

  async authenticate(auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    if (!this.config) return { ok: false, message: "Not initialized" };
    const meta = this.config.config ?? {};

    try {
      const body = new URLSearchParams({
        client_id: (meta.clientId as string) ?? "",
        client_secret: (meta.clientSecret as string) ?? "",
        code: auth.credentials.code ?? "",
        redirect_uri: auth.credentials.redirectUri ?? "",
        grant_type: "authorization_code",
      });

      const res = await fetch(`${SLACK_API}/oauth.v2.access`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data: SlackTokenResponse = await res.json();

      if (!data.ok || !data.access_token) {
        return { ok: false, message: `Slack OAuth failed: ${data.error ?? "unknown"}` };
      }

      this.botToken = data.access_token;
      this.teamId = data.team_id ?? null;

      await storeConnectorSecret(this.config.id, "botToken", data.access_token);

      if (data.team_name) {
        const slackCurrent = await prisma.connectorConfig.findUnique({
          where: { id: this.config.id },
          select: { version: true },
        });
        if (slackCurrent) {
          const slackResult = await prisma.connectorConfig.updateMany({
            where: { id: this.config.id, version: slackCurrent.version },
            data: { config: { ...this.config.config, teamName: data.team_name, teamId: data.team_id, botUserId: data.bot_user_id } as any, version: { increment: 1 } },
          });
          if (slackResult.count === 0) {
            const { ConflictError } = await import("@/lib/errors/app-error");
            throw new ConflictError("Concurrent modification detected");
          }
        }
      }

      return { ok: true, message: `Connected to Slack workspace: ${data.team_name ?? "unknown"}` };
    } catch (err: any) {
      return { ok: false, message: `Slack OAuth error: ${err?.message ?? String(err)}` };
    }
  }

  async connect(): Promise<ConnectorHealth> {
    return this.healthCheck();
  }

  async disconnect(): Promise<void> {
    if (!this.config) throw new Error("Not initialized");
    this.botToken = null;
    this.teamId = null;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      if (!this.botToken) return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: "No bot token" };

      const res = await fetch(`${SLACK_API}/auth.test`, {
        headers: { Authorization: `Bearer ${this.botToken}` },
      });

      const data = await res.json();
      const latencyMs = Date.now() - start;

      if (data.ok) {
        return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      }
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: data.error ?? "Health check warning", latencyMs };
    } catch (err: any) {
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: err?.message ?? "Health check failed" };
    }
  }

  async syncData(_options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();
    if (!this.botToken) {
      return { success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, recordsFailed: 0, errors: ["Not authenticated"], startedAt, completedAt: new Date().toISOString() };
    }

    try {
      const channels = await this.fetchChannelsInternal();
      return {
        success: true,
        recordsProcessed: channels.length,
        recordsCreated: 0,
        recordsUpdated: channels.length,
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

  async sendMessage(message: SlackMessage): Promise<CommunicationDeliveryResult> {
    if (!this.botToken) return { ok: false, message: "Not authenticated" };

    try {
      const body: Record<string, unknown> = { channel: message.channel, text: message.text };
      if (message.blocks) body.blocks = message.blocks;
      if (message.attachments) body.attachments = message.attachments;
      if (message.threadTs) body.thread_ts = message.threadTs;

      const res = await fetch(`${SLACK_API}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.ok) {
        return { ok: true, externalId: data.ts as string, message: "Sent" };
      }
      return { ok: false, message: data.error ?? "Slack API error" };
    } catch (err: any) {
      return { ok: false, message: err?.message ?? "Network error" };
    }
  }

  async listChannels(): Promise<CommunicationChannel[]> {
    if (!this.botToken) return [];
    try {
      return await this.fetchChannelsInternal();
    } catch {
      return [];
    }
  }

  async getChannelInfo(channelId: string): Promise<CommunicationChannel | null> {
    if (!this.botToken) return null;

    try {
      const res = await fetch(`${SLACK_API}/conversations.info?channel=${channelId}`, {
        headers: { Authorization: `Bearer ${this.botToken}` },
      });

      const data = await res.json();
      if (data.ok && data.channel) {
        return { id: data.channel.id, name: data.channel.name, type: "slack", isMember: data.channel.is_member };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async fetchChannelsInternal(): Promise<CommunicationChannel[]> {
    if (!this.botToken) return [];

    const channels: CommunicationChannel[] = [];
    let cursor: string | undefined;

    do {
      const params = new URLSearchParams({
        types: "public_channel,private_channel",
        exclude_archived: "true",
        limit: "200",
      });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`${SLACK_API}/conversations.list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${this.botToken}` },
      });

      const data: SlackChannelResponse = await res.json();
      if (!data.ok || !data.channels) break;

      for (const ch of data.channels) {
        channels.push({ id: ch.id, name: ch.name, type: "slack", isMember: ch.is_member });
      }

      cursor = data.response_metadata?.next_cursor;
    } while (cursor);

    return channels;
  }
}
