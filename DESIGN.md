---
version: alpha
name: SkillBridge Design System
description: "A three-sided verified capability exchange connecting Students, Academia, and Industry. Engineered with the quiet discipline of Linear, the long-form learning comfort of Notion, the structured data density of Airtable, the analytical rigor of Stripe, and the contextual clarity of Intercom. Built around an authentic Cerulean anchor (#007BA7 / #0284C7), Neon Rose milestone accents (#FF2D95), institutional Royal Indigo (#743BFF), deep carbon dark canvas (#080A10), and warm limestone-cream light canvas (#F8F6F2). Explicitly devoid of generic AI tropes: no 9999px pill buttons, no sweeping specular sheens, no neon blurred chart halos, and no elastic spring bounce."

colors:
  # Primary Brand Palette (Cerulean Anchor)
  primary: "#0284c7"
  primary-hover: "#0369a1"
  primary-active: "#075985"
  primary-subtle: "rgba(2, 132, 199, 0.12)"
  primary-border: "rgba(2, 132, 199, 0.28)"
  on-primary: "#ffffff"

  # Secondary Brand Palette (Neon Rose - Milestones, Achievements, Verified Caps)
  rose: "#ff2d95"
  rose-hover: "#e0187e"
  rose-active: "#b50d62"
  rose-subtle: "rgba(255, 45, 149, 0.12)"
  rose-border: "rgba(255, 45, 149, 0.26)"
  on-rose: "#ffffff"

  # Tertiary Palette (Institutional Purple - Academia, NIRF, Research)
  institutional: "#743bff"
  institutional-hover: "#6027e6"
  institutional-active: "#4b18c2"
  institutional-subtle: "rgba(116, 59, 255, 0.12)"
  institutional-border: "rgba(116, 59, 255, 0.26)"
  on-institutional: "#ffffff"

  # Dark Mode Surfaces (Near-Black & Deep Carbon)
  canvas-dark: "#080a10"
  surface-dark-1: "#0f131d"
  surface-dark-2: "#161b2e"
  surface-dark-3: "#1e2438"
  surface-dark-elevated: "#232b42"

  # Light Mode Surfaces (Warm Limestone & Studio Porcelain)
  canvas-light: "#f8f6f2"
  surface-light-1: "#ffffff"
  surface-light-2: "#f0f3f8"
  surface-light-3: "#e8edf5"
  surface-light-elevated: "#ffffff"

  # Dark Mode Inks
  ink-dark: "#f5f7fa"
  ink-dark-muted: "#a7b0be"
  ink-dark-subtle: "#6c7584"
  ink-dark-disabled: "#434a56"

  # Light Mode Inks
  ink-light: "#0f172a"
  ink-light-muted: "#475569"
  ink-light-subtle: "#64748b"
  ink-light-disabled: "#94a3b8"

  # Borders & Hairlines
  border-dark: "rgba(255, 255, 255, 0.08)"
  border-dark-strong: "rgba(255, 255, 255, 0.16)"
  border-light: "#e2e8f0"
  border-light-strong: "#cbd5e1"

  # Semantic States
  success: "#10b981"
  success-subtle: "rgba(16, 185, 129, 0.12)"
  warning: "#f59e0b"
  warning-subtle: "rgba(245, 158, 11, 0.12)"
  error: "#ef4444"
  error-subtle: "rgba(239, 68, 68, 0.12)"
  info: "#0284c7"
  info-subtle: "rgba(2, 132, 199, 0.12)"

typography:
  display-xl:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.035em
  display-lg:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -0.03em
  display-md:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 36px
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: -0.025em
  heading-1:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.02em
  heading-2:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.015em
  heading-3:
    fontFamily: "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.01em
  body-lg:
    fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.01em
  body-md:
    fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.008em
  body-sm:
    fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -0.005em
  caption:
    fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0
  micro-caps:
    fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: 0.08em
  tabular-num:
    fontFamily: "var(--font-num), 'Outfit', 'Inter', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.02em
    fontFeature: "tnum 1, cv01 1"
  code-mono:
    fontFamily: "var(--font-code), 'JetBrains Mono', monospace"
    fontSize: 13px
    fontWeight: 450
    lineHeight: 1.50
    letterSpacing: 0
  editorial-italic:
    fontFamily: "var(--font-editorial), 'Newsreader', Georgia, serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.01em

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 9px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px

spacing:
  2xs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    minHeight: 38px
    border: "1px solid rgba(255, 255, 255, 0.14)"
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 1px 2px rgba(0, 0, 0, 0.16)"
  button-secondary:
    backgroundColor: "{colors.surface-dark-2}"
    textColor: "{colors.ink-dark}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    minHeight: 38px
    border: "1px solid {colors.border-dark}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dark-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px 14px
    minHeight: 38px
  button-danger:
    backgroundColor: "rgba(239, 68, 68, 0.15)"
    textColor: "#f87171"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    minHeight: 38px
    border: "1px solid rgba(239, 68, 68, 0.35)"
  input-field:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.ink-dark}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 9px 12px
    minHeight: 40px
    border: "1px solid {colors.border-dark}"
  card-panel:
    backgroundColor: "{colors.surface-dark-1}"
    border: "1px solid {colors.border-dark}"
    rounded: "{rounded.lg}"
    padding: 20px
---

# SkillBridge Platform Design System (DESIGN.md)

SkillBridge is a multi-sided SaaS platform uniting **Students**, **Academia**, and **Industry** into a single, high-trust talent ecosystem. 

This document defines the normative aesthetic, architectural, component, and interaction rules for SkillBridge. It is designed to preserve human craftsmanship, information clarity, and platform authenticity while eradicating generic, repetitive AI-generated tropes.

---

## 1. Brand Overview and Design Philosophy

### 1.1 The Brand Archetype: The Honest Foundry
SkillBridge is neither an entertainment social feed nor an unapproachable enterprise spreadsheet. It is an **active capability exchange**. Students build verified portfolios; universities validate curriculum outcomes; enterprise recruiters evaluate demonstrated code evidence.

The design philosophy rests on four pillars:

1. **Substance Over Speculation**: Every card, border, and badge exists to communicate status, provenance, or interaction. We do not decorate empty surfaces with sweeping gradients, artificial specular shines, or neon aura filters.
2. **Quiet Confidence**: Inspired by Linear and Stripe, the user interface steps back to allow student code, academic analytics, and enterprise job requisitions to take center stage.
3. **Tactile Restraint**: Interactions provide instant, predictable physical feedback. Micro-transitions complete in 100ms–140ms (`ease`); we reject bouncy spring curves (`cubic-bezier(0.34, 1.56, 0.64, 1)`) and scaling physics (`scale(1.03)`).
4. **Unified Cohesion Without Monotony**: While sharing the same foundational token tree, the Student, Academia, and Industry portals project tailored ergonomic personalities suited to their workflows.

---

## 2. Visual Identity

### 2.1 The Signature Colors
- **Cerulean Blue (`#007BA7` / `#0284C7`)**: The sovereign platform anchor. Represents engineering rigor, intellectual clarity, and structural trust. Used for primary interactive actions, verified hashes, and focal metrics.
- **Neon Rose (`#FF2D95`)**: The achievement spark. Represents milestones, capstone validations, placement offers, and live cohort drives. Used purposefully as an accent, never as a canvas wash.
- **Academic Violet (`#743BFF`)**: The institutional anchor. Represents university governance, NIRF accreditation, peer-reviewed research, and curriculum standards.

### 2.2 Visual Tension & Composition
- **Asymmetric Balance**: Data-dense tables and telemetry balanced against generous breathing room for long-form curricula and student project briefs.
- **Clean Contrast**: Deep charcoal/carbon dark backgrounds (`#080A10`, `#0F131D`) in Dark Mode; warm organic limestone (`#F8F6F2`, `#FFFFFF`) in Light Mode. Pure white text is reserved for headings and primary buttons; supporting content uses structured opacity grading (70%, 55%, 40%).

---

## 3. Color Tokens

```yaml
colors:
  # Primary Cerulean Scale
  cerulean-900: "#075985"
  cerulean-800: "#0369a1"
  cerulean-700: "#0284c7"
  cerulean-600: "#007ba7"
  cerulean-500: "#0ea5e9"
  cerulean-400: "#38bdf8"
  cerulean-100: "rgba(2, 132, 199, 0.12)"

  # Achievement Rose Scale
  rose-900: "#9f1239"
  rose-700: "#be123c"
  rose-600: "#e11d48"
  rose-500: "#ff2d95"
  rose-400: "#fb7185"
  rose-100: "rgba(255, 45, 149, 0.12)"

  # Institutional Violet Scale
  violet-900: "#4c1d95"
  violet-700: "#6d28d9"
  violet-600: "#743bff"
  violet-500: "#8b5cf6"
  violet-100: "rgba(116, 59, 255, 0.12)"

  # Slate Neutral Scale
  slate-950: "#080a10"
  slate-900: "#0f131d"
  slate-850: "#161b2e"
  slate-800: "#1e2438"
  slate-700: "#334155"
  slate-600: "#475569"
  slate-500: "#64748b"
  slate-400: "#94a3b8"
  slate-300: "#cbd5e1"
  slate-200: "#e2e8f0"
  slate-100: "#f1f5f9"
  slate-50:  "#f8f6f2"
```

### Contrast Rules
- Normal text (`< 18px` regular) must achieve at least **4.5:1** contrast against its immediate container surface.
- Bold text (`>= 14px` bold or `>= 18px` regular) must achieve at least **3.0:1** contrast.
- All non-text UI components (input borders, toggles, divider rules) must maintain at least **3.0:1** contrast against adjacent backgrounds.

---

## 4. Dark Mode and Light Mode

SkillBridge implements a dual-theme architecture powered by CSS custom properties and Next.js theme providers.

### 4.1 Dark Mode (`[data-theme="dark"]`)
- **Canvas Base**: `#080A10` (carbon tint, preventing OLED pure black harshness).
- **Surface Elevation 1 (Cards, Sidebars)**: `#0F131D`.
- **Surface Elevation 2 (Sub-panels, nested tabs)**: `#161B2E`.
- **Borders**: 1px solid `rgba(255, 255, 255, 0.08)`. Never neon-colored.
- **Atmosphere**: Restrained ambient lighting; glows are strictly limited to 10% opacity blurred background nodes for atmospheric depth.

### 4.2 Light Mode (`[data-theme="light"]`)
- **Canvas Base**: `#F8F6F2` (warm organic limestone; avoids stark bleached `#FFFFFF`).
- **Surface Elevation 1 (Cards, Main Canvas)**: `#FFFFFF`.
- **Surface Elevation 2 (Table Headers, Inset Panels)**: `#F0F3F8`.
- **Borders**: 1px solid `#E2E8F0` with `#CBD5E1` hover definition.
- **Inks**: `#0F172A` (deep slate ink) for text; `#475569` for body copy; `#64748B` for metadata.
- **Primary Buttons in Light Mode**: Rendered in solid `#0F172A` with white typography for authoritative contrast, matching the Stripe/Linear executive desktop pattern.

---

## 5. Typography

### 5.1 Multi-Tier Font Family System
SkillBridge employs four distinct typefaces, each assigned a non-overlapping functional responsibility:

1. **Heading Voice**: `Plus Jakarta Sans` (`--font-heading`). Geometric, crisp, and authoritative for page titles and card headlines.
2. **System Interface & Body**: `Inter` (`--font-body`). Neutral, exceptionally legible at 12px–15px, with complete Unicode symbol coverage.
3. **Tabular Numerics & Metrics**: `Outfit` (`--font-num`). Tabular figures (`tnum 1`, `cv01 1`) ensuring numbers in financial tables, ATS salaries, and code scores do not jitter.
4. **Editorial & Institutional Context**: `Newsreader` (`--font-editorial`). Italicized serif used exclusively for academic quotes, verification mottos, and research abstracts.
5. **Code & Machine Artifacts**: `JetBrains Mono` (`--font-code`). Monospaced precision for commit hashes, API endpoints, and code blocks.

### 5.2 Type Scale

| Token | Size | Weight | Line Height | Tracking | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-xl` | 56px | 700 | 1.05 | -0.035em | Landing Page Hero |
| `display-lg` | 44px | 700 | 1.10 | -0.030em | Major Section Openers |
| `display-md` | 36px | 650 | 1.15 | -0.025em | Feature Headers |
| `heading-1` | 28px | 600 | 1.20 | -0.020em | Portal View Titles |
| `heading-2` | 22px | 600 | 1.25 | -0.015em | Panel & Modal Headers |
| `heading-3` | 18px | 600 | 1.30 | -0.010em | Card Titles, Section Dividers |
| `body-lg` | 17px | 400 | 1.55 | -0.010em | Lead Paragraphs |
| `body-md` | 15px | 400 | 1.50 | -0.008em | Default Body Copy |
| `body-sm` | 13px | 400 | 1.45 | -0.005em | Table Cells, Form Labels |
| `caption` | 12px | 500 | 1.40 | 0.000em | Metadata, Timestamps |
| `micro-caps`| 11px | 600 | 1.30 | +0.080em | Status Chips, Overlines |
| `tabular-num`| 14px | 500 | 1.40 | -0.020em | Metric Numbers, Currency |
| `code-mono` | 13px | 450 | 1.50 | 0.000em | Commit Hashes, Code Snippets |

---

## 6. Spacing and Layout

### 6.1 Base Grid: 4px Rhythm
All margins, padding, and gaps derive from a strict 4px/8px modular scale:
- `2xs`: 2px (Hairline offsets, indicator dots)
- `xs`: 4px (Icon-to-text spacing, compact badge padding)
- `sm`: 8px (Form field internal gaps, list item padding)
- `md`: 12px (Standard card internal gap, table cell vertical padding)
- `lg`: 16px (Card padding, button horizontal spacing)
- `xl`: 24px (Grid column gutters, section margin)
- `2xl`: 32px (Panel separation, modal inner padding)
- `3xl`: 48px (Major viewport blocks)
- `section`: 96px (Landing page narrative chapters)

### 6.2 Layout Constraints
- **Max Content Width**: `1400px` for landing pages and wide dashboards.
- **Reading Container**: `max-w-[38rem]` (approx 65–75 characters per line) for long-form curriculum descriptions, job briefs, and documentation.
- **Sidebar Width**: Fixed `260px` in desktop expanded mode; collapsible to `72px` icon rail.

---

## 7. Grid and Responsive Rules

### 7.1 Breakpoint System
- `xs`: `< 480px` (Compact mobile)
- `sm`: `640px` (Standard mobile / phablet)
- `md`: `768px` (Tablet vertical / hybrid)
- `lg`: `1024px` (Laptop / tablet horizontal)
- `xl`: `1280px` (Standard desktop)
- `2xl`: `1536px` (Wide workspace monitors)

### 7.2 Responsive Adaptations
- **Navigation**: Desktop collapsible sidebar transforms into a bottom navigation bar or top hamburger sliding drawer on screens `< 768px`.
- **Data Tables**: On mobile, data tables switch to stacked card-list rows rather than horizontally scrolling spreadsheets unless explicitly toggled by user.
- **Modals**: Full-screen or bottom sheet drawers on screens `< 640px`; centered `rounded-xl` dialogs on screens `>= 640px`.

---

## 8. Elevation, Borders and Surfaces

SkillBridge relies on **structural borders and soft ambient occlusion** rather than stacked blurry drop shadows.

### 8.1 Surface Tiers (Dark Mode)
- **Base Canvas (`#080A10`)**: Root page surface.
- **Card Surface (`#0F131D`)**: 1px border `rgba(255, 255, 255, 0.08)`. Shadow: `0 1px 3px rgba(0, 0, 0, 0.25)`.
- **Elevated Surface (Dropdowns, Popovers, Modals)`(#161B2E`)**: 1px border `rgba(255, 255, 255, 0.14)`. Shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.6)`.

### 8.2 Surface Tiers (Light Mode)
- **Base Canvas (`#F8F6F2`)**: Root page surface.
- **Card Surface (`#FFFFFF`)**: 1px border `#E2E8F0`. Shadow: `0 1px 2px rgba(15, 23, 42, 0.04)`.
- **Elevated Surface (`#FFFFFF`)**: 1px border `#CBD5E1`. Shadow: `0 10px 25px -4px rgba(15, 23, 42, 0.08)`.

---

## 9. Border Radius and Shapes

```yaml
rounded:
  none: "0px"
  xs: "4px"    # Checkboxes, code tags, nested mini-badges
  sm: "6px"    # Compact buttons (.btn-sm), toast alerts
  md: "9px"    # Default buttons (.btn), inputs, form fields
  lg: "12px"   # Standard content cards, data tables, dialogs
  xl: "16px"   # Primary portal hero banners, summary panels
  xxl: "24px"  # Feature visual showcases
  pill: "9999px" # STRICTLY RESTRICTED: Online dots and micro status counters only
```

### The Anti-Pill Mandate
**Never render primary action buttons, search bars, cards, or dialogs as 9999px capsule pills.** 
Pill-shaped buttons communicate toy-like, casual mobile consumer apps. Standard enterprise SaaS products (Linear, Stripe, GitHub, Notion) utilize structured `6px` to `10px` radii to maintain typographic alignment and architectural permanence.

---

## 10. Button System

Buttons are high-frequency indicators of product craftsmanship. Every button variant must follow the 10-state specification:

### 10.1 Hierarchy & Variants

1. **Primary Button (`.btn-primary`)**:
   - Dark: Solid deep cerulean (`#0284c7`). Border: 1px `rgba(255, 255, 255, 0.14)`. Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.2)`.
   - Light: Solid slate-900 (`#0f172a`). Border: 1px `#0f172a`. Typography: `#ffffff`.
   - Hover: Dark `#0369a1`; Light `#1e293b`. `translateY(-0.5px)`.
   - Pressed: Dark `#075985`; Light `#020617`. `translateY(0.5px)`.

2. **Secondary Button (`.btn-secondary` / `.btn-glass`)**:
   - Dark: Surface background `rgba(255, 255, 255, 0.05)`. Border: 1px `rgba(255, 255, 255, 0.12)`.
   - Light: Solid `#ffffff`. Border: 1px `#cbd5e1`.
   - Hover: Subtle surface lightening. `translateY(-0.5px)`.

3. **Tertiary Button (`.btn-tertiary`)**:
   - Subtle tinted background (`rgba(2, 132, 199, 0.08)`). Text: Cerulean.
   - Used for non-disruptive contextual actions ("View details", "Filter by branch").

4. **Ghost Button (`.btn-ghost`)**:
   - Transparent background. Text: `ink-muted`.
   - Hover: Background `rgba(255, 255, 255, 0.06)` dark / `rgba(0, 0, 0, 0.05)` light. Text becomes full contrast `ink`.

5. **Destructive Button (`.btn-danger`)**:
   - Dark: Background `rgba(239, 68, 68, 0.15)`. Border: 1px `rgba(239, 68, 68, 0.35)`. Text: `#f87171`.
   - Light: Background `#fef2f2`. Border: 1px `#fca5a5`. Text: `#dc2626`.
   - Used exclusively for irreversible operations (Revoking certifications, deleting candidate records).

6. **Icon-Only Button**:
   - 36px × 36px (or 32px × 32px small). `rounded-lg`. Square proportion.
   - Always possesses an accessible `aria-label` and `title`.

7. **Loading State**:
   - Retains exact dimensions to prevent layout shift.
   - Displays a 16px synchronized spinner (`animate-spin`). Text transitions to 60% opacity. `pointer-events: none`.

8. **Disabled State**:
   - Opacity: 40%. Cursor: `not-allowed`. `pointer-events: none`. Box shadow cleared.

9. **Focused State**:
   - `outline: 2px solid #0284c7`; `outline-offset: 2px`. Crisp definition for keyboard navigation.

10. **Pressed State**:
    - `transform: translateY(0.5px)`. Shadow drops to inset or zero.

---

## 11. Inputs and Forms

- **Height**: Standard `40px` touch/click target (`34px` for dense table filter bars).
- **Radius**: `9px` (`rounded-[9px]`).
- **Surfaces**: Dark `rgba(255, 255, 255, 0.04)`; Light `#FFFFFF` with `#E2E8F0` border.
- **Focus Ring**: `2px solid #0284c7` with `0px` offset in dark mode / `2px` offset in light mode. Never neon orange or magenta.
- **Labels**: Positioned strictly above fields in `13px` medium font (`font-medium`). Never rely solely on vanishing placeholders.
- **Validation Messages**: Rendered in `12px` font directly below field with an assigned `role="alert"` and `aria-describedby` linking.

---

## 12. Navigation and Sidebar

- **Structure**:
  - Top Global Bar (`h-14` / 56px): Contextual breadcrumbs, quick global search (`⌘K`), theme toggle, notification bell, user profile avatar.
  - Left Workspace Rail (`w-64` / 256px): Portal navigation links grouped by logical task hierarchy.
- **Active Navigation Item**:
  - Dark: Solid background `rgba(255, 255, 255, 0.07)`. Text: `#ffffff` bold. Left indicator: 3px solid `#0284c7`.
  - Light: Solid background `#f1f5f9`. Text: `#0f172a` bold. Left indicator: 3px solid `#0284c7`.
  - Radius: `rounded-lg`.

---

## 13. Cards and Panels

- **Header / Body / Footer Separation**:
  - Card Header: `16px`–`20px` padding with bottom divider `1px solid var(--border)`.
  - Card Body: `20px` internal padding.
  - Card Footer: Subdued action container with top divider `1px solid var(--border)`.
- **Hover Behavior**:
  - Interactive cards apply `translateY(-1px)`, border lightening (`rgba(255,255,255,0.18)` dark / `#cbd5e1` light), and natural elevation shadow (`0 4px 16px -2px rgba(0,0,0,0.3)`).
  - Passive summary cards have **zero hover motion**.

---

## 14. Tables and Data Visualization

Inspired by **Airtable**'s structured clarity:
- **Header Cells (`<th>`)**: `11px` uppercase tracking (`tracking-wider`), `font-semibold`, subdued text (`ink-muted`), sticky top positioning (`sticky top-0`).
- **Data Cells (`<td>`)**: `13px`–`14px`, `py-3 px-4`, bottom border `1px solid var(--border)`.
- **Numeric Alignment**: Numbers right-aligned using tabular figures (`font-num`). Text left-aligned. Status badges centered.
- **Zebra Striping**: Optional for large data (> 20 rows); alternate row tint: `rgba(255,255,255,0.015)` dark / `rgba(0,0,0,0.015)` light.
- **Row Hover**: Clean highlight `rgba(255,255,255,0.03)` dark / `rgba(0,0,0,0.02)` light.

---

## 15. Charts and Analytics

Inspired by **Stripe**'s data honesty:
- **Line Charts**:
  - Single crisp stroke: `2px` solid `#0284c7`.
  - Area Fill: Single-hue vertical gradient from 10% opacity at peak to 0% at baseline.
  - Zero SVG `feGaussianBlur` neon glow filters.
  - Data Points: 4px dots appearing on hover; tooltip anchored with numerical tabular values.
- **Bar Charts**:
  - Distinct semantic solid fills (e.g. Applied: slate, Review: sky, Shortlist: indigo, Interview: purple, Hired: emerald).
  - Zero rainbow gradient bars.
  - Rounded top corners: `rounded-t-[4px]`.
- **Grid Lines**: Hairline `1px` dashed `rgba(255, 255, 255, 0.08)` dark / `#e2e8f0` light.

---

## 16. Modal and Drawer Patterns

- **Dialog Element**: Implemented via native HTML `<dialog>` with standard modal accessibility (focus trap, Escape key closing, backdrop click dismissal).
- **Backdrop Scrim**: `rgba(0, 0, 0, 0.65)` with subtle `backdrop-blur-sm` (4px blur max; no heavy blur distortion).
- **Scale Entrance**: Subtle `150ms` opacity + `scale(0.99)` to `scale(1.0)` entrance.
- **Drawer Panels**: Slide smoothly from right edge (`translate-x-0`) with fixed `440px`–`520px` width.

---

## 17. Loading, Empty and Error States

### 17.1 Skeletons
- Pulse animation with low-contrast background: `rgba(255, 255, 255, 0.06)` dark / `rgba(0, 0, 0, 0.06)` light.
- Exact dimension matching to final loaded components to eliminate Cumulative Layout Shift (CLS).

### 17.2 Empty States
- Clean, non-condescending illustration or centered SVG glyph in `rounded-xl` container.
- High-contrast explanation title + single sentence action prompt + primary or secondary resolution button.

### 17.3 Error States
- Inline field errors: Red-400 `#f87171` text with immediate context.
- Banner alerts: Inset rounded card with `1px solid rgba(239, 68, 68, 0.3)` and clear "Try again" action button.

---

## 18. Interaction and Hover States

- **Duration**: Universal micro-transitions set to `140ms ease`.
- **Translation Scale**: Max lift `translateY(-0.5px)` on interactive buttons; `translateY(-1px)` on cards.
- **Active State**: Pressed elements depress by `translateY(0.5px)`.
- **No Elastic Springs**: Strictly prohibit `cubic-bezier` timing functions with overshoot values `> 1.0`.

---

## 19. Animation and Motion Guidelines

Motion must serve one of three functional purposes:
1. **Spatial Continuity**: Guiding user focus during tab switches or portal routing.
2. **State Confirmation**: Indicating successful save, copy-to-clipboard, or form validation.
3. **Progressive Disclosure**: Expanding nested accordions, dropdowns, and mobile drawers.

Continuous background animations (rotating beams, floating cards, pulsing halos) are strictly prohibited across all operational dashboards.

---

## 20. Accessibility (WCAG 2.1 AA)

- **Keyboard Focus**: Every interactive control possesses a visible `:focus-visible` ring (`2px solid #0284c7`, `offset 2px`).
- **Screen Reader Announcements**: Dynamic telemetry updates use `aria-live="polite"`. Modals set `aria-modal="true"`.
- **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, all transitions drop to `0.01ms` and 3D transforms revert to zero.
- **Color Independence**: Color is never the sole indicator of state. All badges pair color tints with text labels or status icons.

---

## 21. Mobile Design Rules

- **Touch Targets**: Minimum interactive dimension `44px × 44px`.
- **Reachability**: Critical navigation and primary submission buttons placed within the bottom thumb zone.
- **No Horizontal Scroll Traps**: Tables gracefully adapt to vertical cards or provide distinct sticky-first-column cues.
- **Font Legibility**: Smallest text on mobile devices is `12px` (never sub-10px micro-text).

---

## 22. Student Portal Design Rules

**Personality**: Approachable, motivating, structured, and skill-focused.
- **Welcome Banner**: Executive greeting in Indian Standard Time (IST), verified student status badge, quick link to explore opportunities.
- **Skill Passport**: Clear visual progression rings with solid Cerulean indicators, verified certificate hashes, and GitHub/LeetCode sync indicators.
- **Learning Roadmaps**: Clear chronological steps with checkmarks, active pulse indicators, and milestone reward tags.

---

## 23. Academia Portal Design Rules

**Personality**: Authoritative, institutional, NIRF/ABET-ready, and research-rigorous.
- **Dashboard Tone**: High-density institutional metrics (NIRF Ranking readiness score, placement drive conversion percentage, faculty research output).
- **Data Visualizations**: Clean registration line charts without neon decoration; department-wise breakdown with distinct semantic bar fills.
- **Accreditation Tables**: Compact, printable, exportable tables with verifiable student cohort identifiers.

---

## 24. Industry Portal Design Rules

**Personality**: Fast, decisive, workflow-efficient, and ATS-driven.
- **Recruiter ATS Pipeline**: Structured Kanban columns (Applied → Under Review → Shortlisted → Interview → Offer → Hired) using semantic solid badges.
- **Candidate Cards**: Dense preview cards displaying verified code scores, matching algorithmic signatures, and direct interview scheduling actions.
- **Batch Actions**: Multi-select candidate checkboxes with floating bulk action toolbar (Shortlist, Message, Export CSV).

---

## 25. Design Do's and Don'ts

### DO:
- **DO** use solid, confident background colors (`#0284c7` for primary actions in dark mode; `#0f172a` in light mode).
- **DO** use 8px–10px corner radii on buttons and cards to preserve architectural structure.
- **DO** use tabular numbers (`font-num`) for all numerical metrics, timestamps, and statistics.
- **DO** respect natural hierarchy: 1 primary action per view, supported by secondary or ghost actions.
- **DO** maintain strict WCAG AA contrast (minimum 4.5:1 for body copy).
- **DO** keep animations snappy and functional (100ms–140ms ease).

### DON'T:
- **DON'T** use 9999px stadium pills for buttons, input fields, or cards.
- **DON'T** add sweeping specular gradient sheen animations (`.btn::after`) on hover.
- **DON'T** use multi-color rainbow gradients (`#007ba7` → `#ff2d95`) across chart lines or button fills.
- **DON'T** apply `feGaussianBlur` drop-shadow glow filters around data visualization lines.
- **DON'T** use bouncy spring curves (`scale(1.04)` with elastic overshoot) on click or hover.
- **DON'T** use continuous looping background animations (`pulse-glow`, `drift`, `float-slow`) on production dashboards.
- **DON'T** rely on glassmorphism (`backdrop-filter: blur(14px)`) where a solid, grounded surface provides superior legibility.
- **DON'T** float decorative text in the sky or behind hero illustrations.
