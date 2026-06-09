---
name: Performance Triage
id: performance-triage
version: 1.0.0
role: support
category: Support Activity
---

# Performance Triage

Triggers: performance, slow, timeout, latency, memory, CPU, bottleneck, query slow, N+1

## Step 1 — Isolate the Bottleneck Type

Ask these questions first to narrow the category:

| Symptom | Likely bottleneck |
|---------|------------------|
| High CPU, slow responses | CPU-bound computation or inefficient algorithm |
| Low CPU but slow responses | I/O wait — DB, network, file system |
| Memory growing over time | Memory leak — unclosed connections, retained references |
| Works fast alone, slow under load | Concurrency — lock contention, connection pool exhaustion |
| Slow for large data sets only | Algorithmic complexity or missing index |
| Intermittent slowness | GC pauses, scheduled jobs, external dependency spikes |

## Step 2 — Check the DB First

Most application slowness originates in the database.

**Find slow queries:**
```sql
-- PostgreSQL: queries over 1 second
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 20;

-- MySQL slow query log
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

**Run EXPLAIN / EXPLAIN ANALYZE on slow queries:**
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 123;
```
- Look for: `Seq Scan` on large tables (missing index), `Nested Loop` with large row estimates, high `actual time`.
- A `Seq Scan` returning millions of rows = add an index on the filter column.

## Step 3 — N+1 Query Detection

N+1 = loading a list, then querying per item in a loop.

Signs: 100 items returned → 101 DB queries logged. Look for repetitive identical queries with only the ID changing.

Fix: use JOIN, eager loading, or batch fetch (e.g., `IN (id1, id2, ...)` instead of per-item queries).

## Step 4 — Connection Pool Saturation

Symptoms: requests queue up, "connection timeout" errors, CPU is low but latency is high.

Check:
- Pool size configured vs threads/workers in use.
- Long-running transactions holding connections.
- Connections not released on error paths (check `finally` / `using` blocks).

Quick fix: increase pool size temporarily while diagnosing the root cause. Root fix: release connections promptly, reduce transaction duration.

## Step 5 — Memory / GC Pressure

Symptoms: response times spike periodically (GC pauses), memory grows until restart.

Steps:
1. Take a heap dump / memory snapshot during high memory.
2. Identify which object type is growing — look for large collections or closures.
3. Common causes: caching without eviction, event listeners not removed, streams not closed.
4. For JVM: check GC logs (`-verbose:gc`), tune heap size and GC algorithm.

## Step 6 — CPU Profiling

Collect a flame graph or CPU profile under load:
- Node.js: `--prof` flag + `node --prof-process`.
- JVM: async-profiler, YourKit.
- Python: `py-spy top --pid <pid>`.

Look for hot functions taking disproportionate time — often string processing, regex, serialization, or crypto.

## Quick Wins vs Root Fixes

| Quick Win | Root Fix |
|-----------|----------|
| Add missing DB index | Redesign query or data model |
| Increase connection pool | Fix connection leak, reduce transaction time |
| Add response caching | Reduce computation or query cost |
| Increase JVM heap | Fix memory leak |
| Disable verbose logging in prod | Make logging async / structured |

## Escalation Checklist

Before escalating a performance issue:
- [ ] Response time baseline (normal) vs current.
- [ ] Time the issue started and any correlated deployment/config change.
- [ ] DB slow query logs for the window.
- [ ] CPU, memory, and connection pool metrics graphs.
- [ ] Number of affected users/tenants.
- [ ] Whether specific queries, endpoints, or all traffic is affected.
