import type {
  AuthMethod,
  Capability,
  CapabilityFlag,
  BusinessCapability,
  ProviderCapabilities,
  ProviderCategory,
  SyncType,
  SyncDirection,
} from "@/server/integrations/types";

export const CAPABILITY_FLAGS: Record<string, CapabilityFlag> = {
  SUPPORTS_OAUTH: "supports_oauth",
  SUPPORTS_WEBHOOKS: "supports_webhooks",
  SUPPORTS_INCREMENTAL_SYNC: "supports_incremental_sync",
  SUPPORTS_BATCH: "supports_batch",
  SUPPORTS_EVENTS: "supports_events",
  SUPPORTS_ATTACHMENTS: "supports_attachments",
  SUPPORTS_MULTI_COMPANY: "supports_multi_company",
  SUPPORTS_MULTI_CURRENCY: "supports_multi_currency",
  SUPPORTS_PAGINATION: "supports_pagination",
  SUPPORTS_FILTERING: "supports_filtering",
  SUPPORTS_SEARCH: "supports_search",
  SUPPORTS_WEBHOOKS_OUTBOUND: "supports_webhooks_outbound",
  SUPPORTS_REALTIME: "supports_realtime",
};

export const BUSINESS_CAPABILITIES: Record<string, BusinessCapability> = {
  READ_ACCOUNTS: "read_accounts",
  WRITE_ACCOUNTS: "write_accounts",
  READ_TRANSACTIONS: "read_transactions",
  WRITE_TRANSACTIONS: "write_transactions",
  READ_INVOICES: "read_invoices",
  WRITE_INVOICES: "write_invoices",
  READ_VENDORS: "read_vendors",
  WRITE_VENDORS: "write_vendors",
  READ_CUSTOMERS: "read_customers",
  WRITE_CUSTOMERS: "write_customers",
  READ_BALANCE: "read_balance",
  READ_STATEMENTS: "read_statements",
  INITIATE_PAYMENT: "initiate_payment",
  READ_CONTACTS: "read_contacts",
  WRITE_CONTACTS: "write_contacts",
  READ_EMPLOYEES: "read_employees",
  WRITE_EMPLOYEES: "write_employees",
  READ_FILES: "read_files",
  WRITE_FILES: "write_files",
  READ_JOURNALS: "read_journals",
  WRITE_JOURNALS: "write_journals",
  READ_TAX: "read_tax",
  WRITE_TAX: "write_tax",
  READ_REPORTS: "read_reports",
  GENERATE_REPORTS: "generate_reports",
  READ_PRODUCTS: "read_products",
  WRITE_PRODUCTS: "write_products",
  READ_ORDERS: "read_orders",
  WRITE_ORDERS: "write_orders",
  READ_INVENTORY: "read_inventory",
  WRITE_INVENTORY: "write_inventory",
  READ_BUDGETS: "read_budgets",
  WRITE_BUDGETS: "write_budgets",
};

export function buildCapabilities(config: {
  category: ProviderCategory;
  authMethods: AuthMethod[];
  syncTypes: SyncType[];
  syncDirections: SyncDirection[];
  capabilities: Capability[];
  capabilityFlags: CapabilityFlag[];
  businessCapabilities: BusinessCapability[];
  maxBatchSize?: number;
  rateLimit?: number;
  rateLimitWindow?: number;
  maxConnections?: number;
  supportedApiVersions?: string[];
}): ProviderCapabilities {
  return {
    category: config.category,
    methods: config.capabilities,
    syncTypes: config.syncTypes,
    syncDirections: config.syncDirections,
    capabilities: config.capabilities,
    capabilityFlags: config.capabilityFlags,
    businessCapabilities: config.businessCapabilities,
    authMethods: config.authMethods,
    maxBatchSize: config.maxBatchSize,
    rateLimit: config.rateLimit,
    rateLimitWindow: config.rateLimitWindow,
    maxConnections: config.maxConnections,
    supportedApiVersions: config.supportedApiVersions,
  };
}

export function deriveFlagsFromCapabilities(capabilities: Capability[]): CapabilityFlag[] {
  const flags: CapabilityFlag[] = [];
  const set = new Set(capabilities);
  if (set.has("supports_oauth")) flags.push("supports_oauth");
  if (set.has("supports_webhooks")) flags.push("supports_webhooks");
  if (set.has("supports_incremental_sync")) flags.push("supports_incremental_sync");
  if (set.has("supports_batch")) flags.push("supports_batch");
  if (set.has("supports_pagination")) flags.push("supports_pagination");
  if (set.has("supports_filtering")) flags.push("supports_filtering");
  return flags;
}

export function deriveBusinessFromCapabilities(capabilities: Capability[]): BusinessCapability[] {
  return capabilities.filter((c): c is BusinessCapability =>
    c.startsWith("read_") || c.startsWith("write_") || c === "initiate_payment" || c === "generate_reports",
  );
}
