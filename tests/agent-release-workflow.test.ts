import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  fileURLToPath(
    new URL("../.github/workflows/release-agent-packages.yml", import.meta.url),
  ),
  "utf8",
);

describe("agent release workflow", () => {
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
});
