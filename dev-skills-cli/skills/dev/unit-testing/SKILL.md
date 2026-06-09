---
name: Unit Testing Patterns
id: unit-testing
version: 1.0.0
role: dev
category: Developer Activity
---

# Unit Testing Patterns

Triggers: unit test, test, spec, mock, TDD, coverage, assert

## Arrange / Act / Assert (AAA) Pattern

Every test should have three clear phases:

```js
it('should return discounted price for premium users', () => {
  // Arrange
  const user = { tier: 'premium' };
  const item = { price: 100 };

  // Act
  const result = calculatePrice(user, item);

  // Assert
  expect(result).toBe(80);
});
```

Never mix setup and assertion — keep them visually separated.

## Test Naming

Format: `should <expected behavior> when <condition>`

Good names:
- `should throw InvalidInput when email is missing`
- `should return empty array when cart has no items`
- `should not send email when user is unsubscribed`

Bad names:
- `test1`, `works correctly`, `handles error`

## What TO Test
- Business logic and calculation functions.
- Boundary conditions (empty, null, zero, max).
- Error handling — what happens when a dependency throws.
- State transitions — the entity goes from state A to state B.
- Return values and observable side effects (calls made, events emitted).

## What NOT to Test
- Third-party library internals — trust the library, test your usage.
- Implementation details — if a refactor breaks tests without changing behavior, the tests are wrong.
- Simple getters/setters with zero logic.
- Framework boilerplate (routing, ORM config).
- Private methods directly — test them through the public interface.

## Mocking Best Practices
- Mock at the boundary: mock HTTP clients, DB adapters, file system — not internal helpers.
- Use fakes/stubs for simple returns; use mocks only when you need to assert a call was made.
- Reset mocks between tests to avoid state leaking.
- Avoid mocking everything — if you mock too much, you're testing the mock, not the code.

```js
// Good: mock the HTTP client, not internal parse logic
jest.mock('./httpClient');
httpClient.get.mockResolvedValue({ data: [{ id: 1 }] });
```

## Coverage Goals
- Aim for 80%+ on business logic modules; 100% on critical paths (auth, payment, data mutations).
- Coverage is a floor, not a goal — 80% with meaningful tests beats 100% with trivial ones.
- Use coverage reports to find untested branches, not as a sign-off metric.

## TDD Approach (Red → Green → Refactor)
1. Write a failing test that describes the desired behavior.
2. Write the minimum code to make it pass.
3. Refactor the code without breaking the test.
4. Repeat for the next behavior.

TDD is especially valuable for: pure functions, parsers, validators, and bug fixes (write a test that reproduces the bug first).

## Common Pitfalls
- **Flaky tests:** async tests without proper awaiting; shared mutable state between tests.
- **Over-specification:** asserting on internal call counts when only the output matters.
- **Test pollution:** one test modifying global state that breaks another.
- **Slow tests:** real network/DB calls in unit tests — always mock I/O.
- **Missing negative cases:** only testing success path, never testing what happens on failure.
