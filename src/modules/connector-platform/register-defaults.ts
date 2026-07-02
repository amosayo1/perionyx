import type { ConnectorCapability, ConnectorCategory } from "./types";
import { connectorPlatformRegistry } from "./registry";
import { connectorMetadataRegistry } from "./metadata";
import { LegacyConnectorAdapter } from "./adapters/legacy";
import { PlaidConnector } from "./adapters/plaid-adapter";
import { QuickBooksConnector } from "./adapters/quickbooks-connector";
import { SlackConnector } from "./adapters/slack-connector";
import { TeamsConnector } from "./adapters/teams-connector";
import { Dynamics365Connector } from "./adapters/dynamics-connector";
import { NetSuiteConnector } from "./adapters/netsuite-connector";
import { SapConnector } from "./adapters/sap-connector";

interface ConnectorRegistration {
  kind: any;
  label: string;
  description: string;
  category: ConnectorCategory;
  capabilities: ConnectorCapability[];
  version: string;
  author?: string;
  docsUrl?: string;
  tags: string[];
}

const connectors: ConnectorRegistration[] = [
  { kind: "plaid", label: "Plaid", description: "Bank account connectivity via Plaid", category: "banking", capabilities: ["import-data", "webhooks", "oauth"], version: "2.0.0", tags: ["banking", "transactions", "accounts"] },
  { kind: "stripe", label: "Stripe", description: "Payment processor integration", category: "payments", capabilities: ["import-data", "export-data", "webhooks"], version: "2.0.0", tags: ["payments", "billing"] },
  { kind: "wise", label: "Wise", description: "International transfers & FX", category: "payments", capabilities: ["import-data", "export-data", "settlement"], version: "1.0.0", tags: ["fx", "transfers", "international"] },
  { kind: "xero", label: "Xero", description: "Accounting software sync", category: "accounting", capabilities: ["import-data", "export-data", "scheduled-sync"], version: "2.0.0", tags: ["accounting", "invoices", "reconciliation"] },
  { kind: "quickbooks", label: "QuickBooks", description: "QuickBooks integration", category: "accounting", capabilities: ["import-data", "export-data", "scheduled-sync"], version: "2.0.0", tags: ["accounting", "invoices"] },
  { kind: "ach", label: "ACH", description: "ACH payment settlement", category: "payments", capabilities: ["export-data", "settlement"], version: "1.0.0", tags: ["payments", "ach", "settlement"] },
  { kind: "http", label: "Custom HTTP", description: "Generic HTTP API connector", category: "developer", capabilities: ["import-data", "export-data", "webhooks", "manual-sync"], version: "1.0.0", tags: ["custom", "api", "generic"] },
  { kind: "mock", label: "Mock Connector", description: "Development/testing connector", category: "developer", capabilities: ["import-data", "export-data", "settlement", "health-check"], version: "1.0.0", tags: ["testing", "development"] },
  { kind: "identity", label: "Identity Provider", description: "Enterprise identity provider", category: "identity", capabilities: ["import-data", "scheduled-sync", "manual-sync", "user-provisioning"], version: "1.0.0", tags: ["identity", "sso", "directory"] },
  { kind: "entra-id", label: "Microsoft Entra ID", description: "Microsoft Entra ID (Azure AD) identity provider", category: "identity", capabilities: ["import-data", "scheduled-sync", "manual-sync", "user-provisioning", "audit-log"], version: "1.0.0", tags: ["microsoft", "entra", "identity", "sso"] },
  { kind: "email", label: "Email", description: "SMTP email delivery connector", category: "communication", capabilities: ["export-data"], version: "1.0.0", tags: ["email", "notifications"] },
  { kind: "slack", label: "Slack", description: "Slack messaging and notifications", category: "communication", capabilities: ["export-data", "webhooks"], version: "1.0.0", tags: ["slack", "messaging", "notifications"] },
  { kind: "teams", label: "Microsoft Teams", description: "Microsoft Teams messaging and notifications", category: "communication", capabilities: ["export-data", "webhooks"], version: "1.0.0", tags: ["microsoft", "teams", "messaging"] },
  { kind: "storage", label: "Cloud Storage", description: "File and object storage connector", category: "storage", capabilities: ["import-data", "export-data", "file-import"], version: "1.0.0", tags: ["storage", "files", "s3"] },
  { kind: "fx", label: "FX Rate Provider", description: "Foreign exchange rate provider", category: "banking", capabilities: ["import-data", "scheduled-sync"], version: "1.0.0", tags: ["fx", "rates", "currency"] },
  { kind: "compliance", label: "Compliance Provider", description: "Regulatory compliance and screening", category: "compliance", capabilities: ["import-data", "export-data", "real-time-events"], version: "1.0.0", tags: ["compliance", "screening", "kyc"] },
  { kind: "dynamics365", label: "Dynamics 365 Finance", description: "Microsoft Dynamics 365 Finance ERP integration", category: "erp", capabilities: ["import-data", "export-data", "oauth", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "journal-export"], version: "1.0.0", tags: ["erp", "microsoft", "dynamics", "finance"] },
  { kind: "netsuite", label: "Oracle NetSuite", description: "Oracle NetSuite ERP integration", category: "erp", capabilities: ["import-data", "export-data", "oauth", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "payment-export"], version: "1.0.0", tags: ["erp", "oracle", "netsuite", "accounting"] },
  { kind: "sap", label: "SAP S/4HANA", description: "SAP S/4HANA ERP integration", category: "erp", capabilities: ["import-data", "export-data", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "journal-export"], version: "1.0.0", tags: ["erp", "sap", "s4hana", "finance"] },
];

for (const c of connectors) {
  if (c.kind === "plaid") {
    connectorPlatformRegistry.registerKind(c.kind, () => new PlaidConnector());
  } else if (c.kind === "quickbooks") {
    connectorPlatformRegistry.registerKind(c.kind, () => new QuickBooksConnector());
  } else if (c.kind === "slack") {
    connectorPlatformRegistry.registerKind(c.kind, () => new SlackConnector());
  } else if (c.kind === "teams") {
    connectorPlatformRegistry.registerKind(c.kind, () => new TeamsConnector());
  } else if (c.kind === "dynamics365") {
    connectorPlatformRegistry.registerKind(c.kind, () => new Dynamics365Connector());
  } else if (c.kind === "netsuite") {
    connectorPlatformRegistry.registerKind(c.kind, () => new NetSuiteConnector());
  } else if (c.kind === "sap") {
    connectorPlatformRegistry.registerKind(c.kind, () => new SapConnector());
  } else {
    connectorPlatformRegistry.registerKind(c.kind, () => new LegacyConnectorAdapter(c));
  }
  connectorMetadataRegistry.register({
    kind: c.kind,
    label: c.label,
    description: c.description,
    category: c.category,
    capabilities: c.capabilities,
    authMethods: ["api-key", "basic", "bearer", "oauth2"],
    version: c.version,
    author: c.author,
    docsUrl: c.docsUrl,
    tags: c.tags,
    isSystem: c.kind === "mock",
  });
}
