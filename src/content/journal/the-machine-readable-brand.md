---
title: "The machine-readable brand"
date: 2026-07-15
excerpt: "Search traffic is not being redistributed by AI answers, it is being removed. Being cited helps less than you would hope, and most of the playbook being sold to fix it is guesswork."
topic: "Brand / AI search"
tags: ["brand", "AI search", "structured data", "measurement"]
readingTime: "5 min"
pullquote: "You have not given it a brand to summarize. You have given it a disagreement to resolve, and it will resolve it however it likes."
featured: false
draft: false
---

Ranking on page one used to be the whole job. Now the page is the answer, and the answer does not always need you in it. That is a different problem from the one SEO was built to solve, and most of the advice being sold to fix it is guesswork wearing a new acronym.

Start with what has actually been measured, because that part is not in dispute.

## The click that does not happen

Pew Research Center followed the real browsing behavior of 900 US adults. When a Google search returned an AI summary, people clicked through to a result on 8 percent of visits. When it did not, 15 percent. They clicked a link inside the summary itself on 1 percent of visits. They were also likelier to stop browsing altogether: 26 percent of sessions ended on a page carrying a summary, against 16 percent on pages without one.

Ahrefs measured the top of the page specifically, across a large keyword set. Their first pass put position one down roughly a third when an AI Overview appeared. A later run against more recent data put it closer to half.

So this is not a redistribution of traffic. A share of it is simply gone, and no amount of optimizing gets it back.

## Being cited is not the same as being read

Here is the finding that should change what you actually do. Seer Interactive split thousands of search terms three ways. With no AI Overview, organic click-through sat around 1.45 percent. With an overview where the brand was not cited, 0.52 percent. With an overview where the brand *was* cited, 0.70 percent.

Citation helps. It helps by about a third against not being cited. It also gets you less than half of what you had before the overview existed. Both outcomes are worse than the old baseline, and the gap between them is smaller than the gap either one has to the world we came from.

That reframes the goal honestly. You are not optimizing to win the click back, because the click is not on offer. You are optimizing to be the source the answer gets built from, and accepting that most of the value now lands somewhere you cannot count. Someone reads your positioning inside a summary, never visits, and turns up three weeks later already knowing what you do.

## Most of the playbook is speculative

I ship an `llms.txt` on this site. It is a plain text file describing the site in terms a language model can read cleanly. On current evidence, it is also doing nothing at all.

Google's John Mueller has said no AI service has claimed to use the file, and that server logs show they do not even request it. Ahrefs tracked over 137,000 domains and found 97 percent saw zero requests for it. SE Ranking looked at roughly 300,000 domains, found around a tenth had adopted it, and found no correlation with AI citations.

Mine stays, because it costs nothing, it doubles as a clean statement of what the site claims, and standards sometimes arrive after the files do. But it is a bet, not a lever, and I would be wary of anyone selling it as the second one. A lot of what is currently branded as generative engine optimization is this: a plausible mechanism, no evidence, priced as expertise.

## What is left is boring, and probably right

Strip out the speculation and the remainder is unglamorous. Mark up your pages with structured data, so a machine reading them does not have to infer what is a role, a date, or an organization. Keep content current, since retrieval systems visibly favor pages that have been touched recently. Write in a way that survives being quoted in fragments, because that is how it will be used.

And make every surface agree with itself. That last one is the real work, and it is a brand problem rather than a technical one. A retrieval system assembles its answer from pieces of you scattered across the web. If your site says one thing, your LinkedIn profile says a slightly different thing, and a two year old press release says a third, you have not handed it a brand to summarize. You have handed it a disagreement to resolve, and it will resolve it however it likes.

That is why every figure on this site resolves to one approved value with one approved wording, and why a script checks that wording and fails the build when it drifts. Not because I have proof it improves citation rates. Because a brand that contradicts itself across surfaces was always a problem, and machine reading just made the cost legible.

## The part nobody can sell you

There is no trustworthy attribution model for any of this yet. You cannot currently prove that a change you made caused a model to cite you, and most tools claiming otherwise are counting mentions and calling it causation. Anyone quoting you a return on generative engine optimization is estimating.

So treat it the way you would treat any channel this immature. Do the durable things, which happen to be things that were already worth doing. Skip the rituals. Measure what you can, say plainly what you cannot, and revisit in six months when somebody has actual data.

---

**Sources**

- Pew Research Center, "Google users are less likely to click on links when an AI summary appears in the results" (July 2025): [pewresearch.org](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)
- Ahrefs, "AI Overviews Reduce Clicks by 34.5%": [ahrefs.com](https://ahrefs.com/blog/ai-overviews-reduce-clicks/)
- Seer Interactive, organic CTR when cited and not cited in AI Overviews: [seerinteractive.com](https://www.seerinteractive.com/insights/ai-overviews-impact-on-ctr)
- Google's position on `llms.txt`, via Search Engine Journal: [searchenginejournal.com](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/)
