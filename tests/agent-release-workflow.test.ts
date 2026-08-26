import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listReleaseDigestFiles } from "../scripts/verify-agent-release";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/release-agent-packages.yml"),
  "utf8",
);
const mainWorkflow = readFileSync(
  join(process.cwd(), ".github/workflows/ci.yml"),
  "utf8",
);
const workflowSources = readdirSync(join(process.cwd(), ".github/workflows"))
  .filter((fileName) => /\.ya?ml$/.test(fileName))
  .map((fileName) =>
    readFileSync(join(process.cwd(), ".github/workflows", fileName), "utf8"),
  );
const rootPackage = readFileSync(
  join(process.cwd(), "package.json"),
  "utf8",
);
const publicNpmPackageFiles = [
  "packages/public-api/package.json",
  "packages/sdk/package.json",
  "packages/mcp-server/package.json",
  "packages/cli/package.json",
  "packages/agent-skill/package.json",
].map((fileName) =>
  JSON.parse(readFileSync(join(process.cwd(), fileName), "utf8")) as {
    files?: string[];
  },
);

describe("agent release workflow", () => {
  it("keeps release digests independent of local dependencies and build output", async () => {
    const root = mkdtempSync(join(tmpdir(), "mailrith-release-digest-"));
    try {
      for (const directory of [
        "package/.cache",
        "package/.cursor-plugin",
        "package/.turbo",
        "package/coverage",
        "package/dist",
        "package/node_modules/.bin",
      ]) {
        mkdirSync(join(root, directory), { recursive: true });
      }
      for (const file of [
        "package/.cache/cache.json",
        "package/.DS_Store",
        "package/.turbo/state.json",
        "package/coverage/coverage.json",
        "package/dist/index.js",
        "package/node_modules/.bin/tool",
        "package/project.tsbuildinfo",
      ]) {
        writeFileSync(join(root, file), "local-only");
      }
      for (const file of [
        "package/.cursor-plugin/plugin.json",
        "package/README.md",
      ]) {
        writeFileSync(join(root, file), "release");
      }

      await expect(listReleaseDigestFiles("package", root)).resolves.toEqual([
        "package/.cursor-plugin/plugin.json",
        "package/README.md",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps non-publishing preparation usable for private repositories", () => {
    expect(workflow).toContain(
      "if: github.event.repository.visibility == 'public'",
    );
    expect(workflow).toContain("Record Private Repository Attestation Gate");
    expect(workflow).toMatch(
      /uses: actions\/upload-artifact@[0-9a-f]{40} # v4/,
    );
  });

  it("regenerates and validates every submitted platform artifact", () => {
    expect(workflow).toContain("pnpm generate:agent-integrations");
    expect(workflow).toContain("packages/agent-integrations");
    expect(workflow).toContain("chatgpt-app-submission.json");
    expect(workflow).toContain(
      "pnpm --filter @mailrith/agent-integrations test",
    );
    expect(workflow).toContain(
      "pnpm agent:clients:conformance -- --profile static",
    );
    expect(workflow).toContain("release/platform");
    expect(workflow).toContain(
      "mailrith-openai-plugin-$MARKETPLACE_SUBMISSION_VERSION.tar.gz",
    );
    expect(workflow).toContain(
      "mailrith-claude-connector-$MARKETPLACE_SUBMISSION_VERSION.tar.gz",
    );
    expect(workflow).toContain(
      "mailrith-cursor-plugin-$MARKETPLACE_SUBMISSION_VERSION.tar.gz",
    );
    expect(workflow).toContain(
      "chatgpt-app-submission-$MARKETPLACE_SUBMISSION_VERSION.json",
    );
    expect(workflow).toContain("TRADEMARKS.md");
  });

  it("includes the canonical trademark policy in every public npm package", () => {
    for (const packageJson of publicNpmPackageFiles) {
      expect(packageJson.files).toContain("TRADEMARKS.md");
    }
  });

  it("keeps the public release independently reproducible", () => {
    const integrationGenerator = readFileSync(
      join(process.cwd(), "scripts/generate-agent-integrations.ts"),
      "utf8",
    );
    const releaseVerifier = readFileSync(
      join(process.cwd(), "scripts/verify-agent-release.ts"),
      "utf8",
    );

    expect(integrationGenerator).toContain(
      '"assets",\n  "mailrith-logo.svg"',
    );
    expect(integrationGenerator).toContain('"TRADEMARKS.md"');
    expect(integrationGenerator).not.toContain('"apps",\n  "marketing"');
    expect(releaseVerifier).not.toContain(".github/workflows/ci-cd.yml");
    expect(releaseVerifier).not.toContain("apps/marketing/");
  });

  it("keeps normal CI aligned with every generated platform artifact", () => {
    expect(mainWorkflow).toContain("pnpm validate");
    expect(rootPackage).toContain("pnpm generate:agent-integrations");
    expect(rootPackage).toContain("packages/agent-integrations");
    expect(rootPackage).toContain("chatgpt-app-submission.json");
    expect(rootPackage).toContain("pnpm agent:release:verify");
  });

  it("fails closed when private-repository publication is requested", () => {
    expect(workflow).toContain(
      "if: (startsWith(github.ref, 'refs/tags/agent-v') || inputs.publish_target == 'all' || inputs.publish_target == 'npm' || inputs.publish_target == 'pypi') && github.event.repository.visibility != 'public'",
    );
    expect(workflow).toContain(
      "Package publication is blocked while this user-owned repository is private.",
    );
  });

  it("preserves registry provenance and trusted publishing", () => {
    expect(workflow).toMatch(/uses: actions\/setup-node@[0-9a-f]{40} # v6/);
    expect(workflow).toContain('NPM_CONFIG_PROVENANCE: "true"');
    expect(workflow).toContain(
      'npm publish "$archive" --access public --provenance --tag latest',
    );
    expect(workflow).toMatch(
      /uses: pypa\/gh-action-pypi-publish@[0-9a-f]{40} # release\/v1/,
    );
    expect(workflow).not.toContain("NODE_AUTH_TOKEN");
    expect(workflow).not.toContain("secrets.NPM_TOKEN");
  });

  it("pins every remote workflow action to an immutable commit", () => {
    for (const source of workflowSources) {
      for (const match of source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)) {
        const reference = match[1] ?? "";
        if (reference.startsWith("./") || reference.startsWith("docker://")) {
          continue;
        }
        expect(reference).toMatch(/^[^@\s]+@[0-9a-f]{40}$/);
      }
    }
  });

  it("publishes local npm archives instead of treating paths as Git repository specifications", () => {
    for (const archive of [
      "mailrith-public-api",
      "mailrith-sdk",
      "mailrith-mcp-server",
      "mailrith-cli",
      "mailrith-agent-skill",
    ]) {
      expect(workflow).toContain(`./npm/${archive}-*.tgz`);
    }

    expect(workflow).not.toMatch(/^\s+npm\/mailrith-[^\n]+\.tgz/m);
  });

  it("supports bounded single-registry retries while retaining the full clean-install gate", () => {
    expect(workflow).toContain("publish_target:");
    expect(workflow).toContain("inputs.publish_target == 'npm'");
    expect(workflow).toContain("inputs.publish_target == 'pypi'");
    expect(workflow).toContain("- verify");
    expect(workflow).toContain(
      "(needs.publish-npm.result == 'success' || needs.publish-npm.result == 'skipped')",
    );
    expect(workflow).toContain(
      "(needs.publish-python.result == 'success' || needs.publish-python.result == 'skipped')",
    );
  });

  it("fails the clean-install audit only for high or critical vulnerabilities", () => {
    expect(workflow).toContain("npm audit --audit-level=high");
    expect(workflow).not.toContain("npm audit --audit-level=moderate");
  });

  it("waits for every npm package to propagate before the clean-install gate", () => {
    expect(workflow).toMatch(
      /clean-install:\s+needs:\s+- prepare\s+- publish-npm\s+- publish-python/,
    );
    expect(workflow).toContain(
      "release-version: ${{ steps.release-versions.outputs.release_version }}",
    );
    expect(workflow).toContain(
      "RELEASE_VERSION: ${{ needs.prepare.outputs.release-version }}",
    );
    expect(workflow).toContain(
      "PYTHON_RELEASE_VERSION: ${{ needs.prepare.outputs.python-release-version }}",
    );
    expect(workflow).not.toMatch(/RELEASE_VERSION: 0\.\d+\.\d+/);
    expect(workflow).toContain("for attempt in {1..30}");
    expect(workflow).toContain(
      'npm view "$package_name@$RELEASE_VERSION" version',
    );
    expect(workflow).toContain(
      "npm registry propagation timed out for: ${missing_packages[*]}",
    );
    expect(workflow).not.toContain("sleep 30");
  });
});
