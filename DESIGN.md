# SkillBridge Design System Specification (`DESIGN.md`)
**Version**: 2.4.0 (Production Architecture)  
**Platform**: SkillBridge — Verified Capability & Multi-Sided Talent Exchange  
**Ecosystem**: Students • Academia • Industry  
**Last Updated**: November 2026  

---

## Table of Contents
1. [Brand Identity & Design Philosophy](#1-brand-identity--design-philosophy)
2. [Colour System](#2-colour-system)
   - [Active Production Palette (Dark Mode: Black × Chrome Silver × Crimson)](#21-active-production-palette-dark-mode)
   - [Active Production Palette (Light Mode: Warm Limestone & Clean Cerulean)](#22-active-production-palette-light-mode)
   - [Proposed Monochromatic Neon Dark Mode Specification](#23-proposed-monochromatic-neon-dark-mode-specification)
   - [Semantic & Status Colours](#24-semantic--status-colours)
3. [Typography System](#3-typography-system)
   - [Font Families & Architectural Roles](#31-font-families--architectural-roles)
   - [Complete Typography Scale](#32-complete-typography-scale)
   - [Responsive Typography Rules](#33-responsive-typography-rules)
4. [Spacing, Grid, & Layout System](#4-spacing-grid--layout-system)
   - [Modular Spacing Scale](#41-modular-spacing-scale)
   - [Responsive Breakpoints](#42-responsive-breakpoints)
   - [Layout Constraints & Container Widths](#43-layout-constraints--container-widths)
   - [Grid Architectures](#44-grid-architectures)
5. [Landing Page Design Documentation](#5-landing-page-design-documentation)
   - [Global Header & Navigation](#51-global-header--navigation)
   - [Hero Section (Photorealistic Sky Plates & Left-Column Scrim)](#52-hero-section)
   - [Section 1: Pathways to Accelerate Forward (`SectionOpportunity`)](#53-section-1-pathways-to-accelerate-forward)
   - [Section 2: Turn Skills into Real Projects (`SectionBuild`)](#54-section-2-turn-skills-into-real-projects)
   - [Section 3: Three Words, One Unified Network (`SectionEcosystem`)](#55-section-3-three-words-one-unified-network)
   - [Section 4: From Progress to Possibility (`SectionProgression`)](#56-section-4-from-progress-to-possibility)
   - [Section 5: Real Outcomes, Real Connections (`SectionOutcomes`)](#57-section-5-real-outcomes-real-connections)
   - [Section 6: Closing Horizon & Primary CTA (`SectionClosingCta`)](#58-section-6-closing-horizon--primary-cta)
   - [FlowLines & Cinematic Footer](#59-flowlines--cinematic-footer)
6. [Multi-Sided Portal Design System](#6-multi-sided-portal-design-system)
   - [Student Portal Architecture](#61-student-portal-architecture)
   - [Academia Portal Architecture](#62-academia-portal-architecture)
   - [Industry Portal Architecture](#63-industry-portal-architecture)
   - [Shared vs. Role-Differentiated Components](#64-shared-vs-role-differentiated-components)
7. [Component Design System](#7-component-design-system)
   - [Buttons & Action Triggers](#71-buttons--action-triggers)
   - [Cards & Content Surfaces](#72-cards--content-surfaces)
   - [Inputs, Forms, & Field Groups](#73-inputs-forms--field-groups)
   - [Modals, Popovers, & Drawers](#74-modals-popovers--drawers)
   - [Data Tables & Filter Toolbars](#75-data-tables--filter-toolbars)
   - [Navigation Rails & Headers](#76-navigation-rails--headers)
   - [Status Badges, Chips, & Progress Indicators](#77-status-badges-chips--progress-indicators)
   - [Skeletons, Empty States, & Error Boundaries](#78-skeletons-empty-states--error-boundaries)
8. [Animation & Interaction Architecture](#8-animation--interaction-architecture)
   - [Micro-Interactions & Tactile Feedback](#81-micro-interactions--tactile-feedback)
   - [View Transitions (Circular GPU Wipe)](#82-view-transitions-circular-gpu-wipe)
   - [Scroll Reveal & Spatial Motion](#83-scroll-reveal--spatial-motion)
   - [3D Canvas & WebGL Integration](#84-3d-canvas--webgl-integration)
9. [Responsive Design & Viewport Strategy](#9-responsive-design--viewport-strategy)
10. [Iconography, Imagery, & Visual Assets](#10-iconography-imagery--visual-assets)
11. [Accessibility & Permanent Enhanced Contrast](#11-accessibility--permanent-enhanced-contrast)
12. [Theme Architecture & State Persistence](#12-theme-architecture--state-persistence)
13. [Engineering & Design Implementation Rules](#13-engineering--design-implementation-rules)
14. [Appendix: Master File & Component Index](#14-appendix-master-file--component-index)

---

## 1. Brand Identity & Design Philosophy

### 1.1 Brand Overview & Mission
SkillBridge is a verified, three-sided capability exchange designed to dissolve the structural friction separating higher education from modern industry. 

Unlike conventional job boards that index self-reported resumes or learning platforms that award unverified participation badges, SkillBridge treats **competency as code**. The platform allows students to assemble cryptographically anchored project portfolios, enables university faculty to validate academic curricula against live industry needs, and gives enterprise hiring managers direct access to verified technical execution.

```
+-------------------------------------------------------------------------+
|                               SKILLBRIDGE                               |
|                     Verified Capability Architecture                    |
+-------------------------------------------------------------------------+
       |                                   |                              |
       v                                   v                              v
 [  STUDENTS  ]                   [    ACADEMIA    ]              [   INDUSTRY   ]
 Verified Proofs                   NIRF Accreditation              Direct Pipeline
 Live Capstones                    Faculty R&D Hubs                ATS Integration
 Career Mobility                   Curriculum Sync                 Staff Endorsements
```

### 1.2 The Three-Sided Visual Metaphor
The visual language reflects the tripartite relationship:
1. **Students**: Focused on agility, exploration, and proof of work. Accentuated by high-velocity Cerulean (`#007BA7` / `#19B8E6`).
2. **Academia**: Focused on institutional authority, peer review, and accredited curriculum standards. Accentuated by Academic Violet (`#743BFF` / `#B57CFF`).
3. **Industry**: Focused on production readiness, architectural rigor, and direct hiring. Accentuated by Laser Crimson / Rose (`#D41514` / `#FF2D95`).

### 1.3 Design Philosophy: "The Honest Foundry"
SkillBridge rejects the decorative tropes common to generic AI-generated interfaces:
- **No speculative decoration**: Every border, divider, and tag indicates status, tier, or cryptographic provenance.
- **No 9999px stadium pills for actions**: Buttons maintain architectural structure with engineered `9px` corner radii.
- **No specular glow sweeps or rainbow line charts**: Visual depth is created through crisp borders, deliberate contrast, and typographic hierarchy.
- **Architectural permanence**: High-contrast typography and precise grid lines inspired by Linear, Stripe, and modern Swiss design.

---

## 2. Colour System

SkillBridge employs a dual-theme system featuring high-contrast tokens, supplemented by a proposed future monochromatic neon direction.

### 2.1 Active Production Palette (Dark Mode)
The active dark canvas implements an authoritative palette: **Deep Black (`#080808`)**, **Chrome Silver (`#CDCBCA`)**, and **Laser Crimson (`#D41514`)**.

| Token Name | Active Value | CSS Variable / Tailwind | Functional Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `#080808` | `--color-bg`, `bg-[#080808]` | Primary background across all pages |
| **Canvas Secondary** | `#0D0D0D` | `--color-bg-alt`, `--color-card` | Card backgrounds, list view containers |
| **Surface Elevated** | `#121212` / `#161616` | `--color-bg-soft`, `--color-elevated`| Dropdowns, modals, popovers |
| **Chrome Silver Primary**| `#CDCBCA` | `--color-silver`, `--color-text` | Primary body copy, headers, active tabs |
| **Silver Light** | `#FFFFFF` | `--color-silver-light` | Display headlines, emphasized text |
| **Silver Muted** | `#8E8C8B` | `--color-silver-muted`, `--color-muted` | Metadata, subtitles, inactive nav |
| **Silver Subtle** | `#5A5857` | `--color-silver-subtle` | Placeholder text, disabled glyphs |
| **Laser Crimson** | `#D41514` | `--color-crimson`, `text-[#D41514]` | Strategic brand focal point, primary CTA |
| **Crimson Hover** | `#E81A19` | `--color-crimson-hover` | Button hover state |
| **Crimson Active** | `#B51211` | `--color-crimson-active` | Button active/pressed state |
| **Crimson Subtle Tint** | `rgba(212, 21, 20, 0.10)` | `--color-crimson-subtle` | Focus halos, badge backgrounds |
| **Crimson Border** | `rgba(212, 21, 20, 0.45)` | `--color-crimson-border` | Highlighted cards, active focus rings |
| **Enhanced Border** | `rgba(255, 255, 255, 0.38)` | `--color-border` (Permanent) | High-contrast card, table, input boundaries |
| **Enhanced Border Strong**| `rgba(255, 255, 255, 0.55)`| `--color-border-strong` (Permanent) | Active outlines, focused card frames |
| **Enhanced Muted Text**| `#d5dce8` | `--color-muted` (Permanent) | High-readability secondary text |

### 2.2 Active Production Palette (Light Mode)
Light mode uses a warm, cool-neutral daylight palette: **Limestone (`#F8FAFC`)**, **Deep Slate (`#0F172A`)**, and **Cerulean Blue (`#007BA7`)**.

| Token Name | Active Value | CSS Variable / Tailwind | Functional Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `#F8FAFC` | `--color-bg`, `bg-[#F8FAFC]` | Primary page canvas |
| **Canvas Secondary** | `#F1F5F9` | `--color-bg-alt` | Section backing, inset tables |
| **Card Surface** | `#FFFFFF` | `--color-card`, `bg-white` | Cards, popovers, active tabs |
| **Deep Slate Ink** | `#0F172A` | `--color-text`, `text-[#0F172A]` | Primary typography, bold headings |
| **Muted Ink** | `#475569` | `--color-muted` | Secondary copy, descriptive paragraphs |
| **Subtle Slate** | `#64748B` | `--color-muted-subtle` | Timestamps, table column headers |
| **Cerulean Anchor** | `#007BA7` | `--color-blue`, `--color-cyan` | Interactive links, student badges |
| **Cerulean Bright** | `#0284C7` | `--color-blue-bright` | Button hover states, focus indicator |
| **Achievement Rose** | `#FF2D95` | `--color-pink` | Milestones, industry accents |
| **Academic Violet** | `#743BFF` | `--color-purple` | Institutional badges, faculty links |
| **Enhanced Border** | `#6c788d` | `--color-border` (Permanent) | Crisp card boundaries, inputs, dividers |
| **Enhanced Border Strong**| `#334155` | `--color-border-strong` (Permanent)| High-contrast input frames |
| **Enhanced Muted Text**| `#111420` | `--color-muted` (Permanent) | Crisp high-contrast readable copy |

### 2.3 Proposed Monochromatic Neon Dark Mode Specification
*(Status: **Proposed Design Direction** — documented for future unification and planned iteration)*

To unify Dark Mode under a monochromatic cybernetic palette without warm earth tones, the following token mapping is specified for subsequent versions:

```css
/* Proposed Monochromatic Neon Palette */
:root[data-theme="dark-neon"] {
  --neon-canvas-base:      #05070B; /* Deep Black void canvas */
  --neon-surface-subtle:   #0A1019; /* Secondary card surface */
  --neon-surface-elevated: #0E1724; /* Elevated popovers & menus */
  --neon-primary-text:     #F2F7FC; /* Crisp luminous white text */
  --neon-secondary-text:   #A8B8C9; /* Cool slate secondary text */
  --neon-muted-text:       #718397; /* Subdued structural text */
  --neon-accent-primary:   #00E5FF; /* Electric Cyan core accent */
  --neon-accent-secondary: #00A8FF; /* Neon Blue secondary anchor */
  --neon-highlight:        #70F0FF; /* Soft Cyan highlight & borders */
  --neon-border:           rgba(112, 240, 255, 0.22);
}
```

### 2.4 Semantic & Status Colours
Used consistently across Student, Academia, and Industry portals:

| Status | Foreground Tint | Subtle Background Tint | Border Tint | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Verified / Success** | `#10B981` (Emerald) | `rgba(16, 185, 129, 0.10)` | `rgba(16, 185, 129, 0.30)` | Skill hash match, NIRF accredited, Hired |
| **Pending / In Review**| `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.10)` | `rgba(245, 158, 11, 0.30)` | Capstone in review, pending interview |
| **Action / Critical** | `#EF4444` (Rose Red) | `rgba(239, 68, 68, 0.10)` | `rgba(239, 68, 68, 0.30)` | Deadline today, unverified repo, error |
| **Info / Diagnostic** | `#0284C7` (Sky) | `rgba(2, 132, 199, 0.10)` | `rgba(2, 132, 199, 0.30)` | Diagnostic available, informational pill |

---

## 3. Typography System

### 3.1 Font Families & Architectural Roles
SkillBridge configures 5 distinct font variables loaded in `src/app/layout.tsx`:

1. **`Inter` (`--font-body`, `font-sans`)**:
   - Primary interface, form inputs, button typography, and body narrative.
   - High legibility, neutral letterforms, comprehensive Unicode support.
2. **`Plus Jakarta Sans` / `Outfit` (`--font-heading`, `font-heading`)**:
   - Authoritative geometric display voice for hero titles, section headings, and card headlines.
3. **`Outfit` (`--font-num`, `font-numeric`)**:
   - Tabular figures (`font-feature-settings: "tnum" 1, "cv01" 1`) for dashboard metrics, KPI counts, timestamps, and placement percentages.
4. **`Newsreader` (`--font-editorial`, `font-editorial`)**:
   - Classical editorial serif used sparingly for signature moments (e.g. *"Our Bridge."* in the Hero or institutional motto statements).
5. **`JetBrains Mono` (`--font-code`, `font-mono`)**:
   - Cryptographic hashes, git commit signatures, terminal outputs, and code challenge snippets.

### 3.2 Complete Typography Scale

| Token Name | Desktop Font Size | Line Height | Tracking | Weight | Semantic HTML / Component Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`display-2xl`** | `clamp(2.5rem, 6vw, 5.25rem)` | `1.02` | `-0.038em` | `800` (Bold) | Landing Page Hero Headline (`#hero-title`) |
| **`display-xl`** | `clamp(2rem, 4.5vw, 3.75rem)` | `1.08` | `-0.032em` | `750` (Semibold)| Section Title Openers (`h2`) |
| **`display-lg`** | `clamp(1.75rem, 3.2vw, 2.75rem)`| `1.15` | `-0.025em` | `700` (Bold) | Major Feature Headers, Section Lead-ins |
| **`heading-1`** | `1.75rem` (28px) | `1.22` | `-0.020em` | `650` (Semibold)| Portal Page Title (`PageHeader` in dashboards) |
| **`heading-2`** | `1.375rem` (22px) | `1.28` | `-0.015em` | `600` (Semibold)| Card Panel Headers, Modal Titles |
| **`heading-3`** | `1.125rem` (18px) | `1.34` | `-0.010em` | `600` (Semibold)| Sub-widget headers, KPI labels |
| **`body-lg`** | `1.0625rem` (17px) | `1.58` | `-0.010em` | `400` / `500` | Lead paragraphs, Hero description text |
| **`body-md`** | `0.9375rem` (15px) | `1.52` | `-0.008em` | `400` (Normal) | Primary body copy, description lists |
| **`body-sm`** | `0.8125rem` (13px) | `1.46` | `-0.005em` | `450` / `500` | Table cell copy, form helper text |
| **`caption`** | `0.75rem` (12px) | `1.40` | `0.000em` | `500` (Medium) | Timestamps, metadata pills, footers |
| **`micro-caps`** | `0.6875rem` (11px) | `1.30` | `+0.065em` | `650` (Semibold)| Overline eyebrow tags, uppercase status chips |

### 3.3 Responsive Typography Rules
- Root text scaling uses responsive clamp functions (`clamp(min, preferred, max)`).
- On mobile viewports (`< 640px`):
  - Hero display sizes reduce from `5.25rem` to `2.25rem`.
  - Body copy standardizes to `14px`–`15px` to maintain comfortable readability.
  - Line-length is constrained to `60`–`75` characters using `max-w-prose` or `max-w-[32rem]`.

---

## 4. Spacing, Grid, & Layout System

### 4.1 Modular Spacing Scale
All layout margins, paddings, and flex/grid gaps follow an 8pt architectural rhythm:

```
2xs  -->  2px   (Hairline offsets, status pips)
xs   -->  4px   (Icon-to-label gaps, chip vertical padding)
sm   -->  8px   (Button icon gap, compact form spacing)
md   -->  12px  (Standard card internal gap, table cell py)
lg   -->  16px  (Standard card padding, navigation px)
xl   -->  24px  (Dashboard grid gaps, section separators)
2xl  -->  32px  (Modal inner padding, panel margins)
3xl  -->  48px  (Feature group separation)
4xl  -->  64px  (Desktop section margins)
hero -->  96px–128px (Landing page narrative chapters)
```

### 4.2 Responsive Breakpoints
Configured via standard Tailwind CSS v4 defaults:

| Breakpoint | Minimum Width | Typical Target Devices | Layout Behavior |
| :--- | :--- | :--- | :--- |
| **`base`** | `0px` | Compact mobile phones (iPhone SE, 390px) | Single column, stacked cards, bottom navigation |
| **`sm`** | `640px` | Large phones, phablets in portrait | 2-column metric cards, adjusted horizontal padding |
| **`md`** | `768px` | Tablets (iPad portrait, 768px) | Multi-column forms, collapsible dashboard sidebar |
| **`lg`** | `1024px`| Small laptops, iPad Pro landscape | 3-column dashboard grids, expanded sidebars (260px) |
| **`xl`** | `1280px`| Standard desktop monitors (1080p) | 4-column feature grids, max content `1400px` |
| **`2xl`** | `1536px`| Ultrawide monitors, studio displays | Centered container, maximum readable gutters |

### 4.3 Layout Constraints & Container Widths
- **Max Content Container**: `max-w-[1400px]` with auto margins (`mx-auto`) and adaptive gutters (`px-4 xs:px-6 sm:px-10 lg:px-16`).
- **Reading Container**: `max-w-[32rem]` to `max-w-[42rem]` for narrative clarity.
- **Fixed Sidebar Width**: `260px` in desktop expanded state; collapses to mobile drawer on viewports `< 1024px`.
- **Global Header Height**: Fixed at `68px` (`--header-h: 68px`).

---

## 5. Landing Page Design Documentation

The Landing Page (`src/app/page.tsx`) organizes nine visual chapters structured to present the platform's narrative arc.

```
+-------------------------------------------------------------------------+
| Header: Floating Backdrop-Blur Navbar (Logo + Nav Links + Search/Settings) |
+-------------------------------------------------------------------------+
| Hero: Photorealistic Sky Plates + "Your Skills. Our Bridge." + CTA      |
+-------------------------------------------------------------------------+
| Section 1: Pathways to Accelerate Forward (4 Destination Cards)         |
+-------------------------------------------------------------------------+
| Section 2: Turn Skills into Real Projects (Interactive Terminal IDE)    |
+-------------------------------------------------------------------------+
| Section 3: Three Words, One Unified Network (Two-Step Tap Interaction)  |
+-------------------------------------------------------------------------+
| Section 4: From Progress to Possibility (5 Milestone Progression Stages) |
+-------------------------------------------------------------------------+
| Section 5: Real Outcomes, Real Connections (Capabilities & Logos Grid)  |
+-------------------------------------------------------------------------+
| Section 6: Closing Horizon & Primary CTA (Converging Perspective Grid)  |
+-------------------------------------------------------------------------+
| Footer: Multi-Tier Links, Legal Disclosures, IST Clock & Live Status    |
+-------------------------------------------------------------------------+
```

### 5.1 Global Header & Navigation (`src/components/landing/Header.tsx`)
- **Structure**: Sticky floating header (`fixed top-0 left-0 right-0 z-40`).
- **Visual Treatment**: Glassmorphic blur (`backdrop-blur-xl bg-white/80 dark:bg-[#080808]/80 border-b border-black/[0.06] dark:border-[rgba(205,203,202,0.14)]`).
- **Controls**:
  - Brand Wordmark: "SkillBridge" with high-contrast text and crimson dot.
  - Anchor Nav Links: Opportunities (`#opportunity`), Workspaces (`#build`), Ecosystem (`#ecosystem`), Milestones (`#progression`), Outcomes (`#outcomes`).
  - Search Trigger Button (`#header-search-trigger`): Launches Spotlight Search dialog (`⌘K`).
  - Settings Trigger Button (`#header-settings-trigger`): Launches Apple-style anchored popover.
  - "Get Started" CTA: Direct access to student registration.

### 5.2 Hero Section (`src/components/landing/Hero.tsx` & `HeroStage.tsx`)
- **Visual Composition**:
  - Clean photorealistic horizon photography: Daylight sky plate (`/hero/env-daylight-sky.jpg`) for Light Mode; Evening twilight plate (`/hero/env-evening-sky.jpg`) for Dark Mode.
  - Left-column readability scrim (`.hero-grade`) ensures text contrast.
  - Foreground 3D animated meshes have been removed, creating an uncluttered view of the horizon background.
- **Narrative Copy**:
  - Eyebrow: `STUDENTS / ACADEMIA / INDUSTRY` with crimson accent.
  - Title: *"Your Skills. Our Bridge."*
  - Description: *"A complete ecosystem to learn, build and grow — from college to career."*
  - CTA: Primary Laser Crimson button (`btn-crimson`) with smooth scroll to `#opportunity`.

### 5.3 Section 1: Pathways to Accelerate Forward (`SectionOpportunity.tsx`)
- **Concept**: Four distinct capability destinations.
- **Cards**:
  1. *Industry Capstones* (`Code2`, Pink accent, `/pathways/industry-capstone.jpg`).
  2. *Research Fellowships* (`Microscope`, Purple accent, `/pathways/research-fellowship.jpg`).
  3. *1-on-1 Mentorship* (`Compass`, Cyan accent, `/pathways/one-on-one-mentor.jpg`).
  4. *Fast-Track Pipelines* (`Rocket`, Metallic Chrome accent, `/pathways/fast-track-pipeline.jpg`).
- **Interaction**: Hover lift (`translateY(-2px)`), high-contrast border illumination, and direct routing.

### 5.4 Section 2: Turn Skills into Real Projects (`SectionBuild.tsx`)
- **Concept**: Interactive engineering workspace simulator.
- **Component**: Tabbed IDE interface demonstrating 3 live tracks:
  - *Full-Stack Web* (`web`): Distributed Next.js & PostgreSQL talent exchange.
  - *AI & Data Intelligence* (`ai`): Vector-indexed RAG evaluator with Gemini 2.5 Flash.
  - *Cloud & DevOps* (`cloud`): Ephemeral Kubernetes sandboxes with TLS mutual auth.
- **Features**: Live code editor syntax highlighting, automated test matrix (18/18 passing), and simulated test runner with live progress bar.

### 5.5 Section 3: Three Words, One Unified Network (`SectionEcosystem.tsx`)
- **Concept**: Interactive showcase of the platform's three stakeholders.
- **Pillars**:
  - *Students* (Cyan accent `#007BA7`, 10,000+ active learners, 92% placement rate).
  - *Academia* (Violet accent `#743BFF`, curriculum integration, NIRF metric alignment).
  - *Industry* (Laser Crimson `#FF2D95`, ATS pipeline, staff engineer evaluations).
- **Two-Step Interaction Pattern**:
  - **First Tap / Click**: Selects the pillar, activates high-contrast border and preview imagery without navigating.
  - **Second Tap / Click (or CTA button)**: Directs to the respective portal (`/student`, `/academia`, `/industry`).

### 5.6 Section 4: From Progress to Possibility (`SectionProgression.tsx`)
- **Concept**: 5-stage student progression lifecycle.
- **Stages**:
  1. `01 Discover` (Week 1): Role Competency Diagnostic (94.2% role readiness alignment).
  2. `02 Practice` (Weeks 2–3): Sandboxed Cloud Labs (18/18 test suites passing).
  3. `03 Build` (Weeks 4–6): Scoped Industry Briefs (Grade A+ 98% repo health).
  4. `04 Collaborate` (Weeks 7–8): Mentor & Faculty Code Reviews (4.9/5.0 rubric score).
  5. `05 Launch` (Outcome): Direct Fast-Track Career Placement.
- **Visuals**: Left-hand step selector cards paired with an interactive right-hand verified artifact panel.

### 5.7 Section 5: Real Outcomes, Real Connections (`SectionOutcomes.tsx`)
- **Dual Content**:
  1. *Capabilities Tabs*: Project Collaboration, Research Connections, Industry Engagement.
  2. *Ecosystem Trust Grid*: Logos categorized by domain:
     - Technology: Google, Microsoft, OpenAI, AWS, GitHub, NVIDIA.
     - Global Enterprise: Tata, Infosys, Accenture, IBM.
     - Academia: IIT Bombay, IIT Delhi, BITS Pilani, Stanford, MIT, Oxford, IISc Bangalore.

### 5.8 Section 6: Closing Horizon & Primary CTA (`SectionClosingCta.tsx`)
- **Visuals**: Ambient radial glow with perspective horizon grid lines converging at the center.
- **Action**: High-visibility dual CTAs directing students and institutions to start onboarding.

### 5.9 FlowLines & Cinematic Footer (`FlowLines.tsx` & `CinematicFooter.tsx`)
- **FlowLines**: Subtle SVG background curves connecting visual sections.
- **Footer**: Grouped site map (Platform, Portals, Legal), real-time Indian Standard Time (IST) clock, system operational telemetry, and copyright notices.

---

## 6. Multi-Sided Portal Design System

Each portal features specialized layouts while adhering to the core design system tokens.

```
+-------------------------------------------------------------------------+
| Portal Global Header: Breadcrumb + Search ⌘K + Notifications + Profile |
+-------------------------------------------------------------------------+
| [ Sidebar ]  |  Portal View Content Space                               |
| - Dash       |  - KPI Telemetry Cards                                    |
| - Workflows  |  - Interactive Charts (Stripe-Style Line/Bar)            |
| - Records    |  - Data Tables (Airtable-Style Dense Rows)                |
| - Settings   |  - Detail Modals & Slide-Over Drawers                     |
+-------------------------------------------------------------------------+
```

### 6.1 Student Portal Architecture (`src/app/student/(app)/`)
- **Tone**: Focused, motivating, structured.
- **Key Views**:
  - `DashboardView.tsx`: Features `StudentWelcomeBanner` (IST greeting, verified badge), `StudentStreakStrip`, `UnifiedCodingProgress`, and `DashboardOrb3D`.
  - `ProfileView.tsx`: Student bio, verified skill passport, GitHub sync status, and active project roster.
  - `SkillsView.tsx` & `gain-skills/`: Comprehensive skills catalog, progress rings, and milestone checklists.
  - `CertificatesView.tsx`: Cryptographically verifiable certificates with SHA-256 signatures, verification URLs, and printable modal displays.
  - `OpportunitiesView.tsx`: Filterable job and capstone listings with matching percentage scores.
  - `ApplicationsView.tsx`: Kanban pipeline tracking active recruitment status.
  - `ProjectsView.tsx`: Repository links, CI test status, and mentor review rubrics.
  - `StudentCalendarPlannerModal.tsx`: Task deadline and interview scheduling.

### 6.2 Academia Portal Architecture (`src/app/academia/(app)/`)
- **Tone**: Institutional, authoritative, NIRF/ABET accreditation-ready.
- **Key Views**:
  - `AcademiaDashboardView.tsx`: Institutional readiness metrics, student placement conversion rates, active research grant tallies.
  - `DepartmentsView.tsx`: Department-wise enrollment, faculty counts, and curriculum sync status.
  - `FacultyManagementView.tsx`: Faculty profiles, publications, and capstone supervision rosters.
  - `PlacementsView.tsx`: Live placement drive metrics, company visit calendars, and student offer status.
  - `ReportsAnalyticsView.tsx`: Accreditation analytics, student learning outcomes, and printable reporting tables.
  - `UniversityEmblem3D.tsx`: Interactive Three.js university crest.

### 6.3 Industry Portal Architecture (`src/app/industry/(app)/`)
- **Tone**: Efficient, decisive, ATS-oriented.
- **Key Views**:
  - `IndustryDashboardView.tsx`: Requisition health, candidate pipeline throughput, and upcoming technical interviews.
  - `ApplicantsView.tsx`: Multi-stage recruitment pipeline (Applied → Screening → Interview → Offer → Hired) with candidate cards.
  - `TalentDiscoveryView.tsx`: Capability search engine with code-matching filters (e.g., "Docker + Go + Latency < 40ms").
  - `JobsManagerView.tsx` & `JobEditorView.tsx`: Job description authoring with skill weightings.
  - `InterviewsView.tsx`: Scheduled interview rosters and rubric evaluation cards.
  - `IndustryEmblem3D.tsx`: Three.js mechanical emblem representation.

### 6.4 Shared vs. Role-Differentiated Components

| Component Type | Shared Architecture | Role-Specific Adaptation |
| :--- | :--- | :--- |
| **AppShell** | Collapsible sidebar, sticky top header, profile dropdown | Student (Cerulean), Academia (Violet), Industry (Crimson/Dark) |
| **KPI Metric Cards** | 12px border radius, high-contrast border, tabular numbers | Student shows streak/XP; Academia shows NIRF/placement; Industry shows ATS pipeline |
| **Data Tables** | Dense row spacing, sortable column headers, search filter bar | Consistent across all 3 portals via `src/components/ui/table/DataTable.tsx` |
| **Calendar** | Day/week view with event category color-coding | Shared via `src/components/ui/SkillBridgeCalendar.tsx` |

---

## 7. Component Design System

### 7.1 Buttons & Action Triggers
All buttons adhere to explicit interaction states:
- **Base Geometry**: Minimum touch height `40px` (`34px` for `.btn-sm`), horizontal padding `1.15rem`, corner radius `9px` (`rounded-[9px]`), font weight `550`.
- **Variants**:
  - `.btn-crimson`: Solid `#D41514` with `#FFFFFF` text. Micro-bevel shadow `0 4px 18px -2px rgba(212,21,20,0.4)`.
  - `.btn-primary`: Light mode solid `#007BA7` with white text; Dark mode solid deep surface with enhanced border.
  - `.btn-glass`: Glassmorphic gradient surface (`linear-gradient(180deg, rgba(205,203,202,0.06), rgba(205,203,202,0.02))`) with `inset 0 1px 0 rgba(255,255,255,0.16)`.
  - `.btn-ghost`: Borderless surface with subtle hover lightening.
  - `.btn-bounce`: Tactile micro-scale on click (`active:scale-[0.98]`).

### 7.2 Cards & Content Surfaces
- **Geometry**: Border radius `12px` (`rounded-[12px]`) or `14px` (`rounded-[14px]`).
- **Borders**: 1px solid `var(--color-border)` (enforced at `rgba(255,255,255,0.38)` dark / `#6c788d` light).
- **Background**:
  - Dark: `#0D0D0D` with subtle glass overlay.
  - Light: Pure white `#FFFFFF` with soft depth shadow.
- **Hover Behavior**: Interactive cards apply `translateY(-1.5px)` with border contrast intensification. Non-interactive summary cards maintain static positioning.

### 7.3 Inputs, Forms, & Field Groups
- **Field Height**: `40px` (`44px` for touch-friendly mobile screens).
- **Corner Radius**: `8px`–`9px`.
- **Surfaces**:
  - Dark Mode: `rgba(255, 255, 255, 0.04)` with `border: 1px solid rgba(255, 255, 255, 0.28)`.
  - Light Mode: `#FFFFFF` with `border: 1px solid #94A3B8`.
- **Focus Indicator**: `outline: 2px solid #D41514` (Dark) / `2px solid #007BA7` (Light), with `outline-offset: 2px`.
- **Labels**: Rendered above input fields in `13px` font weight `500`.

### 7.4 Modals, Popovers, & Drawers
- **Settings Modal (`SettingsModal.tsx`)**:
  - Apple iOS Inset Grouped style (`rounded-[18px]`, width `350px`, backdrop blur `24px`).
  - Contains Appearance (Dark Mode toggle), Language (English / Hindi), Platform Shortcuts (⌘K search, Portal links), and "Reset to Defaults".
  - *Accessibility section and controls have been removed; Enhanced Contrast is permanently active.*
- **Search Modal (`GlobalSearchModal.tsx`)**:
  - Centered spotlight overlay with fuzzy search index across all features, opportunities, and documentation.
- **Backdrop Scrim**: `rgba(0, 0, 0, 0.75)` with `backdrop-blur-md`.

### 7.5 Data Tables & Filter Toolbars (`src/components/ui/table/`)
- Implemented in `DataTable.tsx` and `FilterToolbar.tsx`.
- Sticky header cells (`<th>`) with uppercase tracking (`tracking-wider`) and font size `11px`.
- Tabular figures (`font-num`) for all numerical columns.
- Integrated search filter input, status dropdown filters, and CSV export triggers.

---

## 8. Animation & Interaction Architecture

### 8.1 Micro-Interactions & Tactile Feedback
- **Standard Transition Timing**: `150ms`–`200ms` using cubic bezier `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- **Click Feedback**: Active buttons scale smoothly to `0.98` (`active:scale-[0.98]`).
- **No Spring Overshoot**: Animations avoid cartoonish physics curves with overshoot values `> 1.0`.

### 8.2 View Transitions (Circular GPU Wipe)
Configured in `src/components/theme/ThemeProvider.tsx`:
- When toggling between Light Mode and Dark Mode, the browser uses the native `document.startViewTransition()` API.
- The transition renders a GPU-accelerated circular `clip-path` expanding from the trigger button's center point across the entire viewport.
- If the operating system prefers reduced motion, the circular transition is bypassed, and an instantaneous theme change is applied.

### 8.3 Scroll Reveal & Spatial Motion
- Uses the custom hook `useInView` (`src/components/motion/MotionHooks.tsx`).
- Landing page elements apply the `.scroll-reveal` CSS class, translating `12px` along the Y-axis and fading in upon reaching the viewport threshold.

### 8.4 3D Canvas & WebGL Integration
- Built using Three.js (`three` and `@types/three`).
- Operational dashboards integrate targeted 3D visualization objects:
  - `DashboardOrb3D.tsx`: Floating skill telemetry orb in the Student dashboard.
  - `UniversityEmblem3D.tsx`: Interactive institutional crest in the Academia portal.
  - `IndustryEmblem3D.tsx`: Mechanical winged emblem in the Industry portal.
- All WebGL canvases feature fallback DOM elements for low-power or non-WebGL environments.

---

## 9. Responsive Design & Viewport Strategy

### 9.1 Desktop Layouts (`>= 1024px`)
- Wide multi-column dashboards (`3` to `4` columns).
- Permanent `260px` sidebar with full text navigation labels.
- Sticky floating navigation bar with full horizontal anchor links.

### 9.2 Tablet Layouts (`768px` to `1023px`)
- Dashboard grids compress to `2` columns.
- Sidebar collapses to compact icon rail or accessible drawer.
- Data tables enable horizontal scrolling with fixed first-column cues.

### 9.3 Mobile Layouts (`< 768px`)
- **Single Column Flow**: All card grids stack vertically (`grid-cols-1`).
- **Navigation Adaptation**: Desktop navigation transforms into an accessible full-screen sliding drawer.
- **Touch Targets**: All buttons, inputs, and clickable icons maintain a minimum dimension of `44px × 44px`.
- **Bottom Drawers**: Modals on mobile screens open as bottom sheets for comfortable one-handed thumb interaction.

---

## 10. Iconography, Imagery, & Visual Assets

### 10.1 Iconography (`lucide-react`)
- SkillBridge standardizes on **Lucide React** (`lucide-react@^1.61.0`).
- Consistent stroke width: `1.8px`–`2.0px` (`2.4px` for micro status glyphs).
- Standard sizes: `14px` (inline helper), `16px` (button icons), `20px` (card headers), `24px` (portal navigation).

### 10.2 Photographic Direction
- Natural, professional workplace photography depicting authentic engineering, laboratory, and collaborative moments.
- Assets:
  - `/pathways/industry-capstone.jpg`
  - `/pathways/research-fellowship.jpg`
  - `/pathways/one-on-one-mentor.jpg`
  - `/pathways/fast-track-pipeline.jpg`
  - `/portals/students.jpg`
  - `/hero/env-daylight-sky.jpg` (Hero Light Mode)
  - `/hero/env-evening-sky.jpg` (Hero Dark Mode)

---

## 11. Accessibility & Permanent Enhanced Contrast

SkillBridge complies with **WCAG 2.1 AA** standards across all views.

```
+-------------------------------------------------------------------------+
|                  PERMANENT ENHANCED CONTRAST ARCHITECTURE               |
+-------------------------------------------------------------------------+
| Root HTML Attribute:   data-high-contrast="true" (Always Active)        |
| Global Filter:         contrast(1.12) applied to document body          |
| Dark Mode Borders:     rgba(255, 255, 255, 0.38) (High visibility)      |
| Light Mode Borders:    #6c788d (Crisp structural definition)            |
| Focus Indicators:      2px solid #D41514 (Dark) / #007BA7 (Light)       |
| OS Reduced Motion:     @media (prefers-reduced-motion: reduce) honored   |
+-------------------------------------------------------------------------+
```

### 11.1 Permanent Enhanced Contrast Architecture
- **Always Active**: `data-high-contrast="true"` is set on `<html>` at server render.
- **Global Contrast Boost**: `filter: contrast(1.12)` is applied globally.
- **Enhanced Border Tokens**:
  - Dark Mode: `--color-border: rgba(255, 255, 255, 0.38) !important`.
  - Light Mode: `--color-border: #6c788d !important`.
- **No User Toggle**: Enhanced contrast is a permanent characteristic of the visual design system. Legacy stored preferences (`skillbridge-high-contrast`, `skillbridge-text-size`, `skillbridge-reduced-motion`) are automatically cleared on load.

### 11.2 Focus Rings & Keyboard Navigation
- `:focus-visible` outlines are strictly enforced:
  - Dark Mode: `2px solid #D41514` with `outline-offset: 2px`.
  - Light Mode: `2px solid #007BA7` with `outline-offset: 2px`.
- Full keyboard trap management across modals and popovers.

### 11.3 Operating System Reduced Motion Support
- Native OS motion settings (`prefers-reduced-motion: reduce`) are honored globally:
  - View transitions bypass circular wipes and complete instantly.
  - CSS animations drop to `0.001ms`.
  - Three.js WebGL rotation is paused.

---

## 12. Theme Architecture & State Persistence

### 12.1 Root Theme Initialization (`src/app/layout.tsx`)
Theme resolution executes via an inline script in `<head>` before first paint to prevent flashes of unstyled content (FOUC):

```javascript
(function(){
  try {
    var m = localStorage.getItem('skillbridge-theme-mode') || localStorage.getItem('skillbridge-theme');
    var t = 'dark';
    if (m === 'light' || m === 'dark') { t = m; }
    else if (m === 'system') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.dataset.theme = t;
    if (t === 'light') document.documentElement.classList.add('light');
    
    // Purge obsolete accessibility preferences
    localStorage.removeItem('skillbridge-reduced-motion');
    localStorage.removeItem('skillbridge-text-size');
    localStorage.removeItem('skillbridge-high-contrast');
    delete document.documentElement.dataset.reducedMotion;
    delete document.documentElement.dataset.textSize;
    
    // Permanent Enhanced Contrast
    document.documentElement.dataset.highContrast = 'true';
  } catch(e) {}
})();
```

### 12.2 Theme Persistence
- **Storage Keys**:
  - `skillbridge-theme-mode`: `"dark"` | `"light"` | `"system"`.
  - `skillbridge-theme`: `"dark"` | `"light"`.
  - `sb_theme`: HTTP cookie for server-side theme reflection.
  - `skillbridge-lang`: `"en"` | `"hi"`.

---

## 13. Engineering & Design Implementation Rules

When authoring new features or updating existing views in SkillBridge, follow these rules:

### DO:
1. **DO use design tokens**: Reference `var(--color-border)`, `var(--color-text)`, `var(--color-muted)` instead of raw hardcoded colors.
2. **DO maintain structural corner radii**: Use `rounded-[9px]` or `rounded-[12px]` for buttons and cards.
3. **DO use tabular figures for numbers**: Apply `font-num` (`Outfit` / tabular figures) for all numerical metrics, timestamps, and statistics.
4. **DO test in both Dark and Light modes**: Verify that contrast remains sharp under both color schemes.
5. **DO honor OS-level reduced motion**: Use `usePrefersReducedMotion()` in motion components.
6. **DO maintain clean DOM hierarchies**: Ensure buttons and links carry valid `aria-label` tags and visible `:focus-visible` rings.

### DON'T:
1. **DON'T reintroduce an Accessibility section in Settings**: Enhanced Contrast is permanently active; no user-facing toggles should be added to the Settings panel.
2. **DON'T use 9999px capsule pills for action buttons**: Stadium pills contradict the platform's architectural identity.
3. **DON'T add decorative specular gradients or neon glow halos**: Avoid `feGaussianBlur` drop shadows around charts and cards.
4. **DON'T use elastic spring bounce curves**: Micro-interactions must feel crisp and physical (`140ms`–`180ms ease`).
5. **DON'T use low-contrast text**: All secondary copy must meet WCAG 2.1 AA 4.5:1 minimum contrast.
6. **DON'T hardcode viewport assumptions**: Design all layouts to adapt fluidly across mobile (`390px`), tablet (`768px`), and desktop (`1400px`).

---

## 14. Appendix: Master File & Component Index

### Core Architecture & Configuration
- Root Layout: [`src/app/layout.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/app/layout.tsx)
- Global Styles & CSS Variables: [`src/app/globals.css`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/app/globals.css)
- Theme Context & Circular Transition: [`src/components/theme/ThemeProvider.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/theme/ThemeProvider.tsx)
- Internationalization & Translations: [`src/lib/i18n/translations.ts`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/lib/i18n/translations.ts)

### Landing Page Components
- Landing Page Root: [`src/app/page.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/app/page.tsx)
- Global Navigation Header: [`src/components/landing/Header.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/Header.tsx)
- Hero Component: [`src/components/landing/Hero.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/Hero.tsx)
- Hero Sky Plates & Scrim: [`src/components/landing/hero/HeroStage.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/hero/HeroStage.tsx)
- Section 1 (Opportunities): [`src/components/landing/cinematic/SectionOpportunity.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionOpportunity.tsx)
- Section 2 (Workspaces IDE): [`src/components/landing/cinematic/SectionBuild.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionBuild.tsx)
- Section 3 (Unified Network): [`src/components/landing/cinematic/SectionEcosystem.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionEcosystem.tsx)
- Section 4 (Progression Stages): [`src/components/landing/cinematic/SectionProgression.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionProgression.tsx)
- Section 5 (Outcomes & Trust Grid): [`src/components/landing/cinematic/SectionOutcomes.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionOutcomes.tsx)
- Section 6 (Closing CTA): [`src/components/landing/cinematic/SectionClosingCta.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/SectionClosingCta.tsx)
- Global Footer: [`src/components/landing/cinematic/CinematicFooter.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/landing/cinematic/CinematicFooter.tsx)

### Portal Layouts & Views
- Student AppShell: [`src/components/student/AppShell.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/student/AppShell.tsx)
- Student Dashboard: [`src/components/student/DashboardView.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/student/DashboardView.tsx)
- Student Certificates Hub: [`src/components/student/CertificatesView.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/student/CertificatesView.tsx)
- Academia AppShell: [`src/components/academia/AcademiaAppShell.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/academia/AcademiaAppShell.tsx)
- Academia Dashboard: [`src/components/academia/AcademiaDashboardView.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/academia/AcademiaDashboardView.tsx)
- Industry AppShell: [`src/components/industry/IndustryAppShell.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/industry/IndustryAppShell.tsx)
- Industry Dashboard: [`src/components/industry/IndustryDashboardView.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/industry/IndustryDashboardView.tsx)
- Industry Talent Discovery: [`src/components/industry/TalentDiscoveryView.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/industry/TalentDiscoveryView.tsx)

### Global UI Elements
- Settings Modal: [`src/components/settings/SettingsModal.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/settings/SettingsModal.tsx)
- Spotlight Search Modal: [`src/components/search/GlobalSearchModal.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/search/GlobalSearchModal.tsx)
- Data Table Component: [`src/components/ui/table/DataTable.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/ui/table/DataTable.tsx)
- Calendar Widget: [`src/components/ui/SkillBridgeCalendar.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/ui/SkillBridgeCalendar.tsx)
- Motion & View Hooks: [`src/components/motion/MotionHooks.tsx`](file:///Users/jains/.gemini/antigravity/scratch/academy-industry-portal/src/components/motion/MotionHooks.tsx)

---
*SkillBridge Design System Specification (`DESIGN.md`) — Official Repository Reference*
