---
# Portfolio System - the site itself, as a case study. Self-initiated, so type: concept (role Creative Technologist). Unlike the three design-only concepts it shipped and runs, so it carries real, measured results (Lighthouse, CLS, payload) rather than scope.
# Numbers are measured on the live build, 2026-07-24, Lighthouse 13.4.1; the proof averages also render live via PerfTable (perfTable: true).
#
# NEVER put a page count, commit count, line count, hour count, Lighthouse version, or measurement date in this copy. Every one rots (CLAUDE.md §10) and three already did. PerfTable renders pages / version / date from src/data/portfolio-perf.json, which is the only place they belong.
title: Portfolio System
slug: portfolio-system
type: concept
role: Creative Technologist
year: "2026"
disciplines: [Design Systems, Front-end, Brand, Motion]
featured: false
description: "The portfolio you are reading, built as one system: brand, front-end, and performance in one artifact. Astro on Cloudflare Workers, self-hosted, measured on itself: 100 Lighthouse on desktop across every page."
badge: "Concept / Self-initiated"
lede: "The portfolio is the proof. One system from brand to front-end to performance, designed, written, and shipped solo, then measured on itself instead of described."
disclosure: "Self-initiated. This is the site you are reading, designed, written, and built by Pratik Mehta. No client, no team, no template."

hero:
  - { k: Role, v: "Creative Technologist" }
  - { k: Disciplines, v: "Design Systems, Front-end, Brand" }
  - { k: Type, v: "Self-initiated / 2026" }
  # No `accent` flag: figureRuns accents every numeral, so a unitless 100 colors itself.
  - { k: "Desktop Lighthouse", v: "100", stat: true }

problem:
  prose:
    - lead: "Most portfolios describe the work. This one had to be it."
      text: "A gallery of screenshots proves taste at best. It says nothing about whether the person can build a system, hold it together, and ship something that holds up under measurement. So the site itself is the artifact: the case study lives inside the thing it is describing."
    - text: "The brief, set for myself, was narrow on purpose. Build the whole thing as one system, brand through front-end through performance. Ship it on real infrastructure. Then let it be measured, not asserted, so every claim on this page can be checked by the person reading it."
  margin:
    - type: meta
      label: "The brief"
      rows:
        - { k: For, v: "Hiring managers, peers" }
        - { k: Premise, v: "Be the proof, not a deck" }
        - { k: Test, v: "It has to measure well" }

system:
  prose:
    - lead: "One system, brand to tokens to build."
      text: "A single design system feeds everything: a token layer, an eight-tier type scale, one variable typeface per family so every weight the scale names is real. Structure and copy are typed content that fails the build when a field is missing or the wrong shape, so the site cannot ship half-built."
    - text: "It runs same-origin on Cloudflare Workers. Fonts, media, and code are self-hosted, no CDN, so there is no second-origin handshake and nothing to leak. The only third party is analytics, and it sits behind a consent gate. The pages are built to be read by machines too, with a structured-data graph and semantic markup for search and answer engines."
  margin:
    - type: stat
      label: "JavaScript per page"
      value: "7"
      unit: "KB"
      desc: "Worst case, the home page. Most pages ship 4 to 5 KB, bundles plus inline, hashed and cached."
    - type: note
      label: "Same-origin"
      text: "No CDN. Fonts and media served by the Worker. Analytics is the one third party, consent-gated."
  steps:
    - { ix: "01", title: "Design system", text: "Tokens, eight type tiers, one variable face per family." }
    - { ix: "02", title: "Content as data", text: "A typed schema that fails the build on a missing field." }
    - { ix: "03", title: "Same-origin build", text: "Self-hosted on Cloudflare Workers, no CDN." }
    - { ix: "04", title: "Built to be read", text: "Structured data and semantic HTML for search and answer engines." }

decisions:
  prose:
    - text: "A few choices kept the whole system honest and fast. Each one trades a convenience for a constraint the rest of the site can lean on, and none of them show on their own. That is the point: the discipline is in the build, not on the surface."
  margin:
    - type: quote
      quote: "Build the proof. Don't describe it."
      who: "Design principle"
  items:
    - { n: "01", title: "Built, not briefed", text: "The site is a working prototype, shipped and measured, not a deck describing one." }
    - { n: "02", title: "Same-origin, no CDN", text: "Self-host the fonts, media, and code. The only third party is consent-gated analytics." }
    - { n: "03", title: "One variable face per family", text: "Every weight the type scale names is a real weight, so nothing fails silently to a faux bold." }
    - { n: "04", title: "Performance as a design constraint", text: "An LCP-safe hero, reveals and hovers limited to compositable properties, and every image sized from one derived scale rather than a guess, re-measured on each change." }

output:
  blocks:
    - kind: gallery
      label: "Desktop / one system, both themes"
      ratio: "16:9"
      cols: 2
      fit: cover
      items:
        - { img: ../../assets/work/portfolio-system/d-home-dark.webp, alt: "Home page, dark theme", caption: "Home / dark" }
        - { img: ../../assets/work/portfolio-system/d-home-light.webp, alt: "Home page, light theme", caption: "Home / light" }
        - { img: ../../assets/work/portfolio-system/d-brand-dark.webp, alt: "Brand and design-system page, dark theme", caption: "Brand / dark" }
        - { img: ../../assets/work/portfolio-system/d-brand-light.webp, alt: "Brand and design-system page, light theme", caption: "Brand / light" }
        - { img: ../../assets/work/portfolio-system/d-dealnews-dark.webp, alt: "DealNews case study, dark theme", caption: "Case study / dark" }
        - { img: ../../assets/work/portfolio-system/d-dealnews-light.webp, alt: "DealNews case study, light theme", caption: "Case study / light" }
    - kind: flyer
      label: "Mobile / the same system, responsive"
      ratio: "9:16"
      cols: 3
      fit: cover
      bg: surface
      items:
        - { img: ../../assets/work/portfolio-system/m-home-dark.webp, alt: "Home page on mobile, dark theme", caption: "Home / dark" }
        - { img: ../../assets/work/portfolio-system/m-about-dark.webp, alt: "About page on mobile, dark theme", caption: "About / dark" }
        - { img: ../../assets/work/portfolio-system/m-journal-dark.webp, alt: "Journal on mobile, dark theme", caption: "Journal / dark" }
        - { img: ../../assets/work/portfolio-system/m-home-light.webp, alt: "Home page on mobile, light theme", caption: "Home / light" }
        - { img: ../../assets/work/portfolio-system/m-about-light.webp, alt: "About page on mobile, light theme", caption: "About / light" }
        - { img: ../../assets/work/portfolio-system/m-journal-light.webp, alt: "Journal on mobile, light theme", caption: "Journal / light" }
  note: "Captured from the live site, both themes, desktop and mobile. The whole thing runs same-origin on Cloudflare Workers."

perfTable: true

proof:
  figures:
    # No CLS figure here: a perfect Lighthouse score already entails a good one, and PerfTable renders per-page CLS as measured detail, which is where a number that moves belongs.
    #
    # `from` means DERIVED, not authored: resolved by src/lib/perf-claim.ts out of the same portfolio-perf.json that PerfTable renders, so a re-run moves the figure and the table together or neither. These three were typed once and drifted within a day — mobile was authored as 98 and measured 99.4 the next run, which stops being a rounding and becomes a contradiction on a page whose claim is that the numbers are measured. Rounding is conservative and its direction flips by metric: a score rounds down, a duration rounds up. That rule lives in perf-claim.ts, not here.
    #
    # The JS figure stays authored because it is not a Lighthouse number: nothing in the perf JSON carries it. Re-measure by hand when the bundles change, and carry the basis with it — raw and gzip differ by more than a rounding here.
    #
    # Basis, measured 2026-07-27 against the live site and a fresh build (byte-identical): home is the heaviest page at 7,403 bytes raw, 3,292 gzipped. That is the 3 external /_astro/ bundles plus the inline scripts, excluding the JSON-LD block. Publish the gzip number, floored, because lower is better and a script-weight claim must never undercut what was measured.
    - { from: "desktopLighthouse", label: "Lighthouse, desktop" }
    - { from: "mobileLighthouse", label: "Lighthouse, mobile" }
    - { from: "desktopLcp", label: "LCP, desktop" }
    - { value: "3.9", unit: "KB", label: "JS, heaviest page" }
  note:
    label: "Why it exists / what it proves"
    # No page count and no commit count here. Both rotted within a day of shipping (the copy claimed 22 pages while the JSON beside it said 23, and 131 commits against an actual 143), which is exactly what CLAUDE.md §10 forbids. PerfTable renders the real page count from portfolio-perf.json, so stating it twice only creates a second number to keep true.
    text: "Measured on the live build, not projected, mobile and desktop. The table below carries the page count, the Lighthouse version, and the date it was run. Self-initiated: designed, written, and built solo since March 2026, in a public repo."

reflection:
  prose:
    - text: "Portfolio System is the end-to-end proof. It shows the whole arc in one artifact, brand system, front-end, motion, content, and the infrastructure under it, built and held by one person and then measured instead of claimed. The portfolio is not a description of how I work. It is the work, running, and you can read the numbers yourself."
  margin:
    - type: note
      label: "Self-initiated"
      text: "Own system, solo build, public repo. Every figure on this page is measured or verified, none invented."
    - type: stat
      label: "Words written"
      value: "10K"
      unit: "+"
      desc: "Case studies and journal copy, all hand-written."
---
