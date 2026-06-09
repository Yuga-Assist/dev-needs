// lib/paths.js
// Shared path constants for the skills directory and metadata file.
// Per-editor config paths live in editors.js.

import os from "os";
import path from "path";

const HOME = os.homedir();

export const SKILLS_DIR = path.join(HOME, ".Dev", "skills");
export const META_FILE  = path.join(HOME, ".Dev", ".skills-meta.json");

export function getSkillFilePath(relPath) {
  return path.join(SKILLS_DIR, relPath);
}
