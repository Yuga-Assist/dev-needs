---
name: security-patching
description: CVE triage, dependency upgrade, and VAPT response workflow. Use when handling a security advisory, pen test finding, or dependency vulnerability scan result.
license: MIT
---

# Security Patching Guide

**Tradeoff:** Upgrading a major dependency to fix a CVE can introduce breaking changes. Assess impact before patching — don't auto-apply `--force`.

## 1. Triage Severity

**CVSS score alone doesn't determine urgency — exploitability does.**

| CVSS | Label | Response |
|------|-------|---------|
| 9.0–10.0 | Critical | Patch within 24–48h or mitigate immediately |
| 7.0–8.9 | High | Patch within current sprint |
| 4.0–6.9 | Medium | Patch in next release |
| 0.1–3.9 | Low | Address in quarterly cleanup |

Before acting: confirm the vulnerable component is in your runtime path. A CVE in a dev-only dependency or an unreachable code path is lower priority than CVSS suggests.

## 2. Scan

```bash
npm audit --audit-level=moderate        # Node.js
mvn dependency-check:check              # Java (OWASP Maven plugin)
```

GitLab: Security → Dependency Scanning in the pipeline report.

## 3. Upgrade

```bash
npm audit fix                           # auto-fix compatible upgrades only
npm audit fix --force                   # includes breaking upgrades — review diff first
```

For Java: bump version in `pom.xml`, run full test suite, check for API breakage. Major version bumps: read the changelog for breaking changes before upgrading — don't ship same-day.

## 4. Verify

```bash
npm audit --audit-level=moderate        # should show 0 findings for patched package
```

- Re-run all tests after upgrade
- If behavior changes: add a regression test before shipping
- Close the VAPT finding with: patched version, test evidence, deploy date

The test: Does `npm audit` (or Maven equivalent) report zero findings for the patched package after upgrade?
