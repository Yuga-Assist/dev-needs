---
name: Incident Response
id: incident-response
version: 1.0.0
role: support
category: Support Activity
---

# Incident Response

Triggers: incident, outage, down, P1, P2, severity, escalation, postmortem

## Severity Classification

| Severity | Definition | Response SLA | Examples |
|----------|------------|-------------|---------|
| P1 | Complete outage or data loss. All users affected. | Immediate — 15 min | Login broken, data corruption, full service down |
| P2 | Major feature broken or significant user group impacted. | 30 min | Payments failing, reports not loading for a tenant |
| P3 | Degraded experience, workaround available. | 2 hours | Slow response on one page, non-critical integration error |

When in doubt, escalate severity up — it's easier to downgrade than to miss a P1.

## First 15 Minutes Checklist

- [ ] **Acknowledge** the alert or report — someone is on it.
- [ ] **Assess scope** — how many users/tenants affected? Which services? Since when?
- [ ] **Check for recent changes** — any deploys, config changes, or infra changes in the last 2 hours?
- [ ] **Check dashboards** — error rate, latency, CPU, memory, DB metrics.
- [ ] **Loop in** the on-call engineer and team lead if P1/P2.
- [ ] **Open an incident channel** (#incident-YYYY-MM-DD or a dedicated Slack/Teams thread).
- [ ] **Do not make changes** until you understand the blast radius.

## Communication Templates

### Internal Update (every 20–30 min for P1)
```
[INCIDENT UPDATE] <Service> — P1 — <HH:MM UTC>
Status: Investigating / Identified / Mitigating / Resolved
Impact: <who is affected and how>
Current action: <what the team is doing right now>
Next update: <time>
```

### Customer-Facing Status Page Update
```
We are aware of an issue affecting <feature/service>.
Our team is actively investigating.
We will provide an update by <time>.
We apologize for the inconvenience.
```

Never speculate on root cause in customer-facing communications until confirmed.

### Resolution Notice
```
The issue affecting <feature> has been resolved as of <HH:MM UTC>.
Impact duration: <start> to <end>.
All systems are operating normally.
A full postmortem will be shared within 48 hours.
```

## Escalation Path

1. On-call engineer (first responder).
2. Team lead / senior engineer for the affected service.
3. Engineering manager if unresolved after 30 min (P1) or 1 hour (P2).
4. CTO / VP Eng for customer data loss, security breach, or extended P1 outage.
5. Customer Success / Account Manager if named enterprise accounts are impacted.

## Runbook Structure

Every critical service should have a runbook covering:
1. **Service overview** — what it does, dependencies, owners.
2. **Common failure modes** — symptoms and likely causes.
3. **Diagnostic steps** — which logs to check, which metrics to look at.
4. **Mitigation playbooks** — step-by-step for known scenarios (restart, rollback, failover).
5. **Escalation contacts** — who to call and when.
6. **Links** — dashboards, alert rules, deployment pipeline, on-call rotation.

## Postmortem Format

Complete within 48 hours of resolution. Blameless — focus on systems, not people.

```markdown
## Incident Summary
- Date: YYYY-MM-DD
- Duration: HH:MM to HH:MM UTC (X hours Y minutes)
- Severity: P1 / P2 / P3
- Services affected:
- Users/tenants affected:

## Timeline (UTC)
- HH:MM — Alert fired / issue reported
- HH:MM — Team engaged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Service restored
- HH:MM — Incident closed

## Root Cause
<Factual description of what failed and why.>

## Contributing Factors
<What conditions allowed this to happen — gaps in monitoring, testing, process.>

## Resolution
<What was done to stop the bleeding.>

## Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| Add alert for X | @engineer | YYYY-MM-DD |
| Fix root cause Y | @team | YYYY-MM-DD |
| Update runbook | @owner | YYYY-MM-DD |
```
