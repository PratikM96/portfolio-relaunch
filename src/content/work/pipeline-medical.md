---
# Pipeline Medical - content entry (refit). Drop-in for src/content/work/pipeline-medical.md
# Client, internship (do not inflate). Proof is scope. Framed as product/marketplace from zero, not healthcare
# messaging. Scope-rich role: margins lean qualitative. No em/en dashes.
title: Pipeline Medical
slug: pipeline-medical
type: client
role: Designer (Internship)
year: "2017"
disciplines: [Brand, UI/UX, Product]
cover: "" # [NEEDS: cover image url]
cardVideo: true # hover-to-play clip at /wc/pipeline-medical/ (see docs/work-card-video.md)
cardVideoLight: true # light-theme export exists at /wc/pipeline-medical/card-light.*
coverAlt: "Pipeline Medical brand and marketplace"
coverCaption: "Pipeline Medical · brand & B2B marketplace"
heroVideo: true # files at /hero/pipeline-medical/ (see docs/hero-pipeline.md)
featured: false
description: "Brand and a B2B supplier marketplace built from zero, logo system, core procurement screens, and developer handoff."
badge: "Client · Brand & Product"
lede: "Brand identity and a B2B supplier marketplace, designed from zero."

hero:
  - { k: Role, v: "Designer (Internship)" }
  - { k: Disciplines, v: "Brand · UI/UX · Product" }
  - { k: Timeframe, v: "2017" }
  - { k: Built, v: "0→1", stat: true }

problem:
  prose:
    - lead: "A brand and a marketplace, from nothing."
      text: "Pipeline Medical needed a brand and a working B2B marketplace where none existed, a supplier platform built around bulk and repeat procurement."
    - text: "The problem was starting from zero: define the brand and design the core buying flows at once, for a real product handed to developers to build."
  margin:
    - type: meta
      label: "The brief"
      rows:
        - { k: Brand, v: "From zero" }
        - { k: Product, v: "B2B marketplace" }
        - { k: Buyers, v: "Bulk + repeat" }

system:
  prose:
    - lead: "Brand and product, designed together."
      text: "The logo system and identity were built alongside the core procurement screens, so brand and product spoke the same language from day one."
    - text: "The marketplace UX was structured around how B2B buyers actually purchase, and packaged for developer handoff so it could ship."
  margin:
    - type: note
      label: "Built to ship"
      text: "Components and handoff assets, not just comps."
  steps:
    - { ix: "01", title: "Brand identity from zero", text: "Logo system and visual language." }
    - { ix: "02", title: "Procurement UX", text: "Built for bulk and repeat." }
    - { ix: "03", title: "Core screens + components", text: "A real UI system." }
    - { ix: "04", title: "Developer handoff", text: "Designed to be built." }

decisions:
  prose:
    - text: "Four choices for a product from scratch."
  margin:
    - type: quote
      quote: "Design how B2B actually buys."
      who: "Product principle"
  items:
    - { n: "01", title: "Brand and product together", text: "Designed at the same time, so they stayed coherent instead of bolting a brand on later." }
    - { n: "02", title: "Design for how B2B buys", text: "Flows built around bulk and repeat, not a consumer checkout." }
    - { n: "03", title: "Build for handoff", text: "Components and handoff assets meant it could be built, not just shown." }
    - { n: "04", title: "Round out the launch", text: "Display ads, social, and buyer-education collateral supported it into market." }

output:
  blocks:
    - kind: mockup
      flagship: true
      items:
        - img: ../../assets/work/pipeline-medical/flagship.webp
          imgDark: ../../assets/work/pipeline-medical/flagship-dark.webp
          alt: "Pipeline Medical brand identity and procurement platform"
          caption: "Brand identity, platform, and launch collateral"
    - kind: longpage
      cols: 1
      height: 640
      chrome: browser
      items:
        - { img: ../../assets/work/pipeline-medical/web-1.webp, alt: "Pipeline Medical storefront home page" }
    - kind: gallery
      label: "Distribution flow"
      ratio: "4:3"
      cols: 1
      fit: contain
      items:
        - { img: ../../assets/work/pipeline-medical/flyer-2.webp, alt: "Pipeline Medical distribution flow chart" }
    - kind: flyer
      label: "Capabilities one-sheet"
      ratio: "3:4"
      cols: 2
      items:
        - { img: ../../assets/work/pipeline-medical/flyer-3.webp, alt: "Pipeline Medical capabilities one-sheet" }
    - kind: gallery
      label: "Social"
      ratio: "16:9"
      cols: 2
      items:
        - { img: ../../assets/work/pipeline-medical/social-1.webp, alt: "Pipeline Medical social" }
        - { img: ../../assets/work/pipeline-medical/social-2.webp, alt: "Pipeline Medical social" }
  note: "Selected launch work."

reflection:
  prose:
    - text: "Pipeline is the from-zero proof: brand and product built together for a real launch and a real dev team. It's where the systems-from-scratch instinct shows up earliest, the brand and the product designed as one thing, not handed between people."
  margin:
    - type: note
      label: "Earliest proof"
      text: "Brand and product as one build."

next: { kicker: "Next case study · Client", title: "Agency FiveEighty", href: "/work/agency-fiveeighty" }

proof:
  figures:
    - { value: "15", label: "Core product screens" }
    - { value: "4", label: "Procurement flows, bulk & repeat" }
    - { value: "20+", label: "UI components" }
---
