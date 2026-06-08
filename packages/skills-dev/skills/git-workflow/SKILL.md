---
name: git-workflow
description: Team Git best practices — branch naming, atomic commits, conventional commits, and PR generation. Use when committing, pushing, or preparing pull requests.
license: MIT
---

# Git Team Workflow

## When to Use This Skill
Use this skill automatically when the user issues instructions to wrap up a feature, save progress, fix a merge conflict, or publish changes to the remote repository.

## 1. Branch Management Strategy
* **Trunk Isolation**: Never commit code or push directly to the `main` or `develop` branches.
* **Branch Naming Rule**: Always create a feature or hotfix branch originating from `main` using this syntax:
  * `feature/issue-[id]-short-description`
  * `bugfix/issue-[id]-short-description`
  * `hotfix/short-description`
* **Isolated Environments**: Prefer using Git worktrees via local automation scripts if executing large structural experiments to keep the primary working directory clean.

## 2. Commit Mechanics & Hygiene
* **Atomic Principle**: Ensure every individual commit targets exactly one logical fix or implementation step. 
* **Scope Separation**: Do not mix refactoring patterns, style formatting changes, or business logic adjustments inside the same commit footprint.
* **Incremental Verification**: Verify that the codebase compiles and localized test suites pass successfully before writing each commit.

## 3. Conventional Commits Standard
Format all commit titles using the structured Conventional Commits specification:
`<type>(<optional-scope>): <description>`

* **Allowed Types**:
  * `feat`: A new user-facing capability or system behavior.
  * `fix`: A resolution to a bug or unexpected crash.
  * `docs`: Documentation modifications only.
  * `style`: Adjustments that do not alter execution behavior (white-space, formatting, linting).
  * `refactor`: Structural code mutations that neither fix a bug nor introduce a feature.
  * `test`: Adding missing test coverage or fixing existing assertions.
* **Casing**: Use entirely lowercase letters for the description. Do not add a trailing period.
* **Context**: Explain the *why* of the modification within the commit body if the logic is complex, rather than restating the obvious code change.

## 4. Pull Request Automation
* **Pull-Before-Push**: Before opening a PR or pushing final changes upstream, run `git pull origin main --rebase` locally to incorporate target tracking and eliminate trivial merge conflicts.
* **Diff Assessment**: Generate the complete pull request description text contextually by analyzing the underlying code diff (`git diff`).
* **PR Structure Requirement**:
  * **Title**: Copy the primary conventional commit header.
  * **Summary**: Provide a bulleted list outlining all core changes.
  * **Testing Evidence**: Detail the exact validation steps or test suites executed to confirm the patch works.

## 5. Decision Rules
* **IF** a local merge conflict occurs during rebasing:
  * Halt execution immediately, locate the conflict markers, resolve them methodically based on team context, and type `git rebase --continue`.
* **IF** the generated code changes exceed roughly 500 lines of code:
  * Prompt the user to confirm whether the task should be split into smaller, isolated feature branches or sequential pull requests.
