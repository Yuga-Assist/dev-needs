// lib/registry.js
// Central registry of all Dev skills with metadata

export const SKILLS_REGISTRY = {
  // ── Developer Skills ──────────────────────────────────────────────────────
  "bug-triage": {
    id: "bug-triage",
    name: "Bug Triage & RCA",
    role: "dev",
    category: "Developer Activity",
    description: "AI-assisted bug triaging, root cause analysis, and priority scoring using Jira JQL and Oracle MCP.",
    triggers: ["bug", "triage", "RCA", "root cause", "defect", "issue analysis"],
    version: "1.2.0",
    file: "skills/dev/bug-triage.md"
  },
  "code-review": {
    id: "code-review",
    name: "Code Review Assistant",
    role: "dev",
    category: "Developer Activity",
    description: "Automated code review with impact radius analysis, dead code detection, and refactoring suggestions.",
    triggers: ["code review", "PR review", "pull request", "diff", "refactor"],
    version: "1.0.0",
    file: "skills/dev/code-review.md"
  },
  "change-history-report": {
    id: "change-history-report",
    name: "Change History Report (CHR)",
    role: "dev",
    category: "Developer Activity",
    description: "Diagnose CHR issues — missing fields, wrong data, empty audit trails, audit table analysis.",
    triggers: ["CHR", "change history", "audit trail", "change log"],
    version: "1.1.0",
    file: "skills/dev/change-history-report.md"
  },
  "form-data-flow": {
    id: "form-data-flow",
    name: "Form Data Process Flow",
    role: "dev",
    category: "Platform Development",
    description: "Trace form submission lifecycle: UI → push tables → workflow → master tables. Covers versioning, region tables, and custom JS.",
    triggers: ["form", "push table", "submission", "data flow", "form lifecycle"],
    version: "1.0.0",
    file: "skills/dev/form-data-flow.md"
  },
  "karpathy-guidelines": {
    id: "karpathy-guidelines",
    name: "Karpathy Guidelines",
    role: "dev",
    category: "Developer Activity",
    description: "Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.",
    triggers: ["karpathy", "coding guidelines", "overcomplication", "simplicity", "surgical changes", "LLM mistakes", "code standards", "think before coding"],
    version: "1.0.0",
    file: "skills/dev/karpathy-guidelines.md"
  },

  // ── Support Skills ────────────────────────────────────────────────────────
  "infolet-debug": {
    id: "infolet-debug",
    name: "Infolet Debugger",
    role: "support",
    category: "Support Activity",
    description: "Troubleshoot SQL/Java/SP infolets — no data, not visible, workflow trigger not firing, profile parameter issues.",
    triggers: ["infolet", "metric", "no data", "not visible", "workflow trigger", "profile parameter"],
    version: "1.3.0",
    file: "skills/support/infolet-debug.md"
  },
  "workflow-debug": {
    id: "workflow-debug",
    name: "Workflow Debugger",
    role: "support",
    category: "Support Activity",
    description: "Debug workflow trigger failures, assignment loss, email not firing, slow performance across all modules.",
    triggers: ["workflow", "assignment", "email not triggered", "workflow issue", "assignment loss"],
    version: "1.2.0",
    file: "skills/support/workflow-debug.md"
  },
  "report-debug": {
    id: "report-debug",
    name: "Report Debugger",
    role: "support",
    category: "Support Activity",
    description: "Diagnose report failures — no data, export errors, filter issues, slow execution, column display problems.",
    triggers: ["report", "report export", "report filter", "no data", "report debug"],
    version: "1.1.0",
    file: "skills/support/report-debug.md"
  },
  "assignment-loss": {
    id: "assignment-loss",
    name: "Assignment Loss Investigation",
    role: "support",
    category: "Support Activity",
    description: "Investigate lost assignments — inactive users/roles, draft status drops, trail analysis, impact queries.",
    triggers: ["assignment lost", "assignment missing", "assignment drop", "inactive user"],
    version: "1.0.0",
    file: "skills/support/assignment-loss.md"
  },
  "orf-analysis": {
    id: "orf-analysis",
    name: "ORF Analysis",
    role: "support",
    category: "Support Activity",
    description: "Organization Restructuring Framework diagnostics — indexing, impact assessment, registration status, role scope blocking.",
    triggers: ["ORF", "org restructure", "impact assessment", "indexing queue"],
    version: "1.0.0",
    file: "skills/support/orf-analysis.md"
  },

  // ── Platform Skills ───────────────────────────────────────────────────────
  "oracle-db": {
    id: "oracle-db",
    name: "Oracle DB Expert",
    role: "platform",
    category: "Platform Development",
    description: "117 Oracle guides covering SQL, PL/SQL, performance tuning, security, ORDS, migrations, and more.",
    triggers: ["oracle", "SQL", "PL/SQL", "query", "database", "index", "execution plan"],
    version: "2.0.0",
    file: "skills/platform/oracle-db.md"
  },
  "oracle-exception": {
    id: "oracle-exception",
    name: "Oracle Exception Analyzer",
    role: "platform",
    category: "Platform Development",
    description: "Database-level root cause analysis for Oracle exceptions — stack traces, locks, wait events, slow queries.",
    triggers: ["ORA-", "exception", "oracle error", "lock", "deadlock", "slow query"],
    version: "1.0.0",
    file: "skills/platform/oracle-exception.md"
  },
  "bapi-sdu": {
    id: "bapi-sdu",
    name: "SDU / BAPI Analyzer",
    role: "platform",
    category: "Platform Development",
    description: "SDU/BAPI issue analysis with comprehensive error code detection across log files and Oracle MCP.",
    triggers: ["SDU", "BAPI", "batch", "DU upload", "DU batch", "bulk upload"],
    version: "1.0.0",
    file: "skills/platform/bapi-sdu.md"
  }
};

export const ROLES = {
  dev: {
    label: "Developer",
    description: "Bug triage, code review, form data flow, CHR analysis, coding guidelines",
    color: "cyan",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "dev").map(s => s.id)
  },
  support: {
    label: "Support Engineer",
    description: "Infolet, workflow, report, assignment loss, ORF debugging",
    color: "yellow",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "support").map(s => s.id)
  },
  platform: {
    label: "Platform Developer",
    description: "Oracle DB, exceptions, SDU/BAPI, deep platform analysis",
    color: "magenta",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "platform").map(s => s.id)
  },
  all: {
    label: "All Skills",
    description: "Full skill set — dev + support + platform",
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
