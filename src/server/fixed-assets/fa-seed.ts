import type { FixedAssetsService } from "./services/fixed-assets-service";
import type {
  FixedAsset, AssetAcquisition, AssetCapitalization, AssetDepreciationDetails,
  DepreciationEntry, ImpairmentRecord, TransferRecord, MaintenanceRecord,
  DisposalRecord, RevaluationRecord, LeaseInfo, AssetKPI, AssetAlert, AssetRecommendation,
} from "./types";

const NOW = new Date();
const DAY = 86400000;
const COMPANY = "company-1";

function daysAgo(n: number): Date { return new Date(NOW.getTime() - n * DAY); }
function daysAhead(n: number): Date { return new Date(NOW.getTime() + n * DAY); }

function calcSL(cost: number, salvage: number, years: number, monthsInService: number): { monthly: number; accum: number; nbv: number } {
  const monthly = Math.round(((cost - salvage) / (years * 12)) * 100) / 100;
  const accum = Math.round(monthly * monthsInService * 100) / 100;
  const nbv = Math.round((cost - accum) * 100) / 100;
  return { monthly, accum, nbv };
}

function generateSchedule(assetId: string, cost: number, salvage: number, years: number, ytdPeriod: number): DepreciationEntry[] {
  const monthly = Math.round(((cost - salvage) / (years * 12)) * 100) / 100;
  const entries: DepreciationEntry[] = [];
  let accum = 0;
  const totalMonths = years * 12;
  for (let m = 0; m < Math.min(totalMonths, 60); m++) {
    accum = Math.round((accum + monthly) * 100) / 100;
    const period = m < ytdPeriod ? "current" : "forecast";
    entries.push({
      id: `dep-${assetId}-${m}`,
      assetId,
      period,
      fiscalYear: 2026,
      fiscalPeriod: (m % 12) + 1,
      amount: monthly,
      accumulatedAfter: accum,
      netBookValueAfter: Math.round((cost - accum) * 100) / 100,
      postedToGL: m < ytdPeriod,
      glJournalId: m < ytdPeriod ? `gl-dep-${assetId}-${m}` : undefined,
      postedDate: m < ytdPeriod ? daysAgo((ytdPeriod - m) * 30) : undefined,
    });
  }
  return entries;
}

export function seedFAData(svc: FixedAssetsService): void {
  const assets: FixedAsset[] = [];
  let assetIdx = 0;

  function nextAsset(): { tag: string; idx: number } {
    assetIdx++;
    return { tag: `FA-${String(assetIdx).padStart(6, "0")}`, idx: assetIdx };
  }

  function makeAsset(
    overrides: Partial<FixedAsset> & {
      name: string; category: FixedAsset["category"]; status: FixedAsset["status"];
      cost: number; salvage?: number; usefulLifeYears: number; monthsInService: number;
      acquisitionType?: FixedAsset["acquisition"]["acquisitionType"];
      vendor?: string; custodian?: string; department?: string;
      isLeased?: boolean; hasImpairment?: boolean; hasTransfer?: boolean;
      hasMaintenance?: boolean; hasRevaluation?: boolean; isDisposed?: boolean;
    },
  ): FixedAsset {
    const { tag, idx } = nextAsset();
    const cost = overrides.cost;
    const salvage = overrides.salvage ?? Math.round(cost * 0.05);
    const years = overrides.usefulLifeYears;
    const mis = overrides.monthsInService;
    const dep = calcSL(cost, salvage, years, mis);
    const isFullyDep = mis >= years * 12;
    const aqDate = daysAgo(mis * 30 + 30);
    const capDate = daysAgo(mis * 30);
    const inSvcDate = daysAgo(mis * 30 - 15);
    const assetId = `asset-${idx}`;
    const acq: AssetAcquisition = {
      id: `acq-${idx}`,
      assetId,
      acquisitionType: overrides.acquisitionType ?? "purchase",
      acquisitionDate: aqDate,
      vendorName: overrides.vendor ?? "Perionyx Equipment Supply",
      vendorInvoiceNumber: `INV-${String(idx).padStart(5, "0")}`,
      purchaseOrderNumber: `PO-${String(idx).padStart(5, "0")}`,
      purchasePrice: cost,
      transportationCost: Math.round(cost * 0.02),
      installationCost: Math.round(cost * 0.01),
      otherCosts: 0,
      totalCost: cost + Math.round(cost * 0.03),
      currency: "USD",
      expectedInServiceDate: capDate,
      approvedBy: "sarah.chen@perionyx.com",
      approvedAt: daysAgo(mis * 30 + 15),
    };
    const cap: AssetCapitalization = {
      id: `cap-${idx}`,
      assetId,
      capitalizationDate: capDate,
      totalCapitalizedCost: acq.totalCost,
      inServiceDate: inSvcDate,
      depreciationStartDate: inSvcDate,
      method: "straightLine",
      usefulLifeYears: years,
      salvageValue: salvage,
      capitalizedBy: "finance-system",
      approvedBy: "sarah.chen@perionyx.com",
      approvedAt: capDate,
      glJournalId: `gl-cap-${idx}`,
    };
    const depDetails: AssetDepreciationDetails = {
      method: "straightLine",
      usefulLifeYears: years,
      salvageValue: salvage,
      inServiceDate: inSvcDate,
      originalCost: acq.totalCost,
      accumulatedDepreciation: dep.accum,
      netBookValue: dep.nbv,
      monthlyDepreciation: dep.monthly,
      yearToDateDepreciation: dep.monthly * Math.min(mis, 6),
      remainingLifeMonths: Math.max(0, years * 12 - mis),
      lastDepreciationDate: mis > 0 ? daysAgo(1) : undefined,
      nextDepreciationDate: daysAhead(25),
    };
    const schedule = generateSchedule(assetId, acq.totalCost, salvage, years, Math.min(mis, 60));
    const impairments: ImpairmentRecord[] = [];
    const transfers: TransferRecord[] = [];
    const maintenances: MaintenanceRecord[] = [];
    const disposals: DisposalRecord[] = [];
    const revaluations: RevaluationRecord[] = [];

    if (overrides.hasImpairment) {
      impairments.push({
        id: `imp-${idx}`,
        assetId,
        impairmentDate: daysAgo(90),
        indicator: "obsolescence",
        recoverableAmount: Math.round(acq.totalCost * 0.6),
        carryingAmount: dep.nbv,
        impairmentLoss: Math.round((dep.nbv - acq.totalCost * 0.6) * 100) / 100,
        description: "Asset value impaired due to technological obsolescence",
        approvedBy: "sarah.chen@perionyx.com",
        approvedAt: daysAgo(85),
        reversed: false,
      });
    }

    if (overrides.hasTransfer) {
      transfers.push({
        id: `trf-${idx}`,
        assetId,
        transferDate: daysAgo(200),
        reason: "reorganization",
        fromDepartment: "Engineering",
        toDepartment: "Operations",
        fromCostCenter: "CC-ENG",
        toCostCenter: "CC-OPS",
        approvedBy: "sarah.chen@perionyx.com",
        approvedAt: daysAgo(198),
      });
    }

    if (overrides.hasMaintenance) {
      maintenances.push({
        id: `mnt-${idx}-1`,
        assetId,
        type: "preventive",
        priority: "medium",
        status: "completed",
        title: "Quarterly preventive maintenance",
        description: "Routine inspection and servicing",
        scheduledDate: daysAgo(60),
        completedDate: daysAgo(58),
        cost: Math.round(cost * 0.005),
        vendorName: "Perionyx Maintenance Services",
        assignedTo: "mike.johnson",
        downtimeHours: 4,
        createdBy: "mike.johnson",
        approvedBy: "sarah.chen@perionyx.com",
        approvedAt: daysAgo(57),
      });
      maintenances.push({
        id: `mnt-${idx}-2`,
        assetId,
        type: "inspection",
        priority: "low",
        status: "scheduled",
        title: "Annual safety inspection",
        description: "Mandatory annual safety check",
        scheduledDate: daysAhead(30),
        cost: Math.round(cost * 0.003),
        assignedTo: "mike.johnson",
        createdBy: "compliance-team",
      });
    }

    if (overrides.hasRevaluation) {
      revaluations.push({
        id: `rev-${idx}`,
        assetId,
        revaluationDate: daysAgo(120),
        revaluationType: "upward",
        previousCarryingAmount: dep.nbv,
        fairValue: Math.round(dep.nbv * 1.15),
        revaluationSurplus: Math.round(dep.nbv * 0.15),
        revaluationLoss: 0,
        appraisedBy: "Independent Appraisal Corp",
        appraisalMethod: "marketComparable",
        approvedBy: "sarah.chen@perionyx.com",
        approvedAt: daysAgo(118),
      });
    }

    if (overrides.isDisposed) {
      const nbvAtDisp = Math.round(dep.nbv * 0.3 * 100) / 100;
      const proceeds = Math.round(nbvAtDisp * 0.85 * 100) / 100;
      disposals.push({
        id: `disp-${idx}`,
        assetId,
        disposalType: "sale",
        disposalDate: daysAgo(30),
        grossDisposalProceeds: proceeds,
        disposalCosts: Math.round(proceeds * 0.05),
        netDisposalProceeds: Math.round(proceeds * 0.95),
        netBookValueAtDisposal: nbvAtDisp,
        gainLoss: Math.round((proceeds * 0.95 - nbvAtDisp) * 100) / 100,
        counterparty: "Secondary Market Inc.",
        contractReference: `DISP-CTR-${idx}`,
        approvedBy: "sarah.chen@perionyx.com",
        approvedAt: daysAgo(35),
      });
    }

    const asset: FixedAsset = {
      id: assetId,
      assetTag: `FA-${String(idx).padStart(6, "0")}`,
      name: overrides.name,
      category: overrides.category,
      status: overrides.status,
      department: overrides.department,
      custodian: overrides.custodian,
      acquisition: { ...acq, assetId },
      capitalization: { ...cap, assetId },
      depreciationDetails: depDetails,
      depreciationSchedule: schedule,
      impairments,
      transfers,
      maintenance: maintenances,
      disposals,
      revaluations,
      isFullyDepreciated: isFullyDep,
      isActive: overrides.status !== "disposed" && overrides.status !== "retired" && overrides.status !== "archived",
      componentAssets: [],
      attachmentCount: 0,
      companyId: COMPANY,
      createdAt: daysAgo(mis * 30 + 60),
      updatedAt: daysAgo(1),
      usefulLifeMonths: years * 12,
      remainingLifeMonths: depDetails.remainingLifeMonths,
    };
    return asset;
  }

  // Asset 1: Server Infrastructure (Computers)
  assets.push(makeAsset({
    name: "Production Server Cluster - Rack A1",
    category: "computers", status: "inService",
    cost: 450000, usefulLifeYears: 5, monthsInService: 24,
    vendor: "Dell Technologies", custodian: "james.wilson", department: "IT Infrastructure",
    hasMaintenance: true,
  }));

  // Asset 2: Office Building
  assets.push(makeAsset({
    name: "Perionyx HQ - Building A",
    category: "building", status: "inService",
    cost: 12500000, usefulLifeYears: 30, monthsInService: 48,
    vendor: "Meridian Properties", custodian: "facilities-team", department: "Administration",
    hasMaintenance: true, hasRevaluation: true,
  }));

  // Asset 3: Manufacturing Equipment
  assets.push(makeAsset({
    name: "CNC Milling Machine - Model X500",
    category: "machinery", status: "inService",
    cost: 850000, usefulLifeYears: 10, monthsInService: 60,
    vendor: "Industrial Automation Corp", custodian: "mike.johnson", department: "Manufacturing",
    hasMaintenance: true, hasImpairment: true, hasTransfer: true,
  }));

  // Asset 4: Fleet Vehicle
  assets.push(makeAsset({
    name: "Tesla Model Y - Fleet Vehicle #12",
    category: "vehicles", status: "inService",
    cost: 65000, usefulLifeYears: 5, monthsInService: 18,
    vendor: "Tesla Inc.", custodian: "lisa.park", department: "Logistics",
    hasMaintenance: true,
  }));

  // Asset 5: Enterprise Software License
  assets.push(makeAsset({
    name: "SAP S/4HANA Enterprise License",
    category: "software", status: "inService",
    cost: 2500000, usefulLifeYears: 8, monthsInService: 36,
    vendor: "SAP SE", custodian: "it-director", department: "IT",
  }));

  // Asset 6: Furniture (Office)
  assets.push(makeAsset({
    name: "Executive Office Furnishing - Floor 4",
    category: "furniture", status: "inService",
    cost: 185000, usefulLifeYears: 7, monthsInService: 42,
    vendor: "Herman Miller", custodian: "facilities-team", department: "Administration",
    hasMaintenance: true,
  }));

  // Asset 7: Disposed Asset
  assets.push(makeAsset({
    name: "Legacy Server Rack - Decommissioned",
    category: "computers", status: "disposed",
    cost: 280000, usefulLifeYears: 5, monthsInService: 54,
    vendor: "HP Inc.", custodian: "james.wilson", department: "IT Infrastructure",
    isDisposed: true,
  }));

  // Asset 8: Fully Depreciated Asset
  assets.push(makeAsset({
    name: "Network Switch - Core Infrastructure",
    category: "equipment", status: "inService",
    cost: 95000, usefulLifeYears: 5, monthsInService: 62,
    vendor: "Cisco Systems", custodian: "james.wilson", department: "IT Infrastructure",
    isLeased: false,
  }));

  // Asset 9: Intangible Asset (Patent)
  assets.push(makeAsset({
    name: "Payment Processing Algorithm Patent",
    category: "intangible", status: "inService",
    cost: 1200000, usefulLifeYears: 15, monthsInService: 24,
    vendor: "Legal IP Services", custodian: "legal-team", department: "Legal",
    acquisitionType: "internalDevelopment",
  }));

  // Asset 10: Leased Equipment
  assets.push(makeAsset({
    name: "Enterprise Printer Fleet - Managed",
    category: "equipment", status: "inService",
    cost: 120000, usefulLifeYears: 4, monthsInService: 12,
    vendor: "Xerox Business Solutions", custodian: "facilities-team", department: "Administration",
    hasMaintenance: true,
  }));

  // Asset 11: Impaired Asset
  assets.push(makeAsset({
    name: "Legacy Mainframe System",
    category: "computers", status: "impaired",
    cost: 3200000, usefulLifeYears: 8, monthsInService: 72,
    vendor: "IBM", custodian: "james.wilson", department: "IT Infrastructure",
    hasImpairment: true,
  }));

  // Asset 12: Under Construction
  assets.push(makeAsset({
    name: "R&D Lab Expansion - Building B",
    category: "building", status: "acquired",
    cost: 8500000, usefulLifeYears: 30, monthsInService: 0,
    vendor: "ConstructCorp", custodian: "facilities-team", department: "R&D",
    acquisitionType: "construction",
  }));

  // Asset 13: Land
  assets.push(makeAsset({
    name: "Industrial Land Parcel - Zone C",
    category: "land", status: "inService",
    cost: 4500000, usefulLifeYears: 50, monthsInService: 36,
    vendor: "Land Development Corp", custodian: "facilities-team", department: "Administration",
  }));

  // Asset 14: Retired Asset
  assets.push(makeAsset({
    name: "Fax Machine - Legacy Communication",
    category: "equipment", status: "retired",
    cost: 3500, usefulLifeYears: 5, monthsInService: 72,
    vendor: "Panasonic", custodian: "admin-team", department: "Administration",
  }));

  // Asset 15: Leasehold Improvement
  assets.push(makeAsset({
    name: "Office Renovation - Floor 3 Expansion",
    category: "leasehold", status: "inService",
    cost: 450000, usefulLifeYears: 8, monthsInService: 14,
    vendor: "Interior Design Solutions", custodian: "facilities-team", department: "Administration",
    hasMaintenance: true,
  }));

  for (const a of assets) {
    svc.registry.add(a);
    svc.acquisition.add(a.acquisition);
    if (a.capitalization) svc.capitalization.add(a.capitalization);
    for (const d of a.depreciationSchedule) svc.depreciation.add(d);
    for (const i of a.impairments) svc.impairment.add(i);
    for (const t of a.transfers) svc.transfers.add(t);
    for (const m of a.maintenance) svc.maintenance.add(m);
    for (const d of a.disposals) svc.disposals.add(d);
    for (const r of a.revaluations) svc.revaluation.add(r);
  }

  // Lease info for asset 10
  svc.leaseReadiness.set("asset-10", {
    isLeased: true,
    leaseStartDate: daysAgo(365),
    leaseEndDate: daysAhead(1095),
    leaseType: "operating",
    lessorName: "Xerox Business Solutions",
    leasePaymentAmount: 3500,
    leasePaymentFrequency: "monthly",
    renewalOption: true,
    purchaseOption: true,
    bargainPurchasePrice: 25000,
    incrementalBorrowingRate: 0.045,
    rightOfUseAsset: true,
    leaseLiability: 108000,
    asc842Compliant: true,
    ifrs16Compliant: true,
  });

  // KPIs
  const totalCost = assets.reduce((s, a) => s + a.acquisition.totalCost, 0);
  const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);
  const totalDep = assets.reduce((s, a) => s + a.depreciationDetails.accumulatedDepreciation, 0);
  svc.analytics.addMetric({ id: "fa-kpi-001", name: "Total Assets", value: assets.length, target: 20, unit: "count", trend: "improving", category: "valuation", status: "onTrack", companyId: COMPANY });
  svc.analytics.addMetric({ id: "fa-kpi-002", name: "Total Cost", value: totalCost, target: 50000000, unit: "$", trend: "stable", category: "valuation", status: "onTrack", companyId: COMPANY });
  svc.analytics.addMetric({ id: "fa-kpi-003", name: "Net Book Value", value: totalNBV, target: 30000000, unit: "$", trend: "stable", category: "valuation", status: "onTrack", companyId: COMPANY });
  svc.analytics.addMetric({ id: "fa-kpi-004", name: "Depreciation Rate", value: totalCost > 0 ? Math.round((totalDep / totalCost) * 10000) / 100 : 0, target: 30, unit: "%", trend: "worsening", category: "depreciation", status: "atRisk", companyId: COMPANY });
  svc.analytics.addMetric({ id: "fa-kpi-005", name: "Maintenance Ratio", value: 0.035, target: 0.05, unit: "%", trend: "improving", category: "maintenance", status: "exceeding", companyId: COMPANY });
  svc.analytics.addMetric({ id: "fa-kpi-006", name: "Asset Utilization", value: 78, target: 85, unit: "%", trend: "worsening", category: "utilization", status: "atRisk", companyId: COMPANY });

  // Alerts
  svc.alerts.add({ id: "fa-alert-001", type: "depreciation", severity: "warning", title: "Fully depreciated asset still in use", message: "Network Switch - Core Infrastructure (FA-0000008) is fully depreciated but still active. Review for replacement.", assetId: "asset-8", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(2) });
  svc.alerts.add({ id: "fa-alert-002", type: "maintenance", severity: "warning", title: "Preventive maintenance overdue", message: "CNC Milling Machine (FA-0000003) last maintenance was 90 days ago. Schedule next service.", assetId: "asset-3", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1) });
  svc.alerts.add({ id: "fa-alert-003", type: "impairment", severity: "critical", title: "Significant impairment risk detected", message: "Legacy Mainframe System (FA-0000011) carrying value exceeds recoverable amount by $320,000. Review required.", assetId: "asset-11", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1) });
  svc.alerts.add({ id: "fa-alert-004", type: "compliance", severity: "info", title: "Annual inspection due soon", message: "Tesla Model Y (FA-0000004) annual safety inspection due in 30 days.", assetId: "asset-4", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(1) });
  svc.alerts.add({ id: "fa-alert-005", type: "disposal", severity: "info", title: "Retired asset pending disposal documentation", message: "Fax Machine (FA-0000014) retired 60 days ago. Complete disposal records.", assetId: "asset-14", isRead: false, isResolved: false, companyId: COMPANY, createdAt: daysAgo(5) });

  // Recommendations
  svc.recommendations.add({ id: "fa-rec-001", type: "replacement", title: "Replace fully depreciated network switch", description: "Network Switch (FA-0000008) is fully depreciated and approaching end of useful life. Risk of failure increases maintenance costs.", priority: "high", status: "active", impact: "Reduces downtime risk and maintenance costs", effort: "medium", estimatedSavings: 15000, assetId: "asset-8", companyId: COMPANY, createdAt: daysAgo(1) });
  svc.recommendations.add({ id: "fa-rec-002", type: "maintenance", title: "Schedule preventive maintenance for CNC Machine", description: "CNC Milling Machine (FA-0000003) requires quarterly preventive maintenance. Last service was 90 days ago.", priority: "medium", status: "active", impact: "Extends asset life and prevents unexpected breakdowns", effort: "low", estimatedSavings: 25000, assetId: "asset-3", companyId: COMPANY, createdAt: daysAgo(1) });
  svc.recommendations.add({ id: "fa-rec-003", type: "impairment", title: "Review legacy mainframe impairment", description: "Legacy Mainframe (FA-0000011) shows indicators of significant impairment. Formal impairment assessment recommended.", priority: "critical", status: "active", impact: "Ensures accurate asset valuation and compliance", effort: "medium", assetId: "asset-11", companyId: COMPANY, createdAt: daysAgo(1) });
  svc.recommendations.add({ id: "fa-rec-004", type: "utilization", title: "Optimize fleet vehicle utilization", description: "Tesla Model Y (FA-0000004) utilization rate is 62%, below target. Review fleet allocation.", priority: "low", status: "active", impact: "Reduces fleet costs by 15-20%", effort: "low", estimatedSavings: 8000, assetId: "asset-4", companyId: COMPANY, createdAt: daysAgo(2) });
}
