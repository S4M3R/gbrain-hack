---
version: alpha
name: Terrain
description: A warm minimalist design system for human-first run and activity sharing. Built for the athlete who runs before sunrise and wants to share the feeling, not just the data.

colors:
  # Backgrounds
  fog: "#F2EDE8"
  surface: "#FAFAF8"
  surface-elevated: "#FFFFFF"

  # Text
  ink: "#1C1917"
  slate: "#78716C"
  ghost: "#A8A29E"

  # Accent — Terracotta. The color of dirt trails, dawn light, and well-worn paths.
  terracotta: "#D4602A"
  terracotta-muted: "#F5E6DD"
  terracotta-deep: "#A8431A"

  # Semantic
  pr-green: "#2D6A4F"
  pr-green-muted: "#D6EDE3"
  border: "#E8E2DC"

typography:
  # DM Serif Display — warmth and editorial weight for display moments
  display:
    fontFamily: DM Serif Display
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em

  headline-lg:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em

  headline-md:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3

  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6

  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5

  # Space Grotesk — used exclusively for all numeric data
  data-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.02em

  data-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.01em

  data-sm:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1

  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.08em

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  card-padding: 20px
  feed-max-width: 680px
  gutter: 16px

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface-elevated}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: 14px 24px
  button-primary-hover:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.surface-elevated}"

  button-secondary:
    backgroundColor: "{colors.terracotta-muted}"
    textColor: "{colors.terracotta}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: 12px 20px
  button-secondary-hover:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.surface-elevated}"

  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: 10px 16px

  button-kudos:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.slate}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  button-kudos-active:
    backgroundColor: "{colors.terracotta-muted}"
    textColor: "{colors.terracotta}"

  activity-card:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"

  stat-tile:
    backgroundColor: "{colors.fog}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 14px 16px

  achievement-badge:
    backgroundColor: "{colors.terracotta-muted}"
    textColor: "{colors.terracotta-deep}"
    rounded: "{rounded.full}"

  pr-badge:
    backgroundColor: "{colors.pr-green-muted}"
    textColor: "{colors.pr-green}"
    rounded: "{rounded.full}"

  input:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 12px 16px

  chip:
    backgroundColor: "{colors.fog}"
    textColor: "{colors.slate}"
    rounded: "{rounded.sm}"
    padding: 6px 12px
  chip-active:
    backgroundColor: "{colors.terracotta-muted}"
    textColor: "{colors.terracotta}"

  share-card:
    backgroundColor: "{colors.fog}"
    rounded: "{rounded.xl}"
    padding: 28px

  route-map:
    rounded: "{rounded.lg}"

  comment-bubble:
    backgroundColor: "{colors.fog}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
---

# Terrain Design System

## Overview

Terrain is built on a single belief: **a run is a human act, not a performance metric.**

The visual language rejects the dark, aggressive, data-obsessed aesthetic of legacy fitness apps. Instead it embraces warmth, breath, and the honest feeling of movement — the way dawn light hits pavement, the texture of a dirt trail, the quiet pride after a hard effort.

The target user is not a competitive athlete grinding PRs. They are someone who runs because it makes them feel alive, and wants to share that feeling with people they care about. Every design decision should serve that emotional truth.

The overarching aesthetic is **warm minimalism with editorial weight**: generous white space, a body temperature color palette, a serif display typeface that feels like a journal entry, and a monospaced data face that makes numbers feel precise without feeling cold.

---

## Colors

The palette is built from the physical world of outdoor running: trail dirt, morning fog, worn leather, and the single warm flash of a terracotta sunrise.

- **Fog (`#F2EDE8`):** The global background. A warm, desaturated sand — not gray, not beige, something in between. Never use pure `#ffffff` as a page background. Fog is what the user breathes.

- **Surface (`#FAFAF8`):** For subtle elevation above Fog — section backgrounds, tab bars, input areas. Barely distinguishable from Fog; the distinction lives in context, not contrast.

- **Surface Elevated (`#FFFFFF`):** Cards and modals only. White earns its place by contrast against Fog; it signals that something important is happening here.

- **Ink (`#1C1917`):** Warm near-black for all primary text and the primary button. Never use `#000000`. Ink is a warm dark brown, not cold black.

- **Slate (`#78716C`):** Secondary text, metadata, timestamps, supporting labels. The voice of the app when it's not the star.

- **Ghost (`#A8A29E`):** Placeholder text, empty states, disabled controls.

- **Terracotta (`#D4602A`):** The single accent color. Used for primary interactive moments, active states, and milestone highlights. Terracotta appears sparingly — one action per screen. When everything is terracotta, nothing is.

- **Terracotta Muted (`#F5E6DD`):** The soft background version of Terracotta. Used in badges, active chips, and the kudos active state. It communicates warmth without demanding attention.

- **PR Green (`#2D6A4F`) + Muted (`#D6EDE3`):** Reserved exclusively for personal records. A quiet forest green that feels earned, not celebratory. PRs are serious; the color should feel serious.

- **Border (`#E8E2DC`):** Card dividers, input outlines, separators. Warm, nearly invisible.

---

## Typography

Typography is the heartbeat of Terrain. Two families. Three roles. No exceptions.

**DM Serif Display** carries emotion. It appears in display moments — run titles, achievement headlines, empty state messages, onboarding copy. Its warmth and editorial weight make numbers feel like stories.

**DM Sans** handles all prose, UI labels, and navigation. It is the neutral voice of the interface — never competing with the data or the photography.

**Space Grotesk** owns all numeric data — distance, pace, elevation, time, heart rate, cadence. Its geometric precision makes stats scannable and trustworthy. If a character on screen is a number representing athletic data, it must be in Space Grotesk. No exceptions.

### Scale

- `display` — Run titles in the detail view, onboarding headers, share card headlines. 40px DM Serif Display.
- `headline-lg` — Section headers, profile name. 24px DM Sans SemiBold.
- `headline-md` — Card section headers, settings labels. 18px DM Sans SemiBold.
- `body-lg` — Comments, descriptions, run notes. 16px DM Sans Regular.
- `body-sm` — Secondary descriptions, helper text. 14px DM Sans Regular.
- `data-xl` — The hero stat on a run detail (primary distance or time). 36px Space Grotesk SemiBold.
- `data-md` — Secondary stats in the stat row (pace, elevation, HR). 20px Space Grotesk Medium.
- `data-sm` — Tertiary stats in compact views. 14px Space Grotesk Medium.
- `label-caps` — All-caps metric labels ("KM", "PACE", "ELEV"), button text, navigation labels. 11px Space Grotesk Medium, 0.08em tracking.

---

## Layout

The layout model is a **single-column feed with contained cards**. The feed breathes.

- **Feed max-width:** 680px, centered on tablet and desktop.
- **Card padding:** 20px on all sides. Cards are not dense.
- **Gutter:** 16px between feed items.
- **Base grid:** 8px. All spacing values are multiples of 8px (with a 4px half-step for micro-adjustments within components).
- **Mobile margins:** 16px horizontal margin on mobile.

### Stat Grid

Inside an activity card, stats are displayed in a **2×2 or 2×3 grid of Stat Tiles**. Each tile shows one metric. Tiles are fog-colored, with the value in `data-md` and the label in `label-caps` below.

The primary metric (usually distance) may span the full width as a solo hero tile using `data-xl`.

### Share Card

The share card is a **self-contained 4:5 ratio card** designed to be screenshot and posted to Instagram or iMessage. It lives on the run detail screen. It contains:

1. Route map thumbnail (full width, rounded top corners)
2. Run title in `display` serif
3. Hero stat (distance) in `data-xl`
4. Supporting stat row: pace + elevation in `data-md`
5. User name + app wordmark at the bottom

The share card background is Fog, giving it an off-white warmth that reads beautifully on social.

---

## Elevation & Depth

Terrain uses **tonal layering**, not shadows.

- Page: Fog (`#F2EDE8`)
- Cards: Surface Elevated (`#FFFFFF`) — the elevation is implied by the contrast against Fog
- Modals and bottom sheets: Surface Elevated with a subtle backdrop (`rgba(28, 25, 23, 0.4)`)

The one exception: activity cards may use a micro shadow — `0 1px 4px rgba(28, 25, 23, 0.06)` — to lift them from the feed background on high-ambient screens. Keep it nearly invisible; the card should feel placed, not floating.

Never use heavy drop shadows. Never use blur-based glass effects. The depth in Terrain is achieved through tonal contrast and generous whitespace, not visual tricks.

---

## Shapes

Shape language is **warm and generous**. Corners are round but not bubbly.

- `sm` (8px): Stat tiles, chips, tags, input fields.
- `md` (12px): Secondary cards, tooltips, comment bubbles.
- `lg` (16px): Activity cards, route map thumbnails, bottom sheets.
- `xl` (24px): Share cards, achievement modal, full-screen overlays.
- `full` (9999px): All buttons, kudos button, badges, avatar images.

Never mix sharp (0px) and rounded corners in the same screen. All interactive containers are rounded.

---

## Components

### Activity Card

The core unit of the app. Every run lives in one.

Structure (top to bottom):
1. **Header row:** Avatar (32px circle) + user name in `headline-md` + timestamp in `body-sm` slate + optional PR badge
2. **Route map:** Full-width map thumbnail, `rounded.lg`, 180px tall on mobile. Route line drawn in Terracotta.
3. **Run title:** DM Serif Display `headline-md` weight. Editable. This is the emotional hook — encourage users to name their runs ("Thursday Magic Hour", not "Run #42").
4. **Hero stat tile:** Full-width tile. Distance in `data-xl`, label in `label-caps`.
5. **Stat row:** 2 or 3 tiles in a row. Pace, elevation, time, HR — whichever 2-3 the user tracks. Each tile: fog bg, `data-md` value, `label-caps` label.
6. **Social row:** Kudos button (count) + Comment button (count) + Share button. All ghost style unless active.

### Kudos Button

A pill button (`rounded.full`). Resting state: ghost, slate text, "♡ 12". Active state: terracotta-muted bg, terracotta text, "♥ 13". The transition is a short scale spring animation (120ms, spring easing). Never use a simple toggle; the spring makes it feel alive.

### Stat Tile

Fog background, `rounded.md`. Two lines:
- Line 1: value in `data-md` (or `data-xl` for hero tile), ink color
- Line 2: label in `label-caps`, slate color

Stat tiles never have borders. Their distinction from the card background is purely tonal.

### PR Badge

A small pill badge: PR Green Muted background, PR Green text, "PR" in `label-caps`. Appears inline next to the run title or in the card header. One PR badge per card maximum.

### Achievement Badge

Terracotta Muted background, full-circle, icon centered. For milestone events (first 10K, 100th run, weekly streak). Shown in a dedicated achievement shelf on the profile screen.

### Share Card

Fog background, `rounded.xl`, fixed 4:5 ratio. Padding: 28px. The share card is the most designed surface in the app — it exists to be beautiful outside the app. The route map takes the top 55% of the card. Below it: run title in `display`, hero stat, supporting stat row, user handle in `label-caps` ghost, and a small Terrain wordmark aligned right.

### Route Map

The map uses a desaturated, warm map style (Stamen Toner Lite or equivalent warm grayscale). The route is rendered as a 3px Terracotta stroke. No pins, no labels on the map — just the shape of the run. The route is the art.

### Input Fields

Surface Elevated background, Border outline (1px), `rounded.md`. Label floats above in `label-caps` slate when focused. Focus ring: 2px Terracotta. Error state: a soft red text below (never a red background).

### Chips (Filter / Category)

Default: Fog background, slate text, `rounded.sm`. Active: Terracotta Muted background, Terracotta text. Used for filtering the feed ("All", "Running", "Cycling", "Hiking").

### Comment Bubble

Fog background, `rounded.lg`. Avatar (28px) sits to the left. User name in `body-sm` SemiBold + comment text in `body-sm` regular. Timestamp in ghost color, `body-sm`.

---

## Do's and Don'ts

**Do:**
- Use Fog (`#F2EDE8`) as the universal page background. Never use pure white as a background.
- Use Space Grotesk for every distance, pace, time, elevation, and HR value on screen. No exceptions.
- Use DM Serif Display only for emotionally significant moments: run titles, achievement headlines, empty states.
- Keep Terracotta rare. One primary action or highlight per screen.
- Give cards breathing room — 16px gutter minimum between cards in the feed.
- Render route maps in desaturated warm grayscale with a Terracotta route line.
- Use PR Green exclusively for personal record moments. Never for general success states.
- Use `label-caps` (all-caps Space Grotesk) for every metric label: KM, PACE, ELEV, BPM, MIN/KM.
- Encourage users to name their runs — the run title in DM Serif is the most human element in the card.

**Don't:**
- Use pure black (`#000000`) or pure white (`#FFFFFF`) as page backgrounds anywhere.
- Put more than one Terracotta action per screen.
- Use sans-serif for the run title or any display headline.
- Use serif type for numeric data.
- Add heavy drop shadows. Tonal contrast creates depth.
- Mix sharp and rounded corners on the same screen.
- Show more than 3 stats in a compact card — use progressive disclosure (tap to expand).
- Use more than two font families. DM Serif Display + DM Sans + Space Grotesk. That is the complete set.
- Apply the PR badge to anything that is not a verified personal record.
- Make the route map look like Google Maps. Strip it. It should look like a print, not a navigation tool.
