# AI usage

How AI (Claude Code) was used on this project, one entry per PR. Each entry records what the AI produced,
what I decided, and what I changed by hand, so the line between assistance and authorship is visible.

## PR 0 — bootstrap

- **AI produced:** the implementation plan (stack, architecture, PR sequence, conventions), the project skill file
  at `.claude/skills/hotel-discovery/SKILL.md`, the Vite/Vitest/Prettier configuration, the Tailwind theme tokens,
  the `Hotel` types, the seed sanity test, and the first drafts of TRADEOFFS.md and this file.
- **I decided:** MVP scope only; one small, defensible PR per feature; top-down layering (URL → page → hook → api →
  pure logic); reusable props-only UI components; the design handoff as the source of truth for behaviour and visuals;
  a faked "today" of 2026-07-09 so the demo dates are bookable; recording every tradeoff in a single file.
- **I changed:** reviewed each commit before it landed; kept the seed byte-identical to the handoff rather than
  letting the formatter rewrite it.
