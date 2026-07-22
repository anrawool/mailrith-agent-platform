#!/usr/bin/env node
/* global process */

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(packageRoot, "mailrith-email-marketing");
const requiredFiles = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/connections.md",
  "references/safety.md",
  "references/workflows.md",
];

for (const relativePath of requiredFiles) {
  await access(path.join(skillRoot, relativePath));
}

const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
if (!skill.startsWith("---\nname: mailrith-email-marketing\ndescription: ")) {
  throw new Error("SKILL.md must have the expected name and description frontmatter.");
}
if (/\bTODO\b/.test(skill) || skill.split("\n").length > 500) {
  throw new Error("SKILL.md must be complete and stay under 500 lines.");
}

process.stdout.write("Mailrith Agent Skill is valid.\n");
