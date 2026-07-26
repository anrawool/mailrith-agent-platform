import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  publicApiSubmittedMcpOperationIds,
} from "@mailrith/public-api";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const integrationsRoot = path.join(
  repositoryRoot,
  "packages",
  "agent-integrations",
);
const submittedProfilePath = path.join(
  integrationsRoot,
  "submitted-profile.json",
);
const chatGptAppSubmissionSchemaUrl =
  "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json";

const readJson = async <T>(filePath: string) =>
  JSON.parse(await readFile(filePath, "utf8")) as T;

const readSubmittedProfile = () =>
  readJson<{
    profile: string;
    contract_version: string;
    submitted_schema_digest: string;
    mcp_server_url: string;
    tool_count: number;
    tools: Array<{
      operation_id: string;
      name: string;
      required_scopes: string[];
      annotations: {
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
      };
    }>;
  }>(submittedProfilePath);

const extractCodexTools = (source: string) => {
  const block = source.match(/enabled_tools = \[([\s\S]*?)\]/)?.[1] ?? "";
  return Array.from(block.matchAll(/"([^"]+)"/g), (match) => match[1]);
};

describe("Mailrith Agent Integration Packages", () => {
  it("keeps one fixed submitted contract across every package", async () => {
    const submitted = await readSubmittedProfile();
    const openAi = await readJson<typeof submitted>(
      path.join(
        integrationsRoot,
        "openai",
        "mailrith",
        "mailrith-mcp-contract.json",
      ),
    );
    const cursor = await readJson<typeof submitted>(
      path.join(
        integrationsRoot,
        "cursor",
        "mailrith",
        "mailrith-mcp-contract.json",
      ),
    );

    expect(submitted.profile).toBe("submitted");
    expect(submitted.contract_version).toBe("1.0");
    expect(submitted.mcp_server_url).toBe("https://api.mailrith.com/mcp");
    expect(submitted.tool_count).toBe(publicApiSubmittedMcpOperationIds.length);
    expect(submitted.tools.map((tool) => tool.operation_id)).toEqual(
      publicApiSubmittedMcpOperationIds,
    );
    expect(new Set(submitted.tools.map((tool) => tool.name)).size).toBe(
      submitted.tool_count,
    );
    expect(openAi).toEqual(submitted);
    expect(cursor).toEqual(submitted);
  });

  it("configures OpenAI, Claude, Codex, and Cursor with the exact catalog", async () => {
    const submitted = await readSubmittedProfile();
    const expectedTools = submitted.tools.map((tool) => tool.name);
    const openAi = await readJson<{
      tools: Array<{
        server_url: string;
        allowed_tools: string[];
        require_approval: unknown;
      }>;
    }>(
      path.join(
        repositoryRoot,
        "packages",
        "agent-skill",
        "connectors",
        "openai-responses.json",
      ),
    );
    const claude = await readJson<{
      mcp_servers: Array<{ url: string }>;
      tools: Array<{ configs: Record<string, unknown> }>;
    }>(
      path.join(
        repositoryRoot,
        "packages",
        "agent-skill",
        "connectors",
        "claude-messages.json",
      ),
    );
    const codex = await readFile(
      path.join(
        repositoryRoot,
        "packages",
        "agent-skill",
        "connectors",
        "codex-config.toml",
      ),
      "utf8",
    );
    const openAiMcp = await readJson<{
      mcpServers: Record<string, { type: string; url: string }>;
    }>(
      path.join(integrationsRoot, "openai", "mailrith", ".mcp.json"),
    );
    const cursorMcp = await readJson<{
      mcpServers: Record<string, { type: string; url: string }>;
    }>(
      path.join(integrationsRoot, "cursor", "mailrith", "mcp.json"),
    );

    expect(openAi.tools[0]?.server_url).toBe(submitted.mcp_server_url);
    expect(openAi.tools[0]?.allowed_tools).toEqual(expectedTools);
    expect(openAi.tools[0]?.require_approval).toEqual({
      always: { read_only: false },
    });
    expect(claude.mcp_servers[0]?.url).toBe(submitted.mcp_server_url);
    expect(Object.keys(claude.tools[0]?.configs ?? {})).toEqual(expectedTools);
    expect(extractCodexTools(codex)).toEqual(expectedTools);
    expect(codex).not.toContain('default_tools_approval_mode = "never"');
    expect(openAiMcp.mcpServers.mailrith).toEqual({
      type: "http",
      url: submitted.mcp_server_url,
    });
    expect(cursorMcp.mcpServers.mailrith).toEqual({
      type: "http",
      url: submitted.mcp_server_url,
    });
  });

  it("ships complete OpenAI and Cursor plugin manifests", async () => {
    const openAiRoot = path.join(integrationsRoot, "openai", "mailrith");
    const cursorRoot = path.join(integrationsRoot, "cursor", "mailrith");
    const openAi = await readJson<{
      name: string;
      version: string;
      license: string;
      skills: string;
      mcpServers: string;
      interface: {
        defaultPrompt: string[];
        privacyPolicyURL: string;
        termsOfServiceURL: string;
        composerIcon: string;
        logo: string;
      };
    }>(path.join(openAiRoot, ".codex-plugin", "plugin.json"));
    const cursor = await readJson<{
      name: string;
      version: string;
      license: string;
      skills: string;
      mcpServers: string;
      logo: string;
    }>(path.join(cursorRoot, ".cursor-plugin", "plugin.json"));
    const cursorMarketplace = await readJson<{
      plugins: Array<{ name: string; source: string }>;
    }>(
      path.join(
        integrationsRoot,
        "cursor",
        ".cursor-plugin",
        "marketplace.json",
      ),
    );

    expect(openAi).toMatchObject({
      name: "mailrith",
      version: "1.0.0",
      license: "MIT",
      skills: "./skills/",
      mcpServers: "./.mcp.json",
    });
    expect(openAi.interface.defaultPrompt).toHaveLength(3);
    expect(openAi.interface.privacyPolicyURL).toMatch(/^https:\/\//);
    expect(openAi.interface.termsOfServiceURL).toMatch(/^https:\/\//);
    expect(cursor).not.toHaveProperty("$schema");
    expect(cursor).toMatchObject({
      name: "mailrith",
      version: "1.0.0",
      license: "MIT",
      skills: "./skills/",
      mcpServers: "./mcp.json",
      logo: "assets/logo.svg",
    });
    expect(cursorMarketplace.plugins).toEqual([
      { name: "mailrith", source: "mailrith", description: expect.any(String) },
    ]);

    for (const [root, relativePaths] of [
      [
        openAiRoot,
        [
          openAi.mcpServers,
          openAi.skills,
          openAi.interface.composerIcon,
          openAi.interface.logo,
          "LICENSE",
        ],
      ],
      [
        cursorRoot,
        [cursor.mcpServers, cursor.skills, cursor.logo, "LICENSE"],
      ],
    ] as const) {
      for (const relativePath of relativePaths) {
        expect(
          (await stat(path.resolve(root, relativePath))).isFile() ||
            (await stat(path.resolve(root, relativePath))).isDirectory(),
        ).toBe(true);
      }
    }
  });

  it("keeps generated skill copies byte-for-byte aligned", async () => {
    const canonical = await readFile(
      path.join(
        repositoryRoot,
        "packages",
        "agent-skill",
        "mailrith-email-marketing",
        "SKILL.md",
      ),
      "utf8",
    );
    for (const platform of ["openai", "cursor"]) {
      const copy = await readFile(
        path.join(
          integrationsRoot,
          platform,
          "mailrith",
          "skills",
          "mailrith-email-marketing",
          "SKILL.md",
        ),
        "utf8",
      );
      expect(copy).toBe(canonical);
    }

    const canonicalLogo = await readFile(
      path.join(
        integrationsRoot,
        "assets",
        "mailrith-logo.svg",
      ),
      "utf8",
    );
    for (const platform of ["openai", "cursor"]) {
      expect(
        await readFile(
          path.join(
            integrationsRoot,
            platform,
            "mailrith",
            "assets",
            "logo.svg",
          ),
          "utf8",
        ),
      ).toBe(canonicalLogo);
    }
  });

  it("provides valid submission cases and synthetic reviewer data", async () => {
    const submitted = await readSubmittedProfile();
    const knownTools = new Set(submitted.tools.map((tool) => tool.name));
    const submission = await readJson<{
      $schema: string;
      schema_version: number;
      tools: Record<string, {
        annotations: Record<string, boolean>;
        justifications: Record<string, string>;
      }>;
      test_cases: Array<{ tools_triggered: string }>;
      negative_test_cases: Array<{ tools_triggered: null }>;
    }>(path.join(repositoryRoot, "chatgpt-app-submission.json"));
    const evaluations = await readJson<{
      cases: Array<{
        category: string;
        expected_tools: string[];
        forbidden_tools: string[];
      }>;
    }>(path.join(integrationsRoot, "evaluations", "tool-selection.json"));
    const reviewer = await readJson<{
      synthetic_only: boolean;
      subscribers: Array<{ email: string }>;
      secrets: unknown[];
    }>(path.join(integrationsRoot, "reviewer", "workspace-fixture.json"));

    expect(submission.$schema).toBe(chatGptAppSubmissionSchemaUrl);
    expect(submission.schema_version).toBe(1);
    expect(Object.keys(submission.tools)).toEqual([...knownTools]);
    expect(submission.test_cases).toHaveLength(5);
    expect(submission.negative_test_cases).toHaveLength(3);
    for (const tool of Object.values(submission.tools)) {
      expect(tool.annotations).toEqual({
        readOnlyHint: expect.any(Boolean),
        openWorldHint: expect.any(Boolean),
        destructiveHint: expect.any(Boolean),
      });
      expect(Object.values(tool.justifications).every(Boolean)).toBe(true);
    }
    for (const testCase of submission.test_cases) {
      for (const tool of testCase.tools_triggered.split(/,\s*/)) {
        expect(knownTools.has(tool)).toBe(true);
      }
    }
    expect(
      evaluations.cases.some(
        (item) => item.category === "prompt_injection",
      ),
    ).toBe(true);
    expect(
      evaluations.cases.some((item) => item.category === "unrelated"),
    ).toBe(true);
    for (const evaluation of evaluations.cases) {
      for (const tool of [
        ...evaluation.expected_tools,
        ...evaluation.forbidden_tools,
      ]) {
        expect(knownTools.has(tool)).toBe(true);
      }
    }
    expect(reviewer.synthetic_only).toBe(true);
    expect(reviewer.secrets).toEqual([]);
    expect(
      reviewer.subscribers.every((subscriber) =>
        subscriber.email.endsWith("@example.com"),
      ),
    ).toBe(true);
  });

  it("contains no resolved Mailrith credentials", async () => {
    const sources = await Promise.all([
      readFile(submittedProfilePath, "utf8"),
      readFile(
        path.join(integrationsRoot, "claude", "connector-listing.json"),
        "utf8",
      ),
      readFile(
        path.join(integrationsRoot, "reviewer", "workspace-fixture.json"),
        "utf8",
      ),
      readFile(
        path.join(
          integrationsRoot,
          "openai",
          "mailrith",
          ".mcp.json",
        ),
        "utf8",
      ),
      readFile(
        path.join(integrationsRoot, "cursor", "mailrith", "mcp.json"),
        "utf8",
      ),
    ]);
    for (const source of sources) {
      expect(source).not.toMatch(/\b(?:mrk|mra|mrt)_[A-Za-z0-9_-]{12,}\b/);
    }
  });
});
