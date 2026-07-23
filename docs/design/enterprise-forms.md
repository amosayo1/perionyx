# Enterprise Form System

## Form Philosophy

Enterprise finance professionals complete hundreds of forms every week. Every interaction must reduce cognitive load, never add to it. The system should guide users toward success rather than validating mistakes after the fact.

### Core Principles

1. **Clarity first** — Every field answers one question. No ambiguous labels, no unexplained formats.
2. **Guide toward success** — Smart defaults, inline examples, hint text, and real-time validation prevent errors before they happen.
3. **Progressive disclosure** — Show essential fields by default. Collapse advanced, expert, and rarely-used settings behind expandable sections.
4. **Save state transparency** — Users always know: is it saving, saved, failed, or unsaved? Never wonder "did this save?"
5. **Error recovery** — Every error explains how to fix it. Cryptic messages are never acceptable.
6. **Keyboard-first** — All forms navigable via Tab/Shift+Tab/Enter/Escape. Power users never lift hands off keyboard.
7. **Audit-ready** — All form submissions propagate to audit trails. Forward/back navigation preserves state.

## Component Architecture

```
EnterpriseForm          — Root form wrapper: auto-save, validation summary, unsaved changes guard
├─ EnterpriseSection    — Collapsible section group with header, error count badge
│  ├─ EnterpriseField   — Label + input + help text + error message + hint
│  │  ├─ FieldHelp      — Inline help text below field
│  │  ├─ FieldHint      — Styled hint (example, best-practice, regulatory, tip)
│  │  └─ ValidationSummary — Aggregated field-level errors with focus navigation
│  ├─ SmartSelect       — Searchable, grouped multi-select with keyboard nav
│  ├─ ConditionEditor   — Field/operator/value condition builder with AND/OR logic
│  └─ ApprovalPreview   — Visual approval path simulation
├─ AutoSaveIndicator    — Saving/Saved/Failed/Unsaved status pill
├─ UnsavedChangesGuard  — Beforeunload warning + inline save/discard actions
├─ EnterpriseWizard     — Multi-step wizard with step indicator and back/next/complete
├─ ReviewStep           — Pre-submit review with valid/invalid status per field
```

### Form States

Every form component supports these states:

| State | Visual | Behavior |
|-------|--------|----------|
| idle | Neutral | No interaction yet |
| saving | Blue pulse | Inline spinner + "Saving..." |
| saved | Green check | Transient green indicator + timestamp |
| error | Red alert | Error message + Retry button |
| unsaved | Amber warning | "Unsaved changes" guard |

### Field States

Each field reports validation state:

| State | Visual | Accessibility |
|-------|--------|---------------|
| idle | Default | — |
| validating | Spinner | `aria-busy="true"` |
| valid | Green check | `aria-invalid="false"` |
| invalid | Red border + message | `aria-invalid="true"`, `aria-describedby` for error |
| warning | Amber hint | Optional advisory, not blocking |

## Validation Standards

### Inline Validation
- Fire on blur (not on keystroke to avoid distraction)
- Show validation results immediately after user leaves a field
- Explain how to fix the problem, not just what's wrong

### Types Supported

| Validation | Implementation |
|-----------|----------------|
| Required | `required` prop + red asterisk on label |
| Format | Pattern regex with user-readable message |
| Range | Min/max with value preview |
| Cross-field | Compare two fields (e.g., password match) |
| Async/Server | Debounced server call with loading state |
| Business rule | Custom validator function returning error string |
| Duplicate detection | Debounced async uniqueness check |

### Error Message Standards

```
Good: "Enter a valid SWIFT/BIC code (8 or 11 characters)"
Bad:  "Invalid format"
Good: "Amount must be at least $1.00 and cannot exceed $10,000,000.00"
Bad:  "Value out of range"
Good: "This rule name already exists. Choose a unique name."
Bad:  "Duplicate entry"
```

## Smart Default Strategy

### Priority Order
1. **Previous user input** — Remember last-used values in session
2. **Organization defaults** — Tenant-level configuration (e.g., default currency)
3. **Role-based defaults** — Based on user's role and department
4. **Sensible defaults** — e.g., `isActive: true`, `priority: 50`

### Default Override
- All defaults are pre-filled but not locked
- Users can always override
- Overrides are remembered per-session

## Progressive Disclosure Rules

| Section Type | Behavior |
|-------------|----------|
| Core fields | Always visible, top of form |
| Optional fields | Always visible, labeled "Optional" |
| Collapsible sections | Expandable via click, relevant context |
| Advanced sections | Collapsed by default, marked "Advanced" badge |
| Expert settings | Hidden behind "Show all settings" toggle |

## Workflow UX Principles

### Canvas
- **Zoom**: Cmd+Scroll, +/- buttons, Cmd+0 to reset
- **Pan**: Click-drag on canvas background
- **Grid**: Toggleable dot grid for alignment
- **Minimap**: Optional overview in bottom-right corner
- **Selection**: Click to select step, highlight with gold border

### Toolbar
- **Undo/Redo**: Cmd+Z / Cmd+Shift+Z buttons
- **Alignment**: Left/Center/Auto-layout
- **Save**: Cmd+S, visual confirmation
- **Export**: Download workflow as image/data

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| Cmd/Ctrl + S | Save |
| Cmd/Ctrl + = | Zoom in |
| Cmd/Ctrl + - | Zoom out |
| Cmd/Ctrl + 0 | Reset zoom |
| Delete/Backspace | Remove selected step |
| Arrow keys | Navigate between steps |
| Tab | Focus next field |
| Shift + Tab | Focus previous field |
| Enter | Submit / Save / Confirm |
| Escape | Cancel / Close panel |

## Auto-Save Strategy

### Behavior
- Debounced 2 seconds after last change
- Visual indicator shows state (Saving → Saved / Failed)
- Auto-save on field blur (immediate, no debounce)
- Manual save always available in footer

### Conflict Resolution
- Server returns 409 on version conflict
- User shown diff and prompted to choose: Keep mine / Accept theirs / Review both
- Draft recovery: Form state preserved in localStorage on crash

## Error Handling Standards

### Network Errors
- Auto-retry once on 5xx
- Show "Connection lost — retrying..." indicator
- On persistent failure: "Unable to save. Your changes are preserved locally."

### Validation Errors
- Scroll to first error
- Focus first invalid field
- Validation summary at top lists all errors
- Each error links to its field

### Recovery Actions
| Error | Recovery |
|-------|----------|
| Validation error | Fix highlighted fields, re-submit |
| Network error | Retry button or auto-retry |
| Version conflict | Review diff, choose version |
| Server error | Contact support, data preserved locally |
| Timeout | Check connection, retry |

## Accessibility Guidelines

### Standards
- All forms meet WCAG 2.1 AA minimum
- Fields use `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`
- Error messages linked via `aria-describedby`
- Focus order follows visual order
- Reduced motion: `prefers-reduced-motion` respected

### Keyboard Navigation
- Tab order matches visual layout
- Custom components (SmartSelect, ConditionEditor) implement `aria-activedescendant`
- Wizard steps keyboard-navigable via arrow keys
- Submit via Enter from any field

## Enterprise Form Standards

### Label Conventions
| Rule | Example |
|------|---------|
| Title case for labels | "Rule Name", not "rule name" or "Rule name" |
| No trailing colons | "Rule Name" not "Rule Name:" |
| Required shown as red asterisk | `Label *` |
| Optional not shown unless needed | No annotation = required |
| Contextual help via `helpText` prop | Short sentence explaining the field |

### Field Spacing
- `space-y-1.5` within field (label → input → error → help)
- `space-y-4` between fields
- `space-y-6` between sections
- `px-4 py-3` for section headers
- `gap-4` for grid layouts

### Action Bar
- Primary action right-aligned (Save, Create, Update, Submit)
- Secondary action (Cancel) left of primary
- Loading state disables all actions
- Destructive actions require confirmation step

## Visual Hierarchy

### Color Usage
- Fields: zinc-300 labels, white text values, zinc-500 help text
- Required: red-400 asterisk
- Errors: red-400 text + red-500/10 background
- Warnings: amber-400 text + amber-500/5 background
- Success: emerald-500 checkmarks
- Active/Enabled: emerald-400 switch
- Gold accents: `[#d4af37]` for active selections, primary buttons
- Backgrounds: zinc-900/40 sections, zinc-950 root

### Typography
- Labels: 12px (text-xs), medium weight, uppercase tracking only for short metadata
- Values: 14px (text-sm), normal weight
- Help text: 11px, zinc-500
- Errors: 11px, red-400
- Field descriptions: 10px, zinc-500
- Section titles: 14px, semibold, zinc-200

## File Inventory

### Core Form Components (`src/components/enterprise/forms/`)
| File | Exports | Lines |
|------|---------|-------|
| `types.ts` | FormStatus, FieldStatus, FieldError, FormSectionConfig, FieldValidation, SmartSelectOption, AutoSaveState, WizardStep | — |
| `enterprise-form.tsx` | EnterpriseForm | — |
| `enterprise-section.tsx` | EnterpriseSection | — |
| `enterprise-field.tsx` | EnterpriseField | — |
| `field-help.tsx` | FieldHelp | — |
| `field-hint.tsx` | FieldHint | — |
| `validation-summary.tsx` | ValidationSummary | — |
| `auto-save-indicator.tsx` | AutoSaveIndicator | — |
| `unsaved-changes-guard.tsx` | UnsavedChangesGuard | — |
| `smart-select.tsx` | SmartSelect | — |
| `condition-editor.tsx` | ConditionEditor | — |
| `approval-preview.tsx` | ApprovalPreview | — |
| `enterprise-wizard.tsx` | EnterpriseWizard | — |
| `review-step.tsx` | ReviewStep | — |
| `index.ts` | Barrel export | — |

### Workflow Components (`src/components/enterprise/workflow/`)
| File | Exports | Lines |
|------|---------|-------|
| `workflow-canvas.tsx` | WorkflowCanvas | — |
| `workflow-toolbar.tsx` | WorkflowToolbar | — |
| `index.ts` | Barrel export | — |

### Migrated Forms (backward compatible)
| File | Form | Improvements |
|------|------|-------------|
| `src/components/automation-studio/business-rules-form.tsx` | Business Rules | EnterpriseForm wrapper, EnterpriseField with help/hint text, EnterpriseSection for config params, Priority with visual badge + labels |
| `src/components/automation-studio/approval-matrix-form.tsx` | Approval Matrix | EnterpriseForm, ConditionEditor, ApprovalPreview, EnterpriseSections for conditions/threshold/preview |
| `src/components/automation-studio/scheduler-form.tsx` | Scheduler | EnterpriseForm, EnterpriseField with help/hint, collapsible Advanced/Input sections, improved trigger type documentation |

### Enterprise Component Exports
| Path | New Exports |
|------|-------------|
| `src/components/enterprise/index.ts` | EnterpriseForm, EnterpriseSection, EnterpriseField, FieldHelp, FieldHint, ValidationSummary, AutoSaveIndicator, UnsavedChangesGuard, SmartSelect, ConditionEditor, ApprovalPreview, EnterpriseWizard, ReviewStep, WorkflowCanvas, WorkflowToolbar |

## Future Extension Points

1. **Form persistence** — Save form state to localStorage for crash recovery
2. **Batch operations** — Multi-edit mode for approval roles, conditions
3. **Form templates** — Pre-built form configurations for common use cases
4. **Dynamic forms** — JSON-schema-driven form generation for custom fields
5. **Form analytics** — Track time-to-complete, abandonment rates, common errors
6. **Accessibility audit tool** — Built-in keyboard navigation tester
7. **Validation worker** — Offload heavy validation to Web Worker
8. **Form translation** — i18n for multi-language enterprise environments
9. **Arabic RTL** — Full RTL support for Arabic localization readiness
10. **Form drafts API** — Server-side draft persistence with version management
