// lib/patcher.js
// Patches editor config files to reference the installed skills directory.
//
// patchMode:
//   "json"       — write skillsDir path into a JSON config (claude-desktop, windsurf)
//   "claude-md"  — append skills index block to CLAUDE.md (claude-code)

import fs from "fs-extra";
import path from "path";
import { SKILLS_DIR as DEFAULT_SKILLS_DIR } from "./paths.js";
import { getEditorById, getEditorConfigPath, getAllEditors, getEditorSkillsDir } from "./editors.js";
import { getSkillsByRole } from "./registry.js";

// ── Main entry ────────────────────────────────────────────────────────────────

export async function patchEditor(editorId, { dryRun = false, role = "all", skillsDir, scope = "global" } = {}) {
  const sd     = skillsDir || getEditorSkillsDir(editorId, scope) || DEFAULT_SKILLS_DIR;
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
    case "json":       return patchJson(editor, configPath, dryRun, result, sd);
    case "claude-md":  return patchClaudeMd(configPath, dryRun, result, role, sd);
    default:
      throw new Error(`Unknown patchMode: ${editor.patchMode}`);
  }
}

export async function unpatchEditor(editorId) {
  const editor = getEditorById(editorId);
  if (!editor) return false;
  const configPath = getEditorConfigPath(editorId);

  switch (editor.patchMode) {
    case "json":      return unpatchJson(editor, configPath);
    case "claude-md": return unpatchMdFile(configPath, "<!-- ms-skills -->", "<!-- /ms-skills -->");
    default:          return false;
  }
}

export async function patchAllEditors(editorIds, options = {}) {
  const results = [];
  for (const id of editorIds) {
    try {
      results.push(await patchEditor(id, options));
    } catch (e) {
      results.push({ editorId: id, label: id, error: e.message });
    }
  }
  return results;
}

export async function unpatchAllEditors() {
  for (const e of getAllEditors()) {
    await unpatchEditor(e.id).catch(() => {});
  }
}

// ── MODE: json ────────────────────────────────────────────────────────────────
// Handles claude-desktop (skillsDirectories) and windsurf (cascade.skillsDirectories)

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
  const dirs    = Array.isArray(obj[lastKey]) ? obj[lastKey] : [];

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
  if (!Array.isArray(obj[lastKey])) return false;
  obj[lastKey] = obj[lastKey].filter(d => !d.includes(".agents") && !d.includes(".claude/skills"));
  await fs.writeJson(configPath, config, { spaces: 2 });
  return true;
}

// ── MODE: claude-md ───────────────────────────────────────────────────────────
// Appends a skills index block to CLAUDE.md listing all installed skill files.

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

async function unpatchMdFile(configPath, openTag, closeTag) {
  if (!(await fs.pathExists(configPath))) return false;
  const content = await fs.readFile(configPath, "utf8");
  const re      = new RegExp(`\\n?${openTag}[\\s\\S]*?${closeTag}\\n?`, "g");
  const cleaned = content.replace(re, "");
  if (cleaned === content) return false;
  await fs.writeFile(configPath, cleaned, "utf8");
  return true;
}

// ── Content builders ──────────────────────────────────────────────────────────

function buildSkillsMdBlock(skills, skillsDir) {
  const lines = skills.map(s => [
    `### ${s.name}`,
    `- **Role:** ${s.role}  **Version:** ${s.version}`,
    `- ${s.description}`,
    `- **Triggers:** ${s.triggers?.join(", ") || "—"}`,
    `- **File:** \`${skillsDir}/${s.id}/${s.id}.md\``,
  ].join("\n"));

  return [
    "<!-- ms-skills -->",
    "## Dev Skills",
    "",
    "Invoke these skills automatically when trigger keywords appear in the user query.",
    "",
    ...lines,
    "",
    "<!-- /ms-skills -->",
  ].join("\n");
}
