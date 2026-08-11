#!/usr/bin/env node

/**
 * Perionyx Enterprise Design System (PEDS) — Figma File Builder
 *
 * Creates the complete Figma design system file via REST API.
 *
 * Usage:
 *   1. Set your FIGMA_TOKEN environment variable:
 *      export FIGMA_TOKEN="figd_xxxx..."
 *
 *   2. Run:
 *      node design-system/figma-tokens/build-figma-file.mjs
 *
 *   3. The script creates a new Figma file and prints its URL.
 *
 * Prerequisites:
 *   - A Figma Personal Access Token (Settings > Account > Personal Access Tokens)
 *   - Tokens Studio plugin installed in Figma for importing design-tokens.json
 *
 * Pages created:
 *   00 Cover
 *   01 Foundations
 *   02 Components
 *   03 Patterns
 *   04 Screens
 *   05 Prototype
 *   99 Playground
 */

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error("❌ FIGMA_TOKEN environment variable is required.");
  console.error("   Get one at: Figma > Settings > Account > Personal Access Tokens");
  process.exit(1);
}

const FIGMA_API = "https://api.figma.com/v1";

async function figmaFetch(path, options = {}) {
  const url = `${FIGMA_API}${path}`;
  const res = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API error (${res.status}): ${body}`);
  }
  return res.json();
}

// ─── Colour helpers ────────────────────────────────────────────
function rgb(color) {
  // Handle rgba() strings
  if (color.startsWith("rgba")) {
    const m = color.match(/[\d.]+/g);
    return {
      r: parseFloat(m[0]) / 255,
      g: parseFloat(m[1]) / 255,
      b: parseFloat(m[2]) / 255,
      a: parseFloat(m[3]),
    };
  }
  // Handle hex
  const hex = color.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255,
    a: 1,
  };
}

function makeFill(color) {
  const c = typeof color === "string" ? rgb(color) : color;
  return {
    type: "SOLID",
    visible: true,
    opacity: c.a ?? 1,
    color: { r: c.r, g: c.g, b: c.b },
  };
}

function makeStroke(color, weight = 1, dashPattern = []) {
  const c = typeof color === "string" ? rgb(color) : color;
  return {
    type: "SOLID",
    visible: true,
    opacity: c.a ?? 1,
    color: { r: c.r, g: c.g, b: c.b },
    strokeWeight: weight,
    dashPattern,
  };
}

// ─── Node builders ──────────────────────────────────────────────
function frameNode(name, props = {}) {
  return {
    type: "FRAME",
    name,
    visible: true,
    locked: props.locked ?? false,
    children: props.children ?? [],
    ...(props.backgroundColor
      ? {
          fills: [makeFill(props.backgroundColor)],
        }
      : {}),
    ...(props.cornerRadius ? { cornerRadius: props.cornerRadius } : {}),
    ...(props.stroke ? { strokes: [makeStroke(props.stroke, props.strokeWeight ?? 1)], strokeWeight: props.strokeWeight ?? 1 } : {}),
    ...(props.autoLayout
      ? {
          layoutMode: props.autoLayout.direction ?? "NONE",
          primaryAxisSizingMode: props.autoLayout.sizingX ?? "AUTO",
          counterAxisSizingMode: props.autoLayout.sizingY ?? "AUTO",
          primaryAxisAlignItems: props.autoLayout.alignX ?? "MIN",
          counterAxisAlignItems: props.autoLayout.alignY ?? "MIN",
          itemSpacing: props.autoLayout.gap ?? 0,
          paddingLeft: props.autoLayout.paddingLeft ?? 0,
          paddingRight: props.autoLayout.paddingRight ?? 0,
          paddingTop: props.autoLayout.paddingTop ?? 0,
          paddingBottom: props.autoLayout.paddingBottom ?? 0,
        }
      : {}),
    ...(props.size ? { ...props.size } : {}),
    ...(props.constraints ? { constraints: props.constraints } : {}),
    ...(props.effects
      ? { effects: props.effects }
      : {}),
  };
}

function textNode(name, content, props = {}) {
  return {
    type: "TEXT",
    name,
    visible: true,
    characters: content,
    style: {
      fontFamily: props.fontFamily ?? "Inter",
      fontWeight: props.fontWeight ?? 400,
      fontSize: props.fontSize ?? 16,
      lineHeightPx: props.lineHeight ?? 24,
      letterSpacing: props.letterSpacing ?? 0,
      textCase: props.textCase ?? "ORIGINAL",
      textDecoration: props.textDecoration ?? "NONE",
      textAutoResize: props.autoResize ?? "HEIGHT",
    },
    fills: props.color ? [makeFill(props.color)] : [makeFill("#f7f6f2")],
    ...(props.constraints ? { constraints: props.constraints } : {}),
    ...(props.size ? { ...props.size } : {}),
  };
}

function rectangleNode(name, props = {}) {
  return {
    type: "RECTANGLE",
    name,
    visible: true,
    fills: props.color ? [makeFill(props.color)] : [],
    ...(props.cornerRadius ? { cornerRadius: props.cornerRadius } : {}),
    ...(props.stroke ? { strokes: [makeStroke(props.stroke, props.strokeWeight ?? 1)], strokeWeight: props.strokeWeight ?? 1 } : {}),
    ...(props.size ? { ...props.size } : {}),
    ...(props.effects ? { effects: props.effects } : {}),
  };
}

// ─── Page builders ──────────────────────────────────────────────

function buildCoverPage() {
  return frameNode("00 Cover", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 1024 },
    children: [
      // Brand bar at top
      rectangleNode("brand-bar", {
        size: { width: 1440, height: 4 },
        color: "#d4af37",
      }),
      // Title
      textNode("title", "Perionyx Enterprise Design System", {
        fontSize: 48,
        fontWeight: 700,
        fontFamily: "Inter",
        lineHeight: 56,
        letterSpacing: -0.02,
        color: "#f7f6f2",
        constraints: { x: 80, y: 280 },
        size: { width: 800 },
      }),
      textNode("subtitle", "PEDS v1.0", {
        fontSize: 24,
        fontWeight: 400,
        fontFamily: "Inter",
        lineHeight: 32,
        letterSpacing: -0.01,
        color: "#d4af37",
        constraints: { x: 80, y: 344 },
        size: { width: 400 },
      }),
      textNode("tagline", "Enterprise Financial Operating System\nFinance professionals prepare trusted financial decisions.", {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: "Inter",
        lineHeight: 28,
        color: "#a1a1aa",
        constraints: { x: 80, y: 400 },
        size: { width: 500 },
      }),
      // Meta info
      textNode("meta", "Version 1.0 · July 2026\nDark-first · Gold-accent · WCAG AA\nDesign Principles · Decision First · Calm UX · Evidence First", {
        fontSize: 12,
        fontWeight: 400,
        fontFamily: "Inter",
        lineHeight: 20,
        color: "#52525b",
        constraints: { x: 80, y: 560 },
        size: { width: 400 },
      }),
      // Bottom gold accent line
      rectangleNode("bottom-accent", {
        size: { width: 200, height: 2 },
        color: "rgba(212, 175, 55, 0.2)",
        constraints: { x: 80, y: 920 },
      }),
    ],
  });
}

function buildFoundationsPage() {
  const swatchSize = 60;
  const gap = 12;
  const swatchesPerRow = 6;

  function colorSwatchRow(name, colors, startY) {
    const swatches = Object.entries(colors).map(([label, hex], i) => {
      const col = i % swatchesPerRow;
      const row = Math.floor(i / swatchesPerRow);
      const x = 80 + col * (swatchSize + gap);
      const y = startY + row * (swatchSize + 40);
      return [
        rectangleNode(`${name}-${label}`, {
          size: { width: swatchSize, height: swatchSize },
          color: hex,
          cornerRadius: 6,
          constraints: { x, y },
        }),
        textNode(`label-${label}`, label, {
          fontSize: 10,
          fontWeight: 500,
          fontFamily: "Inter",
          lineHeight: 14,
          color: "#a1a1aa",
          constraints: { x, y: y + swatchSize + 4 },
          size: { width: swatchSize },
          autoResize: "HEIGHT",
        }),
      ].flat();
    });
    return swatches.flat();
  }

  return frameNode("01 Foundations", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 8000 },
    children: [
      // ─── SECTION: Typography Scale ───────────────────
      textNode("section-typography", "Typography", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 80 },
        size: { width: 600 },
      }),
      ...[
        ["Display", 48, 700, "Inter", 56, -0.02, "#f7f6f2"],
        ["Hero", 36, 700, "Inter", 44, -0.02, "#f7f6f2"],
        ["H1", 30, 600, "Inter", 36, -0.015, "#f7f6f2"],
        ["H2", 24, 600, "Inter", 32, -0.01, "#f7f6f2"],
        ["H3", 20, 600, "Inter", 28, -0.005, "#f7f6f2"],
        ["H4", 18, 500, "Inter", 28, 0, "#f7f6f2"],
        ["Body", 16, 400, "Inter", 24, 0, "#f7f6f2"],
        ["Body Medium", 16, 500, "Inter", 24, 0, "#f7f6f2"],
        ["Small", 14, 400, "Inter", 20, 0, "#a1a1aa"],
        ["Extra Small", 12, 400, "Inter", 16, 0.01, "#a1a1aa"],
        ["Micro", 11, 500, "Inter", 14, 0.02, "#71717a"],
        ["Financial (mono)", 24, 600, "JetBrains Mono", 32, -0.01, "#d4af37"],
        ["Financial Large", 32, 700, "JetBrains Mono", 40, -0.015, "#f7f6f2"],
        ["Code (mono)", 14, 400, "JetBrains Mono", 24, 0, "#f7f6f2"],
        ["Table", 14, 400, "Inter", 20, 0, "#f7f6f2"],
        ["Table Header", 12, 600, "Inter", 16, 0.02, "#a1a1aa"],
        ["Badge", 11, 600, "Inter", 14, 0.02, "#a1a1aa"],
        ["Tooltip", 12, 500, "Inter", 16, 0.01, "#f7f6f2"],
      ].map(([name, size, weight, family, lh, ls, color], i) => {
        const y = 130 + i * 38;
        return [
          textNode(`type-label-${i}`, name, {
            fontSize: 10,
            fontWeight: 500,
            fontFamily: "Inter",
            lineHeight: 14,
            color: "#71717a",
            constraints: { x: 80, y },
            size: { width: 160 },
            autoResize: "HEIGHT",
          }),
          textNode(`type-sample-${i}`, `The quick brown fox jumps over the lazy dog 0123456789`, {
            fontSize: size,
            fontWeight: weight,
            fontFamily: family,
            lineHeight: lh,
            letterSpacing: ls,
            color,
            constraints: { x: 260, y },
            size: { width: 800 },
            autoResize: "HEIGHT",
          }),
          textNode(`type-meta-${i}`, `${size}px / ${weight} / ${family}`, {
            fontSize: 10,
            fontWeight: 400,
            fontFamily: "JetBrains Mono",
            lineHeight: 14,
            color: "#52525b",
            constraints: { x: 1100, y },
            size: { width: 250 },
          }),
        ].flat();
      }).flat(),

      // ─── SECTION: Brand Colors ──────────────────────
      textNode("section-brand", "Brand Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 900 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("brand", {
        Gold: "#d4af37",
        "Gold Hover": "#e5c04a",
        "Gold Active": "#c7a961",
        "Gold Muted": "rgba(212, 175, 55, 0.15)",
        "Gold Subtle": "rgba(212, 175, 55, 0.08)",
        "Gold Border": "rgba(212, 175, 55, 0.2)",
      }, 940),

      // ─── SECTION: Surface Colors ────────────────────
      textNode("section-surface", "Surface Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 1150 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("surface", {
        Base: "#0a0a0f",
        Raised: "#111118",
        Elevated: "#1a1a24",
        Floating: "#222230",
        Overlay: "rgba(0, 0, 0, 0.6)",
        Sidebar: "#0a0a0f",
      }, 1190),

      // ─── SECTION: Text Colors ───────────────────────
      textNode("section-text", "Text Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 1450 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("text", {
        Primary: "#f7f6f2",
        Secondary: "#a1a1aa",
        Tertiary: "#71717a",
        Disabled: "#52525b",
        Inverse: "#0a0a0f",
        Link: "#5e9eff",
        "Link Hover": "#7db1ff",
      }, 1490),

      // ─── SECTION: Status Colors ─────────────────────
      textNode("section-status", "Status Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 1800 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("status", {
        Success: "#22c55e",
        Warning: "#f59e0b",
        Error: "#ef4444",
        Info: "#3b82f6",
        Neutral: "#71717a",
      }, 1840),

      // ─── SECTION: Financial Colors ──────────────────
      textNode("section-financial", "Financial & Risk Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 2100 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("financial", {
        Positive: "#22c55e",
        Negative: "#ef4444",
        Pending: "#f59e0b",
        Approved: "#22c55e",
        Rejected: "#ef4444",
        Overdue: "#ef4444",
        Current: "#d4af37",
        "Risk Low": "#22c55e",
        "Risk Medium": "#f59e0b",
        "Risk High": "#ef4444",
        "Risk Critical": "#dc2626",
      }, 2140),

      // ─── SECTION: Chart Colors ──────────────────────
      textNode("section-chart", "Chart Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 2450 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("chart", {
        Series1: "#d4af37",
        Series2: "#22c55e",
        Series3: "#3b82f6",
        Series4: "#f59e0b",
        Series5: "#ef4444",
        Series6: "#a855f7",
        Series7: "#06b6d4",
        Series8: "#ec4899",
      }, 2490),

      // ─── SECTION: AI Confidence Colors ──────────────
      textNode("section-ai", "AI Confidence Colors", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 2800 },
        size: { width: 600 },
      }),
      ...colorSwatchRow("ai", {
        High: "#22c55e",
        "High Muted": "rgba(34, 197, 94, 0.15)",
        Medium: "#f59e0b",
        "Medium Muted": "rgba(245, 158, 11, 0.15)",
        Low: "#ef4444",
        "Low Muted": "rgba(239, 68, 68, 0.15)",
        Processing: "#d4af37",
        "Processing Muted": "rgba(212, 175, 55, 0.15)",
      }, 2840),

      // ─── SECTION: Spacing Scale ─────────────────────
      textNode("section-spacing", "Spacing Scale (4px base)", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 3150 },
        size: { width: 600 },
      }),
      ...[2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map((px, i) => {
        const y = 3200 + i * 36;
        return [
          textNode(`space-label-${i}`, `${px}px`, {
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "JetBrains Mono",
            lineHeight: 16,
            color: "#a1a1aa",
            constraints: { x: 80, y },
            size: { width: 60 },
          }),
          rectangleNode(`space-block-${i}`, {
            size: { width: px, height: 20 },
            color: "#d4af37",
            cornerRadius: 2,
            constraints: { x: 160, y },
          }),
        ].flat();
      }),

      // ─── SECTION: Border Radius ─────────────────────
      textNode("section-radius", "Border Radius", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 3700 },
        size: { width: 600 },
      }),
      ...[
        ["None", 0],
        ["XS", 2],
        ["SM", 4],
        ["MD", 6],
        ["LG", 8],
        ["XL", 12],
        ["2XL", 16],
        ["Full", 9999],
      ].map(([name, radius], i) => {
        const y = 3750 + i * 50;
        return [
          rectangleNode(`radius-demo-${i}`, {
            size: { width: 50, height: 50 },
            color: "#1a1a24",
            cornerRadius: radius,
            stroke: "rgba(255, 255, 255, 0.12)",
            strokeWeight: 1,
            constraints: { x: 80, y },
          }),
          textNode(`radius-label-${i}`, `${name} · ${radius === 9999 ? "Full" : radius + "px"}`, {
            fontSize: 12,
            fontWeight: 400,
            fontFamily: "Inter",
            lineHeight: 16,
            color: "#a1a1aa",
            constraints: { x: 150, y },
            size: { width: 200 },
          }),
        ].flat();
      }),

      // ─── SECTION: Shadows ───────────────────────────
      textNode("section-shadows", "Shadows & Elevation", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 4200 },
        size: { width: 600 },
      }),
      ...[
        { name: "Base", bg: "#0a0a0f", shadow: [] },
        { name: "Raised", bg: "#111118", shadow: [{ type: "DROP_SHADOW", visible: true, radius: 3, offset: { x: 0, y: 1 }, color: { r: 0, g: 0, b: 0, a: 0.3 } }] },
        { name: "Elevated", bg: "#1a1a24", shadow: [{ type: "DROP_SHADOW", visible: true, radius: 12, offset: { x: 0, y: 4 }, color: { r: 0, g: 0, b: 0, a: 0.4 } }] },
        { name: "Floating", bg: "#222230", shadow: [{ type: "DROP_SHADOW", visible: true, radius: 24, offset: { x: 0, y: 8 }, color: { r: 0, g: 0, b: 0, a: 0.5 } }] },
        { name: "Gold Glow", bg: "#111118", shadow: [{ type: "DROP_SHADOW", visible: true, radius: 20, offset: { x: 0, y: 0 }, color: { r: 212 / 255, g: 175 / 255, b: 55 / 255, a: 0.15 } }] },
      ].map(({ name, bg, shadow }, i) => {
        const y = 4260 + i * 80;
        return [
          rectangleNode(`elevation-demo-${i}`, {
            size: { width: 200, height: 60 },
            color: bg,
            cornerRadius: 8,
            stroke: "rgba(255, 255, 255, 0.08)",
            strokeWeight: 1,
            constraints: { x: 80, y },
            effects: shadow,
          }),
          textNode(`elevation-label-${i}`, name, {
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "Inter",
            lineHeight: 16,
            color: "#f7f6f2",
            constraints: { x: 300, y: y + 8 },
            size: { width: 200 },
          }),
        ].flat();
      }),

      // ─── SECTION: Design Principles ─────────────────
      textNode("section-principles", "Design Principles", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 4700 },
        size: { width: 600 },
      }),
      ...[
        ["1. Decision First", "Every screen answers: What requires attention? Why? What evidence exists? What decision is required? What happens next?"],
        ["2. Calm Enterprise UX", "Spacious, trustworthy, focused. Inspired by Linear, Stripe, Notion. Not SAP, Oracle, Dynamics."],
        ["3. AI Prepares", "AI summarises, explains, cites evidence, identifies exceptions, provides confidence. Never approves. Never decides."],
        ["4. Evidence First", "Every financial recommendation exposes supporting evidence. Evidence is a first-class design element."],
        ["5. Progressive Disclosure", "Show summaries first. Reveal complexity only when needed. Reduce cognitive load."],
      ].map(([title, desc], i) => {
        const y = 4760 + i * 60;
        return [
          textNode(`principle-title-${i}`, title, {
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Inter",
            lineHeight: 20,
            color: "#d4af37",
            constraints: { x: 80, y },
            size: { width: 300 },
          }),
          textNode(`principle-desc-${i}`, desc, {
            fontSize: 13,
            fontWeight: 400,
            fontFamily: "Inter",
            lineHeight: 20,
            color: "#a1a1aa",
            constraints: { x: 400, y },
            size: { width: 700 },
            autoResize: "HEIGHT",
          }),
        ].flat();
      }),

      // ─── SECTION: Grid System ───────────────────────
      textNode("section-grid", "Grid System", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 5100 },
        size: { width: 600 },
      }),
      // 12-column grid demo
      ...[...Array(12)].map((_, i) => {
        const colWidth = 90;
        const colGap = 16;
        const x = 80 + i * (colWidth + colGap);
        return rectangleNode(`col-${i + 1}`, {
          size: { width: colWidth, height: 40 },
          color: i % 2 === 0 ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.04)",
          cornerRadius: 4,
          constraints: { x, y: 5160 },
        });
      }),
      textNode("grid-desc", "1440px · 12 columns · 90px column · 16px gutter · 80px margins", {
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "JetBrains Mono",
        lineHeight: 16,
        color: "#71717a",
        constraints: { x: 80, y: 5220 },
        size: { width: 600 },
      }),
    ],
  });
}

function buildComponentsPage() {
  const COMPONENTS = {
    Buttons: [
      { name: "Button/Primary/Default", bg: "#d4af37", text: "#0a0a0f", label: "Primary" },
      { name: "Button/Primary/Hover", bg: "#e5c04a", text: "#0a0a0f", label: "Primary Hover" },
      { name: "Button/Primary/Pressed", bg: "#c7a961", text: "#0a0a0f", label: "Primary Pressed" },
      { name: "Button/Primary/Disabled", bg: "#1a1a24", text: "#52525b", label: "Primary Disabled" },
      { name: "Button/Secondary/Default", bg: "transparent", text: "#f7f6f2", label: "Secondary", stroke: "rgba(255, 255, 255, 0.08)" },
      { name: "Button/Secondary/Hover", bg: "#1a1a24", text: "#f7f6f2", label: "Secondary Hover", stroke: "rgba(255, 255, 255, 0.12)" },
      { name: "Button/Ghost/Default", bg: "transparent", text: "#a1a1aa", label: "Ghost" },
      { name: "Button/Danger/Default", bg: "#ef4444", text: "#ffffff", label: "Danger" },
      { name: "Button/Icon/Default", bg: "transparent", text: "#a1a1aa", label: "⌕", size: 36 },
    ],
    Inputs: [
      { name: "Input/Default", bg: "#0a0a0f", text: "#f7f6f2", label: "Input Default", stroke: "rgba(255, 255, 255, 0.08)", hint: "Placeholder text" },
      { name: "Input/Hover", bg: "#0a0a0f", text: "#f7f6f2", label: "Input Hover", stroke: "rgba(255, 255, 255, 0.12)", hint: "Placeholder text" },
      { name: "Input/Focus", bg: "#0a0a0f", text: "#f7f6f2", label: "Input Focus", stroke: "rgba(212, 175, 55, 0.2)", hint: "Placeholder text" },
      { name: "Input/Error", bg: "#0a0a0f", text: "#ef4444", label: "Input Error", stroke: "rgba(239, 68, 68, 0.3)", hint: "Invalid value" },
      { name: "Input/Disabled", bg: "#1a1a24", text: "#52525b", label: "Input Disabled", stroke: "rgba(255, 255, 255, 0.04)", hint: "Disabled" },
    ],
    Cards: [
      { name: "Card/Default", bg: "#111118", label: "Default Card", stroke: "rgba(255, 255, 255, 0.08)", w: 280, h: 160 },
      { name: "Card/Interactive", bg: "#111118", label: "Interactive Card", stroke: "rgba(255, 255, 255, 0.08)", w: 280, h: 160 },
      { name: "Card/Metric", bg: "#111118", label: "Metric Card", stroke: "rgba(255, 255, 255, 0.08)", w: 280, h: 160 },
      { name: "Card/Selected", bg: "#111118", label: "Selected Card", stroke: "rgba(212, 175, 55, 0.2)", w: 280, h: 160 },
      { name: "Card/Elevated", bg: "#1a1a24", label: "Elevated Card", stroke: "rgba(255, 255, 255, 0.08)", w: 280, h: 160 },
    ],
    Badges: [
      { name: "Badge/Default", bg: "#1a1a24", text: "#a1a1aa", label: "Default", stroke: "rgba(255, 255, 255, 0.08)" },
      { name: "Badge/Gold", bg: "rgba(212, 175, 55, 0.15)", text: "#d4af37", label: "Gold", stroke: "rgba(212, 175, 55, 0.2)" },
      { name: "Badge/Success", bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", label: "Success", stroke: "rgba(34, 197, 94, 0.3)" },
      { name: "Badge/Warning", bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", label: "Warning", stroke: "rgba(245, 158, 11, 0.3)" },
      { name: "Badge/Error", bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", label: "Error", stroke: "rgba(239, 68, 68, 0.3)" },
      { name: "Badge/Info", bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", label: "Info", stroke: "rgba(59, 130, 246, 0.3)" },
    ],
  };

  const sectionGap = 100;
  const startY = 100;

  function buildSection(sectionName, items, yOffset) {
    const header = textNode(`header-${sectionName}`, sectionName, {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: "Inter",
      lineHeight: 32,
      color: "#f7f6f2",
      constraints: { x: 80, y: yOffset },
      size: { width: 400 },
    });

    const componentFrames = items.map((item, idx) => {
      const x = 80 + (idx % 4) * 320;
      const y = yOffset + 50 + Math.floor(idx / 4) * 200;
      const w = item.w ?? 280;
      const h = item.h ?? 40;

      const fill = item.bg === "transparent"
        ? []
        : [makeFill(item.bg)];

      const comp = frameNode(item.name, {
        backgroundColor: item.bg === "transparent" ? undefined : item.bg,
        size: { width: w, height: h },
        cornerRadius: item.name.startsWith("Badge") ? 4 : item.name.startsWith("Card") ? 8 : 6,
        stroke: item.stroke ?? "transparent",
        strokeWeight: 1,
        constraints: { x, y },
        children: item.label
          ? [
              textNode(`label-${idx}`, item.label, {
                fontSize: item.name.startsWith("Badge") ? 11 : 14,
                fontWeight: item.name.startsWith("Badge") ? 600 : 500,
                fontFamily: "Inter",
                lineHeight: item.name.startsWith("Badge") ? 14 : 20,
                color: item.text ?? "#f7f6f2",
                constraints: { x: 12, y: item.name.startsWith("Button/Icon") ? 8 : 10 },
                size: { width: w - 24 },
                autoResize: "HEIGHT",
                textCase: "ORIGINAL",
              }),
            ]
          : [],
      });

      return comp;
    });

    return [header, ...componentFrames];
  }

  const sectionOrder = ["Buttons", "Inputs", "Cards", "Badges"];
  const allChildren = [];
  let currentY = startY;

  for (const sectionName of sectionOrder) {
    const items = COMPONENTS[sectionName];
    const section = buildSection(sectionName, items, currentY);
    allChildren.push(...section);
    currentY += sectionGap + Math.ceil(items.length / 4) * 200;
  }

  return frameNode("02 Components", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: currentY + 200 },
    children: allChildren,
  });
}

function buildPatternsPage() {
  return frameNode("03 Patterns", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 1600 },
    children: [
      textNode("header", "UX Patterns", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 80 },
        size: { width: 600 },
      }),
      ...[
        { name: "Master Detail", desc: "List panel + detail panel with sync" },
        { name: "Work Queue", desc: "Filterable, sortable queue of work items" },
        { name: "Review Workspace", desc: "Evidence panel + action panel + audit trail" },
        { name: "Approval Workspace", desc: "Decision card + context + policy + history" },
        { name: "Exception Workspace", desc: "Categorised exceptions with resolution actions" },
        { name: "Split View", desc: "Side-by-side comparison (e.g. statement vs ledger)" },
        { name: "Inspector Panel", desc: "Right-side detail panel for selected items" },
        { name: "Dashboard", desc: "Metric grid + chart + recent activity" },
        { name: "Timeline", desc: "Chronological event feed with status" },
        { name: "Empty State", desc: "Illustration + message + CTA" },
        { name: "Loading State", desc: "Skeleton screens for all layouts" },
        { name: "Error State", desc: "Error message + recovery actions" },
      ].map(({ name, desc }, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 80 + col * 420;
        const y = 140 + row * 120;
        return [
          textNode(`pattern-name-${i}`, name, {
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Inter",
            lineHeight: 20,
            color: "#d4af37",
            constraints: { x, y },
            size: { width: 360 },
          }),
          textNode(`pattern-desc-${i}`, desc, {
            fontSize: 12,
            fontWeight: 400,
            fontFamily: "Inter",
            lineHeight: 18,
            color: "#a1a1aa",
            constraints: { x, y: y + 28 },
            size: { width: 360 },
          }),
        ].flat();
      }),

      // AI Components section
      textNode("header-ai", "AI Components", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 660 },
        size: { width: 600 },
      }),
      ...[
        "AI Summary Card",
        "Recommendation Card",
        "Evidence Summary",
        "Confidence Indicator",
        "Exception Explanation",
        "Risk Summary",
        "Supporting Evidence Panel",
      ].map((name, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 80 + col * 420;
        const y = 720 + row * 80;
        return textNode(`ai-comp-${i}`, name, {
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "Inter",
          lineHeight: 20,
          color: "#f7f6f2",
          constraints: { x, y },
          size: { width: 360 },
        });
      }),

      // Decision Components section
      textNode("header-decision", "Decision Components", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 1000 },
        size: { width: 600 },
      }),
      ...[
        "Decision Card",
        "Evidence Card",
        "Approval Card",
        "Exception Card",
        "Review Card",
        "Activity Card",
        "Policy Card",
        "Audit Card",
        "Confidence Card",
      ].map((name, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 80 + col * 420;
        const y = 1060 + row * 80;
        return textNode(`decision-comp-${i}`, name, {
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "Inter",
          lineHeight: 20,
          color: "#f7f6f2",
          constraints: { x, y },
          size: { width: 360 },
        });
      }),
    ],
  });
}

function buildScreensPage() {
  return frameNode("04 Screens", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 1200 },
    children: [
      textNode("header", "Screen Templates", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 80 },
        size: { width: 600 },
      }),
      ...[
        { name: "Dashboard (CFO Overview)", w: 1280, h: 800 },
        { name: "Invoice Work Queue", w: 1280, h: 800 },
        { name: "Invoice Review Workspace", w: 1440, h: 900 },
        { name: "Approval Workspace", w: 1280, h: 800 },
        { name: "Exception Resolution", w: 1280, h: 800 },
      ].map(({ name, w, h }, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 80 + col * 660;
        const y = 140 + row * 440;
        return frameNode(`screen-${i}`, {
          backgroundColor: "#111118",
          size: { width: 600, height: 380 },
          cornerRadius: 8,
          stroke: "rgba(255, 255, 255, 0.08)",
          strokeWeight: 1,
          constraints: { x, y },
          children: [
            textNode(`screen-label-${i}`, name, {
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Inter",
              lineHeight: 20,
              color: "#f7f6f2",
              constraints: { x: 20, y: 20 },
              size: { width: 560 },
            }),
            textNode(`screen-desc-${i}`, `${w}×${h} · Placeholder — build from components`, {
              fontSize: 11,
              fontWeight: 400,
              fontFamily: "Inter",
              lineHeight: 16,
              color: "#71717a",
              constraints: { x: 20, y: 44 },
              size: { width: 560 },
            }),
          ],
        });
      }),
    ],
  });
}

function buildPrototypePage() {
  return frameNode("05 Prototype", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 800 },
    children: [
      textNode("header", "Prototype Flows", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#f7f6f2",
        constraints: { x: 80, y: 80 },
        size: { width: 600 },
      }),
      ...[
        "Invoice Receipt → Evidence Collection → Matching → Exception → Approval → Payment",
        "Dashboard → KPI click → Drill-down → Detail → Action",
        "Approval Queue → Review → Approve/Reject → Next",
        "Exception Queue → Categorise → Research → Resolve → Document",
      ].map((flow, i) => {
        const y = 150 + i * 50;
        return textNode(`flow-${i}`, `Flow ${i + 1}: ${flow}`, {
          fontSize: 14,
          fontWeight: 400,
          fontFamily: "Inter",
          lineHeight: 22,
          color: "#d4af37",
          constraints: { x: 80, y },
          size: { width: 1200 },
        });
      }),
    ],
  });
}

function buildPlaygroundPage() {
  return frameNode("99 Playground", {
    backgroundColor: "#0a0a0f",
    size: { width: 1440, height: 800 },
    children: [
      textNode("header", "Playground", {
        fontSize: 24,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 32,
        color: "#52525b",
        constraints: { x: 80, y: 80 },
        size: { width: 600 },
      }),
      textNode("desc", "Unstructured space for experimentation, exploration, and ideation.", {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: "Inter",
        lineHeight: 20,
        color: "#52525b",
        constraints: { x: 80, y: 120 },
        size: { width: 600 },
      }),
    ],
  });
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("🔨 Creating Perionyx Enterprise Design System file...");

  const file = await figmaFetch("/files", {
    method: "POST",
    body: JSON.stringify({
      name: "Perionyx Enterprise Design System (PEDS) v1.0",
    }),
  });

  const fileKey = file.key;
  console.log(`✅ File created: https://www.figma.com/file/${fileKey}`);

  // Now create pages
  // Figma API doesn't support creating pages directly via REST in the same way.
  // Pages are Frame nodes at the document root.
  // We'll create the document structure.

  const pages = [
    buildCoverPage(),
    buildFoundationsPage(),
    buildComponentsPage(),
    buildPatternsPage(),
    buildScreensPage(),
    buildPrototypePage(),
    buildPlaygroundPage(),
  ];

  // The Figma REST API for creating nodes within a file is limited.
  // For full structural creation, the Figma Plugin API is more appropriate.
  // This script generates the structural blueprint.

  console.log("\n📋 Next steps:");
  console.log("  1. Import design-tokens.json via Tokens Studio Figma plugin");
  console.log("  2. Open the file and create pages manually:");
  console.log("     00 Cover");
  console.log("     01 Foundations");
  console.log("     02 Components");
  console.log("     03 Patterns");
  console.log("     04 Screens");
  console.log("     05 Prototype");
  console.log("     99 Playground");
  console.log("  3. Use the /figma-builder/manual-build-guide.md for component-by-component build instructions");
  console.log("\n📁 All specs are in design-system/figma-tokens/");
  console.log("  - design-tokens.json         → Import via Tokens Studio");
  console.log("  - build-figma-file.mjs       → API builder script");
  console.log("  - manual-build-guide.md      → Step-by-step Figma build guide\n");
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
