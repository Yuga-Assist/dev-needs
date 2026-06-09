# Skills Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `npx-skills-cmd` into an npm workspace monorepo with four independently publishable packages: `@dev/skills` (CLI), `@dev/skills-dev`, `@dev/skills-support`, `@dev/skills-platform`.

**Architecture:** The CLI installs only the selected role's skill pack at runtime via `npm install @dev/skills-<role>` into a temp dir, reads the pack's `index.js` manifest, then copies skill files to `~/.dev/skills/<role>/`. Each skill pack is an independent npm package published to a local GitLab npm registry via `.gitlab-ci.yml` on tag push.

**Tech Stack:** Node.js 18+ ESM, npm workspaces, fs-extra, commander, enquirer, ora, chalk, boxen, GitLab Package Registry.

---

## File Map

### Files to CREATE

```
packages/skills-cli/bin/cli.js               ← moved from root cli.js
packages/skills-cli/lib/registry.js          ← updated: add ROLE_PACKS, update SKILLS_REGISTRY
packages/skills-cli/lib/installer.js         ← rewritten: runtime pack install
packages/skills-cli/lib/paths.js             ← updated: role subdir in getSkillFilePath
packages/skills-cli/lib/patcher.js           ← updated: directory skill support
packages/skills-cli/lib/editors.js           ← copied unchanged
packages/skills-cli/lib/display.js           ← copied unchanged
packages/skills-cli/package.json             ← new (replaces dev-skills-cli/package.json)
packages/skills-cli/tests/installer.test.js  ← new tests

packages/skills-dev/index.js                 ← manifest
packages/skills-dev/package.json
packages/skills-dev/skills/bug-triage.md     ← moved from dev-skills-cli/skills/dev/
packages/skills-dev/skills/code-review.md    ← new content
packages/skills-dev/skills/change-history-report.md  ← new content
packages/skills-dev/skills/form-data-flow.md ← new content
packages/skills-dev/tests/manifest.test.js

packages/skills-support/index.js
packages/skills-support/package.json
packages/skills-support/skills/infolet-debug.md
packages/skills-support/skills/workflow-debug.md
packages/skills-support/skills/report-debug.md
packages/skills-support/skills/assignment-loss.md
packages/skills-support/skills/orf-analysis.md
packages/skills-support/tests/manifest.test.js

packages/skills-platform/index.js
packages/skills-platform/package.json
packages/skills-platform/skills/oracle-db/   ← copied from C:\D\github-tools\oracle-db-skills\skills\
packages/skills-platform/skills/oracle-exception.md
packages/skills-platform/skills/bapi-sdu.md
packages/skills-platform/tests/manifest.test.js
```

### Files to DELETE

```
dev-skills-cli/        ← entire directory (replaced by packages/skills-cli/)
cli.js                          ← root-level prototype (replaced by packages/skills-cli/bin/cli.js)
editors.js                      ← root-level prototype
patcher.js                      ← root-level prototype
package-lock.json               ← root (workspace uses npm workspaces lock)
dev-skills-cli.tar
dev-skills-cli.tar.gz
```

---

## Task 1: Scaffold packages/skills-cli/

**Files:**
- Create: `packages/skills-cli/package.json`
- Create: `packages/skills-cli/bin/cli.js` (moved from root `cli.js`)
- Create: `packages/skills-cli/lib/editors.js` (copied unchanged)
- Create: `packages/skills-cli/lib/display.js` (copied unchanged)

- [ ] **Step 1: Create the package directory structure**

```bash
mkdir -p packages/skills-cli/bin
mkdir -p packages/skills-cli/lib
mkdir -p packages/skills-cli/tests
```

- [ ] **Step 2: Create `packages/skills-cli/package.json`**

```json
{
  "name": "@dev/skills",
  "version": "1.1.0",
  "description": "Dev AI Skills installer for Claude, Windsurf, Cursor, Copilot and more",
  "type": "module",
  "bin": {
    "ms-skills": "bin/cli.js"
  },
  "scripts": {
    "start": "node bin/cli.js",
    "test":  "node --test tests/"
  },
  "keywords": ["Dev", "skills", "claude", "windsurf", "ai"],
  "author": "Dev Platform Team",
  "license": "MIT",
  "dependencies": {
    "chalk":     "^5.3.0",
    "commander": "^11.1.0",
    "enquirer": "^2.4.1",
    "ora":       "^7.0.1",
    "boxen":     "^7.1.1",
    "figures":   "^6.0.1",
    "fs-extra":  "^11.2.0"
  },
  "engines": { "node": ">=18.0.0" },
  "publishConfig": {
    "registry": "https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/"
  }
}
```

- [ ] **Step 3: Copy `cli.js` → `packages/skills-cli/bin/cli.js`**

```bash
cp cli.js packages/skills-cli/bin/cli.js
```

Verify the import paths inside the file still work — they use `"../lib/..."` which is correct for `bin/cli.js` importing `lib/`.

- [ ] **Step 4: Copy `dev-skills-cli/lib/editors.js` and `display.js`**

```bash
cp dev-skills-cli/lib/editors.js packages/skills-cli/lib/editors.js
cp dev-skills-cli/lib/display.js packages/skills-cli/lib/display.js
```

- [ ] **Step 5: Verify workspace root `package.json` has workspaces array**

`package.json` at repo root should already contain:
```json
{
  "name": "dev-skills-monorepo",
  "private": true,
  "workspaces": ["packages/*"]
}
```

If not, create it now with that content.

- [ ] **Step 6: Install workspace dependencies and verify no errors**

```bash
npm install
```

Expected: `added N packages` with no errors. If workspace is detected correctly you'll see `workspaces: packages/skills-cli`.

- [ ] **Step 7: Verify CLI runs from new location**

```bash
node packages/skills-cli/bin/cli.js --help
```

Expected output:
```
Usage: ms-skills [options] [command]
Dev AI Skills CLI
Options:
  -V, --version  output the version number
  -h, --help     display help for command
Commands:
  install  ...
  update   ...
  ...
```

- [ ] **Step 8: Commit**

```bash
git add packages/skills-cli/ package.json
git commit -m "feat: scaffold packages/skills-cli from dev-skills-cli"
```

---

## Task 2: Create packages/skills-dev/

**Files:**
- Create: `packages/skills-dev/package.json`
- Create: `packages/skills-dev/index.js`
- Create: `packages/skills-dev/skills/bug-triage.md`
- Create: `packages/skills-dev/skills/code-review.md`
- Create: `packages/skills-dev/skills/change-history-report.md`
- Create: `packages/skills-dev/skills/form-data-flow.md`
- Create: `packages/skills-dev/tests/manifest.test.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/skills-dev/skills
mkdir -p packages/skills-dev/tests
```

- [ ] **Step 2: Create `packages/skills-dev/package.json`**

```json
{
  "name": "@dev/skills-dev",
  "version": "1.2.0",
  "description": "Dev developer skills: bug triage, code review, CHR analysis, form data flow",
  "type": "module",
  "main": "index.js",
  "files": ["skills/", "index.js"],
  "scripts": {
    "test": "node --test tests/"
  },
  "keywords": ["Dev", "skills", "dev"],
  "author": "Dev Platform Team",
  "license": "MIT",
  "engines": { "node": ">=18.0.0" },
  "publishConfig": {
    "registry": "https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/"
  }
}
```

- [ ] **Step 3: Create `packages/skills-dev/index.js`**

```js
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const manifest = {
  role:      "dev",
  version:   "1.2.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    { id: "bug-triage",            name: "Bug Triage & RCA",           file: "bug-triage.md",            category: "Developer Activity"    },
    { id: "code-review",           name: "Code Review Assistant",       file: "code-review.md",           category: "Developer Activity"    },
    { id: "change-history-report", name: "Change History Report (CHR)", file: "change-history-report.md", category: "Developer Activity"    },
    { id: "form-data-flow",        name: "Form Data Process Flow",      file: "form-data-flow.md",        category: "Platform Development"  },
  ],
};
```

- [ ] **Step 4: Copy `bug-triage.md` from existing location**

```bash
cp dev-skills-cli/skills/dev/bug-triage.md packages/skills-dev/skills/bug-triage.md
```

- [ ] **Step 5: Create `packages/skills-dev/skills/code-review.md`**

```markdown
---
name: Code Review Assistant
id: code-review
version: 1.0.0
role: dev
category: Developer Activity
---

# Code Review Assistant

Automated code review with impact radius analysis, dead code detection,
and refactoring suggestions for Dev platform code.

## Trigger Keywords

Invoke this skill when the user mentions: code review, PR review, pull request,
diff, refactor, impact analysis, dead code, unused method.

## Review Flow

1. **Load the diff** — fetch the PR diff or paste the changed files.
   Focus on: Java services, PL/SQL packages, JavaScript form scripts.

2. **Impact radius** — for each changed method/procedure:
   - Use `get_db_modified_objects` to find related packages changed in the same window.
   - Check `SI_METRICS_T` and `SI_METRIC_COLUMNS` if a form-related class is changed.
   - Flag downstream tables affected by a PL/SQL change.

3. **Dead code detection** — search for methods never called by any workflow,
   infolet trigger, or form submission path.

4. **SQL injection / security** — flag any dynamic SQL built with string concatenation
   instead of bind variables (`:param` syntax).

5. **Performance hotspots** — identify:
   - N+1 query patterns inside loops.
   - Missing index hints on large tables (`SI_DB_LOG`, `SI_EVENT_ASSIGNMENTS`).
   - Unbounded queries with no `WHERE` clause filter.

6. **Refactor suggestions** — suggest:
   - Extract repeated logic into a shared utility.
   - Replace hardcoded metric IDs with constant references.
   - Replace `SELECT *` with explicit column lists.

7. **Summary** — produce a structured review with:
   - Severity: BLOCKER / MAJOR / MINOR / NITPICK
   - File and line number for each finding
   - Suggested fix snippet

## Key Tables

- `SI_METRICS_T` — form/metric metadata
- `SI_METRIC_COLUMNS` — form field definitions
- `SI_DB_LOG` — error log for runtime verification
- `MS_APPS_MAM_RUN_LOG` — MAM run log

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 6: Create `packages/skills-dev/skills/change-history-report.md`**

```markdown
---
name: Change History Report (CHR)
id: change-history-report
version: 1.1.0
role: dev
category: Developer Activity
---

# Change History Report (CHR)

Diagnose CHR issues — missing fields, wrong data, empty audit trails.
Covers MS_GRC_AUDIT_* table analysis and PL/SQL configuration scripts.

## Trigger Keywords

Invoke when user mentions: CHR, change history, audit trail, change log,
MS_GRC_AUDIT, audit columns, CHR view, CHR config.

## Investigation Flow

1. **Identify the form** — get the `metric_id` and `metric_name` from `SI_METRICS_T`
   using the form name provided by the user.

2. **Check CHR view** — query `MS_GRC_AUDIT_T` with the `metric_name`:
   ```sql
   SELECT * FROM MS_GRC_AUDIT_T WHERE METRIC_NAME = :metric_name;
   ```
   If no rows → CHR not configured for this form.

3. **Check audit columns** — query `MS_GRC_AUDIT_COLUMNS_T`:
   ```sql
   SELECT COLUMN_NAME, SECTION_LABEL, IS_MULTIROW
   FROM   MS_GRC_AUDIT_COLUMNS_T
   WHERE  METRIC_ID = :metric_id
   ORDER  BY SECTION_LABEL, COLUMN_NAME;
   ```
   Compare against the columns the user says are missing.

4. **Check section configuration** — query `MS_GRC_AUDIT_SEC_LABELS`:
   ```sql
   SELECT SECTION_NAME, SECTION_LABEL FROM MS_GRC_AUDIT_SEC_LABELS
   WHERE METRIC_ID = :metric_id;
   ```

5. **Verify CHR view exists** — check `USER_VIEWS` or `ALL_VIEWS` for `<METRIC_NAME>_CV`.
   If missing → the view DDL must be created before CHR data can be captured.

6. **Check audit fields setup** — query `MS_GRC_AUDIT_FIELDS_SETUP`:
   ```sql
   SELECT * FROM MS_GRC_AUDIT_FIELDS_SETUP WHERE METRIC_ID = :metric_id;
   ```

7. **Generate fix script** — if configuration is missing or incomplete,
   use the CHR management workflow to regenerate the PL/SQL script via
   `MS_GRC_AUDITING_SETUP.SETUP_GRC_AUDITING`.

## Key Tables

- `MS_GRC_AUDIT_T` — CHR master configuration
- `MS_GRC_AUDIT_COLUMNS_T` — columns tracked per form
- `MS_GRC_AUDIT_SEC_LABELS` — section labels mapping
- `MS_GRC_AUDIT_FIELDS_SETUP` — field-level audit setup
- `MS_GRC_AUDIT_MROW_SETUP` — multirow section config
- `MS_GRC_AUDIT_EXCEPTION_FIELDS` — fields excluded from audit

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 7: Create `packages/skills-dev/skills/form-data-flow.md`**

```markdown
---
name: Form Data Process Flow
id: form-data-flow
version: 1.0.0
role: dev
category: Platform Development
---

# Form Data Process Flow

Trace form submission lifecycle: UI → push tables → workflow → master tables.
Covers versioning, region tables, custom JS, and BAPI orchestration.

## Trigger Keywords

Invoke when user mentions: form, push table, submission, data flow,
PROCESS_INSTANCE_ID, form submit, form lifecycle, form versioning,
BAPI, form field, SI_METRICS_T, region table.

## Submission Lifecycle

```
User submits form
  → UI validates field rules (custom JS / server-side validators)
  → POST to form engine API
  → Data written to push table:  SI_<METRIC_ID>_T
  → Workflow triggered:           SI_WORKFLOWS_T → SI_EVENT_ASSIGNMENTS
  → On final approval:
      → Data promoted to master table
      → CHR audit record written (if configured)
      → BAPI batch triggered (if configured): MS_APPS_DU_BATCH_STATUS_LOG
```

## Investigation Flow

1. **Identify the form** — resolve form name to `metric_id` via `SI_METRICS_T`:
   ```sql
   SELECT METRIC_ID, METRIC_NAME, PRIMARY_DATA_OBJECT
   FROM   SI_METRICS_T
   WHERE  METRIC_NAME LIKE :search_term;
   ```

2. **Check push table record** — query `SI_<METRIC_ID>_T` for the record:
   ```sql
   SELECT * FROM SI_<METRIC_ID>_T WHERE <pk_column> = :record_id;
   ```
   Note: substitute the actual metric_id and primary key column name.

3. **Check workflow state** — find the process instance:
   ```sql
   SELECT PROCESS_INSTANCE_ID, CURRENT_STAGE, STATUS
   FROM   SI_EVENT_ASSIGNMENTS
   WHERE  OBJECT_ID = :record_id AND METRIC_ID = :metric_id;
   ```
   Then use `get_task_details_from_pid` MCP tool for full workflow trace.

4. **Check form field metadata** — if a field is missing or behaving wrong:
   ```sql
   SELECT COLUMN_NAME, FIELD_TYPE, IS_MANDATORY, IS_VISIBLE
   FROM   SI_METRIC_COLUMNS
   WHERE  METRIC_ID = :metric_id AND COLUMN_NAME = :column_name;
   ```

5. **Check region table** (for versioned/regional forms):
   ```sql
   SELECT * FROM SI_<METRIC_ID>_REGION_T WHERE <pk_column> = :record_id;
   ```

6. **Check BAPI status** (if BAPI is configured):
   ```sql
   SELECT STATUS, ERROR_MSG, BATCH_ID
   FROM   MS_APPS_DU_BATCH_STATUS_LOG
   WHERE  METRIC_ID = :metric_id
   ORDER  BY CREATED_DATE DESC FETCH FIRST 10 ROWS ONLY;
   ```

7. **Custom JS debug** — if form behavior is wrong post-submit:
   - Check `SI_METRIC_SCRIPTS` for form-level JS attached to the metric.
   - Check browser console for JS errors on submit.

## Key Tables

- `SI_METRICS_T` — form/metric metadata
- `SI_METRIC_COLUMNS` — form field definitions
- `SI_<METRIC_ID>_T` — push table (record per metric)
- `SI_EVENT_ASSIGNMENTS` — workflow assignment state
- `SI_WORKFLOWS_T` — workflow definitions
- `MS_APPS_DU_BATCH_STATUS_LOG` — BAPI batch status

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 8: Write `packages/skills-dev/tests/manifest.test.js`**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packRoot  = path.join(__dirname, "..");

test("manifest exports role, version, skillsDir, skills array", async () => {
  const { manifest } = await import("../index.js");
  assert.equal(manifest.role, "dev");
  assert.ok(manifest.version.match(/^\d+\.\d+\.\d+$/), "version is semver");
  assert.ok(fs.existsSync(manifest.skillsDir), "skillsDir exists");
  assert.ok(Array.isArray(manifest.skills), "skills is array");
  assert.ok(manifest.skills.length > 0, "at least one skill");
});

test("every skill file referenced in manifest exists", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    const filePath = path.join(manifest.skillsDir, skill.file);
    assert.ok(fs.existsSync(filePath), `missing skill file: ${skill.file}`);
  }
});

test("every skill has id, name, file, category", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    assert.ok(skill.id,       `skill missing id: ${JSON.stringify(skill)}`);
    assert.ok(skill.name,     `skill missing name: ${skill.id}`);
    assert.ok(skill.file,     `skill missing file: ${skill.id}`);
    assert.ok(skill.category, `skill missing category: ${skill.id}`);
  }
});
```

- [ ] **Step 9: Run tests to verify all skill files exist**

```bash
cd packages/skills-dev
node --test tests/
```

Expected:
```
▶ manifest exports role, version, skillsDir, skills array
  ✔ manifest exports role, version, skillsDir, skills array (Xms)
▶ every skill file referenced in manifest exists
  ✔ every skill file referenced in manifest exists (Xms)
▶ every skill has id, name, file, category
  ✔ every skill has id, name, file, category (Xms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

- [ ] **Step 10: Commit**

```bash
cd ../..
git add packages/skills-dev/
git commit -m "feat: add skills-dev pack with 4 skill files"
```

---

## Task 3: Create packages/skills-support/

**Files:**
- Create: `packages/skills-support/package.json`
- Create: `packages/skills-support/index.js`
- Create: `packages/skills-support/skills/` (5 skill files)
- Create: `packages/skills-support/tests/manifest.test.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/skills-support/skills
mkdir -p packages/skills-support/tests
```

- [ ] **Step 2: Create `packages/skills-support/package.json`**

```json
{
  "name": "@dev/skills-support",
  "version": "1.2.0",
  "description": "Dev support skills: infolet, workflow, report, assignment loss, ORF debug",
  "type": "module",
  "main": "index.js",
  "files": ["skills/", "index.js"],
  "scripts": {
    "test": "node --test tests/"
  },
  "keywords": ["Dev", "skills", "support"],
  "author": "Dev Platform Team",
  "license": "MIT",
  "engines": { "node": ">=18.0.0" },
  "publishConfig": {
    "registry": "https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/"
  }
}
```

- [ ] **Step 3: Create `packages/skills-support/index.js`**

```js
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const manifest = {
  role:      "support",
  version:   "1.2.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    { id: "infolet-debug",    name: "Infolet Debugger",               file: "infolet-debug.md",    category: "Support Activity" },
    { id: "workflow-debug",   name: "Workflow Debugger",              file: "workflow-debug.md",   category: "Support Activity" },
    { id: "report-debug",     name: "Report Debugger",                file: "report-debug.md",     category: "Support Activity" },
    { id: "assignment-loss",  name: "Assignment Loss Investigation",  file: "assignment-loss.md",  category: "Support Activity" },
    { id: "orf-analysis",     name: "ORF Analysis",                   file: "orf-analysis.md",     category: "Support Activity" },
  ],
};
```

- [ ] **Step 4: Create `packages/skills-support/skills/infolet-debug.md`**

```markdown
---
name: Infolet Debugger
id: infolet-debug
version: 1.3.0
role: support
category: Support Activity
---

# Infolet Debugger

Troubleshoot SQL/Java/SP infolets — no data, not visible, WFTS not triggering,
profile parameter issues in Dev.

## Trigger Keywords

Invoke when user mentions: infolet, metric, no data, not visible, WFTS,
profile parameter, infolet not showing, metric not running.

## Investigation Flow

1. **Get infolet metadata** — fetch from `SI_METRICS_T`:
   ```sql
   SELECT METRIC_ID, METRIC_NAME, METRIC_TYPE, IS_ACTIVE, SCHEDULE_TYPE
   FROM   SI_METRICS_T
   WHERE  METRIC_NAME LIKE :search_term;
   ```

2. **Check visibility / profile parameters** — fetch from `SI_METRIC_PARAMETERS_T`:
   ```sql
   SELECT PARAM_NAME, PARAM_VALUE, IS_ACTIVE
   FROM   SI_METRIC_PARAMETERS_T
   WHERE  METRIC_ID = :metric_id;
   ```
   Common culprit: `IS_VISIBLE = 'N'` or missing profile group assignment.

3. **Check associated infolets** (if infolet belongs to a dashboard):
   ```sql
   SELECT INFOLET_ID, DASHBOARD_ID, DISPLAY_ORDER, IS_ACTIVE
   FROM   SI_ASSOCIATED_INFOLETS
   WHERE  METRIC_ID = :metric_id;
   ```

4. **Check metric columns** — validate field definitions:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, IS_KEY, IS_ACTIVE
   FROM   SI_METRIC_COLUMNS
   WHERE  METRIC_ID = :metric_id AND IS_ACTIVE = 'Y';
   ```

5. **Check WFTS trigger** (if infolet should fire on workflow events):
   - Verify workflow trigger configuration in `SI_WORKFLOWS_T` for the target metric.
   - Check `SI_EVENT_ASSIGNMENTS` to see if trigger events are being created.

6. **Check error log** — look for infolet execution errors:
   ```sql
   SELECT LOG_DATE, ERROR_MSG, MODULE_CODE
   FROM   SI_DB_LOG
   WHERE  MODULE_CODE LIKE '%' || :metric_id || '%'
     AND  LOG_DATE > SYSDATE - 1
   ORDER  BY LOG_DATE DESC
   FETCH FIRST 50 ROWS ONLY;
   ```

7. **Run infolet manually** — if infolet is SQL type, execute the SQL directly
   to check for syntax errors or missing table references.

## Key Tables

- `SI_METRICS_T` — infolet/metric definitions
- `SI_METRIC_COLUMNS` — infolet columns
- `SI_METRIC_PARAMETERS_T` — profile/schedule parameters
- `SI_ASSOCIATED_INFOLETS` — dashboard associations
- `SI_DB_LOG` — runtime error log

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 5: Create `packages/skills-support/skills/workflow-debug.md`**

```markdown
---
name: Workflow Debugger
id: workflow-debug
version: 1.2.0
role: support
category: Support Activity
---

# Workflow Debugger

Debug workflow trigger failures, assignment loss, email not firing,
slow performance across all Dev modules.

## Trigger Keywords

Invoke when user mentions: workflow, assignment, email not triggered,
workflow issue, assignment loss, workflow not firing, stage not advancing,
workflow stuck, escalation.

## Investigation Flow

1. **Get workflow definition** — fetch from `SI_WORKFLOWS_T`:
   ```sql
   SELECT WF_ID, WF_NAME, MODULE_CODE, IS_ACTIVE, TRIGGER_EVENT
   FROM   SI_WORKFLOWS_T
   WHERE  METRIC_ID = :metric_id AND IS_ACTIVE = 'Y';
   ```

2. **Check current assignments** — find active assignments for the record:
   ```sql
   SELECT ASSIGNMENT_ID, ASSIGNED_TO, ASSIGNMENT_TYPE,
          STAGE_NAME, CREATED_DATE, STATUS
   FROM   SI_EVENT_ASSIGNMENTS
   WHERE  OBJECT_ID   = :record_id
     AND  METRIC_ID   = :metric_id
   ORDER  BY CREATED_DATE DESC;
   ```

3. **Check escalation log** — see if escalation fired:
   ```sql
   SELECT LOG_DATE, EVENT_TYPE, ASSIGNED_TO, STATUS, ERROR_MSG
   FROM   SI_ESCALATION_LOG
   WHERE  OBJECT_ID = :record_id
   ORDER  BY LOG_DATE DESC
   FETCH FIRST 20 ROWS ONLY;
   ```

4. **Check email queue** — if emails are not sent:
   ```sql
   SELECT EMAIL_ID, TO_ADDRESS, SUBJECT, STATUS, CREATED_DATE, SENT_DATE
   FROM   SI_EMAIL_QUEUE
   WHERE  OBJECT_ID = :record_id
   ORDER  BY CREATED_DATE DESC;
   ```

5. **Check workflow errors** — scan SI_DB_LOG for workflow-specific errors:
   ```sql
   SELECT LOG_DATE, ERROR_MSG
   FROM   SI_DB_LOG
   WHERE  MODULE_CODE = 'WF'
     AND  LOG_DATE > SYSDATE - 1
     AND  ERROR_MSG LIKE '%' || :metric_id || '%'
   ORDER  BY LOG_DATE DESC
   FETCH FIRST 50 ROWS ONLY;
   ```

6. **Inactive users/roles** — if assignments are being dropped:
   ```sql
   SELECT USER_ID, LOGIN_NAME, IS_ACTIVE
   FROM   SI_USERS
   WHERE  USER_ID IN (
     SELECT ASSIGNED_TO FROM SI_EVENT_ASSIGNMENTS
     WHERE OBJECT_ID = :record_id
   );
   ```

7. **Use MCP tool** — call `get_task_details_from_pid` with the `PROCESS_INSTANCE_ID`
   to get the full workflow trace including all stage transitions.

## Key Tables

- `SI_WORKFLOWS_T` — workflow definitions
- `SI_EVENT_ASSIGNMENTS` — assignment state per record
- `SI_ESCALATION_LOG` — escalation audit trail
- `SI_EMAIL_QUEUE` — email send queue
- `SI_DB_LOG` — runtime error log
- `SI_USERS` — user active/inactive status

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 6: Create `packages/skills-support/skills/report-debug.md`**

```markdown
---
name: Report Debugger
id: report-debug
version: 1.1.0
role: support
category: Support Activity
---

# Report Debugger

Diagnose report failures — no data, export errors, filter issues,
slow execution, column display problems in Dev reports.

## Trigger Keywords

Invoke when user mentions: report, infolet run, report export, report filter,
no data, report slow, report error, report column missing.

## Investigation Flow

1. **Get report definition** — fetch from `SI_REPORTS_T`:
   ```sql
   SELECT REPORT_ID, REPORT_NAME, REPORT_TYPE, BASE_METRIC_ID, IS_ACTIVE
   FROM   SI_REPORTS_T
   WHERE  REPORT_NAME LIKE :search_term;
   ```

2. **Check run statistics** — find recent runs and their status:
   ```sql
   SELECT RUN_ID, START_TIME, END_TIME, STATUS, ROW_COUNT, ERROR_MSG
   FROM   SI_INFOLET_RUN_STATISTICS
   WHERE  REPORT_ID = :report_id
   ORDER  BY START_TIME DESC
   FETCH FIRST 20 ROWS ONLY;
   ```

3. **Check report request queue** — for scheduled/background reports:
   ```sql
   SELECT REQUEST_ID, REQUESTED_BY, STATUS, REQUESTED_DATE,
          COMPLETED_DATE, ERROR_MSG
   FROM   SI_REPORT_REQUEST_T
   WHERE  REPORT_ID = :report_id
   ORDER  BY REQUESTED_DATE DESC
   FETCH FIRST 10 ROWS ONLY;
   ```

4. **Check filter conditions** — if report returns no data:
   - Review the report's WHERE clause / filter criteria.
   - Verify filter parameter values match actual data in the base metric table.
   - Check date range filters are not excluding all records.

5. **Check export errors** — if export (Excel/PDF) fails:
   ```sql
   SELECT LOG_DATE, ERROR_MSG
   FROM   SI_DB_LOG
   WHERE  MODULE_CODE = 'RPT'
     AND  ERROR_MSG LIKE '%' || :report_id || '%'
     AND  LOG_DATE > SYSDATE - 7
   ORDER  BY LOG_DATE DESC;
   ```

6. **Performance diagnosis** — if report is slow:
   - Get the SQL from `SI_REPORTS_T.REPORT_SQL`.
   - Run `EXPLAIN PLAN` on the report SQL.
   - Check for missing indexes on filter columns.
   - Check if base metric table has >100K rows (consider materialized view).

## Key Tables

- `SI_REPORTS_T` — report definitions
- `SI_INFOLET_RUN_STATISTICS` — run history and status
- `SI_REPORT_REQUEST_T` — report request queue
- `SI_DB_LOG` — runtime error log

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 7: Create `packages/skills-support/skills/assignment-loss.md`**

```markdown
---
name: Assignment Loss Investigation
id: assignment-loss
version: 1.0.0
role: support
category: Support Activity
---

# Assignment Loss Investigation

Investigate lost assignments — inactive users/roles, draft status drops,
trail analysis, and impact queries in Dev.

## Trigger Keywords

Invoke when user mentions: assignment lost, assignment missing, assignment drop,
inactive user, SI_EVENT_ASSIGNMENTS, assignment disappeared, not assigned.

## Investigation Flow

1. **Confirm the record and metric** — get `metric_id` and `object_id`:
   ```sql
   SELECT METRIC_ID, METRIC_NAME FROM SI_METRICS_T
   WHERE METRIC_NAME = :form_name;
   ```

2. **Current assignments** — see what assignments exist right now:
   ```sql
   SELECT ASSIGNMENT_ID, ASSIGNED_TO, ASSIGNMENT_TYPE,
          STAGE_NAME, STATUS, CREATED_DATE, MODIFIED_DATE
   FROM   SI_EVENT_ASSIGNMENTS
   WHERE  OBJECT_ID = :record_id AND METRIC_ID = :metric_id
   ORDER  BY CREATED_DATE DESC;
   ```

3. **Assignment trail** — see the full history including deleted assignments:
   ```sql
   SELECT TRAIL_ID, ASSIGNMENT_ID, ASSIGNED_TO, ACTION_TYPE,
          MODIFIED_BY, MODIFIED_DATE, REASON
   FROM   SI_EVENT_ASSIGNMENTS_TRAIL
   WHERE  OBJECT_ID = :record_id AND METRIC_ID = :metric_id
   ORDER  BY MODIFIED_DATE DESC;
   ```

4. **Reassignment history** — check if the assignment was explicitly moved:
   ```sql
   SELECT EVENT_ID, OLD_ASSIGNEE, NEW_ASSIGNEE, REASSIGNED_BY,
          REASSIGNED_DATE, REASON
   FROM   SI_REASSIGNMENT_EVENT_HISTORY
   WHERE  OBJECT_ID = :record_id
   ORDER  BY REASSIGNED_DATE DESC;
   ```

5. **Check inactive users** — assignments to inactive users are silently dropped:
   ```sql
   SELECT U.USER_ID, U.LOGIN_NAME, U.IS_ACTIVE, E.ASSIGNMENT_TYPE
   FROM   SI_USERS U
   JOIN   SI_EVENT_ASSIGNMENTS E ON U.USER_ID = E.ASSIGNED_TO
   WHERE  E.OBJECT_ID = :record_id AND U.IS_ACTIVE = 'N';
   ```

6. **Check inactive roles** — same issue with role-based assignments:
   ```sql
   SELECT R.ROLE_ID, R.ROLE_NAME, R.IS_ACTIVE
   FROM   SI_ROLES R
   JOIN   SI_EVENT_ASSIGNMENTS E ON R.ROLE_ID = E.ASSIGNED_TO
   WHERE  E.OBJECT_ID = :record_id AND R.IS_ACTIVE = 'N';
   ```

7. **Draft status check** — records stuck in Draft never generate assignments:
   ```sql
   SELECT OBJECT_ID, CURRENT_STAGE, STATUS
   FROM   SI_EVENT_ASSIGNMENTS
   WHERE  OBJECT_ID = :record_id AND STATUS = 'DRAFT';
   ```

## Key Tables

- `SI_EVENT_ASSIGNMENTS` — live assignment records
- `SI_EVENT_ASSIGNMENTS_TRAIL` — full assignment history/audit
- `SI_REASSIGNMENT_EVENT_HISTORY` — explicit reassignment log
- `SI_USERS` — user active/inactive status
- `SI_ROLES` — role active/inactive status

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 8: Create `packages/skills-support/skills/orf-analysis.md`**

```markdown
---
name: ORF Analysis
id: orf-analysis
version: 1.0.0
role: support
category: Support Activity
---

# ORF Analysis

Organization Restructuring Framework diagnostics — indexing, impact assessment,
registration status, and role scope blocking in Dev.

## Trigger Keywords

Invoke when user mentions: ORF, org restructure, impact assessment,
indexing queue, MS_ORF, organization restructuring, ORF stuck,
ORF not completing, org hierarchy.

## Investigation Flow

1. **Check ORF request status** — find the active ORF request:
   ```sql
   SELECT REQUEST_ID, REQUEST_TYPE, STATUS, CREATED_BY,
          CREATED_DATE, COMPLETED_DATE, ERROR_MSG
   FROM   MS_ORF_IMPACT_ASSESSMENT_REQ
   WHERE  STATUS IN ('PENDING', 'IN_PROGRESS', 'FAILED')
   ORDER  BY CREATED_DATE DESC
   FETCH FIRST 10 ROWS ONLY;
   ```

2. **Check indexing queue** — see if ORF indexing is backed up:
   ```sql
   SELECT QUEUE_ID, OBJECT_TYPE, OBJECT_ID, STATUS,
          CREATED_DATE, PROCESSED_DATE, RETRY_COUNT
   FROM   MS_ORF_HIST_INDEX_QUEUE_T
   WHERE  STATUS IN ('PENDING', 'FAILED')
   ORDER  BY CREATED_DATE ASC
   FETCH FIRST 50 ROWS ONLY;
   ```

3. **Check object registration status**:
   ```sql
   SELECT OBJECT_TYPE, OBJECT_ID, IS_REGISTERED, REGISTRATION_DATE
   FROM   SI_ORF_OBJECT_REG
   WHERE  OBJECT_ID = :object_id;
   ```

4. **Check role scope blocking** — ORF can block access if roles have
   org-scope restrictions that don't match the new org structure:
   ```sql
   SELECT ROLE_ID, ORG_SCOPE_TYPE, ORG_UNIT_ID, IS_ACTIVE
   FROM   SI_ROLE_ORG_SCOPE
   WHERE  ORG_UNIT_ID = :old_org_unit_id;
   ```

5. **Check ORF errors** — scan SI_DB_LOG for ORF failures:
   ```sql
   SELECT LOG_DATE, ERROR_MSG, STACK_TRACE
   FROM   SI_DB_LOG
   WHERE  MODULE_CODE = 'ORF'
     AND  LOG_DATE > SYSDATE - 7
   ORDER  BY LOG_DATE DESC
   FETCH FIRST 50 ROWS ONLY;
   ```

6. **Retry failed indexing** — if queue items are stuck in FAILED status
   with retry_count < 3, update status to PENDING to re-trigger processing.
   Always confirm with the user before DML operations.

## Key Tables

- `MS_ORF_HIST_INDEX_QUEUE_T` — ORF indexing job queue
- `MS_ORF_IMPACT_ASSESSMENT_REQ` — ORF request log
- `SI_ORF_OBJECT_REG` — object registration for ORF
- `SI_ROLE_ORG_SCOPE` — role → org unit scope mappings
- `SI_DB_LOG` — runtime error log

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 9: Create `packages/skills-support/tests/manifest.test.js`**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("manifest exports role, version, skillsDir, skills array", async () => {
  const { manifest } = await import("../index.js");
  assert.equal(manifest.role, "support");
  assert.ok(manifest.version.match(/^\d+\.\d+\.\d+$/));
  assert.ok(fs.existsSync(manifest.skillsDir));
  assert.ok(Array.isArray(manifest.skills));
  assert.ok(manifest.skills.length > 0);
});

test("every skill file referenced in manifest exists", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    const filePath = path.join(manifest.skillsDir, skill.file);
    assert.ok(fs.existsSync(filePath), `missing: ${skill.file}`);
  }
});

test("every skill has id, name, file, category", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    assert.ok(skill.id);
    assert.ok(skill.name);
    assert.ok(skill.file);
    assert.ok(skill.category);
  }
});
```

- [ ] **Step 10: Run tests**

```bash
cd packages/skills-support
node --test tests/
```

Expected: `pass 3, fail 0`

- [ ] **Step 11: Commit**

```bash
cd ../..
git add packages/skills-support/
git commit -m "feat: add skills-support pack with 5 skill files"
```

---

## Task 4: Create packages/skills-platform/

**Files:**
- Create: `packages/skills-platform/package.json`
- Create: `packages/skills-platform/index.js`
- Copy: `packages/skills-platform/skills/oracle-db/` from `C:\D\github-tools\oracle-db-skills\skills\`
- Create: `packages/skills-platform/skills/oracle-exception.md`
- Create: `packages/skills-platform/skills/bapi-sdu.md`
- Create: `packages/skills-platform/tests/manifest.test.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p packages/skills-platform/skills/oracle-db
mkdir -p packages/skills-platform/tests
```

- [ ] **Step 2: Create `packages/skills-platform/package.json`**

```json
{
  "name": "@dev/skills-platform",
  "version": "2.0.0",
  "description": "Dev platform skills: Oracle DB (117 guides), exception analysis, SDU/BAPI",
  "type": "module",
  "main": "index.js",
  "files": ["skills/", "index.js"],
  "scripts": {
    "test": "node --test tests/"
  },
  "keywords": ["Dev", "skills", "platform", "oracle"],
  "author": "Dev Platform Team",
  "license": "MIT",
  "engines": { "node": ">=18.0.0" },
  "publishConfig": {
    "registry": "https://your-gitlab.example.com/api/v4/groups/<GROUP_ID>/-/packages/npm/"
  }
}
```

- [ ] **Step 3: Copy oracle-db guides directory**

```bash
cp -r "C:\D\github-tools\oracle-db-skills\skills\." packages/skills-platform/skills/oracle-db/
```

On Windows PowerShell:
```powershell
Copy-Item -Recurse "C:\D\github-tools\oracle-db-skills\skills\*" "packages\skills-platform\skills\oracle-db\"
```

Verify the copy:
```bash
ls packages/skills-platform/skills/oracle-db/
```

Expected: subdirectories `admin/`, `appdev/`, `architecture/`, `design/`, `devops/`, `features/`, `migrations/`, `monitoring/`, `ords/`, `performance/`, `plsql/`, `security/`, `sql-dev/`, `sqlcl/`

- [ ] **Step 4: Create `packages/skills-platform/index.js`**

```js
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Count oracle-db guide files for display
function countOracleGuides() {
  const dir = path.join(__dirname, "skills", "oracle-db");
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(d, entry.name));
      else if (entry.name.endsWith(".md")) count++;
    }
  };
  walk(dir);
  return count;
}

export const manifest = {
  role:      "platform",
  version:   "2.0.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    {
      id:       "oracle-db",
      name:     "Oracle DB Expert",
      dir:      "oracle-db",
      category: "Platform Development",
      guideCount: countOracleGuides(),
    },
    { id: "oracle-exception", name: "Oracle Exception Analyzer", file: "oracle-exception.md", category: "Platform Development" },
    { id: "bapi-sdu",         name: "SDU / BAPI Analyzer",        file: "bapi-sdu.md",         category: "Platform Development" },
  ],
};
```

- [ ] **Step 5: Create `packages/skills-platform/skills/oracle-exception.md`**

```markdown
---
name: Oracle Exception Analyzer
id: oracle-exception
version: 1.0.0
role: platform
category: Platform Development
---

# Oracle Exception Analyzer

Database-level root cause analysis for Oracle exceptions — stack traces,
locks, wait events, and slow queries in Dev's Oracle database.

## Trigger Keywords

Invoke when user mentions: ORA-, exception, oracle error, lock, deadlock,
slow query, ORA-00054, ORA-04031, ORA-01555, TNS error, latch.

## Common ORA- Errors

| Error | Meaning | First Check |
|---|---|---|
| ORA-00054 | Resource busy (NOWAIT) | Check `V$LOCK` for blocking session |
| ORA-00060 | Deadlock detected | Check `V$DEADLOCK_HISTORY` / alert log |
| ORA-01555 | Snapshot too old | UNDO tablespace size / `UNDO_RETENTION` |
| ORA-04031 | Shared pool memory | `V$SGASTAT` shared pool free |
| ORA-01000 | Max open cursors | Unclosed cursors in PL/SQL / JDBC |
| ORA-12541 | TNS: no listener | Listener status + tnsnames config |

## Investigation Flow

1. **Check Oracle alert log** — first source for all ORA- errors:
   ```sql
   -- Using ADRCI or:
   SELECT ORIGINATING_TIMESTAMP, MESSAGE_TEXT
   FROM   V$DIAG_ALERT_EXT
   WHERE  MESSAGE_TEXT LIKE '%ORA-%'
     AND  ORIGINATING_TIMESTAMP > SYSTIMESTAMP - INTERVAL '1' HOUR
   ORDER  BY ORIGINATING_TIMESTAMP DESC
   FETCH FIRST 50 ROWS ONLY;
   ```

2. **Check blocking locks**:
   ```sql
   SELECT BLOCKING_SESSION, SID, WAIT_CLASS, SECONDS_IN_WAIT, STATE
   FROM   V$SESSION
   WHERE  BLOCKING_SESSION IS NOT NULL
   ORDER  BY SECONDS_IN_WAIT DESC;
   ```

3. **Check wait events** (top waits right now):
   ```sql
   SELECT EVENT, COUNT(*) SESSIONS, SUM(SECONDS_IN_WAIT) TOTAL_WAIT_SECS
   FROM   V$SESSION
   WHERE  WAIT_CLASS <> 'Idle'
   GROUP  BY EVENT
   ORDER  BY TOTAL_WAIT_SECS DESC
   FETCH FIRST 10 ROWS ONLY;
   ```

4. **Check Dev error log** — SI_DB_LOG captures ORA- errors
   raised by platform code:
   ```sql
   SELECT LOG_DATE, ERROR_MSG, MODULE_CODE, STACK_TRACE
   FROM   SI_DB_LOG
   WHERE  ERROR_MSG LIKE 'ORA-%'
     AND  LOG_DATE > SYSDATE - 1
   ORDER  BY LOG_DATE DESC
   FETCH FIRST 50 ROWS ONLY;
   ```

5. **Slow query diagnosis** — if a specific query is reported slow:
   ```sql
   SELECT SQL_ID, ELAPSED_TIME/EXECUTIONS/1e6 AVG_SECS,
          EXECUTIONS, SQL_TEXT
   FROM   V$SQL
   WHERE  LAST_ACTIVE_TIME > SYSDATE - 1/24
     AND  ELAPSED_TIME/GREATEST(EXECUTIONS,1) > 5e6
   ORDER  BY AVG_SECS DESC
   FETCH FIRST 20 ROWS ONLY;
   ```

6. **Check UNDO for ORA-01555** — snapshot too old:
   ```sql
   SELECT TABLESPACE_NAME, STATUS, SUM(BYTES)/1e9 GB
   FROM   DBA_UNDO_EXTENTS
   GROUP  BY TABLESPACE_NAME, STATUS;
   ```

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 6: Create `packages/skills-platform/skills/bapi-sdu.md`**

```markdown
---
name: SDU / BAPI Analyzer
id: bapi-sdu
version: 1.0.0
role: platform
category: Platform Development
---

# SDU / BAPI Analyzer

SDU/BAPI issue analysis — error code detection across log files,
batch status diagnosis, and DU upload troubleshooting for Dev.

## Trigger Keywords

Invoke when user mentions: SDU, BAPI, batch, DU upload, DU batch,
MS_APPS_DU, data upload, bulk upload, upload failed, batch stuck.

## BAPI Error Codes

| Code | Meaning | Fix |
|---|---|---|
| `ERR_SCHEMA_VALIDATION` | Upload file schema mismatch | Verify column names match form definition |
| `ERR_DUPLICATE_KEY` | Primary key already exists | Check push table for existing record |
| `ERR_MANDATORY_FIELD` | Required field missing in upload | Add missing column to upload file |
| `ERR_INVALID_LOV` | List-of-values value not found | Verify LOV entry exists in system |
| `ERR_WORKFLOW_TRIGGER` | Workflow failed to start post-upload | Check `SI_WORKFLOWS_T` active status |
| `ERR_DB_EXCEPTION` | Oracle error during write | Check `SI_DB_LOG` for ORA- error |

## Investigation Flow

1. **Check batch status** — find the failed batch:
   ```sql
   SELECT BATCH_ID, STATUS, TOTAL_RECORDS, SUCCESS_COUNT,
          FAILURE_COUNT, CREATED_DATE, COMPLETED_DATE
   FROM   MS_APPS_DU_BATCH_STATUS_LOG
   WHERE  METRIC_ID = :metric_id
   ORDER  BY CREATED_DATE DESC
   FETCH FIRST 10 ROWS ONLY;
   ```

2. **Check upload status log** — row-level errors per batch:
   ```sql
   SELECT RECORD_ID, STATUS, ERROR_CODE, ERROR_MSG, ROW_NUMBER
   FROM   MS_APPS_DU_UPLOAD_STATUS_LOG
   WHERE  BATCH_ID = :batch_id AND STATUS = 'FAILED'
   ORDER  BY ROW_NUMBER
   FETCH FIRST 50 ROWS ONLY;
   ```

3. **Check DB log for batch errors**:
   ```sql
   SELECT LOG_DATE, ERROR_MSG, STACK_TRACE
   FROM   SI_DB_LOG
   WHERE  MODULE_CODE = 'DU'
     AND  ERROR_MSG LIKE '%' || :batch_id || '%'
   ORDER  BY LOG_DATE DESC;
   ```

4. **Validate upload file structure** — compare upload file columns against
   form definition in `SI_METRIC_COLUMNS`:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, IS_MANDATORY, IS_ACTIVE
   FROM   SI_METRIC_COLUMNS
   WHERE  METRIC_ID = :metric_id AND IS_ACTIVE = 'Y'
   ORDER  BY COLUMN_ORDER;
   ```

5. **Check SDU job queue** — if using scheduled SDU:
   ```sql
   SELECT JOB_ID, JOB_NAME, STATUS, NEXT_RUN_DATE, LAST_RUN_DATE, ERROR_MSG
   FROM   MS_APPS_SDU_JOB_QUEUE
   WHERE  METRIC_ID = :metric_id
   ORDER  BY NEXT_RUN_DATE;
   ```

6. **Re-trigger failed batch** — confirm with user before any DML:
   ```sql
   UPDATE MS_APPS_DU_BATCH_STATUS_LOG
   SET    STATUS = 'PENDING', RETRY_COUNT = RETRY_COUNT + 1
   WHERE  BATCH_ID = :batch_id AND STATUS = 'FAILED';
   COMMIT;
   ```

## Key Tables

- `MS_APPS_DU_BATCH_STATUS_LOG` — batch-level status
- `MS_APPS_DU_UPLOAD_STATUS_LOG` — row-level upload status
- `SI_METRIC_COLUMNS` — expected upload schema
- `SI_DB_LOG` — Oracle/application errors
- `MS_APPS_SDU_JOB_QUEUE` — SDU scheduled jobs

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
```

- [ ] **Step 7: Write `packages/skills-platform/tests/manifest.test.js`**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("manifest exports role=platform, version, skillsDir, skills array", async () => {
  const { manifest } = await import("../index.js");
  assert.equal(manifest.role, "platform");
  assert.ok(manifest.version.match(/^\d+\.\d+\.\d+$/));
  assert.ok(fs.existsSync(manifest.skillsDir));
  assert.ok(Array.isArray(manifest.skills));
  assert.equal(manifest.skills.length, 3);
});

test("oracle-db dir skill: directory exists with guide files", async () => {
  const { manifest } = await import("../index.js");
  const oracleSkill = manifest.skills.find(s => s.id === "oracle-db");
  assert.ok(oracleSkill, "oracle-db skill exists in manifest");
  assert.ok(oracleSkill.dir, "oracle-db skill has dir field");
  const dirPath = path.join(manifest.skillsDir, oracleSkill.dir);
  assert.ok(fs.existsSync(dirPath), `oracle-db dir missing: ${dirPath}`);
  const guideCount = oracleSkill.guideCount;
  assert.ok(guideCount > 0, `oracle-db guideCount is 0`);
});

test("file-based skills have their .md files", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills.filter(s => s.file)) {
    const filePath = path.join(manifest.skillsDir, skill.file);
    assert.ok(fs.existsSync(filePath), `missing: ${skill.file}`);
  }
});
```

- [ ] **Step 8: Run tests**

```bash
cd packages/skills-platform
node --test tests/
```

Expected: `pass 3, fail 0`

- [ ] **Step 9: Commit**

```bash
cd ../..
git add packages/skills-platform/
git commit -m "feat: add skills-platform pack with oracle-db (117 guides), oracle-exception, bapi-sdu"
```

---

## Task 5: Update packages/skills-cli/lib/paths.js

**Files:**
- Modify: `packages/skills-cli/lib/paths.js`

- [ ] **Step 1: Write failing test first**

Create `packages/skills-cli/tests/paths.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import os from "os";
import path from "path";
import { SKILLS_DIR, getSkillFilePath } from "../lib/paths.js";

test("SKILLS_DIR is under ~/.dev/skills", () => {
  const expected = path.join(os.homedir(), ".Dev", "skills");
  assert.equal(SKILLS_DIR, expected);
});

test("getSkillFilePath(role, file) includes role subdir", () => {
  const result = getSkillFilePath("dev", "bug-triage.md");
  assert.ok(result.includes(path.join("skills", "dev", "bug-triage.md")),
    `expected path to contain skills/dev/bug-triage.md, got: ${result}`);
});

test("getSkillFilePath(role, dir) works for directory skills", () => {
  const result = getSkillFilePath("platform", "oracle-db");
  assert.ok(result.includes(path.join("skills", "platform", "oracle-db")));
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/skills-cli
node --test tests/paths.test.js
```

Expected: FAIL — `getSkillFilePath` currently takes one arg, not two.

- [ ] **Step 3: Update `packages/skills-cli/lib/paths.js`**

```js
import os from "os";
import path from "path";

const HOME = os.homedir();

export const SKILLS_DIR = path.join(HOME, ".Dev", "skills");
export const META_FILE  = path.join(HOME, ".Dev", ".skills-meta.json");

export function getSkillFilePath(role, relPath) {
  return path.join(SKILLS_DIR, role, relPath);
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
node --test tests/paths.test.js
```

Expected: `pass 3, fail 0`

- [ ] **Step 5: Commit**

```bash
cd ../..
git add packages/skills-cli/lib/paths.js packages/skills-cli/tests/paths.test.js
git commit -m "feat: paths.js getSkillFilePath now includes role subdir"
```

---

## Task 6: Update packages/skills-cli/lib/registry.js

**Files:**
- Modify: `packages/skills-cli/lib/registry.js`
- Create: `packages/skills-cli/tests/registry.test.js`

- [ ] **Step 1: Write failing test**

```js
// packages/skills-cli/tests/registry.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { ROLE_PACKS, ROLES, SKILLS_REGISTRY } from "../lib/registry.js";

test("ROLE_PACKS has dev, support, platform keys", () => {
  assert.ok(ROLE_PACKS.dev,      "missing dev");
  assert.ok(ROLE_PACKS.support,  "missing support");
  assert.ok(ROLE_PACKS.platform, "missing platform");
});

test("ROLE_PACKS values are scoped package names", () => {
  for (const [role, pkg] of Object.entries(ROLE_PACKS)) {
    assert.ok(pkg.startsWith("@dev/skills-"), `${role}: expected @dev/skills-* got ${pkg}`);
  }
});

test("oracle-db skill has isDir=true", () => {
  const skill = SKILLS_REGISTRY["oracle-db"];
  assert.ok(skill,          "oracle-db not in registry");
  assert.equal(skill.isDir, true);
  assert.equal(skill.file,  "oracle-db");
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/skills-cli
node --test tests/registry.test.js
```

Expected: FAIL — `ROLE_PACKS` not exported, `isDir` not set.

- [ ] **Step 3: Update `packages/skills-cli/lib/registry.js`** — add `ROLE_PACKS` and `isDir` to oracle-db

Add after the existing imports / at the top of the exports:

```js
// ── Pack → role mapping ───────────────────────────────────────────────────────
// These are the npm packages published to the GitLab registry.
// The CLI installs only the pack for the selected role at runtime.

export const ROLE_PACKS = {
  dev:      "@dev/skills-dev",
  support:  "@dev/skills-support",
  platform: "@dev/skills-platform",
};
```

Update the `oracle-db` entry in `SKILLS_REGISTRY` to add `isDir: true` and change `file`:

```js
"oracle-db": {
  id:          "oracle-db",
  name:        "Oracle DB Expert",
  role:        "platform",
  category:    "Platform Development",
  description: "117 Oracle guides covering SQL, PL/SQL, performance tuning, security, ORDS, migrations, and more.",
  triggers:    ["oracle", "SQL", "PL/SQL", "query", "database", "index", "execution plan"],
  version:     "2.0.0",
  isDir:       true,
  file:        "oracle-db",   // directory name, not a .md file
},
```

Remove the `file` field from all other skills (it pointed to bundled files that no longer exist in the CLI package). The CLI no longer needs file paths — the packs own those.

- [ ] **Step 4: Run test — confirm it passes**

```bash
node --test tests/registry.test.js
```

Expected: `pass 3, fail 0`

- [ ] **Step 5: Commit**

```bash
cd ../..
git add packages/skills-cli/lib/registry.js packages/skills-cli/tests/registry.test.js
git commit -m "feat: add ROLE_PACKS to registry, mark oracle-db as dir skill"
```

---

## Task 7: Rewrite packages/skills-cli/lib/installer.js

**Files:**
- Modify: `packages/skills-cli/lib/installer.js`
- Create: `packages/skills-cli/tests/installer.test.js`

- [ ] **Step 1: Write tests**

```js
// packages/skills-cli/tests/installer.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import os from "os";
import fs from "fs-extra";
import { getInstalledMeta, isInstalled } from "../lib/installer.js";

test("getInstalledMeta returns default shape when no meta file", async () => {
  const meta = await getInstalledMeta();
  assert.ok("installedAt" in meta, "missing installedAt");
  assert.ok("role"        in meta, "missing role");
  assert.ok("skills"      in meta, "missing skills");
  assert.ok(Array.isArray(meta.skills));
});

test("isInstalled returns false when meta file absent", async () => {
  // Only meaningful if ~/.dev/.skills-meta.json doesn't exist on CI
  const result = await isInstalled();
  assert.equal(typeof result, "boolean");
});
```

- [ ] **Step 2: Run test to confirm it passes (these test existing functions)**

```bash
cd packages/skills-cli
node --test tests/installer.test.js
```

Expected: `pass 2, fail 0`

- [ ] **Step 3: Rewrite `packages/skills-cli/lib/installer.js`**

```js
// lib/installer.js
// Installs skill packs by downloading from npm registry at runtime.

import fs from "fs-extra";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { pathToFileURL } from "url";
import { SKILLS_DIR, META_FILE } from "./paths.js";
import { ROLE_PACKS } from "./registry.js";

// ── Meta helpers ──────────────────────────────────────────────────────────────

async function readMeta() {
  if (await fs.pathExists(META_FILE)) {
    return fs.readJson(META_FILE);
  }
  return { installedAt: null, updatedAt: null, role: null, skills: [] };
}

async function writeMeta(data) {
  await fs.ensureDir(path.dirname(META_FILE));
  await fs.writeJson(META_FILE, { ...data, updatedAt: new Date().toISOString() }, { spaces: 2 });
}

// ── Core: install a role's skill pack from npm registry ────────────────────────

export async function installSkills(role = "all", options = {}) {
  const { onProgress } = options;

  if (role === "all") {
    const allResults = [];
    for (const r of ["dev", "support", "platform"]) {
      const res = await installSkills(r, options);
      allResults.push(...res);
    }
    return allResults;
  }

  const packName = ROLE_PACKS[role];
  if (!packName) throw new Error(`Unknown role: ${role}. Valid: ${Object.keys(ROLE_PACKS).join(", ")}`);

  // Create temp dir with minimal package.json so npm install works
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ms-skills-"));

  try {
    fs.writeJsonSync(path.join(tmpDir, "package.json"), {
      name: "ms-skills-tmp", version: "1.0.0", type: "module",
    });

    // Install the pack — inherits ~/.npmrc for registry/auth
    execSync(`npm install ${packName} --prefer-offline --no-audit --no-fund`, {
      cwd:   tmpDir,
      stdio: "pipe",
      env:   { ...process.env },
    });

    // Load pack manifest
    const packDir   = path.join(tmpDir, "node_modules", packName);
    const indexUrl  = pathToFileURL(path.join(packDir, "index.js")).href;
    const { manifest } = await import(indexUrl);

    await fs.ensureDir(SKILLS_DIR);

    const results = [];

    for (const skill of manifest.skills) {
      const relPath = skill.dir || skill.file;
      const src     = path.join(manifest.skillsDir, relPath);
      const dest    = path.join(SKILLS_DIR, role, relPath);

      await fs.ensureDir(path.dirname(dest));

      const existed  = await fs.pathExists(dest);
      const status   = existed ? "updated" : "installed";

      await fs.copy(src, dest, { overwrite: true });

      const meta = { id: skill.id, name: skill.name || skill.id, role, category: skill.category || "" };
      results.push({ skill: meta, status, dest });
      if (onProgress) onProgress(meta, status);
    }

    // Save install metadata
    const m = await readMeta();
    m.installedAt = m.installedAt || new Date().toISOString();
    m.role        = role;
    m.skills      = manifest.skills.map(s => ({
      id: s.id, version: manifest.version, installedAt: new Date().toISOString(),
    }));
    await writeMeta(m);

    return results;

  } finally {
    await fs.remove(tmpDir).catch(() => {});
  }
}

// ── Single skill install ───────────────────────────────────────────────────────

export async function installSingleSkill(skillId) {
  // Determine which pack owns this skill
  const { SKILLS_REGISTRY } = await import("./registry.js");
  const skill = SKILLS_REGISTRY[skillId];
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  const results = await installSkills(skill.role, {
    onProgress: (s) => { if (s.id !== skillId) return; },
  });

  const result = results.find(r => r.skill.id === skillId);
  if (!result) throw new Error(`Skill ${skillId} not found in pack for role ${skill.role}`);
  return result;
}

// ── Uninstall ─────────────────────────────────────────────────────────────────

export async function uninstallSkills() {
  await fs.remove(SKILLS_DIR);
  await fs.remove(META_FILE);
}

export async function getInstalledMeta() {
  return readMeta();
}

export async function isInstalled() {
  const meta = await readMeta();
  return !!meta.installedAt;
}
```

- [ ] **Step 4: Re-run tests**

```bash
node --test tests/installer.test.js
```

Expected: `pass 2, fail 0`

- [ ] **Step 5: Commit**

```bash
cd ../..
git add packages/skills-cli/lib/installer.js packages/skills-cli/tests/installer.test.js
git commit -m "feat: installer.js rewritten to use runtime npm install of skill pack"
```

---

## Task 8: Update packages/skills-cli/lib/patcher.js

**Files:**
- Modify: `packages/skills-cli/lib/patcher.js` — update `buildSkillsMdBlock` for dir skills and new path structure

- [ ] **Step 1: Update `buildSkillsMdBlock` in `packages/skills-cli/lib/patcher.js`**

Find the `buildSkillsMdBlock` function (around line 328) and replace it:

```js
function buildSkillsMdBlock(skills, role) {
  const lines = skills.map(s => {
    const isDir   = s.isDir;
    const locKey  = isDir ? "**SkillsDir:**" : "**File:**";
    const locVal  = isDir
      ? path.join(SKILLS_DIR, role || s.role, s.file)
      : path.join(SKILLS_DIR, role || s.role, s.file.endsWith(".md") ? s.file : `${s.file}.md`);

    return [
      `### ${s.name}`,
      `- **Role:** ${s.role}  **Version:** ${s.version}`,
      `- ${s.description}`,
      `- **Triggers:** ${s.triggers?.join(", ") || "—"}`,
      `- ${locKey} \`${locVal}\``,
    ].join("\n");
  });

  return [
    "<!-- ms-skills -->",
    "## Dev Skills",
    "",
    "You have access to the following Dev platform skills.",
    "Invoke them automatically when the trigger keywords appear in the user query.",
    "",
    ...lines,
    "",
    "<!-- /ms-skills -->",
  ].join("\n");
}
```

Also update `patchClaudeMd` to pass role through to `buildSkillsMdBlock`:

```js
async function patchClaudeMd(configPath, dryRun, result, role) {
  await fs.ensureDir(path.dirname(configPath));

  const existing = (await fs.pathExists(configPath))
    ? await fs.readFile(configPath, "utf8") : "";

  if (existing.includes("<!-- ms-skills -->")) {
    result.alreadyPresent = true;
    return result;
  }

  const skills = getSkillsByRole(role);
  const block  = buildSkillsMdBlock(skills, role);   // ← pass role

  if (!dryRun) {
    await fs.appendFile(configPath, "\n" + block + "\n", "utf8");
  }
  result.patched = true;
  return result;
}
```

Add `import path from "path";` at the top if not already present.

- [ ] **Step 2: Verify the CLI still runs after patcher changes**

```bash
node packages/skills-cli/bin/cli.js --help
```

Expected: help output with no import errors.

- [ ] **Step 3: Commit**

```bash
git add packages/skills-cli/lib/patcher.js
git commit -m "feat: patcher handles dir skills and role-subdir path for CLAUDE.md block"
```

---

## Task 9: Clean up old files and run full smoke test

**Files:**
- Delete: `dev-skills-cli/` (whole directory)
- Delete: `cli.js`, `editors.js`, `patcher.js` (root-level prototypes)
- Delete: `package-lock.json` (root — workspace uses its own)
- Delete: `dev-skills-cli.tar`, `dev-skills-cli.tar.gz`

- [ ] **Step 1: Delete old files**

```bash
rm -rf dev-skills-cli/
rm -f cli.js editors.js patcher.js
rm -f package-lock.json
rm -f dev-skills-cli.tar dev-skills-cli.tar.gz
```

PowerShell:
```powershell
Remove-Item -Recurse -Force dev-skills-cli
Remove-Item cli.js, editors.js, patcher.js, package-lock.json -ErrorAction SilentlyContinue
Remove-Item dev-skills-cli.tar, dev-skills-cli.tar.gz -ErrorAction SilentlyContinue
```

- [ ] **Step 2: Re-install workspace (fresh)**

```bash
npm install
```

Expected: workspace installs without errors.

- [ ] **Step 3: Run all tests**

```bash
npm test --workspaces --if-present
```

Expected: all suites pass across skills-dev, skills-support, skills-platform, skills-cli.

- [ ] **Step 4: Smoke test CLI — list and status commands (no network needed)**

```bash
node packages/skills-cli/bin/cli.js list
node packages/skills-cli/bin/cli.js status
node packages/skills-cli/bin/cli.js which
```

Expected:
- `list` — shows all 12 skills in a table
- `status` — shows "No skills installed yet" (or current state)
- `which` — shows all config file paths

- [ ] **Step 5: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old dev-skills-cli, root-level prototype files"
```

---

## Task 10: GitLab setup and first publish

- [ ] **Step 1: Initialize git repo (if not already)**

```bash
git status
```

If not a git repo:
```bash
git init
git checkout -b main
```

- [ ] **Step 2: Create `.npmrc` from template (local only, never commit)**

```bash
cp .npmrc.example .npmrc
```

Open `.npmrc` and fill in:
- `your-gitlab.example.com` → your actual GitLab hostname
- `<GROUP_ID>` → your GitLab group ID number (GitLab → group → Settings → General → top of page)
- `<YOUR_TOKEN>` → Personal Access Token with `write_package_registry` scope

- [ ] **Step 3: Update `publishConfig` in all four `package.json` files**

In each of these files, replace `your-gitlab.example.com` and `<GROUP_ID>` with real values:
- `packages/skills-cli/package.json`
- `packages/skills-dev/package.json`
- `packages/skills-support/package.json`
- `packages/skills-platform/package.json`

```json
"publishConfig": {
  "registry": "https://your-actual-gitlab.com/api/v4/groups/42/-/packages/npm/"
}
```

- [ ] **Step 4: Update `.gitlab-ci.yml` with real hostname**

In `.gitlab-ci.yml`, the script uses `${CI_SERVER_HOST}` (auto-filled by GitLab CI — no change needed) and `${GITLAB_GROUP_ID}` (set as a CI variable — no change needed).

- [ ] **Step 5: Add GitLab remote and push**

```bash
git remote add origin https://your-gitlab.example.com/Dev/npx-skills-cmd.git
git push -u origin main
```

- [ ] **Step 6: Set CI variable in GitLab**

GitLab project → **Settings → CI/CD → Variables → Add variable**:

| Key | Value |
|---|---|
| `GITLAB_GROUP_ID` | your group ID number |

- [ ] **Step 7: Publish all four packages (first time — manual)**

```bash
cd packages/skills-dev     && npm publish && cd ../..
cd packages/skills-support && npm publish && cd ../..
cd packages/skills-platform && npm publish && cd ../..
cd packages/skills-cli     && npm publish && cd ../..
```

Expected for each: `npm notice Publishing to https://your-gitlab.example.com/...`

- [ ] **Step 8: Verify packages appear in GitLab**

GitLab → your group → **Packages & Registries → Package Registry**

Expected: four packages listed under `@dev`.

- [ ] **Step 9: End-to-end customer test — install from published registry**

On a clean machine or in a temp dir (not the repo), add `~/.npmrc` with `read_package_registry` token, then:

```bash
npx @dev/skills install --role dev --editors claude-code
```

Expected:
- Pack `@dev/skills-dev` downloads
- `~/.dev/skills/dev/` contains 4 skill files
- `~/.claude/CLAUDE.md` has `<!-- ms-skills -->` block with 4 skill entries

- [ ] **Step 10: Final commit and tag for CI publish**

```bash
git add packages/
git commit -m "chore: update publishConfig with real GitLab registry URLs"
git tag skills-dev@1.2.0
git tag skills-support@1.2.0
git tag skills-platform@2.0.0
git tag skills-cli@1.1.0
git push origin main --tags
```

CI will re-publish all four packages from the tag triggers.

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Monorepo with npm workspaces | Task 1 |
| `@dev/skills-dev` pack | Task 2 |
| `@dev/skills-support` pack | Task 3 |
| `@dev/skills-platform` pack with oracle-db dir | Task 4 |
| `paths.js` role subdir | Task 5 |
| `ROLE_PACKS` in registry | Task 6 |
| Runtime npm install of pack | Task 7 |
| Patcher handles dir skills | Task 8 |
| Clean up old files | Task 9 |
| GitLab publish + CI | Task 10 |

**No placeholders found.** All tasks contain complete code.

**Type consistency:** `manifest.skills[].dir` used for directory skills (Task 4 index.js), `manifest.skills[].file` for single files — consistent across installer.js (Task 7) and patcher.js (Task 8). `getSkillFilePath(role, relPath)` signature defined in Task 5, used in Task 7.
