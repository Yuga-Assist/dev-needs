---
name: oracle-exception
description: Root cause analysis for Oracle ORA- errors, locks, deadlocks, cursor leaks, and wait events. Use when investigating database exceptions or query failures.
license: MIT
---

# Oracle Exception Analyzer

**Tradeoff:** ORA- error numbers are precise — look them up before theorizing. Many share surface symptoms but have different root causes.

## 1. Common ORA- Quick Reference

| Error | Cause | First Fix |
|-------|-------|-----------|
| ORA-00054 | Resource busy (NOWAIT) | Find blocking session in `V$LOCK` |
| ORA-00060 | Deadlock detected | Check alert log for deadlock graph |
| ORA-01000 | Max open cursors exceeded | Look for cursor leaks in Java/JDBC |
| ORA-01555 | Snapshot too old | Long query vs heavy DML; increase undo retention |
| ORA-04031 | Shared pool out of memory | Pool too small or SQL not using bind variables |
| ORA-04068 | Package state discarded | Session reused after package recompile |
| TNS-12541 | No listener | Listener down or wrong port |

## 2. Lock / Blocking Session

```sql
SELECT l.sid, l.type, l.lmode, l.request,
       s.username, s.status, s.sql_id
FROM   V$LOCK l
JOIN   V$SESSION s ON s.sid = l.sid
WHERE  l.block > 0 OR l.request > 0
ORDER BY l.block DESC;
```

Kill blocking session: `ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;`

## 3. Deadlock Analysis

Deadlock graph is written to the alert log — always read it before the code:

```bash
grep -A 30 "Deadlock graph" $ORACLE_BASE/diag/rdbms/*/*/trace/alert_*.log | tail -50
```

- Graph shows which sessions held vs waited for which row locks
- Fix: enforce consistent lock acquisition order in application code

## 4. Cursor Leak (ORA-01000)

```sql
SELECT username, count(*) open_cursors
FROM   V$OPEN_CURSOR
GROUP BY username ORDER BY 2 DESC;
```

Java: ensure `ResultSet`, `PreparedStatement`, and `Connection` are closed in `finally` or try-with-resources. A leak of 1 cursor per request hits the limit after ~1000 requests.

The test: Can you identify the blocking session SID or the innermost ORA- code in the exception chain?
