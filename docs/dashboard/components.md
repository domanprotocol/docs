---
title: "Components & Styling"
description: "Design system, color palette, typography, UI components"
---

## 1. Styling & Design System

### 1.1 Color Palette

| Name        | Preview                                                                                                                         | CSS Variable    | Hex       | Usage                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- | ------------------------ |
| Background  | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#000000;border:1px solid #1F1F1F"></span> | `--background`  | `#000000` | Page background          |
| Foreground  | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#E5E7EB;border:1px solid #D1D5DB"></span> | `--foreground`  | `#E5E7EB` | Primary text             |
| Accent      | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#3B82F6;border:1px solid #2563EB"></span> | `--accent`      | `#3B82F6` | Primary accent (blue)    |
| Accent Dark | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#2563EB;border:1px solid #1E40AF"></span> | `--accent-dark` | `#2563EB` | Accent hover state       |
| Glow        | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#22D3EE;border:1px solid #0891B2"></span> | `--glow`        | `#22D3EE` | Cyan glow effect         |
| Muted       | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#9CA3AF;border:1px solid #6B7280"></span> | `--muted`       | `#9CA3AF` | Muted/secondary text     |
| Card        | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#0D0D0D;border:1px solid #111827"></span> | `--card`        | `#0D0D0D` | Card background          |
| Card Border | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#1F1F1F;border:1px solid #374151"></span> | `--card-border` | `#1F1F1F` | Card/input borders       |
| Surface     | <span style="display:inline-block;width:28px;height:16px;border-radius:4px;background:#0A0A0A;border:1px solid #111827"></span> | `--surface`     | `#0A0A0A` | Input/surface background |

### 1.2 Typography

| Usage       | Font          | Variable               |
| ----------- | ------------- | ---------------------- |
| Body / UI   | Space Grotesk | `--font-space-grotesk` |
| Code / Mono | Geist Mono    | `--font-geist-mono`    |

Fonts loaded via `next/font/google` (optimized, no layout shift).

### 1.3 Custom Utilities

```css
.gradient-blue    /* Blue → Cyan gradient background */
.gradient-text    /* Blue → Cyan gradient text */
.glow-accent      /* Soft blue glow box-shadow */
```

### 1.4 Scrollbar

Custom dark scrollbar:

- Width: 6px
- Track: background color
- Thumb: card-border color, rounded

### 1.5 Tailwind v4 Configuration

Uses CSS-first configuration (`@theme inline` in globals.css):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --font-sans: var(--font-space-grotesk);
  --font-mono: var(--font-geist-mono);
}
```

Available as Tailwind classes: `bg-background`, `text-foreground`, `text-accent`, etc.
