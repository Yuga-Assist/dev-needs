// lib/registry.js
// Central registry of all Dev skills with metadata

export const SKILLS_REGISTRY = {
  "bug-triage": {
    id: "bug-triage",
    name: "Bug Triage & RCA",
    role: "dev",
    category: "Developer Activity",
    description: "AI-assisted bug triaging, root cause analysis, and priority scoring.",
    triggers: ["bug", "triage", "RCA", "root cause", "defect", "issue analysis"],
    version: "1.2.0",
    dir: "dev/bug-triage"
  },
  "karpathy-guidelines": {
    id: "karpathy-guidelines",
    name: "Karpathy Guidelines",
    role: "dev",
    category: "Developer Activity",
    description: "Behavioral guidelines to reduce common LLM coding mistakes — simplicity, surgical changes, verifiable goals.",
    triggers: ["karpathy", "coding guidelines", "overcomplication", "simplicity", "surgical changes", "code standards"],
    version: "1.0.0",
    dir: "dev/karpathy-guidelines"
  }
};

export const ROLES = {
  dev: {
    label: "Developer",
    description: "Bug triage, root cause analysis, coding guidelines",
    color: "cyan",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "dev").map(s => s.id)
  },
  all: {
    label: "All Skills",
    description: "Full skill set",
    color: "green",
    skills: Object.keys(SKILLS_REGISTRY)
  }
};

export function getSkillsByRole(role) {
  if (role === "all") return Object.values(SKILLS_REGISTRY);
  return Object.values(SKILLS_REGISTRY).filter(s => s.role === role);
}

export function getSkillById(id) {
  return SKILLS_REGISTRY[id] || null;
}
