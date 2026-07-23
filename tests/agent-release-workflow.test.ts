import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  fileURLToPath(
    new URL("../.github/workflows/release-agent-packages.yml", import.meta.url),
  ),
  "utf8",
);
const releaseManifest = readFileSync(
  fileURLToPath(
    new URL("../packages/agent-release-manifest.json", import.meta.url),
  ),
  "utf8",
);
const releaseVerifier = readFileSync(
  fileURLToPath(
    new URL("../scripts/verify-agent-release.ts", import.meta.url),
  ),
  "utf8",
);

describe("agent release workflow", () => {
  it("records the coordinated public release as published", () => {
    expect(JSON.parse(releaseManifest)).toMatchObject({
      release_version: "0.1.0-beta.1",
      status: "published",
      documentation_revision: "2026-07-23",
    });
    expect(releaseVerifier).toContain('status: "published"');
    expect(releaseVerifier).not.toContain(
      'status: "prepared_not_published"',
    );
  });

  it("publishes through npm OIDC without a long-lived workflow token", () => {
    expect(workflow).toContain("uses: actions/setup-node@v6");
    expect(workflow).toContain('NPM_CONFIG_PROVENANCE: "true"');
    expect(workflow).toContain(
      'npm publish "$archive" --access public --provenance --tag beta',
    );
    expect(workflow).not.toContain("NODE_AUTH_TOKEN");
    expect(workflow).not.toContain("secrets.NPM_TOKEN");
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
    expect(workflow).toContain(
      'npm publish "$archive" --access public --provenance --tag beta',
    );
    expect(workflow).toContain("publish_target:");
    expect(workflow).toContain("inputs.publish_target == 'npm'");
    expect(workflow).toContain("inputs.publish_target == 'pypi'");
    expect(workflow).toContain(
      "(needs.publish-npm.result == 'success' || needs.publish-npm.result == 'skipped')",
    );
    expect(workflow).toContain(
      "(needs.publish-python.result == 'success' || needs.publish-python.result == 'skipped')",
    );
  });

  it("waits for every npm package to propagate before the clean-install gate", () => {
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
