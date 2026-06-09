---
name: Log Analysis Guide
id: log-analysis
version: 1.0.0
role: support
category: Support Activity
---

# Log Analysis Guide

Triggers: log, error log, stack trace, exception, log analysis, debug log

## Where to Start

1. Identify the time window — when did the issue start? Narrow to a 5–10 min window first.
2. Identify affected service(s) — which service owns the failing endpoint or job?
3. Find the first error, not the most frequent — the first error is usually the root cause; subsequent ones are cascade failures.

## Reading a Stack Trace

Read stack traces bottom-up for the origin, top-down for the propagation:
- **Bottom frames** = where the error originated (your code or library root).
- **Top frames** = where the exception was caught or logged.
- Look for the first frame that belongs to *your* codebase — framework frames above it are just propagation.

```
Exception in thread "main" java.lang.NullPointerException
    at com.example.OrderService.processPayment(OrderService.java:142)  <-- your code
    at com.example.CheckoutController.submit(CheckoutController.java:87)
    at org.springframework.web.servlet.DispatcherServlet...            <-- framework
```

Focus on `OrderService.java:142` first.

## Common Grep/Regex Patterns

```bash
# All ERRORs in a time window
grep "2024-03-15 14:[23]" app.log | grep ERROR

# Unique error messages (deduplicate)
grep ERROR app.log | sort | uniq -c | sort -rn

# Find requests for a specific user or session
grep "userId=12345" app.log

# Trace a request by correlation ID
grep "correlationId=abc-123" *.log

# Find slow queries (threshold example)
grep "duration=[0-9]\{4,\}ms" app.log

# Exceptions with 5 lines of context
grep -A 5 "Exception" app.log
```

## Correlating Across Services

- Use a **correlation/trace ID** that propagates across service calls (set in HTTP headers: `X-Request-ID`, `X-Trace-ID`).
- Align timestamps — ensure all services use UTC and NTP-synced clocks.
- Search all service logs for the same correlation ID to reconstruct the full request path.
- Build a rough timeline: Service A logged error at 14:03:22 → Service B logged timeout at 14:03:20 (B failed first).

## Distinguishing Symptoms from Root Cause

| Symptom (what you see) | Likely root cause (what to look for) |
|------------------------|--------------------------------------|
| 500 errors on API | Unhandled exception in service — check service logs |
| DB connection errors | Connection pool exhausted or DB host unreachable |
| Timeout cascade | One slow upstream dependency blocking thread pool |
| Memory OOM kills | Memory leak, large payload not GC'd, connection not closed |
| Auth failures for all users | Expired cert, rotated secret not deployed, auth service down |

## Log Levels Guide

- `ERROR` — something failed that requires attention; start here.
- `WARN` — something unexpected happened but was handled; context for errors.
- `INFO` — normal operations; use to confirm expected events occurred.
- `DEBUG` — detailed trace; only enable in non-prod or short windows in prod.

## Escalation Checklist

Before escalating, collect:
- [ ] Exact error message and stack trace (first occurrence).
- [ ] Time range of the issue.
- [ ] Affected users/tenants/services.
- [ ] Correlation ID(s) for affected requests.
- [ ] Any recent deployments or config changes in the same window.
- [ ] Whether the issue is ongoing or resolved.
