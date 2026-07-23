export type AccountStatus = "active" | "dormant" | "restricted" | "frozen" | "closing" | "closed" | "pending_approval";
export type LifecycleStage = "requested" | "opening" | "pending_documentation" | "kyc_review" | "approval" | "active" | "dormant" | "restricted" | "closing" | "closed";
export type AccountType = "checking" | "savings" | "money_market" | "escrow" | "payroll" | "tax" | "investment" | "collateral" | "concentration" | "disbursement" | "multi_currency" | "overdraft";
export type OwnershipType = "wholly_owned" | "joint_venture" | "subsidiary" | "trust" | "partnership";
export type SigningAuthority = "sole" | "joint" | "any_two" | "any_three" | "manager" | "director" | "cfo" | "ceo";
export type MandateStatus = "active" | "expiring" | "expired" | "revoked" | "pending_renewal";
export type KYCStatus = "complete" | "pending" | "expired" | "in_review" | "missing_documents";
export type RiskRating = "low" | "medium" | "high" | "critical";
export type ComplianceSeverity = "info" | "warning" | "critical" | "emergency";
export type RelationshipScore = "platinum" | "gold" | "silver" | "bronze" | "at_risk";

export interface DashboardFilters {
  region: string | null;
  country: string | null;
  legalEntity: string | null;
  businessUnit: string | null;
  bank: string | null;
  currency: string | null;
  accountType: string | null;
  ownership: string | null;
  lifecycleStatus: string | null;
  accountStatus: string | null;
  kycStatus: string | null;
  mandateStatus: string | null;
  riskLevel: string | null;
  dateOpened: [string, string] | null;
  signatory: string | null;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  maskedNumber: string;
  iban: string;
  swift: string;
  accountName: string;
  legalEntity: string;
  businessUnit: string;
  region: string;
  country: string;
  bank: string;
  currency: string;
  accountType: AccountType;
  ownership: OwnershipType;
  status: AccountStatus;
  lifecycle: LifecycleStage;
  risk: RiskRating;
  balance: number;
  targetBalance: number;
  utilization: number;
  openedDate: string;
  lastActivity: string;
  closedDate: string;
  relationshipManager: string;
  signatories: string[];
  mandates: string[];
  kycStatus: KYCStatus;
  kycRenewalDate: string;
  documentsRequired: string[];
  monthlyFees: number;
  interestRate: number;
  overdraftLimit: number;
  complianceAlerts: number;
}

export interface BankRelationship {
  id: string;
  bankName: string;
  region: string;
  country: string;
  relationshipScore: RelationshipScore;
  scoreValue: number;
  totalAccounts: number;
  totalBalance: number;
  productsUsed: string[];
  primaryContact: string;
  relationshipManager: string;
  riskRating: RiskRating;
  lastReview: string;
  nextReview: string;
  accountTypes: string[];
  currencies: string[];
  relationshipLength: string;
  annualFees: number;
  serviceLevel: "premium" | "standard" | "basic";
}

export interface Signatory {
  id: string;
  person: string;
  role: string;
  entity: string;
  region: string;
  bank: string;
  accounts: string[];
  signingAuthority: SigningAuthority;
  approvalLimit: number;
  status: "active" | "inactive" | "expired" | "revoked";
  expirationDate: string;
  reviewDate: string;
  documents: string[];
  phone: string;
  email: string;
}

export interface Mandate {
  id: string;
  mandateId: string;
  accountId: string;
  accountNumber: string;
  bank: string;
  signatories: string[];
  authorityType: SigningAuthority;
  approvalLimit: number;
  effectiveDate: string;
  expiryDate: string;
  status: MandateStatus;
  renewalRequired: boolean;
  lastReviewDate: string;
  notes: string;
}

export interface KYCDocument {
  id: string;
  accountId: string;
  documentType: string;
  documentName: string;
  status: "received" | "pending" | "expired" | "rejected";
  receivedDate: string;
  expiryDate: string;
  renewalDate: string;
  reviewedBy: string;
  notes: string;
  isRequired: boolean;
}

export interface KYCProfile {
  entity: string;
  entityId: string;
  accountId: string;
  corporateDocuments: string[];
  beneficialOwners: BeneficialOwner[];
  taxForms: string[];
  boardResolution: string;
  businessLicense: string;
  articlesOfIncorporation: string;
  addressProof: string;
  amlReview: "cleared" | "pending" | "flagged";
  riskClassification: RiskRating;
  completionPercentage: number;
  status: KYCStatus;
  renewalDate: string;
  lastReviewDate: string;
}

export interface BeneficialOwner {
  name: string;
  ownershipPercentage: number;
  idType: string;
  idNumber: string;
  nationality: string;
  status: "verified" | "pending" | "expired";
}

export interface OwnershipNode {
  id: string;
  label: string;
  type: "enterprise" | "region" | "entity" | "business_unit" | "bank" | "account";
  parentId: string;
  children: OwnershipNode[];
  metadata: Record<string, string>;
}

export interface DormantAccount {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  entity: string;
  bank: string;
  currency: string;
  balance: number;
  dormantDays: number;
  lastActivity: string;
  monthlyFees: number;
  feesYearToDate: number;
  recommendedAction: "close" | "reactivate" | "merge" | "transfer_funds" | "monitor";
}

export interface ComplianceIssue {
  id: string;
  category: string;
  severity: ComplianceSeverity;
  title: string;
  description: string;
  entity: string;
  accountId: string;
  accountNumber: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface TrendPoint {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsSeries {
  name: string;
  data: TrendPoint[];
  color: string;
}

export interface EBAMetrics {
  totalAccounts: number;
  activeAccounts: number;
  dormantAccounts: number;
  restrictedAccounts: number;
  closingAccounts: number;
  totalEntities: number;
  totalBanks: number;
  totalCountries: number;
  totalCurrencies: number;
  totalSignatories: number;
  mandatesExpiring: number;
  kycPending: number;
  complianceAlerts: number;
  averageBalance: number;
  averageUtilization: number;
  complianceScore: number;
  relationshipHealth: number;
  kycCompletion: number;
  mandateCoverage: number;
  policyCompliance: number;
  totalBalance: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface AccountRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  entity: string;
  roi: string;
}

export interface AccountAlert {
  id: string;
  category: string;
  severity: ComplianceSeverity;
  title: string;
  message: string;
  entity: string;
  accountNumber: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ExecutiveInsight {
  label: string;
  value: string;
  description: string;
  entity: string;
  severity: "positive" | "warning" | "critical";
}
