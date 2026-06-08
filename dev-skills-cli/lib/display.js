// lib/display.js
// Terminal UI helpers — banner, editor picker table, progress, summaries

import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import { ROLES } from "./registry.js";

const ACCENT_COLOR = "#FF6B35";

// ── Banner ─────────────────────────────────────────────────────────────────────

export function printBanner() {
  const logo = chalk.hex(ACCENT_COLOR).bold(`
  ██████╗ ███████╗██╗   ██╗
  ██╔══██╗██╔════╝██║   ██║
  ██║  ██║█████╗  ██║   ██║
  ██║  ██║██╔══╝  ╚██╗ ██╔╝
  ██████╔╝███████╗ ╚████╔╝
  ╚═════╝ ╚══════╝  ╚═══╝  `) + chalk.white.bold("Skills CLI\n");

  const subtitle = chalk.gray("  Dev AI Skills Installer\n");

  console.log(
    boxen(logo + subtitle, {
      padding: { top: 0, bottom: 0, left: 1, right: 2 },
      borderStyle: "round",
      borderColor: ACCENT_COLOR,
      margin: { top: 1, bottom: 1 },
    })
  );
}

// ── Editor selector ────────────────────────────────────────────────────────────

export function printEditorList(editors, detectedMap) {
  console.log(chalk.bold("\n  Available AI editors:\n"));
  for (const editor of editors) {
    const found  = detectedMap[editor.id];
    const badge  = found ? chalk.green("● installed") : chalk.gray("○ not found");
    const icon   = editor.icon || "  ";
    console.log(`  ${icon}  ${chalk.white.bold(editor.label.padEnd(28))} ${badge}`);
    console.log(`      ${chalk.gray(editor.description)}\n`);
  }
}

// ── Role selector ──────────────────────────────────────────────────────────────

export function printRoles() {
  console.log(chalk.bold("\n  Available skill roles:\n"));
  for (const [key, role] of Object.entries(ROLES)) {
    const badge = chalk.hex(ACCENT_COLOR)(`[${key}]`).padEnd(16);
    console.log(`  ${badge} ${chalk.white.bold(role.label)}`);
    console.log(`  ${"".padEnd(14)}${chalk.gray(role.description)}\n`);
  }
}

// ── Skill list ────────────────────────────────────────────────────────────────

export function printSkillList(skills, { showRole = false } = {}) {
  console.log("");
  const header = showRole
    ? `  ${"SKILL".padEnd(34)} ${"ROLE".padEnd(10)} ${"VER".padEnd(8)}  DESCRIPTION`
    : `  ${"SKILL".padEnd(34)} ${"VER".padEnd(8)}  DESCRIPTION`;
  console.log(chalk.gray(header));
  console.log(chalk.gray("  " + "─".repeat(90)));

  for (const skill of skills) {
    const name    = chalk.white(skill.name.padEnd(33));
    const version = chalk.gray(("v" + skill.version).padEnd(8));
    const desc    = chalk.gray(truncate(skill.description, 50));
    if (showRole) {
      const rc = { dev: "cyan", support: "yellow", platform: "magenta" }[skill.role] || "white";
      console.log(`  ${name} ${chalk[rc](skill.role.padEnd(9))} ${version}  ${desc}`);
    } else {
      console.log(`  ${name} ${version}  ${desc}`);
    }
  }
  console.log("");
}

// ── Install progress ───────────────────────────────────────────────────────────

export function printSkillProgress(skill, status) {
  const icon  = status === "updated" ? chalk.yellow(figures.arrowRight) : chalk.green(figures.tick);
  const label = status === "updated" ? chalk.yellow("updated") : chalk.green("installed");
  console.log(`  ${icon} ${chalk.white(skill.name)} ${chalk.gray(`(${skill.category})`)} — ${label}`);
}

// ── Patch result ───────────────────────────────────────────────────────────────

export function printPatchResult(label, result) {
  if (result.error) {
    console.log(`  ${chalk.red(figures.cross)}  ${label} — ${chalk.red(result.error)}`);
    return;
  }
  if (result.alreadyPresent) {
    console.log(`  ${chalk.gray(figures.bullet)}  ${label} — ${chalk.gray("already configured")}`);
  } else if (result.patched) {
    const created = result.created ? chalk.gray(" (created)") : "";
    console.log(`  ${chalk.green(figures.tick)}  ${label} — ${chalk.green("configured")}${created}`);
    if (result.note) {
      console.log(`     ${chalk.gray("→ " + result.note)}`);
    }
  } else {
    console.log(`  ${chalk.yellow(figures.warning)}  ${label} — ${chalk.yellow("skipped")}`);
  }
}

// ── Editor detection summary ───────────────────────────────────────────────────

export function printDetectedEditors(editors, detectedMap) {
  console.log(chalk.bold("\n  Detected editors on this machine:\n"));
  for (const editor of editors) {
    const found = detectedMap[editor.id];
    const icon  = found ? chalk.green(figures.tick) : chalk.gray(figures.cross);
    console.log(`  ${icon}  ${editor.icon || "  "} ${chalk.white(editor.label)}`);
  }
  console.log("");
}

// ── Success box ────────────────────────────────────────────────────────────────

export function printSuccess(role, skillCount, editorCount) {
  const msg = [
    chalk.green.bold(`\n  ${figures.tick} Done!  ${skillCount} skill${skillCount !== 1 ? "s" : ""} installed across ${editorCount} editor${editorCount !== 1 ? "s" : ""}.`),
    "",
    chalk.gray("  Restart the configured editors to activate skills."),
    "",
    chalk.gray("  Useful commands:"),
    chalk.gray("    npx @dev/skills list              — see all skills"),
    chalk.gray("    npx @dev/skills update            — pull latest versions"),
    chalk.gray("    npx @dev/skills add <id>          — add a single skill"),
    chalk.gray("    npx @dev/skills editors           — re-run editor selector"),
    chalk.gray("    npx @dev/skills remove            — uninstall everything"),
    "",
  ].join("\n");

  console.log(
    boxen(msg, {
      padding: { top: 0, bottom: 0, left: 1, right: 2 },
      borderStyle: "round",
      borderColor: "green",
      margin: { top: 1, bottom: 1 },
    })
  );
}

// ── Status ────────────────────────────────────────────────────────────────────

export function printInstalledStatus(meta) {
  if (!meta.installedAt) {
    console.log(chalk.yellow("\n  No skills installed yet. Run: npx @dev/skills install\n"));
    return;
  }
  const date   = new Date(meta.updatedAt || meta.installedAt).toLocaleString();
  const role   = chalk.hex(ACCENT_COLOR)(meta.role || "unknown");
  const count  = chalk.white.bold(meta.skills?.length || 0);
  const editors = (meta.editors || []).join(", ") || "none";

  console.log("");
  console.log(`  ${chalk.gray("Role:")}     ${role}`);
  console.log(`  ${chalk.gray("Skills:")}   ${count} installed`);
  console.log(`  ${chalk.gray("Editors:")}  ${chalk.cyan(editors)}`);
  console.log(`  ${chalk.gray("Updated:")}  ${chalk.gray(date)}`);
  console.log("");
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function printError(msg)   { console.error(`\n  ${chalk.red(figures.cross)} ${chalk.red.bold("Error:")} ${chalk.red(msg)}\n`); }
export function printWarning(msg) { console.warn(`  ${chalk.yellow(figures.warning)} ${chalk.yellow(msg)}`); }
export function printInfo(msg)    { console.log(`  ${chalk.cyan(figures.info)} ${chalk.gray(msg)}`); }

function truncate(str, len) {
  return str.length > len ? str.slice(0, len - 1) + "…" : str;
}
