---
name: java-debugging
description: Heap dump analysis, thread dump reading, GC tuning, and remote debug setup for Java services. Use when diagnosing OOM errors, deadlocks, high CPU, or mysterious hangs.
license: MIT
---

# Java Debugging Guide

**Tradeoff:** Live debugging on production changes timing behavior. Prefer dumps and offline analysis over attaching a debugger.

## 1. Capture First, Analyze Second

```bash
jstack <pid> > thread.tdump                              # thread dump (safe, non-destructive)
jmap -dump:format=b,file=heap.hprof <pid>               # heap dump (brief pause)
jstat -gcutil <pid> 1000 10                             # GC stats, 10 samples 1s apart
```

Add to JVM args for automatic OOM dumps:
```
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp
```

## 2. Thread Dump Analysis

**BLOCKED = lock contention; WAITING = idle (usually fine).**

- `BLOCKED (on object monitor)` → multiple threads competing for same lock
- All threads stuck at the same frame → DB call or external HTTP call hung
- Find deadlock: `grep -A 20 "Found one Java-level deadlock" thread.tdump`

## 3. Heap Dump Analysis

Open in Eclipse MAT (`mat.sh`) or VisualVM:

- **Dominator tree** → what's holding the most retained heap
- **Leak suspects** → objects accumulating across GC cycles
- Common culprits: unbounded caches, static `Map` accumulating session data, unclosed streams

## 4. GC Tuning

**Full GC pauses > 1s are a problem. Frequent minor GC is normal.**

```bash
jstat -gcutil <pid> 1000 10
# FGC column climbing = heap undersized or there's a leak
```

Recommended baseline for production:
```
-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
-Xlog:gc*:file=/logs/gc.log:time,uptime
```

Set `-Xms` = `-Xmx` to avoid resize overhead. Change GC algorithm only with measured evidence.

## 5. Remote Debug (Dev/Staging Only)

```
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
```

Connect from IDE: Remote Debug config → host + port 5005. Never enable on production.

The test: Does the thread dump show where the hang is, or does the heap dump show what object is growing?
