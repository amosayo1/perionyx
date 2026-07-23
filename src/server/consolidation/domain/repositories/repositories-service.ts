import type {
  LegalEntity, OwnershipRecord, ConsolidationRun, CurrencyTranslationRun,
  IntercompanyRecord, MinorityInterestRecord, EquityAccountRecord,
  ConsolidationAdjustment, FinancialStatementSet, ManagementReportEntry,
  BoardReport, ConsolidationRecommendation, ConsolidationAlert,
} from "../../types";

type CollectionName =
  | "entities" | "ownerships" | "runs" | "translations" | "intercompany"
  | "minorityInterest" | "equityAccounting" | "adjustments" | "financialStatements"
  | "managementReports" | "boardReports" | "recommendations" | "alerts";

type CollectionData = {
  entities: LegalEntity;
  ownerships: OwnershipRecord;
  runs: ConsolidationRun;
  translations: CurrencyTranslationRun;
  intercompany: IntercompanyRecord;
  minorityInterest: MinorityInterestRecord;
  equityAccounting: EquityAccountRecord;
  adjustments: ConsolidationAdjustment;
  financialStatements: FinancialStatementSet;
  managementReports: ManagementReportEntry;
  boardReports: BoardReport;
  recommendations: ConsolidationRecommendation;
  alerts: ConsolidationAlert;
};

export class RepositoriesService {
  private stores = new Map<CollectionName, Map<string, CollectionData[CollectionName]>>();

  constructor() {
    const names: CollectionName[] = [
      "entities", "ownerships", "runs", "translations", "intercompany",
      "minorityInterest", "equityAccounting", "adjustments", "financialStatements",
      "managementReports", "boardReports", "recommendations", "alerts",
    ];
    for (const name of names) {
      this.stores.set(name, new Map());
    }
  }

  findById<C extends CollectionName>(collection: C, id: string): CollectionData[C] | undefined {
    return this.stores.get(collection)?.get(id) as CollectionData[C] | undefined;
  }

  findAll<C extends CollectionName>(collection: C): CollectionData[C][] {
    return Array.from(this.stores.get(collection)?.values() ?? []) as CollectionData[C][];
  }

  findByField<C extends CollectionName, F extends keyof CollectionData[C]>(
    collection: C, field: F, value: CollectionData[C][F],
  ): CollectionData[C][] {
    return this.findAll(collection).filter((item) => item[field] === value);
  }

  insert<C extends CollectionName>(collection: C, id: string, data: CollectionData[C]): CollectionData[C] {
    const store = this.stores.get(collection);
    if (store) {
      store.set(id, data);
    }
    return data;
  }

  update<C extends CollectionName>(collection: C, id: string, data: Partial<CollectionData[C]>): CollectionData[C] | undefined {
    const store = this.stores.get(collection);
    if (!store) return undefined;
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    store.set(id, updated);
    return updated as CollectionData[C];
  }

  delete<C extends CollectionName>(collection: C, id: string): boolean {
    return this.stores.get(collection)?.delete(id) ?? false;
  }

  count<C extends CollectionName>(collection: C): number {
    return this.stores.get(collection)?.size ?? 0;
  }
}
