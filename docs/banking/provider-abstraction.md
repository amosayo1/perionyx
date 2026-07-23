# Provider Abstraction

## Interface: `IBankProvider`

Every banking connector implements this single interface, allowing the entire banking platform to remain provider-agnostic.

### Core Methods

| Method | Purpose | Required |
|--------|---------|----------|
| `initialize(config)` | Configure with environment credentials | Yes |
| `getManifest()` | Declare capabilities, protocols, regions | Yes |
| `searchInstitutions(query)` | Find banks by name/country | Yes |
| `getInstitution(id)` | Get specific bank details | Yes |
| `createConnectionLink(params)` | Generate auth link/token | Yes |
| `authenticateConnection(auth)` | Exchange auth for access | Yes |
| `getConnectionStatus(connection)` | Check if connection works | Yes |
| `refreshConnection(connection)` | Re-authenticate if needed | Optional |
| `revokeConnection(connection)` | Disconnect and revoke tokens | Yes |
| `listAccounts(connection)` | Discover bank accounts | Yes |
| `getAccount(connection, id)` | Get single account | Yes |
| `syncTransactions(connection, accounts, options, onProgress)` | Import transactions | Yes |
| `syncBalances(connection, accounts)` | Import balances | Yes |
| `getStatement(connection, account, from, to)` | Download statement | Yes |
| `initiatePayment(connection, payment)` | Send payment | Yes |
| `getPaymentStatus(connection, id)` | Track payment | Yes |
| `subscribeToWebhooks(url, events)` | Register webhook | Optional |
| `unsubscribeFromWebhooks(id)` | Remove webhook | Optional |
| `handleWebhook(payload)` | Process incoming webhook | Optional |
| `getRateLimits()` | Rate limit info | Yes |
| `isHealthy()` | Health check | Yes |

### Provider Manifest

Each provider declares its capabilities via `getManifest()`:

```typescript
interface ProviderCapabilityManifest {
  provider: BankProviderKind;
  name: string;
  version: string;
  capabilities: string[];       // e.g. BALANCES, TRANSACTIONS, PAYMENTS
  regions: string[];            // e.g. NORTH_AMERICA, EUROPE, UAE
  protocols: string[];          // e.g. OAUTH2, OPEN_BANKING, API_KEY
  paymentRails: string[];       // e.g. ACH, SEPA, SWIFT, UAEFTS
  supportedAccountTypes: string[];
  maxBatchSize: number;
  webhookSupport: boolean;
  historicalSyncSupport: boolean;
  realtimeSupport: boolean;
  sandboxEnvironment: boolean;
}
```

### Provider Types

| Kind | Provider | Implemented |
|------|----------|-------------|
| `plaid` | Plaid | Phase 9A.2 |
| `lean` | Lean Technologies | Phase 9A.2 |
| `tarabut` | Tarabut Gateway | Phase 9A.2 |
| `yap` | YAP | Phase 9B |
| `truelayer` | TrueLayer | Phase 9B |
| `tink` | Tink | Phase 9B |
| `salted` | Salt Edge | Phase 9B |
| `finicity` | Finicity/Mastercard | Phase 9C |
| `mx` | MX Technologies | Phase 9C |
| `akoya` | Akoya | Phase 9C |
| `yodlee` | Yodlee | Phase 9C |
| `gocardless` | GoCardless | Phase 9C |
| `direct-api` | Direct REST API | Phase 9B |
| `swift` | SWIFT Gateway | Phase 9D |
| `iso20022` | ISO 20022 Gateway | Phase 9D |
| `manual` | Manual Import | Phase 9B |
| `csv` | CSV Import | Phase 9B |
| `ofx` | OFX Import | Phase 9C |
| `mt940` | MT940 Import | Phase 9D |
| `camt053` | CAMT.053 Import | Phase 9D |
| `bai2` | BAI2 Import | Phase 9D |
| `open-banking` | Open Banking UK/EU | Phase 9B |
| `custom` | Custom Integration | As needed |

## Provider Registry

```typescript
const bankProviderRegistry = new BankProviderRegistry();

// Register a provider kind
bankProviderRegistry.registerKind("lean", () => new LeanProvider());

// Create an instance
const provider = bankProviderRegistry.createInstance("lean");

// Use the provider
await provider.initialize({ environment: "sandbox" });
const manifest = provider.getManifest();
const institutions = await provider.searchInstitutions("Emirates NBD");