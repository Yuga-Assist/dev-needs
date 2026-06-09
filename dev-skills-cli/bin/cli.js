#!/usr/bin/env node
// bin/cli.js — Dev Skills CLI
// Usage: npx @dev/skills [command] [options]

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
  installSkills, installSingleSkill, uninstallSkills,
  getInstalledMeta,
} from "../lib/installer.js";

import {
  patchAllEditors, unpatchAllEditors,
} from "../lib/patcher.js";

import {
  getAllEditors, detectAllEditors, getInstalledEditors,
} from "../lib/editors.js";

import { SKILLS_REGISTRY, getSkillsByRole, ROLES } from "../lib/registry.js";

// ── Shared: pick role interactively ──────────────────────────────────────────

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

// ── Shared: pick editors interactively ───────────────────────────────────────

async function pickEditors(preselected) {
  // If --editors flag was passed as comma-separated list, use it directly
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
      // pre-tick editors that were detected
      initial: detectedMap[e.id],
    })),
  });

  const selected = await prompt.run();
  if (!selected || selected.length === 0) {
    printWarning("No editors selected — skills will be installed to ~/.dev/skills/ only.");
  }
  return selected || [];
}

// ── install ───────────────────────────────────────────────────────────────────

async function cmdInstall(options) {
  printBanner();

  // Step 1: role
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

  // Step 2: editors
  let editorIds;
  try {
    editorIds = await pickEditors(options.editors);
  } catch {
    printError("Selection cancelled.");
    process.exit(1);
  }

  // Step 3: install skill files
  console.log(`\n  Installing ${ROLES[role].label} skills:\n`);
  const results = await installSkills(role, {
    onProgress: (skill, status) => printSkillProgress(skill, status),
  });

  // Step 4: patch editors
  if (editorIds.length > 0) {
    console.log("\n  Configuring editors:\n");
    const patchResults = await patchAllEditors(editorIds, {
      dryRun: options.dryRun || false,
      role,
    });
    for (const pr of patchResults) {
      printPatchResult(`${pr.label || pr.editorId}`, pr);
    }
  }

  // Step 5: save meta
  const meta = await getInstalledMeta();
  meta.editors = editorIds;
  const { META_FILE } = await import("../lib/paths.js");
  const fs = (await import("fs-extra")).default;
  await fs.writeJson(META_FILE, { ...meta, updatedAt: new Date().toISOString() }, { spaces: 2 });

  printSuccess(role, results.length, editorIds.length);
}

// ── update ────────────────────────────────────────────────────────────────────

async function cmdUpdate() {
  printBanner();

  const meta = await getInstalledMeta();
  if (!meta.installedAt) {
    printError("No skills installed yet. Run: npx @dev/skills install");
    process.exit(1);
  }

  console.log(`\n  Updating ${meta.role} skills…\n`);
  const results = await installSkills(meta.role, {
    onProgress: (skill, status) => printSkillProgress(skill, status),
  });

  printSuccess(meta.role, results.length, (meta.editors || []).length);
}

// ── editors ───────────────────────────────────────────────────────────────────
// Re-run editor selection and patch without reinstalling skills

async function cmdEditors(options) {
  printBanner();

  const meta = await getInstalledMeta();
  if (!meta.installedAt) {
    printError("No skills installed yet. Run: npx @dev/skills install");
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

  console.log("\n  Configuring editors:\n");
  const patchResults = await patchAllEditors(editorIds, {
    role: meta.role || "all",
  });
  for (const pr of patchResults) {
    printPatchResult(`${pr.label || pr.editorId}`, pr);
  }

  const fs = (await import("fs-extra")).default;
  const { META_FILE } = await import("../lib/paths.js");
  await fs.writeJson(META_FILE, { ...meta, editors: editorIds, updatedAt: new Date().toISOString() }, { spaces: 2 });
  console.log("");
}

// ── list ──────────────────────────────────────────────────────────────────────

async function cmdList(options) {
  printBanner();
  const meta = await getInstalledMeta();
  printInstalledStatus(meta);

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
    const { skill, dest } = await installSingleSkill(skillId);
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
        message: "Remove all Dev skills and all editor config patches?",
        initial: false,
      });
      const ok = await prompt.run();
      if (!ok) { console.log("\n  Cancelled.\n"); process.exit(0); }
    } catch { process.exit(1); }
  }

  const spinner = ora({ text: "Removing skills and editor configs…", color: "red" }).start();
  await uninstallSkills();
  await unpatchAllEditors();
  spinner.succeed("All Dev skills and editor configs removed.");
  console.log("");
}

// ── status ────────────────────────────────────────────────────────────────────

async function cmdStatus() {
  printBanner();
  const meta       = await getInstalledMeta();
  const allEditors = getAllEditors();
  const detected   = detectAllEditors();

  printInstalledStatus(meta);
  printDetectedEditors(allEditors, detected);
}

// ── which ─────────────────────────────────────────────────────────────────────

async function cmdWhich() {
  const { SKILLS_DIR, META_FILE } = await import("../lib/paths.js");
  const { getEditorConfigPath } = await import("../lib/editors.js");
  const allEditors = getAllEditors();

  console.log("");
  printInfo(`Skills dir : ${SKILLS_DIR}`);
  printInfo(`Meta file  : ${META_FILE}`);
  console.log("");
  for (const editor of allEditors) {
    const p = getEditorConfigPath(editor.id);
    printInfo(`${(editor.icon + " " + editor.label).padEnd(32)} ${p}`);
  }
  console.log("");
}

// ── Program ───────────────────────────────────────────────────────────────────

program
  .name("ms-skills")
  .description("Dev AI Skills CLI")
  .version("1.1.0");

program
  .command("install")
  .description("Interactive install: choose role + editors")
  .option("-r, --role <role>",       `Role: ${Object.keys(ROLES).join(" | ")}`)
  .option("-e, --editors <editors>", "Comma-separated editor IDs (skips picker)")
  .option("--dry-run",               "Preview config changes without writing")
  .action(cmdInstall);

program
  .command("update")
  .description("Update installed skills to latest")
  .action(cmdUpdate);

program
  .command("editors")
  .description("Re-run editor selector and patch configs (no skill reinstall)")
  .option("-e, --editors <editors>", "Comma-separated editor IDs (skips picker)")
  .action(cmdEditors);

program
  .command("list")
  .description("List available skills")
  .option("-r, --role <role>", "Filter by role: dev | all")
  .action(cmdList);

program
  .command("add [skillId]")
  .description("Add a single skill by ID")
  .action(cmdAdd);

program
  .command("remove")
  .description("Remove all skills and editor configs")
  .option("-y, --yes", "Skip confirmation")
  .action(cmdRemove);

program
  .command("status")
  .description("Show install status and detected editors")
  .action(cmdStatus);

program
  .command("which")
  .description("Show all resolved config paths for this machine")
  .action(cmdWhich);

// Default: interactive install
if (process.argv.length <= 2) {
  cmdInstall({}).catch(e => { printError(e.message); process.exit(1); });
} else {
  program.parseAsync(process.argv).catch(e => { printError(e.message); process.exit(1); });
}
