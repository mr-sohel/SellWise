# SellWise UI Design System

## Overview
SellWise uses a warm-grounded visual identity built on top of Bootstrap 5. The design extends Bootstrap's utility system with custom CSS variables (tokens), a deliberate typography hierarchy, and signature component patterns — chosen to stand out from generic SaaS templates while remaining practical for a university defense project.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#4338ca` | Primary actions, links, active nav, accent elements |
| `--brand-hover` | `#3730a3` | Button hover, link hover |
| `--brand-light` | `#eef2ff` | Soft backgrounds, active nav highlight |
| `--accent` | `#d97706` | Rank badges, secondary highlights (amber) |
| `--bg-app` | `#faf8f5` | Page background — warm off-white |
| `--bg-sidebar` | `#f5f2ed` | Sidebar background (slightly warmer) |
| `--border-color` | `#e7e2dc` | Card borders, dividers |
| `--text-primary` | `#1c1917` | Headings, bold text |
| `--text-main` | `#57534e` | Body text |
| `--text-muted` | `#a8a29e` | Secondary text |

Brand is indigo (`#4338ca`), not the default Bootstrap blue (`#0d6efd`). The background is warm-toned (`#faf8f5`) rather than cool gray — this is the key differentiator from default Bootstrap look.

## Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | Outfit | 600-800 |
| Body / UI text | Plus Jakarta Sans | 300-800 |
| KPI values, page titles | Outfit | 700-800 |

Both fonts are loaded via Google Fonts CDN in `site.css`. Outfit gives headings a modern, confident look; Plus Jakarta Sans provides excellent readability at small sizes.

## Layout

- **Sidebar:** Fixed vertical nav (260px on lg+) with Lucide-style inline SVGs. Active route highlighted with `--brand-light`.
- **Top bar:** Sticky search bar + profile dropdown with avatar initial.
- **Main content:** Flush with the sidebar, `1.75rem 2rem` padding.
- **Auth:** Centered card on `auth-bg` gradient (indigo radial glow).

## Signature Component: Forecast Grid

The demand forecast grid is the visual hero of the Dashboard:
- 6-card responsive grid (`auto-fill, minmax(180px, 1fr)`)
- Each card has a floating rank badge (brand-colored circle, top-left) and an AI badge (top-right)
- Sparkline SVGs with brand palette stroke colors
- Hover lifts card (`translateY(-3px)`) with indigo border glow
- Card shows: rank, product name, category, sparkline, predicted units, stock level, daily average

## Component Patterns

- **KPI Cards:** 2x2 grid; title is uppercase muted, value is large Outfit bold; icon in a rounded square with soft brand-colored background.
- **Card hover:** All cards lift 2px with `--shadow-md` on hover.
- **Timeframe buttons:** Segmented button group (`btn-group-timeframe`) with `#f0ece6` background, active pill with white bg + shadow.
- **Performers lists:** Ranked list with position number in a small rounded badge (amber for top, neutral for rest), stock bar indicator for at-risk items.
- **Badge variants:** `.badge-momentum` (amber bg), `.badge-atrisk` (red bg), `.badge-champion` (indigo), `.badge-potential` (sky).
- **Auth buttons:** `.btn-dark-pill` — dark text-colored pill button.

## Data Visualization (Chart.js)

- Revenue line chart: brand color line (`#4338ca`) with subtle brand fill, white dots.
- Category doughnut: 80% cutout with brand-violet-sky-amber-green palette, center label overlay.
- All Chart.js text uses Plus Jakarta Sans to match the app.

## Responsive Behavior

- Breakpoints follow Bootstrap 5 defaults.
- Sidebar collapses to full width on mobile.
- Auth card reduces padding on small screens.
- Forecast grid stacks to single column on narrow viewports.

## Files

| File | Role |
|------|------|
| `wwwroot/css/site.css` | All custom CSS (~900 lines) |
| `Views/Shared/_Layout.cshtml` | Main layout (sidebar, topbar, footer) |
| `Views/Shared/_AuthLayout.cshtml` | Auth layout (auth-bg gradient) |
| `Views/Dashboard/Index.cshtml` | Dashboard with forecast grid, KPIs, charts |
| `Views/Auth/Login.cshtml` | Login page with brand logo |
