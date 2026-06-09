# dev-needs

> One command to install curated AI skill files for your whole engineering team — across every editor they use.

Developers using Claude, Cursor, Copilot, or Windsurf each need context about your platform to give useful answers. **dev-needs** ships that context as versioned skill files and installs them into every AI editor in a single interactive flow.

Pick your role. Pick your editors. Done — skills land in `~/.Dev/skills/` and every selected editor config is patched automatically.

---

## Quick Start

```bash
npx github:raj4learn/dev-needs
```

No npm account, no token, no registry config required.

---

## Installation

### Option 1 — Run directly from GitHub (recommended)

```bash
npx github:raj4learn/dev-needs
```

npm downloads the repo, installs dependencies, and launches the interactive installer. Nothing is permanently installed on your system — only the skill files and editor config patches.

### Option 2 — Install globally from GitHub

```bash
npm install -g github:raj4learn/dev-needs
```

Then run anytime with:

```bash
dev-skills
# or
ms-skills
```

### Option 3 — Clone and run locally

```bash
git clone https://github.com/raj4learn/dev-needs.git
cd dev-needs
npm install
node dev-skills-cli/bin/cli.js
```

---

## Prerequisites

- Node.js `>=18.0.0`
- npm `>=8.0.0`

---

## What it does

1. **Prompts for your role** — `dev`, `support`, `platform`, or `all`
2. **Detects installed editors** — auto-selects editors found on your machine
3. **Copies skill files** to `~/.Dev/skills/<role>/`
4. **Patches each editor config** so the AI has access to the skills on every run

---

## Features

- **Role-based skills** — install only what's relevant to your job
- **9 editors** in one pass: Claude Desktop, Claude Code, Windsurf, Cursor, GitHub Copilot, OpenAI/ChatGPT, Cody, Aider, Continue
- **Automatic editor detection** — pre-selects editors already installed on your machine
- **Idempotent** — safe to run again; updates skill files and replaces old patches
- **Dry-run mode** — preview all changes without writing anything (`--dry-run`)

---

## Skills

### Developer (`--role dev`)

| Skill | Triggers |
|-------|----------|
| Bug Triage & RCA | bug, triage, root cause, defect |
| Code Review Assistant | code review, PR, diff, refactor |
| Change History Report (CHR) | CHR, change history, audit trail |
| Form Data Process Flow | form, push table, submission, data flow |
| Karpathy Guidelines | coding guidelines, simplicity, surgical changes |

### Support Engineer (`--role support`)

| Skill | Triggers |
|-------|----------|
| Infolet Debugger | infolet, metric, no data, not visible |
| Workflow Debugger | workflow, assignment, email not triggered |
| Report Debugger | report, export, filter, no data |
| Assignment Loss Investigation | assignment lost, assignment missing |
| ORF Analysis | ORF, org restructure, impact assessment |

### Platform Developer (`--role platform`)

| Skill | Triggers |
|-------|----------|
| Oracle DB Expert | oracle, SQL, PL/SQL, query, index |
| Oracle Exception Analyzer | ORA-, exception, lock, deadlock |
| SDU / BAPI Analyzer | SDU, BAPI, batch, DU upload |

---

## Editor Support

| Editor | How it's configured |
|--------|---------------------|
| Claude Code | Appends skills block to `~/.claude/CLAUDE.md` |
| Claude Desktop | Adds `skillsDirectories` to JSON config |
| Windsurf | Adds `cascade.skillsDirectories` to settings.json |
| Cursor | Writes one `.mdc` rule per skill to `~/.cursor/rules/dev/` |
| GitHub Copilot (VS Code) | Adds `codeGeneration.instructions` to VS Code settings.json |
| Cody (Sourcegraph) | Writes `~/.cody/context.yaml` |
| Aider | Appends to `~/.aider.system.prompt.md` |
| Continue | Patches `systemMessage` in `~/.continue/config.json` |
| OpenAI / ChatGPT | Generates `~/.Dev/openai-custom-instructions.md` for manual paste |

---

## CLI Reference

```bash
npx github:raj4learn/dev-needs <command> [options]
# or if installed globally:
dev-skills <command> [options]
```

| Command | Options | Description |
|---------|---------|-------------|
| `install` | `--role <role>` `--editors <list>` `--dry-run` | Install skills + patch editor configs |
| `update` | — | Re-install skills for current role |
| `editors` | `--editors <list>` | Re-configure editors without reinstalling skills |
| `list` | `--role <role>` | List available skills |
| `add [skillId]` | — | Install a single skill by ID |
| `remove` | `--yes` | Remove all skills and editor patches |
| `status` | — | Show installed role, editors, timestamps |
| `which` | — | Show resolved config paths for this machine |

**Roles:** `dev` · `support` · `platform` · `all`

**Editor IDs:** `claude-desktop` · `claude-code` · `windsurf` · `cursor` · `copilot` · `openai` · `cody` · `aider` · `continue`

### Examples

```bash
# Non-interactive install
npx github:raj4learn/dev-needs install --role dev --editors claude-code,cursor

# Preview without writing
npx github:raj4learn/dev-needs install --role dev --dry-run

# Add a single skill
npx github:raj4learn/dev-needs add karpathy-guidelines

# Check what's installed
npx github:raj4learn/dev-needs status

# Update to latest skill versions
npx github:raj4learn/dev-needs update

# Remove everything
npx github:raj4learn/dev-needs remove
```

---

## Adding a New Skill

1. Create `dev-skills-cli/skills/<role>/<skill-id>.md`
2. Add entry to `SKILLS_REGISTRY` in `dev-skills-cli/lib/registry.js`
3. Bump `version` in `package.json` and `dev-skills-cli/package.json`
4. Push — immediately available via `npx github:raj4learn/dev-needs`

Skill file format:

```markdown
---
name: skill-name
description: One-line description of when to invoke this skill.
license: MIT
---

# Skill Title

Your skill content here.
```

---

## Repository Structure

```
dev-needs/
├── dev-skills-cli/          Working CLI implementation
│   ├── bin/cli.js           Entry point (Commander.js)
│   ├── lib/
│   │   ├── registry.js      Skill + role definitions
│   │   ├── installer.js     Copy skills to ~/.Dev/skills/
│   │   ├── patcher.js       Patch 9 editor configs (7 patch modes)
│   │   ├── editors.js       Editor definitions + detection
│   │   ├── display.js       Terminal UI
│   │   └── paths.js         SKILLS_DIR, META_FILE constants
│   └── skills/
│       ├── dev/             Developer skill files
│       ├── support/         Support skill files
│       └── platform/        Platform skill files
│
├── packages/skills-cli/     Monorepo package (in progress)
├── package.json             Workspace root + GitHub install entrypoint
└── .gitlab-ci.yml           CI publish pipeline
```

---

## License

MIT
