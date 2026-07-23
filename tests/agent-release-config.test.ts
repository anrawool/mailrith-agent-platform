import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAgentReleaseConfig } from "../scripts/verify-agent-release";

const validConfig = {
  schema_version: 1,
  release_version: "0.1.0",
  python_release_version: "0.1.0",
  channel: "ga",
  status: "prepared_not_published",
  documentation_revision: "2026-07-24",
};

describe("agent release config", () => {
  it("generates package artifacts from source instead of a stale build directory", async () => {
    const generator = await readFile(
      path.join(process.cwd(), "scripts", "generate-agent-artifacts.ts"),
      "utf8",
    );
    expect(generator).toContain(
      'from "../packages/public-api/src/index.js"',
    );
    expect(generator).not.toContain('from "@mailrith/public-api"');
  });

  it("points every public package at the public release repository", async () => {
    for (const packageDirectory of [
      "public-api",
      "sdk",
      "mcp-server",
      "cli",
      "agent-skill",
    ]) {
      const packageJson = JSON.parse(
        await readFile(
          path.join(
            process.cwd(),
            "packages",
            packageDirectory,
            "package.json",
          ),
          "utf8",
        ),
      ) as {
        bugs?: string;
        repository?: { url?: string };
      };
      expect(packageJson.repository?.url).toBe(
        "git+https://github.com/anrawool/mailrith-agent-platform.git",
      );
      expect(packageJson.bugs).toBe(
        "https://github.com/anrawool/mailrith-agent-platform/issues",
      );
    }
  });

  it("accepts the coordinated GA release state", () => {
    expect(parseAgentReleaseConfig(validConfig)).toEqual(validConfig);
  });

  it("accepts a published GA release state", () => {
    expect(
      parseAgentReleaseConfig({
        ...validConfig,
        status: "published",
      }),
    ).toMatchObject({ channel: "ga", status: "published" });
  });

  it.each([
    [{ ...validConfig, channel: "preview" }, "channel must be ga"],
    [
      { ...validConfig, status: "publishing" },
      "status must be prepared_not_published or published",
    ],
    [
      { ...validConfig, documentation_revision: "July 23" },
      "documentation revision must use YYYY-MM-DD",
    ],
  ])("rejects an invalid release state", (config, message) => {
    expect(() => parseAgentReleaseConfig(config)).toThrow(message);
  });
});
