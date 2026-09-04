---
name: butr landing
description: The category standard played straight; an open-source TypeScript library landing at viem's craft level, light only, butter-yellow on white.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.852 0.199 91.936)"
  primary-foreground: "oklch(0.421 0.095 57.708)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  ring: "oklch(0.852 0.199 91.936)"
  butter-top: "#FDD754"
  butter-base: "#F6BA48"
  fold-top: "#EDA134"
  fold-base: "#F2A337"
typography:
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
    letterSpacing: "normal"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  subline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.556
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.429
    letterSpacing: "normal"
  code:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.714
    letterSpacing: "normal"
  mono-label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  section: "96px"
  section-lg: "128px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  nav-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  nav-link-hover:
    textColor: "{colors.foreground}"
  version-chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.md}"
    padding: "2px 6px"
  fact-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  chain-tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "16px"
  code-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    rounded: "{rounded.lg}"
    padding: "20px"
  install-tab:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  install-tab-active:
    textColor: "{colors.foreground}"
  inline-code:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: butr landing

## Overview

**Creative North Star: "The Benchmark Played Straight"**

The landing is the open-source TypeScript-library genre executed at viem's craft level, with nothing invented. It reads instantly as a peer of viem and wagmi: a wordmark-as-headline, a bolded-keyword subline, a package-manager install card, a strip of fact chips, four flat feature cards, a numbered overview code panel, and one giant ghosted brand mark bleeding off the right edge. Every element earns its place by being true (the version, the license, the package count, the runnable code) rather than by being expressive. The world is the incumbent butr system executed at benchmark fidelity, chosen on 2026-09-03 over three authored alternatives.

Density is calm and evenly gridded: one 1152px column, 24px gutters, 96px to 128px between sections, white surfaces separated by hairline borders instead of shadows. The palette is monochrome white-and-near-black with a single warm intrusion, the butter-yellow primary, which lives on the mark, the primary button, the active install tab, focus rings, and text selection, and almost nowhere else. The landing is light-only by decision; the docs app owns the `.dark` counterpart.

**Key Characteristics:**

- Geist for everything sans, Geist Mono for commands, chips, and code; the display voice is the wordmark itself, not a type style.
- One accent (butter, `primary`) on a white and neutral-gray field; brown `primary-foreground` text on butter, never white.
- Borders, not shadows: every surface is flat, bounded by a 1px `border` hairline, and rests on white.
- Three radii, all derived from one 10px base (6 / 8 / 10px); cards and code panels take the full 10px.
- Real material only: shipped facts, shipped API, official chain icons, no invented proof.
- A single decorative gesture per page: the 6%-opacity butter mark watermark behind the hero.

## Colors

A white field, near-black ink, three grays, and one butter-yellow accent that carries the brand's warmth; everything else is structure.

### Primary

- **Butter** (`primary`, oklch(0.852 0.199 91.936)): the brand's single accent. Fills the primary button, underlines the active install tab (2px), draws every `focus-visible` outline as `ring`, and tints text selection at 35% over transparent. It is not a text color.
- **Toast** (`primary-foreground`, oklch(0.421 0.095 57.708)): the deep brown that sits on butter. The only foreground used over the primary fill; white on butter fails contrast and is never used.
- **Butter gradient** (`butter-top` #FDD754 to `butter-base` #F6BA48; fold `fold-top` #EDA134 to `fold-base` #F2A337): the fixed two-stop gradients of the brand mark. They are locked to the SVG and never reused as UI fills. The wordmark beside the mark is `currentColor`, so it follows `foreground`.

### Neutral

- **Paper** (`background` / `card`, oklch(1 0 0)): page and every surface. Cards are the same white as the page; the border, not a tonal step, marks the edge. The sticky header is the same white at 80% over a 12px backdrop blur.
- **Ink** (`foreground`, oklch(0.145 0 0)): body headings, bolded chain names in the subline, card titles, active nav and tab text, the wordmark.
- **Graphite** (`muted-foreground`, oklch(0.556 0 0)): default paragraph and subline color, inactive nav links and tabs, chip labels, the `$` prompt, the copy icon, footer links. Hover lifts it to Ink.
- **Mist** (`muted` / `secondary`, oklch(0.97 0 0)): the version-chip fill and the secondary button's hover fill. The only tonal step above Paper.
- **Hairline** (`border`, oklch(0.922 0 0)): every card, chip, code panel, header (at 60% alpha) and footer edge, tab-strip divider, and the chip's internal label/value divider.

### Named Rules

**The One Accent Rule.** Butter appears as a fill on exactly one control per view (the primary button), as a 2px indicator on the active tab, and on focus and selection. It is never a heading color, a link color, or a card background.

**The Toast-on-Butter Rule.** Text over the primary fill is always `primary-foreground` brown. No white-on-yellow anywhere.

**The Same-White Rule.** Cards, code panels, chips, and the page share one white. Depth is a border, not a tint.

## Typography

**Display Font:** the butr wordmark (inline SVG, `currentColor`), sized 64px tall on mobile and 80px from 640px up; there is no display type style.
**Headline / Body Font:** Geist (with `ui-sans-serif, system-ui, sans-serif`), loaded via `next/font` as `--font-geist`, `display: swap`.
**Label/Mono Font:** Geist Mono (with `ui-monospace, SFMono-Regular, Menlo, monospace`), `--font-geist-mono`.

**Character:** Neutral, technical, unornamented. Weight does the hierarchy work (600 for headings and card titles, 500 for controls and labels, 400 for everything else); size steps are few and Tailwind-default. Mono is reserved for things a developer would type or read as a value: the install command, the version, fact chips, tab labels, code.

### Hierarchy

- **Display**: the wordmark SVG as the `h1` (with an `sr-only` "butr"), 64px tall, 80px at 640px+. Only the hero uses it; the header and footer carry the same mark at 20px and 24px.
- **Headline** (600, 30px/36px, tracking -0.025em; 36px/40px at 640px+): section titles ("Overview", "Supported chains", "Hand the signer to your library.", "Get started in a few lines."). `text-balance` when the title wraps.
- **Title** (600, 18px/28px): feature-card titles.
- **Lead** (400, 20px/28px, Graphite): the hero subline, max width 44ch, with chain names bolded to 600 Ink. This is the only place bold inline emphasis is used.
- **Subline** (400, 18px/28px, Graphite): the paragraph under each section headline, max width 48 to 60ch, `text-pretty`.
- **Body** (400, 16px/24px, Graphite): card body copy and footer copy on mobile.
- **Label** (500, 14px/20px): button text, nav links, card "See more" links, chain-tile names, footer column titles; footer links drop to 400.
- **Code** (Geist Mono 400, 14px/24px): code panels (24px line height), the install command, tab labels, inline `getSigner()` (rendered at 16px in a 6px-radius bordered pill inside the subline).
- **Mono label** (Geist Mono 400, 12px/16px): the header version chip and the fact chips; the chip value is 500.

### Named Rules

**The Wordmark-as-Headline Rule.** The hero `h1` is the logo, not a sentence. The first typeset words on the page are the subline; the product's name is never set in Geist.

**The Two-Step Headline Rule.** Section headlines are 30px on mobile and 36px from 640px; there is no third breakpoint and no clamp.

**The Mono-Means-Value Rule.** Geist Mono marks something typed or measured (commands, versions, counts, code). It is never used for prose or headings.

## Layout

One centered column, 1152px max (`max-w-6xl`), with 24px side gutters at every width. The header is 56px tall, sticky, and z-indexed above the page with an 80% white fill and a 12px backdrop blur; its bottom hairline is `border` at 60% alpha.

The hero is a two-column grid from 1024px (`lg`) with a 48px gap; below that it stacks. Top padding is 80px (112px at `lg`), bottom 64px (96px at `lg`). The left column holds the wordmark, the subline (margin-top 28px), and a wrapping button row (margin-top 36px, 12px gaps). The right column is a vertical flex with 20px gap: the install card on top, the fact chips (6px gap, wrapping) beneath. The watermark mark sits absolutely at vertical center, 96px past the right edge, `min(46rem, 70vw)` wide, hidden below `lg`.

Feature cards: a 1 / 2 / 4 column grid at base / 640px / 1024px with 16px gaps, placed directly under the hero with no extra section padding. Sections after that use 96px top padding, 128px from 640px. The overview section narrows its content to 768px (`max-w-3xl`) for readability; the chains grid is 2 columns, 5 at 640px, 12px gaps; the bridge section is a two-column grid at `lg` with a 40px gap and vertically centered columns. The closing card is a full-width bordered panel with 56px vertical padding on mobile, 80px from 640px, and 96px / 128px of section padding around it.

Footer: a 2 / 4 column grid at base / 640px, 32px gaps, 48px vertical padding, with the brand block spanning two columns and 40px bottom padding on the copyright line.

Copy widths are capped in characters, not pixels: 44ch (hero subline), 48ch (bridge and closing sublines), 60ch (overview and chains sublines), 36 to 56ch (footer blurb). All multi-line copy is `text-pretty`; wrapping headlines are `text-balance`.

**The 1152 / 24 Rule.** Every section shares the same 1152px column and 24px gutters; nothing bleeds except the decorative watermark, which is clipped by the hero's `overflow-hidden`.

## Elevation & Depth

The page is flat. No surface on the landing carries a box-shadow; depth is conveyed by a 1px `border` hairline around each raised element (cards, chips, the install card, code panels, the closing panel) on the same white as the page. The sticky header gains presence through translucency and a 12px backdrop blur rather than a shadow. The one atmospheric element is the brand mark at 6% opacity behind the hero, which reads as paper texture rather than a layer.

### Named Rules

**The Borders-Not-Shadows Rule.** Elevation is declared once, on the page: every panel is `border` + `shadow-none`. The code panel explicitly overrides its component default (shadow + ring) to comply. New surfaces on the landing take a hairline, never a shadow.

**The Blur-Is-Not-Depth Rule.** The header's backdrop blur is a legibility device over scrolling content, not an elevation tier. Do not add blur to cards or panels.

## Shapes

All corners derive from a single 10px base (`--radius: 0.625rem`): 6px (`sm`) for small inline targets (inline code pill, focus outlines on text links and icon buttons), 8px (`md`) for controls (buttons, nav links, chips, the version chip, tab tops), and 10px (`lg`) for surfaces (cards, install card, code panels, chain tiles, closing panel). Borders are always 1px hairlines in `border`; the only thicker stroke is the 2px butter underline on the active install tab, pulled 1px down with a negative margin so it sits on the tab-strip divider. Fact chips are a two-cell pill: label cell, 1px vertical divider, value cell, all clipped by the 8px radius. Nothing is pill-shaped or circular; the brand mark's own rounded-square silhouette is the only organic form on the page.

**The One-Base Radius Rule.** Radii are 6 / 8 / 10px and nothing else. Larger surfaces do not get larger corners.

## Components

### Buttons (`ButtonLink`)

Quiet, compact, text-led; the primary is the only butter fill on the page.

- **Shape:** softly rounded (8px), inline-flex, centered, `whitespace-nowrap`, 8px gap for any icon.
- **Primary:** Butter fill, Toast text, 500 14px, 10px vertical / 14px horizontal padding. Used for "Get started" and "Read the docs" only.
- **Primary hover:** same fill, `filter: brightness(0.95)`; no color change.
- **Secondary:** Paper fill, Ink text, 1px Hairline border, same padding. "Why butr?", "GitHub", "Integration guides", "Try the live demo".
- **Secondary hover:** fill shifts to Mist; text and border unchanged.
- **Focus:** 2px `ring` (butter) outline, 2px offset, `focus-visible` only. No box-shadow focus.
- **Small size** (6px vertical / 12px horizontal) exists in the component but is not used on the page.

### Chips

- **Fact chip:** Paper fill, Hairline border, 8px radius, Geist Mono 12px. Two cells: Graphite label (10px horizontal, 6px vertical padding) then a 1px Hairline divider then an Ink 500 value (8px horizontal). Non-interactive; four per page (license, wallets, packages, react).
- **Version chip:** Mist fill, Graphite text, Geist Mono 12px, 8px radius, 2px / 6px padding, sitting 12px beside the header wordmark inside the homepage link.

### Cards / Containers

- **Corner Style:** 10px.
- **Background:** Paper (same as page).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 24px for feature cards; 16px horizontal / 16px vertical for chain tiles; 24px horizontal and 56px to 80px vertical for the centered closing panel.
- **Feature card anatomy:** `h2` Title (600 18px), Graphite body (margin-top 8px, `grow` so link rows align), then a "See more" text link (Ink, 500 14px, margin-top 16px) with a 4px-offset underline on hover only.
- **Chain tile:** 24px official branded network icon (`@web3icons/react`) with a 12px gap to a 500 14px name.

### Code Panel (`CodeBlock`, page rule)

Server-rendered Shiki, `github-light` theme so comments stay above 4.5:1 on white. 10px radius, 1px Hairline border, `shadow-none`, `ring-0`, `overflow-hidden`; the `pre` scrolls horizontally with 20px padding and 24px line height at 14px Geist Mono. The overview sample is numbered with `// 1.`, `// 2.`, `// 3.` comments so the panel reads top-down as a three-step story.

### Install Tabs (signature)

The right-hand hero card: a 10px-radius Hairline-bordered Paper card. The tab strip is a `role="tablist"` with 4px gap, 8px horizontal / 8px top padding, and a bottom Hairline. Tabs (`npm`, `pnpm`, `yarn`, `bun`) are Geist Mono 14px, 6px / 12px padding, rounded 8px on top only; inactive tabs are Graphite and lift to Ink on hover; the active tab is Ink with a 2px Butter bottom border pulled 1px into the divider. Focus outlines on tabs are inset (`-2px` offset) so they stay inside the card. The panel row is 16px vertical / 20px horizontal padding, Geist Mono 14px, with a Graphite non-selectable `$ ` prompt before the command and a 28px square copy button on the right whose inline SVG (2px stroke, 16px) swaps to a check for 2 seconds after copying; its hit target expands to at least 48px on coarse pointers.

### Navigation

Header: wordmark (20px tall) plus version chip on the left; three text links (Docs, Demo, GitHub) on the right at 500 14px, Graphite, 6px / 12px padding, 8px radius, 4px gap. Hover lifts to Ink; there is no active state (all three are external). Focus is the standard 2px butter outline. The header is identical at every width; there is no hamburger, no mobile drawer.

Footer: a top Hairline, the wordmark (24px) with a one-line Graphite blurb, then two link columns (Resources, Project) titled in 500 Ink and listed in 400 Graphite with 12px row spacing; links lift to Ink on hover. Footer type is 16px on mobile and 14px from 640px.

### Brand Mark (`BrandLogo`, `BrandMark`)

The wordmark fill is `currentColor` (so it inherits Ink); the butter mark keeps its fixed two-gradient fill. Used at 20px (header), 24px (footer), 64 / 80px (hero `h1`), and as the mark alone at `min(46rem, 70vw)` and 6% opacity as the hero watermark, `pointer-events: none`, `select-none`, hidden below 1024px.

## Do's and Don'ts

### Do:

- **Do** put every raised surface on the same white with a 1px Hairline (`border`) and `shadow-none`; when a component ships a default shadow, override it at the call site.
- **Do** keep Butter to one filled control per view plus the active-tab indicator, focus rings, and selection.
- **Do** set text over Butter in Toast (`primary-foreground`), never white.
- **Do** use Geist Mono only for commands, versions, counts, tab labels, and code.
- **Do** cap prose by character count (44 / 48 / 60ch) and set it `text-pretty`; balance wrapping headlines.
- **Do** derive every corner from the 10px base: 6px inline, 8px controls, 10px surfaces.
- **Do** ship focus as a 2px `ring` outline with 2px offset on `focus-visible`; inset it (`-2px`) inside bordered strips.
- **Do** step section headlines exactly once, 30px to 36px at 640px, with -0.025em tracking.
- **Do** load the brand mark as inline SVG with `currentColor` on the wordmark so it follows `foreground`.

### Don't:

- **Don't** add a dark scheme to the landing; `color-scheme: light` is declared and the docs app owns `.dark`.
- **Don't** use box-shadows, rings, or tonal tints to separate surfaces from the page.
- **Don't** use Butter as a text, heading, or link color.
- **Don't** set the product name in Geist; the wordmark SVG is the name.
- **Don't** invent proof: no logos, testimonials, counts, or benchmarks; chips and code carry only shipped facts.
- **Don't** introduce corner radii outside 6 / 8 / 10px, or pill and circular shapes.
- **Don't** apply backdrop blur to anything but the sticky header.
- **Don't** add a mobile drawer or hamburger; the three-link header is the navigation at every width.
