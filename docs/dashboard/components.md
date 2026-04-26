---
title: "Components & Styling"
description: "Design system, color palette, typography, UI components"
---

## 1. Styling & Design System

### 1.1 Color Palette

| Name | CSS Variable | Hex | Usage |
|------|-------------|-----|-------|
| Background | `--background` | `#000000` | Page background |
| Foreground | `--foreground` | `#E5E7EB` | Primary text |
| Accent | `--accent` | `#3B82F6` | Primary accent (blue) |
| Accent Dark | `--accent-dark` | `#2563EB` | Accent hover state |
| Glow | `--glow` | `#22D3EE` | Cyan glow effect |
| Muted | `--muted` | `#9CA3AF` | Muted/secondary text |
| Card | `--card` | `#0D0D0D` | Card background |
| Card Border | `--card-border` | `#1F1F1F` | Card/input borders |
| Surface | `--surface` | `#0A0A0A` | Input/surface background |

### 1.2 Typography

| Usage | Font | Variable |
|-------|------|----------|
| Body / UI | Space Grotesk | `--font-space-grotesk` |
| Code / Mono | Geist Mono | `--font-geist-mono` |

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
