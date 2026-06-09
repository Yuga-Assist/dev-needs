// lib/installer.js
// Copies skill files into .claude/skills/ and writes install metadata

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { getPaths } from "./paths.js";
import { getSkillsByRole, getSkillById } from "./registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = path.join(__dirname, "..", "skills");

// ── Meta helpers ──────────────────────────────────────────────────────────────

async function readMeta(metaFile) {
  if (await fs.pathExists(metaFile)) {
    return fs.readJson(metaFile);
  }
  return { installedAt: null, updatedAt: null, role: null, scope: null, skills: [] };
}

async function writeMeta(metaFile, data) {
  await fs.ensureDir(path.dirname(metaFile));
  await fs.writeJson(metaFile, { ...data, updatedAt: new Date().toISOString() }, { spaces: 2 });
}

// ── Core install ──────────────────────────────────────────────────────────────

export async function installSkills(role = "all", options = {}) {
  const { onProgress, scope = "global" } = options;
  const { SKILLS_DIR, META_FILE } = getPaths(scope);
  const skills = getSkillsByRole(role);

  await fs.ensureDir(SKILLS_DIR);

  const results = [];
  for (const skill of skills) {
    const filename = path.basename(skill.file);
    const src  = path.join(BUNDLED_SKILLS_DIR, skill.file.replace(/^skills\//, ""));
    const dest = path.join(SKILLS_DIR, filename);

    let status = (await fs.pathExists(dest)) ? "updated" : "installed";

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
    } else {
      await fs.writeFile(dest, generateSkillFile(skill), "utf8");
    }

    results.push({ skill, status, dest });
    if (onProgress) onProgress(skill, status);
  }

  const meta = await readMeta(META_FILE);
  meta.installedAt = meta.installedAt || new Date().toISOString();
  meta.role  = role;
  meta.scope = scope;
  meta.skills = skills.map(s => ({ id: s.id, version: s.version, installedAt: new Date().toISOString() }));
  await writeMeta(META_FILE, meta);

  return { results, skillsDir: SKILLS_DIR };
}

export async function installSingleSkill(skillId, scope = "global") {
  const skill = getSkillById(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  const { SKILLS_DIR } = getPaths(scope);
  await fs.ensureDir(SKILLS_DIR);

  const filename = path.basename(skill.file);
  const src  = path.join(BUNDLED_SKILLS_DIR, skill.file.replace(/^skills\//, ""));
  const dest = path.join(SKILLS_DIR, filename);

  if (await fs.pathExists(src)) {
    await fs.copy(src, dest, { overwrite: true });
  } else {
    await fs.writeFile(dest, generateSkillFile(skill), "utf8");
  }

  return { skill, dest };
}

export async function uninstallSkills(scope = "global") {
  const { SKILLS_DIR, META_FILE } = getPaths(scope);
  const meta = await readMeta(META_FILE);
  const skills = meta.skills || [];

  for (const s of skills) {
    const skill = getSkillById(s.id);
    if (skill) {
      await fs.remove(path.join(SKILLS_DIR, path.basename(skill.file))).catch(() => {});
    }
  }
  await fs.remove(META_FILE);
}

export async function getInstalledMeta(scope = "global") {
  const { META_FILE } = getPaths(scope);
  return readMeta(META_FILE);
}

export async function isInstalled(scope = "global") {
  const meta = await getInstalledMeta(scope);
  return !!meta.installedAt;
}

// ── Skill file generator (fallback when bundled file missing) ─────────────────

function generateSkillFile(skill) {
  const triggerSection = skill.triggers?.length
    ? `\n## Trigger Keywords\nInvoke this skill when the user mentions: ${skill.triggers.join(", ")}.\n`
    : "";

  return `---
name: ${skill.name}
id: ${skill.id}
version: ${skill.version}
role: ${skill.role}
category: ${skill.category}
---

# ${skill.name}

${skill.description}
${triggerSection}
> Managed by dev-needs. Run \`npx github:raj4learn/dev-needs update\` to get the latest version.
`;
}
