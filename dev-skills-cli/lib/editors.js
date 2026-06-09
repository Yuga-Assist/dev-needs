// lib/editors.js
// Supported editors, their config paths, and where skill folders are installed.
//
// Folder conventions
// ──────────────────
//   Claude editors  →  .claude/skills/    (local)   ~/.claude/skills/    (global)
//   Windsurf        →  .agents/           (local)   ~/.agents/           (global)
//
// Note: Cursor, Aider, and other editors that read from .agents/ are covered
// automatically when Windsurf is selected — no separate entry needed.

import os from "os";
import path from "path";
import { existsSync } from "fs";

const HOME    = os.homedir();
const APPDATA = process.env.APPDATA || HOME;

function byPlatform(map) {
  const p = process.platform;
  return p === "win32" ? map.win32 : p === "darwin" ? map.darwin : map.linux;
}

// ── Editor definitions ────────────────────────────────────────────────────────

export const EDITORS = {

  "claude-code": {
    id:          "claude-code",
    label:       "Claude Code",
    description: "Anthropic CLI  •  skills in .claude/skills/",
    icon:        "⚡",
    patchMode:   "claude-md",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".claude", "CLAUDE.md"),
      darwin: path.join(HOME, ".claude", "CLAUDE.md"),
      linux:  path.join(HOME, ".claude", "CLAUDE.md"),
    },
    skillsDirs: {
      global: path.join(HOME, ".claude", "skills"),
      local:  ".claude/skills",
    },
    noteOnPatch: "No restart needed — Claude Code reads .claude/ on every run.",
  },

  "claude-desktop": {
    id:          "claude-desktop",
    label:       "Claude Desktop",
    description: "Anthropic desktop app  •  skills in .claude/skills/",
    icon:        "🤖",
    patchMode:   "json",
    skillsKey:   "skillsDirectories",
    configPaths: {
      win32:  path.join(APPDATA, "Claude", "claude_desktop_config.json"),
      darwin: path.join(HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      linux:  path.join(HOME, ".config", "Claude", "claude_desktop_config.json"),
    },
    skillsDirs: {
      global: path.join(HOME, ".claude", "skills"),
      local:  ".claude/skills",
    },
    noteOnPatch: "Restart Claude Desktop to activate skills.",
  },

  "windsurf": {
    id:          "windsurf",
    label:       "Windsurf (Cascade)",
    description: "Codeium AI editor  •  skills in .agents/",
    icon:        "🏄",
    patchMode:   "json",
    skillsKey:   "cascade.skillsDirectories",
    configPaths: {
      win32:  path.join(APPDATA, "Windsurf", "User", "settings.json"),
      darwin: path.join(HOME, "Library", "Application Support", "Windsurf", "User", "settings.json"),
      linux:  path.join(HOME, ".config", "Windsurf", "User", "settings.json"),
    },
    skillsDirs: {
      global: path.join(HOME, ".agents", "skills"),
      local:  ".agents/skills",
    },
    noteOnPatch: "Restart Windsurf to activate skills.",
  },

  "cursor": {
    id:          "cursor",
    label:       "Cursor",
    description: "AI-first editor  •  skills in .agents/",
    icon:        "🖱️",
    patchMode:   "none",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".cursor"),
      darwin: path.join(HOME, ".cursor"),
      linux:  path.join(HOME, ".cursor"),
    },
    skillsDirs: {
      global: path.join(HOME, ".agents", "skills"),
      local:  ".agents/skills",
    },
    noteOnPatch: "Skills copied to .agents/ — configure Cursor to read from there.",
  },

  "aider": {
    id:          "aider",
    label:       "Aider",
    description: "Terminal AI coder  •  skills in .agents/",
    icon:        "🛠️",
    patchMode:   "none",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".aider"),
      darwin: path.join(HOME, ".aider"),
      linux:  path.join(HOME, ".aider"),
    },
    skillsDirs: {
      global: path.join(HOME, ".agents", "skills"),
      local:  ".agents/skills",
    },
    noteOnPatch: "Skills copied to .agents/ — configure Aider to read from there.",
  },

  "openai": {
    id:          "openai",
    label:       "OpenAI / ChatGPT",
    description: "ChatGPT / Codex  •  skills in .agents/",
    icon:        "🧠",
    patchMode:   "none",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".openai"),
      darwin: path.join(HOME, ".openai"),
      linux:  path.join(HOME, ".openai"),
    },
    skillsDirs: {
      global: path.join(HOME, ".agents", "skills"),
      local:  ".agents/skills",
    },
    noteOnPatch: "Skills copied to .agents/ — reference them in your OpenAI custom instructions.",
  },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getEditorConfigPath(editorId) {
  const editor = EDITORS[editorId];
  if (!editor) return null;
  return byPlatform(editor.configPaths);
}

export function getEditorSkillsDir(editorId, scope = "global") {
  const editor = EDITORS[editorId];
  if (!editor?.skillsDirs) return null;
  return scope === "local"
    ? path.resolve(process.cwd(), editor.skillsDirs.local)
    : editor.skillsDirs.global;
}

export function detectEditor(editorId) {
  const configPath = getEditorConfigPath(editorId);
  if (!configPath) return false;
  return existsSync(configPath) || existsSync(path.dirname(configPath));
}

export function detectAllEditors() {
  return Object.fromEntries(
    Object.keys(EDITORS).map(id => [id, detectEditor(id)])
  );
}

export function getEditorById(id) { return EDITORS[id] || null; }
export function getAllEditors()    { return Object.values(EDITORS); }
