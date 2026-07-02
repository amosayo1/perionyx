import { SecretStoreFactory } from "@/modules/secrets/secret-store";
import type { ConnectorConfigRecord, ConnectorAuthMethod } from "./types";

export interface SecretReference {
  key: string;
  description: string;
  required: boolean;
  source: "config" | "store" | "env";
  envVar?: string;
  masked?: boolean;
}

export interface ConnectorSecretSchema {
  references: SecretReference[];
}

function defaultSecretSchema(authMethod: ConnectorAuthMethod): ConnectorSecretSchema {
  switch (authMethod) {
    case "api-key":
      return {
        references: [
          { key: "apiKey", description: "API key for authentication", required: true, source: "store", masked: true },
        ],
      };
    case "basic":
      return {
        references: [
          { key: "username", description: "Basic auth username", required: true, source: "config" },
          { key: "password", description: "Basic auth password", required: true, source: "store", masked: true },
        ],
      };
    case "bearer":
      return {
        references: [
          { key: "accessToken", description: "Bearer access token", required: true, source: "store", masked: true },
        ],
      };
    case "oauth2":
      return {
        references: [
          { key: "clientId", description: "OAuth2 client ID", required: true, source: "config" },
          { key: "clientSecret", description: "OAuth2 client secret", required: true, source: "store", masked: true },
          { key: "tokenUrl", description: "OAuth2 token endpoint URL", required: true, source: "config" },
          { key: "scopes", description: "OAuth2 requested scopes", required: false, source: "config" },
        ],
      };
    default:
      return { references: [] };
  }
}

export async function resolveConnectorSecrets(
  config: ConnectorConfigRecord,
  schema?: ConnectorSecretSchema,
): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};
  const effectiveSchema = schema ?? defaultSecretSchema(config.authMethod);
  const store = SecretStoreFactory();
  const cfg = config.config ?? {};

  for (const ref of effectiveSchema.references) {
    switch (ref.source) {
      case "config": {
        const val = cfg[ref.key];
        if (typeof val === "string") {
          resolved[ref.key] = val;
        } else if (val != null) {
          resolved[ref.key] = String(val);
        }
        break;
      }
      case "store": {
        const storeKey = `connector:${config.id}:${ref.key}`;
        const val = await store.getSecret(storeKey);
        if (val) resolved[ref.key] = val;
        break;
      }
      case "env": {
        if (ref.envVar) {
          const val = process.env[ref.envVar];
          if (val) resolved[ref.key] = val;
        }
        break;
      }
    }
  }

  return resolved;
}

export async function storeConnectorSecret(
  configId: string,
  key: string,
  value: string,
): Promise<void> {
  const store = SecretStoreFactory();
  const storeKey = `connector:${configId}:${key}`;
  await store.setSecret(storeKey, value);
}

export function getConnectorSecretSchema(authMethod: ConnectorAuthMethod): ConnectorSecretSchema {
  return defaultSecretSchema(authMethod);
}
