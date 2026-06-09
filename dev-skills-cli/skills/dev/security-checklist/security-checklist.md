---
name: Security Checklist
id: security-checklist
version: 1.0.0
role: dev
category: Developer Activity
---

# Security Checklist

Triggers: security, OWASP, injection, XSS, auth, secret, vulnerability, CVE

## OWASP Top 10 Quick Reference

| # | Risk | Quick Test |
|---|------|------------|
| A01 | Broken Access Control | Can user A access user B's data by changing an ID? |
| A02 | Cryptographic Failures | Is sensitive data encrypted at rest and in transit? |
| A03 | Injection | Is user input ever concatenated into SQL/HTML/shell commands? |
| A04 | Insecure Design | Are threat models considered in design, not bolted on later? |
| A05 | Security Misconfiguration | Are defaults changed? Are verbose errors disabled in prod? |
| A06 | Vulnerable Components | Are dependencies audited for known CVEs? |
| A07 | Auth & Session Failures | Are sessions invalidated on logout? Passwords hashed with bcrypt/argon2? |
| A08 | Integrity Failures | Are CI/CD pipelines and update channels verified? |
| A09 | Logging Failures | Are security events logged? Are logs monitored? |
| A10 | SSRF | Are outbound requests validated against an allowlist? |

## Input Validation
- Validate all user input server-side — client-side validation is UX only.
- Use allowlists (accepted formats) over denylists (rejected characters).
- Validate type, length, format, and range.
- Reject or sanitize unexpected fields — don't pass raw request bodies to DB.

## SQL Injection Prevention
- Always use parameterized queries or prepared statements.
- Never build queries via string concatenation.

```js
// BAD
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// GOOD
db.query('SELECT * FROM users WHERE email = $1', [email]);
```

## XSS (Cross-Site Scripting)
- Escape all user-controlled data before rendering in HTML.
- Use framework-native escaping (React's JSX, Handlebars `{{}}`, etc.).
- Set `Content-Security-Policy` headers to restrict script sources.
- Never use `innerHTML`, `eval()`, or `document.write()` with user content.
- Use `HttpOnly` and `Secure` flags on cookies.

## Auth & Session Handling
- Use short-lived JWTs (15–60 min) with refresh tokens stored in HttpOnly cookies.
- Invalidate sessions server-side on logout — don't just delete the cookie.
- Enforce MFA for admin and privileged accounts.
- Lock accounts after N failed login attempts; implement rate limiting.
- Hash passwords with bcrypt (cost >= 12) or argon2id — never MD5/SHA1.

## Secrets Management
- Never commit secrets to git — use `.gitignore`, secret scanning (e.g., `git-secrets`, GitHub secret scanning).
- Use environment variables or a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault).
- Rotate secrets on suspected exposure immediately.
- Use separate secrets per environment (dev/staging/prod).
- Audit who has access to production secrets.

## Dependency Security
- Run `npm audit` / `pip-audit` / `mvn dependency-check` regularly and in CI.
- Pin dependency versions in lockfiles.
- Remove unused dependencies.
- Review new dependencies before adding — check maintainer reputation and download counts.

## HTTPS / TLS
- Enforce HTTPS everywhere — redirect HTTP to HTTPS.
- Use TLS 1.2+ only; disable TLS 1.0/1.1 and SSLv3.
- Set `Strict-Transport-Security` (HSTS) header with a long `max-age`.
- Use valid certificates from a trusted CA; automate renewal (Let's Encrypt / ACM).

## Error Message Hygiene
- Never expose stack traces, internal paths, DB errors, or version strings to end users.
- Log detailed errors server-side; return generic messages to clients.
- Use error codes that ops teams can cross-reference, not raw exception messages.
