import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/release-agent-packages.yml"),
  "utf8",
);
const roots: string[] = [];
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), "mailrith-cli-release-"));
  roots.push(root);
  return root;
};

// Execute the actual workflow shell blocks with local command stubs. No
// package manager, registry publication, or network access runs in these tests.
const stepScript = (name: string) => {
  const step = workflow.split(`      - name: ${name}\n`)[1]?.split(/\n {6}- /)[0];
  const block = step?.split("        run: |\n")[1];
  if (!block) throw new Error(`Missing workflow script: ${name}`);
  return block.split("\n").filter((line) => line.startsWith("          ") || !line)
    .map((line) => line.slice(10)).join("\n");
};

const runScript = (root: string, script: string, environment: Record<string, string> = {}) =>
  execFileSync("bash", ["--noprofile", "--norc", "-euo", "pipefail", "-c", script], {
    cwd: root,
    env: {
      ...process.env,
      TEST_ROOT: root,
      GITHUB_WORKSPACE: root,
      PUBLISH_TARGET: "cli",
      RELEASE_VERSION: "1.1.1",
      CLI_RELEASE_VERSION: "1.1.2",
      REPORTED_CLI_VERSION: "1.1.2",
      ...environment,
    },
    stdio: "pipe",
  });

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("independent CLI releases", () => {
  it.each(["cli", "prepare-cli"])("packs only the CLI for %s", (target) => {
    const root = fixture();
    runScript(root, `
      pnpm() { printf '%s\\n' "$*" >> "$TEST_ROOT/commands"; }
      ${stepScript("Pack Npm Artifacts")}
    `, { PUBLISH_TARGET: target });
    expect(readFileSync(join(root, "commands"), "utf8").trim().split("\n")).toEqual([
      `--filter @mailrith/cli pack --pack-destination ${root}/release/npm`,
    ]);
  });

  it.each(["cli", "npm", "all", ""])("publishes the correct archives for target %s", (target) => {
    const root = fixture();
    const names = ["public-api", "sdk", "mcp-server", "cli", "agent-skill"];
    runScript(root, "mkdir -p npm");
    const archives = names.map((name) => `./npm/mailrith-${name}-${name === "cli" ? "1.1.2" : "1.1.1"}.tgz`);
    for (const archive of archives) writeFileSync(join(root, archive), "test archive");
    runScript(root, `
      npm() { printf '%s\\n' "$*" >> "$TEST_ROOT/commands"; }
      ${stepScript("Publish Npm Packages In Dependency Order")}
    `, { PUBLISH_TARGET: target });
    const selected = target === "cli" ? archives.filter((archive) => archive.includes("-cli-")) : archives;
    expect(readFileSync(join(root, "commands"), "utf8").trim().split("\n")).toEqual(
      selected.map((archive) => `publish ${archive} --access public --provenance --tag latest`),
    );
  });

  const cleanInstallScript = () => `
    npm() { printf '%s\\n' "$*" >> "$TEST_ROOT/commands"; }
    npx() { if [[ "$1" == "mailrith" ]]; then printf '%s\\n' "$REPORTED_CLI_VERSION"; fi; }
    node() { :; }
    mktemp() { /usr/bin/mktemp -d "$TEST_ROOT/install.XXXXXX"; }
    ${stepScript("Clean Install From Public Registries").split('python_directory="')[0]}
  `;

  it("waits for and installs each exact package version, including the independent CLI patch", () => {
    const root = fixture();
    runScript(root, cleanInstallScript());
    const commands = readFileSync(join(root, "commands"), "utf8");
    const specs = [
      "@mailrith/public-api@1.1.1", "@mailrith/sdk@1.1.1",
      "@mailrith/mcp-server@1.1.1", "@mailrith/cli@1.1.2", "@mailrith/agent-skill@1.1.1",
    ];
    for (const spec of specs) expect(commands).toContain(`view ${spec} version\n`);
    expect(commands).toContain(`install ${specs.join(" ")}\n`);
    expect(commands).toContain("audit --audit-level=high\n");
    expect(readdirSync(root).filter((name) => name.startsWith("install."))).toHaveLength(1);
  });

  it("fails verification if the installed CLI reports the old runtime version", () => {
    expect(() => runScript(fixture(), cleanInstallScript(), {
      REPORTED_CLI_VERSION: "1.1.1",
    })).toThrow();
  });

  it("keeps CLI preparation non-publishing and excludes unrelated archives and Python publication", () => {
    expect(workflow).toContain("          - prepare-cli\n");
    expect(workflow).toContain("          - cli\n");
    expect(workflow).toContain("if: inputs.publish_target != 'cli' && inputs.publish_target != 'prepare-cli'");
    for (const job of ["publish-npm", "publish-python"]) {
      const condition = workflow.split(`  ${job}:\n`)[1]?.split("    if: ")[1]?.split("\n")[0] ?? "";
      // Manual targets must not accidentally become a full release when the
      // chosen workflow ref is an agent tag instead of a branch.
      expect(condition).toContain("github.event_name == 'push' && startsWith(github.ref, 'refs/tags/agent-v')");
      expect(condition).not.toContain("prepare-cli");
      if (job === "publish-python") expect(condition).not.toContain("'cli'");
      else expect(condition).toContain("inputs.publish_target == 'cli'");
    }
    expect(workflow).toContain("needs.prepare.result == 'success'");
    expect(workflow).toContain("inputs.publish_target != 'none' && inputs.publish_target != 'prepare-cli'");
    expect(workflow).toContain("CLI_RELEASE_VERSION: ${{ needs.prepare.outputs.cli-release-version }}");
  });
});
