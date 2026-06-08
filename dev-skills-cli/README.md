# @dev/skills

> Dev AI Skills CLI — install and manage skills across **all your AI editors** in one command.

---

## Quick Start

```bash
npx @dev/skills
```

Interactive prompts guide you through:
1. **Pick your role** — dev / support / platform / all
2. **Pick your editors** — multi-select from all supported tools (auto-detects what's installed)
3. Done — skills installed, configs patched, editors ready on next restart.

---

## Supported Editors

| Editor | How skills are delivered |
|---|---|
| 🤖 **Claude Desktop** | `skillsDirectories` in `claude_desktop_config.json` |
| ⚡ **Claude Code** | Skills index appended to `~/.claude/CLAUDE.md` |
| 🏄 **Windsurf (Cascade)** | `cascade.skillsDirectories` in `settings.json` |
| 🖱️ **Cursor** | `.mdc` rule files in `~/.cursor/rules/dev/` |
| 🐙 **GitHub Copilot (VS Code)** | `github.copilot.chat.codeGeneration.instructions` in VS Code settings |
| 🧠 **OpenAI / ChatGPT** | Generates `~/.dev/openai-custom-instructions.md` to paste |
| 🔍 **Cody (Sourcegraph)** | `~/.cody/context.yaml` context file |
| 🛠️ **Aider** | Appends to `~/.aider.system.prompt.md` |
| ▶️ **Continue** | `systemMessage` in `~/.continue/config.json` |

---

## Commands

| Command | Description |
|---|---|
| `npx @dev/skills` | Interactive install (default) |
| `npx @dev/skills install` | Install with role + editor prompts |
| `npx @dev/skills install --role dev` | Install dev skills, skip role prompt |
| `npx @dev/skills install --role support --editors claude-desktop,windsurf` | Non-interactive, CI-friendly |
| `npx @dev/skills update` | Pull latest skill versions (keeps same role + editors) |
| `npx @dev/skills editors` | Re-run editor selector without reinstalling skills |
| `npx @dev/skills editors --editors cursor,copilot` | Add specific editors |
| `npx @dev/skills list` | List all available skills |
| `npx @dev/skills list --role support` | Filter by role |
| `npx @dev/skills add` | Interactive: add a single skill |
| `npx @dev/skills add bug-triage` | Add specific skill by ID |
| `npx @dev/skills status` | Show install status + detected editors |
| `npx @dev/skills which` | Show all resolved config file paths |
| `npx @dev/skills remove` | Remove all skills and config patches |

---

## Editor IDs (for `--editors` flag)

```
claude-desktop   claude-code   windsurf   cursor
copilot          openai        cody       aider   continue
```

Example — install for Claude Code and Cursor only:
```bash
npx @dev/skills install --role dev --editors claude-code,cursor
```

---

## Roles

| Role | Who | Skills |
|---|---|---|
| `dev` | Developers | Bug triage, code review, CHR analysis, form data flow |
| `support` | Support engineers | Infolet, workflow, report, assignment loss, ORF debug |
| `platform` | Platform developers | Oracle DB, exception analysis, SDU/BAPI |
| `all` | Everyone | All of the above |

---

## What gets installed

```
~/.dev/
  skills/
    dev/         ← developer skills
    support/     ← support skills
    platform/    ← platform skills
  .skills-meta.json   ← tracks role, editors, versions, install date
```

Each editor's config is patched to point at this shared directory — no duplication.

---

## Requirements

- Node.js 18+
- One or more supported AI editors installed

---

## For Admins — Shipping Updates

Skills are versioned in `lib/registry.js`. To push an update:

1. Edit skill `.md` files in `skills/`
2. Bump `version` in `registry.js` for changed skills
3. `npm version patch && npm publish`

Developers run `npx @dev/skills update` to pull the latest — or automate it via onboarding scripts.

---

## Internal Registry

```bash
# ~/.npmrc
@dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```
