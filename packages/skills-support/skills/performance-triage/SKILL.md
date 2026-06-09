---
name: performance-triage
description: Diagnose slow pages, slow queries, session hangs, and memory pressure. Use when investigating timeouts, high response times, or user-reported sluggishness.
license: MIT
---

# Performance Triage

**Tradeoff:** Don't tune before measuring. Guessing the bottleneck wastes time and often makes it worse.

## 1. Narrow the Scope

**UI slow ≠ DB slow. Isolate the layer first.**

- Is the HTML response slow (server) or is JS rendering slow (client)?
- Use browser network tab: time-to-first-byte (TTFB) = server; page load total = client
- API slow for all users? Likely DB or thread pool. Slow for one user/tenant? Likely data or permissions.

## 2. Database (Most Common)

**Check `V$SQL` for top elapsed queries before anything else.**

```sql
SELECT sql_id, elapsed_time/1000 elapsed_ms, executions,
       elapsed_time/NULLIF(executions,0)/1000 avg_ms,
       substr(sql_text,1,80) sql_text
FROM   V$SQL
WHERE  elapsed_time/NULLIF(executions,0) > 1000000  -- >1s avg
ORDER BY elapsed_time DESC
FETCH FIRST 20 ROWS ONLY;
```

Active blocking sessions:
```sql
SELECT sid, state, wait_class, event, seconds_in_wait
FROM   V$SESSION
WHERE  status = 'ACTIVE' AND username IS NOT NULL;
```

## 3. JVM / App Server

**Thread pool exhaustion and GC pressure are the two common Java killers.**

- Stuck threads in WebLogic console → check for DB waits or infinite loops
- GC pressure: `jstat -gcutil <pid> 1000 10` → if `FGC` count climbing, heap is undersized
- Thread dump: `jstack <pid>` → look for threads all blocking on same lock

## 4. Tune Only After Measuring

- Slow query: run `EXPLAIN PLAN` and confirm full table scan on a large table before adding an index
- JVM heap: increase `-Xmx` only after confirming heap exhaustion in GC log — not just because it's "slow"

The test: Can you state the bottleneck as "X is slow because Y" with a measurement to back Y?
