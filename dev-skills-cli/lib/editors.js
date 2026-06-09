// lib/editors.js
// Supported editors, their config paths, and where skill folders are installed.
//
// Folder conventions
// ──────────────────
//   Claude editors  →  .claude/skills/    (local)   ~/.claude/skills/    (global)
//   Windsurf        →  .agents/           (local)   ~/.agents/           (global)
//   Cursor          →  .cursor/rules/     (local)   ~/.cursor/rules/     (global)
//   Aider           →  no folder copy — appends summaries to system prompt file
//   OpenAI          →  no folder copy — generates a standalone instructions file

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
    // Config file that gets patched (CLAUDE.md gets skill index appended)
    configPaths: {
      win32:  path.join(HOME, ".claude", "CLAUDE.md"),
      darwin: path.join(HOME, ".claude", "CLAUDE.md"),
      linux:  path.join(HOME, ".claude", "CLAUDE.md"),
    },
    // Where skill folders are copied — global: ~/.claude/skills/, local: <cwd>/.claude/skills/
    skillsDirs: {
      global: path.join(HOME, ".claude", "skills"),
      local:  ".claude/skills",   // relative to cwd, resolved at runtime
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
    // Shares the same skills folder as claude-code
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
    // Global: ~/.agents/,  Local: <cwd>/.agents/
    skillsDirs: {
      global: path.join(HOME, ".agents"),
      local:  ".agents",
    },
    noteOnPatch: "Restart Windsurf to activate skills.",
  },

  "cursor": {
    id:          "cursor",
    label:       "Cursor",
    description: "AI-first editor  •  skills as .mdc rules in .cursor/rules/",
    icon:        "🖱️",
    patchMode:   "cursor-rules",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".cursor", "rules"),
      darwin: path.join(HOME, ".cursor", "rules"),
      linux:  path.join(HOME, ".cursor", "rules"),
    },
    // cursor-rules patchMode writes .mdc files into the rules dir directly
    // no separate skillsDirs copy — patcher handles it
    skillsDirs: null,
    noteOnPatch: "Restart Cursor to activate .mdc rules.",
  },

  "aider": {
    id:          "aider",
    label:       "Aider",
    description: "Terminal AI coder  •  skill summaries in ~/.aider.system.prompt.md",
    icon:        "🛠️",
    patchMode:   "aider-prompt",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".aider.system.prompt.md"),
      darwin: path.join(HOME, ".aider.system.prompt.md"),
      linux:  path.join(HOME, ".aider.system.prompt.md"),
    },
    skillsDirs: null,   // no file copy — content appended to system prompt
    noteOnPatch: "Run aider with --system-prompt-file ~/.aider.system.prompt.md",
  },

  "openai": {
    id:          "openai",
    label:       "OpenAI / ChatGPT",
    description: "ChatGPT  •  generates custom-instructions.md to paste",
    icon:        "🧠",
    patchMode:   "copy",
    skillsKey:   null,
    configPaths: {
      win32:  path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
      darwin: path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
      linux:  path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
    },
    skillsDirs: null,   // generates a single file, no folder copy
    noteOnPatch: "Paste ~/.dev-needs/openai-custom-instructions.md → ChatGPT → Custom Instructions.",
  },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getEditorConfigPath(editorId) {
  const editor = EDITORS[editorId];
  if (!editor) return null;
  return byPlatform(editor.configPaths);
}

// Returns the absolute path where skill folders are copied for this editor.
// scope: "global" → home-based path
// scope: "local"  → cwd-based path
export function getEditorSkillsDir(editorId, scope = "global") {
  const editor = EDITORS[editorId];
  if (!editor?.skillsDirs) return null;

  if (scope === "local") {
    return path.resolve(process.cwd(), editor.skillsDirs.local);
  }
  return editor.skillsDirs.global;
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

export function getEditorById(id)  { return EDITORS[id] || null; }
export function getAllEditors()     { return Object.values(EDITORS); }
