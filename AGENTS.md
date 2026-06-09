# AGENTS.md — dev-needs

AI agent reference for the `dev-needs` monorepo. Read before making any changes.

---

## Project Purpose

**dev-needs** ships a CLI (`@dev/skills`) that installs curated AI skill files for Dev engineers across 9 AI editors in one command. Engineers pick a role, pick editors, done — skills land in `~/.dev/skills/` and all selected editor configs are patched automatically.

The skill content itself is published as separate npm packages (`@dev/skills-dev`, `@dev/skills-support`) so skills can be versioned and updated independently from the CLI.

---

## Repository Layout

```
dev-needs/
├── packages/
│   ├── skills-cli/              @dev/skills  v1.2.0  — CLI installer
│   │   ├── bin/cli.js           entry point (Commander.js, all 8 commands)
│   │   └── lib/
│   │       ├── editors.js       ✅ 9 editor definitions + detection helpers
│   │       ├── display.js       ✅ all terminal UI (chalk, boxen, figures)
│   │       ├── registry.js      ⬜ NOT YET — skill registry + role definitions
│   │       ├── installer.js     ⬜ NOT YET — copy skills, write metadata
│   │       ├── patcher.js       ⬜ NOT YET — patch 9 editor configs
│   │       └── paths.js         ⬜ NOT YET — SKILLS_DIR, META_FILE constants
│   │
│   ├── skills-dev/              @dev/skills-dev  v1.0.0  — dev + platform skill pack
│   │   ├── index.js             manifest (role, version, skillsDir, skills[])
│   │   ├── skills/
│   │   │   ├── code-review/SKILL.md
│   │   │   ├── git-workflow/SKILL.md
│   │   │   ├── unit-testing/SKILL.md
│   │   │   ├── security-checklist/SKILL.md
│   │   │   ├── api-design/SKILL.md
│   │   │   ├── oracle-exception/SKILL.md
│   │   │   ├── java-debugging/SKILL.md
│   │   │   ├── appserver-tuning/SKILL.md
│   │   │   ├── cicd-pipeline/SKILL.md
│   │   │   ├── schema-migration/SKILL.md
│   │   │   ├── security-patching/SKILL.md
│   │   │   └── oracle-db-skills/   ← dir skill: SKILL.md entry + 128 guide files
│   │   └── tests/manifest.test.js
│   │
│   └── skills-support/          @dev/skills-support  v1.0.0  — support skill pack
│       ├── index.js             manifest
│       ├── skills/
│       │   ├── log-analysis/SKILL.md
│       │   └── performance-triage/SKILL.md
│       └── tests/manifest.test.js
│
├── package.json                 workspace root — workspaces: ["packages/*"]
├── .gitlab-ci.yml               CI: publish on skills-* tags
├── .npmrc.example               registry config template for @dev scope
│
├── dev-skills-cli/              ⚠️  LEGACY — delete this directory
├── cli.js                       ⚠️  LEGACY — delete
├── editors.js                   ⚠️  LEGACY — delete
├── patcher.js                   ⚠️  LEGACY — delete
└── package-lock.json            ⚠️  LEGACY — delete (workspace uses individual lock files)
```

---

## Commands

### Testing

```bash
# Run all workspace tests (from repo root)
npm test

# Run skill pack tests only
npm test --workspace packages/skills-dev
npm test --workspace packages/skills-support

# Direct
node --test "packages/skills-dev/tests/*.js"
```

### CLI (skills-cli)

```bash
# Run CLI directly
node packages/skills-cli/bin/cli.js

# Interactive install (default when no args)
node packages/skills-cli/bin/cli.js install

# Non-interactive
node packages/skills-cli/bin/cli.js install --role dev --editors claude-code,cursor

# Other commands
node packages/skills-cli/bin/cli.js list --role dev
node packages/skills-cli/bin/cli.js status
node packages/skills-cli/bin/cli.js which
```

> ⚠️ The CLI bin references `lib/registry.js`, `lib/installer.js`, `lib/patcher.js`, `lib/paths.js` — none of which exist yet. The CLI will fail at runtime until those are implemented.

---

## CLI Commands Reference

| Command | Flags | What it does |
|---------|-------|-------------|
| `install` (default) | `-r/--role`, `-e/--editors`, `--dry-run` | Pick role + editors → install skills → patch editor configs → write metadata |
| `update` | — | Re-install skills for current role without re-prompting |
| `editors` | `-e/--editors` | Re-run editor picker only (no skill reinstall) |
| `list` | `-r/--role` | Print skills filtered by role |
| `add [skillId]` | — | Install a single skill by ID |
| `remove` | `-y/--yes` | Uninstall all skills and editor patches |
| `status` | — | Show installed role, editors, timestamps |
| `which` | — | Print all resolved editor config file paths |

**Valid roles:** `dev`, `support`, `all`

**Valid editor IDs:** `claude-desktop`, `claude-code`, `windsurf`, `cursor`, `copilot`, `openai`, `cody`, `aider`, `continue`

---

## Packages

### `packages/skills-cli` — `@dev/skills`

The CLI installer. Depends on the skill packs at runtime via `npm install` into a temp dir.

**Implemented:**

`lib/editors.js` — 9 editor definitions. Each editor has:
```js
{
  id, label, description, icon,
  patchMode,    // "json" | "claude-md" | "cursor-rules" | "cody-yaml" | "aider-prompt" | "continue-json" | "copy"
  skillsKey,    // dot-path for JSON-mode editors (e.g. "cascade.skillsDirectories")
  configPaths: { win32, darwin, linux }
}
```
Exports: `getAllEditors()`, `getEditorById(id)`, `getEditorConfigPath(id)`, `detectEditor(id)`, `detectAllEditors()`, `getInstalledEditors()`

`lib/display.js` — all terminal output (chalk, boxen, figures). No `console.log` outside this module.

**Not yet implemented (required for CLI to function):**

`lib/paths.js` — `SKILLS_DIR` (~/.dev/skills/), `META_FILE` (~/.dev/.skills-meta.json), `getSkillFilePath(relPath)`

`lib/registry.js` — maps role names to skill pack IDs for runtime install:
```js
ROLE_PACKS = {
  dev:     "@dev/skills-dev",
  support: "@dev/skills-support",
  all:     ["@dev/skills-dev", "@dev/skills-support"],
}
```

`lib/installer.js` — installs a skill pack at runtime: `npm install @dev/skills-dev` into temp dir → read `index.js` manifest → copy skill files to `~/.dev/skills/<role>/` → write metadata JSON

`lib/patcher.js` — dispatches to one of 7 patch modes:

| Patch Mode | Editor | What it does |
|---|---|---|
| `json` | claude-desktop, windsurf, copilot | Write SKILLS_DIR to nested key in JSON config |
| `claude-md` | claude-code | Append skills block to `~/.claude/CLAUDE.md` |
| `cursor-rules` | cursor | Write one `.mdc` per skill to `~/.cursor/rules/dev/` |
| `cody-yaml` | cody | Write `~/.cody/context.yaml` with contextFiles array |
| `aider-prompt` | aider | Append to `~/.aider.system.prompt.md` |
| `continue-json` | continue | Patch `systemMessage` in `~/.continue/config.json` |
| `copy` | openai | Write standalone markdown for manual paste |

Patch operations must be idempotent — use `<!-- ms-skills -->` markers to detect and strip injected blocks.

---

### `packages/skills-dev` — `@dev/skills-dev`

Skill pack for developers and platform engineers (merged from former separate dev + platform packs).

**Manifest** (`index.js`):
```js
export const manifest = {
  role: "dev",
  version: "1.0.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    // file skill — single SKILL.md
    { id, name, file: "name/SKILL.md", category },
    // dir skill — directory with SKILL.md entry point + multiple guide files
    { id: "oracle-db", name: "Oracle DB Expert", dir: "oracle-db-skills", category, guideCount },
  ],
};
```

**Skills inventory:**

| ID | Category | Notes |
|----|----------|-------|
| `code-review` | Developer Activity | Agent workflow — launches parallel subagents |
| `git-workflow` | Developer Activity | Branch, commit, PR conventions |
| `unit-testing` | Developer Activity | JUnit, utPLSQL, node:test, pytest patterns |
| `security-checklist` | Developer Activity | OWASP Top 10 for platform code |
| `api-design` | Platform Development | REST + OpenAPI 3.1, GraphQL |
| `oracle-db` | Platform Development | Dir skill — 128 guides in oracle-db-skills/ |
| `oracle-exception` | Platform Development | ORA- errors, locks, deadlocks |
| `java-debugging` | Platform Development | Heap/thread dumps, GC, remote debug |
| `appserver-tuning` | Platform Development | WebLogic/Tomcat pools, JVM heap |
| `cicd-pipeline` | Platform Development | GitLab CI, build/publish/deploy |
| `schema-migration` | Platform Development | DDL zero-downtime patterns, Oracle |
| `security-patching` | Platform Development | CVE triage, dependency upgrades |

---

### `packages/skills-support` — `@dev/skills-support`

Skill pack for support engineers.

| ID | Category |
|----|----------|
| `log-analysis` | Support Activity |
| `performance-triage` | Support Activity |

---

## Skill File Format

Each skill lives in its own folder:

```
skills/<skill-id>/
└── SKILL.md          ← the skill content
```

Frontmatter: `name`, `description`, `license`. No `id`, `version`, `role`, `category` — those live in the manifest.

```markdown
---
name: skill-name
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

**Dir skill** (oracle-db only): the manifest uses `dir: "oracle-db-skills"` instead of `file:`. The dir contains `SKILL.md` as entry point plus 128 topic guides organized under `skills/<category>/`.

---

## Installed File Layout (Runtime)

After `ms-skills install`:

```
~/.dev/
├── skills/
│   ├── dev/         ← skill files copied from @dev/skills-dev
│   └── support/     ← skill files copied from @dev/skills-support
└── .skills-meta.json
```

Metadata schema:
```json
{
  "installedAt": "ISO-8601",
  "updatedAt":   "ISO-8601",
  "role":        "dev",
  "editors":     ["claude-code", "cursor"],
  "skills":      [{ "id": "code-review", "version": "1.0.0", "installedAt": "ISO-8601" }]
}
```

---

## How to Add a New Skill

1. Create `packages/skills-dev/skills/<skill-id>/SKILL.md` (or `skills-support` for support skills)
2. Add entry to `manifest.skills[]` in the pack's `index.js`
3. Run `npm test --workspace packages/skills-dev` — file existence and manifest structure are verified
4. Bump `version` in the pack's `package.json`

---

## How to Add a New Editor

1. Add editor object to `EDITORS` in `packages/skills-cli/lib/editors.js`
2. Choose `patchMode` — pick existing or implement new patch function in `lib/patcher.js`
3. Implement matching unpatch logic (marker-based removal)
4. Verify `detectEditor(id)` works on target platform

---

## Publishing

### GitLab Package Registry

Tag format: `skills-vX.Y.Z`

```bash
# Bump version in relevant package.json first
git tag skills-v1.1.0
git push --tags
# → .gitlab-ci.yml runs npm publish for each changed package
```

Consumer `~/.npmrc`:
```ini
@dev:registry=https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/
//your-gitlab.example.com/api/v4/...:_authToken=${NPM_TOKEN}
```

Then: `npx @dev/skills`

---

## Conventions

- ES modules throughout (`"type": "module"` in all packages) — no `require()`
- `async/await` for all file I/O (fs-extra)
- No `console.log` in lib — use `display.js` exports
- Skill IDs: `kebab-case`
- Editor IDs: `kebab-case`
- npm scope: `@dev/`
- Roles: `dev`, `support`, `all`

### Key Invariants

1. **Paths only through `paths.js`** — never hardcode `~/.dev` in business logic
2. **Skill content in pack `index.js` manifest** — CLI derives everything from it at runtime
3. **Patch operations are idempotent** — `<!-- ms-skills -->` markers enable safe re-run
4. **Dry-run must never write** — `dryRun` flag checked before every file write
5. **Manifest is source of truth for skills** — registry.js derives role→pack mapping, not skill content

---

## Dependencies

All runtime deps belong to `packages/skills-cli`. Skill packs have no dependencies.

| Package | Version | Used in |
|---------|---------|---------|
| `chalk` | ^5.3.0 | display.js |
| `commander` | ^11.1.0 | bin/cli.js |
| `enquirer` | ^2.4.1 | bin/cli.js — Select, MultiSelect, Confirm |
| `ora` | ^7.0.1 | bin/cli.js — spinners |
| `boxen` | ^7.1.1 | display.js — bordered boxes |
| `figures` | ^6.0.1 | display.js — Unicode symbols |
| `fs-extra` | ^11.2.0 | installer.js — async copy, ensureDir, readJson, writeJson |

Node.js `>=18.0.0` required.

---

## Gotchas

- **CLI bin imports 4 lib modules that don't exist yet** (`registry.js`, `installer.js`, `patcher.js`, `paths.js`) — CLI fails at runtime until these are implemented
- **`cursor-rules` patch mode** writes one `.mdc` file per skill — unpatch must delete those files individually, not just remove a block
- **`copy` mode (openai)** writes a file but patches no editor config — user must paste manually
- **`oracle-db` is a dir skill** — `manifest.skills` uses `dir: "oracle-db-skills"` not `file:`. Installer must handle both shapes
- **`dev-skills-cli/`**, root `cli.js`, `editors.js`, `patcher.js`, `package-lock.json` are legacy artifacts — safe to delete
