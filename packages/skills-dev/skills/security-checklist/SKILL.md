---
name: security-checklist
description: OWASP Top 10 security checklist for code review and feature development. Use when writing or reviewing code that handles user input, authentication, database queries, or external integrations.
license: MIT
---

# Security Checklist (OWASP)

**Tradeoff:** Apply the full list to auth/data paths; spot-check read-only UI code.

## 1. Injection (A03)

**Never concatenate user input into SQL, shell, or LDAP queries.**

- Use bind variables: `WHERE id = :userId` not `WHERE id = '` + userId + `'`
- Parameterize all ORM queries — check auto-generated SQL in debug mode
- Shell commands: validate input strictly; avoid `exec(userInput)` patterns

## 2. Authentication & Session (A07)

**Tokens validated server-side every request — not just on login.**

- Session tokens: sufficient entropy, HttpOnly, Secure, SameSite=Strict
- Passwords: bcrypt/PBKDF2 minimum — never MD5/SHA1
- Logout: invalidate server-side session, not just clear cookie

## 3. Cross-Site Scripting (A03)

**Encode on output, not on input.**

- JSP: use `<c:out>` or `fn:escapeXml()` for all user-controlled values
- JS: `textContent` not `innerHTML` for dynamic values
- Content-Security-Policy header blocks inline scripts as defense-in-depth

## 4. Secrets & Data Exposure (A02)

**Secrets live in env vars or a vault — never in code or logs.**

- No credentials in `.properties`, `.yaml`, git history, or log statements
- Mask PII in logs: log length or hash, not value
- Enforce TLS for transit; encrypt sensitive fields at rest

## 5. Dependency CVEs (A06)

**Run before every release.**

```bash
npm audit --audit-level=high
mvn dependency-check:check   # OWASP Maven plugin
```

The test: `grep -r "password\|secret\|token" src/` — every hit should be a config read, never a literal.
