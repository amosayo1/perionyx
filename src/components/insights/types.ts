export type TrendDirection = "up" | "down" | "neutral";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  previousValue: string;
  trend: TrendDirection;
  trendLabel: string;
  insight: string;
  color: "emerald" | "amber" | "red" | "blue" | "purple" | "zinc";
}

export interface FinancialHealthData {
  cashPosition: { value: string; change: string; trend: TrendDirection };
  availableLiquidity: { value: string; change: string; trend: TrendDirection };
  outstandingLiabilities: { value: string; change: string; trend: TrendDirection };
  settlementVolume: { value: string; change: string; trend: TrendDirection };
  workingCapital: { value: string; change: string; trend: TrendDirection };
  cashDistribution: { label: string; value: number; color: string }[];
}

export interface TreasuryPerformanceData {
  totalAccounts: number;
  currencies: number;
  largestAccounts: { name: string; balance: string }[];
  settlementSuccess: string;
  transferVolume: { count: number; value: string };
  treasuryHealth: number;
}

export interface OperationalPerformanceData {
  avgApprovalTime: string;
  avgIncidentResolution: string;
  failedTransactions: number;
  policyExceptions: number;
  reconciliationSuccess: string;
  operationalEfficiency: number;
}

export interface ComplianceOverviewData {
  policyCompliance: number;
  auditReadiness: number;
  approvalCompliance: number;
  riskExposure: string;
  criticalIncidents: number;
  openExceptions: number;
}

export interface StrategicHighlight {
  id: string;
  label: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  change: string;
}
