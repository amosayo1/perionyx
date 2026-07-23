# Enterprise Onboarding — Multi-National Bank Connection

## Overview

The enterprise onboarding workflow enables multinational corporations to connect their global banking infrastructure in a structured, auditable 11-step process. Designed for CFOs, Treasurers, and Controllers who need to onboard dozens of bank accounts across legal entities, currencies, and regions.

The flow is orchestrated by `BankConnectionWizard` (`src/components/banking/bank-connection-wizard.tsx`) which manages a 10-step state machine with a final completion step.

## Step-by-Step Flow

### Step 1: Region Selection

**Component**: `RegionSelector` (`src/components/banking/region-selector.tsx`)

The user is presented with 6 global regions as tappable cards:

| Region | Countries | Description |
|---|---|---|
| North America | 3 | US, Canada, Mexico |
| Europe | 20 | EU, UK, Switzerland, Norway |
| United Kingdom | 1 | England, Scotland, Wales, NI |
| Middle East | 9 | UAE, Saudi, Qatar, Bahrain, Kuwait, Oman, Egypt |
| Africa | 10 | Nigeria, South Africa, Kenya, Ghana |
| Asia Pacific | 14 | Australia, Singapore, Japan, India, China |

Each card displays the region flag emoji, name, country count badge, and description. Selection immediately advances to Step 2 and clears all downstream state (country, provider, institution, authentication, accounts).

*Visual layout: 2-column grid of rounded cards with gold border on selection, chevron indicator on hover.*

### Step 2: Country Selection

**Component**: `CountrySelector` (`src/components/banking/country-selector.tsx`)

Filtered list of countries within the selected region. A search input at the top allows filtering by country name with instant results.

*Screen description: Search input with magnifying glass icon, 2-column grid of country buttons showing flag emoji and country name. Selected country gets gold border and gold chevron.*

### Step 3: Provider Selection

**Component**: `ProviderSelector` (`src/components/banking/provider-selector.tsx`)

Lists all banking providers that support the selected country's region. Each provider card shows:

- Provider initial avatar (first letter)
- Provider name with "Recommended" gold badge (if applicable)
- Description text
- Institution count with shield icon
- Enterprise rating (color-coded by latency: green = low, amber = medium, red = high)
- Authentication types (e.g., "OAuth 2.0", "Open Banking", "API Key")
- Capability badges (first 4 shown, overflow count)
- Selected state with gold border and checkmark

*Screen description: Scrollable list of provider cards with search filter, recommended providers highlighted with gold badge. Capabilities shown as compact pill badges.*

#### Provider Comparison

The `ProviderComparisonCard` (`src/components/banking/provider-comparison-card.tsx`) can be toggled to show a side-by-side table of up to 4 providers comparing 9 features: Balances, Transactions, Payments, Identity, Historical Sync, Real-time, Webhooks, Account Discovery, Statements. Each cell shows a green checkmark or gray X. Rating and institution count are displayed in the footer rows.

### Step 4: Institution Selection

**Component**: `InstitutionSelector` (`src/components/banking/institution-selector.tsx`)

Institutions are grouped by category with color-coded headers:

| Category | Icon | Color | Examples |
|---|---|---|---|
| Commercial Banks | Landmark | Blue | Chase, Bank of America, HSBC, Deutsche Bank |
| Investment Banks | Banknote | Purple | Goldman Sachs, Morgan Stanley, UBS |
| Islamic Banks | PiggyBank | Emerald | Dubai Islamic Bank, Al Rajhi Bank, ADIB |
| Digital Banks | Monitor | Cyan | Mercury, Monzo, Starling, N26 |

Each institution shows a letter avatar, name, and availability status. Unsupported institutions are displayed but disabled with "Unavailable" label at 40% opacity.

*Screen description: Category sections with icon headers and count badges. 2-column grid of institution buttons. Search input filters across all categories. Unsupported institutions are visually muted.*

### Step 5: Authentication

**Component**: `AuthenticationFlow` (`src/components/banking/authentication-flow.tsx`)

The authentication screen shows:

1. Provider name and authentication type (e.g., "OAuth 2.0 Authentication")
2. Security assurances in a gold-bordered card:
   - End-to-end encrypted
   - Read-only access (unless payments enabled)
   - No credentials stored on our servers
3. "Connect with {Provider}" button that simulates the OAuth flow
4. A 2-second loading state with animated spinner
5. Success state with green checkmark, connection summary, and "Continue to Account Selection" button
6. Error state with red alert banner

*Screen description: Gold shield icon, connection details card with security checkmarks, prominent CTA button. On success: large green checkmark with institution + provider name and continue button.*

### Step 6: Account Selection

**Component**: `AccountSelector` (`src/components/banking/account-selector.tsx`)

Discovered accounts are displayed grouped by type with color-coded headers:

| Account Type | Icon | Color | Example |
|---|---|---|---|
| Operating | Wallet | Blue | Operating Account — USD ($2,450,000) |
| Payroll | Building2 | Cyan | Payroll Account — USD ($850,000) |
| Treasury | TrendingUp | Emerald | Treasury Reserve — USD ($12,300,000) |
| Investment | Landmark | Purple | Investment Portfolio ($8,750,000) |
| Credit | CreditCard | Amber | Corporate Credit Line ($5,000,000) |
| Savings | PiggyBank | Pink | Savings — EUR (€1,200,000) |
| Escrow | DollarSign | Orange | Escrow Account ($3,200,000) |

Each account row shows account name, account number (masked), currency, and balance. Toggle selection by clicking the row — selected rows get gold borders and checkmark squares. A selection count badge appears in the header. The Continue button appears at the bottom once at least one account is selected.

*Screen description: Type-grouped account list with search. Selected accounts highlighted with gold border and checkmark. Balance displayed right-aligned on each row. Continue button at bottom shows count.*

### Step 7: Legal Entity Assignment

**Component**: `LegalEntitySelector` (`src/components/banking/legal-entity-selector.tsx`)

A recursive tree view displays the legal entity hierarchy:

```
Perionyx Global Holdings (Enterprise)
├── Perionyx North America (Legal Entity)
│   ├── US Operations (Business Unit)
│   └── Canada Operations (Business Unit)
├── Perionyx EMEA (Legal Entity)
│   ├── UK Operations (Business Unit)
│   ├── EU Operations (Business Unit)
│   └── UAE Operations (Business Unit)
└── Perionyx Asia Pacific (Legal Entity)
    ├── Australia Operations (Business Unit)
    └── Singapore Operations (Business Unit)
```

Each node shows a building icon, entity name, type badge, and expand/collapse toggle. Depth-based indentation visually communicates hierarchy. The selected entity gets a gold border and checkmark. A Continue button appears on selection.

*Screen description: Account preview card at top showing the account being mapped. Expandable entity tree below with indented hierarchy. Gold highlight on selected entity.*

### Step 8: Currency Mapping

**Component**: `CurrencyMapping` (`src/components/banking/currency-mapping.tsx`)

Each selected account gets a currency selector dropdown with 20 supported currencies:

- USD ($), EUR (€), GBP (£), AED (د.إ), SAR (﷼), NGN (₦), JPY (¥), SGD (S$), AUD (A$), CAD (C$), CHF (Fr), INR (₹), CNY (¥), HKD (HK$), KRW (₩), SEK (kr), NOK (kr), DKK (kr), PLN (zł), ZAR (R)

Each dropdown option shows flag emoji, currency code, and symbol. Default currency is auto-detected from the account's original currency. Green checkmark on mapped accounts. Continue button disabled until all accounts are mapped.

*Screen description: Account rows with initial avatar, name, and native-select dropdown showing flag + code + symbol. Green checkmark on each mapped row. Continue button at bottom.*

### Step 9: Sync Configuration

**Component**: `SyncConfiguration` (`src/components/banking/sync-configuration.tsx`)

Two sections:

1. **Sync Frequency**: Manual, Hourly, Daily (recommended), Real-time — each with icon, label, and description. Daily is default.
2. **Historical Import**: 30 days, 90 days (recommended), 1 year, All Available — each with label and description.

Both sections use radio-card style selection with gold borders on selection and checkmark indicators.

*Screen description: Two grid sections with 2-column card layouts. Selected option has gold border. History icon next to historical import section header.*

### Step 10: Review & Confirm

**Component**: `ConnectionSummary` (`src/components/banking/connection-summary.tsx`)

A comprehensive review screen showing all selections in a card grid:

| Field | Value |
|---|---|
| Region | North America |
| Country | United States |
| Provider | Plaid |
| Institution | Chase Bank |
| Accounts | 7 accounts selected |
| Sync | daily sync, 90days history |
| Currencies | USD, EUR, GBP |
| Permissions | Read accounts, balances, transactions |

Below the summary grid is a detailed list of selected accounts with balances. Two buttons at the bottom: "Go Back" (outlined) and "Confirm & Connect" (gold, primary).

*Screen description: 2-column grid of summary cards with icons, each showing label and value with green checkmark. Account list below with balance details. Prominent gold CTA button.*

### Step 11: Connection Complete

**Component**: `ConnectionComplete` (`src/components/banking/connection-complete.tsx`)

Four info cards arranged in a 2x2 grid:

1. **Connection**: Institution name and provider name with letter avatar
2. **Health**: "Excellent" with 97% badge and "All systems operational"
3. **Last Sync**: "Just now" with "Initial sync completed"
4. **Next Sync**: Based on sync mode (Continuous for real-time, ~1 hour for hourly, ~24 hours for daily)

A gold-tinted banner shows enabled capabilities. A large gold "Go to Connection Dashboard" button centers at the bottom.

*Screen description: Large green checkmark at top. 2x2 metric grid. Gold capabilities summary banner. Prominent dashboard navigation button.*

## Multi-Provider, Multi-Entity, Multi-Currency Support

### Multi-Provider

The system supports 12 providers with region-based filtering. A single enterprise can establish multiple bank connections, each using a different provider, through repeated wizard sessions. The `ConnectionDashboard` displays all connections simultaneously.

### Multi-Entity

The `LegalEntitySelector` supports hierarchical legal entity structures with up to 4 levels:
- Enterprise (root)
- Legal Entity
- Business Unit
- Department

Each account is assigned to exactly one entity, enabling entity-level reporting, reconciliation, and approval routing.

### Multi-Currency

The `CurrencyMapping` component supports 20 currencies across 6 regions. Each account can be mapped to a different currency independent of its original denomination. Currencies include major pairs (USD, EUR, GBP), Middle Eastern (AED, SAR), Asian (JPY, SGD, CNY, HKD, INR, KRW), African (NGN, ZAR), Scandinavian (SEK, NOK, DKK), and others (CHF, PLN, AUD, CAD).

## Legal Entity Hierarchy Mapping

The legal entity hierarchy (`data.ts:getMockLegalEntities`) represents a multinational holding company structure:

```
Perionyx Global Holdings
├── North America (legal_entity)
│   ├── US Operations (business_unit)
│   └── Canada Operations (business_unit)
├── EMEA (legal_entity)
│   ├── UK Operations (business_unit)
│   ├── EU Operations (business_unit)
│   └── UAE Operations (business_unit)
└── Asia Pacific (legal_entity)
    ├── Australia Operations (business_unit)
    └── Singapore Operations (business_unit)
```

The `LegalEntitySelector` renders this recursively with collapsible tree nodes. Each account gets a single entity assignment stored in a `Record<string, string>` mapping (accountId → entityId).

## Sync Configuration Options

Configured in `SyncConfiguration` (`src/components/banking/sync-configuration.tsx`):

| Mode | Description | Use Case |
|---|---|---|
| Manual | Sync only on trigger | Test connections, low-volume accounts |
| Hourly | Every hour | High-frequency trading, active treasury |
| Daily | Once per day (default) | Standard enterprise reporting |
| Real-time | Webhook-based continuous sync | Payment processing, live cash position |

Historical import options:

| Range | Description |
|---|---|
| 30 days | Quick setup, minimal data volume |
| 90 days (default) | Standard audit trail requirement |
| 1 year | Annual reconciliation needs |
| All Available | Full historical data migration |

The `ConnectionComplete` screen shows the next sync time based on the selected configuration.

## Provider Comparison Flow

Triggered from `ProviderSelector` via the `ProviderComparisonCard` (`src/components/banking/provider-comparison-card.tsx`):

1. User selects a country (Step 2)
2. Available providers appear in `ProviderSelector` (Step 3)
3. User can view up to 4 providers compared across 9 capability features
4. Each provider shows: institution count, enterprise rating (/5), latency rating, and supported auth types
5. Recommended providers are flagged with a gold "Best" badge in the comparison table header
6. User selects a provider and advances to Step 4

## Connection Review and Confirmation

The `ConnectionSummary` component (`src/components/banking/connection-summary.tsx`) aggregates all prior selections into a single review view:

- 8 summary cards in a 2-column grid
- Detailed account list with balances
- Go Back button returns to sync configuration (Step 9)
- Confirm & Connect button finalizes the connection and transitions to the completion screen (Step 11)

The `PermissionReview` component (`src/components/banking/permission-review.tsx`) can be shown alongside the summary to display granted permissions:

| Permission | Required | Default |
|---|---|---|
| Read Balances | Yes | Granted |
| Read Transactions | Yes | Granted |
| Read Accounts | Yes | Granted |
| Initiate Payments | No | Not granted |
| Read Credit Details | No | Not granted |
| Background Sync | Yes | Granted |

The confirmation is the final interactive step before the connection becomes active and visible in the `ConnectionDashboard`.
