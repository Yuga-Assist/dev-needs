// lib/registry.js
// Central registry of all Dev skills with metadata

export const SKILLS_REGISTRY = {
  // ── Developer Skills ──────────────────────────────────────────────────────
  "bug-triage": {
    id: "bug-triage",
    name: "Bug Triage & RCA",
    role: "dev",
    category: "Developer Activity",
    description: "AI-assisted bug triaging, root cause analysis, and priority scoring.",
    triggers: ["bug", "triage", "RCA", "root cause", "defect", "issue analysis"],
    version: "1.2.0",
    file: "skills/dev/bug-triage.md"
  },
  "code-review": {
    id: "code-review",
    name: "Code Review Assistant",
    role: "dev",
    category: "Developer Activity",
    description: "Code review with impact analysis, dead code detection, and refactoring suggestions.",
    triggers: ["code review", "PR review", "pull request", "diff", "refactor"],
    version: "1.0.0",
    file: "skills/dev/code-review.md"
  },
  "change-history-report": {
    id: "change-history-report",
    name: "Change History Report",
    role: "dev",
    category: "Developer Activity",
    description: "Diagnose audit trail issues — missing fields, wrong data, empty change history.",
    triggers: ["change history", "audit trail", "change log", "field history"],
    version: "1.1.0",
    file: "skills/dev/change-history-report.md"
  },
  "form-data-flow": {
    id: "form-data-flow",
    name: "Form Data Process Flow",
    role: "dev",
    category: "Developer Activity",
    description: "Trace form submission lifecycle: UI → intermediate tables → workflow → master tables.",
    triggers: ["form", "submission", "data flow", "form lifecycle"],
    version: "1.0.0",
    file: "skills/dev/form-data-flow.md"
  },
  "karpathy-guidelines": {
    id: "karpathy-guidelines",
    name: "Karpathy Guidelines",
    role: "dev",
    category: "Developer Activity",
    description: "Behavioral guidelines to reduce common LLM coding mistakes — simplicity, surgical changes, verifiable goals.",
    triggers: ["karpathy", "coding guidelines", "overcomplication", "simplicity", "surgical changes", "code standards"],
    version: "1.0.0",
    file: "skills/dev/karpathy-guidelines.md"
  },
  "oracle-db": {
    id: "oracle-db",
    name: "Oracle DB Expert",
    role: "dev",
    category: "Database",
    description: "Comprehensive Oracle guides — SQL, PL/SQL, performance tuning, security, migrations, and more.",
    triggers: ["oracle", "SQL", "PL/SQL", "query", "database", "index", "execution plan"],
    version: "2.0.0",
    file: "skills/platform/oracle-db.md"
  },
  "oracle-exception": {
    id: "oracle-exception",
    name: "Oracle Exception Analyzer",
    role: "dev",
    category: "Database",
    description: "Root cause analysis for Oracle exceptions — stack traces, locks, wait events, slow queries.",
    triggers: ["ORA-", "exception", "oracle error", "lock", "deadlock", "slow query"],
    version: "1.0.0",
    file: "skills/platform/oracle-exception.md"
  },
  "bapi-sdu": {
    id: "bapi-sdu",
    name: "SDU / BAPI Analyzer",
    role: "dev",
    category: "Integration",
    description: "Bulk data upload and API issue analysis — error code detection, batch failures, retry logic.",
    triggers: ["SDU", "BAPI", "batch", "bulk upload", "data upload"],
    version: "1.0.0",
    file: "skills/platform/bapi-sdu.md"
  },

  // ── Support Skills ────────────────────────────────────────────────────────
  "infolet-debug": {
    id: "infolet-debug",
    name: "Dashboard Widget Debugger",
    role: "support",
    category: "Support Activity",
    description: "Troubleshoot dashboard metrics/widgets — no data, not visible, trigger not firing, profile parameter issues.",
    triggers: ["infolet", "dashboard", "widget", "metric", "no data", "not visible"],
    version: "1.3.0",
    file: "skills/support/infolet-debug.md"
  },
  "workflow-debug": {
    id: "workflow-debug",
    name: "Workflow Debugger",
    role: "support",
    category: "Support Activity",
    description: "Debug workflow trigger failures, assignment loss, email not firing, slow performance.",
    triggers: ["workflow", "assignment", "email not triggered", "workflow issue", "assignment loss"],
    version: "1.2.0",
    file: "skills/support/workflow-debug.md"
  },
  "report-debug": {
    id: "report-debug",
    name: "Report Debugger",
    role: "support",
    category: "Support Activity",
    description: "Diagnose report failures — no data, export errors, filter issues, slow execution.",
    triggers: ["report", "report export", "report filter", "no data", "report debug"],
    version: "1.1.0",
    file: "skills/support/report-debug.md"
  },
  "assignment-loss": {
    id: "assignment-loss",
    name: "Assignment Loss Investigation",
    role: "support",
    category: "Support Activity",
    description: "Investigate lost assignments — inactive users/roles, draft status drops, trail analysis.",
    triggers: ["assignment lost", "assignment missing", "assignment drop", "inactive user"],
    version: "1.0.0",
    file: "skills/support/assignment-loss.md"
  },
  "orf-analysis": {
    id: "orf-analysis",
    name: "Org Restructure Analysis",
    role: "support",
    category: "Support Activity",
    description: "Organization restructuring diagnostics — indexing, impact assessment, registration status, role scope.",
    triggers: ["org restructure", "impact assessment", "indexing queue", "role scope"],
    version: "1.0.0",
    file: "skills/support/orf-analysis.md"
  }
};

export const ROLES = {
  dev: {
    label: "Developer",
    description: "Bug triage, code review, form data flow, audit trails, coding guidelines, Oracle DB",
    color: "cyan",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "dev").map(s => s.id)
  },
  support: {
    label: "Support Engineer",
    description: "Dashboard widgets, workflows, reports, assignment tracking, org restructuring",
    color: "yellow",
    skills: Object.values(SKILLS_REGISTRY).filter(s => s.role === "support").map(s => s.id)
  },
  all: {
    label: "All Skills",
    description: "Full skill set — dev + support",
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
