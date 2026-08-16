# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

A website that uses visuals and sound to show where each mode sits within the
scale, how it sounds, and a short introduction to it. The site offers 13
different modes, 11 of which share the same melody so their sound can be
compared more clearly. 

## The moments that mattered

### 1. Having the agent restate design intent before implementing it

- **What happened:** the ring-shaped note wheel's layout was hard to describe
  in words, and the agent kept misreading the intent, producing the wrong
  shape.
- **What I did instead:** instead of stating every constraint up front, I gave
  a more geometric description and had the agent restate its understanding
  before writing any code, correcting the restatement over a few rounds
  (including relaxing one constraint myself) until it was right.
- **How I knew it was right:** it looked right by eye, and once the
  restatement was right, a single generation placed everything correctly ---
  no more regenerate-and-correct cycles.
- **Citation:**
  [`912a012`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BlendSpitfire/commit/912a012)
  (`wheel-layout.ts` / `render-mode-view.ts`).

  > Prompt (excerpted, translated): "...restate it in your own words."

### 2. Delegating the decision over specific parameter values to the agent

- **What happened:** the wheel's circle sizes and spacing were "logically
  correct but not aesthetically pleasing," and I had no specific numbers in
  mind.
- **What I did instead:** instead of tuning it myself or letting the agent
  guess, I set the constraints (no tangency, a smaller size gap) and delegated
  the numbers, requiring it to justify them with graphic-design ratios.
- **How I knew it was right:** it read as coherent.
- **Citation:** `NOTCH_CLEARANCE`, `RING_RADIUS`, `BIG_RADIUS`, `SMALL_RADIUS`
  in `wheel-layout.ts`, in
  [`912a012`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BlendSpitfire/commit/912a012).

### 3. Writing the auto-commit rule into `CLAUDE.md` instead of repeating it verbally

- **What happened:** Claude Code won't commit unless told to, even with
  `pnpm check` fully green --- I had to ask every time.
- **What I did instead:** wrote the convention into `CLAUDE.md`: commit
  automatically after significant work, ask first for a small edit.
- **How I knew it was right:** behavior matched what I expected afterward, and
  since `CLAUDE.md` carries forward, it keeps working in later projects too.
- **Citation:**
  [`222a8ec`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BlendSpitfire/commit/222a8ec).

### 4. Treating a compaction-revived stale instruction as background, not a live request

- **What happened:** after a context compaction, Claude surfaced a confusing
  multiple-choice question about a request I'd never made --- the site was
  already finished.
- **What I did instead:** I said I'd never given that instruction and asked
  Claude to trace it: a stale, superseded instruction the compaction had
  mistakenly carried forward. Nothing broke, since Claude flagged the mismatch
  instead of acting, and I paused instead of picking an option blindly. I
  asked how to stop this recurring, and agreed to a `CLAUDE.md` check once
  confirming it wouldn't waste tokens by firing often.
- **How I knew it was right:** unconfirmed so far --- the real test is whether
  it stops recurring.
- **Citation:**
  [`095a5e2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BlendSpitfire/commit/095a5e2)
  (the rule in `CLAUDE.md`);
  [`912a012`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-BlendSpitfire/commit/912a012)
  dates the stale instruction as superseded.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there --- before a marker ever opens the file. It checks that your map is
traceable, not that it is good: the marker judges whether your small,
deliberately chosen set of moments shows real judgement and reflection. A green
check is not a substitute for that curation.

Images are deliberately not checked, because whether one renders is visible the
moment you look. Open this file on GitHub and look at it before you ship.
