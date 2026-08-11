# Section 11 — Visual Design

## 11.1 The Visual Thesis: Calm Density

Linear's visual identity is best summarized as **calm density** — the maximal information per pixel consistent with zero perceived clutter. It achieves this through four discipline-based pillars:

1. **Neutrality of chrome** — structure and controls live in muted neutrals; the eye is never competing with chrome for attention.
2. **Saturation as meaning** — the palette is nearly monochrome by default; color is *earned* by status, priority, and interactivity.
3. **Alignment as rhythm** — dense grids, aligned columns, consistent iconography, and a 4px spacing base create a rhythm that reads as "engineered."
4. **Typography as hierarchy** — Inter Display for headlines, Inter for body, JetBrains Mono for identifiers and codes — a two-typeface system that stays out of the way.

## 11.2 The Palette

Linear's palette discipline is the most copied design system in developer tools, and its rules are straightforward:

- **The neutral core**: surfaces in near-black (dark theme: `#08090A`-family backgrounds, `#161719` cards) and near-white (light theme), with borders at ~10-15% white/black.
- **Text hierarchy via opacity, not color**: primary text ~90%, secondary ~60%, tertiary ~40%. The same hex, different opacities — this is the "text/icons at 40-60% opacity" discipline noted in the motion analysis.
- **The accent**: a single brand accent (Linear's indigo/violet) used for interactivity, selection, links, and focus. It appears *rarely*, which makes it *meaningful*.
- **Status colors**: a fixed semantic set for statuses (gray backlog, blue in-progress, purple review, green done) and priority (red urgent, orange high, amber medium, gray low). These are the *only* saturated elements in a calm row.
- **User colors**: avatar hues are assigned per user, stable across the workspace (identity via color).

The transferable rules for Perionyx (already convergent with EDL's `#0a0a0f` / gold `#d4af37` system):

- Text hierarchy by opacity, not by color (fewer hues, cleaner screen).
- Saturation reserved for meaning (EDL's status palette is already this).
- One accent, used rarely (Perionyx's gold for currency/active states — the same doctrine).
- Semantic status colors, never decorative color.

## 11.3 Dark-First as Brand

Linear's dark mode is not a "theme" — it is the *default brand*, and the light mode is the adaptation. The design rationale (shared by Karri in talks):

- **The audience** (developers, power users, night workers) lives in dark environments; dark is the native habitat.
- **The density** reads better in dark — muted surfaces recede, saturated meaning pops.
- **The mood** ("for builders") is part of the brand; dark signals "serious tool," not "consumer toy."
- **The light mode exists** and is fully designed, but the product's identity is dark-first.

Perionyx's EDL is already dark-first (`#0a0a0f`, charcoal surfaces ~95%) — a deliberate alignment with the same logic. The Linear lesson sharpens the stance: **dark-first is a brand statement about who the product is for (professionals working at night and at speed), not a cosmetic preference.**

## 11.4 Typography

Linear's type system:

- **Inter Display** for large headings and the logo (geometric, tight, confident).
- **Inter** for body and UI (humanist, readable at small sizes, neutral).
- **JetBrains Mono** for identifiers (`LIN-123`), estimates, and code — the "machine voice" that signals structured data.
- **Scale**: compact UI sizes (12-14px body in dense lists), generous headings (24-32px display), tight line-height on headings, looser on body.
- **Numeric alignment**: tabular figures where numbers must scan vertically (estimates, counts) — a discipline Perionyx's monetary tables should adopt rigorously.

The Perionyx alignment is nearly identical (Inter + JetBrains Mono from Phase 22.0B). The Linear addition: **tabular numerals as a design rule for any column where numbers must be compared vertically** — a finance-critical detail (ledger amounts, currency columns) that improves scannability measurably.

## 11.5 Iconography

- **Line icons, 1-1.5px strokes**, consistent optical size — never filled, never decorative.
- **Semantic icons per object type** (issue, project, cycle, document) used consistently everywhere the object appears.
- **Priority encoded iconographically** (urgent = red double-caret, high = up arrow, medium = right arrow, low = down arrow, none = muted dot) — a legend-free vocabulary.
- **Status icons** (backlog = circle, in-progress = play, review = eye, done = check) reinforce the status chips.

The rules for Perionyx: line icons with consistent stroke, object-type icons used uniformly (invoice, approval, exception, payment), and *encoding-by-icon* where a legend would add noise. Lucide (already in use) matches this style family.

## 11.6 Spacing, Density, and the 4px Grid

- **4px base grid**; 8px for vertical rhythm in forms; 12-16px for card padding; 24px for section gaps.
- **Compact density as the default** for lists (rows ~32px); comfortable mode for readability-sensitive views.
- **Chrome budget**: sidebar ~240px, header ~48px, floating bars overlay content rather than steal layout.
- **Whitespace as structure**: Linear is dense *because* its whitespace is disciplined — consistent gutters, aligned columns, no orphaned padding.

The Perionyx EDL 4px spacing base already matches. The Linear-specific rule worth adopting: **density modes are a first-class product feature** (compact/comfortable toggles per view), not a developer preference.

## 11.7 The 2023-2024 Design Reset

Linear's public redesign ("A design reset," Karri's essay + release notes) is a rare, documented case study in *paying design debt*:

- **The diagnosis**: six years of incremental shipping had accumulated inconsistent labels, misaligned icons, uneven hierarchy, and settings sprawl. The product was still good — but the *craft* was eroding.
- **The method**: a **concept-first** redesign (a small team, a tight direction statement, not a feature-by-feature re-skin); **feature flags** for staged rollout; **stress tests** (the team pushed real, large workspaces through the redesign before commit); **CEO backing** (a top-down mandate that made the reset a priority, not a side project).
- **The results**: aligned labels (every status/label/icon system re-normalized), honest hierarchy (one level of visual emphasis per screen), reduced noise (fewer saturated elements, clearer focus), settings consolidation (fewer, clearer settings screens).
- **The lesson Karri articulated**: design debt is *inevitable* in a fast-shipping product; the answer is scheduled resets every 2-3 years, executed with senior backing — not constant micro-polish.

Perionyx's Phase 22.0B/22.0B.1 EDL migration was precisely this reset (token migration across ~470 files, canonical colors). The Linear model adds the *scheduling* and *funding* discipline: **the reset is a line item on the roadmap, with an owner and a budget, recurring.**

## 11.8 The 2025 Mobile Redesign (Liquid Glass, the SDF Lesson)

Linear's 2025 iOS redesign (documented in their engineering blog) is instructive for one specific technical decision:

- **The brief**: recreate Apple's "Liquid Glass" material within the app's own design language.
- **The engineering**: rendered glass with **signed distance fields (SDF)** rather than naive blur layers — because blur is expensive (thousands of GPU passes) and visually inconsistent; SDF gives a cheap, uniform, adjustable "frost."
- **The discipline**: when a trendy material would compromise clarity (constant refraction, moving highlights), **Linear refused the refraction** — choosing clarity over the trend. "Variable blur at scroll edges" was used instead of full-surface glass.

The transferable lesson is not the SDF technique — it is the *refusal pattern*: **when a visual trend conflicts with clarity (Perionyx's #1 principle), the trend loses, even when it is the platform's own aesthetic.** Perionyx's EDL should have (and per its design principles already has) this same refusal authority.

## 11.9 Visual Design Rules (Condensed)

1. Calm density: maximum information per pixel, zero perceived clutter.
2. Chrome is neutral; saturation is meaning.
3. Text hierarchy via opacity, not hue.
4. One accent, used rarely, always meaningful.
5. Dark-first is brand, not theme.
6. Two typefaces + one mono; tabular figures for number columns.
7. Line icons, consistent stroke, semantic and legend-free.
8. 4px grid; density modes are a product feature.
9. Alignment is rhythm: aligned columns, consistent gutters, no orphans.
10. Pay design debt in scheduled, funded, concept-first resets.
11. Refuse visual trends that compromise clarity — even platform trends.

---

# Section 12 — Accessibility

## 12.1 The Accessibility Posture

Linear's accessibility is a *consequence of its design philosophy* rather than a bolt-on compliance program — and it is stronger for it. The keyboard-first model (Section 10) means the product is operable without a mouse by construction. The density discipline means contrast and hierarchy are *designed*, not audited into place. The result is a product that scores well on keyboard operability and offers a genuine "Increase Contrast" adaptivity option — while remaining honest that some premium interactions (multi-select drag, certain gestures) are mouse/touch-forward.

## 12.2 What Linear Gets Right

1. **Full keyboard operability.** Every function is keyboard-reachable: navigation, lists, forms, dialogs, palettes, context menus. The keyboard model is not a skinned tab-index trail; it is the product's primary input design.
2. **Focus management.** Focus follows the highlight model in lists; dialogs trap focus, restore focus to the opener on close, and close on `esc`; the palette manages focus explicitly.
3. **Visible focus states.** The focus ring / highlight is a first-class visual state (the row highlight, the palette's selection), not a default outline.
4. **Contrast by design.** Muted-but-legible neutral scales, semantic colors chosen for differentiation, and a high-contrast adaptivity mode.
5. **Reduced motion.** The motion system (Section 8B.7's sibling in Perionyx) respects reduced-motion preferences; the GPU-composited, distance-scaled transitions degrade gracefully.
6. **ARIA/labels.** Icon-only controls carry accessible labels (avatar menus, chip toggles, icon buttons).
7. **Screen-reader structure.** Lists, landmarks, and status changes are exposed; the palette announces appropriately.
8. **Honest gaps.** Linear does not overclaim: some drag-and-drop and touch-gesture interactions are enhancement-only with keyboard equivalents provided.

## 12.3 What Linear Gets Wrong / Leaves for Others

The honest critical assessment:

1. **Onboarding for accessibility users is absent** — the product's famously thin onboarding assumes keyboard-competent, sighted, neurotypical users.
2. **Density vs. readability tension**: compact mode is genuinely dense; low-vision users must discover and switch density modes (which persist per user — a partial win).
3. **Color is still a meaning carrier** — status and priority rely on color + icon (the icons save it from being color-only), but differentiation of some statuses (gray backlog vs. gray no-priority) is subtle.
4. **No formal public WCAG statement** (as of this review); accessibility is engineering-derived, not certified-documented.

The Perionyx counter-position is deliberate and correct: Perionyx *mandates* WCAG 2.1 AA (Phase 8B.6/8B.9, constitution), runs audits (Phase 8B.9), and treats accessibility as a compliance requirement, not an engineering byproduct. The synthesis: **Perionyx should keep its WCAG-certification posture while borrowing Linear's *architectural* accessibility** — the keyboard-first model, the focus discipline, the contrast-by-design palette — so that compliance is a byproduct of architecture, not a remediation layer.

## 12.4 The Accessibility = Productivity Equation

The most important accessibility insight from Linear is reframed as a Perionyx principle:

**Accessibility is not a separate quality bar; it is the same design as speed and focus.** Keyboard-first is simultaneously:
- A speed feature for power users (Section 10.8).
- A motor-accessibility feature (no mouse required).
- A focus feature (the eye stays on data).
- An audit feature (keyboard actions are discrete, observable events).

Perionyx's finance audience compounds this: controllers with RSI, operators working in low-light war rooms, auditors using screen readers on exports — the same keyboard model serves all of them. The design goal is not "pass WCAG" (that is the floor) but **"no Perionyx capability requires a capability the operator doesn't have."**

## 12.5 Accessibility Rules (Condensed)

1. Accessibility is a byproduct of keyboard-first architecture, not a remediation layer.
2. Every capability is reachable by keyboard alone; mouse is never required.
3. Focus follows the highlight model; dialogs trap, restore, and `esc`-close.
4. Visible focus is a designed state, not a default outline.
5. Contrast is by design: muted scales chosen for legibility, semantic colors differentiated.
6. Reduced motion is respected at the system level.
7. Icon-only controls carry accessible labels.
8. Status/priority encode meaning in icon + color, never color alone.
9. Density modes persist per user; accessibility users can claim comfortable mode.
10. WCAG 2.1 AA remains Perionyx's certified floor; architecture raises the ceiling.

## 12.6 The Perionyx Accessibility Commitment (Refined by Linear)

Building on Phase 8B.6/8B.9 (EnterpriseField aria wiring, skip-nav, keyboard-shortcuts dialog, focus traps), the Linear-informed refinements:

1. **Add `j`/`k`/`space`/`x` list model** to EnterpriseTable screens — the single largest accessibility + speed win available (row highlight, peek, selection, all keyboard-native).
2. **Make the CommandPalette the shortcut school** — show shortcuts beside commands; audit palette commands for context-awareness.
3. **Tabular numerals for money columns** — vertical scannability for screen readers *and* sighted users.
4. **Persist density preference per user** — remembered across sessions.
5. **Global sync/freshness indicator in chrome** — accessibility-relevant (state is labeled, not implied).
6. **Keyboard-first as a documented product principle** — not a backlog item; the architecture standard for new screens.
