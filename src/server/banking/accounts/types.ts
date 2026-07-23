import type {
  BankProviderKind,
  BankingRegion,
  AccountType,
} from "../domain/types";

export type DiscoveredAccountType =
  | "CHECKING" | "SAVINGS" | "OPERATING" | "PAYROLL" | "TREASURY"
  | "INVESTMENT" | "LOAN" | "CREDIT" | "ESCROW" | "VIRTUAL"
  | "MERCHANT" | "CUSTODY" | "PETTY_CASH" | "SUSPENSE";

export type EnterpriseClassification =
  | "OPERATING" | "TREASURY" | "PAYROLL" | "SETTLEMENT" | "TAX"
  | "INVESTMENT" | "RESERVE" | "INTERCOMPANY" | "COLLECTIONS"
  | "DISBURSEMENT" | "UNKNOWN";

export type OwnershipTier =
  | "ENTERPRISE"
  | "HOLDING_COMPANY"
  | "LEGAL_ENTITY"
  | "BUSINESS_UNIT"
  | "DEPARTMENT";

export type AccountRelationshipType =
  | "PARENT" | "SWEEP" | "CASH_POOL" | "INVESTMENT"
  | "FUNDING" | "SETTLEMENT" | "FX_SOURCE";

export type CurrencyRole =
  | "BASE" | "ACCOUNT" | "REPORTING" | "FUNCTIONAL";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DiscoveryResult {
  accounts: DiscoveredAccountInfo[];
  provider: string;
  connectionId: string;
  discoveredAt: string;
  totalFound: number;
  newAccounts: number;
  duplicatesFound: number;
  warnings: string[];
}

export interface DiscoveredAccountInfo {
  externalId: string;
  name: string;
  officialName?: string;
  type: DiscoveredAccountType;
  subtype: string | null;
  currency: string;
  balance: {
    current: number;
    available: number | null;
    limit: number | null;
  };
  accountNumber?: string;
  iban?: string;
  bic?: string;
  routingNumber?: string;
  mask: string | null;
  ownerName?: string;
  ownerEmail?: string;
  openedAt?: string;
  metadata: Record<string, unknown>;
}

export interface ClassificationResult {
  accountId: string;
  externalId: string;
  classification: EnterpriseClassification;
  confidence: number;
  rationale: string;
  overridden: boolean;
  originalClassification?: EnterpriseClassification;
  classifiedAt: string;
  classifiedBy: "engine" | "user";
}

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: ClassificationCondition[];
  result: EnterpriseClassification;
}

export interface ClassificationCondition {
  field: "type" | "currency" | "name" | "balance" | "transactionPattern";
  operator: "equals" | "contains" | "startsWith" | "regex" | "gt" | "lt" | "range";
  value: string | number | string[];
}

export interface OwnerHierarchyNode {
  id: string;
  name: string;
  tier: OwnershipTier;
  parentId: string | null;
  children: OwnerHierarchyNode[];
  metadata: Record<string, unknown>;
}

export interface AccountOwnership {
  accountId: string;
  ownerPath: string[];
  primaryOwnerId: string;
  ownershipPercentage: number;
  tier: OwnershipTier;
  assignedAt: string;
  assignedBy: string;
}

export interface LegalEntityMapping {
  accountId: string;
  legalEntityId: string;
  legalEntityName: string;
  businessUnitId?: string;
  businessUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  mappedAt: string;
  mappedBy: string;
}

export interface AccountGroupDefinition {
  id: string;
  name: string;
  description: string;
  filterCriteria: GroupFilterCriteria;
  accountIds: string[];
  dynamic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupFilterCriteria {
  countries?: string[];
  currencies?: string[];
  types?: AccountType[];
  classifications?: EnterpriseClassification[];
  legalEntities?: string[];
  riskLevels?: RiskLevel[];
  balanceRange?: { min: number; max: number };
  tags?: string[];
}

export interface AccountRelationship {
  id: string;
  sourceAccountId: string;
  targetAccountId: string;
  type: AccountRelationshipType;
  direction: "source_to_target" | "bidirectional";
  config: Record<string, unknown>;
  active: boolean;
  createdAt: string;
}

export interface CurrencyConfiguration {
  enterpriseId: string;
  baseCurrency: string;
  reportingCurrency: string;
  additionalReportingCurrencies: string[];
  accountOverrides: AccountCurrencyOverride[];
}

export interface AccountCurrencyOverride {
  accountId: string;
  accountCurrency: string;
  functionalCurrency: string;
  fxRateSource?: string;
  autoConvert: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: string;
}

export interface ValidationError {
  code: string;
  message: string;
  field: string;
  severity: "error" | "warning";
  accountId?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  accountId?: string;
  suggestion?: string;
}

export interface EnterpriseAccountMetadata {
  id: string;
  externalId: string;
  name: string;
  officialName?: string;
  type: AccountType;
  classification: EnterpriseClassification;
  currency: string;
  country: string;
  region: BankingRegion;
  provider: string;
  institution: string;
  legalEntity?: string;
  businessUnit?: string;
  ownershipTier: OwnershipTier;
  purpose?: string;
  riskLevel: RiskLevel;
  healthScore: number;
  lastSync: string | null;
  isActive: boolean;
  aiMetadata?: AIMetadata;
}

export interface AIMetadata {
  liquidityContribution: number;
  cashFlowRole: string;
  treasuryImportance: number;
  riskScore: number;
  dormancyDays: number;
  transactionVelocity: number;
  avgTransactionValue: number;
  topCounterparties: string[];
  patterns: string[];
}