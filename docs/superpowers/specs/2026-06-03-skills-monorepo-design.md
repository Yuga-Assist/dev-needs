# Skills Monorepo Design

**Date:** 2026-06-03  
**Status:** Approved  
**Author:** rajkumar.oppilamani@Dev.com

---

## Goal

Restructure `npx-skills-cmd` into an npm workspace monorepo so each role's skills
ship as an independent, versioned npm package published to a local GitLab npm registry.
Customers install only the skills they need.

---

## Repository Structure

```
npx-skills-cmd/                          ← git root (GitLab repo)
  package.json                           ← workspace root
  .gitlab-ci.yml                         ← CI/CD: publish on tag
  .npmrc                                 ← scoped registry config
  README.md                              ← customer + maintainer docs
  packages/
    skills-cli/                          ← @dev/skills  (the CLI)
      bin/cli.js
      lib/
        registry.js                      ← ROLE_PACKS map replaces SKILLS_REGISTRY
        installer.js                     ← runtime npm install of pack
        patcher.js
        editors.js
        display.js
        paths.js
      package.json
    skills-dev/                          ← @dev/skills-dev
      skills/
        bug-triage.md
        code-review.md
        change-history-report.md
        form-data-flow.md
      index.js                           ← exports manifest
      package.json
    skills-support/                      ← @dev/skills-support
      skills/
        infolet-debug.md
        workflow-debug.md
        report-debug.md
        assignment-loss.md
        orf-analysis.md
      index.js
      package.json
    skills-platform/                     ← @dev/skills-platform
      skills/
        oracle-db/                       ← directory: 117 guides from oracle-db-skills repo
          admin/
          plsql/
          performance/
          ...
        oracle-exception.md
        bapi-sdu.md
      index.js
      package.json
```

---

## Pack Format

Each skills pack exports a manifest from `index.js`:

```js
// packages/skills-dev/index.js
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const manifest = {
  role: "dev",
  version: "1.2.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    { id: "bug-triage",             file: "bug-triage.md" },
    { id: "code-review",            file: "code-review.md" },
    { id: "change-history-report",  file: "change-history-report.md" },
    { id: "form-data-flow",         file: "form-data-flow.md" },
  ],
};
```

Each pack's `package.json`:

```json
{
  "name": "@dev/skills-dev",
  "version": "1.2.0",
  "type": "module",
  "main": "index.js",
  "files": ["skills/", "index.js"],
  "publishConfig": {
    "registry": "https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/"
  }
}
```

---

## CLI Changes

### `ROLE_PACKS` replaces hardcoded `SKILLS_REGISTRY` for install

```js
// lib/registry.js  (new section)
export const ROLE_PACKS = {
  dev:      "@dev/skills-dev",
  support:  "@dev/skills-support",
  platform: "@dev/skills-platform",
};
```

### Runtime pack install (`installer.js`)

When user picks a role, CLI:
1. Runs `npm install @dev/skills-<role>` into a temp dir
2. Resolves the installed pack's `index.js`
3. Reads manifest → copies `skills/` files to `~/.dev/skills/<role>/`
4. For directory skills (oracle-db), copies the whole directory

```js
import { execSync } from "child_process";
import { createRequire } from "module";

export async function installSkillPack(role, options = {}) {
  const packName = ROLE_PACKS[role];
  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), "ms-skills-"));

  execSync(`npm install ${packName}`, { cwd: tmpDir, stdio: "pipe" });

  const require   = createRequire(import.meta.url);
  const packEntry = path.join(tmpDir, "node_modules", packName, "index.js");
  const { manifest } = await import(packEntry);

  for (const skill of manifest.skills) {
    const src  = path.join(manifest.skillsDir, skill.file || skill.id);
    const dest = getSkillFilePath(role, skill.file || skill.id);
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest, { overwrite: true });
  }

  await fs.remove(tmpDir);
}
```

---

## oracle-db Multi-File Handling

`oracle-db` is a directory of 117 guide files. The installer copies the whole directory:

```
~/.dev/skills/platform/oracle-db/   ← copied from pack
```

The CLAUDE.md patcher registers the directory:

```markdown
### Oracle DB Expert
- **Role:** platform  **Version:** 2.0.0
- 117 Oracle guides: SQL, PL/SQL, performance, ORDS, migrations, security.
- **Triggers:** oracle, SQL, PL/SQL, query, database, index, execution plan
- **SkillsDir:** `~/.dev/skills/platform/oracle-db/`
```

For Claude Desktop / Windsurf (`skillsDirectories` json mode), pointing at
`~/.dev/skills/` covers all subdirectories automatically.

---

## GitLab CI/CD Publishing

Single `.gitlab-ci.yml` at repo root, triggered by version tags:

```yaml
stages:
  - publish

publish:
  stage: publish
  image: node:20
  script:
    - PKG=${CI_COMMIT_TAG%@*}
    - cd packages/$PKG
    - npm ci
    - |
      npm config set \
        //your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/:_authToken \
        ${CI_JOB_TOKEN}
    - npm publish
  rules:
    - if: $CI_COMMIT_TAG =~ /^skills-/
```

Tag format: `skills-dev@1.3.0`, `skills-platform@2.1.0`, `skills-cli@1.2.0`

---

## Migration Steps

1. Create workspace `package.json` at repo root
2. Move `dev-skills-cli/` → `packages/skills-cli/`
3. Create `packages/skills-dev/`, `skills-support/`, `skills-platform/` with `index.js` + `package.json`
4. Copy real `.md` files from source repos into each pack's `skills/` dir:
   - oracle-db guides: from `C:\D\github-tools\oracle-db-skills\skills\`
   - form-data-flow: from `C:\D\github-tools\forms-skills\`
   - other dev/support skills: author from scratch or extract from existing docs
5. Update `installer.js` to use runtime pack install
6. Update `patcher.js` for directory-based oracle-db skill
7. Add `.gitlab-ci.yml`
8. Add `.npmrc` with GitLab registry scope
9. Commit everything to GitLab

---

## Workspace Root `package.json`

```json
{
  "name": "dev-skills-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test":  "npm test --workspaces --if-present"
  }
}
```
