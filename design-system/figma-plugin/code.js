// ─── Perionyx PEDS Builder ──────────────────────────────────────
// Creates the complete Figma design system including:
// - 9 pages with proper structure
// - Foundation styles (colors, typography, effects)
// - All 82+ documented PEDS components with variants
// - Dashboard, Work Queue, and Invoice Detail screens
// - Prototype navigation

// ─── Color Helpers ────────────────────────────────────────────
const hex = (h) => {
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  return { r, g, b };
};

const rgba = (r, g, b, a) => ({ r: r / 255, g: g / 255, b: b / 255, a });

const makeSolid = (color, opacity = 1) => ({
  type: 'SOLID', color, opacity,
});

const makeStroke = (color, weight = 1, opacity = 1) => ({
  type: 'SOLID', color, opacity, visible: true,
});

const EFFECT_SHADOW = (x, y, blur, color, spread = 0) => ({
  type: 'DROP_SHADOW', visible: true, radius: blur, offset: { x, y },
  color: { ...color, a: 1 }, spread,
});

// ─── Font Loading ──────────────────────────────────────────────
const FONTS = {};
async function loadFonts() {
  const families = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'SemiBold' },
    { family: 'Inter', style: 'Bold' },
    { family: 'JetBrains Mono', style: 'Regular' },
    { family: 'JetBrains Mono', style: 'Medium' },
    { family: 'JetBrains Mono', style: 'Bold' },
  ];
  for (const f of families) {
    await figma.loadFontAsync(f);
  }
}

// ─── Frame Builder ─────────────────────────────────────────────
function makeFrame(name, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(opts.w || 100, opts.h || 100);
  if (opts.x !== undefined) f.x = opts.x;
  if (opts.y !== undefined) f.y = opts.y;
  if (opts.fill) f.fills = [makeSolid(hex(opts.fill))];
  if (opts.stroke) f.strokes = [makeStroke(hex(opts.stroke))];
  if (opts.strokeWeight) f.strokeWeight = opts.strokeWeight;
  if (opts.radius !== undefined) f.cornerRadius = opts.radius;
  if (opts.radiusTL) f.topLeftRadius = opts.radiusTL;
  if (opts.radiusTR) f.topRightRadius = opts.radiusTR;
  if (opts.radiusBL) f.bottomLeftRadius = opts.radiusBL;
  if (opts.radiusBR) f.bottomRightRadius = opts.radiusBR;
  if (opts.autoLayout) {
    f.layoutMode = opts.autoLayout === 'H' ? 'HORIZONTAL' : 'VERTICAL';
    f.primaryAxisSizingMode = opts.sizingX || 'AUTO';
    f.counterAxisSizingMode = opts.sizingY || 'AUTO';
    f.primaryAxisAlignItems = opts.alignX || 'MIN';
    f.counterAxisAlignItems = opts.alignY || 'MIN';
    f.itemSpacing = opts.gap || 0;
    f.paddingLeft = opts.padL || 0;
    f.paddingRight = opts.padR || 0;
    f.paddingTop = opts.padT || 0;
    f.paddingBottom = opts.padB || 0;
  }
  if (opts.clipsContent) f.clipsContent = true;
  if (opts.opacity !== undefined) f.opacity = opts.opacity;
  if (opts.effects) f.effects = opts.effects;
  return f;
}

function makeText(text, opts = {}) {
  const t = figma.createText();
  t.characters = text;
  t.fontName = { family: opts.family || 'Inter', style: opts.style || 'Regular' };
  t.fontSize = opts.size || 16;
  if (opts.weight) t.fontWeight = opts.weight;
  t.lineHeight = opts.lineHeight ? { value: opts.lineHeight, unit: 'PIXELS' } : { value: 1.4, unit: 'AUTO' };
  if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
  t.fills = opts.color ? [makeSolid(hex(opts.color))] : [makeSolid({ r: 1, g: 1, b: 1 })];
  if (opts.resize) t.resize(opts.resize.w, opts.resize.h || 100);
  if (opts.x !== undefined) t.x = opts.x;
  if (opts.y !== undefined) t.y = opts.y;
  if (opts.autoResize) t.textAutoResize = opts.autoResize;
  if (opts.textCase) t.textCase = opts.textCase;
  if (opts.textDecoration) t.textDecoration = opts.textDecoration;
  return t;
}

function makeRect(opts = {}) {
  const r = figma.createRectangle();
  r.name = opts.name || 'rect';
  r.resize(opts.w || 100, opts.h || 100);
  if (opts.fill) r.fills = [makeSolid(hex(opts.fill))];
  if (opts.stroke) r.strokes = [makeStroke(hex(opts.stroke))];
  if (opts.strokeWeight) r.strokeWeight = opts.strokeWeight;
  if (opts.radius !== undefined) r.cornerRadius = opts.radius;
  if (opts.x !== undefined) r.x = opts.x;
  if (opts.y !== undefined) r.y = opts.y;
  if (opts.effects) r.effects = opts.effects;
  return r;
}

// ─── Color & Typography Definitions ────────────────────────────

const COLORS = {
  brand: { Gold: '#d4af37', 'Gold Hover': '#e5c04a', 'Gold Active': '#c7a961' },
  surface: { Base: '#0a0a0f', Raised: '#111118', Elevated: '#1a1a24', Floating: '#222230', Overlay: '#000000' },
  text: { Primary: '#f7f6f2', Secondary: '#a1a1aa', Tertiary: '#71717a', Disabled: '#52525b', Inverse: '#0a0a0f', Link: '#5e9eff' },
  status: { Success: '#22c55e', Warning: '#f59e0b', Error: '#ef4444', Info: '#3b82f6' },
  financial: { Positive: '#22c55e', Negative: '#ef4444', Pending: '#f59e0b', Approved: '#22c55e', Overdue: '#ef4444', Current: '#d4af37' },
  risk: { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444', Critical: '#dc2626' },
  ai: { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444', Processing: '#d4af37' },
  chart: { Series1: '#d4af37', Series2: '#22c55e', Series3: '#3b82f6', Series4: '#f59e0b', Series5: '#ef4444' },
};

const TYPOGRAPHY = [
  { name: 'Display', size: 48, weight: 700, family: 'Inter', lh: 56, ls: -2, color: '#f7f6f2' },
  { name: 'Hero', size: 36, weight: 700, family: 'Inter', lh: 44, ls: -2, color: '#f7f6f2' },
  { name: 'H1', size: 30, weight: 600, family: 'Inter', lh: 36, ls: -1.5, color: '#f7f6f2' },
  { name: 'H2', size: 24, weight: 600, family: 'Inter', lh: 32, ls: -1, color: '#f7f6f2' },
  { name: 'H3', size: 20, weight: 600, family: 'Inter', lh: 28, ls: -0.5, color: '#f7f6f2' },
  { name: 'H4', size: 18, weight: 500, family: 'Inter', lh: 28, ls: 0, color: '#f7f6f2' },
  { name: 'Body', size: 16, weight: 400, family: 'Inter', lh: 24, ls: 0, color: '#f7f6f2' },
  { name: 'Body Medium', size: 16, weight: 500, family: 'Inter', lh: 24, ls: 0, color: '#f7f6f2' },
  { name: 'Small', size: 14, weight: 400, family: 'Inter', lh: 20, ls: 0, color: '#a1a1aa' },
  { name: 'Extra Small', size: 12, weight: 400, family: 'Inter', lh: 16, ls: 1, color: '#a1a1aa' },
  { name: 'Micro', size: 11, weight: 500, family: 'Inter', lh: 14, ls: 2, color: '#71717a' },
  { name: 'Financial', size: 24, weight: 600, family: 'JetBrains Mono', lh: 32, ls: -1, color: '#d4af37' },
  { name: 'Financial Large', size: 32, weight: 700, family: 'JetBrains Mono', lh: 40, ls: -1.5, color: '#f7f6f2' },
  { name: 'Financial Small', size: 14, weight: 500, family: 'JetBrains Mono', lh: 20, ls: 0, color: '#f7f6f2' },
  { name: 'Code', size: 14, weight: 400, family: 'JetBrains Mono', lh: 24, ls: 0, color: '#f7f6f2' },
  { name: 'Table', size: 14, weight: 400, family: 'Inter', lh: 20, ls: 0, color: '#f7f6f2' },
  { name: 'Table Header', size: 12, weight: 600, family: 'Inter', lh: 16, ls: 2, color: '#a1a1aa' },
  { name: 'Badge', size: 11, weight: 600, family: 'Inter', lh: 14, ls: 2, color: '#a1a1aa' },
];

// ─── Style Creation ────────────────────────────────────────────
function createPaintStyles() {
  const styles = [];
  for (const [category, colors] of Object.entries(COLORS)) {
    for (const [name, color] of Object.entries(colors)) {
      const style = figma.createPaintStyle();
      style.name = `${category}/${name}`;
      const paints = [makeSolid(hex(color))];
      if (name === 'Overlay') {
        paints[0].opacity = 0.6;
      }
      style.paints = paints;
      styles.push(style);
    }
  }
  return styles;
}

function createTextStyles() {
  const styles = [];
  for (const t of TYPOGRAPHY) {
    const style = figma.createTextStyle();
    style.name = t.name;
    style.fontName = { family: t.family, style: ['Regular', 'Medium', 'SemiBold', 'Bold'][Math.round(t.weight / 100) - 4] || 'Regular' };
    style.fontSize = t.size;
    style.lineHeight = { value: t.lh, unit: 'PIXELS' };
    style.letterSpacing = { value: t.ls / 100, unit: 'PERCENT' };
    styles.push(style);
  }
  return styles;
}

function createEffectStyles() {
  const s1 = figma.createEffectStyle();
  s1.name = 'Shadow/Soft';
  s1.effects = [EFFECT_SHADOW(0, 2, 8, { r: 0, g: 0, b: 0, a: 0.3 }, 0)];

  const s2 = figma.createEffectStyle();
  s2.name = 'Shadow/Medium';
  s2.effects = [EFFECT_SHADOW(0, 4, 16, { r: 0, g: 0, b: 0, a: 0.4 }, 0)];

  const s3 = figma.createEffectStyle();
  s3.name = 'Shadow/Large';
  s3.effects = [EFFECT_SHADOW(0, 8, 32, { r: 0, g: 0, b: 0, a: 0.5 }, 0)];

  return [s1, s2, s3];
}

// ─── Page Builder ──────────────────────────────────────────────
function createPage(name) {
  let page = figma.createPage();
  page.name = name;
  return page;
}

// ─── Foundations Page ─────────────────────────────────────────
async function buildFoundationsPage() {
  const page = createPage('01 Foundations');
  figma.currentPage = page;

  const bg = makeFrame('Foundations Canvas', { w: 1440, h: 6000, fill: '#0a0a0f' });

  let y = 60;

  // Typography section
  const typoTitle = makeText('Typography', { size: 30, weight: 600, family: 'Inter', color: '#f7f6f2' });
  typoTitle.x = 80; typoTitle.y = y;
  bg.appendChild(typoTitle);
  y += 60;

  for (const t of TYPOGRAPHY) {
    const label = makeText(t.name, { size: 10, weight: 500, family: 'Inter', color: '#71717a' });
    label.x = 80; label.y = y;
    bg.appendChild(label);

    const sample = makeText('The quick brown fox jumps 0123456789', {
      size: t.size, weight: t.weight, family: t.family, color: t.color
    });
    sample.x = 240; sample.y = y;
    sample.lineHeight = { value: t.lh, unit: 'PIXELS' };
    bg.appendChild(sample);

    const meta = makeText(`${t.size}px / ${t.weight} / ${t.family}`, {
      size: 10, weight: 400, family: 'JetBrains Mono', color: '#52525b'
    });
    meta.x = 1000; meta.y = y;
    bg.appendChild(meta);

    y += 36;
  }
  y += 40;

  // Color Swatches
  const colorTitle = makeText('Color System', { size: 30, weight: 600, family: 'Inter', color: '#f7f6f2' });
  colorTitle.x = 80; colorTitle.y = y;
  bg.appendChild(colorTitle);
  y += 60;

  for (const [category, colors] of Object.entries(COLORS)) {
    const catLabel = makeText(category, { size: 16, weight: 600, family: 'Inter', color: '#d4af37' });
    catLabel.x = 80; catLabel.y = y;
    bg.appendChild(catLabel);
    y += 28;

    let col = 0;
    const swatchSize = 60;
    const gap = 12;
    for (const [name, colorHex] of Object.entries(colors)) {
      const swatch = makeRect({ w: swatchSize, h: swatchSize, fill: colorHex, radius: 6 });
      swatch.x = 80 + col * (swatchSize + gap);
      swatch.y = y;
      if (category === 'surface' && name === 'Overlay') {
        swatch.opacity = 0.6;
      }
      bg.appendChild(swatch);

      const sLabel = makeText(name, { size: 9, weight: 500, family: 'Inter', color: '#a1a1aa' });
      sLabel.x = 80 + col * (swatchSize + gap);
      sLabel.y = y + swatchSize + 4;
      bg.appendChild(sLabel);

      col++;
      if (col >= 6) { col = 0; y += swatchSize + 36; }
    }
    if (col > 0) y += swatchSize + 36;
    y += 12;
  }

  // Spacing section
  y += 20;
  const spaceTitle = makeText('Spacing Scale (4px base)', { size: 30, weight: 600, family: 'Inter', color: '#f7f6f2' });
  spaceTitle.x = 80; spaceTitle.y = y;
  bg.appendChild(spaceTitle);
  y += 60;

  const spacingValues = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
  for (const px of spacingValues) {
    const sLabel = makeText(`${px}px`, { size: 11, weight: 500, family: 'JetBrains Mono', color: '#a1a1aa' });
    sLabel.x = 80; sLabel.y = y;
    bg.appendChild(sLabel);
    const block = makeRect({ w: px, h: 20, fill: '#d4af37', radius: 2 });
    block.x = 160; block.y = y;
    bg.appendChild(block);
    y += 28;
  }

  // Create actual Figma styles
  createPaintStyles();
  createTextStyles();
  createEffectStyles();

  return page;
}

// ─── Cover Page ────────────────────────────────────────────────
function buildCoverPage() {
  const page = createPage('00 Cover');
  figma.currentPage = page;

  const bg = makeFrame('Cover', { w: 1440, h: 1024, fill: '#0a0a0f' });

  const bar = makeRect({ w: 1440, h: 4, fill: '#d4af37' });
  bar.x = 0; bar.y = 0;
  bg.appendChild(bar);

  const title = makeText('Perionyx Enterprise Design System', {
    size: 48, weight: 700, family: 'Inter', color: '#f7f6f2'
  });
  title.x = 80; title.y = 280;
  bg.appendChild(title);

  const sub = makeText('PEDS v1.0', { size: 24, weight: 400, family: 'Inter', color: '#d4af37' });
  sub.x = 80; sub.y = 348;
  bg.appendChild(sub);

  const tagline = makeText('Enterprise Financial Operating System\nFinance professionals prepare trusted financial decisions.', {
    size: 16, weight: 400, family: 'Inter', color: '#a1a1aa'
  });
  tagline.x = 80; tagline.y = 400;
  bg.appendChild(tagline);

  const meta = makeText('Version 1.0 · July 2026\nDark-first · Gold-accent · WCAG AA\nDecision First · Calm UX · Evidence First', {
    size: 12, weight: 400, family: 'Inter', color: '#52525b'
  });
  meta.x = 80; meta.y = 520;
  bg.appendChild(meta);

  const bottomAccent = makeRect({ w: 200, h: 2, fill: '#d4af37', opacity: 0.2 });
  bottomAccent.x = 80; bottomAccent.y = 920;
  bg.appendChild(bottomAccent);

  return page;
}

// ─── Component Builders ────────────────────────────────────────

function makeButtonComponent(name, bgColor, textColor, label, hasBorder = false) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.resize(120, 40);
  comp.fills = bgColor === 'transparent' ? [] : [makeSolid(hex(bgColor))];
  if (hasBorder) {
    comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.12)];
    comp.strokeWeight = 1;
  }
  comp.cornerRadius = 6;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 16;
  comp.paddingRight = 16;
  comp.itemSpacing = 8;

  const text = makeText(label, { size: 14, weight: 500, family: 'Inter', color: textColor });
  comp.appendChild(text);

  return comp;
}

function makeBadgeComponent(name, bgColor, textColor, label) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.resize(80, 22);
  comp.fills = [makeSolid(hex(bgColor))];
  comp.strokes = [makeStroke(hex(bgColor))];
  comp.strokeWeight = 1;
  comp.cornerRadius = 4;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 8;
  comp.paddingRight = 8;
  comp.paddingTop = 2;
  comp.paddingBottom = 2;

  const text = makeText(label, { size: 11, weight: 600, family: 'Inter', color: textColor });
  text.textCase = 'UPPER';
  text.letterSpacing = { value: 2, unit: 'PERCENT' };
  comp.appendChild(text);

  return comp;
}

function makeCardComponent(name, w = 280, h = 160) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.resize(w, h);
  comp.fills = [makeSolid(hex('#111118'))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  comp.strokeWeight = 1;
  comp.cornerRadius = 8;
  comp.effects = [{ type: 'DROP_SHADOW', visible: true, radius: 3, offset: { x: 0, y: 1 }, color: { r: 0, g: 0, b: 0, a: 0.3 } }];
  return comp;
}

function makeCheckboxComponent(name, checked = false, disabled = false) {
  const comp = figma.createComponent();
  comp.name = `Checkbox/${name}`;
  comp.resize(16, 16);
  const fill = disabled ? '#1a1a24' : (checked ? '#d4af37' : 'transparent');
  const borderC = disabled ? '#52525b' : (checked ? '#d4af37' : '#71717a');
  comp.fills = checked ? [makeSolid(hex(fill))] : [];
  comp.strokes = [makeStroke(hex(borderC), 1.5, 1)];
  comp.strokeWeight = 1.5;
  comp.cornerRadius = 3;
  if (checked && !disabled) {
    const check = makeText('✓', { size: 10, weight: 700, family: 'Inter', color: '#0a0a0f' });
    check.x = 2; check.y = 1;
    comp.appendChild(check);
  }
  return comp;
}

function makeRadioComponent(name, selected = false, disabled = false) {
  const comp = figma.createComponent();
  comp.name = `Radio/${name}`;
  comp.resize(16, 16);
  const fill = disabled ? '#52525b' : (selected ? '#d4af37' : 'transparent');
  const borderC = disabled ? '#52525b' : (selected ? '#d4af37' : '#71717a');
  comp.fills = [makeSolid(hex(fill))];
  comp.strokes = [makeStroke(hex(borderC), 1.5, 1)];
  comp.strokeWeight = 1.5;
  comp.cornerRadius = 999;
  if (selected && !disabled) {
    const dot = makeRect({ w: 6, h: 6, fill: '#0a0a0f', radius: 999 });
    dot.x = 5; dot.y = 5;
    comp.appendChild(dot);
  }
  return comp;
}

function makeToggleComponent(name, on = false) {
  const comp = figma.createComponent();
  comp.name = `Toggle/${name}`;
  comp.resize(32, 20);
  comp.cornerRadius = 999;
  const bg = on ? '#d4af37' : '#1a1a24';
  comp.fills = [makeSolid(hex(bg))];
  const knob = makeRect({ w: 16, h: 16, fill: on ? '#0a0a0f' : '#71717a', radius: 999 });
  knob.x = on ? 14 : 2; knob.y = 2;
  comp.appendChild(knob);
  return comp;
}

function makeTableHeaderCell(name, label, sortable = false) {
  const comp = figma.createComponent();
  comp.name = `Table/Header Cell/${name}`;
  comp.resize(120, 40);
  comp.fills = [makeSolid(hex('#0d0d14'))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  comp.strokeWeight = 1;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 12;
  comp.itemSpacing = 6;
  const text = makeText(label, { size: 11, weight: 600, family: 'Inter', color: '#71717a' });
  text.textCase = 'UPPER';
  comp.appendChild(text);
  if (sortable) {
    const arrow = makeText('▲', { size: 8, weight: 400, family: 'Inter', color: '#d4af37' });
    comp.appendChild(arrow);
  }
  return comp;
}

function makeTableCell(name, value, type = 'text') {
  const comp = figma.createComponent();
  comp.name = `Table/Cell/${name}`;
  comp.resize(120, 48);
  comp.fills = [];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.03)];
  comp.strokeWeight = 1;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 12;
  const family = type === 'financial' ? 'JetBrains Mono' : 'Inter';
  const size = type === 'financial' ? 13 : 12;
  const weight = type === 'financial' ? 500 : 400;
  const text = makeText(value, { size, weight, family, color: '#f7f6f2' });
  comp.appendChild(text);
  return comp;
}

function makeTableRow(name, cells, selected = false) {
  const comp = figma.createComponent();
  comp.name = `Table/Row/${name}`;
  const totalW = cells.length * 120;
  comp.resize(totalW, 48);
  comp.fills = [makeSolid(hex(selected ? '#1a1a24' : (cells.length % 2 === 0 ? '#111118' : '#0d0d14')))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.03)];
  comp.strokeWeight = 1;
  comp.layoutMode = 'HORIZONTAL';
  cells.forEach((cell, i) => {
    const wrapper = makeFrame(`cell-${i}`, { w: 120, h: 48 });
    wrapper.fills = [];
    wrapper.layoutMode = 'HORIZONTAL';
    wrapper.primaryAxisAlignItems = 'CENTER';
    wrapper.counterAxisAlignItems = 'CENTER';
    wrapper.paddingLeft = 12;
    const text = makeText(cell.value, { size: cell.type === 'financial' ? 13 : 12, weight: cell.type === 'financial' ? 500 : 400, family: cell.type === 'financial' ? 'JetBrains Mono' : 'Inter', color: cell.color || '#f7f6f2' });
    wrapper.appendChild(text);
    comp.appendChild(wrapper);
  });
  return comp;
}

function makePillTabComponent(name, label, active = false) {
  const comp = figma.createComponent();
  comp.name = `Tabs/Pills/${name}`;
  comp.resize(80, 32);
  comp.cornerRadius = 999;
  comp.fills = active ? [makeSolid(hex('#d4af37'))] : [];
  if (!active) {
    comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
    comp.strokeWeight = 1;
  }
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 16;
  comp.paddingRight = 16;
  const text = makeText(label, { size: 12, weight: 500, family: 'Inter', color: active ? '#0a0a0f' : '#a1a1aa' });
  comp.appendChild(text);
  return comp;
}

function makeSegmentedTabComponent(name, label, active = false, isFirst = false, isLast = false) {
  const comp = figma.createComponent();
  comp.name = `Tabs/Segmented/${name}`;
  comp.resize(100, 32);
  comp.fills = active ? [makeSolid(hex('#1a1a24'))] : [makeSolid(hex('#0a0a0f'))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  comp.strokeWeight = 1;
  comp.topLeftRadius = isFirst ? 6 : 0;
  comp.bottomLeftRadius = isFirst ? 6 : 0;
  comp.topRightRadius = isLast ? 6 : 0;
  comp.bottomRightRadius = isLast ? 6 : 0;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  const text = makeText(label, { size: 12, weight: 500, family: 'Inter', color: active ? '#f7f6f2' : '#71717a' });
  comp.appendChild(text);
  return comp;
}

function makePaginationComponent(name, currentPage = 1, totalPages = 10) {
  const comp = figma.createComponent();
  comp.name = 'Pagination';
  comp.resize(400, 32);
  comp.fills = [];
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.itemSpacing = 4;
  // Prev
  const prev = makeFrame('prev', { w: 32, h: 32, fill: '#111118', radius: 6 });
  prev.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  prev.strokeWeight = 1;
  prev.layoutMode = 'HORIZONTAL';
  prev.primaryAxisAlignItems = 'CENTER';
  prev.counterAxisAlignItems = 'CENTER';
  prev.appendChild(makeText('‹', { size: 14, weight: 400, family: 'Inter', color: '#71717a' }));
  comp.appendChild(prev);
  // Pages
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    const page = makeFrame(`page-${i}`, { w: 32, h: 32, fill: i === currentPage ? '#d4af37' : '#111118', radius: 6 });
    if (i !== currentPage) {
      page.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
      page.strokeWeight = 1;
    }
    page.layoutMode = 'HORIZONTAL';
    page.primaryAxisAlignItems = 'CENTER';
    page.counterAxisAlignItems = 'CENTER';
    page.appendChild(makeText(String(i), { size: 12, weight: i === currentPage ? 600 : 400, family: 'Inter', color: i === currentPage ? '#0a0a0f' : '#a1a1aa' }));
    comp.appendChild(page);
  }
  // Next
  const next = makeFrame('next', { w: 32, h: 32, fill: '#111118', radius: 6 });
  next.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  next.strokeWeight = 1;
  next.layoutMode = 'HORIZONTAL';
  next.primaryAxisAlignItems = 'CENTER';
  next.counterAxisAlignItems = 'CENTER';
  next.appendChild(makeText('›', { size: 14, weight: 400, family: 'Inter', color: '#71717a' }));
  comp.appendChild(next);
  // Page info
  comp.appendChild(makeText(` 1-25 of 342`, { size: 11, weight: 400, family: 'Inter', color: '#52525b' }));
  return comp;
}

function makeDropdownComponent(name, placeholder = 'Select...') {
  const comp = figma.createComponent();
  comp.name = `Dropdown/Select/${name}`;
  comp.resize(200, 40);
  comp.fills = [makeSolid(hex('#0a0a0f'))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  comp.strokeWeight = 1;
  comp.cornerRadius = 6;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'SPACE_BETWEEN';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 12;
  comp.paddingRight = 12;
  const text = makeText(placeholder, { size: 14, weight: 400, family: 'Inter', color: '#52525b' });
  comp.appendChild(text);
  const chevron = makeText('▼', { size: 10, weight: 400, family: 'Inter', color: '#71717a' });
  comp.appendChild(chevron);
  return comp;
}

function makeDropdownMenuComponent(name, items = ['Option 1', 'Option 2', 'Option 3']) {
  const comp = figma.createComponent();
  comp.name = `Dropdown/Menu/${name}`;
  comp.resize(200, items.length * 36 + 8);
  comp.fills = [makeSolid(hex('#222230'))];
  comp.strokes = [makeStroke(hex('#ffffff'), 1, 0.12)];
  comp.strokeWeight = 1;
  comp.cornerRadius = 8;
  comp.layoutMode = 'VERTICAL';
  comp.paddingTop = 4;
  comp.paddingBottom = 4;
  comp.itemSpacing = 0;
  items.forEach((item, i) => {
    const row = makeFrame(`item-${i}`, { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 192, h: 36 });
    row.paddingLeft = 12;
    row.cornerRadius = 4;
    const text = makeText(item, { size: 14, weight: 400, family: 'Inter', color: i === 0 ? '#d4af37' : '#f7f6f2' });
    row.appendChild(text);
    if (i === 0) {
      row.fills = [makeSolid(hex('rgba(212, 175, 55, 0.08)'))];
    }
    comp.appendChild(row);
  });
  return comp;
}

function makeTabComponent(name, label, active = false) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.resize(80, 40);
  comp.fills = [];
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.paddingLeft = 12;
  comp.paddingRight = 12;
  comp.itemSpacing = 6;

  const text = makeText(label, { size: 14, weight: 500, family: 'Inter', color: active ? '#f7f6f2' : '#a1a1aa' });
  comp.appendChild(text);

  if (active) {
    const indicator = makeRect({ w: comp.width, h: 2, fill: '#d4af37' });
    indicator.y = comp.height - 2;
    comp.appendChild(indicator);
  }

  return comp;
}

function buildComponents() {
  const page = createPage('02 Components');
  figma.currentPage = page;

  const bg = makeFrame('Components Canvas', { w: 1440, h: 8000, fill: '#0a0a0f' });

  const sections = [
    { name: 'Buttons', y: 60 },
    { name: 'Inputs', y: 360 },
    { name: 'Cards', y: 680 },
    { name: 'Badges & Chips', y: 1000 },
    { name: 'Tabs', y: 1240 },
    { name: 'Data Display', y: 1480 },
    { name: 'AI Components', y: 1860 },
    { name: 'Financial Components', y: 2200 },
    { name: 'Skeleton / Loading', y: 2540 },
    { name: 'Overlays', y: 2780 },
    { name: 'Navigation', y: 3020 },
  ];

  // ─── BUTTONS ────────────────────────────────────────────
  const buttonDefs = [
    { name: 'Primary/Default', bg: '#d4af37', text: '#0a0a0f', label: 'Primary', border: false },
    { name: 'Primary/Hover', bg: '#e5c04a', text: '#0a0a0f', label: 'Primary', border: false },
    { name: 'Primary/Pressed', bg: '#c7a961', text: '#0a0a0f', label: 'Primary', border: false },
    { name: 'Primary/Disabled', bg: '#1a1a24', text: '#52525b', label: 'Primary', border: false },
    { name: 'Secondary/Default', bg: 'transparent', text: '#f7f6f2', label: 'Secondary', border: true },
    { name: 'Secondary/Hover', bg: '#1a1a24', text: '#f7f6f2', label: 'Secondary', border: true },
    { name: 'Danger/Default', bg: '#ef4444', text: '#ffffff', label: 'Danger', border: false },
    { name: 'Danger/Hover', bg: '#dc2626', text: '#ffffff', label: 'Danger', border: false },
    { name: 'Ghost/Default', bg: 'transparent', text: '#a1a1aa', label: 'Ghost', border: false },
    { name: 'Ghost/Hover', bg: '#1a1a24', text: '#f7f6f2', label: 'Ghost', border: false },
  ];

  let y = 100;
  const secTitle = makeText('Buttons', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  secTitle.x = 80; secTitle.y = y - 40;
  bg.appendChild(secTitle);

  buttonDefs.forEach((d, i) => {
    const x = 80 + (i % 5) * 140;
    const row = Math.floor(i / 5);
    const comp = makeButtonComponent(`Button/${d.name}`, d.bg, d.text, d.label, d.border);
    comp.x = x; comp.y = y + row * 60;
    bg.appendChild(comp);
  });
  y += 160;

  // ─── INPUTS ─────────────────────────────────────────────
  const inputTitle = makeText('Inputs', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  inputTitle.x = 80; inputTitle.y = y;
  bg.appendChild(inputTitle);
  y += 40;

  const inputDefs = [
    { name: 'Default', bg: '#0a0a0f', text: '#f7f6f2', borderC: '#ffffff', borderO: 0.08 },
    { name: 'Hover', bg: '#0a0a0f', text: '#f7f6f2', borderC: '#ffffff', borderO: 0.12 },
    { name: 'Focus', bg: '#0a0a0f', text: '#f7f6f2', borderC: '#d4af37', borderO: 0.2 },
    { name: 'Error', bg: '#0a0a0f', text: '#ef4444', borderC: '#ef4444', borderO: 0.3 },
    { name: 'Disabled', bg: '#1a1a24', text: '#52525b', borderC: '#ffffff', borderO: 0.04 },
  ];

  inputDefs.forEach((d, i) => {
    const x = 80 + i * 220;
    const comp = figma.createComponent();
    comp.name = `Input/${d.name}`;
    comp.resize(200, 40);
    comp.fills = [makeSolid(hex(d.bg))];
    comp.strokes = [makeStroke(hex(d.borderC), 1, d.borderO)];
    comp.strokeWeight = 1;
    comp.cornerRadius = 6;
    comp.layoutMode = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.paddingLeft = 12;
    comp.paddingRight = 12;

    const placeholder = makeText('Placeholder', { size: 16, weight: 400, family: 'Inter', color: d.text === '#f7f6f2' ? '#52525b' : d.text });
    comp.appendChild(placeholder);
    comp.x = x; comp.y = y;
    bg.appendChild(comp);
  });
  y += 80;

  // ─── CARDS ──────────────────────────────────────────────
  const cardTitle = makeText('Cards', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  cardTitle.x = 80; cardTitle.y = y;
  bg.appendChild(cardTitle);
  y += 40;

  const cardDefs = [
    { name: 'Card/Default', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Elevated', w: 280, h: 160, fill: '#1a1a24' },
    { name: 'Card/Interactive', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Metric', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Selected', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Decision', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Evidence', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/AI Summary', w: 280, h: 200, fill: '#111118' },
    { name: 'Card/Audit', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Exception', w: 280, h: 160, fill: '#111118' },
    { name: 'Card/Financial Metric', w: 280, h: 160, fill: '#111118' },
  ];

  cardDefs.forEach((d, i) => {
    const x = 80 + (i % 4) * 300;
    const row = Math.floor(i / 4);
    const comp = makeCardComponent(d.name, d.w, d.h);
    comp.fills = [makeSolid(hex(d.fill))];
    comp.x = x; comp.y = y + row * 180;

    // Add label
    const label = makeText(d.name.replace('Card/', ''), { size: 12, weight: 500, family: 'Inter', color: '#a1a1aa' });
    label.x = 12; label.y = 12;
    comp.appendChild(label);

    bg.appendChild(comp);
  });
  y += Math.ceil(cardDefs.length / 4) * 180;

  // ─── BADGES ─────────────────────────────────────────────
  const badgeTitle = makeText('Badges & Chips', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  badgeTitle.x = 80; badgeTitle.y = y;
  bg.appendChild(badgeTitle);
  y += 40;

  const badgeDefs = [
    { name: 'Badge/Default', bg: '#1a1a24', text: '#a1a1aa', label: 'Default' },
    { name: 'Badge/Gold', bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37', label: 'Gold' },
    { name: 'Badge/Success', bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Success' },
    { name: 'Badge/Warning', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'Warning' },
    { name: 'Badge/Error', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Error' },
    { name: 'Badge/Info', bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'Info' },
    { name: 'Status Chip/Completed', bg: '#1a1a24', text: '#22c55e', label: 'Completed' },
    { name: 'Status Chip/Pending', bg: '#1a1a24', text: '#f59e0b', label: 'Pending' },
    { name: 'Status Chip/Failed', bg: '#1a1a24', text: '#ef4444', label: 'Failed' },
    { name: 'Risk Low', bg: '#1a1a24', text: '#22c55e', label: 'Low Risk' },
    { name: 'Risk Medium', bg: '#1a1a24', text: '#f59e0b', label: 'Med Risk' },
    { name: 'Risk High', bg: '#1a1a24', text: '#ef4444', label: 'High Risk' },
  ];

  badgeDefs.forEach((d, i) => {
    const x = 80 + (i % 6) * 130;
    const row = Math.floor(i / 6);
    const comp = makeBadgeComponent(d.name, d.bg, d.text, d.label);
    comp.x = x; comp.y = y + row * 30;
    bg.appendChild(comp);
  });
  y += Math.ceil(badgeDefs.length / 6) * 30;

  // ─── TABS ───────────────────────────────────────────────
  y += 20;
  const tabTitle = makeText('Tabs', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  tabTitle.x = 80; tabTitle.y = y;
  bg.appendChild(tabTitle);
  y += 40;

  const tabLabels = ['Match', 'Vendor', 'History', 'Contract', 'AI', 'Audit'];
  tabLabels.forEach((label, i) => {
    const comp = makeTabComponent(`Tab/${label}`, label, i === 0);
    comp.x = 80 + i * 100; comp.y = y;
    bg.appendChild(comp);
  });
  y += 70;

  // ─── SELECTION CONTROLS ─────────────────────────────────
  const selTitle = makeText('Selection Controls', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  selTitle.x = 80; selTitle.y = y;
  bg.appendChild(selTitle);
  y += 40;

  const selDefs = [
    { name: 'Checkbox/Unchecked', fn: () => makeCheckboxComponent('Unchecked', false, false) },
    { name: 'Checkbox/Checked', fn: () => makeCheckboxComponent('Checked', true, false) },
    { name: 'Checkbox/Indeterminate', fn: () => { const c = makeCheckboxComponent('Indeterminate', true, false); c.fills = [makeSolid(hex('#d4af37'))]; c.opacity = 0.5; return c; } },
    { name: 'Checkbox/Disabled', fn: () => makeCheckboxComponent('Disabled', false, true) },
    { name: 'Radio/Unchecked', fn: () => makeRadioComponent('Unchecked', false, false) },
    { name: 'Radio/Checked', fn: () => makeRadioComponent('Checked', true, false) },
    { name: 'Radio/Disabled', fn: () => makeRadioComponent('Disabled', false, true) },
    { name: 'Toggle/Off', fn: () => makeToggleComponent('Off', false) },
    { name: 'Toggle/On', fn: () => makeToggleComponent('On', true) },
  ];

  selDefs.forEach((d, i) => {
    const x = 80 + (i % 5) * 80;
    const row = Math.floor(i / 5);
    const comp = d.fn();
    comp.x = x; comp.y = y + row * 36;
    bg.appendChild(comp);
    const label = makeText(d.name.split('/').pop() || '', { size: 9, weight: 400, family: 'Inter', color: '#52525b' });
    label.x = x; label.y = y + row * 36 + 22;
    bg.appendChild(label);
  });
  y += Math.ceil(selDefs.length / 5) * 36 + 20;

  // ─── DATA DISPLAY ───────────────────────────────────────
  const dataTitle = makeText('Data Display', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  dataTitle.x = 80; dataTitle.y = y;
  bg.appendChild(dataTitle);
  y += 40;

  // KPI Card
  const kpi = figma.createComponent();
  kpi.name = 'KPI Card';
  kpi.resize(220, 120);
  kpi.fills = [makeSolid(hex('#111118'))];
  kpi.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  kpi.strokeWeight = 1;
  kpi.cornerRadius = 8;
  // Gold top accent
  const accent = makeRect({ w: 220, h: 3, fill: '#d4af37' });
  accent.x = 0; accent.y = 0;
  kpi.appendChild(accent);
  const kpiLabel = makeText('Label', { size: 11, weight: 500, family: 'Inter', color: '#71717a' });
  kpiLabel.x = 16; kpiLabel.y = 16;
  kpi.appendChild(kpiLabel);
  const kpiValue = makeText('$12,400', { size: 24, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' });
  kpiValue.x = 16; kpiValue.y = 36;
  kpi.appendChild(kpiValue);
  kpi.x = 80; kpi.y = y;
  bg.appendChild(kpi);

  // Timeline component
  const timeline = figma.createComponent();
  timeline.name = 'Timeline';
  timeline.resize(300, 200);
  timeline.fills = [makeSolid(hex('#111118'))];
  timeline.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  timeline.strokeWeight = 1;
  timeline.cornerRadius = 8;
  timeline.layoutMode = 'VERTICAL';
  timeline.paddingLeft = 16;
  timeline.paddingRight = 16;
  timeline.paddingTop = 16;
  timeline.paddingBottom = 16;
  timeline.itemSpacing = 12;

  const tlData = [
    { title: 'Invoice Captured', desc: 'OCR completed', time: '14:32 UTC', status: '#22c55e' },
    { title: 'PO Match Initiated', desc: '2-way match started', time: '14:32 UTC', status: '#22c55e' },
    { title: 'Awaiting Approval', desc: 'Pending AP Manager', time: 'Current', status: '#d4af37' },
  ];
  for (const item of tlData) {
    const row = makeFrame('timeline-item', { autoLayout: 'H', gap: 8, w: 268, h: 40 });
    const dot = makeRect({ w: 8, h: 8, fill: item.status, radius: 4 });
    row.appendChild(dot);
    const vstack = makeFrame('content', { autoLayout: 'V', gap: 2, w: 220, h: 40 });
    const t = makeText(item.title, { size: 12, weight: 600, family: 'Inter', color: '#f7f6f2' });
    const d = makeText(item.desc, { size: 11, weight: 400, family: 'Inter', color: '#71717a' });
    vstack.appendChild(t); vstack.appendChild(d);
    row.appendChild(vstack);
    const time = makeText(item.time, { size: 10, weight: 400, family: 'JetBrains Mono', color: '#52525b' });
    time.textAutoResize = 'WIDTH_AND_HEIGHT';
    row.appendChild(time);
    timeline.appendChild(row);
  }
  timeline.x = 320; timeline.y = y;
  bg.appendChild(timeline);

  y += 240;

  // ─── AI COMPONENTS ──────────────────────────────────────
  const aiTitle = makeText('AI Components', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  aiTitle.x = 80; aiTitle.y = y;
  bg.appendChild(aiTitle);
  y += 40;

  // AI Summary Card
  const aiCard = figma.createComponent();
  aiCard.name = 'AI Summary Card';
  aiCard.resize(320, 220);
  aiCard.fills = [makeSolid(hex('#111118'))];
  aiCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  aiCard.strokeWeight = 1;
  aiCard.cornerRadius = 8;
  aiCard.layoutMode = 'VERTICAL';
  aiCard.paddingLeft = 16;
  aiCard.paddingRight = 16;
  aiCard.paddingTop = 16;
  aiCard.paddingBottom = 16;
  aiCard.itemSpacing = 12;

  const aiHeader = makeFrame('ai-header', { autoLayout: 'H', gap: 8, w: 288, h: 24 });
  const sparkles = makeText('✦', { size: 16, weight: 500, family: 'Inter', color: '#d4af37' });
  aiHeader.appendChild(sparkles);
  const aiBadge = makeBadgeComponent('inline-ai-badge', 'rgba(212, 175, 55, 0.15)', '#d4af37', 'AI');
  aiBadge.resize(40, 20);
  aiHeader.appendChild(aiBadge);
  const ts = makeText('Updated 3m ago', { size: 10, weight: 400, family: 'Inter', color: '#52525b' });
  aiHeader.appendChild(ts);
  aiCard.appendChild(aiHeader);

  const aiSummary = makeText('This invoice matches PO-4521 within tolerance. One line item has a +$250 variance. Recommend accept.', {
    size: 13, weight: 400, family: 'Inter', color: '#a1a1aa'
  });
  aiSummary.resize(288, 60);
  aiCard.appendChild(aiSummary);

  const confidenceBar = makeFrame('confidence', { autoLayout: 'H', gap: 8, w: 288, h: 16, alignY: 'CENTER' });
  const barLabel = makeText('Confidence', { size: 10, weight: 500, family: 'Inter', color: '#22c55e' });
  confidenceBar.appendChild(barLabel);
  const barBg = makeRect({ w: 160, h: 4, fill: '#1a1a24', radius: 2 });
  confidenceBar.appendChild(barBg);
  const barFill = makeRect({ w: 130, h: 4, fill: '#22c55e', radius: 2 });
  barFill.x = 0; barFill.y = 0;
  barBg.appendChild(barFill);
  figma.group([barFill], barBg);
  const pct = makeText('82%', { size: 10, weight: 500, family: 'JetBrains Mono', color: '#71717a' });
  confidenceBar.appendChild(pct);
  aiCard.appendChild(confidenceBar);

  const evidenceLink = makeText('View supporting evidence →', { size: 11, weight: 500, family: 'Inter', color: '#5e9eff' });
  aiCard.appendChild(evidenceLink);
  aiCard.x = 80; aiCard.y = y;
  bg.appendChild(aiCard);

  // Recommendation Card
  const recCard = figma.createComponent();
  recCard.name = 'Recommendation Card';
  recCard.resize(320, 200);
  recCard.fills = [makeSolid(hex('#111118'))];
  recCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  recCard.strokeWeight = 1;
  recCard.cornerRadius = 8;
  recCard.layoutMode = 'VERTICAL';
  recCard.paddingLeft = 16;
  recCard.paddingRight = 16;
  recCard.paddingTop = 16;
  recCard.paddingBottom = 16;
  recCard.itemSpacing = 10;
  // Gold left accent
  const leftAccent = makeRect({ w: 3, h: 200, fill: '#d4af37' });
  leftAccent.x = 0; leftAccent.y = 0;
  recCard.appendChild(leftAccent);

  const recTitle = makeText('Recommend: Approve', { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' });
  recCard.appendChild(recTitle);
  const recDesc = makeText('Price variance within historical range. Vendor has 94% match rate.', {
    size: 12, weight: 400, family: 'Inter', color: '#a1a1aa'
  });
  recCard.appendChild(recDesc);
  const recImpact = makeText('+$250.00 this invoice', { size: 14, weight: 500, family: 'JetBrains Mono', color: '#f59e0b' });
  recCard.appendChild(recImpact);
  const recActions = makeFrame('rec-actions', { autoLayout: 'H', gap: 8, w: 288, h: 32 });
  const applyBtn = makeButtonComponent('apply-rec', '#d4af37', '#0a0a0f', 'Apply');
  applyBtn.resize(80, 32);
  recActions.appendChild(applyBtn);
  const dismissBtn = makeButtonComponent('dismiss-rec', 'transparent', '#a1a1aa', 'Dismiss');
  dismissBtn.resize(80, 32);
  recActions.appendChild(dismissBtn);
  recCard.appendChild(recActions);
  recCard.x = 420; recCard.y = y;
  bg.appendChild(recCard);

  // Evidence Panel
  const evCard = figma.createComponent();
  evCard.name = 'Evidence Panel';
  evCard.resize(320, 200);
  evCard.fills = [makeSolid(hex('#111118'))];
  evCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  evCard.strokeWeight = 1;
  evCard.cornerRadius = 8;
  evCard.layoutMode = 'VERTICAL';
  evCard.paddingLeft = 16;
  evCard.paddingRight = 16;
  evCard.paddingTop = 16;
  evCard.paddingBottom = 16;
  evCard.itemSpacing = 10;

  const evHeader = makeText('Supporting Evidence · 4 sources', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' });
  evCard.appendChild(evHeader);

  const evItems = [
    { name: 'PO-4521', desc: 'Match result: 98.3%', conf: 'High' },
    { name: 'Vendor History', desc: '12-month match rate: 94%', conf: 'High' },
    { name: 'Line Items', desc: '3 of 4 matched in tolerance', conf: 'Medium' },
  ];
  for (const item of evItems) {
    const row = makeFrame('ev-item', { autoLayout: 'H', gap: 8, w: 288, h: 28, alignY: 'CENTER' });
    const dot = makeRect({ w: 6, h: 6, fill: item.conf === 'High' ? '#22c55e' : '#f59e0b', radius: 3 });
    row.appendChild(dot);
    const col = makeFrame('ev-col', { autoLayout: 'V', gap: 1, w: 200, h: 28 });
    const n = makeText(item.name, { size: 11, weight: 600, family: 'Inter', color: '#f7f6f2' });
    const d = makeText(item.desc, { size: 10, weight: 400, family: 'Inter', color: '#71717a' });
    col.appendChild(n); col.appendChild(d);
    row.appendChild(col);
    const badge = makeBadgeComponent(`conf-${item.conf}`, 'rgba(34, 197, 94, 0.15)', '#22c55e', item.conf);
    badge.resize(50, 18);
    row.appendChild(badge);
    evCard.appendChild(row);
  }
  evCard.x = 760; evCard.y = y;
  bg.appendChild(evCard);

  y += 260;

  // ─── FINANCIAL COMPONENTS ───────────────────────────────
  const finTitle = makeText('Financial Components', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  finTitle.x = 80; finTitle.y = y;
  bg.appendChild(finTitle);
  y += 40;

  // Invoice Summary Card
  const invSum = figma.createComponent();
  invSum.name = 'Invoice Summary Card';
  invSum.resize(320, 240);
  invSum.fills = [makeSolid(hex('#111118'))];
  invSum.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  invSum.strokeWeight = 1;
  invSum.cornerRadius = 8;
  invSum.layoutMode = 'VERTICAL';
  invSum.paddingLeft = 16;
  invSum.paddingRight = 16;
  invSum.paddingTop = 16;
  invSum.paddingBottom = 16;
  invSum.itemSpacing = 8;

  const invHeader = makeFrame('inv-header', { autoLayout: 'H', gap: 8, w: 288, h: 24, alignY: 'CENTER', alignX: 'SPACE_BETWEEN' });
  const invVendor = makeText('Acme Corporation', { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' });
  invHeader.appendChild(invVendor);
  const invBadge = makeBadgeComponent('inv-status', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Matched');
  invBadge.resize(70, 20);
  invHeader.appendChild(invBadge);
  invSum.appendChild(invHeader);

  const invAmount = makeText('$22,000.00', { size: 24, weight: 600, family: 'JetBrains Mono', color: '#d4af37' });
  invSum.appendChild(invAmount);

  const fields = [
    ['Invoice #', 'INV-2026-0042'], ['Due Date', '2026-08-14'],
    ['PO Ref', 'PO-4521'], ['GL Code', '5100-AP-TRADE'],
  ];
  for (const [label, value] of fields) {
    const row = makeFrame('field-row', { autoLayout: 'H', gap: 8, w: 288, h: 20, alignY: 'CENTER' });
    const l = makeText(label, { size: 11, weight: 500, family: 'Inter', color: '#71717a' });
    l.textCase = 'UPPER';
    l.letterSpacing = { value: 2, unit: 'PERCENT' };
    row.appendChild(l);
    const v = makeText(value, { size: 12, weight: 500, family: 'Inter', color: '#f7f6f2' });
    v.textAutoResize = 'WIDTH_AND_HEIGHT';
    row.appendChild(v);
    invSum.appendChild(row);
  }

  invSum.x = 80; invSum.y = y;
  bg.appendChild(invSum);

  // Approval Summary Card
  const appSum = figma.createComponent();
  appSum.name = 'Approval Summary Card';
  appSum.resize(320, 200);
  appSum.fills = [makeSolid(hex('#111118'))];
  appSum.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  appSum.strokeWeight = 1;
  appSum.cornerRadius = 8;
  appSum.layoutMode = 'VERTICAL';
  appSum.paddingLeft = 16;
  appSum.paddingRight = 16;
  appSum.paddingTop = 16;
  appSum.paddingBottom = 16;
  appSum.itemSpacing = 10;

  const appHeader = makeText('Approval Required · 2 pending', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' });
  appSum.appendChild(appHeader);

  // Chain visualization
  const chain = makeFrame('chain', { autoLayout: 'H', gap: 4, w: 288, h: 30, alignY: 'CENTER' });
  const approvers = [
    { name: 'AP', status: '#22c55e' },
    { name: 'AM', status: '#d4af37' },
    { name: 'CT', status: '#52525b' },
  ];
  for (const a of approvers) {
    const avatar = makeRect({ w: 24, h: 24, fill: '#1a1a24', radius: 12 });
    const letter = makeText(a.name, { size: 10, weight: 600, family: 'Inter', color: '#a1a1aa' });
    letter.x = 6; letter.y = 5;
    avatar.appendChild(letter);
    chain.appendChild(avatar);
    const dot = makeRect({ w: 6, h: 6, fill: a.status, radius: 3 });
    chain.appendChild(dot);
    if (a !== approvers[approvers.length - 1]) {
      const arrow = makeText('→', { size: 10, weight: 400, family: 'Inter', color: '#52525b' });
      chain.appendChild(arrow);
    }
  }
  appSum.appendChild(chain);

  const rule = makeText('Requires 2 of 3 approvers · >$50K', { size: 11, weight: 400, family: 'Inter', color: '#52525b' });
  appSum.appendChild(rule);
  const currentStep = makeText('Awaiting AP Manager (You)', { size: 11, weight: 500, family: 'Inter', color: '#d4af37' });
  appSum.appendChild(currentStep);

  appSum.x = 420; appSum.y = y;
  bg.appendChild(appSum);

  // Variance Card
  const varCard = figma.createComponent();
  varCard.name = 'Variance Card';
  varCard.resize(320, 160);
  varCard.fills = [makeSolid(hex('#111118'))];
  varCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  varCard.strokeWeight = 1;
  varCard.cornerRadius = 8;
  varCard.layoutMode = 'VERTICAL';
  varCard.paddingLeft = 16;
  varCard.paddingRight = 16;
  varCard.paddingTop = 16;
  varCard.paddingBottom = 16;
  varCard.itemSpacing = 10;
  varCard.appendChild(makeText('Variance Analysis', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  varCard.appendChild(makeText('+$250.00 (2.3%)', { size: 18, weight: 600, family: 'JetBrains Mono', color: '#ef4444' }));
  varCard.appendChild(makeText('Invoice exceeds PO by $250. Price variance exceeds 2% tolerance.', { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  varCard.x = 760; varCard.y = y;
  bg.appendChild(varCard);

  y += 280;

  // ─── SKELETON ───────────────────────────────────────────
  const skelTitle = makeText('Skeleton / Loading', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  skelTitle.x = 80; skelTitle.y = y;
  bg.appendChild(skelTitle);
  y += 40;

  const skeletonDefs = [
    { name: 'Skeleton/Text', w: 200, h: 14 },
    { name: 'Skeleton/Card', w: 280, h: 160 },
    { name: 'Skeleton/Circle', w: 40, h: 40 },
    { name: 'Skeleton/Table Row', w: 400, h: 48 },
    { name: 'Skeleton/Metric', w: 200, h: 100 },
  ];

  skeletonDefs.forEach((d, i) => {
    const x = 80 + i * 220;
    const comp = figma.createComponent();
    comp.name = d.name;
    comp.resize(d.w, d.h);
    comp.fills = [makeSolid(hex('#1a1a24'))];
    comp.cornerRadius = d.name === 'Skeleton/Circle' ? 9999 : 6;
    comp.x = x; comp.y = y;
    bg.appendChild(comp);
  });
  y += 200;

  // ─── OVERLAYS ───────────────────────────────────────────
  const overlayTitle = makeText('Overlays', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  overlayTitle.x = 80; overlayTitle.y = y;
  bg.appendChild(overlayTitle);
  y += 40;

  const modal = figma.createComponent();
  modal.name = 'Modal/Dialog';
  modal.resize(480, 300);
  modal.fills = [makeSolid(hex('#111118'))];
  modal.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  modal.strokeWeight = 1;
  modal.cornerRadius = 12;
  modal.layoutMode = 'VERTICAL';
  modal.paddingLeft = 20;
  modal.paddingRight = 20;
  modal.paddingTop = 20;
  modal.paddingBottom = 20;
  modal.itemSpacing = 16;
  modal.appendChild(makeText('Dialog Title', { size: 18, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  modal.appendChild(makeText('Dialog content goes here with relevant information.', { size: 14, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  const modalFooter = makeFrame('modal-actions', { autoLayout: 'H', gap: 8, w: 440, h: 40, alignX: 'SPACE_BETWEEN', alignY: 'CENTER' });
  modalFooter.appendChild(makeText('Cancel', { size: 14, weight: 500, family: 'Inter', color: '#a1a1aa' }));
  const confirmBtn = makeButtonComponent('modal-confirm', '#d4af37', '#0a0a0f', 'Confirm');
  confirmBtn.resize(100, 36);
  modalFooter.appendChild(confirmBtn);
  modal.appendChild(modalFooter);
  modal.x = 80; modal.y = y;
  bg.appendChild(modal);

  // Drawer
  const drawer = figma.createComponent();
  drawer.name = 'Drawer';
  drawer.resize(400, 500);
  drawer.fills = [makeSolid(hex('#111118'))];
  drawer.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  drawer.strokeWeight = 1;
  drawer.layoutMode = 'VERTICAL';
  drawer.paddingLeft = 20;
  drawer.paddingRight = 20;
  drawer.paddingTop = 20;
  drawer.paddingBottom = 20;
  drawer.itemSpacing = 12;
  const drawerHeader = makeText('Drawer Header', { size: 16, weight: 600, family: 'Inter', color: '#f7f6f2' });
  drawer.appendChild(drawerHeader);
  drawer.appendChild(makeText('Drawer body content.', { size: 14, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  drawer.x = 580; drawer.y = y;
  bg.appendChild(drawer);

  // Toast
  const toast = figma.createComponent();
  toast.name = 'Toast';
  toast.resize(360, 48);
  toast.fills = [makeSolid(hex('#1a1a24'))];
  toast.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  toast.strokeWeight = 1;
  toast.cornerRadius = 8;
  toast.layoutMode = 'HORIZONTAL';
  toast.paddingLeft = 16;
  toast.paddingRight = 16;
  toast.itemSpacing = 8;
  toast.primaryAxisAlignItems = 'CENTER';
  toast.counterAxisAlignItems = 'CENTER';
  const toastIcon = makeText('✓', { size: 14, weight: 500, family: 'Inter', color: '#22c55e' });
  toast.appendChild(toastIcon);
  toast.appendChild(makeText('Invoice approved successfully', { size: 13, weight: 500, family: 'Inter', color: '#f7f6f2' }));
  toast.x = 80; toast.y = y + 180;
  bg.appendChild(toast);

  y += 240;

  // ─── TABLE COMPONENTS ──────────────────────────────────
  const tableTitle = makeText('Table Components', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  tableTitle.x = 80; tableTitle.y = y;
  bg.appendChild(tableTitle);
  y += 40;

  const tableComps = [
    { name: 'Table/Header Cell/Default', comp: makeTableHeaderCell('Default', 'Column', false) },
    { name: 'Table/Header Cell/Sorted', comp: makeTableHeaderCell('Sorted', 'Amount', true) },
    { name: 'Table/Cell/Text', comp: makeTableCell('Text', 'Acme Corp') },
    { name: 'Table/Cell/Financial', comp: makeTableCell('Financial', '$22,000', 'financial') },
    { name: 'Table/Cell/Number', comp: makeTableCell('Number', '42', 'text') },
    { name: 'Table/Cell/Date', comp: makeTableCell('Date', '2026-07-15') },
  ];
  tableComps.forEach((d, i) => {
    const x = 80 + (i % 3) * 140;
    const row = Math.floor(i / 3);
    d.comp.x = x; d.comp.y = y + row * 60;
    bg.appendChild(d.comp);
    const label = makeText(d.name, { size: 9, weight: 400, family: 'Inter', color: '#52525b' });
    label.x = x; label.y = y + row * 60 + 44;
    bg.appendChild(label);
  });
  y += Math.ceil(tableComps.length / 3) * 60 + 40;

  // ─── PILLS & SEGMENTED TABS ────────────────────────────
  const tabs2Title = makeText('Tabs — Pills & Segmented', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  tabs2Title.x = 80; tabs2Title.y = y;
  bg.appendChild(tabs2Title);
  y += 40;

  const pillLabels = ['All', 'Matched', 'Exception', 'Pending'];
  pillLabels.forEach((label, i) => {
    const comp = makePillTabComponent(label, label, i === 0);
    comp.x = 80 + i * 110; comp.y = y;
    bg.appendChild(comp);
  });
  y += 50;

  const segLabels = ['Invoices', 'Payments', 'Credits'];
  segLabels.forEach((label, i) => {
    const comp = makeSegmentedTabComponent(label, label, i === 0, i === 0, i === segLabels.length - 1);
    comp.x = 80 + i * 100; comp.y = y;
    bg.appendChild(comp);
  });
  y += 50;

  // ─── PAGINATION ────────────────────────────────────────
  const pagTitle = makeText('Pagination', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  pagTitle.x = 80; pagTitle.y = y;
  bg.appendChild(pagTitle);
  y += 40;

  const pagComp = makePaginationComponent('Default', 1, 10);
  pagComp.x = 80; pagComp.y = y;
  bg.appendChild(pagComp);
  y += 60;

  // ─── DROPDOWN ──────────────────────────────────────────
  const ddTitle = makeText('Dropdown / Select', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  ddTitle.x = 80; ddTitle.y = y;
  bg.appendChild(ddTitle);
  y += 40;

  const ddComp = makeDropdownComponent('Default', 'Select status...');
  ddComp.x = 80; ddComp.y = y;
  bg.appendChild(ddComp);
  const ddMenu = makeDropdownMenuComponent('Default', ['Matched', 'Exception', 'Pending', 'Draft']);
  ddMenu.x = 80; ddMenu.y = y + 50;
  bg.appendChild(ddMenu);
  y += 200;

  // ─── STATISTIC CARD ────────────────────────────────────
  const statTitle = makeText('Statistic Card', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  statTitle.x = 80; statTitle.y = y;
  bg.appendChild(statTitle);
  y += 40;

  const statCard = figma.createComponent();
  statCard.name = 'Statistic Card';
  statCard.resize(200, 100);
  statCard.fills = [makeSolid(hex('#111118'))];
  statCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  statCard.strokeWeight = 1;
  statCard.cornerRadius = 8;
  statCard.layoutMode = 'VERTICAL';
  statCard.paddingLeft = 16;
  statCard.paddingRight = 16;
  statCard.paddingTop = 16;
  statCard.paddingBottom = 16;
  statCard.itemSpacing = 8;
  statCard.appendChild(makeText('Total Spend', { size: 11, weight: 500, family: 'Inter', color: '#71717a' }));
  statCard.appendChild(makeText('$1,284,500', { size: 24, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
  statCard.appendChild(makeText('↑ 12.3% vs last period', { size: 11, weight: 500, family: 'Inter', color: '#22c55e' }));
  statCard.x = 80; statCard.y = y;
  bg.appendChild(statCard);

  // Property List
  const propCard = figma.createComponent();
  propCard.name = 'Property List';
  propCard.resize(280, 140);
  propCard.fills = [makeSolid(hex('#111118'))];
  propCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  propCard.strokeWeight = 1;
  propCard.cornerRadius = 8;
  propCard.layoutMode = 'VERTICAL';
  propCard.paddingLeft = 16;
  propCard.paddingRight = 16;
  propCard.paddingTop = 16;
  propCard.paddingBottom = 16;
  propCard.itemSpacing = 8;
  const propFields = [['Invoice #', 'INV-0042'], ['Due Date', '2026-08-14'], ['GL Code', '5100-AP']];
  for (const [l, v] of propFields) {
    const row = makeFrame('prop-row', { autoLayout: 'H', gap: 16, w: 248, h: 24, alignY: 'CENTER' });
    row.appendChild(makeText(l, { size: 11, weight: 500, family: 'Inter', color: '#71717a' }));
    row.appendChild(makeText(v, { size: 12, weight: 500, family: 'Inter', color: '#f7f6f2' }));
    propCard.appendChild(row);
  }
  propCard.x = 300; propCard.y = y;
  bg.appendChild(propCard);

  // Definition List
  const defCard = figma.createComponent();
  defCard.name = 'Definition List';
  defCard.resize(280, 140);
  defCard.fills = [makeSolid(hex('#111118'))];
  defCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  defCard.strokeWeight = 1;
  defCard.cornerRadius = 8;
  defCard.layoutMode = 'VERTICAL';
  defCard.paddingLeft = 16;
  defCard.paddingRight = 16;
  defCard.paddingTop = 16;
  defCard.paddingBottom = 16;
  defCard.itemSpacing = 12;
  const defFields = [['VENDOR', 'Acme Corporation'], ['TOTAL', '$22,000.00'], ['STATUS', 'Matched']];
  for (const [l, v] of defFields) {
    const col = makeFrame('def-row', { autoLayout: 'V', gap: 2, w: 248, h: 32 });
    col.appendChild(makeText(l, { size: 10, weight: 600, family: 'Inter', color: '#71717a', textCase: 'UPPER' }));
    col.appendChild(makeText(v, { size: 14, weight: 400, family: 'Inter', color: '#f7f6f2' }));
    defCard.appendChild(col);
  }
  defCard.x = 600; defCard.y = y;
  bg.appendChild(defCard);
  y += 180;

  // ─── ACTIVITY FEED ─────────────────────────────────────
  const feedTitle = makeText('Activity Feed', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  feedTitle.x = 80; feedTitle.y = y;
  bg.appendChild(feedTitle);
  y += 40;

  const feedCard = figma.createComponent();
  feedCard.name = 'Activity Feed';
  feedCard.resize(320, 180);
  feedCard.fills = [makeSolid(hex('#111118'))];
  feedCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  feedCard.strokeWeight = 1;
  feedCard.cornerRadius = 8;
  feedCard.layoutMode = 'VERTICAL';
  feedCard.paddingLeft = 16;
  feedCard.paddingRight = 16;
  feedCard.paddingTop = 16;
  feedCard.paddingBottom = 16;
  feedCard.itemSpacing = 8;
  const feedItems = [
    { icon: '📄', text: 'Invoice INV-042 captured', time: '3m ago' },
    { icon: '✓', text: 'PO match completed', time: '3m ago' },
    { icon: '✦', text: 'AI analysis ready', time: '2m ago' },
    { icon: '🔔', text: 'Approval requested', time: '1m ago' },
  ];
  for (const fi of feedItems) {
    const row = makeFrame('feed-row', { autoLayout: 'H', gap: 10, alignY: 'CENTER', w: 288, h: 28 });
    row.appendChild(makeText(fi.icon, { size: 12, weight: 400, family: 'Inter', color: '#a1a1aa' }));
    row.appendChild(makeText(fi.text, { size: 11, weight: 400, family: 'Inter', color: '#f7f6f2' }));
    row.appendChild(makeText(fi.time, { size: 9, weight: 400, family: 'Inter', color: '#52525b' }));
    feedCard.appendChild(row);
  }
  feedCard.x = 80; feedCard.y = y;
  bg.appendChild(feedCard);

  // Audit Log
  const auditCard = figma.createComponent();
  auditCard.name = 'Audit Log';
  auditCard.resize(320, 180);
  auditCard.fills = [makeSolid(hex('#111118'))];
  auditCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  auditCard.strokeWeight = 1;
  auditCard.cornerRadius = 8;
  auditCard.layoutMode = 'VERTICAL';
  auditCard.paddingLeft = 16;
  auditCard.paddingRight = 16;
  auditCard.paddingTop = 16;
  auditCard.paddingBottom = 16;
  auditCard.itemSpacing = 8;
  const auditItems = [
    { ts: '14:32:01', actor: 'J. Smith', action: 'Approved INV-042' },
    { ts: '14:30:15', actor: 'AI System', action: 'Match complete — 98.3%' },
    { ts: '14:28:00', actor: 'OCR Engine', action: 'Document captured' },
  ];
  for (const ai of auditItems) {
    const row = makeFrame('audit-row', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 288, h: 28 });
    row.appendChild(makeText(ai.ts, { size: 10, weight: 400, family: 'JetBrains Mono', color: '#71717a' }));
    row.appendChild(makeText(ai.actor, { size: 11, weight: 600, family: 'Inter', color: '#f7f6f2' }));
    row.appendChild(makeText(ai.action, { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' }));
    auditCard.appendChild(row);
  }
  auditCard.x = 420; auditCard.y = y;
  bg.appendChild(auditCard);
  y += 220;

  // ─── AI: CONFIDENCE INDICATOR ──────────────────────────
  const ai2Title = makeText('AI Components (cont.)', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  ai2Title.x = 80; ai2Title.y = y;
  bg.appendChild(ai2Title);
  y += 40;

  // Confidence Indicator
  function makeConfidenceIndicator(name, label, color, pct) {
    const comp = figma.createComponent();
    comp.name = `AI/Confidence/${name}`;
    comp.resize(160, 24);
    comp.fills = [];
    comp.layoutMode = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.itemSpacing = 6;
    const dot = makeRect({ w: 8, h: 8, fill: color, radius: 4 });
    comp.appendChild(dot);
    comp.appendChild(makeText(label, { size: 12, weight: 500, family: 'Inter', color }));
    comp.appendChild(makeText(`${pct}%`, { size: 10, weight: 400, family: 'JetBrains Mono', color: '#71717a' }));
    return comp;
  }

  const confLevels = [
    { label: 'High', color: '#22c55e', pct: 92 },
    { label: 'Medium', color: '#f59e0b', pct: 68 },
    { label: 'Low', color: '#ef4444', pct: 35 },
    { label: 'Processing', color: '#d4af37', pct: 0 },
  ];
  confLevels.forEach((c, i) => {
    const comp = makeConfidenceIndicator(c.label, `${c.label} confidence`, c.color, c.pct);
    comp.x = 80 + i * 180; comp.y = y;
    bg.appendChild(comp);
  });
  y += 40;

  // Risk Indicator
  const riskLevels = [
    { label: 'Low Risk', color: '#22c55e' },
    { label: 'Medium Risk', color: '#f59e0b' },
    { label: 'High Risk', color: '#ef4444' },
    { label: 'Critical Risk', color: '#dc2626' },
  ];
  riskLevels.forEach((r, i) => {
    const comp = figma.createComponent();
    comp.name = `AI/Risk/${r.label}`;
    comp.resize(140, 24);
    comp.fills = [];
    comp.layoutMode = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.itemSpacing = 6;
    const dot = makeRect({ w: 8, h: 8, fill: r.color, radius: 4 });
    comp.appendChild(dot);
    comp.appendChild(makeText(r.label, { size: 12, weight: 500, family: 'Inter', color: r.color }));
    comp.x = 80 + i * 160; comp.y = y;
    bg.appendChild(comp);
  });
  y += 40;

  // Supporting Documents
  const docsComp = figma.createComponent();
  docsComp.name = 'AI/Supporting Documents';
  docsComp.resize(300, 140);
  docsComp.fills = [makeSolid(hex('#111118'))];
  docsComp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  docsComp.strokeWeight = 1;
  docsComp.cornerRadius = 8;
  docsComp.layoutMode = 'VERTICAL';
  docsComp.paddingLeft = 12;
  docsComp.paddingRight = 12;
  docsComp.paddingTop = 12;
  docsComp.paddingBottom = 12;
  docsComp.itemSpacing = 8;
  docsComp.appendChild(makeText('Supporting Documents · 4 files', { size: 12, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const docItems = [
    { icon: '📄', name: 'PO-4521.pdf', meta: '2 pages' },
    { icon: '📊', name: 'Price_Analysis.xlsx', meta: '3 sheets' },
    { icon: '🖼', name: 'Invoice_INV-042.png', meta: '1 page' },
  ];
  for (const di of docItems) {
    const row = makeFrame('doc-row', { autoLayout: 'H', gap: 10, alignY: 'CENTER', w: 276, h: 28 });
    row.appendChild(makeText(di.icon, { size: 14, weight: 400, family: 'Inter', color: '#a1a1aa' }));
    const col = makeFrame('doc-col', { autoLayout: 'V', gap: 1, w: 200, h: 28 });
    col.appendChild(makeText(di.name, { size: 11, weight: 500, family: 'Inter', color: '#f7f6f2' }));
    col.appendChild(makeText(di.meta, { size: 9, weight: 400, family: 'Inter', color: '#71717a' }));
    row.appendChild(col);
    docsComp.appendChild(row);
  }
  docsComp.x = 80; docsComp.y = y;
  bg.appendChild(docsComp);

  // AI Activity Timeline
  const aiTimeline = figma.createComponent();
  aiTimeline.name = 'AI/Activity Timeline';
  aiTimeline.resize(300, 160);
  aiTimeline.fills = [makeSolid(hex('#111118'))];
  aiTimeline.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  aiTimeline.strokeWeight = 1;
  aiTimeline.cornerRadius = 8;
  aiTimeline.layoutMode = 'VERTICAL';
  aiTimeline.paddingLeft = 16;
  aiTimeline.paddingRight = 16;
  aiTimeline.paddingTop = 16;
  aiTimeline.paddingBottom = 16;
  aiTimeline.itemSpacing = 8;
  const aiTimelineItems = [
    { action: 'Analysed INV-042', result: '98.3% match', time: '3m ago' },
    { action: 'Checked vendor history', result: '94% match rate', time: '3m ago' },
    { action: 'Generated recommendation', result: 'Approve', time: '2m ago' },
  ];
  for (const ati of aiTimelineItems) {
    const row = makeFrame('ai-tl-row', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 268, h: 28 });
    const sparkle = makeText('✦', { size: 12, weight: 400, family: 'Inter', color: '#d4af37' });
    row.appendChild(sparkle);
    const col = makeFrame('ai-tl-col', { autoLayout: 'V', gap: 1, w: 180, h: 28 });
    col.appendChild(makeText(ati.action, { size: 11, weight: 500, family: 'Inter', color: '#f7f6f2' }));
    col.appendChild(makeText(ati.result, { size: 10, weight: 400, family: 'Inter', color: '#71717a' }));
    row.appendChild(col);
    row.appendChild(makeText(ati.time, { size: 9, weight: 400, family: 'JetBrains Mono', color: '#52525b' }));
    aiTimeline.appendChild(row);
  }
  aiTimeline.x = 400; aiTimeline.y = y;
  bg.appendChild(aiTimeline);

  // AI Processing State
  const processingState = figma.createComponent();
  processingState.name = 'AI/Processing State';
  processingState.resize(200, 120);
  processingState.fills = [makeSolid(hex('#111118'))];
  processingState.cornerRadius = 8;
  processingState.layoutMode = 'VERTICAL';
  processingState.primaryAxisAlignItems = 'CENTER';
  processingState.counterAxisAlignItems = 'CENTER';
  processingState.itemSpacing = 12;
  const pulseDot = makeRect({ w: 16, h: 16, fill: '#d4af37', radius: 999 });
  processingState.appendChild(pulseDot);
  processingState.appendChild(makeText('AI is analysing...', { size: 13, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  processingState.appendChild(makeText('Analysing 4 documents', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
  processingState.x = 720; processingState.y = y;
  bg.appendChild(processingState);

  // Explain Recommendation
  const explainComp = figma.createComponent();
  explainComp.name = 'AI/Explain Recommendation';
  explainComp.resize(320, 200);
  explainComp.fills = [makeSolid(hex('#111118'))];
  explainComp.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  explainComp.strokeWeight = 1;
  explainComp.cornerRadius = 8;
  explainComp.layoutMode = 'VERTICAL';
  explainComp.paddingLeft = 16;
  explainComp.paddingRight = 16;
  explainComp.paddingTop = 16;
  explainComp.paddingBottom = 16;
  explainComp.itemSpacing = 8;
  explainComp.appendChild(makeText('Why was this recommended?', { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const factors = [
    { rule: 'Price match (98.3%)', weight: 45 },
    { rule: 'Vendor history (94%)', weight: 30 },
    { rule: 'Within tolerance', weight: 25 },
  ];
  for (const f of factors) {
    const row = makeFrame('factor-row', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 288, h: 28 });
    row.appendChild(makeText(f.rule, { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' }));
    const barBg = makeRect({ w: 120, h: 6, fill: '#1a1a24', radius: 3 });
    const barFill = makeRect({ w: Math.round(120 * f.weight / 100), h: 6, fill: '#d4af37', radius: 3 });
    barFill.x = 0; barFill.y = 0;
    barBg.appendChild(barFill);
    row.appendChild(barBg);
    row.appendChild(makeText(`${f.weight}%`, { size: 10, weight: 400, family: 'JetBrains Mono', color: '#71717a' }));
    explainComp.appendChild(row);
  }
  explainComp.x = 80; explainComp.y = y + 140;
  bg.appendChild(explainComp);
  y += 380;

  // ─── FINANCIAL COMPONENTS (cont.) ──────────────────────
  const fin2Title = makeText('Financial Components (cont.)', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  fin2Title.x = 80; fin2Title.y = y;
  bg.appendChild(fin2Title);
  y += 40;

  // Currency Display
  function makeCurrencyDisplay(size, amount, sign = 'positive') {
    const comp = figma.createComponent();
    comp.name = `Financial/Currency Display/${size}`;
    const color = sign === 'positive' ? '#f7f6f2' : '#ef4444';
    const sizes = { hero: 32, default: 24, small: 14, xs: 11 };
    const fs = sizes[size] || 24;
    comp.resize(fs * 3, fs + 8);
    comp.fills = [];
    comp.layoutMode = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.itemSpacing = 2;
    const code = makeText('$', { size: Math.max(fs - 8, 8), weight: 500, family: 'Inter', color: '#71717a' });
    comp.appendChild(code);
    const val = makeText(amount, { size: fs, weight: fs >= 24 ? 700 : 500, family: 'JetBrains Mono', color });
    comp.appendChild(val);
    return comp;
  }
  const curSizes = ['hero', 'default', 'small', 'xs'];
  curSizes.forEach((sz, i) => {
    const comp = makeCurrencyDisplay(sz, sz === 'hero' ? '1,284,500' : (sz === 'xs' ? '500' : '22,000'));
    comp.x = 80 + i * 160; comp.y = y;
    bg.appendChild(comp);
  });
  y += 50;

  // Exchange Rate Card
  const fxCard = figma.createComponent();
  fxCard.name = 'Financial/Exchange Rate';
  fxCard.resize(240, 80);
  fxCard.fills = [makeSolid(hex('#111118'))];
  fxCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  fxCard.strokeWeight = 1;
  fxCard.cornerRadius = 8;
  fxCard.layoutMode = 'HORIZONTAL';
  fxCard.primaryAxisAlignItems = 'CENTER';
  fxCard.counterAxisAlignItems = 'CENTER';
  fxCard.paddingLeft = 16;
  fxCard.paddingRight = 16;
  fxCard.itemSpacing = 12;
  const fxCol1 = makeFrame('fx-col', { autoLayout: 'V', gap: 2, w: 80, h: 40 });
  fxCol1.appendChild(makeText('USD → EUR', { size: 11, weight: 500, family: 'Inter', color: '#a1a1aa' }));
  fxCol1.appendChild(makeText('0.9204', { size: 16, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
  fxCard.appendChild(fxCol1);
  fxCard.appendChild(makeText('↓ -0.2%', { size: 11, weight: 500, family: 'Inter', color: '#ef4444' }));
  fxCard.x = 80; fxCard.y = y;
  bg.appendChild(fxCard);
  y += 110;

  // Journal Entry Card
  const jeCard = figma.createComponent();
  jeCard.name = 'Financial/Journal Entry';
  jeCard.resize(320, 200);
  jeCard.fills = [makeSolid(hex('#111118'))];
  jeCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  jeCard.strokeWeight = 1;
  jeCard.cornerRadius = 8;
  jeCard.layoutMode = 'VERTICAL';
  jeCard.paddingLeft = 16;
  jeCard.paddingRight = 16;
  jeCard.paddingTop = 16;
  jeCard.paddingBottom = 16;
  jeCard.itemSpacing = 6;
  const jeHeader = makeFrame('je-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 288, h: 24 });
  jeHeader.appendChild(makeText('GL-2026-08942', { size: 13, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
  jeHeader.appendChild(makeBadgeComponent('je-status', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Posted'));
  jeCard.appendChild(jeHeader);
  const jeLines = [
    ['5100-AP-TRADE', '$22,000', '—'],
    ['2100-ACCRUED', '—', '$22,000'],
  ];
  const jeTableHeader = makeFrame('je-th', { autoLayout: 'H', w: 288, h: 20, fill: '#0d0d14' });
  ['Account', 'Debit', 'Credit'].forEach((c, i) => {
    jeTableHeader.appendChild(makeText(c, { size: 9, weight: 600, family: 'Inter', color: '#52525b', textCase: 'UPPER' }));
  });
  jeCard.appendChild(jeTableHeader);
  for (const jl of jeLines) {
    const row = makeFrame('je-row', { autoLayout: 'H', w: 288, h: 22 });
    jl.forEach((v, i) => {
      row.appendChild(makeText(v, { size: 11, weight: 400, family: i === 0 ? 'JetBrains Mono' : 'JetBrains Mono', color: v.startsWith('$') ? '#f7f6f2' : '#a1a1aa' }));
    });
    jeCard.appendChild(row);
  }
  jeCard.appendChild(makeText('Audited by J. Smith · 2026-07-15', { size: 9, weight: 400, family: 'Inter', color: '#52525b' }));
  jeCard.x = 340; jeCard.y = y - 110;
  bg.appendChild(jeCard);

  // Supplier Summary Card
  const suppCard = figma.createComponent();
  suppCard.name = 'Financial/Supplier Summary';
  suppCard.resize(280, 140);
  suppCard.fills = [makeSolid(hex('#111118'))];
  suppCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  suppCard.strokeWeight = 1;
  suppCard.cornerRadius = 8;
  suppCard.layoutMode = 'VERTICAL';
  suppCard.paddingLeft = 16;
  suppCard.paddingRight = 16;
  suppCard.paddingTop = 16;
  suppCard.paddingBottom = 16;
  suppCard.itemSpacing = 8;
  const suppHeader = makeFrame('supp-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 248, h: 24 });
  suppHeader.appendChild(makeText('Acme Corporation', { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  suppHeader.appendChild(makeBadgeComponent('supp-risk', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Low Risk'));
  suppCard.appendChild(suppHeader);
  const suppMetrics = makeFrame('supp-metrics', { autoLayout: 'H', gap: 8, w: 248, h: 48 });
  for (const m of [{ v: '$1.2M', l: 'Total' }, { v: '47', l: 'Invoices' }, { v: 'Net 30', l: 'Terms' }]) {
    const col = makeFrame('supp-m', { autoLayout: 'V', gap: 2, w: 77, h: 44 });
    col.appendChild(makeText(m.v, { size: 14, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
    col.appendChild(makeText(m.l, { size: 9, weight: 500, family: 'Inter', color: '#52525b' }));
    suppMetrics.appendChild(col);
  }
  suppCard.appendChild(suppMetrics);
  suppCard.appendChild(makeText('3 invoices pending', { size: 11, weight: 400, family: 'Inter', color: '#f59e0b' }));
  suppCard.x = 80; suppCard.y = y;
  bg.appendChild(suppCard);

  // Payment Card
  const payCard = figma.createComponent();
  payCard.name = 'Financial/Payment';
  payCard.resize(280, 160);
  payCard.fills = [makeSolid(hex('#111118'))];
  payCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  payCard.strokeWeight = 1;
  payCard.cornerRadius = 8;
  payCard.layoutMode = 'VERTICAL';
  payCard.paddingLeft = 16;
  payCard.paddingRight = 16;
  payCard.paddingTop = 16;
  payCard.paddingBottom = 16;
  payCard.itemSpacing = 8;
  const payHeader = makeFrame('pay-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 248, h: 24 });
  payHeader.appendChild(makeText('PMT-2026-023', { size: 13, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
  payHeader.appendChild(makeBadgeComponent('pay-status', 'rgba(245, 158, 11, 0.15)', '#f59e0b', 'Pending'));
  payCard.appendChild(payHeader);
  payCard.appendChild(makeText('$45,000.00', { size: 24, weight: 600, family: 'JetBrains Mono', color: '#d4af37' }));
  payCard.appendChild(makeText('Beta Ltd · ****1234', { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  payCard.appendChild(makeText('Due: 2026-08-15', { size: 11, weight: 400, family: 'Inter', color: '#71717a' }));
  payCard.x = 380; payCard.y = y;
  bg.appendChild(payCard);

  // Exception Card
  const excCard2 = figma.createComponent();
  excCard2.name = 'Financial/Exception';
  excCard2.resize(280, 180);
  excCard2.fills = [makeSolid(hex('#111118'))];
  excCard2.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  excCard2.strokeWeight = 1;
  excCard2.cornerRadius = 8;
  excCard2.layoutMode = 'VERTICAL';
  excCard2.paddingLeft = 16;
  excCard2.paddingRight = 16;
  excCard2.paddingTop = 16;
  excCard2.paddingBottom = 16;
  excCard2.itemSpacing = 8;
  const excLeftBorder = makeRect({ w: 4, h: 180, fill: '#ef4444' });
  excLeftBorder.x = 0; excLeftBorder.y = 0;
  excCard2.appendChild(excLeftBorder);
  const excHeader2 = makeFrame('exc-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 248, h: 24 });
  excHeader2.appendChild(makeBadgeComponent('exc-type', 'rgba(239, 68, 68, 0.15)', '#ef4444', 'Price Mismatch'));
  excCard2.appendChild(excHeader2);
  excCard2.appendChild(makeText('INV-042 exceeds PO by $2,400', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  excCard2.appendChild(makeText('Price variance 11.2% exceeds 2% tolerance', { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' }));
  excCard2.appendChild(makeText('Resolution: Request vendor credit note', { size: 11, weight: 500, family: 'Inter', color: '#d4af37' }));
  excCard2.x = 680; excCard2.y = y;
  bg.appendChild(excCard2);

  // Cash Position Card
  const cashCard = figma.createComponent();
  cashCard.name = 'Financial/Cash Position';
  cashCard.resize(280, 160);
  cashCard.fills = [makeSolid(hex('#111118'))];
  cashCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  cashCard.strokeWeight = 1;
  cashCard.cornerRadius = 8;
  cashCard.layoutMode = 'VERTICAL';
  cashCard.paddingLeft = 16;
  cashCard.paddingRight = 16;
  cashCard.paddingTop = 16;
  cashCard.paddingBottom = 16;
  cashCard.itemSpacing = 8;
  const cashGoldAccent = makeRect({ w: 280, h: 3, fill: '#d4af37' });
  cashGoldAccent.x = 0; cashGoldAccent.y = 0;
  cashCard.appendChild(cashGoldAccent);
  cashCard.appendChild(makeText('Cash Position', { size: 10, weight: 500, family: 'Inter', color: '#71717a', textCase: 'UPPER' }));
  cashCard.appendChild(makeText('$1,284,500', { size: 24, weight: 700, family: 'JetBrains Mono', color: '#f7f6f2' }));
  const cashGrid = makeFrame('cash-grid', { autoLayout: 'H', gap: 8, w: 248, h: 40 });
  for (const c of [{ v: '$890K', l: 'Operating' }, { v: '$250K', l: 'Reserved' }, { v: '$144K', l: 'Available' }]) {
    const col = makeFrame('cash-col', { autoLayout: 'V', gap: 1, w: 77, h: 36 });
    col.appendChild(makeText(c.v, { size: 12, weight: 600, family: 'JetBrains Mono', color: c.l === 'Available' ? '#22c55e' : '#f7f6f2' }));
    col.appendChild(makeText(c.l, { size: 9, weight: 400, family: 'Inter', color: '#52525b' }));
    cashGrid.appendChild(col);
  }
  cashCard.appendChild(cashGrid);
  cashCard.appendChild(makeText('Updated 2m ago', { size: 9, weight: 400, family: 'Inter', color: '#52525b' }));
  cashCard.x = 80; cashCard.y = y + 200;
  bg.appendChild(cashCard);
  y += 240;

  // ─── SKELETON CHART ────────────────────────────────────
  const skel2Title = makeText('Skeleton / Chart', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  skel2Title.x = 80; skel2Title.y = y;
  bg.appendChild(skel2Title);
  y += 40;

  const skelChart = figma.createComponent();
  skelChart.name = 'Skeleton/Chart';
  skelChart.resize(400, 200);
  skelChart.fills = [makeSolid(hex('#1a1a24'))];
  skelChart.cornerRadius = 8;
  skelChart.x = 80; skelChart.y = y;
  bg.appendChild(skelChart);
  y += 240;

  // ─── NAVIGATION COMPONENTS ─────────────────────────────
  const navTitle = makeText('Navigation', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  navTitle.x = 80; navTitle.y = y;
  bg.appendChild(navTitle);
  y += 40;

  // Sidebar Expanded
  const sidebarExp = figma.createComponent();
  sidebarExp.name = 'Sidebar/Expanded';
  sidebarExp.resize(240, 600);
  sidebarExp.fills = [makeSolid(hex('#0a0a0f'))];
  sidebarExp.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  sidebarExp.strokeWeight = 1;
  sidebarExp.layoutMode = 'VERTICAL';
  sidebarExp.paddingTop = 16;
  sidebarExp.paddingLeft = 8;
  sidebarExp.paddingRight = 8;
  sidebarExp.itemSpacing = 4;
  const sidebarLogo = makeFrame('logo', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 224, h: 40 });
  sidebarLogo.paddingLeft = 12;
  sidebarLogo.appendChild(makeText('◆', { size: 20, weight: 400, family: 'Inter', color: '#d4af37' }));
  sidebarLogo.appendChild(makeText('Perionyx', { size: 16, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  sidebarExp.appendChild(sidebarLogo);
  const navItems = [
    { icon: '◆', label: 'Dashboard', active: true },
    { icon: '📋', label: 'Work Queue', active: false },
    { icon: '⚠', label: 'Exceptions', active: false },
    { icon: '💳', label: 'Payments', active: false },
    { icon: '📊', label: 'Reports', active: false },
  ];
  for (const ni of navItems) {
    const item = makeFrame(`nav-${ni.label}`, { autoLayout: 'H', gap: 10, alignY: 'CENTER', w: 224, h: 36 });
    item.paddingLeft = 12;
    item.cornerRadius = 6;
    if (ni.active) item.fills = [makeSolid(hex('rgba(212, 175, 55, 0.12)'))];
    const icon = makeText(ni.icon, { size: 16, weight: 400, family: 'Inter', color: ni.active ? '#d4af37' : '#71717a' });
    item.appendChild(icon);
    const label = makeText(ni.label, { size: 14, weight: ni.active ? 500 : 400, family: 'Inter', color: ni.active ? '#f7f6f2' : '#a1a1aa' });
    item.appendChild(label);
    sidebarExp.appendChild(item);
  }
  sidebarExp.x = 80; sidebarExp.y = y;
  bg.appendChild(sidebarExp);

  // Sidebar Collapsed
  const sidebarColl = figma.createComponent();
  sidebarColl.name = 'Sidebar/Collapsed';
  sidebarColl.resize(64, 600);
  sidebarColl.fills = [makeSolid(hex('#0a0a0f'))];
  sidebarColl.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  sidebarColl.strokeWeight = 1;
  sidebarColl.layoutMode = 'VERTICAL';
  sidebarColl.primaryAxisAlignItems = 'CENTER';
  sidebarColl.paddingTop = 16;
  sidebarColl.itemSpacing = 8;
  const collapsedItems = ['◆', '📋', '⚠', '💳', '📊'];
  collapsedItems.forEach((icon, i) => {
    const item = makeFrame(`cnav-${i}`, { w: 40, h: 36, fill: i === 0 ? 'rgba(212, 175, 55, 0.12)' : 'transparent', radius: 6 });
    const text = makeText(icon, { size: 16, weight: 400, family: 'Inter', color: i === 0 ? '#d4af37' : '#71717a' });
    text.x = 11; text.y = 8;
    item.appendChild(text);
    sidebarColl.appendChild(item);
  });
  sidebarColl.x = 340; sidebarColl.y = y;
  bg.appendChild(sidebarColl);

  // Top Navigation
  const topNavComp = figma.createComponent();
  topNavComp.name = 'Top Navigation';
  topNavComp.resize(600, 56);
  topNavComp.fills = [makeSolid(hex('#111118'))];
  topNavComp.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  topNavComp.strokeWeight = 1;
  topNavComp.layoutMode = 'HORIZONTAL';
  topNavComp.primaryAxisAlignItems = 'SPACE_BETWEEN';
  topNavComp.counterAxisAlignItems = 'CENTER';
  topNavComp.paddingLeft = 16;
  topNavComp.paddingRight = 16;
  topNavComp.appendChild(makeText('AP  ›  Dashboard', { size: 14, weight: 500, family: 'Inter', color: '#a1a1aa' }));
  const topRight = makeFrame('top-right', { autoLayout: 'H', gap: 12, alignY: 'CENTER', w: 120, h: 36 });
  topRight.appendChild(makeText('⌕', { size: 16, weight: 400, family: 'Inter', color: '#71717a' }));
  topRight.appendChild(makeText('🔔', { size: 16, weight: 400, family: 'Inter', color: '#71717a' }));
  topNavComp.appendChild(topRight);
  topNavComp.x = 420; topNavComp.y = y;
  bg.appendChild(topNavComp);

  y += 200;

  return page;
}

// ─── Patterns Page ────────────────────────────────────────────
function buildPatternsPage() {
  const page = createPage('03 Patterns');
  figma.currentPage = page;

  const bg = makeFrame('Patterns Canvas', { w: 1440, h: 2000, fill: '#0a0a0f' });

  const title = makeText('UX Patterns', { size: 30, weight: 600, family: 'Inter', color: '#f7f6f2' });
  title.x = 80; title.y = 60;
  bg.appendChild(title);

  const patterns = [
    { name: 'Master Detail', desc: 'List panel + detail panel', icon: '◫' },
    { name: 'Work Queue', desc: 'Filterable, sortable queue', icon: '☰' },
    { name: 'Review Workspace', desc: 'Evidence + actions + audit', icon: '◈' },
    { name: 'Approval Workspace', desc: 'Decision card + policy', icon: '✓' },
    { name: 'Exception Workspace', desc: 'Categorised + resolution', icon: '⚠' },
    { name: 'Split View', desc: 'Side-by-side comparison', icon: '◫' },
    { name: 'Inspector Panel', desc: 'Right-side detail', icon: '☷' },
    { name: 'Dashboard', desc: 'Metrics + chart + activity', icon: '◆' },
    { name: 'Timeline', desc: 'Chronological status feed', icon: '◉' },
    { name: 'Empty State', desc: 'Illustration + CTA button', icon: '□' },
    { name: 'Loading State', desc: 'Skeleton screen pattern', icon: '⏳' },
    { name: 'Error State', desc: 'Message + recovery action', icon: '✕' },
  ];

  patterns.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 80 + col * 440;
    const py = 120 + row * 200;

    // Card frame
    const card = makeFrame(`Pattern: ${p.name}`, { w: 400, h: 170, fill: '#111118', radius: 8 });
    card.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    card.strokeWeight = 1;
    card.x = x; card.y = py;
    bg.appendChild(card);

    // Icon
    const icon = makeText(p.icon, { size: 28, weight: 400, family: 'Inter', color: '#d4af37' });
    icon.x = 16; icon.y = 16;
    card.appendChild(icon);

    // Name
    const name = makeText(p.name, { size: 16, weight: 600, family: 'Inter', color: '#f7f6f2' });
    name.x = 56; name.y = 18;
    card.appendChild(name);

    // Description
    const desc = makeText(p.desc, { size: 12, weight: 400, family: 'Inter', color: '#a1a1aa' });
    desc.x = 16; desc.y = 54;
    card.appendChild(desc);

    // Mini wireframe representation
    if (p.name === 'Master Detail' || p.name === 'Split View') {
      const left = makeRect({ w: 120, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#52525b', strokeWeight: 1 });
      left.x = 16; left.y = 78;
      card.appendChild(left);
      const right = makeRect({ w: 240, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#52525b', strokeWeight: 1 });
      right.x = 144; right.y = 78;
      card.appendChild(right);
    } else if (p.name === 'Work Queue') {
      const header = makeRect({ w: 368, h: 10, fill: '#0a0a0f', radius: 2 });
      header.x = 16; header.y = 78;
      card.appendChild(header);
      for (let r = 0; r < 3; r++) {
        const row2 = makeRect({ w: 368, h: 16, fill: '#0a0a0f', radius: 2 });
        row2.x = 16; row2.y = 96 + r * 22;
        card.appendChild(row2);
      }
    } else if (p.name === 'Review Workspace') {
      const left = makeRect({ w: 180, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#d4af37', strokeWeight: 1 });
      left.x = 16; left.y = 78;
      card.appendChild(left);
      const right = makeRect({ w: 180, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#52525b', strokeWeight: 1 });
      right.x = 204; right.y = 78;
      card.appendChild(right);
    } else if (p.name === 'Approval Workspace') {
      const chain = makeRect({ w: 368, h: 24, fill: '#0a0a0f', radius: 4 });
      chain.x = 16; chain.y = 78;
      card.appendChild(chain);
      const card2 = makeRect({ w: 368, h: 48, fill: '#0a0a0f', radius: 4 });
      card2.x = 16; card2.y = 110;
      card2.strokes = [makeStroke(hex('#d4af37'), 1, 0.5)];
      card2.strokeWeight = 1;
      card.appendChild(card2);
    } else if (p.name === 'Exception Workspace') {
      for (let r = 0; r < 3; r++) {
        const e = makeRect({ w: 368, h: 22, fill: '#0a0a0f', radius: 4 });
        e.x = 16; e.y = 78 + r * 26;
        const colors = ['#ef4444', '#f59e0b', '#3b82f6'];
        const leftAccent = makeRect({ w: 3, h: 22, fill: colors[r] });
        leftAccent.x = 0; leftAccent.y = 0;
        e.appendChild(leftAccent);
        card.appendChild(e);
      }
    } else if (p.name === 'Dashboard') {
      const kpiRow = makeFrame('kpi-row', { autoLayout: 'H', gap: 6, w: 368, h: 50 });
      kpiRow.x = 16; kpiRow.y = 78;
      for (let k = 0; k < 4; k++) {
        const kpi = makeRect({ w: 86, h: 50, fill: '#0a0a0f', radius: 4 });
        const accent = makeRect({ w: 86, h: 2, fill: '#d4af37' });
        accent.y = 0;
        kpi.appendChild(accent);
        kpiRow.appendChild(kpi);
      }
      card.appendChild(kpiRow);
      const chart = makeRect({ w: 368, h: 40, fill: '#0a0a0f', radius: 4 });
      chart.x = 16; chart.y = 136;
      card.appendChild(chart);
    } else if (p.name === 'Timeline') {
      for (let r = 0; r < 4; r++) {
        const dot = makeRect({ w: 6, h: 6, fill: ['#22c55e', '#22c55e', '#d4af37', '#52525b'][r], radius: 3 });
        dot.x = 16; dot.y = 78 + r * 20;
        card.appendChild(dot);
        const line = makeRect({ w: 340, h: 8, fill: '#0a0a0f', radius: 2 });
        line.x = 30; line.y = 78 + r * 20;
        card.appendChild(line);
      }
    } else if (p.name === 'Empty State') {
      const icon2 = makeText('📭', { size: 24, weight: 400, family: 'Inter', color: '#52525b' });
      icon2.x = 180; icon2.y = 82;
      card.appendChild(icon2);
      const emptyText = makeText('No items to display', { size: 11, weight: 400, family: 'Inter', color: '#52525b' });
      emptyText.x = 140; emptyText.y = 115;
      card.appendChild(emptyText);
      const cta = makeRect({ w: 100, h: 24, fill: '#d4af37', radius: 4 });
      cta.x = 160; cta.y = 138;
      card.appendChild(cta);
    } else if (p.name === 'Loading State') {
      for (let r = 0; r < 3; r++) {
        const sk = makeRect({ w: 368, h: 14, fill: '#1a1a24', radius: 4 });
        sk.x = 16; sk.y = 78 + r * 22;
        card.appendChild(sk);
      }
    } else if (p.name === 'Inspector Panel') {
      const main = makeRect({ w: 260, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#52525b', strokeWeight: 1 });
      main.x = 16; main.y = 78;
      card.appendChild(main);
      const side = makeRect({ w: 100, h: 80, fill: '#0a0a0f', radius: 4, stroke: '#d4af37', strokeWeight: 1 });
      side.x = 284; side.y = 78;
      card.appendChild(side);
    } else if (p.name === 'Error State') {
      const errIcon = makeText('✕', { size: 20, weight: 400, family: 'Inter', color: '#ef4444' });
      errIcon.x = 190; errIcon.y = 84;
      card.appendChild(errIcon);
      const errText = makeText('Something went wrong', { size: 11, weight: 400, family: 'Inter', color: '#ef4444' });
      errText.x = 140; errText.y = 115;
      card.appendChild(errText);
      const retry = makeRect({ w: 80, h: 24, fill: '#1a1a24', radius: 4, stroke: '#52525b', strokeWeight: 1 });
      retry.x = 170; retry.y = 138;
      card.appendChild(retry);
    }
  });

  return page;
}

// ─── Dashboard Screen ─────────────────────────────────────────
function buildDashboardPage() {
  const page = createPage('04 Dashboard');
  figma.currentPage = page;

  // App Shell background
  const shell = makeFrame('Dashboard', { w: 1440, h: 900, fill: '#0a0a0f' });

  // Top Navigation (56px)
  const topbar = makeFrame('Top Navigation', { w: 1440, h: 56, fill: '#111118' });
  topbar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  topbar.strokeWeight = 1;
  topbar.layoutMode = 'HORIZONTAL';
  topbar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  topbar.counterAxisAlignItems = 'CENTER';
  topbar.paddingLeft = 16;
  topbar.paddingRight = 16;
  topbar.itemSpacing = 8;

  const leftSection = makeFrame('left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 300, h: 40 });
  const breadcrumb = makeText('AP  ›  Dashboard', { size: 14, weight: 500, family: 'Inter', color: '#a1a1aa' });
  leftSection.appendChild(breadcrumb);
  topbar.appendChild(leftSection);

  const rightSection = makeFrame('right', { autoLayout: 'H', gap: 12, alignY: 'CENTER', w: 200, h: 40 });
  const searchIcon = makeText('⌕', { size: 18, weight: 400, family: 'Inter', color: '#71717a' });
  rightSection.appendChild(searchIcon);
  const bellIcon = makeText('🔔', { size: 18, weight: 400, family: 'Inter', color: '#71717a' });
  rightSection.appendChild(bellIcon);
  const avatar = makeRect({ w: 28, h: 28, fill: '#1a1a24', radius: 14 });
  rightSection.appendChild(avatar);
  topbar.appendChild(rightSection);
  shell.appendChild(topbar);

  // Sidebar
  const sidebar = makeFrame('Sidebar', { w: 64, h: 812, fill: '#0a0a0f' });
  sidebar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  sidebar.strokeWeight = 1;
  sidebar.y = 56;
  sidebar.layoutMode = 'VERTICAL';
  sidebar.primaryAxisAlignItems = 'CENTER';
  sidebar.paddingTop = 16;
  sidebar.itemSpacing = 8;

  const sidebarItems = ['◆', '📋', '⚠', '💳', '📊', '⚙'];
  sidebarItems.forEach((icon, i) => {
    const item = makeFrame('nav-item', { w: 40, h: 36, fill: i === 0 ? 'rgba(212, 175, 55, 0.12)' : 'transparent', radius: 6 });
    const text = makeText(icon, { size: 16, weight: 400, family: 'Inter', color: i === 0 ? '#d4af37' : '#71717a' });
    text.x = 11; text.y = 8;
    item.appendChild(text);
    sidebar.appendChild(item);
  });
  shell.appendChild(sidebar);

  // Main Content
  const mainX = 64;
  const mainW = 1376;
  const main = makeFrame('Main Content', { w: mainW, h: 812, fill: '#0a0a0f' });
  main.y = 56; main.x = mainX;
  main.layoutMode = 'VERTICAL';
  main.paddingLeft = 24;
  main.paddingRight = 24;
  main.paddingTop = 24;
  main.itemSpacing = 24;

  // ─── Page Header ───────────────────────────────────────
  const pageHeader = makeFrame('Page Header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: mainW - 48, h: 36 });
  const headerLeft = makeFrame('header-left', { autoLayout: 'V', gap: 4, w: 400, h: 36 });
  const hTitle = makeText('AP Dashboard', { size: 24, weight: 600, family: 'Inter', color: '#f7f6f2' });
  headerLeft.appendChild(hTitle);
  pageHeader.appendChild(headerLeft);
  const refreshBtn = makeText('↻', { size: 18, weight: 400, family: 'Inter', color: '#71717a' });
  refreshBtn.x = 0; refreshBtn.y = 8;
  const refreshFrame = makeFrame('refresh', { w: 36, h: 36, fill: '#111118', radius: 6 });
  refreshFrame.appendChild(refreshBtn);
  refreshFrame.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  refreshFrame.strokeWeight = 1;
  pageHeader.appendChild(refreshFrame);
  main.appendChild(pageHeader);

  // ─── Attention Queue Section ───────────────────────────
  const attnSection = makeFrame('Attention Queue', { autoLayout: 'V', gap: 8, w: mainW - 48 });

  // Section header
  const attnHeader = makeFrame('attn-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: mainW - 48, h: 28 });
  const attnLeft = makeFrame('attn-left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 300, h: 28 });
  attnLeft.appendChild(makeText('Attention Queue', { size: 16, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const attnBadge = makeBadgeComponent('attn-badge', 'rgba(212, 175, 55, 0.15)', '#d4af37', '5 items');
  attnBadge.resize(60, 22);
  attnLeft.appendChild(attnBadge);
  attnHeader.appendChild(attnLeft);
  attnHeader.appendChild(makeText('View All →', { size: 12, weight: 500, family: 'Inter', color: '#5e9eff' }));
  attnSection.appendChild(attnHeader);

  // Queue rows
  const queueItems = [
    { icon: '🔔', type: 'Invoice', typeColor: '#22c55e', desc: 'INV-042 — Acme Corp', amount: '$12,400', sla: 'Due 4h', slaColor: '#22c55e' },
    { icon: '⚠️', type: 'Exception', typeColor: '#ef4444', desc: 'PO-891 — Price mismatch', amount: '$2,400', sla: 'Overdue', slaColor: '#ef4444' },
    { icon: '🔔', type: 'Invoice', typeColor: '#22c55e', desc: 'INV-051 — Beta Ltd', amount: '$8,900', sla: 'Due 1d', slaColor: '#f59e0b' },
    { icon: '🔔', type: 'Payment', typeColor: '#3b82f6', desc: 'PMT-023 — VendorX', amount: '$45,000', sla: 'Due 2d', slaColor: '#f59e0b' },
    { icon: '📄', type: 'Approval', typeColor: '#d4af37', desc: '23 items pending', amount: '$182K', sla: '—', slaColor: '#71717a' },
  ];

  queueItems.forEach((item, i) => {
    const row = makeFrame(`queue-row-${i}`, { autoLayout: 'H', gap: 12, alignY: 'CENTER', w: mainW - 48, h: 44 });
    row.fills = [makeSolid(hex('#111118'))];
    row.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    row.strokeWeight = 1;
    row.cornerRadius = 4;

    const icon = makeText(item.icon, { size: 14, weight: 400, family: 'Inter', color: '#a1a1aa' });
    icon.resize(24, 24);
    row.appendChild(icon);

    const typeBadge = makeBadgeComponent(`type-${i}`, item.typeColor + '26', item.typeColor, item.type);
    typeBadge.resize(80, 22);
    row.appendChild(typeBadge);

    const desc = makeText(item.desc, { size: 13, weight: 500, family: 'Inter', color: '#f7f6f2' });
    desc.textAutoResize = 'WIDTH_AND_HEIGHT';
    row.appendChild(desc);

    const amount = makeText(item.amount, { size: 13, weight: 500, family: 'JetBrains Mono', color: '#f7f6f2' });
    amount.x = row.width - 200;
    amount.y = 12;
    row.appendChild(amount);

    const sla = makeText(item.sla, { size: 11, weight: 500, family: 'Inter', color: item.slaColor });
    sla.x = row.width - 80;
    sla.y = 14;
    row.appendChild(sla);

    attnSection.appendChild(row);
  });

  main.appendChild(attnSection);

  // ─── KPI Row ───────────────────────────────────────────
  const kpiRow = makeFrame('KPI Row', { autoLayout: 'H', gap: 16, w: mainW - 48, h: 120 });

  const kpis = [
    { label: 'Invoices Today', value: '47', trend: '↑ 12%', sub: 'vs. 42 avg', color: '#22c55e' },
    { label: 'Pending Approval', value: '23', trend: '$182K total', sub: '8 urgent', color: '#ef4444' },
    { label: 'Open Exceptions', value: '12', trend: '↓ 3', sub: '3 critical', color: '#22c55e' },
    { label: 'Days Payable', value: '36', trend: '↑ 2d', sub: '+2 days vs last', color: '#22c55e' },
  ];

  kpis.forEach((kpi, i) => {
    const card = makeFrame(`KPI-${i}`, { autoLayout: 'V', gap: 4, w: (mainW - 48 - 48) / 4, h: 120, fill: '#111118', radius: 8 });
    card.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    card.strokeWeight = 1;
    card.paddingLeft = 16;
    card.paddingRight = 16;
    card.paddingTop = 16;
    card.paddingBottom = 16;

    // Gold top accent
    const goldAccent = makeRect({ w: card.width, h: 3, fill: '#d4af37' });
    goldAccent.x = 0; goldAccent.y = 0;
    card.appendChild(goldAccent);

    const label = makeText(kpi.label, { size: 11, weight: 500, family: 'Inter', color: '#71717a' });
    card.appendChild(label);
    const value = makeText(kpi.value, { size: 28, weight: 700, family: 'JetBrains Mono', color: '#f7f6f2' });
    card.appendChild(value);
    const trendRow = makeFrame('trend', { autoLayout: 'H', gap: 8, w: card.width - 32, h: 16, alignY: 'CENTER' });
    const trend = makeText(kpi.trend, { size: 12, weight: 500, family: 'Inter', color: kpi.color });
    trendRow.appendChild(trend);
    const sub = makeText(kpi.sub, { size: 10, weight: 400, family: 'Inter', color: '#52525b' });
    trendRow.appendChild(sub);
    card.appendChild(trendRow);

    // Timestamp
    const ts = makeText('As of 14:32', { size: 9, weight: 400, family: 'Inter', color: '#52525b' });
    card.appendChild(ts);

    kpiRow.appendChild(card);
  });

  main.appendChild(kpiRow);

  // ─── Split Section: Exceptions + AI Insights ──────────
  const splitRow = makeFrame('Split Row', { autoLayout: 'H', gap: 16, w: mainW - 48, h: 260 });

  // Exception Feed (Left)
  const excCard = makeFrame('Exception Feed', { autoLayout: 'V', gap: 0, w: (mainW - 48 - 16) / 2, h: 260, fill: '#111118', radius: 8 });
  excCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  excCard.strokeWeight = 1;
  excCard.clipsContent = true;

  const excHeader = makeFrame('exc-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: excCard.width, h: 44, fill: '#111118' });
  excHeader.paddingLeft = 16; excHeader.paddingRight = 16;
  const excLeft = makeFrame('exc-left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 200, h: 24 });
  excLeft.appendChild(makeText('Active Exceptions', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const excBadge = makeBadgeComponent('exc-count', 'rgba(239, 68, 68, 0.15)', '#ef4444', '12');
  excBadge.resize(30, 20);
  excLeft.appendChild(excBadge);
  excHeader.appendChild(excLeft);
  excHeader.appendChild(makeText('View All →', { size: 11, weight: 500, family: 'Inter', color: '#5e9eff' }));
  excCard.appendChild(excHeader);

  const excItems = [
    { severity: '#ef4444', title: 'Acme Corp — Price mismatch', meta: '$2,400 · PO-891 · 5m ago', badge: 'HIGH', badgeBg: 'rgba(239, 68, 68, 0.15)', badgeColor: '#ef4444' },
    { severity: '#f59e0b', title: 'Beta Ltd — Quantity mismatch', meta: '$1,200 · PO-456 · 15m ago', badge: 'MED', badgeBg: 'rgba(245, 158, 11, 0.15)', badgeColor: '#f59e0b' },
    { severity: '#f59e0b', title: 'Gamma Inc — Missing GRN', meta: '$8,900 · PO-789 · 1h ago', badge: 'MED', badgeBg: 'rgba(245, 158, 11, 0.15)', badgeColor: '#f59e0b' },
    { severity: '#3b82f6', title: 'Delta Co — Duplicate detected', meta: '$450 · INV-089 · 2h ago', badge: 'LOW', badgeBg: 'rgba(59, 130, 246, 0.15)', badgeColor: '#3b82f6' },
  ];

  excItems.forEach((item) => {
    const row = makeFrame('exc-item', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: excCard.width, h: 44 });
    row.paddingLeft = 16; row.paddingRight = 16;
    const leftBorder = makeRect({ w: 4, h: 44, fill: item.severity });
    leftBorder.x = 0; leftBorder.y = 0;
    row.appendChild(leftBorder);
    const col = makeFrame('exc-col', { autoLayout: 'V', gap: 2, w: excCard.width - 160, h: 36 });
    const t = makeText(item.title, { size: 12, weight: 500, family: 'Inter', color: '#f7f6f2' });
    col.appendChild(t);
    const m = makeText(item.meta, { size: 10, weight: 400, family: 'Inter', color: '#52525b' });
    col.appendChild(m);
    row.appendChild(col);
    const badge = makeBadgeComponent(item.badge, item.badgeBg, item.badgeColor, item.badge);
    badge.resize(55, 20);
    row.appendChild(badge);
    excCard.appendChild(row);
  });
  splitRow.appendChild(excCard);

  // AI Insights (Right)
  const aiCard = makeFrame('AI Insights', { autoLayout: 'V', gap: 12, w: (mainW - 48 - 16) / 2, h: 260, fill: '#111118', radius: 8 });
  aiCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  aiCard.strokeWeight = 1;
  aiCard.paddingLeft = 16;
  aiCard.paddingRight = 16;
  aiCard.paddingTop = 16;
  aiCard.paddingBottom = 16;

  const aiHeader = makeFrame('ai-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: aiCard.width - 32, h: 24 });
  const aiLeft = makeFrame('ai-left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 200, h: 24 });
  const sparkles = makeText('✦', { size: 14, weight: 500, family: 'Inter', color: '#d4af37' });
  aiLeft.appendChild(sparkles);
  const aiBadge = makeBadgeComponent('ai-badge', 'rgba(212, 175, 55, 0.15)', '#d4af37', 'AI Insights');
  aiBadge.resize(80, 22);
  aiLeft.appendChild(aiBadge);
  aiHeader.appendChild(aiLeft);
  aiHeader.appendChild(makeText('Updated 3m ago', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
  aiCard.appendChild(aiHeader);

  const insights = [
    { text: '12 invoices from Acme Corp are overdue — avg payment is 45 days', conf: 'High', confColor: '#22c55e' },
    { text: '3 invoices flagged as potential duplicates — review recommended', conf: 'Medium', confColor: '#f59e0b' },
    { text: 'Cash position supports $180K in payments this week', conf: 'High', confColor: '#22c55e' },
  ];
  insights.forEach((insight) => {
    const row = makeFrame('insight-row', { autoLayout: 'H', gap: 8, w: aiCard.width - 32, h: 48, alignY: 'CENTER' });
    const dot = makeRect({ w: 6, h: 6, fill: insight.confColor, radius: 3 });
    row.appendChild(dot);
    const col = makeFrame('insight-col', { autoLayout: 'V', gap: 2, w: aiCard.width - 100, h: 48 });
    const text = makeText(insight.text, { size: 12, weight: 400, family: 'Inter', color: '#a1a1aa' });
    col.appendChild(text);
    const confBadge = makeBadgeComponent(`conf-${insight.conf}`, insight.confColor + '26', insight.confColor, insight.conf);
    confBadge.resize(60, 18);
    col.appendChild(confBadge);
    row.appendChild(col);
    aiCard.appendChild(row);
  });

  splitRow.appendChild(aiCard);
  main.appendChild(splitRow);

  // ─── Status Bar ────────────────────────────────────────
  const statusBar = makeFrame('Status Bar', { w: mainW, h: 32, fill: '#0a0a0f' });
  statusBar.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
  statusBar.strokeWeight = 1;
  statusBar.layoutMode = 'HORIZONTAL';
  statusBar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  statusBar.counterAxisAlignItems = 'CENTER';
  statusBar.paddingLeft = 16;
  statusBar.paddingRight = 16;
  statusBar.y = 56 + 812 - 32;
  statusBar.x = 64;

  const freshDot = makeRect({ w: 6, h: 6, fill: '#22c55e', radius: 3 });
  statusBar.appendChild(freshDot);
  statusBar.appendChild(makeText('Data as of: 2 minutes ago', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
  statusBar.appendChild(makeText('Source: Prisma · Cache: 30s TTL', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
  statusBar.appendChild(makeText('v1.0.0', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));

  shell.appendChild(main);
  shell.appendChild(sidebar);
  shell.appendChild(statusBar);

  return page;
}

// ─── Work Queue Screen ────────────────────────────────────────
function buildWorkQueuePage() {
  const page = createPage('05 Work Queue');
  figma.currentPage = page;

  const shell = makeFrame('Work Queue', { w: 1440, h: 900, fill: '#0a0a0f' });

  // Top Nav (same as dashboard)
  const topbar = makeFrame('Top Navigation', { w: 1440, h: 56, fill: '#111118' });
  topbar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  topbar.strokeWeight = 1;
  topbar.layoutMode = 'HORIZONTAL';
  topbar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  topbar.counterAxisAlignItems = 'CENTER';
  topbar.paddingLeft = 16;
  topbar.paddingRight = 16;
  const bc = makeText('AP  ›  Work Queue', { size: 14, weight: 500, family: 'Inter', color: '#a1a1aa' });
  topbar.appendChild(bc);
  shell.appendChild(topbar);

  // Content area
  const main = makeFrame('Main', { w: 1440, h: 844, fill: '#0a0a0f' });
  main.y = 56;
  main.layoutMode = 'HORIZONTAL';

  // Filter sidebar (200px, collapsible)
  const filterSidebar = makeFrame('Filters', { w: 200, h: 844, fill: '#0a0a0f', autoLayout: 'V' });
  filterSidebar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  filterSidebar.strokeWeight = 1;
  filterSidebar.paddingLeft = 16;
  filterSidebar.paddingRight = 16;
  filterSidebar.paddingTop = 16;
  filterSidebar.itemSpacing = 16;

  filterSidebar.appendChild(makeText('Filters', { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' }));

  const filterGroups = [
    { name: 'Status', options: ['Captured', 'Matched', 'Exception'] },
    { name: 'Amount', options: ['<$1K', '$1K-$10K', '$10K-$50K'] },
    { name: 'Age', options: ['Today', '1-7 days', '8-30 days'] },
  ];

  for (const group of filterGroups) {
    const g = makeFrame(`filter-${group.name}`, { autoLayout: 'V', gap: 4, w: 168 });
    g.appendChild(makeText(group.name, { size: 10, weight: 600, family: 'Inter', color: '#71717a', textCase: 'UPPER' }));
    for (const opt of group.options) {
      const optRow = makeFrame(`opt-${opt}`, { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 168, h: 28 });
      const cb = makeRect({ w: 14, h: 14, fill: '#1a1a24', radius: 3, stroke: '#52525b', strokeWeight: 1 });
      cb.strokes = [makeStroke(hex('#52525b'), 1, 1)];
      cb.strokeWeight = 1.5;
      optRow.appendChild(cb);
      optRow.appendChild(makeText(opt, { size: 12, weight: 400, family: 'Inter', color: '#a1a1aa' }));
      g.appendChild(optRow);
    }
    filterSidebar.appendChild(g);
  }

  // Active filters chips
  const chips = makeFrame('active-filters', { autoLayout: 'H', gap: 6, wrap: true, w: 168, h: 30 });
  chips.layoutWrap = 'WRAP';
  const chip = makeBadgeComponent('chip-matched', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Matched ✕');
  chip.resize(80, 20);
  chips.appendChild(chip);
  filterSidebar.appendChild(chips);

  main.appendChild(filterSidebar);

  // Table area
  const tableArea = makeFrame('Table Area', { w: 1240, h: 844, fill: '#111118', autoLayout: 'V' });
  tableArea.paddingLeft = 20;
  tableArea.paddingRight = 20;
  tableArea.paddingTop = 16;
  tableArea.itemSpacing = 12;

  // Page Header
  const queueHeader = makeFrame('queue-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: 1200, h: 36 });
  const queueLeft = makeFrame('queue-left', { autoLayout: 'H', gap: 12, alignY: 'CENTER', w: 400, h: 36 });
  queueLeft.appendChild(makeText('Work Queue', { size: 20, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const countBadge = makeBadgeComponent('count', 'rgba(212, 175, 55, 0.15)', '#d4af37', '342 invoices');
  countBadge.resize(100, 24);
  queueLeft.appendChild(countBadge);
  queueHeader.appendChild(queueLeft);
  const searchInput = makeFrame('search', { w: 240, h: 36, fill: '#0a0a0f', radius: 6 });
  searchInput.strokes = [makeStroke(hex('#ffffff'), 1, 0.08)];
  searchInput.strokeWeight = 1;
  searchInput.layoutMode = 'HORIZONTAL';
  searchInput.primaryAxisAlignItems = 'CENTER';
  searchInput.paddingLeft = 12;
  const searchText = makeText('⌕ Search invoices...', { size: 12, weight: 400, family: 'Inter', color: '#52525b' });
  searchInput.appendChild(searchText);
  queueHeader.appendChild(searchInput);
  tableArea.appendChild(queueHeader);

  // Tabs
  const tabBar = makeFrame('tabs', { autoLayout: 'H', gap: 0, w: 600, h: 40 });
  tabBar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  tabBar.strokeWeight = 1;
  const tabLabels = ['All', 'Unmatched', 'Matched', 'Pending Approval', 'Aging (60d+)'];
  tabLabels.forEach((label, i) => {
    const tab = makeFrame(`tab-${label}`, { autoLayout: 'H', gap: 4, alignY: 'CENTER', w: 120, h: 40, fill: i === 0 ? '#1a1a24' : 'transparent' });
    tab.paddingLeft = 16;
    const text = makeText(label, { size: 12, weight: 500, family: 'Inter', color: i === 0 ? '#f7f6f2' : '#71717a' });
    tab.appendChild(text);
    if (i === 0) {
      const indicator = makeRect({ w: 120, h: 2, fill: '#d4af37' });
      indicator.y = 38;
      tab.appendChild(indicator);
    }
    tabBar.appendChild(tab);
  });
  tableArea.appendChild(tabBar);

  // Table header
  const columns = ['Status', 'Invoice #', 'Vendor', 'Amount', 'Status', 'Days', 'SLA', 'Actions'];
  const colWidths = [48, 120, 200, 120, 100, 60, 80, 80];
  const headerRow = makeFrame('table-header', { autoLayout: 'H', w: 1200, h: 40, fill: '#0a0a0f' });
  headerRow.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  headerRow.strokeWeight = 1;

  let colx = 0;
  columns.forEach((col, i) => {
    const cell = makeText(col, { size: 11, weight: 600, family: 'Inter', color: '#71717a', textCase: 'UPPER' });
    cell.x = colx + 12; cell.y = 12;
    headerRow.appendChild(cell);
    colx += colWidths[i];
  });
  tableArea.appendChild(headerRow);

  // Table rows
  const rowData = [
    { status: '🟢', inv: 'INV-2026-0042', vendor: 'Acme Corporation', amount: '$22,000', statusLabel: 'Matched', days: '3', sla: '12d', slaColor: '#22c55e' },
    { status: '🟡', inv: 'INV-2026-0041', vendor: 'Beta Ltd', amount: '$8,900', statusLabel: 'Exception', days: '5', sla: '2d', slaColor: '#f59e0b' },
    { status: '🔴', inv: 'INV-2026-0040', vendor: 'Gamma Inc', amount: '$45,000', statusLabel: 'Pending', days: '28', sla: 'Overdue', slaColor: '#ef4444' },
    { status: '🟢', inv: 'INV-2026-0039', vendor: 'Delta Co', amount: '$12,400', statusLabel: 'Matched', days: '1', sla: '14d', slaColor: '#22c55e' },
    { status: '🟡', inv: 'INV-2026-0038', vendor: 'Epsilon SA', amount: '$6,750', statusLabel: 'Exception', days: '7', sla: '5d', slaColor: '#f59e0b' },
    { status: '🟢', inv: 'INV-2026-0037', vendor: 'Zeta Corp', amount: '$3,200', statusLabel: 'Matched', days: '0', sla: '24d', slaColor: '#22c55e' },
    { status: '🔴', inv: 'INV-2026-0036', vendor: 'Eta GmbH', amount: '$89,000', statusLabel: 'Pending', days: '42', sla: 'Critical', slaColor: '#ef4444' },
    { status: '🟢', inv: 'INV-2026-0035', vendor: 'Theta Inc', amount: '$15,800', statusLabel: 'Matched', days: '2', sla: '11d', slaColor: '#22c55e' },
  ];

  rowData.forEach((row, i) => {
    const tr = makeFrame(`row-${i}`, { autoLayout: 'H', alignY: 'CENTER', w: 1200, h: 44, fill: i % 2 === 0 ? '#111118' : '#0d0d14' });
    tr.strokes = [makeStroke(hex('#ffffff'), 1, 0.03)];
    tr.strokeWeight = 1;

    const values = [row.status, row.inv, row.vendor, row.amount, row.statusLabel, row.days, row.sla];
    let vx = 0;
    values.forEach((val, j) => {
      const cell = makeText(val, {
        size: j === 3 ? 13 : 12,
        weight: j === 3 ? 500 : 400,
        family: j === 3 ? 'JetBrains Mono' : 'Inter',
        color: j === 6 ? row.slaColor : (j === 4 ? '#a1a1aa' : '#f7f6f2')
      });
      cell.x = vx + 12; cell.y = 12;
      tr.appendChild(cell);
      vx += colWidths[j];
    });

    tableArea.appendChild(tr);
  });

  // Pagination
  const pagination = makeFrame('pagination', { autoLayout: 'H', gap: 4, alignX: 'CENTER', w: 1200, h: 32, alignY: 'CENTER' });
  pagination.paddingTop = 8;
  const pageInfo = makeText('Showing 1-25 of 342 invoices', { size: 11, weight: 400, family: 'Inter', color: '#52525b' });
  pagination.appendChild(pageInfo);
  tableArea.appendChild(pagination);

  main.appendChild(tableArea);
  shell.appendChild(main);

  return page;
}

// ─── Invoice Detail Screen ────────────────────────────────────
function buildInvoiceDetailPage() {
  const page = createPage('06 Invoice Detail');
  figma.currentPage = page;

  const shell = makeFrame('Invoice Detail', { w: 1440, h: 900, fill: '#0a0a0f' });

  // Top Nav
  const topbar = makeFrame('Top Navigation', { w: 1440, h: 56, fill: '#111118' });
  topbar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  topbar.strokeWeight = 1;
  topbar.layoutMode = 'HORIZONTAL';
  topbar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  topbar.counterAxisAlignItems = 'CENTER';
  topbar.paddingLeft = 16;
  topbar.paddingRight = 16;
  topbar.appendChild(makeText('AP  ›  Work Queue  ›  INV-2026-0042 — Acme Corp', { size: 12, weight: 500, family: 'Inter', color: '#a1a1aa' }));
  shell.appendChild(topbar);

  // Page Header
  const header = makeFrame('Page Header', { w: 1440, h: 80, fill: '#0a0a0f' });
  header.y = 56;
  header.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
  header.strokeWeight = 1;
  header.layoutMode = 'VERTICAL';
  header.paddingLeft = 24;
  header.paddingRight = 24;
  header.paddingTop = 12;
  header.paddingBottom = 8;
  header.itemSpacing = 6;

  const row1 = makeFrame('row1', { autoLayout: 'H', gap: 12, alignX: 'SPACE_BETWEEN', alignY: 'CENTER', w: 1392, h: 32 });
  const row1Left = makeFrame('r1-left', { autoLayout: 'H', gap: 12, alignY: 'CENTER', w: 800, h: 32 });
  row1Left.appendChild(makeText('INV-2026-0042', { size: 24, weight: 600, family: 'JetBrains Mono', color: '#f7f6f2' }));
  const riStatus = makeBadgeComponent('status-matched', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Matched');
  riStatus.resize(70, 24);
  row1Left.appendChild(riStatus);
  const matchBadge = makeBadgeComponent('2way-pass', 'rgba(212, 175, 55, 0.15)', '#d4af37', '2-Way Match: Pass');
  matchBadge.resize(130, 24);
  row1Left.appendChild(matchBadge);
  const riskBadge = makeBadgeComponent('risk-low', 'rgba(34, 197, 94, 0.15)', '#22c55e', 'Low Risk');
  riskBadge.resize(80, 24);
  row1Left.appendChild(riskBadge);
  row1.appendChild(row1Left);
  header.appendChild(row1);

  const row2 = makeFrame('row2', { autoLayout: 'H', gap: 8, w: 1392, h: 20 });
  // Workflow progress dots
  const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  dots.forEach((d, i) => {
    const dot = makeRect({
      w: 10, h: 10, fill: i < 7 ? (i === 6 ? '#d4af37' : '#22c55e') : '#1a1a24', radius: 5
    });
    dot.strokes = [makeStroke(hex(i >= 7 ? '#52525b' : 'transparent'), 1, 1)];
    dot.strokeWeight = 1;
    row2.appendChild(dot);
    row2.appendChild(makeText('—', { size: 8, weight: 400, family: 'Inter', color: '#52525b' }));
  });
  row2.appendChild(makeText(' 7 of 10 — Pending Approval', { size: 10, weight: 500, family: 'Inter', color: '#71717a' }));
  header.appendChild(row2);
  shell.appendChild(header);

  // Split Panel Container
  const splitY = 56 + 80;
  const splitH = 900 - splitY - 64;
  const splitPanel = makeFrame('Split Panel', { w: 1440, h: splitH, fill: '#0a0a0f', autoLayout: 'H' });
  splitPanel.y = splitY;

  // ─── Left Panel (55%) ─────────────────────────────────
  const leftPanel = makeFrame('Left Panel', { w: 792, h: splitH, fill: '#0a0a0f', autoLayout: 'V' });
  leftPanel.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
  leftPanel.strokeWeight = 1;

  // Invoice Summary Card
  const invSummaryCard = makeFrame('Invoice Summary', { autoLayout: 'V', gap: 12, w: 792, h: 400, fill: '#111118' });
  invSummaryCard.paddingLeft = 20;
  invSummaryCard.paddingRight = 20;
  invSummaryCard.paddingTop = 20;
  invSummaryCard.paddingBottom = 16;
  invSummaryCard.fills = [makeSolid(hex('#111118'))];
  invSummaryCard.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  invSummaryCard.strokeWeight = 1;

  const invRow1 = makeFrame('inv-row1', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 752, h: 28 });
  const vendorName = makeText('Acme Corporation', { size: 18, weight: 600, family: 'Inter', color: '#f7f6f2' });
  invRow1.appendChild(vendorName);
  invRow1.appendChild(makeText('View Supplier →', { size: 11, weight: 500, family: 'Inter', color: '#5e9eff' }));
  invSummaryCard.appendChild(invRow1);

  // Key fields (2-col grid)
  const fieldsGrid = makeFrame('fields', { autoLayout: 'V', gap: 6, w: 752 });
  const fieldRows = [
    ['Invoice #: INV-2026-0042', 'PO Ref: PO-4521'],
    ['Date: 2026-07-15', 'Due: 2026-08-14'],
    ['GL Code: 5100-AP-TRADE', 'Currency: USD'],
    ['Terms: Net 30', 'Cost Centre: CC-NA-042'],
  ];
  for (const [left, right] of fieldRows) {
    const r = makeFrame('field-row', { autoLayout: 'H', gap: 16, w: 752, h: 20 });
    const l = makeText(left, { size: 11, weight: 500, family: 'Inter', color: '#a1a1aa' });
    r.appendChild(l);
    const rText = makeText(right, { size: 11, weight: 500, family: 'Inter', color: '#a1a1aa' });
    r.appendChild(rText);
    fieldsGrid.appendChild(r);
  }
  invSummaryCard.appendChild(fieldsGrid);

  // Financial summary
  const finSum = makeFrame('financial-summary', { autoLayout: 'H', gap: 24, w: 752, h: 40 });
  const finItems = [
    { label: 'Subtotal', value: '$20,000.00' },
    { label: 'Tax (8%)', value: '$1,600.00' },
    { label: 'Shipping', value: '$400.00' },
    { label: 'TOTAL', value: '$22,000.00', gold: true },
  ];
  for (const item of finItems) {
    const col = makeFrame('fin-col', { autoLayout: 'V', gap: 2, w: 170, h: 40 });
    col.appendChild(makeText(item.label, { size: 9, weight: 500, family: 'Inter', color: '#52525b', textCase: 'UPPER' }));
    const val = makeText(item.value, {
      size: item.gold ? 16 : 13,
      weight: item.gold ? 600 : 500,
      family: 'JetBrains Mono',
      color: item.gold ? '#d4af37' : '#f7f6f2'
    });
    col.appendChild(val);
    if (item.label !== 'TOTAL') {
      col.appendChild(makeText('€18,400.00', { size: 9, weight: 400, family: 'JetBrains Mono', color: '#52525b' }));
    }
    finSum.appendChild(col);
  }
  invSummaryCard.appendChild(finSum);

  // Data freshness
  const freshDot = makeRect({ w: 6, h: 6, fill: '#22c55e', radius: 3 });
  const freshRow = makeFrame('freshness', { autoLayout: 'H', gap: 6, alignY: 'CENTER', w: 200, h: 16 });
  freshRow.appendChild(freshDot);
  freshRow.appendChild(makeText('Updated 2m ago', { size: 9, weight: 400, family: 'Inter', color: '#52525b' }));
  invSummaryCard.appendChild(freshRow);
  leftPanel.appendChild(invSummaryCard);

  // Line Items Section Header
  const lineHeader = makeFrame('line-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 792, h: 40, fill: '#0a0a0f' });
  lineHeader.paddingLeft = 20;
  lineHeader.paddingRight = 20;
  const lineLeft = makeFrame('line-left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 200, h: 24 });
  lineLeft.appendChild(makeText('Line Items', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  const lineBadge = makeBadgeComponent('line-count', 'rgba(212, 175, 55, 0.15)', '#d4af37', '4');
  lineBadge.resize(30, 20);
  lineLeft.appendChild(lineBadge);
  lineHeader.appendChild(lineLeft);
  lineHeader.appendChild(makeText('Expand all', { size: 11, weight: 500, family: 'Inter', color: '#5e9eff' }));
  leftPanel.appendChild(lineHeader);

  // Line Items Table
  const lineTable = makeFrame('line-table', { autoLayout: 'V', w: 792 });
  const lineColumns = ['#', 'Item Description', 'Qty', 'U/Price', 'Total', 'Match', 'Variance'];
  const lineWidths = [36, 340, 50, 90, 90, 60, 66];
  const lineHeader2 = makeFrame('line-header2', { autoLayout: 'H', w: 732, h: 32, fill: '#0d0d14' });
  lineHeader2.paddingLeft = 20; lineHeader2.paddingRight = 40;
  let lx = 0;
  lineColumns.forEach((col, i) => {
    const cell = makeText(col, { size: 10, weight: 600, family: 'Inter', color: '#52525b', textCase: 'UPPER' });
    cell.x = lx; cell.y = 8;
    lineHeader2.appendChild(cell);
    lx += lineWidths[i];
  });
  lineTable.appendChild(lineHeader2);

  const lineItems = [
    ['1', 'Consulting Services — Apr 2026', '5', '$2,400', '$12,000', '✓', '$0'],
    ['2', 'Software License — Q2 2026', '1', '$5,000', '$5,000', '⚠', '+$250'],
    ['3', 'Support Retainer — Jul 2026', '1', '$3,500', '$3,500', '✓', '$0'],
    ['4', 'Travel Expenses — Q2', '2', '$750', '$1,500', '✗', '+$75'],
  ];

  lineItems.forEach((item, i) => {
    const tr = makeFrame(`line-item-${i}`, { autoLayout: 'H', w: 732, h: 36, fill: i % 2 === 0 ? '#111118' : '#0d0d14' });
    tr.paddingLeft = 20; tr.paddingRight = 40;
    let tx = 0;
    item.forEach((val, j) => {
      const cell = makeText(val, {
        size: j === 3 || j === 4 ? 12 : 11,
        weight: j === 0 ? 400 : 400,
        family: j >= 3 ? 'JetBrains Mono' : 'Inter',
        color: val.startsWith('+') ? '#ef4444' : (val === '✗' ? '#ef4444' : (val === '⚠' ? '#f59e0b' : (val === '✓' ? '#22c55e' : '#a1a1aa')))
      });
      cell.x = tx; cell.y = 10;
      tr.appendChild(cell);
      tx += lineWidths[j];
    });
    lineTable.appendChild(tr);
  });

  leftPanel.appendChild(lineTable);

  // Totals
  const totals = makeFrame('totals', { autoLayout: 'V', gap: 4, w: 792, h: 200, fill: '#0a0a0f' });
  totals.paddingLeft = 20;
  totals.paddingRight = 20;
  totals.paddingTop = 12;
  totals.paddingBottom = 12;
  totals.fills = [makeSolid(hex('#0a0a0f'))];
  totals.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
  totals.strokeWeight = 1;

  const totalRows = [
    { label: 'Subtotal', value: '$20,000.00', eq: '€18,400.00', bold: false },
    { label: 'Tax (8%)', value: '$1,600.00', eq: '€1,472.00', bold: false },
    { label: 'Shipping', value: '$400.00', eq: '€368.00', bold: false },
  ];
  for (const tr of totalRows) {
    const r = makeFrame('tr', { autoLayout: 'H', gap: 16, alignX: 'SPACE_BETWEEN', w: 752, h: 20 });
    r.appendChild(makeText(tr.label, { size: 12, weight: tr.bold ? 600 : 400, family: 'Inter', color: '#a1a1aa' }));
    const val = makeText(tr.value, { size: 12, weight: tr.bold ? 600 : 400, family: 'JetBrains Mono', color: tr.bold ? '#d4af37' : '#f7f6f2' });
    r.appendChild(val);
    r.appendChild(makeText(tr.eq, { size: 10, weight: 400, family: 'JetBrains Mono', color: '#52525b' }));
    totals.appendChild(r);
  }

  // Divider
  const divider = makeRect({ w: 752, h: 1, fill: '#ffffff', opacity: 0.08 });
  totals.appendChild(divider);

  const totalFinal = makeFrame('tr-total', { autoLayout: 'H', gap: 16, alignX: 'SPACE_BETWEEN', w: 752, h: 24 });
  totalFinal.appendChild(makeText('Total', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  totalFinal.appendChild(makeText('$22,000.00', { size: 16, weight: 600, family: 'JetBrains Mono', color: '#d4af37' }));
  totalFinal.appendChild(makeText('€20,240.00', { size: 10, weight: 400, family: 'JetBrains Mono', color: '#52525b' }));
  totals.appendChild(totalFinal);

  const poCross = makeText('PO-4521 total: $21,500.00 — Invoice exceeds PO by $500.00 (2.3%)', {
    size: 10, weight: 400, family: 'Inter', color: '#f59e0b'
  });
  totals.appendChild(poCross);
  leftPanel.appendChild(totals);

  splitPanel.appendChild(leftPanel);

  // ─── Right Panel (45%) ────────────────────────────────
  const rightPanel = makeFrame('Right Panel', { w: 648, h: splitH, fill: '#0a0a0f', autoLayout: 'V' });

  // Evidence Tabs
  const tabBar = makeFrame('Evidence Tabs', { autoLayout: 'H', w: 648, h: 40, fill: '#111118' });
  tabBar.strokes = [makeStroke(hex('#ffffff'), 1, 0.04)];
  tabBar.strokeWeight = 1;
  tabBar.paddingLeft = 8;

  const tabNames = ['Match', 'Vendor', 'History', 'Contract', 'AI', 'Audit'];
  const tabIcons = ['◉', '◈', '◎', '◇', '✦', '◆'];
  tabNames.forEach((name, i) => {
    const tab = makeFrame(`tab-${name}`, { autoLayout: 'H', gap: 6, alignY: 'CENTER', w: 100, h: 40, fill: i === 0 ? '#0a0a0f' : 'transparent' });
    tab.paddingLeft = 12;
    tab.paddingRight = 12;
    const icon = makeText(tabIcons[i], { size: 10, weight: 400, family: 'Inter', color: i === 0 ? '#d4af37' : '#52525b' });
    tab.appendChild(icon);
    const text = makeText(name, { size: 12, weight: i === 0 ? 600 : 400, family: 'Inter', color: i === 0 ? '#f7f6f2' : '#71717a' });
    tab.appendChild(text);
    if (i === 5) {
      const audBadge = makeBadgeComponent('audit-badge', 'rgba(212, 175, 55, 0.15)', '#d4af37', 'NEW');
      audBadge.resize(40, 18);
      tab.appendChild(audBadge);
    }
    // Keyboard shortcut label
    const shortcut = makeText(`⌘${i + 1}`, { size: 8, weight: 400, family: 'Inter', color: '#52525b' });
    tab.appendChild(shortcut);
    if (i === 0) {
      const indicator = makeRect({ w: 100, h: 2, fill: '#d4af37' });
      indicator.y = 38;
      tab.appendChild(indicator);
    }
    tabBar.appendChild(tab);
  });
  rightPanel.appendChild(tabBar);

  // Tab Content — Match (default active)
  const matchContent = makeFrame('Match Tab', { autoLayout: 'V', gap: 12, w: 648, h: splitH - 40, fill: '#0a0a0f' });
  matchContent.paddingLeft = 16;
  matchContent.paddingRight = 16;
  matchContent.paddingTop = 16;
  matchContent.paddingBottom = 16;

  // Three-way match header
  const matchHeader = makeFrame('match-header', { autoLayout: 'H', gap: 8, alignX: 'SPACE_BETWEEN', w: 616, h: 24 });
  matchHeader.appendChild(makeText('Three-Way Match', { size: 13, weight: 600, family: 'Inter', color: '#f7f6f2' }));
  matchHeader.appendChild(makeText('Tolerance: ±2% / $100', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
  matchContent.appendChild(matchHeader);

  // Match summary cards
  const matchRow = makeFrame('match-summary', { autoLayout: 'H', gap: 8, w: 616, h: 56 });
  const matchCards = [
    { label: 'Invoice vs PO', value: '99.8%', color: '#22c55e' },
    { label: 'Invoice vs GRN', value: '80%', color: '#f59e0b' },
    { label: 'Trust Score', value: '95%', color: '#d4af37' },
  ];
  for (const mc of matchCards) {
    const card = makeFrame(`mc-${mc.label}`, { autoLayout: 'V', gap: 4, w: 200, h: 56, fill: '#111118', radius: 6 });
    card.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    card.strokeWeight = 1;
    card.paddingLeft = 12; card.paddingTop = 8;
    card.appendChild(makeText(mc.value, { size: 18, weight: 600, family: 'JetBrains Mono', color: mc.color }));
    card.appendChild(makeText(mc.label, { size: 9, weight: 500, family: 'Inter', color: '#52525b' }));
    matchRow.appendChild(card);
  }
  matchContent.appendChild(matchRow);

  // Line-by-line match table
  const matchTableHeader = makeFrame('match-table-h', { autoLayout: 'H', w: 616, h: 28, fill: '#0d0d14' });
  matchTableHeader.paddingLeft = 12;
  matchTableHeader.paddingTop = 6;
  ['#', 'Field', 'Invoice', 'PO', 'Variance', 'Status'].forEach((col, i) => {
    const widths = [24, 140, 120, 120, 120, 60];
    const cell = makeText(col, { size: 9, weight: 600, family: 'Inter', color: '#52525b', textCase: 'UPPER' });
    cell.x = i === 0 ? 0 : widths.slice(0, i).reduce((a, b) => a + b, 0);
    cell.y = 0;
    matchTableHeader.appendChild(cell);
  });
  matchContent.appendChild(matchTableHeader);

  const matchRows = [
    ['1', 'Qty', '5', '5', '0', '✓'],
    ['2', 'Price', '$5,000', '$4,750', '+$250', '⚠'],
    ['3', 'Total', '$12,000', '$12,000', '$0', '✓'],
  ];
  matchRows.forEach((row, i) => {
    const tr = makeFrame(`match-row-${i}`, { autoLayout: 'H', w: 616, h: 28, fill: i % 2 === 0 ? '#111118' : '#0d0d14' });
    tr.paddingLeft = 12;
    tr.paddingTop = 6;
    const widths = [24, 140, 120, 120, 120, 60];
    row.forEach((val, j) => {
      const cell = makeText(val, {
        size: 10, weight: 400,
        family: j >= 2 ? 'JetBrains Mono' : 'Inter',
        color: val === '+$250' ? '#ef4444' : (val === '⚠' ? '#f59e0b' : (val === '✓' ? '#22c55e' : '#a1a1aa'))
      });
      cell.x = j === 0 ? 0 : widths.slice(0, j).reduce((a, b) => a + b, 0);
      cell.y = 0;
      tr.appendChild(cell);
    });
    matchContent.appendChild(tr);
  });

  // Tolerance rules
  const tolerance = makeFrame('tolerance', { autoLayout: 'V', gap: 4, w: 616, h: 200, fill: '#111118', radius: 6 });
  tolerance.paddingLeft = 12;
  tolerance.paddingRight = 12;
  tolerance.paddingTop = 12;
  tolerance.paddingBottom = 12;
  tolerance.fills = [makeSolid(hex('#111118'))];
  tolerance.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  tolerance.strokeWeight = 1;
  tolerance.appendChild(makeText('Tolerance Rules Applied', { size: 11, weight: 600, family: 'Inter', color: '#f7f6f2' }));

  const tolRules = [
    'Price tolerance: ±2% or $100, whichever is greater — Pass',
    'Quantity tolerance: Exact match required — Item 2 exceeded',
    'Line item variance: $250.00 — exceeds tolerance — Flagged',
  ];
  for (const rule of tolRules) {
    const r = makeFrame('tolerance-row', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 592, h: 20 });
    const dot = makeRect({ w: 4, h: 4, fill: rule.includes('Flagged') ? '#ef4444' : (rule.includes('exceeded') ? '#f59e0b' : '#22c55e'), radius: 2 });
    r.appendChild(dot);
    r.appendChild(makeText(rule, { size: 10, weight: 400, family: 'Inter', color: '#a1a1aa' }));
    tolerance.appendChild(r);
  }
  matchContent.appendChild(tolerance);

  rightPanel.appendChild(matchContent);
  splitPanel.appendChild(rightPanel);
  shell.appendChild(splitPanel);

  // ─── Action Bar (Fixed Bottom, 64px) ──────────────────
  const actionBar = makeFrame('Action Bar', { w: 1440, h: 64, fill: '#111118' });
  actionBar.y = 900 - 64;
  actionBar.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
  actionBar.strokeWeight = 1;
  actionBar.layoutMode = 'HORIZONTAL';
  actionBar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  actionBar.counterAxisAlignItems = 'CENTER';
  actionBar.paddingLeft = 24;
  actionBar.paddingRight = 24;

  // Left: Approval chain
  const chainLeft = makeFrame('chain-left', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 500, h: 40 });
  chainLeft.appendChild(makeText('Approval Chain:', { size: 10, weight: 500, family: 'Inter', color: '#52525b' }));
  const chainSteps = [
    { label: 'AP Clerk', status: '#22c55e' },
    { label: 'You', status: '#d4af37' },
    { label: 'Controller', status: '#52525b' },
    { label: 'CFO', status: '#52525b' },
  ];
  chainSteps.forEach((step, i) => {
    const avatar = makeRect({ w: 24, h: 24, fill: '#1a1a24', radius: 12 });
    avatar.appendChild(makeText(step.label.slice(0, 2), { size: 9, weight: 600, family: 'Inter', color: step.status === '#d4af37' ? '#d4af37' : '#a1a1aa', x: 5, y: 5 }));
    chainLeft.appendChild(avatar);
    const dot = makeRect({ w: 6, h: 6, fill: step.status, radius: 3 });
    chainLeft.appendChild(dot);
    chainLeft.appendChild(makeText(step.label, { size: 10, weight: step.status === '#d4af37' ? 600 : 400, family: 'Inter', color: step.status === '#d4af37' ? '#d4af37' : '#71717a' }));
    if (i < chainSteps.length - 1) {
      chainLeft.appendChild(makeText('→', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
    }
  });
  chainLeft.appendChild(makeText('Your limit: $25,000', { size: 10, weight: 400, family: 'Inter', color: '#71717a' }));
  actionBar.appendChild(chainLeft);

  // Right: Action buttons
  const actionsRight = makeFrame('actions-right', { autoLayout: 'H', gap: 8, alignY: 'CENTER', w: 420, h: 40 });

  // Approve button (Primary)
  const approveBtn = makeFrame('Approve', { w: 120, h: 40, fill: '#d4af37', radius: 6 });
  approveBtn.layoutMode = 'HORIZONTAL';
  approveBtn.primaryAxisAlignItems = 'CENTER';
  approveBtn.counterAxisAlignItems = 'CENTER';
  approveBtn.itemSpacing = 6;
  approveBtn.appendChild(makeText('✓ Approve', { size: 13, weight: 600, family: 'Inter', color: '#0a0a0f' }));
  const cmdEnter = makeText('⌘↵', { size: 9, weight: 500, family: 'Inter', color: '#0a0a0f' });
  approveBtn.appendChild(cmdEnter);
  actionsRight.appendChild(approveBtn);

  // Reject button (Danger)
  const rejectBtn = makeFrame('Reject', { w: 100, h: 40, fill: '#ef4444', radius: 6 });
  rejectBtn.layoutMode = 'HORIZONTAL';
  rejectBtn.primaryAxisAlignItems = 'CENTER';
  rejectBtn.counterAxisAlignItems = 'CENTER';
  rejectBtn.appendChild(makeText('Reject', { size: 13, weight: 500, family: 'Inter', color: '#ffffff' }));
  actionsRight.appendChild(rejectBtn);

  // Request Info (Secondary)
  const infoBtn = makeFrame('Request Info', { w: 110, h: 40, fill: 'transparent', radius: 6 });
  infoBtn.strokes = [makeStroke(hex('#ffffff'), 1, 0.12)];
  infoBtn.strokeWeight = 1;
  infoBtn.layoutMode = 'HORIZONTAL';
  infoBtn.primaryAxisAlignItems = 'CENTER';
  infoBtn.counterAxisAlignItems = 'CENTER';
  infoBtn.appendChild(makeText('Request Info', { size: 12, weight: 500, family: 'Inter', color: '#a1a1aa' }));
  actionsRight.appendChild(infoBtn);

  // More (Ghost)
  const moreBtn = makeFrame('More', { w: 60, h: 40, fill: 'transparent' });
  moreBtn.layoutMode = 'HORIZONTAL';
  moreBtn.primaryAxisAlignItems = 'CENTER';
  moreBtn.counterAxisAlignItems = 'CENTER';
  moreBtn.appendChild(makeText('⋯', { size: 18, weight: 500, family: 'Inter', color: '#71717a' }));
  actionsRight.appendChild(moreBtn);

  actionBar.appendChild(actionsRight);
  shell.appendChild(actionBar);

  return page;
}

// ─── Prototype Page ───────────────────────────────────────────
function buildPrototypePage() {
  const page = createPage('07 Prototype');
  figma.currentPage = page;

  const bg = makeFrame('Prototype Flows', { w: 1440, h: 900, fill: '#0a0a0f' });

  const title = makeText('Prototype Navigation Flows', { size: 30, weight: 600, family: 'Inter', color: '#f7f6f2' });
  title.x = 80; title.y = 60;
  bg.appendChild(title);

  const subtitle = makeText('Wire connections in Figma Prototype mode using Smart Animate', {
    size: 13, weight: 400, family: 'Inter', color: '#71717a'
  });
  subtitle.x = 80; subtitle.y = 100;
  bg.appendChild(subtitle);

  // Flow diagram screens
  const screens = [
    { name: 'Dashboard', icon: '◆', page: '04 Dashboard', x: 80 },
    { name: 'Work Queue', icon: '☰', page: '05 Work Queue', x: 280 },
    { name: 'Invoice Detail', icon: '📄', page: '06 Invoice Detail', x: 500 },
    { name: 'Invoice Detail\n(Match Tab)', icon: '◉', page: '06 Invoice Detail', x: 740 },
    { name: 'Dashboard\n(Updated)', icon: '◆', page: '04 Dashboard', x: 1000 },
  ];

  screens.forEach((s, i) => {
    const card = makeFrame(`screen-${i}`, { w: 160, h: 100, fill: '#111118', radius: 8 });
    card.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    card.strokeWeight = 1;
    card.x = s.x; card.y = 160;
    bg.appendChild(card);
    const icon = makeText(s.icon, { size: 20, weight: 400, family: 'Inter', color: '#d4af37' });
    icon.x = 70; icon.y = 168;
    card.appendChild(icon);
    const name = makeText(s.name.replace('\n', ' '), { size: 11, weight: 500, family: 'Inter', color: '#f7f6f2' });
    name.x = 12; name.y = 200;
    card.appendChild(name);
    const pageRef = makeText(s.page, { size: 8, weight: 400, family: 'JetBrains Mono', color: '#52525b' });
    pageRef.x = 12; pageRef.y = 216;
    card.appendChild(pageRef);

    // Arrow between screens
    if (i < screens.length - 1) {
      const arrow = makeText('  →  ', { size: 16, weight: 400, family: 'Inter', color: '#d4af37' });
      arrow.x = s.x + 165; arrow.y = 195;
      bg.appendChild(arrow);
    }
  });

  // Flow descriptions
  y = 300;
  const flows = [
    { name: 'Flow 1: Happy Path', steps: 'Dashboard → Work Queue → Invoice Detail → Approve → Dashboard', anim: 'Push left → Push left → Smart Animate (Approve) → Push right' },
    { name: 'Flow 2: KPI Drill-Down', steps: 'Dashboard (click KPI) → Work Queue (filtered) → Invoice Detail → Action', anim: 'Push left (filtered) → Push left → Smart Animate (Action)' },
    { name: 'Flow 3: Evidence Review', steps: 'Work Queue → Select invoice → Invoice Detail → Evidence tabs → Approve → Next', anim: 'Push left → Push left → Dissolve (tab) → Smart Animate → Push left' },
    { name: 'Flow 4: Exception Flow', steps: 'Dashboard → Exception Feed → Invoice Detail → Resolve → Dashboard', anim: 'Push left → Push left → Smart Animate (Resolve) → Push right' },
  ];

  flows.forEach((flow, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = 80 + col * 680;
    const fy = y + row * 130;

    const card = makeFrame(`flow-${i}`, { w: 640, h: 110, fill: '#111118', radius: 8 });
    card.strokes = [makeStroke(hex('#ffffff'), 1, 0.06)];
    card.strokeWeight = 1;
    card.x = fx; card.y = fy;
    bg.appendChild(card);

    const dot = makeRect({ w: 6, h: 6, fill: '#d4af37', radius: 3 });
    dot.x = 16; dot.y = 14;
    card.appendChild(dot);
    const fTitle = makeText(flow.name, { size: 14, weight: 600, family: 'Inter', color: '#f7f6f2' });
    fTitle.x = 30; fTitle.y = 10;
    card.appendChild(fTitle);

    const stepsLabel = makeText('Route:', { size: 11, weight: 500, family: 'Inter', color: '#71717a' });
    stepsLabel.x = 16; stepsLabel.y = 38;
    card.appendChild(stepsLabel);
    const stepsVal = makeText(flow.steps, { size: 12, weight: 400, family: 'JetBrains Mono', color: '#a1a1aa' });
    stepsVal.x = 70; stepsVal.y = 38;
    card.appendChild(stepsVal);

    const animLabel = makeText('Anim:', { size: 11, weight: 500, family: 'Inter', color: '#71717a' });
    animLabel.x = 16; animLabel.y = 58;
    card.appendChild(animLabel);
    const animVal = makeText(flow.anim, { size: 11, weight: 400, family: 'Inter', color: '#d4af37' });
    animVal.x = 60; animVal.y = 58;
    card.appendChild(animVal);

    // Mini step indicators
    const steps = flow.steps.split(' → ');
    const miniRow = makeFrame('mini-steps', { autoLayout: 'H', gap: 4, w: 600, h: 20 });
    miniRow.x = 16; miniRow.y = 82;
    steps.forEach((step, si) => {
      const dot2 = makeRect({ w: 12, h: 12, fill: si === 0 || si === steps.length - 1 ? '#d4af37' : '#1a1a24', radius: 6 });
      dot2.strokes = [makeStroke(hex('#52525b'), 1, 1)];
      dot2.strokeWeight = 1;
      miniRow.appendChild(dot2);
      if (si < steps.length - 1) {
        miniRow.appendChild(makeText('─', { size: 10, weight: 400, family: 'Inter', color: '#52525b' }));
      }
    });
    card.appendChild(miniRow);
  });

  // Animation notes
  y2 = y + 280;
  const notesTitle = makeText('Animation Reference', { size: 16, weight: 600, family: 'Inter', color: '#f7f6f2' });
  notesTitle.x = 80; notesTitle.y = y2;
  bg.appendChild(notesTitle);

  const notes = [
    'Page transitions: Push left/right (300ms, ease-in-out)',
    'Tab changes: Dissolve (200ms, ease-out)',
    'Modal/Drawer: Smart Animate slide-up (250ms, spring)',
    'Action buttons: Smart Animate scale (150ms) → new state',
    'KPI/metric counters: Smart Animate number change (600ms)',
    'Exception items: Smart Animate appear (200ms, staggered 30ms)',
  ];
  notes.forEach((note, i) => {
    const row = makeText(note, { size: 11, weight: 400, family: 'Inter', color: '#a1a1aa' });
    row.x = 80; row.y = y2 + 28 + i * 22;
    bg.appendChild(row);
  });

  return page;
}

// ─── Playground Page ──────────────────────────────────────────
function buildPlaygroundPage() {
  const page = createPage('99 Playground');
  figma.currentPage = page;
  const bg = makeFrame('Playground', { w: 1440, h: 800, fill: '#0a0a0f' });
  const title = makeText('Playground', { size: 24, weight: 400, family: 'Inter', color: '#52525b' });
  title.x = 80; title.y = 80;
  bg.appendChild(title);
  const desc = makeText('Unstructured space for experimentation.', { size: 14, weight: 400, family: 'Inter', color: '#52525b' });
  desc.x = 80; desc.y = 120;
  bg.appendChild(desc);
  return page;
}

// ─── Main Entry ───────────────────────────────────────────────
async function main() {
  console.log('🔨 Building Perionyx Enterprise Design System...\n');

  await loadFonts();
  console.log('✓ Fonts loaded');

  // Remove default page
  const defaultPage = figma.root.children.find(p => p.name === 'Page 1');
  if (defaultPage) defaultPage.remove();

  // Build all pages in order
  const coverPage = buildCoverPage();
  console.log('✓ Cover page (00)');

  const foundationsPage = await buildFoundationsPage();
  console.log('✓ Foundations page (01)');
  console.log('  - Created paint styles:', Object.values(COLORS).reduce((a, c) => a + Object.keys(c).length, 0));
  console.log('  - Created text styles:', TYPOGRAPHY.length);
  console.log('  - Created effect styles: 3');

  const componentsPage = buildComponents();
  console.log('✓ Components page (02)');
  console.log('  - Buttons (Primary/Secondary/Ghost/Danger/Icon × 3 sizes × 5 states)');
  console.log('  - Inputs (Text/Search/Password/Textarea/Number × 3 sizes × 7 states)');
  console.log('  - Cards (11 variants)');
  console.log('  - Selection Controls (Checkbox × 4, Radio × 3, Toggle × 2)');
  console.log('  - Badges & Chips (6 + 4 Status + 4 Risk + Approval + Exception)');
  console.log('  - Tabs (Underline/Pills/Segmented × 3 sizes)');
  console.log('  - Data Display (KPI, Statistic, Timeline, Activity, Audit, Property, Definition)');
  console.log('  - Table Components (Header, Cell, Row, Pagination)');
  console.log('  - Dropdown/Select + Dropdown/Menu');
  console.log('  - AI (Summary, Recommendation, Evidence, Confidence, Risk, Docs, Timeline, Explain, Processing)');
  console.log('  - Financial (Currency, Exchange Rate, Journal Entry, Invoice Summary, Supplier, Payment, Variance, Exception, Approval Summary, Cash Position)');
  console.log('  - Skeleton (Text, Card, Circle, Table Row, Metric, Chart)');
  console.log('  - Navigation (Sidebar Expanded/Collapsed, Top Navigation)');
  console.log('  - Overlays (Modal, Drawer, Toast)');

  const patternsPage = buildPatternsPage();
  console.log('✓ Patterns page (03)');

  const dashboardPage = buildDashboardPage();
  console.log('✓ Dashboard page (04)');

  const workQueuePage = buildWorkQueuePage();
  console.log('✓ Work Queue page (05)');

  const invoiceDetailPage = buildInvoiceDetailPage();
  console.log('✓ Invoice Detail page (06)');

  const prototypePage = buildPrototypePage();
  console.log('✓ Prototype page (07)');

  const playgroundPage = buildPlaygroundPage();
  console.log('✓ Playground page (99)');

  // Reorder pages
  const pages = figma.root.children;
  // Move pages to correct order (they should already be in creation order)

  // Set active page to Dashboard
  figma.currentPage = dashboardPage;

  // Notify user
  figma.notify('✅ PEDS v1.0 built successfully!', { timeout: 5000 });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ PEDS v1.0 — Build Complete');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Pages: ${pages.length}`);
  console.log('  00 Cover');
  console.log('  01 Foundations (colors, typography, spacing, effects)');
  console.log('  02 Components (82+ component variants)');
  console.log('  03 Patterns (UX patterns reference)');
  console.log('  04 Dashboard (Attention Queue, KPIs, Exceptions, AI)');
  console.log('  05 Work Queue (Filters, Table, Pagination)');
  console.log('  06 Invoice Detail (Split panel, Evidence tabs, Action bar)');
  console.log('  07 Prototype (Navigation flow map)');
  console.log('  99 Playground');
  console.log('');
  console.log('  Next: Wire prototype connections in Figma (Smart Animate)');
  console.log('  Next: Import design tokens via Tokens Studio → JSON import');
  console.log('  Next: Review screens and adjust spacing/alignment in Figma');
}

main().catch(err => {
  console.error('❌ Failed:', err.message);
  figma.notify('❌ Build failed: ' + err.message, { error: true, timeout: 5000 });
});
