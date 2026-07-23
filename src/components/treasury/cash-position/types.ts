export interface CashPositionFilters {
  companyId: string;
  legalEntityId: string | null;
  region: string | null;
  currency: string | null;
  institution: string | null;
  cashType: string | null;
  dateRange: [string, string] | null;
}

export interface RegionalCashData {
  region: string;
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  idleCash: number;
  currencyCount: number;
  entityCount: number;
  institutionCount: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  liquidityScore: number;
  trend: "up" | "down" | "stable";
}

export interface EntityCashData {
  entityId: string;
  entityName: string;
  region: string;
  currency: string;
  available: number;
  restricted: number;
  idle: number;
  workingCapital: number;
  liquidityScore: number;
  dailyChange: number;
}

export interface CurrencyPositionData {
  currency: string;
  balance: number;
  functionalAmount: number;
  reportingAmount: number;
  exposure: number;
  fxRisk: "low" | "medium" | "high";
  trend: "up" | "down" | "stable";
  percentageOfTotal: number;
}

export interface InstitutionCashData {
  institution: string;
  accountCount: number;
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  liquidityScore: number;
  relationshipHealth: "healthy" | "degraded" | "critical";
  providerKind: string;
}

export interface CashCompositionItem {
  classification: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CashMovementEvent {
  id: string;
  type: "opening" | "collections" | "payments" | "funding" | "transfers" | "fx" | "closing";
  label: string;
  amount: number;
  timestamp: string;
  description: string;
}

export interface DailyVariance {
  date: string;
  opening: number;
  closing: number;
  netChange: number;
  collections: number;
  payments: number;
}

export interface TreasuryAlertData {
  id: string;
  severity: "info" | "warning" | "critical" | "emergency";
  category: string;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ExecutiveInsight {
  type: "concentration" | "fx_risk" | "idle_cash" | "restricted" | "liquidity" | "funding";
  title: string;
  description: string;
  severity: "positive" | "warning" | "critical";
  value: string;
}

export interface KPIChange {
  value: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
}

export interface TreasuryKPIs {
  totalCash: KPIChange;
  availableCash: KPIChange;
  restrictedCash: KPIChange;
  idleCash: KPIChange;
  workingCapital: KPIChange;
  netLiquidity: KPIChange;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  secondary?: number;
}
