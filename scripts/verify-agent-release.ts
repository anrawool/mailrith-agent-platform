import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const manifestPath = path.join(repositoryRoot, "packages", "agent-release-manifest.json");
const releaseVersion = "0.1.0-beta.1";
const pythonReleaseVersion = "0.1.0b1";

type JsonObject = Record<string, unknown>;

const readJson = async (relativePath: string) =>
  JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8")) as JsonObject;

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

const verifyNpmPackage = async (expectedName: string, packagePath: string) => {
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
  const publishedNpmPackages = await Promise.all(
    npmPackages.map(([name, packagePath]) => verifyNpmPackage(name, packagePath)),
  );
  const pyproject = await readFile(
    path.join(repositoryRoot, "packages/python-sdk/pyproject.toml"),
    "utf8",
  );
  if (!pyproject.includes(`version = "${pythonReleaseVersion}"`)) {
    throw new Error(`Python SDK must use version ${pythonReleaseVersion}.`);
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

  return {
    schema_version: 1,
    release_version: releaseVersion,
    channel: "beta",
    status: "published",
    contract_version: "v1",
    documentation_revision: "2026-07-23",
    packages: {
      npm: packageVersions,
      pypi: { "mailrith-sdk": pythonReleaseVersion },
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
      mcp_typescript_server: "2.0.0-beta.5",
      claude_mcp_beta: "mcp-client-2025-11-20",
      supported_clients: ["openai_responses", "claude_messages", "codex", "n8n", "pipedream"],
    },
  };
};

const stableJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const main = async () => {
  const requestedTag = process.env.MAILRITH_AGENT_RELEASE_TAG?.trim();
  if (requestedTag && requestedTag !== `agent-v${releaseVersion}`) {
    throw new Error(`Release tag ${requestedTag} does not match agent-v${releaseVersion}.`);
  }
  const expected = await buildManifest();
  if (process.argv.includes("--write")) {
    await writeFile(manifestPath, stableJson(expected), "utf8");
    process.stdout.write(`Wrote ${path.relative(repositoryRoot, manifestPath)}.\n`);
  } else {
    const current = await readFile(manifestPath, "utf8").catch(() => "");
    if (current !== stableJson(expected)) {
      throw new Error("Agent release manifest is stale. Run `pnpm agent:release:manifest`.");
    }
    process.stdout.write(`Agent release ${releaseVersion} is internally consistent.\n`);
  }
};

void main();
