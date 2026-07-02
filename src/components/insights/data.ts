import type {
  KpiMetric,
  FinancialHealthData,
  TreasuryPerformanceData,
  OperationalPerformanceData,
  ComplianceOverviewData,
  StrategicHighlight,
} from "./types";

export const kpiMetrics: KpiMetric[] = [
  {
    id: "cash-position",
    title: "Cash Position",
    value: "$24.8M",
    previousValue: "$22.1M",
    trend: "up",
    trendLabel: "+12.2%",
    insight: "Cash position strengthened through improved receivables collection and reduced outstanding liabilities.",
    color: "emerald",
  },
  {
    id: "treasury-utilization",
    title: "Treasury Utilization",
    value: "87.3%",
    previousValue: "82.1%",
    trend: "up",
    trendLabel: "+5.2pp",
    insight: "Treasury assets deployed at optimal utilization. Idle cash reduced 18% this quarter.",
    color: "blue",
  },
  {
    id: "payments-processed",
    title: "Payments Processed",
    value: "12,847",
    previousValue: "11,204",
    trend: "up",
    trendLabel: "+14.7%",
    insight: "Payment volume grew 14.7% month-over-month driven by increased vendor settlement activity.",
    color: "emerald",
  },
  {
    id: "approval-sla",
    title: "Approval SLA",
    value: "96.8%",
    previousValue: "94.2%",
    trend: "up",
    trendLabel: "+2.6pp",
    insight: "Approval efficiency improved through automated routing and reduced approval bottlenecks.",
    color: "emerald",
  },
  {
    id: "liquidity-ratio",
    title: "Liquidity Ratio",
    value: "2.4x",
    previousValue: "2.1x",
    trend: "up",
    trendLabel: "+0.3x",
    insight: "Liquidity remains strong with 2.4x coverage ratio, exceeding 2.0x target threshold.",
    color: "emerald",
  },
  {
    id: "operational-health",
    title: "Operational Health",
    value: "98.2%",
    previousValue: "97.5%",
    trend: "up",
    trendLabel: "+0.7pp",
    insight: "Platform reliability improved with zero critical incidents in the last reporting period.",
    color: "emerald",
  },
  {
    id: "risk-score",
    title: "Risk Score",
    value: "12",
    previousValue: "18",
    trend: "down",
    trendLabel: "-6 points",
    insight: "Enterprise risk posture improved. High-risk exposures reduced by 33% this quarter.",
    color: "emerald",
  },
  {
    id: "policy-compliance",
    title: "Policy Compliance",
    value: "99.1%",
    previousValue: "98.7%",
    trend: "up",
    trendLabel: "+0.4pp",
    insight: "Policy adherence remains near-perfect. Two policy exceptions resolved this period.",
    color: "emerald",
  },
];

export const financialHealth: FinancialHealthData = {
  cashPosition: { value: "$24.8M", change: "+12.2%", trend: "up" },
  availableLiquidity: { value: "$18.2M", change: "+8.4%", trend: "up" },
  outstandingLiabilities: { value: "$6.4M", change: "-3.1%", trend: "down" },
  settlementVolume: { value: "$42.1M", change: "+18.6%", trend: "up" },
  workingCapital: { value: "$16.3M", change: "+11.2%", trend: "up" },
  cashDistribution: [
    { label: "Operating Accounts", value: 42, color: "emerald" },
    { label: "Treasury Bills", value: 24, color: "blue" },
    { label: "Money Market", value: 18, color: "purple" },
    { label: "Reserve", value: 10, color: "amber" },
    { label: "Other", value: 6, color: "zinc" },
  ],
};

export const treasuryPerformance: TreasuryPerformanceData = {
  totalAccounts: 24,
  currencies: 8,
  largestAccounts: [
    { name: "Operating — USD", balance: "$8.2M" },
    { name: "Payroll — USD", balance: "$4.1M" },
    { name: "Treasury — EUR", balance: "€3.8M" },
    { name: "Vendor — USD", balance: "$2.9M" },
    { name: "Reserve — USD", balance: "$2.1M" },
  ],
  settlementSuccess: "99.7%",
  transferVolume: { count: 847, value: "$38.2M" },
  treasuryHealth: 94,
};

export const operationalPerformance: OperationalPerformanceData = {
  avgApprovalTime: "4.2m",
  avgIncidentResolution: "3.8h",
  failedTransactions: 2,
  policyExceptions: 4,
  reconciliationSuccess: "98.9%",
  operationalEfficiency: 92,
};

export const complianceOverview: ComplianceOverviewData = {
  policyCompliance: 99.1,
  auditReadiness: 96.8,
  approvalCompliance: 98.4,
  riskExposure: "Low",
  criticalIncidents: 0,
  openExceptions: 3,
};

export const strategicHighlights: StrategicHighlight[] = [
  {
    id: "hl-1",
    label: "Approval Efficiency Increased 18%",
    description: "Automated approval routing and parallel approval workflows reduced average approval time from 5.1m to 4.2m.",
    impact: "positive",
    change: "+18%",
  },
  {
    id: "hl-2",
    label: "Settlement Success Exceeded Target",
    description: "Settlement success rate reached 99.7%, exceeding 99.5% quarterly target for the third consecutive month.",
    impact: "positive",
    change: "+0.4pp",
  },
  {
    id: "hl-3",
    label: "Risk Exposure Reduced 33%",
    description: "Enterprise risk score decreased from 18 to 12 through proactive monitoring and policy enforcement.",
    impact: "positive",
    change: "-33%",
  },
  {
    id: "hl-4",
    label: "Treasury Liquidity Remains Healthy",
    description: "Liquidity ratio maintained at 2.4x, well above 2.0x internal threshold. Idle cash minimized through optimized deployment.",
    impact: "positive",
    change: "Stable",
  },
  {
    id: "hl-5",
    label: "Largest Vendor Spend Increased 6%",
    description: "Top 5 vendors accounted for $4.2M in payments this period, reflecting increased procurement activity.",
    impact: "neutral",
    change: "+6%",
  },
  {
    id: "hl-6",
    label: "Policy Compliance Reached 99.1%",
    description: "Two policy exceptions resolved. Remaining exceptions under active remediation with 7-day SLA.",
    impact: "positive",
    change: "+0.4pp",
  },
];
