import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { mailrithSdkResources } from "@mailrith/sdk";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installerPath = path.join(packageRoot, "bin", "install.js");
const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mailrith-skill-test-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("Mailrith Agent Skill package", () => {
  it("installs the complete skill and preserves an existing installation", async () => {
    const parent = await createTemporaryDirectory();
    const destination = path.join(parent, "mailrith-email-marketing");

    const first = spawnSync(process.execPath, [installerPath, "install", "--target", destination], {
      encoding: "utf8",
    });
    expect(first.status).toBe(0);
    expect(await readFile(path.join(destination, "SKILL.md"), "utf8")).toContain(
      "name: mailrith-email-marketing",
    );
    expect(await readFile(path.join(destination, "agents", "openai.yaml"), "utf8")).toContain(
      "$mailrith-email-marketing",
    );

    await writeFile(path.join(destination, "local-note.txt"), "preserve me\n", "utf8");
    const second = spawnSync(process.execPath, [installerPath, "install", "--target", destination], {
      encoding: "utf8",
    });
    expect(second.status).toBe(0);
    const backup = (await readdir(parent)).find((name) =>
      name.startsWith("mailrith-email-marketing.backup-"),
    );
    expect(backup).toBeDefined();
    expect(await readFile(path.join(parent, backup!, "local-note.txt"), "utf8")).toBe(
      "preserve me\n",
    );
  });

  it("supports a non-mutating dry run", async () => {
    const parent = await createTemporaryDirectory();
    const destination = path.join(parent, "mailrith-email-marketing");
    const result = spawnSync(
      process.execPath,
      [installerPath, "install", "--target", destination, "--dry-run"],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`Would install mailrith-email-marketing at ${destination}`);
    expect(await readdir(parent)).toEqual([]);
  });
});

describe("Mailrith connector templates", () => {
  it("keeps provider templates current, read-only by default, and free of resolved secrets", async () => {
    const connectorsDirectory = path.join(packageRoot, "connectors");
    const openAiSource = await readFile(path.join(connectorsDirectory, "openai-responses.json"), "utf8");
    const claudeSource = await readFile(path.join(connectorsDirectory, "claude-messages.json"), "utf8");
    const n8nSource = await readFile(
      path.join(connectorsDirectory, "n8n-read-capabilities.workflow.json"),
      "utf8",
    );
    const codexSource = await readFile(path.join(connectorsDirectory, "codex-config.toml"), "utf8");
    const pipedreamSource = await readFile(
      path.join(connectorsDirectory, "pipedream-read-capabilities.mjs"),
      "utf8",
    );
    const connectionGuidance = await readFile(
      path.join(
        packageRoot,
        "mailrith-email-marketing",
        "references",
        "connections.md",
      ),
      "utf8",
    );
    const openAi = JSON.parse(openAiSource) as Record<string, any>;
    const claude = JSON.parse(claudeSource) as Record<string, any>;
    const n8n = JSON.parse(n8nSource) as Record<string, any>;

    expect(openAi.store).toBe(false);
    expect(openAi.tools[0]).toMatchObject({
      type: "mcp",
      server_url: "https://api.mailrith.com/mcp",
      allowed_tools: { read_only: true },
      require_approval: "never",
    });
    expect(claude.betas).toEqual(["mcp-client-2025-11-20"]);
    expect(claude.mcp_servers[0].url).toBe("https://api.mailrith.com/mcp");
    expect(claude.tools[0].default_config).toMatchObject({
      enabled: false,
      defer_loading: true,
    });
    expect(Object.keys(claude.tools[0].configs)).toEqual([
      "discovery_get_metadata",
      "discovery_get_capabilities",
      "workspace_get",
      "subscribers_list",
    ]);
    expect(n8n.active).toBe(false);
    expect(n8n.nodes[1].parameters.url).toBe("https://api.mailrith.com/v1/capabilities");
    expect(n8n.nodes[1].parameters.options.timeout).toBe(10_000);
    expect(codexSource).toContain('url = "https://api.mailrith.com/mcp"');
    expect(codexSource).toContain('default_tools_approval_mode = "never"');
    expect(codexSource).not.toContain("agent_activity_");
    expect(codexSource).not.toContain("broadcasts_get_send_progress");
    expect(pipedreamSource).toContain('url: "https://api.mailrith.com/v1/capabilities"');
    expect(pipedreamSource).toContain("secret: true");
    expect(connectionGuidance).toContain(
      "https://mailrith.com/.well-known/mcp/server-card.json",
    );
    expect(connectionGuidance).not.toContain(
      "https://api.mailrith.com/.well-known/mcp.json",
    );

    const knownTools = new Set(
      mailrithSdkResources.flatMap((resource) =>
        resource.operations.map((operation) => operation.mcpToolName),
      ),
    );
    expect(Object.keys(claude.tools[0].configs).every((tool) => knownTools.has(tool))).toBe(true);
    for (const source of [openAiSource, claudeSource, n8nSource, codexSource, pipedreamSource]) {
      expect(source).not.toMatch(/(?:mrk|mra|mrt)_[A-Za-z0-9_-]{12,}/);
    }
  });
});
