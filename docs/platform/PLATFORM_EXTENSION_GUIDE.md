# Platform Extension Guide

**Document**: 3 of 5 — Governance Series
**Authority**: Platform Constitution v1.0 — Law 3 ("Every Platform Exposes Capability Contracts"), Law 4 ("Provider Drivers Are Replaceable")
**Version**: 1.0
**Ratified**: July 2026

---

## Purpose

This document provides a step-by-step guide for adding new capabilities to the Perionyx platform. It covers the complete lifecycle from capability definition through production deployment, including templates, checklists, and verification steps.

**Every extension must conform to the Platform Constitution. No exceptions.**

---

## Extension Lifecycle

```
Define Contract → Create Driver → Implement Platform → Register → Test → Observe → Document → Certify → Deploy → Monitor
```

---

## Step 1: Define the Capability Contract

The capability contract is the stable, versioned, provider-agnostic interface that business domains will consume. It is the most important artifact — it must be right before any implementation begins.

### 1.1 Define the Interface

Create or extend the contract interface in the appropriate contract file:

```typescript
// Template: Capability Contract Interface
// Location: src/modules/{platform}/{platform}-contract.ts

import { z } from 'zod';

// 1. Input schema (Zod for runtime validation)
export const MyCapabilityInputSchema = z.object({
  companyId: z.string().min(1),          // Constitutional: tenant isolation
  userId: z.string().min(1),             // Constitutional: audit trail
  correlationId: z.string().optional(),  // Constitutional: distributed tracing
  // Domain-specific fields below
  entityName: z.string().min(1).max(255),
  amount: z.number().positive(),         // Use Decimal(38,12) at persistence layer
  currency: z.string().length(3).optional().default('USD'),
});

export type MyCapabilityInput = z.infer<typeof MyCapabilityInputSchema>;

// 2. Output schema
export const MyCapabilityOutputSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  entityName: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string().datetime(),
});

export type MyCapabilityOutput = z.infer<typeof MyCapabilityOutputSchema>;

// 3. Error types (canonical error codes from CAPABILITY_CONTRACTS.md)
export type MyCapabilityError =
  | { code: 'VALIDATION_ERROR'; message: string; details?: unknown }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'PROVIDER_ERROR'; message: string; providerError?: unknown }
  | { code: 'RATE_LIMITED'; message: string; retryAfterMs?: number }
  | { code: 'AUTHENTICATION_FAILED'; message: string }
  | { code: 'AUTHORIZATION_FAILED'; message: string }
  | { code: 'INTERNAL_ERROR'; message: string };

// 4. Event types
export type MyCapabilityEvent =
  | { type: 'entity.created'; payload: { id: string; companyId: string } }
  | { type: 'entity.updated'; payload: { id: string; companyId: string; changes: string[] } }
  | { type: 'entity.deleted'; payload: { id: string; companyId: string } };

// 5. Contract interface
export interface MyCapabilityContract {
  readonly version: string;
  readonly provider: string;

  execute(input: MyCapabilityInput): Promise<{
    success: boolean;
    data?: MyCapabilityOutput;
    error?: MyCapabilityError;
    metadata?: {
      durationMs: number;
      providerLatencyMs?: number;
      cacheHit?: boolean;
    };
  }>;

  health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, unknown>;
  }>;

  capabilities(): Promise<Array<{
    name: string;
    supported: boolean;
    version?: string;
  }>>;
}
```

### 1.2 Define the Events

Every contract must define its event catalog. Events use the canonical envelope from `CAPABILITY_CONTRACTS.md`:

```typescript
// Event envelope (reusable)
interface ContractEvent {
  type: string;
  provider: string;
  companyId: string;
  correlationId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
  metadata?: {
    userId?: string;
    sourceVersion?: string;
  };
}
```

### 1.3 Define the Errors

Use the canonical error code taxonomy. Never invent new top-level error codes — extend the existing set only through ARB approval.

### 1.4 Review and Approve

The contract definition must be reviewed by:
- **ARB Chair** — architecture compliance
- **Security Review Board** — if handling sensitive data
- **Affected Platform Owners** — if other Platforms will consume this contract

**Gate**: Contract must be ratified before any implementation begins.

---

## Step 2: Create the Provider Driver

Provider drivers are thin adapters that translate between provider SDKs and platform capability contracts. They contain zero business logic.

### 2.1 Driver Skeleton

```typescript
// Template: Provider Driver
// Location: src/modules/{platform}/drivers/{provider}-driver.ts

import { IProviderDriver, DriverConfig, DriverHealth, DriverCapability } from '../types';
import { MyCapabilityInput, MyCapabilityOutput, MyCapabilityError } from '../contract';

export class MyProviderDriver implements IProviderDriver {
  readonly kind = 'my-provider';
  readonly label = 'My Provider';
  readonly version = '1.0.0';
  readonly providerApiVersion = '2024-01-01';

  private config: DriverConfig | null = null;
  private circuitState: 'closed' | 'half-open' | 'open' = 'closed';
  private failureCount = 0;

  async initialize(config: DriverConfig): Promise<void> {
    this.config = config;
    // Validate config, create SDK client
    // Do NOT make external calls here
  }

  async healthCheck(): Promise<DriverHealth> {
    // Lightweight health check (ping, not full operation)
    return {
      status: this.circuitState === 'open' ? 'critical' : 'healthy',
      latencyMs: 0,
      details: { circuitState: this.circuitState },
    };
  }

  async destroy(): Promise<void> {
    // Cleanup resources, close connections
  }

  async getCapabilities(): Promise<DriverCapability[]> {
    return [
      { name: 'import-data', supported: true },
      { name: 'export-data', supported: false },
      { name: 'webhooks', supported: true },
    ];
  }

  async authenticate(credentials: DriverCredentials): Promise<AuthResult> {
    // Authenticate with provider
    // On success: return tokens
    // On failure: translate error to canonical code
    throw new Error('Not implemented');
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Refresh expired OAuth token
    throw new Error('Not implemented');
  }

  async request<T>(method: string, path: string, options: RequestOptions): Promise<T> {
    // 1. Check circuit breaker
    if (this.circuitState === 'open') {
      throw { code: 'CIRCUIT_OPEN', message: 'Circuit breaker is open' };
    }

    // 2. Apply rate limiting
    await this.checkRateLimit();

    // 3. Make provider request with retry
    return this.executeWithRetry(method, path, options);
  }

  verifyWebhook(payload: string, signature: string): boolean {
    // HMAC-SHA256 signature verification
    return false;
  }

  parseWebhook(payload: unknown): NormalizedEvent[] {
    // Translate provider webhook to canonical events
    return [];
  }

  private async checkRateLimit(): Promise<void> {
    // Token bucket rate limiting per provider
  }

  private async executeWithRetry<T>(
    method: string,
    path: string,
    options: RequestOptions
  ): Promise<T> {
    // Exponential backoff with jitter
    // Circuit breaker integration
    // Structured logging
    throw new Error('Not implemented');
  }
}
```

### 2.2 Error Translation Table

Every driver must define an error translation table:

```typescript
// Location: src/modules/{platform}/drivers/{provider}-error-map.ts

export const PROVIDER_ERROR_MAP: Record<string, MyCapabilityError> = {
  'INVALID_CREDENTIALS': { code: 'AUTHENTICATION_FAILED', message: 'Invalid credentials' },
  'RESOURCE_NOT_FOUND': { code: 'NOT_FOUND', message: 'Resource not found' },
  'RATE_LIMIT_EXCEEDED': { code: 'RATE_LIMITED', message: 'Rate limit exceeded', retryAfterMs: 60000 },
  'INTERNAL_SERVER_ERROR': { code: 'PROVIDER_ERROR', message: 'Provider error' },
  'TIMEOUT': { code: 'PROVIDER_ERROR', message: 'Provider timeout' },
};
```

### 2.3 Driver Registration

```typescript
// Location: src/modules/{platform}/registry.ts

import { MyProviderDriver } from './drivers/my-provider-driver';

// Register in the platform registry
registry.registerDriver('my-provider', {
  factory: () => new MyProviderDriver(),
  definition: {
    kind: 'my-provider',
    label: 'My Provider',
    category: 'banking', // or 'erp', 'communication', etc.
    authMethod: 'oauth2',
    capabilities: ['import-data', 'webhooks'],
  },
});
```

---

## Step 3: Implement the Platform Service

The Platform service fulfills the capability contract. It orchestrates providers, handles business logic, and manages state.

### 3.1 Platform Service Skeleton

```typescript
// Template: Platform Service
// Location: src/modules/{platform}/{platform}-service.ts

import { MyCapabilityContract, MyCapabilityInput, MyCapabilityOutput } from './contract';
import { ProviderRegistry } from './registry';
import { ObservabilityPlatform } from '../observability-platform';

export class MyPlatformService implements MyCapabilityContract {
  readonly version = '1.0.0';
  readonly provider = 'my-platform';

  constructor(
    private registry: ProviderRegistry,
    private observability: ObservabilityPlatform,
  ) {}

  async execute(input: MyCapabilityInput): Promise<{
    success: boolean;
    data?: MyCapabilityOutput;
    error?: MyCapabilityError;
  }> {
    const startTime = Date.now();
    const trace = this.observability.startSpan('contract.my-platform.execute');

    try {
      // 1. Validate input (Zod)
      const validated = MyCapabilityInputSchema.parse(input);

      // 2. Check permissions
      // (handled by middleware, but verify at contract boundary)

      // 3. Select provider driver
      const driver = this.registry.getActiveDriver();

      // 4. Execute through driver
      const result = await driver.request('POST', '/resource', { body: validated });

      // 5. Emit event
      await this.emitEvent({
        type: 'entity.created',
        provider: this.provider,
        companyId: validated.companyId,
        timestamp: new Date().toISOString(),
        payload: { id: result.id },
      });

      // 6. Record metric
      this.observability.recordMetric('contract_method_total', {
        provider: this.provider,
        method: 'execute',
        status: 'success',
      });

      return { success: true, data: result };

    } catch (error) {
      this.observability.recordMetric('contract_method_total', {
        provider: this.provider,
        method: 'execute',
        status: 'error',
      });

      return {
        success: false,
        error: this.translateError(error),
      };
    } finally {
      trace.end({ durationMs: Date.now() - startTime });
    }
  }

  async health() {
    const driver = this.registry.getActiveDriver();
    const driverHealth = await driver.healthCheck();
    return {
      status: driverHealth.status === 'healthy' ? 'healthy' as const : 'degraded' as const,
      details: { driver: driver.kind, driverHealth: driverHealth.status },
    };
  }

  async capabilities() {
    const driver = this.registry.getActiveDriver();
    return driver.getCapabilities();
  }

  private translateError(error: unknown): MyCapabilityError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as MyCapabilityError;
    }
    return { code: 'INTERNAL_ERROR', message: 'Unexpected error' };
  }
}
```

---

## Step 4: Register the Platform

### 4.1 Add to Platform Registry

Update `PLATFORM_CAPABILITIES.md` and the Platform Registry in the Constitution:

```markdown
| 16 | MyPlatform | `MyContract` | Integration & Connectivity | Scaffolded | 1 | `src/modules/my-platform/` |
```

### 4.2 Add to Constitution (if new Platform)

If adding an entirely new Platform (not extending an existing one):
1. Draft Platform architecture document
2. Submit to ARB for review
3. Add to Constitution Platform Registry
4. Add to this document (ownership, SLAs, maturity)

---

## Step 5: Write Tests

### 5.1 Unit Tests

```typescript
// Location: test/unit/modules/{platform}/{platform}-service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyPlatformService } from '../../../src/modules/{platform}/{platform}-service';

describe('MyPlatformService', () => {
  let service: MyPlatformService;
  let mockRegistry: any;
  let mockObservability: any;

  beforeEach(() => {
    mockRegistry = { getActiveDriver: vi.fn() };
    mockObservability = { startSpan: vi.fn(), recordMetric: vi.fn() };
    service = new MyPlatformService(mockRegistry, mockObservability);
  });

  describe('execute', () => {
    it('should execute successfully with valid input', async () => {
      const mockDriver = {
        request: vi.fn().mockResolvedValue({ id: '1', status: 'completed' }),
      };
      mockRegistry.getActiveDriver.mockReturnValue(mockDriver);

      const result = await service.execute({
        companyId: 'company-1',
        userId: 'user-1',
        entityName: 'test',
        amount: 100,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error for invalid input', async () => {
      const result = await service.execute({
        companyId: '',  // invalid
        userId: 'user-1',
        entityName: 'test',
        amount: -1,     // invalid
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should handle provider errors', async () => {
      const mockDriver = {
        request: vi.fn().mockRejectedValue({
          code: 'PROVIDER_ERROR',
          message: 'Provider unavailable',
        }),
      };
      mockRegistry.getActiveDriver.mockReturnValue(mockDriver);

      const result = await service.execute({
        companyId: 'company-1',
        userId: 'user-1',
        entityName: 'test',
        amount: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PROVIDER_ERROR');
    });
  });
});
```

### 5.2 Contract Tests

```typescript
// Location: test/contract/{platform}-contract.test.ts

import { describe, it, expect } from 'vitest';
import { MyCapabilityContract } from '../../src/modules/{platform}/contract';

describe('MyCapabilityContract', () => {
  let contract: MyCapabilityContract;

  beforeAll(async () => {
    // Initialize with test provider
    contract = await createTestContract();
  });

  it('should implement all required methods', () => {
    expect(typeof contract.execute).toBe('function');
    expect(typeof contract.health).toBe('function');
    expect(typeof contract.capabilities).toBe('function');
  });

  it('should return healthy status', async () => {
    const health = await contract.health();
    expect(health.status).toMatch(/healthy|degraded|unhealthy/);
  });

  it('should list capabilities', async () => {
    const caps = await contract.capabilities();
    expect(Array.isArray(caps)).toBe(true);
    expect(caps.length).toBeGreaterThan(0);
  });

  it('should handle tenant isolation', async () => {
    const result = await contract.execute({
      companyId: 'tenant-a',
      userId: 'user-1',
      entityName: 'test',
      amount: 100,
    });
    // Result should be scoped to tenant-a
    if (result.data) {
      expect(result.data.companyId).toBe('tenant-a');
    }
  });
});
```

### 5.3 Failure Mode Tests

```typescript
// Location: test/failure/{platform}-failure.test.ts

describe('MyPlatform failure modes', () => {
  it('should handle provider timeout', async () => {
    // Mock provider to timeout
    // Verify circuit breaker opens
    // Verify error propagated correctly
  });

  it('should handle provider rate limiting', async () => {
    // Mock provider to return 429
    // Verify retry with backoff
    // Verify RATE_LIMITED error
  });

  it('should handle authentication failure', async () => {
    // Mock provider to return 401
    // Verify token refresh attempted
    // Verify AUTHENTICATION_FAILED error
  });

  it('should handle circuit breaker opening', async () => {
    // Mock 5 consecutive failures
    // Verify circuit opens
    // Verify CIRCUIT_OPEN error on next call
    // Wait for recovery timeout
    // Verify circuit closes after success
  });
});
```

---

## Step 6: Add Observability

### 6.1 Metrics

```typescript
// Register metrics in the platform's observability setup

// Counter: total contract method calls
observability.registerCounter('contract_method_total', {
  labels: ['provider', 'method', 'status'],
});

// Histogram: contract method latency
observability.registerHistogram('contract_method_duration_ms', {
  labels: ['provider', 'method'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

// Gauge: in-flight requests
observability.registerGauge('contract_method_in_flight', {
  labels: ['provider', 'method'],
});

// Counter: driver errors
observability.registerCounter('driver_error_total', {
  labels: ['driver', 'method', 'error_code'],
});

// Gauge: circuit breaker state
observability.registerGauge('driver_circuit_state', {
  labels: ['driver'],
});
```

### 6.2 Structured Logging

```typescript
// Every contract method invocation logs:
logger.info({
  message: 'contract.my-platform.execute',
  provider: 'my-platform',
  method: 'execute',
  companyId: input.companyId,
  userId: input.userId,
  correlationId: input.correlationId,
  durationMs: Date.now() - startTime,
  status: result.success ? 'success' : 'error',
  errorCode: result.error?.code,
});
```

### 6.3 Health Check

```typescript
// Register health check with ObservabilityPlatform
healthRegistry.register('my-platform', async () => {
  const health = await service.health();
  return {
    name: 'my-platform',
    status: health.status === 'healthy' ? 'pass' : 'fail',
    details: health.details,
  };
});
```

---

## Step 7: Document

### Required Documentation

| Document | Location | Contents |
|---|---|---|
| Platform architecture | `docs/platform/{PLATFORM}.md` | Mission, capabilities, contract, drivers, security model |
| API reference | `docs/api/{platform}.md` | Endpoints, request/response schemas, error codes |
| Provider guide | `docs/providers/{provider}.md` | Provider-specific setup, quirks, limitations |
| Runbook | `docs/operations/{platform}-runbook.md` | Incident response, escalation, troubleshooting |
| Migration guide | `docs/migration/{platform}-migration.md` | Upgrade path, breaking changes, rollback |

---

## Step 8: Certify (if adding a Provider Driver)

If adding a new provider driver (not a new Platform), see `PROVIDER_CERTIFICATION_GUIDE.md` for the full certification checklist.

---

## Step 9: Deploy

### 9.1 CI/CD Pipeline

All Platforms must pass these gates before deployment:

| Gate | Command | Requirement |
|---|---|---|
| Type check | `pnpm typecheck` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Unit tests | `pnpm test` | All pass, coverage >80% |
| Integration tests | `pnpm test:integration` | All pass |
| Build | `pnpm build` | Success |
| Security scan | `pnpm edl:compliance` | Zero critical findings |
| Migration verify | `prisma migrate status` | All migrations applied |

### 9.2 Feature Flags

New capabilities should be behind feature flags for staged rollout:

```typescript
// Feature flag pattern
const isMyCapabilityEnabled = featureFlags.isEnabled('my-capability', companyId);

if (!isMyCapabilityEnabled) {
  return { success: false, error: { code: 'NOT_FOUND', message: 'Capability not available' } };
}
```

### 9.3 Rollback Plan

Every deployment must have a documented rollback plan:

1. **Database**: Migration must be backward-compatible or have a down migration
2. **Code**: Previous version must be deployable within 5 minutes
3. **Feature flags**: New features can be disabled without deployment
4. **Configuration**: Environment variables can be reverted

---

## Step 10: Monitor

### 10.1 Dashboard

Create or update the platform dashboard with:

| Panel | Metric | Alert |
|---|---|---|
| Success rate | `contract_method_total{status="success"} / contract_method_total` | <99% |
| Latency p95 | `histogram_quantile(0.95, contract_method_duration_ms)` | >5s |
| Error rate | `contract_method_total{status="error"} / contract_method_total` | >1% |
| Circuit breaker | `driver_circuit_state` | >0 (open) |
| Rate limit hits | `driver_rate_limit_resets_total` | >5/min |

### 10.2 Alerts

| Alert | Condition | Severity | Action |
|---|---|---|---|
| High error rate | >1% for 5 minutes | P2 | Investigate logs |
| Circuit breaker open | State >0 for 2 minutes | P1 | Check provider status |
| Latency spike | p95 >10s for 5 minutes | P2 | Check provider latency |
| Auth failure | >3 in 1 minute | P1 | Check credentials |

### 10.3 SLOs

Define SLOs for each Platform:

| SLO | Target | Measurement |
|---|---|---|
| Availability | 99.9% | Uptime / total time |
| Latency | p95 <2s | Contract method duration |
| Error rate | <1% | Errors / total calls |
| Data freshness | <15min | Time since last sync |

---

## Extension Checklist

Before considering an extension complete, verify:

- [ ] Capability contract defined and ratified
- [ ] Provider driver implements `IProviderDriver`
- [ ] Error translation table complete
- [ ] Platform service fulfills contract
- [ ] Registered in Platform Registry
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] Contract tests passing
- [ ] Failure mode tests passing
- [ ] Metrics registered and emitting
- [ ] Structured logging with correlation IDs
- [ ] Health check registered
- [ ] Architecture document updated
- [ ] API documentation updated
- [ ] Runbook documented
- [ ] CI/CD pipeline passing
- [ ] Feature flag configured
- [ ] Rollback plan documented
- [ ] Dashboard created
- [ ] Alerts configured
- [ ] SLOs defined
- [ ] ARB review completed (for new Platforms)

---

## Amendment History

| Version | Date | Change | Authority |
|---|---|---|---|
| 1.0 | July 2026 | Initial definition | Phase 23.0 |

---

*This document is part of the Perionyx Platform Constitution governance series.*
*Authority: Platform Constitution v1.0*
