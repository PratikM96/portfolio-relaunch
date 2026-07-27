---
# Level - content entry (refit to real schema). Drop-in for src/content/work/level.md
# Concept, self-initiated. role = Creative Technologist. Own invented brand. Framed as responsible product trust, never gambling/crypto (System Master rule). Explainer is scripted, not a live model. No em/en dashes.
title: Level
slug: level
type: concept
role: Creative Technologist
year: "2025"
disciplines: [Brand, UI/UX, AI, Motion]
featured: false
description: "A self-initiated prediction-market concept built around responsible use and product trust. Its own brand, not a real product."
badge: "Concept / Self-initiated"
lede: "A prediction-market app built around restraint, where understanding the bet is the product, not the thrill of it."
disclosure: "Self-initiated concept. Its own invented brand, not a real product."

hero:
  - { k: Role, v: "Creative Technologist" }
  - { k: Disciplines, v: "Brand, UI/UX, AI, Motion" }
  - { k: Type, v: "Self-initiated / 2025" }
  - { k: Scope, v: "30", stat: true, unit: " screens" }

problem:
  prose:
    - lead: "Most prediction markets borrow their mechanics from casinos."
      text: "Celebrate the win, hide the risk, push the next bet. Level starts from the opposite stance: make the odds legible, slow the user at the right moments, and treat a win and a loss as the same event."
    - text: "The concept is an argument that you can design this category for trust instead of compulsion."
  margin:
    - type: meta
      label: "The premise"
      rows:
        - { k: Audience, v: "Anyone staking on outcomes" }
        - { k: Stance, v: "Trust over compulsion" }
        - { k: "Design problem", v: "Make risk legible" }

system:
  prose:
    - lead: "Guardrails, not engagement bait."
      text: "Limits are on by default from onboarding. A scripted market-explainer gates every market: you can't stake until it makes sense to you, asked in plain language. Probability and risk get their own visual language."
    - text: "And the motion system refuses to celebrate. A win resolves the same way a loss does."
  margin:
    - type: note
      label: "Honest by design"
      text: "The explainer is scripted, not a live model."
  steps:
    - { ix: "01", title: "Brand + trust system", text: "One language for a careful product." }
    - { ix: "02", title: "App, limits on by default", text: "Responsible use is the default." }
    - { ix: "03", title: "Explain-this-market gate", text: "Understanding before staking." }
    - { ix: "04", title: "Risk + probability visuals", text: "Make the odds felt, not buried." }

decisions:
  prose:
    - text: "Four choices kept it honest. Each one removes a lever this category normally pulls, and each one costs something: a limit that ships on is friction, a gate before staking is a slower funnel, a resolution without celebration is a weaker hook. Level takes all four trades on purpose."
  margin:
    - type: quote
      quote: "Comprehension before commitment."
      who: "Design principle"
  items:
    - { n: "01", title: "Limits on by default", text: "Responsible use is the default state, not a setting a careful user has to find." }
    - { n: "02", title: "Understanding as a gate", text: "You can't stake on a market until you've engaged with what it actually means." }
    - { n: "03", title: "No celebration", text: "Winning and losing resolve with the same visual weight, so the interface never rewards one outcome over the other." }
    - { n: "04", title: "Make probability legible", text: "Risk and odds get real visual treatment instead of fine print." }

reflection:
  prose:
    - text: "Level is the counter-argument to how this category usually gets designed. It shows product thinking under an ethical constraint: clarity, restraint, and trust as design problems, not compliance bolted on at the end."
  margin:
    - type: note
      label: "Self-initiated"
      text: "Own invented brand. No users, revenue, or engagement claimed."


proof:
  figures:
    - { value: "30", label: "UI screens" }
    - { value: "5", label: "Responsible-use guardrail flows" }
    - { value: "5", label: "Probability and risk visualizations" }
    - { value: "40+", label: "UI components" }
  note:
    label: "Why it exists / what it proves"
    text: "Level is self-initiated and its own invented brand. The figures are scope, not outcomes. No users, engagement, or revenue is claimed, and it is not a real financial product."

demo:
  project: level
  heading: "Live demo / Level"
  foot: "Four live views. The explainer is a scripted demonstration, not a live model."
  tabs:
    - { view: explainer, label: Explainer, cap: "Explain this market / understanding gates the stake (scripted)", featured: true }
    - { view: app, label: App, cap: "App / limits on by default, restraint by design" }
    - { view: motion, label: Motion, cap: "Motion / probability made legible, no celebration" }
    - { view: brand, label: Brand, cap: "Brand / the restraint system" }
---
