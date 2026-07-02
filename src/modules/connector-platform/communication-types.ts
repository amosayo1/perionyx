export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: unknown[];
  attachments?: unknown[];
  threadTs?: string;
}

export interface TeamsMessage {
  teamId: string;
  channelId: string;
  summary: string;
  title?: string;
  text?: string;
  sections?: TeamsSection[];
  potentialAction?: TeamsAction[];
}

export interface TeamsSection {
  title?: string;
  text?: string;
  facts?: { name: string; value: string }[];
}

export interface TeamsAction {
  type: string;
  name?: string;
  url?: string;
  targets?: { os: string; uri: string }[];
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: "slack" | "teams" | "email";
  isMember?: boolean;
}

export interface CommunicationDeliveryResult {
  ok: boolean;
  message?: string;
  externalId?: string;
}

export interface NotificationPolicy {
  severityThreshold?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  categories?: string[];
  departments?: string[];
  executiveOnly?: boolean;
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
  escalationRules?: EscalationRule[];
  digest?: {
    enabled: boolean;
    schedule: string;
  };
  immediate?: boolean;
  channelPriority?: number;
}

export interface EscalationRule {
  afterMinutes: number;
  escalateToChannelId: string;
  escalateToConnectorId?: string;
}
