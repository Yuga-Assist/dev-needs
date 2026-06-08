import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("manifest exports role=support, version, skillsDir, skills array", async () => {
  const { manifest } = await import("../index.js");
  assert.equal(manifest.role, "support");
  assert.ok(manifest.version.match(/^\d+\.\d+\.\d+$/));
  assert.ok(fs.existsSync(manifest.skillsDir));
  assert.ok(Array.isArray(manifest.skills));
  assert.ok(manifest.skills.length > 0);
});

test("every skill file referenced in manifest exists", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    const filePath = path.join(manifest.skillsDir, skill.file);
    assert.ok(fs.existsSync(filePath), `missing: ${skill.file}`);
  }
});

test("every skill has id, name, file, category", async () => {
  const { manifest } = await import("../index.js");
  for (const skill of manifest.skills) {
    assert.ok(skill.id);
    assert.ok(skill.name);
    assert.ok(skill.file);
    assert.ok(skill.category);
  }
});
