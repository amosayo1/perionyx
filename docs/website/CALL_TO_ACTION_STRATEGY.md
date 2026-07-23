# Perionyx Public Website — Call to Action Strategy

> **Status**: v1.0
> **Scope**: CTA hierarchy, placement, copy, testing, and tracking for every page type
> **Principle**: Every page has exactly one job. The CTA is how we know the page did its job.

---

## 1. CTA Hierarchy

### 1.1 Visual Hierarchy

| Level | Style | Usage | Max Per Page |
|---|---|---|---|
| **Primary** | Gold fill (`#d4af37`), dark text (`#040404`), 44px height | The ONE action we want the user to take | 1 above the fold, 3 total |
| **Secondary** | Gold outline, gold text, 44px height | Alternate path, lower commitment | 2 per page |
| **Ghost** | Text only, no border, no fill, gold text | Exploratory, informational | 3-4 per page |
| **Tertiary** | Small inline link, zinc-400 text, 14px | Inline references, related content | Unlimited |

### 1.2 Button Sizes

| Size | Height | Padding | Font | Usage |
|---|---|---|---|---|
| **Large** | 48px | `px-8 py-3` | 16px, 600 weight | Hero CTAs only |
| **Medium** | 40px | `px-6 py-2` | 14px, 600 weight | All other CTAs |
| **Small** | 32px | `px-4 py-1.5` | 13px, 500 weight | Inline CTAs, mobile |

### 1.3 CTA Grouping

CTAs always appear in pairs or alone. Never a single secondary CTA alone.

| Pattern | Example |
|---|---|
| Primary + Secondary | [Request Demo] [See the Product] |
| Primary + Ghost | [Read the Docs] Learn More |
| Primary alone | [Request Demo] |
| Secondary + Ghost | [View Pricing] [Read Docs] |

---

## 2. Primary CTAs by Page

### 2.1 Home Page (`/`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Request Demo | Primary (large) | `/company/contact` |
| Hero | See the Product | Secondary (large) | `/product` |
| Mid-page (after metrics) | Book a Demo | Primary (medium) | `/company/contact` |
| Bottom of page | Book a Demo | Primary (large) | `/company/contact` |

### 2.2 Product Pages (`/product/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Book a Demo | Primary (large) | `/company/contact` |
| After capabilities grid | Book a Demo | Primary (medium) | `/company/contact` |
| After integration points | See [Feature] in Action | Secondary (medium) | Feature-specific deep-dive |
| Bottom of page | Book a Demo | Primary (large) | `/company/contact` |

**Product-specific secondary CTAs:**

| Page | Secondary CTA | Link |
|---|---|---|
| Accounts Payable | See Three-Way Matching | `/product/accounts-payable#matching` |
| Accounts Receivable | See the AR Dashboard | `/product/accounts-receivable#dashboard` |
| Treasury | See Cash Positioning | `/product/treasury#positioning` |
| Approvals | See the Approval Matrix | `/product/approvals#matrix` |
| Risk | See Risk Scoring | `/product/risk#scoring` |
| Compliance | See Compliance Roadmap | `/security/compliance` |
| Reconciliation | See Auto-Matching | `/product/reconciliation#matching` |
| Audit | See the Audit Log | `/product/audit#audit-log` |
| Executive Intelligence | See the Morning Briefing | `/product/executive-intelligence#briefing` |
| General Ledger | See Decimal Precision | `/product/general-ledger#precision` |
| Cash Management | See Cash Positioning | `/product/cash-management#positioning` |
| Reporting | See the Dashboard | `/product/reporting#dashboard` |

### 2.3 Platform Pages (`/platform/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Read the Docs | Primary (large) | `/platform/api` |
| After architecture section | Read the Engineering Blog | Secondary (medium) | `/engineering` |
| Bottom of page | Read the Docs | Primary (large) | `/platform/api` |

**Platform-specific secondary CTAs:**

| Page | Secondary CTA | Link |
|---|---|---|
| Architecture | See Performance Numbers | `/platform/performance` |
| Performance | See the Architecture | `/platform/architecture` |
| Reliability | View System Status | `/status` |
| Integrations | Read the API Docs | `/platform/api` |
| Connectors | Read the Docs | `/platform/developer` |
| API | Try the API | `/platform/developer` |
| Developer | Read the API Docs | `/platform/api` |
| Deployment | View the Architecture | `/platform/architecture` |
| Infrastructure | See Performance | `/platform/performance` |
| Observability | Read the Architecture | `/platform/architecture` |
| Security | View Compliance Status | `/security/compliance` |

### 2.4 Security Pages (`/security/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Read the Full Security Docs | Primary (large) | `/security` |
| After compliance section | Download Compliance Report | Secondary (medium) | PDF download or gated form |
| Bottom of page | Read the Full Security Docs | Primary (large) | `/security` |

**Security-specific secondary CTAs:**

| Page | Secondary CTA | Link |
|---|---|---|
| Overview | View Compliance Roadmap | `/security/compliance` |
| Authentication | View Access Control | `/security/authorization` |
| Authorization | View Authentication | `/security/authentication` |
| Encryption | View Audit Trail | `/security/audit-trail` |
| Audit Trail | View Compliance | `/security/compliance` |
| Multi-Tenancy | View Access Control | `/security/authorization` |
| API Security | View Infrastructure | `/security/infrastructure` |
| Infrastructure | View Compliance | `/security/compliance` |
| Compliance | View Security Overview | `/security` |
| Dependency Scanning | View API Security | `/security/api-security` |
| Incident Response | View Compliance | `/security/compliance` |

### 2.5 AI Pages (`/ai/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | See AI in Action | Primary (large) | `/ai/capabilities` |
| After trust section | Request Early Access | Secondary (medium) | `/company/contact` |
| Bottom of page | See AI in Action | Primary (large) | `/ai/capabilities` |

**AI-specific secondary CTAs:**

| Page | Secondary CTA | Link |
|---|---|---|
| Overview | See AI Capabilities | `/ai/capabilities` |
| Capabilities | See Explainability | `/ai/explainability` |
| Providers | See Models | `/ai/models` |
| Models | See Providers | `/ai/providers` |
| Governance | Read the Architecture | `/platform/security` |
| Explainability | See Capabilities | `/ai/capabilities` |
| Benchmarks | See Capabilities | `/ai/capabilities` |
| Roadmap | See Current Capabilities | `/ai/capabilities` |

### 2.6 Engineering Pages (`/engineering/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Read the Blog | Primary (large) | `/engineering/blog` |
| After code section | View on GitHub | Secondary (medium) | GitHub repo link |
| Bottom of page | Read the Blog | Primary (large) | `/engineering/blog` |

### 2.7 Research Pages (`/research/*`)

| Position | CTA | Level | Link |
|---|---|---|---|
| Hero | Read the Latest | Primary (large) | `/research/insights` |
| After methodology | Subscribe to Updates | Secondary (medium) | Newsletter signup |
| Bottom of page | Subscribe to Updates | Primary (large) | Newsletter signup |

### 2.8 Company Pages (`/company/*`)

| Page | Primary CTA | Secondary CTA |
|---|---|---|
| About | Meet the Team | See Open Roles |
| Mission | See the Product | Meet the Team |
| Team | See Open Roles | Contact Us |
| Careers | See Open Roles | Meet the Team |
| Press | Contact Us | — |
| Contact | Send a Message | — |
| Partners | Contact Us | — |
| Legal | — | — |

---

## 3. CTA Placement Rules

### 3.1 Placement Map

Every page follows this placement pattern:

```
┌─────────────────────────────────────┐
│  HERO                               │
│  [Primary CTA] [Secondary CTA]      │  ← Always: 1 primary + 1 secondary
├─────────────────────────────────────┤
│  TRUST BAR / METRICS                │
│  (no CTA)                           │  ← Never: trust is not a CTA moment
├─────────────────────────────────────┤
│  PROBLEM / SOLUTION                 │
│  (no CTA)                           │  ← Let them read
├─────────────────────────────────────┤
│  KEY CAPABILITIES / FEATURES        │
│  [Primary CTA]                      │  ← Mid-page: 1 primary
├─────────────────────────────────────┤
│  INTEGRATION / DEEP DIVE            │
│  [Secondary CTA]                    │  ← Supporting action
├─────────────────────────────────────┤
│  SOCIAL PROOF / TRUST               │
│  (no CTA)                           │  ← Trust, not conversion
├─────────────────────────────────────┤
│  BOTTOM CTA                         │
│  [Primary CTA] [Secondary CTA]      │  ← Always: 1 primary + 1 secondary
└─────────────────────────────────────┘
```

### 3.2 Placement Rules

1. **Hero CTA is mandatory.** Every page has a primary CTA in the hero.
2. **Bottom CTA is mandatory.** Every page ends with a CTA section.
3. **Mid-page CTA is optional.** Only if the page is long (>800 words) and has a clear conversion moment.
4. **Never more than 1 primary CTA above the fold.** The hero has exactly one primary.
5. **Maximum 3 primary CTAs per page.** Hero, mid-page, bottom.
6. **Never interrupt a reading flow with a CTA.** CTAs come AFTER a section, not mid-paragraph.
7. **Trust sections (metrics, logos, quotes) never have CTAs.** Trust is its own moment.

### 3.3 Mobile-Specific Placement

| Element | Mobile Behavior |
|---|---|
| Hero CTA | Full-width, sticky bottom bar on scroll (after 50% scroll) |
| Mid-page CTA | Hidden on mobile. Bottom CTA is sufficient. |
| Bottom CTA | Full-width, sticky bottom bar |
| Secondary CTAs | Stack vertically below primary on mobile |
| Sticky bottom bar | Appears after 50% scroll, dismisses on CTA click |

### 3.4 Sticky Bottom Bar (Mobile)

```
┌──────────────────────────────────────┐
│  [Request Demo]               [✕]    │
└──────────────────────────────────────┘
```

- **Show after**: 50% scroll depth
- **Dismiss**: Click CTA, click ✕, or reach the bottom CTA section
- **Style**: Fixed bottom, dark background (`#040404`), gold CTA button
- **Z-index**: Above all content but below modals

---

## 4. CTA Copy Formulas

### 4.1 Formula 1: Verb + Object

The most direct formula. Best for high-intent pages.

| CTA | Example |
|---|---|
| Request Demo | Request Demo |
| Read the Docs | Read the Docs |
| View Pricing | View Pricing |
| See the Product | See the Product |
| Download Report | Download Report |
| Start Free Trial | Start Free Trial |

### 4.2 Formula 2: Verb + Object + Benefit

Adds context. Best for mid-page CTAs where the user needs motivation.

| CTA | Example |
|---|---|
| See Three-Way Matching in Action | See Three-Way Matching in Action |
| Explore the API | Explore the API |
| Read How We Built It | Read How We Built It |
| See the Morning Briefing | See the Morning Briefing |

### 4.3 Formula 3: Action + Specificity

Best for secondary CTAs that link to deep-dives.

| CTA | Example |
|---|---|
| See the Approval Matrix | See the Approval Matrix |
| View the Permission Matrix | View the Permission Matrix |
| Read the Engineering Blog | Read the Engineering Blog |
| Check System Status | Check System Status |

### 4.4 CTA Copy Don'ts

| Don't | Why |
|---|---|
| "Click Here" | Describes the action, not the outcome |
| "Learn More" (as primary) | Too vague for a primary CTA |
| "Submit" | Generic, uninformative |
| "Get Started" (without context) | What am I getting started with? |
| "Sign Up Free" | "Free" is fine but "Sign Up" is generic |
| "Book Your Demo Today" | "Today" adds urgency we don't need |
| "Request a Personalized Demo" | Too many words |

---

## 5. CTA Frequency Rules

### 5.1 Rules

| Rule | Description |
|---|---|
| **Max 3 primary CTAs per page** | Hero (1) + Mid-page (1) + Bottom (1) |
| **Never more than 1 above the fold** | Hero has exactly one primary CTA |
| **Secondary CTAs: max 2 per page** | Hero (1) + one mid-page or bottom |
| **Ghost CTAs: max 4 per page** | For navigation and exploration |
| **Never repeat the same CTA text** | Vary between "Request Demo" and "Book a Demo" |
| **Never stack 3+ buttons vertically** | Group in pairs, use horizontal layout |

### 5.2 CTA Spacing

| Context | Minimum Spacing |
|---|---|
| Between two CTAs in a group | 12px |
| Between CTA and surrounding content | 32px above, 24px below |
| Hero CTA section height | Minimum 120px |
| Bottom CTA section height | Minimum 160px |

---

## 6. Audience-Specific CTAs

### 6.1 CTA Personalization by Visitor Segment

When visitor data is available (from referral source, cookie, or form), tailor the CTA:

| Visitor Segment | Primary CTA | Secondary CTA |
|---|---|---|
| **CFO** | See Financial Dashboard | Book a Demo |
| **Finance Director** | See the Product | Book a Demo |
| **Controller** | See Three-Way Matching | Book a Demo |
| **Treasury Manager** | See Cash Positioning | Book a Demo |
| **FP&A Analyst** | See the Morning Briefing | Book a Demo |
| **Engineer** | Explore the API | Read the Docs |
| **Security Professional** | Read the Security Docs | View Compliance |
| **Design Partner** | See the Architecture | Meet the Team |
| **Future Employee** | See Open Roles | Meet the Team |

### 6.2 Referral-Based CTA Adjustment

| Referral Source | Adjusted CTA |
|---|---|
| Google search (product keyword) | "See How [Feature] Works" (more specific) |
| Google search (security keyword) | "Read the Security Docs" (trust-building) |
| GitHub | "Read the Docs" (developer-first) |
| LinkedIn | "Book a Demo" (enterprise-first) |
| Twitter/X | "Read the Engineering Blog" (technical-first) |
| Direct | "Request Demo" (default) |

---

## 7. A/B Test Hypotheses

### 7.1 Priority Test Queue

Test in this order. Each test runs for 2-4 weeks with statistical significance.

| Priority | Test | Hypothesis | Metric |
|---|---|---|---|
| **1** | Hero CTA: "Request Demo" vs "Book a Demo" | "Book" implies lower commitment than "Request" → higher CTR | CTA click rate |
| **2** | Hero CTA: Single vs Dual CTA | Single CTA reduces decision paralysis → higher conversion | Demo submissions |
| **3** | Bottom CTA: With vs Without social proof | Testimonial above bottom CTA increases trust → higher conversion | Demo submissions |
| **4** | Product page: "See [Feature]" vs "Learn More" | Specific feature name increases relevance → higher CTR | CTA click rate |
| **5** | Sticky mobile bar: Always visible vs scroll-triggered | Always visible increases impressions → higher CTR | Mobile CTA clicks |
| **6** | CTA color: Gold vs White (on dark) | White may have higher contrast → higher visibility | CTA click rate |
| **7** | Form length: 4 fields vs 6 fields | Fewer fields reduce friction → higher completion | Form completion rate |
| **8** | Success page: With vs Without next step | Adding "Read about security" increases engagement → lower bounce | Bounce rate |

### 7.2 Test Setup Requirements

- Minimum sample: 1,000 visitors per variant
- Statistical significance: 95% confidence
- Duration: 2-4 weeks minimum
- Track: CTA clicks, form submissions, demo bookings
- Segment by: Device (mobile/desktop), referral source, page type

---

## 8. Conversion Tracking

### 8.1 Events to Track

| Event Name | Trigger | Properties |
|---|---|---|
| `cta_click` | Any CTA clicked | `cta_text`, `cta_level` (primary/secondary/ghost), `page`, `position` (hero/mid/bottom) |
| `demo_request` | Demo form submitted | `company`, `role`, `page_source` |
| `form_submit` | Any form submitted | `form_type`, `page`, `success` (boolean) |
| `form_error` | Form validation error | `form_type`, `field`, `error_type` |
| `newsletter_subscribe` | Newsletter form submitted | `page`, `source` |
| `doc_click` | "Read the Docs" clicked | `page`, `destination` |
| `github_click` | "View on GitHub" clicked | `page` |
| `download` | Any file download | `file_name`, `file_type`, `page` |
| `scroll_depth` | User scrolls to 25%/50%/75%/100% | `page`, `depth` |
| `sticky_bar_show` | Mobile sticky bar appears | `page` |
| `sticky_bar_click` | Mobile sticky bar CTA clicked | `page` |

### 8.2 Conversion Funnels

**Funnel 1: Demo Request**
```
Page view → CTA click → Form view → Form submit → Success page
```

**Funnel 2: Documentation Engagement**
```
Page view → "Read Docs" click → API docs page → Time on page > 30s
```

**Funnel 3: Newsletter**
```
Page view → Newsletter section visible → Email input → Subscribe click → Success
```

### 8.3 Tracking Implementation

```typescript
// Example: CTA click tracking
trackEvent('cta_click', {
  cta_text: 'Request Demo',
  cta_level: 'primary',
  page: '/product/accounts-payable',
  position: 'hero',
  timestamp: Date.now(),
});
```

---

## 9. CTA Accessibility

### 9.1 Requirements

| Requirement | Implementation |
|---|---|
| Keyboard accessible | All CTAs focusable with Tab, activatable with Enter/Space |
| Focus visible | Gold focus ring (`#d4af37`, 2px solid, 2px offset) |
| Screen reader | `aria-label` for icon-only CTAs |
| Touch target | Minimum 44×44px for all CTAs |
| Color contrast | Gold on dark: 7.2:1 ratio (exceeds WCAG AAA) |
| Loading state | Disabled state during form submission, loading spinner |

### 9.2 Focus Management

- After form submission, focus moves to success message
- After modal close, focus returns to trigger element
- After sticky bar dismiss, focus is unaffected
