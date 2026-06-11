---
name: Bug Triage & RCA
description: Systematic root cause analysis — symptom → evidence → cause → fix.
license: MIT
---

# Bug Triage & RCA

**Tradeoff:** Depth vs speed. Use Fast Track for obvious regressions; Full RCA for intermittent or data-corruption bugs.

---

## 1. Capture the Bug (2 min)

**Before touching code, collect:**

- Exact error message or unexpected behavior (copy verbatim)
- Steps to reproduce (minimum reproducible case)
- First occurrence timestamp + affected environment
- Who/what changed recently (deploy, config, data import)
- Frequency: always / intermittent / one-time
- Ask for Clarification questions, use grill-me skill.

The test: can someone reproduce from your notes without asking you questions?

---

## 2. Classify Before Investigating

| Type               | Signal                       | First place to look                 |
| ------------------ | ---------------------------- | ----------------------------------- |
| **Regression**     | "worked before X"            | git log / recent deploy diff        |
| **Data bug**       | wrong output, silent failure | DB state, input validation          |
| **Race condition** | intermittent, concurrency    | thread dumps, retry logs            |
| **Config/Env**     | works locally, fails in prod | env vars, feature flags, secrets    |
| **Integration**    | third-party call fails       | outbound request logs, API status   |
| **Logic bug**      | deterministic wrong result   | unit test the function in isolation |

---

## 3. Evidence Gathering

### Logs

```
1. Find the first occurrence — not the latest, the FIRST
2. Look 30–60 seconds BEFORE the error, not just at it
3. Grep for the request ID / correlation ID across all services
4. Check previous successful request of same type for contrast
```

### Code

```
1. git log --all -S "error text" -- path/to/file   ← find when it appeared
2. git bisect                                       ← binary search the commit
3. git blame the suspicious line                   ← who changed it, why
```

### State

```
1. What was the input? (request payload, form data, queue message)
2. What was the system state? (DB record, cache value, session)
3. What was the expected vs actual output?
```

---

## 4. Five-Why Drill (core RCA technique)

```
Symptom:  "Payment failed"
Why 1:    Timeout calling payment gateway
Why 2:    Connection pool exhausted
Why 3:    Slow queries holding connections too long
Why 4:    Missing index after schema migration
Why 5:    Migration script lacked index creation step  ← ROOT CAUSE
```

**Stop at the why where a fix prevents recurrence, not just the immediate incident.**

---

## 5. Hypothesis → Evidence → Conclusion

For each hypothesis:

1. State it explicitly: *"I think X because Y"*
2. Find evidence that would prove OR disprove it
3. Mark confirmed / ruled out
4. Move to next until one hypothesis survives all evidence

Never fix before you can explain the root cause in one sentence.

---

## 6. Priority Scoring

| Priority | Criteria                                                       |
| -------- | -------------------------------------------------------------- |
| **P1**   | Production down, data loss, security breach, affects all users |
| **P2**   | Key feature broken, workaround exists, affects many users      |
| **P3**   | Edge case, cosmetic, affects few users, workaround easy        |

Escalate immediately if: data is being corrupted, credentials are exposed, or the blast radius is still unknown.

---

## 7. RCA Output Template

```
## Root Cause
[One sentence: what was broken and why]

## Timeline
- HH:MM  First reported
- HH:MM  Reproduced / confirmed
- HH:MM  Root cause identified
- HH:MM  Fix deployed / rolled back

## Evidence
- Log line / stack trace that proves the cause
- Commit or config that introduced it

## Fix
- Immediate: [what stopped the bleeding]
- Permanent: [what prevents recurrence]

## Priority: P1 / P2 / P3

## Follow-up
- [ ] Add test that would have caught this
- [ ] Update runbook if it's a known failure mode
```

---

## Fast Track (regression checklist)

```
□ Check last deployment — what changed?
□ Check feature flags — anything toggled?
□ Check config / env vars — any rotation or update?
□ Check dependent services — any upstream incidents?
□ Rollback or revert if cause is clear and fix is risky
```
