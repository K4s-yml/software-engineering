# Project memory

## Product intent & audience

- Smart Campus room availability checker (fictional data, no real backend).
- Checks availability for one room at a time per availability query.
- Audience: students/staff checking room availability on campus.

## Brand personality & voice

- Utility-oriented, factual reporting tone (agent-facing docs and user-facing UI).
- No marketing fluff in documentation; UI should be clear and responsive.

## Visual design & UX direction

- React + Vite + Tailwind stack; `App.tsx` is the main UI entry.
- Responsive UI feedback is an explicit engineering requirement (must be preserved).
- Global design/global instructions live in `.bolt/prompt` (authoritative; not restated here).

## Decisions, constraints & rationale

- Constraints: preserve AC1–AC6; no backend, login, booking creation, or database.
- Engineering: prefer pure functions; minimal changes; at most 2 justified patterns; do not mutate booking fixtures; do not weaken/delete tests.
- Verification commands: `npx vitest run`, `npm run typecheck`, `npm run lint`; reports must include changed files, rationale, test evidence.
- Tooling: vitest for tests, separate typecheck and lint scripts.
- Fixtures live in `sampleData.ts` and currently contain 5 rooms.
- Past incident: tests passed while build was broken (`arseWholeMinutes` typo in `App.tsx`), motivating a "tests must pass before acceptance" rule.
- Patch workflow: AGENTS.md edits are drafted and held pending explicit user approval before applying.

## Open questions & assumptions

- Ambiguity: "one room at a time" — per-check rule (current wording) vs. exactly one room total in fixtures. Fixtures have 5 rooms; resolving to "one room total" requires code changes, not just docs. Awaiting user clarification.
- Assumption: "no backend" subsumes "no database" (not named explicitly in AGENTS.md).
- Pending unapproved AGENTS.md patch adds: no secrets in code/config; no external deployments/publishing; all three verification commands must pass before proposing acceptance.