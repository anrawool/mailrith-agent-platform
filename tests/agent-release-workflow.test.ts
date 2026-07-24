import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  join(process.cwd(), ".github/workflows/release-agent-packages.yml"),
  "utf8",
);

describe("agent release workflow", () => {
  it("keeps non-publishing preparation usable for private repositories", () => {
    expect(workflow).toContain(
      "if: github.event.repository.visibility == 'public'",
    );
    expect(workflow).toContain("Record Private Repository Attestation Gate");
    expect(workflow).toContain("uses: actions/upload-artifact@v4");
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
    expect(workflow).toContain("uses: actions/setup-node@v6");
    expect(workflow).toContain('NPM_CONFIG_PROVENANCE: "true"');
    expect(workflow).toContain(
      'npm publish "$archive" --access public --provenance --tag latest',
    );
    expect(workflow).toContain("uses: pypa/gh-action-pypi-publish@release/v1");
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
