# Contributing conventions (TaskFlow API)

These are the rules a change to this repository must satisfy. Both human and
automated contributors are held to them, and pull requests are reviewed
against this file.

## Scope

1. **One ticket, one pull request.** Change only what the ticket asks for.
   Drive-by refactors, reformatting, and unrelated renames belong in their own PR.
2. **Do not weaken or delete existing tests** to make a change pass. If a test
   is genuinely wrong, say so explicitly in the PR body and explain why.
3. **No new runtime dependencies** without a justification in the PR body.
   `express` is the only runtime dependency this service needs.

## Tests

4. **Every bug fix ships with a regression test** that fails before the fix and
   passes after it. Several tickets already have a test written and marked
   `it.skip(...)` — un-skip it rather than writing a duplicate.
5. `npm test` must pass locally before a PR is opened. CI runs the same command.

## Style

6. ES modules only (`import`/`export`), matching the existing source.
7. Keep route handlers thin: request parsing and response shaping in `src/app.js`,
   data access in `src/store.js`.
8. Two-space indentation, single quotes, semicolons — match the surrounding code.

## Git and pull requests

9. **Branch name:** `agent/TF-<number>-<short-slug>` (e.g. `agent/TF-101-status-filter`).
10. **Commit subject:** Conventional Commits, e.g. `fix(tasks): apply the status filter`
    or `feat(tasks): add limit and offset pagination`. Imperative mood, no trailing period.
11. **The PR body must contain:**
    - the ticket key in the title (e.g. `TF-101`),
    - a **Root cause** section naming the specific line or expression at fault,
    - a **Fix** section describing the change,
    - a **Verification** section showing the `npm test` result.

## Review outcome

A reviewer should request changes if any of the above is violated, if the fix
addresses a symptom rather than the root cause, or if the change is broader than
the ticket requires.
