```
╭────────────────────────────────────────╮
│                                        │
│   ██████╗ ███████╗██╗   ██╗            │
│   ██╔══██╗██╔════╝██║   ██║            │
│   ██║  ██║█████╗  ██║   ██║            │
│   ██║  ██║██╔══╝  ╚██╗ ██╔╝            │
│   ██████╔╝███████╗ ╚████╔╝             │
│   ╚═════╝ ╚══════╝  ╚═══╝  Skills CLI  │
│   Dev AI Skills Installer              │
│                                        │
╰────────────────────────────────────────╯
```

<h1 align="center">dev-needs</h1>

<p align="center">One command to install curated AI skill files across every editor your team uses.</p>

<p align="center">
  <a href="https://github.com/Yuga-Assist/dev-needs"><img src="https://img.shields.io/badge/GitHub-raj4learn%2Fdev--needs-blue?logo=github" alt="GitHub"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
</p>

---

<h2 align="center">What It Does</h2>

Pick a role. Pick your editors. Done — skill files land in your editor configs and every selected AI assistant immediately knows how to help you better.

```bash
npx github:Yuga-Assist/dev-needs
```

Skills are plain markdown files. No runtime dependency, no agent framework — just context your AI editor loads automatically.

---

<h2 align="center">Quick Start</h2>

**Prerequisites:** Node.js `>=18.0.0`

```bash
# Interactive — prompts for role + editors
npx github:Yuga-Assist/dev-needs

# Non-interactive
npx github:Yuga-Assist/dev-needs install --role dev --editors claude-code,cursor

# Preview without writing anything
npx github:Yuga-Assist/dev-needs install --role dev --dry-run
```

No global install required. Run from anywhere.

---

<h2 align="center">Skills Catalog</h2>

<h3 align="center">Developer Role</h3>

| Skill | What It Does | Triggers |
|-------|-------------|---------|
| **Bug Triage & RCA** | Systematic root cause analysis — symptom → evidence → cause → fix | `bug`, `triage`, `root cause`, `defect` |
| **Code Review Assistant** | Correctness, security, performance, and readability checklist | `code review`, `PR review`, `diff` |
| **Git Workflow Guide** | Branch naming, conventional commits, PR templates, merge vs rebase | `git`, `branch`, `commit`, `merge` |
| **Unit Testing Patterns** | AAA pattern, mocking, TDD, coverage goals | `unit test`, `TDD`, `coverage`, `mock` |
| **Security Checklist** | OWASP Top 10, SQL injection, XSS, auth, secrets management | `security`, `OWASP`, `injection`, `XSS` |
| **Karpathy Guidelines** | Reduce LLM coding mistakes — simplicity, surgical changes, verifiable goals | `coding guidelines`, `simplicity`, `overcomplication` |

<h3 align="center">Support Role</h3>

| Skill | What It Does | Triggers |
|-------|-------------|---------|
| **Log Analysis Guide** | Read stack traces, grep patterns, cross-service correlation | `log`, `error log`, `stack trace`, `exception` |
| **Performance Triage** | CPU/memory/IO/DB bottleneck identification, N+1 detection, profiling | `performance`, `slow`, `timeout`, `latency`, `N+1` |
| **Incident Response** | P1–P3 classification, first-15-min checklist, postmortem format | `incident`, `outage`, `P1`, `P2`, `postmortem` |

<h3 align="center">Shared (All Roles)</h3>

| Skill | What It Does | Triggers |
|-------|-------------|---------|
| **Caveman Mode** | Ultra-compressed AI responses — cuts token usage ~75% while keeping full accuracy | `caveman`, `be brief`, `less tokens` |
| **Grill Me** | AI interviews you relentlessly about a plan or bug until shared understanding is reached | `grill me`, `challenge my plan`, `devil's advocate` |
| **Teaching Mode** | Multi-session learning tracker — missions, lessons, records, reference materials | `teach me`, `I want to learn`, `tutorial` |

---

<h2 align="center">Supported Editors</h2>

<div align="center">

| Editor | Install Method |
|--------|---------------|
| **Claude Code** | Appends skills block to `~/.claude/CLAUDE.md` |
| **Claude Desktop** | Writes skills directory to JSON config |
| **Cursor** | Writes one `.mdc` file per skill to `~/.cursor/rules/` |
| **Windsurf** | Writes skills directory to `~/.windsurf/settings.json` |
| **GitHub Copilot** | Writes skills directory path to Copilot JSON config |
| **Cody** | Writes `~/.cody/context.yaml` with context file entries |
| **Aider** | Appends skills block to `~/.aider.system.prompt.md` |
| **Continue** | Patches `systemMessage` in `~/.continue/config.json` |
| **OpenAI / ChatGPT** | Copies skill files — paste into custom instructions manually |

</div>

Editors already installed on your machine are **auto-detected** and pre-selected in the interactive prompt.

---

<h2 align="center">All Commands</h2>

```bash
# Interactive install (default — prompts for role + editors)
npx github:Yuga-Assist/dev-needs

# Install with flags
npx github:Yuga-Assist/dev-needs install --role dev
npx github:Yuga-Assist/dev-needs install --role support
npx github:Yuga-Assist/dev-needs install --role all
npx github:Yuga-Assist/dev-needs install --role dev --editors claude-code,cursor,copilot
npx github:Yuga-Assist/dev-needs install --role dev --dry-run

# Update skills to latest (re-installs without re-prompting)
npx github:Yuga-Assist/dev-needs update

# Re-run editor picker only (no skill reinstall)
npx github:Yuga-Assist/dev-needs editors

# Add a single skill by ID
npx github:Yuga-Assist/dev-needs add bug-triage

# List skills by role
npx github:Yuga-Assist/dev-needs list --role dev
npx github:Yuga-Assist/dev-needs list --role support
npx github:Yuga-Assist/dev-needs list --role all

# Show installed role, editors, timestamps
npx github:Yuga-Assist/dev-needs status

# Show all resolved editor config paths
npx github:Yuga-Assist/dev-needs which

# Remove all skills and editor patches
npx github:Yuga-Assist/dev-needs remove
```

**Valid roles:** `dev` · `support` · `all`

**Valid editor IDs:** `claude-code` · `claude-desktop` · `cursor` · `windsurf` · `copilot` · `cody` · `aider` · `continue` · `openai`

---

<h2 align="center">Where Skills Land</h2>

After install, skills live at:

```
~/.dev/
├── skills/
│   ├── dev/          ← developer + shared skills
│   └── support/      ← support + shared skills
└── .skills-meta.json ← installed role, editors, timestamps
```

Each skill is a single markdown file. Your AI editor reads it automatically — no further configuration needed.

---

<h2 align="center">How Skills Work</h2>

Skills are context-injection files — plain markdown that tells your AI editor how to behave for a specific task type.

When you say **"review this PR"** in your editor, the Code Review skill fires. When you say **"help me triage this bug"**, the Bug Triage skill fires. The trigger keywords are embedded in the skill files so your editor activates them automatically.

Each skill follows a consistent format:
- **When to activate** — trigger list
- **What to do** — step-by-step guidance
- **Output template** — structured output to produce

---

<h2 align="center">Adding a New Skill</h2>

1. Create `dev-skills-cli/skills/<role>/<skill-id>/SKILL.md`
2. Add an entry to `dev-skills-cli/lib/registry.js`
3. Test with `node dev-skills-cli/bin/cli.js list --role <role>`
4. Submit a PR — describe what the skill does and what triggers it

Skill file format:

```markdown
---
name: Skill Name
description: One-line description of when to invoke this skill.
license: MIT
---

# Skill Title

**Tradeoff:** [optional caveat]

## 1. First Section

**Bold tagline.**

- Concrete bullet
- Concrete bullet

The test: [one-line verifier]
```

---

<h2 align="center">Clone and Run Locally</h2>

```bash
git clone https://github.com/Yuga-Assist/dev-needs.git
cd dev-needs
npm install
node dev-skills-cli/bin/cli.js
```

---

<h2 align="center">License</h2>

<p align="center">MIT</p>
