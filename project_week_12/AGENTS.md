# AGENTS.md
## Project
Smart Campus room availability checker; one room checked at a time, fictional data only.
## Constraints
Preserve AC1–AC5 (defined in the Acceptance criteria section below); no backend, login, database or booking creation.
No secrets, real personal data, external services or deployments.
## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
Do not weaken or delete existing tests; add a regression test for each fix.
Do not add dependencies without approval. Use the `@/` import alias.
## Verification (run before proposing acceptance)
Commands: npx vitest run, npm run typecheck, npm run lint, npm run build
Report changed files, rationale and actual test output; never claim unrun tests passed.
## Review gate
Show the diff and wait for human approval before applying edits outside the requested scope.
## Architecture
- src/utils/availability.ts: deterministic checker, the only source of truth for availability.
- src/utils/explain.ts: mock explanation adapter; it explains a result and never decides it.
- src/components/ResultPanel.tsx and src/App.tsx: UI.
- src/types.ts, src/constants.ts, src/sampleData.ts: types, limits, fictional data.
## Setup
npm install (then run the verification commands above).
## Forbidden actions
- No destructive commands (rm -rf, git reset --hard, git push --force) without human approval.
- No npm audit fix --force and no dependency upgrades without approval.
- No deployments or publishing; no secrets, tokens or real personal data.
- Do not edit .bolt/ files.
## Acceptance criteria (Assignment 5; must stay true after changes)
- AC1: Interval is valid (0 to 1440 minutes, start before end) and starts after the current time.
- AC2: Maximum booking length is 120 minutes.
- AC3: Blocked rooms are never available.
- AC4: Overlapping bookings are rejected; touching endpoints are allowed.
- AC5: The explanation never changes the availability status; on failure a safe fallback is shown.
Precedence: if this file disagrees with .bolt/memory.md, this file wins. Do not edit .bolt/.
