import {
  BankingRegion,
  ProviderCapability,
  ConnectionProtocol,
  type RegionProviderMap,
  type RegionalProviderConfig,
} from "../../domain/types";

const NORTH_AMERICA_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "plaid", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.REAL_TIME, ProviderCapability.ACCOUNT_DISCOVERY,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "mx", rank: 2, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.ACCOUNT_DISCOVERY,
    ProviderCapability.ACCOUNT_VERIFICATION,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "finicity", rank: 3, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.ACCOUNT_VERIFICATION, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.REPORTING,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 60, maxHistoryDays: 730 },
  { kind: "akoya", rank: 4, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.REAL_TIME,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "yodlee", rank: 5, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.STATEMENTS, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.REPORTING,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "salted", rank: 6, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const MIDDLE_EAST_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "lean", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.ACCOUNT_DISCOVERY,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "tarabut", rank: 2, isRecommended: false, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OPEN_BANKING, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "yap", rank: 3, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.DIRECT_DEBIT, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.REAL_TIME,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.OAUTH2], minHistoryDays: 60, maxHistoryDays: 365 },
  { kind: "direct-api", rank: 10, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.CERTIFICATE, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "salted", rank: 6, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const EUROPE_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "truelayer", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.REAL_TIME, ProviderCapability.DIRECT_DEBIT,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.OPEN_BANKING], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "tink", rank: 2, isRecommended: false, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.REAL_TIME, ProviderCapability.ACCOUNT_VERIFICATION,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.OPEN_BANKING], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "salted", rank: 3, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "gocardless", rank: 4, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.DIRECT_DEBIT,
    ProviderCapability.SCHEDULED_PAYMENTS, ProviderCapability.WEBHOOKS,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "iso20022", rank: 5, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.STATEMENTS,
    ProviderCapability.PAYMENTS, ProviderCapability.RECONCILIATION, ProviderCapability.REPORTING,
  ], supportedProtocols: [ConnectionProtocol.ISO_20022, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 90 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const UNITED_KINGDOM_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "truelayer", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.REAL_TIME, ProviderCapability.DIRECT_DEBIT,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.OPEN_BANKING], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "gocardless", rank: 2, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.DIRECT_DEBIT,
    ProviderCapability.SCHEDULED_PAYMENTS, ProviderCapability.WEBHOOKS,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "tink", rank: 3, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.ACCOUNT_VERIFICATION,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.OPEN_BANKING], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "salted", rank: 4, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const SAUDI_ARABIA_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "lean", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC, ProviderCapability.ACCOUNT_DISCOVERY,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "tarabut", rank: 2, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OPEN_BANKING, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "direct-api", rank: 10, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.CERTIFICATE, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "salted", rank: 6, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const ASIA_PACIFIC_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "plaid", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
    ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ProviderCapability.REAL_TIME,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "yodlee", rank: 5, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.STATEMENTS, ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 730 },
  { kind: "salted", rank: 6, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "direct-api", rank: 10, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.CERTIFICATE, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "iso20022", rank: 8, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.STATEMENTS,
    ProviderCapability.PAYMENTS, ProviderCapability.RECONCILIATION,
  ], supportedProtocols: [ConnectionProtocol.ISO_20022, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 90 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

const AFRICA_PROVIDERS: RegionalProviderConfig[] = [
  { kind: "direct-api", rank: 1, isRecommended: true, isFallback: false, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.CERTIFICATE, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 365 },
  { kind: "salted", rank: 6, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
    ProviderCapability.HISTORICAL_SYNC,
  ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 },
  { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
  { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
    ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
  ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
];

export const BANKING_REGION_REGISTRY: RegionProviderMap[] = [
  {
    region: BankingRegion.NORTH_AMERICA,
    countryCodes: ["US", "CA", "MX"],
    providers: NORTH_AMERICA_PROVIDERS,
  },
  {
    region: BankingRegion.EUROPE,
    countryCodes: ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "FI", "PT", "IE", "PL", "CZ", "HU", "RO", "GR", "LU"],
    providers: EUROPE_PROVIDERS,
  },
  {
    region: BankingRegion.UNITED_KINGDOM,
    countryCodes: ["GB", "UK"],
    providers: UNITED_KINGDOM_PROVIDERS,
  },
  {
    region: BankingRegion.MIDDLE_EAST,
    countryCodes: ["AE", "SA", "QA", "BH", "KW", "OM", "EG", "JO", "LB"],
    providers: MIDDLE_EAST_PROVIDERS,
  },
  {
    region: BankingRegion.UAE,
    countryCodes: ["AE"],
    providers: MIDDLE_EAST_PROVIDERS,
  },
  {
    region: BankingRegion.SAUDI_ARABIA,
    countryCodes: ["SA"],
    providers: SAUDI_ARABIA_PROVIDERS,
  },
  {
    region: BankingRegion.QATAR,
    countryCodes: ["QA"],
    providers: [{ kind: "tarabut", rank: 1, isRecommended: true, isFallback: false, capabilities: [
      ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
      ProviderCapability.HISTORICAL_SYNC,
    ], supportedProtocols: [ConnectionProtocol.OPEN_BANKING, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 365 }],
  },
  {
    region: BankingRegion.BAHRAIN,
    countryCodes: ["BH"],
    providers: [{ kind: "tarabut", rank: 1, isRecommended: true, isFallback: false, capabilities: [
      ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.PAYMENTS,
      ProviderCapability.IDENTITY, ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ], supportedProtocols: [ConnectionProtocol.OPEN_BANKING, ConnectionProtocol.OAUTH2], minHistoryDays: 90, maxHistoryDays: 365 }],
  },
  {
    region: BankingRegion.KUWAIT,
    countryCodes: ["KW"],
    providers: [{ kind: "lean", rank: 1, isRecommended: true, isFallback: false, capabilities: [
      ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
      ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 }],
  },
  {
    region: BankingRegion.OMAN,
    countryCodes: ["OM"],
    providers: [{ kind: "lean", rank: 1, isRecommended: true, isFallback: false, capabilities: [
      ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.IDENTITY,
      ProviderCapability.WEBHOOKS, ProviderCapability.HISTORICAL_SYNC,
    ], supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY], minHistoryDays: 90, maxHistoryDays: 365 }],
  },
  {
    region: BankingRegion.EGYPT,
    countryCodes: ["EG"],
    providers: [{ kind: "direct-api", rank: 10, isRecommended: true, isFallback: true, capabilities: [
      ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
    ], supportedProtocols: [ConnectionProtocol.API_KEY, ConnectionProtocol.CERTIFICATE, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 365 }],
  },
  {
    region: BankingRegion.AFRICA,
    countryCodes: ["ZA", "NG", "KE", "GH", "MA", "TN", "DZ", "SN", "CI", "ET"],
    providers: AFRICA_PROVIDERS,
  },
  {
    region: BankingRegion.ASIA_PACIFIC,
    countryCodes: ["AU", "NZ", "SG", "HK", "JP", "KR", "IN", "ID", "MY", "TH", "VN", "PH", "TW", "CN"],
    providers: ASIA_PACIFIC_PROVIDERS,
  },
  {
    region: BankingRegion.GLOBAL,
    countryCodes: [],
    providers: [
      { kind: "swift", rank: 1, isRecommended: true, isFallback: false, capabilities: [
        ProviderCapability.PAYMENTS, ProviderCapability.BENEFICIARIES, ProviderCapability.FX,
        ProviderCapability.STATEMENTS, ProviderCapability.REPORTING,
      ], supportedProtocols: [ConnectionProtocol.SWIFT], minHistoryDays: 0, maxHistoryDays: 0 },
      { kind: "iso20022", rank: 2, isRecommended: false, isFallback: true, capabilities: [
        ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS, ProviderCapability.STATEMENTS,
        ProviderCapability.PAYMENTS, ProviderCapability.RECONCILIATION, ProviderCapability.REPORTING,
      ], supportedProtocols: [ConnectionProtocol.ISO_20022, ConnectionProtocol.MUTUAL_TLS], minHistoryDays: 30, maxHistoryDays: 90 },
      { kind: "csv", rank: 20, isRecommended: false, isFallback: true, capabilities: [
        ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
      ], supportedProtocols: [ConnectionProtocol.FILE_IMPORT], minHistoryDays: 0, maxHistoryDays: 0 },
      { kind: "manual", rank: 21, isRecommended: false, isFallback: true, capabilities: [
        ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS,
      ], supportedProtocols: [ConnectionProtocol.MANUAL], minHistoryDays: 0, maxHistoryDays: 0 },
    ],
  },
];
