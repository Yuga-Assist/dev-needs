// lib/paths.js
// Shared path constants for the skills directory and metadata file.

import os from "os";
import path from "path";

const HOME = os.homedir();

export const SKILLS_DIR = path.join(HOME, ".claude", "skills");
export const META_FILE  = path.join(HOME, ".claude", ".skills-meta.json");

export function getSkillFilePath(filename) {
  return path.join(SKILLS_DIR, filename);
}
