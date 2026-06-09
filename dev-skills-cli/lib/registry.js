// lib/registry.js
// Central registry — derived from skills/ folder structure.
// role "dev"     → skills/dev/<id>/
// role "support" → skills/support/<id>/

export const SKILLS_REGISTRY = {

  // ── Developer Skills (skills-dev) ─────────────────────────────────────────

  "bug-triage": {
    id:          "bug-triage",
    name:        "Bug Triage & RCA",
    role:        "dev",
    category:    "Developer Activity",
    description: "AI-assisted bug triaging, root cause analysis, and priority scoring.",
    triggers:    ["bug", "triage", "RCA", "root cause", "defect", "issue analysis"],
    version:     "1.2.0",
    dir:         "dev/bug-triage",
  },

  "code-review": {
    id:          "code-review",
    name:        "Code Review Assistant",
    role:        "dev",
    category:    "Developer Activity",
    description: "Thorough code review checklist covering correctness, security, performance, and readability.",
    triggers:    ["code review", "PR review", "pull request", "diff", "refactor"],
    version:     "1.0.0",
    dir:         "dev/code-review",
  },

  "git-workflow": {
    id:          "git-workflow",
    name:        "Git Workflow Guide",
    role:        "dev",
    category:    "Developer Activity",
    description: "Branch naming, conventional commits, PR templates, merge vs rebase, release tagging.",
    triggers:    ["git", "branch", "commit", "merge", "rebase", "pull request", "tag"],
    version:     "1.0.0",
    dir:         "dev/git-workflow",
  },

  "unit-testing": {
    id:          "unit-testing",
    name:        "Unit Testing Patterns",
    role:        "dev",
    category:    "Developer Activity",
    description: "AAA pattern, test naming, mocking best practices, TDD approach, coverage goals.",
    triggers:    ["unit test", "test", "spec", "mock", "TDD", "coverage", "assert"],
    version:     "1.0.0",
    dir:         "dev/unit-testing",
  },

  "security-checklist": {
    id:          "security-checklist",
    name:        "Security Checklist",
    role:        "dev",
    category:    "Developer Activity",
    description: "OWASP Top 10, input validation, SQL injection, XSS, auth, secrets management.",
    triggers:    ["security", "OWASP", "injection", "XSS", "auth", "secret", "vulnerability", "CVE"],
    version:     "1.0.0",
    dir:         "dev/security-checklist",
  },

  "karpathy-guidelines": {
    id:          "karpathy-guidelines",
    name:        "Karpathy Guidelines",
    role:        "dev",
    category:    "Developer Activity",
    description: "Behavioral guidelines to reduce LLM coding mistakes — simplicity, surgical changes, verifiable goals.",
    triggers:    ["karpathy", "coding guidelines", "overcomplication", "simplicity", "surgical changes", "code standards"],
    version:     "1.0.0",
    dir:         "dev/karpathy-guidelines",
  },

  // ── Support Skills (skills-support) ──────────────────────────────────────

  "log-analysis": {
    id:          "log-analysis",
    name:        "Log Analysis Guide",
    role:        "support",
    category:    "Support Activity",
    description: "Reading stack traces, grep patterns, cross-service correlation, root cause vs symptom.",
    triggers:    ["log", "error log", "stack trace", "exception", "log analysis", "debug log"],
    version:     "1.0.0",
    dir:         "support/log-analysis",
  },

  "performance-triage": {
    id:          "performance-triage",
    name:        "Performance Triage",
    role:        "support",
    category:    "Support Activity",
    description: "Identify bottleneck (CPU/memory/IO/DB), N+1 detection, connection pool, profiling approach.",
    triggers:    ["performance", "slow", "timeout", "latency", "memory", "CPU", "bottleneck", "N+1"],
    version:     "1.0.0",
    dir:         "support/performance-triage",
  },

  "incident-response": {
    id:          "incident-response",
    name:        "Incident Response",
    role:        "support",
    category:    "Support Activity",
    description: "P1-P3 severity classification, first-15-min checklist, communication templates, postmortem format.",
    triggers:    ["incident", "outage", "down", "P1", "P2", "severity", "escalation", "postmortem"],
    version:     "1.0.0",
    dir:         "support/incident-response",
  },

};

export const ROLES = {
  dev: {
    label:       "Developer",
    description: "Code review, git workflow, testing, security, bug triage, coding guidelines",
    color:       "cyan",
    skills:      Object.values(SKILLS_REGISTRY).filter(s => s.role === "dev").map(s => s.id),
  },
  support: {
    label:       "Support Engineer",
    description: "Log analysis, performance triage, incident response",
    color:       "yellow",
    skills:      Object.values(SKILLS_REGISTRY).filter(s => s.role === "support").map(s => s.id),
  },
  all: {
    label:       "All Skills",
    description: "Full skill set — dev + support",
    color:       "green",
    skills:      Object.keys(SKILLS_REGISTRY),
  },
};

export function getSkillsByRole(role) {
  if (role === "all") return Object.values(SKILLS_REGISTRY);
  return Object.values(SKILLS_REGISTRY).filter(s => s.role === role);
}

export function getSkillById(id) {
  return SKILLS_REGISTRY[id] || null;
}
