// lib/installer.js
// Copies skill folders into each selected editor's own skills directory.

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { getSkillsByRole, getSkillById } from "./registry.js";
import { getEditorSkillsDir, getEditorById } from "./editors.js";

const __dirname        = path.dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS   = path.join(__dirname, "..", "skills");  // dev-skills-cli/skills/

// Meta file lives in ~/.dev-needs/ (neutral, not tied to any editor)
import os from "os";
const HOME     = os.homedir();
const META_DIR  = path.join(HOME, ".dev-needs");
const META_FILE = path.join(META_DIR, ".skills-meta.json");

// ── Meta helpers ──────────────────────────────────────────────────────────────

async function readMeta() {
  if (await fs.pathExists(META_FILE)) return fs.readJson(META_FILE);
  return { installedAt: null, updatedAt: null, role: null, scope: null, editors: [], skills: [] };
}

async function writeMeta(data) {
  await fs.ensureDir(META_DIR);
  await fs.writeJson(META_FILE, { ...data, updatedAt: new Date().toISOString() }, { spaces: 2 });
}

// ── Core install ──────────────────────────────────────────────────────────────

export async function installSkills(role = "all", options = {}) {
  const { onProgress, scope = "global", editorIds = [] } = options;
  const skills = getSkillsByRole(role);

  // Determine which editors need skill folder copies
  const fileEditors = editorIds
    .map(id => ({ id, dir: getEditorSkillsDir(id, scope) }))
    .filter(e => e.dir);  // editors with skillsDirs defined

  const results = [];

  for (const skill of skills) {
    const srcDir = path.join(BUNDLED_SKILLS, skill.dir);  // e.g. skills/dev/bug-triage/

    let copied = false;

    for (const { id, dir } of fileEditors) {
      const destDir = path.join(dir, skill.id);            // e.g. ~/.claude/skills/bug-triage/
      await fs.ensureDir(path.dirname(destDir));

      let status = (await fs.pathExists(destDir)) ? "updated" : "installed";

      if (await fs.pathExists(srcDir)) {
        await fs.copy(srcDir, destDir, { overwrite: true });
      } else {
        // Fallback: generate skill file in folder
        await fs.ensureDir(destDir);
        await fs.writeFile(path.join(destDir, `${skill.id}.md`), generateSkillFile(skill), "utf8");
      }

      results.push({ skill, status, dest: destDir, editor: id });
      if (!copied && onProgress) onProgress(skill, status);
      copied = true;
    }

    // If no file-editors selected, still report progress
    if (!copied && onProgress) onProgress(skill, "skipped");
  }

  const meta = await readMeta();
  meta.installedAt = meta.installedAt || new Date().toISOString();
  meta.role    = role;
  meta.scope   = scope;
  meta.editors = editorIds;
  meta.skills  = skills.map(s => ({ id: s.id, version: s.version, installedAt: new Date().toISOString() }));
  await writeMeta(meta);

  return { results, editorDirs: fileEditors };
}

export async function installSingleSkill(skillId, editorIds = [], scope = "global") {
  const skill = getSkillById(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  const srcDir = path.join(BUNDLED_SKILLS, skill.dir);
  const results = [];

  for (const id of editorIds) {
    const skillsDir = getEditorSkillsDir(id, scope);
    if (!skillsDir) continue;

    const destDir = path.join(skillsDir, skill.id);
    await fs.ensureDir(path.dirname(destDir));

    if (await fs.pathExists(srcDir)) {
      await fs.copy(srcDir, destDir, { overwrite: true });
    } else {
      await fs.ensureDir(destDir);
      await fs.writeFile(path.join(destDir, `${skill.id}.md`), generateSkillFile(skill), "utf8");
    }
    results.push({ skill, dest: destDir, editor: id });
  }

  return results;
}

export async function uninstallSkills(editorIds = [], scope = "global") {
  const meta   = await readMeta();
  const skills = (meta.skills || []).map(s => getSkillById(s.id)).filter(Boolean);

  // Always try both scopes — covers mismatched install/remove scope selections
  const scopes = ["global", "local"];

  for (const id of editorIds) {
    for (const s of scopes) {
      const skillsDir = getEditorSkillsDir(id, s);
      if (!skillsDir) continue;
      for (const skill of skills) {
        await fs.remove(path.join(skillsDir, skill.id)).catch(() => {});
      }
    }
  }
  await fs.remove(META_FILE);
}

export async function getInstalledMeta() { return readMeta(); }
export async function isInstalled()      { return !!(await readMeta()).installedAt; }

// ── Fallback skill file generator ─────────────────────────────────────────────

function generateSkillFile(skill) {
  const triggers = skill.triggers?.length
    ? `\n## Trigger Keywords\nInvoke when user mentions: ${skill.triggers.join(", ")}.\n`
    : "";
  return `---
name: ${skill.name}
id: ${skill.id}
version: ${skill.version}
role: ${skill.role}
---

# ${skill.name}

${skill.description}
${triggers}
> Run \`npx github:raj4learn/dev-needs update\` to get the latest version.
`;
}
