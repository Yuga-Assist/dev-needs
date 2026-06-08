import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("manifest exports role=dev, version, skillsDir, skills array", async () => {
  const { manifest } = await import("../index.js");
  assert.equal(manifest.role, "dev");
  assert.ok(manifest.version.match(/^\d+\.\d+\.\d+$/), "version is semver");
  assert.ok(fs.existsSync(manifest.skillsDir), "skillsDir exists");
  assert.ok(Array.isArray(manifest.skills), "skills is array");
  assert.ok(manifest.skills.length > 0, "at least one skill");
});

test("oracle-db dir skill: directory and SKILL.md exist", async () => {
  const { manifest } = await import("../index.js");
  const oracleSkill = manifest.skills.find(s => s.id === "oracle-db");
  assert.ok(oracleSkill, "oracle-db skill in manifest");
  assert.ok(oracleSkill.dir, "oracle-db has dir field");
  const dirPath = path.join(manifest.skillsDir, oracleSkill.dir);
  assert.ok(fs.existsSync(dirPath), `oracle-db dir missing: ${dirPath}`);
  const skillMd = path.join(dirPath, "SKILL.md");
  assert.ok(fs.existsSync(skillMd), `oracle-db SKILL.md missing: ${skillMd}`);
});

test("file-based skills have their SKILL.md files", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills.filter(s => s.file)) {
    const filePath = path.join(manifest.skillsDir, skill.file);
    assert.ok(fs.existsSync(filePath), `missing: ${skill.file}`);
  }
});

test("every skill has id, name, category", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    assert.ok(skill.id,       `skill missing id: ${JSON.stringify(skill)}`);
    assert.ok(skill.name,     `skill missing name: ${skill.id}`);
    assert.ok(skill.category, `skill missing category: ${skill.id}`);
  }
});
