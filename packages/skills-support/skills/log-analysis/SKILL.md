---
name: log-analysis
description: Analyze application and server logs to identify error patterns, frequency spikes, and root causes. Use when investigating incidents, performance issues, or repeated failures.
license: MIT
---

# Log Analysis & Error Patterns

**Tradeoff:** Large log files need grep-first — loading 1M lines into memory kills the process.

## 1. Orient Before Reading

**Know the format before you parse.**

```bash
head -n 20 app.log          # spot timestamp format and log level position
wc -l app.log               # if >500k lines, use grep/awk — not full load
file app.log                # gzip? binary? text?
```

Common formats: ISO timestamp + level + message (most app servers), JSON (structured logging), syslog.

## 2. Find the Errors First

**Filter to signal before reading context.**

```bash
grep -c "ERROR\|FATAL" app.log                              # count
grep -n "ERROR\|FATAL" app.log | head                       # first occurrences with line numbers
grep "ERROR" app.log | sort | uniq -c | sort -rn | head -20 # top errors by frequency
```

For Oracle alert log:
```bash
grep -A5 "ORA-" $ORACLE_BASE/diag/rdbms/*/*/trace/alert_*.log | head -60
```

## 3. Find the Spike

**Error rate spike = timestamp correlation = root cause window.**

```bash
grep "ERROR" app.log | cut -c1-13 | sort | uniq -c   # group by hour
```

- Spike at 02:00 → check scheduled batch jobs
- Spike after deploy → check startup errors and config changes
- Spike tied to one user/tenant → data or permission issue, not general

## 4. Extract Stack Traces

**Deduplicate before reading — 1000 identical stack traces = 1 root cause.**

```bash
awk '/ERROR/{p=1} p{print} /^$/{p=0}' app.log | sort -u | head -100
```

- Read the innermost `Caused by:` — that is the root cause
- `NullPointerException` with no message: the null source is 2–3 frames up in the call chain

The test: Can you name the top 3 errors by frequency and their first occurrence timestamp?
