import type { BankConnection, BankAccount, BankTransaction, LegalEntity, ConnectionAudit, AuditSeverity } from "../domain/types";

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  check: ComplianceCheckFunction;
  severity: AuditSeverity;
  autoResolve: boolean;
}

export type ComplianceCheckFunction = (
  context: ComplianceContext,
) => Promise<ComplianceCheckResult>;

export interface ComplianceContext {
  connection?: BankConnection;
  account?: BankAccount;
  transaction?: BankTransaction;
  entity?: LegalEntity;
  auditTrail: ConnectionAudit[];
}

export interface ComplianceCheckResult {
  passed: boolean;
  violations: ComplianceViolation[];
  warnings: string[];
}

export interface ComplianceViolation {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: AuditSeverity;
  resourceId: string;
  resourceType: string;
  timestamp: string;
}

export class BankingComplianceService {
  private rules: ComplianceRule[] = [];
  private violations: ComplianceViolation[] = [];
  private readonly maxViolations = 10_000;

  registerRule(rule: ComplianceRule): void {
    this.rules.push(rule);
  }

  unregisterRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  async checkConnectionCompliance(connection: BankConnection): Promise<ComplianceCheckResult> {
    const context: ComplianceContext = {
      connection,
      auditTrail: [],
    };
    return this.evaluateRules(context);
  }

  async checkTransactionCompliance(
    transaction: BankTransaction,
    context?: Partial<ComplianceContext>,
  ): Promise<ComplianceCheckResult> {
    const fullContext: ComplianceContext = {
      transaction,
      auditTrail: [],
      ...context,
    };
    return this.evaluateRules(fullContext);
  }

  private async evaluateRules(context: ComplianceContext): Promise<ComplianceCheckResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.check(context);
        if (!result.passed) {
          violations.push(...result.violations);
          warnings.push(...result.warnings);
        }
      } catch (err) {
        warnings.push(`Rule "${rule.name}" evaluation error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    for (const violation of violations) {
      this.violations.push(violation);
      if (this.violations.length > this.maxViolations) {
        this.violations.shift();
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
    };
  }

  getViolations(filter?: {
    severity?: AuditSeverity;
    resourceType?: string;
    since?: string;
  }): ComplianceViolation[] {
    let result = this.violations;
    if (filter?.severity) result = result.filter((v) => v.severity === filter.severity);
    if (filter?.resourceType) result = result.filter((v) => v.resourceType === filter.resourceType);
    if (filter?.since) {
      const since = new Date(filter.since);
      result = result.filter((v) => new Date(v.timestamp) >= since);
    }
    return result;
  }

  clearViolations(): void {
    this.violations = [];
  }

  get registeredRuleCount(): number {
    return this.rules.length;
  }

  get totalViolations(): number {
    return this.violations.length;
  }
}

export const bankingComplianceService = new BankingComplianceService();