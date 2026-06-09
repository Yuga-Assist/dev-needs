import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function countOracleGuides() {
  const dir = path.join(__dirname, "skills", "oracle-db-skills");
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(d, entry.name));
      else if (entry.name.endsWith(".md")) count++;
    }
  };
  walk(dir);
  return count;
}

export const manifest = {
  role:      "dev",
  version:   "1.0.0",
  skillsDir: path.join(__dirname, "skills"),
  skills: [
    // Developer Activity
    { id: "code-review",        name: "Code Review Assistant",      file: "code-review/SKILL.md",        category: "Developer Activity" },
    { id: "git-workflow",       name: "Git Workflow Guide",         file: "git-workflow/SKILL.md",       category: "Developer Activity" },
    { id: "unit-testing",       name: "Unit Testing Patterns",      file: "unit-testing/SKILL.md",       category: "Developer Activity" },
    { id: "security-checklist", name: "Security Checklist (OWASP)", file: "security-checklist/SKILL.md", category: "Developer Activity" },
    // Platform Development
    { id: "api-design",         name: "API Design Guidelines",      file: "api-design/SKILL.md",         category: "Platform Development" },
    { id: "oracle-db",          name: "Oracle DB Expert",           dir:  "oracle-db-skills",            category: "Platform Development", guideCount: countOracleGuides() },
    { id: "oracle-exception",   name: "Oracle Exception Analyzer",  file: "oracle-exception/SKILL.md",   category: "Platform Development" },
    { id: "java-debugging",     name: "Java Debugging Guide",       file: "java-debugging/SKILL.md",     category: "Platform Development" },
    { id: "appserver-tuning",   name: "App Server Tuning",          file: "appserver-tuning/SKILL.md",   category: "Platform Development" },
    { id: "cicd-pipeline",      name: "CI/CD Pipeline Guide",       file: "cicd-pipeline/SKILL.md",      category: "Platform Development" },
    { id: "schema-migration",   name: "Schema Migration Patterns",  file: "schema-migration/SKILL.md",   category: "Platform Development" },
    { id: "security-patching",  name: "Security Patching Guide",    file: "security-patching/SKILL.md",  category: "Platform Development" },
  ],
};
