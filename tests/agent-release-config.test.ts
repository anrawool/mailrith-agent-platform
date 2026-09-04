import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { npmPackageReleaseVersion, parseAgentReleaseConfig } from "../scripts/verify-agent-release";

const validConfig = {
  schema_version: 1,
  release_version: "0.1.0",
  cli_release_version: "0.1.0",
  cli_release_status: "prepared_not_published",
  python_release_version: "0.1.0",
  marketplace_submission_version: "0.1.0",
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

  it("allows an unpublished CLI patch without changing published packages or marketplaces", () => {
    const config = parseAgentReleaseConfig({
      ...validConfig,
      release_version: "1.1.1",
      python_release_version: "1.1.1",
      marketplace_submission_version: "1.1.1",
      status: "published",
      cli_release_version: "1.1.2",
    });
    expect(npmPackageReleaseVersion("@mailrith/cli", config)).toBe("1.1.2");
    for (const name of ["public-api", "sdk", "mcp-server", "agent-skill"]) {
      expect(npmPackageReleaseVersion(`@mailrith/${name}`, config)).toBe("1.1.1");
    }
    expect(config).toMatchObject({
      python_release_version: "1.1.1",
      marketplace_submission_version: "1.1.1",
      status: "published",
      cli_release_status: "prepared_not_published",
    });
  });

  it("records CLI publication independently", () => {
    expect(parseAgentReleaseConfig({
      ...validConfig,
      cli_release_status: "published",
    })).toMatchObject({
      status: "prepared_not_published",
      cli_release_status: "published",
    });
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
    [
      { ...validConfig, marketplace_submission_version: "" },
      "must declare npm, CLI, Python, and marketplace versions",
    ],
    [
      { ...validConfig, cli_release_version: undefined },
      "must declare npm, CLI, Python, and marketplace versions",
    ],
    [
      { ...validConfig, cli_release_version: " " },
      "must declare npm, CLI, Python, and marketplace versions",
    ],
    [
      { ...validConfig, cli_release_status: "publishing" },
      "CLI status must be prepared_not_published or published",
    ],
  ])("rejects an invalid release state", (config, message) => {
    expect(() => parseAgentReleaseConfig(config)).toThrow(message);
  });
});
