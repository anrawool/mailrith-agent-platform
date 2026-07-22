#!/usr/bin/env node
/* global process */

import { cp, lstat, mkdir, rename } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillName = "mailrith-email-marketing";
const sourceDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", skillName);

const fail = (message) => {
  process.stderr.write(`${message}\n`);
  process.exitCode = 2;
};

const parseArguments = (argv) => {
  const result = { agent: "codex", dryRun: false, target: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "install") continue;
    if (value === "--dry-run") {
      result.dryRun = true;
      continue;
    }
    if (value === "--agent" || value === "--target") {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`${value} requires a value.`);
      result[value.slice(2)] = next;
      index += 1;
      continue;
    }
    if (value === "--help") return { ...result, help: true };
    throw new Error(`Unknown option: ${value}`);
  }
  return result;
};

const defaultTarget = (agent) => {
  if (agent === "codex") {
    const codexRoot = process.env.CODEX_HOME?.trim() || path.join(homedir(), ".codex");
    return path.join(codexRoot, "skills", skillName);
  }
  if (agent === "claude") return path.join(homedir(), ".claude", "skills", skillName);
  throw new Error("--agent must be codex or claude. Use --target for another agent runtime.");
};

const assertSafeTarget = (target) => {
  const resolved = path.resolve(target);
  if (resolved === path.parse(resolved).root || resolved === homedir()) {
    throw new Error("Refusing to install a skill into a broad system or home directory.");
  }
  return resolved;
};

const pathState = async (target) => {
  try {
    return await lstat(target);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
};

const install = async () => {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: mailrith-agent-skill install [--agent codex|claude] [--target directory] [--dry-run]\n");
    return;
  }

  const destination = assertSafeTarget(args.target ?? defaultTarget(args.agent));
  const existing = await pathState(destination);
  if (existing?.isSymbolicLink()) throw new Error("Refusing to replace a symbolic-link skill destination.");
  if (args.dryRun) {
    process.stdout.write(`Would install ${skillName} at ${destination}.\n`);
    return;
  }

  await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  const temporary = `${destination}.install-${process.pid}`;
  if (await pathState(temporary)) throw new Error(`Temporary installation path already exists: ${temporary}`);
  await cp(sourceDirectory, temporary, { recursive: true, errorOnExist: true });

  let backup;
  if (existing) {
    backup = `${destination}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    await rename(destination, backup);
  }
  try {
    await rename(temporary, destination);
  } catch (error) {
    if (backup) await rename(backup, destination).catch(() => undefined);
    throw error;
  }

  process.stdout.write(`Installed ${skillName} at ${destination}.\n`);
  if (backup) process.stdout.write(`Previous installation preserved at ${backup}.\n`);
};

await install().catch((error) => fail(error instanceof Error ? error.message : String(error)));
