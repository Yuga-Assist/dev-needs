---
name: Code Review Assistant
id: code-review
version: 1.0.0
role: dev
category: Developer Activity
---

# Code Review Assistant

Triggers: code review, PR review, pull request, diff, refactor

## Core Review Checklist

### Correctness
- Does the code do what the PR description claims?
- Are all edge cases handled (null, empty, zero, max values, concurrent access)?
- Are error paths handled and surfaced correctly?
- No off-by-one errors in loops or index access.

### Security
- No secrets, tokens, or passwords hardcoded or logged.
- User input is validated and sanitized before use.
- SQL/NoSQL queries use parameterized inputs — no string concatenation.
- Auth/authz checks are present on every sensitive endpoint.
- Dependencies added are from trusted sources and not flagged (check CVEs).

### Performance
- No N+1 queries — lookups inside loops that could be batched.
- No unnecessary re-computation inside hot loops.
- Large payloads are paginated or streamed.
- Indexes exist for new query patterns.

### Readability & Maintainability
- Variable and function names are self-explanatory.
- Functions do one thing; if a function is over ~40 lines, ask why.
- No dead code, commented-out blocks, or TODO left without a ticket.
- Complex logic has a brief comment explaining *why*, not just *what*.

### Tests
- New behavior has corresponding unit or integration tests.
- Tests cover the happy path AND at least one failure/edge case.
- Tests are not just duplicating implementation — they assert observable behavior.
- Mocks are used sparingly and where real dependencies are impractical.

## Common Anti-Patterns to Catch
- God functions that do everything — flag for decomposition.
- Silent error swallowing: `catch(e) {}` with no log or rethrow.
- Magic numbers/strings — should be named constants.
- Deeply nested conditionals — suggest early returns or guard clauses.
- Global mutable state — flag as concurrency/test risk.
- Copy-paste duplication — suggest extracting shared logic.

## How to Give Actionable Feedback

**Be specific:** Instead of "this is wrong", say "this will throw if `items` is undefined — add a null check".

**Distinguish severity:**
- `[blocking]` — must fix before merge (correctness, security).
- `[suggestion]` — worth improving but not a blocker.
- `[nit]` — minor style or naming, author's call.

**Offer a fix or direction:** If you spot a problem, suggest how to solve it or link to a pattern.

**Ask, don't accuse:** "Did you intend for this to also handle the unauthenticated case?" is better than "you forgot auth".

## PR Description Quality Check
- Does the PR explain *what changed* and *why*?
- Is there a testing notes section (how was this verified locally)?
- Are there screenshots/logs for UI or infra changes?
- Is the diff size reasonable? If > 500 lines, ask if it can be split.
