import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = process.cwd();
const manifestPath = path.join(repositoryRoot, "packages", "agent-release-manifest.json");

type JsonObject = Record<string, unknown>;
type AgentReleaseConfig = {
  schema_version: 1;
  release_version: string;
  python_release_version: string;
  channel: "ga";
  status: "prepared_not_published" | "published";
  documentation_revision: string;
};

const readJson = async (relativePath: string) =>
  JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8")) as JsonObject;

export const parseAgentReleaseConfig = (value: unknown): AgentReleaseConfig => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Agent release config must be a JSON object.");
  }
  const config = value as Record<string, unknown>;
  if (config.schema_version !== 1) {
    throw new Error("Agent release config schema version is unsupported.");
  }
  if (
    typeof config.release_version !== "string" ||
    config.release_version.trim().length === 0 ||
    typeof config.python_release_version !== "string" ||
    config.python_release_version.trim().length === 0
  ) {
    throw new Error("Agent release config must declare both package versions.");
  }
  if (config.channel !== "ga") {
    throw new Error("Agent release config channel must be ga.");
  }
  if (
    config.status !== "prepared_not_published" &&
    config.status !== "published"
  ) {
    throw new Error(
      "Agent release config status must be prepared_not_published or published.",
    );
  }
  if (
    typeof config.documentation_revision !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(config.documentation_revision)
  ) {
    throw new Error(
      "Agent release config documentation revision must use YYYY-MM-DD.",
    );
  }
  return config as AgentReleaseConfig;
};

const hashFiles = async (relativePaths: string[]) => {
  const hash = createHash("sha256");
  for (const relativePath of relativePaths.sort()) {
    hash.update(relativePath);
    hash.update("\0");
    hash.update(await readFile(path.join(repositoryRoot, relativePath)));
    hash.update("\0");
  }
  return hash.digest("hex");
};

const listFiles = async (relativeDirectory: string) => {
  const directory = path.join(repositoryRoot, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(relativePath)));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files.sort();
};

const npmPackages = [
  ["@mailrith/public-api", "packages/public-api/package.json"],
  ["@mailrith/sdk", "packages/sdk/package.json"],
  ["@mailrith/mcp-server", "packages/mcp-server/package.json"],
  ["@mailrith/cli", "packages/cli/package.json"],
  ["@mailrith/agent-skill", "packages/agent-skill/package.json"],
] as const;

const verifyNpmPackage = async (
  expectedName: string,
  packagePath: string,
  releaseVersion: string,
) => {
  const packageJson = await readJson(packagePath);
  if (packageJson.name !== expectedName || packageJson.version !== releaseVersion) {
    throw new Error(`${packagePath} must publish ${expectedName}@${releaseVersion}.`);
  }
  if (packageJson.private === true || packageJson.license !== "MIT") {
    throw new Error(`${packagePath} must be public and declare the MIT license.`);
  }
  const publishConfig = packageJson.publishConfig as JsonObject | undefined;
  if (publishConfig?.access !== "public" || publishConfig?.provenance !== true) {
    throw new Error(`${packagePath} must require public publishing with provenance.`);
  }
  const files = packageJson.files;
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error(`${packagePath} must use a package file allowlist.`);
  }
  return { name: expectedName, version: releaseVersion };
};

const buildManifest = async () => {
  const releaseConfig = parseAgentReleaseConfig(
    await readJson("packages/agent-release-config.json"),
  );
  const publishedNpmPackages = await Promise.all(
    npmPackages.map(([name, packagePath]) =>
      verifyNpmPackage(name, packagePath, releaseConfig.release_version),
    ),
  );
  const pyproject = await readFile(
    path.join(repositoryRoot, "packages/python-sdk/pyproject.toml"),
    "utf8",
  );
  if (
    !pyproject.includes(
      `version = "${releaseConfig.python_release_version}"`,
    )
  ) {
    throw new Error(
      `Python SDK must use version ${releaseConfig.python_release_version}.`,
    );
  }
  for (const requiredProjectField of [
    'requires-python = ">=3.10"',
    'license = "MIT"',
    'include = ["mailrith_sdk*"]',
  ]) {
    if (!pyproject.includes(requiredProjectField)) {
      throw new Error(`Python SDK is missing required project metadata: ${requiredProjectField}.`);
    }
  }
  await readFile(path.join(repositoryRoot, "packages/python-sdk/mailrith_sdk/py.typed"));

  const skillFiles = await listFiles("packages/agent-skill/mailrith-email-marketing");
  const connectorFiles = (await listFiles("packages/agent-skill/connectors")).filter(
    (file) => !file.endsWith("README.md"),
  );
  const packageVersions = Object.fromEntries(
    publishedNpmPackages.map((item) => [item.name, item.version]),
  );

  const manifest = {
    schema_version: releaseConfig.schema_version,
    release_version: releaseConfig.release_version,
    channel: releaseConfig.channel,
    status: releaseConfig.status,
    contract_version: "v1",
    documentation_revision: releaseConfig.documentation_revision,
    packages: {
      npm: packageVersions,
      pypi: { "mailrith-sdk": releaseConfig.python_release_version },
    },
    digests: {
      public_contract_sha256: await hashFiles([
        "packages/public-api/src/index.ts",
        "packages/public-api/src/scopes.ts",
        "packages/public-api/src/mcp-contract.ts",
      ]),
      risk_catalog_sha256: await hashFiles(["packages/public-api/src/agent-risk.ts"]),
      typescript_sdk_manifest_sha256: await hashFiles(["packages/sdk/src/generated.ts"]),
      python_sdk_manifest_sha256: await hashFiles([
        "packages/python-sdk/mailrith_sdk/contract.json",
        "packages/python-sdk/mailrith_sdk/manifest.json",
      ]),
      mcp_manifest_sha256: await hashFiles([
        "packages/mcp-server/src/generated-tool-manifest.ts",
      ]),
      agent_skill_sha256: await hashFiles(skillFiles),
      connector_templates_sha256: await hashFiles(connectorFiles),
    },
    compatibility: {
      node: ">=20",
      python: ">=3.10",
      mcp_transport: "streamable_http",
      mcp_typescript_sdk: "1.29.0",
      claude_mcp_protocol: "mcp-client-2025-11-20",
      supported_clients: ["openai_responses", "claude_messages", "codex", "n8n", "pipedream"],
    },
  } as const;

  return { manifest, releaseConfig };
};

const stableJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const main = async () => {
  const { manifest: expected, releaseConfig } = await buildManifest();
  const requestedTag = process.env.MAILRITH_AGENT_RELEASE_TAG?.trim();
  if (
    requestedTag &&
    requestedTag !== `agent-v${releaseConfig.release_version}`
  ) {
    throw new Error(
      `Release tag ${requestedTag} does not match agent-v${releaseConfig.release_version}.`,
    );
  }
  if (process.argv.includes("--write")) {
    await writeFile(manifestPath, stableJson(expected), "utf8");
    process.stdout.write(`Wrote ${path.relative(repositoryRoot, manifestPath)}.\n`);
  } else {
    const current = await readFile(manifestPath, "utf8").catch(() => "");
    if (current !== stableJson(expected)) {
      throw new Error("Agent release manifest is stale. Run `pnpm agent:release:manifest`.");
    }
    process.stdout.write(
      `Agent release ${releaseConfig.release_version} is internally consistent.\n`,
    );
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  void main();
}
