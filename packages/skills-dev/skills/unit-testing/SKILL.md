---
name: unit-testing
description: Testing patterns, mock strategy, and coverage guidance. Use when writing tests, reviewing test coverage, or deciding what to test.
license: MIT
---

# Unit Testing Patterns

**Tradeoff:** Tests that mirror implementation details break on refactors. Test behavior, not internals.

## 1. Test the Right Thing

**One test, one behavior. Name it like a requirement.**

- `test_login_rejects_expired_token` not `test_loginMethod`
- Test happy path + one negative path per rule — not every permutation
- If a test needs 50 lines of setup, the code under test is too coupled

## 2. Testing Layers

| Layer | Framework | Scope |
|-------|-----------|-------|
| Java services | JUnit 5 + Mockito | Unit + integration |
| PL/SQL | utPLSQL | Package/procedure |
| Node.js | node:test (built-in) | Module/function |
| Frontend JS | Vitest / Jest | Component/utility |
| Python | pytest | Module/function |

## 3. Mock Strategy

**Mock at boundaries — not inside the unit under test.**

- Mock: external HTTP calls, database, file system, message queues
- Do not mock: standard library, value objects, pure functions
- PL/SQL: stub remote packages and DB links; test the local package in isolation

## 4. Coverage Targets

**Coverage is a floor, not a goal.**

- 80% overall minimum; 90% for business logic
- Uncovered lines should be trivial (getters) or explicitly excluded
- 100% coverage with no assertions is worthless — it measures execution, not correctness

The test: If you delete the feature, does at least one test fail?
