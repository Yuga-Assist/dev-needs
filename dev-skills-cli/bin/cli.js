#!/usr/bin/env node
// bin/cli.js — Dev Skills CLI

import { program } from "commander";
import ora from "ora";
import enquirer from "enquirer";
const { Select, MultiSelect, Confirm } = enquirer;

import {
  printBanner, printRoles, printSkillList, printSkillProgress,
  printEditorList, printDetectedEditors, printPatchResult,
  printSuccess, printError, printWarning, printInfo, printInstalledStatus,
} from "../lib/display.js";

import {
  installSkills, installSingleSkill, uninstallSkills, getInstalledMeta,
} from "../lib/installer.js";

import { patchAllEditors, unpatchAllEditors } from "../lib/patcher.js";
import { getAllEditors, detectAllEditors } from "../lib/editors.js";
import { SKILLS_REGISTRY, getSkillsByRole, ROLES } from "../lib/registry.js";
import { getPaths } from "../lib/paths.js";
import { getEditorSkillsDir } from "../lib/editors.js";

// ── pick scope ────────────────────────────────────────────────────────────────

async function pickScope() {
  const prompt = new Select({
    name:    "scope",
    message: "Where do you want to install skills?",
    choices: [
      { name: "local",  message: "Local  — current project (./)" },
      { name: "global", message: "Global — home directory (~/)" },
    ],
  });
  return prompt.run();
}

// ── pick role ─────────────────────────────────────────────────────────────────

async function pickRole(preselected) {
  if (preselected && ROLES[preselected]) return preselected;
  printRoles();
  const prompt = new Select({
    name:    "role",
    message: "Which skill set do you want to install?",
    choices: Object.entries(ROLES).map(([key, r]) => ({
      name: key, message: `${r.label} — ${r.description}`,
    })),
  });
  return prompt.run();
}

// ── pick editors ──────────────────────────────────────────────────────────────

async function pickEditors(preselected) {
  if (preselected) {
    return preselected.split(",").map(s => s.trim()).filter(Boolean);
  }

  const allEditors  = getAllEditors();
  const detectedMap = detectAllEditors();

  printEditorList(allEditors, detectedMap);

  const prompt = new MultiSelect({
    name:    "editors",
    message: "Which AI editors do you want to configure? (Space to select, Enter to confirm)",
    choices: allEditors.map(e => ({
      name:    e.id,
      message: `${e.icon || "  "} ${e.label}`,
      hint:    detectedMap[e.id] ? "detected" : "",
      initial: detectedMap[e.id],
    })),
  });

  const selected = await prompt.run();
  return selected || [];
}

// ── install ───────────────────────────────────────────────────────────────────

async function cmdInstall(options) {
  printBanner();

  // Step 1: scope
  let scope;
  try {
    scope = await pickScope();
  } catch {
    printError("Selection cancelled.");
    process.exit(1);
  }

  const { SKILLS_DIR, META_FILE } = getPaths(scope);

  // Step 2: role
  let role;
  try {
    role = await pickRole(options.role);
  } catch {
    printError("Selection cancelled.");
    process.exit(1);
  }

  if (!ROLES[role]) {
    printError(`Unknown role "${role}". Valid: ${Object.keys(ROLES).join(", ")}`);
    process.exit(1);
  }

  // Step 3: pick editors
  let editorIds = [];
  try {
    editorIds = await pickEditors(options.editors);
  } catch {
    printError("Selection cancelled.");
    process.exit(1);
  }

  // Step 4: install skill folders into each editor's own skills directory
  console.log(`\n  Installing ${ROLES[role].label} skills:\n`);
  const { results, editorDirs } = await installSkills(role, {
    scope,
    editorIds,
    onProgress: (skill, status) => printSkillProgress(skill, status),
  });

  // Step 5: patch editor configs to reference the installed skills dir
  if (editorIds.length > 0) {
    console.log("\n  Configuring editors:\n");
    const patchResults = await patchAllEditors(editorIds, {
      dryRun: options.dryRun || false,
      role,
      scope,
    });
    for (const pr of patchResults) {
      printPatchResult(`${pr.label || pr.editorId}`, pr);
    }
  }

  const installSummary = editorDirs.map(e => e.dir).join(", ") || "no file-based editors";
  printSuccess(role, results.length, editorIds.length, installSummary);
}

// ── update ────────────────────────────────────────────────────────────────────

async function cmdUpdate() {
  printBanner();

  // Try local first, fall back to global
  let meta = await getInstalledMeta("local");
  let scope = "local";
  if (!meta.installedAt) {
    meta  = await getInstalledMeta("global");
    scope = "global";
  }
  if (!meta.installedAt) {
    printError("No skills installed yet. Run: npx github:Yuga-Assist/dev-needs install");
    process.exit(1);
  }

  console.log(`\n  Updating ${meta.role} skills (${scope})…\n`);
  const { results, editorDirs } = await installSkills(meta.role, {
    scope,
    editorIds: meta.editors || [],
    onProgress: (skill, status) => printSkillProgress(skill, status),
  });

  const summary = editorDirs.map(e => e.dir).join(", ") || "—";
  printSuccess(meta.role, results.length, (meta.editors || []).length, summary);
}

// ── editors ───────────────────────────────────────────────────────────────────

async function cmdEditors(options) {
  printBanner();

  const meta = await getInstalledMeta("global");
  if (!meta.installedAt) {
    printError("No global skills installed. Run: npx github:Yuga-Assist/dev-needs install");
    process.exit(1);
  }

  let editorIds;
  try {
    editorIds = await pickEditors(options.editors);
  } catch {
    printError("Selection cancelled.");
    process.exit(1);
  }

  if (editorIds.length === 0) {
    printWarning("No editors selected.");
    process.exit(0);
  }

  const { SKILLS_DIR: globalSD } = getPaths("global");
  console.log("\n  Configuring editors:\n");
  const patchResults = await patchAllEditors(editorIds, { role: meta.role || "all", skillsDir: globalSD });
  for (const pr of patchResults) {
    printPatchResult(`${pr.label || pr.editorId}`, pr);
  }

  const { META_FILE } = getPaths("global");
  const fs = (await import("fs-extra")).default;
  await fs.writeJson(META_FILE, { ...meta, editors: editorIds, updatedAt: new Date().toISOString() }, { spaces: 2 });
  console.log("");
}

// ── list ──────────────────────────────────────────────────────────────────────

async function cmdList(options) {
  printBanner();
  const filterRole = options.role || "all";
  const skills = getSkillsByRole(filterRole);

  if (skills.length === 0) {
    printWarning(`No skills found for role: ${filterRole}`);
    process.exit(0);
  }

  console.log(`  Skills available${filterRole !== "all" ? ` for role [${filterRole}]` : ""}:\n`);
  printSkillList(skills, { showRole: filterRole === "all" });
}

// ── add ───────────────────────────────────────────────────────────────────────

async function cmdAdd(skillId) {
  printBanner();

  let scope;
  try { scope = await pickScope(); } catch { process.exit(1); }

  if (!skillId) {
    try {
      const prompt = new Select({
        name:    "skill",
        message: "Which skill do you want to add?",
        choices: Object.values(SKILLS_REGISTRY).map(s => ({
          name: s.id, message: `${s.name} — ${s.description.slice(0, 60)}…`,
        })),
      });
      skillId = await prompt.run();
    } catch {
      printError("Selection cancelled.");
      process.exit(1);
    }
  }

  const spinner = ora({ text: `Installing ${skillId}…`, color: "yellow" }).start();
  try {
    const { skill, dest } = await installSingleSkill(skillId, scope);
    spinner.stop();
    printSkillProgress(skill, "installed");
    printInfo(`Installed to: ${dest}`);
    printInfo("Restart your AI editor to activate.");
  } catch (e) {
    spinner.fail(e.message);
    process.exit(1);
  }
}

// ── remove ────────────────────────────────────────────────────────────────────

async function cmdRemove(options) {
  printBanner();

  if (!options.yes) {
    try {
      const prompt = new Confirm({
        name: "confirm",
        message: "Remove all Dev skills (local + global)?",
        initial: false,
      });
      const ok = await prompt.run();
      if (!ok) { console.log("\n  Cancelled.\n"); process.exit(0); }
    } catch { process.exit(1); }
  }

  const meta = await getInstalledMeta();
  const editorIds = meta.editors?.length ? meta.editors : Object.keys((await import("../lib/editors.js")).EDITORS);
  const spinner = ora({ text: "Removing skills…", color: "red" }).start();
  await uninstallSkills(editorIds, "global");  // uninstallSkills now tries both scopes internally
  await unpatchAllEditors();
  spinner.succeed("Dev skills removed.");
  console.log("");
}

// ── status ────────────────────────────────────────────────────────────────────

async function cmdStatus() {
  printBanner();

  const localMeta  = await getInstalledMeta("local");
  const globalMeta = await getInstalledMeta("global");
  const allEditors = getAllEditors();
  const detected   = detectAllEditors();

  if (localMeta.installedAt) {
    printInfo(`Local install — ${getPaths("local").SKILLS_DIR}`);
    printInstalledStatus(localMeta);
  }
  if (globalMeta.installedAt) {
    printInfo(`Global install — ${getPaths("global").SKILLS_DIR}`);
    printInstalledStatus(globalMeta);
  }
  if (!localMeta.installedAt && !globalMeta.installedAt) {
    printWarning("No skills installed. Run: npx github:Yuga-Assist/dev-needs install");
  }

  printDetectedEditors(allEditors, detected);
}

// ── which ─────────────────────────────────────────────────────────────────────

async function cmdWhich() {
  const { getEditorConfigPath } = await import("../lib/editors.js");
  const allEditors = getAllEditors();

  console.log("");
  printInfo(`Local  skills : ${getPaths("local").SKILLS_DIR}`);
  printInfo(`Global skills : ${getPaths("global").SKILLS_DIR}`);
  console.log("");
  for (const editor of allEditors) {
    const p = getEditorConfigPath(editor.id);
    printInfo(`${(editor.icon + " " + editor.label).padEnd(32)} ${p}`);
  }
  console.log("");
}

// ── Program ───────────────────────────────────────────────────────────────────

program
  .name("dev-needs")
  .description("Dev AI Skills CLI")
  .version("1.2.0");

program
  .command("install")
  .description("Install skills — choose local (project) or global (home)")
  .option("-r, --role <role>",       `Role: ${Object.keys(ROLES).join(" | ")}`)
  .option("-e, --editors <editors>", "Comma-separated editor IDs (global scope only)")
  .option("--dry-run",               "Preview config changes without writing")
  .action(cmdInstall);

program
  .command("update")
  .description("Update installed skills to latest version")
  .action(cmdUpdate);

program
  .command("editors")
  .description("Re-configure editor integrations (global scope)")
  .option("-e, --editors <editors>", "Comma-separated editor IDs")
  .action(cmdEditors);

program
  .command("list")
  .description("List available skills")
  .option("-r, --role <role>", "Filter by role: dev | support | all")
  .action(cmdList);

program
  .command("add [skillId]")
  .description("Add a single skill by ID")
  .action(cmdAdd);

program
  .command("remove")
  .description("Remove installed skills")
  .option("-y, --yes", "Skip confirmation")
  .action(cmdRemove);

program
  .command("status")
  .description("Show install status and detected editors")
  .action(cmdStatus);

program
  .command("which")
  .description("Show all resolved paths for this machine")
  .action(cmdWhich);

// Default: interactive install
if (process.argv.length <= 2) {
  cmdInstall({}).catch(e => { printError(e.message); process.exit(1); });
} else {
  program.parseAsync(process.argv).catch(e => { printError(e.message); process.exit(1); });
}
