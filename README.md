# dev-needs

> One command to install curated AI skill files for your engineering team — across every editor they use.

Pick your role. Pick your editors. Done — skills land in `~/.Dev/skills/` and every selected editor config is patched automatically.

---

## Features

- **Role-based skills** — install only what's relevant to your job: `dev`, `support`, `platform`, or `all`
- **9 editors supported** in one pass: Claude Desktop, Claude Code, Windsurf, Cursor, GitHub Copilot, OpenAI/ChatGPT, Cody, Aider, Continue
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
| Change History Report | CHR, change history, audit trail |
| Form Data Process Flow | form, push table, submission, data flow |
| Karpathy Guidelines | coding guidelines, simplicity, surgical changes |

### Support Engineer (`--role support`)

| Skill | Triggers |
|-------|----------|
| Infolet Debugger | infolet, metric, no data |
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

## Installation

**Prerequisites:** Node.js `>=18.0.0`

### Option 1 — Run directly (no install needed)

```bash
npx github:raj4learn/dev-needs
```

### Option 2 — Install globally

```bash
npm install -g github:raj4learn/dev-needs
```

Then run anytime:

```bash
dev-skills
```

### Option 3 — Clone and run locally

```bash
git clone https://github.com/raj4learn/dev-needs.git
cd dev-needs
npm install
node dev-skills-cli/bin/cli.js
```

---

## Usage

```bash
# Interactive (prompts for role + editors)
npx github:raj4learn/dev-needs

# Non-interactive
npx github:raj4learn/dev-needs install --role dev --editors claude-code,cursor

# Preview without writing
npx github:raj4learn/dev-needs install --role dev --dry-run

# Update skills to latest
npx github:raj4learn/dev-needs update

# Remove everything
npx github:raj4learn/dev-needs remove
```

---

## License

MIT
