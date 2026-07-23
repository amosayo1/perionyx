# Banking Provider Framework

## Overview

The Banking Provider Framework is a pluggable architecture that abstracts 16 bank data providers behind a unified interface. It separates **static metadata** (definitions) from **runtime behavior** (implementations), enabling enterprise deployments to mix, match, fail over, and configure providers per tenant without code changes.

The framework lives in `src/server/banking/providers/` and consists of four layers:

```
┌─────────────────────────────────────────────────────┐
│                   Consumer Layer                     │
│  (TreasuryService, PaymentService, SyncEngine, ...)  │
├─────────────────────────────────────────────────────┤
│                  Selection Layer                      │
│  ProviderSelector ─── BankingRoutingEngine           │
│         │                    │                       │
│         ▼                    ▼                       │
│  ProviderRankingEngine  BankProviderRegistry         │
├─────────────────────────────────────────────────────┤
│                Definition Layer                      │
│  PROVIDER_DEFINITIONS ──── ProviderDefinition        │
│  PROVIDER_DEFINITION_MAP                             │
├─────────────────────────────────────────────────────┤
│              Implementation Layer                    │
│  IBankProvider ──── PlaidProvider                    │
│                  ──── LeanProvider                    │
│                  ──── TrueLayerProvider               │
│                  ──── ... (16 total)                  │
└─────────────────────────────────────────────────────┘
```

## The 16 Provider Definitions

Defined in `src/server/banking/providers/definitions/provider-definitions.ts:9-567` as the `PROVIDER_DEFINITIONS` array (type `ProviderDefinition[]`).

| # | Kind | Name | Primary Region | Priority |
|---|------|------|---------------|----------|
| 1 | `plaid` | Plaid | North America, Asia Pacific | 1 |
| 2 | `lean` | Lean | Middle East (SA, AE, KW, OM, BH, QA) | 2 |
| 3 | `tarabut` | Tarabut | Middle East (BH, QA, AE, SA) | 3 |
| 4 | `truelayer` | TrueLayer | Europe, UK | 4 |
| 5 | `tink` | Tink | Europe, UK | 5 |
| 6 | `salted` | Salt Edge | Global fallback (90+ countries) | 6 |
| 7 | `mx` | MX Technologies | North America | 7 |
| 8 | `finicity` | Finicity (Mastercard) | US | 8 |
| 9 | `akoya` | Akoya | US | 9 |
| 10 | `yodlee` | Yodlee (Envestnet) | North America, Asia Pacific | 10 |
| 11 | `gocardless` | GoCardless (Nordigen) | Europe, UK | 11 |
| 12 | `direct-api` | Direct REST API | Middle East, Africa, Asia Pacific | 12 |
| 13 | `swift` | SWIFT Gateway | Global (SWIFT network) | 13 |
| 14 | `iso20022` | ISO 20022 Gateway | Global, Europe, Asia Pacific | 14 |
| 15 | `manual` | Manual Entry | Global | 15 |
| 16 | `csv` | CSV Import | Global | 16 |

Each definition is a `ProviderDefinition` object containing regions, capabilities, protocols, payment rails, currencies, rate limits, and priority metadata.

## Definitions vs Implementations

### Definitions (Static)

`ProviderDefinition` (`src/server/banking/providers/definitions/types.ts:16-39`) is pure metadata:

```typescript
interface ProviderDefinition {
  kind: BankProviderKind;         // unique identifier
  name: string;                    // human-readable
  description: string;
  regions: RegionCoverage[];       // region + countries + recommended/fallback
  capabilities: ProviderCapability[];
  protocols: ConnectionProtocol[];
  paymentRails: PaymentRail[];
  currencies: string[];
  globalPriority: number;          // lower = preferred (1 = best)
  failoverPriority: number;        // lower = preferred in failover
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  maxConcurrentConnections: number;
  maxHistoryDays: number;
  sandboxAvailable: boolean;
  requiresClientSecret: boolean;
  requiresCertificate: boolean;
  healthEndpoint: string | null;
}
```

Definitions are stored in-memory as an array + a `Map<string, ProviderDefinition>` keyed by `kind`.

### Implementations (Runtime)

`IBankProvider` (`src/server/banking/providers/interface.ts:67-130`) is the runtime contract:

```typescript
interface IBankProvider {
  readonly kind: BankProviderKind;
  initialize(config: ProviderInitConfig): Promise<void>;
  getManifest(): ProviderCapabilityManifest;
  searchInstitutions(query: string, country?: string): Promise<BankInstitution[]>;
  getInstitution(institutionId: string): Promise<BankInstitution | null>;
  createConnectionLink(params: ConnectionLinkParams): Promise<ConnectionLinkResult>;
  authenticateConnection(auth: AuthenticateConnectionParams): Promise<AuthenticationResult>;
  getConnectionStatus(connection: BankConnection): Promise<ConnectionHealth>;
  refreshConnection?(connection: BankConnection): Promise<void>;
  revokeConnection(connection: BankConnection): Promise<void>;
  listAccounts(connection: BankConnection): Promise<BankAccount[]>;
  getAccount(connection: BankConnection, accountId: string): Promise<BankAccount | null>;
  syncTransactions(...): Promise<SyncResult>;
  syncBalances(...): Promise<BalanceSyncResult>;
  getStatement(...): Promise<StatementResult>;
  initiatePayment(...): Promise<PaymentInitiationResult>;
  getPaymentStatus(...): Promise<PaymentStatusResult>;
  subscribeToWebhooks?(webhookUrl: string, events: BankingEventType[]): Promise<WebhookSubscriptionResult>;
  unsubscribeFromWebhooks?(subscriptionId: string): Promise<void>;
  handleWebhook?(payload: unknown): Promise<WebhookEvent[]>;
  getRateLimits(): RateLimitConfig;
  isHealthy(): Promise<boolean>;
}
```

Implementations are **not coupled to definitions**. A definition may exist without a runtime implementation (e.g., during testing or when a provider is not yet integrated).

## How to Register Providers

Registration uses `BankProviderRegistry` (`src/server/banking/providers/registry/engine.ts:5-77`):

```typescript
const registry = new BankProviderRegistry();

// Register a factory function (not an instance)
registry.registerKind("plaid", () => new PlaidProvider());

// Create a singleton instance
const plaid = registry.createInstance("plaid");

// Retrieve later
const provider = registry.get("plaid");

// Query by capability or region
const paymentProviders = registry.getByCapability(ProviderCapability.PAYMENTS);
const euProviders = registry.getByRegion(BankingRegion.EUROPE);
```

A global singleton is exported:

```typescript
export const bankProviderRegistry = new BankProviderRegistry();
```

The registry enforces **one factory per kind** — calling `registerKind()` twice for the same kind throws an error.

## Provider Lifecycle

```
┌──────────┐   registerKind()   ┌──────────┐   createInstance()   ┌──────────┐
│  Factory  │ ───────────────►  │ Registry │ ──────────────────► │ Instance │
│  (lazy)   │                   │  (Map)   │                      │  (Map)   │
└──────────┘                   └──────────┘                      └──────────┘
                                                                      │
                                                            initialize(config)
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │   Ready      │
                                                              │  (in-memory  │
                                                              │   instance)  │
                                                              └──────────────┘
```

1. **Factory Registration**: `registerKind(kind, factory)` — stores a lazy factory; no network or memory overhead.
2. **Instance Creation**: `createInstance(kind)` — invokes the factory and caches the singleton.
3. **Initialization**: Consumer calls `provider.initialize(config)` with credentials and environment.
4. **Runtime**: Provider handles data operations, sync, payments.
5. **Health & Diagnostics**: `ProviderDiagnosticsService` tracks health per instance.
6. **Removal**: `remove(kind)` — removes both factory and instance.
7. **Clear**: `clear()` — resets all registrations (useful in tests).

## Key Interfaces

### `BankProviderKind` (domain/types.ts:1-24)

Union of 24 possible provider identifiers. The 16 primary kinds with definitions are `plaid`, `lean`, `tarabut`, `truelayer`, `tink`, `salted`, `mx`, `finicity`, `akoya`, `yodlee`, `gocardless`, `direct-api`, `swift`, `iso20022`, `manual`, `csv`. Additional kinds (`yap`, `ofx`, `mt940`, `camt053`, `bai2`, `open-banking`, `custom`) are reserved for future expansion.

### `ProviderDefinition` (definitions/types.ts:16-39)

Static metadata only. Contains no runtime logic. Used by routing, ranking, capability matching, and diagnostics — all of which query definitions without instantiating providers.

### `IBankProvider` (interface.ts:67-130)

Runtime contract with 20+ methods. Optional methods (`refreshConnection?`, `subscribeToWebhooks?`, `handleWebhook?`) allow providers to opt into advanced features.

### `BankProviderRegistry` (registry/engine.ts:5-77)

Manages the lifecycle of factories and instances. Provides query methods: `getByCapability()`, `getByRegion()`, `getSupportedKinds()`, `getAvailableKinds()`.

### `ProviderInitConfig` (interface.ts:132-139)

```typescript
interface ProviderInitConfig {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  environment: "sandbox" | "development" | "production";
  baseUrl?: string;
  customConfig?: Record<string, unknown>;
}
```

### `CapabilityMatrix` (capabilities/matrix.ts:5-93)

Read-only derived matrix of all provider × capability pairs. Used for finding best-match providers via `findBestMatch(query)`.

## How to Add a New Provider

### Step 1: Add the kind

Add the string literal to the `BankProviderKind` union in `src/server/banking/domain/types.ts`.

### Step 2: Create the definition

Add a `ProviderDefinition` object to the `PROVIDER_DEFINITIONS` array in `provider-definitions.ts`. The order determines `globalPriority` and `failoverPriority`.

### Step 3: Implement the class

Create `src/server/banking/providers/implementations/my-provider.ts` that implements `IBankProvider`. All methods must be implemented (at minimum `initialize`, `getManifest`, `searchInstitutions`, `getInstitution`, `createConnectionLink`, `authenticateConnection`, `getConnectionStatus`, `revokeConnection`, `listAccounts`, `getAccount`, `syncTransactions`, `syncBalances`, `getRateLimits`, `isHealthy`).

### Step 4: Register

```typescript
import { bankProviderRegistry } from "./registry/engine";
import { MyProvider } from "./implementations/my-provider";

bankProviderRegistry.registerKind("my-provider", () => new MyProvider());
```

### Step 5: Add region config

If the provider targets specific regions, add a `RegionalProviderConfig` entry to the appropriate array in `src/server/banking/providers/regions/registry.ts` and an entry in `BANKING_REGION_REGISTRY`.

### Step 6: Verify

```typescript
const def = getProviderDefinition("my-provider");   // metadata
const inst = bankProviderRegistry.get("my-provider"); // runtime
```

## Architecture Diagram

```
                    ┌───────────────────────────────────────┐
                    │        Enterprise Application         │
                    │  (Treasury, Payments, Reconciliation) │
                    └───────────┬───────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   ProviderSelector    │  selection/engine.ts
                    │  (routing + ranking)  │
                    └───┬───────────┬───────┘
                        │           │
              ┌─────────▼──┐  ┌────▼──────────┐
              │  Routing   │  │   Ranking     │
              │   Engine   │  │   Engine      │
              │ (region +  │  │ (capabilities │
              │  country)  │  │  + protocol   │
              └─────┬──────┘  │  + currency)  │
                    │         └────┬──────────┘
                    │              │
              ┌─────▼──────────────▼──┐
              │   BankProviderRegistry │  registry/engine.ts
              │   (IBankProvider map)  │
              └─────┬──────────────┬──┘
                    │              │
        ┌───────────▼──┐   ┌──────▼──────────┐
        │  Definition  │   │  Implementation │
        │    Layer     │   │     Layer       │
        │ (static Map) │   │  (IBankProvider │
        └──────────────┘   │   instances)    │
                           └─────────────────┘
```
