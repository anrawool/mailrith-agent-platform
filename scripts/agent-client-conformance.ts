import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  publicApiSdkResources,
  publicApiSubmittedMcpOperationIds,
} from "@mailrith/public-api";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const maximumResponseBytes = 5 * 1024 * 1024;
const requestTimeoutMilliseconds = 10_000;
const supportedClients = [
  "chatgpt",
  "openai",
  "claude_connector",
  "claude",
  "codex",
  "cursor",
  "n8n",
  "pipedream",
] as const;
type SupportedClient = (typeof supportedClients)[number];
const operationById = new Map(
  publicApiSdkResources
    .flatMap((resource) => resource.operations)
    .map((operation) => [operation.operationId, operation] as const),
);
const submittedTools = publicApiSubmittedMcpOperationIds.map((operationId) => {
  const operation = operationById.get(operationId);
  if (!operation) {
    throw new Error(
      `Submitted MCP operation ${operationId} is missing from the public contract.`,
    );
  }
  return operation.mcpToolName;
});

type ConformanceStep = {
  name: string;
  status: "passed" | "failed" | "manual";
  detail: string;
  request_id?: string | null;
};

export type AgentClientConformanceReport = {
  schema_version: 1;
  profile: "static" | "repository" | "read";
  client: SupportedClient | "all";
  checked_at: string;
  passed: boolean;
  steps: ConformanceStep[];
  manual_gates: string[];
};

const connectorFilesByClient: Record<SupportedClient, string[]> = {
  chatgpt: [
    "packages/agent-integrations/openai/mailrith/.codex-plugin/plugin.json",
    "packages/agent-integrations/openai/mailrith/.mcp.json",
    "packages/agent-integrations/openai/mailrith/mailrith-mcp-contract.json",
  ],
  openai: ["packages/agent-skill/connectors/openai-responses.json"],
  claude_connector: [
    "packages/agent-integrations/claude/connector-listing.json",
    "packages/agent-integrations/submitted-profile.json",
  ],
  claude: ["packages/agent-skill/connectors/claude-messages.json"],
  codex: ["packages/agent-skill/connectors/codex-config.toml"],
  cursor: [
    "packages/agent-integrations/cursor/mailrith/.cursor-plugin/plugin.json",
    "packages/agent-integrations/cursor/mailrith/mcp.json",
    "packages/agent-integrations/cursor/mailrith/mailrith-mcp-contract.json",
  ],
  n8n: [
    "packages/agent-skill/connectors/n8n-read-capabilities.workflow.json",
  ],
  pipedream: [
    "packages/agent-skill/connectors/pipedream-read-capabilities.mjs",
  ],
};
const conformanceStepNameByClient: Record<SupportedClient, string> = {
  chatgpt: "chatgpt_plugin",
  openai: "openai_responses_template",
  claude_connector: "claude_connector",
  claude: "claude_messages_template",
  codex: "codex_template",
  cursor: "cursor_plugin",
  n8n: "n8n_template",
  pipedream: "pipedream_template",
};

const readConnector = async (fileNames: string[]) =>
  (
    await Promise.all(
      fileNames.map((fileName) =>
        readFile(path.join(repositoryRoot, fileName), "utf8"),
      ),
    )
  ).join("\n");

const hasSafeConnectorDefault = (
  client: SupportedClient,
  source: string,
  hasSubmittedTools: boolean,
) => {
  switch (client) {
    case "chatgpt":
      return (
        source.includes('"mcpServers": "./.mcp.json"') &&
        hasSubmittedTools
      );
    case "cursor":
      return (
        source.includes('"mcpServers": "./mcp.json"') &&
        hasSubmittedTools
      );
    case "claude_connector":
      return (
        source.includes('"authentication": "oauth"') &&
        source.includes('"use_cases"') &&
        hasSubmittedTools
      );
    case "codex":
      return (
        !source.includes('default_tools_approval_mode = "never"') &&
        hasSubmittedTools
      );
    case "pipedream":
      return source.includes("GET") && source.includes("secret: true");
    case "n8n":
      return (
        source.includes('"active": false') &&
        source.includes("/v1/capabilities") &&
        !source.includes('"method": "POST"')
      );
    case "openai":
      return (
        hasSubmittedTools && source.includes('"read_only": false')
      );
    case "claude":
      return (
        source.includes('"enabled": false') &&
        source.includes('"defer_loading": true') &&
        hasSubmittedTools
      );
  }
};

export const runStaticAgentClientConformance = async (
  client: SupportedClient | "all" = "all",
): Promise<AgentClientConformanceReport> => {
  const selectedClients = client === "all" ? supportedClients : [client];
  const knownTools = new Set<string>(submittedTools);
  const steps: ConformanceStep[] = [];

  for (const selectedClient of selectedClients) {
    const source = await readConnector(connectorFilesByClient[selectedClient]);
    const hasResolvedSecret = /(?:mrk|mra|mrt)_[A-Za-z0-9_-]{12,}/.test(source);
    const pointsToMailrith = source.includes("https://api.mailrith.com/");
    const hasSubmittedTools =
      submittedTools.every((tool) => source.includes(tool));
    const safeDefault = hasSafeConnectorDefault(
      selectedClient,
      source,
      hasSubmittedTools,
    );
    steps.push({
      name: conformanceStepNameByClient[selectedClient],
      status:
        !hasResolvedSecret && pointsToMailrith && safeDefault
          ? "passed"
          : "failed",
      detail:
        selectedClient === "n8n" || selectedClient === "pipedream"
          ? "Purpose-built read templates must stay bounded and keep secrets unresolved."
          : `General-purpose platform artifacts must align with all ${submittedTools.length} submitted tools, preserve approval for writes where configured, and keep secrets unresolved.`,
    });
  }

  const claude = JSON.parse(
    await readConnector(connectorFilesByClient.claude),
  ) as {
    tools?: Array<{ configs?: Record<string, unknown> }>;
  };
  const configuredClaudeTools = Object.keys(claude.tools?.[0]?.configs ?? {});
  steps.push({
    name: "tool_catalog_alignment",
    status: configuredClaudeTools.every((tool) => knownTools.has(tool))
      ? "passed"
      : "failed",
    detail: `${configuredClaudeTools.length} configured Claude tools exist in the submitted MCP contract.`,
  });

  return {
    schema_version: 1,
    profile: "static",
    client,
    checked_at: new Date().toISOString(),
    passed: steps.every((step) => step.status === "passed"),
    steps,
    manual_gates: [
      "Complete OAuth in the actual client and record its exact build or review date.",
      "Run draft, scoped execution, and resource-verification checks in a dedicated test workspace.",
    ],
  };
};

const fetchBoundedJson = async (params: {
  url: string;
  token?: string;
  fetchImpl?: typeof fetch;
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMilliseconds);
  try {
    const response = await (params.fetchImpl ?? fetch)(params.url, {
      headers: params.token
        ? {
            authorization: `Bearer ${params.token}`,
            "x-mailrith-client": "conformance/0.1.0",
          }
        : undefined,
      signal: controller.signal,
    });
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > maximumResponseBytes) {
      throw new Error(`Response exceeded ${maximumResponseBytes} bytes.`);
    }
    const body = await response.arrayBuffer();
    if (body.byteLength > maximumResponseBytes) {
      throw new Error(`Response exceeded ${maximumResponseBytes} bytes.`);
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return {
      body: JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>,
      requestId: response.headers.get("x-request-id"),
    };
  } finally {
    clearTimeout(timeout);
  }
};

const resolveMarketingOrigin = (apiOrigin: URL) => {
  if (apiOrigin.hostname === "api.mailrith.com") return "https://mailrith.com";
  if (apiOrigin.hostname.startsWith("api-")) {
    return `${apiOrigin.protocol}//${apiOrigin.hostname.slice(4)}`;
  }
  return `${apiOrigin.protocol}//${apiOrigin.hostname}${apiOrigin.port ? `:${apiOrigin.port}` : ""}`;
};

export const runReadAgentClientConformance = async (params: {
  client: SupportedClient;
  token: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<AgentClientConformanceReport> => {
  const baseUrl = new URL((params.baseUrl ?? "https://api.mailrith.com").replace(/\/+$/, ""));
  const marketingOrigin = resolveMarketingOrigin(baseUrl);
  const steps: ConformanceStep[] = [];

  for (const [name, url] of [
    ["api_metadata", new URL("/v1", baseUrl).toString()],
    ["openapi", new URL("/v1/openapi.json", baseUrl).toString()],
    ["capabilities", new URL("/v1/capabilities", baseUrl).toString()],
    ["api_catalog", new URL("/.well-known/api-catalog", marketingOrigin).toString()],
  ] as const) {
    try {
      const result = await fetchBoundedJson({
        url,
        token: name === "capabilities" ? params.token : undefined,
        fetchImpl: params.fetchImpl,
      });
      steps.push({
        name,
        status: "passed",
        detail: `Fetched ${url}.`,
        request_id: result.requestId,
      });
    } catch (error) {
      steps.push({
        name,
        status: "failed",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const mcpFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request =
      input instanceof Request ? new Request(input, init) : new Request(input, init);
    request.headers.set("authorization", `Bearer ${params.token}`);
    request.headers.set("x-mailrith-client", `conformance-${params.client}/0.1.0`);
    return (params.fetchImpl ?? fetch)(request);
  };
  const transport = new StreamableHTTPClientTransport(
    new URL("/mcp", baseUrl),
    { fetch: mcpFetch as never },
  );
  const client = new Client(
    { name: `mailrith-${params.client}-conformance`, version: "0.1.0" },
    { capabilities: {} },
  );
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    const toolNames = new Set(tools.tools.map((tool) => tool.name));
    steps.push({
      name: "mcp_tool_listing",
      status: submittedTools.every((tool) => toolNames.has(tool))
        ? "passed"
        : "failed",
      detail: `Listed all ${submittedTools.length} submitted MCP tools.`,
    });
    const capabilities = await client.callTool({
      name: "discovery_get_capabilities",
      arguments: {},
    });
    steps.push({
      name: "mcp_authenticated_read",
      status: capabilities.isError ? "failed" : "passed",
      detail: "Called authenticated capability discovery through MCP.",
    });
    const subscribers = await client.callTool({
      name: "subscribers_list",
      arguments: {
        limit: 1,
      },
    });
    steps.push({
      name: "mcp_bounded_subscriber_read",
      status:
        subscribers.isError ? "failed" : "passed",
      detail:
        "Requested at most one Subscriber through the focused submitted tool.",
    });
  } catch (error) {
    steps.push({
      name: "mcp_transport",
      status: "failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await client.close().catch(() => undefined);
  }

  return {
    schema_version: 1,
    profile: "read",
    client: params.client,
    checked_at: new Date().toISOString(),
    passed: steps.every((step) => step.status === "passed"),
    steps,
    manual_gates: [
      "This transport check does not prove the named provider UI completed OAuth.",
      "Complete scoped write conformance in a dedicated test workspace and attach the request ID and verified resource state.",
    ],
  };
};

const runRepositoryConformance = (): AgentClientConformanceReport => {
  const commands = [
    [
      "unit_contracts",
      [
        "node_modules/vitest/vitest.mjs",
        "run",
        "packages/agent-skill/src/install.test.ts",
        "packages/agent-integrations/src/index.test.ts",
        "packages/mcp-server/src/index.test.ts",
        "packages/cli/src/index.test.ts",
        "--root",
        ".",
      ],
    ],
  ] as const;
  const steps = commands.map(([name, args]) => {
    const result = spawnSync(process.execPath, args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: "inherit",
    });
    return {
      name,
      status: result.status === 0 ? "passed" : "failed",
      detail: `Process exited with ${result.status ?? "no status"}.`,
    } satisfies ConformanceStep;
  });
  return {
    schema_version: 1,
    profile: "repository",
    client: "all",
    checked_at: new Date().toISOString(),
    passed: steps.every((step) => step.status === "passed"),
    steps,
    manual_gates: [
      "Run OAuth and MCP transport checks in every supported external client against deployed endpoints.",
    ],
  };
};

const getArgument = (name: string) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const main = async () => {
  const profile = getArgument("--profile") ?? "static";
  const requestedClient = getArgument("--client") ?? "all";
  if (
    requestedClient !== "all" &&
    !supportedClients.includes(requestedClient as SupportedClient)
  ) {
    throw new Error(`Unsupported client: ${requestedClient}.`);
  }
  let report: AgentClientConformanceReport;
  if (profile === "static") {
    report = await runStaticAgentClientConformance(
      requestedClient as SupportedClient | "all",
    );
  } else if (profile === "repository") {
    report = runRepositoryConformance();
  } else if (profile === "read") {
    if (requestedClient === "all") {
      throw new Error("The read profile requires one --client value.");
    }
    const token =
      process.env.MAILRITH_ACCESS_TOKEN?.trim() ??
      process.env.MAILRITH_API_KEY?.trim();
    if (!token) {
      throw new Error("Set MAILRITH_ACCESS_TOKEN or MAILRITH_API_KEY for read conformance.");
    }
    report = await runReadAgentClientConformance({
      client: requestedClient as SupportedClient,
      token,
      baseUrl: getArgument("--base-url"),
    });
  } else {
    throw new Error(`Unsupported profile: ${profile}.`);
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
