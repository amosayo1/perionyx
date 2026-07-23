import type {
  BudgetPlan, BudgetLineItem, Forecast, ForecastLineItem, Scenario, ScenarioAssumption,
  DriverDefinition, WorkforcePlan, RevenuePlan, ExpensePlan, CapitalPlan, CashPlan,
  VarianceAnalysisRecord, WhatIfAnalysis, StrategicPlan, PlanningRecommendation, PlanningAlert,
} from "../../types";

type CollectionName =
  | "budgetPlans" | "budgetLineItems" | "forecasts" | "forecastLineItems"
  | "scenarios" | "scenarioAssumptions" | "drivers" | "workforcePlans"
  | "revenuePlans" | "expensePlans" | "capitalPlans" | "cashPlans"
  | "variances" | "whatIfAnalyses" | "strategicPlans" | "recommendations" | "alerts";

type CollectionMap = {
  budgetPlans: BudgetPlan;
  budgetLineItems: any;
  forecasts: Forecast;
  forecastLineItems: any;
  scenarios: any;
  scenarioAssumptions: any;
  drivers: any;
  workforcePlans: any;
  revenuePlans: any;
  expensePlans: any;
  capitalPlans: any;
  cashPlans: any;
  variances: VarianceAnalysisRecord;
  whatIfAnalyses: any;
  strategicPlans: any;
  recommendations: any;
  alerts: any;
};

export class RepositoriesService {
  private stores = new Map<CollectionName, Map<string, any>>();

  constructor() {
    const names: CollectionName[] = [
      "budgetPlans", "budgetLineItems", "forecasts", "forecastLineItems",
      "scenarios", "scenarioAssumptions", "drivers", "workforcePlans",
      "revenuePlans", "expensePlans", "capitalPlans", "cashPlans",
      "variances", "whatIfAnalyses", "strategicPlans", "recommendations", "alerts",
    ];
    for (const name of names) { this.stores.set(name, new Map()); }
  }

  findById<T>(collection: CollectionName, id: string): T | undefined {
    return this.stores.get(collection)?.get(id) as T | undefined;
  }

  findAll<T>(collection: CollectionName): T[] {
    return Array.from(this.stores.get(collection)?.values() ?? []) as T[];
  }

  findByField<T>(collection: CollectionName, field: string, value: any): T[] {
    return this.findAll<any>(collection).filter((item) => item[field] === value) as T[];
  }

  insert<T extends { id: string }>(collection: CollectionName, item: T): T {
    this.stores.get(collection)?.set(item.id, item);
    return item;
  }

  update<T>(collection: CollectionName, id: string, updates: Partial<T>): T | undefined {
    const store = this.stores.get(collection); if (!store) return undefined;
    const existing = store.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    store.set(id, updated); return updated as T;
  }

  delete(collection: CollectionName, id: string): boolean {
    return this.stores.get(collection)?.delete(id) ?? false;
  }

  count(collection: CollectionName): number {
    return this.stores.get(collection)?.size ?? 0;
  }
}
