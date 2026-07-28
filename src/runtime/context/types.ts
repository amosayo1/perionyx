/**
 * Runtime Context Types — Phase 24.0B
 *
 * Canonical context types propagated through AsyncLocalStorage.
 * Every runtime service reads context automatically.
 */

// ── Tenant Context ────────────────────────────────────────────────────────

export interface TenantContext {
  userId: string;
  companyId: string;
  role: string;
}

// ── Request Context ───────────────────────────────────────────────────────

export interface RequestContext {
  requestId: string;
  correlationId: string;
  causationId?: string;
  clientIp?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

// ── Trace Context ─────────────────────────────────────────────────────────

export interface TraceContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
}

// ── Permission Context ────────────────────────────────────────────────────

export interface PermissionContext {
  permissions: string[];
  mfaVerified: boolean;
  sessionStartedAt?: Date;
}

// ── Financial Context ─────────────────────────────────────────────────────

export interface FinancialContext {
  defaultCurrency: string;
  fiscalYearStart: number; // month (1-12)
  accountingMethod: 'accrual' | 'cash';
  decimalPrecision: number;
}

// ── Locale Context ────────────────────────────────────────────────────────

export interface LocaleContext {
  locale: string;
  timezone: string;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

// ── Runtime Context (aggregate) ───────────────────────────────────────────

export interface RuntimeContext {
  tenant?: TenantContext;
  request?: RequestContext;
  trace?: TraceContext;
  permission?: PermissionContext;
  financial?: FinancialContext;
  locale?: LocaleContext;
}

// ── Context Options ───────────────────────────────────────────────────────

export interface WithContextOptions {
  tenant?: TenantContext;
  request?: RequestContext;
  trace?: TraceContext;
  permission?: PermissionContext;
  financial?: FinancialContext;
  locale?: LocaleContext;
}
