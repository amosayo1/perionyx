# PEDS — AI Components & Financial Components

---

## Part 1: AI Design Language

### Philosophy
- AI is an assistant, not a decision-maker
- AI components feel like a finance colleague who prepared a briefing — not a chatbot
- Every AI output exposes: what it found, how confident it is, where the evidence is, what it recommends
- Humans always decide

### Component Set Structure
```
AI
├── Type: Summary | Recommendation | Evidence | Confidence | Risk | Processing
└── State: Loading | Ready | Error | Empty
```

### 1.1 AI Summary Card

**Type**: Card/Default with gold left accent (3px)

**Children** (Auto Layout, Vertical, 12px gap):

1. **Header Bar** (Horizontal, Fill, space-between)
   - Sparkles icon (20px, `ai-card.accent`)
   - "AI Summary" badge (`badge.gold`, style `micro`)
   - Timestamp (style `xs`, `text.tertiary`)

2. **Summary Text** (style `body`, `text.primary`, line-height 1.625)
   - 3-5 bullet points summarising findings
   - Each bullet: max 1 line, concise

3. **Confidence Bar** (Horizontal, 8px gap)
   - Label: style `xs`, colour matches confidence level
   - Bar: 4px height, Fill width, radius 2px
     - Fill: confidence colour at confidence percentage width
     - Track: `border.subtle`
   - Percentage: style `xs`, mono, `text.secondary`

4. **Source Link** (style `link`, text: "View supporting evidence →")

### States
| State | Content | Action |
|-------|---------|--------|
| Loading | Skeleton text + shimmer | — |
| Ready | Full content | Interactive |
| Error | "AI analysis unavailable" + retry | Retry button |
| Empty | No data to analyse | — |

---

### 1.2 Recommendation Card

**Frame**: Card/Interactive with gold top accent (3px)

**Children** (Vertical, 12px gap):

1. **Header**: "Recommendation" + confidence badge
2. **Title**: style `h4`, `text.primary` — the recommended action
3. **Rationale**: style `sm`, `text.secondary` — 1-3 sentences explaining why
4. **Impact**: Financial impact (style `financial-sm`, green or red)
5. **Evidence Count**: "Based on X sources" (style `xs`, `text.tertiary`)
6. **Actions**: "Apply" button + "Dismiss" ghost button

### Variants
| Variant | Use Case | Accent |
|---------|----------|--------|
| Default | Standard suggestion | gold |
| Priority | Time-sensitive | `status.warning` |
| Critical | High risk detected | `status.error` |

---

### 1.3 Evidence Panel

**Frame**: Card/Default

**Children** (Vertical, 8px gap):

1. **Header**: "Supporting Evidence" + count badge
2. **Evidence List**:
   Each item (Horizontal, gap 12px, padding 8px 0):
   - Document type icon (16px)
   - VStack:
     - Document name (style `sm-medium`, `text.primary`)
     - Source + date (style `xs`, `text.tertiary`)
     - Matched fields: key-value pairs (style `code`, `text.secondary`)
   - Confidence badge (High/Med/Low)

### States
| State | Message |
|-------|---------|
| Empty | "No evidence found for this recommendation" |
| Loading | 3 skeleton rows |
| Ready | Evidence list |

---

### 1.4 Confidence Indicator

**Frame**: Auto Layout, Horizontal, gap 6px, center

**Variants**:
| Level | Dot Colour | Label | Text Colour |
|-------|-----------|-------|-------------|
| High (≥80%) | `ai.high` | "High confidence" | `ai.high` |
| Medium (≥50%) | `ai.medium` | "Medium confidence" | `ai.medium` |
| Low (<50%) | `ai.low` | "Low confidence" | `ai.low` |
| Processing | `ai.processing` | "Analysing…" | `ai.processing` |

**Spec**:
- Dot: 8×8, radius full, fill with colour + subtle glow
- Label: style `sm`, font weight medium
- Optional: percentage (style `code`, `xs`, `text.secondary`)

---

### 1.5 Risk Indicator

**Frame**: Similar to Confidence Indicator but for risk level

**Variants**:
| Level | Dot Colour | Label |
|-------|-----------|-------|
| Low | `risk.low` | "Low Risk" |
| Medium | `risk.medium` | "Medium Risk" |
| High | `risk.high` | "High Risk" |
| Critical | `risk.critical` | "Critical Risk" |

**Card variant**: Card/Exception with left border matching risk level
- Contains: risk description, financial impact, affected entities, suggested action

---

### 1.6 Supporting Documents

**Frame**: Auto Layout, Vertical, gap 8px

**Document Item**:
- Frame: Horizontal, gap 12px, padding 8px 12px, radius 6px
- Icon: file type icon (20px)
- VStack:
  - Name: style `sm-medium`
  - Meta: style `xs`, `text.tertiary` (pages, date uploaded)
- Right: download button or status badge

| State | Background |
|-------|-----------|
| Default | transparent |
| Hover | `surface.elevated` |

---

### 1.7 AI Activity Timeline

**Frame**: Timeline component variant

Each entry:
- AI icon (Sparkles / Brain, 16px, `ai-card.accent`)
- Action: "AI analysed invoice INV-042"
- Result: summary + confidence badge
- Timestamp: relative ("3m ago")

---

### 1.8 Explain Recommendation

**Frame**: Dialog or Card

**Structure**:
1. **Title**: "Why was this recommended?"
2. **Factor List**: ordered by importance
   - Each factor: rule name + weight + contribution
   - Bar showing relative importance
3. **Data Sources**: linked evidence items
4. **Alternative**: what would change the recommendation
5. **Confidence**: overall + per factor

---

### 1.9 AI Processing State

**Frame**: Centered, 200×200

1. **Pulsing gold dot** (processing animation)
2. "AI is analysing…" (style `body`, `text.secondary`)
3. Subtle shimmer background

---

## Part 2: Financial Components

### 2.1 Currency Display

**Frame**: Auto Layout, Horizontal, gap 2px

**Children**:
1. Currency code (style `financial-xs`, `text.tertiary`): "USD"
2. Amount (style varies by context):
   - Hero: `financial-lg` (32px, bold, mono)
   - Card: `financial` (24px, semibold, mono)
   - Table: `financial-sm` (14px, medium, mono)
3. Cents: superscript or same size, lighter colour

**Variants**:
| Property | Values |
|----------|--------|
| Sign | positive (green), negative (red), neutral |
| Size | hero, default, small, xs |
| Abbreviate | true (1.2M), false (1,200,000) |

---

### 2.2 Exchange Rate Card

**Frame**: Card/Default, horizontal layout

**Children**:
1. Flag/currency pair: "USD → EUR"
2. Rate: style `financial`, `text.primary`
3. Change: arrow + percentage (green or red)
4. Timestamp: style `xs`, `text.tertiary`

---

### 2.3 Journal Entry Card

**Frame**: Card/Default

**Children**:
1. **Header**: Journal ID + date + status badge
2. **Description**: style `sm`, `text.secondary`
3. **Line Items Table**:
   | Account | Debit | Credit |
   |---------|-------|--------|
   | Account name | $X,XXX.XX | — |
   | Account name | — | $X,XXX.XX |
4. **Totals**: bold, `text.primary`
5. **Audit Info**: created by, approved by, timestamps

---

### 2.4 Invoice Summary Card

**Frame**: Card/Default

**Children** (Vertical, gap 8px):
1. **Header**: Invoice # + vendor name + status badge
2. **Amount**: style `financial-lg`, `text.primary`
3. **Key Fields** (Property List):
   - Date: value
   - Due: value (red if overdue)
   - PO Ref: value
   - GL Code: value (mono)
4. **Match Status**: badge (Matched/Partial/Unmatched)
5. **Actions**: View, Approve, Exception

---

### 2.5 Supplier Summary Card

**Frame**: Card/Interactive

**Children**:
1. **Header**: Supplier name + risk badge
2. **Metrics** (Horizontal, 3 columns):
   - Total spend (financial)
   - Invoice count (number)
   - Avg payment terms (text)
3. **Quick Status**: "3 invoices pending" / "No exceptions"
4. **Action**: "View supplier" link

---

### 2.6 Payment Card

**Frame**: Card/Default

**Children**:
1. **Header**: Payment ID + status chip
2. **Amount**: style `financial-lg`
3. **Recipient**: name + account (masked: "****1234")
4. **Schedule**: date + (recurring if applicable)
5. **Approval Chain**: avatars with status dots
6. **Actions**: Approve, Reject, Hold

---

### 2.7 Variance Card

**Frame**: Card/Default

**Children**:
1. **Header**: "Variance Analysis" + period label
2. **Main Metric**: Actual vs Budget (style `financial-lg`, variance %)
3. **Bar** (Horizontal):
   - Budget line: 1px dashed, `text.secondary`
   - Actual bar: fill varies (green if favourable, red if unfavourable)
4. **Breakdown**: top 3 variances by amount (list)

---

### 2.8 Exception Card

**Frame**: Card with left accent border (4px, status colour)

**Children**:
1. **Header**: Exception type badge + severity badge
2. **Title**: style `h4` — "Invoice INV-042 exceeds PO by $2,400"
3. **Description**: style `sm`, `text.secondary`
4. **Impact**: financial + operational impact
5. **Suggested Resolution**: style `sm-medium`, `text.primary`
6. **Actions**: Resolve, Escalate, Dismiss + Assignee dropdown

| Severity | Left Border |
|----------|-------------|
| Info | `status.info` |
| Warning | `status.warning` |
| Error | `status.error` |
| Critical | `risk.critical` |

---

### 2.9 Approval Summary Card

**Frame**: Card/Default

**Children**:
1. **Header**: "Approval Required" + count badge
2. **Chain Visual**: Horizontal avatar list + status connectors
   - Avatar (24px) + status dot
   - Line connecting avatars (solid = complete, dashed = pending)
3. **Rules Applied**: "Requires 2 of 3 approvers, >$50K"
4. **Current Step**: "Awaiting VP Finance"
5. **Actions**: Approve, Reject, Delegate, Add Note

---

### 2.10 Cash Position Card

**Frame**: Card/Metric (with top gold accent)

**Children**:
1. **Label**: "Cash Position" (style `xs`)
2. **Total**: style `financial-lg`, `text.primary`
3. **Breakdown** (Horizontal, 3 columns):
   - Operating: amount + change
   - Reserved: amount + change
   - Available: amount + change
4. **Forecast**: mini sparkline (chart, 120×32)
5. **Timestamp**: "Updated 2m ago" (style `xs`, `text.tertiary`)

---

## Part 3: Composite Pattern — Review Workspace

The Review Workspace combines AI + Decision + Financial components into a cohesive layout:

```
┌──────────────────────────────────────────────────┐
│  Page Header: "Invoice INV-042 — Review"         │
├──────────────────┬───────────────────────────────┤
│  Evidence Panel  │  Decision Area                │
│  (Left, 40%)     │  (Right, 60%)                 │
│                  │                               │
│  ┌────────────┐  │  ┌─────────────────────────┐  │
│  │ AI Summary │  │  │ Invoice Summary Card     │  │
│  │ Card       │  │  │ (financial component)    │  │
│  └────────────┘  │  └─────────────────────────┘  │
│  ┌────────────┐  │  ┌─────────────────────────┐  │
│  │ Evidence   │  │  │ Exception Card (if any) │  │
│  │ Panel      │  │  └─────────────────────────┘  │
│  └────────────┘  │  ┌─────────────────────────┐  │
│  ┌────────────┐  │  │ Approval Summary Card   │  │
│  │ Supporting │  │  │ + action buttons        │  │
│  │ Documents  │  │  └─────────────────────────┘  │
│  └────────────┘  │                               │
│                  │  ┌─────────────────────────┐  │
│                  │  │ Activity Timeline        │  │
│                  │  └─────────────────────────┘  │
└──────────────────┴───────────────────────────────┘
```

### Interaction Flow
1. User enters workspace → Evidence loads first (speed principle)
2. AI Summary appears with confidence indicator
3. User reviews evidence, clicks through to source documents
4. Decision card presents action options
5. User approves/rejects with optional comment
6. Audit trail updates immediately
7. Next item in queue loads

---

## Part 4: Token Mapping Summary

### AI Component Tokens

| Token | Component |
|-------|-----------|
| `ai.high` / `.medium` / `.low` | Confidence Indicator, AI cards |
| `ai.processing` | Processing state, pulse animation |
| `component.ai-card.*` | AI Summary Card |
| `brand.gold`, `brand.gold-muted` | AI accent elements |
| `status.*` | Exception indicators within AI |

### Financial Component Tokens

| Token | Component |
|-------|-----------|
| `financial.*` | All currency displays, variance colours |
| `financial.positive` | Revenue, income, favourable variance |
| `financial.negative` | Expenses, losses, unfavourable variance |
| `financial.pending` | Pending transactions, forecasts |
| `financial.approved` | Approved payments, reconciled items |
| `financial.rejected` | Rejected payments |
| `financial.overdue` | Overdue invoices, late payments |
| `risk.*` | Risk indicators, exception severity |
| `typography.font-family.mono` + `typography.font-size.financial*` | All financial value typography |

### Decision Component Tokens

| Token | Component |
|-------|-----------|
| `component.card.decision` | Decision Card |
| `component.card.evidence` | Evidence Card, Evidence Panel |
| `component.card.exception` | Exception Card |
| `component.status-chip.*` | Approval/status badges |
| `border.gold` | Selected cards, focus states |
| `shadow.glow-gold` | Selected/hovered decision cards |
