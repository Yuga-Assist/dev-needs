import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const manifest = {
  role:      "support",
  version:   "1.0.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    { id: "log-analysis",       name: "Log Analysis & Error Patterns", file: "log-analysis/SKILL.md",       category: "Support Activity" },
    { id: "performance-triage", name: "Performance Triage",            file: "performance-triage/SKILL.md", category: "Support Activity" },
  ],
};
