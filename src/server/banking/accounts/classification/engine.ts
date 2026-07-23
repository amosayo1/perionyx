import type {
  ClassificationResult,
  EnterpriseClassification,
  ClassificationRule,
} from "../types";

export const DEFAULT_CLASSIFICATION_RULES: ClassificationRule[] = [
  { id: "cls-op-1", name: "Operating from type", description: "Account named operating → OPERATING", priority: 10, conditions: [{ field: "type", operator: "equals", value: "OPERATING" }], result: "OPERATING" },
  { id: "cls-tr-1", name: "Treasury from type", description: "Account named TREASURY → TREASURY", priority: 10, conditions: [{ field: "type", operator: "equals", value: "TREASURY" }], result: "TREASURY" },
  { id: "cls-pr-1", name: "Payroll from type", description: "Account named PAYROLL → PAYROLL", priority: 10, conditions: [{ field: "type", operator: "equals", value: "PAYROLL" }], result: "PAYROLL" },
  { id: "cls-in-1", name: "Investment from type", description: "Account named INVESTMENT → INVESTMENT", priority: 10, conditions: [{ field: "type", operator: "equals", value: "INVESTMENT" }], result: "INVESTMENT" },
  { id: "cls-es-1", name: "Escrow from type", description: "Account named ESCROW → SETTLEMENT", priority: 9, conditions: [{ field: "type", operator: "equals", value: "ESCROW" }], result: "SETTLEMENT" },
  { id: "cls-op-2", name: "Operating keywords", description: "Name contains operating/operations/working capital", priority: 8, conditions: [{ field: "name", operator: "contains", value: ["operating", "operations", "working capital"] }], result: "OPERATING" },
  { id: "cls-tr-2", name: "Treasury keywords", description: "Name contains treasury/liquidity/reserve", priority: 8, conditions: [{ field: "name", operator: "contains", value: ["treasury", "liquidity", "cash reserve"] }], result: "TREASURY" },
  { id: "cls-pr-2", name: "Payroll keywords", description: "Name contains payroll/salary/wages", priority: 8, conditions: [{ field: "name", operator: "contains", value: ["payroll", "salary", "wages", "employee"] }], result: "PAYROLL" },
  { id: "cls-st-1", name: "Settlement keywords", description: "Name contains settlement/clearing/escrow", priority: 7, conditions: [{ field: "name", operator: "contains", value: ["settlement", "clearing", "escrow"] }], result: "SETTLEMENT" },
  { id: "cls-tx-1", name: "Tax keywords", description: "Name contains tax/vat/withholding", priority: 7, conditions: [{ field: "name", operator: "contains", value: ["tax", "vat", "withholding", "irs"] }], result: "TAX" },
  { id: "cls-rs-1", name: "Reserve keywords", description: "Name contains reserve/reserved", priority: 6, conditions: [{ field: "name", operator: "contains", value: ["reserve", "reserved"] }], result: "RESERVE" },
  { id: "cls-ic-1", name: "Intercompany keywords", description: "Name contains intercompany/affiliate/subsidiary", priority: 6, conditions: [{ field: "name", operator: "contains", value: ["intercompany", "affiliate", "subsidiary", "intra-group"] }], result: "INTERCOMPANY" },
  { id: "cls-cl-1", name: "Collections keywords", description: "Name contains collections/receivables/AR", priority: 6, conditions: [{ field: "name", operator: "contains", value: ["collection", "receivable", "ar", "invoice"] }], result: "COLLECTIONS" },
  { id: "cls-db-1", name: "Disbursement keywords", description: "Name contains disbursement/payables/AP", priority: 6, conditions: [{ field: "name", operator: "contains", value: ["disbursement", "payable", "AP", "vendor"] }], result: "DISBURSEMENT" },
  { id: "cls-sv-1", name: "Savings default", description: "SAVINGS type → RESERVE", priority: 5, conditions: [{ field: "type", operator: "equals", value: "SAVINGS" }], result: "RESERVE" },
  { id: "cls-lo-1", name: "Loan classification", description: "LOAN type → INVESTMENT", priority: 4, conditions: [{ field: "type", operator: "equals", value: "LOAN" }], result: "INVESTMENT" },
  { id: "cls-cc-1", name: "Credit classification", description: "CREDIT type → OPERATING", priority: 3, conditions: [{ field: "type", operator: "equals", value: "CREDIT" }], result: "OPERATING" },
];

export class ClassificationEngine {
  private rules: ClassificationRule[] = DEFAULT_CLASSIFICATION_RULES;
  private overrides = new Map<string, EnterpriseClassification>();

  addRule(rule: ClassificationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  setOverride(accountId: string, classification: EnterpriseClassification): void {
    this.overrides.set(accountId, classification);
  }

  removeOverride(accountId: string): void {
    this.overrides.delete(accountId);
  }

  clearOverrides(): void {
    this.overrides.clear();
  }

  classify(account: { id: string; name: string; type: string; currency: string; balance?: number }): ClassificationResult {
    const overrideKey = account.id;
    const overridden = this.overrides.has(overrideKey);
    const originalClassification = overridden ? this.overrides.get(overrideKey)! : undefined;

    let bestMatch: EnterpriseClassification = "UNKNOWN";
    let bestConfidence = 0;
    let bestRationale = "";
    const searchText = account.name.toLowerCase();

    if (overridden && originalClassification) {
      return {
        accountId: account.id,
        externalId: "",
        classification: originalClassification,
        confidence: 100,
        rationale: "Manually overridden",
        overridden: true,
        classifiedAt: new Date().toISOString(),
        classifiedBy: "user",
      };
    }

    for (const rule of this.rules) {
      const matchScore = this.evaluateRule(rule, account, searchText);
      if (matchScore > bestConfidence) {
        bestConfidence = matchScore;
        bestMatch = rule.result;
        bestRationale = rule.description;
      }
    }

    return {
      accountId: account.id,
      externalId: "",
      classification: bestMatch,
      confidence: bestConfidence,
      rationale: bestRationale || "No classification rules matched",
      overridden: false,
      classifiedAt: new Date().toISOString(),
      classifiedBy: "engine",
    };
  }

  batchClassify(accounts: { id: string; name: string; type: string; currency: string; balance?: number }[]): ClassificationResult[] {
    return accounts.map((a) => this.classify(a));
  }

  private evaluateRule(rule: ClassificationRule, account: { id: string; name: string; type: string; currency: string }, searchText: string): number {
    let totalScore = 0;
    const maxScore = 100;

    for (const condition of rule.conditions) {
      let matched = false;

      if (condition.field === "type") {
        matched = this.evaluatePrimitive(account.type, condition.operator, condition.value);
      } else if (condition.field === "name") {
        matched = this.evaluatePrimitive(searchText, condition.operator, condition.value);
      } else if (condition.field === "currency") {
        matched = this.evaluatePrimitive(account.currency, condition.operator, condition.value);
      }

      if (matched) {
        totalScore += maxScore / rule.conditions.length;
      } else {
        return 0;
      }
    }

    const ruleWeight = rule.priority / 10;
    return Math.round(Math.min(maxScore, (totalScore / maxScore) * 100) * ruleWeight);
  }

  private evaluatePrimitive(fieldValue: string | number, operator: string, conditionValue: string | number | string[]): boolean {
    switch (operator) {
      case "equals":
        return String(fieldValue).toLowerCase() === String(conditionValue).toLowerCase();
      case "contains": {
        if (Array.isArray(conditionValue)) {
          const strField = String(fieldValue).toLowerCase();
          return conditionValue.some((v) => strField.includes(String(v).toLowerCase()));
        }
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      }
      case "startsWith":
        return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      default:
        return false;
    }
  }

  getRules(): ClassificationRule[] {
    return [...this.rules];
  }

  getOverrides(): Map<string, EnterpriseClassification> {
    return new Map(this.overrides);
  }
}

export const classificationEngine = new ClassificationEngine();