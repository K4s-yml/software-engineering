# AGENTS.md
## Project
Smart Campus room availability checker; one room checked at a time, fictional data only.
## Constraints
Preserve AC1–AC6; no backend, login, database or booking creation.
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
