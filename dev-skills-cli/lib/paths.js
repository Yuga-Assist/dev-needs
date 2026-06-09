// lib/paths.js
// Returns paths based on install scope: "local" (cwd) or "global" (home)

import os from "os";
import path from "path";

const HOME = os.homedir();

export function getPaths(scope = "global") {
  const base = scope === "local"
    ? path.join(process.cwd(), ".claude")
    : path.join(HOME, ".claude");

  return {
    SKILLS_DIR: path.join(base, "skills"),
    META_FILE:  path.join(base, ".skills-meta.json"),
  };
}

// Legacy exports kept for patcher.js (global default)
export const SKILLS_DIR = path.join(HOME, ".claude", "skills");
export const META_FILE  = path.join(HOME, ".claude", ".skills-meta.json");
