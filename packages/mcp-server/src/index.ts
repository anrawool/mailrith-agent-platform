import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  publicApiAgentsPath,
  publicApiAgentReadQuickstartScopeKeys,
  publicApiCapabilitiesPath,
  publicApiDocsPath,
  publicApiMcpPath,
  publicApiMcpOAuthProtectedResourcePath,
  publicApiOpenApiPath,
  publicApiReferencePath,
  publicApiVersion,
  isPublicApiMcpToolsetKey,
  publicApiMcpToolsetKeys,
  type PublicApiMcpErrorCategory,
  type PublicApiMcpToolsetKey,
} from "@mailrith/public-api";
import {
  MailrithApiError,
  createMailrithClient,
  mailrithSdkResources,
  type MailrithClient,
  type MailrithQueryValue,
  type MailrithSdkOperationDescriptor,
} from "@mailrith/sdk";
import * as z from "zod/v4";
import { generatedMailrithMcpToolManifest } from "./generated-tool-manifest.js";
import { createLazyMcpSchemaCache } from "./lazy-schema-cache.js";

const defaultBaseUrl = "https://api.mailrith.com";
const mcpRequestMaxBodyBytes = 1024 * 1024;
const mcpServerInfo = {
  name: "mailrith",
  version: "0.1.2",
} as const;

type MailrithFetch = typeof fetch;

export type MailrithMcpServerOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetch?: MailrithFetch;
  client?: MailrithClient;
  grantedScopes?: readonly string[];
  enabledToolsets?: readonly PublicApiMcpToolsetKey[];
};

export type MailrithMcpToolDefinition = {
  name: string;
  operation: MailrithSdkOperationDescriptor;
  description: string;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  inputJsonSchema: Record<string, unknown>;
  outputJsonSchema: Record<string, unknown>;
  annotations: {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
  meta: Record<string, unknown>;
  invoke: (
    args?: Record<string, unknown>,
  ) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  }>;
};

export const mailrithMcpDefaultOAuthScopes =
  publicApiAgentReadQuickstartScopeKeys;

export const mailrithMcpToolsetsHeader = "mailrith-mcp-toolsets";

const normalizeBaseUrl = (value: string | undefined) =>
  (value ?? defaultBaseUrl).replace(/\/+$/, "");

const resolveMarketingOrigin = (baseUrl: string) => {
  const url = new URL(baseUrl);
  if (url.hostname === "api.mailrith.com") {
    return "https://mailrith.com";
  }
  if (url.hostname === "api-stage.mailrith.com") {
    return "https://stage.mailrith.com";
  }
  if (url.hostname === "api-feature.mailrith.com") {
    return "https://feature.mailrith.com";
  }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return "http://localhost:4321";
  }
  return `${url.protocol}//${url.host}`;
};

const stringifyToolPayload = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
};

const getOperationEventPatternScopeRequirements = (
  operation: MailrithSdkOperationDescriptor,
) => {
  if (
    "eventPatternScopeRequirements" in operation &&
    operation.eventPatternScopeRequirements &&
    typeof operation.eventPatternScopeRequirements === "object"
  ) {
    return operation.eventPatternScopeRequirements as {
      requestField: string;
      description: string;
      requiredScopesByEventPattern: Record<string, readonly string[]>;
    };
  }
  return null;
};

const getOperationPayloadFieldScopeRequirements = (
  operation: MailrithSdkOperationDescriptor,
) => {
  if (
    "payloadFieldScopeRequirements" in operation &&
    operation.payloadFieldScopeRequirements &&
    typeof operation.payloadFieldScopeRequirements === "object"
  ) {
    return operation.payloadFieldScopeRequirements as {
      description: string;
      requiredScopesByField: Record<string, readonly string[]>;
    };
  }
  return null;
};

const createToolRequestId = () => `mcp_${crypto.randomUUID()}`;

const buildToolResult = (
  operationId: string,
  requestId: string,
  response: unknown,
) => {
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    response,
  };
  return {
    content: [
      {
        type: "text" as const,
        text: stringifyToolPayload(payload),
      },
    ],
    structuredContent: payload,
  };
};

const resolveToolErrorCategory = (error: MailrithApiError) => {
  if (error.status === 401) return "authentication";
  if (error.status === 403) return "permission";
  if (error.status === 400 || error.status === 422) return "validation";
  if (error.status === 409) return "conflict";
  if (error.status === 429) return "rate_limit";
  if (
    error.status === 408 ||
    error.status === 425 ||
    error.status >= 500
  ) {
    return "transient";
  }
  return "unknown";
};

const buildToolErrorResult = (
  operationId: string,
  requestId: string,
  error: unknown,
) => {
  if (error instanceof MailrithApiError) {
    const category = resolveToolErrorCategory(error);
    const payload = {
      operation_id: operationId,
      request_id: requestId,
      error: {
        category,
        status: error.status,
        code: error.code ?? error.type ?? `http_${error.status}`,
        message: error.message,
        retryable: category === "rate_limit" || category === "transient",
      },
    };
    return {
      isError: true as const,
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    error: {
      category: "unknown" as PublicApiMcpErrorCategory,
      status: null,
      code: "mcp_unknown_error",
      message,
      retryable: false,
    },
  };

  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const buildToolValidationErrorResult = (
  operationId: string,
  requestId: string,
  error: z.ZodError,
) => {
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    error: {
      category: "validation" as PublicApiMcpErrorCategory,
      status: null,
      code: "invalid_tool_arguments",
      message: "The tool arguments do not match the published schema.",
      retryable: false,
      issues: error.issues.slice(0, 20).map((issue) => ({
        path: issue.path.map(String).join("."),
        code: issue.code,
        message: issue.message,
      })),
    },
  };
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const buildToolOutputErrorResult = (
  operationId: string,
  requestId: string,
  error: z.ZodError,
) => {
  const payload = {
    operation_id: operationId,
    request_id: requestId,
    error: {
      category: "transient" as PublicApiMcpErrorCategory,
      status: null,
      code: "invalid_tool_output",
      message: "Mailrith returned a response that does not match the published schema.",
      retryable: false,
      issues: error.issues.slice(0, 20).map((issue) => ({
        path: issue.path.map(String).join("."),
        code: issue.code,
        message: issue.message,
      })),
    },
  };
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const createToolDescription = (operation: MailrithSdkOperationDescriptor) => {
  const summary = String(operation.summary);
  const description = operation.description ? String(operation.description) : "";
  const parts = [
    `${summary}.`,
    description && description !== summary ? description : null,
    `Calls ${operation.method} ${operation.path}.`,
    `Risk: ${operation.risk}. Side-effect class: ${operation.sideEffectClass}.`,
    operation.riskRationale,
  ].filter((part): part is string => Boolean(part));

  if (operation.idempotencyPolicy === "safe-read") {
    parts.push("Retry: safe because this operation does not change state.");
  } else if (operation.idempotencyPolicy === "resource-state") {
    parts.push(
      "Retry: first read the resource state; repeat only when the requested state has not already been reached.",
    );
  } else {
    parts.push(
      "Retry: supply idempotency_key and reuse the same value for every retry of the same logical action.",
    );
  }

  if (operation.requiredScopes.length > 0) {
    parts.push(`Required scopes: ${operation.requiredScopes.join(", ")}.`);
  } else {
    parts.push("No bearer credential is required for this operation.");
  }

  const eventPatternScopeRequirements =
    getOperationEventPatternScopeRequirements(operation);
  if (eventPatternScopeRequirements) {
    parts.push(
      `Additional webhook event scopes depend on body.${eventPatternScopeRequirements.requestField}; read mailrith://sdk-manifest for the event pattern scope map.`,
    );
  }

  const queryParams: readonly string[] = operation.queryParams;
  if (
    queryParams.includes("limit") ||
    queryParams.includes("starting_after") ||
    queryParams.includes("cursor")
  ) {
    parts.push(
      "Pagination: request one bounded page at a time and continue only with the returned cursor; never retrieve all Subscribers implicitly.",
    );
  }

  if (
    operation.operationId === "getBroadcastSendProgress" ||
    operation.operationId === "getSubscriberImportJob" ||
    operation.operationId === "getSubscriberExportJob"
  ) {
    parts.push(
      "Polling: wait at least 2 seconds, use exponential backoff up to 30 seconds, stop at a terminal state, and stop after 15 minutes.",
    );
  }

  return parts.join(" ");
};

const toQueryValue = (value: unknown): MailrithQueryValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    ) as MailrithQueryValue;
  }
  return undefined;
};

const buildOperationRequest = (
  operation: MailrithSdkOperationDescriptor,
  args: Record<string, unknown>,
) => {
  const path =
    operation.pathParams.length > 0
      ? Object.fromEntries(
          operation.pathParams
            .map((param) => [param, args[param]])
            .filter((entry): entry is [string, string | number] =>
              typeof entry[1] === "string" || typeof entry[1] === "number",
            ),
        )
      : undefined;

  const queryEntries = operation.queryParams
    .map((param) => [param, toQueryValue(args[param])])
    .filter(
      (entry): entry is [string, MailrithQueryValue] => entry[1] !== undefined,
    );
  const query =
    queryEntries.length > 0 ? Object.fromEntries(queryEntries) : undefined;

  return {
    path,
    query,
    body: operation.hasRequestBody ? args.body : undefined,
    idempotencyKey:
      typeof args.idempotency_key === "string" ? args.idempotency_key : undefined,
  };
};

const createDiscoveryGuideText = (baseUrl: string) => {
  const marketingOrigin = resolveMarketingOrigin(baseUrl);
  const openApiUrl = `${baseUrl}${publicApiOpenApiPath}`;
  const metadataUrl = `${baseUrl}/${publicApiVersion}`;
  const capabilitiesUrl = `${baseUrl}${publicApiCapabilitiesPath}`;

  return [
    "# Mailrith MCP Server",
    "",
    "Use the Mailrith MCP tools as the highest-level agent interface.",
    "",
    "Recommended flow:",
    `1. Read ${marketingOrigin}/llms.txt or ${marketingOrigin}${publicApiAgentsPath}.`,
    `2. Inspect ${metadataUrl} and ${openApiUrl} if you need the raw REST contract.`,
    `3. Authenticate this MCP server with a workspace API key or OAuth access token before calling protected tools.`,
    `4. Call discovery_get_capabilities to confirm the current workspace surface and scopes.`,
    `5. Prefer the SDK-backed MCP tools instead of assembling raw HTTP requests unless you need a lower-level integration.`,
    "",
    "Human docs:",
    `- ${marketingOrigin}${publicApiDocsPath}`,
    `- ${marketingOrigin}${publicApiReferencePath}`,
    `- ${marketingOrigin}${publicApiAgentsPath}`,
    "",
    "Remote MCP endpoint:",
    `- ${baseUrl}${publicApiMcpPath}`,
    "",
    "REST discovery endpoints:",
    `- ${metadataUrl}`,
    `- ${openApiUrl}`,
    `- ${capabilitiesUrl}`,
  ].join("\n");
};

const createJsonRpcErrorResponse = (
  code: number,
  message: string,
  status = 400,
) =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code,
        message,
      },
      id: null,
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
      },
    },
  );

const validateRequestContentLength = (
  request: Request,
  maxBodyBytes: number,
) => {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return { ok: true as const };
  }
  const parsed = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: true as const };
  }
  if (parsed > maxBodyBytes) {
    return { ok: false as const };
  }
  return { ok: true as const };
};

const readBoundedRequestText = async (
  request: Request,
  maxBodyBytes: number,
) => {
  const contentLength = validateRequestContentLength(request, maxBodyBytes);
  if (!contentLength.ok) {
    return { ok: false as const };
  }
  if (!request.body) {
    return { ok: true as const, body: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bodyBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }
      bodyBytes += value.byteLength;
      if (bodyBytes > maxBodyBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false as const };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(bodyBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(
    chunks.length === 1 ? chunks[0] : merged,
  );
  return { ok: true as const, body };
};

const parseMcpJsonBody = async (request: Request) => {
  const body = await readBoundedRequestText(request, mcpRequestMaxBodyBytes);
  if (!body.ok) {
    return { ok: false as const, status: 413 };
  }
  if (!body.body.trim()) {
    return { ok: true as const, value: undefined };
  }
  try {
    return { ok: true as const, value: JSON.parse(body.body) as unknown };
  } catch {
    return { ok: true as const, value: undefined };
  }
};

export const resolveMailrithMcpApiKey = (request: Request) => {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const value = authorization.slice("Bearer ".length).trim();
    if (value) {
      return value;
    }
  }

  return undefined;
};

const resolveEnabledMcpToolsets = (
  request: Request,
  configuredToolsets: readonly PublicApiMcpToolsetKey[] | undefined,
) => {
  const header = request.headers.get(mailrithMcpToolsetsHeader);
  const requestedValues = header
    ? header
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : null;
  if (requestedValues) {
    const invalidValues = requestedValues.filter(
      (value) => !isPublicApiMcpToolsetKey(value),
    );
    if (invalidValues.length > 0) {
      return {
        ok: false as const,
        invalidValues,
      };
    }
  }

  const configured = configuredToolsets
    ? new Set(configuredToolsets)
    : new Set(publicApiMcpToolsetKeys);
  const selected = requestedValues
    ? requestedValues.filter(
        (value): value is PublicApiMcpToolsetKey =>
          isPublicApiMcpToolsetKey(value) && configured.has(value),
      )
    : [...configured];

  return {
    ok: true as const,
    toolsets: [...new Set(selected)],
  };
};

const quoteAuthHeaderValue = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const createMcpAuthResponse = (
  baseUrl: string,
  status: 401 | 403,
  error: "invalid_token" | "insufficient_scope",
  errorDescription: string,
  requiredScopes: string[],
) => {
  const resourceMetadata = `${baseUrl}${publicApiMcpOAuthProtectedResourcePath}`;
  const authParams = [
    `realm=${quoteAuthHeaderValue("mailrith")}`,
    `error=${quoteAuthHeaderValue(error)}`,
    `error_description=${quoteAuthHeaderValue(errorDescription)}`,
    `resource_metadata=${quoteAuthHeaderValue(resourceMetadata)}`,
  ];
  if (requiredScopes.length > 0) {
    authParams.push(`scope=${quoteAuthHeaderValue(requiredScopes.join(" "))}`);
  }

  return new Response(
    JSON.stringify({
      error,
      error_description: errorDescription,
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
        "WWW-Authenticate": `Bearer ${authParams.join(", ")}`,
      },
    },
  );
};

const toJsonRpcMessages = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is Record<string, unknown> =>
          entry != null && typeof entry === "object" && !Array.isArray(entry),
      )
    : value != null && typeof value === "object" && !Array.isArray(value)
      ? [value as Record<string, unknown>]
      : [];

const sdkOperations: MailrithSdkOperationDescriptor[] = [];
for (const resource of mailrithSdkResources) {
  sdkOperations.push(
    ...(resource.operations as readonly MailrithSdkOperationDescriptor[]),
  );
}
const sdkOperationById = new Map<string, MailrithSdkOperationDescriptor>(
  sdkOperations.map((operation) => [operation.operationId, operation] as const),
);
const sdkOperationByToolName = new Map<string, MailrithSdkOperationDescriptor>(
  sdkOperations.map((operation) => [operation.mcpToolName, operation] as const),
);

const resolveMcpToolOperation = (toolName: string) =>
  sdkOperationByToolName.get(toolName) ?? null;

const readEventPatternArgument = (
  args: unknown,
  requestField: string,
): unknown => {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return undefined;
  }
  const argsRecord = args as Record<string, unknown>;
  if (requestField in argsRecord) {
    return argsRecord[requestField];
  }
  const body = argsRecord.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return (body as Record<string, unknown>)[requestField];
  }
  return undefined;
};

const normalizeWebhookEventPatterns = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
};

const resolveMcpToolRequiredScopes = (toolName: string, args?: unknown) => {
  const operation = resolveMcpToolOperation(toolName);
  if (!operation) {
    return [] as string[];
  }

  const requiredScopes = new Set<string>(operation.requiredScopes);
  const eventPatternScopeRequirements =
    getOperationEventPatternScopeRequirements(operation);
  if (eventPatternScopeRequirements) {
    const eventPatternValue = readEventPatternArgument(
      args,
      eventPatternScopeRequirements.requestField,
    );
    const eventPatterns = normalizeWebhookEventPatterns(eventPatternValue);
    const effectiveEventPatterns =
      eventPatterns.length > 0 ? eventPatterns : ["*"];
    for (const eventPattern of effectiveEventPatterns) {
      for (const scope of
        eventPatternScopeRequirements.requiredScopesByEventPattern[
          eventPattern
        ] ?? []) {
        requiredScopes.add(scope);
      }
    }
  }
  const payloadFieldScopeRequirements =
    getOperationPayloadFieldScopeRequirements(operation);
  const body =
    args && typeof args === "object" && !Array.isArray(args)
      ? (args as { body?: unknown }).body
      : undefined;
  if (
    payloadFieldScopeRequirements &&
    body &&
    typeof body === "object" &&
    !Array.isArray(body)
  ) {
    for (const [field, fieldScopes] of Object.entries(
      payloadFieldScopeRequirements.requiredScopesByField,
    )) {
      if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
      for (const scope of fieldScopes) requiredScopes.add(scope);
    }
  }

  return [...requiredScopes];
};

const resolveMcpRequestRequiredScopes = (parsedBody: unknown) => {
  const requiredScopes = new Set<string>();
  const messages = toJsonRpcMessages(parsedBody);

  for (const message of messages) {
    if (message.method !== "tools/call") {
      continue;
    }
    const params = message.params;
    if (!params || typeof params !== "object" || Array.isArray(params)) {
      continue;
    }
    const paramsRecord = params as { name?: unknown; arguments?: unknown };
    const toolName = paramsRecord.name;
    if (typeof toolName !== "string") {
      continue;
    }
    for (const scope of resolveMcpToolRequiredScopes(
      toolName,
      paramsRecord.arguments,
    )) {
      requiredScopes.add(scope);
    }
  }

  return [...requiredScopes];
};

const readCapabilityScopes = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as
    | {
        data?: {
          credential?: {
            scopes?: unknown;
          };
        };
      }
    | null;
  const scopes = payload?.data?.credential?.scopes;
  return Array.isArray(scopes)
    ? scopes.filter((scope): scope is string => typeof scope === "string")
    : [];
};

const validateMcpBearerCredential = async (params: {
  baseUrl: string;
  apiKey: string;
  fetch: MailrithFetch;
  requiredScopes: string[];
}) => {
  const response = await params.fetch(
    `${params.baseUrl}${publicApiCapabilitiesPath}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${params.apiKey}`,
        "x-mailrith-client": "mcp/dev",
      },
    },
  );

  if (response.status === 401) {
    return { ok: false as const, reason: "invalid_token" as const };
  }

  if (!response.ok) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const scopes = await readCapabilityScopes(response);
  const scopeSet = new Set(scopes);
  const missingScopes = params.requiredScopes.filter(
    (scope) => !scopeSet.has(scope),
  );
  if (missingScopes.length > 0) {
    return {
      ok: false as const,
      reason: "insufficient_scope" as const,
      missingScopes,
    };
  }

  return { ok: true as const, scopes };
};

const toZodSchema = (schema: unknown) =>
  z.fromJSONSchema(
    schema as Parameters<typeof z.fromJSONSchema>[0],
  );

const compiledMcpSchemas = createLazyMcpSchemaCache(toZodSchema);

const createToolAvailabilityFilter = (
  options: Pick<
    MailrithMcpServerOptions,
    "grantedScopes" | "enabledToolsets"
  >,
) => {
  const grantedScopes = options.grantedScopes
    ? new Set(options.grantedScopes)
    : null;
  const enabledToolsets = options.enabledToolsets
    ? new Set(options.enabledToolsets)
    : null;

  return (tool: (typeof generatedMailrithMcpToolManifest.tools)[number]) => {
    if (
      grantedScopes &&
      !tool.requiredScopes.every((scope) => grantedScopes.has(scope))
    ) {
      return false;
    }
    if (
      enabledToolsets &&
      !tool.toolsets.some((toolset) => enabledToolsets.has(toolset))
    ) {
      return false;
    }
    return true;
  };
};

export const createMailrithMcpToolDefinitions = (
  client: MailrithClient,
  options: Pick<
    MailrithMcpServerOptions,
    "grantedScopes" | "enabledToolsets"
  > = {},
): MailrithMcpToolDefinition[] =>
  generatedMailrithMcpToolManifest.tools
    .filter(createToolAvailabilityFilter(options))
    .map((tool) => {
      const operation = sdkOperationById.get(tool.operationId);
      if (!operation) {
        throw new Error(
          `SDK operation ${tool.operationId} is missing from the generated contract.`,
        );
      }
      const getSchemas = () => compiledMcpSchemas.get(tool);
      return {
        name: tool.name,
        operation,
        description: createToolDescription(operation),
        get inputSchema() {
          return getSchemas().inputSchema;
        },
        get outputSchema() {
          return getSchemas().outputSchema;
        },
        inputJsonSchema: tool.inputSchema as Record<string, unknown>,
        outputJsonSchema: tool.outputSchema as Record<string, unknown>,
        annotations: tool.annotations,
        meta: {
          "mailrith/operationId": tool.operationId,
          "mailrith/risk": tool.risk,
          "mailrith/sideEffectClass": tool.sideEffectClass,
          "mailrith/idempotencyPolicy": tool.idempotencyPolicy,
          "mailrith/toolsets": tool.toolsets,
          "mailrith/schemaDigest":
            generatedMailrithMcpToolManifest.schemaDigest,
        },
        invoke: async (args = {}) => {
          const requestId = createToolRequestId();
          const schemas = getSchemas();
          const validatedArgs = schemas.inputSchema.safeParse(args);
          if (!validatedArgs.success) {
            return buildToolValidationErrorResult(
              operation.operationId,
              requestId,
              validatedArgs.error,
            );
          }
          try {
            const response = await client.request(
              operation,
              buildOperationRequest(
                operation,
                validatedArgs.data as Record<string, unknown>,
              ),
            );
            return buildToolResult(operation.operationId, requestId, response);
          } catch (error) {
            return buildToolErrorResult(
              operation.operationId,
              requestId,
              error,
            );
          }
        },
      };
    });

export const createMailrithMcpServer = (
  options: MailrithMcpServerOptions = {},
) => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const client =
    options.client ??
    createMailrithClient({
      baseUrl,
      apiKey: options.apiKey,
      fetch: options.fetch,
      defaultHeaders: { "x-mailrith-client": "mcp/dev" },
    });

  const server = new McpServer(mcpServerInfo);
  const tools = createMailrithMcpToolDefinitions(client, options);
  const toolByName = new Map(tools.map((tool) => [tool.name, tool]));
  server.server.registerCapabilities({ tools: { listChanged: false } });
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(
      (tool): Tool => ({
        name: tool.name,
        title: tool.operation.summary,
        description: tool.description,
        inputSchema: tool.inputJsonSchema as Tool["inputSchema"],
        outputSchema: tool.outputJsonSchema as Tool["outputSchema"],
        annotations: tool.annotations,
        _meta: tool.meta,
      }),
    ),
  }));
  server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolByName.get(request.params.name);
    if (!tool) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Tool ${request.params.name} is not available for this credential and toolset selection.`,
      );
    }
    const args = request.params.arguments;
    const result = await tool.invoke(
      args && typeof args === "object" && !Array.isArray(args) ? args : {},
    );
    if (!result.isError) {
      const validatedOutput = tool.outputSchema.safeParse(
        result.structuredContent,
      );
      if (!validatedOutput.success) {
        const requestId = result.structuredContent?.request_id;
        return buildToolOutputErrorResult(
          tool.operation.operationId,
          typeof requestId === "string" ? requestId : createToolRequestId(),
          validatedOutput.error,
        );
      }
    }
    return result;
  });

  server.registerResource(
    "mailrith-tool-manifest",
    "mailrith://tool-manifest",
    {
      title: "Mailrith MCP Tool Manifest",
      description:
        "The versioned Mailrith MCP schema, scope, risk, and toolset contract.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "mailrith://tool-manifest",
          mimeType: "application/json",
          text: JSON.stringify(generatedMailrithMcpToolManifest, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "mailrith-sdk-manifest",
    "mailrith://sdk-manifest",
    {
      title: "Mailrith SDK Manifest",
      description: "The generated Mailrith SDK resource and operation manifest.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "mailrith://sdk-manifest",
          mimeType: "application/json",
          text: JSON.stringify(mailrithSdkResources, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "mailrith-discovery-guide",
    "mailrith://discovery",
    {
      title: "Mailrith Discovery Guide",
      description: "Recommended discovery order and official Mailrith entry points.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "mailrith://discovery",
          mimeType: "text/markdown",
          text: createDiscoveryGuideText(baseUrl),
        },
      ],
    }),
  );

  server.registerPrompt(
    "mailrith_agent_plan",
    {
      title: "Plan a Mailrith task",
      description:
        "Generate a concise plan for a Mailrith task before calling tools.",
      argsSchema: {
        goal: z.string().describe("The Mailrith task or outcome you want to achieve."),
      },
    },
    async ({ goal }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "You are planning work against Mailrith.",
              "Start by reading mailrith://discovery and mailrith://tool-manifest.",
              "Then identify the smallest sequence of Mailrith MCP tools needed to accomplish this goal:",
              goal,
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
};

export const runMailrithMcpStdioServer = async (
  options: MailrithMcpServerOptions = {},
) => {
  const server = createMailrithMcpServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
};

export const handleMailrithMcpHttpRequest = async (
  request: Request,
  options: MailrithMcpServerOptions = {},
) => {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  if (request.method !== "POST" && request.method !== "DELETE") {
    return createJsonRpcErrorResponse(-32000, "Method not allowed.", 405);
  }

  const parsedBody =
    request.method === "POST"
      ? await parseMcpJsonBody(request.clone() as unknown as Request)
      : null;
  if (parsedBody && !parsedBody.ok) {
    return createJsonRpcErrorResponse(
      -32000,
      "Request body is too large.",
      parsedBody.status,
    );
  }
  const enabledToolsets = resolveEnabledMcpToolsets(
    request,
    options.enabledToolsets,
  );
  if (!enabledToolsets.ok) {
    return createJsonRpcErrorResponse(
      -32602,
      `Unknown Mailrith MCP toolset: ${enabledToolsets.invalidValues.join(", ")}.`,
      400,
    );
  }
  const apiKey = resolveMailrithMcpApiKey(request) ?? options.apiKey;
  const requiredScopes = resolveMcpRequestRequiredScopes(parsedBody?.value);
  const challengeScopes: string[] =
    requiredScopes.length > 0
      ? requiredScopes
      : mailrithMcpDefaultOAuthScopes.length > 0
        ? [...mailrithMcpDefaultOAuthScopes]
        : [...publicApiAgentReadQuickstartScopeKeys];
  if (!apiKey) {
    return createMcpAuthResponse(
      baseUrl,
      401,
      "invalid_token",
      "Authentication is required before using the Mailrith MCP server.",
      challengeScopes,
    );
  }

  const validation = await validateMcpBearerCredential({
    baseUrl,
    apiKey,
    fetch: options.fetch ?? fetch,
    requiredScopes:
      requiredScopes.length > 0
        ? requiredScopes
        : [...mailrithMcpDefaultOAuthScopes],
  });
  if (!validation.ok && validation.reason === "invalid_token") {
    return createMcpAuthResponse(
      baseUrl,
      401,
      "invalid_token",
      "The Mailrith MCP bearer token is invalid or expired.",
      challengeScopes,
    );
  }
  if (!validation.ok && validation.reason === "insufficient_scope") {
    return createMcpAuthResponse(
      baseUrl,
      403,
      "insufficient_scope",
      "The Mailrith MCP bearer token is missing required scopes.",
      validation.missingScopes,
    );
  }
  if (!validation.ok && validation.reason === "unavailable") {
    return createJsonRpcErrorResponse(
      -32001,
      "Mailrith credential validation is temporarily unavailable.",
      503,
    );
  }

  // A fresh server is created for every request. The hosted endpoint therefore
  // has no cross-request sessions or in-memory subscriber state, which keeps
  // Worker memory bounded and prevents one credential from leaking into
  // another request.
  const server = createMailrithMcpServer({
    ...options,
    apiKey,
    grantedScopes: validation.scopes,
    enabledToolsets: enabledToolsets.toolsets,
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request, {
      parsedBody: parsedBody?.value,
    });
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
};
