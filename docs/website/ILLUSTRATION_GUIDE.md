# Perionyx Public Website — Illustration Guide

> **Status**: v1.0
> **Scope**: Visual content rules — diagrams, screenshots, code examples, abstract patterns
> **Principle**: Perionyx does not use traditional illustrations. We use technical visual content that informs.

---

## 1. Visual Content Philosophy

Perionyx visual content follows one rule: **it must inform or it doesn't exist.**

There are no hand-drawn illustrations. No vector art. No cartoon characters. No abstract watercolors. No lifestyle photography. Every visual element either shows the product, explains architecture, demonstrates code, or presents data.

**The visual hierarchy:**
1. **Diagrams** — Explain how things work (architecture, workflows, data flows)
2. **Screenshots** — Show the product in action
3. **Code examples** — Demonstrate technical precision
4. **Metric counters** — Quantify outcomes
5. **Text + spacing** — When no visual adds comprehension, use typography alone

---

## 2. Diagram Style

### 2.1 Diagram Types

| Type | Usage | Complexity |
|---|---|---|
| **Architecture diagram** | System components, infrastructure | 5-15 nodes |
| **Workflow diagram** | Process steps, approval chains | 4-8 nodes |
| **Data flow diagram** | Information movement, integrations | 3-8 nodes |
| **Comparison diagram** | Before/after, alternative approaches | 2-4 groups |
| **Hierarchy diagram** | Organizational structure, taxonomy | Tree structure |

### 2.2 Node Specification

```svg
<!-- Standard node -->
<rect
  x="0" y="0"
  width="160" height="64"
  rx="8" ry="8"
  fill="#121212"
  stroke="#3f3f46"
  stroke-width="1"
/>

<!-- Node label -->
<text
  x="80" y="36"
  font-family="Inter, sans-serif"
  font-size="13"
  font-weight="500"
  fill="#d4d4d8"
  text-anchor="middle"
>
  Node Label
</text>

<!-- Node icon (optional, top-left) -->
<text x="12" y="40" font-size="16" fill="#a1a1aa">
  🔧
</text>
```

| Property | Value | Notes |
|---|---|---|
| Shape | Rounded rectangle | `rx="8" ry="8"` |
| Width | 120–200px | Based on label length |
| Height | 56–72px | Fixed per diagram type |
| Fill | `#121212` | Matches card background |
| Stroke | `#3f3f46` (zinc-700) | 1px width |
| Label font | Inter, 13px, weight 500 | Centered |
| Label color | `#d4d4d8` (zinc-300) | Readable on dark |
| Icon | Optional, left-aligned | 16px, zinc-400 |

### 2.3 Node Variants

| Variant | Stroke | Fill | Usage |
|---|---|---|---|
| **Default** | `#3f3f46` | `#121212` | Standard nodes |
| **Highlighted** | `#d4af37` | `#121212` with `#d4af37]/5` bg | Active/focus nodes |
| **Input** | `#3ca16d` | `#121212` | Data sources, triggers |
| **Output** | `#60a5fa` | `#121212` | Results, destinations |
| **External** | `#52525b` | `#09090b` | Third-party systems |
| **Disabled** | `#27272a` | `#09090b` | Deprecated/optional |

### 2.4 Connection Specification

```svg
<!-- Standard connection -->
<line
  x1="160" y1="32"
  x2="200" y2="32"
  stroke="#52525b"
  stroke-width="1.5"
/>

<!-- Arrow marker -->
<defs>
  <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5"
    markerWidth="8" markerHeight="6" orient="auto-start-reverse">
    <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
  </marker>
</defs>
<line ... marker-end="url(#arrow)" />

<!-- Animated connection (scroll-triggered) -->
<motion.line
  x1="160" y1="32" x2="360" y2="32"
  stroke="#52525b" strokeWidth={1.5}
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
/>
```

| Property | Value |
|---|---|
| Stroke | `#52525b` (zinc-600) |
| Stroke width | 1.5px |
| Arrow | Triangle, 8×6px, zinc-600 fill |
| Highlighted | `#d4af37` (gold) for active/important paths |
| Animated | `pathLength` from 0→1, 800ms |
| Stagger | 100ms between connections |

### 2.5 Label Specification

| Property | Value |
|---|---|
| Font | Inter, 12px, weight 400 |
| Color | `#a1a1aa` (zinc-400) |
| Connection labels | 10px, italic, zinc-500 |
| Group labels | 11px, uppercase, tracking-[0.1em], zinc-500 |

### 2.6 Background

| Type | Background | When to Use |
|---|---|---|
| Transparent | None (page background shows) | Inline diagrams |
| Solid | `#09090b` (zinc-950) | Standalone diagram cards |
| Card | `bg-zinc-950 rounded-xl border border-white/[0.06]` | Featured diagrams |

### 2.7 Grid/Alignment

- Align nodes to a 8px grid
- Equal spacing between parallel nodes (24px minimum)
- Left-to-right flow preferred (top-to-bottom for hierarchies)
- Maximum 3 levels of depth before simplifying
- Center text within nodes vertically and horizontally

---

## 3. Screenshot Treatment

### 3.1 Standard Screenshot

```tsx
<div className="relative rounded-xl border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/40">
  <img
    src="/screenshots/dashboard.png"
    alt="Perionyx executive dashboard showing cash position, pending approvals, and workflow health"
    className="w-full h-auto"
    loading="lazy"
  />
</div>
<p className="text-xs text-zinc-500 text-center mt-4">
  The Perionyx executive dashboard
</p>
```

### 3.2 Screenshot Rules

| Rule | Specification |
|---|---|
| Frame | `rounded-xl border border-white/[0.06]` |
| Shadow | `shadow-2xl shadow-black/40` |
| Background | Match product background (`#040404`) |
| Max width | `max-w-5xl` (full page) or `max-w-3xl` (feature) |
| Aspect ratio | Preserve original, never crop to square |
| Resolution | 2x for retina (provide 1x and 2x in `srcSet`) |
| Caption | `text-xs text-zinc-500 text-center mt-4` |
| Alt text | Descriptive — what the screenshot SHOWS, not what it IS |
| Loading | `loading="lazy"` for below-fold screenshots |
| Format | PNG for UI, WebP for photos (if ever used) |

### 3.3 Screenshot Cropping

- Show meaningful sections, not full-page screenshots
- Crop to the relevant UI area + surrounding context
- If showing the full page, ensure readability at max-width
- Annotate with gold callout boxes/arrows if highlighting specific features
- Annotations: `border-2 border-[#d4af37] rounded-lg` with gold arrow pointing to feature

### 3.4 Device Frames

**Rule: No device frames.** No MacBook/iPhone mockups. No browser chrome. Just the dark-bordered screenshot on the dark background. Device frames add visual weight without informational value.

---

## 4. Code Examples

### 4.1 Code Block Treatment

```tsx
<div className="relative rounded-xl border border-white/[0.06] bg-zinc-950 overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
    <span className="text-xs text-zinc-500 font-mono">precision.ts</span>
    <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
      Copy
    </button>
  </div>

  {/* Code */}
  <pre className="p-4 overflow-x-auto">
    <code className="font-mono text-sm text-zinc-300 leading-relaxed">
      {code}
    </code>
  </pre>
</div>
```

### 4.2 Code Block Specification

| Property | Value |
|---|---|
| Background | `bg-zinc-950` (#09090b) |
| Border | `border border-white/[0.06] rounded-xl` |
| Font | JetBrains Mono, 14px (text-sm) |
| Line height | 1.6 (`leading-relaxed`) |
| Text color | `text-zinc-300` |
| Line numbers | `text-zinc-600`, right-aligned, 32px width |
| Header | File name (zinc-500) + copy button |
| Header border | `border-b border-white/[0.06]` |
| Padding | `p-4` |
| Max width | Full container width |
| Horizontal scroll | `overflow-x-auto` |
| Max height | None (show all code) or 400px with scroll |

### 4.3 Syntax Highlighting

Minimal color palette for code syntax:

| Token | Color | Usage |
|---|---|---|
| Keywords | `#d4af37` (gold) | `const`, `function`, `return`, `import` |
| Strings | `#3ca16d` (emerald) | String literals |
| Numbers | `#60a5fa` (blue) | Numeric literals |
| Comments | `#52525b` (zinc-600) | Code comments |
| Functions | `#d4d4d8` (zinc-300) | Function names |
| Types | `#a78bfa` (purple) | Type names, interfaces |
| Operators | `#d4d4d8` (zinc-300) | `=`, `+`, `=>` |
| Punctuation | `#71717a` (zinc-500) | `{}`, `()`, `;` |

### 4.4 Inline Code

```tsx
<span className="font-mono text-sm bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-300">
  Decimal(38, 12)
</span>
```

| Property | Value |
|---|---|
| Font | JetBrains Mono, 14px |
| Background | `bg-zinc-900/60` |
| Padding | `px-1.5 py-0.5` |
| Radius | `rounded` (4px) |
| Color | `text-zinc-300` |

### 4.5 Copy Button

```tsx
<button
  className="absolute top-3 right-3 text-xs text-zinc-500 hover:text-zinc-300
    transition-colors opacity-0 group-hover:opacity-100"
  aria-label="Copy code to clipboard"
>
  {copied ? "Copied!" : "Copy"}
</button>
```

| Property | Value |
|---|---|
| Visibility | Appears on code block hover |
| Feedback | "Copied!" text for 1500ms |
| Animation | Scale 1→1.1→1, 200ms spring |
| Position | Top-right of code block |

---

## 5. Abstract Patterns

### 5.1 Dot Grid

```svg
<pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
  <circle cx="12" cy="12" r="1" fill="#27272a" fill-opacity="0.5" />
</pattern>
<rect width="100%" height="100%" fill="url(#dotGrid)" />
```

| Property | Value |
|---|---|
| Dot size | 1px radius |
| Dot color | `#27272a` (zinc-800) at 50% opacity |
| Grid spacing | 24px |
| Usage | Section backgrounds, hero textures |

### 5.2 Line Pattern

```svg
<pattern id="linePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"
  patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="40" stroke="#27272a" stroke-opacity="0.3" stroke-width="1" />
</pattern>
```

| Property | Value |
|---|---|
| Line width | 1px |
| Line color | `#27272a` (zinc-800) at 30% opacity |
| Spacing | 40px |
| Angle | 45 degrees |
| Usage | Hero backgrounds (rare) |

### 5.3 Geometric Shapes

| Shape | Usage | Rules |
|---|---|---|
| Circle (outline) | Section decoration | `stroke zinc-800`, no fill, 200-400px |
| Hexagon (outline) | Technical themes | `stroke zinc-800`, no fill, 100-200px |
| Rectangle (outline) | Grid overlay | `stroke zinc-800`, no fill |
| Gradient mesh | Hero backgrounds | PEDL atmospheric gradient only |

### 5.4 Abstract Pattern Rules

1. **Always zinc palette.** Never gold, never colored.
2. **Always behind content.** Never overlapping text.
3. **Always subtle.** Max opacity: 50% of the zinc color.
4. **Always optional.** Remove if it adds visual noise.
5. **Maximum one pattern per section.** Never layer patterns.
6. **Never animated continuously.** At most, fade in on scroll.

---

## 6. Decision Tree: When to Use What

```
NEED A VISUAL?
│
├─ Explaining a PROCESS or WORKFLOW?
│  └─ YES → Workflow diagram (4-8 nodes, left-to-right)
│
├─ Explaining ARCHITECTURE?
│  └─ YES → Architecture diagram (5-15 nodes, layered)
│
├─ Showing DATA MOVEMENT?
│  └─ YES → Data flow diagram (3-8 nodes, animated paths)
│
├─ Showing PRODUCT UI?
│  └─ YES → Screenshot with dark frame
│
├─ Showing TECHNICAL IMPLEMENTATION?
│  └─ YES → Code example with syntax highlighting
│
├─ Presenting QUANTIFIED OUTCOMES?
│  └─ YES → Metric counters (animated count-up)
│
├─ Showing PARTNERS or CUSTOMERS?
│  └─ YES → Logo grid
│
├─ Quoting SOMEONE?
│  └─ YES → Quote card with attribution
│
├─ Needs DECORATION only?
│  └─ YES → Abstract pattern (dot grid, line pattern)
│
└─ None of the above?
   └─ USE TEXT + SPACING. Not every section needs a visual.
```

---

## 7. SVG Component Pattern

All diagrams should be implemented as React SVG components:

```tsx
// components/diagrams/workflow-diagram.tsx
"use client";

import { motion } from "framer-motion";

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  })
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: i * 0.1 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

export function WorkflowDiagram() {
  return (
    <motion.svg
      viewBox="0 0 800 200"
      className="w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g key={node.id} custom={i} variants={nodeVariants}>
          <rect x={node.x} y={node.y} width={160} height={64} rx={8}
            fill="#121212" stroke="#3f3f46" strokeWidth={1} />
          <text x={node.x + 80} y={node.y + 36}
            fontFamily="Inter" fontSize={13} fontWeight={500}
            fill="#d4d4d8" textAnchor="middle">
            {node.label}
          </text>
        </motion.g>
      ))}

      {/* Connections */}
      {connections.map((conn, i) => (
        <motion.line key={i} custom={i} variants={pathVariants}
          x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
          stroke="#52525b" strokeWidth={1.5}
          markerEnd="url(#arrow)" />
      ))}

      <defs>
        <marker id="arrow" viewBox="0 0 10 7" refX={10} refY={3.5}
          markerWidth={8} markerHeight={6} orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
        </marker>
      </defs>
    </motion.svg>
  );
}
```

---

## 8. Illustration Checklist

Before shipping any visual content:

- [ ] Does it inform? (If decorative only, remove it)
- [ ] Follows the diagram spec? (Correct node/connection/label styles)
- [ ] Uses zinc + gold palette only? (No other colors)
- [ ] Animated on scroll? (Not on page load)
- [ ] Reduced motion handled? (Shows final state immediately)
- [ ] Screenshots have dark frames and captions?
- [ ] Code examples use JetBrains Mono?
- [ ] Alt text provided for all images?
- [ ] SVG diagrams are accessible? (Title, desc, aria-label)
- [ ] No device frames (MacBook/iPhone mockups)?
- [ ] No stock photography?
- [ ] No hand-drawn or vector illustrations?
