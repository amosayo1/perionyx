import type { OptimizationCategory, OptimizationSource } from "./types";

interface OptimizationDefinition {
  type: string;
  category: OptimizationCategory;
  source: OptimizationSource;
  description: string;
  defaultConfidence: number;
  typicalHoursSaved: number;
  typicalRiskReduction: number;
}

export class OptimizationRegistry {
  private definitions = new Map<string, OptimizationDefinition>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defs: OptimizationDefinition[] = [
      { type: "approval-bottleneck", category: "approvals", source: "approval_analyzer", description: "Approval bottlenecks detected", defaultConfidence: 0.75, typicalHoursSaved: 40, typicalRiskReduction: 25 },
      { type: "redundant-approval", category: "approvals", source: "approval_analyzer", description: "Redundant approval steps found", defaultConfidence: 0.8, typicalHoursSaved: 60, typicalRiskReduction: 15 },
      { type: "workflow-simplification", category: "workflow", source: "workflow_analyzer", description: "Workflow can be simplified", defaultConfidence: 0.7, typicalHoursSaved: 80, typicalRiskReduction: 20 },
      { type: "manual-workflow-step", category: "workflow", source: "workflow_analyzer", description: "Manual step can be automated", defaultConfidence: 0.85, typicalHoursSaved: 120, typicalRiskReduction: 30 },
      { type: "policy-consolidation", category: "compliance", source: "policy_analyzer", description: "Policies can be consolidated", defaultConfidence: 0.7, typicalHoursSaved: 30, typicalRiskReduction: 20 },
      { type: "redundant-policy", category: "compliance", source: "policy_analyzer", description: "Redundant policies detected", defaultConfidence: 0.75, typicalHoursSaved: 20, typicalRiskReduction: 10 },
      { type: "duplicate-report", category: "reporting", source: "reporting_analyzer", description: "Duplicate reports found", defaultConfidence: 0.8, typicalHoursSaved: 15, typicalRiskReduction: 5 },
      { type: "unused-dashboard", category: "dashboards", source: "reporting_analyzer", description: "Unused dashboards found", defaultConfidence: 0.85, typicalHoursSaved: 10, typicalRiskReduction: 0 },
      { type: "treasury-cash-concentration", category: "treasury", source: "treasury_analyzer", description: "Cash concentration opportunity", defaultConfidence: 0.65, typicalHoursSaved: 20, typicalRiskReduction: 35 },
      { type: "treasury-forecast-improvement", category: "cash_flow", source: "treasury_analyzer", description: "Forecast accuracy can be improved", defaultConfidence: 0.6, typicalHoursSaved: 40, typicalRiskReduction: 25 },
      { type: "reconciliation-automation", category: "automation", source: "efficiency_analyzer", description: "Reconciliation can be automated", defaultConfidence: 0.75, typicalHoursSaved: 100, typicalRiskReduction: 40 },
      { type: "repetitive-manual-work", category: "resource_usage", source: "efficiency_analyzer", description: "Repetitive manual work detected", defaultConfidence: 0.7, typicalHoursSaved: 80, typicalRiskReduction: 20 },
      { type: "underused-feature", category: "automation", source: "efficiency_analyzer", description: "Underused platform capability", defaultConfidence: 0.55, typicalHoursSaved: 30, typicalRiskReduction: 10 },
      { type: "notification-overload", category: "notifications", source: "system_analyzer", description: "Notification overload detected", defaultConfidence: 0.7, typicalHoursSaved: 15, typicalRiskReduction: 5 },
      { type: "permission-creep", category: "permissions", source: "system_analyzer", description: "Permission creep detected", defaultConfidence: 0.75, typicalHoursSaved: 10, typicalRiskReduction: 50 },
      { type: "unused-rule", category: "business_rules", source: "workflow_analyzer", description: "Unused business rules found", defaultConfidence: 0.8, typicalHoursSaved: 15, typicalRiskReduction: 10 },
      { type: "slow-query", category: "system_performance", source: "system_analyzer", description: "Slow database queries detected", defaultConfidence: 0.6, typicalHoursSaved: 20, typicalRiskReduction: 15 },
      { type: "month-end-optimization", category: "automation", source: "efficiency_analyzer", description: "Month-end close can be optimized", defaultConfidence: 0.7, typicalHoursSaved: 200, typicalRiskReduction: 30 },
      { type: "compliance-gap", category: "compliance", source: "policy_analyzer", description: "Compliance gap detected", defaultConfidence: 0.6, typicalHoursSaved: 40, typicalRiskReduction: 60 },
      { type: "approval-delegation", category: "approvals", source: "approval_analyzer", description: "Approval delegation recommendation", defaultConfidence: 0.65, typicalHoursSaved: 25, typicalRiskReduction: 10 },
    ];

    for (const def of defs) {
      this.definitions.set(def.type, def);
    }
  }

  getDefinition(type: string): OptimizationDefinition | undefined {
    return this.definitions.get(type);
  }

  getAllDefinitions(): OptimizationDefinition[] {
    return Array.from(this.definitions.values());
  }

  getDefinitionsByCategory(category: OptimizationCategory): OptimizationDefinition[] {
    return this.getAllDefinitions().filter((d) => d.category === category);
  }
}

export const optimizationRegistry = new OptimizationRegistry();
