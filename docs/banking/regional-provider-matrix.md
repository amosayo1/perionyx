# Regional Provider Matrix

## Overview

The Regional Provider Matrix maps 14 `BankingRegion` enum values to country code sets and per-region provider configurations. It powers the `BankingRoutingEngine` to resolve "which providers are available in country X with capabilities Y?" at runtime.

The matrix is defined in `src/server/banking/providers/regions/registry.ts` as `BANKING_REGION_REGISTRY` — an array of `RegionProviderMap` objects.

## The 14 Region Definitions

From `src/server/banking/domain/types.ts:26-41`:

| Enum Value | Type | Country Scope |
|-----------|------|---------------|
| `NORTH_AMERICA` | Geographic | US, CA, MX |
| `EUROPE` | Geographic | 20 countries |
| `UNITED_KINGDOM` | Geographic | GB, UK |
| `MIDDLE_EAST` | Geographic | AE, SA, QA, BH, KW, OM, EG, JO, LB |
| `UAE` | Country | AE |
| `SAUDI_ARABIA` | Country | SA |
| `QATAR` | Country | QA |
| `BAHRAIN` | Country | BH |
| `KUWAIT` | Country | KW |
| `OMAN` | Country | OM |
| `EGYPT` | Country | EG |
| `AFRICA` | Geographic | ZA, NG, KE, GH, MA, TN, DZ, SN, CI, ET |
| `ASIA_PACIFIC` | Geographic | AU, NZ, SG, HK, JP, KR, IN, ID, MY, TH, VN, PH, TW, CN |
| `GLOBAL` | Meta | (empty — applies to all) |

### Region Hierarchy

The enum has no explicit hierarchy, but the routing engine's `countryCode` resolution creates an effective hierarchy:

```
GLOBAL ───► applies everywhere (SWIFT, ISO 20022, Manual, CSV)

  ├── NORTH_AMERICA ───► US/CA/MX
  ├── EUROPE ──────────► 20 countries
  ├── UNITED_KINGDOM ──► GB
  ├── MIDDLE_EAST ─────► 9 countries
  │   ├── UAE ─────────► AE
  │   ├── SAUDI_ARABIA ► SA
  │   ├── QATAR ───────► QA
  │   ├── BAHRAIN ─────► BH
  │   ├── KUWAIT ──────► KW
  │   ├── OMAN ────────► OM
  │   └── EGYPT ───────► EG
  ├── AFRICA ──────────► 10 countries
  ├── ASIA_PACIFIC ────► 14 countries
```

EMEA is **not** a `BankingRegion` enum value. It is a logical grouping used in business discussions but does not appear in code. Applications that need EMEA-level routing should query `EUROPE`, `UNITED_KINGDOM`, `MIDDLE_LEAST`, and `AFRICA` separately.

## BANKING_REGION_REGISTRY Structure

Defined in `registry.ts:197-297`:

```typescript
interface RegionProviderMap {
  region: BankingRegion;
  countryCodes: string[];        // ISO 3166-1 alpha-2 codes
  providers: RegionalProviderConfig[];
}

interface RegionalProviderConfig {
  kind: BankProviderKind;
  rank: number;                  // 1 = best
  isRecommended: boolean;
  isFallback: boolean;
  capabilities: ProviderCapability[];
  supportedProtocols: ConnectionProtocol[];
  minHistoryDays: number;
  maxHistoryDays: number;
}
```

### Registry Entries

| Region | Country Codes | Providers (rank order) |
|--------|---------------|----------------------|
| `NORTH_AMERICA` | US, CA, MX | plaid(1), mx(2), finicity(3), akoya(4), yodlee(5), salted(6), csv(20), manual(21) |
| `EUROPE` | DE, FR, IT, ES, NL, BE, AT, CH, SE, NO, DK, FI, PT, IE, PL, CZ, HU, RO, GR, LU | truelayer(1), tink(2), salted(3), gocardless(4), iso20022(5), csv(20), manual(21) |
| `UNITED_KINGDOM` | GB, UK | truelayer(1), gocardless(2), tink(3), salted(4), csv(20), manual(21) |
| `MIDDLE_EAST` | AE, SA, QA, BH, KW, OM, EG, JO, LB | lean(1), tarabut(2), yap(3), salted(6), direct-api(10), csv(20), manual(21) |
| `UAE` | AE | lean(1), tarabut(2), yap(3), salted(6), direct-api(10), csv(20), manual(21) |
| `SAUDI_ARABIA` | SA | lean(1), tarabut(2), salted(6), direct-api(10), csv(20), manual(21) |
| `QATAR` | QA | tarabut(1) |
| `BAHRAIN` | BH | tarabut(1) |
| `KUWAIT` | KW | lean(1) |
| `OMAN` | OM | lean(1) |
| `EGYPT` | EG | direct-api(10) — recommended, fallback |
| `AFRICA` | ZA, NG, KE, GH, MA, TN, DZ, SN, CI, ET | direct-api(1), salted(6), csv(20), manual(21) |
| `ASIA_PACIFIC` | AU, NZ, SG, HK, JP, KR, IN, ID, MY, TH, VN, PH, TW, CN | plaid(1), yodlee(5), salted(6), iso20022(8), direct-api(10), csv(20), manual(21) |
| `GLOBAL` | (empty) | swift(1), iso20022(2), csv(20), manual(21) |

## How Providers Are Mapped

Providers are mapped to regions at two levels:

### 1. In Provider Definitions

Each `ProviderDefinition` has a `regions: RegionCoverage[]` array:

```typescript
interface RegionCoverage {
  region: BankingRegion;
  countries: string[];       // ISO codes, empty = all in region
  recommended: boolean;
  fallback: boolean;
}
```

This metadata is used by `getProvidersByRegion()`, `getProvidersByCountry()`, `getProvidersByCapability()`, and `getProvidersByCurrency()` in `provider-definitions.ts`.

### 2. In Region Registry

Each `RegionProviderMap` has a `providers: RegionalProviderConfig[]` array with region-specific ranking, capabilities, and history limits. This is the primary data source for the `BankingRoutingEngine`.

The mapping may differ between levels — for example, Plaid's definition covers AU/NZ under `ASIA_PACIFIC`, but the region registry for `ASIA_PACIFIC` uses the same `plaid` entry with region-specific rank/capabilities.

## Country Code Routing

The `BankingRoutingEngine.route()` method (`routing/engine.ts:20-28`) implements country-code resolution:

```typescript
// When countryCode is provided:
const countryMatches = this.regionRegistry.filter((r) =>
  r.countryCodes.includes(request.countryCode!),
);
if (countryMatches.length > 0) {
  const countryRegion = countryMatches.find((r) => r.region === request.region)
    ?? countryMatches[0];
  providers = [...countryRegion.providers];
}
```

Resolution algorithm:
1. If `countryCode` matches multiple regions (e.g., "AE" matches `MIDDLE_EAST` and `UAE`), prefer the one that also matches `request.region`.
2. If no region match, use the first matching region (typically the most specific — `UAE` before `MIDDLE_EAST`).
3. If no country match at all, fall back to the `request.region`'s provider list.

### Example: Routing for "AE" with region "MIDDLE_EAST"

```
Request: { region: MIDDLE_EAST, countryCode: "AE" }

Match #1: MIDDLE_EAST (region matches, countryCodes includes "AE")
Match #2: UAE (countryCodes includes "AE")

Result: uses MIDDLE_EAST providers (the region matches request.region)
Providers: lean(1), tarabut(2), yap(3), salted(6), direct-api(10), csv(20), manual(21)
```

### Example: Routing for "SA"

```
Request: { region: NORTH_AMERICA, countryCode: "SA" }

No region-country match for NORTH_AMERICA with "SA".
Match: SAUDI_ARABIA (countryCodes includes "SA")
  → countryRegion = SAUDI_ARABIA (first/only match)
  → uses SAUDI_ARABIA providers

Result: lean(1), tarabut(2), salted(6), direct-api(10), csv(20), manual(21)
```

## Per-Region Provider Details

### North America (US, CA, MX)

| Provider | Rank | Recommended | Fallback | Max History | Protocols |
|----------|------|-------------|----------|-------------|-----------|
| Plaid | 1 | ✓ | | 730d | OAuth2 |
| MX Technologies | 2 | | ✓ | 730d | OAuth2, API Key |
| Finicity | 3 | | ✓ | 730d | OAuth2, API Key |
| Akoya | 4 | | ✓ | 730d | OAuth2 |
| Yodlee | 5 | | ✓ | 730d | API Key, OAuth2 |
| Salt Edge | 6 | | ✓ | 365d | OAuth2, API Key |
| CSV | 20 | | ✓ | — | File Import |
| Manual | 21 | | ✓ | — | Manual |

### Middle East Sub-Regions

| Region | Primary | Secondary | Country Coverage Strategy |
|--------|---------|-----------|--------------------------|
| UAE | Lean (rec), Tarabut | Yap, Direct API | Lean is recommended; Tarabut covers payments |
| Saudi Arabia | Lean (rec) | Tarabut (fallback), Direct API | SAMA-compliant via Lean |
| Qatar | Tarabut (rec) | — | Single provider market |
| Bahrain | Tarabut (rec) | — | Single provider market |
| Kuwait | Lean (rec) | — | Single provider market |
| Oman | Lean (rec) | — | Single provider market |
| Egypt | Direct API (rec) | — | Fallback-only region |

### Global Providers

| Provider | Rank | Capabilities |
|----------|------|-------------|
| SWIFT Gateway | 1 | Payments, Beneficiaries, FX, Statements, Reporting |
| ISO 20022 | 2 | Balances, Transactions, Statements, Payments, Reconciliation, Reporting |
| CSV | 20 | Balances, Transactions |
| Manual | 21 | Balances, Transactions |

Global providers appear in every `getProvidersByCountry()` call because their region's `countries` array is empty (meaning "all countries").

## Key Design Decisions

1. **Country-level overrides region-level**: When a country code matches a specific country region (e.g., `UAE`), that region's provider config fully replaces the parent region's (`MIDDLE_EAST`). This allows Saudi Arabia to have a different provider order than the generic Middle East config.

2. **Direct API is the Africa primary**: Africa has no open-banking aggregator, so `direct-api` (rank 1, recommended) is the primary option with Salt Edge as fallback.

3. **ISO 20022 as structured data fallback**: For Europe and Asia Pacific, ISO 20022 appears at rank 5/8 respectively — a structured messaging fallback when aggregator APIs fail.

4. **Manual and CSV always present**: Every region includes these at rank 20+ as universal fallbacks.

5. **Region registry is separate from definitions**: A provider may have a definition but no region registry entry (e.g., `yap` has a definition reference in the registry's provider list but no corresponding definition in `PROVIDER_DEFINITIONS` — it is reserved). Conversely, a provider may have a definition but not appear in a specific region's registry.

