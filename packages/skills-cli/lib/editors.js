// lib/editors.js
// Registry of all supported AI editors/tools with config paths, detection,
// and patch strategies for each platform (win32 | darwin | linux).

import os from "os";
import path from "path";
import { existsSync } from "fs";

const HOME    = os.homedir();
const APPDATA  = process.env.APPDATA  || HOME;
const LOCALAPP = process.env.LOCALAPPDATA || HOME;

function byPlatform(paths) {
  const plat = process.platform;
  if (plat === "win32")  return paths.win32;
  if (plat === "darwin") return paths.darwin;
  return paths.linux;
}

// ── Editor definitions ────────────────────────────────────────────────────────
//
// patchMode values:
//   "json"           — read/write a JSON config file, set nested skillsKey array
//   "claude-md"      — append skills index to ~/.claude/CLAUDE.md
//   "cursor-rules"   — write one .mdc file per skill into ~/.cursor/rules/dev/
//   "cody-yaml"      — write ~/.cody/context.yaml referencing skill files
//   "aider-prompt"   — append skill summaries to ~/.aider.system.prompt.md
//   "continue-json"  — patch ~/.continue/config.json systemMessage field
//   "copy"           — write a standalone markdown file (no editor config patched)

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
    noteOnPatch: "Restart Claude Desktop to activate skills.",
  },

  "claude-code": {
    id:          "claude-code",
    label:       "Claude Code",
    description: "Anthropic CLI agentic coder  •  skills via ~/.claude/CLAUDE.md",
    icon:        "⚡",
    skillsKey:   null,
    patchMode:   "claude-md",
    configPaths: {
      win32:  path.join(HOME, ".claude", "CLAUDE.md"),
      darwin: path.join(HOME, ".claude", "CLAUDE.md"),
      linux:  path.join(HOME, ".claude", "CLAUDE.md"),
    },
    noteOnPatch: "~/.claude/CLAUDE.md updated. No restart needed — Claude Code reads it on every run.",
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
    noteOnPatch: "Skills written to ~/.cursor/rules/dev/. Restart Cursor to activate.",
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
      win32:  path.join(HOME, ".Dev", "openai-custom-instructions.md"),
      darwin: path.join(HOME, ".Dev", "openai-custom-instructions.md"),
      linux:  path.join(HOME, ".Dev", "openai-custom-instructions.md"),
    },
    noteOnPatch: "Copy ~/.dev/openai-custom-instructions.md into ChatGPT → Settings → Custom Instructions.",
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
    noteOnPatch: "Reload the Continue extension to activate skills.",
  },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getEditorConfigPath(editorId) {
  const editor = EDITORS[editorId];
  if (!editor) return null;
  return byPlatform(editor.configPaths);
}

export function detectEditor(editorId) {
  const configPath = getEditorConfigPath(editorId);
  if (!configPath) return false;
  // For directory-based modes (cursor-rules) the configPath is a dir
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
