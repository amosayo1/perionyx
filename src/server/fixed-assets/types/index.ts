export type AssetStatus =
  | "requested" | "approved" | "acquired" | "capitalized" | "inService"
  | "underMaintenance" | "impaired" | "revalued" | "disposed" | "retired" | "archived";

export type AssetCategory =
  | "land" | "building" | "leasehold" | "machinery" | "equipment"
  | "vehicles" | "furniture" | "computers" | "software" | "intangible" | "other";

export type DepreciationMethod =
  | "straightLine" | "doubleDeclining" | "sumOfYearsDigits" | "unitsOfProduction" | "macrs";

export type AcquisitionType = "purchase" | "lease" | "construction" | "internalDevelopment" | "contribution" | "merger";

export type DisposalType = "sale" | "scrap" | "donation" | "tradeIn" | "abandonment";

export type MaintenanceType = "preventive" | "corrective" | "emergency" | "inspection";

export type TransferReason = "relocation" | "reorganization" | "departmentChange" | "costCenterChange" | "saleLeaseback" | "other";

export type ImpairmentIndicator =
  | "marketDecline" | "obsolescence" | "physicalDamage" | "regulatoryChange"
  | "extendedIdle" | "businessRestructuring" | "cashFlowDecline" | "other";

export type RevaluationType = "upward" | "downward";

export type MaintenancePriority = "low" | "medium" | "high" | "critical";

export type MaintenanceStatus = "scheduled" | "inProgress" | "completed" | "cancelled";

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";

export type AlertCategory =
  | "depreciation" | "maintenance" | "impairment" | "disposal" | "valuation"
  | "compliance" | "lifecycle" | "budget" | "utilization" | "insurance";

export type RecommendationType =
  | "replacement" | "maintenance" | "disposal" | "revaluation" | "impairment"
  | "utilization" | "tax" | "insurance" | "lifecycle" | "budget";

export type AccountingEventType =
  | "acquisition" | "capitalization" | "depreciation" | "impairment"
  | "revaluation" | "transfer" | "disposal" | "gainLoss" | "retirement";

export type ReportingCategory =
  | "assetRegister" | "depreciationSchedule" | "capex" | "assetAging"
  | "utilization" | "maintenanceCost" | "impairment" | "disposal" | "executiveBoardPack";

export interface Location {
  building?: string;
  floor?: string;
  room?: string;
  site?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface AssetDepreciationDetails {
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue: number;
  inServiceDate: Date;
  originalCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  monthlyDepreciation: number;
  yearToDateDepreciation: number;
  remainingLifeMonths: number;
  lastDepreciationDate?: Date;
  nextDepreciationDate?: Date;
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  period: string;
  fiscalYear: number;
  fiscalPeriod: number;
  amount: number;
  accumulatedAfter: number;
  netBookValueAfter: number;
  postedToGL: boolean;
  glJournalId?: string;
  postedDate?: Date;
}

export interface AssetAcquisition {
  id: string;
  assetId: string;
  acquisitionType: AcquisitionType;
  acquisitionDate: Date;
  vendorName: string;
  vendorInvoiceNumber?: string;
  purchaseOrderNumber?: string;
  purchasePrice: number;
  transportationCost: number;
  installationCost: number;
  otherCosts: number;
  totalCost: number;
  currency: string;
  paymentTerms?: string;
  expectedInServiceDate: Date;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
}

export interface AssetCapitalization {
  id: string;
  assetId: string;
  capitalizationDate: Date;
  totalCapitalizedCost: number;
  inServiceDate: Date;
  depreciationStartDate: Date;
  method: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue: number;
  capitalizedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
}

export interface ImpairmentRecord {
  id: string;
  assetId: string;
  impairmentDate: Date;
  indicator: ImpairmentIndicator;
  recoverableAmount: number;
  carryingAmount: number;
  impairmentLoss: number;
  description: string;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
  reversed: boolean;
  reversalDate?: Date;
  reversalAmount?: number;
}

export interface TransferRecord {
  id: string;
  assetId: string;
  transferDate: Date;
  reason: TransferReason;
  fromDepartment?: string;
  toDepartment?: string;
  fromCostCenter?: string;
  toCostCenter?: string;
  fromLocation?: Location;
  toLocation?: Location;
  fromCustodian?: string;
  toCustodian?: string;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  vendorName?: string;
  assignedTo?: string;
  partsReplaced?: string[];
  notes?: string;
  downtimeHours?: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DisposalRecord {
  id: string;
  assetId: string;
  disposalType: DisposalType;
  disposalDate: Date;
  grossDisposalProceeds: number;
  disposalCosts: number;
  netDisposalProceeds: number;
  netBookValueAtDisposal: number;
  gainLoss: number;
  counterparty?: string;
  contractReference?: string;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
}

export interface RevaluationRecord {
  id: string;
  assetId: string;
  revaluationDate: Date;
  revaluationType: RevaluationType;
  previousCarryingAmount: number;
  fairValue: number;
  revaluationSurplus: number;
  revaluationLoss: number;
  appraisedBy?: string;
  appraisalMethod?: string;
  approvedBy?: string;
  approvedAt?: Date;
  glJournalId?: string;
}

export interface LeaseInfo {
  isLeased: boolean;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseType?: "finance" | "operating";
  lessorName?: string;
  leasePaymentAmount?: number;
  leasePaymentFrequency?: "monthly" | "quarterly" | "annual";
  renewalOption?: boolean;
  purchaseOption?: boolean;
  bargainPurchasePrice?: number;
  incrementalBorrowingRate?: number;
  rightOfUseAsset?: boolean;
  leaseLiability?: number;
  asc842Compliant?: boolean;
  ifrs16Compliant?: boolean;
}

export interface FixedAsset {
  id: string;
  assetTag: string;
  barcode?: string;
  rfidTag?: string;
  name: string;
  description?: string;
  category: AssetCategory;
  subcategory?: string;
  status: AssetStatus;
  department?: string;
  costCenter?: string;
  location?: Location;
  custodian?: string;
  custodianEmail?: string;
  acquisition: AssetAcquisition;
  capitalization?: AssetCapitalization;
  depreciationDetails: AssetDepreciationDetails;
  depreciationSchedule: DepreciationEntry[];
  impairments: ImpairmentRecord[];
  transfers: TransferRecord[];
  maintenance: MaintenanceRecord[];
  disposals: DisposalRecord[];
  revaluations: RevaluationRecord[];
  leaseInfo?: LeaseInfo;
  insurancePolicyNumber?: string;
  insuranceValue?: number;
  warrantyExpiry?: Date;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  usefulLifeMonths: number;
  remainingLifeMonths: number;
  disposal?: DisposalRecord;
  isFullyDepreciated: boolean;
  isActive: boolean;
  parentAssetId?: string;
  componentAssets: string[];
  attachmentCount: number;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAlert {
  id: string;
  type: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  assetId?: string;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  companyId: string;
  createdAt: Date;
}

export interface AssetRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "implemented" | "dismissed";
  impact: string;
  effort: "low" | "medium" | "high";
  estimatedSavings?: number;
  assetId?: string;
  companyId: string;
  createdAt: Date;
}

export interface AssetKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "improving" | "worsening" | "stable";
  category: "valuation" | "depreciation" | "maintenance" | "utilization" | "compliance" | "efficiency";
  status: "onTrack" | "atRisk" | "critical" | "exceeding";
  companyId: string;
}

export interface AggregateAssetMetrics {
  totalAssets: number;
  activeAssets: number;
  fullyDepreciated: number;
  pendingAcquisition: number;
  pendingCapitalization: number;
  totalCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  totalImpairmentLoss: number;
  totalDisposalGainLoss: number;
  totalMaintenanceCost: number;
  maintenanceRatio: number;
  depreciationRatio: number;
  assetUtilizationRate: number;
  averageUsefulLife: number;
  averageRemainingLife: number;
  revaluationSurplus: number;
  underMaintenance: number;
  impaired: number;
  totalRevaluations: number;
  pendingTransfers: number;
  pendingDisposals: number;
}

export interface ExecutiveAssetSummary {
  totalAssets: number;
  totalCost: number;
  totalNetBookValue: number;
  totalAccumulatedDepreciation: number;
  capitalizedThisPeriod: number;
  disposedThisPeriod: number;
  impairedThisPeriod: number;
  netChange: number;
  depreciationForPeriod: number;
  maintenanceCostForPeriod: number;
  averageAssetAge: number;
  assetUtilizationRate: number;
  fullyDepreciatedCount: number;
  fullyDepreciatedValue: number;
  replacementValue: number;
  insuranceCoverage: number;
  pendingApprovals: number;
  criticalAlerts: number;
  pendingMaintenance: number;
  capexForPeriod: number;
  budgetVariance: number;
}

export interface AssetUtilizationReport {
  assetId: string;
  assetName: string;
  utilizationRate: number;
  uptimePercent: number;
  downtimeHours: number;
  maintenanceRatio: number;
  costPerHour: number;
  revenueGenerated?: number;
  roi?: number;
}

export interface DepreciationScheduleReport {
  assetId: string;
  assetName: string;
  assetTag: string;
  category: AssetCategory;
  method: DepreciationMethod;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  currentPeriodDepreciation: number;
  yearToDateDepreciation: number;
  remainingLifeMonths: number;
  entries: DepreciationEntry[];
}

export interface CapExReport {
  period: string;
  totalAcquisitions: number;
  totalCapitalized: number;
  totalDisposals: number;
  netCapEx: number;
  byCategory: Record<AssetCategory, number>;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
}

export interface AssetAgingReport {
  category: AssetCategory;
  totalAssets: number;
  totalCost: number;
  totalNetBookValue: number;
  averageAgeYears: number;
  averageRemainingYears: number;
  fullyDepreciated: number;
  ageBuckets: { range: string; count: number; value: number }[];
}

export interface MaintenanceCostReport {
  period: string;
  totalMaintenanceCost: number;
  totalDowntimeHours: number;
  byType: Record<MaintenanceType, { count: number; cost: number }>;
  byPriority: Record<MaintenancePriority, { count: number; cost: number }>;
  costPerAsset: number;
  preventiveRatio: number;
  emergencyRatio: number;
}

export interface ImpairmentReport {
  totalImpairments: number;
  totalImpairmentLoss: number;
  totalReversals: number;
  totalReversalAmount: number;
  netImpairment: number;
  byIndicator: Record<ImpairmentIndicator, { count: number; loss: number }>;
  byCategory: Record<AssetCategory, { count: number; loss: number }>;
}

export interface DisposalReport {
  totalDisposals: number;
  totalProceeds: number;
  totalCosts: number;
  netProceeds: number;
  totalNBV: number;
  totalGain: number;
  totalLoss: number;
  netGainLoss: number;
  byType: Record<DisposalType, { count: number; proceeds: number; gainLoss: number }>;
}

export interface ExecutiveBoardPack {
  period: string;
  executiveSummary: string;
  keyMetrics: {
    totalAssets: number;
    totalNBV: number;
    totalCost: number;
    depreciationRunRate: number;
    capexToDate: number;
    maintenanceToRevenue: number;
  };
  highlights: string[];
  risks: string[];
  recommendations: string[];
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AssetFilter {
  status?: AssetStatus[];
  category?: AssetCategory[];
  department?: string;
  costCenter?: string;
  custodian?: string;
  acquisitionDateFrom?: Date;
  acquisitionDateTo?: Date;
  costFrom?: number;
  costTo?: number;
  searchQuery?: string;
  isFullyDepreciated?: boolean;
  isActive?: boolean;
}

export interface AssetSort {
  field: "assetTag" | "name" | "category" | "status" | "cost" | "netBookValue" | "acquisitionDate" | "depreciationMethod";
  direction: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
