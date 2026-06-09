// lib/editors.js
// Registry of all supported AI editors with config paths, detection,
// native skills directories, and patch strategies per platform.

import os from "os";
import path from "path";
import { existsSync } from "fs";

const HOME     = os.homedir();
const APPDATA  = process.env.APPDATA     || HOME;
const LOCALAPP = process.env.LOCALAPPDATA || HOME;

function byPlatform(paths) {
  const plat = process.platform;
  if (plat === "win32")  return paths.win32;
  if (plat === "darwin") return paths.darwin;
  return paths.linux;
}

// ── Editor definitions ────────────────────────────────────────────────────────
//
// skillsDirs  — where skill FOLDERS are copied for this editor (null = no file copy)
// patchMode   — how the editor config is updated after file copy
//   "json"           — read/write a JSON config file, set nested skillsKey array
//   "claude-md"      — append skills index to CLAUDE.md
//   "cursor-rules"   — write one .mdc file per skill into rules dir
//   "cody-yaml"      — write context.yaml referencing skill files
//   "aider-prompt"   — append skill summaries to system prompt file
//   "continue-json"  — patch config.json systemMessage field
//   "copy"           — write a standalone markdown file

export const EDITORS = {

  "claude-desktop": {
    id:          "claude-desktop",
    label:       "Claude Desktop",
    description: "Anthropic desktop app  •  skillsDirectories in config JSON",
    icon:        "🤖",
    skillsKey:   "skillsDirectories",
    patchMode:   "json",
    configPaths: {
      win32:  path.join(APPDATA, "Claude", "claude_desktop_config.json"),
      darwin: path.join(HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      linux:  path.join(HOME, ".config", "Claude", "claude_desktop_config.json"),
    },
    skillsDirs: {
      win32:  path.join(HOME, ".claude", "skills"),
      darwin: path.join(HOME, ".claude", "skills"),
      linux:  path.join(HOME, ".claude", "skills"),
    },
    noteOnPatch: "Restart Claude Desktop to activate skills.",
  },

  "claude-code": {
    id:          "claude-code",
    label:       "Claude Code",
    description: "Anthropic CLI agentic coder  •  skills via ~/.claude/skills/",
    icon:        "⚡",
    skillsKey:   null,
    patchMode:   "claude-md",
    configPaths: {
      win32:  path.join(HOME, ".claude", "CLAUDE.md"),
      darwin: path.join(HOME, ".claude", "CLAUDE.md"),
      linux:  path.join(HOME, ".claude", "CLAUDE.md"),
    },
    skillsDirs: {
      win32:  path.join(HOME, ".claude", "skills"),
      darwin: path.join(HOME, ".claude", "skills"),
      linux:  path.join(HOME, ".claude", "skills"),
    },
    noteOnPatch: "~/.claude/CLAUDE.md updated. No restart needed.",
  },

  "windsurf": {
    id:          "windsurf",
    label:       "Windsurf (Cascade)",
    description: "Codeium AI editor  •  cascade.skillsDirectories in settings.json",
    icon:        "🏄",
    skillsKey:   "cascade.skillsDirectories",
    patchMode:   "json",
    configPaths: {
      win32:  path.join(APPDATA, "Windsurf", "User", "settings.json"),
      darwin: path.join(HOME, "Library", "Application Support", "Windsurf", "User", "settings.json"),
      linux:  path.join(HOME, ".config", "Windsurf", "User", "settings.json"),
    },
    skillsDirs: {
      win32:  path.join(APPDATA, "Windsurf", "User", "skills"),
      darwin: path.join(HOME, "Library", "Application Support", "Windsurf", "User", "skills"),
      linux:  path.join(HOME, ".config", "Windsurf", "User", "skills"),
    },
    noteOnPatch: "Restart Windsurf to activate skills.",
  },

  "cursor": {
    id:          "cursor",
    label:       "Cursor",
    description: "AI-first editor  •  skills as .mdc rules in ~/.cursor/rules/",
    icon:        "🖱️",
    skillsKey:   null,
    patchMode:   "cursor-rules",
    configPaths: {
      win32:  path.join(HOME, ".cursor", "rules"),
      darwin: path.join(HOME, ".cursor", "rules"),
      linux:  path.join(HOME, ".cursor", "rules"),
    },
    skillsDirs: null,   // cursor uses .mdc rules, not skill folder copies
    noteOnPatch: "Skills written as .mdc rules to ~/.cursor/rules/dev-needs/. Restart Cursor.",
  },

  "copilot": {
    id:          "copilot",
    label:       "GitHub Copilot (VS Code)",
    description: "VS Code Copilot  •  github.copilot.chat.codeGeneration.instructions",
    icon:        "🐙",
    skillsKey:   "github.copilot.chat.codeGeneration.instructions",
    patchMode:   "json",
    configPaths: {
      win32:  path.join(APPDATA, "Code", "User", "settings.json"),
      darwin: path.join(HOME, "Library", "Application Support", "Code", "User", "settings.json"),
      linux:  path.join(HOME, ".config", "Code", "User", "settings.json"),
    },
    skillsDirs: null,   // copilot embeds skill content in settings, no file copy
    noteOnPatch: "Reload VS Code window  →  Ctrl+Shift+P  →  'Reload Window'.",
  },

  "openai": {
    id:          "openai",
    label:       "OpenAI / ChatGPT",
    description: "ChatGPT / Codex CLI  •  generates custom-instructions.md to paste",
    icon:        "🧠",
    skillsKey:   null,
    patchMode:   "copy",
    configPaths: {
      win32:  path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
      darwin: path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
      linux:  path.join(HOME, ".dev-needs", "openai-custom-instructions.md"),
    },
    skillsDirs: null,
    noteOnPatch: "Copy ~/.dev-needs/openai-custom-instructions.md into ChatGPT → Custom Instructions.",
  },

  "cody": {
    id:          "cody",
    label:       "Cody (Sourcegraph)",
    description: "Sourcegraph Cody  •  skills via ~/.cody/context.yaml",
    icon:        "🔍",
    skillsKey:   null,
    patchMode:   "cody-yaml",
    configPaths: {
      win32:  path.join(HOME, ".cody", "context.yaml"),
      darwin: path.join(HOME, ".cody", "context.yaml"),
      linux:  path.join(HOME, ".cody", "context.yaml"),
    },
    skillsDirs: {
      win32:  path.join(HOME, ".cody", "skills"),
      darwin: path.join(HOME, ".cody", "skills"),
      linux:  path.join(HOME, ".cody", "skills"),
    },
    noteOnPatch: "Reload Cody extension to pick up new context files.",
  },

  "aider": {
    id:          "aider",
    label:       "Aider",
    description: "Terminal AI pair programmer  •  ~/.aider.system.prompt.md",
    icon:        "🛠️",
    skillsKey:   null,
    patchMode:   "aider-prompt",
    configPaths: {
      win32:  path.join(HOME, ".aider.system.prompt.md"),
      darwin: path.join(HOME, ".aider.system.prompt.md"),
      linux:  path.join(HOME, ".aider.system.prompt.md"),
    },
    skillsDirs: null,   // aider uses a single prompt file, no folder copy
    noteOnPatch: "Run aider with:  aider --system-prompt-file ~/.aider.system.prompt.md",
  },

  "continue": {
    id:          "continue",
    label:       "Continue",
    description: "Open-source AI assistant (VS Code / JetBrains)  •  ~/.continue/config.json",
    icon:        "▶️",
    skillsKey:   "systemMessage",
    patchMode:   "continue-json",
    configPaths: {
      win32:  path.join(HOME, ".continue", "config.json"),
      darwin: path.join(HOME, ".continue", "config.json"),
      linux:  path.join(HOME, ".continue", "config.json"),
    },
    skillsDirs: null,   // continue embeds content in config.json
    noteOnPatch: "Reload the Continue extension to activate skills.",
  },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getEditorConfigPath(editorId) {
  const editor = EDITORS[editorId];
  if (!editor) return null;
  return byPlatform(editor.configPaths);
}

export function getEditorSkillsDir(editorId, scope = "global", cwd = process.cwd()) {
  const editor = EDITORS[editorId];
  if (!editor?.skillsDirs) return null;
  if (scope === "local") {
    // local install: put skills in project .claude/skills (for claude-based editors)
    // or editor-specific local folder
    const localBase = editorId.startsWith("claude")
      ? path.join(cwd, ".claude", "skills")
      : path.join(cwd, `.${editorId}`, "skills");
    return localBase;
  }
  return byPlatform(editor.skillsDirs);
}

export function detectEditor(editorId) {
  const configPath = getEditorConfigPath(editorId);
  if (!configPath) return false;
  return existsSync(configPath) || existsSync(path.dirname(configPath));
}

export function detectAllEditors() {
  const result = {};
  for (const id of Object.keys(EDITORS)) {
    result[id] = detectEditor(id);
  }
  return result;
}

export function getEditorById(id)  { return EDITORS[id] || null; }
export function getAllEditors()     { return Object.values(EDITORS); }
export function getInstalledEditors() {
  return Object.values(EDITORS).filter(e => detectEditor(e.id));
}
