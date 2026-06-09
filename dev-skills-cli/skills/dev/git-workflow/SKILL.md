---
name: Git Workflow Guide
id: git-workflow
version: 1.0.0
role: dev
category: Developer Activity
---

# Git Workflow Guide

Triggers: git, branch, commit, merge, rebase, PR, pull request, tag

## Branch Naming Conventions

Format: `<type>/<ticket-id>-<short-description>`

| Type | When to use |
|------|-------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Tooling, deps, CI |
| `docs/` | Documentation only |
| `refactor/` | Code restructure, no behavior change |
| `hotfix/` | Urgent production fix (branches from `main`) |

Examples:
- `feat/PROJ-123-user-login`
- `fix/PROJ-456-null-pointer-on-checkout`
- `hotfix/PROJ-789-session-expiry`

## Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short summary in imperative mood>

[optional body — explain WHY, not WHAT]

[optional footer: BREAKING CHANGE, closes #issue]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

Good examples:
- `feat(auth): add OAuth2 login with Google`
- `fix(cart): prevent duplicate line items on rapid click`
- `chore(deps): upgrade lodash to 4.17.21`

Rules:
- Summary line max 72 characters.
- Imperative mood: "add" not "added" / "adds".
- One logical change per commit — avoid mega-commits.
- Never commit "WIP" or "fix fix fix" to shared branches.

## PR Description Template

```
## What changed
Brief description of the change and its purpose.

## Why
Link to ticket/issue. What problem does this solve?

## How to test
Steps to verify locally. Include expected outcome.

## Screenshots / logs (if applicable)

## Checklist
- [ ] Tests added/updated
- [ ] No secrets or debug code left in
- [ ] Self-reviewed the diff
```

## Merge vs Rebase

| Scenario | Recommended |
|----------|-------------|
| Feature branch → main | **Squash merge** (clean history) |
| Syncing feature branch with main updates | **Rebase** (linear history, easier to bisect) |
| Long-lived shared branch | **Merge** (preserve branch history) |
| Hotfix → main | **Merge** with tag |

Rebase rule: never rebase commits that have been pushed to a shared/remote branch.

## Resolving Conflicts

1. `git fetch origin && git rebase origin/main`
2. Fix conflicts in editor — look for `<<<<<<<` markers.
3. `git add <resolved-files>` then `git rebase --continue`.
4. If stuck: `git rebase --abort` to start over.
5. After rebase, force-push to your branch: `git push --force-with-lease` (safer than `--force`).

## Tagging Releases

Use semantic versioning: `MAJOR.MINOR.PATCH`

```bash
git tag -a v1.2.0 -m "Release v1.2.0 — add OAuth login"
git push origin v1.2.0
```

- MAJOR: breaking changes.
- MINOR: backward-compatible features.
- PATCH: backward-compatible bug fixes.

Tag from `main` only, after the merge is verified in staging.
