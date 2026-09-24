---
name: hotel-discovery
description: Conventions for building the Hotel Discovery take-home in this repo. Use for any change here — components, hooks, tests, PRs, commits, docs — so every PR follows the same layering, style, design tokens, and documentation rules.
---

# Hotel Discovery conventions

## Why this file exists

Reviewers grade component architecture, separation of concerns, reusable components, tests, and documentation,
under a 3-hour MVP framing. Do the minimum that satisfies the requirement and the design in docs/design/DESIGN.md;
anything beyond goes in TRADEOFFS.md as "not done, and why". When DESIGN.md and this file disagree on behaviour,
DESIGN.md wins; on architecture, this file wins.

## Layering

URL → page → hook → api → pure logic. Props down, callbacks up.

- Pages (`features/*/…Page.tsx`) alone read the URL and call data hooks.
- Hooks (`hooks/use*.ts`) call `api/hotelApi.ts`, expose `{ data, status }`, and are the only place `useEffect` appears.
- `api/mockHotelApi.ts` mirrors GET /hotels, /hotels/:id, /hotels/:id/rooms. Filtering and availability rules live in `api/logic/*` as pure functions. Never filter in a component.
- `components/ui/*` are props-only and know nothing about hotels or the router. Needs a `Hotel` type? It belongs in `features/`.
- Router imports outside pages: `HotelCard` (Link) and `BackLink` only.

## React style (react.dev)

Function components, named exports, `interface FooProps`. Pure render. Derive during render; don't mirror into state.
State lives in the closest owner that outlives its consumers: URL for page identity + filters; the section for dates.
`useEffect` only syncs with the API, guarded by an `ignore` flag. Keys from ids. Controlled inputs. Extract a hook when
two callers exist or the page grows past ~100 lines.

## Design tokens and accessibility

Use the Tailwind theme tokens (accent, ink, muted, line, page, panel) — never raw hex in components. IBM Plex Sans/Mono.
44px minimum targets, visible 3px focus ring, `aria-pressed` for toggles, `role="alert"` for validation, `aria-live="polite"`
for counts. States never differ by hue alone.

## Files, tests

PascalCase components, camelCase otherwise, colocated tests. Pure logic: unit tests per rule in TRADEOFFS.md. Pages: one
test inside `MemoryRouter`. Leaf ui: test only when it has logic. Query by role/label; `userEvent` over `fireEvent`.
Dates in tests: pass `today` explicitly; never rely on the wall clock.

## Git, PRs, docs

Conventional Commits (scopes bootstrap|app|api|search|hotel|rooms|ui|docs). Branch per PR, merge commits, never squash.
PR body: ## What / ## Why / ## How tested / ## Decisions recorded / ## AI involvement.
Done = `npm run typecheck && npm run lint && npm test && npm run build`, plus TRADEOFFS.md / AI_USAGE.md updated.
TRADEOFFS.md: append a bullet per decision; also the UI-states list. AI_USAGE.md: per PR, three lines. README.md: final PR.
