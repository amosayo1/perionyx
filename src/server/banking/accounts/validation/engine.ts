import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  EnterpriseAccountMetadata,
} from "../types";

export class AccountValidationEngine {
  validateBatch(accounts: EnterpriseAccountMetadata[]): ValidationResult[] {
    return accounts.map((a) => this.validate(a));
  }

  validate(account: EnterpriseAccountMetadata): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const accountId = account.id;

    this.checkDuplicateAccount(account, errors);
    this.checkDuplicateIdentifiers(account, errors);
    this.checkCurrencyMismatch(account, errors);
    this.checkEntityMismatch(account, errors);
    this.checkMissingMappings(account, warnings);
    this.checkInactive(account, warnings);
    this.checkInstitution(account, warnings);
    this.checkProvider(account, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      validatedAt: new Date().toISOString(),
    };
  }

  private checkDuplicateAccount(account: EnterpriseAccountMetadata, errors: ValidationError[]): void {
    if (!account.externalId) {
      errors.push({
        code: "MISSING_EXTERNAL_ID",
        message: "Account has no external provider identifier",
        field: "externalId",
        severity: "error",
        accountId: account.id,
      });
    }
  }

  private checkDuplicateIdentifiers(account: EnterpriseAccountMetadata, errors: ValidationError[]): void {
    if (!account.legalEntity) {
      errors.push({
        code: "MISSING_LEGAL_ENTITY",
        message: "Account is not assigned to a legal entity",
        field: "legalEntity",
        severity: "error",
        accountId: account.id,
      });
    }
  }

  private checkCurrencyMismatch(account: EnterpriseAccountMetadata, warnings: ValidationError[]): void {
    if (!account.currency) {
      warnings.push({
        code: "MISSING_CURRENCY",
        message: "Account has no currency configured",
        field: "currency",
        severity: "warning",
        accountId: account.id,
      });
    }
  }

  private checkEntityMismatch(account: EnterpriseAccountMetadata, warnings: ValidationError[]): void {
    if (account.region && !account.country) {
      warnings.push({
        code: "MISSING_COUNTRY",
        message: "Account has a region but no country configured",
        field: "country",
        severity: "warning",
        accountId: account.id,
      });
    }
  }

  private checkMissingMappings(account: EnterpriseAccountMetadata, warnings: ValidationWarning[]): void {
    if (!account.legalEntity) {
      warnings.push({
        code: "MISSING_OWNERSHIP",
        message: "Account has no ownership mapping",
        accountId: account.id,
        suggestion: "Assign the account to a legal entity and owner",
      });
    }
  }

  private checkInactive(account: EnterpriseAccountMetadata, warnings: ValidationWarning[]): void {
    if (!account.isActive) {
      warnings.push({
        code: "INACTIVE_ACCOUNT",
        message: "Account is marked as inactive",
        accountId: account.id,
        suggestion: "Verify if the account should be closed or reactivated",
      });
    }
  }

  private checkInstitution(account: EnterpriseAccountMetadata, warnings: ValidationWarning[]): void {
    if (!account.institution) {
      warnings.push({
        code: "MISSING_INSTITUTION",
        message: "Account is not associated with a financial institution",
        accountId: account.id,
        suggestion: "Link the account to its financial institution",
      });
    }
  }

  private checkProvider(account: EnterpriseAccountMetadata, warnings: ValidationWarning[]): void {
    if (!account.provider) {
      warnings.push({
        code: "MISSING_PROVIDER",
        message: "Account has no provider associated",
        accountId: account.id,
        suggestion: "Verify the integration provider for this account",
      });
    }
  }
}

export const accountValidationEngine = new AccountValidationEngine();