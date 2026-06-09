// lib/patcher.js
// Patches editor config files to register the Dev skills directory.
// Supports all patchMode values defined in editors.js.

import fs from "fs-extra";
import path from "path";
import { SKILLS_DIR as DEFAULT_SKILLS_DIR } from "./paths.js";
import { getEditorById, getEditorConfigPath, getAllEditors } from "./editors.js";
import { getSkillsByRole } from "./registry.js";

// ── Main entry point ──────────────────────────────────────────────────────────

export async function patchEditor(editorId, { dryRun = false, role = "all", skillsDir } = {}) {
  const sd     = skillsDir || DEFAULT_SKILLS_DIR;
  const editor = getEditorById(editorId);
  if (!editor) throw new Error(`Unknown editor: ${editorId}`);

  const configPath = getEditorConfigPath(editorId);
  const result = {
    editorId,
    label:          editor.label,
    patched:        false,
    alreadyPresent: false,
    created:        false,
    path:           configPath,
    note:           editor.noteOnPatch || "",
  };

  switch (editor.patchMode) {
    case "json":          return patchJson(editor, configPath, dryRun, result, sd);
    case "claude-md":     return patchClaudeMd(configPath, dryRun, result, role, sd);
    case "cursor-rules":  return patchCursorRules(configPath, dryRun, result, role, sd);
    case "cody-yaml":     return patchCodyYaml(configPath, dryRun, result, role, sd);
    case "aider-prompt":  return patchAiderPrompt(configPath, dryRun, result, role, sd);
    case "continue-json": return patchContinueJson(configPath, dryRun, result, role, sd);
    case "copy":          return patchCopy(configPath, dryRun, result, role, sd);
    default:
      throw new Error(`Unknown patchMode: ${editor.patchMode}`);
  }
}

export async function unpatchEditor(editorId) {
  const editor = getEditorById(editorId);
  if (!editor) return false;

  const configPath = getEditorConfigPath(editorId);

  switch (editor.patchMode) {
    case "json":          return unpatchJson(editor, configPath);
    case "claude-md":     return unpatchMdFile(configPath, "<!-- ms-skills -->", "<!-- /ms-skills -->");
    case "cursor-rules":  return fs.remove(path.join(configPath, "dev-needs")).then(() => true).catch(() => false);
    case "cody-yaml":     return fs.remove(configPath).then(() => true).catch(() => false);
    case "aider-prompt":  return unpatchMdFile(configPath, "<!-- ms-skills -->", "<!-- /ms-skills -->");
    case "continue-json": return unpatchContinueJson(configPath);
    case "copy":          return fs.remove(configPath).then(() => true).catch(() => false);
    default:              return false;
  }
}

export async function patchAllEditors(editorIds, options = {}) {
  const results = [];
  for (const id of editorIds) {
    try {
      const r = await patchEditor(id, options);
      results.push(r);
    } catch (e) {
      results.push({ editorId: id, label: id, error: e.message });
    }
  }
  return results;
}

export async function unpatchAllEditors() {
  const editors = getAllEditors();
  for (const e of editors) {
    await unpatchEditor(e.id).catch(() => {});
  }
}

// ── MODE: json ────────────────────────────────────────────────────────────────

async function patchJson(editor, configPath, dryRun, result, skillsDir) {
  let config = {};
  if (await fs.pathExists(configPath)) {
    try { config = await fs.readJson(configPath); } catch { config = {}; }
  } else {
    result.created = true;
    await fs.ensureDir(path.dirname(configPath));
  }

  const keyPath = editor.skillsKey.split(".");
  let obj = config;
  for (let i = 0; i < keyPath.length - 1; i++) {
    if (!obj[keyPath[i]] || typeof obj[keyPath[i]] !== "object") obj[keyPath[i]] = {};
    obj = obj[keyPath[i]];
  }

  const lastKey = keyPath[keyPath.length - 1];

  if (editor.id === "copilot") {
    const existing = obj[lastKey] || [];
    const marker   = `[Dev Skills] ${skillsDir}`;
    if (existing.some(e => e.text && e.text.includes("[Dev Skills]"))) {
      result.alreadyPresent = true;
      return result;
    }
    if (!dryRun) {
      obj[lastKey] = [...existing, { text: `${marker}\nSee skills at: ${skillsDir}` }];
      await fs.writeJson(configPath, config, { spaces: 2 });
    }
    result.patched = true;
    return result;
  }

  const dirs = Array.isArray(obj[lastKey]) ? obj[lastKey] : [];
  if (dirs.includes(skillsDir)) { result.alreadyPresent = true; return result; }

  if (!dryRun) {
    obj[lastKey] = [...dirs, skillsDir];
    await fs.writeJson(configPath, config, { spaces: 2 });
  }
  result.patched = true;
  return result;
}

async function unpatchJson(editor, configPath) {
  if (!(await fs.pathExists(configPath))) return false;
  const config  = await fs.readJson(configPath);
  const keyPath = editor.skillsKey.split(".");
  let obj = config;
  for (let i = 0; i < keyPath.length - 1; i++) {
    obj = obj?.[keyPath[i]];
    if (!obj) return false;
  }
  const lastKey = keyPath[keyPath.length - 1];
  if (!obj[lastKey]) return false;

  if (editor.id === "copilot") {
    obj[lastKey] = obj[lastKey].filter(e => !e.text?.includes("[Dev Skills]"));
  } else {
    obj[lastKey] = obj[lastKey].filter(d => !d.includes(".claude/skills"));
  }
  await fs.writeJson(configPath, config, { spaces: 2 });
  return true;
}

// ── MODE: claude-md ───────────────────────────────────────────────────────────

async function patchClaudeMd(configPath, dryRun, result, role, skillsDir) {
  await fs.ensureDir(path.dirname(configPath));

  const existing = (await fs.pathExists(configPath))
    ? await fs.readFile(configPath, "utf8") : "";

  if (existing.includes("<!-- ms-skills -->")) { result.alreadyPresent = true; return result; }

  const skills = getSkillsByRole(role);
  const block  = buildSkillsMdBlock(skills, skillsDir);

  if (!dryRun) await fs.appendFile(configPath, "\n" + block + "\n", "utf8");
  result.patched = true;
  return result;
}

// ── MODE: cursor-rules ────────────────────────────────────────────────────────

async function patchCursorRules(rulesDir, dryRun, result, role, skillsDir) {
  const msDir = path.join(rulesDir, "dev-needs");
  if (await fs.pathExists(msDir)) { result.alreadyPresent = true; return result; }

  const skills = getSkillsByRole(role);
  if (!dryRun) {
    await fs.ensureDir(msDir);
    for (const skill of skills) {
      await fs.writeFile(path.join(msDir, `${skill.id}.mdc`), buildCursorMdc(skill, skillsDir), "utf8");
    }
  }
  result.patched = true;
  result.path = msDir;
  return result;
}

// ── MODE: cody-yaml ───────────────────────────────────────────────────────────

async function patchCodyYaml(configPath, dryRun, result, role, skillsDir) {
  await fs.ensureDir(path.dirname(configPath));
  if (await fs.pathExists(configPath)) { result.alreadyPresent = true; return result; }

  const skills = getSkillsByRole(role);
  if (!dryRun) await fs.writeFile(configPath, buildCodyYaml(skills, skillsDir), "utf8");
  result.patched = true;
  return result;
}

// ── MODE: aider-prompt ────────────────────────────────────────────────────────

async function patchAiderPrompt(configPath, dryRun, result, role, skillsDir) {
  const existing = (await fs.pathExists(configPath))
    ? await fs.readFile(configPath, "utf8") : "";

  if (existing.includes("<!-- ms-skills -->")) { result.alreadyPresent = true; return result; }

  const skills = getSkillsByRole(role);
  if (!dryRun) await fs.appendFile(configPath, "\n" + buildSkillsMdBlock(skills, skillsDir) + "\n", "utf8");
  result.patched = true;
  return result;
}

// ── MODE: continue-json ───────────────────────────────────────────────────────

async function patchContinueJson(configPath, dryRun, result, role, skillsDir) {
  let config = {};
  if (await fs.pathExists(configPath)) {
    try { config = await fs.readJson(configPath); } catch { config = {}; }
  } else {
    result.created = true;
    await fs.ensureDir(path.dirname(configPath));
  }

  const marker = "[Dev Skills]";
  if ((config.systemMessage || "").includes(marker)) { result.alreadyPresent = true; return result; }

  const skills  = getSkillsByRole(role);
  const summary = skills.map(s => `- ${s.name}: ${s.description}`).join("\n");
  const addition = `\n\n${marker}\nYou have access to Dev skills:\n${summary}\nSkills dir: ${skillsDir}`;

  if (!dryRun) {
    config.systemMessage = (config.systemMessage || "") + addition;
    await fs.writeJson(configPath, config, { spaces: 2 });
  }
  result.patched = true;
  return result;
}

async function unpatchContinueJson(configPath) {
  if (!(await fs.pathExists(configPath))) return false;
  const config = await fs.readJson(configPath);
  if (!config.systemMessage?.includes("[Dev Skills]")) return false;
  config.systemMessage = config.systemMessage.split("\n\n[Dev Skills]")[0];
  await fs.writeJson(configPath, config, { spaces: 2 });
  return true;
}

// ── MODE: copy ────────────────────────────────────────────────────────────────

async function patchCopy(configPath, dryRun, result, role, skillsDir) {
  await fs.ensureDir(path.dirname(configPath));
  const skills = getSkillsByRole(role);
  if (!dryRun) await fs.writeFile(configPath, buildOpenAiInstructions(skills, skillsDir), "utf8");
  result.patched = true;
  return result;
}

// ── Shared unpatch ────────────────────────────────────────────────────────────

async function unpatchMdFile(configPath, openTag, closeTag) {
  if (!(await fs.pathExists(configPath))) return false;
  let content = await fs.readFile(configPath, "utf8");
  const re    = new RegExp(`\\n?${openTag}[\\s\\S]*?${closeTag}\\n?`, "g");
  const cleaned = content.replace(re, "");
  if (cleaned === content) return false;
  await fs.writeFile(configPath, cleaned, "utf8");
  return true;
}

// ── Content builders ──────────────────────────────────────────────────────────

function buildSkillsMdBlock(skills, skillsDir) {
  const lines = skills.map(s =>
    `### ${s.name}\n- **Role:** ${s.role}  **Version:** ${s.version}\n- ${s.description}\n- **Triggers:** ${s.triggers?.join(", ") || "—"}\n- **File:** \`${skillsDir}/${path.basename(s.file)}\``
  );
  return [
    "<!-- ms-skills -->",
    "## Dev Skills",
    "",
    "You have access to the following Dev skills.",
    "Invoke them automatically when the trigger keywords appear in the user query.",
    "",
    ...lines,
    "",
    "<!-- /ms-skills -->",
  ].join("\n");
}

function buildCursorMdc(skill, skillsDir) {
  return `---
description: ${skill.description}
globs:
alwaysApply: false
---

# ${skill.name}

${skill.description}

**Triggers:** ${skill.triggers?.join(", ") || "—"}
**Role:** ${skill.role}   **Version:** ${skill.version}

Skill file: ${skillsDir}/${path.basename(skill.file)}
`;
}

function buildCodyYaml(skills, skillsDir) {
  const entries = skills.map(s =>
    `  - path: ${skillsDir}/${path.basename(s.file)}\n    description: "${s.name} — ${s.description.replace(/"/g, "'")}"`
  ).join("\n");
  return `# Dev Skills context for Cody\ncontextFiles:\n${entries}\n`;
}

function buildOpenAiInstructions(skills, skillsDir) {
  const lines = skills.map(s =>
    `- **${s.name}** (${s.role}): ${s.description} Triggers: ${s.triggers?.join(", ") || "—"}`
  );
  return [
    "# Dev Skills",
    "",
    "You have access to the following skills. Apply them when trigger keywords appear.",
    "",
    ...lines,
    "",
    `Skills directory: ${skillsDir}`,
    "",
    "---",
    "_Generated by dev-needs CLI._",
  ].join("\n");
}
