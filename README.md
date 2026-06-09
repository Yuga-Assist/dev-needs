# dev-needs

> One command to install curated AI skill files for your whole engineering team — across every editor they use.

Developers using Claude, Cursor, Copilot, or Windsurf each need context about your platform to give useful answers. **dev-needs** ships that context as versioned skill packs and installs them into every AI editor in a single interactive flow.

```
npx @dev/skills
```

Pick your role. Pick your editors. Done — skills land in `~/.dev/skills/` and every selected editor config is patched automatically.

---

## Features

- **Role-based skill packs** — install only the skills relevant to your job: `dev` or `support`
- **9 editors supported** in one pass: Claude Desktop, Claude Code, Windsurf, Cursor, GitHub Copilot, OpenAI/ChatGPT, Cody, Aider, Continue
- **12 developer + platform skills** covering code review, git workflow, Oracle DB (128 guides), Java debugging, CI/CD, schema migrations, security, and more
- **Automatic editor detection** — pre-selects editors already installed on your machine
- **Idempotent installs** — run again to update; previous config patches are safely replaced
- **Dry-run mode** — preview all changes without writing anything (`--dry-run`)
- **Monorepo** — skill packs versioned and published independently from the CLI

---

## Skill Packs

### `@dev/skills-dev` — Developer + Platform

| Skill | Category |
|-------|----------|
| Code Review Assistant | Developer Activity |
| Git Workflow Guide | Developer Activity |
| Unit Testing Patterns | Developer Activity |
| Security Checklist (OWASP) | Developer Activity |
| API Design Guidelines | Platform Development |
| Oracle DB Expert (128 guides) | Platform Development |
| Oracle Exception Analyzer | Platform Development |
| Java Debugging Guide | Platform Development |
| App Server Tuning | Platform Development |
| CI/CD Pipeline Guide | Platform Development |
| Schema Migration Patterns | Platform Development |
| Security Patching Guide | Platform Development |

### `@dev/skills-support` — Support Engineer

| Skill | Category |
|-------|----------|
| Log Analysis & Error Patterns | Support Activity |
| Performance Triage | Support Activity |

---

## Editor Support

| Editor | Config method |
|--------|---------------|
| Claude Code | Appends skills block to `~/.claude/CLAUDE.md` |
| Claude Desktop | Adds `skillsDirectories` to JSON config |
| Windsurf (Cascade) | Adds `cascade.skillsDirectories` to settings.json |
| Cursor | Writes one `.mdc` rule per skill to `~/.cursor/rules/` |
| GitHub Copilot (VS Code) | Adds `codeGeneration.instructions` to VS Code settings.json |
| Cody (Sourcegraph) | Writes `~/.cody/context.yaml` |
| Aider | Appends to `~/.aider.system.prompt.md` |
| Continue | Patches `systemMessage` in `~/.continue/config.json` |
| OpenAI / ChatGPT | Generates `~/.dev/openai-custom-instructions.md` for manual paste |

---

## Installation

### Prerequisites

- Node.js `>=18.0.0`
- npm `>=8.0.0`

### From GitHub (development)

```bash
git clone https://github.com/raj4learn/dev-needs.git
cd dev-needs

# Install all workspace dependencies
npm install

# Verify everything works
npm test
```

### Install a role (once CLI lib is complete)

```bash
# Interactive — prompts for role and editors
npx @dev/skills

# Or non-interactive
npx @dev/skills install --role dev --editors claude-code,cursor
```

### Update installed skills

```bash
npx @dev/skills update
```

### Remove everything

```bash
npx @dev/skills remove
```

---

## CLI Reference

```
ms-skills <command> [options]
```

| Command | Options | Description |
|---------|---------|-------------|
| `install` | `--role <role>` `--editors <list>` `--dry-run` | Install skills + patch editor configs |
| `update` | — | Re-install skills for current role |
| `editors` | `--editors <list>` | Re-configure editors without reinstalling skills |
| `list` | `--role <role>` | List available skills |
| `add [skillId]` | — | Install a single skill |
| `remove` | `--yes` | Remove all skills and editor patches |
| `status` | — | Show installed role, editors, timestamps |
| `which` | — | Show resolved config paths for this machine |

**Roles:** `dev` · `support` · `all`

**Editor IDs:** `claude-desktop` · `claude-code` · `windsurf` · `cursor` · `copilot` · `openai` · `cody` · `aider` · `continue`

---

## Repository Structure

```
dev-needs/
├── packages/
│   ├── skills-cli/          @dev/skills       — CLI installer
│   │   ├── bin/cli.js       entry point
│   │   └── lib/             editors.js, display.js (+ registry, installer, patcher, paths)
│   │
│   ├── skills-dev/          @dev/skills-dev   — dev + platform skill pack
│   │   ├── index.js         manifest
│   │   └── skills/          12 skill folders, each with SKILL.md
│   │
│   └── skills-support/      @dev/skills-support — support skill pack
│       ├── index.js         manifest
│       └── skills/          2 skill folders
│
├── package.json             workspace root
└── .gitlab-ci.yml           CI publish pipeline
```

Each skill lives in its own folder:

```
skills/<skill-id>/
└── SKILL.md        frontmatter + structured guidance
```

The Oracle DB skill is a **directory skill** — one `SKILL.md` entry point plus 128 individual topic guides organized by category (`sql-dev/`, `performance/`, `plsql/`, `ords/`, `migrations/`, ...).

---

## Development

### Run tests

```bash
npm test                                          # all workspaces
npm test --workspace packages/skills-dev          # dev pack only
npm test --workspace packages/skills-support      # support pack only
```

Tests verify: manifest structure, all referenced SKILL.md files exist, required fields present.

### Add a skill

1. Create `packages/skills-dev/skills/<skill-id>/SKILL.md`
2. Add entry to `manifest.skills[]` in `packages/skills-dev/index.js`
3. Run `npm test --workspace packages/skills-dev`
4. Bump `version` in `packages/skills-dev/package.json`

### Skill file format

```markdown
---
name: skill-name
description: One-line description of when to invoke this skill.
license: MIT
---

# Skill Title

## 1. Section

**Bold tagline.**

- Concrete, actionable guidance
- No filler

The test: [one-line verifier]
```

---

## Publishing

Tag format: `skills-vX.Y.Z`

```bash
git tag skills-v1.1.0
git push --tags
# GitLab CI publishes all changed packages to the private registry
```

Consumer setup (`~/.npmrc`):

```ini
@dev:registry=https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/
//your-gitlab.example.com/...:_authToken=<YOUR_TOKEN>
```

See `.npmrc.example` for the full template.

---

## License

MIT
