# Regional Routing

## Overview

The routing engine maps tenant region to the optimal banking provider based on geographic availability, capabilities, and preference ranking. Each region has recommended and fallback providers to ensure business continuity.

## Region → Provider Mapping

### North America

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Plaid** | ✅ | Balances, Transactions, Payments, Identity, Webhooks, Historical Sync, Real-time |
| 2 | MX | | Balances, Transactions, Identity, Webhooks, Account Verification |
| 3 | Finicity | | Balances, Transactions, Identity, Account Verification, Reporting |
| 4 | Akoya | | Balances, Transactions, Identity, Webhooks, Real-time |
| 5 | Yodlee | | Balances, Transactions, Identity, Statements, Reporting |

### Europe

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **TrueLayer** | ✅ | Balances, Transactions, Payments, Identity, Webhooks, Real-time, Direct Debit |
| 2 | Tink | | Balances, Transactions, Payments, Identity, Webhooks, Account Verification |
| 3 | Salt Edge | | Balances, Transactions, Identity, Webhooks |
| 4 | GoCardless | | Balances, Transactions, Direct Debit, Scheduled Payments |

### United Kingdom

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **TrueLayer** | ✅ | Balances, Transactions, Payments, Identity, Webhooks, Real-time, Direct Debit |
| 2 | GoCardless | | Balances, Transactions, Direct Debit, Scheduled Payments |
| 3 | Tink | | Balances, Transactions, Payments, Identity, Account Verification |

### UAE

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Lean Technologies** | ✅ | Balances, Transactions, Identity, Webhooks, Account Discovery |
| 2 | Tarabut Gateway | | Balances, Transactions, Payments, Identity, Webhooks |
| 3 | YAP | | Balances, Transactions, Payments, Direct Debit, Real-time |
| 4 | Direct APIs (ENBD, ADCB, FAB) | | Balances, Transactions |

### Saudi Arabia

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Lean Technologies** | ✅ | Balances, Transactions, Identity, Webhooks, Account Discovery |
| 2 | Tarabut Gateway | | Balances, Transactions, Payments, Identity, Webhooks |
| 3 | Direct APIs (SAMA) | | Balances, Transactions |

### Middle East (General)

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Lean Technologies** | ✅ | Full suite across UAE, Saudi, Kuwait, Oman |
| 2 | Tarabut Gateway | | Bahrain, Qatar, Saudi, UAE |
| 3 | YAP | | UAE-focused |
| 4 | Direct APIs | | Country-specific banks |

### Asia-Pacific

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Plaid** | ✅ | Balances, Transactions, Payments, Real-time |
| 2 | Yodlee | | Broad APAC coverage |
| 3 | Direct APIs | | Country-specific (AU, SG, HK, JP, IN) |

### Africa

| Rank | Provider | Recommended | Capabilities |
|------|----------|-------------|--------------|
| 1 | **Direct APIs** | ✅ | Country-specific bank APIs |

### Global

| Provider | Use Case |
|----------|----------|
| SWIFT Gateway | Cross-border payments, MT940/950 statements |
| ISO 20022 Gateway | CAMT.053 statements, pain.001 payments |

## Routing API

```typescript
const result = bankingRoutingEngine.route({
  region: BankingRegion.UAE,
  requiredCapabilities: [ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS],
});

// result.recommended → Lean Technologies (rank 1, recommended)
// result.fallbacks → Tarabut, YAP
// result.providers → [Lean, Tarabut, YAP, Direct APIs]
```

## Adding a New Provider

```typescript
// Register in region-registry
{
  region: BankingRegion.UAE,
  countryCodes: ["AE"],
  providers: [
    {
      kind: "lean",
      rank: 1,
      isRecommended: true,
      isFallback: false,
      capabilities: [ProviderCapability.BALANCES, ProviderCapability.TRANSACTIONS],
      supportedProtocols: [ConnectionProtocol.OAUTH2, ConnectionProtocol.API_KEY],
      minHistoryDays: 90,
      maxHistoryDays: 365,
    },
    // ...
  ],
}
```