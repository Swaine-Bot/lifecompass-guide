# LifeStack Design System

Internal usage guide for the reusable premium UI primitives in `src/components/ds/`.

Import everything from the barrel:
```tsx
import { PageHeader, SectionHeader, StatCard, ActionRow, MetaText, SectionLabel, SourceBadge, CategoryChip, StatusBadge, EmptyStatePanel } from '@/components/ds';
```

---

## Components

### PageHeader
Top-level screen header with icon orb, title, subtitle, and optional actions.

| Prop | Usage |
|------|-------|
| `icon` | LucideIcon — renders inside an `icon-orb` (or `icon-orb-sm` when `compact`) |
| `title` | Serif bold. Only `<h1>` on the page. |
| `subtitle` | Tracked uppercase meta line (auto-indented 42px via `.page-subtitle`) |
| `actions` | Right-aligned slot for buttons/controls |
| `back` | `true` = browser back, `string` = navigate to path |
| `leading` | Custom left element (avatar, logo) — replaces icon orb |
| `compact` | Smaller title + smaller orb for detail/sub-pages |

**Use for**: Every top-level and detail page header.
**Do NOT**: Write ad-hoc `<h1>` + icon layouts. Always use `PageHeader`.

---

### SectionHeader
Inline section divider with optional icon, counter, and action.

| Prop | Usage |
|------|-------|
| `title` | Serif semibold section title |
| `icon` | Optional LucideIcon in `icon-orb-sm` |
| `counter` | Badge-style count or label |
| `action` | Right-aligned ReactNode (link, button) |
| `muted` | Smaller uppercase tracked style for sub-sections |

**Use for**: Dividing content areas within a page.
**Do NOT**: Use `PageHeader` for inline sections or write manual flex headers.

---

### StatCard
Glass-variant card for displaying a single metric.

| Prop | Usage |
|------|-------|
| `value` | Primary display (number, string, ReactNode) |
| `label` | Tracked uppercase descriptor below value |

**Use for**: Dashboard stats, progress counters, summary metrics.
**Do NOT**: Build one-off stat displays with raw `<Card>`.

---

### ActionRow
Flex row for small action buttons (save, share, archive, etc).

| Prop | Usage |
|------|-------|
| `justify` | `'start'` (default), `'end'`, `'between'`, `'center'` |

**Use for**: Groups of icon buttons or small text actions below cards/content.
**Do NOT**: Write ad-hoc `flex items-center gap-1` rows for actions.

---

### MetaText
Styled span for secondary metadata.

| Prop | Usage |
|------|-------|
| `size` | `'default'` (11px) or `'xs'` (9px) — uses `.meta-text` / `.meta-text-xs` |

**Use for**: Timestamps, counters, helper labels, character counts.

---

### SectionLabel
Tracked uppercase label (`section-label` class).

**Use for**: Category headings, filter group titles, small dividers.

---

### SourceBadge
Pill badge for origin/source labels (AI, Playbook, Mentor, etc).

| Prop | Usage |
|------|-------|
| `variant` | `'default'` or `'muted'` (reduced opacity) |

---

### CategoryChip
Small bordered chip for categories / tags.

---

### StatusBadge
Colored pill for status indicators (active, paused, completed).

---

### EmptyStatePanel
Standardized empty state with icon, title, description, and optional CTA.

---

## Card Variants

Use the `variant` prop on `<Card>` from `@/components/ui/card`.

| Variant | When to use |
|---------|-------------|
| `default` | Standard content cards, lists, form containers |
| `glass` | Atmospheric cards that sit over sensory backgrounds — most common for content cards |
| `glass-elevated` | Hero/featured cards that need extra prominence |
| `gold` | Primary/accent cards (today's focus, active goal, premium features) |
| `outline` | Minimal borders, no fill — secondary grouping |
| `surface` | Subtle backdrop sections, inner panels, nested grouping |

**Rule**: If a card sits over a sensory background, use `glass` or `glass-elevated`. Never use `default` on atmospheric screens.

---

## CSS Utilities (defined in `index.css`)

| Class | Size | Usage |
|-------|------|-------|
| `.icon-orb` | 32×32 | Page-level header icons |
| `.icon-orb-sm` | 24×24 | Section-level / inline icons |
| `.page-subtitle` | 12px tracked | Below PageHeader title (42px left indent) |
| `.section-label` | 10px tracked | Uppercase divider labels |
| `.meta-text` | 11px | Timestamps, counters, helpers |
| `.meta-text-xs` | 9px | Compact metadata |
| `.source-badge` | pill | Origin labels |
| `.category-chip` | chip | Tags and categories |
| `.status-badge` | pill | Status indicators |
| `.hover-lift` | transform | Subtle hover elevation for interactive cards |

---

## Spacing Conventions

- **Page padding**: `p-4 md:p-6` via AppLayout
- **Section gap**: `space-y-6` between major sections
- **Card internal**: `p-4` standard, `p-3.5` compact
- **Header → content**: `mb-1` for title row, subtitle auto-spaced
- **Icon orb → title**: `gap-2.5`
- **Subtitle indent**: `ml-[42px]` (aligns with title after orb)

---

## Anti-Patterns

❌ Writing inline `text-[10px] uppercase tracking-[0.12em]` — use `SectionLabel` or `.section-label`
❌ Building stat displays with raw divs — use `StatCard`
❌ Manual `<h1>` + icon flex rows — use `PageHeader`
❌ Hardcoded colors (`text-white`, `bg-black`) — use semantic tokens
❌ One-off badge styling — use `SourceBadge`, `CategoryChip`, or `StatusBadge`
❌ Using `default` Card variant over sensory backgrounds — use `glass`
