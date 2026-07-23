# Perionyx Public Website — Microcopy Guide

> **Status**: v1.0
> **Scope**: UI text, interaction copy, and small-interface writing for the public website
> **Principle**: Microcopy is UX. Every word either helps or gets in the way.

---

## 1. Buttons

### 1.1 Button Hierarchy

| Level | Style | Usage | Examples |
|---|---|---|---|
| **Primary** | Gold fill (`#d4af37`), dark text | One per section. The main action. | "Request Demo", "Start Free Trial" |
| **Secondary** | Gold outline, gold text | Supporting action, alternate path. | "View Pricing", "Read Docs" |
| **Ghost** | Text only, no border/bg | Low-emphasis, exploratory. | "Learn More", "See How It Works" |
| **Disabled** | Gray fill, gray text | Action unavailable. Always explain why in tooltip. | "Contact Sales" (when gated) |

### 1.2 Button Copy Rules

1. **Verb + noun.** Every button starts with an action verb.
2. **Max 4 words.** "Request a Demo" (4) is fine. "Book Your Personalized Demo Today" (6) is too long.
3. **No "click here."** The button IS the action.
4. **No periods.** Buttons are fragments, not sentences.
5. **Consistent casing.** Title Case for all buttons: "Request Demo" not "Request demo."

### 1.3 Primary Button Copy by Page

| Page | Primary CTA | Secondary CTA |
|---|---|---|
| Home | Request Demo | See the Product |
| Product overview | Book a Demo | Explore a Module |
| `/product/accounts-payable` | Book a Demo | See Three-Way Matching |
| `/product/treasury` | Book a Demo | See Cash Positioning |
| `/product/approvals` | Book a Demo | See the Approval Matrix |
| `/product/risk` | Book a Demo | See Risk Scoring |
| `/product/compliance` | Book a Demo | See Compliance Roadmap |
| `/product/reconciliation` | Book a Demo | See Auto-Matching |
| `/product/audit` | Book a Demo | See the Audit Log |
| `/product/executive-intelligence` | Book a Demo | See the Morning Briefing |
| `/product/general-ledger` | Book a Demo | See Decimal Precision |
| `/product/cash-management` | Book a Demo | See Cash Positioning |
| `/product/reporting` | Book a Demo | See the Dashboard |
| `/security` | Read the Full Security Docs | View Compliance Roadmap |
| `/security/compliance` | Download Compliance Report | View Security Overview |
| `/platform` | Read the Docs | Book a Demo |
| `/platform/api` | Try the API | Read the Architecture |
| `/platform/developer` | Get Started | Read the API Docs |
| `/ai` | See AI in Action | Read the Governance Docs |
| `/ai/capabilities` | Book a Demo | See Explainability |
| `/engineering` | Read the Blog | View on GitHub |
| `/research` | Read the Latest | Subscribe to Updates |
| `/company/careers` | See Open Roles | Meet the Team |
| `/company/contact` | Send a Message | — |
| Blog post | Subscribe to Updates | Follow on Twitter |

---

## 2. Form Labels

### 2.1 Standard Form Fields

| Field | Label | Placeholder | Help Text |
|---|---|---|---|
| First Name | First Name | `Jane` | — |
| Last Name | Last Name | `Smith` | — |
| Work Email | Work Email | `jane@company.com` | We'll only use this to respond to your inquiry. |
| Company | Company | `Acme Corp` | — |
| Job Title | Job Title | `Select your role` | — |
| Phone (optional) | Phone (optional) | `+1 (555) 000-0000` | Include country code for international numbers. |
| Message | Message | `Tell us about your use case...` | Max 500 characters. |
| Newsletter Email | Email | `you@company.com` | — |

### 2.2 Role Dropdown Options

For the "Job Title" dropdown on demo/contact forms:

| Value | Label |
|---|---|
| `cfo` | Chief Financial Officer (CFO) |
| `finance-director` | Finance Director |
| `controller` | Controller |
| `treasurer` | Treasury Manager |
| `fpa` | FP&A Analyst / Manager |
| `accounting-manager` | Accounting Manager |
| `accountant` | Accountant |
| `procurement` | Procurement / AP Manager |
| `engineer` | Engineer / Developer |
| `product` | Product Manager |
| `design` | Designer |
| `security` | Security / Compliance |
| `executive` | CEO / COO / Other Executive |
| `other` | Other |

### 2.3 Form Section Headers

| Section | Header |
|---|---|
| Demo request | Request a Demo |
| Contact sales | Contact Sales |
| Newsletter | Stay Updated |
| Waitlist | Join the Waitlist |
| Feedback | Share Feedback |
| Security report | Report a Vulnerability |

---

## 3. Form Validation

### 3.1 Validation Principles

1. **Inline, on blur.** Validate when the user tabs away, not on every keystroke.
2. **Helpful, not hostile.** Explain what's wrong AND how to fix it.
3. **Specific error placement.** Error message appears directly below the invalid field.
4. **Accessible.** Use `aria-invalid`, `aria-describedby`, `role="alert"`.

### 3.2 Error Messages

| Field | Condition | Error Message |
|---|---|---|
| Work Email | Empty | Please enter your work email. |
| Work Email | Invalid format | Please enter a valid work email address. |
| Work Email | Personal email (gmail, yahoo, etc.) | Please use your work email address. |
| First Name | Empty | Please enter your first name. |
| Last Name | Empty | Please enter your last name. |
| Company | Empty | Company name is required. |
| Job Title | Empty | Please select your role. |
| Message | Empty | Please enter a message. |
| Message | Over 500 characters | Message cannot exceed 500 characters. |
| Phone | Invalid format | Please enter a valid phone number with country code. |

### 3.3 Error Message Rules

- **Start with "Please"** for missing fields. It's polite and clear.
- **Be specific.** "Please enter a valid work email address" not "Invalid input."
- **Don't blame the user.** "Please enter..." not "You forgot to enter..."
- **Don't use technical terms.** "Please enter a valid email" not "Email regex validation failed."
- **One error per message.** Don't combine: "First name and company are required" → separate messages.

---

## 4. Success States

### 4.1 Form Submission Success

| Context | Success Message |
|---|---|
| Demo request submitted | Thanks! We'll be in touch within 24 hours. |
| Contact form submitted | Message sent. We typically respond within 1 business day. |
| Newsletter subscribed | You've been added to the list. Check your inbox for a confirmation. |
| Waitlist joined | You're on the list. We'll notify you when we're ready. |
| Feedback submitted | Thanks for the feedback. It helps us build better. |
| Vulnerability reported | Report received. Our security team will respond within 48 hours. |

### 4.2 Success State Design Rules

- **Show, don't just tell.** Include a checkmark icon or animation.
- **Confirm what was submitted.** "Your demo request for Acme Corp has been submitted."
- **Set expectations.** "We'll respond within 24 hours."
- **Offer a next step.** "While you wait, read about our [security practices](/security)."

---

## 5. Error States

### 5.1 Form Submission Errors

| Context | Error Message |
|---|---|
| Network error | Something went wrong. Please try again or contact support@perionyx.com |
| Rate limited | Too many requests. Please wait a moment and try again. |
| Server error | Something went wrong on our end. Please try again in a few minutes. |
| Validation error | Please check the highlighted fields and try again. |

### 5.2 Page-Level Errors

| Context | Error Message |
|---|---|
| Page load failure | This page couldn't be loaded. Please try refreshing. |
| API error | We couldn't load this data. Please try again. |
| Timeout | The request took too long. Please try again. |

### 5.3 Error State Design Rules

- **Always include a retry path.** Button or link to try again.
- **Include support contact** for persistent errors.
- **Never show stack traces** or technical error codes to users.
- **Apologize once.** Don't over-apologize. "Something went wrong" is enough.

---

## 6. Empty States

### 6.1 Empty State Messages

| Context | Message | Action |
|---|---|---|
| No search results | No results found. Try adjusting your search. | — |
| No blog posts | No posts yet. Check back soon. | Subscribe for updates |
| No changelog entries | No entries yet. Check back after the next release. | — |
| No open roles | No open roles right now. Check back soon. | Subscribe for updates |
| No customer stories | Stories coming soon. | — |
| Empty dashboard | Nothing here yet. Start by [connecting a bank account]. | Primary CTA |
| No notifications | You're all caught up. | — |
| No recent activity | No activity in the last 30 days. | — |

### 6.2 Empty State Design Rules

- **Always explain WHY it's empty.** "No results found" is better than "No results."
- **Offer a path forward.** Suggest what the user can do next.
- **Use a subtle illustration** if appropriate — but never stock imagery.
- **Keep it brief.** One sentence max.

---

## 7. Loading States

### 7.1 Standard Loading Messages

| Context | Message |
|---|---|
| Page loading | Loading... |
| Search in progress | Searching... |
| Form submitting | Submitting... |
| Data fetching | Loading data... |
| File upload | Uploading... |
| Save in progress | Saving... |

### 7.2 Loading State Rules

- **Use a spinner or skeleton**, not just text.
- **Keep messages under 2 words.** "Loading..." not "Please wait while we load your data..."
- **Never block the UI.** Show content as it loads (skeleton screens preferred over spinners).
- **For long operations**, show progress: "Uploading 3 of 10 files..."

---

## 8. Navigation

### 8.1 Top Navigation Labels

| Label | URL | Notes |
|---|---|---|
| Product | `/product` | Top-level nav item |
| Platform | `/platform` | Top-level nav item |
| Security | `/security` | Top-level nav item |
| AI | `/ai` | Top-level nav item |
| Engineering | `/engineering` | Top-level nav item |
| Pricing | `/pricing` | Top-level nav item (if applicable) |
| Docs | `/platform/api` | Top-level nav item |

### 8.2 Mega Menu Items

**Product mega menu:**
| Column 1 | Column 2 | Column 3 |
|---|---|---|
| Accounts Payable | Treasury | Executive Intelligence |
| Accounts Receivable | Approvals | General Ledger |
| Reconciliation | Risk | Cash Management |
| Compliance | Audit | Reporting |

**Platform mega menu:**
| Column 1 | Column 2 |
|---|---|
| Architecture | API Documentation |
| Performance | Developer Experience |
| Reliability | Deployment |
| Integrations | Infrastructure |
| Connectors | Observability |

**Security mega menu:**
| Column 1 | Column 2 |
|---|---|
| Overview | Encryption |
| Authentication | Audit Trail |
| Authorization | Multi-Tenancy |
| API Security | Compliance |
| Infrastructure | Incident Response |

### 8.3 Footer Navigation

| Section | Links |
|---|---|
| Product | Accounts Payable, Accounts Receivable, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, General Ledger, Cash Management, Reporting |
| Platform | Architecture, Performance, Reliability, Integrations, API, Developer, Deployment, Infrastructure, Observability |
| Security | Overview, Authentication, Authorization, Encryption, Audit Trail, Compliance, Incident Response |
| AI | Overview, Capabilities, Providers, Governance, Explainability, Privacy, Roadmap |
| Engineering | Blog, Architecture Decisions, Performance, Testing, Infrastructure, Open Source, Contribute |
| Company | About, Mission, Team, Careers, Press, Contact, Partners, Legal |
| Resources | Changelog, Roadmap, Status, Research |
| Legal | Privacy Policy, Terms of Service, Responsible Disclosure, Cookie Policy |

---

## 9. Tooltip Text

### 9.1 Icon Button Tooltips

| Icon | Context | Tooltip |
|---|---|---|
| External link | Any page | Opens in a new tab |
| Copy | Code blocks | Copy to clipboard |
| Info | Form field | More information about this field |
| Help | Any context | Learn more about [topic] |
| Expand | Collapsed section | Show more |
| Collapse | Expanded section | Show less |
| Search | Global | Search the site (`⌘K`) |
| Theme toggle | Global | Switch to [light/dark] mode |
| RSS | Blog/changelog | Subscribe via RSS |
| Share | Blog post | Share this post |

### 9.2 Inline Help Icons

| Context | Tooltip |
|---|---|
| "Work email" field | We use your work email to verify your company and personalize your demo. |
| "Company" field | Enter your company's legal or trading name. |
| "Phone" field | Optional. Include country code for international numbers (e.g., +1). |
| "Message" field | Describe what you'd like to see in your demo or what problem you're solving. |
| API key field | Your API key has access scoped to your account. Keep it secret. |
| Decimal precision | Decimal(38,12) means 38 total digits with 12 decimal places — enough precision for any monetary calculation. |

---

## 10. 404 Page

### 10.1 Content

```
H1: Page not found
Body: The page you're looking for doesn't exist or has been moved.
```

### 10.2 404 Page Elements

| Element | Content |
|---|---|
| Heading | Page not found |
| Body | The page you're looking for doesn't exist or has been moved. |
| Search box | Placeholder: "Search for..." |
| Popular links | Home, Product, Platform, Security, AI, Engineering, Blog, Contact |
| CTA | Back to Home |

### 10.3 404 Page Tone

- **Not apologetic.** "Page not found" is neutral and factual.
- **Helpful.** Search box and popular links give the user a way forward.
- **Not technical.** No "404 error" jargon in the heading.

---

## 11. Cookie Banner

### 11.1 Cookie Banner Copy

```
We use cookies to improve your experience and analyze site traffic.
By continuing, you agree to our use of cookies.

[Accept All] [Customize] [Read our Cookie Policy]
```

### 11.2 Cookie Banner Rules

- **Appear on first visit only.** Don't re-show after acceptance.
- **Don't block content.** Banner at bottom of viewport, not a modal.
- **Three options**: Accept All, Customize (granular), and a link to Cookie Policy.
- **No dark patterns.** "Customize" should be as prominent as "Accept All."
- **Store preference** for 12 months.

---

## 12. Newsletter Signup

### 12.1 Copy

| Element | Text |
|---|---|
| Heading | Stay Updated |
| Subheading | Engineering posts, product updates, and research findings. No spam. |
| Input placeholder | `you@company.com` |
| Button | Subscribe |
| Success | You're subscribed. Check your inbox for a confirmation email. |
| Already subscribed | You're already on the list. |
| Error | Something went wrong. Please try again. |
| Unsubscribe | Unsubscribe from all emails. |

### 12.2 Newsletter Signup Rules

- **One field: email.** Don't ask for name, company, or role in the initial signup.
- **Promise frequency.** "Monthly" or "Bi-weekly" — set expectations.
- **Double opt-in.** Confirmation email required before first newsletter.
- **Easy unsubscribe.** One-click unsubscribe in every email. No login required.

---

## 13. Social & Share

### 13.1 Share Buttons

| Platform | Button Text | Share URL Format |
|---|---|---|
| Twitter/X | Share on Twitter | `https://twitter.com/intent/tweet?text={title}&url={url}` |
| LinkedIn | Share on LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url={url}` |
| Copy link | Copy link | Copies URL to clipboard with "Copied!" confirmation |

### 13.2 Share Button Rules

- **Show share buttons on blog posts, research, and engineering articles.**
- **Don't show on product or security pages.** Those aren't shared socially.
- **"Copied!" toast** appears for 2 seconds after link copy.

---

## 14. Keyboard Shortcuts

### 14.1 Shortcut Labels

| Shortcut | Action | Label |
|---|---|---|
| `⌘K` | Open search | Search |
| `⌘/` | Show keyboard shortcuts | Keyboard shortcuts |
| `Escape` | Close modal/dropdown | Close |
| `?` | Show help | Help |

### 14.2 Shortcut Tooltip Format

```
⌘K  Search
```

Use the actual key symbols (⌘ for Mac, Ctrl for others). Show both keys for cross-platform.

---

## 15. Status & System Messages

### 15.1 System Status Messages

| Status | Display | Color |
|---|---|---|
| All systems operational | All systems operational | Green |
| Partial outage | Some systems are experiencing issues | Yellow |
| Major outage | We're experiencing a service disruption | Red |
| Maintenance | Scheduled maintenance in progress | Blue |

### 15.2 Status Page Messages

| Context | Message |
|---|---|
| Incident detected | We're investigating reports of [issue]. Updates to follow. |
| Incident identified | The issue has been identified. We're working on a fix. |
| Fix deployed | A fix has been deployed. We're monitoring for stability. |
| Incident resolved | This incident has been resolved. [Summary of impact.] |
| Scheduled maintenance | Scheduled maintenance on [date] from [start] to [end] UTC. Expect brief interruptions. |

---

## 16. Accessibility-Specific Copy

### 16.1 Screen Reader Labels

| Element | `aria-label` |
|---|---|
| Search input | "Search the site" |
| Theme toggle | "Toggle dark mode" |
| Mobile menu | "Open navigation menu" |
| Close button | "Close" |
| External link | Append "(opens in new tab)" |
| Copy button | "Copy code to clipboard" |
| Scroll to top | "Scroll to top" |

### 16.2 Skip Navigation

```
Skip to main content
```

This link is visually hidden until focused (Tab key), then appears at the top of the viewport.

### 16.3 Focus Indicators

- All interactive elements must have visible focus rings.
- Focus ring color: Gold (`#d4af37`) on dark backgrounds.
- Focus ring style: 2px solid, 2px offset.
