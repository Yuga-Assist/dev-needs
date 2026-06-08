// lib/installer.js
// Copies skill files into ~/.dev/skills/ and writes install metadata

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { SKILLS_DIR, META_FILE, getSkillFilePath } from "./paths.js";
import { getSkillsByRole, getSkillById } from "./registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = path.join(__dirname, "..", "skills");

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

// ── Core install ──────────────────────────────────────────────────────────────

export async function installSkills(role = "all", options = {}) {
  const { onProgress } = options;
  const skills = getSkillsByRole(role);

  await fs.ensureDir(SKILLS_DIR);

  const results = [];
  for (const skill of skills) {
    const src  = path.join(BUNDLED_SKILLS_DIR, skill.file.replace("skills/", ""));
    const dest = getSkillFilePath(skill.file.replace("skills/", ""));

    await fs.ensureDir(path.dirname(dest));

    let status = "installed";
    if (await fs.pathExists(dest)) {
      status = "updated";
    }

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
    } else {
      // Write a generated skill file from registry metadata when bundled file missing
      await fs.writeFile(dest, generateSkillFile(skill), "utf8");
    }

    results.push({ skill, status, dest });
    if (onProgress) onProgress(skill, status);
  }

  // Write metadata
  const meta = await readMeta();
  meta.installedAt = meta.installedAt || new Date().toISOString();
  meta.role = role;
  meta.skills = skills.map(s => ({ id: s.id, version: s.version, installedAt: new Date().toISOString() }));
  await writeMeta(meta);

  return results;
}

export async function installSingleSkill(skillId) {
  const skill = getSkillById(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  await fs.ensureDir(SKILLS_DIR);

  const src  = path.join(BUNDLED_SKILLS_DIR, skill.file.replace("skills/", ""));
  const dest = getSkillFilePath(skill.file.replace("skills/", ""));

  await fs.ensureDir(path.dirname(dest));

  if (await fs.pathExists(src)) {
    await fs.copy(src, dest, { overwrite: true });
  } else {
    await fs.writeFile(dest, generateSkillFile(skill), "utf8");
  }

  return { skill, dest };
}

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

// ── Skill file generator (fallback when bundled files not present) ─────────────

function generateSkillFile(skill) {
  const tableSection = skill.tables && skill.tables.length
    ? `\n## Key Tables\n${skill.tables.map(t => `- \`${t}\``).join("\n")}\n`
    : "";

  const triggerSection = skill.triggers && skill.triggers.length
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
${triggerSection}${tableSection}
## Usage

This skill is automatically invoked by Claude when the trigger keywords are detected in your query.
It guides investigation, suggests relevant MCP tool calls, and structures the diagnostic approach
for Dev platform issues in this domain.

> Skill managed by Dev Skills CLI. Run \`npx @dev/skills update\` to get the latest version.
`;
}
