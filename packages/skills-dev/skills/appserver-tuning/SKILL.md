---
name: appserver-tuning
description: WebLogic and Tomcat thread pool, datasource connection pool, and JVM tuning. Use when investigating stuck threads, connection pool exhaustion, or poor throughput.
license: MIT
---

# App Server Tuning

**Tradeoff:** Increasing pool sizes masks the real problem. Measure utilization before changing numbers.

## 1. Stuck Threads (WebLogic)

**Stuck threads = requests exceeding the stuck-thread threshold (default 600s).**

- Console → Servers → Monitoring → Threads → filter by State = Stuck
- Thread name in WebLogic matches `jstack` output — correlate for the actual stack frame
- Common causes: DB query with no timeout, infinite loop, external HTTP call hung

Config: `config/config.xml` → `<stuck-thread-max-time>` (seconds before marking stuck)

## 2. Thread Pool

```xml
<!-- config/config.xml Work Manager -->
<max-threads-constraint>50</max-threads-constraint>
<min-threads-constraint>5</min-threads-constraint>
```

Check queue depth in console → Work Manager → pending requests. Queue > 0 consistently means pool is the bottleneck — but verify threads aren't all waiting on DB first.

## 3. Datasource / Connection Pool

```xml
<!-- JDBC datasource descriptor -->
<max-capacity>30</max-capacity>
<initial-capacity>5</initial-capacity>
<connection-reserve-timeout-seconds>10</connection-reserve-timeout-seconds>
<test-connections-on-reserve>true</test-connections-on-reserve>
<inactive-connection-timeout-seconds>300</inactive-connection-timeout-seconds>
```

- Pool exhaustion: `Cannot get a connection, pool error Timeout waiting` in logs
- If `V$SESSION` count = pool max, pool is correctly sized but DB is the bottleneck

## 4. JVM Heap

```
-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
-Xlog:gc*:file=/logs/gc.log:time,uptime
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/
```

Set `-Xms` = `-Xmx` in production to prevent resize pauses.

The test: Is the thread pool queue growing, or are threads blocked waiting for a DB connection?
